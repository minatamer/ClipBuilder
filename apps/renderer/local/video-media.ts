import { createHash } from "node:crypto";
import { lstat, readFile, rename, rm } from "node:fs/promises";
import { z } from "zod";
import {
  OWNER_VIDEO_LIMITS as limits,
  ownerVideoAssetSchema,
} from "../../../packages/contracts/local/video-assets.ts";
import {
  OWNER_AUDIO_LIMITS,
  ownerAudioAssetSchema,
} from "../../../packages/contracts/local/audio.ts";
import {
  OWNER_FPS,
  type OwnerMediaJob,
} from "../../../packages/contracts/local/index.ts";
import {
  ownerVideoMediaPath,
  ownerAudioMediaPath,
  type OwnerNativeTools,
} from "./media.ts";
import { runOwnedProcess } from "../src/media/process-runner.ts";

const inputOptions = [
  "-protocol_whitelist",
  "file,pipe",
  "-format_whitelist",
  "mov,mp4",
  "-codec_whitelist",
  "h264,hevc,vp9,av1,mpeg4,aac,mp3,mp3float,pcm_s16le",
  "-max_streams",
  "2",
];
const probe = z.object({
  streams: z
    .array(
      z.object({
        codec_type: z.enum(["video", "audio"]),
        codec_name: z.string(),
        width: z.number().int().min(2).max(3840).optional(),
        height: z.number().int().min(2).max(3840).optional(),
        channels: z.number().int().min(1).max(2).optional(),
        avg_frame_rate: z.string().optional(),
        start_time: z.coerce.number().finite().optional(),
        nb_frames: z.coerce.number().int().positive().optional(),
      }),
    )
    .min(1)
    .max(2),
  format: z.object({
    duration: z.coerce
      .number()
      .finite()
      .positive()
      .max(limits.durationMs / 1000),
  }),
});

