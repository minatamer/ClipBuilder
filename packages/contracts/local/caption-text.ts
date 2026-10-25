import type { OwnerOverlay } from "./clips.ts";
import type { OwnerEditDocument } from "./editor.ts";

/** Text-only corrections: cue IDs, order and every clock remain unchanged. */
export function correctedOwnerCaptions(
  captions: OwnerOverlay["captions"],
  edits: OwnerEditDocument["captionText"],
): OwnerOverlay["captions"] {
  if (!edits?.length) return captions;
  const known = new Set(
    captions.flatMap((c) => c.wordCues.map((w) => w.wordId)),
  );
  if (edits.some((w) => !known.has(w.wordId)))
    throw new Error("unknown_caption_word");
  const replacements = new Map(edits.map((w) => [w.wordId, w.text]));
  return captions.map((caption) => {
    const wordCues = caption.wordCues.map((word) => ({
      ...word,
      text: replacements.get(word.wordId) ?? word.text,
    }));
    const text = wordCues.map((w) => w.text).join(" ");
    // Preserve the existing line's word partition, including punctuation.
    const firstCount =
      caption.lines.length > 1
        ? caption.lines[0]!.split(/\s+/u).length
        : wordCues.length;
    const lines = [
      wordCues
        .slice(0, firstCount)
        .map((w) => w.text)
        .join(" "),
      wordCues
        .slice(firstCount)
        .map((w) => w.text)
        .join(" "),
    ].filter(Boolean);
    return { ...caption, text, lines, wordCues };
  });
}
