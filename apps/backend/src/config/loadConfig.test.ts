import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { PUBLIC_LIMITS } from "@clipbuilder/contracts";
import {
  createSafeTestEnvironment,
  createLiveValidationEnvironment,
} from "../../test/environment.fixture.js";
import { loadConfig } from "./loadConfig.js";
import { ENVIRONMENT_KEYS } from "./env.schema.js";
import { composeAdmission } from "../admission/admission.composition.js";
import { composeBackend } from "../composition.js";
import * as gemini from "../analysis/gemini.adapter.js";
import * as renderer from "../media/renderer.cloudrun.js";
import * as turnstile from "../admission/turnstile.verifier.js";

const approvals = [
  "CLOUD_SPEND_APPROVED",
  "GEMINI_TRANSFER_APPROVED",
  "GEMINI_IMAGE_GENERATION_APPROVED",
  "GEMINI_PAID_PROJECT_CONFIRMED",
] as const;
const retained = {
  RETAINED_SAMPLE_BUCKET: "synthetic-retained",
  RETAINED_SAMPLE_OBJECT: "source/input.mp4",
  RETAINED_SAMPLE_GENERATION: "1",
  RETAINED_SAMPLE_BYTES: "8192",
};

describe("backend environment configuration", () => {
  it("defaults to Gemini and rejects unsupported or hosted Codex selection", () => {
    expect(loadConfig({ NODE_ENV: "development" }).aiProvider).toBe("gemini");
    expect(() => loadConfig({ AI_PROVIDER: "other" })).toThrow();
    for (const APP_ENV of ["preview", "production"])
      expect(() =>
        loadConfig({
          APP_ENV,
          AI_PROVIDER: "codex",
          FAKE_MODE: "true",
          PAID_DEMO_ENABLED: "false",
        }),
      ).toThrow();
  });
  it.each([
    { FAKE_MODE: "false", PAID_DEMO_ENABLED: "true" },
    { FAKE_MODE: "true", PAID_DEMO_ENABLED: "false" },
    { FAKE_MODE: "false", PAID_DEMO_ENABLED: "false" },
  ])(
    "isolates every Gemini capability when local Codex is selected (%j)",
    async (switches) => {
      const google = vi.spyOn(gemini, "composeGeminiTransport"),
        cloud = vi.spyOn(renderer, "rendererIdentity");
      try {
        const { application, config } = composeBackend({
          NODE_ENV: "development",
          APP_ENV: "local",
          AI_PROVIDER: "codex",
          GEMINI_API_KEY: "synthetic-unused-key",
          ...switches,
        });
        expect(config.aiProvider).toBe("codex");
        expect(config.gemini.apiKey).toBeNull();
        expect(config.features).toMatchObject({
          liveAnalysis: false,
          liveAssembly: false,
          liveRender: false,
          liveImageGeneration: false,
        });
        expect(config.renderer.environment).toBe("disabled");
        expect(config.admission.maxProcessDispatches).toBe(0);
        await request(application).get("/v1/health").expect(200);
        await request(application)
          .post("/v1/analysis/run")
          .send({})
          .expect(404);
        expect(google).not.toHaveBeenCalled();
        expect(cloud).not.toHaveBeenCalled();
      } finally {
        google.mockRestore();
        cloud.mockRestore();
      }
    },
  );
  it("defaults to real mode, paid enabled and four approvals without dispatching incomplete setup", async () => {
    const google = vi.spyOn(gemini, "composeGeminiTransport");
    const media = vi.spyOn(renderer, "rendererIdentity");
    const challenge = vi.spyOn(turnstile, "composeAbuseVerifier");
    try {
      const { application, config } = composeBackend({
        NODE_ENV: "development",
      });
      expect(config).toMatchObject({
        providerMode: "live",
        paidDemoEnabled: true,
        renderer: { spendApproved: true },
        gemini: {
          transferApproved: true,
          paidProjectConfirmed: true,
          imageGenerationApproved: true,
        },
      });
      expect(config.features.liveAnalysis).toBe(false);
      expect(config.admission.maxProcessDispatches).toBe(0);
      await request(application).get("/v1/health").expect(200);
      const response = await request(application)
        .get("/v1/sample/config")
        .expect(200);
      expect(response.body).toMatchObject({
        mode: "live",
        liveAnalysisEnabled: false,
        liveAssemblyEnabled: false,
        liveRenderEnabled: false,
      });
      expect(response.body).not.toHaveProperty("processingUnavailableReasons");
      expect(response.body).not.toHaveProperty("processingSiteKey");
      await request(application).post("/v1/analysis/run").send({}).expect(404);
      await request(application)
        .post("/v1/admission/grant")
        .send({})
        .expect(404);
      expect(google).toHaveBeenCalledTimes(0);
      expect(media).toHaveBeenCalledTimes(0);
      expect(challenge).toHaveBeenCalledTimes(0);
    } finally {
      google.mockRestore();
      media.mockRestore();
      challenge.mockRestore();
    }
  });

  it.each([undefined, "disabled", "analysis", "assembly", "render", "unknown"])(
    "enables the full paid flow regardless of the obsolete stage (%s)",
    (stage) => {
      const config = loadConfig({
        ...createLiveValidationEnvironment(),
        PAID_VALIDATION_STAGE: stage,
      });
      expect(config.features).toMatchObject({
        liveAnalysis: true,
        liveAssembly: true,
        liveRender: true,
        liveImageGeneration: true,
      });
      expect(config.admission).toMatchObject({
        grantsEnabled: true,
        maxProcessDispatches: 7,
      });
    },
  );

  it("advertises final export with complete synthetic setup and no stage setting", async () => {
    const environment = createLiveValidationEnvironment();
    delete environment.PAID_VALIDATION_STAGE;
    const config = loadConfig(environment);
    expect(config.features).toMatchObject({
      liveAnalysis: true,
      liveAssembly: true,
      liveRender: true,
      liveImageGeneration: true,
    });
    expect(config.processingUnavailableReasons).toEqual([]);
    const { application } = composeBackend(environment);
    const response = await request(application)
      .get("/v1/sample/config")
      .expect(200);
    expect(response.body).toMatchObject({
      liveAnalysisEnabled: true,
      liveAssemblyEnabled: true,
      liveRenderEnabled: true,
    });
  });

  it.each([undefined, "false", "true"])(
    "makes paid-off dominate every approval value (%s), connection and stage",
    (value) => {
      const config = loadConfig({
        ...createLiveValidationEnvironment(),
        ...retained,
        PAID_DEMO_ENABLED: "false",
        PAID_VALIDATION_STAGE: "render",
        ...Object.fromEntries(approvals.map((key) => [key, value])),
      });
      expect(config).toMatchObject({
        providerMode: "live",
        paidDemoEnabled: false,
        renderer: { spendApproved: false, environment: "disabled" },
        gemini: {
          transferApproved: false,
          paidProjectConfirmed: false,
          imageGenerationApproved: false,
        },
        retainedSample: { enabled: false },
      });
      expect(config.features).toMatchObject({
        liveAnalysis: false,
        liveAssembly: false,
        liveRender: false,
        liveImageGeneration: false,
      });
      expect(config.admission).toMatchObject({
        grantsEnabled: false,
        maxProcessDispatches: 0,
      });
      expect(composeAdmission(config)).toBeNull();
    },
  );

  it.each([
    "CLOUD_SPEND_APPROVED",
    "GEMINI_TRANSFER_APPROVED",
    "GEMINI_PAID_PROJECT_CONFIRMED",
  ])("honors an explicit %s=false", (key) => {
    const config = loadConfig({
      ...createLiveValidationEnvironment(),
      [key]: "false",
    });
    expect(config.features.liveAnalysis).toBe(false);
    expect(config.admission.maxProcessDispatches).toBe(0);
    expect(composeAdmission(config)).toBeNull();
  });

  it("lets image approval disable generation while retaining assembly", () => {
    const config = loadConfig({
      ...createLiveValidationEnvironment(),
      PAID_VALIDATION_STAGE: "assembly",
      GEMINI_IMAGE_GENERATION_APPROVED: "false",
    });
    expect(config.features).toMatchObject({
      liveAssembly: true,
      liveImageGeneration: false,
    });
    expect(config.features.liveRender).toBe(true);
    expect(config.admission.maxProcessDispatches).toBe(4);
    expect(config.gemini.imageGenerationApproved).toBe(false);
  });

  it.each([
    "GEMINI_API_KEY",
    "PROCESSING_GRANT_KEY",
    "TURNSTILE_SITE_KEY",
    "TURNSTILE_SECRET_KEY",
    "PRIVATE_RENDERER_ORIGIN",
    "TURNSTILE_EXPECTED_HOSTNAME",
  ])("leaves local processing unavailable without %s", (key) => {
    const environment = createLiveValidationEnvironment();
    delete environment[key];
    const config = loadConfig(environment);
    expect(config.features.liveAnalysis).toBe(false);
    expect(config.admission.maxProcessDispatches).toBe(0);
    expect(composeAdmission(config)).toBeNull();
  });

  it("keeps retained playback when only AI prerequisites are missing and paid is on", () => {
    const config = loadConfig(retained);
    expect(config.retainedSample.enabled).toBe(true);
    expect(config.features.liveAnalysis).toBe(false);
    expect(config.admission.maxProcessDispatches).toBe(0);
  });

  it("selects the fixed grant key ID and migrates the legacy key without exposing it", () => {
    const existingKey = Buffer.alloc(32, 9).toString("base64url");
    for (const legacy of [JSON.stringify({ v1: existingKey }), existingKey]) {
      const environment = createLiveValidationEnvironment();
      delete environment.PROCESSING_GRANT_KEY;
      environment.PROCESSING_GRANT_KEYS_JSON = legacy;
      environment.PROCESSING_GRANT_ACTIVE_KEY_ID = "obsolete";
      const config = loadConfig(environment);
      expect(config.session.processingGrantKey).toBe(existingKey);
      expect(
        composeAdmission(config)!
          .issue("http://localhost:3000", "same-origin")
          .cookie.split(".")[0],
      ).toBe("v1");
    }
    const environment = createLiveValidationEnvironment();
    environment.PROCESSING_GRANT_KEYS_JSON = "invalid-obsolete-entry";
    expect(loadConfig(environment).session.processingGrantKey).toBe(
      environment.PROCESSING_GRANT_KEY,
    );
    for (const key of [
      "not-a-key",
      "A".repeat(42) + "B",
      JSON.stringify({ v1: "not-a-key" }),
    ]) {
      const config = loadConfig({ ...environment, PROCESSING_GRANT_KEY: key });
      expect(config.processingUnavailableReasons).toContain(
        "grant_key_invalid",
      );
      expect(composeAdmission(config)).toBeNull();
    }
  });

  it("rejects structural errors, conflicting modes and public live composition", () => {
    for (const overrides of [
      { FAKE_MODE: "true" },
      { PAID_DEMO_ENABLED: "invalid" },
      { FAKE_MODE: "invalid" },
      { GEMINI_API_KEY: "x".repeat(1025) },
      { PORT: "0" },
      { NODE_ENV: "test" },
      { FRONTEND_ORIGIN: "invalid" },
      { GEMINI_IMAGE_GENERATION_APPROVED: "maybe" },
      { APP_ENV: "preview" },
    ])
      expect(() =>
        loadConfig({ ...createLiveValidationEnvironment(), ...overrides }),
      ).toThrow();
    expect(() => loadConfig({ PROVIDER_MODE: "fake" })).toThrow();
    expect(() =>
      loadConfig({ NODE_ENV: "production", APP_ENV: "production" }),
    ).toThrow();
    expect(() =>
      loadConfig({
        NODE_ENV: "production",
        APP_ENV: "production",
        CLIPBUILDER_UNKNOWN: "true",
      }),
    ).toThrow("Unknown ClipBuilder-prefixed");
  });

  it("keeps tests explicit, fake, paid-off and credential-free", () => {
    const config = loadConfig(createSafeTestEnvironment());
    expect(config).toMatchObject({
      providerMode: "fake",
      paidDemoEnabled: false,
      gemini: { apiKey: null, imageGenerationApproved: false },
    });
    expect(Object.values(config.features).filter(Boolean)).toEqual([true]);
    for (const overrides of [
      { PROVIDER_MODE: "live" },
      { PAID_DEMO_ENABLED: "true" },
      { LIVE_ANALYSIS_ENABLED: "true" },
      { GEMINI_API_KEY: "synthetic-key" },
      { PROCESSING_GRANT_KEY: Buffer.alloc(32, 7).toString("base64url") },
      { PROCESSING_GRANT_KEYS_JSON: "unused-legacy-secret" },
    ])
      expect(() => loadConfig(createSafeTestEnvironment(overrides))).toThrow();
  });

  it("retains fixed limits and rejects capability and numerical overrides", () => {
    const config = loadConfig({});
    expect(config.limits.sourceBytes).toBe(PUBLIC_LIMITS.maxSourceBytes);
    expect(config.limits.sourceSeconds).toBe(PUBLIC_LIMITS.maxSourceSeconds);
    for (const overrides of [
      { MAX_SOURCE_BYTES: "1" },
      { MAX_SOURCE_BYTES: "524288001" },
      { RATE_GRANT_MAX: "0" },
      { GEMINI_TIMEOUT_MS: "1000" },
      { LIVE_UPLOAD_ENABLED: "true" },
      { LIVE_RENDER_ENABLED: "true" },
      { RETAINED_SAMPLE_ENABLED: "true" },
    ])
      expect(() => loadConfig(overrides)).toThrow();
  });

  it("documents real defaults and leaves every credential and private identifier blank", () => {
    const values = Object.fromEntries(
      readFileSync(new URL("../../.env.example", import.meta.url), "utf8")
        .split(/\r?\n/u)
        .filter((line) => /^[A-Z0-9_]+=/.test(line))
        .map((line) => [
          line.slice(0, line.indexOf("=")),
          line.slice(line.indexOf("=") + 1),
        ]),
    );
    expect(values).toMatchObject({
      FAKE_MODE: "false",
      PAID_DEMO_ENABLED: "true",
    });
    expect(Object.keys(values).sort()).toEqual([...ENVIRONMENT_KEYS].sort());
    for (const key of approvals) expect(values[key]).toBe("true");
    for (const key of [
      "BACKEND_AUDIENCE",
      "PRIVATE_RENDERER_ORIGIN",
      "TURNSTILE_EXPECTED_HOSTNAME",
      ...Object.keys(retained),
      "GEMINI_API_KEY",
      "TURNSTILE_SITE_KEY",
      "TURNSTILE_SECRET_KEY",
      "PROCESSING_GRANT_KEY",
    ])
      expect(values[key]).toBe("");
  });
});