/** Decode only local admitted bytes; strip metadata and normalize to fixed H.264. */
export async function normalizeOwnerVideo(
  root: string,
  job: Extract<OwnerMediaJob, { operation: "normalize-video" }>,
  tools: OwnerNativeTools,
  signal: AbortSignal,
) {
  const input = await ownerVideoMediaPath(
    root,
    job.workspaceId,
    job.assetId,
    true,
  );
  const output = await ownerVideoMediaPath(root, job.workspaceId, job.assetId);
  const audioOutput = await ownerAudioMediaPath(
    root,
    job.workspaceId,
    job.audioAssetId,
  );
  const temporary = `${output}.partial.mp4`,
    audioTemporary = `${audioOutput}.partial.wav`;
  const bounded = AbortSignal.any([signal, AbortSignal.timeout(120_000)]);
  const info = await lstat(input);
  if (
    !info.isFile() ||
    info.isSymbolicLink() ||
    info.nlink !== 1 ||
    info.size < 1 ||
    info.size > limits.inputBytes
  )
    throw new Error("invalid_video_asset");
  for (const file of [output, audioOutput, temporary, audioTemporary]) {
    try {
      await lstat(file);
      throw new Error("video_output_exists");
    } catch (error) {
      if (!(
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      ))
        throw error;
    }
  }
  let accepted = false;
  try {
    const inspected = probe.parse(
      JSON.parse(
        await runOwnedProcess(
          tools.ffprobe,
          [
            "-v",
            "error",
            ...inputOptions,
            "-show_streams",
            "-show_format",
            "-of",
            "json",
            input,
          ],
          bounded,
        ),
      ),
    );
    const videos = inspected.streams.filter(
      (stream) => stream.codec_type === "video",
    );
    const audios = inspected.streams.filter(
      (stream) => stream.codec_type === "audio",
    );
    const video = videos[0];
    if (
      videos.length !== 1 ||
      !video?.width ||
      !video.height ||
      video.width * video.height > limits.inputPixels ||
      audios.length > 1
    )
      throw new Error("invalid_video_asset");
    const [numerator, denominator] =
      video.avg_frame_rate?.split("/").map(Number) ?? [];
    const fps = (numerator ?? NaN) / (denominator ?? NaN);
    if (!Number.isFinite(fps) || fps < 1 || fps > 60)
      throw new Error("invalid_video_asset");
    // Floor complete source frames: no silent looping, freeze or extension.
    const frames = Math.floor(inspected.format.duration * OWNER_FPS + 1e-6);
    if (frames < 1) throw new Error("invalid_video_asset");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-n",
        "-v",
        "error",
        ...inputOptions,
        "-threads",
        "2",
        "-i",
        input,
        "-map",
        "0:v:0",
        "-an",
        "-sn",
        "-dn",
        "-vf",
        `setpts=PTS-STARTPTS,scale=w='min(${limits.dimension},iw)':h='min(${limits.dimension},ih)':force_original_aspect_ratio=decrease:force_divisible_by=2,setsar=1,fps=${OWNER_FPS}`,
        "-frames:v",
        String(frames),
        "-c:v",
        "libx264",
        "-threads",
        "2",
        "-preset",
        "veryfast",
        "-crf",
        "23",
        "-pix_fmt",
        "yuv420p",
        "-map_metadata",
        "-1",
        "-movflags",
        "+faststart",
        "-fs",
        String(limits.bytes),
        temporary,
      ],
      bounded,
    );
    const normalized = probe.parse(
      JSON.parse(
        await runOwnedProcess(
          tools.ffprobe,
          [
            "-v",
            "error",
            ...inputOptions,
            "-show_streams",
            "-show_format",
            "-of",
            "json",
            temporary,
          ],
          bounded,
        ),
      ),
    );
    const bytes = await readFile(temporary),
      normalizedVideo = normalized.streams[0]!;
    if (
      normalizedVideo.codec_name !== "h264" ||
      normalizedVideo.nb_frames !== frames ||
      Math.abs(normalized.format.duration - frames / OWNER_FPS) > 1 / OWNER_FPS
    )
      throw new Error("invalid_video_asset");
    const asset = ownerVideoAssetSchema.parse({
      id: job.assetId,
      bytes: bytes.length,
      digest: createHash("sha256").update(bytes).digest("hex"),
      width: normalizedVideo.width,
      height: normalizedVideo.height,
      frames,
      hasAudio: audios.length === 1,
      ...(audios.length ? { audioAssetId: job.audioAssetId } : {}),
    });
    let audioAsset;
    if (asset.hasAudio) {
      await runOwnedProcess(
        tools.ffmpeg,
        [
          "-nostdin",
          "-n",
          "-v",
          "error",
          ...inputOptions,
          "-threads",
          "2",
          "-i",
          input,
          "-map",
          "0:a:0",
          "-vn",
          "-sn",
          "-dn",
          "-af",
          `asetpts=PTS-(${(video.start_time ?? 0).toFixed(6)})/TB,aresample=48000:async=1:first_pts=0,apad,atrim=end_sample=${frames * (48000 / OWNER_FPS)},asetpts=N/SR/TB`,
          "-ar",
          "48000",
          "-ac",
          "2",
          "-c:a",
          "pcm_s16le",
          "-map_metadata",
          "-1",
          "-fs",
          String(OWNER_AUDIO_LIMITS.bytes),
          audioTemporary,
        ],
        bounded,
      );
      const audio = await readFile(audioTemporary);
      audioAsset = ownerAudioAssetSchema.parse({
        id: job.audioAssetId,
        frames,
        bytes: audio.length,
        durationMs: Math.round((frames * 1000) / OWNER_FPS),
        digest: createHash("sha256").update(audio).digest("hex"),
      });
      await rename(audioTemporary, audioOutput);
    }
    bounded.throwIfAborted();
    await rename(temporary, output);
    accepted = true;
    return {
      operation: "normalize-video" as const,
      asset,
      ...(audioAsset ? { audioAsset } : {}),
    };
  } finally {
    await rm(temporary, { force: true });
    await rm(audioTemporary, { force: true });
    if (!accepted) {
      await rm(output, { force: true });
      await rm(audioOutput, { force: true });
    }
  }
}
