import { expect, it } from "vitest";
import { nativeEnvironment } from "./local-mode.ts";
import { localProviderReadiness } from "./provider-readiness.ts";
import { loadConfig } from "../src/config/loadConfig.js";
import { createYtDlpAcquisitionPort } from "./yt-dlp-acquisition.ts";
const approved = {
  NODE_ENV: "development",
  APP_ENV: "local",
  FAKE_MODE: "false",
  PAID_DEMO_ENABLED: "true",
  GEMINI_API_KEY: "synthetic-test-key",
};
it("uses the normal config without a second provider flag or cloud renderer prerequisite", () => {
  const readiness = localProviderReadiness(loadConfig(approved));
  expect(readiness.ready).toBe(true);
  if (!readiness.ready) throw new Error("test_readiness_missing");
  expect(readiness.config.gemini.model).toBe("gemini-3.8-flash");
  expect(readiness.config.gemini.timeoutMs).toBe(180_000);
  for (const change of [
    { GEMINI_API_KEY: undefined },
    { FAKE_MODE: "true", PAID_DEMO_ENABLED: "false" },
    { PAID_DEMO_ENABLED: "false" },
    {
      NODE_ENV: "test",
      FAKE_MODE: "true",
      PAID_DEMO_ENABLED: "false",
      GEMINI_API_KEY: undefined,
    },
    ...[
      "CLOUD_SPEND_APPROVED",
      "GEMINI_TRANSFER_APPROVED",
      "GEMINI_IMAGE_GENERATION_APPROVED",
      "GEMINI_PAID_PROJECT_CONFIRMED",
    ].map((key) => ({ [key]: "false" })),
  ])
    expect(
      localProviderReadiness(loadConfig({ ...approved, ...change })),
    ).toEqual({ ready: false });
});
it("constructs acquisition independently of fake AI and strips worker credentials", () => {
  const port = createYtDlpAcquisitionPort({
    scratchRoot: "unused-scratch",
    tools: {
      downloader: "unused",
      challenge: "unused",
      challengeExecutableSha256: "a".repeat(64),
      systemRoot: "unused",
    },
  });
  expect(port.mode).toBe("provider-source");
  const native = nativeEnvironment("unused-scratch");
  expect(native.FAKE_MODE).toBe("true");
  expect(native.PAID_DEMO_ENABLED).toBe("false");
  for (const key of [
    "GEMINI_API_KEY",
    "GOOGLE_APPLICATION_CREDENTIALS",
    "NODE_OPTIONS",
    "HTTPS_PROXY",
    "OWNER_PROVIDER_APPROVED",
  ])
    expect(native[key]).toBeUndefined();
});
