import { randomUUID } from "node:crypto";
import {
  CODEX_TIMING_OPERATION,
  codexProgressSchema,
  type CodexProgress,
  type CodexProgressStep,
  type CodexStepId,
} from "../../../packages/contracts/local/codex-progress.ts";
import type { LocalDiagnostics } from "./diagnostics.ts";

/** Transient, content-free progress. Never saved or used to authorize work. */
export class LocalCodexProgress {
  private readonly runs = new Map<string, CodexProgress>();
  constructor(private readonly diagnostics: LocalDiagnostics) {}
  begin(workspaceId: string, ids: CodexStepId[], clipId?: string) {
    const value: CodexProgress = {
      runId: randomUUID(),
      ...(clipId ? { clipId } : {}),
      steps: ids.map((id) => ({ id, state: "pending", elapsedMs: 0 })),
    };
    this.runs.set(workspaceId, value);
    return value;
  }
  snapshot(id: string) {
    const value = this.runs.get(id);
    return value ? codexProgressSchema.parse(value) : null;
  }
  continue(workspaceId: string, ids: CodexStepId[], clipId: string) {
    const current = this.runs.get(workspaceId);
    if (!current || current.clipId !== clipId)
      return this.begin(workspaceId, ids, clipId);
    for (const id of ids)
      if (!current.steps.some((step) => step.id === id))
        current.steps.push({ id, state: "pending", elapsedMs: 0 });
    return current;
  }
  update(run: CodexProgress, steps: CodexProgressStep[]) {
    for (const step of steps) {
      const index = run.steps.findIndex((item) => item.id === step.id);
      if (index < 0) run.steps.push({ ...step });
      else run.steps[index] = { ...step };
    }
  }
  async measure<T>(
    run: CodexProgress,
    id: CodexStepId,
    signal: AbortSignal,
    work: () => Promise<T>,
  ) {
    const started = performance.now();
    const set = (state: CodexProgressStep["state"]) =>
      this.update(run, [
        {
          id,
          state,
          elapsedMs: Math.min(
            86400000,
            Math.round(performance.now() - started),
          ),
        },
      ]);
    set("running");
    try {
      const result = await this.diagnostics.run(
        CODEX_TIMING_OPERATION[id],
        work,
      );
      set("done");
      return result;
    } catch (error) {
      set(signal.aborted ? "canceled" : "failed");
      throw error;
    }
  }
  clear(id?: string) {
    if (id) this.runs.delete(id);
    else this.runs.clear();
  }
}
