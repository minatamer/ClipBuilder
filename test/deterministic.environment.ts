// Test entry points always replace inherited operating settings before imports.
export function installTestEnvironment(): void {
  Object.assign(process.env, {
    NODE_ENV: "test",
    FAKE_MODE: "true",
    PROVIDER_MODE: "fake",
    PAID_DEMO_ENABLED: "false",
    PROCESSING_GRANTS_ENABLED: "false",
    ADMISSION_MAX_PROCESS_DISPATCHES: "0",
    LIVE_ANALYSIS_ENABLED: "false",
    LIVE_ASSEMBLY_ENABLED: "false",
    LIVE_RENDER_ENABLED: "false",
    LIVE_IMAGE_GENERATION_ENABLED: "false",
    CLOUD_RENDER_ENVIRONMENT: "disabled",
    CLOUD_SPEND_APPROVED: "false",
    RENDERER_ENABLED: "false",
    RENDERER_MAX_OPERATIONS: "0",
  });
  for (const key of [
    "GEMINI_API_KEY",
    "TURNSTILE_SITE_KEY",
    "TURNSTILE_SECRET_KEY",
    "PROCESSING_GRANT_KEY",
    "PROCESSING_GRANT_KEYS_JSON",
    "GOOGLE_APPLICATION_CREDENTIALS",
    "CLOUDSDK_AUTH_CREDENTIAL_FILE_OVERRIDE",
    "CLOUDSDK_AUTH_ACCESS_TOKEN",
  ]) {
    delete process.env[key];
  }
}

installTestEnvironment();
