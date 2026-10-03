import { describe, expect, it } from "vitest";

import {
  environmentObservedDuringImport,
  fetchFailureObservedDuringImport,
} from "./pre-import-guard.fixture.js";

describe("pre-import deterministic safety", () => {
  it("installs fake, paid-disabled configuration before test modules load", () => {
    expect(environmentObservedDuringImport).toMatchObject({
      NODE_ENV: "test",
      PROVIDER_MODE: "fake",
      PAID_DEMO_ENABLED: "false",
      PROCESSING_GRANTS_ENABLED: "false",
      ADMISSION_MAX_PROCESS_DISPATCHES: "0",
      LIVE_ANALYSIS_ENABLED: "false",
      LIVE_ASSEMBLY_ENABLED: "false",
      LIVE_RENDER_ENABLED: "false",
      LIVE_IMAGE_GENERATION_ENABLED: "false",
    });
  });

  it("blocks fetch before a test module can make a real request", async () => {
    await expect(fetchFailureObservedDuringImport).resolves.toBe(
      "Unexpected fetch during deterministic test",
    );
  });
});
