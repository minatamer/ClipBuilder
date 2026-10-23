import type { OwnerVisualEdit } from "../../contracts/local/assets.ts";

/** Deterministic frame-only entry/exit; very short cues remain visible. */
export function ownerVisualMotion(cue: OwnerVisualEdit, frame: number) {
  const span = Math.min(
    cue.animationFrames ?? 9,
    Math.floor((cue.endFrame - cue.startFrame - 1) / 2),
  );
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
