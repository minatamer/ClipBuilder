import type { z } from "zod";
import type { ownerClipPlanSchema } from "../../../packages/contracts/local/clips.ts";
import { OWNER_FPS } from "../../../packages/contracts/local/policy.ts";
import { ownerVisualClock } from "./gemini-critique.ts";
import { OWNER_BATCH_POLICY } from "../../../packages/contracts/local/clips.ts";
import { contextualPictureBriefSchema } from "@clipbuilder/contracts";
import { VISUAL_STORY_POLICY } from "../src/assembly/visual-story-policy.ts";
import { automaticPictureBriefFits } from "../src/assembly/automatic-picture-admission.ts";

const maxFrames = 5 * OWNER_FPS,
  coverageFrames = 30 * OWNER_FPS;

export function plannedVisualGuide(frames: number) {
  const portions = Math.max(1, Math.ceil(frames / coverageFrames));
  return {
    maximumCount: OWNER_BATCH_POLICY.automaticVisualsPerClip,
    windows: Array.from({ length: portions }, (_, index) => ({
      startFrame: index * coverageFrames,
      endFrame: Math.min(frames, (index + 1) * coverageFrames),
    })),
  };
}

/** Same editorial policy for the existing Gemini and Codex planning calls. */
export const PLANNED_VISUAL_POLICY = `OPTIONAL B-ROLL: Plan at most ${OWNER_BATCH_POLICY.automaticVisualsPerClip} compelling visual for the entire clip, or none. Generated and fetched imagery share this limit. Choose the strongest meaningful beat. The supplied visualCoverage windows help scout beats; they are not quotas. Leave the speaker visible when imagery adds little. PICTURE TIMING: Cite the actual words expressing the visible action/emotion or subject. Start near that beat and end when it changes. Prefer two to five seconds, at most ${maxFrames / OWNER_FPS} seconds per planned image. Never stretch relevance or add filler to meet coverage. These initial-planning limits do not clamp later manual edits. ${VISUAL_STORY_POLICY} SEARCH FALLBACKS: Up to two alternate briefs may vary angle or specificity but preserve the visible action/emotion and every essential requiredTerm. If no suitable scene is available, omit the image; do not replace it with an explanatory card.`;

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
  return plan
    .map((cue) => ({ ...cue, ...ownerVisualClock(cue, frames) }))
    .sort((a, b) => a.startFrame - b.startFrame)
    .flatMap((cue) => {
      if (
        !automaticPictureBriefFits({
          kind: "object",
          purpose: "b-roll",
          brief: cue.brief,
        })
      )
        return [];
      const startFrame = cue.startFrame,
        endFrame = Math.min(cue.endFrame, startFrame + maxFrames);
      // Do not move art beyond its original relevance window, generate an
      // invisible image, or fail/retry an otherwise usable clip.
      if (startFrame >= endFrame) return [];
      return [{ ...cue, startFrame, endFrame }];
    })
    .slice(0, OWNER_BATCH_POLICY.automaticVisualsPerClip);
}
