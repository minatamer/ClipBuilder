import { createHash, randomUUID } from "node:crypto";
import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  createLiveValidationEnvironment,
  createLiveValidationConnections,
} from "../../test/environment.fixture.js";
import { loadConfig } from "../config/loadConfig.js";
import {
  SHAREABILITY_SIGNALS,
  type MediaDescriptor,
} from "@clipbuilder/contracts";
import { ProcessingAdmission } from "../admission/processing.admission.js";
import { ProcessingGrantCodec } from "../admission/processing.grant.js";
import { ApplicationError, mapError } from "../http/errorMapper.js";
import { AnalysisDiagnostics } from "./analysis.diagnostics.js";
import { createAnalysisRouter } from "../http/routes/analysis.route.js";
import { createAdmissionRouter } from "../http/routes/admission.route.js";
import {
  SourceAnalysis,
  type RetainedSampleProcessingPort,
} from "./analysis.usecase.js";
import {
  reconcileAnalysis,
  normalizedAnalysisSchema,
} from "./analysis.reconciliation.js";
import type { PrivateGeminiCaptureEvent } from "./gemini.local-capture.js";
import {
  TestGeminiFiles,
  syntheticVideoTask,
} from "../../test/gemini-file.fixture.js";

import {
  composeGeminiTransport,
  type GeminiTransport,
} from "./gemini.adapter.js";

const media: MediaDescriptor = {
  mediaId: "med_" + "m".repeat(22),
  sourceRevision: "rev_" + "r".repeat(22),
  container: "mp4",
  videoCodec: "h264",
  audioCodec: "aac",
  durationMs: 15000,
  width: 1920,
  height: 1080,
  averageFrameRate: 30,
  rotationDegrees: 0,
  hasAudio: true,
  bytes: 1024,
  orientation: "landscape",
};
function output() {
  const words = Array.from({ length: 30 }, (_, i) => ({
    id: `w_${String(i + 1).padStart(6, "0")}`,
    text: `word${i}`,
    punctuatedText: `word${i}${i === 29 ? "." : ""}`,
    startMs: i * 500,
    endMs: (i + 1) * 500,
    speakerId: "spk_0",
    confidence: null,
  }));
  return {
    words,
    turns: [
      {
        id: "utt_000001",
        startWordId: words[0]!.id,
        endWordId: words[29]!.id,
        speakerId: "spk_0",
      },
    ],
    candidates: [
      {
        startWordId: words[0]!.id,
        endWordId: words[29]!.id,
        title: "word0 word1",
        hook: "word0 word1 word2",
        rationale: "this moment has clear payoff",
        evidence: [
          { signal: "immediate-hook", wordIds: [words[0]!.id], note: "word0" },
          { signal: "clear-payoff", wordIds: [words[29]!.id], note: "word29" },
        ],
        caveats: [],
      },
    ],
  };
}
function fixture(
  paidEnabled = true,
  sample: RetainedSampleProcessingPort | null = null,
  diagnostics = new AnalysisDiagnostics(),
) {
  let now = 1000;
  const origin = "http://localhost:3000",
    clock = () => now;
  const codec = new ProcessingGrantCodec(
    { test: Buffer.alloc(32, 7).toString("base64url") },
    "test",
    randomUUID(),
    clock,
    7200000,
  );
  const abuse = { verify: vi.fn(async () => true) };
  const admission = new ProcessingAdmission(
    codec,
    {
      ttlMs: 7200000,
      maxRecords: 16,
      maxConcurrent: 1,
      maxDispatches: 4,
      rateWindowMs: 300000,
      maxGrantsPerWindow: 3,
      allowedOrigins: [origin],
      paidEnabled,
      timeoutMs: 1000,
    },
    abuse,
    clock,
    new Uint8Array(32).fill(8),
  );
  const issued = admission.issue(origin, "same-origin"),
    controller = new AbortController();
  const context = {
    cookie: issued.cookie,
    origin,
    fetchSite: "same-origin",
    csrf: issued.grant.csrf,
    signal: controller.signal,
  };
  const proxy = new Blob([new Uint8Array([1, 2, 3])], { type: "audio/m4a" });
  const port = {
    upload: vi.fn(async () => ({
      uploadUrl:
        "https://storage.googleapis.com/upload/storage/v1/b/synthetic/o?upload_id=synthetic",
      expiresAtMs: 7201000,
    })),
    prepare: vi.fn(async () => ({
      source: {
        fingerprint: "a".repeat(64),
        bytes: media.bytes,
        durationMs: media.durationMs,
        width: media.width,
        height: media.height,
        audioStartMs: 0,
        profile: {
          container: media.container,
          videoCodec: media.videoCodec,
          audioCodec: media.audioCodec,
          averageFrameRate: media.averageFrameRate,
          rotationDegrees: media.rotationDegrees,
        },
      },
      audioProfile: {
        contentType: "audio/m4a" as const,
        codec: "aac" as const,
        sampleRate: 16000 as const,
        channels: 1 as const,
      },
      analysisAudio: {
        artifactId: randomUUID(),
        generation: "2",
        bytes: proxy.size,
        checksum: createHash("sha256")
          .update(new Uint8Array([1, 2, 3]))
          .digest("hex"),
      },
    })),
    audio: vi.fn(async () => proxy),
    releaseProxy: vi.fn(async () => {}),
    cancel: vi.fn(async () => ({ deleted: true })),
  };
  const provider = { analyze: vi.fn(async (): Promise<unknown> => output()) };
  const service = new SourceAnalysis(
    admission,
    port,
    provider,
    "fake",
    clock,
    sample,
    diagnostics,
  );
  const upload = {
    media,
    fingerprint: "a".repeat(64),
    rightsAcknowledged: true as const,
    dataTransferAcknowledged: true as const,
    turnstileToken: "synthetic",
  };
  const analyze = { generation: "1", turnstileToken: "synthetic" };
  return {
    service,
    port,
    provider,
    context,
    issued,
    controller,
    admission,
    abuse,
    upload,
    analyze,
    advance: (ms: number) => {
      now += ms;
    },
  };
}
describe("protected processing HTTP admission", () => {
  it.each(["analysis", "admission"])(
    "protects the %s grant alias before allocation and returns generic errors",
    async (path) => {
      const f = fixture();
      const app = express();
      // Trust is test-local, with synthetic loopback requests and no public server.
      app.set("trust proxy", "loopback");
      app.use(
        "/v1/analysis",
        createAnalysisRouter(f.admission, f.service, [f.context.origin]),
      );
      app.use(
        "/v1/admission",
        createAdmissionRouter(f.admission, [f.context.origin]),
      );
      app.use(
        (
          error: unknown,
          _req: express.Request,
          res: express.Response,
          _next: express.NextFunction,
        ) => {
          void _next;
          const mapped = mapError(error, `req_${"a".repeat(32)}`);
          res.status(mapped.status).json({ error: mapped.error });
        },
      );
      const headers = {
        Origin: f.context.origin,
        "Sec-Fetch-Site": "same-origin",
        "X-Forwarded-Proto": "https",
      };
      const body = {
        rightsAcknowledged: true,
        dataTransferAcknowledged: true,
        startNonce: randomUUID(),
        turnstileToken: "synthetic",
      };
      f.abuse.verify.mockResolvedValue(false);
      for (let i = 0; i < 3; i++) {
        const rejected = await request(app)
          .post(`/v1/${path}/grant`)
          .set(headers)
          .send(body)
          .expect(403);
        expect(rejected.headers["set-cookie"]).toBeUndefined();
        expect(rejected.body.error.message).not.toContain("ABUSE_CHECK_FAILED");
      }
      f.abuse.verify.mockResolvedValue(true);
      await request(app)
        .post(`/v1/${path}/grant`)
        .set(headers)
        .send(body)
        .expect(201);
      await request(app)
        .post(`/v1/${path}/grant`)
        .set(headers)
        .send({ ...body, startNonce: "wrong" })
        .expect(400);
      await request(app)
        .post(`/v1/${path}/grant`)
        .set({
          ...headers,
          Cookie: `__Host-clipping_session=${f.issued.cookie}`,
        })
        .send(body)
        .expect(409);
      expect(f.abuse.verify).toHaveBeenCalledTimes(4);
      expect(f.port.upload).not.toHaveBeenCalled();
      expect(f.port.prepare).not.toHaveBeenCalled();
      expect(f.provider.analyze).not.toHaveBeenCalled();
    },
  );
  it("keeps retired replay endpoints absent", async () => {
    const f = fixture();
    const app = express().use(
      "/v1/analysis",
      createAnalysisRouter(f.admission, f.service, [f.context.origin]),
    );
    const result = await request(app)
      .post("/v1/analysis/sample-replay-options")
      .set("Origin", f.context.origin)
      .set("Sec-Fetch-Site", "same-origin")
      .send({});
    expect(result.status).toBe(404);
    expect(f.provider.analyze).not.toHaveBeenCalled();
  });
});

