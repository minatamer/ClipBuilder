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

const sha256Schema = z.string().regex(/^[a-f0-9]{64}$/u);

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

  PROVIDER_MODE: z.enum(["fake", "live"]).default("fake"),
  PAID_DEMO_ENABLED: booleanValue(false),
  LIVE_UPLOAD_ENABLED: booleanValue(false),
  LIVE_ANALYSIS_ENABLED: booleanValue(false),
  LIVE_ASSEMBLY_ENABLED: booleanValue(false),
  LIVE_IMAGE_GENERATION_ENABLED: booleanValue(false),
  LIVE_EDIT_ASSISTANT_ENABLED: booleanValue(false),
  LIVE_RENDER_ENABLED: booleanValue(false),
  ACTIVE_SPEAKER_ENABLED: booleanValue(true),
  TREND_SIGNALS_ENABLED: booleanValue(false),
  PUBLIC_LANGUAGE_PROFILE: z.literal("en").default("en"),
  LIMIT_PROFILE: z.enum(["public", "validation"]).default("public"),

  SESSION_COOKIE_NAME: z.string().default("__Host-clipping_session"),
  SESSION_ACCESS_TTL_SECONDS: integerValue(7_200, 900, 7_200),
  PROCESSING_GRANT_ACTIVE_KEY_ID: optionalString(80),
  PROCESSING_GRANT_KEYS_JSON: optionalString(16_384),
  CSRF_ALLOWED_ORIGINS: commaSeparatedOriginsSchema,
  IDEMPOTENCY_TTL_SECONDS: integerValue(86_400, 7_200, 604_800),
  TURNSTILE_SITE_KEY: optionalString(500),
  TURNSTILE_SECRET_KEY: optionalString(500),
  TURNSTILE_EXPECTED_HOSTNAME: optionalString(253),
  TURNSTILE_TIMEOUT_MS: integerValue(5_000, 1_000, 10_000),

  GCP_PROJECT_ID: optionalString(100),
  GCP_REGION: optionalString(100),
  TEMP_MEDIA_BUCKET: optionalString(222),
  SAMPLE_MEDIA_OBJECT: optionalString(1_024),
  SAMPLE_MEDIA_GENERATION: z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : value),
    z
      .string()
      .regex(/^\d{1,32}$/u)
      .optional(),
  ),
  SAMPLE_MEDIA_SHA256: z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : value),
    sha256Schema.optional(),
  ),
  MEDIA_JOB_NAME: optionalString(100),
  MEDIA_JOB_SERVICE_ACCOUNT: optionalString(320),
  UPLOAD_AUTH_TTL_SECONDS: integerValue(900, 300, 900),
  DOWNLOAD_AUTH_TTL_SECONDS: integerValue(300, 60, 300),
  OBJECT_LIFECYCLE_DAYS: z.literal("1").default("1").transform(Number),
  JOB_ANALYSIS_TIMEOUT_SECONDS: integerValue(900, 60, 900),
  JOB_ASSEMBLY_TIMEOUT_SECONDS: integerValue(900, 60, 900),
  JOB_RENDER_TIMEOUT_SECONDS: integerValue(900, 60, 900),
  JOB_CPU: integerValue(2, 1, 8),
  JOB_MEMORY_MIB: integerValue(4_096, 512, 32_768),
  JOB_EPHEMERAL_STORAGE_MIB: integerValue(10_240, 1_024, 65_536),
  FFMPEG_PATH: z.string().default("/usr/local/bin/ffmpeg"),
  FFPROBE_PATH: z.string().default("/usr/local/bin/ffprobe"),
  FONT_DIR: z.string().default("/app/fonts"),
  PYTHON_PATH: z.string().default("/opt/venv/bin/python"),
  ACTIVE_SPEAKER_ENTRYPOINT: z
    .string()
    .default("/app/vision/active_speaker.py"),
  ACTIVE_SPEAKER_MODEL: z.literal("light-asd").default("light-asd"),
  ACTIVE_SPEAKER_WEIGHTS_PATH: z
    .string()
    .default("/app/models/light-asd/model.pth"),
  ACTIVE_SPEAKER_WEIGHTS_SHA256: z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : value),
    sha256Schema.optional(),
  ),
  ACTIVE_SPEAKER_TIMEOUT_MS: integerValue(240_000, 10_000, 240_000),
  SCENE_DETECT_PROFILE: z.literal("podcast-cuts-v1").default("podcast-cuts-v1"),

  OPENAI_API_KEY: optionalString(1_024),
  OPENAI_CLIP_MODEL: z.string().min(1).max(100).default("gpt-6-sol"),
  OPENAI_VISUAL_MODEL: z.string().min(1).max(100).default("gpt-6-sol"),
  OPENAI_EDIT_MODEL: z.string().min(1).max(100).default("gpt-6-sol"),
  OPENAI_IMAGE_MODEL: z.string().min(1).max(100).default("gpt-image-2.5-flare"),
  OPENAI_IMAGE_QUALITY: z.enum(["low", "medium", "high"]).default("medium"),
  OPENAI_REASONING_EFFORT: z.enum(["low", "medium", "high"]).default("low"),
  OPENAI_TIMEOUT_MS: integerValue(60_000, 5_000, 120_000),
  OPENAI_MAX_OUTPUT_TOKENS_CLIP: integerValue(3_000, 1, 3_000),
  OPENAI_MAX_OUTPUT_TOKENS_VISUAL: integerValue(1_800, 1, 1_800),
  OPENAI_MAX_OUTPUT_TOKENS_EDIT: integerValue(1_500, 1, 1_500),
  OPENAI_IMAGE_TIMEOUT_MS: integerValue(120_000, 5_000, 120_000),
  OPENAI_IMAGE_MAX_CALLS: integerValue(
    ASSEMBLY_LIMITS.maxGeneratedImageCalls,
    0,
    ASSEMBLY_LIMITS.maxGeneratedImageCalls,
  ),
  OPENAI_STORE: z
    .literal("false")
    .default("false")
    .transform(() => false as const),
  OPENAI_SDK_MAX_RETRIES: z.literal("0").default("0").transform(Number),

  DEEPGRAM_API_KEY: optionalString(1_024),
  DEEPGRAM_MODEL: z.string().min(1).max(100).default("nova-3"),
  DEEPGRAM_LANGUAGE: z.literal("en").default("en"),
  DEEPGRAM_DIARIZE: booleanValue(true),
  DEEPGRAM_TIMEOUT_MS: integerValue(360_000, 10_000, 360_000),
  DEEPGRAM_SDK_MAX_RETRIES: z.literal("0").default("0").transform(Number),

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
  MAX_ASSISTANT_PROPOSALS_PER_SESSION: integerValue(
    PUBLIC_LIMITS.maxAssistantProposals,
    0,
    OWNER_VALIDATION_LIMITS.maxAssistantProposals,
  ),
  MAX_RENDER_ATTEMPTS_PER_SESSION: integerValue(
    PUBLIC_LIMITS.maxFinalRenders,
    0,
    OWNER_VALIDATION_LIMITS.maxFinalRenders,
  ),
  MAX_CONCURRENT_ANALYSES: integerValue(1, 0, 1),
  MAX_CONCURRENT_ASSEMBLIES: integerValue(1, 0, 1),
  MAX_CONCURRENT_RENDERS: integerValue(1, 0, 1),
  API_MAX_INSTANCES: integerValue(1, 1, 1),
  FRONTEND_MAX_INSTANCES: integerValue(2, 1, 2),
  RATE_WINDOW_SECONDS: integerValue(300, 60, 3_600),
  RATE_UPLOAD_AUTH_MAX: integerValue(3, 0, 3),
  RATE_ANALYSIS_MAX: integerValue(1, 0, 1),
  RATE_ASSEMBLY_MAX: integerValue(1, 0, 1),
  RATE_EDIT_MAX: integerValue(3, 0, 3),
  RATE_RENDER_MAX: integerValue(1, 0, 1),
} satisfies z.ZodRawShape;

