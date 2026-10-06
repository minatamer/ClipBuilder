import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { GROUNDED_ANALYSIS_LIMITS } from "@clipbuilder/contracts";
import {
  LocalGeminiCapture,
  LOCAL_GEMINI_CAPTURE_WINDOW_MS,
  LOCAL_GEMINI_CAPTURE_WORKSPACE,
  composeLocalGeminiCapture,
  describePrivateWordTiming,
  type PrivateGeminiCaptureEvent,
} from "./gemini.local-capture.js";
import {
  AnalysisDiagnostics,
  parseAnalysisDiagnosticLine,
} from "./analysis.diagnostics.js";
import {
  GeminiAnalysisProvider,
  type GeminiTransport,
  composeGeminiTransport,
} from "./gemini.adapter.js";
import { loadConfig } from "../config/loadConfig.js";
import {
  createLiveValidationEnvironment,
  createLiveValidationConnections,
} from "../../test/environment.fixture.js";

const requestId = "req_" + "a".repeat(32);
const secondRequestId = "req_" + "b".repeat(32);
const config = () =>
  loadConfig({
    ...createLiveValidationEnvironment(),
    ...createLiveValidationConnections(),
  });
const now = 1_000_000;
function withDirectory(work: (directory: string) => void) {
  const directory = mkdtempSync(
    join(tmpdir(), "clipbuilder-synthetic-capture-"),
  );
  try {
    work(directory);
  } finally {
    removeDirectory(directory);
  }
}
function removeDirectory(directory: string) {
  if (!directory.startsWith(join(tmpdir(), "clipbuilder-synthetic-capture-")))
    throw Error("invalid_synthetic_directory");
  rmSync(directory, { recursive: true, force: true });
}
function arm(directory: string, overrides: Record<string, unknown> = {}) {
  writeFileSync(
    join(directory, "permit.json"),
    JSON.stringify({
      version: 1,
      workspace: LOCAL_GEMINI_CAPTURE_WORKSPACE,
      expiresAt: now + LOCAL_GEMINI_CAPTURE_WINDOW_MS,
      ...overrides,
    }),
  );
}
function scoped<T>(
  diagnostics: AnalysisDiagnostics,
  work: () => Promise<T>,
  id = requestId,
) {
  return new Promise<T>((resolve, reject) =>
    diagnostics.request(id, "run", (finish) => {
      work().then(
        (value) => {
          finish("completed", 200);
          resolve(value);
        },
        (error) => {
          finish("completed", 500);
          reject(error);
        },
      );
    }),
  );
}
function memoryCapture() {
  const events: PrivateGeminiCaptureEvent[] = [];
  const lines: string[] = [];
  const diagnostics = new AnalysisDiagnostics((line) => lines.push(line));
  diagnostics.enablePrivateCapture({
    open: () => (event) => {
      events.push(event);
    },
  });
  return { events, lines, diagnostics };
}

