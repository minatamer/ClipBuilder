import {
  ASSEMBLY_LIMITS,
  OWNER_VALIDATION_LIMITS,
  PUBLIC_LIMITS,
} from "@clipbuilder/contracts";
import { z } from "zod";

function optionalString(maximum = 4_096) {
  return z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : value),
    z.string().trim().min(1).max(maximum).optional(),
  );
}

function booleanValue(defaultValue: boolean) {
  return z
    .preprocess(
      (value) =>
        value === undefined || value === "" ? String(defaultValue) : value,
      z.enum(["true", "false"]),
    )
    .transform((value) => value === "true");
}

function integerValue(defaultValue: number, minimum: number, maximum: number) {
  return z.preprocess(
    (value) => (value === undefined || value === "" ? defaultValue : value),
    z.coerce.number().int().min(minimum).max(maximum),
  );
}

const exactOriginSchema = z.url().superRefine((value, context) => {
  const url = new URL(value);
  if (
    url.origin !== value ||
    url.username !== "" ||
    url.password !== "" ||
    (url.protocol !== "http:" && url.protocol !== "https:")
  ) {
    context.addIssue({
      code: "custom",
      message:
        "Expected an exact HTTP origin without credentials, path, or wildcard.",
    });
  }
});

const commaSeparatedOriginsSchema = z
  .string()
  .default("http://localhost:3000")
  .transform((value) => value.split(",").map((origin) => origin.trim()))
  .pipe(z.array(exactOriginSchema).min(1).max(10));

