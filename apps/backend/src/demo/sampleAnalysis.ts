import {
  analysisBundleSchema,
  assemblyBundleSchema,
  type AnalysisBundleV1,
} from "@clipbuilder/contracts";

const opaqueId = (prefix: string, character: string) =>
  `${prefix}_${character.repeat(22)}`;

const IDS = {
  media: opaqueId("med", "m"),
  analysis: opaqueId("ana", "a"),
  analysisRevision: opaqueId("rev", "a"),
  assembly: opaqueId("asm", "a"),
  assemblyRevision: opaqueId("rev", "b"),
  manifest: opaqueId("man", "m"),
  manifestHash: "2".repeat(64),
  visualRevision: opaqueId("rev", "v"),
  candidateOne: opaqueId("cand", "1"),
  candidateTwo: opaqueId("cand", "2"),
  candidateThree: opaqueId("cand", "3"),
  shotOne: opaqueId("shot", "1"),
  faceOne: opaqueId("face", "1"),
  focusOne: opaqueId("focus", "1"),
  focusTrack: opaqueId("trk", "f"),
  shotTrack: opaqueId("trk", "s"),
  equationRequest: opaqueId("vreq", "q"),
  equationCue: opaqueId("vcue", "q"),
  equationAsset: opaqueId("ast", "q"),
} as const;

const UTTERANCES = [
  {
    speakerId: "spk_0",
    startMs: 0,
    endMs: 18_000,
    text: "Start with one clear face and one concrete question. Why does the same equation E equals m c squared connect a tiny measurement to an enormous amount of energy? The useful idea is not memorizing symbols; it is noticing how a square changes scale.",
  },
  {
    speakerId: "spk_1",
    startMs: 19_000,
    endMs: 38_000,
    text: "Now widen to two people and compare Earth with the Moon. Earth pulls more strongly because it has more mass, while the Moon still gives us a visible laboratory for motion. Put both bodies on screen and the contrast becomes immediate.",
  },
  {
    speakerId: "spk_0",
    startMs: 39_000,
    endMs: 58_000,
    text: "Then make a deliberate camera cut back to the speaker for the payoff. A good explanation moves from a human question, to exact evidence, and back to a human consequence. The edit should preserve that chain instead of decorating over it.",
  },
] as const;

let wordOrdinal = 0;
const ranges: Array<{ startWordId: string; endWordId: string }> = [];
const words = UTTERANCES.flatMap((utterance) => {
  const tokens = utterance.text.split(/\s+/u);
  const duration = utterance.endMs - utterance.startMs;
  const generated = tokens.map((token, index) => {
    wordOrdinal += 1;
    const startMs =
      utterance.startMs + Math.floor((duration * index) / tokens.length);
    const endMs =
      index === tokens.length - 1
        ? utterance.endMs
        : utterance.startMs +
          Math.floor((duration * (index + 1)) / tokens.length);
    return {
      id: `w_${wordOrdinal.toString().padStart(6, "0")}`,
      startMs,
      endMs,
      text: token.replace(/[.,;?!]+$/u, ""),
      punctuatedText: token,
      speakerId: utterance.speakerId,
      confidence: 0.99,
    };
  });
  const first = generated[0];
  const last = generated.at(-1);
  if (first === undefined || last === undefined)
    throw new Error("Empty fixture utterance.");
  ranges.push({ startWordId: first.id, endWordId: last.id });
  return generated;
});

const utteranceRange = (index: number) => {
  const range = ranges[index];
  if (range === undefined) throw new Error("Missing fixture utterance range.");
  return range;
};

const wordIdContaining = (text: string) => {
  const word = words.find(
    (candidate) =>
      candidate.text.toLocaleLowerCase() === text.toLocaleLowerCase(),
  );
  if (word === undefined) throw new Error("Missing fixture word.");
  return word.id;
};

const transcript = {
  version: 1,
  revision: IDS.analysisRevision,
  language: "en",
  durationMs: 60_000,
  words,
  utterances: UTTERANCES.map((utterance, index) => ({
    id: `utt_${(index + 1).toString().padStart(6, "0")}`,
    ...utteranceRange(index),
    speakerId: utterance.speakerId,
  })),
  providerMetadata: {
    provider: "fake",
    modelConfigId: "sample-transcript-v1",
    diarizationAvailable: true,
  },
} as const;

