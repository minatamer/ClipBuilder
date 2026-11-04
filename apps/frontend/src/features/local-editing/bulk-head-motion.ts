import {
  OWNER_CAMERA_FOLLOW,
  ownerCameraFollowKey,
  ownerCameraTracksFit,
  ownerCameraTracksSchema,
  ownerCameraTrackSchema,
  ownerHeadBoxSchema,
  type OwnerCameraTrack,
} from "../../../../../packages/contracts/local/camera-follow.ts";
import { ownerCameraEffectsFit } from "../../../../../packages/contracts/local/camera-motion.ts";
import {
  planBulkHeadMotion,
  type CameraFollowInput as Input,
} from "../../../../../packages/contracts/local/camera-follow-plan.ts";
export {
  planBulkHeadMotion,
  type BulkHeadPlan,
} from "../../../../../packages/contracts/local/camera-follow-plan.ts";
import type { HeadBox } from "../../../../../packages/composition/local/head-pixel-tracker.ts";
import { trackHeadVideo } from "./track-head-video";
export type BulkHeadProgress = {
  fraction: number;
  index: number;
  total: number;
  personId: string | null;
  presentationFrame: number;
};
/** Serial local work, atomically returned only after completion; abort discards results. */
export async function trackBulkHeadMotion(
  input: Input & {
    sourceUrl: string;
    signal: AbortSignal;
    progress: (value: BulkHeadProgress) => void;
  },
  sample: typeof trackHeadVideo = trackHeadVideo,
) {
  const plan = planBulkHeadMotion(input);
  if (plan.blocked || !plan.intervals.length)
    throw Error("bulk_head_plan_unavailable");
  const added: OwnerCameraTrack[] = [];
  let complete = 0,
    partial = 0,
    failed = 0,
    finished = 0;
  let previous: OwnerCameraTrack | undefined;
  const total = plan.intervals.reduce(
    (sum, interval) => sum + interval.endFrame - interval.startFrame,
    0,
  );
  for (const [index, interval] of plan.intervals.entries()) {
    input.signal.throwIfAborted();
    const duration = interval.endFrame - interval.startFrame;
    const progress = (fraction: number) =>
      input.progress({
        fraction: (finished + duration * fraction) / total,
        index: index + 1,
        total: plan.intervals.length,
        personId: interval.personId,
        presentationFrame:
          interval.startFrame +
          (interval.occurrence === "body" && input.hook
            ? input.hook.endFrame - input.hook.startFrame
            : 0),
      });
    progress(0);
    if (
      interval.continuation &&
      (!previous ||
        previous.outcome !== "complete" ||
        previous.endFrame !== interval.startFrame)
    ) {
      failed++;
      previous = undefined;
      finished += duration;
      progress(0);
      continue;
    }
    let seed: HeadBox = interval.seed;
    if (interval.continuation && previous) {
      const center = previous.points.at(-1)!;
      const width = Math.min(seed.width, center.x * 2, (1 - center.x) * 2),
        height = Math.min(seed.height, center.y * 2, (1 - center.y) * 2);
      seed = {
        x: center.x - width / 2,
        y: center.y - height / 2,
        width,
        height,
      };
    }
    try {
      if (!ownerHeadBoxSchema.safeParse(seed).success)
        throw Error("head_not_clear");
      const result = await sample({
        sourceUrl: input.sourceUrl,
        source: input.focus.source,
        seed,
        startFrame: interval.sourceStartFrame,
        frames: duration,
        signal: input.signal,
        progress: (done, count) =>
          progress(Math.max(0, Math.min(1, done / count))),
      });
      input.signal.throwIfAborted();
      const last = result.points.at(-1)?.frame ?? 0;
      if (
        last < 5 ||
        last >= duration ||
        (result.outcome === "complete" && last !== duration - 1)
      )
        throw Error("head_not_clear");
      const next = ownerCameraTrackSchema.parse({
        id: crypto.randomUUID(),
        ...(interval.continuation && previous
          ? { continues: previous.id }
          : {}),
        occurrence: interval.occurrence,
        personId: interval.personId,
        startFrame: interval.startFrame,
        endFrame: interval.startFrame + last + 1,
        sourceStartFrame: interval.sourceStartFrame,
        seed,
        focusKey: ownerCameraFollowKey(input.focus, interval.personId),
        points: result.points,
        outcome: result.outcome,
        followWindow: OWNER_CAMERA_FOLLOW.followWindow,
      });
      const tracks = [...input.tracks, ...added, next];
      if (
        !ownerCameraTracksSchema.safeParse(tracks).success ||
        !ownerCameraTracksFit(tracks, input.focus, {
          frames: input.focus.frames,
          hook: input.hook,
        }) ||
        !ownerCameraEffectsFit(input.effects, {
          ...input,
          frames: input.focus.frames,
          cameraTracks: tracks,
        })
      )
        throw Error("head_track_invalid");
      added.push(next);
      previous = next;
      if (next.outcome === "complete") complete++;
      else partial++;
    } catch {
      input.signal.throwIfAborted();
      failed++;
      previous = undefined;
    }
    finished += duration;
  }
  input.signal.throwIfAborted();
  input.progress({
    fraction: 1,
    index: plan.intervals.length,
    total: plan.intervals.length,
    personId: plan.intervals.at(-1)!.personId,
    presentationFrame:
      plan.intervals.at(-1)!.startFrame +
      (plan.intervals.at(-1)!.occurrence === "body" && input.hook
        ? input.hook.endFrame - input.hook.startFrame
        : 0),
  });
  return {
    tracks: [...input.tracks, ...added],
    complete,
    partial,
    failed,
    skipped: plan.skipped,
  };
}
