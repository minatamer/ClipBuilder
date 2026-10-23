/** Allowlist for isolated native children: no credentials, ADC or provider env. */
export function nativeEnvironment(directory: string): NodeJS.ProcessEnv {
  return {
    PATH: process.env.PATH,
    SystemRoot: process.env.SystemRoot,
    TEMP: directory,
    TMP: directory,
    TMPDIR: directory,
    NODE_ENV: "test",
    FAKE_MODE: "true",
    PROVIDER_MODE: "fake",
    PAID_DEMO_ENABLED: "false",
    CLOUD_RENDER_ENVIRONMENT: "disabled",
    CLOUD_SPEND_APPROVED: "false",
    GEMINI_TRANSFER_APPROVED: "false",
    GEMINI_IMAGE_GENERATION_APPROVED: "false",
    GEMINI_PAID_PROJECT_CONFIRMED: "false",
    RENDERER_ENABLED: "false",
    LIVE_ANALYSIS_ENABLED: "false",
    LIVE_ASSEMBLY_ENABLED: "false",
    LIVE_RENDER_ENABLED: "false",
    LIVE_IMAGE_GENERATION_ENABLED: "false",
  };
}
