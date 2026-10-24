import { AsyncLocalStorage } from "node:async_hooks";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import {
  describeOwnerDiagnosticError,
  ownerDiagnosticRecordSchema,
  type OwnerDiagnosticOperation,
  type OwnerTranscriptTimingDiagnostic,
} from "../../../packages/contracts/local/diagnostics.ts";
import { AnalysisDiagnostics } from "../src/analysis/analysis.diagnostics.ts";

export const LOCAL_DIAGNOSTIC_LIMIT = 128;
type Context = {
  requestId: string;
  parentRequestId?: string;
  budget: { records: number; dropped: number };
};

/** Explicit safe sink. No private capture, request bodies or exception strings. */
export class LocalDiagnostics {
  readonly analysis: AnalysisDiagnostics;
  private readonly contexts = new AsyncLocalStorage<Context>();
  constructor(private readonly write: (line: string) => void = () => {}) {
    this.analysis = new AnalysisDiagnostics(write);
  }
  private context(): Context {
    return {
      requestId: `req_${randomBytes(16).toString("hex")}`,
      budget: { records: 0, dropped: 0 },
    };
  }
  private emit(
    operation: OwnerDiagnosticOperation,
    outcome: "started" | "succeeded" | "failed" | "canceled" | "critique",
    started: number,
    error?: unknown,
    jobId?: string,
    httpStatus?: number,
    transcriptTiming?: OwnerTranscriptTimingDiagnostic,
  ) {
    const context = this.contexts.getStore() ?? this.context();
    const limit =
      outcome === "started" || outcome === "succeeded"
        ? LOCAL_DIAGNOSTIC_LIMIT - 16
        : LOCAL_DIAGNOSTIC_LIMIT;
    if (context.budget.records >= limit) {
      context.budget.dropped = Math.min(1000000, context.budget.dropped + 1);
      return;
    }
    context.budget.records++;
    try {
      this.write(
        JSON.stringify(
          ownerDiagnosticRecordSchema.parse({
            event: "local_diagnostic",
            service: "backend",
            at: new Date().toISOString(),
            requestId: context.requestId,
            ...(context.parentRequestId
              ? { parentRequestId: context.parentRequestId }
              : {}),
            ...(jobId ? { jobId } : {}),
            operation,
            outcome,
            elapsedMs: Math.max(
              0,
              Math.min(86400000, Math.round(performance.now() - started)),
            ),
            ...(error === undefined
              ? {}
              : { error: describeOwnerDiagnosticError(error) }),
            ...(httpStatus ? { httpStatus } : {}),
            ...(transcriptTiming ? { transcriptTiming } : {}),
            droppedRecords: context.budget.dropped,
          }),
        ),
      );
    } catch {
      /* Sink failure never changes processing, retry or cleanup. */
    }
  }
  failure(operation: OwnerDiagnosticOperation, error: unknown) {
    this.emit(operation, "failed", performance.now(), error);
    if (error instanceof z.ZodError)
      this.analysis.failure("local_validation", error);
    else this.analysis.failure("local_operation", error);
  }
  transcriptTiming(value: OwnerTranscriptTimingDiagnostic) {
    this.emit(
      "transcript_validate",
      "succeeded",
      performance.now(),
      undefined,
      undefined,
      undefined,
      value,
    );
  }
  critique(
    operation: OwnerDiagnosticOperation,
    reason:
      | "gemini_quality_critique"
      | "gemini_output_unusable"
      | "gemini_clock_converted"
      | "gemini_evidence_critique"
      | "gemini_candidate_critique" = "gemini_quality_critique",
  ) {
    const error = new Error(reason);
    this.emit(operation, "critique", performance.now(), error);
    this.analysis.critique("local_operation", error);
  }
  check<T>(operation: OwnerDiagnosticOperation, work: () => T): T {
    const started = performance.now();
    this.emit(operation, "started", started);
    try {
      const result = work();
      this.emit(operation, "succeeded", started);
      return result;
    } catch (error) {
      this.failure(operation, error);
      throw error;
    }
  }
  async run<T>(
    operation: OwnerDiagnosticOperation,
    work: () => Promise<T>,
    options: {
      independent?: boolean;
      quiet?: boolean;
      jobId?: string;
      status?: () => number;
    } = {},
  ): Promise<T> {
    const parent = this.contexts.getStore();
    const context = parent && !options.independent ? parent : this.context();
    if (parent && options.independent)
      context.parentRequestId = parent.requestId;
    const execute = async () => {
      const started = performance.now();
      if (!options.quiet)
        this.emit(operation, "started", started, undefined, options.jobId);
      try {
        const value = await work();
        const status = options.status?.();
        if (!options.quiet || (status !== undefined && status >= 400))
          this.emit(
            operation,
            status !== undefined && status >= 400 ? "failed" : "succeeded",
            started,
            undefined,
            options.jobId,
            status,
          );
        return value;
      } catch (error) {
        if (error instanceof z.ZodError)
          this.analysis.failure("local_validation", error);
        else this.analysis.failure("local_operation", error);
        this.emit(
          operation,
          error instanceof Error && error.name === "AbortError"
            ? "canceled"
            : "failed",
          started,
          error,
          options.jobId,
          options.status?.(),
        );
        throw error;
      }
    };
    return this.contexts.run(context, () => {
      if ((parent && !options.independent) || options.quiet) return execute();
      return new Promise<T>((resolve, reject) => {
        this.analysis.request(context.requestId, "local", (finish) => {
          execute().then(
            (value) => {
              finish("completed", options.status?.());
              resolve(value);
            },
            (error: unknown) => {
              finish("completed", options.status?.());
              reject(error);
            },
          );
        });
      });
    });
  }
}
