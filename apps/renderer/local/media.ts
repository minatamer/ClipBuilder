import { createHash } from "node:crypto";
import { z } from "zod";
import { createReadStream } from "node:fs";
import { lstat, realpath, rm, rename } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";
import {
  OWNER_LIMITS,
  OWNER_FPS,
  ownerCutSchema,
  type OwnerCut,
  ownerSourceSchema,
  ownerIdSchema,
  type OwnerSource,
} from "../../../packages/contracts/local/index.ts";
import { probeMedia, SOURCE_INPUT_OPTIONS } from "../src/media/inspection.ts";
import { runOwnedProcess } from "../src/media/process-runner.ts";
import { ownerOutputRevisionSchema } from "../../../packages/contracts/local/clips.ts";
import {
  ownerPictureFormatSchema,
  ownerPictureExtension,
  type OwnerPictureFormat,
} from "../../../packages/contracts/local/assets.ts";
import {
  videoCodecSchema,
  audioCodecSchema,
} from "../../../packages/contracts/src/media.schema.ts";
import {
  ownerOutputProfile,
  ownerCutVideoFilter,
  ownerCutAudioFilter,
  type OwnerOutputProfile,
} from "./export-profile.ts";

export type OwnerNativeTools = { ffmpeg: string; ffprobe: string };
export async function ownerMediaPath(
  root: string,
  id: string,
  name: "source.mp4" | "portrait.mp4",
): Promise<string> {
  return admittedMediaPath(root, id, name);
}
export async function ownerClipMediaPath(
  root: string,
  id: string,
  clipId: string,
  kind: "source" | number,
) {
  ownerIdSchema.parse(clipId);
  if (typeof kind === "number") ownerOutputRevisionSchema.parse(kind);
  return admittedMediaPath(
    root,
    id,
    `${clipId}.${kind === "source" ? "source" : `r${kind}`}.mp4`,
  );
}
export async function ownerAssetMediaPath(
  root: string,
  id: string,
  assetId: string,
  format: OwnerPictureFormat = "jpeg",
) {
  ownerIdSchema.parse(assetId);
  return admittedMediaPath(
    root,
    id,
    `${assetId}.${ownerPictureExtension(ownerPictureFormatSchema.parse(format))}`,
  );
}
export async function ownerAudioMediaPath(
  root: string,
  id: string,
  assetId: string,
  input = false,
) {
  ownerIdSchema.parse(assetId);
  return admittedMediaPath(
    root,
    id,
    `${assetId}.${input ? "audio-input" : "wav"}`,
  );
}
export async function ownerAcquisitionMediaPath(
  root: string,
  id: string,
  kind: "video" | "audio" | "merged",
) {
  ownerIdSchema.parse(id);
  return admittedMediaPath(
    root,
    id,
    kind === "merged" ? "acquisition.merged.mp4" : `acquisition.${kind}`,
  );
}
export async function ownerProviderMediaPath(
  root: string,
  id: string,
  clipId: string | null,
  partial = false,
  audioOnly = false,
) {
  ownerIdSchema.parse(id);
  if (clipId !== null) ownerIdSchema.parse(clipId);
  const name =
    clipId === null
      ? "provider.audio"
      : `${clipId}.provider${audioOnly ? ".audio" : ""}`;
  return admittedMediaPath(
    root,
    id,
    `${name}${partial ? ".partial" : ""}.${clipId === null || audioOnly ? "m4a" : "mp4"}`,
  );
}
async function admittedMediaPath(
  root: string,
  id: string,
  name: string,
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

export async function inspectOwnerMedia(
  file: string,
  tools: OwnerNativeTools,
  signal: AbortSignal,
) {
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
    !videoCodecSchema.safeParse(video.codec_name).success ||
    !audioCodecSchema.safeParse(audio.codec_name).success ||
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
  const videoStart = video.start_time ?? probe.format.start_time ?? 0;
  // MP4 stream duration can include a trailing muxer/edit-list allowance that
  // the decoder never emits. Use packet presentation ends so endpoint cuts do
  // not ask the CFR filter for nonexistent source frames. B-frame decode order
  // is irrelevant to this maximum; the bounded probe never decodes source pixels.
  const packets = await runOwnedProcess(
    tools.ffprobe,
    [
      "-v",
      "error",
      ...SOURCE_INPUT_OPTIONS,
      "-select_streams",
      "v:0",
      "-show_packets",
      "-show_entries",
      "packet=pts_time,duration_time",
      "-of",
      "csv=p=0",
      file,
    ],
    signal,
    { maxStdout: 16 * 1024 ** 2 },
  );
  let videoEnd = videoStart;
  for (const row of packets.trim().split(/\r?\n/)) {
    const parts = row.split(",");
    if (parts.length !== 2 || parts.some((part) => part.trim() === ""))
      throw new Error("invalid_video_clock");
    const [pts, duration] = parts.map(Number);
    if (
      !Number.isFinite(pts) ||
      !Number.isFinite(duration) ||
      !duration ||
      duration < 0
    )
      throw new Error("invalid_video_clock");
    videoEnd = Math.max(videoEnd, pts! + duration);
  }
  const hash = createHash("sha256");
  for await (const bytes of createReadStream(file, { signal }))
    hash.update(bytes);
  const metadata = ownerSourceSchema.parse({
    fingerprint: hash.digest("hex"),
    bytes: info.size,
    durationMs: Math.round((videoEnd - videoStart) * 1000),
    width: Math.abs(rotation) % 180 === 90 ? video.height : video.width,
    height: Math.abs(rotation) % 180 === 90 ? video.width : video.height,
    fps: (numerator ?? 0) / (denominator ?? 1),
  });
  return {
    metadata,
    videoStart,
  };
}

export async function inspectOwnerSource(
  file: string,
  tools: OwnerNativeTools,
  signal: AbortSignal,
): Promise<OwnerSource> {
  return (await inspectOwnerMedia(file, tools, signal)).metadata;
}

type PortraitArguments = [
  source: string,
  output: string,
  tools: OwnerNativeTools,
  signal: AbortSignal,
  requestedCut: OwnerCut,
  fingerprint: string,
];
export const ownerPortrait = (...args: PortraitArguments) =>
  renderOwnerPortrait(...args, false);
/** Browser playback cache only; final exports never read this encoded video. */
export const ownerPreviewCut = (...args: PortraitArguments) =>
  renderOwnerPortrait(...args, true);

async function renderOwnerPortrait(
  source: string,
  output: string,
  tools: OwnerNativeTools,
  signal: AbortSignal,
  requestedCut: OwnerCut,
  fingerprint: string,
  preview: boolean,
) {
  const { metadata, videoStart } = await inspectOwnerMedia(
    source,
    tools,
    signal,
  );
  const cut = ownerCutSchema.parse(requestedCut);
  if (
    fingerprint !== metadata.fingerprint ||
    cut.endFrame > Math.floor((metadata.durationMs * OWNER_FPS) / 1000)
  )
    throw new Error("stale_or_invalid_cut");
  const frames = cut.endFrame - cut.startFrame;
  const durationMs = (frames * 1000) / OWNER_FPS;
  const profile = preview
    ? { width: 1080, height: 1920, fps: OWNER_FPS, frames }
    : ownerOutputProfile(metadata, frames);
  // Normalize the video clock before frame selection. This also handles VFR and
  // nonzero container starts without moving words or stretching source time.
  const filter = `[0:v:0]${ownerCutVideoFilter(videoStart, cut, profile)},scale=${profile.width}:${profile.height}:force_original_aspect_ratio=decrease:force_divisible_by=2,pad=${profile.width}:${profile.height}:(ow-iw)/2:(oh-ih)/2,setsar=1[v];[0:a:0]${ownerCutAudioFilter(videoStart, cut)}[a]`;
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
        "-threads",
        "2",
        "-copyts",
        "-i",
        source,
        "-t",
        String(durationMs / 1000),
        "-map",
        "[v]",
        "-map",
        "[a]",
        "-filter_complex",
        filter,
        "-filter_complex_threads",
        "2",
        "-filter_threads",
        "2",
        "-frames:v",
        String(profile.frames),
        "-r",
        String(profile.fps),
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        preview ? "22" : "18",
        ...(preview ? ["-maxrate", "8M", "-bufsize", "16M"] : []),
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "160k",
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
    const bytes = await validateOwnerOutput(
      temporary,
      tools,
      signal,
      frames,
      profile,
    );
    await rename(temporary, output);
    return {
      operation: "portrait" as const,
      bytes,
      durationMs: Math.round(durationMs),
      frames,
    };
  } finally {
    await rm(temporary, { force: true });
  }
}

