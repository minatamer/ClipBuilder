import { createHash } from "node:crypto";
import {
  lstat,
  mkdtemp,
  readFile,
  rename,
  rm,
  realpath,
} from "node:fs/promises";
import { dirname, join, relative, isAbsolute } from "node:path";
import {
  OWNER_FPS,
  type OwnerMediaJob,
} from "../../../packages/contracts/local/index.ts";
import { OWNER_BATCH_POLICY } from "../../../packages/contracts/local/clips.ts";
import { ownerPictureMime } from "../../../packages/contracts/local/assets.ts";
import {
  ownerAssetMediaPath,
  ownerClipMediaPath,
  ownerMediaPath,
  inspectOwnerMedia,
  validateOwnerOutput,
  type OwnerNativeTools,
} from "./media.ts";
import { runOwnedProcess } from "../src/media/process-runner.ts";
import { rasterizeOwnerOverlay } from "./rasterize-overlay.ts";
import { ownerVideoLookFilter } from "./video-look.ts";
import { ownerNativeFocusFilter } from "./focus-filter.ts";
import {
  ownerOutputProfile,
  ownerCutVideoFilter,
  ownerCutAudioFilter,
} from "./export-profile.ts";
import { SOURCE_INPUT_OPTIONS } from "../src/media/inspection.ts";
import { ownerPresentationFrames } from "../../../packages/contracts/local/hook.ts";
import { prepareOwnerAudioMix } from "./audio-mix.ts";

import { prepareOwnerClipPreview, type OwnerCutCache } from "./clip-preview.ts";
export type { OwnerCutCache } from "./clip-preview.ts";

/** A fixed transparent React overlay, then the admitted FFmpeg performs muxing.
 * Chromium never decodes source media and no Remotion FFmpeg binary is used. */
