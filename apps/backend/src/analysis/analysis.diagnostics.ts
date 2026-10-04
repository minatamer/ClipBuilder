import { AsyncLocalStorage } from "node:async_hooks";
import { errorCodeSchema, requestIdSchema } from "@clipbuilder/contracts";
import { z } from "zod";
import { ApplicationError } from "../http/errorMapper.js";

type AnalysisAction = "upload" | "sample" | "run" | "clear";
const phases = [
  "request",
  "sample_fingerprint",
  "sample_transfer",
  "source_upload",
  "media_prepare",
  "source_validation",
  "proxy_fetch",
  "proxy_validation",
  "analysis_provider",
  "gemini_upload",
  "gemini_processing",
  "gemini_generation",
  "gemini_validation",
  "gemini_cleanup",
  "proxy_cleanup",
  "source_cleanup",
  "reconciliation",
  "analysis_result",
] as const;
export type AnalysisPhase = (typeof phases)[number];
type Context = {
  requestId: string;
  action: AnalysisAction;
  started: number;
  records: number;
};
type Event = "started" | "succeeded" | "failed" | "completed" | "disconnected";
const allowedRule =
  /^(?:google_(?:files_)?(?:upload_start|upload_finalize|upload|processing|generation|validation|delete|delete_confirm)_(?:failed|http_[45]\d{2})|google_files_cleanup_failed|analysis_complete|temporary_media_cleanup_failed)$/;
const errorClassNames = [
  "Error",
  "TypeError",
  "SyntaxError",
  "AbortError",
  "TimeoutError",
  "ZodError",
  "ApiError",
  "ApplicationError",
] as const;
const errorClasses: ReadonlySet<string> = new Set(errorClassNames);
const networkCodeNames = [
  "ENOTFOUND",
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_SOCKET",
] as const;
const networkCodes: ReadonlySet<string> = new Set(networkCodeNames);
const diagnosticSchema = z
  .object({
    event: z.literal("analysis_diagnostic"),
    requestId: requestIdSchema,
    action: z.enum(["upload", "sample", "run", "clear"]),
    phase: z.enum(phases),
    outcome: z.enum([
      "started",
      "succeeded",
      "failed",
      "completed",
      "disconnected",
    ]),
    elapsedMs: z.number().int().min(0).max(86_400_000),
    applicationHttpStatus: z.number().int().min(100).max(599).optional(),
    upstreamHttpStatus: z.number().int().min(400).max(599).optional(),
    errorClass: z.enum(errorClassNames).optional(),
    code: errorCodeSchema.optional(),
    rules: z
      .array(z.string().max(80).regex(allowedRule))
      .min(1)
      .max(2)
      .optional(),
    networkCode: z.enum(networkCodeNames).optional(),
  })
  .strict();

// The managed launcher uses the same validator instead of trusting a log prefix.
export function parseAnalysisDiagnosticLine(line: string): string | null {
  if (line.length > 2048) return null;
  try {
    const result = diagnosticSchema.safeParse(JSON.parse(line));
    return result.success ? JSON.stringify(result.data) : null;
  } catch {
    return null;
  }
}

// Own only bounded structural diagnostics. Never serialize an exception or input.
export class AnalysisDiagnostics {
  private readonly contexts = new AsyncLocalStorage<Context>();
  constructor(
    private readonly write: (line: string) => void = () => {},
    private readonly now = () => performance.now(),
  ) {}
  request(
    requestId: string,
    action: AnalysisAction,
    next: (
      finish: (event: "completed" | "disconnected", status: number) => void,
    ) => void,
  ) {
    if (!requestIdSchema.safeParse(requestId).success) return next(() => {});
    const context: Context = {
      requestId,
      action,
      started: this.now(),
      records: 0,
    };
    this.contexts.run(context, () => {
      this.emit("request", "started", context.started);
      let finished = false;
      next((event, status) => {
        if (finished) return;
        finished = true;
        this.contexts.run(context, () => {
          this.emit("request", event, context.started, undefined, status);
        });
      });
    });
  }
  async step<T>(phase: AnalysisPhase, work: () => Promise<T>): Promise<T> {
    const started = this.now();
    this.emit(phase, "started", started);
    try {
      const result = await work();
      this.emit(phase, "succeeded", started);
      return result;
    } catch (error) {
      this.emit(phase, "failed", started, error);
      throw error;
    }
  }
  check<T>(phase: AnalysisPhase, work: () => T): T {
    const started = this.now();
    this.emit(phase, "started", started);
    try {
      const result = work();
      this.emit(phase, "succeeded", started);
      return result;
    } catch (error) {
      this.emit(phase, "failed", started, error);
      throw error;
    }
  }
  failure(
    phase: AnalysisPhase,
    error: unknown,
    applicationHttpStatus?: number,
  ) {
    this.emit(
      phase,
      "failed",
      this.contexts.getStore()?.started ?? this.now(),
      error,
      applicationHttpStatus,
    );
  }
  private emit(
    phase: AnalysisPhase,
    event: Event,
    started: number,
    error?: unknown,
    applicationHttpStatus?: number,
  ) {
    const context = this.contexts.getStore();
    if (!context || context.records >= 48) return;
    context.records++;
    try {
      const duration = this.now() - started;
      const fields: Record<string, string | number | string[]> = {
        event: "analysis_diagnostic",
        requestId: context.requestId,
        action: context.action,
        phase,
        outcome: event,
        elapsedMs: Number.isFinite(duration)
          ? Math.min(86_400_000, Math.max(0, Math.round(duration)))
          : 0,
      };
      if (
        typeof applicationHttpStatus === "number" &&
        Number.isInteger(applicationHttpStatus) &&
        applicationHttpStatus >= 100 &&
        applicationHttpStatus <= 599
      )
        fields.applicationHttpStatus = applicationHttpStatus;
      if (error instanceof Error) {
        fields.errorClass = errorClasses.has(error.name) ? error.name : "Error";
        if (error instanceof ApplicationError) fields.code = error.code;
        if (
          "status" in error &&
          typeof error.status === "number" &&
          Number.isInteger(error.status) &&
          error.status >= 400 &&
          error.status <= 599
        )
          fields.upstreamHttpStatus = error.status;
        if (
          "ruleId" in error &&
          typeof error.ruleId === "string" &&
          error.ruleId.length <= 161
        ) {
          const rules = error.ruleId.split(";");
          if (
            rules.length <= 2 &&
            rules.every((rule) => allowedRule.test(rule))
          )
            fields.rules = rules;
        }
        let cause: unknown = error;
        for (let depth = 0; depth < 3 && cause instanceof Error; depth++) {
          if (
            "code" in cause &&
            typeof cause.code === "string" &&
            networkCodes.has(cause.code)
          ) {
            fields.networkCode = cause.code;
            break;
          }
          cause = cause.cause;
        }
      }
      const line = parseAnalysisDiagnosticLine(JSON.stringify(fields));
      if (line !== null) this.write(line);
    } catch {
      // Logging availability must not change a response, retry or cleanup.
    }
  }
}
