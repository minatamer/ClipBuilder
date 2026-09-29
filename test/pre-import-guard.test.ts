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
      LIVE_UPLOAD_ENABLED: "false",
      LIVE_ANALYSIS_ENABLED: "false",
      LIVE_ASSEMBLY_ENABLED: "false",
      LIVE_IMAGE_GENERATION_ENABLED: "false",
      LIVE_EDIT_ASSISTANT_ENABLED: "false",
      LIVE_RENDER_ENABLED: "false",
    });
  });

  it("blocks fetch before a test module can make a real request", async () => {
    await expect(fetchFailureObservedDuringImport).resolves.toBe(
      "Unexpected fetch during deterministic test",
    );
  });
});
