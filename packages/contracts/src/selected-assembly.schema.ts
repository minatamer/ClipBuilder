import { z } from "zod";
import { ASSEMBLY_LIMITS } from "./constants.js";
import {
  compositionManifestV3Schema,
  contextualCardOriginSchema,
  FIXED_COMPOSITION_POLICY,
} from "./edit-plan.schema.js";
import {
  speakerPlanSchema,
  selectedFocusRequestSchema,
} from "./selected-focus.schema.js";
import {
  mediaBindingSchema,
  objectGenerationSchema,
} from "./cloud-media.schema.js";
import {
  candidateIdSchema,
  revisionIdSchema,
  wordIdSchema,
} from "./ids.schema.js";
import {
  transcriptWordSchema,
  transcriptWordSpanSchema as wordSpanSchema,
} from "./transcript.schema.js";
import {
  CONTEXTUAL_PICTURE_POLICY,
  contextualPictureBriefSchema,
  contextualPicturePlanSchema,
} from "./contextual-picture.schema.js";
import { sha256DigestSchema } from "./boundary-primitives.schema.js";
import type { GroundedAnalysisResult } from "./grounded-analysis.schema.js";

export const contextualCardPlanSchema = z
  .object({
    kind: compositionManifestV3Schema.shape.cards.element.shape.kind,
    anchorWordId: wordIdSchema,
    durationMs: z
      .number()
      .int()
      .min(ASSEMBLY_LIMITS.minVisualCueMilliseconds)
      .max(ASSEMBLY_LIMITS.maxVisualCueMilliseconds),
    title: wordSpanSchema,
    lines: z.array(wordSpanSchema).min(1).max(3),
  })
  .strict()
  .refine((card) => card.kind !== "comparison" || card.lines.length === 2)
  .refine((card) => card.kind !== "steps" || card.lines.length >= 2);
// One selected-range audiovisual response with bounded non-executable scene briefs.
export const selectedAssemblyPlanSchema = z
  .object({
    version: z.literal(1),
    speaker: speakerPlanSchema,
    cards: z.array(contextualCardPlanSchema).max(ASSEMBLY_LIMITS.maxVisualCues),
    pictures: z
      .array(contextualPicturePlanSchema)
      .min(CONTEXTUAL_PICTURE_POLICY.minPictures)
      .max(ASSEMBLY_LIMITS.maxVisualCues)
      .optional(),
  })
  .strict();
export const selectedAssemblyRequestSchema = selectedFocusRequestSchema;
const cardEvidenceSchema = z
  .object({
    origin: contextualCardOriginSchema,
    anchorWordId: wordIdSchema,
    titleWordIds: z.array(wordIdSchema).min(1).max(7),
    lineWordIds: z.array(z.array(wordIdSchema).min(1).max(14)).min(1).max(3),
  })
  .strict();
