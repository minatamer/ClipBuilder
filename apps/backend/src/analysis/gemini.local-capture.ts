import {
  appendFileSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { requestIdSchema } from "@clipbuilder/contracts";
import { z } from "zod";
import type { BackendConfig } from "../config/env.schema.js";
import type { GoogleOperation } from "./gemini.diagnostics.js";
import type { ReconciliationDiagnostic } from "./analysis.reconciliation-diagnostics.js";

export const LOCAL_GEMINI_CAPTURE_WINDOW_MS = 6 * 60 * 60 * 1000;
export const LOCAL_GEMINI_CAPTURE_WORKSPACE = fileURLToPath(
  new URL("../../../../", import.meta.url),
);
export const LOCAL_GEMINI_CAPTURE_DIRECTORY = join(
  tmpdir(),
  "clipbuilder-runtime",
  "private-gemini-capture",
);
const permitSchema = z
  .object({
    version: z.literal(1),
    workspace: z.string(),
    expiresAt: z.number().int().positive(),
  })
  .strict();

export type PrivateGeminiCaptureEvent =
  | { kind: "stage_output"; stage: string; output: unknown }
  | {
      kind: "google_response";
      operation: GoogleOperation;
      status: number;
      responseHeaders: Record<string, string>;
      bodyUtf8: string;
      bodyBytes: number;
      complete: boolean;
      observedBytes: number;
    }
  | {
      kind: "generation_result";
      text: string | undefined;
      finished: boolean;
    }
  | {
      kind: "reconciliation_input";
      timeUnits: "milliseconds";
      mediaDurationMs: number;
      normalizedOutput: unknown;
      timing: unknown;
    }
  | { kind: "reconciliation_failure"; detail: ReconciliationDiagnostic }
  | {
      kind: "request_finished";
      outcome: "completed" | "disconnected";
      status: number | undefined;
    };
export interface PrivateGeminiCapture {
  open(
    requestId: string,
  ): ((event: PrivateGeminiCaptureEvent) => void) | undefined;
}

// Explicit, owner-authorized local capture. Never used by normal diagnostic logs.
// Files remain owner-local for diagnosis; activation expires without a timer.
export class LocalGeminiCapture implements PrivateGeminiCapture {
  constructor(
    private readonly directory = LOCAL_GEMINI_CAPTURE_DIRECTORY,
    private readonly now = Date.now,
    private readonly unavailable: () => void = () => {},
  ) {}
  private permit() {
    try {
      const permit = permitSchema.parse(
        JSON.parse(readFileSync(join(this.directory, "permit.json"), "utf8")),
      );
      const now = this.now();
      return resolve(permit.workspace) ===
        resolve(LOCAL_GEMINI_CAPTURE_WORKSPACE) &&
        permit.expiresAt > now &&
        permit.expiresAt <= now + LOCAL_GEMINI_CAPTURE_WINDOW_MS
        ? permit
        : null;
    } catch {
      return null;
    }
  }
  isArmed() {
    return this.permit() !== null;
  }
  open(requestId: string) {
    if (!requestIdSchema.safeParse(requestId).success || !this.permit())
      return undefined;
    let failed = false;
    const warn = () => {
      if (failed) return;
      failed = true;
      try {
        this.unavailable();
      } catch {
        // Diagnostic notification cannot change processing behavior.
      }
    };
    const path = join(this.directory, `${requestId}.jsonl`);
    try {
      mkdirSync(this.directory, { recursive: true, mode: 0o700 });
      writeFileSync(
        path,
        JSON.stringify({
          kind: "request_started",
          requestId,
          capturedAt: new Date(this.now()).toISOString(),
        }) + "\n",
        { encoding: "utf8", flag: "wx", mode: 0o600 },
      );
    } catch {
      warn();
      return undefined;
    }
    return (event: PrivateGeminiCaptureEvent) => {
      if (failed) return;
      try {
        appendFileSync(
          path,
          JSON.stringify({
            ...event,
            requestId,
            capturedAt: new Date(this.now()).toISOString(),
          }) + "\n",
          "utf8",
        );
      } catch {
        warn();
      }
    };
  }
}

export function composeLocalGeminiCapture(
  config: BackendConfig,
  directory = LOCAL_GEMINI_CAPTURE_DIRECTORY,
  now = Date.now,
  unavailable: () => void = () => {},
) {
  if (
    config.nodeEnv === "test" ||
    config.appEnv !== "local" ||
    config.providerMode !== "live" ||
    !config.paidDemoEnabled ||
    !config.features.liveAnalysis
  )
    return null;
  return new LocalGeminiCapture(directory, now, unavailable);
}

const timingWordsSchema = z.object({
  words: z.array(z.object({ startMs: z.number(), endMs: z.number() })),
});
export function describePrivateWordTiming(value: unknown, durationMs: number) {
  const parsed = timingWordsSchema.safeParse(value);
  if (!parsed.success) return { state: "unavailable" };
  const words = parsed.data.words;
  return {
    state: "available",
    wordCount: words.length,
    maxEndMs: words.reduce((maximum, word) => Math.max(maximum, word.endMs), 0),
    outsideWords: words.flatMap((word, index) =>
      word.endMs > durationMs
        ? [
            {
              index,
              ordinal: index + 1,
              ...word,
              overrunMs: word.endMs - durationMs,
            },
          ]
        : [],
    ),
  };
}