describe("owner-local full Gemini response capture", () => {
  it.each(["test", "public", "fake", "paid-off", "analysis-off"])(
    "cannot compose capture in %s mode even with a permit",
    (mode) => {
      withDirectory((directory) => {
        arm(directory);
        const base = config();
        const settings = {
          ...base,
          nodeEnv: mode === "test" ? ("test" as const) : base.nodeEnv,
          appEnv: mode === "public" ? ("production" as const) : base.appEnv,
          providerMode: mode === "fake" ? ("fake" as const) : base.providerMode,
          paidDemoEnabled: mode === "paid-off" ? false : base.paidDemoEnabled,
          features: {
            ...base.features,
            liveAnalysis:
              mode === "analysis-off" ? false : base.features.liveAnalysis,
          },
        };
        expect(
          composeLocalGeminiCapture(settings, directory, () => now),
        ).toBeNull();
      });
    },
  );
  it("requires a current workspace permit and rejects malformed, expired and overlong windows", () => {
    withDirectory((directory) => {
      const capture = new LocalGeminiCapture(directory, () => now);
      expect(capture.isArmed()).toBe(false);
      for (const overrides of [
        { workspace: "other-workspace" },
        { expiresAt: now },
        { expiresAt: now + LOCAL_GEMINI_CAPTURE_WINDOW_MS + 1 },
        { extra: "synthetic" },
      ]) {
        arm(directory, overrides);
        expect(capture.open(requestId)).toBeUndefined();
      }
      writeFileSync(join(directory, "permit.json"), "not-json");
      expect(capture.isArmed()).toBe(false);
      arm(directory);
      expect(capture.isArmed()).toBe(true);
      expect(capture.open("../invalid-path")).toBeUndefined();
    });
  });
  it("writes complete separate request files without overwriting prior evidence or altering failures", () => {
    withDirectory((directory) => {
      arm(directory);
      const unavailable = vi.fn();
      const capture = new LocalGeminiCapture(directory, () => now, unavailable);
      const first = capture.open(requestId)!;
      first({
        kind: "generation_result",
        text: "synthetic-full-output",
        finished: true,
      });
      first({ kind: "request_finished", outcome: "completed", status: 500 });
      const saved = readFileSync(join(directory, requestId + ".jsonl"), "utf8");
      expect(
        saved
          .split("\n")
          .filter(Boolean)
          .map((line) => JSON.parse(line)),
      ).toContainEqual(
        expect.objectContaining({
          kind: "generation_result",
          text: "synthetic-full-output",
        }),
      );
      expect(capture.open(requestId)).toBeUndefined();
      expect(unavailable).toHaveBeenCalledOnce();
      expect(readFileSync(join(directory, requestId + ".jsonl"), "utf8")).toBe(
        saved,
      );
      capture.open(secondRequestId)!({
        kind: "request_finished",
        outcome: "completed",
        status: 200,
      });
      removeDirectory(directory);
      expect(() =>
        first({
          kind: "generation_result",
          text: "synthetic-full-output",
          finished: true,
        }),
      ).not.toThrow();
      expect(unavailable).toHaveBeenCalledTimes(2);
    });
  });
  it("records exact timings and distinguishes a 1 ms overrun from a 251 ms overrun", () => {
    const words = [
      { startMs: 0, endMs: 1000 },
      { startMs: 1000, endMs: 1001 },
      { startMs: 1001, endMs: 1251 },
    ];
    expect(describePrivateWordTiming({ words }, 1000)).toEqual({
      state: "available",
      wordCount: 3,
      maxEndMs: 1251,
      outsideWords: [
        { index: 1, ordinal: 2, startMs: 1000, endMs: 1001, overrunMs: 1 },
        { index: 2, ordinal: 3, startMs: 1001, endMs: 1251, overrunMs: 251 },
      ],
    });
    expect(describePrivateWordTiming({ words: "invalid" }, 1000)).toEqual({
      state: "unavailable",
    });
  });
  it.each(["success", "rejection", "malformed", "oversized"])(
    "captures the complete %s response before SDK parsing with one injected HTTP call",
    async (kind) => {
      const f = memoryCapture();
      const responseBody =
        kind === "success"
          ? JSON.stringify({
              candidates: [
                {
                  finishReason: "STOP",
                  content: {
                    role: "model",
                    parts: [{ text: "synthetic-full-output" }],
                  },
                  safetyRatings: [
                    {
                      category: "HARM_CATEGORY_HARASSMENT",
                      probability: "NEGLIGIBLE",
                    },
                  ],
                },
              ],
              usageMetadata: {
                promptTokenCount: 123,
                candidatesTokenCount: 45,
                totalTokenCount: 168,
              },
              responseId: "synthetic-response-id",
              modelVersion: "synthetic-version",
              extraProviderField: { retained: true },
            })
          : kind === "rejection"
            ? JSON.stringify({
                error: {
                  code: 400,
                  status: "INVALID_ARGUMENT",
                  message: "synthetic-full-rejection",
                  details: [{ synthetic: true }],
                },
              })
            : kind === "malformed"
              ? "synthetic-invalid-json"
              : "x".repeat(GROUNDED_ANALYSIS_LIMITS.responseBytes + 1);
      const transport = vi.fn<typeof fetch>(
        async () =>
          new Response(responseBody, {
            status: kind === "rejection" ? 400 : 200,
            headers: {
              "content-type": "application/json",
              "x-synthetic-response": "retained",
            },
          }),
      );
      const gateway = composeGeminiTransport(
        config(),
        transport,
        f.diagnostics,
      );
      const run = scoped(f.diagnostics, () =>
        gateway.candidates(
          "synthetic-fixed-transcript",
          new AbortController().signal,
        ),
      );
      if (kind === "success")
        await expect(run).resolves.toEqual({
          text: "synthetic-full-output",
          finished: true,
        });
      else await expect(run).rejects.toBeDefined();
      expect(transport).toHaveBeenCalledOnce();
      const response = f.events.find((e) => e.kind === "google_response");
      expect(response).toMatchObject({
        kind: "google_response",
        operation: "generate_content",
        status: kind === "rejection" ? 400 : 200,
        complete: kind !== "oversized",
        responseHeaders: { "x-synthetic-response": "retained" },
      });
      if (response?.kind !== "google_response")
        throw Error("missing_synthetic_response");
      expect(response.bodyUtf8).toBe(
        kind === "oversized"
          ? responseBody.slice(0, GROUNDED_ANALYSIS_LIMITS.responseBytes)
          : responseBody,
      );
      expect(response.observedBytes).toBe(responseBody.length);
      for (const line of f.lines)
        expect(parseAnalysisDiagnosticLine(line)).not.toBeNull();
      expect(f.lines.join("\n")).not.toMatch(
        /synthetic-full-output|synthetic-full-rejection|synthetic-response-id|extraProviderField/,
      );
    },
  );
  it("records the received prefix as incomplete when an upstream stream disconnects", async () => {
    const f = memoryCapture();
    const prefix = new TextEncoder().encode('{"synthetic":"received-prefix');
    let reads = 0;
    const transport = vi.fn<typeof fetch>(
      async () =>
        new Response(
          new ReadableStream({
            pull(controller) {
              if (reads++ === 0) controller.enqueue(prefix);
              else controller.error(new Error("synthetic-disconnect"));
            },
          }),
        ),
    );
    const gateway = composeGeminiTransport(config(), transport, f.diagnostics);
    await expect(
      scoped(f.diagnostics, () =>
        gateway.candidates(
          "synthetic-transcript",
          new AbortController().signal,
        ),
      ),
    ).rejects.toBeDefined();
    expect(transport).toHaveBeenCalledOnce();
    expect(f.events).toContainEqual(
      expect.objectContaining({
        kind: "google_response",
        operation: "generate_content",
        bodyUtf8: new TextDecoder().decode(prefix),
        bodyBytes: prefix.length,
        observedBytes: prefix.length,
        complete: false,
      }),
    );
  });
  it("opens selected-assembly capture and preserves provider output for nonfatal reconciliation", async () => {
    const f = memoryCapture(),
      raw = {
        text: JSON.stringify({
          unknownProviderField: "synthetic-selected-private-output",
          speaker: "invalid",
        }),
        finished: true,
      };
    const transport: GeminiTransport = {
      upload: vi.fn(async (name) => ({
        name,
        state: "ACTIVE",
        mimeType: "video/mp4",
        uri: `https://generativelanguage.googleapis.com/v1beta/${name}`,
      })),
      get: vi.fn(),
      delete: vi.fn(async () => {}),
      generate: vi.fn(async () => raw),
      transcribe: vi.fn(),
      candidates: vi.fn(),
    };
    const files = new GeminiAnalysisProvider(
      transport,
      1000,
      undefined,
      f.diagnostics,
    );
    await expect(
      new Promise<unknown>((resolve, reject) =>
        f.diagnostics.request(secondRequestId, "assemble", (finish) => {
          files
            .analyze(
              new Blob(["synthetic-video"], { type: "video/mp4" }),
              new AbortController().signal,
              "synthetic-scope",
              {
                policy: "Synthetic selected policy",
                prompt: "Synthetic selected request",
                schema: z.object({ accepted: z.literal(true) }).strict(),
                videoFps: 5,
              },
            )
            .then(
              (value) => {
                finish("completed", 200);
                resolve(value);
              },
              (error) => {
                finish("completed", 502);
                reject(error);
              },
            );
        }),
      ),
    ).resolves.toEqual(JSON.parse(raw.text));
    expect(f.events).toContainEqual(
      expect.objectContaining({
        kind: "stage_output",
        stage: "selected_plan_raw",
        output: raw,
      }),
    );
    expect(transport.generate).toHaveBeenCalledOnce();
    expect(transport.delete).toHaveBeenCalledOnce();
    expect(transport.transcribe).not.toHaveBeenCalled();
    expect(transport.candidates).not.toHaveBeenCalled();
    expect(f.lines.map((line) => JSON.parse(line))).toContainEqual(
      expect.objectContaining({
        action: "assemble",
        outcome: "completed",
        applicationHttpStatus: 200,
      }),
    );
    expect(f.lines.join("\n")).not.toContain(
      "synthetic-selected-private-output",
    );
  });
  it("keeps private capture independent of normal log budgets and survives broken sinks", async () => {
    const f = memoryCapture();
    await scoped(f.diagnostics, async () => {
      for (let i = 0; i < 60; i++)
        f.diagnostics.check("proxy_validation", () => true);
      f.diagnostics.privateGenerationResult({
        text: "synthetic-full-output",
        finished: true,
      });
      f.diagnostics.privateReconciliationInput(
        { words: [{ startMs: 0, endMs: 1001 }], candidates: [] },
        1000,
      );
    });
    expect(f.events).toContainEqual(
      expect.objectContaining({
        kind: "generation_result",
        text: "synthetic-full-output",
      }),
    );
    expect(f.events).toContainEqual(
      expect.objectContaining({
        kind: "reconciliation_input",
        mediaDurationMs: 1000,
        normalizedOutput: {
          words: [{ startMs: 0, endMs: 1001 }],
          candidates: [],
        },
      }),
    );
    expect(f.events.at(-1)).toMatchObject({ kind: "request_finished" });
    f.diagnostics.enablePrivateCapture({
      open: () => () => {
        throw Error("synthetic-broken-sink");
      },
    });
    await expect(
      scoped(
        f.diagnostics,
        async () => {
          f.diagnostics.privateGenerationResult({
            text: "synthetic-full-output",
            finished: true,
          });
          return "unchanged";
        },
        secondRequestId,
      ),
    ).resolves.toBe("unchanged");
    f.diagnostics.enablePrivateCapture({
      open: () => {
        throw Error("synthetic-broken-open");
      },
    });
    await expect(
      scoped(f.diagnostics, async () => "unchanged", secondRequestId),
    ).resolves.toBe("unchanged");
  });
});
