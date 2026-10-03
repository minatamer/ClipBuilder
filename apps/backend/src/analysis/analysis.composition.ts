import type { BackendConfig } from "../config/env.schema.js";
import type { ProcessingAdmission } from "../admission/processing.admission.js";
import {
  CloudRendererClient,
  rendererIdentity,
} from "../media/renderer.cloudrun.js";
import { SourceAnalysis } from "./analysis.usecase.js";
import {
  GeminiAnalysisProvider,
  composeGeminiTransport,
} from "./gemini.adapter.js";
import { composeSelectedPlanProvider } from "../assembly/gemini-selected-plan.js";
import { SelectedAssembly } from "../assembly/selected-assembly.usecase.js";
import { PreviewPlayback } from "../media/preview-playback.js";
export function composeAnalysis(
  config: BackendConfig,
  admission: ProcessingAdmission | null,
) {
  if (
    !admission ||
    config.nodeEnv === "test" ||
    !config.features.liveAnalysis ||
    !config.paidDemoEnabled ||
    config.providerMode !== "live" ||
    config.renderer.environment !== "cloud" ||
    !config.renderer.origin
  )
    return null;
  const media = new CloudRendererClient(
    config,
    rendererIdentity(config.renderer.origin),
  );
  const files = new GeminiAnalysisProvider(
    composeGeminiTransport(config),
    config.gemini.timeoutMs,
  );
  const analysis = new SourceAnalysis(admission, media, files, "google-gemini");
  const planner = composeSelectedPlanProvider(config, files);
  const assembly = planner
    ? new SelectedAssembly(admission, analysis, media, planner, "google-gemini")
    : null;
  // Clear and either AI phase share exactly the same provider-file and media ownership.
  return {
    analysis,
    assembly,
    preview: assembly ? new PreviewPlayback(admission, assembly, media) : null,
  };
}
