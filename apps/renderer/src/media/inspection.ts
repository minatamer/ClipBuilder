import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { stat, readFile, rm } from "node:fs/promises";
import { z } from "zod";
import {
  MEDIA_LIMITS,
  PUBLIC_LIMITS,
  inspectedSourceSchema,
  audioCodecSchema,
  videoCodecSchema,
} from "@clipbuilder/contracts";
import { MediaFailure } from "./media.failure.js";
import {
  assertDecodedAudio,
  DECODED_AUDIO_MAX_BYTES,
} from "./decoded-audio.js";
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
  pix_fmt: z.string().optional(),
  sample_aspect_ratio: z.string().optional(),
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
    tags: z.object({ major_brand: z.string().optional() }).optional(),
  }),
});
export async function probeMedia(
  path: string,
  ffprobe: string,
  signal: AbortSignal,
  kind: "video" | "audio" = "video",
) {
  try {
    return (
      kind === "audio"
        ? probeSchema.extend({ streams: z.array(streamSchema).length(1) })
        : probeSchema
    ).parse(
      JSON.parse(
        await runOwnedProcess(
          ffprobe,
          [
            "-v",
            "error",
            "-protocol_whitelist",
            "file,pipe",
            "-format_whitelist",
            "mov,mp4",
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
    !probe.format.format_name.split(",").includes("mp4") ||
    probe.format.tags?.major_brand === "qt  "
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
      container: "mp4",
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
  ffmpeg: string,
  durationMs: number,
  signal: AbortSignal,
) {
  const info = await stat(path),
    probe = await probeMedia(path, ffprobe, signal);
  assertOutputProbe(probe, info.size, durationMs);
  const samples = [0, durationMs / 2, Math.max(0, durationMs - 1000 / 30)],
    files = samples.map((_, index) => `${path}.frame-${index}.png`),
    audioPath = `${path}.audio.wav`;
  try {
    for (const [index, time] of samples.entries()) {
      const file = files[index]!;
      await runOwnedProcess(
        ffmpeg,
        [
          "-hide_banner",
          "-nostdin",
          "-loglevel",
          "error",
          "-xerror",
          "-y",
          "-protocol_whitelist",
          "file,pipe",
          "-ss",
          (time / 1000).toFixed(6),
          "-i",
          path,
          "-map",
          "0:v:0",
          "-frames:v",
          "1",
          "-vf",
          "scale=32:32",
          "-c:v",
          "png",
          "-threads",
          "1",
          file,
        ],
        signal,
      );
      const size = await stat(file);
      if (size.size < 24 || size.size > 65536)
        throw new MediaFailure("invalid");
      const png = await readFile(file);
      if (
        !png
          .subarray(0, 8)
          .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
        png.readUInt32BE(16) !== 32 ||
        png.readUInt32BE(20) !== 32
      )
        throw new MediaFailure("invalid");
    }
    await runOwnedProcess(
      ffmpeg,
      [
        "-hide_banner",
        "-nostdin",
        "-loglevel",
        "error",
        "-xerror",
        "-y",
        "-protocol_whitelist",
        "file,pipe",
        "-i",
        path,
        "-map",
        "0:a:0",
        "-vn",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-c:a",
        "pcm_s16le",
        "-f",
        "wav",
        audioPath,
      ],
      signal,
    );
    const decoded = await stat(audioPath);
    if (decoded.size < 44 || decoded.size > DECODED_AUDIO_MAX_BYTES)
      throw new MediaFailure("invalid");
    assertDecodedAudio(await readFile(audioPath), durationMs);
  } finally {
    for (const file of [...files, audioPath]) await rm(file, { force: true });
  }
  return {
    bytes: info.size,
    durationMs: Math.round(probe.format.duration * 1000),
    checksum: await fileChecksum(path, signal),
  };
}
export function assertOutputProbe(
  value: unknown,
  bytes: number,
  durationMs: number,
) {
  const probe = probeSchema.parse(value),
    video = probe.streams.find((s) => s.codec_type === "video"),
    audio = probe.streams.find((s) => s.codec_type === "audio");
  if (
    !Number.isSafeInteger(bytes) ||
    bytes <= 0 ||
    bytes > PUBLIC_LIMITS.maxOutputBytes ||
    durationMs < PUBLIC_LIMITS.minClipSeconds * 1000 ||
    durationMs > PUBLIC_LIMITS.maxClipSeconds * 1000 ||
    !Number.isFinite(durationMs) ||
    !probe.format.format_name.split(",").includes("mp4") ||
    video?.codec_name !== "h264" ||
    audio?.codec_name !== "aac" ||
    video.width !== 1080 ||
    video.height !== 1920 ||
    video.avg_frame_rate !== "30/1" ||
    video.pix_fmt !== "yuv420p" ||
    video.sample_aspect_ratio !== "1:1" ||
    ![1, 2].includes(audio.channels ?? 0) ||
    audio.sample_rate !== 48000 ||
    Math.abs((probe.format.start_time ?? NaN) * 1000) > 100 ||
    !Number.isFinite(probe.format.start_time) ||
    !Number.isFinite(video.start_time) ||
    !Number.isFinite(audio.start_time) ||
    Math.abs((video.start_time ?? Infinity) * 1000) > 100 ||
    Math.abs((audio.start_time ?? Infinity) * 1000) > 100 ||
    Math.abs((video.duration ?? Infinity) * 1000 - durationMs) > 100 ||
    Math.abs((audio.duration ?? Infinity) * 1000 - durationMs) > 100 ||
    video.side_data_list?.some(
      (entry) => entry.rotation !== undefined && entry.rotation !== 0,
    ) ||
    Math.abs(probe.format.duration * 1000 - durationMs) > 100
  )
    throw new MediaFailure("invalid");
}
