import { expect, it } from "vitest";
import {
  nativeEnvironment,
  ownerLaunchMode,
  ownerProviderEnvironment,
} from "./local-mode.ts";
import { readOwnerProviderReadiness } from "./provider-readiness.ts";

const approved: NodeJS.ProcessEnv = {
  NODE_ENV: "development",
  APP_ENV: "local",
  FAKE_MODE: "false",
  PAID_DEMO_ENABLED: "true",
  OWNER_PROVIDER_APPROVED: "true",
  CLOUD_SPEND_APPROVED: "true",
  GEMINI_TRANSFER_APPROVED: "true",
  GEMINI_IMAGE_GENERATION_APPROVED: "true",
  GEMINI_PAID_PROJECT_CONFIRMED: "true",
  GEMINI_API_KEY: "synthetic-test-key",
};

it("requires an explicit separate local development provider command and owner master approval", () => {
  expect(
    ownerLaunchMode({ FAKE_MODE: "true", PAID_DEMO_ENABLED: "false" }, []),
  ).toBe("fake");
  expect(ownerLaunchMode(approved, ["--provider"])).toBe("provider");
  expect(() => ownerLaunchMode(approved, [])).toThrow(
    "owner_fake_mode_required",
  );
  for (const change of [
    { NODE_ENV: "test" },
    { NODE_ENV: "production" },
    { NODE_ENV: undefined },
    { APP_ENV: "preview" },
    { OWNER_PROVIDER_APPROVED: undefined },
    { OWNER_PROVIDER_APPROVED: "false" },
    { FAKE_MODE: "true" },
    { PAID_DEMO_ENABLED: "false" },
  ])
    expect(() =>
      ownerLaunchMode({ ...approved, ...change }, ["--provider"]),
    ).toThrow("owner_provider_mode_required");
  expect(() => ownerLaunchMode(approved, ["--provider", "--extra"])).toThrow(
    "owner_mode_invalid",
  );
});

it("leaves optional provider ports unavailable until every explicit prerequisite is complete", () => {
  for (const key of [
    "GEMINI_API_KEY",
    "CLOUD_SPEND_APPROVED",
    "GEMINI_TRANSFER_APPROVED",
    "GEMINI_IMAGE_GENERATION_APPROVED",
    "GEMINI_PAID_PROJECT_CONFIRMED",
  ] as const) {
    expect(
      readOwnerProviderReadiness({ ...approved, [key]: undefined }),
    ).toEqual({ ready: false });
    if (key !== "GEMINI_API_KEY")
      expect(
        readOwnerProviderReadiness({ ...approved, [key]: "false" }),
      ).toEqual({ ready: false });
  }
  expect(() =>
    readOwnerProviderReadiness({
      ...approved,
      GEMINI_TRANSFER_APPROVED: "fake",
    }),
  ).toThrow("owner_provider_config_invalid");
  const readiness = readOwnerProviderReadiness({
    ...approved,
    GEMINI_MODEL: "unapproved-model",
    GEMINI_TIMEOUT_MS: "1",
    PRIVATE_RENDERER_ORIGIN: "https://not-used.invalid",
    LIVE_RENDER_ENABLED: "true",
  });
  expect(readiness.ready).toBe(true);
  if (!readiness.ready) throw new Error("test_readiness_missing");
  expect(readiness.config.gemini.model).toBe("gemini-3.8-flash");
  expect(readiness.config.gemini.timeoutMs).toBe(180_000);
  expect(readiness.config.features).toEqual({
    liveAnalysis: true,
    liveAssembly: true,
  });
  expect(readiness.config).not.toHaveProperty("renderer");
});

it("passes only the Gemini allowlist to the provider host and keeps native children paid-off", () => {
  const host = ownerProviderEnvironment("owned-scratch", {
    ...approved,
    GOOGLE_APPLICATION_CREDENTIALS: "not-forwarded",
    GOOGLE_GENAI_USE_VERTEXAI: "true",
    GOOGLE_GEMINI_BASE_URL: "https://not-used.invalid",
    HTTPS_PROXY: "https://not-used.invalid",
    NODE_OPTIONS: "not-forwarded",
    PROCESSING_GRANT_KEY: "not-forwarded",
  });
  expect(host.GEMINI_API_KEY).toBe(approved.GEMINI_API_KEY);
  expect(host.OWNER_PROVIDER_APPROVED).toBe("true");
  expect(host.CLOUD_RENDER_ENVIRONMENT).toBe("disabled");
  expect(host.LIVE_RENDER_ENABLED).toBe("false");
  for (const key of [
    "GOOGLE_APPLICATION_CREDENTIALS",
    "GOOGLE_GENAI_USE_VERTEXAI",
    "GOOGLE_GEMINI_BASE_URL",
    "HTTPS_PROXY",
    "NODE_OPTIONS",
    "PROCESSING_GRANT_KEY",
  ])
    expect(host[key]).toBeUndefined();
  const native = nativeEnvironment("owned-scratch");
  expect(native.GEMINI_API_KEY).toBeUndefined();
  expect(native.OWNER_PROVIDER_APPROVED).toBeUndefined();
  expect(native.FAKE_MODE).toBe("true");
  expect(native.PAID_DEMO_ENABLED).toBe("false");
});
