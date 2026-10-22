export function assertOwnerFakeMode(environment: NodeJS.ProcessEnv): void {
  if (
    environment.FAKE_MODE !== "true" ||
    environment.PAID_DEMO_ENABLED !== "false"
  ) {
    throw new Error("owner_fake_mode_required");
  }
}

export type OwnerLaunchMode = "fake" | "provider";

/** Selection is an explicit command, never inferred from keys or an env file. */
export function ownerLaunchMode(
  environment: NodeJS.ProcessEnv,
  arguments_: readonly string[],
): OwnerLaunchMode {
  if (arguments_.length === 0) {
    assertOwnerFakeMode(environment);
    return "fake";
  }
  if (arguments_.length !== 1 || arguments_[0] !== "--provider")
    throw new Error("owner_mode_invalid");
  if (
    environment.FAKE_MODE !== "false" ||
    environment.PAID_DEMO_ENABLED !== "true" ||
    environment.APP_ENV !== "local" ||
    environment.NODE_ENV !== "development" ||
    environment.OWNER_PROVIDER_APPROVED !== "true"
  )
    throw new Error("owner_provider_mode_required");
  return "provider";
}

/** Only the explicit provider host receives these values; native children do not. */
export function ownerProviderEnvironment(
  directory: string,
  environment: NodeJS.ProcessEnv,
): NodeJS.ProcessEnv {
  ownerLaunchMode(environment, ["--provider"]);
  return {
    ...nativeEnvironment(directory),
    NODE_ENV: "development",
    APP_ENV: "local",
    FAKE_MODE: "false",
    PROVIDER_MODE: "live",
    PAID_DEMO_ENABLED: "true",
    OWNER_PROVIDER_APPROVED: "true",
    CLOUD_SPEND_APPROVED: environment.CLOUD_SPEND_APPROVED ?? "false",
    GEMINI_TRANSFER_APPROVED: environment.GEMINI_TRANSFER_APPROVED ?? "false",
    GEMINI_IMAGE_GENERATION_APPROVED:
      environment.GEMINI_IMAGE_GENERATION_APPROVED ?? "false",
    GEMINI_PAID_PROJECT_CONFIRMED:
      environment.GEMINI_PAID_PROJECT_CONFIRMED ?? "false",
    ...(environment.GEMINI_API_KEY === undefined
      ? {}
      : { GEMINI_API_KEY: environment.GEMINI_API_KEY }),
  };
}

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
    OWNER_PROVIDER_APPROVED: "false",
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
