import { z } from "zod";
import { OWNER_FPS, OWNER_LIMITS } from "./policy.ts";
import { OWNER_HOOK_MAX_FRAMES, type OwnerHook } from "./hook.ts";
import type { OwnerVisualEdit } from "./assets.ts";

export type OwnerVisualTiming = Pick<
  OwnerVisualEdit,
  "id" | "startFrame" | "endFrame" | "entrance" | "exit" | "animationFrames"
>;
const clipFrames = (OWNER_LIMITS.clipMs * OWNER_FPS) / 1000;
/** A bounded raster branch, expressed in the source's logical frame clock. */
export const ownerOverlayClockSchema = z
  .object({
    hook: z.boolean(),
    sourceStartFrame: z.number().finite().nonnegative().max(clipFrames),
    sourceEndFrame: z
      .number()
      .finite()
      .positive()
      .max(clipFrames + 3),
    frames: z
      .number()
      .int()
      .positive()
      .max(clipFrames + OWNER_HOOK_MAX_FRAMES + 3),
  })
  .strict()
  .refine(
    (clock) =>
      clock.sourceEndFrame > clock.sourceStartFrame &&
      clock.frames <= (clock.hook ? OWNER_HOOK_MAX_FRAMES + 3 : clipFrames),
  );
export type OwnerOverlayClock = z.infer<typeof ownerOverlayClockSchema>;
export type OwnerPlaybackClock = {
  hookSeconds: number;
  bodySeconds: number;
  hookSourceSeconds?: number;
  fps?: number;
};
function animationSpan(cue: OwnerVisualTiming) {
  return Math.min(
    cue.animationFrames ?? 9,
    Math.floor((cue.endFrame - cue.startFrame - 1) / 2),
  );
}
/** Frame-only motion, also used to determine when a visual is actually visible. */
export function ownerVisualMotion(cue: OwnerVisualTiming, frame: number) {
  const span = animationSpan(cue);
  const phase = (distance: number) =>
    span > 0 ? Math.max(0, Math.min(1, distance / span)) : 1;
  const enter = phase(frame - cue.startFrame),
    leave = phase(cue.endFrame - 1 - frame);
  const entrance = cue.entrance ?? "none",
    exit = cue.exit ?? "none";
  const opacity =
    (entrance === "none" ? 1 : enter) * (exit === "none" ? 1 : leave);
  const scale =
    (entrance === "pop" ? 0.7 + 0.3 * enter : 1) *
    (exit === "pop" ? 0.7 + 0.3 * leave : 1);
  const y =
    (entrance === "slide" ? 64 * (1 - enter) : 0) -
    (exit === "slide" ? 64 * (1 - leave) : 0);
  return { opacity, transform: `translateY(${y}px) scale(${scale})` };
}
/** First visible frame of each Hook/body appearance, using the raster cadence.
 * Native fps round=up samples raster floor(outputFrame * 30 / fps). */
export function ownerVisualOccurrences(
  visual: OwnerVisualTiming,
  frames: number,
  hook?: OwnerHook,
  clock?: OwnerPlaybackClock,
): { start: number; end: number }[] {
  const fps = clock?.fps ?? OWNER_FPS;
  const prefix =
    clock?.hookSeconds ??
    (hook ? (hook.endFrame - hook.startFrame) / OWNER_FPS : 0);
  const body = clock?.bodySeconds ?? frames / OWNER_FPS;
  const hookStart =
    clock?.hookSourceSeconds ?? (hook?.startFrame ?? 0) / OWNER_FPS;
  const animated = animationSpan(visual) > 0;
  const strictStart = animated && (visual.entrance ?? "none") !== "none";
  const upper =
    visual.endFrame - (animated && (visual.exit ?? "none") !== "none" ? 1 : 0);
  const parts = [
    ...(hook && prefix > 0
      ? [{ start: 0, duration: prefix, source: hookStart * OWNER_FPS }]
      : []),
    { start: prefix, duration: body, source: 0 },
  ];
  return parts.flatMap((part) => {
    const difference = visual.startFrame - part.source;
    const firstRaster = Math.max(
      0,
      strictStart
        ? Math.floor(difference + 1e-9) + 1
        : Math.ceil(difference - 1e-9),
    );
    const pastRaster = Math.ceil(upper - part.source - 1e-9);
    const first = Math.max(
      0,
      Math.ceil((firstRaster * fps) / OWNER_FPS - 1e-9),
    );
    const past = Math.min(
      Math.round(part.duration * fps),
      Math.ceil((pastRaster * fps) / OWNER_FPS - 1e-9),
    );
    return first < past
      ? [{ start: part.start + first / fps, end: part.start + past / fps }]
      : [];
  });
}
