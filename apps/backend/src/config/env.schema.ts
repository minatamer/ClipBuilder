import {
  ASSEMBLY_LIMITS,
  OWNER_VALIDATION_LIMITS,
  PUBLIC_LIMITS,
} from "@clipbuilder/contracts";
import { z } from "zod";
import { ACTIVE_PROCESSING_GRANT_KEY_ID } from "../admission/processing.grant.js";

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

const environmentShape = {
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  APP_ENV: z.enum(["local", "preview", "production"]).default("local"),
  APP_REVISION: optionalString(80),
  FRONTEND_ORIGIN: exactOriginSchema.default("http://localhost:3000"),
  BACKEND_ORIGIN: exactOriginSchema.default("http://localhost:4000"),
  BACKEND_AUDIENCE: optionalString(500),
  FRONTEND_CALLER_EMAIL: optionalString(254),
  PUBLIC_PAID_PROCESSING_APPROVED: booleanValue(false),
  PORT: integerValue(4_000, 1, 65_535),
  CLOUD_RENDER_ENVIRONMENT: z.enum(["disabled", "cloud"]).default("disabled"),
  CLOUD_SPEND_APPROVED: booleanValue(true),
  PRIVATE_RENDERER_ORIGIN: optionalString(500),
  RETAINED_SAMPLE_ENABLED: booleanValue(false),
  RETAINED_SAMPLE_BUCKET: optionalString(223),
  RETAINED_SAMPLE_OBJECT: optionalString(1_024),
  RETAINED_SAMPLE_GENERATION: optionalString(30),
  RETAINED_SAMPLE_BYTES: integerValue(0, 0, PUBLIC_LIMITS.maxSourceBytes),

  FAKE_MODE: booleanValue(false),
  PAID_DEMO_ENABLED: booleanValue(true),
  GEMINI_IMAGE_GENERATION_APPROVED: booleanValue(true),
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
  PROCESSING_GRANT_KEY: optionalString(1_024),
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
  GEMINI_TRANSFER_APPROVED: booleanValue(true),
  GEMINI_PAID_PROJECT_CONFIRMED: booleanValue(true),

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
  "FAKE_MODE",
  "PAID_DEMO_ENABLED",
  "GEMINI_API_KEY",
  "TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET_KEY",
  "PROCESSING_GRANT_KEY",
  "APP_ENV",
  "APP_REVISION",
  "FRONTEND_ORIGIN",
  "BACKEND_ORIGIN",
  "BACKEND_AUDIENCE",
  "FRONTEND_CALLER_EMAIL",
  "PUBLIC_PAID_PROCESSING_APPROVED",
  "PRIVATE_RENDERER_ORIGIN",
  "TURNSTILE_EXPECTED_HOSTNAME",
  "RETAINED_SAMPLE_BUCKET",
  "RETAINED_SAMPLE_OBJECT",
  "RETAINED_SAMPLE_GENERATION",
  "RETAINED_SAMPLE_BYTES",
  "CLOUD_SPEND_APPROVED",
  "GEMINI_TRANSFER_APPROVED",
  "GEMINI_IMAGE_GENERATION_APPROVED",
  "GEMINI_PAID_PROJECT_CONFIRMED",
] as const);

// Capabilities, limits, timeouts and retry policy are derived in code.
export const RETIRED_ENVIRONMENT_KEYS = Object.freeze(
  rawEnvironmentSchema
    .keyof()
    .options.filter(
      (key) =>
        !ENVIRONMENT_KEYS.some((environmentKey) => environmentKey === key) &&
        !["NODE_ENV", "PORT"].includes(key),
    ),
);