const media = {
  mediaId: IDS.media,
  sourceRevision: opaqueId("rev", "m"),
  container: "mp4",
  videoCodec: "h264",
  audioCodec: "aac",
  durationMs: 60_000,
  width: 1_920,
  height: 1_080,
  averageFrameRate: 30,
  rotationDegrees: 0,
  hasAudio: true,
  bytes: 24_000_000,
  orientation: "landscape",
} as const;

export const SAMPLE_ANALYSIS = analysisBundleSchema.parse({
  version: 1,
  analysisId: IDS.analysis,
  revision: IDS.analysisRevision,
  media,
  transcript,
  candidates: [
    {
      version: 1,
      id: IDS.candidateOne,
      rank: 1,
      ...utteranceRange(0),
      title: "One question changes the scale",
      hook: "Start with one clear face and one concrete question",
      rationale:
        "A direct question leads to an exact equation and a practical payoff.",
      evidence: [
        {
          signal: "immediate-hook",
          wordIds: [wordIdContaining("question")],
          note: "The opening asks a concrete question.",
        },
        {
          signal: "clear-payoff",
          wordIds: [wordIdContaining("scale")],
          note: "The close explains why the square matters.",
        },
      ],
      caveats: [],
    },
    {
      version: 1,
      id: IDS.candidateTwo,
      rank: 2,
      ...utteranceRange(1),
      title: "Earth and Moon make contrast visible",
      hook: "Compare Earth with the Moon",
      rationale:
        "The two-person beat makes a physical contrast easy to inspect.",
      evidence: [
        {
          signal: "specific",
          wordIds: [wordIdContaining("Earth"), wordIdContaining("Moon")],
          note: "The comparison names both bodies.",
        },
        {
          signal: "visual-feasibility",
          wordIds: [wordIdContaining("screen")],
          note: "The speaker explicitly proposes a visual comparison.",
        },
      ],
      caveats: [],
    },
    {
      version: 1,
      id: IDS.candidateThree,
      rank: 3,
      ...utteranceRange(2),
      title: "Return to the human consequence",
      hook: "Make a deliberate camera cut back to the speaker",
      rationale:
        "A precise editing principle closes with a memorable human consequence.",
      evidence: [
        {
          signal: "clean-boundaries",
          wordIds: [wordIdContaining("camera")],
          note: "The beat starts with a clear editorial action.",
        },
        {
          signal: "self-contained",
          wordIds: [wordIdContaining("consequence")],
          note: "The ending states the lesson without outside context.",
        },
      ],
      caveats: [],
    },
  ],
  outcome: "candidates",
  warnings: [],
});

export const SAMPLE_NO_CANDIDATES = analysisBundleSchema.parse({
  ...SAMPLE_ANALYSIS,
  revision: opaqueId("rev", "n"),
  transcript: {
    ...SAMPLE_ANALYSIS.transcript,
    revision: opaqueId("rev", "n"),
  },
  candidates: [],
  outcome: "no-strong-candidates",
});

export const SAMPLE_ONE_CANDIDATE = analysisBundleSchema.parse({
  ...SAMPLE_ANALYSIS,
  revision: opaqueId("rev", "o"),
  transcript: {
    ...SAMPLE_ANALYSIS.transcript,
    revision: opaqueId("rev", "o"),
  },
  candidates: [{ ...SAMPLE_ANALYSIS.candidates[0], rank: 1 }],
});

function boundaryCandidate(
  rank: number,
  startMs: number,
  minimumEndMs: number,
) {
  const startWord = words.find((word) => word.startMs >= startMs);
  const endWord = words.find(
    (word) =>
      word.endMs >=
      Math.max(minimumEndMs, (startWord?.startMs ?? startMs) + 10_000),
  );
  if (startWord === undefined || endWord === undefined) {
    throw new Error("Missing boundary candidate word range.");
  }
  return {
    version: 1 as const,
    id: opaqueId("cand", String(rank + 4)),
    rank,
    startWordId: startWord.id,
    endWordId: endWord.id,
    title: `${startWord.text} to ${endWord.text}`,
    hook: `${startWord.text} ${endWord.text}`,
    rationale: "The range provides a complete deterministic boundary fixture.",
    evidence: [
      {
        signal: "immediate-hook" as const,
        wordIds: [startWord.id],
        note: "The opening word anchors the boundary fixture.",
      },
      {
        signal: "clear-payoff" as const,
        wordIds: [endWord.id],
        note: "The ending word anchors the boundary fixture.",
      },
    ],
    caveats: [],
  };
}

