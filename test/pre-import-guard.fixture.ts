const expectedEnvironment = {
  NODE_ENV: "test",
  PROVIDER_MODE: "fake",
  PAID_DEMO_ENABLED: "false",
  PROCESSING_GRANTS_ENABLED: "false",
  ADMISSION_MAX_PROCESS_DISPATCHES: "0",
  LIVE_ANALYSIS_ENABLED: "false",
  LIVE_ASSEMBLY_ENABLED: "false",
  LIVE_RENDER_ENABLED: "false",
  LIVE_IMAGE_GENERATION_ENABLED: "false",
} as const;

export const environmentObservedDuringImport = Object.fromEntries(
  Object.keys(expectedEnvironment).map((key) => [key, process.env[key]]),
);

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
