import {
  FIXED_COMPOSITION_POLICY as policy,
  type CompositionManifestV2,
  type TranscriptWord,
  compositionManifestV2Schema,
} from "@clipbuilder/contracts";
import type { SpeakerPlanContext } from "./speaker-focus.js";

function lines(words: TranscriptWord[]): string[] {
  const text = words.map((w) => w.punctuatedText).join(" ");
  if (text.length <= policy.captionLineCharacters || words.length === 1)
    return [text];
  let best = 1,
    balance = Infinity;
  for (let i = 1; i < words.length; i++) {
    const left = words
        .slice(0, i)
        .map((w) => w.punctuatedText)
        .join(" "),
      right = words
        .slice(i)
        .map((w) => w.punctuatedText)
        .join(" ");
    const score = Math.max(left.length, right.length);
    if (score < balance) {
      balance = score;
      best = i;
    }
  }
  return [
    words
      .slice(0, best)
      .map((w) => w.punctuatedText)
      .join(" "),
    words
      .slice(best)
      .map((w) => w.punctuatedText)
      .join(" "),
  ];
}
// Display grouping only; provider words and clocks are never rewritten.
export function compileFixedCaptions(
  context: SpeakerPlanContext,
): CompositionManifestV2["captions"] {
  const groups: TranscriptWord[][] = [];
  const displayWords = (value: string) => value.split(/\s+/u).length;
  for (const word of context.words) {
    if (displayWords(word.punctuatedText) > policy.captionWords)
      throw new Error("unsupported-caption-word");
    const group = groups.at(-1),
      previous = group?.at(-1);
    if (
      !group ||
      !previous ||
      group.reduce((count, w) => count + displayWords(w.punctuatedText), 0) +
        displayWords(word.punctuatedText) >
        policy.captionWords ||
      previous.speakerId !== word.speakerId ||
      /[.!?;:]$/u.test(previous.punctuatedText) ||
      word.startMs - previous.endMs >= policy.captionPauseMs ||
      word.endMs - group[0]!.startMs > policy.captionGroupMs ||
      [...group, word].map((w) => w.punctuatedText).join(" ").length >
        policy.captionLineCharacters * 2
    )
      groups.push([word]);
    else group.push(word);
  }
  const captions = groups.map((group, i) => {
    const text = group.map((w) => w.punctuatedText).join(" ");
    const emphasis = text
      .split(" ")
      .findLastIndex((word) => /[\p{L}\p{N}]/u.test(word));
    return {
      startMs: Math.max(0, group[0]!.startMs - context.range.startMs),
      endMs:
        Math.min(
          Math.max(...group.map((w) => w.endMs)),
          groups[i + 1]?.[0]?.startMs ?? context.range.endMs,
          context.range.endMs,
        ) - context.range.startMs,
      text,
      wordIds: group.map((w) => w.id),
      lines: lines(group),
      ...(emphasis < 0 ? {} : { emphasisWordIndex: emphasis }),
    };
  });
  if (captions.some((caption) => caption.endMs <= caption.startMs))
    throw new Error("unsupported-caption-overlap");
  return compositionManifestV2Schema.shape.captions.parse(captions);
}
