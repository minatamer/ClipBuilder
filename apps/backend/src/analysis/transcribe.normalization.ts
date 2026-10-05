import { z } from "zod";
import {
  PUBLIC_LIMITS,
  type TranscriptWord,
  type TranscriptUtterance,
} from "@clipbuilder/contracts";
import { AnalysisDiagnostics } from "./analysis.diagnostics.js";

export const TRANSCRIBE_MODEL = "gemini-3.5-transcribe";
const wordInfo = z.object({
  type: z.literal("word_info"),
  text: z
    .string()
    .transform((value) =>
      value
        .normalize("NFC")
        .replace(/[\p{Cc}\u202a-\u202e\u2066-\u2069]/gu, " ")
        .trim()
        .slice(0, 80),
    )
    .pipe(z.string().min(1)),
  speaker: z
    .string()
    .nullish()
    .transform((value) => value?.trim() || null),
  start_offset: z.string().regex(/^\d+(?:\.\d{1,9})?s$/),
  end_offset: z.string().regex(/^\d+(?:\.\d{1,9})?s$/),
});
const interactionSchema = z.object({
  steps: z.array(z.unknown()).catch([]),
});
const stepSchema = z.object({
  type: z.string(),
  content: z.array(z.unknown()).catch([]),
});
const contentSchema = z.object({ annotations: z.array(z.unknown()).catch([]) });
export function normalizeTranscription(
  value: unknown,
  diagnostics = new AnalysisDiagnostics(),
) {
  const decoded = interactionSchema.safeParse(value);
  const annotations: z.infer<typeof wordInfo>[] = [];
  const adjustments: { index: number; reason: string }[] = [];
  for (const item of decoded.success ? decoded.data.steps.slice(0, 100) : []) {
    const step = stepSchema.safeParse(item);
    if (!step.success || step.data.type !== "model_output") continue;
    for (const item of step.data.content.slice(0, 100)) {
      const content = contentSchema.safeParse(item);
      if (!content.success) continue;
      for (const [index, annotation] of content.data.annotations.entries()) {
        const decoded = wordInfo.safeParse(annotation);
        if (!decoded.success) {
          adjustments.push({ index, reason: "annotation_not_decodable" });
          continue;
        }
        if (annotations.length >= PUBLIC_LIMITS.maxTranscriptWords) {
          adjustments.push({ index, reason: "word_collection_bounded" });
          break;
        }
        annotations.push(decoded.data);
      }
    }
  }
  const labels = new Map<string, string>();
  const words: TranscriptWord[] = [];
  for (const [index, annotation] of annotations.entries()) {
    if (annotation.speaker && !labels.has(annotation.speaker)) {
      if (labels.size < 8) labels.set(annotation.speaker, `spk_${labels.size}`);
      else
        adjustments.push({ index, reason: "speaker_attribution_unavailable" });
    }
    const startMs = Math.round(
      Number(annotation.start_offset.slice(0, -1)) * 1000,
    );
    const endMs = Math.round(Number(annotation.end_offset.slice(0, -1)) * 1000);
    if (!Number.isSafeInteger(startMs) || !Number.isSafeInteger(endMs)) {
      adjustments.push({ index, reason: "offset_not_decodable" });
      continue;
    }
    words.push({
      id: `w_${String(words.length + 1).padStart(6, "0")}`,
      startMs,
      endMs,
      text:
        annotation.text.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "") ||
        annotation.text,
      punctuatedText: annotation.text,
      speakerId: annotation.speaker
        ? (labels.get(annotation.speaker) ?? null)
        : null,
      confidence: null,
    });
  }
  const turns: TranscriptUtterance[] = [];
  if (words.some((word) => word.speakerId !== null)) {
    for (const word of words) {
      const prior = turns.at(-1);
      if (prior && prior.speakerId === word.speakerId)
        prior.endWordId = word.id;
      else
        turns.push({
          id: `utt_${String(turns.length + 1).padStart(6, "0")}`,
          startWordId: word.id,
          endWordId: word.id,
          speakerId: word.speakerId,
        });
    }
  }
  if (turns.length > 10_000)
    adjustments.push({ index: 10_000, reason: "turn_collection_bounded" });
  diagnostics.privateStageOutput("transcription_adjustments", adjustments);
  return { words, turns: turns.slice(0, 10_000) };
}
