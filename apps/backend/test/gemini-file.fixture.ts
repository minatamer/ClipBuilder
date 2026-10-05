import {
  GeminiAnalysisProvider,
  type GeminiTask,
} from "../src/analysis/gemini.adapter.js";
import { normalizedAnalysisSchema } from "../src/analysis/analysis.reconciliation.js";

// Synthetic schema isolates Files lifecycle checks from actual visual AI quality.
export const syntheticVideoTask: GeminiTask = {
  policy: "Synthetic selected-video fixture policy.",
  prompt: "Synthetic selected-video fixture request.",
  schema: normalizedAnalysisSchema,
  videoFps: 5,
};
export class TestGeminiFiles extends GeminiAnalysisProvider {
  override analyze(
    proxy: Blob,
    signal: AbortSignal,
    scope = "local",
    task = syntheticVideoTask,
  ) {
    return super.analyze(proxy, signal, scope, task);
  }
}
