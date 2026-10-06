import { ApplicationError } from "../http/errorMapper.js";
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
import {
  createLiveValidationEnvironment,
  createLiveValidationConnections,
} from "../../test/environment.fixture.js";
import { loadConfig } from "../config/loadConfig.js";
import { selectedAssemblyPlanSchema } from "@clipbuilder/contracts";
import { selectedAssemblyResultSchema } from "@clipbuilder/contracts";
import { createAnalysisRouter } from "../http/routes/analysis.route.js";
import { mapError } from "../http/errorMapper.js";
import { PreviewPlayback } from "../media/preview-playback.js";
import { Writable } from "node:stream";
import { FinalRender } from "../render/final-render.usecase.js";
import { OutputDelivery } from "../media/output-delivery.js";
import {
  AnalysisDiagnostics,
  parseAnalysisDiagnosticLine,
} from "../analysis/analysis.diagnostics.js";
import { z } from "zod";
import sharp from "sharp";
import { normalizePicture } from "./picture-raster.js";

async function fixture(maxDispatches = 4) {
  const lines: string[] = [],
    diagnostics = new AnalysisDiagnostics((line) => lines.push(line));
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
      maxDispatches,
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
    preview: vi.fn(
      async (
        request: import("@clipbuilder/contracts").MediaPreviewRequest,
      ) => ({
        binding: request.binding,
        range: request.range,
        manifestHash: request.manifestHash,
        artifact: {
          artifactId: randomUUID(),
          generation: "3",
          bytes: 1024,
          checksum: "a".repeat(64),
        },
        expiresAtMs: clock() + 60_000,
      }),
    ),
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
    diagnostics,
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
    diagnostics,
    lines,
  };
}

