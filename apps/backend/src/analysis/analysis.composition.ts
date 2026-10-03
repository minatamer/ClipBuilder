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
  return new SourceAnalysis(
    admission,
    new CloudRendererClient(config, rendererIdentity(config.renderer.origin)),
    new GeminiAnalysisProvider(
      composeGeminiTransport(config),
      config.gemini.timeoutMs,
    ),
    "google-gemini",
  );
}
