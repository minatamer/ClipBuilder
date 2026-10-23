import { z } from "zod";
import { lstat, rename, rm } from "node:fs/promises";
import {
  ownerAcquisitionDescriptorSchema,
  type OwnerAcquisitionDescriptor,
} from "../../../packages/contracts/local/acquisition.ts";
import {
  ownerMediaPath,
  ownerAcquisitionMediaPath,
  inspectOwnerSource,
  type OwnerNativeTools,
} from "./media.ts";
import { OWNER_LIMITS } from "../../../packages/contracts/local/policy.ts";
import { probeMedia, SOURCE_INPUT_OPTIONS } from "../src/media/inspection.ts";
import { runOwnedProcess } from "../src/media/process-runner.ts";
import type { OwnerAcquisitionNativeStage } from "../../../packages/contracts/local/acquisition-profile.ts";
import { matchesOfferedFrameRate } from "../../../packages/contracts/local/acquisition-profile.ts";

// Only this owner-only remux boundary admits WebM components. Upload/public
// inspection keeps its existing MP4 demuxer boundary. All inputs are fixed
// workspace-owned files; there is no URL/path/codec/argument escape hatch.
const COMPONENT_INPUT_OPTIONS = [
  "-protocol_whitelist",
  "file,pipe",
  "-format_whitelist",
  "mov,mp4,matroska,webm",
  "-codec_whitelist",
  "h264,vp9,libvpx-vp9,aac,opus,libopus",
  "-max_streams",
  "2",
] as const;
const streamSchema = z.object({
  codec_type: z.string(),
  codec_name: z.string(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  avg_frame_rate: z.string().optional(),
  duration: z.coerce.number().finite().positive().optional(),
  sample_rate: z.coerce.number().int().positive().optional(),
  channels: z.number().int().positive().optional(),
  pix_fmt: z.string().optional(),
  color_transfer: z.string().optional(),
  color_primaries: z.string().optional(),
  sample_aspect_ratio: z.string().optional(),
  side_data_list: z
    .array(z.object({ rotation: z.number().optional() }))
    .optional(),
});
const componentProbeSchema = z.object({
  streams: z.array(streamSchema).length(1),
  format: z.object({
    duration: z.coerce.number().positive().finite(),
    format_name: z.string(),
  }),
});
const fps = (value: string | undefined) => {
  const [numerator, denominator] = (value ?? "0/0").split("/").map(Number);
  return (numerator ?? 0) / (denominator ?? 0);
};
const frameTolerance = (value: OwnerAcquisitionDescriptor) =>
  Math.ceil(1000 / value.fps) + 1;
const matchesOfferedDuration = (
  actualMs: number,
  selected: OwnerAcquisitionDescriptor,
) =>
  Math.abs(actualMs - selected.durationMs) <
  (selected.durationMs % 1000 === 0 ? 1000 : frameTolerance(selected) + 1);
async function boundedFile(path: string) {
  const info = await lstat(path);
  if (
    !info.isFile() ||
    info.isSymbolicLink() ||
    info.nlink !== 1 ||
    info.size < 1 ||
    info.size > OWNER_LIMITS.sourceBytes
  )
    throw new Error("acquisition_component_invalid");
  return info.size;
}
async function absent(path: string) {
  try {
    await lstat(path);
    throw new Error("acquisition_output_exists");
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT"))
      throw error;
  }
}
async function componentProbe(
  path: string,
  tools: OwnerNativeTools,
  signal: AbortSignal,
  combined = false,
) {
  await boundedFile(path);
  return componentProbeSchema
    .extend({ streams: z.array(streamSchema).length(combined ? 2 : 1) })
    .parse(
      JSON.parse(
        await runOwnedProcess(
          tools.ffprobe,
          [
            "-v",
            "error",
            ...COMPONENT_INPUT_OPTIONS,
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
}
function assertVideo(
  stream: z.infer<typeof streamSchema>,
  selected: OwnerAcquisitionDescriptor,
) {
  if (
    stream.codec_type !== "video" ||
    stream.codec_name !== selected.videoCodec ||
    stream.width !== selected.width ||
    stream.height !== selected.height ||
    !matchesOfferedFrameRate(fps(stream.avg_frame_rate), selected.fps) ||
    !Number.isFinite(fps(stream.avg_frame_rate)) ||
    !["yuv420p", "yuvj420p", "yuv422p", "yuv444p"].includes(
      stream.pix_fmt ?? "",
    ) ||
    ["smpte2084", "arib-std-b67"].includes(stream.color_transfer ?? "") ||
    stream.color_primaries === "bt2020" ||
    (stream.sample_aspect_ratio &&
      !["1:1", "N/A"].includes(stream.sample_aspect_ratio)) ||
    stream.side_data_list?.some((item) => (item.rotation ?? 0) !== 0)
  )
    throw new Error("acquisition_selection_changed");
}
function assertAudio(
  stream: z.infer<typeof streamSchema>,
  selected: OwnerAcquisitionDescriptor,
) {
  if (
    stream.codec_type !== "audio" ||
    stream.codec_name !== selected.audioCodec ||
    stream.channels !== selected.audioChannels ||
    stream.sample_rate !== selected.audioSampleRate
  )
    throw new Error("acquisition_selection_changed");
}

/** Validate the complete selected source before it can enter persistent storage. */
export async function inspectOwnerAcquisition(
  root: string,
  workspaceId: string,
  expected: OwnerAcquisitionDescriptor,
  tools: OwnerNativeTools,
  signal: AbortSignal,
) {
  const selected = ownerAcquisitionDescriptorSchema.parse(expected);
  const sourcePath = await ownerMediaPath(root, workspaceId, "source.mp4");
  return inspectPrepared(sourcePath, selected, tools, signal);
}
async function inspectPrepared(
  path: string,
  selected: OwnerAcquisitionDescriptor,
  tools: OwnerNativeTools,
  signal: AbortSignal,
) {
  const source = await inspectOwnerSource(path, tools, signal);
  const probe = await probeMedia(path, tools.ffprobe, signal);
  const video = probe.streams.find((stream) => stream.codec_type === "video");
  const audio = probe.streams.find((stream) => stream.codec_type === "audio");
  if (!video || !audio) throw new Error("acquisition_streams_invalid");
  // inspectOwnerSource has already checked rotation, color descriptors, codec
  // membership, stream count, dimensions, source clocks, byte cap and digest.
  assertVideo(video, selected);
  assertAudio(audio, selected);
  if (
    source.width !== selected.width ||
    source.height !== selected.height ||
    !matchesOfferedDuration(source.durationMs, selected) ||
    !audio.duration ||
    Math.abs(audio.duration * 1000 - source.durationMs) >
      Math.max(100, frameTolerance(selected))
  )
    throw new Error("acquisition_selection_changed");
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
      path,
      "-filter_threads",
      "2",
      "-map",
      "0:v:0",
      "-map",
      "0:a:0",
      "-sn",
      "-dn",
      "-f",
      "null",
      "-",
    ],
    signal,
  );
  signal.throwIfAborted();
  return {
    source,
    descriptor: ownerAcquisitionDescriptorSchema.parse({
      ...selected,
      durationMs: source.durationMs,
      fps: source.fps,
      width: source.width,
      height: source.height,
      videoCodec: video.codec_name,
      audioCodec: audio.codec_name,
      audioChannels: audio.channels,
      audioSampleRate: audio.sample_rate,
    }),
  };
}

/** Lossless merge of exactly one admitted video and one admitted audio component. */
export async function prepareOwnerAcquisition(
  root: string,
  workspaceId: string,
  expected: OwnerAcquisitionDescriptor,
  tools: OwnerNativeTools,
  signal: AbortSignal,
  combined = false,
  stage?: (value: OwnerAcquisitionNativeStage) => void,
) {
  const selected = ownerAcquisitionDescriptorSchema.parse(expected);
  const video = await ownerAcquisitionMediaPath(root, workspaceId, "video");
  const audio = await ownerAcquisitionMediaPath(root, workspaceId, "audio");
  const temporary = await ownerAcquisitionMediaPath(
    root,
    workspaceId,
    "merged",
  );
  const source = await ownerMediaPath(root, workspaceId, "source.mp4");
  await absent(source);
  await absent(temporary);
  try {
    if (combined) await absent(audio);
    const videoProbe = await componentProbe(video, tools, signal, combined),
      audioProbe = combined
        ? videoProbe
        : await componentProbe(audio, tools, signal);
    const videoStream = videoProbe.streams.find(
        (stream) => stream.codec_type === "video",
      ),
      audioStream = audioProbe.streams.find(
        (stream) => stream.codec_type === "audio",
      );
    if (!videoStream || !audioStream)
      throw new Error("acquisition_streams_invalid");
    assertVideo(videoStream, selected);
    assertAudio(audioStream, selected);
    if (
      !matchesOfferedDuration(videoProbe.format.duration * 1000, selected) ||
      Math.abs(
        audioProbe.format.duration * 1000 - videoProbe.format.duration * 1000,
      ) > Math.max(100, frameTolerance(selected)) ||
      (await boundedFile(video)) + (combined ? 0 : await boundedFile(audio)) >
        OWNER_LIMITS.sourceBytes
    )
      throw new Error("acquisition_selection_changed");
    stage?.("merging");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-xerror",
        "-n",
        "-filter_threads",
        "2",
        "-copyts",
        ...COMPONENT_INPUT_OPTIONS,
        "-threads",
        "2",
        "-i",
        video,
        ...(combined
          ? []
          : [...COMPONENT_INPUT_OPTIONS, "-threads", "2", "-i", audio]),
        "-map",
        "0:v:0",
        "-map",
        combined ? "0:a:0" : "1:a:0",
        "-c",
        "copy",
        "-map_metadata",
        "-1",
        "-map_chapters",
        "-1",
        "-movflags",
        "+faststart",
        "-f",
        "mp4",
        "-fs",
        String(OWNER_LIMITS.sourceBytes),
        temporary,
      ],
      signal,
    );
    stage?.("inspecting");
    const inspected = await inspectPrepared(temporary, selected, tools, signal);
    signal.throwIfAborted();
    await absent(source);
    await rename(temporary, source);
    return inspected;
  } finally {
    await Promise.all(
      [video, audio, temporary].map((path) => rm(path, { force: true })),
    );
  }
}

/** Synthetic inputs are generated at the chosen dimensions, never upscaled media. */
export async function createSyntheticAcquisitionComponents(
  root: string,
  workspaceId: string,
  expected: OwnerAcquisitionDescriptor,
  tools: OwnerNativeTools,
  signal: AbortSignal,
  stage?: (value: OwnerAcquisitionNativeStage) => void,
) {
  const selected = ownerAcquisitionDescriptorSchema.parse(expected);
  if (
    selected.durationMs !== 16000 ||
    selected.width % 2 ||
    selected.height % 2
  )
    throw new Error("synthetic_acquisition_profile_unavailable");
  const video = await ownerAcquisitionMediaPath(root, workspaceId, "video");
  const audio = await ownerAcquisitionMediaPath(root, workspaceId, "audio");
  await absent(video);
  await absent(audio);
  try {
    stage?.("video");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-n",
        "-filter_threads",
        "2",
        "-f",
        "lavfi",
        "-i",
        `color=c=blue:size=${selected.width}x${selected.height}:rate=${selected.fps}:duration=16`,
        "-an",
        "-c:v",
        selected.videoCodec === "h264" ? "libx264" : "libvpx-vp9",
        ...(selected.videoCodec === "h264"
          ? ["-preset", "ultrafast", "-crf", "32"]
          : [
              "-deadline",
              "realtime",
              "-cpu-used",
              "8",
              "-b:v",
              "200k",
              "-row-mt",
              "1",
            ]),
        "-pix_fmt",
        "yuv420p",
        "-color_primaries",
        "bt709",
        "-color_trc",
        "bt709",
        "-colorspace",
        "bt709",
        "-threads",
        "2",
        "-f",
        selected.videoCodec === "h264" ? "mp4" : "webm",
        video,
      ],
      signal,
    );
    stage?.("audio");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-n",
        "-f",
        "lavfi",
        "-filter_threads",
        "2",
        "-i",
        `sine=frequency=440:sample_rate=${selected.audioSampleRate}:duration=16`,
        "-vn",
        "-ac",
        String(selected.audioChannels),
        "-c:a",
        selected.audioCodec === "aac" ? "aac" : "libopus",
        "-b:a",
        "96k",
        "-threads",
        "2",
        "-f",
        selected.audioCodec === "aac" ? "ipod" : "webm",
        audio,
      ],
      signal,
    );
  } catch (error) {
    await Promise.all([video, audio].map((path) => rm(path, { force: true })));
    throw error;
  }
}

export async function synthesizeOwnerAcquisition(
  root: string,
  workspaceId: string,
  expected: OwnerAcquisitionDescriptor,
  tools: OwnerNativeTools,
  signal: AbortSignal,
  stage?: (value: OwnerAcquisitionNativeStage) => void,
) {
  await createSyntheticAcquisitionComponents(
    root,
    workspaceId,
    expected,
    tools,
    signal,
    stage,
  );
  return prepareOwnerAcquisition(
    root,
    workspaceId,
    expected,
    tools,
    signal,
    false,
    stage,
  );
}
