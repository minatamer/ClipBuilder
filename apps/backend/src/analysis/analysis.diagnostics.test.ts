import {
  TestGeminiFiles,
  syntheticVideoTask,
} from "../../test/gemini-file.fixture.js";
import { describe, expect, it, vi } from "vitest";
import { ApplicationError } from "../http/errorMapper.js";
import { z } from "zod";
import {
  ReconciliationFailure,
  reconciliationSchemaDiagnostic,
} from "./analysis.reconciliation-diagnostics.js";
import {
  AnalysisDiagnostics,
  ANALYSIS_DIAGNOSTIC_RECORD_LIMIT,
  parseAnalysisDiagnosticLine,
} from "./analysis.diagnostics.js";
import {
  composeGeminiTransport,
  type GeminiTransport,
} from "./gemini.adapter.js";
import { loadConfig } from "../config/loadConfig.js";
import {
  createLiveValidationEnvironment,
  createLiveValidationConnections,
} from "../../test/environment.fixture.js";

const requestId = `req_${"a".repeat(32)}`;
function fixture() {
  const lines: string[] = [];
  let now = 0;
  const diagnostics = new AnalysisDiagnostics(
    (line) => lines.push(line),
    () => now,
  );
  return {
    diagnostics,
    lines,
    advance: (ms: number) => {
      now += ms;
    },
  };
}
function scoped<T>(
  diagnostics: AnalysisDiagnostics,
  work: () => Promise<T>,
  id = requestId,
) {
  return new Promise<T>((resolve, reject) => {
    diagnostics.request(id, "run", (finish) => {
      work().then(
        (value) => {
          finish("completed", 200);
          resolve(value);
        },
        (error: unknown) => {
          finish("completed", 500);
          reject(error);
        },
      );
    });
  });
}
describe("bounded content-free analysis diagnostics", () => {
  it("records useful assembly schema locations while excluding issue messages, keys and values", async () => {
    const f = fixture();
    const failure = new z.ZodError(
      Array.from({ length: 20 }, () => ({
        code: "custom" as const,
        path: ["speaker", "shots", 1, "synthetic-private-key"],
        message: "synthetic-private-message-and-value",
      })),
    );
    await expect(
      scoped(f.diagnostics, async () =>
        f.diagnostics.check("assembly_plan_parse", () => {
          throw failure;
        }),
      ),
    ).rejects.toBe(failure);
    const records = f.lines.map((line) => JSON.parse(line));
    expect(records).toContainEqual(
      expect.objectContaining({
        phase: "assembly_plan_parse",
        outcome: "failed",
        message: "Returned speaker and card plan schema parsing: failed",
        validation: {
          reason: "schema_invalid",
          issueCount: 20,
          issues: Array.from({ length: 6 }, () => ({
            code: "custom",
            path: "speaker.shots.1.[field]",
          })),
        },
      }),
    );
    expect(f.lines.join("\n")).not.toContain("synthetic-private");
    for (const line of f.lines)
      expect(parseAnalysisDiagnosticLine(line)).not.toBeNull();
  });
  it("keeps multiple assembly causes and the terminal record after progress saturation", async () => {
    const f = fixture();
    await scoped(f.diagnostics, async () => {
      for (let i = 0; i < 300; i++)
        f.diagnostics.check("assembly_proxy_validation", () => 1);
      for (const [phase, reason] of [
        ["assembly_focus", "speaker_evidence_rejected"],
        ["proxy_cleanup", "synthetic-private-cleanup"],
        ["source_cleanup", "synthetic-private-cancel"],
      ] as const)
        f.diagnostics.failure(phase, new Error(reason));
    });
    const records = f.lines.map((line) => JSON.parse(line));
    for (const phase of ["assembly_focus", "proxy_cleanup", "source_cleanup"])
      expect(records).toContainEqual(
        expect.objectContaining({ phase, outcome: "failed" }),
      );
    expect(records.at(-1)).toMatchObject({
      phase: "request",
      outcome: "completed",
      droppedRecords: expect.any(Number),
    });
    expect(records.at(-1).droppedRecords).toBeGreaterThan(0);
    expect(records.length).toBeLessThanOrEqual(
      ANALYSIS_DIAGNOSTIC_RECORD_LIMIT,
    );
    expect(f.lines.join("\n")).not.toContain("synthetic-private");
  });
  it("rejects arbitrary descriptive messages in managed runtime logs", () => {
    const record = {
      event: "analysis_diagnostic",
      requestId,
      action: "assemble",
      phase: "assembly_preview",
      outcome: "failed",
      elapsedMs: 1,
      message: "synthetic-private",
    };
    expect(parseAnalysisDiagnosticLine(JSON.stringify(record))).toBeNull();
    const { message: _message, ...safeRecord } = record;
    void _message;
    for (const path of [
      "secretpassword",
      "speaker.privatekey",
      "speaker.shots.1000001",
      "speaker..shots",
    ])
      expect(
        parseAnalysisDiagnosticLine(
          JSON.stringify({
            ...safeRecord,
            validation: {
              reason: "schema_invalid",
              issueCount: 1,
              issues: [{ code: "custom", path }],
            },
          }),
        ),
      ).toBeNull();
  });
  it("keeps the largest permitted reconciliation failure within the safe line limit", async () => {
    const f = fixture();
    const error = new ReconciliationFailure({
      rule: "candidate_caveat_grounding",
      path: Array.from({ length: 8 }, () => "diarizationAvailable"),
      issues: Array.from({ length: 4 }, () => ({
        code: "unrecognized_keys",
        constraint: "candidate_ids_ranks_unique",
        path: Array.from({ length: 8 }, () => "diarizationAvailable"),
      })),
      issueCount: 1_000_000,
      truncated: true,
    });
    await expect(
      scoped(f.diagnostics, async () =>
        f.diagnostics.check("reconciliation", () => {
          throw error;
        }),
      ),
    ).rejects.toBe(error);
    for (const line of f.lines) {
      expect(line.length).toBeLessThanOrEqual(2048);
      expect(parseAnalysisDiagnosticLine(line)).not.toBeNull();
    }
    expect(f.lines.map((line) => JSON.parse(line))).toContainEqual(
      expect.objectContaining({
        phase: "reconciliation",
        outcome: "failed",
        reconciliation: expect.objectContaining({ issueCount: 1_000_000 }),
      }),
    );
  });
  it("retains private reconciliation metadata at each failure phase without changing the thrown error", async () => {
    const f = fixture();
    const error = new ReconciliationFailure({
      rule: "candidate_title_quote",
      path: ["candidates", 0, "title"],
    });
    await expect(
      scoped(f.diagnostics, async () => {
        try {
          f.diagnostics.check("reconciliation", () => {
            throw error;
          });
        } catch (caught) {
          f.diagnostics.failure("analysis_result", caught);
          f.diagnostics.failure("request", caught, 500);
          throw caught;
        }
      }),
    ).rejects.toBe(error);
    const records = f.lines.map((line) => JSON.parse(line));
    for (const phase of ["reconciliation", "analysis_result", "request"])
      expect(records).toContainEqual(
        expect.objectContaining({
          phase,
          outcome: "failed",
          code: "MODEL_OUTPUT_REJECTED",
          reconciliation: {
            rule: "candidate_title_quote",
            path: ["candidates", 0, "title"],
          },
        }),
      );
    for (const line of f.lines)
      expect(parseAnalysisDiagnosticLine(line)).not.toBeNull();
    const broken = new AnalysisDiagnostics(() => {
      throw Error("synthetic-private");
    });
    await expect(
      scoped(broken, async () =>
        broken.check("reconciliation", () => {
          throw error;
        }),
      ),
    ).rejects.toBe(error);
  });
  it("strictly rejects arbitrary reconciliation strings, issue payloads and oversized summaries", () => {
    const record = {
      event: "analysis_diagnostic",
      diagnosticVersion: 2,
      requestId,
      action: "run",
      phase: "reconciliation",
      outcome: "failed",
      elapsedMs: 6,
      reconciliation: { rule: "word_overlap", path: ["words", 1, "startMs"] },
    };
    expect(parseAnalysisDiagnosticLine(JSON.stringify(record))).not.toBeNull();
    const issue = {
      code: "custom",
      constraint: "candidate_duration",
      path: ["candidates", 0],
    };
    for (const reconciliation of [
      { ...record.reconciliation, rule: "synthetic-private" },
      { ...record.reconciliation, path: ["synthetic-private"] },
      { ...record.reconciliation, message: "synthetic-private" },
      { ...record.reconciliation, startMs: 751 },
      {
        ...record.reconciliation,
        issues: [{ ...issue, message: "synthetic-private" }],
      },
      {
        ...record.reconciliation,
        issues: [{ ...issue, constraint: "synthetic-private" }],
      },
      {
        ...record.reconciliation,
        issues: Array.from({ length: 5 }, () => issue),
      },
      {
        ...record.reconciliation,
        path: Array.from({ length: 9 }, () => "words"),
      },
      { ...record.reconciliation, path: ["words", -1] },
      { ...record.reconciliation, issueCount: 1_000_001 },
    ])
      expect(
        parseAnalysisDiagnosticLine(
          JSON.stringify({ ...record, reconciliation }),
        ),
      ).toBeNull();
  });
  it("summarizes schema issues without messages, inputs, unknown field names or nested union payloads", () => {
    const error = new z.ZodError(
      Array.from({ length: 9 }, () => ({
        code: "custom",
        path: [
          "candidates",
          0,
          "synthetic-private",
          ...Array.from({ length: 9 }, () => "words"),
        ],
        message: "synthetic-private",
        input: "synthetic-private",
      })),
    );
    const detail = reconciliationSchemaDiagnostic(
      "analysis_bundle_schema",
      error,
    );
    expect(detail).toMatchObject({
      rule: "analysis_bundle_schema",
      issueCount: 9,
      truncated: true,
    });
    expect(detail.issues).toHaveLength(4);
    expect(detail.issues?.[0]).toEqual({
      code: "custom",
      constraint: "unclassified",
      path: [
        "candidates",
        0,
        "unrecognized",
        ...Array.from({ length: 5 }, () => "words"),
      ],
    });
    expect(JSON.stringify(detail)).not.toContain("synthetic-private");
    expect(
      reconciliationSchemaDiagnostic(
        "provider_schema",
        new TypeError("synthetic-private"),
      ),
    ).toEqual({ rule: "unexpected_error", path: [] });
  });
  it("reserves the reconciliation cause after the regular logging budget is exhausted", async () => {
    const f = fixture();
    const error = new ReconciliationFailure({
      rule: "turn_partition_gap",
      path: ["turns", 1],
    });
    await expect(
      scoped(f.diagnostics, async () => {
        for (let i = 0; i < 300; i++)
          f.diagnostics.check("proxy_validation", () => 1);
        f.diagnostics.check("reconciliation", () => {
          throw error;
        });
      }),
    ).rejects.toBe(error);
    const records = f.lines.map((line) => JSON.parse(line));
    expect(records.length).toBeLessThanOrEqual(
      ANALYSIS_DIAGNOSTIC_RECORD_LIMIT,
    );
    expect(records).toContainEqual(
      expect.objectContaining({
        phase: "reconciliation",
        outcome: "failed",
        reconciliation: { rule: "turn_partition_gap", path: ["turns", 1] },
      }),
    );
    expect(records.at(-1)).toMatchObject({
      phase: "request",
      outcome: "completed",
      droppedRecords: expect.any(Number),
    });
    expect(records.at(-1).droppedRecords).toBeGreaterThan(0);
  });
  it("omits malformed private metadata without changing processing failures", async () => {
    const f = fixture();
    const error = new ReconciliationFailure({
      rule: "word_overlap",
      path: ["words", 1],
    });
    Object.defineProperty(error, "reconciliation", {
      value: {
        rule: "word_overlap",
        path: ["words", 1],
        message: "synthetic-private",
      },
    });
    await expect(
      scoped(f.diagnostics, async () =>
        f.diagnostics.check("reconciliation", () => {
          throw error;
        }),
      ),
    ).rejects.toBe(error);
    const failed = f.lines
      .map((line) => JSON.parse(line))
      .find((record) => record.outcome === "failed");
    expect(failed).toMatchObject({ code: "MODEL_OUTPUT_REJECTED" });
    expect(failed).not.toHaveProperty("reconciliation");
    expect(f.lines.join("\n")).not.toContain("synthetic-private");
  });
  it("lets the launcher retain only fully validated structural records", () => {
    const record = {
      event: "analysis_diagnostic",
      requestId,
      action: "run",
      phase: "gemini_generation",
      outcome: "failed",
      elapsedMs: 250,
      upstreamHttpStatus: 400,
      rules: ["google_generation_http_400"],
    };
    expect(parseAnalysisDiagnosticLine(JSON.stringify(record))).toBe(
      JSON.stringify(record),
    );
    for (const invalid of [
      { ...record, message: "private payload" },
      { ...record, rules: ["private payload"] },
      { ...record, phase: "private payload" },
      { ...record, requestId: "private account" },
      { ...record, upstreamHttpStatus: 700 },
    ])
      expect(parseAnalysisDiagnosticLine(JSON.stringify(invalid))).toBeNull();
    expect(parseAnalysisDiagnosticLine("x".repeat(2049))).toBeNull();
    expect(parseAnalysisDiagnosticLine("invalid json")).toBeNull();
  });
  it("keeps generation status and timing before a later cleanup failure, with exact fake call counts", async () => {
    const f = fixture();
    const transport: GeminiTransport = {
      upload: vi.fn(async (name) => ({
        name,
        mimeType: "video/mp4",
        state: "ACTIVE",
        uri: `https://generativelanguage.googleapis.com/v1beta/${name}`,
      })),
      get: vi.fn(),
      generate: vi.fn(async () => {
        f.advance(125);
        throw Object.assign(
          new Error("synthetic-secret payload and provider file URL"),
          { status: 429 },
        );
      }),
      transcribe: vi.fn(),
      candidates: vi.fn(),
      delete: vi.fn(async () => {
        f.advance(10);
        throw new Error("synthetic-cleanup-secret");
      }),
    };
    const provider = new TestGeminiFiles(
      transport,
      1000,
      undefined,
      f.diagnostics,
    );
    await expect(
      scoped(f.diagnostics, () =>
        provider.analyze(
          new Blob([new Uint8Array([1])], { type: "video/mp4" }),
          new AbortController().signal,
          "synthetic-private-session",
        ),
      ),
    ).rejects.toMatchObject({
      code: "ANALYSIS_PROVIDER_FAILED",
      ruleId: "google_generation_http_429",
    });
    expect(transport.upload).toHaveBeenCalledOnce();
    expect(transport.generate).toHaveBeenCalledOnce();
    expect(transport.get).not.toHaveBeenCalled();
    expect(transport.delete).toHaveBeenCalledOnce();
    const records = f.lines.map((line) => JSON.parse(line));
    const generation = records.findIndex(
      (record) =>
        record.phase === "gemini_generation" &&
        record.upstreamHttpStatus === 429,
    );
    const cleanup = records.findIndex(
      (record) =>
        record.phase === "gemini_cleanup" && record.outcome === "failed",
    );
    expect(generation).toBeGreaterThan(0);
    expect(cleanup).toBeGreaterThan(generation);
    expect(records[generation]).toMatchObject({
      requestId,
      elapsedMs: 125,
      errorClass: "Error",
    });
    expect(records).toContainEqual(
      expect.objectContaining({
        code: "ANALYSIS_PROVIDER_FAILED",
        rules: ["google_generation_http_429"],
      }),
    );
    expect(records.at(-1)).toMatchObject({
      phase: "request",
      outcome: "completed",
      applicationHttpStatus: 500,
      elapsedMs: 135,
    });
    expect(f.lines.join("\n")).not.toMatch(
      /synthetic-secret|payload|files\/cb-|generativelanguage|synthetic-private-session|synthetic-cleanup-secret/,
    );
  });
  it("keeps concurrent request correlation separate across interleaved awaits", async () => {
    const f = fixture();
    let release = () => {};
    const wait = new Promise<void>((resolve) => {
      release = resolve;
    });
    const first = scoped(f.diagnostics, () =>
      f.diagnostics.step("media_prepare", async () => {
        await wait;
        throw Object.assign(new Error("private"), { status: 503 });
      }),
    );
    await scoped(
      f.diagnostics,
      () =>
        f.diagnostics.step("proxy_fetch", async () => {
          release();
          return 1;
        }),
      `req_${"b".repeat(32)}`,
    );
    await expect(first).rejects.toThrow("private");
    const records = f.lines.map((line) => JSON.parse(line));
    expect(
      records
        .filter((record) => record.phase === "media_prepare")
        .every((record) => record.requestId === requestId),
    ).toBe(true);
    expect(
      records
        .filter((record) => record.phase === "proxy_fetch")
        .every((record) => record.requestId === `req_${"b".repeat(32)}`),
    ).toBe(true);
    expect(records).toContainEqual(
      expect.objectContaining({
        phase: "media_prepare",
        outcome: "failed",
        upstreamHttpStatus: 503,
      }),
    );
  });
  it("drops arbitrary rule/error details, accepts only structural network codes, and bounds record count", async () => {
    const f = fixture();
    await scoped(f.diagnostics, async () => {
      f.diagnostics.failure(
        "request",
        new ApplicationError({
          code: "ANALYSIS_PROVIDER_FAILED",
          ruleId: "private-credential",
        }),
        500,
      );
      f.diagnostics.failure(
        "gemini_generation",
        new TypeError("private-prompt", {
          cause: Object.assign(new Error("private-host"), {
            code: "ENOTFOUND",
          }),
        }),
      );
      f.diagnostics.failure(
        "gemini_generation",
        Object.assign(new Error("private"), {
          status: "private",
          name: "private-name",
          code: "private-code",
        }),
      );
      for (let i = 0; i < 300; i++)
        f.diagnostics.check("reconciliation", () => 1);
    });
    expect(f.lines.length).toBeLessThanOrEqual(
      ANALYSIS_DIAGNOSTIC_RECORD_LIMIT,
    );
    expect(JSON.parse(f.lines.at(-1)!)).toMatchObject({
      phase: "request",
      outcome: "completed",
      droppedRecords: expect.any(Number),
    });
    expect(f.lines.join("\n")).not.toMatch(/private/);
    expect(f.lines.join("\n")).toContain("ENOTFOUND");
  });
  it("logging failure cannot replace work results or failures and unscoped work emits nothing", async () => {
    const write = vi.fn(() => {
      throw new Error("sink unavailable");
    });
    const diagnostics = new AnalysisDiagnostics(write);
    expect(await diagnostics.step("gemini_generation", async () => 7)).toBe(7);
    expect(write).not.toHaveBeenCalled();
    const failure = new Error("original failure");
    await expect(
      scoped(diagnostics, () =>
        diagnostics.step("gemini_generation", async () => {
          throw failure;
        }),
      ),
    ).rejects.toBe(failure);
    expect(
      await scoped(diagnostics, async () =>
        diagnostics.check("reconciliation", () => 8),
      ),
    ).toBe(8);
    expect(write).toHaveBeenCalled();
    const poisoned = Object.defineProperty(new Error(), "status", {
      get() {
        throw new Error("unsafe getter");
      },
    });
    await expect(
      scoped(diagnostics, () =>
        diagnostics.step("proxy_fetch", async () => {
          throw poisoned;
        }),
      ),
    ).rejects.toBe(poisoned);
  });
  it("retains HTTP and pinned-SDK rejection details before mapping/cleanup, with exact injected call counts", async () => {
    const f = fixture();
    let name = "";
    const calls: string[] = [];
    const transport: typeof fetch = async (url, options) => {
      const path = new URL(String(url)),
        method = options?.method ?? "GET";
      if (path.pathname === "/upload/v1beta/files" && !path.search) {
        calls.push("upload_start");
        name = JSON.parse(String(options?.body)).file.name;
        return new Response(null, {
          headers: {
            "x-goog-upload-url":
              "https://generativelanguage.googleapis.com/upload/v1beta/files?upload_id=synthetic-private",
          },
        });
      }
      if (path.pathname === "/upload/v1beta/files") {
        calls.push("upload_finalize");
        return Response.json(
          {
            file: {
              name,
              state: "ACTIVE",
              uri: "https://generativelanguage.googleapis.com/v1beta/" + name,
              mimeType: "video/mp4",
            },
          },
          { headers: { "x-goog-upload-status": "final" } },
        );
      }
      if (path.pathname.endsWith(":generateContent")) {
        calls.push("generation");
        return Response.json(
          {
            error: {
              code: 400,
              status: "INVALID_ARGUMENT",
              message:
                "Requested schema exceeds maximum allowed complexity. synthetic-private-payload",
              details: [
                {
                  "@type": "type.googleapis.com/google.rpc.BadRequest",
                  fieldViolations: [
                    {
                      field:
                        "generation_config.response_json_schema.properties[0].value.items",
                      description:
                        "Invalid schema items. synthetic-private-key",
                    },
                  ],
                },
              ],
            },
          },
          { status: 400 },
        );
      }
      if (method === "DELETE") {
        calls.push("delete");
        return Response.json({});
      }
      calls.push("delete_confirm");
      return Response.json(
        {
          error: {
            code: 404,
            status: "NOT_FOUND",
            message: "synthetic-private-file",
          },
        },
        { status: 404 },
      );
    };
    const config = loadConfig({
      ...createLiveValidationEnvironment(),
      ...createLiveValidationConnections("assembly"),
    });
    const provider = new TestGeminiFiles(
      composeGeminiTransport(config, transport, f.diagnostics),
      1000,
      undefined,
      f.diagnostics,
    );
    await expect(
      scoped(f.diagnostics, () =>
        provider.analyze(
          new Blob([new Uint8Array([1])], { type: "video/mp4" }),
          new AbortController().signal,
        ),
      ),
    ).rejects.toMatchObject({
      code: "ANALYSIS_PROVIDER_FAILED",
      ruleId: "google_generation_http_400",
    });
    expect(calls).toEqual([
      "upload_start",
      "upload_finalize",
      "generation",
      "delete",
      "delete_confirm",
    ]);
    const records = f.lines.map((line) => JSON.parse(line));
    expect(records).toContainEqual(
      expect.objectContaining({
        phase: "gemini_request",
        diagnosticVersion: 2,
        generationRequest: expect.objectContaining({
          purpose: "selected_plan",
          schemaPolicy: "json_only",
          schemaLocation: "prompt",
          model: "gemini-3.8-flash",
          sdkAttempts: 1,
          schema: expect.objectContaining({
            tuples: 0,
            booleanItems: 0,
            maxArrayItems: 12000,
          }),
        }),
      }),
    );
    const rejection = records.findIndex(
      (record) =>
        record.providerOperation === "generate_content" &&
        record.providerHttpStatus === 400,
    );
    expect(records[rejection]).toMatchObject({
      phase: "google_http",
      outcome: "completed",
      google: {
        status: "INVALID_ARGUMENT",
        detailsState: "classified",
        parameters: ["generationConfig.responseJsonSchema"],
        schemaKeywords: expect.arrayContaining(["items"]),
        categories: expect.arrayContaining([
          "schema_complexity",
          "schema_invalid",
        ]),
      },
    });
    expect(
      records.findIndex(
        (record) =>
          record.phase === "gemini_cleanup" && record.outcome === "started",
      ),
    ).toBeGreaterThan(rejection);
    expect(records).toContainEqual(
      expect.objectContaining({
        phase: "gemini_generation",
        outcome: "failed",
        upstreamHttpStatus: 400,
        google: expect.objectContaining({ status: "INVALID_ARGUMENT" }),
      }),
    );
    expect(records).toContainEqual(
      expect.objectContaining({
        providerOperation: "files_get",
        providerHttpStatus: 404,
        outcome: "completed",
      }),
    );
    expect(f.lines.join("\n")).not.toMatch(
      /synthetic-private|files\/cb-|generativelanguage|One audible|Full-source/,
    );
    for (const line of f.lines)
      expect(parseAnalysisDiagnosticLine(line)).not.toBeNull();
  });
  it("captures manual Files API errors and never changes a result when the diagnostic sink throws", async () => {
    const f = fixture();
    const transport = vi.fn(async () =>
      Response.json(
        {
          error: {
            code: 403,
            status: "PERMISSION_DENIED",
            message: "synthetic-private",
            details: [
              {
                "@type": "type.googleapis.com/google.rpc.ErrorInfo",
                reason: "API_KEY_SERVICE_BLOCKED",
                metadata: { key: "synthetic-private" },
              },
            ],
          },
        },
        { status: 403 },
      ),
    );
    const config = loadConfig({
      ...createLiveValidationEnvironment(),
      ...createLiveValidationConnections("assembly"),
    });
    const provider = new TestGeminiFiles(
      composeGeminiTransport(config, transport, f.diagnostics),
      1000,
      undefined,
      f.diagnostics,
    );
    await expect(
      scoped(f.diagnostics, () =>
        provider.analyze(
          new Blob([new Uint8Array([1])], { type: "video/mp4" }),
          new AbortController().signal,
        ),
      ),
    ).rejects.toMatchObject({ ruleId: "google_files_upload_start_http_403" });
    expect(transport).toHaveBeenCalledOnce();
    expect(f.lines.map((line) => JSON.parse(line))).toContainEqual(
      expect.objectContaining({
        providerOperation: "files_upload_start",
        providerHttpStatus: 403,
        google: expect.objectContaining({
          status: "PERMISSION_DENIED",
          reasons: ["API_KEY_SERVICE_BLOCKED"],
          categories: expect.arrayContaining(["key_blocked"]),
        }),
      }),
    );
    const broken = new AnalysisDiagnostics(() => {
      throw new Error("sink unavailable");
    });
    const gateway = composeGeminiTransport(config, transport, broken);
    await expect(
      scoped(broken, () =>
        gateway.generate(
          "https://generativelanguage.googleapis.com/v1beta/files/synthetic",
          new AbortController().signal,
          syntheticVideoTask,
        ),
      ),
    ).rejects.toMatchObject({ name: "ApiError", status: 403 });
    expect(transport).toHaveBeenCalledTimes(2);
  });
  it("reserves the final status and late failure when regular records fill the budget", async () => {
    const f = fixture();
    await scoped(f.diagnostics, async () => {
      for (let i = 0; i < 300; i++)
        f.diagnostics.check("reconciliation", () => 1);
      f.diagnostics.googleHttpResponse(
        "generate_content",
        400,
        20,
        new TextEncoder().encode(
          JSON.stringify({
            error: {
              status: "INVALID_ARGUMENT",
              message: "Invalid parameter maxOutputTokens.",
            },
          }),
        ),
      );
      f.diagnostics.failure(
        "gemini_generation",
        new ApplicationError({
          code: "ANALYSIS_PROVIDER_FAILED",
          ruleId: "google_generation_http_400",
        }),
      );
    });
    const records = f.lines.map((line) => JSON.parse(line));
    expect(records.length).toBeLessThanOrEqual(
      ANALYSIS_DIAGNOSTIC_RECORD_LIMIT,
    );
    expect(records).toContainEqual(
      expect.objectContaining({
        providerOperation: "generate_content",
        providerHttpStatus: 400,
      }),
    );
    expect(records).toContainEqual(
      expect.objectContaining({
        phase: "gemini_generation",
        outcome: "failed",
      }),
    );
    expect(records.at(-1)).toMatchObject({
      phase: "request",
      outcome: "completed",
      droppedRecords: expect.any(Number),
    });
    expect(records.at(-1).droppedRecords).toBeGreaterThan(0);
    expect(
      parseAnalysisDiagnosticLine(
        JSON.stringify({ ...records.at(-1), google: { message: "private" } }),
      ),
    ).toBeNull();
  });
});
