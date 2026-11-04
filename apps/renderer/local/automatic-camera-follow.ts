import { randomUUID } from "node:crypto";
import { mkdtemp, lstat, open, rm, realpath } from "node:fs/promises";
import { dirname, join, relative, isAbsolute } from "node:path";
import { setImmediate as yieldPixels } from "node:timers/promises";
import {
  HeadPixelTracker,
  type GrayFrame,
} from "../../../packages/composition/local/head-pixel-tracker.ts";
import { planBulkHeadMotion } from "../../../packages/contracts/local/camera-follow-plan.ts";
import {
  OWNER_CAMERA_FOLLOW,
  ownerCameraTrackSchema,
  ownerCameraFollowKey,
  ownerCameraTracksSchema,
  ownerCameraTracksFit,
  type OwnerCameraTrack,
} from "../../../packages/contracts/local/camera-follow.ts";
import { headEscapesCamera } from "../../../packages/contracts/local/camera-follow-window.ts";
import {
  ownerSourceContent,
  ownerFocusSchema,
  type OwnerFocus,
} from "../../../packages/contracts/local/focus.ts";
import { runOwnedProcess } from "../src/media/process-runner.ts";
import type { OwnerNativeTools } from "./media.ts";
import { preparedCameraPixels } from "./camera-follow-pixels.ts";

