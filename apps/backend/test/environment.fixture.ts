const safeTestEnvironment = {
  NODE_ENV: "test",
  FAKE_MODE: "true",
  APP_ENV: "local",
  PROVIDER_MODE: "fake",
  PAID_DEMO_ENABLED: "false",
  PROCESSING_GRANTS_ENABLED: "false",
  ADMISSION_MAX_PROCESS_DISPATCHES: "0",
  LIVE_ANALYSIS_ENABLED: "false",
  LIVE_ASSEMBLY_ENABLED: "false",
  LIVE_RENDER_ENABLED: "false",
  LIVE_IMAGE_GENERATION_ENABLED: "false",
} as const;

export function createSafeTestEnvironment(
  overrides: NodeJS.ProcessEnv = {},
): NodeJS.ProcessEnv {
  return { ...safeTestEnvironment, ...overrides };
}

// Synthetic composition only; shared network interception still applies.
export function createLiveValidationEnvironment(): NodeJS.ProcessEnv {
  return {
    NODE_ENV: "development",
    FAKE_MODE: "false",
    PAID_DEMO_ENABLED: "true",
    GEMINI_API_KEY: "synthetic-key",
    TURNSTILE_SITE_KEY: "synthetic-site",
    TURNSTILE_SECRET_KEY: "synthetic-secret",
    PROCESSING_GRANT_KEY: Buffer.alloc(32, 7).toString("base64url"),
  };
}

export function createLiveValidationSettings(
  stage: "analysis" | "assembly" | "render" = "analysis",
) {
  return {
    paidValidationStage: stage,
    rendererOrigin: "https://synthetic.run.app",
    turnstileHostname: "localhost",
    approvals: { cloudSpend: true, geminiTransfer: true, paidProject: true },
  };
}
