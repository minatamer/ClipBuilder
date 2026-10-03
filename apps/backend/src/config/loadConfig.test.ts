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
  "GEMINI_API_KEY",
] as const;

const liveAnalysisEnvironment = (): NodeJS.ProcessEnv => ({
  NODE_ENV: "development",
  APP_ENV: "local",
  PROVIDER_MODE: "live",
  FAKE_MODE: "false",
  PAID_DEMO_ENABLED: "true",
  LIVE_ANALYSIS_ENABLED: "true",
  PROCESSING_GRANTS_ENABLED: "true",
  ADMISSION_MAX_PROCESS_DISPATCHES: "2",
  CLOUD_RENDER_ENVIRONMENT: "cloud",
  CLOUD_SPEND_APPROVED: "true",
  PRIVATE_RENDERER_ORIGIN: "https://renderer.example.run.app",
  LIVE_ASSEMBLY_ENABLED: "false",
  LIVE_IMAGE_GENERATION_ENABLED: "false",
  GEMINI_API_KEY: "fixture-google-key",
  GEMINI_TRANSFER_APPROVED: "true",
  GEMINI_PAID_PROJECT_CONFIRMED: "true",
  PROCESSING_GRANT_ACTIVE_KEY_ID: "fixture-key-v1",
  PROCESSING_GRANT_KEYS_JSON: JSON.stringify({
    "fixture-key-v1": Buffer.alloc(32, 1).toString("base64url"),
  }),
  TURNSTILE_SITE_KEY: "fixture-site-key",
  TURNSTILE_SECRET_KEY: "fixture-secret-key",
  TURNSTILE_EXPECTED_HOSTNAME: "preview.example.test",
});

describe("loadConfig", () => {
  it("requires frozen assembly, cloud/paid gates and all four actions for final rendering", () => {
    const base = {
      ...liveAnalysisEnvironment(),
      LIVE_RENDER_ENABLED: "true",
      LIVE_ASSEMBLY_ENABLED: "true",
      ADMISSION_MAX_PROCESS_DISPATCHES: "4",
    };
    expect(loadConfig(base).features.liveRender).toBe(true);
    for (const overrides of [
      { LIVE_ASSEMBLY_ENABLED: "false" },
      { ADMISSION_MAX_PROCESS_DISPATCHES: "3" },
      { CLOUD_SPEND_APPROVED: "false" },
      { PAID_DEMO_ENABLED: "false" },
    ])
      expect(() => loadConfig({ ...base, ...overrides })).toThrow();
    expect(loadConfig({}).features.liveRender).toBe(false);
  });
  it("requires source analysis and three reserved actions before live selected-range assembly", () => {
    expect(() =>
      loadConfig({
        ...liveAnalysisEnvironment(),
        LIVE_ASSEMBLY_ENABLED: "true",
      }),
    ).toThrow();
    expect(() =>
      loadConfig({
        ...liveAnalysisEnvironment(),
        LIVE_ANALYSIS_ENABLED: "false",
        LIVE_ASSEMBLY_ENABLED: "true",
        ADMISSION_MAX_PROCESS_DISPATCHES: "3",
      }),
    ).toThrow();
    expect(
      loadConfig({
        ...liveAnalysisEnvironment(),
        LIVE_ASSEMBLY_ENABLED: "true",
        ADMISSION_MAX_PROCESS_DISPATCHES: "3",
      }).features.liveAssembly,
    ).toBe(true);
  });
  it("uses one authoritative boolean without real-mode fallback or paid admission", () => {
    expect(loadConfig({}).providerMode).toBe("fake");
    const real = loadConfig({ FAKE_MODE: "false" });
    expect(real.providerMode).toBe("live");
    expect(real.paidDemoEnabled).toBe(false);
    expect(real.features.liveAnalysis).toBe(false);
    expect(() =>
      loadConfig({ FAKE_MODE: "false", PROVIDER_MODE: "fake" }),
    ).toThrow();
    expect(() => loadConfig({ FAKE_MODE: "maybe" })).toThrow();
    expect(() =>
      loadConfig({ FAKE_MODE: "false", LIVE_ANALYSIS_ENABLED: "true" }),
    ).toThrow();
  });
  it("rejects retired media flags and malformed grant keys during composition", () => {
    expect(() => loadConfig({ LIVE_UPLOAD_ENABLED: "true" })).toThrow();
    expect(() => loadConfig({ LIVE_RENDER_ENABLED: "true" })).toThrow();
    expect(() =>
      loadConfig({
        ...liveAnalysisEnvironment(),
        PROCESSING_GRANT_KEYS_JSON: "{}",
      }),
    ).toThrow();
    expect(() =>
      loadConfig({
        ...liveAnalysisEnvironment(),
        PROCESSING_GRANT_ACTIVE_KEY_ID: "missing",
      }),
    ).toThrow();
  });
  it("composes only fake, paid-disabled defaults in tests", () => {
    const config = loadConfig(createSafeTestEnvironment());

    expect(config.providerMode).toBe("fake");
    expect(config.paidDemoEnabled).toBe(false);
    expect(Object.values(config.features).filter(Boolean)).toEqual([true]);
    expect(config.gemini.apiKey).toBeNull();
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
          GEMINI_API_KEY: "not-a-real-key",
        }),
      ),
    ).toThrow();
  });

  it("accepts gated local source analysis with separate private compute configuration", () => {
    const config = loadConfig(liveAnalysisEnvironment());

    expect(config.providerMode).toBe("live");
    expect(config.features.liveAnalysis).toBe(true);
    expect(config).not.toHaveProperty("storage");
    expect(config).not.toHaveProperty("jobs");
    expect(() =>
      loadConfig({ ...liveAnalysisEnvironment(), APP_ENV: "preview" }),
    ).toThrow();
  });

  it.each([
    "GEMINI_API_KEY",
    "PROCESSING_GRANT_ACTIVE_KEY_ID",
    "PROCESSING_GRANT_KEYS_JSON",
    "TURNSTILE_SITE_KEY",
    "TURNSTILE_SECRET_KEY",
    "TURNSTILE_EXPECTED_HOSTNAME",
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