export const SAMPLE_FOUR_CANDIDATES = analysisBundleSchema.parse({
  ...SAMPLE_ANALYSIS,
  revision: opaqueId("rev", "4"),
  transcript: {
    ...SAMPLE_ANALYSIS.transcript,
    revision: opaqueId("rev", "4"),
  },
  candidates: [
    boundaryCandidate(1, 0, 10_000),
    boundaryCandidate(2, 13_000, 23_000),
    boundaryCandidate(3, 26_000, 36_000),
    boundaryCandidate(4, 39_000, 49_000),
  ],
});

const visualPlan = {
  version: 1,
  revision: IDS.visualRevision,
  artDirection: "precision-cut-v1",
  requests: [
    {
      id: IDS.equationRequest,
      kind: "equation-card",
      subjectWordIds: [wordIdContaining("equation")],
      factualBrief: "The exact equation named by the speaker.",
      imagePrompt: null,
      equationTex: "E = mc^2",
      exactText: null,
      background: "transparent",
      artDirection: "precision-cut-v1",
    },
  ],
  cues: [
    {
      id: IDS.equationCue,
      startWordId: wordIdContaining("equation"),
      endWordId: wordIdContaining("energy"),
      assetRequestId: IDS.equationRequest,
      layout: "lower-card",
      motion: "none",
      transition: "cut",
      rationale:
        "The equation is copied exactly from the supported transcript beat.",
    },
  ],
  totalCoverageMs: 4_000,
} as const;

const compositionManifest = {
  version: 1,
  baseCandidateId: IDS.candidateOne,
  analysisRevision: IDS.analysisRevision,
  assemblyRevision: IDS.assemblyRevision,
  range: utteranceRange(0),
  speakerFraming: {
    mode: "active-speaker",
    focusTrackId: IDS.focusTrack,
    shotTrackId: IDS.shotTrack,
    smoothingProfile: "editorial",
  },
  captions: {
    profile: "clean-emphasis",
  },
  visuals: {
    planRevision: IDS.visualRevision,
    cues: [
      {
        id: IDS.equationCue,
        startWordId: wordIdContaining("equation"),
        endWordId: wordIdContaining("energy"),
        kind: "equation-card",
        assetId: IDS.equationAsset,
        layout: "lower-card",
        motion: "none",
        transition: "cut",
        rationale:
          "The equation is copied exactly from the supported transcript beat.",
      },
    ],
  },
  audio: { normalization: "speech-safe" },
} as const;

export const SAMPLE_ASSEMBLY = assemblyBundleSchema.parse({
  version: 1,
  assemblyId: IDS.assembly,
  revision: IDS.assemblyRevision,
  analysisRevision: IDS.analysisRevision,
  selectedStartWordId: utteranceRange(0).startWordId,
  selectedEndWordId: utteranceRange(0).endWordId,
  speakerFocus: {
    version: 1,
    revision: opaqueId("rev", "f"),
    shots: [
      { id: IDS.shotOne, startMs: 0, endMs: 18_000, cutIn: "source-start" },
    ],
    faceTracks: [
      {
        id: IDS.faceOne,
        shotId: IDS.shotOne,
        startMs: 0,
        endMs: 18_000,
        samples: [
          {
            atMs: 0,
            x: 0.34,
            y: 0.16,
            width: 0.3,
            height: 0.62,
            speakingProbability: 0.98,
          },
        ],
      },
    ],
    focus: [
      {
        id: IDS.focusOne,
        shotId: IDS.shotOne,
        ...utteranceRange(0),
        faceTrackId: IDS.faceOne,
        cropCenterX: 0.49,
        cropCenterY: 0.47,
        transition: "hold",
      },
    ],
    detectorConfigId: "sample-focus-v1",
  },
  visualPlan,
  assets: [
    {
      id: IDS.equationAsset,
      requestId: IDS.equationRequest,
      source: "deterministic-card",
      contentType: "image/png",
      width: 1_000,
      height: 400,
      bytes: 1,
      sha256: "1".repeat(64),
      hasAlpha: true,
    },
  ],
  manifestId: IDS.manifest,
  manifestHash: IDS.manifestHash,
  compositionManifest,
});

