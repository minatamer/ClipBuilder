import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { createSafeTestEnvironment } from "../../test/environment.fixture.js";
import { ENVIRONMENT_KEYS } from "./env.schema.js";
import { loadConfig } from "./loadConfig.js";

const blankCommittedEnvironmentKeys = [
  "APP_REVISION",
  "BACKEND_AUDIENCE",
  "PROCESSING_GRANT_ACTIVE_KEY_ID",
  "PROCESSING_GRANT_KEYS_JSON",
  "TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET_KEY",
  "TURNSTILE_EXPECTED_HOSTNAME",
  "GCP_PROJECT_ID",
  "GCP_REGION",
  "TEMP_MEDIA_BUCKET",
  "SAMPLE_MEDIA_OBJECT",
  "SAMPLE_MEDIA_GENERATION",
  "SAMPLE_MEDIA_SHA256",
  "MEDIA_JOB_NAME",
  "MEDIA_JOB_SERVICE_ACCOUNT",
  "ACTIVE_SPEAKER_WEIGHTS_SHA256",
  "OPENAI_API_KEY",
  "DEEPGRAM_API_KEY",
] as const;

const liveAnalysisEnvironment = (): NodeJS.ProcessEnv => ({
  NODE_ENV: "development",
  APP_ENV: "preview",
  PROVIDER_MODE: "live",
  PAID_DEMO_ENABLED: "true",
  LIVE_UPLOAD_ENABLED: "false",
  LIVE_ANALYSIS_ENABLED: "true",
  LIVE_ASSEMBLY_ENABLED: "false",
  LIVE_IMAGE_GENERATION_ENABLED: "false",
  LIVE_RENDER_ENABLED: "false",
  OPENAI_API_KEY: "fixture-openai-key",
  DEEPGRAM_API_KEY: "fixture-deepgram-key",
  PROCESSING_GRANT_ACTIVE_KEY_ID: "fixture-key-v1",
  PROCESSING_GRANT_KEYS_JSON: '{"fixture-key-v1":"fixture-only-material"}',
  TURNSTILE_SITE_KEY: "fixture-site-key",
  TURNSTILE_SECRET_KEY: "fixture-secret-key",
  TURNSTILE_EXPECTED_HOSTNAME: "preview.example.test",
  GCP_PROJECT_ID: "fixture-project",
  GCP_REGION: "fixture-region",
  TEMP_MEDIA_BUCKET: "fixture-private-bucket",
  MEDIA_JOB_NAME: "fixture-media-job",
});

describe("loadConfig", () => {
  it("composes only fake, paid-disabled defaults in tests", () => {
    const config = loadConfig(createSafeTestEnvironment());

    expect(config.providerMode).toBe("fake");
    expect(config.paidDemoEnabled).toBe(false);
    expect(Object.values(config.features).filter(Boolean)).toEqual([true]);
    expect(config.openAi.apiKey).toBeNull();
    expect(config.deepgram.apiKey).toBeNull();
  });

  it("rejects live or paid composition in tests", () => {
    expect(() =>
      loadConfig(createSafeTestEnvironment({ PROVIDER_MODE: "live" })),
    ).toThrow();
    expect(() =>
      loadConfig(createSafeTestEnvironment({ PAID_DEMO_ENABLED: "true" })),
    ).toThrow();
    expect(() =>
      loadConfig(createSafeTestEnvironment({ LIVE_ANALYSIS_ENABLED: "true" })),
    ).toThrow();
  });

  it("rejects credentials in deterministic test composition", () => {
    expect(() =>
      loadConfig(
        createSafeTestEnvironment({
          OPENAI_API_KEY: "not-a-real-key",
        }),
      ),
    ).toThrow();
  });

  it("accepts live analysis only with provider, grant, abuse, storage, and job configuration", () => {
    const config = loadConfig(liveAnalysisEnvironment());

    expect(config.providerMode).toBe("live");
    expect(config.features.liveAnalysis).toBe(true);
    expect(config.storage.projectId).toBe("fixture-project");
    expect(config.storage.mediaJobName).toBe("fixture-media-job");
  });

  it.each([
    "OPENAI_API_KEY",
    "DEEPGRAM_API_KEY",
    "PROCESSING_GRANT_ACTIVE_KEY_ID",
    "PROCESSING_GRANT_KEYS_JSON",
    "TURNSTILE_SITE_KEY",
    "TURNSTILE_SECRET_KEY",
    "TURNSTILE_EXPECTED_HOSTNAME",
    "GCP_PROJECT_ID",
    "GCP_REGION",
    "TEMP_MEDIA_BUCKET",
    "MEDIA_JOB_NAME",
  ])("rejects live analysis when %s is missing", (missingKey) => {
    const environment = liveAnalysisEnvironment();
    delete environment[missingKey];

    expect(() => loadConfig(environment)).toThrow();
  });

  it("cannot raise runtime public limits above compiled ceilings", () => {
    expect(() =>
      loadConfig(createSafeTestEnvironment({ MAX_SOURCE_BYTES: "524288001" })),
    ).toThrow();
    expect(() =>
      loadConfig(createSafeTestEnvironment({ MAX_SOURCE_SECONDS: "1201" })),
    ).toThrow();
  });

  it("fails closed for incomplete production configuration", () => {
    expect(() =>
      loadConfig(
        createSafeTestEnvironment({
          NODE_ENV: "production",
          APP_ENV: "production",
        }),
      ),
    ).toThrow();
    expect(() =>
      loadConfig(
        createSafeTestEnvironment({
          NODE_ENV: "production",
          APP_ENV: "production",
          APP_REVISION: "abc123",
          CLIPBUILDER_UNKNOWN: "true",
        }),
      ),
    ).toThrow("Unknown ClipBuilder-prefixed production configuration.");
  });

  it("keeps .env.example in exact lockstep with the runtime schema", () => {
    const examplePath = fileURLToPath(
      new URL("../../../../.env.example", import.meta.url),
    );
    const definitions = readFileSync(examplePath, "utf8")
      .split(/\r?\n/u)
      .filter((line) => /^[A-Z0-9_]+=/.test(line))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator), line.slice(separator + 1)] as const;
      });
    const exampleKeys = definitions.map(([key]) => key);
    const exampleValues = Object.fromEntries(definitions);

    expect(new Set(exampleKeys).size).toBe(exampleKeys.length);
    expect([...exampleKeys].sort()).toEqual([...ENVIRONMENT_KEYS].sort());
    blankCommittedEnvironmentKeys.forEach((key) => {
      expect(exampleValues[key]).toBe("");
    });
  });
});