describe("final render and delivery", () => {
  async function finalFixture() {
    const f = await fixture(),
      assembly = await f.service.run(f.context, f.input);
    const output = {
      binding: assembly.binding,
      manifestHash: assembly.manifestHash,
      output: {
        artifactId: randomUUID(),
        generation: "4",
        bytes: 1024,
        checksum: "c".repeat(64),
      },
      expiresAtMs: 601000,
    };
    const media = {
      render: vi.fn(async () => {
        const { binding: _binding, ...value } = output;
        void _binding;
        return value;
      }),
      outputInfo: vi.fn(async () => output),
      cancel: vi.fn(async () => {}),
      outputContent: vi.fn(
        async (_access: unknown, range: string | undefined) =>
          new Response(new Uint8Array(range ? 10 : 1024), {
            status: range ? 206 : 200,
            headers: {
              "Content-Type": "video/mp4",
              "Content-Length": range ? "10" : "1024",
              ...(range ? { "Content-Range": "bytes 0-9/1024" } : {}),
            },
          }),
      ),
    };
    const render = new FinalRender(f.admission, f.service, media, () => 1000),
      delivery = new OutputDelivery(f.admission, render, media, () => 1000);
    return {
      ...f,
      assembly,
      media,
      render,
      delivery,
      request: { assembly, turnstileToken: "synthetic" },
    };
  }
  it.each(["preview", "output"])(
    "does not reopen %s access after Clear during metadata lookup",
    async (kind) => {
      const f = await finalFixture(),
        result = await f.render.run(f.context, f.request);
      let release = () => {},
        entered = () => {};
      const gate = new Promise<void>((resolve) => {
          release = resolve;
        }),
        waiting = new Promise<void>((resolve) => {
          entered = resolve;
        });
      const previewDescriptor = await f.port.preview.mock.results[0]!.value,
        outputDescriptor = await f.media.outputInfo();
      f.media.outputInfo.mockImplementation(async () => {
        entered();
        await gate;
        return outputDescriptor;
      });
      const preview = new PreviewPlayback(
        f.admission,
        f.service,
        {
          previewInfo: async () => {
            entered();
            await gate;
            return previewDescriptor;
          },
          previewContent: vi.fn(),
        },
        () => 1000,
      );
      const target = kind === "preview" ? preview : f.delivery;
      const pending = target.open(
        f.context,
        kind === "preview" ? f.assembly : result,
      );
      const rejected = expect(pending).rejects.toThrow();
      await waiting;
      target.clear(f.context);
      f.admission.clear(f.context);
      release();
      await rejected;
      expect(f.media.render).toHaveBeenCalledTimes(1);
      expect(f.provider.plan).toHaveBeenCalledTimes(1);
    },
  );
  it("renders once, restores the published receipt, ranges/downloads repeatedly with zero new AI", async () => {
    const f = await finalFixture(),
      result = await f.render.run(f.context, f.request);
    expect(f.render.verify(f.context, result)).toEqual(result);
    expect(await f.render.restore(f.context, f.assembly)).toEqual(result);
    await expect(f.render.run(f.context, f.request)).rejects.toThrow();
    await f.delivery.open(f.context, result);
    for (let i = 0; i < 2; i++) {
      let received = 0;
      const headers = vi.fn(),
        target = new Writable({
          write(chunk: Buffer, _encoding, callback) {
            received += chunk.length;
            callback();
          },
        });
      await f.delivery.stream(f.context, "bytes=0-9", target, headers, true);
      expect(received).toBe(10);
      expect(headers).toHaveBeenCalledWith(
        206,
        expect.objectContaining({
          "Content-Disposition": 'attachment; filename="clipbuilder.mp4"',
        }),
      );
    }
    expect(f.media.render).toHaveBeenCalledTimes(1);
    expect(f.provider.plan).toHaveBeenCalledTimes(1);
    expect(f.sourceProvider.analyze).toHaveBeenCalledTimes(0);
    expect(f.media.cancel).toHaveBeenCalledTimes(0);
    expect(() => f.delivery.clear({ ...f.context, csrf: "wrong" })).toThrow();
    f.delivery.clear(f.context);
    await expect(
      f.delivery.stream(f.context, undefined, new Writable(), () => {}),
    ).rejects.toThrow();
  });
  it.each(["metadata", "expired", "failed"])(
    "never signs %s outputs and consumes the uncertain render",
    async (kind) => {
      const f = await finalFixture();
      if (kind === "metadata")
        f.media.outputInfo.mockResolvedValue({
          ...(await f.media.outputInfo()),
          output: { ...(await f.media.outputInfo()).output, generation: "999" },
        });
      if (kind === "expired")
        f.media.outputInfo.mockResolvedValue({
          ...(await f.media.outputInfo()),
          expiresAtMs: 1000,
        });
      if (kind === "failed")
        f.media.render.mockRejectedValue(new Error("synthetic"));
      await expect(f.render.run(f.context, f.request)).rejects.toThrow();
      await expect(f.render.run(f.context, f.request)).rejects.toThrow();
      await expect(f.render.restore(f.context, f.assembly)).rejects.toThrow();
      expect(f.media.render).toHaveBeenCalledTimes(1);
      expect(f.media.cancel).toHaveBeenCalledTimes(1);
      expect(f.provider.plan).toHaveBeenCalledTimes(1);
    },
  );
  it("rejects unsigned manifests and unconfirmed output recovery before render", async () => {
    const f = await finalFixture();
    await expect(f.render.restore(f.context, f.assembly)).rejects.toThrow();
    await expect(
      f.render.run(f.context, {
        ...f.request,
        assembly: { ...f.assembly, manifestHash: "e".repeat(64) },
      }),
    ).rejects.toThrow();
    expect(f.media.render).toHaveBeenCalledTimes(0);
  });
});