export const environmentShape = {
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  APP_ENV: z.enum(["local", "preview", "production"]).default("local"),
  APP_REVISION: optionalString(80),
  FRONTEND_ORIGIN: exactOriginSchema.default("http://localhost:3000"),
  BACKEND_ORIGIN: exactOriginSchema.default("http://localhost:4000"),
  BACKEND_AUDIENCE: optionalString(500),
  PORT: integerValue(4_000, 1, 65_535),
  CLOUD_RENDER_ENVIRONMENT: z.enum(["disabled", "cloud"]).default("disabled"),
  CLOUD_SPEND_APPROVED: booleanValue(false),
  PRIVATE_RENDERER_ORIGIN: optionalString(500),

  FAKE_MODE: booleanValue(true),
  PAID_DEMO_ENABLED: booleanValue(false),
  LIVE_ANALYSIS_ENABLED: booleanValue(false),
  LIVE_ASSEMBLY_ENABLED: booleanValue(false),
  LIVE_RENDER_ENABLED: booleanValue(false),
  LIVE_IMAGE_GENERATION_ENABLED: booleanValue(false),
  ACTIVE_SPEAKER_ENABLED: booleanValue(true),
  TREND_SIGNALS_ENABLED: booleanValue(false),
  PUBLIC_LANGUAGE_PROFILE: z.literal("en").default("en"),
  LIMIT_PROFILE: z.enum(["public", "validation"]).default("public"),

  SESSION_COOKIE_NAME: z.string().default("__Host-clipping_session"),
  SESSION_ACCESS_TTL_SECONDS: integerValue(7_200, 900, 7_200),
  PROCESSING_GRANT_ACTIVE_KEY_ID: optionalString(80),
  PROCESSING_GRANT_KEYS_JSON: optionalString(16_384),
  CSRF_ALLOWED_ORIGINS: commaSeparatedOriginsSchema,
  PROCESSING_GRANTS_ENABLED: booleanValue(false),
  ADMISSION_MAX_RECORDS: integerValue(256, 1, 1024),
  ADMISSION_MAX_CONCURRENT_ACTIONS: integerValue(1, 1, 4),
  ADMISSION_MAX_PROCESS_DISPATCHES: integerValue(0, 0, 32),
  TURNSTILE_SITE_KEY: optionalString(500),
  TURNSTILE_SECRET_KEY: optionalString(500),
  TURNSTILE_EXPECTED_HOSTNAME: optionalString(253),
  TURNSTILE_TIMEOUT_MS: integerValue(5_000, 1_000, 10_000),

  GEMINI_API_KEY: optionalString(1_024),
  GEMINI_MODEL: z.literal("gemini-3.8-flash").default("gemini-3.8-flash"),
  GEMINI_TIMEOUT_MS: integerValue(180_000, 5_000, 360_000),
  GEMINI_MAX_OUTPUT_TOKENS: integerValue(65_536, 1_024, 65_536),
  GEMINI_SDK_MAX_RETRIES: z.literal("0").default("0").transform(Number),
  GEMINI_MAX_CALLS: z.literal("2").default("2").transform(Number),
  GEMINI_TRANSFER_APPROVED: booleanValue(false),
  GEMINI_PAID_PROJECT_CONFIRMED: booleanValue(false),

  MAX_SOURCE_BYTES: integerValue(
    PUBLIC_LIMITS.maxSourceBytes,
    1,
    OWNER_VALIDATION_LIMITS.maxSourceBytes,
  ),
  MAX_SOURCE_SECONDS: integerValue(
    PUBLIC_LIMITS.maxSourceSeconds,
    PUBLIC_LIMITS.minSourceSeconds,
    OWNER_VALIDATION_LIMITS.maxSourceSeconds,
  ),
  MAX_CLIP_SECONDS: integerValue(
    PUBLIC_LIMITS.maxClipSeconds,
    PUBLIC_LIMITS.minClipSeconds,
    OWNER_VALIDATION_LIMITS.maxClipSeconds,
  ),
  MAX_FACE_TRACKS_PER_SHOT: integerValue(
    ASSEMBLY_LIMITS.maxFaceTracksPerShot,
    1,
    ASSEMBLY_LIMITS.maxFaceTracksPerShot,
  ),
  MAX_VISUAL_CUES_PER_CLIP: integerValue(
    ASSEMBLY_LIMITS.maxVisualCues,
    0,
    ASSEMBLY_LIMITS.maxVisualCues,
  ),
  MAX_IMAGE_CALLS_PER_ASSEMBLY: integerValue(
    ASSEMBLY_LIMITS.maxGeneratedImageCalls,
    0,
    ASSEMBLY_LIMITS.maxGeneratedImageCalls,
  ),
  MAX_VISUAL_COVERAGE_PERCENT: integerValue(
    ASSEMBLY_LIMITS.maxVisualCoveragePercent,
    0,
    ASSEMBLY_LIMITS.maxVisualCoveragePercent,
  ),
  MAX_RENDER_ATTEMPTS_PER_SESSION: integerValue(
    PUBLIC_LIMITS.maxFinalRenders,
    0,
    OWNER_VALIDATION_LIMITS.maxFinalRenders,
  ),
  MAX_CONCURRENT_ANALYSES: integerValue(1, 0, 1),
  MAX_CONCURRENT_ASSEMBLIES: integerValue(1, 0, 1),
  API_MAX_INSTANCES: integerValue(1, 1, 1),
  FRONTEND_MAX_INSTANCES: integerValue(2, 1, 2),
  RATE_WINDOW_SECONDS: integerValue(300, 60, 3_600),
  RATE_GRANT_MAX: integerValue(3, 0, 3),
  RATE_ANALYSIS_MAX: integerValue(1, 0, 1),
  RATE_ASSEMBLY_MAX: integerValue(1, 0, 1),
} satisfies z.ZodRawShape;

const rawEnvironmentSchema = z.object(environmentShape).strict();

export const ENVIRONMENT_KEYS = Object.freeze([
  ...rawEnvironmentSchema.keyof().options,
]);

