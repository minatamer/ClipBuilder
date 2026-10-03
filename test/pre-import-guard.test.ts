import { describe, expect, it } from "vitest";

import {
  environmentObservedDuringImport,
  fetchFailureObservedDuringImport,
} from "./pre-import-guard.fixture.js";
import { connectionHost } from "./no-network.setup.js";

describe("pre-import deterministic safety", () => {
  it("recognizes Node-normalized socket destinations without opening a socket", () => {
    const host = "network-must-not-be-contacted.invalid";
    expect(connectionHost([[{ host, port: 443 }, () => {}]])).toBe(host);
    expect(connectionHost([{ host, port: 443 }])).toBe(host);
    expect(connectionHost([443, host])).toBe(host);
    expect(connectionHost([[{ host: "127.0.0.1", port: 1234 }]])).toBe(
      "127.0.0.1",
    );
    expect(connectionHost([{ port: 1234 }])).toBeUndefined();
  });
  it("installs fake, paid-disabled configuration before test modules load", () => {
    expect(environmentObservedDuringImport).toMatchObject({
      NODE_ENV: "test",
      FAKE_MODE: "true",
      PROVIDER_MODE: "fake",
      PAID_DEMO_ENABLED: "false",
      PROCESSING_GRANTS_ENABLED: "false",
      ADMISSION_MAX_PROCESS_DISPATCHES: "0",
      LIVE_ANALYSIS_ENABLED: "false",
      LIVE_ASSEMBLY_ENABLED: "false",
      LIVE_RENDER_ENABLED: "false",
      LIVE_IMAGE_GENERATION_ENABLED: "false",
      CLOUD_RENDER_ENVIRONMENT: "disabled",
      CLOUD_SPEND_APPROVED: "false",
      RENDERER_ENABLED: "false",
      RENDERER_MAX_OPERATIONS: "0",
    });
  });

  it("blocks fetch before a test module can make a real request", async () => {
    await expect(fetchFailureObservedDuringImport).resolves.toBe(
      "Unexpected fetch during deterministic test",
    );
  });
});
