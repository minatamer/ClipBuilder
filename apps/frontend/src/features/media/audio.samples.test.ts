import { describe, expect, it, vi } from "vitest";
import {
  AudioSample,
  AudioSampleSource,
  BufferTarget,
  Output,
  WavOutputFormat,
} from "mediabunny";
import { LOCAL_WORKSPACE_LIMITS } from "@clipbuilder/contracts";
import { AudioSampleMeter, padAudioGap } from "./audio.samples";
import { extractLocalAudio, writeAudioChunk } from "./audio.extraction";
import { audioRequestSchema, extractedAudioSchema } from "./audio.protocol";
import { AUDIO_PROFILES } from "./audio.profile";

function sample(timestamp = 0, data = new Float32Array([0.1, 0.2, 0.3, 0.4])) {
  return new AudioSample({
    data,
    format: "f32-planar",
    numberOfChannels: 1,
    sampleRate: 16_000,
    timestamp,
  });
}

describe("bounded audio samples and writes", () => {
  it.each([16_000, 48_000])(
    "bounds initial offsets and internal gaps through the installed encoder at %i Hz",
    async (sampleRate) => {
      const meter = new AudioSampleMeter();
      let largestFrames = 0;
      const target = new BufferTarget();
      const output = new Output({ format: new WavOutputFormat(), target });
      const source = new AudioSampleSource({
        codec: "pcm-s16",
        transform: { sampleRate: 16_000, numberOfChannels: 1 },
        onEncodedSample(value) {
          meter.accept(value);
          largestFrames = Math.max(largestFrames, value.numberOfFrames);
        },
      });
      output.addAudioTrack(source);
      await output.start();
      let precedingEnd = 0;
      const progress: number[] = [];
      try {
        for (const timestamp of [2, 27]) {
          const current = new AudioSample({
            data: new Float32Array(sampleRate / 50).fill(0.1),
            format: "f32-planar",
            numberOfChannels: 1,
            sampleRate,
            timestamp,
          });
          try {
            await padAudioGap(
              source,
              current,
              precedingEnd,
              new AbortController().signal,
              (end) => progress.push(end),
            );
            await source.add(current);
            precedingEnd = current.timestamp + current.duration;
          } finally {
            current.close();
          }
        }
        source.close();
        await output.finalize();
        expect(meter.firstMs).toBe(0);
        expect(meter.lastMs).toBeCloseTo(27_020, 1);
        expect(meter.frames).toBe(27.02 * 16_000);
        expect(meter.nonSilent).toBe(true);
        expect(largestFrames * 4).toBeLessThanOrEqual(
          LOCAL_WORKSPACE_LIMITS.ioChunkBytes,
        );
        expect(
          progress.every((end, i) => i === 0 || end > progress[i - 1]!),
        ).toBe(true);
        expect(target.buffer?.byteLength).toBe(44 + meter.frames * 2);
      } finally {
        await output.cancel();
      }
    },
  );
  it("cancels a gap between bounded samples and uses unsigned PCM silence", async () => {
    const controller = new AbortController();
    const current = new AudioSample({
      data: new Uint8Array(320).fill(140),
      format: "u8-planar",
      numberOfChannels: 1,
      sampleRate: 16_000,
      timestamp: 25,
    });
    const add = vi.fn(async (value: AudioSample) => {
      const meter = new AudioSampleMeter();
      meter.accept(value);
      expect(meter.nonSilent).toBe(false);
      expect(value.numberOfFrames).toBe(1024);
    });
    try {
      await expect(
        padAudioGap({ add }, current, 0, controller.signal, () =>
          controller.abort(),
        ),
      ).rejects.toMatchObject({ code: "canceled" });
      expect(add).toHaveBeenCalledOnce();
    } finally {
      current.close();
    }
  });
  it("rejects malformed media through the real demuxer before creating scratch", async () => {
    const folder = { getFileHandle: vi.fn(), removeEntry: vi.fn() };
    await expect(
      extractLocalAudio(
        new Blob([new Uint8Array(8)]),
        15_000,
        "opus-webm",
        folder as unknown as FileSystemDirectoryHandle,
        new AbortController().signal,
        vi.fn(),
      ),
    ).rejects.toMatchObject({ code: "unsupported" });
    expect(folder.getFileHandle).not.toHaveBeenCalled();
    expect(folder.removeEntry).not.toHaveBeenCalled();
  });
  it("uses actual frame clocks, distinguishes exact digital silence and rejects nonfinite samples", () => {
    const meter = new AudioSampleMeter();
    const silent = sample(2, new Float32Array(4));
    const voice = sample(2.00025);
    const invalid = sample(3, new Float32Array([NaN]));
    try {
      meter.accept(silent);
      expect(meter.nonSilent).toBe(false);
      meter.accept(voice);
      expect(meter.firstMs).toBe(2000);
      expect(meter.lastMs).toBeCloseTo(2000.5);
      expect(meter.nonSilent).toBe(true);
      expect(() => meter.accept(invalid)).toThrow();
    } finally {
      silent.close();
      voice.close();
      invalid.close();
    }
  });
  it("rejects backwards clocks and oversized scratch before copying", () => {
    const meter = new AudioSampleMeter();
    const first = sample(2);
    const earlier = sample(1);
    const huge = sample(
      3,
      new Float32Array(LOCAL_WORKSPACE_LIMITS.ioChunkBytes / 4 + 1),
    );
    try {
      meter.accept(first);
      expect(() => meter.accept(earlier)).toThrow();
      expect(() => meter.accept(huge)).toThrow();
    } finally {
      first.close();
      earlier.close();
      huge.close();
    }
  });
  it("preserves offset-addressed mux writes and completes short writes", () => {
    const write = vi.fn<(data: Uint8Array, options: { at: number }) => number>(
      () => 2,
    );
    const access = { write, truncate: vi.fn(), flush: vi.fn(), close: vi.fn() };
    expect(
      writeAudioChunk(
        access,
        new Uint8Array(4),
        8,
        12,
        new AbortController().signal,
      ),
    ).toBe(12);
    expect(write.mock.calls.map((call) => call[1])).toEqual([
      { at: 8 },
      { at: 10 },
    ]);
  });
  it("rejects byte overflow, invalid positions and abort before any disk write", () => {
    const write = vi.fn(() => 0);
    const access = { write, truncate: vi.fn(), flush: vi.fn(), close: vi.fn() };
    const controller = new AbortController();
    expect(() =>
      writeAudioChunk(access, new Uint8Array(4), 9, 12, controller.signal),
    ).toThrow();
    expect(() =>
      writeAudioChunk(access, new Uint8Array(1), -1, 12, controller.signal),
    ).toThrow();
    controller.abort();
    expect(() =>
      writeAudioChunk(access, new Uint8Array(1), 0, 12, controller.signal),
    ).toThrow();
    expect(write).not.toHaveBeenCalled();
    expect(() =>
      writeAudioChunk(
        access,
        new Uint8Array(1),
        0,
        12,
        new AbortController().signal,
      ),
    ).toThrow();
  });
  it("rejects extra worker fields and inconsistent file/clock evidence", () => {
    const request = {
      jobId: "550e8400-e29b-41d4-a716-446655440000",
      action: "extract-audio",
      profile: "opus-webm",
      sourceDurationMs: 15_000,
      file: new Blob([new Uint8Array(4)]),
    };
    expect(audioRequestSchema.safeParse(request).success).toBe(true);
    expect(
      audioRequestSchema.safeParse({
        ...request,
        url: "https://invalid.example",
      }).success,
    ).toBe(false);
    const result = {
      profile: "opus-webm",
      file: new Blob([new Uint8Array(4)], { type: "audio/webm" }),
      sourceDurationMs: 15_000,
      sourceFirstSampleMs: 0,
      sourceLastSampleMs: 15_000,
      presentationDurationMs: 15_000,
      decodedFirstSampleMs: 0,
      decodedLastSampleMs: 15_000,
      decodedSampleRate: 48_000,
      bytes: 4,
    };
    expect(extractedAudioSchema.safeParse(result).success).toBe(true);
    expect(
      extractedAudioSchema.safeParse({ ...result, sourceFirstSampleMs: 2000 })
        .success,
    ).toBe(true);
    expect(
      extractedAudioSchema.safeParse({
        ...result,
        sourceFirstSampleMs: 2000,
        decodedFirstSampleMs: 2000,
      }).success,
    ).toBe(false);
    expect(
      extractedAudioSchema.safeParse({ ...result, bytes: 3 }).success,
    ).toBe(false);
    expect(
      extractedAudioSchema.safeParse({ ...result, decodedLastSampleMs: 14_000 })
        .success,
    ).toBe(false);
    expect(AUDIO_PROFILES["opus-webm"].maxBytes).toBe(
      LOCAL_WORKSPACE_LIMITS.provisionalAudioBytes,
    );
  });
});