export async function renderOwnerClip(
  options: {
    root: string;
    tools: OwnerNativeTools;
    chromium: string;
    bundle: string;
    cache: OwnerCutCache;
  },
  job: Extract<OwnerMediaJob, { operation: "clip" }>,
  signal: AbortSignal,
) {
  const output = await ownerClipMediaPath(
    options.root,
    job.workspaceId,
    job.clipId,
    job.renderRevision,
  );
  const temporary = `${output}.partial.mp4`;
  try {
    if ((await lstat(temporary)).isSymbolicLink())
      throw new Error("invalid_output_path");
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT"))
      throw error;
  }
  await prepareOwnerClipPreview(options, job, signal);
  const original = await ownerMediaPath(
    options.root,
    job.workspaceId,
    "source.mp4",
  );
  const { metadata, videoStart } = await inspectOwnerMedia(
    original,
    options.tools,
    signal,
  );
  if (
    metadata.fingerprint !== job.fingerprint ||
    job.cut.endFrame > Math.floor((metadata.durationMs * OWNER_FPS) / 1000)
  )
    throw new Error("stale_clip_source");
  const presentationFrames = ownerPresentationFrames(job.overlay);
  const bodyProfile = ownerOutputProfile(metadata, job.overlay.frames);
  const hook = job.overlay.hook;
  const hookProfile = hook
    ? ownerOutputProfile(metadata, hook.endFrame - hook.startFrame)
    : null;
  const profile = {
    ...bodyProfile,
    frames: bodyProfile.frames + (hookProfile?.frames ?? 0),
  };
  const focus = ownerNativeFocusFilter(
    job.overlay.focus,
    metadata,
    bodyProfile,
    job.overlay.hook ? "body" : "focus",
  );
  const bodyVideo = `${ownerCutVideoFilter(videoStart, job.cut, bodyProfile)},${focus}`;
  const bodyAudio = ownerCutAudioFilter(videoStart, job.cut);
  // Both streams use the same whole native-frame cut; logical audio bounds
  // would leave padding before the body when a short Hook rounds upward.
  const hookStartFrame = hook
    ? Math.floor((hook.startFrame * profile.fps) / OWNER_FPS + 1e-9)
    : 0;
  const hookVideo = hook
    ? `${ownerCutVideoFilter(videoStart, job.cut, bodyProfile)},${ownerNativeFocusFilter(job.overlay.focus, metadata, bodyProfile, "hook")},trim=start_frame=${hookStartFrame}:end_frame=${hookStartFrame + hookProfile!.frames},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=${1 / profile.fps},trim=end_frame=${hookProfile!.frames}`
    : "";
  // Independent source decoders avoid buffering a full raw-video branch in split.
  // Both occurrences read original pixels and meet in one final encode.
  const sourceGraph = hook
    ? `[0:v:0]${bodyVideo}[body];[1:v:0]${hookVideo}[hook];[0:a:0]${bodyAudio},apad,atrim=duration=${bodyProfile.frames / profile.fps}[bodyAudio];[1:a:0]${bodyAudio},atrim=start=${hookStartFrame / profile.fps}:duration=${hookProfile!.frames / profile.fps},asetpts=PTS-STARTPTS,apad,atrim=duration=${hookProfile!.frames / profile.fps}[hookAudio];[hook][hookAudio][body][bodyAudio]concat=n=2:v=1:a=1[sequence][audio];[sequence]fps=fps=${profile.fps}:start_time=0:round=near,tpad=stop_mode=clone:stop_duration=${1 / profile.fps},trim=end_frame=${profile.frames},${ownerVideoLookFilter(job.overlay.videoLook)}[source]`
    : `[0:v:0]${bodyVideo},${ownerVideoLookFilter(job.overlay.videoLook)}[source];[0:a:0]${bodyAudio}[audio]`;
  const assets: Record<string, string> = {};
  for (const cue of job.overlay.visuals) {
    const file = await ownerAssetMediaPath(
      options.root,
      job.workspaceId,
      cue.assetId,
      cue.format,
    );
    const info = await lstat(file);
    if (!info.isFile() || info.size > 3 * 1024 ** 2)
      throw new Error("invalid_asset");
    const bytes = await readFile(file);
    if (
      (cue.format === "png"
        ? !bytes
            .subarray(0, 8)
            .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        : bytes[0] !== 0xff || bytes[1] !== 0xd8) ||
      createHash("sha256").update(bytes).digest("hex") !== cue.digest
    )
      throw new Error("invalid_asset");
    assets[cue.assetId] =
      `data:${ownerPictureMime(cue.format)};base64,${bytes.toString("base64")}`;
  }
  const frames = await mkdtemp(join(dirname(output), "overlay-"));
  try {
    signal.throwIfAborted();
    const mix = await prepareOwnerAudioMix({
      root: options.root,
      workspaceId: job.workspaceId,
      overlay: job.overlay,
      scratch: frames,
      firstInput: hook ? 3 : 2,
      hookSeconds: (hookProfile?.frames ?? 0) / profile.fps,
      bodySeconds: bodyProfile.frames / profile.fps,
      signal,
    });
    await rasterizeOwnerOverlay(
      {
        bundle: options.bundle,
        chromium: options.chromium,
        overlay: job.overlay,
        assets,
        frames,
        pixelRatio: Math.max(1, profile.width / 1080, profile.height / 1920),
      },
      signal,
    );
    signal.throwIfAborted();
    await runOwnedProcess(
      options.tools.ffmpeg,
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
        original,
        ...(hook
          ? [
              ...SOURCE_INPUT_OPTIONS,
              "-threads",
              "2",
              "-copyts",
              "-i",
              original,
            ]
          : []),
        "-framerate",
        String(OWNER_FPS),
        "-threads",
        "2",
        "-i",
        join(frames, "%06d.png"),
        ...mix.inputs,
        "-filter_complex",
        `${sourceGraph}${mix.graph ? `;${mix.graph}` : ""};[${hook ? 2 : 1}:v:0]scale=${profile.width}:${profile.height},tpad=stop_mode=clone:stop_duration=${1 / OWNER_FPS + (hook ? 2 / profile.fps : 0)}[art];[source][art]overlay=0:0:shortest=1:format=auto,format=yuv420p[v]`,
        "-filter_complex_threads",
        "2",
        "-filter_threads",
        "2",
        "-map",
        "[v]",
        "-map",
        `[${mix.label}]`,
        "-t",
        String(
          hook ? profile.frames / profile.fps : presentationFrames / OWNER_FPS,
        ),
        "-frames:v",
        String(profile.frames),
        "-r",
        String(profile.fps),
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "18",
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
        String(OWNER_BATCH_POLICY.clipReservationBytes),
        temporary,
      ],
      signal,
    );
    const bytes = await validateOwnerOutput(
      temporary,
      options.tools,
      signal,
      presentationFrames,
      profile,
    );
    if (bytes > OWNER_BATCH_POLICY.clipReservationBytes)
      throw new Error("clip_capacity");
    await rename(temporary, output);
    return {
      operation: "clip" as const,
      bytes,
      frames: presentationFrames,
      durationMs: Math.round((presentationFrames * 1000) / OWNER_FPS),
    };
  } finally {
    await rm(temporary, { force: true });
    await removeOverlayFrames(frames, dirname(output));
  }
}
async function removeOverlayFrames(frames: string, outputParent: string) {
  const actual = await realpath(frames),
    parent = await realpath(outputParent),
    rel = relative(parent, actual);
  if (
    (await lstat(frames)).isSymbolicLink() ||
    !rel ||
    rel.startsWith("..") ||
    isAbsolute(rel)
  )
    throw new Error("invalid_overlay_cleanup");
  await rm(actual, { recursive: true, force: true });
}
