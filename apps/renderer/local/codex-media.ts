import { createHash } from "node:crypto";
import {
  lstat,
  mkdtemp,
  readFile,
  rm,
  writeFile,
  rename,
} from "node:fs/promises";
import { dirname, join, relative, isAbsolute } from "node:path";
import { z } from "zod";
import {
  LOCAL_CODEX_POLICY,
  localCodexJobSchema,
  localCodexArtifactSchema,
  type LocalCodexJob,
} from "../../../packages/contracts/local/codex.ts";
import {
  ownerWordsSchema,
  OWNER_FPS,
} from "../../../packages/contracts/local/selection.ts";
import {
  inspectOwnerSource,
  ownerMediaPath,
  ownerCodexMediaPath,
  type OwnerNativeTools,
} from "./media.ts";
import { SOURCE_INPUT_OPTIONS } from "../src/media/inspection.ts";
import { runOwnedProcess } from "../src/media/process-runner.ts";
import type { LocalSpeechTools } from "../../../scripts/local-speech-tools.ts";
import { assignLocalSpeakers } from "./speaker-turns.ts";
import { planCodexFrameSamples } from "../../../packages/contracts/local/codex-sampling.ts";

const speechOutput = z.object({
  transcription: z
    .array(
      z.object({
        text: z.string().max(10000),
        offsets: z.object({
          from: z.number().finite().nonnegative(),
          to: z.number().finite().nonnegative(),
        }),
      }),
    )
    .max(100000),
});
export function parseLocalSpeech(value: unknown, durationMs: number) {
  const segments = speechOutput.parse(value).transcription;
  const words: z.infer<typeof ownerWordsSchema> = [];
  for (const segment of segments) {
    const tokens = segment.text.trim().split(/\s+/u).filter(Boolean);
    if (!tokens.length) continue;
    const start = Math.max(0, Math.round(segment.offsets.from)),
      end = Math.min(durationMs, Math.round(segment.offsets.to));
    if (end <= start) continue;
    for (const [index, text] of tokens.entries()) {
      const startMs = Math.round(
          start + ((end - start) * index) / tokens.length,
        ),
        endMs = Math.round(
          start + ((end - start) * (index + 1)) / tokens.length,
        );
      if (endMs > startMs)
        words.push({
          id: `w_${String(words.length + 1).padStart(6, "0")}`,
          text,
          punctuatedText: text,
          startMs,
          endMs,
          speakerId: null,
          confidence: null,
        });
    }
  }
  return ownerWordsSchema.parse(words);
}
async function removeCodexInput(output: string, scratch: string) {
  const rel = relative(dirname(output), scratch);
  if (isAbsolute(rel) || !rel.startsWith("codex-input-") || rel.includes(".."))
    throw new Error("codex_input_invalid");
  await rm(scratch, { recursive: true, force: true });
}
export async function prepareLocalCodexInput(
  options: {
    root: string;
    tools: OwnerNativeTools;
    speech?: LocalSpeechTools;
    runSpeech?: typeof runOwnedProcess | undefined;
    runSpeakers?: typeof runOwnedProcess | undefined;
  },
  current: LocalCodexJob,
  signal: AbortSignal,
) {
  const job = localCodexJobSchema.parse(current),
    source = await ownerMediaPath(options.root, job.workspaceId, "source.mp4");
  const metadata = await inspectOwnerSource(source, options.tools, signal);
  if (metadata.fingerprint !== job.fingerprint)
    throw new Error("codex_input_invalid");
  const start = (job.cut?.startFrame ?? 0) / OWNER_FPS,
    duration = job.cut
      ? (job.cut.endFrame - job.cut.startFrame) / OWNER_FPS
      : metadata.durationMs / 1000;
  if (start + duration > metadata.durationMs / 1000 + 0.001)
    throw new Error("codex_input_invalid");
  const output = await ownerCodexMediaPath(
    options.root,
    job.workspaceId,
    job.jobId,
  );
  try {
    await lstat(output);
    throw new Error("codex_output_exists");
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT"))
      throw error;
  }
  const scratch = await mkdtemp(join(dirname(output), "codex-input-"));
  try {
    let artifact: z.infer<typeof localCodexArtifactSchema>;
    if (job.kind === "speech") {
      if (!options.speech) throw new Error("local_speech_unavailable");
      const wav = join(scratch, "speech.wav"),
        prefix = join(scratch, "speech");
      await runOwnedProcess(
        options.tools.ffmpeg,
        [
          "-nostdin",
          "-n",
          "-v",
          "error",
          ...SOURCE_INPUT_OPTIONS,
          "-threads",
          "2",
          "-ss",
          String(start),
          "-i",
          source,
          "-t",
          String(duration),
          "-map",
          "0:a:0",
          "-vn",
          "-sn",
          "-dn",
          "-ar",
          "16000",
          "-ac",
          "1",
          "-c:a",
          "pcm_s16le",
          "-map_metadata",
          "-1",
          "-fs",
          String(120 * 1024 ** 2),
          wav,
        ],
        signal,
      );
      const speakers = options.speech.speakers;
      const speakerOutput = speakers
        ? await (options.runSpeakers ?? runOwnedProcess)(
            speakers.executable,
            [
              `--segmentation.pyannote-model=${speakers.segmentation}`,
              `--embedding.model=${speakers.embedding}`,
              "--segmentation.provider=cpu",
              "--embedding.provider=cpu",
              "--segmentation.num-threads=2",
              "--embedding.num-threads=2",
              "--clustering.cluster-threshold=0.5",
              wav,
            ],
            signal,
            {
              cwd: scratch,
              env: {
                SystemRoot: process.env.SystemRoot,
                PATH: `${speakers.directory};${process.env.SystemRoot}\\System32`,
                TEMP: scratch,
                TMP: scratch,
              },
              maxStdout: 1024 ** 2,
            },
          )
        : "";
      await (options.runSpeech ?? runOwnedProcess)(
        options.speech.executable,
        [
          "-m",
          options.speech.model,
          "-f",
          wav,
          "-l",
          "auto",
          "-t",
          "4",
          "-p",
          "1",
          "-ml",
          "1",
          "-sow",
          "-oj",
          "-of",
          prefix,
          "-np",
          "-ng",
          "-nf",
        ],
        signal,
        {
          cwd: options.speech.directory,
          env: {
            SystemRoot: process.env.SystemRoot,
            PATH: `${options.speech.directory};${process.env.SystemRoot}\\System32`,
            TEMP: scratch,
            TMP: scratch,
          },
          maxStdout: 65536,
        },
      );
      const result = join(scratch, "speech.json"),
        info = await lstat(result);
      if (
        !info.isFile() ||
        info.isSymbolicLink() ||
        info.nlink !== 1 ||
        info.size > LOCAL_CODEX_POLICY.artifactBytes
      )
        throw new Error("codex_input_invalid");
      artifact = {
        kind: "speech",
        words: assignLocalSpeakers(
          parseLocalSpeech(
            JSON.parse(await readFile(result, "utf8")),
            Math.round(duration * 1000),
          ),
          speakerOutput,
          Math.round(duration * 1000),
        ),
      };
    } else {
      const samples = planCodexFrameSamples(
        job.cut!.endFrame - job.cut!.startFrame,
        job.speakerChanges,
      );
      const frames = [];
      for (const [index, frame] of samples.entries()) {
        const offset = frame / OWNER_FPS,
          file = join(scratch, `${index}.jpg`);
        await runOwnedProcess(
          options.tools.ffmpeg,
          [
            "-nostdin",
            "-n",
            "-v",
            "error",
            ...SOURCE_INPUT_OPTIONS,
            "-threads",
            "2",
            "-ss",
            String(start + offset),
            "-t",
            String(Math.min(0.6, duration - offset)),
            "-i",
            source,
            "-map",
            "0:v:0",
            "-an",
            "-sn",
            "-dn",
            "-vf",
            "fps=5:start_time=0,scale=640:640:force_original_aspect_ratio=decrease:force_divisible_by=2,tpad=stop_mode=clone:stop_duration=0.6,tile=3x1",
            "-frames:v",
            "1",
            "-q:v",
            "8",
            file,
          ],
          signal,
        );
        const info = await lstat(file);
        if (
          !info.isFile() ||
          info.isSymbolicLink() ||
          info.nlink !== 1 ||
          info.size > 2 * 1024 ** 2
        )
          throw new Error("codex_input_invalid");
        let jpeg = await readFile(file);
        for (const width of [960, 720]) {
          if (jpeg.length <= LOCAL_CODEX_POLICY.imageBytes) break;
          const compressed = join(scratch, `${index}-${width}.jpg`);
          await runOwnedProcess(
            options.tools.ffmpeg,
            [
              "-nostdin",
              "-n",
              "-v",
              "error",
              "-i",
              file,
              "-vf",
              `scale=${width}:-2`,
              "-frames:v",
              "1",
              "-q:v",
              "15",
              compressed,
            ],
            signal,
          );
          const compressedInfo = await lstat(compressed);
          if (
            !compressedInfo.isFile() ||
            compressedInfo.isSymbolicLink() ||
            compressedInfo.nlink !== 1 ||
            compressedInfo.size > 2 * 1024 ** 2
          )
            throw new Error("codex_input_invalid");
          jpeg = await readFile(compressed);
        }
        if (jpeg.length > LOCAL_CODEX_POLICY.imageBytes)
          throw new Error("codex_input_invalid");
        frames.push({
          frame,
          sampleFrames: [0, 6, 12].map((delta) =>
            Math.min(Math.round(duration * OWNER_FPS) - 1, frame + delta),
          ),
          jpeg: jpeg.toString("base64"),
        });
      }
      artifact = { kind: "frames", frames };
    }
    const bytes = Buffer.from(
      JSON.stringify(localCodexArtifactSchema.parse(artifact)),
    );
    if (bytes.length > LOCAL_CODEX_POLICY.artifactBytes)
      throw new Error("codex_input_invalid");
    signal.throwIfAborted();
    await writeFile(join(scratch, "result.json"), bytes, {
      flag: "wx",
      mode: 0o600,
    });
    await rename(join(scratch, "result.json"), output);
    return {
      operation: "codex-input" as const,
      jobId: job.jobId,
      kind: job.kind,
      bytes: bytes.length,
      digest: createHash("sha256").update(bytes).digest("hex"),
    };
  } finally {
    await removeCodexInput(output, scratch);
  }
}