export const environmentSchema = rawEnvironmentSchema
  .transform((environment) =>
    environment.PAID_DEMO_ENABLED
      ? environment
      : {
          ...environment,
          CLOUD_SPEND_APPROVED: false,
          GEMINI_TRANSFER_APPROVED: false,
          GEMINI_IMAGE_GENERATION_APPROVED: false,
          GEMINI_PAID_PROJECT_CONFIRMED: false,
          CLOUD_RENDER_ENVIRONMENT: "disabled" as const,
          RETAINED_SAMPLE_ENABLED: false,
          LIVE_ANALYSIS_ENABLED: false,
          LIVE_ASSEMBLY_ENABLED: false,
          LIVE_RENDER_ENABLED: false,
          LIVE_IMAGE_GENERATION_ENABLED: false,
          PROCESSING_GRANTS_ENABLED: false,
          ADMISSION_MAX_PROCESS_DISPATCHES: 0,
        },
  )
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

    if (
      environment.RETAINED_SAMPLE_ENABLED &&
      (environment.NODE_ENV === "test" ||
        environment.APP_ENV !== "local" ||
        environment.FAKE_MODE ||
        !environment.CLOUD_SPEND_APPROVED ||
        !environment.RETAINED_SAMPLE_BUCKET ||
        !/^[a-z0-9][a-z0-9._-]{1,221}[a-z0-9]$/.test(
          environment.RETAINED_SAMPLE_BUCKET,
        ) ||
        !environment.RETAINED_SAMPLE_OBJECT ||
        !/^[1-9]\d{0,29}$/.test(environment.RETAINED_SAMPLE_GENERATION ?? "") ||
        environment.RETAINED_SAMPLE_BYTES === 0)
    )
      issue(
        "Retained sample reads require local real-media mode, approved cloud spend and a complete fixed object reference; tests cannot enable them.",
        "RETAINED_SAMPLE_ENABLED",
      );

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
        hasValue(environment.PROCESSING_GRANT_KEY)
      ) {
        issue(
          "Test configuration must not contain credentials.",
          "GEMINI_API_KEY",
        );
      }
    }

    if (environment.CLOUD_RENDER_ENVIRONMENT === "cloud") {
      const origin = environment.PRIVATE_RENDERER_ORIGIN;
      if (!environment.CLOUD_SPEND_APPROVED)
        issue(
          "Cloud compute requires approved spend and an exact private renderer origin.",
          "CLOUD_SPEND_APPROVED",
        );
      if (
        !origin ||
        !exactOriginSchema.safeParse(origin).success ||
        !new URL(origin).hostname.endsWith(".run.app") ||
        !origin.startsWith("https://")
      )
        issue(
          "Cloud compute requires approved spend and an exact private renderer origin.",
          "PRIVATE_RENDERER_ORIGIN",
        );
      if (
        environment.APP_ENV !== "local" &&
        !environment.PUBLIC_PAID_PROCESSING_APPROVED
      )
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

    if (anyLiveFeature)
      for (const [key, ready] of [
        ["GEMINI_API_KEY", hasValue(environment.GEMINI_API_KEY)],
        ["GEMINI_TRANSFER_APPROVED", environment.GEMINI_TRANSFER_APPROVED],
        [
          "GEMINI_PAID_PROJECT_CONFIRMED",
          environment.GEMINI_PAID_PROJECT_CONFIRMED,
        ],
      ] as const)
        if (!ready)
          issue(
            "Live Google features require credentials and approved paid-project media transfer.",
            key,
          );
    if (environment.LIVE_IMAGE_GENERATION_ENABLED) {
      if (
        environment.ADMISSION_MAX_PROCESS_DISPATCHES <
        (environment.LIVE_RENDER_ENABLED ? 4 : 3) +
          ASSEMBLY_LIMITS.maxGeneratedImageCalls
      )
        issue(
          "Image fallback requires the bounded image dispatch allowance.",
          "LIVE_IMAGE_GENERATION_ENABLED",
        );
    }

    if (anyLiveFeature) {
      for (const key of [
        "PROCESSING_GRANT_KEY",
        "TURNSTILE_SITE_KEY",
        "TURNSTILE_SECRET_KEY",
        "TURNSTILE_EXPECTED_HOSTNAME",
      ] as const)
        if (!hasValue(environment[key]))
          issue(
            "Live features require complete grant and abuse configuration.",
            key,
          );
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
      (environment.FAKE_MODE || !hasValue(environment.PROCESSING_GRANT_KEY))
    )
      issue(
        "Processing grants require real mode and explicit encryption keys.",
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
      environment.APP_ENV !== "local" &&
      !environment.PUBLIC_PAID_PROCESSING_APPROVED
    )
      issue(
        "Public protected/paid processing remains disabled pending deployment safeguards.",
        "PAID_DEMO_ENABLED",
      );

    if (environment.PUBLIC_PAID_PROCESSING_APPROVED) {
      const frontend = new URL(environment.FRONTEND_ORIGIN);
      const backend = new URL(environment.BACKEND_ORIGIN);
      if (
        environment.APP_ENV !== "production" ||
        frontend.protocol !== "https:" ||
        !frontend.hostname.endsWith(".run.app") ||
        backend.protocol !== "https:" ||
        !backend.hostname.endsWith(".run.app") ||
        environment.BACKEND_AUDIENCE !== environment.BACKEND_ORIGIN ||
        !/^[a-z0-9._-]+@[a-z0-9.-]+\.iam\.gserviceaccount\.com$/.test(
          environment.FRONTEND_CALLER_EMAIL ?? "",
        ) ||
        environment.TURNSTILE_EXPECTED_HOSTNAME !== frontend.hostname
      )
        issue(
          "Public processing requires the approved private identity and exact production origins/hostname.",
          "PUBLIC_PAID_PROCESSING_APPROVED",
        );
    }

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
    frontendCallerEmail: environment.FRONTEND_CALLER_EMAIL ?? null,
    publicPaidProcessingApproved: environment.PUBLIC_PAID_PROCESSING_APPROVED,
    port: environment.PORT,
    renderer: {
      environment: environment.CLOUD_RENDER_ENVIRONMENT,
      spendApproved: environment.CLOUD_SPEND_APPROVED,
      origin: environment.PRIVATE_RENDERER_ORIGIN ?? null,
    },
    retainedSample: {
      enabled: environment.RETAINED_SAMPLE_ENABLED,
      bucket: environment.RETAINED_SAMPLE_BUCKET ?? null,
      object: environment.RETAINED_SAMPLE_OBJECT ?? null,
      generation: environment.RETAINED_SAMPLE_GENERATION ?? null,
      bytes: environment.RETAINED_SAMPLE_BYTES,
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
      processingGrantActiveKeyId: ACTIVE_PROCESSING_GRANT_KEY_ID,
      processingGrantKey: environment.PROCESSING_GRANT_KEY ?? null,
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
      imageGenerationApproved: environment.GEMINI_IMAGE_GENERATION_APPROVED,
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
