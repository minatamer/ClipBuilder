import type { GeminiProviderConfig } from "../src/analysis/gemini.adapter.js";
import type { BackendConfig } from "../src/config/env.schema.js";

export type OwnerProviderReadiness =
  { ready: false } | { ready: true; config: GeminiProviderConfig };

/** Use the normal backend's already parsed configuration and paid-master precedence. */
export function localProviderReadiness(
  config: BackendConfig,
): OwnerProviderReadiness {
  if (
    config.appEnv !== "local" ||
    config.nodeEnv === "test" ||
    config.providerMode !== "live" ||
    config.aiProvider !== "gemini" ||
    !config.paidDemoEnabled ||
    !config.gemini.apiKey ||
    !config.renderer.spendApproved ||
    !config.gemini.transferApproved ||
    !config.gemini.imageGenerationApproved ||
    !config.gemini.paidProjectConfirmed
  )
    return { ready: false };
  return {
    ready: true,
    config: {
      nodeEnv: config.nodeEnv,
      providerMode: config.providerMode,
      paidDemoEnabled: config.paidDemoEnabled,
      features: { liveAnalysis: true, liveAssembly: true },
      gemini: config.gemini,
    },
  };
}
