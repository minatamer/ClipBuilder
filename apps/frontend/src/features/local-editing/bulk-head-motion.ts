import {
  ownerFocusSchema,
  type OwnerFocus,
} from "../../../../../packages/contracts/local/focus.ts";
import {
  OWNER_CAMERA_FOLLOW,
  ownerCameraFollowKey,
  ownerCameraTracksFit,
  ownerCameraTracksSchema,
  ownerCameraTrackSchema,
  ownerHeadBoxSchema,
  type OwnerCameraTrack,
} from "../../../../../packages/contracts/local/camera-follow.ts";
import {
  OWNER_CAMERA_MOTION,
  ownerCameraEffectEnd,
  ownerCameraEffectsFit,
  ownerCameraEffectsSchema,
  type OwnerCameraEffect,
} from "../../../../../packages/contracts/local/camera-motion.ts";
import {
  ownerHookSchema,
  type OwnerHook,
} from "../../../../../packages/contracts/local/hook.ts";
import type { HeadBox } from "./head-pixel-tracker";
import { trackHeadVideo } from "./track-head-video";

type Input = {
  focus: OwnerFocus;
  tracks: OwnerCameraTrack[];
  effects: OwnerCameraEffect[];
  hook: OwnerHook | undefined;
};
type Interval = Pick<
  OwnerCameraTrack,
  | "occurrence"
  | "personId"
  | "startFrame"
  | "endFrame"
  | "sourceStartFrame"
  | "seed"
> & { shot: number; continuation: boolean };
export type BulkHeadPlan = {
  intervals: Interval[];
  skipped: { custom: number; unseeded: number; short: number; covered: number };
  blocked: "invalid" | "capacity" | null;
};

/** Plan before decoding; never truncate, overwrite existing work or guess a head. */
export function planBulkHeadMotion({
  focus,
  tracks,
  effects,
  hook,
}: Input): BulkHeadPlan {
  const plan: BulkHeadPlan = {
    intervals: [],
    skipped: { custom: 0, unseeded: 0, short: 0, covered: 0 },
    blocked: null,
  };
  const clock = { frames: focus.frames, hook, cameraTracks: tracks };
  if (
    !ownerFocusSchema.safeParse(focus).success ||
    (hook && !ownerHookSchema.safeParse(hook).success) ||
    (hook && hook.endFrame > focus.frames) ||
    !ownerCameraTracksSchema.safeParse(tracks).success ||
    !ownerCameraTracksFit(tracks, focus, clock) ||
    !ownerCameraEffectsSchema.safeParse(effects).success ||
    !ownerCameraEffectsFit(effects, clock)
  )
    return { ...plan, blocked: "invalid" };
  const occurrences = [
    ...(hook
      ? [
          {
            occurrence: "hook" as const,
            start: hook.startFrame,
            end: hook.endFrame,
          },
        ]
      : []),
    { occurrence: "body" as const, start: 0, end: focus.frames },
  ];
  for (const window of occurrences) {
    const blockers = [
      ...tracks
        .filter((t) => t.occurrence === window.occurrence)
        .map((t) => [t.startFrame, t.endFrame] as const),
      ...effects
        .filter((e) => e.occurrence === window.occurrence)
        .map(
          (e) =>
            [
              e.startFrame,
              ownerCameraEffectEnd(e) + OWNER_CAMERA_MOTION.settleFrames,
            ] as const,
        ),
    ].sort((a, b) => a[0] - b[0]);
    for (const [shotIndex, shot] of focus.shots.entries()) {
      const from = Math.max(window.start, shot.startFrame),
        to = Math.min(window.end, shot.endFrame);
      if (to <= from) continue;
      let ranges: [number, number][] = [
        [from - window.start, to - window.start],
      ];
      for (const [left, right] of blockers)
        ranges = ranges.flatMap(([start, end]) => {
          if (right <= start || left >= end) return [[start, end]];
          plan.skipped.covered++;
          return [
            ...(start < left ? [[start, left] as [number, number]] : []),
            ...(right < end ? [[right, end] as [number, number]] : []),
          ];
        });
      const person = focus.people.find((p) => p.id === shot.personId);
      for (const [start, end] of ranges) {
        if (!person) {
          plan.skipped.custom++;
          continue;
        }
        if (end - start < 6) {
          plan.skipped.short++;
          continue;
        }
        let cursor = start,
          previous: Interval | undefined;
        while (cursor < end) {
          const sourceStartFrame = cursor + window.start;
          const observation = person.observations
            .filter(
              (o) =>
                o.startFrame <= sourceStartFrame &&
                o.endFrame > sourceStartFrame,
            )
            .sort((a, b) => b.startFrame - a.startFrame)[0];
          const seed = observation?.box ?? previous?.seed;
          if (!seed || !ownerHeadBoxSchema.safeParse(seed).success) {
            plan.skipped.unseeded++;
            break;
          }
          let duration = Math.min(OWNER_CAMERA_FOLLOW.frames, end - cursor);
          const tail = end - cursor - duration;
          if (tail > 0 && tail < 6) duration -= 6 - tail;
          const interval: Interval = {
            occurrence: window.occurrence,
            personId: person.id,
            startFrame: cursor,
            endFrame: cursor + duration,
            sourceStartFrame,
            seed: { ...seed },
            shot: shotIndex,
            continuation: previous !== undefined,
          };
          plan.intervals.push(interval);
          previous = interval;
          cursor += duration;
        }
      }
    }
  }
  if (tracks.length + plan.intervals.length > OWNER_CAMERA_FOLLOW.tracks)
    plan.blocked = "capacity";
  return plan;
}

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
