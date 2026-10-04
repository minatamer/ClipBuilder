import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { PUBLIC_LIMITS } from "@clipbuilder/contracts";
import {
  createSafeTestEnvironment,
  createLiveValidationEnvironment,
  createLiveValidationSettings,
} from "../../test/environment.fixture.js";
import { ENVIRONMENT_KEYS } from "./env.schema.js";
import { loadConfig } from "./loadConfig.js";
import { composeAdmission } from "../admission/admission.composition.js";
import { composeBackend } from "../composition.js";
import * as gemini from "../analysis/gemini.adapter.js";
import * as renderer from "../media/renderer.cloudrun.js";
import * as turnstile from "../admission/turnstile.verifier.js";

describe("backend configuration", () => {
  it("starts the local real-mode app with incomplete paid setup and zero metered boundaries", async () => {
    const google = vi.spyOn(gemini, "composeGeminiTransport");
    const media = vi.spyOn(renderer, "rendererIdentity");
    const challenge = vi.spyOn(turnstile, "composeAbuseVerifier");
    try {
      const { application, config } = composeBackend(
        {
          NODE_ENV: "development",
          FAKE_MODE: "false",
          PAID_DEMO_ENABLED: "true",
        },
        { paidValidationStage: "analysis" },
      );
      expect(config.providerMode).toBe("live");
      expect(config.paidDemoEnabled).toBe(true);
      expect(config.features.liveAnalysis).toBe(false);
      expect(config.admission.maxProcessDispatches).toBe(0);
      await request(application).get("/v1/health").expect(200);
      const response = await request(application)
        .get("/v1/sample/config")
        .expect(200);
      expect(response.body).toMatchObject({
        mode: "live",
        sampleEnabled: false,
        localMediaEnabled: true,
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

  it("issues grants with the code-selected key despite an obsolete environment selector", () => {
    const config = loadConfig(
      {
        ...createLiveValidationEnvironment(),
        PROCESSING_GRANT_ACTIVE_KEY_ID: "legacy",
        PROCESSING_GRANT_KEY: Buffer.alloc(32, 9).toString("base64url"),
      },
      createLiveValidationSettings(),
    );
    expect(config.session.processingGrantActiveKeyId).toBe("v1");
    const admission = composeAdmission(config);
    expect(admission).not.toBeNull();
    const issued = admission!.issue("http://localhost:3000", "same-origin");
    expect(issued.cookie.split(".")[0]).toBe("v1");
  });

  it("migrates the existing grant entry and prefers an explicit plain key", () => {
    const existingKey = Buffer.alloc(32, 9).toString("base64url");
    for (const legacy of [JSON.stringify({ v1: existingKey }), existingKey]) {
      const environment = createLiveValidationEnvironment();
      delete environment.PROCESSING_GRANT_KEY;
      environment.PROCESSING_GRANT_KEYS_JSON = legacy;
      const config = loadConfig(environment, createLiveValidationSettings());
      expect(config.session.processingGrantKey).toBe(existingKey);
      expect(config.processingUnavailableReasons).toEqual([]);
      const admission = composeAdmission(config)!;
      const issued = admission.issue("http://localhost:3000", "same-origin");
      expect(issued.cookie.split(".")[0]).toBe("v1");
    }
    const environment = createLiveValidationEnvironment();
    environment.PROCESSING_GRANT_KEYS_JSON = "invalid-obsolete-entry";
    expect(
      loadConfig(environment, createLiveValidationSettings()).session
        .processingGrantKey,
    ).toBe(environment.PROCESSING_GRANT_KEY);
    environment.PROCESSING_GRANT_KEY = "";
    expect(
      loadConfig(environment, createLiveValidationSettings()).features
        .liveAnalysis,
    ).toBe(false);
  });

  it.each([
    ["analysis", 2, false, false],
    ["assembly", 3, true, false],
    ["render", 4, true, true],
  ] as const)(
    "derives bounded capabilities for approved %s validation",
    (stage, dispatches, assembly, render) => {
      const config = loadConfig(
        createLiveValidationEnvironment(),
        createLiveValidationSettings(stage),
      );
      expect(config.features).toMatchObject({
        liveAnalysis: true,
        liveAssembly: assembly,
        liveRender: render,
        liveImageGeneration: false,
      });
      expect(config.admission).toMatchObject({
        grantsEnabled: true,
        maxProcessDispatches: dispatches,
      });
    },
  );

  it("keeps the paid kill switch authoritative over a recorded validation stage", () => {
    const config = loadConfig(
      { FAKE_MODE: "false", PAID_DEMO_ENABLED: "false" },
      createLiveValidationSettings("render"),
    );
    expect(config.features).toMatchObject({
      liveAnalysis: false,
      liveAssembly: false,
      liveRender: false,
    });
    expect(config.admission).toMatchObject({
      grantsEnabled: false,
      maxProcessDispatches: 0,
    });
    const unapproved = loadConfig(createLiveValidationEnvironment());
    expect(unapproved.features.liveAnalysis).toBe(false);
    expect(unapproved.admission.maxProcessDispatches).toBe(0);
    expect(unapproved.processingUnavailableReasons).toContain(
      "validation_stage_unapproved",
    );
  });

  it.each(["cloudSpend", "geminiTransfer", "paidProject"] as const)(
    "requires independent %s approval",
    (approval) => {
      const settings = createLiveValidationSettings();
      settings.approvals[approval] = false;
      const config = loadConfig(createLiveValidationEnvironment(), settings);
      expect(config.providerMode).toBe("live");
      expect(config.paidDemoEnabled).toBe(true);
      expect(config.features).toMatchObject({
        liveAnalysis: false,
        liveAssembly: false,
        liveRender: false,
      });
      expect(config.admission.maxProcessDispatches).toBe(0);
      expect(composeAdmission(config)).toBeNull();
    },
  );

  it.each([
    "GEMINI_API_KEY",
    "PROCESSING_GRANT_KEY",
    "TURNSTILE_SITE_KEY",
    "TURNSTILE_SECRET_KEY",
  ])("rejects enabled processing without %s", (key) => {
    const environment = createLiveValidationEnvironment();
    delete environment[key];
    const config = loadConfig(environment, createLiveValidationSettings());
    expect(config.features.liveAnalysis).toBe(false);
    expect(config.admission.maxProcessDispatches).toBe(0);
    expect(composeAdmission(config)).toBeNull();
  });

  it("requires renderer, abuse hostname, valid grant keys and local scope", () => {
    for (const overrides of [
      { rendererOrigin: "" },
      { turnstileHostname: "" },
      { rendererOrigin: "https://invalid.example.test" },
    ]) {
      const config = loadConfig(createLiveValidationEnvironment(), {
        ...createLiveValidationSettings(),
        ...overrides,
      });
      expect(config.features.liveAnalysis).toBe(false);
      expect(composeAdmission(config)).toBeNull();
    }
    expect(() =>
      loadConfig(createLiveValidationEnvironment(), {
        ...createLiveValidationSettings(),
        appEnvironment: "preview",
      }),
    ).toThrow();
    for (const overrides of [
      { PROCESSING_GRANT_KEY: "not-a-key" },
      { PROCESSING_GRANT_KEY: "A".repeat(42) + "B" },
      { PROCESSING_GRANT_KEY: JSON.stringify({ v1: "not-a-key" }) },
      { PROCESSING_GRANT_KEY: undefined, PROCESSING_GRANT_KEYS_JSON: "{}" },
      {
        PROCESSING_GRANT_KEY: undefined,
        PROCESSING_GRANT_KEYS_JSON: JSON.stringify({
          legacy: Buffer.alloc(32, 7).toString("base64url"),
        }),
      },
    ]) {
      const config = loadConfig(
        { ...createLiveValidationEnvironment(), ...overrides },
        createLiveValidationSettings(),
      );
      expect(config.features.liveAnalysis).toBe(false);
      expect(config.processingUnavailableReasons).toContain(
        "grant_key_invalid",
      );
      expect(composeAdmission(config)).toBeNull();
    }
  });

  it("keeps structural and conflicting configurations fatal during local startup", () => {
    for (const overrides of [
      { FAKE_MODE: "true" },
      { PAID_DEMO_ENABLED: "invalid" },
      { GEMINI_API_KEY: "x".repeat(1025) },
      { PORT: "0" },
      { NODE_ENV: "test" },
    ])
      expect(() =>
        loadConfig(
          { ...createLiveValidationEnvironment(), ...overrides },
          createLiveValidationSettings(),
        ),
      ).toThrow();
    expect(() =>
      loadConfig(createLiveValidationEnvironment(), {
        ...createLiveValidationSettings(),
        frontendOrigin: "invalid",
      }),
    ).toThrow();
  });

  it("preserves approved retained playback when only AI processing is unavailable", () => {
    const config = loadConfig(
      {
        NODE_ENV: "development",
        FAKE_MODE: "false",
        PAID_DEMO_ENABLED: "true",
      },
      {
        paidValidationStage: "analysis",
        approvals: { cloudSpend: true },
        retainedSample: {
          bucket: "synthetic-retained-bucket",
          object: "source/input.mp4",
          generation: "1",
          bytes: 8192,
        },
      },
    );
    expect(config.retainedSample.enabled).toBe(true);
    expect(config.features.liveAnalysis).toBe(false);
    expect(config.admission.maxProcessDispatches).toBe(0);
  });

  it("distinguishes filled secrets from missing runtime approvals and connections", () => {
    const config = loadConfig(createLiveValidationEnvironment(), {
      paidValidationStage: "analysis",
      approvals: { cloudSpend: true },
    });
    expect(config.processingUnavailableReasons).toEqual([
      "gemini_transfer_unapproved",
      "gemini_paid_project_unconfirmed",
      "turnstile_hostname_missing",
      "renderer_connection_missing",
    ]);
    expect(config.features.liveAnalysis).toBe(false);
    expect(composeAdmission(config)).toBeNull();
  });

  it("uses one mode authority with no live fallback", () => {
    expect(loadConfig({}).providerMode).toBe("fake");
    expect(loadConfig({ FAKE_MODE: "false" })).toMatchObject({
      providerMode: "live",
      paidDemoEnabled: false,
    });
    expect(() => loadConfig({ FAKE_MODE: "maybe" })).toThrow();
    expect(() =>
      loadConfig({ FAKE_MODE: "false", PROVIDER_MODE: "fake" }),
    ).toThrow();
    expect(() => loadConfig({ LIVE_UPLOAD_ENABLED: "true" })).toThrow();
    expect(() => loadConfig({ LIVE_RENDER_ENABLED: "true" })).toThrow();
    expect(() => loadConfig({ RETAINED_SAMPLE_ENABLED: "true" })).toThrow();
  });

  it("uses fake, paid-disabled, credential-free deterministic composition", () => {
    const config = loadConfig(createSafeTestEnvironment());
    expect(config.providerMode).toBe("fake");
    expect(config.paidDemoEnabled).toBe(false);
    expect(Object.values(config.features).filter(Boolean)).toEqual([true]);
    expect(config.gemini.apiKey).toBeNull();
    for (const overrides of [
      { PROVIDER_MODE: "live" },
      { PAID_DEMO_ENABLED: "true" },
      { LIVE_ANALYSIS_ENABLED: "true" },
      { GEMINI_API_KEY: "synthetic-key" },
      { PROCESSING_GRANT_KEY: Buffer.alloc(32, 7).toString("base64url") },
      {
        PROCESSING_GRANT_KEYS_JSON: JSON.stringify({
          v1: Buffer.alloc(32, 7).toString("base64url"),
        }),
      },
      {
        PROCESSING_GRANT_KEY: "",
        PROCESSING_GRANT_KEYS_JSON: "unused-legacy-secret",
      },
    ])
      expect(() => loadConfig(createSafeTestEnvironment(overrides))).toThrow();
    expect(() =>
      loadConfig(createSafeTestEnvironment(), createLiveValidationSettings()),
    ).toThrow();
  });

  it("fixes policy in code and rejects both lower and higher environment overrides", () => {
    const config = loadConfig({});
    expect(config.limits.sourceBytes).toBe(PUBLIC_LIMITS.maxSourceBytes);
    expect(config.limits.sourceSeconds).toBe(PUBLIC_LIMITS.maxSourceSeconds);
    for (const overrides of [
      { MAX_SOURCE_BYTES: "1" },
      { MAX_SOURCE_BYTES: "524288001" },
      { MAX_SOURCE_SECONDS: "1201" },
      { RATE_GRANT_MAX: "0" },
      { GEMINI_TIMEOUT_MS: "1000" },
    ])
      expect(() => loadConfig(overrides)).toThrow("Limits are fixed in code");
    expect(() => loadConfig({}, JSON.parse('{"maxSourceBytes":1}'))).toThrow();
  });

  it("fails closed for incomplete production configuration", () => {
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

  it("keeps the app example limited to two switches and blank credentials", () => {
    const definitions = readFileSync(
      new URL("../../.env.example", import.meta.url),
      "utf8",
    )
      .split(/\r?\n/u)
      .filter((line) => /^[A-Z0-9_]+=/.test(line))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator), line.slice(separator + 1)];
      });
    expect(definitions.map(([key]) => key).sort()).toEqual(
      [...ENVIRONMENT_KEYS].sort(),
    );
    const values = Object.fromEntries(definitions);
    expect(values.FAKE_MODE).toBe("true");
    expect(values.PAID_DEMO_ENABLED).toBe("false");
    ENVIRONMENT_KEYS.filter(
      (key) => !["FAKE_MODE", "PAID_DEMO_ENABLED"].includes(key),
    ).forEach((key) => expect(values[key]).toBe(""));
    const settings = JSON.parse(
      readFileSync(
        new URL("../../runtime.example.json", import.meta.url),
        "utf8",
      ),
    );
    expect(loadConfig({}, settings)).toEqual(loadConfig({}));
  });
});
