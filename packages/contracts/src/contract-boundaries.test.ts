import { describe, expect, it } from "vitest";

import {
  OWNER_VALIDATION_LIMITS,
  PUBLIC_LIMITS,
  analysisBundleSchema,
  analysisContextSchema,
  isSourceWithinLimitProfile,
  speakerFocusTrackSchema,
  startSessionResponseSchema,
  transcriptBundleSchema,
  visualPlanSchema,
} from "./index.js";

const opaqueId = (prefix: string, fill = "a") => `${prefix}_${fill.repeat(22)}`;
const wordId = (ordinal: number) => `w_${String(ordinal).padStart(6, "0")}`;

function createTranscript(
  timings: ReadonlyArray<readonly [startMs: number, endMs: number]>,
  durationMs = 70_000,
) {
  return {
    version: 1,
    revision: opaqueId("rev"),
    language: "en",
    durationMs,
    words: timings.map(([startMs, endMs], index) => ({
      id: wordId(index + 1),
      startMs,
      endMs,
      text: `word-${index + 1}`,
      punctuatedText: `word-${index + 1}`,
      speakerId: "spk_0",
      confidence: 0.99,
    })),
    utterances: [],
    providerMetadata: {
      provider: "fake",
      modelConfigId: "fixture-v1",
      diarizationAvailable: true,
    },
  } as const;
}

function createCandidate(
  fill: string,
  rank: number,
  startIndex: number,
  endIndex: number,
  evidenceIndexes: readonly [number, number] = [startIndex, endIndex],
) {
  return {
    version: 1,
    id: opaqueId("cand", fill),
    rank,
    startWordId: wordId(startIndex + 1),
    endWordId: wordId(endIndex + 1),
    title: `Candidate ${rank}`,
    hook: "A grounded opening",
    rationale: "The candidate contains a complete setup and payoff.",
    evidence: [
      {
        signal: "immediate-hook",
        wordIds: [wordId(evidenceIndexes[0] + 1)],
        note: "Grounded opening evidence",
      },
      {
        signal: "clear-payoff",
        wordIds: [wordId(evidenceIndexes[1] + 1)],
        note: "Grounded closing evidence",
      },
    ],
    caveats: [],
  } as const;
}

function createAnalysisBundle(
  timings: ReadonlyArray<readonly [startMs: number, endMs: number]>,
  candidates: readonly ReturnType<typeof createCandidate>[],
) {
  const durationMs = 70_000;
  return {
    version: 1,
    analysisId: opaqueId("ana"),
    revision: opaqueId("rev"),
    media: {
      mediaId: opaqueId("med"),
      sourceRevision: opaqueId("rev"),
      container: "mp4",
      videoCodec: "h264",
      audioCodec: "aac",
      durationMs,
      width: 1_920,
      height: 1_080,
      averageFrameRate: 30,
      rotationDegrees: 0,
      hasAudio: true,
      bytes: 20_000_000,
      orientation: "landscape",
    },
    transcript: createTranscript(timings, durationMs),
    candidates,
    outcome: "candidates",
    warnings: [],
  } as const;
}

describe("source admission boundaries", () => {
  it.each([
    {
      name: "14.999 seconds",
      bytes: 1,
      durationMs: 14_999,
      expected: false,
    },
    {
      name: "exactly 15 seconds",
      bytes: 1,
      durationMs: 15_000,
      expected: true,
    },
    {
      name: "exactly 20 minutes and 500 MiB",
      bytes: PUBLIC_LIMITS.maxSourceBytes,
      durationMs: PUBLIC_LIMITS.maxSourceSeconds * 1_000,
      expected: true,
    },
    {
      name: "20 minutes plus one millisecond",
      bytes: 1,
      durationMs: PUBLIC_LIMITS.maxSourceSeconds * 1_000 + 1,
      expected: false,
    },
    {
      name: "500 MiB plus one byte",
      bytes: PUBLIC_LIMITS.maxSourceBytes + 1,
      durationMs: 15_000,
      expected: false,
    },
    {
      name: "19 minutes and 600 MiB",
      bytes: 600 * 1_024 * 1_024,
      durationMs: 19 * 60 * 1_000,
      expected: false,
    },
    {
      name: "25 minutes and 200 MiB",
      bytes: 200 * 1_024 * 1_024,
      durationMs: 25 * 60 * 1_000,
      expected: false,
    },
  ])(
    "evaluates $name without compensating one limit for another",
    (testCase) => {
      expect(
        isSourceWithinLimitProfile(
          { bytes: testCase.bytes, durationMs: testCase.durationMs },
          "public",
        ),
      ).toBe(testCase.expected);
    },
  );
});

