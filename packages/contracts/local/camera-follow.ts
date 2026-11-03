import { z } from "zod";
import { normalizedBoxSchema } from "@clipbuilder/contracts";
import { OWNER_FPS, OWNER_LIMITS, ownerIdSchema } from "./policy.ts";
import { ownerHookFrames, type OwnerHook } from "./hook.ts";
import {
  ownerFocusAt,
  ownerFocusCrop,
  ownerPersonIdSchema,
  type OwnerFocus,
} from "./focus.ts";

export const OWNER_CAMERA_FOLLOW = {
  tracks: 20,
  frames: 30 * OWNER_FPS,
  sampleFrames: 2,
  samples: 451,
  edgeFrames: 3,
} as const;
export const ownerHeadBoxSchema = normalizedBoxSchema.refine(
  (box) =>
    box.width >= 0.02 &&
    box.height >= 0.02 &&
    box.width <= 0.7 &&
    box.height <= 0.7 &&
    box.x + box.width <= 1 &&
    box.y + box.height <= 1,
);
const point = z.number().finite().min(0).max(1);
const frame = z
  .number()
  .int()
  .nonnegative()
  .max((OWNER_LIMITS.clipMs * OWNER_FPS) / 1000);
export const ownerCameraTrackSchema = z
  .object({
    id: ownerIdSchema,
    continues: ownerIdSchema.optional(),
    occurrence: z.enum(["hook", "body"]),
    personId: ownerPersonIdSchema.nullable(),
    startFrame: frame,
    endFrame: frame,
    sourceStartFrame: frame,
    focusKey: z.string().min(1).max(12000),
    seed: ownerHeadBoxSchema,
    outcome: z.enum(["complete", "lost"]),
    points: z
      .array(
        z
          .object({
            frame: z
              .number()
              .int()
              .nonnegative()
              .max(OWNER_CAMERA_FOLLOW.frames - 1),
            x: point,
            y: point,
          })
          .strict(),
      )
      .min(2)
      .max(OWNER_CAMERA_FOLLOW.samples),
  })
  .strict()
  .superRefine((track, ctx) => {
    const duration = track.endFrame - track.startFrame;
    if (
      duration < 6 ||
      duration > OWNER_CAMERA_FOLLOW.frames ||
      track.points[0]?.frame !== 0 ||
      Math.abs(
        (track.points[0]?.x ?? -1) - track.seed.x - track.seed.width / 2,
      ) > 0.000002 ||
      Math.abs(
        (track.points[0]?.y ?? -1) - track.seed.y - track.seed.height / 2,
      ) > 0.000002 ||
      track.points.at(-1)?.frame !== duration - 1 ||
      track.points.some(
        (p, i) =>
          i > 0 &&
          (p.frame <= track.points[i - 1]!.frame ||
            p.frame - track.points[i - 1]!.frame >
              OWNER_CAMERA_FOLLOW.sampleFrames),
      )
    )
      ctx.addIssue({
        code: "custom",
        message: "Invalid camera motion coverage.",
      });
  });
export type OwnerCameraTrack = z.infer<typeof ownerCameraTrackSchema>;
export const ownerCameraTracksSchema = z
  .array(ownerCameraTrackSchema)
  .max(OWNER_CAMERA_FOLLOW.tracks)
  .refine(
    (tracks) =>
      new Set(tracks.map((t) => t.id)).size === tracks.length &&
      tracks.every((t, i) =>
        tracks.every(
          (other, j) =>
            i === j ||
            t.occurrence !== other.occurrence ||
            t.endFrame <= other.startFrame ||
            other.endFrame <= t.startFrame,
        ),
      ) &&
      tracks.every(
        (t) =>
          !t.continues ||
          tracks.some(
            (previous) =>
              previous.id === t.continues &&
              previous.outcome === "complete" &&
              previous.personId === t.personId &&
              previous.occurrence === t.occurrence &&
              previous.focusKey === t.focusKey &&
              previous.endFrame === t.startFrame &&
              previous.sourceStartFrame +
                previous.endFrame -
                previous.startFrame ===
                t.sourceStartFrame,
          ),
      ),
    { message: "Motion intervals cannot overlap." },
  );

