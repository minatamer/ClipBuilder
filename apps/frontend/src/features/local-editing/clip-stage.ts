import type { OwnerClip } from "../../../../../packages/contracts/local/clips.ts";

/** Labels describe observed work boundaries; no simulated progress clock. */
export function clipStageLabel(
  clip: Pick<OwnerClip, "state" | "preparationStage">,
): string {
  if (clip.state === "preparing" && clip.preparationStage)
    return {
      speakers: "Preparing speakers",
      planning: "Planning edits",
      pictures: "Adding pictures",
      captions: "Adding captions",
      preview: "Preparing preview",
    }[clip.preparationStage];
  return {
    selected: "Selected",
    queued: "Queued",
    preparing: "Preparing clip",
    "review-ready": "Ready to edit",
    "validated-revision": "Edited",
    rendering: "Exporting clip",
    ready: "Ready",
    canceling: "Canceling",
    canceled: "Canceled",
    failed: "Failed",
  }[clip.state];
}
