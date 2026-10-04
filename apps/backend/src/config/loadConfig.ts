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
import {
  runtimeSettingsSchema,
  type RuntimeSettings,
} from "./runtime.schema.js";
import type { ZodError } from "zod";

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
  settings: RuntimeSettings = {},
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
        (key === "CLOUD_RENDER_ENVIRONMENT" && value === "disabled") ||
        (key === "CLOUD_SPEND_APPROVED" && value === "false"))
    )
      continue;
    throw new Error(
      `Retired environment setting ${key}; use runtime configuration for connections and approvals. Limits are fixed in code.`,
    );
  }

  const runtime = runtimeSettingsSchema.parse(settings);
  const fakeMode =
    environment.FAKE_MODE === undefined ||
    environment.FAKE_MODE === "" ||
    environment.FAKE_MODE === "true";
  const paid = environment.PAID_DEMO_ENABLED === "true";
  const stage = paid ? runtime.paidValidationStage : "disabled";
  const allowUnavailableLocalCapabilities =
    environment.NODE_ENV !== "test" &&
    (environment.APP_ENV ?? runtime.appEnvironment) === "local" &&
    !fakeMode &&
    paid;
  const processingUnavailableReasons: string[] = [];
  if (paid && stage === "disabled" && !allowUnavailableLocalCapabilities)
    throw new Error(
      "Paid processing requires an explicitly approved validation stage.",
    );
  if (paid && stage === "disabled")
    processingUnavailableReasons.push("validation_stage_unapproved");

  const selected = Object.fromEntries(
    [...ENVIRONMENT_KEYS, "NODE_ENV", "PORT"].flatMap((key) => {
      const value = environment[key];
      return value === undefined ? [] : [[key, value]];
    }),
  );
  const grantKey = configuredGrantKey(environment);
  if (grantKey !== undefined) selected.PROCESSING_GRANT_KEY = grantKey;

  const sample = runtime.retainedSample;
  let values: Record<string, unknown> = {
    ...selected,
    APP_ENV: environment.APP_ENV ?? runtime.appEnvironment,
    APP_REVISION: environment.APP_REVISION ?? runtime.revision,
    FRONTEND_ORIGIN: runtime.frontendOrigin,
    BACKEND_ORIGIN: runtime.backendOrigin,
    BACKEND_AUDIENCE: runtime.backendAudience,
    CSRF_ALLOWED_ORIGINS: runtime.frontendOrigin,
    CLOUD_RENDER_ENVIRONMENT: runtime.rendererOrigin ? "cloud" : "disabled",
    CLOUD_SPEND_APPROVED: String(runtime.approvals.cloudSpend),
    PRIVATE_RENDERER_ORIGIN: runtime.rendererOrigin,
    RETAINED_SAMPLE_ENABLED: String(!fakeMode && sample !== null),
    RETAINED_SAMPLE_BUCKET: sample?.bucket,
    RETAINED_SAMPLE_OBJECT: sample?.object,
    RETAINED_SAMPLE_GENERATION: sample?.generation,
    RETAINED_SAMPLE_BYTES: sample?.bytes,
    LIVE_ANALYSIS_ENABLED: String(stage !== "disabled"),
    LIVE_ASSEMBLY_ENABLED: String(stage === "assembly" || stage === "render"),
    LIVE_RENDER_ENABLED: String(stage === "render"),
    PROCESSING_GRANTS_ENABLED: String(stage !== "disabled"),
    ADMISSION_MAX_PROCESS_DISPATCHES:
      stage === "render"
        ? 4
        : stage === "assembly"
          ? 3
          : stage === "analysis"
            ? 2
            : 0,
    GEMINI_TRANSFER_APPROVED: String(runtime.approvals.geminiTransfer),
    GEMINI_PAID_PROJECT_CONFIRMED: String(runtime.approvals.paidProject),
    TURNSTILE_EXPECTED_HOSTNAME: runtime.turnstileHostname,
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
