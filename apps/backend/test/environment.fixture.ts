const safeTestEnvironment = {
  NODE_ENV: "test",
  APP_ENV: "local",
  PROVIDER_MODE: "fake",
  PAID_DEMO_ENABLED: "false",
  LIVE_UPLOAD_ENABLED: "false",
  LIVE_ANALYSIS_ENABLED: "false",
  LIVE_ASSEMBLY_ENABLED: "false",
  LIVE_IMAGE_GENERATION_ENABLED: "false",
  LIVE_EDIT_ASSISTANT_ENABLED: "false",
  LIVE_RENDER_ENABLED: "false",
} as const;

export function createSafeTestEnvironment(
  overrides: NodeJS.ProcessEnv = {},
): NodeJS.ProcessEnv {
  return { ...safeTestEnvironment, ...overrides };
}
