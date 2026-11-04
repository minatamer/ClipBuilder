import {
  OWNER_FPS,
  ownerCutSchema,
  type OwnerCut,
} from "../../../packages/contracts/local/policy.ts";
import { LOCAL_CODEX_POLICY } from "../../../packages/contracts/local/codex.ts";
import { SOURCE_INPUT_OPTIONS } from "../src/media/inspection.ts";
import { runOwnedProcess } from "../src/media/process-runner.ts";
import { inspectOwnerMedia, type OwnerNativeTools } from "./media.ts";

const THRESHOLD = 4;

/** Numeric detector evidence only. A one-frame flash cannot establish a cut. */
export function parseSourceSceneCuts(text: string, frames: number): number[] {
  const samples = text
    .split(/^frame:/m)
    .slice(1)
    .flatMap((block) => {
      const time = Number(/pts_time:([\d.e+-]+)/u.exec(block)?.[1]);
      const score = Number(/lavfi\.scd\.score=([\d.]+)/u.exec(block)?.[1]);
      const difference = Number(/lavfi\.scd\.mafd=([\d.]+)/u.exec(block)?.[1]);
      return [time, score, difference].every(Number.isFinite)
        ? [{ frame: Math.round(time * OWNER_FPS), score, difference }]
        : [];
    });
  const cuts = samples.flatMap((sample, index) => {
    const next = samples[index + 1];
    return sample.frame > 0 &&
      sample.frame < frames &&
      sample.score >= THRESHOLD &&
      !(next?.frame === sample.frame + 1 && next.difference >= THRESHOLD)
      ? [sample.frame]
      : [];
  });
  const unique = [...new Set(cuts)].sort((a, b) => a - b);
  if (unique.length <= LOCAL_CODEX_POLICY.sceneCuts) return unique;
  return Array.from(
    { length: LOCAL_CODEX_POLICY.sceneCuts },
    (_, i) =>
      unique[
        Math.round(
          (i * (unique.length - 1)) / (LOCAL_CODEX_POLICY.sceneCuts - 1),
        )
      ]!,
  );
}

/** One bounded low-resolution decode, never a provider/model call or saved render. */
export async function detectSourceSceneCuts(
  source: string,
  tools: OwnerNativeTools,
  requestedCut: OwnerCut,
  signal: AbortSignal,
): Promise<number[]> {
  const cut = ownerCutSchema.parse(requestedCut);
  const { videoStart } = await inspectOwnerMedia(source, tools, signal);
  const start = cut.startFrame / OWNER_FPS;
  const seek = Math.max(0, start - 1);
  const frames = cut.endFrame - cut.startFrame;
  const text = await runOwnedProcess(
    tools.ffmpeg,
    [
      "-nostdin",
      "-v",
      "error",
      ...SOURCE_INPUT_OPTIONS,
      "-threads",
      "2",
      "-copyts",
      "-ss",
      String(seek),
      "-t",
      String(cut.endFrame / OWNER_FPS - seek + 1),
      "-i",
      source,
      "-map",
      "0:v:0",
      "-an",
      "-sn",
      "-dn",
      "-vf",
      `setpts=PTS-(${videoStart.toFixed(6)})/TB,fps=fps=${OWNER_FPS}:round=near,trim=start_pts=${cut.startFrame}:end_pts=${cut.endFrame},setpts=PTS-STARTPTS,scale=160:90:flags=area,scdet=t=${THRESHOLD},metadata=print:file=-`,
      "-filter_threads",
      "2",
      "-f",
      "null",
      "-",
    ],
    signal,
    { maxStdout: 2 * 1024 ** 2, timeoutMs: LOCAL_CODEX_POLICY.frameTimeoutMs },
  );
  return parseSourceSceneCuts(text, frames);
}
