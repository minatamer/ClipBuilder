import { z } from "zod";

import { requestIdSchema } from "./ids.schema.js";
import { boundedPlainTextSchema } from "./text.schema.js";

export const ERROR_CODES = [
  "INVALID_REQUEST",
  "INVALID_IDEMPOTENCY_KEY",
  "INVALID_MANIFEST",
  "SESSION_MISSING",
  "SESSION_EXPIRED",
  "SESSION_INVALID",
  "FEATURE_DISABLED",
  "PAID_DEMO_DISABLED",
  "ABUSE_CHECK_FAILED",
  "RIGHTS_ACK_REQUIRED",
  "OPERATION_NOT_FOUND",
  "RESULT_NOT_FOUND",
  "ACTIVE_SESSION_EXISTS",
  "INVALID_STAGE",
  "STALE_REVISION",
  "ACTION_IN_PROGRESS",
  "LIMIT_REACHED",
  "RENDER_LIMIT_REACHED",
  "OUTPUT_ALREADY_EXISTS",
  "REQUEST_TOO_LARGE",
  "SOURCE_TOO_LARGE",
  "RESULT_TOO_LARGE",
  "UNSUPPORTED_CONTENT_TYPE",
  "UNSUPPORTED_MEDIA",
  "MISSING_AUDIO",
  "DURATION_OUT_OF_RANGE",
  "NO_VALID_CANDIDATES",
  "MODEL_OUTPUT_REJECTED",
  "ASSEMBLY_OUTPUT_REJECTED",
  "RENDER_OUTPUT_INVALID",
  "RATE_LIMITED",
  "CAPACITY_FULL",
  "PROVIDER_BUDGET_EXHAUSTED",
  "CLIENT_ABORTED",
  "REQUEST_TIMEOUT",
  "TRANSCRIPTION_FAILED",
  "ACTIVE_SPEAKER_FAILED",
  "VISUAL_GENERATION_FAILED",
  "STORAGE_FAILED",
  "JOB_START_FAILED",
  "OPERATION_TIMEOUT",
  "INTERNAL_ERROR",
] as const;

export const errorCodeSchema = z.enum(ERROR_CODES);
export type ErrorCode = z.infer<typeof errorCodeSchema>;

export const SAFE_ERROR_MESSAGES: Readonly<Record<ErrorCode, string>> = {
  INVALID_REQUEST: "The request is not valid.",
  INVALID_IDEMPOTENCY_KEY: "The request identifier is not valid.",
  INVALID_MANIFEST: "The automatic clip manifest is not valid.",
  SESSION_MISSING: "No active session was found.",
  SESSION_EXPIRED: "This session has expired.",
  SESSION_INVALID: "This session is not valid.",
  FEATURE_DISABLED: "This feature is not available.",
  PAID_DEMO_DISABLED: "Live processing is not available.",
  ABUSE_CHECK_FAILED: "The request could not be verified.",
  RIGHTS_ACK_REQUIRED: "Confirm that you have permission to use this media.",
  OPERATION_NOT_FOUND: "The requested resource was not found.",
  RESULT_NOT_FOUND: "The completed result could not be found.",
  ACTIVE_SESSION_EXISTS: "Clear the active session before starting another.",
  INVALID_STAGE: "This action is not available at the current stage.",
  STALE_REVISION:
    "The session evidence changed since this request was created.",
  ACTION_IN_PROGRESS: "This action is already in progress.",
  LIMIT_REACHED: "The session limit has been reached.",
  RENDER_LIMIT_REACHED: "The render limit has been reached.",
  OUTPUT_ALREADY_EXISTS: "A finished output already exists.",
  REQUEST_TOO_LARGE: "The request is too large.",
  SOURCE_TOO_LARGE: "The source video is too large.",
  RESULT_TOO_LARGE: "The result is too large.",
  UNSUPPORTED_CONTENT_TYPE: "The request content type is not supported.",
  UNSUPPORTED_MEDIA: "This media format is not supported.",
  MISSING_AUDIO: "The video does not contain usable audio.",
  DURATION_OUT_OF_RANGE: "The media duration is outside the supported range.",
  NO_VALID_CANDIDATES: "No strong self-contained moments were found.",
  MODEL_OUTPUT_REJECTED: "The suggested result could not be validated.",
  ASSEMBLY_OUTPUT_REJECTED: "The first cut could not be validated.",
  RENDER_OUTPUT_INVALID: "The rendered clip could not be validated.",
  RATE_LIMITED: "Too many requests were made. Try again later.",
  CAPACITY_FULL: "ClipBuilder is at capacity. Try again later.",
  PROVIDER_BUDGET_EXHAUSTED: "Live processing is temporarily unavailable.",
  CLIENT_ABORTED: "The request was stopped.",
  REQUEST_TIMEOUT: "The request took too long.",
  TRANSCRIPTION_FAILED: "The transcription service could not finish.",
  ACTIVE_SPEAKER_FAILED: "Speaker framing could not finish.",
  VISUAL_GENERATION_FAILED: "The contextual visuals could not be created.",
  STORAGE_FAILED: "Temporary media storage is unavailable.",
  JOB_START_FAILED: "Processing could not be started.",
  OPERATION_TIMEOUT: "Processing took too long.",
  INTERNAL_ERROR: "ClipBuilder could not complete the request.",
};

export const safeErrorSchema = z
  .object({
    code: errorCodeSchema,
    message: boundedPlainTextSchema(200),
    retryable: z.boolean(),
    requestId: requestIdSchema,
    ruleId: boundedPlainTextSchema(80).optional(),
    retryAfterSeconds: z.number().int().min(1).max(86_400).optional(),
  })
  .strict()
  .refine((error) => error.message === SAFE_ERROR_MESSAGES[error.code], {
    message:
      "Safe errors must use the source-controlled message for their code.",
    path: ["message"],
  });

export const errorEnvelopeSchema = z
  .object({ error: safeErrorSchema })
  .strict();

export type SafeError = z.infer<typeof safeErrorSchema>;
export type ErrorEnvelope = z.infer<typeof errorEnvelopeSchema>;
