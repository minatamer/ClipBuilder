import {
  createServer,
  request,
  type Server,
  type RequestListener,
} from "node:http";
import { Buffer } from "node:buffer";
import { afterEach, expect, it } from "vitest";
import { OWNER_LIMITS } from "../../../../packages/contracts/local/policy.ts";
import { LOCAL_CODEX_POLICY } from "../../../../packages/contracts/local/codex.ts";
import { fetchLocalAi, localAiRequestPath } from "./local-ai-request";

const servers: Server[] = [];
const id = "00000000-0000-4000-8000-000000000001";
const path = ["workspace", id, "analysis"];
afterEach(async () => {
  for (const server of servers.splice(0)) {
    server.closeAllConnections();
    await new Promise<void>((done) => server.close(() => done()));
  }
});
async function transportFor(listener: RequestListener) {
  const server = createServer(listener);
  servers.push(server);
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("test_address");
  const transport: NonNullable<Parameters<typeof fetchLocalAi>[2]> = (
    options,
    callback,
  ) => {
    expect(options.hostname).toBe("127.0.0.1");
    expect(options.port).toBe(4000);
    expect(options.path).toBe(`/v1/local/workspace/${id}/analysis`);
    return request({ ...options, port: address.port }, callback);
  };
  return transport;
}
it("admits only local analysis, caption and visual discovery POST paths", () => {
  expect(localAiRequestPath("POST", path)).toBe(true);
  expect(
    localAiRequestPath("POST", ["workspace", id, "clips", id, "captions"]),
  ).toBe(true);
  expect(
    localAiRequestPath("POST", ["workspace", id, "clips", id, "visuals"]),
  ).toBe(true);
  expect(
    localAiRequestPath("GET", ["workspace", id, "clips", id, "visuals"]),
  ).toBe(false);
  for (const candidate of [
    ["workspace", "../", "analysis"],
    ["workspace", id, "source"],
    ["agent", "status"],
    ["workspace", id, "analysis", "extra"],
  ])
    expect(localAiRequestPath("POST", candidate)).toBe(false);
  expect(localAiRequestPath("GET", path)).toBe(false);
});
it("waits for local CPU work, forwards bounded JSON and private headers, then closes its socket", async () => {
  const transport = await transportFor((incoming, response) => {
    expect(incoming.headers.authorization).toBe("Bearer synthetic-private");
    const chunks: Buffer[] = [];
    incoming.on("data", (part: Buffer) => chunks.push(part));
    incoming.on("end", () => {
      expect(Buffer.concat(chunks).toString()).toBe('{"synthetic":true}');
      setTimeout(() => {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end('{"done":true}');
      }, 20);
    });
  });
  const response = await fetchLocalAi(
    path,
    {
      method: "POST",
      body: '{"synthetic":true}',
      headers: { Authorization: "Bearer synthetic-private" },
      signal: AbortSignal.timeout(2000),
    },
    transport,
  );
  expect(await response.json()).toEqual({ done: true });
  expect(response.headers.get("content-type")).toBe("application/json");
});
it("rejects oversized input before dispatch and caps the response", async () => {
  let calls = 0;
  const transport = await transportFor((_incoming, response) => {
    calls++;
    response.end(Buffer.alloc(LOCAL_CODEX_POLICY.artifactBytes + 1));
  });
  await expect(
    fetchLocalAi(
      path,
      { method: "POST", body: "x".repeat(OWNER_LIMITS.jsonBytes + 1) },
      transport,
    ),
  ).rejects.toThrow("local_ai_request_large");
  expect(calls).toBe(0);
  await expect(
    fetchLocalAi(
      path,
      { method: "POST", signal: AbortSignal.timeout(2000) },
      transport,
    ),
  ).rejects.toThrow("local_ai_response_large");
  expect(calls).toBe(1);
});
it("aborts a pending local computation request without waiting for headers", async () => {
  const transport = await transportFor(() => {});
  const controller = new AbortController();
  const result = fetchLocalAi(
    path,
    { method: "POST", signal: controller.signal },
    transport,
  );
  controller.abort();
  await expect(result).rejects.toThrow("local_ai_request_unavailable");
});
