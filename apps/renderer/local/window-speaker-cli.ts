import { lstat } from "node:fs/promises";
import sherpa from "sherpa-onnx-node";
import { OWNER_LIMITS } from "../../../packages/contracts/local/policy.ts";
import {
  LOCAL_SPEAKER_WINDOWS,
  speakerWindowTurns,
  refineSpeakerBoundaries,
  type SpeakerWindow,
} from "./speaker-windows.ts";

async function main() {
  const [model, wav, ...extra] = process.argv.slice(2);
  if (!model || !wav || extra.length) throw Error("codex_input_invalid");
  for (const file of [model, wav]) {
    const info = await lstat(file);
    if (
      !info.isFile() ||
      info.isSymbolicLink() ||
      info.nlink !== 1 ||
      info.size > 64 * 1024 ** 2
    )
      throw Error("codex_input_invalid");
  }
  const { samples, sampleRate } = sherpa.readWave(wav),
    policy = LOCAL_SPEAKER_WINDOWS;
  if (
    sampleRate !== policy.samplesPerSecond ||
    samples.length > OWNER_LIMITS.clipMs * 16 + 16 ||
    samples.some((sample) => !Number.isFinite(sample))
  )
    throw Error("codex_input_invalid");
  if (samples.length < policy.minimumSamples) return;
  const extractor = new sherpa.SpeakerEmbeddingExtractor({
    model,
    numThreads: 2,
    provider: "cpu",
    debug: false,
  });
  const windows: SpeakerWindow[] = [];
  for (
    let start = 0;
    start + policy.minimumSamples <= samples.length;
    start += policy.stepSamples
  ) {
    const end = Math.min(start + policy.windowSamples, samples.length);
    // The preceding full window already covers a short final tail.
    if (start > 0 && end - start < policy.samplesPerSecond) break;
    const segment = samples.slice(start, end);
    const power =
      segment.reduce((sum, sample) => sum + sample * sample, 0) /
      segment.length;
    if (power < 1e-10) continue;
    const stream = extractor.createStream();
    stream.acceptWaveform({ samples: segment, sampleRate });
    stream.inputFinished();
    if (!extractor.isReady(stream)) continue;
    windows.push({
      start: start / sampleRate,
      end: end / sampleRate,
      embedding: Array.from(extractor.compute(stream, false)),
    });
  }
  for (const turn of refineSpeakerBoundaries(
    speakerWindowTurns(windows),
    samples,
  ))
    process.stdout.write(
      `${turn.start.toFixed(3)} -- ${turn.end.toFixed(3)} speaker_${turn.speaker}\n`,
    );
}
void main().catch(() => {
  process.stderr.write("local_speaker_detection_failed\n");
  process.exitCode = 1;
});
