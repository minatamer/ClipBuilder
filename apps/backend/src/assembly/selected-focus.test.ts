import { createHash, randomUUID } from "node:crypto";
import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import {
  type GroundedAnalysisResult,
  type SelectedAssemblyPlan,
} from "@clipbuilder/contracts";
import { ProcessingAdmission } from "../admission/processing.admission.js";
import { ProcessingGrantCodec } from "../admission/processing.grant.js";
import { SourceAnalysis, resultDigest } from "../analysis/analysis.usecase.js";
import { SAMPLE_ANALYSIS } from "../demo/sampleAnalysis.js";
import { SelectedAssembly } from "./selected-assembly.usecase.js";
import { GeminiSelectedPlanProvider } from "./gemini-selected-plan.js";
import {
  GeminiAnalysisProvider,
  composeGeminiTransport,
  type GeminiTransport,
} from "../analysis/gemini.adapter.js";
import {
  composeSelectedPlanProvider,
  SELECTED_PLAN_POLICY,
} from "./gemini-selected-plan.js";
import { loadConfig } from "../config/loadConfig.js";
import { selectedAssemblyPlanSchema } from "@clipbuilder/contracts";
import { createAnalysisRouter } from "../http/routes/analysis.route.js";
import { mapError } from "../http/errorMapper.js";