export const selectedAssemblyResultSchema = z
  .object({
    version: z.literal(2),
    binding: mediaBindingSchema,
    generation: objectGenerationSchema,
    analysisRevision: revisionIdSchema,
    candidateId: candidateIdSchema,
    policy: z.literal(FIXED_COMPOSITION_POLICY.version),
    provider: z.enum(["fake", "google-gemini"]),
    words: z
      .array(transcriptWordSchema)
      .min(1)
      .max(FIXED_COMPOSITION_POLICY.maxSelectedWords),
    cardEvidence: z
      .array(cardEvidenceSchema)
      .max(ASSEMBLY_LIMITS.maxVisualCues),
    pictureNotes: z
      .array(
        z
          .object({
            anchorWordId: wordIdSchema,
            scene: contextualPictureBriefSchema.shape.scene,
          })
          .strict(),
      )
      .max(CONTEXTUAL_PICTURE_POLICY.maxPictures)
      .optional(),
    manifest: compositionManifestV3Schema,
    manifestHash: sha256DigestSchema,
    receipt: z.string().min(1).max(4096),
  })
  .strict()
  .superRefine((result, ctx) => {
    const issue = () =>
      ctx.addIssue({
        code: "custom",
        message: "Assembly grounding or source binding is invalid.",
      });
    const { manifest, words } = result,
      { range } = manifest;
    if (
      result.binding.fingerprint !== manifest.source.fingerprint ||
      result.cardEvidence.length !== manifest.cards.length ||
      (result.pictureNotes !== undefined &&
        (result.pictureNotes.length !== (manifest.pictures?.length ?? 0) ||
          result.pictureNotes.some(
            (note, index) =>
              note.anchorWordId !== manifest.pictures?.[index]?.anchorWordId,
          )))
    )
      issue();
    const indexes = new Map(words.map((w, i) => [w.id, i]));
    if (
      indexes.size !== words.length ||
      words.some((w) => w.startMs >= range.endMs || w.endMs <= range.startMs)
    )
      issue();
    function resolve(ids: string[]) {
      const first = indexes.get(ids[0]!);
      if (
        first === undefined ||
        ids.some((id, i) => words[first + i]?.id !== id)
      ) {
        issue();
        return [];
      }
      return words.slice(first, first + ids.length);
    }
    const captionIds = manifest.captions.flatMap((c) => c.wordIds ?? []);
    if (
      captionIds.some((id, index) => {
        const position = indexes.get(id);
        const previous = index ? indexes.get(captionIds[index - 1]!) : -1;
        return (
          position === undefined ||
          previous === undefined ||
          position <= previous
        );
      })
    )
      issue();
    manifest.captions.forEach((caption, i) => {
      const group = resolve(caption.wordIds ?? []);
      const end = Math.min(
        Math.max(...group.map((w) => w.endMs)) - range.startMs,
        manifest.captions[i + 1]?.startMs ?? range.endMs - range.startMs,
        range.endMs - range.startMs,
      );
      if (
        !group.length ||
        caption.text !== group.map((w) => w.punctuatedText).join(" ") ||
        caption.startMs !== Math.max(0, group[0]!.startMs - range.startMs) ||
        caption.endMs !== end ||
        !caption.lines
      )
        issue();
      caption.wordCues.forEach((cue, index) => {
        const word = group[index];
        if (
          !word ||
          cue.wordId !== word.id ||
          cue.text !== word.punctuatedText ||
          cue.startMs !==
            Math.max(caption.startMs, word.startMs - range.startMs) ||
          cue.endMs !== Math.min(caption.endMs, word.endMs - range.startMs)
        )
          issue();
      });
    });
    let previous =
      FIXED_COMPOSITION_POLICY.openingBeatMs -
      FIXED_COMPOSITION_POLICY.cardSeparationMs;
    manifest.cards.forEach((card, i) => {
      const evidence = result.cardEvidence[i];
      if (!evidence) return;
      const anchor = words[indexes.get(evidence.anchorWordId) ?? -1];
      const spans = [evidence.titleWordIds, ...evidence.lineWordIds].map(
        resolve,
      );
      const texts = spans.map((span) =>
        span.map((w) => w.punctuatedText).join(" "),
      );
      let last = -1;
      for (const span of spans) {
        const first = indexes.get(span[0]?.id ?? "") ?? -1;
        if (
          first <= last ||
          span.some(
            (w) =>
              w.startMs - range.startMs < card.startMs ||
              w.endMs - range.startMs > card.endMs,
          )
        )
          issue();
        last = first + span.length - 1;
      }
      if (
        !anchor ||
        card.origin !== evidence.origin ||
        card.startMs !== anchor.startMs - range.startMs ||
        card.startMs < previous + FIXED_COMPOSITION_POLICY.cardSeparationMs ||
        card.title !== texts[0] ||
        JSON.stringify(card.lines) !== JSON.stringify(texts.slice(1)) ||
        (card.kind === "comparison" && card.lines.length !== 2) ||
        (card.kind === "steps" && card.lines.length < 2)
      )
        issue();
      previous = card.endMs;
    });
    for (const picture of manifest.pictures ?? []) {
      const anchor = words[indexes.get(picture.anchorWordId) ?? -1];
      const subject = resolve(picture.subjectWordIds);
      if (
        !anchor ||
        !subject.length ||
        picture.startMs !== anchor.startMs - range.startMs ||
        subject.some(
          (word) =>
            word.startMs - range.startMs < picture.startMs ||
            word.endMs - range.startMs > picture.endMs,
        )
      )
        issue();
    }
  });
export type SelectedAssemblyPlan = z.infer<typeof selectedAssemblyPlanSchema>;
export type SelectedAssemblyRequest = z.infer<
  typeof selectedAssemblyRequestSchema
>;
export type SelectedAssemblyResult = z.infer<
  typeof selectedAssemblyResultSchema
>;

export function hasSameAssemblySource(
  result: SelectedAssemblyResult,
  source: GroundedAnalysisResult,
): boolean {
  const candidate = source.analysis.candidates.find(
    (c) => c.id === result.candidateId,
  );
  const words = source.analysis.transcript.words;
  const first = words.findIndex((w) => w.id === candidate?.startWordId),
    last = words.findIndex((w) => w.id === candidate?.endWordId);
  const media = source.analysis.media;
  const selected =
    first >= 0 && last >= first
      ? words.filter(
          (w) =>
            w.startMs < words[last]!.endMs && w.endMs > words[first]!.startMs,
        )
      : [];
  return (
    first >= 0 &&
    last >= first &&
    JSON.stringify(result.binding) === JSON.stringify(source.binding) &&
    result.generation === source.generation &&
    result.analysisRevision === source.analysis.revision &&
    JSON.stringify(result.words) === JSON.stringify(selected) &&
    result.manifest.range.startMs === words[first]!.startMs &&
    result.manifest.range.endMs === words[last]!.endMs &&
    result.manifest.source.durationMs === media.durationMs &&
    result.manifest.source.width ===
      (media.rotationDegrees % 180 ? media.height : media.width) &&
    result.manifest.source.height ===
      (media.rotationDegrees % 180 ? media.width : media.height)
  );
}
