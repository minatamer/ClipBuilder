import { createHash } from "node:crypto";
import {
  lstat,
  mkdtemp,
  mkdir,
  readFile,
  rename,
  rm,
  realpath,
  writeFile,
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
import { ownerTimedVideoLookFilter } from "./video-look.ts";
import { ownerNativeFocusFilter } from "./focus-filter.ts";
import {
  ownerOutputProfile,
  ownerCutVideoFilter,
  ownerCutAudioFilter,
} from "./export-profile.ts";
import { SOURCE_INPUT_OPTIONS } from "../src/media/inspection.ts";
import { ownerPresentationFrames } from "../../../packages/contracts/local/hook.ts";
import { prepareOwnerAudioMix } from "./audio-mix.ts";
import { prepareOwnerVideoFiles } from "./video-frames.ts";
import {
  prepareRefractiveScene,
  needsRefractiveScene,
} from "./refractive-scene.ts";

import { prepareOwnerClipPreview, type OwnerCutCache } from "./clip-preview.ts";
export type { OwnerCutCache } from "./clip-preview.ts";

/** Transparent art normally; Glass samples a confined prepared source scene. */
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
  const hookContent = job.overlay.hookContent ?? job.overlay;
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
    {
      effects: job.overlay.cameraEffects ?? [],
      tracks: job.overlay.cameraTracks ?? [],
      occurrence: "body",
    },
  );
  const bodyVideo = `${ownerCutVideoFilter(videoStart, job.cut, bodyProfile)},${focus}`;
  const bodyAudio = ownerCutAudioFilter(videoStart, job.cut);
  const bodyGain = (job.overlay.audio?.originalVolume ?? 100) / 100;
  const hookGain = (hookContent.audio?.originalVolume ?? 100) / 100;
  // Both streams use the same whole native-frame cut; logical audio bounds
  // would leave padding before the body when a short Hook rounds upward.
  const hookStartFrame = hook
    ? Math.floor((hook.startFrame * profile.fps) / OWNER_FPS + 1e-9)
    : 0;
  const hookVideo = hook
    ? `${ownerCutVideoFilter(videoStart, job.cut, bodyProfile)},${ownerNativeFocusFilter(hookContent.focus, metadata, bodyProfile, "hook", { effects: hookContent.cameraEffects ?? [], tracks: hookContent.cameraTracks ?? [], occurrence: "hook", hook, hookStartFrame })},trim=start_frame=${hookStartFrame}:end_frame=${hookStartFrame + hookProfile!.frames},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=${1 / profile.fps},trim=end_frame=${hookProfile!.frames}`
    : "";
  const bodyLook = ownerTimedVideoLookFilter(job.overlay, {
    fps: profile.fps,
    frames: bodyProfile.frames,
    sourceStartFrame: 0,
    startFrame: 0,
    endFrame: job.overlay.frames,
  });
  const hookLook = hook
    ? ownerTimedVideoLookFilter(hookContent, {
        fps: profile.fps,
        frames: hookProfile!.frames,
        sourceStartFrame: hookStartFrame,
        startFrame: hook.startFrame,
        endFrame: hook.endFrame,
      })
    : "null";
  // Independent source decoders avoid buffering a full raw-video branch in split.
  // Both occurrences read original pixels and meet in one final encode.
  const sourceGraph = hook
    ? `[0:v:0]${bodyVideo},${bodyLook}[body];[1:v:0]${hookVideo},${hookLook}[hook];[hook][body]concat=n=2:v=1:a=0[sequence];[sequence]fps=fps=${profile.fps}:start_time=0:round=near,tpad=stop_mode=clone:stop_duration=${1 / profile.fps},trim=end_frame=${profile.frames}[source]`
    : `[0:v:0]${bodyVideo},${bodyLook}[source]`;
  const speechGraph = hook
    ? `[0:a:0]${bodyAudio},volume=${bodyGain},apad,atrim=duration=${bodyProfile.frames / profile.fps}[bodyAudio];[1:a:0]${bodyAudio},atrim=start=${hookStartFrame / profile.fps}:duration=${hookProfile!.frames / profile.fps},asetpts=PTS-STARTPTS,volume=${hookGain},apad,atrim=duration=${hookProfile!.frames / profile.fps}[hookAudio];[hookAudio][bodyAudio]concat=n=2:v=0:a=1[audio]`
    : `[0:a:0]${bodyAudio},volume=${bodyGain}[audio]`;
  const assets: Record<string, string> = {};
  for (const cue of [
    ...job.overlay.visuals,
    ...(job.overlay.hookContent?.visuals ?? []),
  ]) {
    if (cue.video) continue;
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
    const videos = await prepareOwnerVideoFiles(
      {
        root: options.root,
        workspaceId: job.workspaceId,
        overlay: job.overlay,
      },
      signal,
    );
    const bodyFrames = join(frames, "body"),
      hookFrames = join(frames, "hook");
    await mkdir(bodyFrames);
    if (hook) await mkdir(hookFrames);
    const mix = await prepareOwnerAudioMix({
      root: options.root,
      workspaceId: job.workspaceId,
      overlay: job.overlay,
      scratch: frames,
      firstInput: hook ? 2 : 1,
      hookSeconds: (hookProfile?.frames ?? 0) / profile.fps,
      bodySeconds: bodyProfile.frames / profile.fps,
      hookSourceSeconds: hookStartFrame / profile.fps,
      fps: profile.fps,
      signal,
    });
    // Resolve the complete sample clock independently of variable-cost visual
    // decoding. Slow overlay frames cannot introduce silent/backdated AAC packets.
    const audioFile = join(frames, "mixed.wav");
    await runOwnedProcess(
      options.tools.ffmpeg,
      [
        "-nostdin",
        "-n",
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
        ...mix.inputs,
        "-filter_complex",
        `${speechGraph}${mix.graph ? `;${mix.graph}` : ""}`,
        "-filter_complex_threads",
        "2",
        "-map",
        `[${mix.label}]`,
        "-vn",
        "-t",
        String(profile.frames / profile.fps),
        "-c:a",
        "pcm_s16le",
        "-ar",
        "48000",
        "-ac",
        "2",
        "-map_metadata",
        "-1",
        audioFile,
      ],
      signal,
    );
    const budget = { bytes: 0 };
    const refractive = needsRefractiveScene(job.overlay);
    const scene = refractive
      ? await prepareRefractiveScene(
          {
            original,
            tools: options.tools,
            graph: sourceGraph,
            hook: !!hook,
            profile,
            scratch: frames,
            budget,
          },
          signal,
        )
      : undefined;
    const raster = {
      bundle: options.bundle,
      chromium: options.chromium,
      overlay: job.overlay,
      assets,
      videos,
      pixelRatio: Math.max(1, profile.width / 1080, profile.height / 1920),
      budget,
    };
    await rasterizeOwnerOverlay(
      {
        ...raster,
        frames: bodyFrames,
        ...(scene
          ? {
              scene: {
                ...scene,
                fps: profile.fps,
                frames: bodyProfile.frames,
                startFrame: hookProfile?.frames ?? 0,
              },
            }
          : {}),
        clock: {
          hook: false,
          presentationStartFrame:
            ((hookProfile?.frames ?? 0) / profile.fps) * OWNER_FPS,
          sourceStartFrame: 0,
          sourceEndFrame: job.overlay.frames,
          frames: job.overlay.frames,
        },
      },
      signal,
    );
    if (hook)
      await rasterizeOwnerOverlay(
        {
          ...raster,
          frames: hookFrames,
          ...(scene
            ? {
                scene: {
                  ...scene,
                  fps: profile.fps,
                  frames: hookProfile!.frames,
                  startFrame: 0,
                },
              }
            : {}),
          clock: {
            hook: true,
            presentationStartFrame: 0,
            sourceStartFrame: (hookStartFrame / profile.fps) * OWNER_FPS,
            sourceEndFrame:
              ((hookStartFrame + hookProfile!.frames) / profile.fps) *
              OWNER_FPS,
            frames: Math.max(
              1,
              Math.ceil((hookProfile!.frames / profile.fps) * OWNER_FPS - 1e-9),
            ),
          },
        },
        signal,
      );
    // Each branch changes art on the first native frame at/after its raster PTS.
    // Join on the same whole native Hook boundary as the source and audio.
    const artBranch = (input: number, length: number, label: string) =>
      `[${input}:v:0]fps=fps=${profile.fps}:start_time=0:round=up,tpad=stop_mode=clone:stop_duration=${1 / profile.fps},trim=end_frame=${length},setpts=PTS-STARTPTS[${label}]`;
    // A one-frame art branch has no second PTS to establish its duration.
    // Bounded silent clocks preserve its full native duration at the join.
    const artGraph = hook
      ? `${artBranch(2, hookProfile!.frames, "hookArt")};${artBranch(3, bodyProfile.frames, "bodyArt")};anullsrc=r=48000:cl=mono,atrim=duration=${hookProfile!.frames / profile.fps}[hookArtClock];anullsrc=r=48000:cl=mono,atrim=duration=${bodyProfile.frames / profile.fps}[bodyArtClock];[hookArt][hookArtClock][bodyArt][bodyArtClock]concat=n=2:v=1:a=1[artSequence][artClock];[artClock]anullsink;[artSequence]fps=fps=${profile.fps}:start_time=0:round=near,tpad=stop_mode=clone:stop_duration=${1 / profile.fps},trim=end_frame=${profile.frames},scale=${profile.width}:${profile.height}[art]`
      : `${artBranch(1, bodyProfile.frames, "bodyArt")};[bodyArt]scale=${profile.width}:${profile.height}[art]`;
    signal.throwIfAborted();
    const graph = scene
      ? `${artGraph};[art]scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p,setparams=range=tv:colorspace=bt709:color_primaries=bt709:color_trc=bt709,setsar=1[v]`
      : `${sourceGraph};${artGraph};[source][art]overlay=0:0:shortest=1:format=auto,format=yuv420p[v]`;
    const graphFile = join(frames, "camera.ffgraph");
    const movingCamera = !!(
      job.overlay.cameraEffects?.length ||
      job.overlay.cameraTracks?.length ||
      hookContent.cameraEffects?.length ||
      hookContent.cameraTracks?.length
    );
    if (movingCamera)
      await writeFile(graphFile, graph, { flag: "wx", mode: 0o600, signal });
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
        ...[...(hook ? [hookFrames] : []), bodyFrames].flatMap((directory) => [
          "-framerate",
          String(scene ? profile.fps : OWNER_FPS),
          "-threads",
          "2",
          "-i",
          join(directory, scene ? "%06d.jpg" : "%06d.png"),
        ]),
        "-protocol_whitelist",
        "file,pipe",
        "-format_whitelist",
        "wav",
        "-codec_whitelist",
        "pcm_s16le",
        "-threads",
        "1",
        "-i",
        audioFile,
        movingCamera
          ? process.platform === "win32"
            ? "-/filter_complex" // Admitted Windows FFmpeg 9 removed the legacy option.
            : "-filter_complex_script" // Packaged Linux FFmpeg 5.1.
          : "-filter_complex",
        // Keep framesync's default implicit: packaged FFmpeg 5.1 lacks ts_sync_mode.
        movingCamera ? graphFile : graph,
        "-filter_complex_threads",
        "2",
        "-filter_threads",
        "2",
        "-map",
        "[v]",
        "-map",
        `${hook ? 4 : 2}:a:0`,
        "-t",
        String(profile.frames / profile.fps),
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
