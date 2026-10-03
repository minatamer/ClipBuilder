import { randomBytes } from "node:crypto";
import { z } from "zod";
import {
  analysisBundleSchema,
  clipCandidateSchema,
  transcriptWordSchema,
  transcriptUtteranceSchema,
  PUBLIC_LIMITS,
  GROUNDED_ANALYSIS_LIMITS,
  type MediaDescriptor,
  type AnalysisBundleV1,
} from "@clipbuilder/contracts";
import { ApplicationError } from "../http/errorMapper.js";

// One response contains the full transcript and candidates. IDs/times for candidates
// are resolved against these words; model-supplied ranks and durations are absent.
export const geminiAnalysisSchema = z
  .object({
    words: z
      .array(transcriptWordSchema)
      .min(1)
      .max(PUBLIC_LIMITS.maxTranscriptWords),
    turns: z.array(transcriptUtteranceSchema).max(10_000),
    candidates: z
      .array(
        z
          .object(clipCandidateSchema.shape)
          .omit({ version: true, id: true, rank: true })
          .strict(),
      )
      .max(PUBLIC_LIMITS.maxCandidateCount),
  })
  .strict();

function opaque(prefix: string) {
  return `${prefix}_${randomBytes(16).toString("base64url")}`;
}
const forbidden =
  /guaranteed|go viral|million views|viral score|trending now|system prompt|ignore (?:all|any|previous)|(?:race|religion|sexuality|diagnosis)\s*[:=]/iu;
const tokens = (text: string) =>
  text
    .normalize("NFKC")
    .toLowerCase()
    .match(/[\p{L}\p{N}]+/gu) ?? [];

function isSourceQuotation(source: readonly string[], copy: string): boolean {
  const quotation = tokens(copy);
  return (
    quotation.length > 0 &&
    source.some(
      (token, index) =>
        token === quotation[0] &&
        quotation.every((word, offset) => word === source[index + offset]),
    )
  );
}

export function reconcileAnalysis(
  value: unknown,
  media: MediaDescriptor,
  provider: "fake" | "google-gemini",
): AnalysisBundleV1 {
  try {
    const raw = geminiAnalysisSchema.parse(value);
    if (
      raw.words.reduce((total, word) => total + word.punctuatedText.length, 0) >
      PUBLIC_LIMITS.maxTranscriptCharacters
    )
      throw new Error();
    let priorEnd = 0;
    raw.words.forEach((word, index) => {
      if (
        word.id !== `w_${String(index + 1).padStart(6, "0")}` ||
        word.endMs > media.durationMs ||
        word.startMs < priorEnd - GROUNDED_ANALYSIS_LIMITS.wordOverlapMs
      )
        throw new Error();
      priorEnd = Math.max(priorEnd, word.endMs);
    });
    const indexes = new Map(raw.words.map((word, index) => [word.id, index]));
    let lastTurn = -1;
    raw.turns.forEach((turn, index) => {
      const start = indexes.get(turn.startWordId),
        end = indexes.get(turn.endWordId);
      if (
        turn.id !== `utt_${String(index + 1).padStart(6, "0")}` ||
        start === undefined ||
        end === undefined ||
        start > end ||
        start !== lastTurn + 1 ||
        raw.words
          .slice(start, end + 1)
          .some((word) => word.speakerId !== turn.speakerId)
      )
        throw new Error();
      lastTurn = end;
    });
    if (raw.turns.length && lastTurn !== raw.words.length - 1)
      throw new Error();
    if (!raw.turns.length && raw.words.some((word) => word.speakerId !== null))
      throw new Error();
    const revision = opaque("rev");
    const analysis = analysisBundleSchema.parse({
      version: 1,
      analysisId: opaque("ana"),
      revision,
      media,
      transcript: {
        version: 1,
        revision,
        language: "en",
        durationMs: media.durationMs,
        words: raw.words,
        utterances: raw.turns,
        providerMetadata: {
          provider,
          modelConfigId: "grounded-analysis-v1",
          diarizationAvailable: raw.turns.some((t) => t.speakerId !== null),
        },
      },
      candidates: raw.candidates.map((candidate, index) => ({
        ...candidate,
        version: 1,
        id: opaque("cand"),
        rank: index + 1,
      })),
      outcome: raw.candidates.length ? "candidates" : "no-strong-candidates",
      warnings: [],
    });
    for (const candidate of analysis.candidates) {
      const start = indexes.get(candidate.startWordId)!,
        end = indexes.get(candidate.endWordId)!;
      const words = raw.words.slice(start, end + 1);
      if (
        start > 0 &&
        !/[.!?][”"']?$/u.test(raw.words[start - 1]!.punctuatedText) &&
        !raw.turns.some((turn) => turn.startWordId === candidate.startWordId)
      )
        throw new Error();
      for (const evidence of candidate.evidence) {
        const ordered = evidence.wordIds.map((id) => indexes.get(id)!);
        if (
          ordered.some(
            (ordinal, index) => index > 0 && ordinal <= ordered[index - 1]!,
          )
        )
          throw new Error();
      }
      const sourceTokens = tokens(words.map((w) => w.punctuatedText).join(" "));
      // Public titles/hooks and evidence notes are extractive. This is intentionally
      // stricter than asking another model to certify its own unsupported facts.
      for (const copy of [
        candidate.title,
        candidate.hook,
        ...candidate.evidence.map((e) => e.note),
      ]) {
        if (!isSourceQuotation(sourceTokens, copy)) throw new Error();
      }
      const copy = [
        candidate.title,
        candidate.hook,
        candidate.rationale,
        ...candidate.evidence.map((e) => e.note),
        ...candidate.caveats.map((c) => c.note),
      ].join(" ");
      if (forbidden.test(copy)) throw new Error();
      // Preserve assertions, not just their vocabulary. Editorial explanations
      // are fixed text; any other note must be an ordered source quotation.
      for (const note of [
        candidate.rationale,
        ...candidate.caveats.map((c) => c.note),
      ])
        if (
          !ANALYSIS_EDITORIAL_NOTES.includes(note) &&
          !isSourceQuotation(sourceTokens, note)
        )
          throw new Error();
      for (const quote of copy.matchAll(/[“"]([^”"]+)[”"]/gu))
        if (!isSourceQuotation(sourceTokens, quote[1]!)) throw new Error();
      if (!/[.!?][”"']?$/u.test(words.at(-1)!.punctuatedText))
        throw new Error();
    }
    return analysis;
  } catch {
    throw new ApplicationError({ code: "MODEL_OUTPUT_REJECTED" });
  }
}

export const ANALYSIS_EDITORIAL_NOTES: readonly string[] = [
  "this moment has clear payoff",
  "Self-contained opening and complete ending.",
  "Needs earlier context.",
  "Speaker overlap.",
  "Weak ending.",
  "Framing risk.",
  "Similar to another candidate.",
];
