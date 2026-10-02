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
  it("keeps tests/defaults disabled and allows approved cloud compute with fake AI", () => {
    const identity = {
      async authorization() {
        throw Error("must not run");
      },
    };
    expect(() => new CloudRendererClient(loadConfig({}), identity)).toThrow(
      "disabled",
    );
    expect(() =>
      loadConfig({
        NODE_ENV: "test",
        CLOUD_RENDER_ENVIRONMENT: "cloud",
        CLOUD_SPEND_APPROVED: "true",
        PRIVATE_RENDERER_ORIGIN: "https://synthetic.run.app",
      }),
    ).toThrow();
    const config = loadConfig({
      CLOUD_RENDER_ENVIRONMENT: "cloud",
      CLOUD_SPEND_APPROVED: "true",
      PRIVATE_RENDERER_ORIGIN: "https://synthetic.run.app",
    });
    expect(config.providerMode).toBe("fake");
    expect(config.paidDemoEnabled).toBe(false);
  });
  it("uses exact private paths, validates replies and sends both identity headers once", async () => {
    const config = loadConfig({
      CLOUD_RENDER_ENVIRONMENT: "cloud",
      CLOUD_SPEND_APPROVED: "true",
      PRIVATE_RENDERER_ORIGIN: "https://synthetic.run.app",
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
      "unavailable",
    );
    expect({ identities, requests }).toEqual({ identities: 1, requests: 1 });
  });
  it("redacts malformed/private provider responses", async () => {
    const config = loadConfig({
      CLOUD_RENDER_ENVIRONMENT: "cloud",
      CLOUD_SPEND_APPROVED: "true",
      PRIVATE_RENDERER_ORIGIN: "https://synthetic.run.app",
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
    ).rejects.toThrow("renderer_unavailable");
  });
});