describe("session response branches", () => {
  const base = {
    sessionId: opaqueId("ses"),
    expiresAt: "2026-09-29T12:00:00.000Z",
  } as const;

  it("accepts only candidates-with-analysis for sample and intake-without-analysis for upload", () => {
    expect(
      startSessionResponseSchema.safeParse({
        ...base,
        mode: "sample",
        stage: "candidates",
        sampleAnalysisId: opaqueId("ana"),
      }).success,
    ).toBe(true);
    expect(
      startSessionResponseSchema.safeParse({
        ...base,
        mode: "upload",
        stage: "intake",
      }).success,
    ).toBe(true);
  });

  it.each([
    { mode: "sample", stage: "candidates" },
    { mode: "sample", stage: "intake", sampleAnalysisId: opaqueId("ana") },
    { mode: "upload", stage: "candidates" },
    { mode: "upload", stage: "intake", sampleAnalysisId: opaqueId("ana") },
  ])("rejects an inconsistent session response %#", (response) => {
    expect(
      startSessionResponseSchema.safeParse({ ...base, ...response }).success,
    ).toBe(false);
  });
});

describe("candidate reconciliation boundaries", () => {
  it.each([
    { name: "exactly 10 seconds", endMs: 10_000, expected: true },
    { name: "one millisecond under 10 seconds", endMs: 9_999, expected: true },
    { name: "exactly 60 seconds", endMs: 60_000, expected: true },
    { name: "one millisecond over 60 seconds", endMs: 60_001, expected: true },
  ])("accepts $name as guidance", ({ endMs, expected }) => {
    const timings = [
      [0, 100],
      [endMs - 100, endMs],
    ] as const;
    const bundle = createAnalysisBundle(timings, [
      createCandidate("a", 1, 0, 1),
    ]);

    expect(analysisBundleSchema.safeParse(bundle).success).toBe(expected);
  });

  it.each([
    { name: "exactly 35 percent", secondStartMs: 13_000, expected: true },
    { name: "just over 35 percent", secondStartMs: 12_999, expected: true },
  ])("handles pair overlap at $name of the shorter candidate", (testCase) => {
    const timings = [
      [0, 100],
      [testCase.secondStartMs, testCase.secondStartMs + 100],
      [19_900, 20_000],
      [32_900, 33_000],
    ] as const;
    const bundle = createAnalysisBundle(timings, [
      createCandidate("a", 1, 0, 2),
      createCandidate("b", 2, 1, 3),
    ]);

    expect(analysisBundleSchema.safeParse(bundle).success).toBe(
      testCase.expected,
    );
  });

  it("accepts evidence that exists in the transcript but falls outside its candidate", () => {
    const timings = [
      [0, 100],
      [1_000, 1_100],
      [10_900, 11_000],
    ] as const;
    const bundle = createAnalysisBundle(timings, [
      createCandidate("a", 1, 1, 2, [0, 2]),
    ]);
    const result = analysisBundleSchema.safeParse(bundle);

    expect(result.success).toBe(true);
  });
});

