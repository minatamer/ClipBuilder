import type { OwnerOverlay } from "../../../../../packages/contracts/local/clips.ts";
import type { OwnerEditOccurrence } from "../../../../../packages/contracts/local/hook-content.ts";
import {
  ownerHookFrames,
  ownerSourceFrame,
} from "../../../../../packages/contracts/local/hook.ts";

export type MediaCameraInspection = {
  cueId: string;
  occurrence: OwnerEditOccurrence;
  endpoint: "start" | "end";
};

/** Paint a chosen camera crop without changing persisted animation or clocks. */
export function mediaCameraInspectionOverlay(
  overlay: OwnerOverlay,
  inspection: MediaCameraInspection | null | undefined,
  presentationFrame: number,
): OwnerOverlay {
  if (!inspection) return overlay;
  const occurrence =
    overlay.hook && presentationFrame < ownerHookFrames(overlay)
      ? "hook"
      : "body";
  if (inspection.occurrence !== occurrence) return overlay;
  const content =
    occurrence === "hook" ? (overlay.hookContent ?? overlay) : overlay;
  const frame = ownerSourceFrame(overlay, presentationFrame);
  const cue = content.visuals.find((item) => item.id === inspection.cueId);
  if (!cue?.effect || frame < cue.startFrame || frame >= cue.endFrame)
    return overlay;
  const effect = cue.effect;
  const start = inspection.endpoint === "start";
  const x = start ? effect.fromX : effect.toX;
  const y = start ? effect.fromY : effect.toY;
  const visuals = content.visuals.map((item) =>
    item !== cue
      ? item
      : {
          ...item,
          tracking: undefined,
          entrance: "none" as const,
          exit: "none" as const,
          effect: {
            ...effect,
            zoom: start ? 1 : effect.zoom,
            fromX: x,
            fromY: y,
            toX: x,
            toY: y,
            progressStart: 1,
            progressEnd: 1,
          },
        },
  );
  return occurrence === "hook" && overlay.hookContent
    ? { ...overlay, hookContent: { ...overlay.hookContent, visuals } }
    : { ...overlay, visuals };
}
