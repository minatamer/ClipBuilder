import { z } from "zod";
import {
  revisionIdSchema,
  sessionIdSchema,
  uuidV4Schema,
} from "./ids.schema.js";
import {
  sha256DigestSchema,
  turnstileTokenSchema,
} from "./boundary-primitives.schema.js";

export const processingActionSchema = z.enum([
  "transcription",
  "candidate-analysis",
  "visual-plan",
  "render",
]);
export type ProcessingAction = z.infer<typeof processingActionSchema>;
// Bootstrap proof does not add a paid action to the four-action grant.
export type ProcessingChallengeAction = ProcessingAction | "session-start";
export const SESSION_START_REQUEST_BYTES = 3 * 1024;
export const sessionStartProofSchema = z
  .object({
    startNonce: uuidV4Schema,
    turnstileToken: turnstileTokenSchema,
  })
  .strict();
export type SessionStartProof = z.infer<typeof sessionStartProofSchema>;
export const processingGrantRequestSchema = z
  .object({
    ...sessionStartProofSchema.shape,
    rightsAcknowledged: z.literal(true),
    dataTransferAcknowledged: z.literal(true),
  })
  .strict();
export const processingGrantResponseSchema = z
  .object({
    sessionId: sessionIdSchema,
    csrfToken: z.string().regex(/^[A-Za-z0-9_-]{43}$/u),
    expiresAtMs: z.number().int().positive(),
  })
  .strict();

// Integrity evidence only: this receipt does not authorize spend or prove unseen video.
export const integrityReceiptClaimsSchema = z
  .object({
    version: z.literal(1),
    bootEpoch: uuidV4Schema,
    sessionId: sessionIdSchema,
    action: processingActionSchema,
    nonce: uuidV4Schema,
    sourceRevision: revisionIdSchema,
    requestDigest: sha256DigestSchema,
    resultDigest: sha256DigestSchema,
    expiresAtMs: z.number().int().positive(),
  })
  .strict();
export type IntegrityReceiptClaims = z.infer<
  typeof integrityReceiptClaimsSchema
>;
