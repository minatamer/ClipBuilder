import { z } from "zod";
import { ASSEMBLY_LIMITS } from "./constants.js";
import {
  compositionManifestV2Schema,
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
import { transcriptWordSchema } from "./transcript.schema.js";
import { sha256DigestSchema } from "./boundary-primitives.schema.js";
import type { GroundedAnalysisResult } from "./grounded-analysis.schema.js";

const wordSpanSchema = z
  .object({ startWordId: wordIdSchema, endWordId: wordIdSchema })
  .strict();
export const contextualCardPlanSchema = z
  .object({
    kind: compositionManifestV2Schema.shape.cards.element.shape.kind,
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
// One selected-range audiovisual response. No free-form visible text or raster brief.
export const selectedAssemblyPlanSchema = z
  .object({
    version: z.literal(1),
    speaker: speakerPlanSchema,
    cards: z.array(contextualCardPlanSchema).max(ASSEMBLY_LIMITS.maxVisualCues),
  })
  .strict();
export const selectedAssemblyRequestSchema = selectedFocusRequestSchema;
const cardEvidenceSchema = z
  .object({
    anchorWordId: wordIdSchema,
    titleWordIds: z.array(wordIdSchema).min(1).max(7),
    lineWordIds: z.array(z.array(wordIdSchema).min(1).max(14)).min(1).max(3),
  })
  .strict();
export const selectedAssemblyResultSchema = z
  .object({
    version: z.literal(1),
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
    manifest: compositionManifestV2Schema,
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
      result.cardEvidence.length !== manifest.cards.length
    )
      issue();
    const indexes = new Map(words.map((w, i) => [w.id, i]));
    if (
      indexes.size !== words.length ||
      words.some(
        (w, i) =>
          w.startMs >= range.endMs ||
          w.endMs <= range.startMs ||
          (i > 0 && w.startMs < words[i - 1]!.startMs),
      )
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
    if (JSON.stringify(captionIds) !== JSON.stringify(words.map((w) => w.id)))
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