const rawEnvironmentSchema = z.object(environmentShape).strict();

export const ENVIRONMENT_KEYS = Object.freeze([
  ...rawEnvironmentSchema.keyof().options,
]);

export const environmentSchema = rawEnvironmentSchema
  .superRefine((environment, context) => {
    const liveFlags = [
      environment.LIVE_UPLOAD_ENABLED,
      environment.LIVE_ANALYSIS_ENABLED,
      environment.LIVE_ASSEMBLY_ENABLED,
      environment.LIVE_IMAGE_GENERATION_ENABLED,
      environment.LIVE_EDIT_ASSISTANT_ENABLED,
      environment.LIVE_RENDER_ENABLED,
    ];
    const anyLiveFeature = liveFlags.some(Boolean);
    const hasValue = (value: string | undefined) => value !== undefined;
    const issue = (message: string, path: string) =>
      context.addIssue({ code: "custom", message, path: [path] });

    if (environment.NODE_ENV === "test") {
      if (
        environment.PROVIDER_MODE !== "fake" ||
        environment.PAID_DEMO_ENABLED ||
        anyLiveFeature
      ) {
        issue(
          "Test configuration must be fake with every paid/live gate disabled.",
          "PROVIDER_MODE",
        );
      }
      if (
        hasValue(environment.OPENAI_API_KEY) ||
        hasValue(environment.DEEPGRAM_API_KEY) ||
        hasValue(environment.TURNSTILE_SECRET_KEY) ||
        hasValue(environment.PROCESSING_GRANT_KEYS_JSON)
      ) {
        issue(
          "Test configuration must not contain credentials.",
          "OPENAI_API_KEY",
        );
      }
    }

    if (environment.PROVIDER_MODE === "fake") {
      if (environment.PAID_DEMO_ENABLED || anyLiveFeature) {
        issue(
          "Fake provider mode cannot enable paid or live behavior.",
          "PROVIDER_MODE",
        );
      }
    } else if (!environment.PAID_DEMO_ENABLED) {
      issue(
        "Live provider mode requires the paid-operation master gate.",
        "PAID_DEMO_ENABLED",
      );
    }

    if (anyLiveFeature && environment.PROVIDER_MODE !== "live") {
      issue("Live features require live provider mode.", "PROVIDER_MODE");
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

    const needsOpenAi =
      environment.LIVE_ANALYSIS_ENABLED ||
      environment.LIVE_ASSEMBLY_ENABLED ||
      environment.LIVE_EDIT_ASSISTANT_ENABLED;
    if (needsOpenAi && !hasValue(environment.OPENAI_API_KEY)) {
      issue(
        "Enabled live model features require OpenAI configuration.",
        "OPENAI_API_KEY",
      );
    }
    if (
      environment.LIVE_ANALYSIS_ENABLED &&
      !hasValue(environment.DEEPGRAM_API_KEY)
    ) {
      issue(
        "Live analysis requires transcription configuration.",
        "DEEPGRAM_API_KEY",
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

    const needsStorageOrJob =
      environment.LIVE_UPLOAD_ENABLED ||
      environment.LIVE_ANALYSIS_ENABLED ||
      environment.LIVE_ASSEMBLY_ENABLED ||
      environment.LIVE_RENDER_ENABLED;
    if (needsStorageOrJob) {
      const storageValues = [
        environment.GCP_PROJECT_ID,
        environment.GCP_REGION,
        environment.TEMP_MEDIA_BUCKET,
        environment.MEDIA_JOB_NAME,
      ];
      if (!storageValues.every(hasValue)) {
        issue(
          "Enabled media features require complete storage and job configuration.",
          "GCP_PROJECT_ID",
        );
      }
    }

    if (
      environment.LIVE_ASSEMBLY_ENABLED &&
      !hasValue(environment.ACTIVE_SPEAKER_WEIGHTS_SHA256)
    ) {
      issue(
        "Live assembly requires a pinned active-speaker weights hash.",
        "ACTIVE_SPEAKER_WEIGHTS_SHA256",
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
      environment.MAX_ASSISTANT_PROPOSALS_PER_SESSION >
      limitCeiling.maxAssistantProposals
    ) {
      issue(
        "Runtime proposal allowance exceeds the compiled profile ceiling.",
        "MAX_ASSISTANT_PROPOSALS_PER_SESSION",
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
    providerMode: environment.PROVIDER_MODE,
    paidDemoEnabled: environment.PAID_DEMO_ENABLED,
    features: {
      liveUpload: environment.LIVE_UPLOAD_ENABLED,
      liveAnalysis: environment.LIVE_ANALYSIS_ENABLED,
      liveAssembly: environment.LIVE_ASSEMBLY_ENABLED,
      liveImageGeneration: environment.LIVE_IMAGE_GENERATION_ENABLED,
      liveEditAssistant: environment.LIVE_EDIT_ASSISTANT_ENABLED,
      liveRender: environment.LIVE_RENDER_ENABLED,
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
      idempotencyTtlSeconds: environment.IDEMPOTENCY_TTL_SECONDS,
    },
    turnstile: {
      siteKey: environment.TURNSTILE_SITE_KEY ?? null,
      secretKey: environment.TURNSTILE_SECRET_KEY ?? null,
      expectedHostname: environment.TURNSTILE_EXPECTED_HOSTNAME ?? null,
      timeoutMs: environment.TURNSTILE_TIMEOUT_MS,
    },
    storage: {
      projectId: environment.GCP_PROJECT_ID ?? null,
      region: environment.GCP_REGION ?? null,
      bucket: environment.TEMP_MEDIA_BUCKET ?? null,
      sampleObject: environment.SAMPLE_MEDIA_OBJECT ?? null,
      sampleGeneration: environment.SAMPLE_MEDIA_GENERATION ?? null,
      sampleSha256: environment.SAMPLE_MEDIA_SHA256 ?? null,
      mediaJobName: environment.MEDIA_JOB_NAME ?? null,
      mediaJobServiceAccount: environment.MEDIA_JOB_SERVICE_ACCOUNT ?? null,
      uploadAuthTtlSeconds: environment.UPLOAD_AUTH_TTL_SECONDS,
      downloadAuthTtlSeconds: environment.DOWNLOAD_AUTH_TTL_SECONDS,
      objectLifecycleDays: environment.OBJECT_LIFECYCLE_DAYS,
    },
    jobs: {
      analysisTimeoutSeconds: environment.JOB_ANALYSIS_TIMEOUT_SECONDS,
      assemblyTimeoutSeconds: environment.JOB_ASSEMBLY_TIMEOUT_SECONDS,
      renderTimeoutSeconds: environment.JOB_RENDER_TIMEOUT_SECONDS,
      cpu: environment.JOB_CPU,
      memoryMiB: environment.JOB_MEMORY_MIB,
      ephemeralStorageMiB: environment.JOB_EPHEMERAL_STORAGE_MIB,
      ffmpegPath: environment.FFMPEG_PATH,
      ffprobePath: environment.FFPROBE_PATH,
      fontDirectory: environment.FONT_DIR,
      pythonPath: environment.PYTHON_PATH,
      activeSpeakerEntrypoint: environment.ACTIVE_SPEAKER_ENTRYPOINT,
      activeSpeakerModel: environment.ACTIVE_SPEAKER_MODEL,
      activeSpeakerWeightsPath: environment.ACTIVE_SPEAKER_WEIGHTS_PATH,
      activeSpeakerWeightsSha256:
        environment.ACTIVE_SPEAKER_WEIGHTS_SHA256 ?? null,
      activeSpeakerTimeoutMs: environment.ACTIVE_SPEAKER_TIMEOUT_MS,
      sceneDetectProfile: environment.SCENE_DETECT_PROFILE,
    },
    openAi: {
      apiKey: environment.OPENAI_API_KEY ?? null,
      clipModel: environment.OPENAI_CLIP_MODEL,
      visualModel: environment.OPENAI_VISUAL_MODEL,
      editModel: environment.OPENAI_EDIT_MODEL,
      imageModel: environment.OPENAI_IMAGE_MODEL,
      imageQuality: environment.OPENAI_IMAGE_QUALITY,
      reasoningEffort: environment.OPENAI_REASONING_EFFORT,
      timeoutMs: environment.OPENAI_TIMEOUT_MS,
      maxOutputTokensClip: environment.OPENAI_MAX_OUTPUT_TOKENS_CLIP,
      maxOutputTokensVisual: environment.OPENAI_MAX_OUTPUT_TOKENS_VISUAL,
      maxOutputTokensEdit: environment.OPENAI_MAX_OUTPUT_TOKENS_EDIT,
      imageTimeoutMs: environment.OPENAI_IMAGE_TIMEOUT_MS,
      imageMaxCalls: environment.OPENAI_IMAGE_MAX_CALLS,
      store: environment.OPENAI_STORE,
      sdkMaxRetries: environment.OPENAI_SDK_MAX_RETRIES,
    },
    deepgram: {
      apiKey: environment.DEEPGRAM_API_KEY ?? null,
      model: environment.DEEPGRAM_MODEL,
      language: environment.DEEPGRAM_LANGUAGE,
      diarize: environment.DEEPGRAM_DIARIZE,
      timeoutMs: environment.DEEPGRAM_TIMEOUT_MS,
      sdkMaxRetries: environment.DEEPGRAM_SDK_MAX_RETRIES,
    },
    limits: {
      sourceBytes: environment.MAX_SOURCE_BYTES,
      sourceSeconds: environment.MAX_SOURCE_SECONDS,
      clipSeconds: environment.MAX_CLIP_SECONDS,
      faceTracksPerShot: environment.MAX_FACE_TRACKS_PER_SHOT,
      visualCuesPerClip: environment.MAX_VISUAL_CUES_PER_CLIP,
      imageCallsPerAssembly: environment.MAX_IMAGE_CALLS_PER_ASSEMBLY,
      visualCoveragePercent: environment.MAX_VISUAL_COVERAGE_PERCENT,
      assistantProposalsPerSession:
        environment.MAX_ASSISTANT_PROPOSALS_PER_SESSION,
      renderAttemptsPerSession: environment.MAX_RENDER_ATTEMPTS_PER_SESSION,
    },
    admission: {
      concurrentAnalyses: environment.MAX_CONCURRENT_ANALYSES,
      concurrentAssemblies: environment.MAX_CONCURRENT_ASSEMBLIES,
      concurrentRenders: environment.MAX_CONCURRENT_RENDERS,
      apiMaxInstances: environment.API_MAX_INSTANCES,
      frontendMaxInstances: environment.FRONTEND_MAX_INSTANCES,
      rateWindowSeconds: environment.RATE_WINDOW_SECONDS,
      rateUploadAuthorization: environment.RATE_UPLOAD_AUTH_MAX,
      rateAnalysis: environment.RATE_ANALYSIS_MAX,
      rateAssembly: environment.RATE_ASSEMBLY_MAX,
      rateEdit: environment.RATE_EDIT_MAX,
      rateRender: environment.RATE_RENDER_MAX,
    },
  }));

export type BackendConfig = z.output<typeof environmentSchema>;
