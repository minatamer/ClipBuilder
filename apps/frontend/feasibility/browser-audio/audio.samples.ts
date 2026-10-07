import { LOCAL_WORKSPACE_LIMITS } from "@clipbuilder/contracts";
import { AudioSample, type AudioSampleSource } from "mediabunny";
import { LocalMediaError } from "../../src/features/media/media.errors";

/** Keep both timestamped encoders and WAV from allocating a whole gap at once. */
export async function padAudioGap(
  source: Pick<AudioSampleSource, "add">,
  current: AudioSample,
  precedingEndSeconds: number,
  signal: AbortSignal,
  progress: (endSeconds: number) => void,
): Promise<void> {
  const total = Math.max(
    0,
    Math.round((current.timestamp - precedingEndSeconds) * current.sampleRate),
  );
  const width = current.format.startsWith("u8")
    ? 1
    : current.format.startsWith("s16")
      ? 2
      : 4;
  for (let frame = 0; frame < total; frame += 1024) {
    if (signal.aborted) throw new LocalMediaError("canceled");
    const count = Math.min(1024, total - frame);
    const data = new Uint8Array(count * width * current.numberOfChannels);
    if (current.format.startsWith("u8")) data.fill(128);
    const silence = new AudioSample({
      data,
      format: current.format,
      numberOfChannels: current.numberOfChannels,
      sampleRate: current.sampleRate,
      timestamp: precedingEndSeconds + frame / current.sampleRate,
    });
    try {
      await source.add(silence);
    } finally {
      silence.close();
    }
    progress(precedingEndSeconds + (frame + count) / current.sampleRate);
  }
}

// A sample-sized scratch plane; never a full-duration waveform or frame cache.
export class AudioSampleMeter {
  firstMs: number | null = null;
  lastMs = 0;
  sampleRate = 0;
  frames = 0;
  nonSilent = false;

  accept(sample: AudioSample, mono = true): void {
    if (
      !Number.isFinite(sample.timestamp) ||
      !Number.isFinite(sample.duration) ||
      sample.duration <= 0 ||
      !Number.isSafeInteger(sample.numberOfFrames) ||
      sample.numberOfFrames < 1 ||
      !Number.isSafeInteger(sample.sampleRate) ||
      sample.sampleRate < 1 ||
      !Number.isSafeInteger(sample.numberOfChannels) ||
      sample.numberOfChannels < 1 ||
      sample.numberOfChannels > 8 ||
      (mono && sample.numberOfChannels !== 1) ||
      sample.numberOfFrames * 4 > LOCAL_WORKSPACE_LIMITS.ioChunkBytes ||
      (this.firstMs !== null && sample.timestamp * 1000 < this.lastMs - 2)
    )
      throw new LocalMediaError("unsupported");
    if (this.firstMs !== null && sample.sampleRate !== this.sampleRate)
      throw new LocalMediaError("unsupported");
    this.firstMs ??= sample.timestamp * 1000;
    this.lastMs = (sample.timestamp + sample.duration) * 1000;
    this.sampleRate = sample.sampleRate;
    this.frames += sample.numberOfFrames;
    const plane = new Float32Array(sample.numberOfFrames);
    for (let channel = 0; channel < sample.numberOfChannels; channel++) {
      sample.copyTo(plane, { planeIndex: channel, format: "f32-planar" });
      for (const value of plane) {
        if (!Number.isFinite(value)) throw new LocalMediaError("unsupported");
        if (value !== 0) this.nonSilent = true;
      }
    }
  }
}
