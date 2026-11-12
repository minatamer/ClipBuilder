import { lstat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import {
  OWNER_BATCH_POLICY,
  type OwnerOverlay,
} from "../../../packages/contracts/local/clips.ts";
import { OWNER_GLASS_OPACITY } from "../../../packages/contracts/local/editor.ts";
import type { OwnerOutputProfile } from "./export-profile.ts";
import type { OwnerNativeTools } from "./media.ts";
import { SOURCE_INPUT_OPTIONS } from "../src/media/inspection.ts";
import { runOwnedProcess } from "../src/media/process-runner.ts";

export function needsRefractiveScene(overlay: OwnerOverlay) {
  return [
    overlay,
    ...(overlay.hook ? [overlay.hookContent ?? overlay] : []),
  ].some((content) => {
    const style = content.captionStyle,
      opacity = style?.glassOpacity ?? OWNER_GLASS_OPACITY;
    return style?.material === "glass" && opacity > 0 && opacity < 1;
  });
}

/** Fixed current-job scene only, inside the existing owned overlay scratch. */
export async function prepareRefractiveScene(
  options: {
    original: string;
    tools: OwnerNativeTools;
    graph: string;
    hook: boolean;
    profile: OwnerOutputProfile;
    scratch: string;
    budget: { bytes: number };
  },
  signal: AbortSignal,
) {
  const file = join(options.scratch, "scene.mp4"),
    graphFile = join(options.scratch, "scene.ffgraph");
  await writeFile(graphFile, options.graph, {
    flag: "wx",
    mode: 0o600,
    signal,
  });
  const input = [
    ...SOURCE_INPUT_OPTIONS,
    "-threads",
    "2",
    "-copyts",
    "-i",
    options.original,
  ];
  const available = OWNER_BATCH_POLICY.overlayBytes - options.budget.bytes;
  if (available < 1) throw Error("overlay_capacity");
  await runOwnedProcess(
    options.tools.ffmpeg,
    [
      "-nostdin",
      "-n",
      "-v",
      "error",
      ...input,
      ...(options.hook ? input : []),
      process.platform === "win32"
        ? "-/filter_complex"
        : "-filter_complex_script",
      graphFile,
      "-filter_complex_threads",
      "2",
      "-map",
      "[source]",
      "-an",
      "-frames:v",
      String(options.profile.frames),
      "-r",
      String(options.profile.fps),
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-crf",
      "0",
      "-pix_fmt",
      "yuv420p",
      "-map_metadata",
      "-1",
      "-movflags",
      "+faststart",
      "-threads",
      "2",
      "-fs",
      String(available),
      file,
    ],
    signal,
  );
  const info = await lstat(file);
  if (
    !info.isFile() ||
    info.isSymbolicLink() ||
    info.nlink !== 1 ||
    info.size > available
  )
    throw Error("overlay_capacity");
  const schema = z.object({
    streams: z
      .array(
        z.object({
          width: z.number(),
          height: z.number(),
          avg_frame_rate: z.string(),
          nb_read_frames: z.coerce.number(),
          codec_name: z.string(),
        }),
      )
      .length(1),
  });
  const checked = schema.parse(
    JSON.parse(
      await runOwnedProcess(
        options.tools.ffprobe,
        [
          "-v",
          "error",
          "-protocol_whitelist",
          "file,pipe",
          "-threads",
          "2",
          "-count_frames",
          "-select_streams",
          "v:0",
          "-show_entries",
          "stream=width,height,avg_frame_rate,nb_read_frames,codec_name",
          "-of",
          "json",
          file,
        ],
        signal,
      ),
    ),
  ).streams[0]!;
  const [a, b] = checked.avg_frame_rate.split("/").map(Number);
  if (
    checked.width !== options.profile.width ||
    checked.height !== options.profile.height ||
    checked.nb_read_frames !== options.profile.frames ||
    checked.codec_name !== "h264" ||
    !Number.isFinite(a! / b!) ||
    Math.abs(a! / b! - options.profile.fps) > 0.0001
  )
    throw Error("invalid_scene_output");
  options.budget.bytes += info.size;
  return { file, bytes: info.size };
}
