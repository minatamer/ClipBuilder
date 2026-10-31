import { z } from "zod";
import { ASSEMBLY_LIMITS } from "./constants.js";
import { sha256DigestSchema } from "./boundary-primitives.schema.js";
import { wordIdSchema } from "./ids.schema.js";
import { boundedPlainTextSchema } from "./text.schema.js";
import { transcriptWordSpanSchema } from "./transcript.schema.js";

export const CONTEXTUAL_PICTURE_POLICY = {
  minPictures: 2,
  maxPictures: 3,
  maxSubjectWords: 7,
  maxSupportingPhraseWords: 24,
  maxRasterBytes: 96 * 1024,
  maxDownloadBytes: 4 * 1024 * 1024,
  maxMetadataBytes: 256 * 1024,
  maxInputPixels: 16_000_000,
  width: 920,
  height: 520,
  timeoutMs: 8000,
  maxCandidates: 8,
  minDurationMs: 2000,
  minInputWidth: 320,
  minInputHeight: 180,
} as const;
export const contextualPictureBriefSchema = z
  .object({
    scene: boundedPlainTextSchema(180),
    searchQuery: z
      .string()
      .min(2)
      .max(100)
      .regex(/^[\p{L}\p{N}][\p{L}\p{N} -]+$/u),
    requiredTerms: z
      .array(
        z
          .string()
          .min(2)
          .max(32)
          .regex(/^[\p{L}\p{N} -]+$/u),
      )
      .min(1)
      .max(4),
    avoidTerms: z
      .array(
        z
          .string()
          .min(2)
          .max(32)
          .regex(/^[\p{L}\p{N} -]+$/u),
      )
      .max(6),
  })
  .strict();
export const contextualPicturePlanSchema = z
  .object({
    kind: z.enum(["game", "planet", "object", "place", "person"]),
    brief: contextualPictureBriefSchema,
    subject: transcriptWordSpanSchema,
    anchorWordId: wordIdSchema,
    durationMs: z
      .number()
      .int()
      .min(CONTEXTUAL_PICTURE_POLICY.minDurationMs)
      .max(ASSEMBLY_LIMITS.maxVisualCueMilliseconds),
  })
  .strict();
export const GENERATED_PICTURE_MODEL = "gemini-3.1-flash-image" as const;
const pictureRasterShape = {
  width: z.number().int().positive().max(CONTEXTUAL_PICTURE_POLICY.width),
  height: z.number().int().positive().max(CONTEXTUAL_PICTURE_POLICY.height),
  sha256: sha256DigestSchema,
  dataUri: z
    .string()
    .max(23 + Math.ceil(CONTEXTUAL_PICTURE_POLICY.maxRasterBytes / 3) * 4)
    .regex(/^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/]*={0,2}$/),
};
export const commonsPictureAssetSchema = z
  .object({
    repository: z.literal("wikimedia-commons"),
    license: z.string().min(1).max(120),
    pageId: z.number().int().positive(),
    title: boundedPlainTextSchema(240),
    ...pictureRasterShape,
  })
  .strict();
export const contextualPictureAssetSchema = z.discriminatedUnion("repository", [
  commonsPictureAssetSchema,
  z.object({ repository: z.literal("web"), ...pictureRasterShape }).strict(),
  z
    .object({
      repository: z.literal("google-gemini"),
      model: z.literal(GENERATED_PICTURE_MODEL),
      policy: z.literal("contextual-generated-v1"),
      ...pictureRasterShape,
    })
    .strict(),
]);
export const contextualPictureSchema = z
  .object({
    startMs: z.number().int().nonnegative(),
    endMs: z.number().int().positive(),
    subjectWordIds: z
      .array(wordIdSchema)
      .min(1)
      .max(CONTEXTUAL_PICTURE_POLICY.maxSubjectWords),
    anchorWordId: wordIdSchema,
    // Accepted only for inspecting earlier signed results; new plans omit it.
    sequence: z.number().int().min(1).max(3).optional(),
    asset: contextualPictureAssetSchema,
  })
  .strict()
  .refine((picture) => picture.endMs > picture.startMs);
export type ContextualPictureAsset = z.infer<
  typeof contextualPictureAssetSchema
>;
export type ContextualPicture = z.infer<typeof contextualPictureSchema>;
export type ContextualPicturePlan = z.infer<typeof contextualPicturePlanSchema>;
export type ContextualPictureRequest = Pick<
  ContextualPicturePlan,
  "kind" | "brief"
> & { alternateBriefs?: z.infer<typeof contextualPictureBriefSchema>[] };
