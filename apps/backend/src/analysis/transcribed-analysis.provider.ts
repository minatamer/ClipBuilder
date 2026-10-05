import type { MediaDescriptor } from "@clipbuilder/contracts";
import {
  GeminiAnalysisProvider,
  type AnalysisProvider,
} from "./gemini.adapter.js";
import { AnalysisDiagnostics } from "./analysis.diagnostics.js";
import { reconcileAnalysis } from "./analysis.reconciliation.js";
import { normalizeCandidateSelection } from "./analysis.provider-shape.js";
import { ReconciliationFailure } from "./analysis.reconciliation-diagnostics.js";
import { ApplicationError } from "../http/errorMapper.js";

export class TranscribedAnalysisProvider implements AnalysisProvider {
  constructor(
    private readonly files: GeminiAnalysisProvider,
    private readonly diagnostics = new AnalysisDiagnostics(),
  ) {}
  async analyze(
    audio: Blob,
    signal: AbortSignal,
    scope: string,
    media: MediaDescriptor,
  ) {
    const transcript = await this.files.transcribe(audio, signal, scope);
    this.diagnostics.privateReconciliationInput(transcript, media.durationMs);
    const validated = this.diagnostics.check(
      "transcript_validation",
      () =>
        reconcileAnalysis(
          { ...transcript, candidates: [] },
          media,
          "google-gemini",
          this.diagnostics,
        ).transcript,
    );
    signal.throwIfAborted();
    if (!validated.words.length)
      return { words: [], turns: [], candidates: [] };
    // A second call follows usable annotation decoding and verified file cleanup.
    const selection = await this.files.candidates(
      JSON.stringify({
        durationMs: media.durationMs,
        words: validated.words,
        turns: validated.utterances,
      }),
      signal,
    );
    this.diagnostics.privateStageOutput("candidate_selection_raw", selection);
    const normalized = this.diagnostics.check("candidate_normalization", () => {
      try {
        return normalizeCandidateSelection(selection, validated.words);
      } catch (error) {
        if (error instanceof ReconciliationFailure) throw error;
        throw new ApplicationError({ code: "MODEL_OUTPUT_REJECTED" });
      }
    });
    this.diagnostics.privateStageOutput(
      "candidate_selection_normalized",
      normalized,
    );
    this.diagnostics.candidateNormalization(normalized.diagnostic);
    return {
      words: validated.words,
      turns: validated.utterances,
      candidates: normalized.candidates,
    };
  }
  cleanup(signal: AbortSignal, scope?: string) {
    return this.files.cleanup(signal, scope);
  }
}
