import {
  FIXED_COMPOSITION_POLICY as policy,
  type CompositionManifestV3,
  type TranscriptWord,
  compositionManifestV3Schema,
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
  critique?: (
    reason: "unsupported-caption-overlap" | "unsupported-caption-word",
  ) => void,
): CompositionManifestV3["captions"] {
  const groups: TranscriptWord[][] = [];
  const displayWords = (value: string) => value.split(/\s+/u).length;
  let longWord = false;
  for (const word of context.words) {
    if (displayWords(word.punctuatedText) > policy.captionWords)
      longWord = true;
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
    const startMs = Math.max(0, group[0]!.startMs - context.range.startMs);
    const endMs =
      Math.min(
        Math.max(...group.map((w) => w.endMs)),
        groups[i + 1]?.[0]?.startMs ?? context.range.endMs,
        context.range.endMs,
      ) - context.range.startMs;
    return {
      startMs,
      endMs,
      text,
      wordIds: group.map((w) => w.id),
      lines: lines(group),
      wordCues: group.map((word) => {
        const cue = {
          wordId: word.id,
          text: word.punctuatedText,
          startMs: Math.max(startMs, word.startMs - context.range.startMs),
          endMs: Math.min(endMs, word.endMs - context.range.startMs),
        };
        // Zero-length cues never highlight; original provider clocks remain.
        return cue;
      }),
    };
  });
  let previousEnd = 0;
  const displayable = captions
    .filter((caption) => {
      let previousCue = caption.startMs;
      const invalidCue = caption.wordCues.some((cue) => {
        const invalid = cue.endMs < cue.startMs || cue.startMs < previousCue;
        previousCue = cue.startMs;
        return invalid;
      });
      if (
        caption.endMs <= caption.startMs ||
        caption.startMs < previousEnd ||
        invalidCue
      )
        return false;
      previousEnd = caption.endMs;
      return true;
    })
    .slice(0, policy.maxCaptionGroups);
  if (longWord) critique?.("unsupported-caption-word");
  if (displayable.length !== captions.length)
    critique?.("unsupported-caption-overlap");
  const byId = new Map(context.words.map((word) => [word.id, word]));
  // Removed groups cannot shorten a surviving caption's grounded display clock.
  const retained = displayable.map((caption, index) => {
    const endMs = Math.min(
      Math.max(...caption.wordIds.map((id) => byId.get(id)!.endMs)) -
        context.range.startMs,
      displayable[index + 1]?.startMs ??
        context.range.endMs - context.range.startMs,
      context.range.endMs - context.range.startMs,
    );
    return {
      ...caption,
      endMs,
      wordCues: caption.wordCues.map((cue) => ({
        ...cue,
        endMs: Math.min(
          endMs,
          byId.get(cue.wordId)!.endMs - context.range.startMs,
        ),
      })),
    };
  });
  return compositionManifestV3Schema.shape.captions.parse(retained);
}
