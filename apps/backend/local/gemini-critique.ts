import type { z } from "zod";
import type { ownerClipPlanSchema } from "../../../packages/contracts/local/clips.ts";
import { OWNER_FPS } from "../../../packages/contracts/local/policy.ts";
import type { OwnerWord } from "../../../packages/contracts/local/selection.ts";
import type { LocalDiagnostics } from "./diagnostics.ts";

export function critiqueOwnerVisualCue(
  cue: z.infer<typeof ownerClipPlanSchema>[number],
  words: readonly OwnerWord[],
  frames: number,
  diagnostics: LocalDiagnostics,
) {
  if (
    cue.startFrame < 0 ||
    cue.endFrame <= cue.startFrame ||
    cue.endFrame > frames ||
    !Number.isInteger(cue.startFrame) ||
    !Number.isInteger(cue.endFrame)
  )
    diagnostics.critique("visual_validate", "gemini_clock_converted");
  const byId = new Map(words.map((word) => [word.id, word]));
  if (
    !cue.evidenceWordIds.length ||
    new Set(cue.evidenceWordIds).size !== cue.evidenceWordIds.length ||
    cue.evidenceWordIds.some((id) => {
      const word = byId.get(id);
      return (
        !word ||
        word.endMs * OWNER_FPS <= cue.startFrame * 1000 ||
        word.startMs * OWNER_FPS >= cue.endFrame * 1000
      );
    })
  )
    diagnostics.critique("visual_validate", "gemini_evidence_critique");
}

/** Physical composition clock conversion, independent of editorial critique. */
export function ownerVisualClock(
  cue: { startFrame: number; endFrame: number },
  frames: number,
) {
  const startFrame = Math.max(
    0,
    Math.min(frames - 1, Math.round(Math.min(cue.startFrame, cue.endFrame))),
  );
  const endFrame = Math.max(
    startFrame + 1,
    Math.min(frames, Math.round(Math.max(cue.startFrame, cue.endFrame))),
  );
  return { startFrame, endFrame };
}
