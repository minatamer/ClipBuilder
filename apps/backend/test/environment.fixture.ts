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
