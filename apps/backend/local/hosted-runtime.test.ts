import { expect, it } from "vitest";
import { loadConfig } from "../src/config/loadConfig.ts";
import {
  hostedEditingReady,
  startHostedEditingWorkflow,
} from "./hosted-runtime.ts";
it("does not start native or provider composition in test/fake/paid-off/local/preview modes", async () => {
  const fake = loadConfig({
    NODE_ENV: "test",
    APP_ENV: "preview",
    FAKE_MODE: "true",
    PAID_DEMO_ENABLED: "false",
  });
  expect(hostedEditingReady(fake)).toBe(false);
  expect(await startHostedEditingWorkflow(fake)).toBeNull();
  const ready = {
    ...fake,
    nodeEnv: "production" as const,
    appEnv: "production" as const,
    providerMode: "live" as const,
    paidDemoEnabled: true,
    publicPaidProcessingApproved: true,
    admission: {
      ...fake.admission,
      demoIpVerified: true,
      demoLedgerBucket: "synthetic-demo-ledger",
      grantsEnabled: true,
      maxProcessDispatches: 7,
    },
    features: {
      ...fake.features,
      liveAnalysis: true,
      liveAssembly: true,
      liveRender: true,
      liveImageGeneration: true,
    },
    session: {
      ...fake.session,
      processingGrantKey: "synthetic-demo-key".repeat(4),
    },
    renderer: { ...fake.renderer, spendApproved: true },
    gemini: {
      ...fake.gemini,
      apiKey: "synthetic-key",
      transferApproved: true,
      paidProjectConfirmed: true,
      imageGenerationApproved: true,
    },
    turnstile: {
      ...fake.turnstile,
      siteKey: "synthetic-site",
      secretKey: "synthetic-secret",
      expectedHostname: "synthetic.invalid",
    },
  };
  expect(hostedEditingReady(ready)).toBe(true);
  for (const current of [
    { ...ready, nodeEnv: "test" as const },
    { ...ready, appEnv: "local" as const },
    { ...ready, appEnv: "preview" as const },
    { ...ready, paidDemoEnabled: false },
    { ...ready, publicPaidProcessingApproved: false },
    { ...ready, providerMode: "fake" as const },
    { ...ready, admission: { ...ready.admission, demoIpVerified: false } },
    { ...ready, admission: { ...ready.admission, demoLedgerBucket: null } },
    { ...ready, gemini: { ...ready.gemini, apiKey: null } },
    { ...ready, renderer: { ...ready.renderer, spendApproved: false } },
  ])
    expect(hostedEditingReady(current)).toBe(false);
});
