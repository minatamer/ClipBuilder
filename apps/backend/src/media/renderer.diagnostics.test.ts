import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  AnalysisDiagnostics,
  parseAnalysisDiagnosticLine,
} from "../analysis/analysis.diagnostics.js";
import { loadConfig } from "../config/loadConfig.js";
import { mapError } from "../http/errorMapper.js";
import { CloudRendererClient } from "./renderer.cloudrun.js";
import {
  RendererRequestFailure,
  rendererDiagnosticSchema,
} from "./renderer.diagnostics.js";

const input = {
  binding: {
    sessionId: "ses_" + "a".repeat(22),
    sourceRevision: "rev_" + "b".repeat(22),
    fingerprint: "a".repeat(64),
  },
  bytes: 1024,
  contentType: "video/mp4" as const,
  rightsAcknowledged: true as const,
  dataTransferAcknowledged: true as const,
};
const requestId = "req_" + "c".repeat(32);
function fixture(
  transport: typeof fetch,
  identity = {
    async authorization() {
      return "Bearer private-sentinel";
    },
  },
  write?: (line: string) => void,
) {
  const lines: string[] = [];
  const diagnostics = new AnalysisDiagnostics(
    write ?? ((line) => lines.push(line)),
  );
  const config = loadConfig(
    {},
    {
      rendererOrigin: "https://private-sentinel.run.app",
      approvals: { cloudSpend: true },
    },
  );
  const client = new CloudRendererClient(
    config,
    identity,
    transport,
    diagnostics,
  );
  function scope<T>(work: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      diagnostics.request(requestId, "run", (finish) => {
        void work().then(
          (value) => {
            finish("completed", 200);
            resolve(value);
          },
          (error) => {
            const status = mapError(error, requestId).status;
            diagnostics.failure("media_prepare", error, status);
            finish("completed", status);
            reject(error);
          },
        );
      });
    });
  }
  const run = (signal = new AbortController().signal) =>
    scope(() => client.upload(input, signal));
  const records = () =>
    lines.map((line) =>
      z
        .object({
          phase: z.string(),
          renderer: rendererDiagnosticSchema.optional(),
        })
        .parse(JSON.parse(parseAnalysisDiagnosticLine(line) ?? "{}")),
    );
  return { lines, client, run, records, scope };
}
describe("safe actionable renderer boundary diagnostics", () => {
  it("preserves streaming body ownership and marks only received headers complete", async () => {
    const response = new Response("synthetic bytes", {
      headers: { "Content-Type": "video/mp4" },
    });
    const f = fixture(async () => response);
    const result = await f.scope(() =>
      f.client.previewContent(
        { binding: input.binding, manifestHash: "a".repeat(64) },
        undefined,
        new AbortController().signal,
      ),
    );
    await expect(result.text()).resolves.toBe("synthetic bytes");
    expect(
      f.records().find((record) => record.phase === "renderer_request")
        ?.renderer,
    ).toMatchObject({
      operation: "preview-content",
      phase: "headers",
      httpStatus: 200,
      responseComplete: false,
    });
  });
  it("distinguishes audio content-type rejection and logs completed bounded audio fetches", async () => {
    const bad = fixture(
      async () =>
        new Response("private-sentinel", {
          headers: { "Content-Type": "video/mp4" },
        }),
    );
    await expect(
      bad.scope(() =>
        bad.client.audio(input.binding, new AbortController().signal),
      ),
    ).rejects.toMatchObject({ code: "STORAGE_FAILED" });
    expect(
      bad.records().find((record) => record.phase === "renderer_request")
        ?.renderer,
    ).toMatchObject({
      operation: "analysis-audio",
      httpStatus: 200,
      failure: "content_type_invalid",
    });
    expect(bad.lines.join("\n")).not.toContain("private-sentinel");
    const good = fixture(
      async () =>
        new Response(new Uint8Array(1024), {
          headers: { "Content-Type": "audio/m4a" },
        }),
    );
    const audio = await good.scope(() =>
      good.client.audio(input.binding, new AbortController().signal),
    );
    expect(audio.size).toBe(1024);
    expect(
      good.records().find((record) => record.phase === "renderer_request")
        ?.renderer,
    ).toMatchObject({
      operation: "analysis-audio",
      responseBytes: 1024,
      responseComplete: true,
      phase: "completed",
    });
  });
  it.each([
    ["budget", 409, "LIMIT_REACHED", 429],
    ["busy", 409, "ACTION_IN_PROGRESS", 409],
    ["expired", 410, "SESSION_EXPIRED", 410],
    ["conflict", 409, "STALE_REVISION", 409],
    ["invalid", 400, "INVALID_REQUEST", 400],
    ["cleanup_pending", 503, "CLEANUP_PENDING", 503],
    ["media_failed", 422, "JOB_START_FAILED", 502],
    ["unauthorized", 403, "STORAGE_FAILED", 503],
  ] as const)(
    "retains HTTP and %s while exposing only the mapped UI error",
    async (code, status, mappedCode, mappedStatus) => {
      let calls = 0;
      const f = fixture(async () => {
        calls++;
        return Response.json({ code, stage: "claim" }, { status });
      });
      let caught: unknown;
      try {
        await f.run();
      } catch (error) {
        caught = error;
      }
      expect(caught).toBeInstanceOf(RendererRequestFailure);
      if (!(caught instanceof RendererRequestFailure))
        throw new Error("missing typed renderer failure");
      expect(mapError(caught, requestId)).toMatchObject({
        status: mappedStatus,
        error: { code: mappedCode },
      });
      expect(
        f.records().find((record) => record.phase === "renderer_request")
          ?.renderer,
      ).toMatchObject({
        operation: "upload",
        attempt: 1,
        phase: "http",
        httpStatus: status,
        rendererCode: code,
        rendererStage: "claim",
        failure: "http_rejected",
        responseComplete: true,
      });
      expect(
        f.records().find((record) => record.phase === "media_prepare")?.renderer
          ?.rendererCode,
      ).toBe(code);
      expect(calls).toBe(1);
      expect(JSON.stringify(mapError(caught, requestId))).not.toContain(
        "renderer",
      );
      expect(f.lines.join("\n")).not.toContain("private-sentinel");
      expect(f.lines.join("\n")).not.toContain(input.binding.sessionId);
    },
  );
  it.each([
    ["json", () => new Response("private-sentinel"), "json_invalid"],
    [
      "schema",
      () =>
        Response.json({
          uploadUrl: 42,
          expiresAtMs: 10,
          "private-sentinel": "private-sentinel",
        }),
      "schema_invalid",
    ],
    ["body", () => new Response(null), "body_missing"],
    ["body", () => new Response("x".repeat(131073)), "body_limit"],
    [
      "http",
      () => new Response("private-sentinel", { status: 502 }),
      "http_rejected",
    ],
  ] as const)(
    "reports %s failure without raw payloads",
    async (phase, response, failure) => {
      const f = fixture(async () => response());
      await expect(f.run()).rejects.toMatchObject({ code: "STORAGE_FAILED" });
      const detail = f
        .records()
        .find((record) => record.phase === "renderer_request")?.renderer;
      expect(detail).toMatchObject({ phase, failure, attempt: 1 });
      if (phase === "schema")
        expect(detail?.schemaIssues).toContainEqual({
          code: "invalid_type",
          path: "uploadUrl",
        });
      expect(f.lines.join("\n")).not.toContain("private-sentinel");
    },
  );
  it("logs authorization failure status and makes zero transport calls", async () => {
    let calls = 0;
    const identity = {
      async authorization() {
        throw Object.assign(new Error("private-sentinel"), {
          response: { status: 403, data: "private-sentinel" },
        });
      },
    };
    const f = fixture(async () => {
      calls++;
      return Response.json({});
    }, identity);
    await expect(f.run()).rejects.toMatchObject({ code: "STORAGE_FAILED" });
    expect(
      f.records().find((record) => record.phase === "renderer_request")
        ?.renderer,
    ).toMatchObject({
      phase: "authorization",
      failure: "authorization_failed",
      authorizationHttpStatus: 403,
    });
    expect(calls).toBe(0);
    expect(f.lines.join("\n")).not.toContain("private-sentinel");
  });
  it("logs transport failure without arbitrary exception text or retry", async () => {
    let calls = 0;
    const f = fixture(async () => {
      calls++;
      throw new TypeError("private-sentinel");
    });
    await expect(f.run()).rejects.toMatchObject({ code: "STORAGE_FAILED" });
    expect(
      f.records().find((record) => record.phase === "renderer_request")
        ?.renderer,
    ).toMatchObject({
      phase: "transport",
      failure: "transport_failed",
      errorClass: "TypeError",
    });
    expect(calls).toBe(1);
    expect(f.lines.join("\n")).not.toContain("private-sentinel");
  });
  it.each(["canceled", "timeout"] as const)(
    "distinguishes %s without dispatch",
    async (reason) => {
      let calls = 0;
      const f = fixture(async () => {
        calls++;
        return Response.json({});
      });
      const controller = new AbortController();
      controller.abort(
        reason === "timeout"
          ? new DOMException("private-sentinel", "TimeoutError")
          : undefined,
      );
      await expect(f.run(controller.signal)).rejects.toMatchObject({
        code: reason === "timeout" ? "OPERATION_TIMEOUT" : "CLIENT_ABORTED",
      });
      expect(
        f.records().find((record) => record.phase === "renderer_request")
          ?.renderer?.failure,
      ).toBe(reason);
      expect(calls).toBe(0);
    },
  );
  it("captures body stream failure and releases its reader", async () => {
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        controller.error(new Error("private-sentinel"));
      },
    });
    const f = fixture(async () => new Response(stream));
    await expect(f.run()).rejects.toMatchObject({ code: "STORAGE_FAILED" });
    expect(
      f.records().find((record) => record.phase === "renderer_request")
        ?.renderer,
    ).toMatchObject({
      phase: "body",
      failure: "body_read_failed",
      responseComplete: false,
    });
    expect(stream.locked).toBe(false);
    expect(f.lines.join("\n")).not.toContain("private-sentinel");
  });
  it("records successful bounded decoding; a failing log sink cannot change success", async () => {
    const reply = {
      uploadUrl:
        "https://storage.googleapis.com/upload/storage/v1/b/synthetic/o?upload_id=private-sentinel",
      expiresAtMs: 9000000,
    };
    const f = fixture(async () => Response.json(reply));
    await expect(f.run()).resolves.toEqual(reply);
    expect(
      f.records().find((record) => record.phase === "renderer_request")
        ?.renderer,
    ).toMatchObject({
      phase: "completed",
      httpStatus: 200,
      responseComplete: true,
    });
    expect(f.lines.join("\n")).not.toContain("private-sentinel");
    const failing = fixture(
      async () => Response.json(reply),
      undefined,
      () => {
        throw new Error("private-sentinel");
      },
    );
    await expect(failing.run()).resolves.toEqual(reply);
  });
});
