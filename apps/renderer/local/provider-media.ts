import { lstat, rename, rm } from "node:fs/promises";
import { z } from "zod";
import {
  OWNER_FPS,
  OWNER_PROVIDER_MEDIA,
  ownerCutSchema,
  ownerMediaResultSchema,
  type OwnerMediaJob,
} from "../../../packages/contracts/local/index.ts";
import {
  fileChecksum,
  probeMedia,
  SOURCE_INPUT_OPTIONS,
} from "../src/media/inspection.ts";
import { runOwnedProcess } from "../src/media/process-runner.ts";
import {
  inspectOwnerMedia,
  ownerMediaPath,
  ownerProviderMediaPath,
  type OwnerNativeTools,
} from "./media.ts";

type ProviderJob = Extract<
  OwnerMediaJob,
  { operation: "prepare-owner-audio" | "prepare-owner-video" }
>;

/** Local deterministic input preparation only; no upload or AI dispatch. */
export async function prepareOwnerProviderMedia(
  root: string,
  job: ProviderJob,
  tools: OwnerNativeTools,
  signal: AbortSignal,
) {
  signal.throwIfAborted();
  const source = await ownerMediaPath(root, job.workspaceId, "source.mp4");
  const { metadata, videoStart } = await inspectOwnerMedia(
    source,
    tools,
    signal,
  );
  if (metadata.fingerprint !== job.fingerprint) throw new Error("stale_source");
  const cut =
    job.operation === "prepare-owner-video" || job.cut
      ? ownerCutSchema.parse(job.cut)
      : null;
  if (
    cut &&
    cut.endFrame > Math.floor((metadata.durationMs * OWNER_FPS) / 1000)
  )
    throw new Error("invalid_cut");
  const start = cut ? cut.startFrame / OWNER_FPS : 0;
  const duration = cut
    ? (cut.endFrame - cut.startFrame) / OWNER_FPS
    : metadata.durationMs / 1000;
  const clipId = job.clipId ?? null;
  const videoInput = job.operation === "prepare-owner-video";
  const output = await ownerProviderMediaPath(
    root,
    job.workspaceId,
    clipId,
    false,
    !videoInput,
  );
  const partial = await ownerProviderMediaPath(
    root,
    job.workspaceId,
    clipId,
    true,
    !videoInput,
  );
  const audio = `[0:a:0]asetpts=PTS-(${videoStart.toFixed(6)})/TB,aresample=${OWNER_PROVIDER_MEDIA.audioSampleRate}:async=1:first_pts=0,apad,atrim=start=${start}:end=${start + duration},asetpts=PTS-STARTPTS[a]`;
  // Quantize the selection at the owner/source clock before reducing samples.
  // A short hold uses the last selected frame only. The final packet is shortened
  // on a 30kHz clock, preserving arbitrary 30fps endpoints without extra content.
  const frames = Math.ceil(duration * OWNER_PROVIDER_MEDIA.videoFps - 1e-9);
  const packetTicks = 30_000 / OWNER_PROVIDER_MEDIA.videoFps;
  const finalTicks = Math.round(duration * 30_000) - (frames - 1) * packetTicks;
  const video =
    videoInput && cut
      ? `[0:v:0]setpts=PTS-(${videoStart.toFixed(6)})/TB,fps=fps=${OWNER_FPS}:start_time=0:round=near,trim=start_frame=${cut.startFrame}:end_frame=${cut.endFrame},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=0.1,fps=fps=${OWNER_PROVIDER_MEDIA.videoFps}:start_time=0:round=near,trim=end_frame=${frames},scale=w='min(${OWNER_PROVIDER_MEDIA.videoEdge},iw)':h='min(${OWNER_PROVIDER_MEDIA.videoEdge},ih)':force_original_aspect_ratio=decrease:force_divisible_by=2:reset_sar=1,setsar=1[v];`
      : "";
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
        "-filter_complex_threads",
        "2",
        "-filter_threads",
        "2",
        "-filter_complex",
        `${video}${audio}`,
        ...(videoInput
          ? [
              "-map",
              "[v]",
              "-fps_mode:v",
              "passthrough",
              "-c:v",
              "libx264",
              "-preset",
              "veryfast",
              "-b:v",
              String(OWNER_PROVIDER_MEDIA.videoBitrate),
              "-maxrate",
              String(OWNER_PROVIDER_MEDIA.videoBitrate),
              "-bufsize",
              String(OWNER_PROVIDER_MEDIA.videoBitrate * 2),
              "-bf",
              "0",
              "-pix_fmt",
              "yuv420p",
              "-enc_time_base:v",
              "1:30000",
              "-video_track_timescale",
              "30000",
              "-bsf:v",
              `setts=duration=if(eq(N\\,${frames - 1})\\,${finalTicks}\\,${packetTicks})`,
              "-metadata:s:v:0",
              "rotate=0",
            ]
          : ["-vn"]),
        "-map",
        "[a]",
        "-c:a",
        "aac",
        "-b:a",
        String(OWNER_PROVIDER_MEDIA.audioBitrate),
        "-ac",
        "1",
        "-ar",
        String(OWNER_PROVIDER_MEDIA.audioSampleRate),
        "-map_metadata",
        "-1",
        "-map_metadata:s",
        "-1",
        "-map_chapters",
        "-1",
        "-movflags",
        "+faststart",
        "-threads",
        "2",
        "-fs",
        String(OWNER_PROVIDER_MEDIA.bytes),
        "-f",
        "mp4",
        partial,
      ],
      signal,
    );
    const bytes = await validateProviderMedia(
      partial,
      tools,
      signal,
      duration,
      videoInput ? frames : null,
    );
    const digest = await fileChecksum(partial, signal);
    const result = ownerMediaResultSchema.parse({
      operation: job.operation,
      bytes,
      durationMs: Math.round(duration * 1000),
      digest,
    });
    signal.throwIfAborted();
    await rename(partial, output);
    return result;
  } finally {
    await rm(partial, { force: true });
  }
}

