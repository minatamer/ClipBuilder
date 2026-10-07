import { describe, expect, it } from "vitest";
import { loadConfig } from "../config/loadConfig.js";
import { CloudRendererClient } from "./renderer.cloudrun.js";
const input = {
  binding: {
    sessionId: "ses_" + "a".repeat(22),
    sourceRevision: "rev_" + "b".repeat(22),
    fingerprint: "a".repeat(64),
  },
  bytes: 1024,
  contentType: "video/mp4" as const,
  rightsAcknowledged: true as const,
  dataTransferAcknowledged: true as const,
};
describe("independent private cloud renderer boundary", () => {
  it("uses the configured hosted frontend origin for upload with exactly one private request", async () => {
    const origin = "https://synthetic-frontend.run.app";
    const config = loadConfig({
      PRIVATE_RENDERER_ORIGIN: "https://synthetic-renderer.run.app",
      FRONTEND_ORIGIN: origin,
    });
    let calls = 0;
    const client = new CloudRendererClient(
      config,
      { authorization: async () => "Bearer synthetic" },
      async (_url, options) => {
        calls++;
        expect(options?.headers).toMatchObject({ Origin: origin });
        expect(JSON.parse(String(options?.body))).toEqual(input);
        return Response.json({
          uploadUrl:
            "https://storage.googleapis.com/upload/storage/v1/b/synthetic/o?upload_id=synthetic",
          expiresAtMs: 9_000_000,
        });
      },
    );
    await client.upload(input, new AbortController().signal);
    expect(calls).toBe(1);
  });
  it("keeps fake and paid-off cloud boundaries disabled even with approval true", () => {
    const identity = {
      async authorization() {
        throw Error("must not run");
      },
    };
    expect(
      () =>
        new CloudRendererClient(
          loadConfig({ FAKE_MODE: "true", PAID_DEMO_ENABLED: "false" }),
          identity,
        ),
    ).toThrow("disabled");
    expect(
      loadConfig({
        NODE_ENV: "test",
        PRIVATE_RENDERER_ORIGIN: "https://synthetic.run.app",
        CLOUD_SPEND_APPROVED: "true",
        FAKE_MODE: "true",
        PAID_DEMO_ENABLED: "false",
      }).renderer.spendApproved,
    ).toBe(false);
    const config = loadConfig({
      PRIVATE_RENDERER_ORIGIN: "https://synthetic.run.app",
      CLOUD_SPEND_APPROVED: "true",
      FAKE_MODE: "true",
      PAID_DEMO_ENABLED: "false",
    });
    expect(config.providerMode).toBe("fake");
    expect(config.paidDemoEnabled).toBe(false);
    expect(() => new CloudRendererClient(config, identity)).toThrow("disabled");
  });
  it("uses exact private paths, validates replies and sends both identity headers once", async () => {
    const config = loadConfig({
      PRIVATE_RENDERER_ORIGIN: "https://synthetic.run.app",
      PAID_VALIDATION_STAGE: "disabled",
    });
    let identities = 0,
      requests = 0;
    const client = new CloudRendererClient(
      config,
      {
        async authorization() {
          identities++;
          return "Bearer synthetic-token";
        },
      },
      async (url, options) => {
        requests++;
        expect(url).toBe("https://synthetic.run.app/internal/upload");
        expect(options?.headers).toMatchObject({
          Authorization: "Bearer synthetic-token",
          "X-Serverless-Authorization": "Bearer synthetic-token",
          Origin: "http://localhost:3000",
        });
        return Response.json({
          uploadUrl:
            "https://storage.googleapis.com/upload/storage/v1/b/synthetic/o?upload_id=synthetic",
          expiresAtMs: 9_000_000,
        });
      },
    );
    await client.upload(input, new AbortController().signal);
    expect({ identities, requests }).toEqual({ identities: 1, requests: 1 });
    const canceled = new AbortController();
    canceled.abort();
    await expect(client.upload(input, canceled.signal)).rejects.toThrow(
      "CLIENT_ABORTED",
    );
    expect({ identities, requests }).toEqual({ identities: 1, requests: 1 });
  });
  it("redacts malformed/private provider responses", async () => {
    const config = loadConfig({
      PRIVATE_RENDERER_ORIGIN: "https://synthetic.run.app",
      PAID_VALIDATION_STAGE: "disabled",
    });
    const client = new CloudRendererClient(
      config,
      {
        async authorization() {
          return "Bearer synthetic";
        },
      },
      async () => Response.json({ payload: "synthetic-private-response" }),
    );
    await expect(
      client.upload(input, new AbortController().signal),
    ).rejects.toThrow("STORAGE_FAILED");
  });
});