export async function validateOwnerOutput(
  temporary: string,
  tools: OwnerNativeTools,
  signal: AbortSignal,
  frames: number,
  profile: OwnerOutputProfile = {
    width: 1080,
    height: 1920,
    fps: OWNER_FPS,
    frames,
  },
): Promise<number> {
  const durationMs = (frames * 1000) / OWNER_FPS;
  const info = await lstat(temporary);
  const result = await probeMedia(temporary, tools.ffprobe, signal);
  const video = result.streams.find((s) => s.codec_type === "video");
  const audio = result.streams.find((s) => s.codec_type === "audio");
  const [numerator, denominator] = (video?.avg_frame_rate ?? "0/0")
    .split("/")
    .map(Number);
  const rate = (numerator ?? 0) / (denominator ?? 0);
  if (
    info.size <= 0 ||
    info.size > OWNER_LIMITS.outputBytes ||
    video?.width !== profile.width ||
    video.height !== profile.height ||
    video.codec_name !== "h264" ||
    !Number.isFinite(rate) ||
    Math.abs(rate - profile.fps) > 0.0001 ||
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
  const counted = z
    .object({
      streams: z
        .array(z.object({ nb_read_frames: z.coerce.number().int() }))
        .length(1),
    })
    .parse(
      JSON.parse(
        await runOwnedProcess(
          tools.ffprobe,
          [
            "-v",
            "error",
            "-protocol_whitelist",
            "file,pipe",
            "-threads",
            "2",
            "-select_streams",
            "v:0",
            "-count_frames",
            "-show_entries",
            "stream=nb_read_frames",
            "-of",
            "json",
            temporary,
          ],
          signal,
        ),
      ),
    );
  if (counted.streams[0]?.nb_read_frames !== profile.frames)
    throw new Error("invalid_frame_count");
  await runOwnedProcess(
    tools.ffmpeg,
    [
      "-nostdin",
      "-v",
      "error",
      "-xerror",
      ...SOURCE_INPUT_OPTIONS,
      "-threads",
      "2",
      "-i",
      temporary,
      "-filter_threads",
      "2",
      "-f",
      "null",
      "-",
    ],
    signal,
  );
  return info.size;
}