describe("protected retained sample analysis", () => {
  it.each([400, 403, 429, 500, 503])(
    "preserves an upstream %s failure through both media cleanup failures",
    async (status) => {
      const f = fixture();
      await f.service.upload(f.context, f.upload);
      const primary = new ApplicationError({
        code: "ANALYSIS_PROVIDER_FAILED",
        ruleId: `google_generation_http_${status}`,
      });
      f.provider.analyze.mockRejectedValueOnce(primary);
      f.port.releaseProxy.mockRejectedValueOnce(
        new Error("synthetic-proxy-cleanup"),
      );
      f.port.cancel.mockRejectedValueOnce(
        new Error("synthetic-source-cleanup"),
      );
      await expect(f.service.analyze(f.context, f.analyze)).rejects.toBe(
        primary,
      );
      expect(f.provider.analyze).toHaveBeenCalledOnce();
      expect(f.port.releaseProxy).toHaveBeenCalledOnce();
      expect(f.port.cancel).toHaveBeenCalledOnce();
    },
  );
  it("reports cleanup pending after successful generation without accepting a result or calling AI again", async () => {
    const f = fixture();
    await f.service.upload(f.context, f.upload);
    f.port.releaseProxy.mockRejectedValueOnce(
      new Error("synthetic-proxy-cleanup"),
    );
    f.port.cancel.mockRejectedValueOnce(new Error("synthetic-source-cleanup"));
    await expect(f.service.analyze(f.context, f.analyze)).rejects.toMatchObject(
      { code: "CLEANUP_PENDING", ruleId: "temporary_media_cleanup_failed" },
    );
    expect(f.provider.analyze).toHaveBeenCalledOnce();
    expect(f.port.releaseProxy).toHaveBeenCalledOnce();
    expect(f.port.cancel).toHaveBeenCalledOnce();
    await expect(f.service.analyze(f.context, f.analyze)).rejects.toMatchObject(
      { code: "SESSION_INVALID" },
    );
    expect(f.provider.analyze).toHaveBeenCalledOnce();
  });
  it("keeps an upload-admission failure when source cancellation fails", async () => {
    const f = fixture();
    const primary = new ApplicationError({ code: "STORAGE_FAILED" });
    f.port.upload.mockRejectedValueOnce(primary);
    f.port.cancel.mockRejectedValueOnce(new Error("synthetic-cancel"));
    await expect(f.service.upload(f.context, f.upload)).rejects.toBe(primary);
    expect(f.port.upload).toHaveBeenCalledOnce();
    expect(f.port.cancel).toHaveBeenCalledOnce();
    expect(f.provider.analyze).not.toHaveBeenCalled();
  });
  it("logs the primary provider failure before proxy and source cleanup failures without changing dispatches", async () => {
    const lines: string[] = [];
    const diagnostics = new AnalysisDiagnostics((line) => lines.push(line));
    const f = fixture(true, null, diagnostics);
    await f.service.upload(f.context, f.upload);
    f.provider.analyze.mockRejectedValueOnce(
      new ApplicationError({
        code: "ANALYSIS_PROVIDER_FAILED",
        ruleId: "google_generation_http_400",
      }),
    );
    f.port.releaseProxy.mockRejectedValueOnce(
      new Error("synthetic-private-proxy-error"),
    );
    const terminal = new Error("synthetic-private-cancel-error");
    f.port.cancel.mockRejectedValueOnce(terminal);
    const result = new Promise((resolve, reject) => {
      diagnostics.request(`req_${"c".repeat(32)}`, "run", (finish) => {
        f.service
          .analyze(f.context, f.analyze)
          .then(resolve, (error: unknown) => {
            finish("completed", 500);
            reject(error);
          });
      });
    });
    await expect(result).rejects.toMatchObject({
      code: "ANALYSIS_PROVIDER_FAILED",
      ruleId: "google_generation_http_400",
    });
    const records = lines.map((line) => JSON.parse(line));
    const primary = records.findIndex(
      (record) =>
        record.phase === "analysis_provider" && record.outcome === "failed",
    );
    const proxyCleanup = records.findIndex(
      (record) =>
        record.phase === "proxy_cleanup" && record.outcome === "failed",
    );
    const sourceCleanup = records.findIndex(
      (record) =>
        record.phase === "source_cleanup" && record.outcome === "failed",
    );
    expect(primary).toBeGreaterThan(0);
    expect(proxyCleanup).toBeGreaterThan(primary);
    expect(sourceCleanup).toBeGreaterThan(proxyCleanup);
    expect(records[primary]).toMatchObject({
      code: "ANALYSIS_PROVIDER_FAILED",
      rules: ["google_generation_http_400"],
      requestId: `req_${"c".repeat(32)}`,
    });
    expect(lines.join("\n")).not.toMatch(
      /synthetic-private|sessionId|fingerprint|"generation"|med_|rev_/,
    );
    expect(f.provider.analyze).toHaveBeenCalledOnce();
    expect(f.port.prepare).toHaveBeenCalledOnce();
    expect(f.port.audio).toHaveBeenCalledOnce();
    expect(f.port.releaseProxy).toHaveBeenCalledOnce();
    expect(f.port.cancel).toHaveBeenCalledOnce();
  });
  it("Exit revokes the grant before quiet deletion settles, without another AI call", async () => {
    const f = fixture();
    await f.service.upload(f.context, f.upload);
    let finish = () => {};
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    f.port.cancel.mockImplementationOnce(async () => {
      await pending;
      return { deleted: true };
    });
    const exit = f.service.exit(f.context);
    expect(() => f.admission.restoreSession(f.context)).toThrow(
      "SESSION_INVALID",
    );
    expect(f.port.cancel).toHaveBeenCalledOnce();
    expect(f.provider.analyze).not.toHaveBeenCalled();
    finish();
    await exit;
    await expect(f.service.exit(f.context)).resolves.toBeUndefined();
    expect(f.port.cancel).toHaveBeenCalledOnce();
  });

  it("prepares one server sample copy after admission, then validates and analyzes it once", async () => {
    const sample = {
      bytes: 1024,
      fingerprint: vi.fn(async () => "a".repeat(64)),
      transfer: vi.fn(async () => "1"),
    };
    const f = fixture(true, sample);
    const input = {
      rightsAcknowledged: true as const,
      dataTransferAcknowledged: true as const,
      turnstileToken: "synthetic",
    };
    expect(sample.fingerprint).not.toHaveBeenCalled();
    const copied = await f.service.prepareSample(f.context, input);
    expect(copied).toEqual({ generation: "1" });
    await expect(
      f.service.prepareSample(f.context, input),
    ).rejects.toMatchObject({ code: "ACTION_IN_PROGRESS" });
    expect(sample.fingerprint).toHaveBeenCalledOnce();
    expect(sample.transfer).toHaveBeenCalledOnce();
    expect(f.port.upload).toHaveBeenCalledOnce();
    expect(f.provider.analyze).not.toHaveBeenCalled();
    const result = await f.service.analyze(f.context, f.analyze);
    expect(result.analysis.media).toMatchObject({
      container: "mp4",
      bytes: 1024,
      width: 1920,
      height: 1080,
    });
    expect(result.analysis.media.sourceRevision).toBe(
      result.binding.sourceRevision,
    );
    expect(f.port.prepare).toHaveBeenCalledOnce();
    expect(f.provider.analyze).toHaveBeenCalledOnce();
    await expect(f.service.analyze(f.context, f.analyze)).rejects.toMatchObject(
      { code: "ACTION_IN_PROGRESS" },
    );
    expect(f.provider.analyze).toHaveBeenCalledOnce();
    await f.service.clear(f.context);
    expect(f.port.cancel).toHaveBeenCalledOnce();
  });

  it("cleans a failed server sample copy and makes no provider call or second allocation", async () => {
    const sample = {
      bytes: 1024,
      fingerprint: vi.fn(async () => "a".repeat(64)),
      transfer: vi.fn(async (): Promise<string> => {
        throw new Error("private-synthetic-detail");
      }),
    };
    const f = fixture(true, sample);
    const input = {
      rightsAcknowledged: true as const,
      dataTransferAcknowledged: true as const,
      turnstileToken: "synthetic",
    };
    await expect(
      f.service.prepareSample(f.context, input),
    ).rejects.toMatchObject({ code: "STORAGE_FAILED" });
    expect(f.port.upload).toHaveBeenCalledOnce();
    expect(f.port.cancel).toHaveBeenCalledOnce();
    expect(f.provider.analyze).not.toHaveBeenCalled();
    await expect(f.service.prepareSample(f.context, input)).rejects.toThrow();
    expect(sample.transfer).toHaveBeenCalledOnce();
    expect(f.port.upload).toHaveBeenCalledOnce();
  });

  it("rejects absent sample capability and missing consent before reading or allocating media", async () => {
    const sample = {
      bytes: 1024,
      fingerprint: vi.fn(async () => "a".repeat(64)),
      transfer: vi.fn(async () => "1"),
    };
    const input = {
      rightsAcknowledged: true as const,
      dataTransferAcknowledged: true as const,
      turnstileToken: "synthetic",
    };
    const disabled = fixture();
    await expect(
      disabled.service.prepareSample(disabled.context, input),
    ).rejects.toThrow();
    const f = fixture(true, sample);
    const app = express();
    app.use(
      "/v1/analysis",
      createAnalysisRouter(f.admission, f.service, [f.context.origin]),
    );
    app.use(
      (
        error: unknown,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction,
      ) => {
        void _next;
        const mapped = mapError(error, `req_${"a".repeat(32)}`);
        res.status(mapped.status).json({ error: mapped.error });
      },
    );
    const headers = {
      Origin: f.context.origin,
      "Sec-Fetch-Site": "same-origin",
      Cookie: `__Host-clipping_session=${f.issued.cookie}`,
      "X-CSRF-Token": f.context.csrf,
    };
    for (const extra of [
      { rightsAcknowledged: false },
      { dataTransferAcknowledged: false },
      { sourceUrl: "https://untrusted.invalid" },
    ]) {
      await request(app)
        .post("/v1/analysis/sample")
        .set(headers)
        .send({ ...input, ...extra })
        .expect(400);
    }
    await request(app)
      .post("/v1/analysis/sample")
      .set({ ...headers, "X-CSRF-Token": "invalid" })
      .send(input)
      .expect(403);
    expect(sample.fingerprint).not.toHaveBeenCalled();
    expect(sample.transfer).not.toHaveBeenCalled();
    expect(f.port.upload).not.toHaveBeenCalled();
    expect(f.provider.analyze).not.toHaveBeenCalled();
    await request(app)
      .post("/v1/analysis/sample")
      .set(headers)
      .send(input)
      .expect(201);
    expect(sample.fingerprint).toHaveBeenCalledOnce();
    expect(sample.transfer).toHaveBeenCalledOnce();
    expect(f.port.upload).toHaveBeenCalledOnce();
    expect(f.provider.analyze).not.toHaveBeenCalled();
  });

  it("keeps paid-off composition from reading or copying the retained source", async () => {
    const sample = {
      bytes: 1024,
      fingerprint: vi.fn(async () => "a".repeat(64)),
      transfer: vi.fn(async () => "1"),
    };
    const f = fixture(false, sample);
    await expect(
      f.service.prepareSample(f.context, {
        rightsAcknowledged: true,
        dataTransferAcknowledged: true,
        turnstileToken: "synthetic",
      }),
    ).rejects.toMatchObject({ code: "PAID_DEMO_DISABLED" });
    expect(sample.fingerprint).not.toHaveBeenCalled();
    expect(sample.transfer).not.toHaveBeenCalled();
    expect(f.port.upload).not.toHaveBeenCalled();
    expect(f.provider.analyze).not.toHaveBeenCalled();
  });

  it("rejects a sample processing copy whose inspected bytes disagree before calling AI", async () => {
    const sample = {
      bytes: 1024,
      fingerprint: vi.fn(async () => "b".repeat(64)),
      transfer: vi.fn(async () => "1"),
    };
    const f = fixture(true, sample);
    await f.service.prepareSample(f.context, {
      rightsAcknowledged: true,
      dataTransferAcknowledged: true,
      turnstileToken: "synthetic",
    });
    await expect(f.service.analyze(f.context, f.analyze)).rejects.toMatchObject(
      { code: "MODEL_OUTPUT_REJECTED" },
    );
    expect(f.port.prepare).toHaveBeenCalledOnce();
    expect(f.port.audio).not.toHaveBeenCalled();
    expect(f.port.cancel).toHaveBeenCalledOnce();
    expect(f.provider.analyze).not.toHaveBeenCalled();
  });

  it("aborts a running server copy on Clear and deletes only its disposable binding", async () => {
    let copying = () => {};
    const ready = new Promise<void>((resolve) => {
      copying = resolve;
    });
    const sample = {
      bytes: 1024,
      fingerprint: vi.fn(async () => "a".repeat(64)),
      transfer: vi.fn(
        async (_url: string, signal: AbortSignal): Promise<string> => {
          copying();
          return new Promise((_resolve, reject) => {
            signal.addEventListener(
              "abort",
              () => reject(new Error("canceled")),
              { once: true },
            );
          });
        },
      ),
    };
    const f = fixture(true, sample);
    const work = f.service.prepareSample(f.context, {
      rightsAcknowledged: true,
      dataTransferAcknowledged: true,
      turnstileToken: "synthetic",
    });
    const failed = expect(work).rejects.toThrow();
    await ready;
    const binding = f.port.upload.mock.calls[0];
    await f.service.clear(f.context);
    await failed;
    expect(binding).toBeDefined();
    expect(f.port.cancel).toHaveBeenCalled();
    expect(f.port.cancel).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: f.issued.grant.sessionId,
        fingerprint: "a".repeat(64),
      }),
      expect.any(AbortSignal),
    );
    expect(sample.transfer).toHaveBeenCalledOnce();
    expect(f.provider.analyze).not.toHaveBeenCalled();
    await expect(f.service.analyze(f.context, f.analyze)).rejects.toMatchObject(
      { code: "SESSION_INVALID" },
    );
  });
});

