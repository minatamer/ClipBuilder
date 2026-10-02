import {
  LOCAL_WORKSPACE_LIMITS,
  isSourceWithinLimitProfile,
} from "@clipbuilder/contracts";
import {
  type AudioSample,
  AudioSampleSink,
  AudioSampleSource,
  BlobSource,
  Input,
  MP4,
  WEBM,
  WAVE,
  Output,
  Quality,
  StreamTarget,
  WavOutputFormat,
  WebMOutputFormat,
} from "mediabunny";
import { LocalMediaError } from "./media.errors";
import { openSyncAccess, type SyncFileAccess } from "./opfs.access";
import {
  AUDIO_LIFETIME,
  AUDIO_PROFILES,
  type AudioProfile,
  type AudioProgress,
  type ExtractedAudio,
} from "./audio.profile";
import { AudioSampleMeter, padAudioGap } from "./audio.samples";

function check(signal: AbortSignal): void {
  if (signal.aborted) throw new LocalMediaError("canceled");
}

export function writeAudioChunk(
  access: SyncFileAccess,
  data: Uint8Array,
  position: number,
  ceiling: number,
  signal: AbortSignal,
): number {
  check(signal);
  if (
    !Number.isSafeInteger(position) ||
    position < 0 ||
    data.byteLength > LOCAL_WORKSPACE_LIMITS.ioChunkBytes ||
    position + data.byteLength > ceiling
  )
    throw new LocalMediaError("limits");
  let written = 0;
  while (written < data.byteLength) {
    check(signal);
    const count = access.write(data.subarray(written), {
      at: position + written,
    });
    if (
      !Number.isSafeInteger(count) ||
      count < 1 ||
      count > data.byteLength - written
    )
      throw new LocalMediaError("storage");
    written += count;
  }
  return position + written;
}

