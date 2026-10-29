import {
  ENVIRONMENT_KEYS,
  RETIRED_ENVIRONMENT_KEYS,
  environmentSchema,
  type BackendConfig,
} from "./env.schema.js";
import {
  ACTIVE_PROCESSING_GRANT_KEY_ID,
  readGrantKey,
  readGrantKeys,
} from "../admission/processing.grant.js";
import type { ZodError } from "zod";
import { ASSEMBLY_LIMITS } from "@clipbuilder/contracts";

const localCapabilityRequirements = new Map<string, string>([
  ["GEMINI_API_KEY", "gemini_key_missing"],
  ["GEMINI_TRANSFER_APPROVED", "gemini_transfer_unapproved"],
  ["GEMINI_PAID_PROJECT_CONFIRMED", "gemini_paid_project_unconfirmed"],
  ["PROCESSING_GRANT_KEY", "grant_key_missing"],
  ["PROCESSING_GRANTS_ENABLED", "grant_key_missing"],
  ["TURNSTILE_SITE_KEY", "turnstile_site_key_missing"],
  ["TURNSTILE_SECRET_KEY", "turnstile_secret_key_missing"],
  ["TURNSTILE_EXPECTED_HOSTNAME", "turnstile_hostname_missing"],
  ["LIVE_ANALYSIS_ENABLED", "renderer_connection_missing"],
  ["PRIVATE_RENDERER_ORIGIN", "renderer_connection_invalid"],
  ["CLOUD_SPEND_APPROVED", "cloud_spend_unapproved"],
  ["RETAINED_SAMPLE_ENABLED", "retained_sample_setup_incomplete"],
]);

function unavailableLocalCapabilities(error: ZodError): string[] | null {
  const reasons: string[] = [];
  for (const issue of error.issues) {
    const path = issue.path[0];
    const reason =
      typeof path === "string"
        ? localCapabilityRequirements.get(path)
        : undefined;
    // Only optional capability prerequisites may leave the local app available.
    // Invalid values, conflicting modes, and public/test policy still reject.
    if (issue.code !== "custom" || issue.path.length !== 1 || !reason)
      return null;
    reasons.push(reason);
  }
  return reasons;
}

function withoutPaidCapabilities(values: Record<string, unknown>) {
  return {
    ...values,
    LIVE_ANALYSIS_ENABLED: "false",
    LIVE_ASSEMBLY_ENABLED: "false",
    LIVE_RENDER_ENABLED: "false",
    LIVE_IMAGE_GENERATION_ENABLED: "false",
    PROCESSING_GRANTS_ENABLED: "false",
    ADMISSION_MAX_PROCESS_DISPATCHES: 0,
  };
}

function configuredGrantKey(
  environment: NodeJS.ProcessEnv,
): string | undefined {
  if (environment.PROCESSING_GRANT_KEY !== undefined)
    return environment.PROCESSING_GRANT_KEY;
  const legacy = environment.PROCESSING_GRANT_KEYS_JSON;
  if (legacy === undefined || legacy === "") return undefined;
  try {
    return readGrantKey(legacy.trim());
  } catch {
    try {
      return readGrantKeys(legacy, ACTIVE_PROCESSING_GRANT_KEY_ID)[
        ACTIVE_PROCESSING_GRANT_KEY_ID
      ];
    } catch {
      // Keep the failure distinguishable from a missing key without echoing it.
      return "invalid-legacy-grant-key";
    }
  }
}