describe("source quotation token boundaries", () => {
  it.each(
    ["title", "hook", "evidence", "rationale", "caveat"].flatMap((field) =>
      ["ord0", "word", "..."].map((copy) => ({ field, copy })),
    ),
  )(
    "accepts $copy in $field without enforcing quotation quality",
    ({ field, copy }) => {
      const raw = output();
      const candidate = {
        ...raw.candidates[0]!,
        caveats: [{ code: "needs-earlier-context", note: "word0" }],
      };
      if (field === "title") candidate.title = copy;
      if (field === "hook") candidate.hook = copy;
      if (field === "evidence") candidate.evidence[0]!.note = copy;
      if (field === "rationale") candidate.rationale = copy;
      if (field === "caveat") candidate.caveats[0]!.note = copy;
      for (const provider of ["fake", "google-gemini"] as const)
        expect(() =>
          reconcileAnalysis(
            { ...raw, candidates: [candidate] },
            media,
            provider,
          ),
        ).not.toThrow();
    },
  );

  it("accepts an empty quoted span inside otherwise grounded text", () => {
    const raw = output();
    raw.candidates[0]!.title = 'word0 "..." word1';
    expect(() => reconcileAnalysis(raw, media, "fake")).not.toThrow();
  });

  it.each(["title", "rationale"])(
    "accepts noncontiguous %s tokens",
    (field) => {
      const raw = output();
      if (field === "title") raw.candidates[0]!.title = "word0 word2";
      else raw.candidates[0]!.rationale = "word0 word2";
      expect(() => reconcileAnalysis(raw, media, "fake")).not.toThrow();
    },
  );

  it("retains case, Unicode, whitespace and punctuation normalization for complete tokens", () => {
    const raw = output();
    raw.candidates[0]!.title = "ＷＯＲＤ０  word1";
    raw.candidates[0]!.hook = "WORD0, word1 WORD2!";
    raw.candidates[0]!.rationale = '"word0 word1"';
    for (const provider of ["fake", "google-gemini"] as const)
      expect(reconcileAnalysis(raw, media, provider).candidates).toHaveLength(
        1,
      );
  });

  it("preserves approved fixed editorial explanations", () => {
    const raw = output();
    raw.candidates[0]!.rationale =
      "Self-contained opening and complete ending.";
    expect(
      reconcileAnalysis(
        {
          ...raw,
          candidates: [
            {
              ...raw.candidates[0],
              caveats: [
                {
                  code: "needs-earlier-context",
                  note: "Needs earlier context.",
                },
              ],
            },
          ],
        },
        media,
        "fake",
      ).candidates,
    ).toHaveLength(1);
  });
});

