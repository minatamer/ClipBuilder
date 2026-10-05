import { randomUUID } from "node:crypto";
import { z } from "zod";
import { rendererFailureCodeSchema } from "@clipbuilder/contracts";

const messages = {
  admission: "Upload admission lifecycle",
  intent_list: "Bounded cleanup journal inventory",
  intake_check: "Upload intake cleanup classification",
  recovery: "Cleanup before new upload allocation",
  disposable_policy: "Disposable storage policy verification",
  intent_create: "New upload journal reservation",
  duplicate_check: "Incoming upload binding collision verification",
  upload_allocate: "Resumable upload capability allocation",
  intent_update: "Cleanup journal state commit",
  upload_cancel: "Unfinished upload cancellation",
  artifact_list: "Session artifact inventory",
  artifact_delete: "Generation-fenced artifact deletion",
  artifact_verify: "Remaining artifact verification",
  intent_fence: "Cleanup journal generation verification",
  intent_delete: "Expired cleanup journal deletion",
  retry_journal: "Cleanup retry obligation persistence",
  retry_wait: "Cleanup retry deadline deferral",
  orphan_list: "Expired orphan artifact inventory",
  orphan_delete: "Expired orphan generation deletion",
  sweep: "Bounded cleanup sweep lifecycle",
  cleanup: "Session cleanup lifecycle",
} as const;
type Phase = keyof typeof messages;
const factsSchema = z
  .object({
    sessions: z.number().int().min(0).max(1_000_000).optional(),
    expired: z.number().int().min(0).max(1_000_000).optional(),
    pending: z.number().int().min(0).max(1_000_000).optional(),
    outputExpired: z.number().int().min(0).max(1_000_000).optional(),
    terminal: z.number().int().min(0).max(1_000_000).optional(),
    artifacts: z.number().int().min(0).max(1_000_000).optional(),
    unresolved: z.number().int().min(0).max(1_000_000).optional(),
    retryAfterMs: z.number().int().min(0).max(1_800_000).optional(),
    reason: z
      .enum([
        "cleanup_required",
        "process_cleanup_blocked",
        "cleanup_unresolved",
        "retry_deferred",
        "capacity_limit",
        "journal_limit",
        "remaining_artifacts",
        "generation_conflict",
        "artifact_limit",
      ])
      .optional(),
    failureCode: rendererFailureCodeSchema.optional(),
    httpStatus: z.number().int().min(100).max(599).optional(),
    errorKind: z
      .enum(["Error", "AbortError", "TimeoutError", "ZodError"])
      .optional(),
  })
  .strict();
type Facts = z.infer<typeof factsSchema>;
export type CleanupDiagnostic = Facts & {
  event: "renderer_cleanup_diagnostic";
  diagnosticId: string;
  operation: "admission" | "sweep" | "cleanup";
  phase: Phase;
  outcome: "started" | "succeeded" | "failed" | "blocked" | "deferred";
  message: string;
  elapsedMs: number;
};
export type CleanupDiagnosticSink = (record: CleanupDiagnostic) => void;

function errorFacts(error: unknown): Facts {
  try {
    const parsed = z
      .object({
        code: z.unknown().optional(),
        name: z.unknown().optional(),
        response: z.unknown().optional(),
      })
      .safeParse(error);
    if (!parsed.success) return {};
    const raw = parsed.data;
    const response = z
      .object({ status: z.unknown().optional() })
      .safeParse(raw.response);
    const failureCode = rendererFailureCodeSchema.safeParse(raw.code);
    const httpStatus = factsSchema.shape.httpStatus.safeParse(
      (response.success ? response.data.status : undefined) ?? Number(raw.code),
    );
    const errorKind = factsSchema.shape.errorKind.safeParse(raw.name);
    return {
      ...(failureCode.success ? { failureCode: failureCode.data } : {}),
      ...(httpStatus.success ? { httpStatus: httpStatus.data } : {}),
      ...(errorKind.success ? { errorKind: errorKind.data } : {}),
    };
  } catch {
    return {};
  }
}
export class CleanupTrace {
  private readonly diagnosticId = randomUUID();
  constructor(
    private readonly operation: CleanupDiagnostic["operation"],
    private readonly sink: CleanupDiagnosticSink,
  ) {}
  record(
    phase: Phase,
    outcome: CleanupDiagnostic["outcome"],
    facts: Facts = {},
    elapsedMs = 0,
  ) {
    try {
      const parsed = factsSchema.safeParse(facts);
      this.sink({
        ...(parsed.success ? parsed.data : {}),
        event: "renderer_cleanup_diagnostic",
        diagnosticId: this.diagnosticId,
        operation: this.operation,
        phase,
        outcome,
        message: messages[phase] + ": " + outcome,
        elapsedMs: Math.max(0, Math.round(elapsedMs)),
      });
    } catch {
      /* Logging cannot change cleanup or admission behavior. */
    }
  }
  async step<T>(
    phase: Phase,
    work: () => Promise<T>,
    summarize?: (result: T) => Facts,
  ): Promise<T> {
    const started = performance.now();
    this.record(phase, "started");
    try {
      const result = await work();
      const facts = summarize?.(result) ?? {};
      this.record(
        phase,
        facts.unresolved ? "blocked" : "succeeded",
        facts,
        performance.now() - started,
      );
      return result;
    } catch (error) {
      this.record(
        phase,
        "failed",
        errorFacts(error),
        performance.now() - started,
      );
      throw error;
    }
  }
}
export class CleanupDiagnostics {
  constructor(private readonly sink: CleanupDiagnosticSink = () => undefined) {}
  trace(operation: CleanupDiagnostic["operation"]) {
    return new CleanupTrace(operation, this.sink);
  }
}