async function validateProviderMedia(
  file: string,
  tools: OwnerNativeTools,
  signal: AbortSignal,
  duration: number,
  frames: number | null,
) {
  const info = await lstat(file);
  const probe = await probeMedia(
    file,
    tools.ffprobe,
    signal,
    frames === null ? "audio" : "video",
  );
  const audio = probe.streams.find((stream) => stream.codec_type === "audio");
  const video = probe.streams.find((stream) => stream.codec_type === "video");
  if (
    !info.isFile() ||
    info.isSymbolicLink() ||
    info.size <= 0 ||
    info.size > OWNER_PROVIDER_MEDIA.bytes ||
    !probe.format.format_name.split(",").includes("mp4") ||
    audio?.codec_name !== "aac" ||
    audio.channels !== 1 ||
    audio.sample_rate !== OWNER_PROVIDER_MEDIA.audioSampleRate ||
    Math.abs(audio.start_time ?? Infinity) > 0.001 ||
    Math.abs((audio.duration ?? Infinity) - duration) > 0.002 ||
    Math.abs(probe.format.start_time ?? Infinity) > 0.001 ||
    Math.abs(probe.format.duration - duration) > 0.002 ||
    (frames === null
      ? video !== undefined
      : !video ||
        video.codec_name !== "h264" ||
        video.pix_fmt !== "yuv420p" ||
        !video.width ||
        !video.height ||
        video.width > OWNER_PROVIDER_MEDIA.videoEdge ||
        video.height > OWNER_PROVIDER_MEDIA.videoEdge ||
        video.width % 2 !== 0 ||
        video.height % 2 !== 0 ||
        video.sample_aspect_ratio !== "1:1" ||
        Math.abs(video.start_time ?? Infinity) > 0.001 ||
        Math.abs((video.duration ?? Infinity) - duration) > 0.0001 ||
        video.side_data_list?.some((value) => (value.rotation ?? 0) !== 0))
  )
    throw new Error("invalid_provider_media");
  if (frames !== null) {
    const counted = z
      .object({
        streams: z
          .array(z.object({ nb_read_frames: z.coerce.number().int() }))
          .length(1),
        packets: z
          .array(
            z.object({
              pts_time: z.coerce.number().finite(),
              duration_time: z.coerce.number().finite().positive(),
            }),
          )
          .length(frames),
      })
      .parse(
        JSON.parse(
          await runOwnedProcess(
            tools.ffprobe,
            [
              "-v",
              "error",
              ...SOURCE_INPUT_OPTIONS,
              "-threads",
              "2",
              "-select_streams",
              "v:0",
              "-count_frames",
              "-show_packets",
              "-show_entries",
              "stream=nb_read_frames:packet=pts_time,duration_time",
              "-of",
              "json",
              file,
            ],
            signal,
            { maxStdout: 1024 ** 2 },
          ),
        ),
      );
    if (counted.streams[0]?.nb_read_frames !== frames)
      throw new Error("invalid_provider_frames");
    for (const [index, packet] of counted.packets.entries()) {
      const start = index / OWNER_PROVIDER_MEDIA.videoFps;
      const length = Math.min(
        1 / OWNER_PROVIDER_MEDIA.videoFps,
        duration - start,
      );
      if (
        Math.abs(packet.pts_time - start) > 0.000002 ||
        Math.abs(packet.duration_time - length) > 0.000002
      )
        throw new Error("invalid_provider_clock");
    }
  }
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
      file,
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