describe("bounded arrays and transcript ordering", () => {
  it.each([
    { characters: 120, expected: true },
    { characters: 121, expected: false },
  ])(
    "enforces the analysis category text cap at $characters characters",
    ({ characters, expected }) => {
      expect(
        analysisContextSchema.safeParse({
          contentCategory: "a".repeat(characters),
          targetPlatform: "generic-vertical",
        }).success,
      ).toBe(expected);
    },
  );

  it("rejects analysis context beyond its compiled trend-signal array limit", () => {
    expect(
      analysisContextSchema.safeParse({
        targetPlatform: "generic-vertical",
        trendSignals: Array.from(
          { length: 6 },
          (_value, index) => `signal-${index}`,
        ),
      }).success,
    ).toBe(false);
  });

  it.each([
    { count: OWNER_VALIDATION_LIMITS.maxTranscriptWords, expected: true },
    { count: OWNER_VALIDATION_LIMITS.maxTranscriptWords + 1, expected: false },
  ])(
    "enforces the owner transcript word cap at $count words",
    ({ count, expected }) => {
      const words = Array.from({ length: count }, (_value, index) => ({
        id: wordId(index + 1),
        startMs: index * 2,
        endMs: index * 2 + 1,
        text: "word",
        punctuatedText: "word",
        speakerId: "spk_0",
        confidence: 0.99,
      }));
      const result = transcriptBundleSchema.safeParse({
        version: 1,
        revision: opaqueId("rev"),
        language: "en",
        durationMs: count * 2 + 1,
        words,
        utterances: [],
        providerMetadata: {
          provider: "fake",
          modelConfigId: "fixture-v1",
          diarizationAvailable: true,
        },
      });

      expect(result.success).toBe(expected);
    },
  );

  it("accepts decreasing transcript starts while rejecting malformed speaker ID primitives", () => {
    const transcript = createTranscript([
      [100, 200],
      [50, 150],
    ]);
    expect(transcriptBundleSchema.safeParse(transcript).success).toBe(true);
    expect(
      transcriptBundleSchema.safeParse({
        ...createTranscript([[0, 100]]),
        words: [
          {
            ...createTranscript([[0, 100]]).words[0],
            speakerId: "person-name",
          },
        ],
      }).success,
    ).toBe(false);
  });
});

describe("representative visual and speaker cross-references", () => {
  it("rejects a visual cue that references no request", () => {
    expect(
      visualPlanSchema.safeParse({
        version: 1,
        revision: opaqueId("rev"),
        artDirection: "precision-cut-v1",
        requests: [
          {
            id: opaqueId("vreq", "a"),
            kind: "stat-card",
            subjectWordIds: [wordId(1)],
            factualBrief: "A transcript-grounded statistic",
            imagePrompt: null,
            equationTex: null,
            exactText: "42 percent",
            background: "opaque",
            artDirection: "precision-cut-v1",
          },
        ],
        cues: [
          {
            id: opaqueId("vcue"),
            startWordId: wordId(1),
            endWordId: wordId(2),
            assetRequestId: opaqueId("vreq", "b"),
            layout: "lower-card",
            motion: "none",
            transition: "cut",
            rationale: "A bounded visual cue",
          },
        ],
        totalCoverageMs: 2_000,
      }).success,
    ).toBe(false);
  });

  it("rejects a face track outside its referenced shot", () => {
    expect(
      speakerFocusTrackSchema.safeParse({
        version: 1,
        revision: opaqueId("rev"),
        shots: [
          {
            id: opaqueId("shot", "a"),
            startMs: 0,
            endMs: 10_000,
            cutIn: "source-start",
          },
        ],
        faceTracks: [
          {
            id: opaqueId("face"),
            shotId: opaqueId("shot", "b"),
            startMs: 0,
            endMs: 10_000,
            samples: [
              {
                atMs: 0,
                x: 0.1,
                y: 0.1,
                width: 0.2,
                height: 0.2,
                speakingProbability: 0.9,
              },
            ],
          },
        ],
        focus: [
          {
            id: opaqueId("focus"),
            shotId: opaqueId("shot", "a"),
            startWordId: wordId(1),
            endWordId: wordId(2),
            faceTrackId: opaqueId("face"),
            cropCenterX: 0.5,
            cropCenterY: 0.5,
            transition: "hold",
          },
        ],
        detectorConfigId: "fixture-v1",
      }).success,
    ).toBe(false);
  });
});
