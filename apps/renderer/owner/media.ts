import { createHash } from "node:crypto";
import { z } from "zod";
import { createReadStream } from "node:fs";
import { lstat, realpath, rm, rename } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";
import {
  OWNER_LIMITS,
  ownerSourceSchema,
  type OwnerSource,
} from "../../../packages/contracts/owner/index.ts";
import { probeMedia, SOURCE_INPUT_OPTIONS } from "../src/media/inspection.ts";
import { runOwnedProcess } from "../src/media/process-runner.ts";

export type OwnerNativeTools = { ffmpeg: string; ffprobe: string };
export async function ownerMediaPath(
  root: string,
  id: string,
  name: "source.mp4" | "portrait.mp4",
): Promise<string> {
  if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error("invalid");
  const base = await realpath(root);
  const directory = resolve(base, id);
  const info = await lstat(directory);
  if (!info.isDirectory() || info.isSymbolicLink()) throw new Error("invalid");
  const actual = await realpath(directory);
  const rel = relative(base, actual);
  if (!rel || isAbsolute(rel) || rel === ".." || rel.startsWith(`..${sep}`))
    throw new Error("invalid");
  const target = resolve(actual, name);
  try {
    if ((await lstat(target)).isSymbolicLink()) throw new Error("invalid");
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT"))
      throw error;
  }
  return target;
}

export async function inspectOwnerSource(
  file: string,
  tools: OwnerNativeTools,
  signal: AbortSignal,
): Promise<OwnerSource> {
  const info = await lstat(file);
  if (
    !info.isFile() ||
    info.isSymbolicLink() ||
    info.size > OWNER_LIMITS.sourceBytes
  )
    throw new Error("invalid");
  const probe = await probeMedia(file, tools.ffprobe, signal);
  const video = probe.streams.find((s) => s.codec_type === "video");
  const audio = probe.streams.find((s) => s.codec_type === "audio");
  if (
    !video ||
    !audio ||
    !video.width ||
    !video.height ||
    !video.avg_frame_rate ||
    (audio.channels ?? 0) < 1 ||
    (audio.channels ?? 0) > 2 ||
    (audio.sample_rate ?? 0) > 48_000 ||
    !probe.format.format_name.split(",").includes("mp4") ||
    probe.format.tags?.major_brand === "qt  " ||
    !["yuv420p", "yuvj420p", "yuv422p", "yuv444p"].includes(video.pix_fmt ?? "")
  )
    throw new Error("invalid");
  // Inspect only color descriptors here; keep the shared/public probe unchanged.
  const color = z
    .object({
      streams: z
        .array(
          z.object({
            color_transfer: z.string().optional(),
            color_primaries: z.string().optional(),
          }),
        )
        .length(1),
    })
    .parse(
      JSON.parse(
        await runOwnedProcess(
          tools.ffprobe,
          [
            "-v",
            "error",
            ...SOURCE_INPUT_OPTIONS,
            "-select_streams",
            "v:0",
            "-show_entries",
            "stream=color_transfer,color_primaries",
            "-of",
            "json",
            file,
          ],
          signal,
        ),
      ),
    );
  if (
    !Array.isArray(color.streams) ||
    color.streams.length !== 1 ||
    ["smpte2084", "arib-std-b67"].includes(
      color.streams[0]?.color_transfer ?? "",
    ) ||
    color.streams[0]?.color_primaries === "bt2020"
  )
    throw new Error("invalid");
  const rotation =
    video.side_data_list?.find((s) => s.rotation !== undefined)?.rotation ?? 0;
  if (![0, 90, -90, 180, -180, 270, -270].includes(rotation))
    throw new Error("invalid");
  const [numerator, denominator] = video.avg_frame_rate.split("/").map(Number);
  const hash = createHash("sha256");
  for await (const bytes of createReadStream(file, { signal }))
    hash.update(bytes);
  return ownerSourceSchema.parse({
    fingerprint: hash.digest("hex"),
    bytes: info.size,
    durationMs: Math.round(probe.format.duration * 1000),
    width: Math.abs(rotation) % 180 === 90 ? video.height : video.width,
    height: Math.abs(rotation) % 180 === 90 ? video.width : video.height,
    fps: (numerator ?? 0) / (denominator ?? 1),
  });
}

export async function ownerPortrait(
  source: string,
  output: string,
  tools: OwnerNativeTools,
  signal: AbortSignal,
) {
  const metadata = await inspectOwnerSource(source, tools, signal);
  const durationMs = Math.min(10_000, metadata.durationMs);
  const temporary = `${output}.partial.mp4`;
  try {
    if ((await lstat(temporary)).isSymbolicLink()) throw new Error("invalid");
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT"))
      throw error;
  }
  try {
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-y",
        "-v",
        "error",
        ...SOURCE_INPUT_OPTIONS,
        "-i",
        source,
        "-t",
        String(durationMs / 1000),
        "-map",
        "0:v:0",
        "-map",
        "0:a:0",
        "-vf",
        "scale=1080:1920:force_original_aspect_ratio=decrease:force_divisible_by=2,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1",
        "-r",
        "30",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "22",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-ar",
        "48000",
        "-ac",
        "2",
        "-map_metadata",
        "-1",
        "-movflags",
        "+faststart",
        "-threads",
        "2",
        "-fs",
        String(OWNER_LIMITS.outputBytes),
        temporary,
      ],
      signal,
    );
    const info = await lstat(temporary);
    const result = await probeMedia(temporary, tools.ffprobe, signal);
    const video = result.streams.find((s) => s.codec_type === "video");
    const audio = result.streams.find((s) => s.codec_type === "audio");
    if (
      info.size <= 0 ||
      info.size > OWNER_LIMITS.outputBytes ||
      video?.width !== 1080 ||
      video.height !== 1920 ||
      video.codec_name !== "h264" ||
      video.avg_frame_rate !== "30/1" ||
      video.pix_fmt !== "yuv420p" ||
      video.sample_aspect_ratio !== "1:1" ||
      audio?.codec_name !== "aac" ||
      audio.sample_rate !== 48000 ||
      audio.channels !== 2 ||
      Math.abs((video.duration ?? Infinity) * 1000 - durationMs) > 100 ||
      Math.abs((audio.duration ?? Infinity) * 1000 - durationMs) > 100 ||
      Math.abs(result.format.duration * 1000 - durationMs) > 100
    )
      throw new Error("invalid_output");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-xerror",
        ...SOURCE_INPUT_OPTIONS,
        "-i",
        temporary,
        "-f",
        "null",
        "-",
      ],
      signal,
    );
    await rename(temporary, output);
    return { operation: "portrait" as const, bytes: info.size, durationMs };
  } finally {
    await rm(temporary, { force: true });
  }
}