export type FixtureRuleEvidence = { ruleId: string; path: string };
export type FixtureValidation =
  | { success: true; analysis: AnalysisBundleV1 }
  | { success: false; evidence: FixtureRuleEvidence[] };

function transcriptText(analysis: AnalysisBundleV1): string {
  return analysis.transcript.words.map((word) => word.text).join(" ");
}

const GROUNDING_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "for",
  "in",
  "of",
  "the",
  "to",
  "with",
]);

function significantTokens(text: string): string[] {
  return text
    .toLocaleLowerCase()
    .normalize("NFKC")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length > 1 && !GROUNDING_STOP_WORDS.has(token));
}

function isCandidateCopyGrounded(
  copy: string,
  candidate: AnalysisBundleV1["candidates"][number],
  analysis: AnalysisBundleV1,
): boolean {
  const wordIndexes = new Map(
    analysis.transcript.words.map((word, index) => [word.id, index]),
  );
  const startIndex = wordIndexes.get(candidate.startWordId);
  const endIndex = wordIndexes.get(candidate.endWordId);
  if (startIndex === undefined || endIndex === undefined) return false;
  const sourceTokens = new Set(
    significantTokens(
      analysis.transcript.words
        .slice(startIndex, endIndex + 1)
        .map((word) => word.text)
        .join(" "),
    ),
  );
  const copyTokens = significantTokens(copy);
  if (copyTokens.length === 0) return false;
  const groundedCount = copyTokens.filter((token) =>
    sourceTokens.has(token),
  ).length;
  return groundedCount / copyTokens.length >= 0.6;
}

export function validateCandidateFixture(value: unknown): FixtureValidation {
  const parsed = analysisBundleSchema.safeParse(value);
  if (!parsed.success) {
    return {
      success: false,
      evidence: parsed.error.issues.map((issue) => ({
        ruleId: issue.message.includes("reference")
          ? "candidate.reference"
          : issue.message.includes("overlap") ||
              issue.message.includes("distinct")
            ? "candidate.distinct-range"
            : "candidate.contract",
        path: issue.path.join(".") || "analysis",
      })),
    };
  }

  const evidence: FixtureRuleEvidence[] = [];
  const fullTranscript = transcriptText(parsed.data).toLocaleLowerCase();
  if (
    /ignore (?:all|any|previous)|system prompt|candidate analyzer/iu.test(
      fullTranscript,
    )
  ) {
    evidence.push({
      ruleId: "candidate.instruction-content",
      path: "transcript",
    });
  }
  parsed.data.candidates.forEach((candidate, index) => {
    const publicCopy = `${candidate.title} ${candidate.hook} ${candidate.rationale}`;
    const performanceCopy = [
      publicCopy,
      ...candidate.evidence.map((item) => item.note),
      ...candidate.caveats.map((item) => item.note),
    ].join(" ");
    if (
      /guaranteed|go viral|million views|viral score/iu.test(performanceCopy)
    ) {
      evidence.push({
        ruleId: "candidate.performance-claim",
        path: `candidates.${index}`,
      });
    }
    const quoted = publicCopy.match(/[“"]([^”"]+)[”"]/u)?.[1];
    if (
      quoted !== undefined &&
      !fullTranscript.includes(quoted.toLocaleLowerCase())
    ) {
      evidence.push({
        ruleId: "candidate.invented-quote",
        path: `candidates.${index}`,
      });
    }
    for (const field of ["title", "hook"] as const) {
      if (!isCandidateCopyGrounded(candidate[field], candidate, parsed.data)) {
        evidence.push({
          ruleId: "candidate.invented-claim",
          path: `candidates.${index}.${field}`,
        });
      }
    }
  });

  return evidence.length === 0
    ? { success: true, analysis: parsed.data }
    : { success: false, evidence };
}

export const SAMPLE_FIXTURE_REVISIONS = Object.freeze({
  transcript: SAMPLE_ANALYSIS.transcript.revision,
  analysis: SAMPLE_ANALYSIS.revision,
  assembly: SAMPLE_ASSEMBLY.revision,
  speakerFocus: SAMPLE_ASSEMBLY.speakerFocus.revision,
  visualPlan: SAMPLE_ASSEMBLY.visualPlan.revision,
  compositionManifest: {
    id: SAMPLE_ASSEMBLY.manifestId,
    hash: SAMPLE_ASSEMBLY.manifestHash,
  },
});
