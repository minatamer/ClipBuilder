import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { z } from "zod";
import {
  MEDIA_LIMITS,
  PUBLIC_LIMITS,
  inspectedSourceSchema,
  audioCodecSchema,
  videoCodecSchema,
} from "@clipbuilder/contracts";
import { MediaFailure } from "./media.failure.js";
import { runOwnedProcess } from "./process-runner.js";
const streamSchema = z.object({
  codec_type: z.string(),
  codec_name: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  avg_frame_rate: z.string().optional(),
  start_time: z.coerce.number().finite().optional(),
  duration: z.coerce.number().finite().optional(),
  sample_rate: z.coerce.number().optional(),
  channels: z.number().optional(),
  side_data_list: z
    .array(z.object({ rotation: z.number().optional() }))
    .optional(),
});
export const probeSchema = z.object({
  streams: z.array(streamSchema).min(2).max(2),
  format: z.object({
    duration: z.coerce.number().finite().positive(),
    start_time: z.coerce.number().finite().optional(),
    format_name: z.string(),
  }),
});
export async function probeMedia(
  path: string,
  ffprobe: string,
  signal: AbortSignal,
) {
  try {
    return probeSchema.parse(
      JSON.parse(
        await runOwnedProcess(
          ffprobe,
          [
            "-v",
            "error",
            "-protocol_whitelist",
            "file,pipe",
            "-format_whitelist",
            "mov,mp4,matroska,webm",
            "-show_streams",
            "-show_format",
            "-of",
            "json",
            path,
          ],
          signal,
        ),
      ),
    );
  } catch {
    throw new MediaFailure("invalid");
  }
}
export async function fileChecksum(path: string, signal: AbortSignal) {
  const hash = createHash("sha256"),
    stream = createReadStream(path, { signal });
  for await (const chunk of stream) hash.update(chunk);
  return hash.digest("hex");
}
export async function inspectSource(
  path: string,
  ffprobe: string,
  signal: AbortSignal,
) {
  const info = await stat(path);
  if (
    !info.isFile() ||
    info.size <= 0 ||
    info.size > PUBLIC_LIMITS.maxSourceBytes
  )
    throw new MediaFailure("invalid");
  const probe = await probeMedia(path, ffprobe, signal),
    video = probe.streams.find((s) => s.codec_type === "video"),
    audio = probe.streams.find((s) => s.codec_type === "audio");
  if (
    !video ||
    !audio ||
    !videoCodecSchema.safeParse(video.codec_name).success ||
    !audioCodecSchema.safeParse(audio.codec_name).success ||
    !video.width ||
    !video.height ||
    (audio.channels ?? 0) < 1 ||
    (audio.channels ?? 0) > 2 ||
    (audio.sample_rate ?? 0) > 48_000 ||
    !/^(mov,mp4|matroska,webm)/.test(probe.format.format_name)
  )
    throw new MediaFailure("invalid");
  const [numerator, denominator] = (video.avg_frame_rate ?? "0/0")
      .split("/")
      .map(Number),
    fps = (numerator ?? 0) / (denominator ?? 0);
  if (
    !Number.isFinite(fps) ||
    fps < MEDIA_LIMITS.minFrameRate ||
    fps > MEDIA_LIMITS.maxFrameRate
  )
    throw new MediaFailure("invalid");
  const rotation =
    video.side_data_list?.find((s) => s.rotation !== undefined)?.rotation ?? 0;
  if (![0, 90, -90, 180, -180, 270, -270].includes(rotation))
    throw new MediaFailure("invalid");
  return inspectedSourceSchema.parse({
    bytes: info.size,
    fingerprint: await fileChecksum(path, signal),
    durationMs: Math.round(probe.format.duration * 1000),
    width: Math.abs(rotation) % 180 === 90 ? video.height : video.width,
    height: Math.abs(rotation) % 180 === 90 ? video.width : video.height,
    audioStartMs: Math.round(
      ((audio.start_time ?? 0) - (video.start_time ?? 0)) * 1000,
    ),
    profile: {
      container: probe.format.format_name.startsWith("mov,mp4")
        ? "mp4"
        : "webm",
      videoCodec: video.codec_name,
      audioCodec: audio.codec_name,
      averageFrameRate: fps,
      rotationDegrees: ((rotation % 360) + 360) % 360,
    },
  });
}
export async function validateOutput(
  path: string,
  ffprobe: string,
  durationMs: number,
  signal: AbortSignal,
) {
  const info = await stat(path),
    probe = await probeMedia(path, ffprobe, signal),
    video = probe.streams.find((s) => s.codec_type === "video"),
    audio = probe.streams.find((s) => s.codec_type === "audio");
  if (
    info.size <= 0 ||
    info.size > PUBLIC_LIMITS.maxOutputBytes ||
    video?.codec_name !== "h264" ||
    audio?.codec_name !== "aac" ||
    video.width !== 1080 ||
    video.height !== 1920 ||
    video.avg_frame_rate !== "30/1" ||
    Math.abs(probe.format.duration * 1000 - durationMs) > 100
  )
    throw new MediaFailure("invalid");
  return {
    bytes: info.size,
    durationMs: Math.round(probe.format.duration * 1000),
    checksum: await fileChecksum(path, signal),
  };
}