async function fixture() {
  const origin = "http://localhost:3000",
    clock = () => 1000;
  const codec = new ProcessingGrantCodec(
    { test: Buffer.alloc(32, 7).toString("base64url") },
    "test",
    randomUUID(),
    clock,
    7200000,
  );
  const admission = new ProcessingAdmission(
    codec,
    {
      ttlMs: 7200000,
      maxRecords: 16,
      maxConcurrent: 1,
      maxDispatches: 3,
      rateWindowMs: 300000,
      maxGrantsPerWindow: 3,
      allowedOrigins: [origin],
      paidEnabled: true,
      timeoutMs: 1000,
    },
    { verify: vi.fn(async () => true) },
    clock,
    new Uint8Array(32).fill(8),
  );
  const issued = admission.issue(origin, "same-origin"),
    controller = new AbortController();
  const context = {
    origin,
    fetchSite: "same-origin",
    cookie: issued.cookie,
    csrf: issued.grant.csrf,
    signal: controller.signal,
  };
  const binding = {
    sessionId: issued.grant.sessionId,
    sourceRevision: SAMPLE_ANALYSIS.media.sourceRevision,
    fingerprint: "a".repeat(64),
  };
  const payload = {
    binding,
    generation: "1",
    analysis: structuredClone(SAMPLE_ANALYSIS),
  };
  // Seed a server-signed synthetic source result through the real completed-action gate.
  await admission.run(
    context,
    {
      bytes: new Uint8Array([1]),
      contentType: "application/json",
      allowedContentTypes: ["application/json"],
      maxBytes: 8192,
      turnstileToken: "synthetic",
      action: "candidate-analysis",
    },
    () => {},
    async () => payload,
  );
  const analysis: GroundedAnalysisResult = {
    ...payload,
    receipt: admission.completedReceipt(
      context,
      "candidate-analysis",
      binding.sourceRevision,
      resultDigest(payload),
    ),
  };
  const proxy = new Blob([new Uint8Array([1, 2, 3])], { type: "video/mp4" });
  const media = SAMPLE_ANALYSIS.media;
  const preparedSource = {
    fingerprint: binding.fingerprint,
    bytes: media.bytes,
    durationMs: media.durationMs,
    width: media.width,
    height: media.height,
    audioStartMs: 0,
  };
  const sourcePort = {
    upload: vi.fn(),
    prepare: vi.fn(),
    proxy: vi.fn(),
    releaseProxy: vi.fn(),
    cancel: vi.fn(),
  };
  const sourceProvider = { analyze: vi.fn() };
  const source = new SourceAnalysis(
    admission,
    sourcePort,
    sourceProvider,
    "fake",
    clock,
  );
  const port = {
    select: vi.fn(
      async (request: { range: { startMs: number; endMs: number } }) => ({
        range: request.range,
        source: preparedSource,
        analysisProxy: {
          artifactId: randomUUID(),
          generation: "2",
          bytes: proxy.size,
          checksum: createHash("sha256")
            .update(new Uint8Array([1, 2, 3]))
            .digest("hex"),
        },
      }),
    ),
    proxy: vi.fn(async () => proxy),
    releaseProxy: vi.fn(async () => {}),
    cancel: vi.fn(async () => {}),
  };
  const provider = {
    plan: vi.fn(
      async (
        _proxy: Blob,
        input: { range: { startMs: number; endMs: number } },
      ): Promise<unknown> => {
        const durationMs = input.range.endMs - input.range.startMs;
        return {
          version: 1,
          speaker: {
            version: 1,
            coordinateSpace: "upright-display",
            durationMs,
            shots: [{ startMs: 0, endMs: durationMs, observations: [] }],
          },
          cards: [],
        };
      },
    ),
  };
  const service = new SelectedAssembly(
    admission,
    source,
    port,
    provider,
    "fake",
  );
  const input = {
    analysis,
    candidateId: analysis.analysis.candidates[0]!.id,
    turnstileToken: "synthetic",
  };
  return {
    service,
    input,
    port,
    provider,
    sourcePort,
    sourceProvider,
    source,
    admission,
    context,
    controller,
  };
}
describe("selected speaker action and provenance", () => {
  it("rejects unsupported caption input before either media or AI dispatch", async () => {
    const f = await fixture();
    const candidate = f.input.analysis.analysis.candidates[0]!;
    f.input.analysis.analysis.transcript.words.find(
      (w) => w.id === candidate.startWordId,
    )!.punctuatedText = "one two three four five six seven eight nine";
    const { receipt: _old, ...payload } = f.input.analysis;
    void _old;
    f.input.analysis.receipt = f.admission.completedReceipt(
      f.context,
      "candidate-analysis",
      payload.binding.sourceRevision,
      resultDigest(payload),
    );
    await expect(f.service.run(f.context, f.input)).rejects.toMatchObject({
      code: "INVALID_REQUEST",
    });
    expect(f.port.select).toHaveBeenCalledTimes(0);
    expect(f.provider.plan).toHaveBeenCalledTimes(0);
  });
  it("connects protected assembly HTTP to the combined action and rejects replay and CSRF before new calls", async () => {
    const f = await fixture(),
      app = express();
    app.use(
      "/v1/analysis",
      createAnalysisRouter(
        f.admission,
        f.source,
        [f.context.origin],
        f.service,
      ),
    );
    app.use(
      (
        error: unknown,
        _req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ) => {
        void next;
        const mapped = mapError(error, `req_${"0".repeat(32)}`);
        res.status(mapped.status).json({ error: mapped.error });
      },
    );
    const send = (csrf = f.context.csrf) =>
      request(app)
        .post("/v1/analysis/assemble")
        .set("Origin", f.context.origin)
        .set("Sec-Fetch-Site", "same-origin")
        .set("Cookie", `__Host-clipping_session=${f.context.cookie}`)
        .set("X-CSRF-Token", csrf)
        .send(f.input);
    expect(Buffer.byteLength(JSON.stringify(f.input))).toBeGreaterThan(8192);
    expect((await send("wrong")).status).toBe(403);
    expect(f.provider.plan).toHaveBeenCalledTimes(0);
    const response = await send();
    expect(response.status).toBe(200);
    expect(response.headers["cache-control"]).toContain("no-store");
    expect(f.service.verify(f.context, response.body).manifest.version).toBe(2);
    expect((await send()).status).toBe(409);
    expect(f.provider.plan).toHaveBeenCalledTimes(1);
    expect(f.port.select).toHaveBeenCalledTimes(1);
  });
  it("an invalid contextual plan releases and terminally cancels without publishing or retrying", async () => {
    const f = await fixture();
    f.provider.plan.mockImplementation(async (_proxy, input) => ({
      version: 1,
      speaker: {
        version: 1,
        coordinateSpace: "upright-display",
        durationMs: input.range.endMs - input.range.startMs,
        shots: [
          {
            startMs: 0,
            endMs: input.range.endMs - input.range.startMs,
            observations: [],
          },
        ],
      },
      cards: [
        {
          kind: "statement",
          anchorWordId: "w_999999",
          durationMs: 2000,
          title: { startWordId: "w_999999", endWordId: "w_999999" },
          lines: [{ startWordId: "w_999999", endWordId: "w_999999" }],
        },
      ],
    }));
    await expect(f.service.run(f.context, f.input)).rejects.toMatchObject({
      code: "MODEL_OUTPUT_REJECTED",
    });
    expect(f.port.releaseProxy).toHaveBeenCalledTimes(1);
    expect(f.port.cancel).toHaveBeenCalledTimes(1);
    await expect(f.service.run(f.context, f.input)).rejects.toThrow();
    expect(f.provider.plan).toHaveBeenCalledTimes(1);
  });
  it("keeps default/test/fake provider composition closed before uploading", () => {
    const transport: GeminiTransport = {
      upload: vi.fn(),
      get: vi.fn(),
      generate: vi.fn(),
      delete: vi.fn(),
    };
    const files = new GeminiAnalysisProvider(transport, 1000);
    expect(composeSelectedPlanProvider(loadConfig({}), files)).toBeNull();
    expect(
      composeSelectedPlanProvider(loadConfig({ NODE_ENV: "test" }), files),
    ).toBeNull();
    expect(transport.upload).toHaveBeenCalledTimes(0);
  });
  it("serializes explicit video sampling and fixed schema through the pinned SDK once", async () => {
    const config = loadConfig({
      FAKE_MODE: "false",
      PAID_DEMO_ENABLED: "true",
      LIVE_ANALYSIS_ENABLED: "true",
      LIVE_ASSEMBLY_ENABLED: "true",
      ADMISSION_MAX_PROCESS_DISPATCHES: "3",
      PROCESSING_GRANTS_ENABLED: "true",
      CLOUD_RENDER_ENVIRONMENT: "cloud",
      CLOUD_SPEND_APPROVED: "true",
      PRIVATE_RENDERER_ORIGIN: "https://synthetic.run.app",
      GEMINI_API_KEY: "synthetic",
      GEMINI_TRANSFER_APPROVED: "true",
      GEMINI_PAID_PROJECT_CONFIRMED: "true",
      TURNSTILE_SITE_KEY: "synthetic",
      TURNSTILE_SECRET_KEY: "synthetic",
      TURNSTILE_EXPECTED_HOSTNAME: "localhost",
      PROCESSING_GRANT_ACTIVE_KEY_ID: "test",
      PROCESSING_GRANT_KEYS_JSON: JSON.stringify({
        test: Buffer.alloc(32, 7).toString("base64url"),
      }),
    });
    const request = vi.fn<typeof fetch>(async (_url, options) => {
      const body: unknown = JSON.parse(String(options?.body));
      expect(body).toMatchObject({
        contents: [
          {
            parts: [
              {
                fileData: { mimeType: "video/mp4" },
                videoMetadata: { fps: 5 },
              },
              { text: "synthetic-context" },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          candidateCount: 1,
        },
      });
      return Response.json({
        candidates: [
          {
            finishReason: "STOP",
            content: { role: "model", parts: [{ text: "{}" }] },
          },
        ],
      });
    });
    await composeGeminiTransport(config, request).generate(
      "https://generativelanguage.googleapis.com/v1beta/files/synthetic",
      new AbortController().signal,
      {
        policy: SELECTED_PLAN_POLICY,
        prompt: "synthetic-context",
        schema: selectedAssemblyPlanSchema,
        videoFps: 5,
      },
    );
    expect(request).toHaveBeenCalledTimes(1);
  });
  it("dispatches one selected proxy and one plan, zero source AI, then verifies its signed result", async () => {
    const f = await fixture(),
      result = await f.service.run(f.context, f.input);
    expect(f.service.verify(f.context, result)).toEqual(result);
    expect(result.manifest.focus).toEqual([
      {
        startMs: 0,
        endMs: result.manifest.range.endMs - result.manifest.range.startMs,
        mode: "wide",
      },
    ]);
    expect(f.port.select).toHaveBeenCalledTimes(1);
    expect(f.provider.plan).toHaveBeenCalledTimes(1);
    expect(f.port.releaseProxy).toHaveBeenCalledTimes(1);
    expect(f.port.cancel).toHaveBeenCalledTimes(0);
    expect(f.sourceProvider.analyze).toHaveBeenCalledTimes(0);
    expect(f.sourcePort.prepare).toHaveBeenCalledTimes(0);
    await expect(f.service.run(f.context, f.input)).rejects.toMatchObject({
      code: "ACTION_IN_PROGRESS",
    });
    expect(f.provider.plan).toHaveBeenCalledTimes(1);
    await expect(
      f.service.run(f.context, {
        ...f.input,
        candidateId: "cand_" + "z".repeat(22),
      }),
    ).rejects.toMatchObject({ code: "INVALID_REQUEST" });
    expect(() =>
      f.service.verify(f.context, {
        ...result,
        analysisRevision: "rev_" + "z".repeat(22),
      }),
    ).toThrow();
  });
  it.each(["receipt", "source", "candidate"])(
    "rejects tampered %s before metered work",
    async (kind) => {
      const f = await fixture(),
        input = structuredClone(f.input);
      if (kind === "receipt") input.analysis.receipt += "x";
      if (kind === "source")
        input.analysis.binding.fingerprint = "b".repeat(64);
      if (kind === "candidate")
        input.analysis.analysis.candidates[0]!.endWordId = "w_999999";
      await expect(f.service.run(f.context, input)).rejects.toThrow();
      expect(f.port.select).toHaveBeenCalledTimes(0);
      expect(f.provider.plan).toHaveBeenCalledTimes(0);
    },
  );
  it("releases the proxy and cancels the source on malformed model output", async () => {
    const f = await fixture();
    f.provider.plan.mockResolvedValue({ command: "synthetic" });
    await expect(f.service.run(f.context, f.input)).rejects.toMatchObject({
      code: "MODEL_OUTPUT_REJECTED",
    });
    expect(f.provider.plan).toHaveBeenCalledTimes(1);
    expect(f.port.releaseProxy).toHaveBeenCalledTimes(1);
    expect(f.port.cancel).toHaveBeenCalledTimes(1);
  });
  it("rejects wrong selected proxy bytes before AI and still releases/cancels", async () => {
    const f = await fixture();
    f.port.proxy.mockResolvedValue(
      new Blob([new Uint8Array([3, 2, 1])], { type: "video/mp4" }),
    );
    await expect(f.service.run(f.context, f.input)).rejects.toMatchObject({
      code: "MODEL_OUTPUT_REJECTED",
    });
    expect(f.provider.plan).toHaveBeenCalledTimes(0);
    expect(f.port.releaseProxy).toHaveBeenCalledTimes(1);
    expect(f.port.cancel).toHaveBeenCalledTimes(1);
  });
  it("never publishes when selected-proxy release fails", async () => {
    const f = await fixture();
    f.port.releaseProxy.mockRejectedValue(new Error("synthetic"));
    await expect(f.service.run(f.context, f.input)).rejects.toMatchObject({
      code: "MODEL_OUTPUT_REJECTED",
    });
    expect(f.provider.plan).toHaveBeenCalledTimes(1);
    expect(f.port.cancel).toHaveBeenCalledTimes(1);
    await expect(f.service.run(f.context, f.input)).rejects.toThrow();
    expect(f.provider.plan).toHaveBeenCalledTimes(1);
  });
  it("fences a late selected result after Clear without a second plan", async () => {
    const f = await fixture();
    let finish!: () => void, entered!: () => void;
    const ready = new Promise<void>((resolve) => {
      entered = resolve;
    });
    f.provider.plan.mockImplementation(async (_proxy, input) => {
      entered();
      await new Promise<void>((resolve) => {
        finish = resolve;
      });
      return {
        version: 1,
        cards: [],
        speaker: {
          version: 1,
          coordinateSpace: "upright-display",
          durationMs: input.range.endMs - input.range.startMs,
          shots: [
            {
              startMs: 0,
              endMs: input.range.endMs - input.range.startMs,
              observations: [],
            },
          ],
        },
      };
    });
    const job = f.service.run(f.context, f.input),
      rejection = expect(job).rejects.toMatchObject({ code: "CLIENT_ABORTED" });
    await ready;
    f.admission.clear(f.context);
    finish();
    await rejection;
    await vi.waitFor(() => expect(f.port.cancel).toHaveBeenCalledTimes(1));
    expect(f.provider.plan).toHaveBeenCalledTimes(1);
    expect(f.port.releaseProxy).toHaveBeenCalledTimes(1);
  });
  it("shares the bounded Files upload/generate/verified-delete lifecycle and explicit 5fps task", async () => {
    let file = "";
    const plan: SelectedAssemblyPlan = {
      version: 1,
      cards: [],
      speaker: {
        version: 1,
        coordinateSpace: "upright-display",
        durationMs: 10000,
        shots: [{ startMs: 0, endMs: 10000, observations: [] }],
      },
    };
    const transport: GeminiTransport = {
      upload: vi.fn(async (name) => {
        file = name;
        return {
          name,
          uri: `https://generativelanguage.googleapis.com/v1beta/${name}`,
          state: "ACTIVE",
        };
      }),
      get: vi.fn(),
      generate: vi.fn(async () => ({
        text: JSON.stringify(plan),
        finished: true,
      })),
      delete: vi.fn(async () => {}),
    };
    const provider = new GeminiSelectedPlanProvider(
      new GeminiAnalysisProvider(transport, 1000),
    );
    expect(
      await provider.plan(
        new Blob([new Uint8Array([1])], { type: "video/mp4" }),
        { range: { startMs: 5000, endMs: 15000 }, words: [] },
        new AbortController().signal,
        "synthetic",
      ),
    ).toEqual(plan);
    expect(transport.upload).toHaveBeenCalledTimes(1);
    expect(transport.generate).toHaveBeenCalledTimes(1);
    expect(transport.delete).toHaveBeenCalledExactlyOnceWith(
      file,
      expect.any(AbortSignal),
    );
    expect(transport.generate).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(AbortSignal),
      expect.objectContaining({
        videoFps: 5,
        prompt: JSON.stringify({ durationMs: 10000, words: [] }),
      }),
    );
  });
});
