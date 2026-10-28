import { z } from "zod";
import { speakerIdSchema } from "../src/ids.schema.ts";
import { ownerTextBackground } from "./text-style.ts";
import type { OwnerCaptionStyle } from "./editor.ts";
import type { OwnerOverlay } from "./clips.ts";
import type { OwnerWord } from "./selection.ts";

const color = z.string().regex(/^#[a-fA-F0-9]{6}$/);
export const ownerSpeakerColorSchema = z
  .object({
    speakerId: speakerIdSchema,
    color,
    backgroundColor: color,
    highlight: color,
  })
  .strict();
export const ownerCaptionSpeakersSchema = z
  .object({
    enabled: z.boolean(),
    colors: z.array(ownerSpeakerColorSchema).max(32),
    assignments: z
      .array(
        z
          .object({
            wordId: z.string().min(1).max(64),
            speakerId: speakerIdSchema.nullable(),
          })
          .strict(),
      )
      .max(12000),
  })
  .strict()
  .refine(
    (value) =>
      new Set(value.colors.map((c) => c.speakerId)).size ===
        value.colors.length &&
      new Set(value.assignments.map((w) => w.wordId)).size ===
        value.assignments.length,
  );
export type OwnerCaptionSpeakers = z.infer<typeof ownerCaptionSpeakersSchema>;
export type OwnerSpeakerColor = z.infer<typeof ownerSpeakerColorSchema>;

export function resolveCaptionSpeakers(
  captions: OwnerOverlay["captions"],
  words: readonly OwnerWord[],
  edits?: OwnerCaptionSpeakers,
): OwnerCaptionSpeakers {
  const ids = new Set(captions.flatMap((c) => c.wordCues.map((w) => w.wordId)));
  if (edits?.assignments.some((w) => !ids.has(w.wordId)))
    throw new Error("unknown_caption_word");
  const original = new Map(words.map((w) => [w.id, w.speakerId]));
  const overrides = new Map(
    edits?.assignments.map((w) => [w.wordId, w.speakerId]),
  );
  const assignments = [...ids].map((wordId) => ({
    wordId,
    speakerId: overrides.has(wordId)
      ? overrides.get(wordId)!
      : (original.get(wordId) ?? null),
  }));
  return {
    enabled:
      edits?.enabled ??
      new Set(assignments.map((w) => w.speakerId).filter(Boolean)).size > 1,
    colors: edits?.colors ?? [],
    assignments,
  };
}

export function defaultSpeakerColor(
  speakerId: string,
  style: OwnerCaptionStyle,
): OwnerSpeakerColor {
  const palette = [
    "#74b9ff",
    "#ffb86c",
    "#68e5bd",
    "#d8a0ff",
    "#ff83ad",
    "#f4df78",
    "#66d9e8",
    "#b8e56b",
    "#b6c5ff",
    "#ff9f9f",
    "#b2df8a",
    "#e6b5ff",
    "#ffa3dd",
    "#e5c98a",
    "#94ded5",
    "#d5e58b",
  ];
  const index = Number(speakerId.slice(4)) || 0;
  const accent = palette[index % palette.length]!;
  return {
    speakerId,
    color: ownerTextBackground(style).opacity > 0 ? "#101827" : accent,
    backgroundColor: accent,
    highlight: accent,
  };
}

/** Split a mixed caption at speaker turns, retaining the original word clocks. */
const labelCache = new WeakMap<
  OwnerCaptionSpeakers,
  Map<string, string | null>
>();
export function captionSpeakerFrame(
  caption: OwnerOverlay["captions"][number] | undefined,
  ms: number,
  config: OwnerCaptionSpeakers | undefined,
  style: OwnerCaptionStyle,
) {
  if (!caption || !config?.enabled) return { caption, colors: undefined };
  let labels = labelCache.get(config);
  if (!labels) {
    labels = new Map(config.assignments.map((w) => [w.wordId, w.speakerId]));
    labelCache.set(config, labels);
  }
  let index = caption.wordCues.findIndex(
    (w) => w.startMs <= ms && ms < w.endMs,
  );
  if (index < 0) {
    const next = caption.wordCues.findIndex((w) => w.startMs > ms);
    index = next < 0 ? caption.wordCues.length - 1 : Math.max(0, next - 1);
  }
  const id = labels.get(caption.wordCues[index]?.wordId ?? "") ?? null;
  let start = index,
    end = index + 1;
  while (
    start > 0 &&
    (labels.get(caption.wordCues[start - 1]!.wordId) ?? null) === id
  )
    start--;
  while (
    end < caption.wordCues.length &&
    (labels.get(caption.wordCues[end]!.wordId) ?? null) === id
  )
    end++;
  const wordCues = caption.wordCues.slice(start, end);
  if (!wordCues.length) return { caption, colors: undefined };
  const text = wordCues.map((w) => w.text).join(" ");
  const offset = caption.wordCues
    .slice(0, start)
    .reduce((n, w) => n + w.text.split(" ").length, 0);
  const tokens = wordCues.flatMap((w) => w.text.split(" "));
  const first =
    caption.lines.length === 1
      ? tokens.length
      : Math.max(0, caption.lines[0]!.split(" ").length - offset);
  const lines = [
    tokens.slice(0, first).join(" "),
    tokens.slice(first).join(" "),
  ].filter(Boolean);
  return {
    caption: {
      ...caption,
      startMs: Math.max(caption.startMs, wordCues[0]!.startMs),
      endMs: Math.min(caption.endMs, wordCues.at(-1)!.endMs),
      text,
      lines,
      wordIds: wordCues.map((w) => w.wordId),
      wordCues,
    },
    colors: id
      ? (config.colors.find((c) => c.speakerId === id) ??
        defaultSpeakerColor(id, style))
      : undefined,
  };
}