describe("frozen assembly preview access", () => {
  it("bounds concurrent access publication after asynchronous metadata lookup", async () => {
    const f = await fixture(),
      result = await f.service.run(f.context, f.input),
      descriptor = await f.port.preview.mock.results[0]!.value;
    let release = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const media = {
      previewInfo: vi.fn(
        async (input: import("@clipbuilder/contracts").MediaPreviewAccess) => {
          await gate;
          return { ...descriptor, binding: input.binding };
        },
      ),
      previewContent: vi.fn(),
    };
    const preview = new PreviewPlayback(
      f.admission,
      {
        verify: (_context, input) => selectedAssemblyResultSchema.parse(input),
      },
      media,
      () => 1000,
    );
    const pending = Array.from({ length: 17 }, (_, index) =>
      preview.open(f.context, {
        ...result,
        binding: {
          ...result.binding,
          sessionId: "ses_" + String.fromCharCode(97 + index).repeat(22),
        },
      }),
    );
    const finished = Promise.allSettled(pending);
    release();
    const states = await finished;
    expect(states.filter((value) => value.status === "fulfilled")).toHaveLength(
      16,
    );
    expect(states.filter((value) => value.status === "rejected")).toHaveLength(
      1,
    );
    expect(f.provider.plan).toHaveBeenCalledTimes(1);
  });
  it("restores the signed manifest and byte ranges with zero new AI or media preparation", async () => {
    const f = await fixture(),
      result = await f.service.run(f.context, f.input);
    const descriptor = await f.port.preview.mock.results[0]!.value;
    const media = {
      previewInfo: vi.fn(async () => descriptor),
      previewContent: vi.fn(
        async (_input: unknown, range: string | undefined) => {
          const partial = range === "bytes=100-199";
          return new Response(new Uint8Array(partial ? 100 : 1024), {
            status: partial ? 206 : 200,
            headers: {
              "Content-Type": "video/mp4",
              "Content-Length": partial ? "100" : "1024",
              ...(partial ? { "Content-Range": "bytes 100-199/1024" } : {}),
            },
          });
        },
      ),
    };
    const access = new PreviewPlayback(
      f.admission,
      f.service,
      media,
      () => 1000,
    );
    await access.open(f.context, result);
    await access.open(f.context, result);
    const received: Buffer[] = [],
      headers = vi.fn();
    await access.stream(
      { ...f.context, csrf: "" },
      "bytes=100-199",
      new Writable({
        write(chunk: Buffer, _encoding, done) {
          received.push(chunk);
          done();
        },
      }),
      headers,
    );
    expect(Buffer.concat(received).length).toBe(100);
    expect(headers).toHaveBeenCalledWith(
      206,
      expect.objectContaining({ "Content-Range": "bytes 100-199/1024" }),
    );
    expect(f.provider.plan).toHaveBeenCalledTimes(1);
    expect(f.port.preview).toHaveBeenCalledTimes(1);
    await expect(
      access.open(f.context, { ...result, manifestHash: "f".repeat(64) }),
    ).rejects.toBeDefined();
    expect(media.previewInfo).toHaveBeenCalledTimes(2);
    expect(() => access.clear({ ...f.context, csrf: "invalid" })).toThrow();
    access.clear(f.context);
    await expect(
      access.stream(f.context, undefined, new Writable(), () => {}),
    ).rejects.toBeDefined();
    expect(media.previewContent).toHaveBeenCalledTimes(1);
  });
  it("rejects expired or mismatched preview descriptors and malformed ranges before streaming", async () => {
    const f = await fixture(),
      result = await f.service.run(f.context, f.input),
      descriptor = await f.port.preview.mock.results[0]!.value;
    const media = {
      previewInfo: vi.fn(async () => ({
        ...descriptor,
        manifestHash: "f".repeat(64),
      })),
      previewContent: vi.fn(),
    };
    const access = new PreviewPlayback(
      f.admission,
      f.service,
      media,
      () => 1000,
    );
    await expect(access.open(f.context, result)).rejects.toBeDefined();
    media.previewInfo.mockResolvedValue({ ...descriptor, expiresAtMs: 999 });
    await expect(access.open(f.context, result)).rejects.toBeDefined();
    media.previewInfo.mockResolvedValue(descriptor);
    await access.open(f.context, result);
    await expect(
      access.stream(f.context, "bytes=1-2,4-5", new Writable(), () => {}),
    ).rejects.toBeDefined();
    expect(media.previewContent).not.toHaveBeenCalled();
    expect(f.provider.plan).toHaveBeenCalledTimes(1);
  });
  it("serves authenticated GET playback without a browser CSRF header and refuses a missing cookie", async () => {
    const f = await fixture(),
      result = await f.service.run(f.context, f.input),
      descriptor = await f.port.preview.mock.results[0]!.value;
    const media = {
      previewInfo: vi.fn(async () => descriptor),
      previewContent: vi.fn(
        async () =>
          new Response(new Uint8Array(1024), {
            headers: { "Content-Type": "video/mp4", "Content-Length": "1024" },
          }),
      ),
    };
    const preview = new PreviewPlayback(
      f.admission,
      f.service,
      media,
      () => 1000,
    );
    await preview.open(f.context, result);
    const app = express();
    app.use(
      "/v1/analysis",
      createAnalysisRouter(
        f.admission,
        f.source,
        [f.context.origin],
        f.service,
        preview,
      ),
    );
    app.use(
      (
        error: unknown,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction,
      ) => {
        void _next;
        const mapped = mapError(error, `req_${"0".repeat(32)}`);
        res.status(mapped.status).json({ error: mapped.error });
      },
    );
    const response = await request(app)
      .get("/v1/analysis/preview")
      .set("Origin", f.context.origin)
      .set("Sec-Fetch-Site", "same-origin")
      .set("Cookie", `__Host-clipping_session=${f.context.cookie}`);
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1024);
    const missing = await request(app)
      .get("/v1/analysis/preview")
      .set("Origin", f.context.origin)
      .set("Sec-Fetch-Site", "same-origin");
    expect(missing.status).toBe(401);
    expect(media.previewContent).toHaveBeenCalledTimes(1);
  });
});
describe("selected speaker action and provenance", () => {
  it.each(["commons", "generated"])(
    "signs two %s pictures into preview/export with one planner call and rejects a changed image without more provider work",
    async (origin) => {
      const f = await fixture(origin === "generated" ? 6 : 4);
      f.provider.plan.mockImplementation(async (_proxy, context) => {
        const anchor = context.words.find(
          (word) => word.startMs - context.range.startMs >= 2000,
        )!;
        const secondAnchor = context.words.find(
          (word) => word.startMs >= anchor.startMs + 4500,
        )!;
        const durationMs = context.range.endMs - context.range.startMs;
        return {
          version: 1,
          cards: [],
          speaker: {
            version: 1,
            coordinateSpace: "upright-display",
            durationMs,
            shots: [{ startMs: 0, endMs: durationMs, observations: [] }],
          },
          pictures: [anchor, secondAnchor].map((word, index) => {
            const first = context.words.findIndex(
              (candidate) => candidate.id === word.id,
            );
            const phrase = context.words.slice(
              first,
              first + (index === 0 ? 9 : 5),
            );
            return {
              kind: "object",
              brief: {
                scene: "A contextual synthetic object",
                searchQuery: "synthetic object photograph",
                requiredTerms: ["object"],
                avoidTerms: [],
              },
              anchorWordId: phrase[2]!.id,
              durationMs: 2000,
              subject: {
                startWordId: phrase[0]!.id,
                endWordId: phrase.at(-1)!.id,
              },
            };
          }),
        };
      });
      const assets = await Promise.all(
        ["#2345aa", "#aa4523"].map(async (background, index) => {
          const png = await sharp({
            create: { width: 20, height: 10, channels: 3, background },
          })
            .png()
            .toBuffer();
          const raster = await normalizePicture(png);
          return {
            repository: "wikimedia-commons" as const,
            license: "CC0" as const,
            pageId: index + 1,
            title: "Synthetic subject",
            width: raster.width,
            height: raster.height,
            sha256: createHash("sha256").update(raster.bytes).digest("hex"),
            dataUri: `data:image/jpeg;base64,${raster.bytes.toString("base64")}`,
          };
        }),
      );
      const generated = assets.map((asset) => {
        const {
          pageId: _id,
          title: _title,
          license: _license,
          ...raster
        } = asset;
        void _id;
        void _title;
        void _license;
        return {
          ...raster,
          repository: "google-gemini" as const,
          model: "gemini-3.1-flash-image" as const,
          policy: "contextual-generated-v1" as const,
        };
      });
      const generate = vi
        .fn()
        .mockResolvedValueOnce(generated[0])
        .mockResolvedValueOnce(generated[1]);
      const find = vi
        .fn()
        .mockResolvedValueOnce(assets[0])
        .mockResolvedValueOnce(assets[1]);
      if (origin === "generated") find.mockReset().mockResolvedValue(null);
      f.service = new SelectedAssembly(
        f.admission,
        f.source,
        f.port,
        f.provider,
        "fake",
        f.diagnostics,
        { find },
        origin === "generated" ? { find: generate } : undefined,
      );
      const privateCapture = vi.spyOn(f.diagnostics, "privateStageOutput");
      const result = await diagnosedRun(f);
      expect(f.service.verify(f.context, result)).toEqual(result);
      expect(result.manifest.pictures).toHaveLength(2);
      expect(result.pictureNotes).toEqual(
        result.manifest.pictures!.map((picture) => ({
          anchorWordId: picture.anchorWordId,
          scene: "A contextual synthetic object",
        })),
      );
      const changedNotes = structuredClone(result);
      changedNotes.pictureNotes![0]!.scene = "A different synthetic scene";
      expect(() => f.service.verify(f.context, changedNotes)).toThrow();
      expect(
        selectedAssemblyResultSchema.safeParse({ ...result, pictureNotes: [] })
          .success,
      ).toBe(false);
      expect(
        selectedAssemblyResultSchema.safeParse({
          ...result,
          pictureNotes: result.pictureNotes!.map((note) => ({
            ...note,
            anchorWordId: "w_999999",
          })),
        }).success,
      ).toBe(false);
      expect(f.lines.join("\n")).not.toContain("A contextual synthetic object");
      if (origin === "generated") {
        const captured = privateCapture.mock.calls.find(
          ([stage]) => stage === "assembly_reconciliation_result",
        );
        expect(JSON.stringify(captured?.[1])).not.toContain(
          result.manifest.pictures![0]!.asset.dataUri,
        );
      }
      expect(generate).toHaveBeenCalledTimes(origin === "generated" ? 2 : 0);
      expect(
        result.manifest.pictures!.map((picture) => picture.asset.repository),
      ).toEqual([
        origin === "generated" ? "google-gemini" : "wikimedia-commons",
        origin === "generated" ? "google-gemini" : "wikimedia-commons",
      ]);
      const proposed = await f.provider.plan.mock.results[0]!.value;
      expect(result.manifest.pictures![0]!.subjectWordIds).toHaveLength(7);
      result.manifest.pictures!.forEach((item, index) => {
        expect(item.anchorWordId).toBe(
          proposed.pictures![index]!.subject.startWordId,
        );
        expect(item.anchorWordId).not.toBe(
          proposed.pictures![index]!.anchorWordId,
        );
        const phraseEnd =
          result.words.find(
            (word) => word.id === proposed.pictures![index]!.subject.endWordId,
          )!.endMs - result.manifest.range.startMs;
        expect(item.endMs).toBeGreaterThanOrEqual(phraseEnd);
      });
      expect(f.port.preview.mock.calls[0]![0].manifestHash).toBe(
        result.manifestHash,
      );
      const output = {
        binding: result.binding,
        manifestHash: result.manifestHash,
        output: {
          artifactId: randomUUID(),
          generation: "4",
          bytes: 1024,
          checksum: "c".repeat(64),
        },
        expiresAtMs: 601000,
      };
      const media = {
        render: vi.fn(
          async (
            input: import("@clipbuilder/contracts").MediaRenderRequest,
          ) => {
            expect(input.manifest).toEqual(result.manifest);
            const { binding: _binding, ...response } = output;
            void _binding;
            return response;
          },
        ),
        outputInfo: vi.fn(async () => output),
        cancel: vi.fn(async () => {}),
      };
      const rendered = await new FinalRender(
        f.admission,
        f.service,
        media,
        () => 1000,
      ).run(f.context, { assembly: result, turnstileToken: "synthetic" });
      expect(rendered.manifestHash).toBe(result.manifestHash);
      expect(media.render).toHaveBeenCalledOnce();
      const signed = structuredClone(result);
      signed.manifest.pictures![0]!.asset.sha256 = "e".repeat(64);
      expect(() => f.service.verify(f.context, signed)).toThrow();
      const ungrounded = structuredClone(result);
      ungrounded.manifest.pictures![0]!.subjectWordIds = ["w_999999"];
      expect(selectedAssemblyResultSchema.safeParse(ungrounded).success).toBe(
        false,
      );
      expect(find).toHaveBeenCalledTimes(2);
      expect(generate).toHaveBeenCalledTimes(origin === "generated" ? 2 : 0);
      expect(f.provider.plan).toHaveBeenCalledOnce();
      expect(f.port.releaseProxy).toHaveBeenCalledOnce();
      expect(f.port.preview).toHaveBeenCalledOnce();
      expect(f.port.cancel).not.toHaveBeenCalled();
      expect(f.sourceProvider.analyze).not.toHaveBeenCalled();
      const serialized = f.lines.join("\n");
      expect(serialized).not.toContain(
        result.manifest.pictures![0]!.asset.dataUri,
      );
    },
  );
  async function diagnosedRun(f: Awaited<ReturnType<typeof fixture>>) {
    return new Promise<import("@clipbuilder/contracts").SelectedAssemblyResult>(
      (resolve, reject) => {
        f.diagnostics.request(`req_${"d".repeat(32)}`, "assemble", (finish) => {
          f.service.run(f.context, f.input).then(
            (result) => {
              finish("completed", 200);
              resolve(result);
            },
            (error: unknown) => {
              finish("completed", 500);
              reject(error);
            },
          );
        });
      },
    );
  }
  it("records the complete assembly path with structural facts and private outputs", async () => {
    const f = await fixture(),
      captures: unknown[] = [];
    f.diagnostics.enablePrivateCapture({
      open: () => (event) => {
        captures.push(event);
      },
    });
    const result = await diagnosedRun(f);
    const records = f.lines.map((line) => JSON.parse(line));
    for (const phase of [
      "assembly_input",
      "assembly_evidence",
      "assembly_range",
      "assembly_captions",
      "assembly_admission",
      "assembly_media_prepare",
      "assembly_source_validation",
      "assembly_proxy_fetch",
      "assembly_proxy_validation",
      "selected_planning",
      "proxy_cleanup",
      "assembly_plan_parse",
      "assembly_focus",
      "assembly_manifest",
      "assembly_validation",
      "assembly_result",
      "assembly_preview",
      "assembly_preview_validation",
      "assembly_signing",
    ]) {
      expect(records).toContainEqual(
        expect.objectContaining({
          phase,
          outcome: "succeeded",
          message: expect.stringContaining(": succeeded"),
        }),
      );
    }
    expect(records).toContainEqual(
      expect.objectContaining({
        phase: "assembly_cards",
        outcome: "completed",
        assembly: { cards: 0, plannedCards: 0, fallbackCards: 0 },
      }),
    );
    expect(records).toContainEqual(
      expect.objectContaining({
        phase: "assembly_pictures",
        outcome: "completed",
      }),
    );
    expect(records).toContainEqual(
      expect.objectContaining({
        assembly: {
          proxyBytes: 3,
          bytesMatched: true,
          checksumMatched: true,
        },
      }),
    );
    expect(records.at(-1)).toMatchObject({
      phase: "request",
      outcome: "completed",
      applicationHttpStatus: 200,
    });
    expect(captures).toContainEqual(
      expect.objectContaining({
        kind: "stage_output",
        stage: "assembly_selected_context",
        output: {
          range: result.manifest.range,
          words: result.words,
          captions: result.manifest.captions,
        },
      }),
    );
    expect(captures).toContainEqual(
      expect.objectContaining({
        kind: "stage_output",
        stage: "assembly_reconciliation_result",
      }),
    );
    for (const line of f.lines)
      expect(parseAnalysisDiagnosticLine(line)).not.toBeNull();
    const log = f.lines.join("\n");
    expect(log).not.toContain(result.receipt);
    expect(log).not.toContain(result.binding.fingerprint);
    for (const word of result.words)
      if (word.punctuatedText.length > 3)
        expect(log).not.toContain(`"${word.punctuatedText}"`);
  });
  it("preserves a provider failure while recording both proxy and source cleanup failures", async () => {
    const f = await fixture(),
      primary = new ApplicationError({
        code: "ANALYSIS_PROVIDER_FAILED",
        ruleId: "google_generation_http_400",
      });
    f.provider.plan.mockRejectedValue(primary);
    f.port.releaseProxy.mockRejectedValue(
      new Error("synthetic-private-cleanup"),
    );
    f.port.cancel.mockRejectedValue(new Error("synthetic-private-cancel"));
    await expect(diagnosedRun(f)).rejects.toBe(primary);
    const records = f.lines.map((line) => JSON.parse(line));
    for (const phase of [
      "selected_planning",
      "proxy_cleanup",
      "source_cleanup",
      "assembly_admission",
    ])
      expect(records).toContainEqual(
        expect.objectContaining({ phase, outcome: "failed" }),
      );
    expect(f.provider.plan).toHaveBeenCalledOnce();
    expect(f.port.preview).not.toHaveBeenCalled();
    expect(f.port.cancel).toHaveBeenCalledOnce();
    expect(f.lines.join("\n")).not.toContain("synthetic-private");
  });
  it("logs local plan schema critique and reaches preview with safe fallback", async () => {
    const f = await fixture();
    f.provider.plan.mockResolvedValue({
      version: 1,
      speaker: {
        version: 1,
        durationMs: 1,
        coordinateSpace: "source-normalized",
        shots: [],
      },
      cards: [],
    });
    const result = await diagnosedRun(f);
    expect(result.manifest.focus[0]).toMatchObject({
      mode: "held",
      reason: "opening-default",
    });
    expect(f.lines.map((line) => JSON.parse(line))).toContainEqual(
      expect.objectContaining({
        phase: "assembly_plan_parse",
        outcome: "completed",
        assembly: { qualityWarnings: 1 },
        validation: expect.objectContaining({
          reason: "schema_invalid",
          issueCount: expect.any(Number),
        }),
      }),
    );
    expect(f.port.preview).toHaveBeenCalledOnce();
    expect(f.port.cancel).not.toHaveBeenCalled();
    expect(f.provider.plan).toHaveBeenCalledOnce();
  });
  it("assembles signed analysis containing zero-duration words with one planner dispatch", async () => {
    const f = await fixture();
    const transcript = f.input.analysis.analysis.transcript.words;
    const candidate = f.input.analysis.analysis.candidates[0]!;
    const first = transcript.findIndex(
      (word) => word.id === candidate.startWordId,
    );
    const instantaneous = transcript[first + 1]!;
    instantaneous.endMs = instantaneous.startMs;
    const { receipt: _old, ...payload } = f.input.analysis;
    void _old;
    f.input.analysis.receipt = f.admission.completedReceipt(
      f.context,
      "candidate-analysis",
      payload.binding.sourceRevision,
      resultDigest(payload),
    );
    const result = await diagnosedRun(f);
    const cue = result.manifest.captions
      .flatMap((caption) => caption.wordCues)
      .find((item) => item.wordId === instantaneous.id)!;
    expect(cue.startMs).toBe(cue.endMs);
    expect(result.words.find((word) => word.id === instantaneous.id)).toEqual(
      instantaneous,
    );
    expect(f.port.select).toHaveBeenCalledOnce();
    expect(f.provider.plan).toHaveBeenCalledOnce();
    expect(f.port.preview).toHaveBeenCalledOnce();
    expect(f.port.releaseProxy).toHaveBeenCalledOnce();
    expect(f.port.cancel).not.toHaveBeenCalled();
    expect(f.sourceProvider.analyze).not.toHaveBeenCalled();
    expect(f.lines.map((line) => JSON.parse(line))).toContainEqual(
      expect.objectContaining({
        phase: "assembly_captions",
        outcome: "completed",
        assembly: expect.objectContaining({ captionZeroDurationCues: 1 }),
      }),
    );
  });
  it("logs an oversized caption word and continues with its literal text", async () => {
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
    const result = await diagnosedRun(f);
    expect(result.manifest.captions[0]!.text).toBe(
      "one two three four five six seven eight nine",
    );
    expect(f.port.select).toHaveBeenCalledOnce();
    expect(f.provider.plan).toHaveBeenCalledOnce();
    expect(f.port.preview).toHaveBeenCalledOnce();
    expect(f.lines.map((line) => JSON.parse(line))).toContainEqual(
      expect.objectContaining({
        phase: "assembly_captions",
        assembly: { qualityWarnings: 1 },
        validation: expect.objectContaining({
          reason: "unsupported-caption-word",
        }),
      }),
    );
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
    expect(f.service.verify(f.context, response.body).manifest.version).toBe(3);
    expect((await send()).status).toBe(409);
    expect(f.provider.plan).toHaveBeenCalledTimes(1);
    expect(f.port.select).toHaveBeenCalledTimes(1);
  });
  it("an invalid contextual card is omitted and preview continues without inventing a text fallback", async () => {
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
    const result = await f.service.run(f.context, f.input);
    expect(result.manifest.cards).toEqual([]);
    expect(f.port.releaseProxy).toHaveBeenCalledTimes(1);
    expect(f.port.cancel).toHaveBeenCalledTimes(0);
    expect(f.port.preview).toHaveBeenCalledOnce();
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
    expect(
      composeSelectedPlanProvider(
        loadConfig({ FAKE_MODE: "true", PAID_DEMO_ENABLED: "false" }),
        files,
      ),
    ).toBeNull();
    expect(
      composeSelectedPlanProvider(
        loadConfig({
          NODE_ENV: "test",
          FAKE_MODE: "true",
          PAID_DEMO_ENABLED: "false",
        }),
        files,
      ),
    ).toBeNull();
    expect(transport.upload).toHaveBeenCalledTimes(0);
  });
  it("serializes JSON-only selected video sampling with schema prompt guidance once", async () => {
    const config = loadConfig({
      ...createLiveValidationEnvironment(),
      ...createLiveValidationConnections("assembly"),
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
              {
                text: `synthetic-context\nExpected JSON response schema (guidance; return only the JSON object):\n${JSON.stringify(z.toJSONSchema(selectedAssemblyPlanSchema, { io: "input" }))}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          candidateCount: 1,
        },
      });
      const sent = z
        .object({ generationConfig: z.record(z.string(), z.unknown()) })
        .parse(body);
      expect(sent.generationConfig).not.toHaveProperty("responseJsonSchema");
      expect(sent.generationConfig).not.toHaveProperty("responseSchema");
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
        mode: "held",
        reason: "opening-default",
        box: { x: 0.13, y: 0.25, width: 0.24, height: 0.35 },
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
  it("preserves the primary selected-provider failure when both cleanup steps fail", async () => {
    const f = await fixture();
    const primary = new ApplicationError({ code: "ANALYSIS_PROVIDER_FAILED" });
    f.provider.plan.mockRejectedValue(primary);
    f.port.releaseProxy.mockRejectedValue(new Error("synthetic-proxy-cleanup"));
    f.port.cancel.mockRejectedValue(new Error("synthetic-source-cleanup"));
    await expect(f.service.run(f.context, f.input)).rejects.toBe(primary);
    expect(f.provider.plan).toHaveBeenCalledOnce();
    expect(f.port.releaseProxy).toHaveBeenCalledOnce();
    expect(f.port.cancel).toHaveBeenCalledOnce();
    expect(f.port.preview).not.toHaveBeenCalled();
  });
  it("releases the proxy and preserves the edit without text graphics on malformed model output", async () => {
    const f = await fixture();
    f.provider.plan.mockResolvedValue({ command: "synthetic" });
    const result = await f.service.run(f.context, f.input);
    expect(result.manifest.focus[0]).toMatchObject({
      mode: "held",
      reason: "opening-default",
    });
    expect(result.manifest.cards).toEqual([]);
    expect(f.provider.plan).toHaveBeenCalledTimes(1);
    expect(f.port.releaseProxy).toHaveBeenCalledTimes(1);
    expect(f.port.cancel).toHaveBeenCalledTimes(0);
    expect(f.port.preview).toHaveBeenCalledOnce();
  });
  it.each(["malformed", "unfinished", "unusable-sections"])(
    "reaches preview after %s selected Gemini output with one call and full cleanup",
    async (kind) => {
      const f = await fixture();
      const transport: GeminiTransport = {
        upload: vi.fn(async (name) => ({
          name,
          state: "ACTIVE",
          mimeType: "video/mp4",
          uri: `https://generativelanguage.googleapis.com/v1beta/${name}`,
        })),
        get: vi.fn(),
        generate: vi.fn(async () => ({
          finished: kind !== "unfinished",
          text:
            kind === "unusable-sections"
              ? JSON.stringify({
                  speaker: "synthetic-private-invalid",
                  cards: [{ kind: "unknown" }],
                })
              : "synthetic-private-not-json",
        })),
        delete: vi.fn(async () => {}),
      };
      f.service = new SelectedAssembly(
        f.admission,
        f.source,
        f.port,
        new GeminiSelectedPlanProvider(
          new GeminiAnalysisProvider(transport, 1000, undefined, f.diagnostics),
        ),
        "fake",
        f.diagnostics,
      );
      const result = await diagnosedRun(f);
      expect(f.service.verify(f.context, result)).toEqual(result);
      expect(result.manifest.cards).toEqual([]);
      expect(transport.upload).toHaveBeenCalledOnce();
      expect(transport.generate).toHaveBeenCalledOnce();
      expect(transport.delete).toHaveBeenCalledOnce();
      expect(f.port.preview).toHaveBeenCalledOnce();
      expect(f.port.releaseProxy).toHaveBeenCalledOnce();
      expect(f.port.cancel).not.toHaveBeenCalled();
      expect(f.sourceProvider.analyze).not.toHaveBeenCalled();
      expect(f.lines.join("\n")).not.toContain("synthetic-private");
      expect(f.lines.map((line) => JSON.parse(line))).toContainEqual(
        expect.objectContaining({ assembly: { qualityWarnings: 1 } }),
      );
    },
  );
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
      code: "CLEANUP_PENDING",
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
