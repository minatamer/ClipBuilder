import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
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
  ownerPreviewCut,
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

type CachedCut = { binding: string; digest: string };
export type OwnerCutCache = Map<string, CachedCut>;
const hashFile = async (file: string, signal: AbortSignal) => {
  const hash = createHash("sha256");
  for await (const bytes of createReadStream(file, { signal }))
    hash.update(bytes);
  return hash.digest("hex");
};

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
  for (const key of options.cache.keys())
    if (!key.startsWith(`${job.workspaceId}:`)) options.cache.delete(key);
  const raw = await ownerClipMediaPath(
    options.root,
    job.workspaceId,
    job.clipId,
    "source",
  );
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
  const binding = JSON.stringify({
      fingerprint: job.fingerprint,
      cut: job.cut,
    }),
    key = `${job.workspaceId}:${job.clipId}`;
  const cached = options.cache.get(key);
  if (cached) {
    if (
      cached.binding !== binding ||
      (await hashFile(raw, signal)) !== cached.digest
    )
      throw new Error("stale_clip_source");
  } else {
    const result = await ownerPreviewCut(
      await ownerMediaPath(options.root, job.workspaceId, "source.mp4"),
      raw,
      options.tools,
      signal,
      job.cut,
      job.fingerprint,
    );
    if (result.bytes > OWNER_BATCH_POLICY.clipReservationBytes) {
      await rm(raw, { force: true });
      throw new Error("clip_capacity");
    }
    options.cache.set(key, { binding, digest: await hashFile(raw, signal) });
  }
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
  const profile = ownerOutputProfile(metadata, job.overlay.frames);
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
        "-framerate",
        String(OWNER_FPS),
        "-threads",
        "2",
        "-i",
        join(frames, "%06d.png"),
        "-filter_complex",
        `[0:v:0]${ownerCutVideoFilter(videoStart, job.cut, profile)},${ownerNativeFocusFilter(job.overlay.focus, metadata, profile)},${ownerVideoLookFilter(job.overlay.videoLook)}[source];[1:v:0]scale=${profile.width}:${profile.height},tpad=stop_mode=clone:stop_duration=${1 / OWNER_FPS}[art];[source][art]overlay=0:0:shortest=1:format=auto,format=yuv420p[v];[0:a:0]${ownerCutAudioFilter(videoStart, job.cut)}[audio]`,
        "-filter_complex_threads",
        "2",
        "-filter_threads",
        "2",
        "-map",
        "[v]",
        "-map",
        "[audio]",
        "-t",
        String(job.overlay.frames / OWNER_FPS),
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
      job.overlay.frames,
      profile,
    );
    if (bytes > OWNER_BATCH_POLICY.clipReservationBytes)
      throw new Error("clip_capacity");
    await rename(temporary, output);
    return {
      operation: "clip" as const,
      bytes,
      frames: job.overlay.frames,
      durationMs: Math.round((job.overlay.frames * 1000) / OWNER_FPS),
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
