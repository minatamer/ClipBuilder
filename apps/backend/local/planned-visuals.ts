import type { z } from "zod";
import type { ownerClipPlanSchema } from "../../../packages/contracts/local/clips.ts";
import { OWNER_FPS } from "../../../packages/contracts/local/policy.ts";
import { ownerVisualClock } from "./gemini-critique.ts";
import { OWNER_BATCH_POLICY } from "../../../packages/contracts/local/clips.ts";
import { contextualPictureBriefSchema } from "@clipbuilder/contracts";
import { VISUAL_STORY_POLICY } from "../src/assembly/visual-story-policy.ts";

const maxFrames = 5 * OWNER_FPS,
  gapFrames = 2 * OWNER_FPS,
  coverageFrames = 30 * OWNER_FPS;

export function plannedVisualGuide(frames: number) {
  const portions = Math.max(1, Math.ceil(frames / coverageFrames));
  return {
    minimumCount: Math.min(OWNER_BATCH_POLICY.imageAttemptsPerClip, portions),
    windows: Array.from({ length: portions }, (_, index) => ({
      startFrame: index * coverageFrames,
      endFrame: Math.min(frames, (index + 1) * coverageFrames),
    })),
  };
}

export function hasPlannedVisualCoverage(
  visuals: readonly { startFrame: number; endFrame: number }[],
  frames: number,
) {
  const { windows } = plannedVisualGuide(frames);
  return (
    visuals.length >= windows.length &&
    windows.every((window) =>
      visuals.some(
        (cue) =>
          cue.startFrame < window.endFrame && cue.endFrame > window.startFrame,
      ),
    )
  );
}

/** Same editorial policy for the existing Gemini and Codex planning calls. */
export const PLANNED_VISUAL_POLICY = `PICTURE COVERAGE: Plan at least one distinct useful visual per started thirty-second portion of the clip: one for up to 30 seconds, at least two for 31–60 seconds. Follow the supplied visualCoverage windows/minimumCount for manual and AI-selected clips alike. The existing maximum three images still applies, including legacy longer clips. Within each window choose the most meaningful concrete example, reveal or explanatory beat, not an arbitrary evenly spaced decoration. Do not omit useful explanation merely because a topic is technical. PICTURE TIMING: Cite the source words that the picture explains. Start on or just before the key spoken subject/action, using its supplied word timestamp; end when that idea is no longer being discussed. Prefer two to five seconds; each AI-planned picture lasts at most ${maxFrames / OWNER_FPS} seconds (${maxFrames} frames at ${OWNER_FPS}fps). Leave at least ${gapFrames / OWNER_FPS} seconds (${gapFrames} frames) with no picture between consecutive pictures. For a longer idea, choose a different explanatory detail of the same passage after that break, not a random different subject or a repeated image. Meet coverage inside the existing three-image budget. These limits apply only to your initial plan, not later manual edits. ${VISUAL_STORY_POLICY} SEARCH FALLBACKS: Up to two alternate briefs may vary the depiction, angle or specificity of the query, but MUST preserve the primary scene's meaning and every essential requiredTerm. Broaden the depiction, never replace the subject/concept. A miss must not be filled with unrelated stock art.`;

/** Retrieval may broaden depiction, never silently change the planned subject.
 * Raw returned plans remain intact; this only scopes optional public lookup. */
export function plannedVisualSearchBriefs(
  cue: z.infer<typeof ownerClipPlanSchema>[number],
) {
  const primary = cue.brief;
  const tokens = (value: string) =>
    value.toLocaleLowerCase("en-US").match(/[\p{L}\p{N}]+/gu) ?? [];
  const essential = primary.requiredTerms.flatMap(tokens);
  const searched = new Set<string>();
  return [
    primary,
    ...(cue.alternateBriefs ?? []).slice(
      0,
      OWNER_BATCH_POLICY.imageSearchAlternatives,
    ),
  ]
    .map((brief, index) => {
      if (index === 0) return primary;
      const queryTokens = new Set(tokens(brief.searchQuery));
      const searchQuery = essential.every((term) => queryTokens.has(term))
        ? brief.searchQuery
        : primary.requiredTerms.join(" ");
      const parsed = contextualPictureBriefSchema.safeParse({
        ...primary,
        searchQuery,
        avoidTerms: [
          ...new Set([...primary.avoidTerms, ...brief.avoidTerms]),
        ].slice(0, 6),
      });
      return parsed.success ? parsed.data : primary;
    })
    .filter((brief) => {
      const key = tokens(brief.searchQuery).join(" ");
      if (searched.has(key)) return false;
      searched.add(key);
      return true;
    });
}

/** Normalize fresh AI plans once, before image calls; never clamp user edits. */
export function timePlannedVisuals(
  plan: z.infer<typeof ownerClipPlanSchema>,
  frames: number,
): z.infer<typeof ownerClipPlanSchema> {
  let previousEnd = -gapFrames;
  return plan
    .map((cue) => ({ ...cue, ...ownerVisualClock(cue, frames) }))
    .sort((a, b) => a.startFrame - b.startFrame)
    .flatMap((cue) => {
      const startFrame = Math.max(cue.startFrame, previousEnd + gapFrames),
        endFrame = Math.min(cue.endFrame, startFrame + maxFrames);
      // Do not move art beyond its original relevance window, generate an
      // invisible image, or fail/retry an otherwise usable clip.
      if (startFrame >= endFrame) return [];
      previousEnd = endFrame;
      return [{ ...cue, startFrame, endFrame }];
    });
}
