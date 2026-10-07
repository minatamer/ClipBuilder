import { z } from "zod";
import {
  mediaBindingSchema,
  artifactReferenceSchema,
  inspectedSourceSchema,
  uuidV4Schema,
  objectGenerationSchema,
  selectedMediaRangeSchema,
  TEMPORARY_MEDIA_LIMITS,
} from "@clipbuilder/contracts";

// Previous WebM records remain readable for deletion only. Discard their source
// profile so it cannot become processing authority under the MP4-only contract.
const legacyWebmSourceSchema = z
  .object({
    ...inspectedSourceSchema.shape,
    profile: z
      .object({
        ...inspectedSourceSchema.shape.profile.unwrap().shape,
        container: z.literal("webm"),
      })
      .strict(),
  })
  .strict()
  .transform(() => null);

export const temporaryIntentSchema = z
  .object({
    version: z.literal(1),
    binding: mediaBindingSchema,
    expiresAtMs: z.number().int().positive(),
    expectedBytes: z.number().int().positive(),
    // Legacy MIME types are cleanup data, never new upload authorization.
    contentType: z.enum(["video/mp4", "video/webm"]),
    sourceId: uuidV4Schema,
    phase: z.enum([
      "uploading",
      "preparing",
      "prepared",
      "selecting",
      "previewing",
      "rendering",
      "complete",
      "terminal",
    ]),
    encryptedUpload: z.string().max(16_384).nullable(),
    nonce: uuidV4Schema.nullable(),
    manifestHash: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .nullable(),
    source: z.union([inspectedSourceSchema, legacyWebmSourceSchema]).nullable(),
    sourceGeneration: objectGenerationSchema.nullable(),
    analysisProxy: artifactReferenceSchema.nullable(),
    selectedRange: selectedMediaRangeSchema.nullable().default(null),
    preview: artifactReferenceSchema.nullable().default(null),
    output: artifactReferenceSchema.nullable(),
    outputExpiresAtMs: z.number().int().positive().nullable(),
    cleanupPending: z.boolean(),
    cleanupAttempts: z.number().int().min(0).max(1_000_000),
    nextCleanupAtMs: z.number().int().nonnegative(),
    mediaOperationsUsed: z
      .number()
      .int()
      .min(0)
      .max(TEMPORARY_MEDIA_LIMITS.maxOperationsPerSession)
      .optional(),
  })
  .strict()
  .transform((intent) => ({
    ...intent,
    // Old intents predate the counter; irreversible phases/artifacts establish
    // a conservative consumed allowance without changing deletion authority.
    mediaOperationsUsed:
      intent.mediaOperationsUsed ??
      (intent.phase === "uploading"
        ? 0
        : ["rendering", "complete", "terminal"].includes(intent.phase)
          ? TEMPORARY_MEDIA_LIMITS.maxOperationsPerSession
          : intent.phase === "previewing" || intent.preview
            ? 3
            : intent.phase === "selecting" || intent.selectedRange
              ? 2
              : 1),
  }));
export type TemporaryIntent = z.infer<typeof temporaryIntentSchema>;
export type IntentRecord = { intent: TemporaryIntent; generation: string };

export interface TemporaryMediaStore {
  stream(
    sessionId: string,
    artifactId: string,
    generation: string,
    range: { start: number; end: number },
    destination: import("node:stream").Writable,
    signal: AbortSignal,
  ): Promise<void>;
  withSignal<T>(signal: AbortSignal, work: () => Promise<T>): Promise<T>;
  assertDisposable(): Promise<void>;
  expiredArtifacts(
    nowMs: number,
  ): Promise<
    Array<{ sessionId: string; artifactId: string; generation: string }>
  >;
  listIntents(): Promise<IntentRecord[]>;
  getIntent(sessionId: string): Promise<IntentRecord | null>;
  saveIntent(
    intent: TemporaryIntent,
    previousGeneration: string,
  ): Promise<IntentRecord>;
  deleteIntent(sessionId: string, generation: string): Promise<void>;
  beginUpload(intent: TemporaryIntent, uploadOrigin?: string): Promise<string>;
  cancelUpload(url: string): Promise<void>;
  listArtifacts(
    sessionId: string,
  ): Promise<Array<{ artifactId: string; generation: string; bytes: number }>>;
  deleteArtifact(
    sessionId: string,
    artifactId: string,
    generation: string,
  ): Promise<void>;
  artifactMetadata(
    sessionId: string,
    artifactId: string,
    generation: string,
  ): Promise<{ bytes: number; contentType: string }>;
  download(
    sessionId: string,
    artifactId: string,
    generation: string,
    destination: string,
    signal: AbortSignal,
  ): Promise<void>;
  upload(
    sessionId: string,
    artifactId: string,
    source: string,
    expiresAtMs: number,
    signal: AbortSignal,
    contentType?: "video/mp4" | "audio/m4a",
  ): Promise<import("@clipbuilder/contracts").ArtifactReference>;
}
