import { ownerFocusSchema, type OwnerFocus } from "./focus.ts";
import {
  OWNER_CAMERA_FOLLOW,
  ownerCameraTracksFit,
  ownerCameraTracksSchema,
  ownerHeadBoxSchema,
  type OwnerCameraTrack,
} from "./camera-follow.ts";
import {
  OWNER_CAMERA_MOTION,
  ownerCameraEffectEnd,
  ownerCameraEffectsFit,
  ownerCameraEffectsSchema,
  type OwnerCameraEffect,
} from "./camera-motion.ts";
import { ownerHookSchema, type OwnerHook } from "./hook.ts";

export type CameraFollowInput = {
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
}: CameraFollowInput): BulkHeadPlan {
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