/** Owns one worker-only, disposable scratch file until validation and deletion. */
export async function extractLocalAudio(
  file: Blob,
  sourceDurationMs: number,
  profileId: AudioProfile,
  folder: FileSystemDirectoryHandle,
  signal: AbortSignal,
  progress: (value: AudioProgress) => void,
): Promise<ExtractedAudio> {
  check(signal);
  if (
    !isSourceWithinLimitProfile(
      { bytes: file.size, durationMs: sourceDurationMs },
      "public",
    )
  )
    throw new LocalMediaError("limits");
  const profile = AUDIO_PROFILES[profileId];
  if (!profile) throw new LocalMediaError("unsupported");
  const input = new Input({
    source: new BlobSource(file, {
      maxCacheSize: 4 * LOCAL_WORKSPACE_LIMITS.ioChunkBytes,
    }),
    formats: [MP4, WEBM],
  });
  let access: SyncFileAccess | undefined;
  let output: Output | undefined;
  let validation: Input | undefined;
  let created = false;
  let bytes = 0;
  let processedMs = 0;
  let precedingEndSeconds = 0;
  const original = new AudioSampleMeter();
  const encoded = new AudioSampleMeter();
  const decoded = new AudioSampleMeter();
  let completed = false;
  let result: ExtractedAudio | undefined;
  let failure: LocalMediaError | undefined;
  const abort = () => {
    input.dispose();
    validation?.dispose();
    void output?.cancel().catch(() => {});
  };
  signal.addEventListener("abort", abort, { once: true });
  try {
    const tracks = await input.getTracks();
    const audio = await input.getPrimaryAudioTrack();
    if (
      tracks.filter((track) => track.isAudioTrack()).length !== 1 ||
      tracks.filter((track) => track.isVideoTrack()).length !== 1 ||
      !audio ||
      !(await audio.canDecode()) ||
      Math.abs(
        Math.ceil((await input.computeDuration()) * 1000) - sourceDurationMs,
      ) > 1
    )
      throw new LocalMediaError("unsupported");
    check(signal);
    const handle = await folder.getFileHandle("encoded", { create: true });
    created = true;
    access = await openSyncAccess(handle);
    access.truncate(0);
    const ownedAccess = access;
    output = new Output({
      format:
        profileId === "opus-webm"
          ? new WebMOutputFormat()
          : new WavOutputFormat(),
      target: new StreamTarget(
        new WritableStream({
          write({ data, position }) {
            bytes = Math.max(
              bytes,
              writeAudioChunk(
                ownedAccess,
                data,
                position,
                profile.maxBytes,
                signal,
              ),
            );
          },
        }),
        { chunked: true, chunkSize: LOCAL_WORKSPACE_LIMITS.ioChunkBytes },
      ),
    });
    const source = new AudioSampleSource({
      codec: profile.codec,
      ...(profile.bitrate === undefined
        ? {}
        : { quality: new Quality({ bitrate: profile.bitrate }) }),
      transform: { sampleRate: profile.sampleRate, numberOfChannels: 1 },
      onEncodedSample(sample) {
        check(signal);
        encoded.accept(sample);
        if (
          sample.sampleRate !== profile.sampleRate ||
          encoded.lastMs > sourceDurationMs + AUDIO_LIFETIME.codecPaddingMs
        )
          throw new LocalMediaError("unsupported");
      },
    });
    output.addAudioTrack(source);
    await output.start();
    for await (const sample of new AudioSampleSink(audio).samples(
      0,
      sourceDurationMs / 1000,
    )) {
      let trimmed: AudioSample | undefined;
      try {
        check(signal);
        const start = Math.max(
          0,
          Math.ceil(-sample.timestamp * sample.sampleRate),
        );
        const end = Math.min(
          sample.numberOfFrames,
          Math.round(
            (sourceDurationMs / 1000 - sample.timestamp) * sample.sampleRate,
          ),
        );
        if (end <= start) continue;
        const current =
          start > 0 || end < sample.numberOfFrames
            ? (trimmed = sample.trim(start, end))
            : sample;
        original.accept(current, false);
        await padAudioGap(
          source,
          current,
          precedingEndSeconds,
          signal,
          (endSeconds) =>
            progress({
              phase: "encoding",
              processedMs: Math.min(sourceDurationMs, endSeconds * 1000),
              bytes,
            }),
        );
        check(signal);
        await source.add(current);
        precedingEndSeconds = current.timestamp + current.duration;
        processedMs = Math.min(sourceDurationMs, original.lastMs);
        progress({ phase: "encoding", processedMs, bytes });
      } finally {
        trimmed?.close();
        sample.close();
      }
    }
    if (
      !original.nonSilent ||
      !encoded.nonSilent ||
      original.firstMs === null ||
      Math.abs(original.lastMs - sourceDurationMs) >
        AUDIO_LIFETIME.codecPaddingMs
    )
      throw new LocalMediaError("unsupported");
    source.close();
    await output.finalize();
    check(signal);
    access.flush();
    access.close();
    access = undefined;
    const candidate = await handle.getFile();
    if (
      !candidate.size ||
      candidate.size !== bytes ||
      candidate.size > profile.maxBytes
    )
      throw new LocalMediaError("storage");
    validation = new Input({
      source: new BlobSource(candidate, {
        maxCacheSize: LOCAL_WORKSPACE_LIMITS.ioChunkBytes,
      }),
      formats: profileId === "opus-webm" ? [WEBM] : [WAVE],
    });
    const resultTracks = await validation.getTracks();
    const track = await validation.getPrimaryAudioTrack();
    if (
      resultTracks.length !== 1 ||
      !track ||
      (await track.getCodec()) !== profile.codec ||
      !(await track.canDecode())
    )
      throw new LocalMediaError("unsupported");
    const presentationDurationMs = (await validation.computeDuration()) * 1000;
    if (
      !Number.isFinite(presentationDurationMs) ||
      Math.abs(presentationDurationMs - sourceDurationMs) >
        AUDIO_LIFETIME.codecPaddingMs
    )
      throw new LocalMediaError("unsupported");
    for await (const sample of new AudioSampleSink(track).samples()) {
      try {
        check(signal);
        decoded.accept(sample);
        if (
          decoded.lastMs > sourceDurationMs + AUDIO_LIFETIME.codecPaddingMs ||
          decoded.frames >
            ((sourceDurationMs + AUDIO_LIFETIME.codecPaddingMs) / 1000) *
              sample.sampleRate
        )
          throw new LocalMediaError("limits");
        progress({
          phase: "validating",
          processedMs: Math.min(sourceDurationMs, decoded.lastMs),
          bytes,
        });
      } finally {
        sample.close();
      }
    }
    if (
      !decoded.nonSilent ||
      decoded.firstMs === null ||
      ![16_000, 48_000].includes(decoded.sampleRate) ||
      decoded.firstMs > AUDIO_LIFETIME.codecPaddingMs ||
      Math.abs(decoded.lastMs - sourceDurationMs) >
        AUDIO_LIFETIME.codecPaddingMs
    )
      throw new LocalMediaError("unsupported");
    // Only the bounded audio is copied. The original video is never materialized in RAM.
    result = {
      profile: profileId,
      file: new Blob([await candidate.arrayBuffer()], {
        type: profile.contentType,
      }),
      sourceDurationMs,
      sourceFirstSampleMs: original.firstMs,
      sourceLastSampleMs: original.lastMs,
      presentationDurationMs,
      decodedFirstSampleMs: decoded.firstMs,
      decodedLastSampleMs: decoded.lastMs,
      decodedSampleRate: decoded.sampleRate,
      bytes,
    };
    check(signal);
    completed = true;
  } catch (error) {
    failure = signal.aborted
      ? new LocalMediaError("canceled")
      : error instanceof LocalMediaError
        ? error
        : error instanceof DOMException &&
            ["QuotaExceededError", "NotAllowedError", "SecurityError"].includes(
              error.name,
            )
          ? new LocalMediaError("storage")
          : new LocalMediaError("unsupported");
  } finally {
    signal.removeEventListener("abort", abort);
    try {
      if (!completed) await output?.cancel();
    } catch {
      // An errored stream can reject close after Output has released its encoders.
      // Preserve the safe primary failure and still close/delete owned OPFS scratch.
    } finally {
      let cleanupFailed = false;
      for (const release of [
        () => input.dispose(),
        () => validation?.dispose(),
        () => access?.close(),
      ]) {
        try {
          release();
        } catch {
          cleanupFailed = true;
        }
      }
      try {
        if (created) await folder.removeEntry("encoded");
      } catch {
        cleanupFailed = true;
      }
      if (cleanupFailed) failure = new LocalMediaError("storage");
    }
  }
  if (failure) throw failure;
  check(signal);
  if (!result) throw new LocalMediaError("unavailable");
  return result;
}
