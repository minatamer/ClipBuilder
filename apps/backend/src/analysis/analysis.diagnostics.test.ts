import { describe, expect, it, vi } from "vitest";
import { ApplicationError } from "../http/errorMapper.js";
import {
  AnalysisDiagnostics,
  parseAnalysisDiagnosticLine,
} from "./analysis.diagnostics.js";
import {
  GeminiAnalysisProvider,
  type GeminiTransport,
} from "./gemini.adapter.js";

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
      delete: vi.fn(async () => {
        f.advance(10);
        throw new Error("synthetic-cleanup-secret");
      }),
    };
    const provider = new GeminiAnalysisProvider(
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
    ).rejects.toMatchObject({ code: "CLEANUP_PENDING" });
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
      for (let i = 0; i < 60; i++)
        f.diagnostics.check("reconciliation", () => 1);
    });
    expect(f.lines).toHaveLength(48);
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
});
