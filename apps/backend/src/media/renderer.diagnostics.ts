import { z } from "zod";
import {
  rendererFailureCodeSchema,
  rendererFailureStageSchema,
  type ErrorCode,
} from "@clipbuilder/contracts";
import { ApplicationError } from "../http/errorMapper.js";

export const rendererOperationSchema = z.enum([
  "upload",
  "prepare",
  "select",
  "preview",
  "preview-info",
  "preview-content",
  "render",
  "output-info",
  "output-content",
  "cancel",
  "analysis-audio",
  "analysis-proxy",
  "release-analysis-proxy",
]);
export type RendererOperation = z.infer<typeof rendererOperationSchema>;
const phaseSchema = z.enum([
  "authorization",
  "transport",
  "http",
  "body",
  "json",
  "schema",
  "headers",
  "completed",
]);
export const rendererDiagnosticSchema = z
  .object({
    operation: rendererOperationSchema,
    attempt: z.literal(1),
    phase: phaseSchema,
    elapsedMs: z.number().int().min(0).max(86_400_000),
    httpStatus: z.number().int().min(100).max(599).optional(),
    responseBytes: z.number().int().min(0).max(600_000_000),
    responseComplete: z.boolean(),
    rendererCode: rendererFailureCodeSchema.optional(),
    rendererStage: rendererFailureStageSchema.optional(),
    rendererUnderlyingCode: rendererFailureCodeSchema.optional(),
    failure: z
      .enum([
        "authorization_failed",
        "transport_failed",
        "http_rejected",
        "body_missing",
        "body_limit",
        "body_read_failed",
        "json_invalid",
        "schema_invalid",
        "content_type_invalid",
        "canceled",
        "timeout",
      ])
      .optional(),
    errorClass: z
      .enum([
        "Error",
        "TypeError",
        "AbortError",
        "TimeoutError",
        "ZodError",
        "GaxiosError",
      ])
      .optional(),
    authorizationHttpStatus: z.number().int().min(400).max(599).optional(),
    schemaIssues: z
      .array(
        z
          .object({
            code: z.enum([
              "invalid_type",
              "invalid_value",
              "too_big",
              "too_small",
              "invalid_format",
              "not_multiple_of",
              "unrecognized_keys",
              "invalid_union",
              "invalid_key",
              "invalid_element",
              "custom",
            ]),
            path: z
              .string()
              .max(160)
              .regex(/^[a-zA-Z0-9_.]*$/),
          })
          .strict(),
      )
      .max(8)
      .optional(),
  })
  .strict();
export type RendererDiagnostic = z.infer<typeof rendererDiagnosticSchema>;

const safeFields = new Set([
  "binding",
  "sessionId",
  "sourceRevision",
  "fingerprint",
  "uploadUrl",
  "expiresAtMs",
  "source",
  "bytes",
  "durationMs",
  "width",
  "height",
  "audioStartMs",
  "profile",
  "container",
  "videoCodec",
  "audioCodec",
  "averageFrameRate",
  "rotationDegrees",
  "analysisAudio",
  "analysisProxy",
  "audioProfile",
  "artifact",
  "artifactId",
  "generation",
  "checksum",
  "range",
  "startMs",
  "endMs",
  "manifestHash",
  "output",
  "deleted",
  "contentType",
  "codec",
  "channels",
  "sampleRate",
  "bitRate",
  "version",
  "code",
]);
export function rendererSchemaIssues(error: z.ZodError) {
  return error.issues.slice(0, 8).map((issue) => ({
    code: issue.code,
    path: issue.path
      .slice(0, 8)
      .map((segment) =>
        typeof segment === "number"
          ? Math.max(0, Math.min(12000, segment))
          : typeof segment === "string" && safeFields.has(segment)
            ? segment
            : "unknown_field",
      )
      .join("."),
  }));
}
export class RendererRequestFailure extends ApplicationError {
  constructor(
    readonly renderer: RendererDiagnostic,
    cause?: unknown,
  ) {
    const mapping: Partial<
      Record<z.infer<typeof rendererFailureCodeSchema>, ErrorCode>
    > = {
      budget: "LIMIT_REACHED",
      busy: "ACTION_IN_PROGRESS",
      expired: "SESSION_EXPIRED",
      conflict: "STALE_REVISION",
      invalid: "INVALID_REQUEST",
      cleanup_pending: "CLEANUP_PENDING",
      canceled: "CLIENT_ABORTED",
      media_failed: "JOB_START_FAILED",
    };
    super({
      code:
        renderer.failure === "canceled"
          ? "CLIENT_ABORTED"
          : renderer.failure === "timeout"
            ? "OPERATION_TIMEOUT"
            : renderer.rendererCode
              ? (mapping[renderer.rendererCode] ?? "STORAGE_FAILED")
              : "STORAGE_FAILED",
    });
    this.cause = cause;
  }
}
