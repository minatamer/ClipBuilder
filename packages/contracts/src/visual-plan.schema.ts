import { z } from "zod";

import { ASSEMBLY_LIMITS } from "./constants.js";
import { sha256DigestSchema } from "./boundary-primitives.schema.js";
import {
  revisionIdSchema,
  visualAssetIdSchema,
  visualCueIdSchema,
  visualRequestIdSchema,
  wordIdSchema,
} from "./ids.schema.js";
import {
  boundedPlainTextSchema,
  boundedTextWithoutUrlSchema,
} from "./text.schema.js";

export const visualAssetKindSchema = z.enum([
  "generated-concept-image",
  "equation-card",
  "stat-card",
  "quote-card",
]);
export const visualLayoutSchema = z.enum([
  "full-frame",
  "picture-in-picture",
  "lower-card",
]);
export const visualMotionSchema = z.enum(["none", "slow-push-in"]);
export const visualTransitionSchema = z.enum(["cut", "short-dissolve"]);
export const artDirectionSchema = z.literal("precision-cut-v1");

export const visualAssetRequestSchema = z
  .object({
    id: visualRequestIdSchema,
    kind: visualAssetKindSchema,
    subjectWordIds: z
      .array(wordIdSchema)
      .min(1)
      .max(16)
      .refine((ids) => new Set(ids).size === ids.length, {
        message: "Visual subject word references must be unique.",
      }),
    factualBrief: boundedTextWithoutUrlSchema(500),
    imagePrompt: boundedTextWithoutUrlSchema(800).nullable(),
    equationTex: boundedTextWithoutUrlSchema(300).nullable(),
    exactText: boundedTextWithoutUrlSchema(240).nullable(),
    background: z.enum(["opaque", "transparent"]),
    artDirection: artDirectionSchema,
  })
  .strict()
  .superRefine((request, context) => {
    const hasImagePrompt = request.imagePrompt !== null;
    const hasEquation = request.equationTex !== null;
    const hasExactText = request.exactText !== null;

    if (
      request.kind === "generated-concept-image" &&
      (!hasImagePrompt || hasEquation || hasExactText)
    ) {
      context.addIssue({
        code: "custom",
        message: "Generated images require only an image prompt.",
        path: ["imagePrompt"],
      });
    }

    if (
      request.kind === "equation-card" &&
      (!hasEquation || hasImagePrompt || hasExactText)
    ) {
      context.addIssue({
        code: "custom",
        message: "Equation cards require only a TeX expression.",
        path: ["equationTex"],
      });
    }

    if (
      (request.kind === "stat-card" || request.kind === "quote-card") &&
      (!hasExactText || hasImagePrompt || hasEquation)
    ) {
      context.addIssue({
        code: "custom",
        message: "Text cards require only exact transcript-grounded text.",
        path: ["exactText"],
      });
    }
  });

export const visualCuePlanSchema = z
  .object({
    id: visualCueIdSchema,
    startWordId: wordIdSchema,
    endWordId: wordIdSchema,
    assetRequestId: visualRequestIdSchema,
    layout: visualLayoutSchema,
    motion: visualMotionSchema,
    transition: visualTransitionSchema,
    rationale: boundedPlainTextSchema(320),
  })
  .strict()
  .refine((cue) => cue.startWordId !== cue.endWordId, {
    message: "Visual cue range must contain more than one word boundary.",
    path: ["endWordId"],
  });

export const visualPlanSchema = z
  .object({
    version: z.literal(1),
    revision: revisionIdSchema,
    artDirection: artDirectionSchema,
    requests: z
      .array(visualAssetRequestSchema)
      .max(ASSEMBLY_LIMITS.maxVisualCues),
    cues: z.array(visualCuePlanSchema).max(ASSEMBLY_LIMITS.maxVisualCues),
    totalCoverageMs: z
      .number()
      .int()
      .min(0)
      .max(60_000 * (ASSEMBLY_LIMITS.maxVisualCoveragePercent / 100)),
  })
  .strict()
  .superRefine((plan, context) => {
    const requestIds = plan.requests.map((request) => request.id);
    const cueIds = plan.cues.map((cue) => cue.id);
    const usedRequestIds = plan.cues.map((cue) => cue.assetRequestId);

    if (new Set(requestIds).size !== requestIds.length) {
      context.addIssue({
        code: "custom",
        message: "Visual request identifiers must be unique.",
        path: ["requests"],
      });
    }
    if (new Set(cueIds).size !== cueIds.length) {
      context.addIssue({
        code: "custom",
        message: "Visual cue identifiers must be unique.",
        path: ["cues"],
      });
    }
    if (
      usedRequestIds.some((id) => !requestIds.includes(id)) ||
      requestIds.some((id) => !usedRequestIds.includes(id))
    ) {
      context.addIssue({
        code: "custom",
        message: "Every visual request must be referenced by a cue.",
        path: ["cues"],
      });
    }
  });

export const visualAssetSchema = z
  .object({
    id: visualAssetIdSchema,
    requestId: visualRequestIdSchema,
    source: z.enum(["google-image", "deterministic-card", "fake-fixture"]),
    contentType: z.enum(["image/png", "image/webp"]),
    width: z.number().int().min(1).max(4_096),
    height: z.number().int().min(1).max(4_096),
    bytes: z.number().int().min(1).max(ASSEMBLY_LIMITS.maxGeneratedAssetBytes),
    sha256: sha256DigestSchema,
    hasAlpha: z.boolean(),
  })
  .strict();

export type VisualAssetRequestV1 = z.infer<typeof visualAssetRequestSchema>;
export type VisualCuePlanV1 = z.infer<typeof visualCuePlanSchema>;
export type VisualPlanV1 = z.infer<typeof visualPlanSchema>;
export type VisualAssetV1 = z.infer<typeof visualAssetSchema>;
