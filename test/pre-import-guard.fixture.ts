const expectedEnvironment = {
  NODE_ENV: "test",
  APP_ENV: "local",
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
  GEMINI_TRANSFER_APPROVED: "false",
  GEMINI_IMAGE_GENERATION_APPROVED: "false",
  GEMINI_PAID_PROJECT_CONFIRMED: "false",
  RENDERER_ENABLED: "false",
  PUBLIC_PAID_PROCESSING_APPROVED: "false",
  OWNER_PROVIDER_APPROVED: "false",
} as const;

export const environmentObservedDuringImport = Object.fromEntries(
  Object.keys(expectedEnvironment).map((key) => [key, process.env[key]]),
);

export const credentialKeysObservedDuringImport = [
  "RENDERER_MAX_OPERATIONS",
  "GEMINI_API_KEY",
  "TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET_KEY",
  "PROCESSING_GRANT_KEY",
  "PROCESSING_GRANT_KEYS_JSON",
  "GOOGLE_APPLICATION_CREDENTIALS",
  "CLOUDSDK_AUTH_CREDENTIAL_FILE_OVERRIDE",
  "CLOUDSDK_AUTH_ACCESS_TOKEN",
  "PRIVATE_BACKEND_ORIGIN",
  "FRONTEND_CALLER_EMAIL",
].filter((key) => Object.hasOwn(process.env, key));

for (const [key, expectedValue] of Object.entries(expectedEnvironment)) {
  if (environmentObservedDuringImport[key] !== expectedValue) {
    throw new Error(
      `Unsafe test configuration was visible while importing ${key}.`,
    );
  }
}

export const fetchFailureObservedDuringImport = globalThis
  .fetch("https://pre-import-network-guard.invalid")
  .then(
    () => "fetch unexpectedly succeeded",
    (error: unknown) =>
      error instanceof Error ? error.message : String(error),
  );