export function loadConfig(
  environment: NodeJS.ProcessEnv,
): BackendConfig & { processingUnavailableReasons: readonly string[] } {
  if (environment.NODE_ENV === "test" && environment.PROCESSING_GRANT_KEYS_JSON)
    throw new Error("Test configuration must not contain credentials.");
  if (
    ["LIVE_UPLOAD_ENABLED"].some(
      (key) =>
        environment[key] !== undefined &&
        environment[key] !== "" &&
        environment[key] !== "false",
    )
  )
    throw new Error(
      "Retired server-media feature configuration is not supported.",
    );
  if (
    environment.APP_ENV === "production" &&
    Object.keys(environment).some((key) => key.startsWith("CLIPBUILDER_"))
  ) {
    throw new Error("Unknown ClipBuilder-prefixed production configuration.");
  }

  // The shared test setup retains explicit disabled assertions. They cannot
  // enable a retired switch or override policy in any normal app process.
  for (const key of RETIRED_ENVIRONMENT_KEYS) {
    const value = environment[key];
    if (value === undefined || value === "") continue;
    if (
      environment.NODE_ENV === "test" &&
      ((key.endsWith("_ENABLED") && value === "false") ||
        (key === "ADMISSION_MAX_PROCESS_DISPATCHES" && value === "0") ||
        (key === "CLOUD_RENDER_ENVIRONMENT" && value === "disabled"))
    )
      continue;
    throw new Error(
      `Retired environment setting ${key}; capabilities and limits are fixed in code.`,
    );
  }

  const fakeMode = environment.FAKE_MODE === "true";
  const paid = environment.PAID_DEMO_ENABLED !== "false";
  const localCodex =
    (environment.APP_ENV ?? "local") === "local" &&
    environment.AI_PROVIDER === "codex";
  const processingEnabled = !fakeMode && paid && !localCodex;
  const imagesEnabled =
    processingEnabled &&
    environment.GEMINI_IMAGE_GENERATION_APPROVED !== "false";
  const allowUnavailableLocalCapabilities =
    environment.NODE_ENV !== "test" &&
    (environment.APP_ENV ?? "local") === "local" &&
    !fakeMode &&
    paid;
  const processingUnavailableReasons: string[] = [];

  const selected = Object.fromEntries(
    [...ENVIRONMENT_KEYS, "NODE_ENV", "PORT"].flatMap((key) => {
      const value = environment[key];
      return value === undefined ? [] : [[key, value]];
    }),
  );
  const grantKey = configuredGrantKey(environment);
  if (grantKey !== undefined) selected.PROCESSING_GRANT_KEY = grantKey;
  // The selected local provider cannot dispatch Gemini through any legacy port,
  // including the explicit fake-mode caption exception. Owner files stay intact.
  if (localCodex) delete selected.GEMINI_API_KEY;

  let values: Record<string, unknown> = {
    ...selected,
    APP_ENV: environment.APP_ENV || "local",
    CSRF_ALLOWED_ORIGINS:
      environment.FRONTEND_ORIGIN || "http://localhost:3000",
    CLOUD_RENDER_ENVIRONMENT:
      paid && !localCodex && environment.PRIVATE_RENDERER_ORIGIN
        ? "cloud"
        : "disabled",
    RETAINED_SAMPLE_ENABLED: String(
      !fakeMode &&
        !localCodex &&
        (environment.APP_ENV ?? "local") === "local" &&
        paid &&
        [
          environment.RETAINED_SAMPLE_BUCKET,
          environment.RETAINED_SAMPLE_OBJECT,
          environment.RETAINED_SAMPLE_GENERATION,
          environment.RETAINED_SAMPLE_BYTES,
        ].some(Boolean),
    ),
    LIVE_ANALYSIS_ENABLED: String(processingEnabled),
    LIVE_ASSEMBLY_ENABLED: String(processingEnabled),
    LIVE_RENDER_ENABLED: String(processingEnabled),
    LIVE_IMAGE_GENERATION_ENABLED: String(imagesEnabled),
    PROCESSING_GRANTS_ENABLED: String(processingEnabled),
    ADMISSION_MAX_PROCESS_DISPATCHES: processingEnabled
      ? 4 + (imagesEnabled ? ASSEMBLY_LIMITS.maxGeneratedImageCalls : 0)
      : 0,
  };
  const result = environmentSchema.safeParse(values);
  let config: BackendConfig;
  if (result.success) config = result.data;
  else {
    const reasons = unavailableLocalCapabilities(result.error);
    if (!allowUnavailableLocalCapabilities || !reasons) throw result.error;
    processingUnavailableReasons.push(...reasons);
    values = withoutPaidCapabilities(values);
    if (
      reasons.includes("renderer_connection_invalid") ||
      reasons.includes("cloud_spend_unapproved")
    )
      values.CLOUD_RENDER_ENVIRONMENT = "disabled";
    if (reasons.includes("retained_sample_setup_incomplete"))
      values.RETAINED_SAMPLE_ENABLED = "false";
    config = environmentSchema.parse(values);
  }
  if (config.session.processingGrantKey !== null) {
    try {
      readGrantKey(config.session.processingGrantKey);
    } catch (error) {
      if (!allowUnavailableLocalCapabilities) throw error;
      processingUnavailableReasons.push("grant_key_invalid");
      values = withoutPaidCapabilities(values);
      config = environmentSchema.parse(values);
    }
  }
  if (
    environment.PROVIDER_MODE !== undefined &&
    environment.PROVIDER_MODE !== config.providerMode
  ) {
    throw new Error("Legacy provider mode conflicts with FAKE_MODE.");
  }
  return {
    ...config,
    processingUnavailableReasons: [...new Set(processingUnavailableReasons)],
  };
}
