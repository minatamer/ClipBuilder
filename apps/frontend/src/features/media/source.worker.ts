import "../../browser-contract-validation";
import {
  LOCAL_WORKSPACE_LIMITS,
  MEDIA_LIMITS,
  PUBLIC_LIMITS,
  isSourceWithinLimitProfile,
  localArtifactIdSchema,
  mediaDescriptorSchema,
} from "@clipbuilder/contracts";
import {
  AudioSampleSink,
  BlobSource,
  Input,
  MP4,
  VideoSampleSink,
} from "mediabunny";
import { LocalMediaError } from "./media.errors";
import { copyLocalSource } from "./opfs.copy";
import { sourceChecksum } from "./source.checksum";

import {
  WORKSPACE_FOLDER,
  LEGACY_AUDIO_SCRATCH_FOLDER,
  type SourceCommand,
  type SourceMessage,
} from "./source.protocol";

let active: { id: string; controller: AbortController } | null = null;
const send = (message: SourceMessage) => postMessage(message);
const check = (signal: AbortSignal) => {
  if (signal.aborted) throw new LocalMediaError("canceled");
};
const directory = async () =>
  (await navigator.storage.getDirectory()).getDirectoryHandle(
    WORKSPACE_FOLDER,
    { create: true },
  );

async function fingerprint(file: Blob, signal: AbortSignal): Promise<string> {
  check(signal);
  return sourceChecksum(file, signal, LOCAL_WORKSPACE_LIMITS.ioChunkBytes);
}

async function inspect(
  file: Blob,
  command: SourceCommand,
  signal: AbortSignal,
) {
  if (file.size < 1 || file.size > PUBLIC_LIMITS.maxSourceBytes)
    throw new LocalMediaError("limits");
  const input = new Input({
    source: new BlobSource(file, {
      maxCacheSize: 4 * LOCAL_WORKSPACE_LIMITS.ioChunkBytes,
    }),
    formats: [MP4],
  });
  try {
    const tracks = await input.getTracks();
    const videos = tracks.filter((track) => track.isVideoTrack());
    const audios = tracks.filter((track) => track.isAudioTrack());
    if (
      videos.length !== MEDIA_LIMITS.maxVideoStreams ||
      audios.length !== MEDIA_LIMITS.maxAudioStreams
    )
      throw new LocalMediaError("unsupported");
    const video = await input.getPrimaryVideoTrack();
    const audio = await input.getPrimaryAudioTrack();
    if (
      !video ||
      !audio ||
      !(await video.canDecode()) ||
      !(await audio.canDecode())
    )
      throw new LocalMediaError("unsupported");
    const durationMs = Math.ceil((await input.computeDuration()) * 1000);
    if (!isSourceWithinLimitProfile({ bytes: file.size, durationMs }, "public"))
      throw new LocalMediaError("limits");
    const format = await input.getFormat();
    const videoCodec = await video.getCodec();
    const rotationDegrees = await video.getRotation();
    const width = await video.getSquarePixelWidth();
    const height = await video.getSquarePixelHeight();
    const swaps = rotationDegrees === 90 || rotationDegrees === 270;
    const displayWidth = swaps ? height : width;
    const displayHeight = swaps ? width : height;
    const media = mediaDescriptorSchema.safeParse({
      mediaId: command.mediaId,
      sourceRevision: command.sourceRevision,
      container: format.mimeType === "video/mp4" ? "mp4" : null,
      videoCodec: videoCodec === "avc" ? "h264" : videoCodec,
      audioCodec: await audio.getCodec(),
      durationMs,
      width,
      height,
      averageFrameRate: (await video.computePacketStats(1000))
        .averagePacketRate,
      rotationDegrees,
      hasAudio: true,
      bytes: file.size,
      orientation:
        displayWidth === displayHeight
          ? "square"
          : displayWidth > displayHeight
            ? "landscape"
            : "portrait",
    });
    if (!media.success || (await video.getFlip()))
      throw new LocalMediaError("unsupported");
    let frame;
    let sample;
    try {
      check(signal);
      frame = await new VideoSampleSink(video).getSample(0.5);
      sample = await new AudioSampleSink(audio).getSample(0.5);
      if (!frame || !sample) throw new LocalMediaError("unsupported");
      check(signal);
    } finally {
      frame?.close();
      sample?.close();
    }
    return { media: media.data, fingerprint: await fingerprint(file, signal) };
  } finally {
    input.dispose();
  }
}

async function copy(file: Blob, command: SourceCommand, signal: AbortSignal) {
  const artifactId = localArtifactIdSchema.parse(command.artifactId);
  const folder = await directory();
  await copyLocalSource(folder, artifactId, file, signal, (bytes) =>
    send({ type: "progress", jobId: command.jobId, bytes }),
  );
  return {};
}

async function probe(signal: AbortSignal) {
  if (!isSecureContext || typeof navigator.storage?.getDirectory !== "function")
    throw new LocalMediaError("unavailable");
  check(signal);
  // Final H.264/AAC encoding belongs to the private renderer. Source-specific
  // decoder support is checked by inspect, rather than an unrelated output probe.
  await navigator.storage.getDirectory();
  check(signal);
  return {};
}

onmessage = async ({
  data,
}: MessageEvent<SourceCommand | { action: "abort"; jobId: string }>) => {
  if (data.action === "abort") {
    if (active?.id === data.jobId) active.controller.abort();
    return;
  }
  if (active) {
    send({ type: "failed", jobId: data.jobId, code: "busy" });
    return;
  }
  const controller = new AbortController();
  active = { id: data.jobId, controller };
  try {
    let result = {};
    if (data.action === "probe") result = await probe(controller.signal);
    else if (data.action === "clear-audio") {
      try {
        await (
          await directory()
        ).removeEntry(LEGACY_AUDIO_SCRATCH_FOLDER, { recursive: true });
      } catch (error) {
        if (!(error instanceof DOMException) || error.name !== "NotFoundError")
          throw error;
      }
    } else if (data.action === "delete") {
      const root = await navigator.storage.getDirectory();
      try {
        await root.removeEntry(WORKSPACE_FOLDER, { recursive: true });
      } catch (error) {
        if (!(error instanceof DOMException) || error.name !== "NotFoundError")
          throw error;
      }
    } else if (data.action === "reopen") {
      const artifactId = localArtifactIdSchema.parse(data.artifactId);
      const file = await (
        await (await directory()).getFileHandle(artifactId)
      ).getFile();
      result = { ...(await inspect(file, data, controller.signal)), file };
    } else if (data.action === "inspect" || data.action === "copy") {
      if (!(data.file instanceof Blob))
        throw new LocalMediaError("unsupported");
      result =
        data.action === "inspect"
          ? await inspect(data.file, data, controller.signal)
          : await copy(data.file, data, controller.signal);
    } else {
      throw new LocalMediaError("unsupported");
    }
    check(controller.signal);
    send({ type: "result", jobId: data.jobId, result });
  } catch (error) {
    const code =
      error instanceof LocalMediaError
        ? error.code
        : error instanceof DOMException && error.name === "NotFoundError"
          ? "missing"
          : data.action === "inspect"
            ? "unsupported"
            : "storage";
    send({ type: "failed", jobId: data.jobId, code });
  } finally {
    active = null;
    send({ type: "stopped", jobId: data.jobId });
  }
};
