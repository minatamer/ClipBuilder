import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  ownerTextLayerSchema,
  ownerPlannedTextSchema,
  OWNER_PLANNED_TEXT_LIMIT,
  ownerClipTitleSchema,
  type OwnerTextLayer,
} from "../../../packages/contracts/local/text-layers.ts";
import { OWNER_TITLE_TREATMENT_STYLES } from "../../../packages/contracts/local/text-style.ts";
import {
  OWNER_TITLE_TREATMENTS,
  resolveOwnerTitleEmphasis,
} from "../../../packages/contracts/local/text-ranges.ts";
import { OWNER_FPS } from "../../../packages/contracts/local/policy.ts";
import type { OwnerWord } from "../../../packages/contracts/local/selection.ts";

const BASE_TEXT_POLICY =
  "TEXT: Write zero or one compelling opening title, not a copied transcript fragment or repeated captions. First choose the optional hookSuggestion in this same response, then write the title inspired by that excerpt's central idea, question or surprise and the clip's actual payoff. The title is a textual hook accompanying the opening excerpt, not a headline saved for the body afterward. If no useful Hook exists, use the clip's opening idea and payoff. In each texts item return title (your newly authored plain-text headline, at most 80 characters, preferably 6–12 punchy words), hookStyle, wordIds as supporting source evidence, startFrame 0 and endFrame. Internally consider these nine approaches and choose the ONE strongest accurate fit for this clip: pov (POV: a relatable source-grounded situation); curiosity-gap (a specific intriguing unanswered why/how); surprising-reveal (a concrete surprising payoff, YOU WON’T BELIEVE only when the source earns that energy); myth-bust (a supported counterintuitive correction); pointed-question (the question this clip answers); challenge (a source-supported assumption to reconsider); pain-to-payoff (a recognizable problem and useful solution); before-after (a transformation actually discussed); useful-promise (a specific takeaway or numbered list ONLY if the source delivers that exact number of points). Rank for curiosity, specificity, emotional relevance, readable brevity and payoff in the actual clip; do not pick a random style or emit multiple alternatives. Be lively, direct and genuinely relevant; avoid vague generic hype or a dry technical sentence fragment. You may paraphrase creatively; title words do NOT need to be spoken verbatim. Never fabricate quotations, statistics, outcomes or personal experiences, attribute invented speech, or promise guaranteed virality. Use the source language. Return texts [] only if no useful title fits. Always display the title at the first presented frame, including a prepended Hook; never restart it when the body begins. Reading time: about three words or fifteen non-space characters per second plus 0.75 seconds, 2–8 seconds capped by clip length. Title times are presentation-relative 30fps frames; source evidence and other plans retain clip-relative clocks. Later manual edits remain unrestricted.";
export const PLANNED_TEXT_POLICY =
  BASE_TEXT_POLICY +
  " VISUAL TITLE STYLING: Optionally return treatment: bold-hook (white bold sans with black outline, default), impact (heavy 900 sans, strong outline), editorial (Georgia serif on quiet translucent dark backdrop), or highlight-panel (dark sans on a continuous light panel). Return emphasis: one or two exact meaningful substrings of your FINAL authored title, each with text, occurrence (zero-based non-overlapping occurrence index), and style. Emphasize the central hook concept, never random words; prefer bright red #FF3B30 with readable white surrounding copy. Allowed character fields: color/outlineColor/highlightColor (#RRGGBB, safe accents #FF3B30 red, #FFD60A yellow, #64D2FF cyan), font (Arial, Verdana, Georgia, Courier New), fontSize (integer 24–120), fontWeight (400/600/700/800/900), outlineWidth (integer 0–12). Omit unchanged fields. Prefer at most two subtle overrides per phrase. No markup, CSS, URLs or additional inference. These visual treatments are separate from editorial hookStyle. Example: title Why buyers wait, emphasis [{text: buyers, occurrence: 0, style: {color: #FF3B30, fontWeight: 900}}].";
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
      const treatment = z
        .object({ treatment: z.enum(OWNER_TITLE_TREATMENTS) })
        .safeParse(item);
      const emphasis = z.object({ emphasis: z.unknown() }).safeParse(item);
      const spans = resolveOwnerTitleEmphasis(
        text,
        emphasis.success ? emphasis.data.emphasis : undefined,
      );
      const layer = ownerTextLayerSchema.safeParse({
        id: randomUUID(),
        text,
        ...(spans.length ? { spans } : {}),
        role: "opening-title",
        startFrame: 0,
        endFrame,
        style: {
          ...OWNER_TITLE_TREATMENT_STYLES[
            treatment.success ? treatment.data.treatment : "bold-hook"
          ],
          box: { x: 0.08, y: 0.08, width: 0.84, height: 0.18 },
        },
      });
      return layer.success ? [layer.data] : [];
    })
    .slice(0, 1);
}