/** Bounded pixels from an admitted, already prepared clip; no AI or new tools. */
export async function followPreparedCamera(
  file: string,
  focus: OwnerFocus,
  tools: OwnerNativeTools,
  signal: AbortSignal,
): Promise<OwnerCameraTrack[]> {
  ownerFocusSchema.parse(focus);
  signal.throwIfAborted();
  const plan = planBulkHeadMotion({
    focus,
    tracks: [],
    effects: [],
    hook: undefined,
  });
  if (plan.blocked || !plan.intervals.length) return [];
  const fileInfo = await lstat(file);
  if (!fileInfo.isFile() || fileInfo.isSymbolicLink())
    throw Error("camera_source_invalid");
  const pixels = preparedCameraPixels(focus, plan.intervals, fileInfo.size);
  if (!pixels) return [];
  const { indices, width, height, select } = pixels;
  const content = ownerSourceContent(focus.source),
    frameBytes = width * height;
  const scratch = await mkdtemp(join(dirname(file), "camera-follow-"));
  const deadline = new AbortController();
  const timer = setTimeout(() => deadline.abort(), 60000);
  const workSignal = AbortSignal.any([signal, deadline.signal]);
  let handle: Awaited<ReturnType<typeof open>> | undefined;
  try {
    const raw = join(scratch, "frames.gray");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-threads",
        "2",
        "-i",
        file,
        "-an",
        "-vf",
        `select='${select}',crop=${content.width}:${content.height}:${content.x}:${content.y},scale=${width}:${height}:flags=bilinear`,
        "-fps_mode",
        "passthrough",
        "-frames:v",
        String(indices.length),
        "-pix_fmt",
        "gray",
        "-f",
        "rawvideo",
        raw,
      ],
      workSignal,
      { stdout: "ignore", timeoutMs: 60000 },
    );
    if ((await lstat(raw)).size !== indices.length * frameBytes)
      throw Error("camera_pixels_invalid");
    handle = await open(raw, "r");
    const positions = new Map(indices.map((frame, index) => [frame, index]));
    const bytes = Buffer.alloc(frameBytes);
    const tracks: OwnerCameraTrack[] = [];
    const failedShots = new Set<number>(),
      trackShots = new Map<string, number>();
    let previous: OwnerCameraTrack | undefined;
    for (const interval of plan.intervals) {
      workSignal.throwIfAborted();
      if (
        interval.continuation &&
        (!previous || previous.outcome !== "complete")
      ) {
        failedShots.add(interval.shot);
        previous = undefined;
        continue;
      }
      const seed = { ...interval.seed };
      if (interval.continuation && previous) {
        const last = previous.points.at(-1)!;
        seed.width = Math.min(seed.width, last.x * 2, (1 - last.x) * 2);
        seed.height = Math.min(seed.height, last.y * 2, (1 - last.y) * 2);
        seed.x = last.x - seed.width / 2;
        seed.y = last.y - seed.height / 2;
      }
      const points: OwnerCameraTrack["points"] = [];
      let tracker: HeadPixelTracker | undefined;
      let lost = false;
      const end =
        interval.sourceStartFrame + interval.endFrame - interval.startFrame;
      try {
        const frames = indices.filter(
          (frame) =>
            frame >= interval.sourceStartFrame &&
            frame < end &&
            ((frame - interval.sourceStartFrame) %
              OWNER_CAMERA_FOLLOW.sampleFrames ===
              0 ||
              frame === end - 1),
        );
        for (const frame of frames) {
          workSignal.throwIfAborted();
          let filled = 0;
          while (filled < frameBytes) {
            workSignal.throwIfAborted();
            const read = await handle.read(
              bytes,
              filled,
              frameBytes - filled,
              positions.get(frame)! * frameBytes + filled,
            );
            if (!read.bytesRead) throw Error("camera_pixels_invalid");
            filled += read.bytesRead;
          }
          const image: GrayFrame = {
            width,
            height,
            pixels: Float32Array.from(bytes),
          };
          let center: { x: number; y: number };
          if (!tracker) {
            tracker = new HeadPixelTracker(image, seed, {
              immediate: true,
              recoverTranslation: true,
            });
            center = {
              x: Number((seed.x + seed.width / 2).toFixed(6)),
              y: Number((seed.y + seed.height / 2).toFixed(6)),
            };
          } else {
            const next = tracker.step(image);
            if (!next) {
              lost = true;
              break;
            }
            center = next;
          }
          points.push({ frame: frame - interval.sourceStartFrame, ...center });
          if (points.length % 8 === 0) await yieldPixels();
        }
        if (
          lost ||
          points.at(-1)?.frame !== end - interval.sourceStartFrame - 1
        ) {
          failedShots.add(interval.shot);
          previous = undefined;
          continue;
        }
        const track = ownerCameraTrackSchema.parse({
          id: randomUUID(),
          ...(interval.continuation && previous
            ? { continues: previous.id }
            : {}),
          occurrence: "body",
          personId: interval.personId,
          startFrame: interval.startFrame,
          endFrame: interval.endFrame,
          sourceStartFrame: interval.sourceStartFrame,
          seed,
          points,
          outcome: "complete",
          followWindow: OWNER_CAMERA_FOLLOW.followWindow,
          focusKey: ownerCameraFollowKey(focus, interval.personId),
        });
        tracks.push(track);
        trackShots.set(track.id, interval.shot);
        previous = track;
      } catch {
        workSignal.throwIfAborted();
        failedShots.add(interval.shot);
        previous = undefined;
      }
    }
    // Retain a whole linked camera family only if fixed framing would lose its head.
    const retained = new Set<string>();
    for (const track of tracks)
      if (
        !failedShots.has(trackShots.get(track.id)!) &&
        headEscapesCamera(focus, track)
      )
        retained.add(track.id);
    for (let i = 0; i < tracks.length; i++)
      for (const track of tracks)
        if (
          track.continues &&
          (retained.has(track.id) || retained.has(track.continues))
        ) {
          retained.add(track.id);
          retained.add(track.continues);
        }
    const selected = ownerCameraTracksSchema.parse(
      tracks.filter((track) => retained.has(track.id)),
    );
    if (!ownerCameraTracksFit(selected, focus, { frames: focus.frames }))
      throw Error("camera_track_invalid");
    return selected;
  } finally {
    clearTimeout(timer);
    deadline.abort();
    try {
      await handle?.close();
    } finally {
      await clearCameraScratch(scratch, dirname(file));
    }
  }
}

async function clearCameraScratch(scratch: string, parentDirectory: string) {
  const child = await realpath(scratch),
    parent = await realpath(parentDirectory),
    rel = relative(parent, child);
  if (
    !rel ||
    isAbsolute(rel) ||
    rel.startsWith("..") ||
    !rel.startsWith("camera-follow-")
  )
    throw Error("camera_scratch_invalid");
  await rm(child, { recursive: true, force: true });
}
