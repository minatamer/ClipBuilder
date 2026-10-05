import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import type { MediaDescriptor } from "@clipbuilder/contracts";
import {
  AnalysisDiagnostics,
  parseAnalysisDiagnosticLine,
} from "./analysis.diagnostics.js";
import {
  GeminiAnalysisProvider,
  composeGeminiTransport,
  type GeminiTransport,
} from "./gemini.adapter.js";
import { TranscribedAnalysisProvider } from "./transcribed-analysis.provider.js";
import { normalizeTranscription } from "./transcribe.normalization.js";
import {
  normalizeCandidateSelection,
  candidateGenerationJsonSchema,
} from "./analysis.provider-shape.js";
import { reconcileAnalysis } from "./analysis.reconciliation.js";
import { CANDIDATE_SELECTION_POLICY } from "./analysis.prompt.js";
import type { PrivateGeminiCaptureEvent } from "./gemini.local-capture.js";
import { loadConfig } from "../config/loadConfig.js";
import {
  createLiveValidationEnvironment,
  createLiveValidationSettings,
} from "../../test/environment.fixture.js";

const media: MediaDescriptor = {
  mediaId: "med_" + "a".repeat(22),
  sourceRevision: "rev_" + "b".repeat(22),
  container: "mp4",
  videoCodec: "h264",
  audioCodec: "aac",
  durationMs: 15000,
  width: 320,
  height: 180,
  averageFrameRate: 30,
  rotationDegrees: 0,
  hasAudio: true,
  bytes: 1024,
  orientation: "landscape",
};
function interaction() {
  return {
    status: "completed",
    unknownProviderField: { preserved: "synthetic-private-value" },
    steps: [
      {
        type: "model_output",
        content: [
          {
            type: "text",
            text: "synthetic full transcript",
            annotations: Array.from({ length: 30 }, (_, i) => ({
              type: "word_info",
              text: `word${i}`,
              start_offset: `${i / 2}s`,
              end_offset: `${(i + 1) / 2}s`,
              speaker: i < 15 ? "voice-B" : "voice-A",
            })),
          },
        ],
      },
    ],
  };
}
function selection() {
  return {
    candidates: [
      {
        startWordId: "w_000001",
        endWordId: "w_000030",
        titleWordIds: ["w_000001", "w_000002"],
        hookWordIds: ["w_000001", "w_000002", "w_000003"],
        evidence: [
          { signal: "immediate-hook", wordIds: ["w_000001"] },
          { signal: "clear-payoff", wordIds: ["w_000030"] },
        ],
        caveats: [],
      },
    ],
  };
}
function fixture(write?: (line: string) => void) {
  const events: PrivateGeminiCaptureEvent[] = [],
    lines: string[] = [];
  const diagnostics = new AnalysisDiagnostics(
    write ?? ((line) => lines.push(line)),
  );
  diagnostics.enablePrivateCapture({
    open: () => (event) => events.push(event),
  });
  const transport: GeminiTransport = {
    upload: vi.fn(async (name, file) => ({
      name,
      state: "ACTIVE",
      mimeType: file.type,
      uri: `https://generativelanguage.googleapis.com/v1beta/${name}`,
    })),
    get: vi.fn(),
    delete: vi.fn(async () => {}),
    generate: vi.fn(),
    transcribe: vi.fn(async () => interaction()),
    candidates: vi.fn(async () => ({
      text: JSON.stringify(selection()),
      finished: true,
    })),
  };
  const files = new GeminiAnalysisProvider(
    transport,
    1000,
    undefined,
    diagnostics,
  );
  const provider = new TranscribedAnalysisProvider(files, diagnostics);
  const run = () =>
    new Promise<unknown>((resolve, reject) =>
      diagnostics.request("req_" + "a".repeat(32), "run", (finish) => {
        provider
          .analyze(
            new Blob(["synthetic-audio"], { type: "audio/m4a" }),
            new AbortController().signal,
            "synthetic-session",
            media,
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
    );
  return { transport, provider, files, events, lines, run, diagnostics };
}
describe("audio transcription and text-only selection", () => {
  it.each(["array", "envelope"])(
    "preserves three %s candidates through the full provider and packaging path",
    async (shape) => {
      const f = fixture();
      const proposals = Array.from({ length: 3 }, (_, index) => ({
        ...selection().candidates[0]!,
        startWordId: `w_${String(index + 1).padStart(6, "0")}`,
        privateDebugValue: "synthetic-private-candidate",
      }));
      const raw = shape === "array" ? proposals : { candidates: proposals };
      vi.mocked(f.transport.candidates).mockResolvedValue({
        text: JSON.stringify(raw),
        finished: true,
      });
      const result = reconcileAnalysis(await f.run(), media, "google-gemini");
      expect(result.outcome).toBe("candidates");
      expect(result.candidates).toHaveLength(3);
      expect(
        result.candidates.map((candidate) => candidate.startWordId),
      ).toEqual(proposals.map((candidate) => candidate.startWordId));
      expect(f.events).toContainEqual(
        expect.objectContaining({
          kind: "stage_output",
          stage: "candidate_selection_raw",
          output: raw,
        }),
      );
      const records = f.lines.map((line) => JSON.parse(line));
      expect(records).toContainEqual(
        expect.objectContaining({ candidateJson: { decoded: true } }),
      );
      expect(records).toContainEqual(
        expect.objectContaining({
          phase: "candidate_normalization",
          candidateNormalization: {
            inputShape: shape,
            returnedCount: 3,
            consideredCount: 3,
            acceptedCount: 3,
            droppedCount: 0,
            adjustmentCount: 0,
            dropReasons: [],
          },
        }),
      );
      expect(f.transport.transcribe).toHaveBeenCalledOnce();
      expect(f.transport.candidates).toHaveBeenCalledOnce();
      expect(f.transport.upload).toHaveBeenCalledOnce();
      expect(f.transport.delete).toHaveBeenCalledOnce();
      expect(f.transport.generate).not.toHaveBeenCalled();
      expect(f.lines.join("\n")).not.toMatch(
        /word0|w_000001|synthetic-private|voice-A/,
      );
      expect(
        f.lines.every((line) => parseAnalysisDiagnosticLine(line) !== null),
      ).toBe(true);
      expect(records.at(-1)).toMatchObject({ droppedRecords: 0 });
    },
  );
  it.each([
    { value: [], shape: "array", reason: "model_empty" },
    { value: { candidates: [] }, shape: "envelope", reason: "model_empty" },
    { value: null, shape: "unsupported", reason: "unsupported_shape" },
    {
      value: { candidates: "synthetic-private-shape" },
      shape: "unsupported",
      reason: "unsupported_shape",
    },
    {
      value: "synthetic-private-shape",
      shape: "unsupported",
      reason: "unsupported_shape",
    },
  ])(
    "distinguishes empty and unsupported candidate output $shape/$reason",
    async ({ value, shape, reason }) => {
      const f = fixture();
      vi.mocked(f.transport.candidates).mockResolvedValue({
        text: JSON.stringify(value),
        finished: true,
      });
      expect(
        reconcileAnalysis(await f.run(), media, "google-gemini").candidates,
      ).toEqual([]);
      expect(f.lines.map((line) => JSON.parse(line))).toContainEqual(
        expect.objectContaining({
          candidateNormalization: expect.objectContaining({
            inputShape: shape,
            returnedCount: 0,
            acceptedCount: 0,
            droppedCount: 0,
            emptyReason: reason,
          }),
        }),
      );
      expect(f.lines.join("\n")).not.toContain("synthetic-private-shape");
      expect(f.transport.candidates).toHaveBeenCalledOnce();
      expect(f.transport.delete).toHaveBeenCalledOnce();
    },
  );
  it("accounts for malformed items, unknown ranges and the fixed candidate bound", async () => {
    const f = fixture();
    const valid = selection().candidates[0]!;
    const proposals = [
      null,
      { ...valid, startWordId: "w_999999" },
      valid,
      valid,
      valid,
      valid,
      valid,
      valid,
    ];
    vi.mocked(f.transport.candidates).mockResolvedValue({
      text: JSON.stringify(proposals),
      finished: true,
    });
    const result = reconcileAnalysis(await f.run(), media, "google-gemini");
    expect(result.candidates).toHaveLength(2);
    expect(f.lines.map((line) => JSON.parse(line))).toContainEqual(
      expect.objectContaining({
        candidateNormalization: {
          inputShape: "array",
          returnedCount: 8,
          consideredCount: 4,
          acceptedCount: 2,
          droppedCount: 6,
          adjustmentCount: 2,
          dropReasons: [
            { reason: "candidate_limit", count: 4 },
            { reason: "candidate_not_decodable", count: 1 },
            { reason: "range_unavailable", count: 1 },
          ],
        },
      }),
    );
    expect(f.transport.candidates).toHaveBeenCalledOnce();
    expect(
      f.lines.every((line) => parseAnalysisDiagnosticLine(line) !== null),
    ).toBe(true);
  });
  it("explains an all-dropped result without labeling it model-empty", async () => {
    const f = fixture();
    vi.mocked(f.transport.candidates).mockResolvedValue({
      text: JSON.stringify([
        { ...selection().candidates[0]!, startWordId: "w_999999" },
      ]),
      finished: true,
    });
    expect(
      reconcileAnalysis(await f.run(), media, "google-gemini").candidates,
    ).toEqual([]);
    expect(f.lines.map((line) => JSON.parse(line))).toContainEqual(
      expect.objectContaining({
        candidateNormalization: expect.objectContaining({
          returnedCount: 1,
          acceptedCount: 0,
          droppedCount: 1,
          emptyReason: "all_candidates_dropped",
          dropReasons: [{ reason: "range_unavailable", count: 1 }],
        }),
      }),
    );
    expect(f.transport.candidates).toHaveBeenCalledOnce();
  });
  it("retains candidates and raw capture if ordinary logging fails", async () => {
    const f = fixture(() => {
      throw new Error("synthetic sink failure");
    });
    const raw = selection().candidates;
    vi.mocked(f.transport.candidates).mockResolvedValue({
      text: JSON.stringify(raw),
      finished: true,
    });
    expect(
      reconcileAnalysis(await f.run(), media, "google-gemini").candidates,
    ).toHaveLength(1);
    expect(f.events).toContainEqual(
      expect.objectContaining({
        kind: "stage_output",
        stage: "candidate_selection_raw",
        output: raw,
      }),
    );
    expect(f.transport.transcribe).toHaveBeenCalledOnce();
    expect(f.transport.candidates).toHaveBeenCalledOnce();
    expect(f.transport.delete).toHaveBeenCalledOnce();
  });
  it.each(["zero", "inverted", "out_of_order", "overlap", "outside_media"])(
    "passes %s timings through both calls with raw output preserved",
    async (kind) => {
      const f = fixture(),
        raw = interaction();
      const word = raw.steps[0]!.content[0]!.annotations[1]!;
      if (kind === "zero") word.end_offset = word.start_offset;
      if (kind === "inverted") word.end_offset = "0.1s";
      if (kind === "out_of_order") word.start_offset = "0s";
      if (kind === "overlap")
        raw.steps[0]!.content[0]!.annotations[0]!.end_offset = "4s";
      if (kind === "outside_media") word.end_offset = "20s";
      vi.mocked(f.transport.transcribe).mockResolvedValue(raw);
      const result = reconcileAnalysis(await f.run(), media, "google-gemini");
      expect(result.transcript.words).toEqual(
        normalizeTranscription(raw).words,
      );
      expect(result.candidates).toHaveLength(1);
      expect(f.transport.transcribe).toHaveBeenCalledOnce();
      expect(f.transport.candidates).toHaveBeenCalledOnce();
      expect(f.transport.delete).toHaveBeenCalledOnce();
      expect(f.events).toContainEqual(
        expect.objectContaining({
          kind: "stage_output",
          stage: "transcription_raw",
          output: raw,
        }),
      );
    },
  );
  it("returns no candidates for undecodable words without fabricating timings or calling Flash", async () => {
    const f = fixture(),
      raw = interaction();
    for (const word of raw.steps[0]!.content[0]!.annotations)
      word.start_offset = "";
    vi.mocked(f.transport.transcribe).mockResolvedValue(raw);
    const result = reconcileAnalysis(await f.run(), media, "google-gemini");
    expect(result.outcome).toBe("no-strong-candidates");
    expect(result.transcript.words).toEqual([]);
    expect(f.transport.transcribe).toHaveBeenCalledOnce();
    expect(f.transport.candidates).not.toHaveBeenCalled();
    expect(f.transport.delete).toHaveBeenCalledOnce();
    expect(f.events).toContainEqual(
      expect.objectContaining({
        kind: "stage_output",
        stage: "transcription_adjustments",
        output: expect.arrayContaining([
          { index: 0, reason: "annotation_not_decodable" },
        ]),
      }),
    );
  });
  it("keeps usable candidates beside undecodable ranges and tolerates sparse/duplicate evidence", async () => {
    const f = fixture(),
      raw = selection();
    raw.candidates.unshift({ ...raw.candidates[0]!, startWordId: "w_999999" });
    raw.candidates[1]!.evidence = [];
    raw.candidates.push({ ...raw.candidates[1]! });
    vi.mocked(f.transport.candidates).mockResolvedValue({
      finished: false,
      text: JSON.stringify(raw),
    });
    const result = reconcileAnalysis(await f.run(), media, "google-gemini");
    expect(result.candidates).toHaveLength(2);
    expect(result.candidates.every((c) => c.evidence.length === 0)).toBe(true);
    expect(f.transport.candidates).toHaveBeenCalledOnce();
  });
  it.each([undefined, "", "not JSON"])(
    "returns no candidates for unusable Flash JSON %s, preserving capture with no retry",
    async (text) => {
      const f = fixture();
      vi.mocked(f.transport.candidates).mockResolvedValue({
        finished: false,
        text,
      });
      const result = reconcileAnalysis(await f.run(), media, "google-gemini");
      expect(result.outcome).toBe("no-strong-candidates");
      expect(f.transport.candidates).toHaveBeenCalledOnce();
      expect(f.transport.delete).toHaveBeenCalledOnce();
      const records = f.lines.map((line) => JSON.parse(line));
      expect(records).toContainEqual(
        expect.objectContaining({ candidateJson: { decoded: false } }),
      );
      expect(records).toContainEqual(
        expect.objectContaining({
          candidateNormalization: expect.objectContaining({
            inputShape: "unsupported",
            emptyReason: "unsupported_shape",
            acceptedCount: 0,
          }),
        }),
      );
      expect(f.events).toContainEqual(
        expect.objectContaining({
          kind: "stage_output",
          stage: "candidate_decoding",
          output: { reason: "json_unavailable" },
        }),
      );
    },
  );
  it("makes exactly two distinct model calls, derives complete turns and quotations, and preserves every raw output", async () => {
    const f = fixture();
    const output = await f.run();
    const result = reconcileAnalysis(output, media, "google-gemini");
    expect(result.transcript.utterances).toEqual([
      {
        id: "utt_000001",
        startWordId: "w_000001",
        endWordId: "w_000015",
        speakerId: "spk_0",
      },
      {
        id: "utt_000002",
        startWordId: "w_000016",
        endWordId: "w_000030",
        speakerId: "spk_1",
      },
    ]);
    expect(result.candidates[0]).toMatchObject({
      title: "word0 word1",
      hook: "word0 word1 word2",
      evidence: [{ note: "word0" }, { note: "word29" }],
    });
    expect(f.transport.transcribe).toHaveBeenCalledOnce();
    expect(f.transport.candidates).toHaveBeenCalledOnce();
    expect(f.transport.generate).not.toHaveBeenCalled();
    expect(f.transport.upload).toHaveBeenCalledOnce();
    expect(f.transport.delete).toHaveBeenCalledOnce();
    const order = [
      f.transport.transcribe,
      f.transport.delete,
      f.transport.candidates,
    ].map((fn) => vi.mocked(fn).mock.invocationCallOrder[0]!);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(f.events).toContainEqual(
      expect.objectContaining({
        kind: "stage_output",
        stage: "transcription_raw",
        output: interaction(),
      }),
    );
    expect(f.events).toContainEqual(
      expect.objectContaining({
        kind: "generation_result",
        text: JSON.stringify(selection()),
      }),
    );
    expect(f.lines.join("\n")).not.toMatch(
      /word0|voice-A|synthetic-private-value|synthetic-session/,
    );
    expect(
      f.lines.every((line) => parseAnalysisDiagnosticLine(line) !== null),
    ).toBe(true);
    expect(JSON.parse(f.lines.at(-1)!)).toMatchObject({ droppedRecords: 0 });
  });
  it.each([0, 1, 250])(
    "preserves %i ms end overshoot without rejecting or rewriting timings",
    async (overshoot) => {
      const f = fixture(),
        raw = interaction();
      raw.steps[0]!.content[0]!.annotations[29]!.end_offset = `${15 + overshoot / 1000}s`;
      vi.mocked(f.transport.transcribe).mockResolvedValue(raw);
      const result = reconcileAnalysis(await f.run(), media, "google-gemini");
      expect(result.transcript.words.at(-1)!.endMs).toBe(15000 + overshoot);
      expect(f.transport.candidates).toHaveBeenCalledOnce();
      expect(f.events).toContainEqual(
        expect.objectContaining({
          kind: "stage_output",
          stage: "transcription_normalized",
          output: expect.objectContaining({
            words: expect.arrayContaining([
              expect.objectContaining({ endMs: 15000 + overshoot }),
            ]),
          }),
        }),
      );
    },
  );
  it.each(["overshoot", "missing_times", "incomplete", "cleanup"])(
    "decodes %s without a quality rejection while enforcing cleanup",
    async (kind) => {
      const f = fixture(),
        raw = interaction();
      if (kind === "overshoot")
        raw.steps[0]!.content[0]!.annotations[29]!.end_offset = "15.251s";
      if (kind === "missing_times")
        raw.steps[0]!.content[0]!.annotations[0]!.start_offset = "";
      if (kind === "incomplete") raw.status = "incomplete";
      vi.mocked(f.transport.transcribe).mockResolvedValue(raw);
      if (kind === "cleanup")
        vi.mocked(f.transport.delete).mockRejectedValueOnce(
          new Error("synthetic-delete-failure"),
        );
      if (kind === "cleanup") {
        await expect(f.run()).rejects.toMatchObject({
          code: "CLEANUP_PENDING",
        });
        expect(f.transport.candidates).not.toHaveBeenCalled();
      } else {
        await expect(f.run()).resolves.toHaveProperty("words");
        expect(f.transport.candidates).toHaveBeenCalledOnce();
      }
      expect(f.transport.transcribe).toHaveBeenCalledOnce();
      expect(f.transport.delete).toHaveBeenCalledOnce();
      expect(f.events).toContainEqual(
        expect.objectContaining({
          kind: "stage_output",
          stage: "transcription_raw",
          output: raw,
        }),
      );
      if (kind === "cleanup")
        await f.provider.cleanup(
          new AbortController().signal,
          "synthetic-session",
        );
    },
  );
  it.each([null, "", "   "])(
    "keeps missing/empty attribution %s null, with no fabricated speaker or turn",
    (speaker) => {
      const raw = interaction();
      for (const word of raw.steps[0]!.content[0]!.annotations)
        Object.assign(word, { speaker });
      const normalized = normalizeTranscription(raw);
      expect(normalized.turns).toEqual([]);
      expect(normalized.words.every((w) => w.speakerId === null)).toBe(true);
    },
  );
  it.each(["outside", "gap", "reverse", "duplicate"])(
    "accepts imperfect %s quote references without rejecting the candidate",
    (kind) => {
      const raw = selection();
      raw.candidates[0]!.titleWordIds =
        kind === "outside"
          ? ["w_000031"]
          : kind === "gap"
            ? ["w_000001", "w_000003"]
            : kind === "reverse"
              ? ["w_000002", "w_000001"]
              : ["w_000001", "w_000001"];
      const result = normalizeCandidateSelection(
        raw,
        normalizeTranscription(interaction()).words,
      );
      expect(result.candidates).toHaveLength(1);
      expect(result.candidates[0]!.title).toBe(
        kind === "gap"
          ? "word0 word2"
          : kind === "reverse"
            ? "word1 word0"
            : kind === "duplicate"
              ? "word0 word0"
              : "word0",
      );
    },
  );
  it("tolerates absent punctuation at a grounded start/end rather than reject the result", () => {
    const transcript = normalizeTranscription(interaction());
    const raw = selection();
    raw.candidates[0]!.startWordId = "w_000002";
    raw.candidates[0]!.titleWordIds = ["w_000002"];
    raw.candidates[0]!.hookWordIds = ["w_000002"];
    raw.candidates[0]!.evidence[0]!.wordIds = ["w_000002"];
    const candidates = normalizeCandidateSelection(
      raw,
      transcript.words,
    ).candidates;
    expect(
      reconcileAnalysis({ ...transcript, candidates }, media, "google-gemini")
        .candidates,
    ).toHaveLength(1);
  });
  it("accepts overlapping timings regardless of speaker attribution", () => {
    const transcript = normalizeTranscription(interaction());
    transcript.words[14]!.endMs = 10000;
    expect(
      reconcileAnalysis(
        { ...transcript, candidates: [] },
        media,
        "google-gemini",
      ).transcript.words,
    ).toHaveLength(30);
    transcript.words[15]!.speakerId = "spk_0";
    expect(() =>
      reconcileAnalysis(
        { ...transcript, candidates: [] },
        media,
        "google-gemini",
      ),
    ).not.toThrow();
  });
  it("keeps the Google schema remedy and bounds surplus evidence without rejecting", () => {
    const schema = z
      .object({
        properties: z.object({
          candidates: z.object({
            items: z.object({
              properties: z.object({
                evidence: z.object({
                  maxItems: z.number().optional(),
                  items: z.object({
                    properties: z.object({
                      wordIds: z.object({ maxItems: z.number() }),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      })
      .parse(candidateGenerationJsonSchema());
    expect(
      schema.properties.candidates.items.properties.evidence.maxItems,
    ).toBeUndefined();
    expect(
      schema.properties.candidates.items.properties.evidence.items.properties
        .wordIds.maxItems,
    ).toBe(8);
    const raw = selection();
    raw.candidates[0]!.evidence = Array.from(
      { length: 9 },
      () => raw.candidates[0]!.evidence[0]!,
    );
    const result = normalizeCandidateSelection(
      raw,
      normalizeTranscription(interaction()).words,
    );
    expect(result.candidates[0]!.evidence).toHaveLength(8);
  });
  it("pins the actual REST and GenerateContent requests with no video input, retry or stored interaction", async () => {
    const requests: { url: string; body: unknown }[] = [];
    const http = vi.fn<typeof fetch>(async (url, options) => {
      requests.push({
        url: String(url),
        body: JSON.parse(String(options?.body)),
      });
      if (String(url).endsWith("/interactions"))
        return Response.json(interaction());
      return Response.json({
        candidates: [
          {
            finishReason: "STOP",
            content: {
              role: "model",
              parts: [{ text: JSON.stringify(selection()) }],
            },
          },
        ],
        unknownProviderField: "synthetic-opaque-response",
      });
    });
    const f = fixture(),
      config = loadConfig(
        createLiveValidationEnvironment(),
        createLiveValidationSettings("analysis"),
      );
    const transport = composeGeminiTransport(config, http, f.diagnostics);
    await new Promise<void>((resolve, reject) =>
      f.diagnostics.request("req_" + "b".repeat(32), "run", (finish) => {
        (async () => {
          await transport.transcribe(
            "https://generativelanguage.googleapis.com/v1beta/files/synthetic",
            new AbortController().signal,
          );
          await transport.candidates(
            JSON.stringify(normalizeTranscription(interaction())),
            new AbortController().signal,
          );
        })().then(() => {
          finish("completed", 200);
          resolve();
        }, reject);
      }),
    );
    expect(f.events).toContainEqual(
      expect.objectContaining({
        kind: "google_response",
        operation: "transcribe_interaction",
        complete: true,
        bodyUtf8: JSON.stringify(interaction()),
      }),
    );
    expect(f.events).toContainEqual(
      expect.objectContaining({
        kind: "google_response",
        operation: "generate_content",
        complete: true,
        bodyUtf8: expect.stringContaining("synthetic-opaque-response"),
      }),
    );
    expect(http).toHaveBeenCalledTimes(2);
    expect(requests[0]!.body).toMatchObject({
      model: "gemini-3.5-transcribe",
      store: false,
      background: false,
      stream: false,
      input: [{ type: "audio", mime_type: "audio/m4a" }],
      generation_config: {
        transcription_config: {
          mode: {
            type: "verbatim",
            timestamp_granularities: ["word"],
            diarization_mode: "speaker",
          },
        },
      },
    });
    const flash = z
      .object({
        contents: z.array(
          z.object({ parts: z.array(z.record(z.string(), z.unknown())) }),
        ),
        generationConfig: z.record(z.string(), z.unknown()),
        systemInstruction: z.object({
          parts: z.array(z.object({ text: z.string() })),
        }),
      })
      .parse(requests[1]!.body);
    expect(requests[1]!.url).toContain(
      "models/gemini-3.8-flash:generateContent",
    );
    expect(flash.contents[0]!.parts).toHaveLength(1);
    expect(flash.contents[0]!.parts[0]).toHaveProperty("text");
    expect(flash.contents[0]!.parts[0]).not.toHaveProperty("fileData");
    expect(flash.generationConfig).toMatchObject({
      responseMimeType: "application/json",
      candidateCount: 1,
      maxOutputTokens: 65536,
    });
    for (const field of [
      "responseJsonSchema",
      "responseSchema",
      "responseFormat",
      "temperature",
      "topP",
      "topK",
    ])
      expect(flash.generationConfig).not.toHaveProperty(field);
    expect(flash.systemInstruction.parts).toEqual([
      { text: CANDIDATE_SELECTION_POLICY },
    ]);
    expect(flash.systemInstruction.parts[0]!.text).toContain(
      'top-level "candidates" array',
    );
    expect(flash.systemInstruction.parts[0]!.text).toContain(
      '{"candidates":[{"startWordId":',
    );
    expect(flash.systemInstruction.parts[0]!.text).not.toContain(
      "supplied candidate JSON schema",
    );
    const record = f.lines
      .map((line) =>
        z
          .object({
            generationRequest: z.record(z.string(), z.unknown()).optional(),
          })
          .parse(JSON.parse(parseAnalysisDiagnosticLine(line) ?? "{}")),
      )
      .find(
        (line) => line?.generationRequest?.purpose === "candidate_selection",
      );
    expect(record?.generationRequest).toMatchObject({
      schemaPolicy: "json_only",
      sdkAttempts: 1,
      toolsCount: 0,
      timeoutMs: 180000,
    });
    expect(record?.generationRequest).not.toHaveProperty("schema");
  });
});
