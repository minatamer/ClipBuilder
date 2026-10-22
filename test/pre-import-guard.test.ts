import net from "node:net";
import { describe, expect, it, vi } from "vitest";

import {
  environmentObservedDuringImport,
  credentialKeysObservedDuringImport,
  fetchFailureObservedDuringImport,
} from "./pre-import-guard.fixture.js";
import { connectionHost } from "./no-network.setup.js";

describe("pre-import deterministic safety", () => {
  it("removes inherited credentials before test modules load", () => {
    expect(credentialKeysObservedDuringImport).toEqual([]);
  });

  it("keeps the socket guard installed when a test restores mocks", () => {
    const guardedConnect = net.Socket.prototype.connect;
    vi.restoreAllMocks();
    expect(net.Socket.prototype.connect).toBe(guardedConnect);
    const socket = new net.Socket();
    try {
      expect(() =>
        socket.connect({ host: "pre-import-network-guard.invalid", port: 443 }),
      ).toThrow("Unexpected network access");
    } finally {
      socket.destroy();
    }
  });

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
      APP_ENV: "local",
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
      GEMINI_TRANSFER_APPROVED: "false",
      GEMINI_IMAGE_GENERATION_APPROVED: "false",
      GEMINI_PAID_PROJECT_CONFIRMED: "false",
      RENDERER_ENABLED: "false",
      PUBLIC_PAID_PROCESSING_APPROVED: "false",
      OWNER_PROVIDER_APPROVED: "false",
    });
  });

  it("blocks fetch before a test module can make a real request", async () => {
    await expect(fetchFailureObservedDuringImport).resolves.toBe(
      "Unexpected fetch during deterministic test",
    );
  });
});
