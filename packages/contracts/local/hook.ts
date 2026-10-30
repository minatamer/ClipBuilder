import { z } from "zod";
import { OWNER_FPS, OWNER_LIMITS } from "./policy.ts";
import type { OwnerOverlay } from "./clips.ts";
import { OWNER_AI_HOOK_POLICY } from "./hook-sounds.ts";

export const OWNER_HOOK_MAX_FRAMES = 10 * OWNER_FPS;
export const OWNER_PRESENTATION_MAX_FRAMES =
  (OWNER_LIMITS.clipMs * OWNER_FPS) / 1000 + OWNER_HOOK_MAX_FRAMES;
export const ownerHookSchema = z
  .object({
    startFrame: z.number().int().nonnegative(),
    endFrame: z.number().int().positive(),
  })
  .strict()
  .refine(
    (h) =>
      h.endFrame > h.startFrame &&
      h.endFrame - h.startFrame <= OWNER_HOOK_MAX_FRAMES,
  );
export type OwnerHook = z.infer<typeof ownerHookSchema>;

/** Optional editorial advice cannot reject an otherwise usable plan. */
export function decodeOwnerHookSuggestion(
  value: unknown,
  frames: number,
): OwnerHook | undefined {
  const parsed = z
    .object({ startFrame: z.number().finite(), endFrame: z.number().finite() })
    .safeParse(value);
  if (!parsed.success || !Number.isSafeInteger(frames) || frames < 1)
    return undefined;
  // Do not relocate an opening excerpt to unrelated later speech.
  if (parsed.data.startFrame < OWNER_AI_HOOK_POLICY.earliestStartFrame)
    return undefined;
  const startFrame = Math.max(0, Math.round(parsed.data.startFrame)),
    endFrame = Math.min(
      frames,
      startFrame + OWNER_AI_HOOK_POLICY.maxFrames,
      Math.round(parsed.data.endFrame),
    );
  return endFrame > startFrame ? { startFrame, endFrame } : undefined;
}
type Clock = { frames: number; hook?: OwnerHook | undefined };
export function ownerHookFrames(value: Pick<Clock, "hook">) {
  return value.hook ? value.hook.endFrame - value.hook.startFrame : 0;
}
export function ownerPresentationFrames(value: Clock) {
  return value.frames + ownerHookFrames(value);
}
export function ownerSourceFrame(value: Pick<Clock, "hook">, frame: number) {
  const length = ownerHookFrames(value);
  return value.hook && frame < length
    ? value.hook.startFrame + frame
    : frame - length;
}
/** Inspector seeks target the intact body; hook playback has its own Preview action. */
export function ownerPresentationFrame(
  value: Pick<Clock, "hook">,
  sourceFrame: number,
) {
  return sourceFrame + ownerHookFrames(value);
}

/** Clip only the repeated occurrence; keep stable word IDs and source-relative clocks. */
export function ownerHookCaption(
  caption: OwnerOverlay["captions"][number] | undefined,
  hook: OwnerHook,
) {
  if (!caption) return undefined;
  const startMs = (hook.startFrame * 1000) / OWNER_FPS,
    endMs = (hook.endFrame * 1000) / OWNER_FPS;
  const first = caption.wordCues.findIndex(
    (w) => w.endMs > startMs && w.startMs < endMs,
  );
  if (first < 0) return undefined;
  const retained = caption.wordCues.filter(
    (w) => w.endMs > startMs && w.startMs < endMs,
  );
  const wordCues = retained.map((w) => ({
    ...w,
    startMs: Math.max(startMs, w.startMs),
    endMs: Math.min(endMs, w.endMs),
  }));
  const offset = caption.wordCues
    .slice(0, first)
    .reduce((n, w) => n + w.text.split(" ").length, 0);
  const tokens = wordCues.flatMap((w) => w.text.split(" "));
  const split =
    caption.lines.length === 1
      ? tokens.length
      : Math.max(0, caption.lines[0]!.split(" ").length - offset);
  return {
    ...caption,
    startMs: Math.max(caption.startMs, startMs),
    endMs: Math.min(caption.endMs, endMs),
    text: tokens.join(" "),
    lines: [
      tokens.slice(0, split).join(" "),
      tokens.slice(split).join(" "),
    ].filter(Boolean),
    wordIds: wordCues.map((w) => w.wordId),
    wordCues,
  };
}
