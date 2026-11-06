import { appendFileSync, closeSync, fsyncSync, openSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { ownerDiagnosticRecordSchema } from "../../../packages/contracts/local/diagnostics.ts";
import { executionTraceSchema } from "../../../packages/contracts/local/execution-diagnostics.ts";
import { requestIdSchema } from "../../../packages/contracts/src/ids.schema.ts";
import { parseAnalysisDiagnosticLine } from "../src/analysis/analysis.diagnostics.ts";

const traceRecord = executionTraceSchema.extend({
  event: z.literal("execution_trace"),
  at: z.iso.datetime(),
  requestId: requestIdSchema,
});
export const LOCAL_DIAGNOSTIC_LOG_POLICY = {
  fileBytes: 8 * 1024 ** 2,
  totalBytes: 64 * 1024 ** 2,
  failureReserveBytes: 8 * 1024 ** 2,
} as const;
type Policy = {
  fileBytes: number;
  totalBytes: number;
  failureReserveBytes: number;
};
const fileIO = {
  open: openSync,
  append: appendFileSync,
  sync: fsyncSync,
  close: closeSync,
};

/** Own descriptors in the backend, never an ancestor shell's asynchronous pipe. */
export function createLocalDiagnosticLog(
  directory: string,
  unavailable: (error: unknown) => void,
  policy: Policy = LOCAL_DIAGNOSTIC_LOG_POLICY,
  io = fileIO,
) {
  let descriptor: number | undefined;
  let part = 0,
    partBytes = 0,
    bytes = 0,
    dropped = 0;
  let closed = false,
    failed = false,
    limited = false;
  function release() {
    const value = descriptor;
    descriptor = undefined;
    if (value !== undefined) {
      try {
        io.sync(value);
      } finally {
        io.close(value);
      }
    }
  }
  function disable(error: unknown) {
    failed = true;
    try {
      release();
    } catch {
      /* Best-effort descriptor cleanup. */
    }
    try {
      unavailable(error);
    } catch {
      /* A broken fallback cannot affect work. */
    }
  }
  function append(line: string, sync = false) {
    const data = Buffer.from(`${line}\n`);
    if (
      descriptor !== undefined &&
      partBytes + data.length > policy.fileBytes
    ) {
      release();
      part++;
      partBytes = 0;
    }
    descriptor ??= io.open(
      join(directory, `diagnostics-${String(part).padStart(4, "0")}.jsonl`),
      "ax",
      0o600,
    );
    io.append(descriptor, data);
    if (sync) io.sync(descriptor);
    partBytes += data.length;
    bytes += data.length;
  }
  function marker(state: "ready" | "limited" | "closed") {
    append(
      JSON.stringify({
        event: "diagnostic_log",
        at: new Date().toISOString(),
        state,
        dropped,
      }),
      true,
    );
  }
  try {
    marker("ready");
  } catch (error) {
    disable(error);
  }
  return {
    directory,
    write(line: string) {
      if (closed || failed) return;
      try {
        if (Buffer.byteLength(line) > 16 * 1024) {
          dropped++;
          return;
        }
        const analysis = parseAnalysisDiagnosticLine(line);
        const raw: unknown = analysis ? JSON.parse(analysis) : JSON.parse(line);
        const parsed = analysis
          ? raw
          : (ownerDiagnosticRecordSchema.safeParse(raw).data ??
            traceRecord.safeParse(raw).data);
        if (!parsed || typeof parsed !== "object") {
          dropped++;
          return;
        }
        const canonical = JSON.stringify(parsed);
        const record = z
          .object({
            outcome: z.string().optional(),
            phase: z.string().optional(),
          })
          .parse(parsed);
        const terminal =
          ["failed", "canceled", "warning"].includes(record.outcome ?? "") ||
          ["complete", "request"].includes(record.phase ?? "");
        const limit = terminal
          ? policy.totalBytes
          : policy.totalBytes - policy.failureReserveBytes;
        if (bytes + Buffer.byteLength(canonical) + 512 > limit) {
          dropped++;
          if (!limited) {
            limited = true;
            marker("limited");
          }
          return;
        }
        append(canonical, terminal);
      } catch (error) {
        if (error instanceof SyntaxError) {
          dropped++;
          return;
        }
        disable(error);
      }
    },
    close() {
      if (closed) return;
      closed = true;
      if (!failed) {
        try {
          marker("closed");
          release();
        } catch (error) {
          disable(error);
        }
      }
    },
  };
}