export const environmentSchema = rawEnvironmentSchema
  .superRefine((environment, context) => {
    const liveFlags = [
      environment.LIVE_ANALYSIS_ENABLED,
      environment.LIVE_ASSEMBLY_ENABLED,
      environment.LIVE_RENDER_ENABLED,
      environment.LIVE_IMAGE_GENERATION_ENABLED,
    ];
    const anyLiveFeature = liveFlags.some(Boolean);
    const hasValue = (value: string | undefined) => value !== undefined;
    const issue = (message: string, path: string) =>
      context.addIssue({ code: "custom", message, path: [path] });

    if (environment.NODE_ENV === "test") {
      if (
        !environment.FAKE_MODE ||
        environment.PAID_DEMO_ENABLED ||
        environment.PROCESSING_GRANTS_ENABLED ||
        environment.ADMISSION_MAX_PROCESS_DISPATCHES !== 0 ||
        environment.CLOUD_RENDER_ENVIRONMENT !== "disabled" ||
        environment.CLOUD_SPEND_APPROVED ||
        anyLiveFeature
      ) {
        issue(
          "Test configuration must be fake with every paid/live gate disabled.",
          "FAKE_MODE",
        );
      }
      if (
        hasValue(environment.GEMINI_API_KEY) ||
        hasValue(environment.TURNSTILE_SECRET_KEY) ||
        hasValue(environment.PROCESSING_GRANT_KEYS_JSON)
      ) {
        issue(
          "Test configuration must not contain credentials.",
          "GEMINI_API_KEY",
        );
      }
    }

    if (environment.CLOUD_RENDER_ENVIRONMENT === "cloud") {
      const origin = environment.PRIVATE_RENDERER_ORIGIN;
      if (
        !environment.CLOUD_SPEND_APPROVED ||
        !origin ||
        !exactOriginSchema.safeParse(origin).success ||
        !new URL(origin).hostname.endsWith(".run.app") ||
        !origin.startsWith("https://")
      )
        issue(
          "Cloud compute requires approved spend and an exact private renderer origin.",
          "PRIVATE_RENDERER_ORIGIN",
        );
      if (environment.APP_ENV !== "local")
        issue(
          "Public cloud processing is not enabled by this test foundation.",
          "CLOUD_RENDER_ENVIRONMENT",
        );
    }

    if (environment.FAKE_MODE) {
      if (environment.PAID_DEMO_ENABLED || anyLiveFeature) {
        issue(
          "Fake provider mode cannot enable paid or live behavior.",
          "FAKE_MODE",
        );
      }
    }

    if (anyLiveFeature && environment.FAKE_MODE) {
      issue("Live features require real mode.", "FAKE_MODE");
    }
    if (anyLiveFeature && !environment.PAID_DEMO_ENABLED) {
      issue(
        "Live features require the paid-operation master gate.",
        "PAID_DEMO_ENABLED",
      );
    }
    if (
      environment.LIVE_IMAGE_GENERATION_ENABLED &&
      !environment.LIVE_ASSEMBLY_ENABLED
    ) {
      issue(
        "Live image generation requires live assembly.",
        "LIVE_IMAGE_GENERATION_ENABLED",
      );
    }
    if (
      environment.LIVE_ASSEMBLY_ENABLED &&
      !environment.ACTIVE_SPEAKER_ENABLED
    ) {
      issue(
        "Live assembly requires active-speaker processing.",
        "ACTIVE_SPEAKER_ENABLED",
      );
    }

    if (
      anyLiveFeature &&
      (!hasValue(environment.GEMINI_API_KEY) ||
        !environment.GEMINI_TRANSFER_APPROVED ||
        !environment.GEMINI_PAID_PROJECT_CONFIRMED)
    ) {
      issue(
        "Live Google features require credentials and approved paid-project media transfer.",
        "GEMINI_API_KEY",
      );
    }
    if (environment.LIVE_IMAGE_GENERATION_ENABLED) {
      issue(
        "Raster generation has no approved Google image model; use fixed templates.",
        "LIVE_IMAGE_GENERATION_ENABLED",
      );
    }

    if (anyLiveFeature) {
      const commonLiveValues = [
        environment.PROCESSING_GRANT_ACTIVE_KEY_ID,
        environment.PROCESSING_GRANT_KEYS_JSON,
        environment.TURNSTILE_SITE_KEY,
        environment.TURNSTILE_SECRET_KEY,
        environment.TURNSTILE_EXPECTED_HOSTNAME,
      ];
      if (!commonLiveValues.every(hasValue)) {
        issue(
          "Live features require complete grant and abuse configuration.",
          "PROCESSING_GRANT_KEYS_JSON",
        );
      }
    }
    if (
      environment.LIVE_ANALYSIS_ENABLED &&
      (!environment.PROCESSING_GRANTS_ENABLED ||
        environment.CLOUD_RENDER_ENVIRONMENT !== "cloud" ||
        environment.ADMISSION_MAX_PROCESS_DISPATCHES <
          (environment.LIVE_ASSEMBLY_ENABLED ? 3 : 2))
    )
      issue(
        "Source analysis requires protected admission, approved cloud compute and a bounded upload/analysis budget.",
        "LIVE_ANALYSIS_ENABLED",
      );

    if (environment.LIVE_ASSEMBLY_ENABLED && !environment.LIVE_ANALYSIS_ENABLED)
      issue(
        "Selected-range assembly requires protected source analysis.",
        "LIVE_ASSEMBLY_ENABLED",
      );
    if (
      environment.LIVE_RENDER_ENABLED &&
      (!environment.LIVE_ASSEMBLY_ENABLED ||
        environment.ADMISSION_MAX_PROCESS_DISPATCHES < 4)
    )
      issue(
        "Final rendering requires frozen assembly and four bounded admitted actions.",
        "LIVE_RENDER_ENABLED",
      );

    if (
      environment.PROCESSING_GRANTS_ENABLED &&
      (environment.FAKE_MODE ||
        !hasValue(environment.PROCESSING_GRANT_ACTIVE_KEY_ID) ||
        !hasValue(environment.PROCESSING_GRANT_KEYS_JSON))
    )
      issue(
        "Processing grants require real mode and explicit signing configuration.",
        "PROCESSING_GRANTS_ENABLED",
      );
    if (
      environment.PROCESSING_GRANTS_ENABLED &&
      environment.SESSION_COOKIE_NAME !== "__Host-clipping_session"
    )
      issue(
        "Protected grants require the fixed host-only session cookie name.",
        "SESSION_COOKIE_NAME",
      );
    if (
      (environment.PROCESSING_GRANTS_ENABLED ||
        environment.PAID_DEMO_ENABLED ||
        anyLiveFeature) &&
      environment.APP_ENV !== "local"
    )
      issue(
        "Public protected/paid processing remains disabled pending deployment safeguards.",
        "PAID_DEMO_ENABLED",
      );

    if (environment.APP_ENV === "production") {
      if (
        environment.NODE_ENV !== "production" ||
        !hasValue(environment.APP_REVISION)
      ) {
        issue(
          "Production requires production Node mode and an application revision.",
          "APP_REVISION",
        );
      }
      if (environment.SESSION_COOKIE_NAME !== "__Host-clipping_session") {
        issue(
          "Production requires the fixed host-only session cookie name.",
          "SESSION_COOKIE_NAME",
        );
      }
      if (environment.LIMIT_PROFILE !== "public") {
        issue(
          "Production public traffic requires the public limit profile.",
          "LIMIT_PROFILE",
        );
      }
    }

    const limitCeiling =
      environment.LIMIT_PROFILE === "public"
        ? PUBLIC_LIMITS
        : OWNER_VALIDATION_LIMITS;
    if (environment.MAX_SOURCE_BYTES > limitCeiling.maxSourceBytes) {
      issue(
        "Runtime source bytes exceed the compiled profile ceiling.",
        "MAX_SOURCE_BYTES",
      );
    }
    if (environment.MAX_SOURCE_SECONDS > limitCeiling.maxSourceSeconds) {
      issue(
        "Runtime source duration exceeds the compiled profile ceiling.",
        "MAX_SOURCE_SECONDS",
      );
    }
    if (environment.MAX_CLIP_SECONDS > limitCeiling.maxClipSeconds) {
      issue(
        "Runtime clip duration exceeds the compiled profile ceiling.",
        "MAX_CLIP_SECONDS",
      );
    }
    if (
      environment.MAX_RENDER_ATTEMPTS_PER_SESSION > limitCeiling.maxFinalRenders
    ) {
      issue(
        "Runtime render allowance exceeds the compiled profile ceiling.",
        "MAX_RENDER_ATTEMPTS_PER_SESSION",
      );
    }
    if (
      environment.MAX_IMAGE_CALLS_PER_ASSEMBLY >
      environment.MAX_VISUAL_CUES_PER_CLIP
    ) {
      issue(
        "Image calls cannot exceed the visual cue allowance.",
        "MAX_IMAGE_CALLS_PER_ASSEMBLY",
      );
    }
  })
  .transform((environment) => ({
    nodeEnv: environment.NODE_ENV,
    appEnv: environment.APP_ENV,
    appRevision: environment.APP_REVISION ?? "local",
    frontendOrigin: environment.FRONTEND_ORIGIN,
    backendOrigin: environment.BACKEND_ORIGIN,
    backendAudience: environment.BACKEND_AUDIENCE ?? null,
    port: environment.PORT,
    renderer: {
      environment: environment.CLOUD_RENDER_ENVIRONMENT,
      spendApproved: environment.CLOUD_SPEND_APPROVED,
      origin: environment.PRIVATE_RENDERER_ORIGIN ?? null,
    },
    providerMode: environment.FAKE_MODE ? ("fake" as const) : ("live" as const),
    paidDemoEnabled: environment.PAID_DEMO_ENABLED,
    features: {
      liveAnalysis: environment.LIVE_ANALYSIS_ENABLED,
      liveAssembly: environment.LIVE_ASSEMBLY_ENABLED,
      liveRender: environment.LIVE_RENDER_ENABLED,
      liveImageGeneration: environment.LIVE_IMAGE_GENERATION_ENABLED,
      activeSpeaker: environment.ACTIVE_SPEAKER_ENABLED,
      trendSignals: environment.TREND_SIGNALS_ENABLED,
    },
    publicLanguageProfile: environment.PUBLIC_LANGUAGE_PROFILE,
    limitProfile: environment.LIMIT_PROFILE,
    session: {
      cookieName: environment.SESSION_COOKIE_NAME,
      accessTtlSeconds: environment.SESSION_ACCESS_TTL_SECONDS,
      processingGrantActiveKeyId:
        environment.PROCESSING_GRANT_ACTIVE_KEY_ID ?? null,
      processingGrantKeysJson: environment.PROCESSING_GRANT_KEYS_JSON ?? null,
      csrfAllowedOrigins: environment.CSRF_ALLOWED_ORIGINS,
    },
    turnstile: {
      siteKey: environment.TURNSTILE_SITE_KEY ?? null,
      secretKey: environment.TURNSTILE_SECRET_KEY ?? null,
      expectedHostname: environment.TURNSTILE_EXPECTED_HOSTNAME ?? null,
      timeoutMs: environment.TURNSTILE_TIMEOUT_MS,
    },
    gemini: {
      apiKey: environment.GEMINI_API_KEY ?? null,
      model: environment.GEMINI_MODEL,
      timeoutMs: environment.GEMINI_TIMEOUT_MS,
      maxOutputTokens: environment.GEMINI_MAX_OUTPUT_TOKENS,
      sdkMaxRetries: environment.GEMINI_SDK_MAX_RETRIES,
      maxCalls: environment.GEMINI_MAX_CALLS,
      transferApproved: environment.GEMINI_TRANSFER_APPROVED,
      paidProjectConfirmed: environment.GEMINI_PAID_PROJECT_CONFIRMED,
    },
    limits: {
      sourceBytes: environment.MAX_SOURCE_BYTES,
      sourceSeconds: environment.MAX_SOURCE_SECONDS,
      clipSeconds: environment.MAX_CLIP_SECONDS,
      faceTracksPerShot: environment.MAX_FACE_TRACKS_PER_SHOT,
      visualCuesPerClip: environment.MAX_VISUAL_CUES_PER_CLIP,
      imageCallsPerAssembly: environment.MAX_IMAGE_CALLS_PER_ASSEMBLY,
      visualCoveragePercent: environment.MAX_VISUAL_COVERAGE_PERCENT,
      renderAttemptsPerSession: environment.MAX_RENDER_ATTEMPTS_PER_SESSION,
    },
    admission: {
      grantsEnabled: environment.PROCESSING_GRANTS_ENABLED,
      maxRecords: environment.ADMISSION_MAX_RECORDS,
      maxConcurrentActions: environment.ADMISSION_MAX_CONCURRENT_ACTIONS,
      maxProcessDispatches: environment.ADMISSION_MAX_PROCESS_DISPATCHES,
      concurrentAnalyses: environment.MAX_CONCURRENT_ANALYSES,
      concurrentAssemblies: environment.MAX_CONCURRENT_ASSEMBLIES,
      apiMaxInstances: environment.API_MAX_INSTANCES,
      frontendMaxInstances: environment.FRONTEND_MAX_INSTANCES,
      rateWindowSeconds: environment.RATE_WINDOW_SECONDS,
      rateGrant: environment.RATE_GRANT_MAX,
      rateAnalysis: environment.RATE_ANALYSIS_MAX,
      rateAssembly: environment.RATE_ASSEMBLY_MAX,
    },
  }));

export type BackendConfig = z.output<typeof environmentSchema>;