/** Exact numeric binding, independent of observations/provider descriptions. */
export function ownerCameraFollowKey(
  focus: OwnerFocus,
  personId: string | null,
) {
  return JSON.stringify([
    focus.source.width,
    focus.source.height,
    focus.frames,
    focus.shots
      .filter((s) => s.personId === personId)
      .map((s) => [
        s.startFrame,
        s.endFrame,
        s.personId,
        s.centerX,
        s.centerY,
        s.zoom,
      ]),
  ]);
}
export function ownerCameraTracksFit(
  tracks: readonly OwnerCameraTrack[],
  focus: OwnerFocus | undefined,
  clock: { frames: number; hook?: OwnerHook | undefined },
) {
  if (!tracks.length) return true;
  if (!focus) return false;
  return tracks.every(
    (t) =>
      t.focusKey === ownerCameraFollowKey(focus, t.personId) &&
      focus.shots.some((s) => s.personId === t.personId) &&
      t.endFrame <=
        (t.occurrence === "hook" ? ownerHookFrames(clock) : clock.frames) &&
      t.sourceStartFrame ===
        t.startFrame +
          (t.occurrence === "hook" ? (clock.hook?.startFrame ?? 0) : 0) &&
      (!t.continues ||
        (t.sourceStartFrame > 0 &&
          ownerFocusAt(focus, t.sourceStartFrame - 1) ===
            ownerFocusAt(focus, t.sourceStartFrame) &&
          ownerFocusAt(focus, t.sourceStartFrame).personId === t.personId)),
  );
}

/** Explicit removal/replacement starts followers afresh without dangling links. */
export function ownerCameraWithoutTrack(
  tracks: readonly OwnerCameraTrack[],
  id: string,
) {
  return tracks
    .filter((track) => track.id !== id)
    .map((track) => {
      if (track.continues !== id) return track;
      const next = { ...track };
      delete next.continues;
      return next;
    });
}

/** Saved paths preserve zoom, initial head height and hard cuts to other people. */
export function ownerCameraFollowCrop(
  focus: OwnerFocus,
  tracks: readonly OwnerCameraTrack[],
  sourceFrame: number,
  occurrence: "hook" | "body",
  occurrenceFrame: number,
) {
  const shot = ownerFocusAt(focus, sourceFrame),
    baseline = ownerFocusCrop(focus, shot);
  const track = tracks.find(
    (t) =>
      t.occurrence === occurrence &&
      t.personId === shot.personId &&
      occurrenceFrame >= t.startFrame &&
      occurrenceFrame < t.endFrame,
  );
  if (!track) return baseline;
  let first = track;
  for (let i = 0; i < tracks.length && first.continues; i++) {
    const previous = tracks.find((t) => t.id === first.continues);
    if (!previous) break;
    first = previous;
  }
  const continues = tracks.some((t) => t.continues === track.id);
  const at = occurrenceFrame - track.startFrame;
  let right = 1;
  while (right < track.points.length - 1 && track.points[right]!.frame < at)
    right++;
  const a = track.points[right - 1]!,
    b = track.points[right]!;
  const p = Math.max(0, Math.min(1, (at - a.frame) / (b.frame - a.frame)));
  const target = ownerFocusCrop(focus, {
    ...shot,
    centerX: a.x + (b.x - a.x) * p,
    centerY: Math.max(
      0,
      Math.min(
        1,
        shot.centerY +
          a.y +
          (b.y - a.y) * p -
          (first.seed.y + first.seed.height / 2),
      ),
    ),
  });
  const edge = Math.max(
    0,
    Math.min(
      1,
      track.continues ? 1 : at / OWNER_CAMERA_FOLLOW.edgeFrames,
      continues
        ? 1
        : (track.endFrame - track.startFrame - 1 - at) /
            OWNER_CAMERA_FOLLOW.edgeFrames,
    ),
  );
  const blend = edge * edge * (3 - 2 * edge);
  return {
    x: baseline.x + (target.x - baseline.x) * blend,
    y: baseline.y + (target.y - baseline.y) * blend,
    width: baseline.width,
    height: baseline.height,
  };
}
