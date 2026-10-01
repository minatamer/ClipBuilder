import { once } from "node:events";
import { request } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createFeasibilityServer } from "./server.mjs";

const server = createFeasibilityServer();
let port;

function read(path, method = "GET") {
  return new Promise((resolve, reject) => {
    const outgoing = request(
      { host: "127.0.0.1", port, path, method },
      (incoming) => {
        const chunks = [];
        incoming.on("data", (chunk) => chunks.push(chunk));
        incoming.on("error", reject);
        incoming.on("end", () =>
          resolve({
            status: incoming.statusCode,
            headers: incoming.headers,
            body: Buffer.concat(chunks).toString("utf8"),
          }),
        );
      },
    );
    outgoing.on("error", reject);
    outgoing.end();
  });
}

beforeAll(async () => {
  expect(server.listening).toBe(false);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  port = server.address().port;
});

afterAll(async () => {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

describe("synthetic feasibility server", () => {
  it("serves the fixed harness with isolated, local-only delivery", async () => {
    const response = await read("/");
    expect(response.status).toBe(200);
    expect(response.body).toContain("CL-005 local media feasibility");
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.headers["cross-origin-opener-policy"]).toBe("same-origin");
    expect(response.headers["cross-origin-embedder-policy"]).toBe(
      "require-corp",
    );
    expect(response.headers["content-security-policy"]).toContain(
      "connect-src 'self'",
    );
  });

  it("resolves the installed media bundle without a machine-specific path", async () => {
    const response = await read("/mediabunny.mjs");
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toBe("text/javascript");
    expect(response.body).toContain("Mediabunny");
  });

  it.each([
    "/.env.local",
    "/../../.env.local",
    "/worker.mjs?file=source.mp4",
    "/source.mp4",
  ])("refuses non-allowlisted target %s", async (path) => {
    expect(await read(path)).toMatchObject({ status: 404, body: "" });
  });

  it("has no upload or media write endpoint", async () => {
    expect(await read("/", "POST")).toMatchObject({ status: 404, body: "" });
  });
});
