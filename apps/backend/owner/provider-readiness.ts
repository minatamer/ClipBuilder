import { environmentSchema } from "../src/config/env.schema.js";
import type { GeminiProviderConfig } from "../src/analysis/gemini.adapter.js";
import { ownerLaunchMode } from "./local-mode.ts";

export type OwnerProviderReadiness =
  { ready: false } | { ready: true; config: GeminiProviderConfig };

/** Parse only owner-approved Gemini inputs; public/cloud configuration is absent. */
export function readOwnerProviderReadiness(
  environment: NodeJS.ProcessEnv,
): OwnerProviderReadiness {
  ownerLaunchMode(environment, ["--provider"]);
  const parsed = environmentSchema.safeParse({
    NODE_ENV: "development",
    APP_ENV: "local",
    FAKE_MODE: "false",
    PAID_DEMO_ENABLED: "true",
    GEMINI_API_KEY: environment.GEMINI_API_KEY,
    CLOUD_SPEND_APPROVED: environment.CLOUD_SPEND_APPROVED ?? "false",
    GEMINI_TRANSFER_APPROVED: environment.GEMINI_TRANSFER_APPROVED ?? "false",
    GEMINI_IMAGE_GENERATION_APPROVED:
      environment.GEMINI_IMAGE_GENERATION_APPROVED ?? "false",
    GEMINI_PAID_PROJECT_CONFIRMED:
      environment.GEMINI_PAID_PROJECT_CONFIRMED ?? "false",
  });
  if (!parsed.success) throw new Error("owner_provider_config_invalid");
  const config = parsed.data;
  if (
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
