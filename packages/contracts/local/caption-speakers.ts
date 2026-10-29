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

/** Caption-level attribution: majority of known words, then first spoken tie. */
export function captionSpeakerId(
  caption: OwnerOverlay["captions"][number],
  labels: ReadonlyMap<string, string | null>,
): string | null {
  const counts = new Map<string, number>();
  for (const word of caption.wordCues) {
    const id = labels.get(word.wordId);
    if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  let speaker: string | null = null,
    most = 0;
  for (const [id, count] of counts)
    if (count > most) {
      speaker = id;
      most = count;
    }
  return speaker;
}

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
  const labels = new Map(
    [...ids].map((wordId) => [
      wordId,
      overrides.has(wordId)
        ? overrides.get(wordId)!
        : (original.get(wordId) ?? null),
    ]),
  );
  const resolved = new Map(labels);
  for (const caption of captions) {
    const speakerId = captionSpeakerId(caption, labels);
    for (const word of caption.wordCues) resolved.set(word.wordId, speakerId);
  }
  const assignments = [...resolved].map(([wordId, speakerId]) => ({
    wordId,
    speakerId,
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

/** One stable speaker color for the complete caption, including legacy edits. */
const labelCache = new WeakMap<
  OwnerCaptionSpeakers,
  Map<string, string | null>
>();
export function captionSpeakerFrame(
  caption: OwnerOverlay["captions"][number] | undefined,
  _ms: number,
  config: OwnerCaptionSpeakers | undefined,
  style: OwnerCaptionStyle,
) {
  if (!caption || !config?.enabled) return { caption, colors: undefined };
  let labels = labelCache.get(config);
  if (!labels) {
    labels = new Map(config.assignments.map((w) => [w.wordId, w.speakerId]));
    labelCache.set(config, labels);
  }
  const id = captionSpeakerId(caption, labels);
  return {
    caption,
    colors: id
      ? (config.colors.find((c) => c.speakerId === id) ??
        defaultSpeakerColor(id, style))
      : undefined,
  };
}
