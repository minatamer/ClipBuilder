import { createHash, randomUUID } from "node:crypto";
import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  createLiveValidationEnvironment,
  createLiveValidationSettings,
} from "../../test/environment.fixture.js";
import { loadConfig } from "../config/loadConfig.js";
import { type MediaDescriptor } from "@clipbuilder/contracts";
import { ProcessingAdmission } from "../admission/processing.admission.js";
import { ProcessingGrantCodec } from "../admission/processing.grant.js";
import { mapError } from "../http/errorMapper.js";
import { createAnalysisRouter } from "../http/routes/analysis.route.js";
import {
  SourceAnalysis,
  type RetainedSampleProcessingPort,
} from "./analysis.usecase.js";
import { reconcileAnalysis } from "./analysis.reconciliation.js";
import { ANALYSIS_POLICY, ANALYSIS_REQUEST } from "./analysis.prompt.js";
import {
  GeminiAnalysisProvider,
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
function wireOutput() {
  const normalized = output();
  return {
    words: normalized.words.map((w) => [
      w.punctuatedText,
      w.startMs,
      w.endMs,
      w.speakerId,
    ]),
    turns: normalized.turns.map((t) => [
      t.startWordId,
      t.endWordId,
      t.speakerId,
    ]),
    candidates: normalized.candidates,
  };
}
function fixture(
  paidEnabled = true,
  sample: RetainedSampleProcessingPort | null = null,
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
    { verify: vi.fn(async () => true) },
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
  const proxy = new Blob([new Uint8Array([1, 2, 3])], { type: "video/mp4" });
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
      analysisProxy: {
        artifactId: randomUUID(),
        generation: "2",
        bytes: proxy.size,
        checksum: createHash("sha256")
          .update(new Uint8Array([1, 2, 3]))
          .digest("hex"),
      },
    })),
    proxy: vi.fn(async () => proxy),
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
    upload,
    analyze,
    advance: (ms: number) => {
      now += ms;
    },
  };
}
describe("protected retained sample analysis", () => {
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
    expect(f.port.proxy).not.toHaveBeenCalled();
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
    "rejects $copy in $field instead of accepting a substring or empty tokens",
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
        ).toThrow("MODEL_OUTPUT_REJECTED");
    },
  );

  it("rejects an empty quoted span inside otherwise grounded text", () => {
    const raw = output();
    raw.candidates[0]!.title = 'word0 "..." word1';
    expect(() => reconcileAnalysis(raw, media, "fake")).toThrow(
      "MODEL_OUTPUT_REJECTED",
    );
  });

  it.each(["title", "rationale"])(
    "rejects noncontiguous %s tokens",
    (field) => {
      const raw = output();
      if (field === "title") raw.candidates[0]!.title = "word0 word2";
      else raw.candidates[0]!.rationale = "word0 word2";
      expect(() => reconcileAnalysis(raw, media, "fake")).toThrow(
        "MODEL_OUTPUT_REJECTED",
      );
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
    "rejects reordered source assertions in %s",
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
      ).toThrow("MODEL_OUTPUT_REJECTED");
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
    expect(f.port.proxy).toHaveBeenCalledOnce();
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
  ])("rejects malicious %s without repair calls", async (kind) => {
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
    await expect(f.service.analyze(f.context, f.analyze)).rejects.toMatchObject(
      { code: "MODEL_OUTPUT_REJECTED" },
    );
    expect(f.provider.analyze).toHaveBeenCalledOnce();
    expect(f.port.releaseProxy).toHaveBeenCalledOnce();
    expect(f.port.cancel).toHaveBeenCalledOnce();
  });
  it("accepts exactly 250ms word overlap and rejects 251ms for both provider labels", () => {
    const raw = output();
    raw.words[0]!.endMs = 750;
    for (const provider of ["fake", "google-gemini"] as const)
      expect(reconcileAnalysis(raw, media, provider).candidates).toHaveLength(
        1,
      );
    raw.words[0]!.endMs = 751;
    for (const provider of ["fake", "google-gemini"] as const)
      expect(() => reconcileAnalysis(raw, media, provider)).toThrow();
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
                parts: [{ text: JSON.stringify(wireOutput()) }],
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
    const config = loadConfig(
      createLiveValidationEnvironment(),
      createLiveValidationSettings("analysis"),
    );
    const provider = new GeminiAnalysisProvider(
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
      systemInstruction: { parts: [{ text: ANALYSIS_POLICY }] },
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
            { text: ANALYSIS_REQUEST },
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
    expect(sent.generationConfig.responseJsonSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
      required: ["words", "turns", "candidates"],
      properties: {
        words: {
          type: "array",
          minItems: 1,
          maxItems: 12000,
          description: expect.stringContaining("Full-source transcript"),
          items: {
            type: "array",
            prefixItems: [
              expect.objectContaining({ type: "string" }),
              expect.objectContaining({ type: "integer" }),
              expect.objectContaining({ type: "integer" }),
              expect.any(Object),
            ],
          },
        },
        turns: { type: "array", maxItems: 10000 },
        candidates: { type: "array", maxItems: 4 },
      },
    });
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
        text: JSON.stringify(wireOutput()),
        finished: true,
      })),
      delete: vi.fn(async () => {}),
    };
    const wait = vi.fn(async () => {}),
      provider = new GeminiAnalysisProvider(transport, 1000, wait);
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
    ).rejects.toMatchObject({ code: "FEATURE_DISABLED" });
    await f.provider.cleanup(new AbortController().signal, "other-session");
    expect(f.transport.delete).toHaveBeenCalledOnce();
    await f.provider.cleanup(new AbortController().signal, "owner-session");
    expect(f.transport.delete).toHaveBeenCalledTimes(2);
    expect(f.transport.upload).toHaveBeenCalledOnce();
    expect(f.transport.generate).toHaveBeenCalledOnce();
  });
  it("propagates cancellation after generation and deletes with an independent bounded cleanup signal", async () => {
    const f = gateway(),
      controller = new AbortController();
    vi.mocked(f.transport.generate).mockImplementation(async (_uri, signal) => {
      expect(signal.aborted).toBe(false);
      controller.abort();
      return { text: JSON.stringify(wireOutput()), finished: true };
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
    "fails closed on %s with no automatic AI retry",
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
      await expect(
        f.provider.analyze(f.proxy, new AbortController().signal),
      ).rejects.toThrow(/MODEL_OUTPUT_REJECTED|FEATURE_DISABLED/u);
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
        ).rejects.toMatchObject({ code: "FEATURE_DISABLED" });
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
