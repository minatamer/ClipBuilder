import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  ownerTextLayerSchema,
  ownerPlannedTextSchema,
  OWNER_PLANNED_TEXT_LIMIT,
  ownerClipTitleSchema,
  type OwnerTextLayer,
} from "../../../packages/contracts/local/text-layers.ts";
import { OWNER_SOCIAL_TEXT_PRESETS } from "../../../packages/contracts/local/text-style.ts";
import { OWNER_FPS } from "../../../packages/contracts/local/policy.ts";
import type { OwnerWord } from "../../../packages/contracts/local/selection.ts";

export const PLANNED_TEXT_POLICY =
  "TEXT: Write zero or one compelling opening title, not a copied transcript fragment or repeated captions. In each texts item return title (your newly authored plain-text headline, at most 80 characters, preferably 6–12 punchy words), hookStyle, wordIds as supporting source evidence, startFrame 0 and endFrame. Internally consider these nine approaches and choose the ONE strongest accurate fit for this clip: pov (POV: a relatable source-grounded situation); curiosity-gap (a specific intriguing unanswered why/how); surprising-reveal (a concrete surprising payoff, YOU WON’T BELIEVE only when the source earns that energy); myth-bust (a supported counterintuitive correction); pointed-question (the question this clip answers); challenge (a source-supported assumption to reconsider); pain-to-payoff (a recognizable problem and useful solution); before-after (a transformation actually discussed); useful-promise (a specific takeaway or numbered list ONLY if the source delivers that exact number of points). Rank for curiosity, specificity, emotional relevance, readable brevity and payoff in the actual clip; do not pick a random style or emit multiple alternatives. Be lively, direct and genuinely relevant; avoid vague generic hype or a dry technical sentence fragment. You may paraphrase creatively; title words do NOT need to be spoken verbatim. Never fabricate quotations, statistics, outcomes or personal experiences, attribute invented speech, or promise guaranteed virality. Use the source language. Return texts [] only if no useful title fits. Always display the title at the start, never later emphasis. Reading time: about three words or fifteen non-space characters per second plus 0.75 seconds, 2–8 seconds capped by clip length. Times are clip-relative 30fps frames; later manual edits remain unrestricted.";
export function decodePlannedText(
  value: unknown,
  words: readonly OwnerWord[],
  frames: number,
  onEvidenceIssue?: () => void,
): OwnerTextLayer[] {
  const envelope = z.object({ texts: z.array(z.unknown()) }).safeParse(value);
  if (!envelope.success) return [];
  const byId = new Map(words.map((word, index) => [word.id, { word, index }]));
  return envelope.data.texts
    .slice(0, OWNER_PLANNED_TEXT_LIMIT)
    .flatMap((item) => {
      const cue = ownerPlannedTextSchema.element
        .omit({ title: true, hookStyle: true })
        .strip()
        .safeParse(item);
      const authored = z
        .object({ title: ownerClipTitleSchema })
        .safeParse(item);
      if ((!cue.success && !authored.success) || frames < 1) return [];
      if (
        authored.success &&
        (!cue.success || cue.data.wordIds.some((id) => !byId.has(id)))
      )
        onEvidenceIssue?.();
      const selected = (cue.success ? cue.data.wordIds : [])
        .flatMap((id) => (byId.has(id) ? [byId.get(id)!] : []))
        .sort((a, b) => a.index - b.index);
      const text = authored.success
        ? authored.data.title
        : [
            ...new Map(
              selected.map((value) => [
                value.word.id,
                value.word.punctuatedText,
              ]),
            ).values(),
          ].join(" ");
      const readingSeconds =
        Math.max(
          text.split(/\s+/u).length / 3,
          Array.from(text.replace(/\s/gu, "")).length / 15,
        ) + 0.75;
      const endFrame = Math.min(
        frames,
        Math.ceil(Math.max(2, Math.min(8, readingSeconds)) * OWNER_FPS),
      );
      const layer = ownerTextLayerSchema.safeParse({
        id: randomUUID(),
        text,
        startFrame: 0,
        endFrame,
        style: {
          ...OWNER_SOCIAL_TEXT_PRESETS.tiktok,
          fontSize: 72,
          box: { x: 0.08, y: 0.08, width: 0.84, height: 0.18 },
        },
      });
      return layer.success ? [layer.data] : [];
    })
    .slice(0, 1);
}