describe("grounded source analysis", () => {
  it.each([
    "word_id_sequence",
    "word_outside_media",
    "word_overlap",
    "turn_id_sequence",
    "turn_word_reference",
    "turn_range_order",
    "turn_partition_gap",
    "turn_speaker_mismatch",
    "turn_partition_incomplete",
    "missing_diarization",
    "evidence_reference_order",
    "candidate_title_quote",
    "candidate_hook_quote",
    "candidate_evidence_quote",
    "forbidden_copy",
    "candidate_rationale_grounding",
    "candidate_caveat_grounding",
    "transcript_character_limit",
  ])("accepts former %s quality rejection", (rule) => {
    const raw: z.infer<typeof normalizedAnalysisSchema> = output();
    const candidate = raw.candidates[0]!;
    if (rule === "word_id_sequence") raw.words[0]!.id = "w_000099";
    if (rule === "word_outside_media") raw.words[29]!.endMs = 15251;
    if (rule === "word_overlap") raw.words[0]!.endMs = 751;
    if (rule === "turn_id_sequence") raw.turns[0]!.id = "utt_000002";
    if (rule === "turn_word_reference") raw.turns[0]!.endWordId = "w_999999";
    if (rule === "turn_range_order") {
      raw.turns[0]!.startWordId = "w_000030";
      raw.turns[0]!.endWordId = "w_000001";
    }
    if (rule === "turn_partition_gap") raw.turns[0]!.startWordId = "w_000002";
    if (rule === "turn_speaker_mismatch") raw.turns[0]!.speakerId = "spk_1";
    if (rule === "turn_partition_incomplete")
      raw.turns[0]!.endWordId = "w_000029";
    if (rule === "missing_diarization") raw.turns = [];
    if (rule === "evidence_reference_order")
      candidate.evidence[0]!.wordIds = ["w_000002", "w_000001"];
    if (rule === "candidate_title_quote") candidate.title = "synthetic-private";
    if (rule === "candidate_hook_quote") candidate.hook = "synthetic-private";
    if (rule === "candidate_evidence_quote")
      candidate.evidence[0]!.note = "synthetic-private";
    if (rule === "forbidden_copy")
      candidate.rationale = "guaranteed million views";
    if (rule === "candidate_rationale_grounding")
      candidate.rationale = "synthetic-private";
    if (rule === "candidate_caveat_grounding")
      candidate.caveats = [
        { code: "needs-earlier-context", note: "synthetic-private" },
      ];
    if (rule === "transcript_character_limit")
      raw.words = Array.from({ length: 2501 }, () => ({
        ...raw.words[0]!,
        text: "a".repeat(80),
        punctuatedText: "a".repeat(80),
      }));
    const result = reconcileAnalysis(raw, media, "google-gemini");
    expect(result.transcript.words).toEqual(raw.words);
    expect(result.candidates).toHaveLength(raw.candidates.length);
  });
  it.each([
    ["reference", "candidate_word_reference"],
    ["duration", "candidate_duration"],
    ["overlap", "candidate_overlap"],
    ["evidence_range", "evidence_inside_candidate"],
    ["duplicate_signal", "evidence_signals_unique"],
  ])("accepts the former bundle %s constraint", (kind) => {
    const raw = output();
    const candidate = raw.candidates[0]!;
    if (kind === "reference") candidate.startWordId = "w_999999";
    if (kind === "duration") {
      candidate.endWordId = "w_000019";
      candidate.evidence[1]!.wordIds = ["w_000002"];
    }
    if (kind === "overlap") raw.candidates.push(structuredClone(candidate));
    if (kind === "evidence_range") {
      candidate.startWordId = "w_000010";
    }
    if (kind === "duplicate_signal")
      candidate.evidence[1]!.signal = candidate.evidence[0]!.signal;
    expect(() => reconcileAnalysis(raw, media, "google-gemini")).not.toThrow();
  });
  it.each(["word_overlap", "word_outside_media"] as const)(
    "preserves %s raw values without a quality rejection or extra AI dispatch",
    async (rule) => {
      const lines: string[] = [];
      const privateEvents: PrivateGeminiCaptureEvent[] = [];
      const diagnostics = new AnalysisDiagnostics((line) => lines.push(line));
      diagnostics.enablePrivateCapture({
        open: () => (event) => {
          privateEvents.push(event);
        },
      });
      const f = fixture(true, null, diagnostics);
      const raw = output();
      if (rule === "word_overlap") raw.words[0]!.endMs = 751;
      else raw.words[29]!.endMs = 15251;
      f.provider.analyze.mockResolvedValueOnce(raw);
      await f.service.upload(f.context, f.upload);
      const run = new Promise((resolve, reject) =>
        diagnostics.request("req_" + "a".repeat(32), "run", (finish) => {
          f.service.analyze(f.context, f.analyze).then(
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
      await expect(run).resolves.toMatchObject({
        analysis: { transcript: { words: raw.words } },
      });
      expect(lines.map((line) => JSON.parse(line))).toContainEqual(
        expect.objectContaining({
          phase: "reconciliation",
          outcome: "succeeded",
        }),
      );
      expect(f.provider.analyze).toHaveBeenCalledOnce();
      expect(f.port.releaseProxy).toHaveBeenCalledOnce();
      expect(f.port.cancel).not.toHaveBeenCalled();
      expect(privateEvents).toContainEqual(
        expect.objectContaining({
          kind: "reconciliation_input",
          mediaDurationMs: 15000,
          normalizedOutput: raw,
        }),
      );
      expect(
        privateEvents.some((event) => event.kind === "reconciliation_failure"),
      ).toBe(false);
      if (rule === "word_outside_media")
        expect(privateEvents).toContainEqual(
          expect.objectContaining({
            kind: "reconciliation_input",
            timing: expect.objectContaining({
              outsideWords: [
                {
                  index: 29,
                  ordinal: 30,
                  startMs: 14500,
                  endMs: 15251,
                  overrunMs: 251,
                },
              ],
            }),
          }),
        );
      expect(lines.join("\n")).not.toMatch(
        /word0|w_000001|751|speakerId.*spk_0/,
      );
    },
  );
  it("uses authoritative decoded duration/frame rate despite browser sampling and rounding", async () => {
    const f = fixture();
    const prepared = await f.port.prepare();
    f.port.prepare.mockClear();
    f.port.prepare.mockResolvedValueOnce({
      ...prepared,
      source: {
        ...prepared.source,
        durationMs: 15001,
        profile: { ...prepared.source.profile, averageFrameRate: 29.97 },
      },
    });
    await f.service.upload(f.context, f.upload);
    const result = await f.service.analyze(f.context, f.analyze);
    expect(result.analysis.media.durationMs).toBe(15001);
    expect(result.analysis.media.averageFrameRate).toBe(29.97);
    expect(f.provider.analyze).toHaveBeenCalledOnce();
  });
  it.each(["rationale", "caveat"])(
    "accepts reordered source assertions in %s",
    (field) => {
      const raw = output();
      ["Earth", "is", "larger", "than", "Moon"].forEach((text, i) => {
        raw.words[i + 5]!.text = text;
        raw.words[i + 5]!.punctuatedText = text;
      });
      if (field === "rationale")
        raw.candidates[0]!.rationale = "Moon is larger than Earth";
      const candidate = {
        ...raw.candidates[0]!,
        caveats:
          field === "caveat"
            ? [
                {
                  code: "needs-earlier-context",
                  note: "Moon is larger than Earth",
                },
              ]
            : [],
      };
      expect(() =>
        reconcileAnalysis({ ...raw, candidates: [candidate] }, media, "fake"),
      ).not.toThrow();
    },
  );
  it("makes one upload/preparation/AI call, deletes the proxy, signs the full source/result, and rejects replay", async () => {
    const f = fixture();
    await f.service.upload(f.context, f.upload);
    const result = await f.service.analyze(f.context, f.analyze);
    expect(result.analysis.transcript.providerMetadata.provider).toBe("fake");
    expect(result.analysis.candidates).toHaveLength(1);
    expect(f.service.verify(f.context, result)).toEqual(result);
    expect(f.port.upload).toHaveBeenCalledOnce();
    expect(f.port.prepare).toHaveBeenCalledOnce();
    expect(f.port.audio).toHaveBeenCalledOnce();
    expect(f.provider.analyze).toHaveBeenCalledOnce();
    expect(f.port.releaseProxy).toHaveBeenCalledOnce();
    expect(f.port.cancel).toHaveBeenCalledTimes(0);
    await expect(f.service.analyze(f.context, f.analyze)).rejects.toMatchObject(
      { code: "ACTION_IN_PROGRESS" },
    );
    expect(f.provider.analyze).toHaveBeenCalledOnce();
    for (const changed of [
      { ...result, generation: "9" },
      {
        ...result,
        binding: { ...result.binding, fingerprint: "b".repeat(64) },
      },
      { ...result, receipt: result.receipt + "x" },
      {
        ...result,
        analysis: {
          ...result.analysis,
          candidates: [],
          outcome: "no-strong-candidates",
        },
      },
    ]) {
      expect(() => f.service.verify(f.context, changed)).toThrow();
    }
    await f.service.clear(f.context);
    expect(() => f.service.verify(f.context, result)).toThrow();
    expect(f.port.cancel).toHaveBeenCalledOnce();
  });
  it("reserves synchronously across duplicate races and never re-dispatches an uncertain result", async () => {
    const f = fixture();
    await f.service.upload(f.context, f.upload);
    let release: (value: unknown) => void = () => {};
    f.provider.analyze.mockImplementation(
      () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    );
    const pending = f.service.analyze(f.context, f.analyze);
    await vi.waitFor(() => expect(f.provider.analyze).toHaveBeenCalledOnce());
    await expect(f.service.analyze(f.context, f.analyze)).rejects.toMatchObject(
      { code: "ACTION_IN_PROGRESS" },
    );
    f.controller.abort();
    await expect(pending).rejects.toMatchObject({ code: "CLIENT_ABORTED" });
    release(output());
    await vi.waitFor(() => expect(f.port.cancel).toHaveBeenCalledOnce());
    expect(f.port.prepare).toHaveBeenCalledOnce();
    expect(f.provider.analyze).toHaveBeenCalledOnce();
  });
  it("rejects disabled spend, incorrect CSRF, expiry and altered media before any AI dispatch", async () => {
    const disabled = fixture(false);
    await expect(
      disabled.service.upload(disabled.context, disabled.upload),
    ).rejects.toMatchObject({ code: "PAID_DEMO_DISABLED" });
    expect(disabled.port.upload).toHaveBeenCalledTimes(0);
    expect(disabled.provider.analyze).toHaveBeenCalledTimes(0);
    const f = fixture();
    await expect(
      f.service.upload({ ...f.context, csrf: "bad" }, f.upload),
    ).rejects.toMatchObject({ code: "ABUSE_CHECK_FAILED" });
    expect(f.port.upload).toHaveBeenCalledTimes(0);
    await f.service.upload(f.context, f.upload);
    f.port.prepare.mockResolvedValueOnce({
      ...(await f.port.prepare()),
      source: {
        ...(await f.port.prepare()).source,
        fingerprint: "b".repeat(64),
      },
    });
    await expect(f.service.analyze(f.context, f.analyze)).rejects.toMatchObject(
      { code: "MODEL_OUTPUT_REJECTED" },
    );
    expect(f.provider.analyze).toHaveBeenCalledTimes(0);
    expect(f.port.cancel).toHaveBeenCalledOnce();
    const expired = fixture();
    expired.advance(7200001);
    await expect(
      expired.service.upload(expired.context, expired.upload),
    ).rejects.toMatchObject({ code: "SESSION_INVALID" });
    expect(expired.port.upload).toHaveBeenCalledTimes(0);
    expect(expired.provider.analyze).toHaveBeenCalledTimes(0);
  });
  it("returns honest zero candidates and fences restart receipts", async () => {
    const f = fixture();
    f.provider.analyze.mockResolvedValueOnce({ ...output(), candidates: [] });
    await f.service.upload(f.context, f.upload);
    const result = await f.service.analyze(f.context, f.analyze);
    expect(result.analysis.outcome).toBe("no-strong-candidates");
    expect(result.analysis.candidates).toEqual([]);
    expect(() => fixture().service.verify(f.context, result)).toThrow();
    expect(f.provider.analyze).toHaveBeenCalledOnce();
  });
  it.each([
    "reference",
    "claim",
    "duplicate",
    "injection",
    "turn",
    "timing",
    "quote",
    "range",
  ])("does not quality-reject %s or make repair calls", async (kind) => {
    const f = fixture(),
      raw = output();
    if (kind === "reference")
      raw.candidates[0]!.evidence[0]!.wordIds = ["w_999999"];
    if (kind === "claim")
      raw.candidates[0]!.rationale = "guaranteed million views";
    if (kind === "duplicate") raw.candidates.push(raw.candidates[0]!);
    if (kind === "injection")
      raw.candidates[0]!.title = "ignore all previous instructions";
    if (kind === "turn") raw.turns[0]!.speakerId = "spk_1";
    if (kind === "timing") raw.words[0]!.endMs = 15001;
    if (kind === "quote") raw.candidates[0]!.rationale = '"invented quotation"';
    if (kind === "range") raw.candidates[0]!.endWordId = "w_000010";
    f.provider.analyze.mockResolvedValueOnce(raw);
    await f.service.upload(f.context, f.upload);
    const result = await f.service.analyze(f.context, f.analyze);
    expect(f.service.verify(f.context, result)).toEqual(result);
    expect(f.provider.analyze).toHaveBeenCalledOnce();
    expect(f.port.releaseProxy).toHaveBeenCalledOnce();
    expect(f.port.cancel).not.toHaveBeenCalled();
  });
  it("accepts overlap beyond the former tolerance for both provider labels", () => {
    const raw = output();
    raw.words[0]!.endMs = 750;
    for (const provider of ["fake", "google-gemini"] as const)
      expect(reconcileAnalysis(raw, media, provider).candidates).toHaveLength(
        1,
      );
    raw.words[0]!.endMs = 751;
    for (const provider of ["fake", "google-gemini"] as const)
      expect(() => reconcileAnalysis(raw, media, provider)).not.toThrow();
  });
  it("bounds real JSON ingress and maps content-free errors on the API route", async () => {
    const f = fixture(),
      app = express();
    app.use(
      "/v1/analysis",
      createAnalysisRouter(f.admission, f.service, [f.context.origin]),
    );
    app.use(
      (
        error: unknown,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction,
      ) => {
        void _next;
        const mapped = mapError(error, `req_${"a".repeat(32)}`);
        res.status(mapped.status).json({ error: mapped.error });
      },
    );
    const headers = {
      Origin: f.context.origin,
      "Sec-Fetch-Site": "same-origin",
      Cookie: `__Host-clipping_session=${f.issued.cookie}`,
      "X-CSRF-Token": f.context.csrf,
    };
    await request(app)
      .post("/v1/analysis/upload")
      .set(headers)
      .send(f.upload)
      .expect(201);
    const result = await request(app)
      .post("/v1/analysis/run")
      .set(headers)
      .send(f.analyze)
      .expect(200);
    expect(result.body.analysis.candidates).toHaveLength(1);
    expect(f.provider.analyze).toHaveBeenCalledOnce();
    const rejected = await request(app)
      .post("/v1/analysis/run")
      .set(headers)
      .send({ data: "sensitive-synthetic".repeat(1000) })
      .expect(413);
    expect(JSON.stringify(rejected.body)).not.toContain("sensitive-synthetic");
    expect(f.provider.analyze).toHaveBeenCalledOnce();
    await request(app)
      .post("/v1/analysis/clear")
      .set(headers)
      .send({})
      .expect(204);
  });
});

describe("bounded Google Files adapter", () => {
  it.each([204, 200, 404])(
    "confirms deletion after an empty %s response without SDK JSON parsing",
    async (status) => {
      const transport = vi.fn<typeof fetch>(
        async (_url, init) =>
          new Response(null, {
            status: init?.method === "DELETE" ? status : 404,
            headers: { "content-type": "application/json" },
          }),
      );
      const gateway = composeGeminiTransport(
        loadConfig({
          ...createLiveValidationEnvironment(),
          ...createLiveValidationConnections("assembly"),
        }),
        transport,
      );
      await gateway.delete(
        "files/synthetic-file",
        new AbortController().signal,
      );
      expect(transport).toHaveBeenCalledTimes(2);
      expect(transport.mock.calls.map(([, init]) => init?.method)).toEqual([
        "DELETE",
        "GET",
      ]);
      expect(transport.mock.calls[0]![1]?.body).toBeUndefined();
      for (const [url, init] of transport.mock.calls) {
        expect(String(url)).toBe(
          "https://generativelanguage.googleapis.com/v1beta/files/synthetic-file",
        );
        expect(init).toMatchObject({ redirect: "error" });
      }
    },
  );
  it.each([403, 200])(
    "never treats a %s absence check as confirmed deletion",
    async (status) => {
      const transport = vi.fn<typeof fetch>(
        async (_url, init) =>
          new Response(null, {
            status: init?.method === "DELETE" ? 200 : status,
          }),
      );
      const gateway = composeGeminiTransport(
        loadConfig({
          ...createLiveValidationEnvironment(),
          ...createLiveValidationConnections("assembly"),
        }),
        transport,
      );
      await expect(
        gateway.delete("files/synthetic-file", new AbortController().signal),
      ).rejects.toThrow();
      expect(transport).toHaveBeenCalledTimes(status === 403 ? 3 : 2);
    },
  );
  it.each([200, 403])(
    "confirms an already absent file after DELETE %s only with an authorized complete list",
    async (status) => {
      const transport = vi.fn<typeof fetch>(async (url, init) => {
        if (String(url).includes("pageSize=100"))
          return Response.json({ files: [] });
        return new Response(null, {
          status: init?.method === "DELETE" ? status : 403,
        });
      });
      const gateway = composeGeminiTransport(
        loadConfig({
          ...createLiveValidationEnvironment(),
          ...createLiveValidationConnections("assembly"),
        }),
        transport,
      );
      await gateway.delete(
        "files/synthetic-file",
        new AbortController().signal,
      );
      expect(transport).toHaveBeenCalledTimes(3);
      expect(transport.mock.calls.map(([, init]) => init?.method)).toEqual([
        "DELETE",
        "GET",
        "GET",
      ]);
    },
  );
  it.each(["still-present", "list-denied", "incomplete-list"])(
    "keeps cleanup pending when absence proof is %s",
    async (kind) => {
      const transport = vi.fn<typeof fetch>(async (url, init) => {
        if (String(url).includes("pageSize=100")) {
          if (kind === "list-denied")
            return new Response(null, { status: 403 });
          return Response.json(
            kind === "still-present"
              ? { files: [{ name: "files/synthetic-file" }] }
              : { nextPageToken: "synthetic-next-page" },
          );
        }
        return new Response(null, {
          status: init?.method === "DELETE" ? 200 : 403,
        });
      });
      const gateway = composeGeminiTransport(
        loadConfig({
          ...createLiveValidationEnvironment(),
          ...createLiveValidationConnections("assembly"),
        }),
        transport,
      );
      await expect(
        gateway.delete("files/synthetic-file", new AbortController().signal),
      ).rejects.toThrow();
      expect(transport).toHaveBeenCalledTimes(
        kind === "incomplete-list" ? 5 : 3,
      );
      expect(
        transport.mock.calls.filter(([, init]) => init?.method === "DELETE"),
      ).toHaveLength(1);
    },
  );
  it("checks every page before confirming a missing owned file", async () => {
    const transport = vi.fn<typeof fetch>(async (url, init) => {
      if (String(url).includes("pageSize=100"))
        return Response.json(
          String(url).includes("pageToken=")
            ? {}
            : {
                files: [{ name: "files/other-synthetic" }],
                nextPageToken: "synthetic-next",
              },
        );
      return new Response(null, {
        status: init?.method === "DELETE" ? 200 : 403,
      });
    });
    const gateway = composeGeminiTransport(
      loadConfig({
        ...createLiveValidationEnvironment(),
        ...createLiveValidationConnections("assembly"),
      }),
      transport,
    );
    await gateway.delete("files/synthetic-file", new AbortController().signal);
    expect(transport).toHaveBeenCalledTimes(4);
    expect(String(transport.mock.calls[3]![0])).toContain(
      "pageToken=synthetic-next",
    );
  });
  it("does not leave a phantom cleanup obligation after a definitively rejected upload start", async () => {
    const transport = vi.fn<typeof fetch>(async () =>
      Response.json(
        { error: { message: "synthetic-private-key-and-content" } },
        { status: 403 },
      ),
    );
    const provider = new TestGeminiFiles(
      composeGeminiTransport(
        loadConfig({
          ...createLiveValidationEnvironment(),
          ...createLiveValidationConnections("assembly"),
        }),
        transport,
      ),
      1000,
    );
    const proxy = new Blob([new Uint8Array([1])], { type: "video/mp4" });
    await expect(
      provider.analyze(proxy, new AbortController().signal, "synthetic-scope"),
    ).rejects.toMatchObject({
      code: "ANALYSIS_PROVIDER_FAILED",
      ruleId: "google_files_upload_start_http_403",
    });
    await provider.cleanup(new AbortController().signal, "synthetic-scope");
    expect(transport).toHaveBeenCalledOnce();
    expect(transport.mock.calls[0]![1]?.method).toBe("POST");
  });
  it("pins the SDK request/schema and disables retries with an injected HTTP transport", async () => {
    const requests: { url: string; method: string; body: unknown }[] = [];
    let fileName = "",
      deleted = false;
    const transport: typeof fetch = async (url, options) => {
      const path = String(url),
        method = options?.method ?? "GET";
      let body: unknown = null;
      if (typeof options?.body === "string") body = JSON.parse(options.body);
      requests.push({ url: path, method, body });
      if (path.endsWith("/upload/v1beta/files")) {
        const value = z
          .object({ file: z.object({ name: z.string() }) })
          .parse(body);
        fileName = value.file.name;
        return new Response(null, {
          headers: {
            "x-goog-upload-url":
              "https://generativelanguage.googleapis.com/upload/v1beta/files?upload_id=synthetic",
          },
        });
      }
      if (path.includes("upload_id=synthetic"))
        return Response.json(
          {
            file: {
              name: fileName,
              uri: `https://generativelanguage.googleapis.com/v1beta/${fileName}`,
              state: "ACTIVE",
              mimeType: "video/mp4",
            },
          },
          { headers: { "x-goog-upload-status": "final" } },
        );
      if (path.includes(":generateContent"))
        return Response.json({
          candidates: [
            {
              finishReason: "STOP",
              content: {
                role: "model",
                parts: [{ text: JSON.stringify(output()) }],
              },
            },
          ],
        });
      if (method === "DELETE") {
        deleted = true;
        return Response.json({});
      }
      if (deleted)
        return Response.json(
          { error: { code: 404, message: "synthetic-not-found" } },
          { status: 404 },
        );
      throw new Error("unexpected-synthetic-request");
    };
    const config = loadConfig({
      ...createLiveValidationEnvironment(),
      ...createLiveValidationConnections("assembly"),
    });
    const provider = new TestGeminiFiles(
      composeGeminiTransport(config, transport),
      1000,
    );
    expect(
      await provider.analyze(
        new Blob([new Uint8Array([1])], { type: "video/mp4" }),
        new AbortController().signal,
      ),
    ).toEqual(output());
    const generation = requests.find((r) =>
      r.url.includes(":generateContent"),
    )!;
    expect(generation.body).toMatchObject({
      systemInstruction: { parts: [{ text: syntheticVideoTask.policy }] },
      contents: [
        {
          role: "user",
          parts: [
            {
              fileData: {
                fileUri: `https://generativelanguage.googleapis.com/v1beta/${fileName}`,
                mimeType: "video/mp4",
              },
            },
            {
              text: `${syntheticVideoTask.prompt}\nExpected JSON response schema (guidance; return only the JSON object):\n${JSON.stringify(z.toJSONSchema(syntheticVideoTask.schema, { io: "input" }))}`,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        candidateCount: 1,
        maxOutputTokens: 65536,
      },
    });
    const sent = z
      .object({ generationConfig: z.record(z.string(), z.unknown()) })
      .parse(generation.body);
    for (const parameter of ["temperature", "topP", "topK"])
      expect(sent.generationConfig).not.toHaveProperty(parameter);
    expect(sent.generationConfig).not.toHaveProperty("responseJsonSchema");
    expect(sent.generationConfig).not.toHaveProperty("responseSchema");
    expect(
      requests.filter((r) => r.url.includes(":generateContent")),
    ).toHaveLength(1);
    expect(requests.filter((r) => r.method === "DELETE")).toHaveLength(1);
    expect(requests.filter((r) => r.method === "GET")).toHaveLength(1);
    requests.length = 0;
    const failing: typeof fetch = async () => {
      requests.push({ url: "synthetic", method: "POST", body: null });
      return Response.json(
        { error: { code: 503, message: "synthetic-private" } },
        { status: 503 },
      );
    };
    const gateway = composeGeminiTransport(config, failing);
    await expect(
      gateway.generate(
        "https://generativelanguage.googleapis.com/v1beta/files/synthetic",
        new AbortController().signal,
        syntheticVideoTask,
      ),
    ).rejects.toThrow();
    expect(requests).toHaveLength(1);
  });
  function gateway() {
    let name = "";
    const transport: GeminiTransport = {
      upload: vi.fn(async (n) => {
        name = n;
        return {
          name,
          uri: `https://generativelanguage.googleapis.com/v1beta/${name}`,
          state: "PROCESSING",
          mimeType: "video/mp4",
        };
      }),
      get: vi.fn(async () => ({
        name,
        uri: `https://generativelanguage.googleapis.com/v1beta/${name}`,
        state: "ACTIVE",
        mimeType: "video/mp4",
      })),
      generate: vi.fn(async () => ({
        text: JSON.stringify(output()),
        finished: true,
      })),
      transcribe: vi.fn(),
      candidates: vi.fn(),
      delete: vi.fn(async () => {}),
    };
    const wait = vi.fn(async () => {}),
      provider = new TestGeminiFiles(transport, 1000, wait);
    const proxy = new Blob([new Uint8Array([1])], { type: "video/mp4" });
    return { transport, provider, proxy, wait };
  }
  it("uploads once, polls bounded readiness, generates once and deletes once", async () => {
    const f = gateway();
    expect(
      await f.provider.analyze(f.proxy, new AbortController().signal),
    ).toEqual(output());
    expect(f.transport.upload).toHaveBeenCalledOnce();
    expect(f.transport.get).toHaveBeenCalledOnce();
    expect(f.transport.generate).toHaveBeenCalledOnce();
    expect(f.transport.delete).toHaveBeenCalledOnce();
  });
  it.each([
    { field: "words", limit: 12000 },
    { field: "turns", limit: 10000 },
  ] as const)(
    "retains the normalized $field bound and passes decoding to reconciliation without retry",
    async ({ field, limit }) => {
      const f = gateway();
      const payload = output();
      const entries = Array.from({ length: limit }, () => payload[field][0]);
      expect(
        normalizedAnalysisSchema.safeParse({ ...payload, [field]: entries })
          .success,
      ).toBe(true);
      entries.push(payload[field][0]);
      vi.mocked(f.transport.generate).mockResolvedValue({
        text: JSON.stringify({ ...payload, [field]: entries }),
        finished: true,
      });
      await expect(
        f.provider
          .analyze(f.proxy, new AbortController().signal)
          .then(
            (decoded) => normalizedAnalysisSchema.safeParse(decoded).success,
          ),
      ).resolves.toBe(false);
      expect(f.transport.generate).toHaveBeenCalledOnce();
      expect(f.transport.delete).toHaveBeenCalledOnce();
    },
  );
  it.each([8, 9])(
    "enforces the local eight-evidence cap for %i entries",
    async (count) => {
      const f = gateway();
      const payload = output();
      const candidate = payload.candidates[0]!;
      candidate.evidence = SHAREABILITY_SIGNALS.map((signal) => ({
        signal,
        wordIds: ["w_000001"],
        note: "word0",
      }));
      if (count === 9) candidate.evidence.push(candidate.evidence[0]!);
      const parsed = normalizedAnalysisSchema.safeParse(payload);
      if (count === 9) {
        expect(parsed.success).toBe(false);
        if (parsed.success) throw new Error("oversized_evidence_accepted");
        expect(parsed.error.issues).toContainEqual(
          expect.objectContaining({
            code: "too_big",
            origin: "array",
            maximum: 8,
            path: ["candidates", 0, "evidence"],
          }),
        );
      } else expect(parsed.success).toBe(true);
      vi.mocked(f.transport.generate).mockResolvedValue({
        text: JSON.stringify(payload),
        finished: true,
      });
      const run = f.provider.analyze(f.proxy, new AbortController().signal);
      expect(await run).toMatchObject({ candidates: [candidate] });
      expect(f.transport.generate).toHaveBeenCalledOnce();
      expect(f.transport.delete).toHaveBeenCalledOnce();
    },
  );
  it.each(["word_extra_field", "turn_extra_field", "candidates"])(
    "retains bounded %s contracts without aborting proposal decoding",
    async (kind) => {
      const f = gateway();
      const payload = output();
      if (kind === "word_extra_field")
        Object.assign(payload.words[0]!, { unexpected: "unexpected" });
      if (kind === "turn_extra_field")
        Object.assign(payload.turns[0]!, { unexpected: "unexpected" });
      if (kind === "candidates")
        payload.candidates = Array.from(
          { length: 5 },
          () => payload.candidates[0]!,
        );
      vi.mocked(f.transport.generate).mockResolvedValue({
        text: JSON.stringify(payload),
        finished: true,
      });
      await expect(
        f.provider
          .analyze(f.proxy, new AbortController().signal)
          .then(
            (decoded) => normalizedAnalysisSchema.safeParse(decoded).success,
          ),
      ).resolves.toBe(false);
      expect(f.transport.generate).toHaveBeenCalledOnce();
      expect(f.transport.delete).toHaveBeenCalledOnce();
    },
  );
  it("stops at exactly 90 readiness checks with zero generation calls", async () => {
    const f = gateway();
    vi.mocked(f.transport.get).mockImplementation(async (name) => ({
      name,
      state: "PROCESSING",
    }));
    await expect(
      f.provider.analyze(f.proxy, new AbortController().signal),
    ).rejects.toMatchObject({ code: "MODEL_OUTPUT_REJECTED" });
    expect(f.transport.get).toHaveBeenCalledTimes(90);
    expect(f.transport.generate).toHaveBeenCalledTimes(0);
    expect(f.transport.delete).toHaveBeenCalledOnce();
  });
  it("keeps a failed Google deletion obligation for explicit cleanup without another generation call", async () => {
    const f = gateway();
    vi.mocked(f.transport.delete).mockRejectedValueOnce(
      new Error("synthetic-delete"),
    );
    await expect(
      f.provider.analyze(
        f.proxy,
        new AbortController().signal,
        "owner-session",
      ),
    ).rejects.toMatchObject({ code: "CLEANUP_PENDING" });
    await f.provider.cleanup(new AbortController().signal, "other-session");
    expect(f.transport.delete).toHaveBeenCalledOnce();
    await f.provider.cleanup(new AbortController().signal, "owner-session");
    expect(f.transport.delete).toHaveBeenCalledTimes(2);
    expect(f.transport.upload).toHaveBeenCalledOnce();
    expect(f.transport.generate).toHaveBeenCalledOnce();
  });
  it("keeps the original analysis reason when cleanup also fails without leaking error content", async () => {
    const f = gateway();
    vi.mocked(f.transport.generate).mockRejectedValue(
      Object.assign(new Error("synthetic-private-content"), { status: 429 }),
    );
    vi.mocked(f.transport.delete).mockRejectedValue(
      new Error("synthetic-private-content"),
    );
    const failed = await f.provider
      .analyze(f.proxy, new AbortController().signal)
      .catch((error: unknown) => error);
    expect(failed).toMatchObject({
      code: "ANALYSIS_PROVIDER_FAILED",
      ruleId: "google_generation_http_429",
    });
    expect(JSON.stringify(failed)).not.toContain("synthetic-private-content");
    expect(f.transport.generate).toHaveBeenCalledOnce();
    expect(f.transport.delete).toHaveBeenCalledOnce();
  });
  it("propagates cancellation after generation and deletes with an independent bounded cleanup signal", async () => {
    const f = gateway(),
      controller = new AbortController();
    vi.mocked(f.transport.generate).mockImplementation(async (_uri, signal) => {
      expect(signal.aborted).toBe(false);
      controller.abort();
      return { text: JSON.stringify(output()), finished: true };
    });
    await expect(
      f.provider.analyze(f.proxy, controller.signal),
    ).rejects.toMatchObject({ code: "CLIENT_ABORTED" });
    expect(f.transport.generate).toHaveBeenCalledOnce();
    expect(f.transport.delete).toHaveBeenCalledOnce();
    expect(vi.mocked(f.transport.delete).mock.calls[0]![1].aborted).toBe(false);
  });
  it("retains cleanup ownership until a pending upload settles after Clear", async () => {
    const f = gateway(),
      controller = new AbortController();
    let exists = false,
      finish = () => {};
    vi.mocked(f.transport.upload).mockImplementation(
      (name) =>
        new Promise((resolve) => {
          finish = () => {
            exists = true;
            resolve({
              name,
              uri: `https://generativelanguage.googleapis.com/v1beta/${name}`,
              state: "ACTIVE",
            });
          };
        }),
    );
    vi.mocked(f.transport.delete).mockImplementation(async () => {
      exists = false;
    });
    const analysis = f.provider.analyze(
      f.proxy,
      controller.signal,
      "owner-session",
    );
    const failed = expect(analysis).rejects.toMatchObject({
      code: "CLIENT_ABORTED",
    });
    await vi.waitFor(() => expect(f.transport.upload).toHaveBeenCalledOnce());
    controller.abort();
    const clear = f.provider.cleanup(
      new AbortController().signal,
      "owner-session",
    );
    await Promise.resolve();
    await Promise.resolve();
    finish();
    await Promise.all([failed, clear]);
    expect(exists).toBe(false);
    expect(f.transport.generate).toHaveBeenCalledTimes(0);
  });
  it.each(["refusal", "malformed", "upload", "processing", "delete"])(
    "settles %s without automatic AI retry or lost cleanup",
    async (kind) => {
      const f = gateway();
      if (kind === "refusal")
        vi.mocked(f.transport.generate).mockResolvedValue({
          finished: false,
          text: "synthetic-private",
        });
      if (kind === "malformed")
        vi.mocked(f.transport.generate).mockResolvedValue({
          finished: true,
          text: "not-json",
        });
      if (kind === "upload")
        vi.mocked(f.transport.upload).mockRejectedValue(
          new Error("synthetic-private"),
        );
      if (kind === "processing")
        vi.mocked(f.transport.get).mockResolvedValue({
          state: "PROCESSING",
          name: "invalid",
        });
      if (kind === "delete")
        vi.mocked(f.transport.delete).mockRejectedValue(
          new Error("synthetic-private"),
        );
      const run = f.provider.analyze(f.proxy, new AbortController().signal);
      if (kind === "refusal" || kind === "malformed")
        await expect(run).resolves.toBeNull();
      else
        await expect(run).rejects.toThrow(
          /MODEL_OUTPUT_REJECTED|ANALYSIS_PROVIDER_FAILED|CLEANUP_PENDING/u,
        );
      expect(f.transport.upload).toHaveBeenCalledOnce();
      expect(f.transport.delete).toHaveBeenCalledOnce();
      expect(f.transport.generate).toHaveBeenCalledTimes(
        kind === "upload" || kind === "processing" ? 0 : 1,
      );
      if (kind === "processing")
        expect(f.transport.get).toHaveBeenCalledTimes(1);
      if (kind === "delete") {
        await expect(
          f.provider.analyze(f.proxy, new AbortController().signal),
        ).rejects.toMatchObject({ code: "CLEANUP_PENDING" });
        expect(f.transport.upload).toHaveBeenCalledOnce();
      }
    },
  );
  it("rejects aborted or oversized input with zero upload/generation calls", async () => {
    const f = gateway(),
      controller = new AbortController();
    controller.abort();
    await expect(
      f.provider.analyze(f.proxy, controller.signal),
    ).rejects.toMatchObject({ code: "CLIENT_ABORTED" });
    await expect(
      f.provider.analyze(
        new Blob([new Uint8Array(24 * 1024 * 1024 + 1)], { type: "video/mp4" }),
        new AbortController().signal,
      ),
    ).rejects.toMatchObject({ code: "INVALID_REQUEST" });
    expect(f.transport.upload).toHaveBeenCalledTimes(0);
    expect(f.transport.generate).toHaveBeenCalledTimes(0);
    expect(f.transport.delete).toHaveBeenCalledTimes(0);
  });
});