it.each([undefined, "", "   "])(
  "defaults a blank private owner allowlist to no exemptions (%s)",
  (value) => {
    const config = loadConfig({
      ...createSafeTestEnvironment(),
      HOSTED_DEMO_OWNER_IPS: value,
    });
    expect(config.admission.demoOwnerIps).toEqual([]);
  },
);
it("parses a bounded private IP list without exposing it in public configuration", async () => {
  const environment = {
    ...createSafeTestEnvironment(),
    HOSTED_DEMO_OWNER_IPS: " 192.0.2.10 , 2001:db8::a , ::ffff:192.0.2.10 ",
  };
  const { application, config } = composeBackend(environment);
  expect(config.admission.demoOwnerIps).toEqual([
    "192.0.2.10",
    "2001:db8::a",
    "::ffff:192.0.2.10",
  ]);
  const response = await request(application)
    .get("/v1/sample/config")
    .expect(200);
  const text = JSON.stringify(response.body);
  expect(text).not.toContain("192.0.2.10");
  expect(text).not.toContain("2001:db8");
  expect(text).not.toContain("demoOwnerIps");
  expect(text).not.toContain("HOSTED_DEMO_OWNER_IPS");
});
it.each([
  "*",
  "192.0.2.0/24",
  "example.test",
  "192.0.2.1:3000",
  "192.0.2.1,",
  "192.0.2.1,,192.0.2.2",
  "fe80::1%eth0",
  Array(33).fill("192.0.2.1").join(","),
  "x".repeat(4097),
])("rejects malformed or oversized private owner lists (%s)", (value) => {
  expect(() =>
    loadConfig({
      ...createSafeTestEnvironment(),
      HOSTED_DEMO_OWNER_IPS: value,
    }),
  ).toThrow();
});
