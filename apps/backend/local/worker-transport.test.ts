import { createServer, type Server } from "node:http";
import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import {
  nativeWorkerFetch,
  WORKER_RESPONSE_BYTES,
} from "./worker-transport.ts";
import { localWorkerPort } from "./worker-port.ts";
import { OWNER_LIMITS } from "../../../packages/contracts/local/policy.ts";

const servers: Server[] = [];
async function listen(server: Server) {
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("test_address");
  return `http://127.0.0.1:${address.port}`;
}
afterEach(async () => {
  await Promise.all(
    servers.splice(0).map((server) => {
      server.closeAllConnections();
      return new Promise<void>((resolve) => server.close(() => resolve()));
    }),
  );
});
const options = () => ({
  method: "POST",
  body: "{}",
  signal: AbortSignal.timeout(5000),
});

describe("bounded native worker HTTP transport", () => {
  it("waits for delayed final headers and forwards only the requested operation", async () => {
    let release!: () => void, entered!: () => void;
    const accepted = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const server = createServer((req, res) => {
      expect(req.method).toBe("POST");
      expect(req.url).toBe("/media");
      expect(req.headers.authorization).toBe("Bearer synthetic-test");
      req.resume();
      release = () => res.writeHead(200).end('{"completed":true}');
      entered();
    });
    const origin = await listen(server);
    let settled = false;
    const pending = nativeWorkerFetch(origin + "/media", {
      ...options(),
      headers: { Authorization: "Bearer synthetic-test" },
    }).finally(() => {
      settled = true;
    });
    await accepted;
    expect(settled).toBe(false);
    release();
    expect(await (await pending).json()).toEqual({ completed: true });
  });

  it("aborts a request waiting for headers and closes its socket", async () => {
    let entered!: () => void, closed!: () => void;
    const socketClosed = new Promise<void>((resolve) => {
      closed = resolve;
    });
    const accepted = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const origin = await listen(
      createServer((req) => {
        req.socket.once("close", closed);
        req.resume();
        entered();
      }),
    );
    const controller = new AbortController();
    const pending = nativeWorkerFetch(origin + "/media", {
      ...options(),
      signal: controller.signal,
    });
    const rejected = expect(pending).rejects.toMatchObject({
      name: "AbortError",
    });
    await accepted;
    controller.abort();
    await rejected;
    await socketClosed;
  });

  it("rejects a truncated response instead of accepting a partial result", async () => {
    const origin = await listen(
      createServer((req, res) => {
        req.resume();
        res
          .writeHead(200, { "Content-Length": "100", Connection: "close" })
          .end("{}");
      }),
    );
    await expect(
      nativeWorkerFetch(origin + "/media", options()),
    ).rejects.toThrow();
  });

  it("rejects oversized responses and never follows redirects", async () => {
    let calls = 0;
    const origin = await listen(
      createServer((req, res) => {
        calls++;
        req.resume();
        if (calls === 1)
          res.writeHead(200).end("x".repeat(WORKER_RESPONSE_BYTES + 1));
        else res.writeHead(302, { Location: "http://192.0.2.1/media" }).end();
      }),
    );
    await expect(
      nativeWorkerFetch(origin + "/media", options()),
    ).rejects.toThrow();
    expect((await nativeWorkerFetch(origin + "/media", options())).status).toBe(
      302,
    );
    expect(calls).toBe(2);
  });

  it("rejects external, non-worker, oversized and pre-aborted requests before dispatch", async () => {
    let calls = 0;
    const origin = await listen(
      createServer((req, res) => {
        calls++;
        req.resume();
        res.end();
      }),
    );
    for (const url of [
      "http://192.0.2.1/media",
      origin + "/other",
      origin + "/media?x=1",
      origin.replace("http:", "https:") + "/media",
    ]) {
      await expect(nativeWorkerFetch(url, options())).rejects.toThrow(
        "invalid_worker_request",
      );
    }
    await expect(
      nativeWorkerFetch(origin + "/media", {
        ...options(),
        body: "x".repeat(OWNER_LIMITS.jsonBytes + 1),
      }),
    ).rejects.toThrow("invalid_worker_body");
    await expect(
      nativeWorkerFetch(origin + "/media", { method: "POST", body: "{}" }),
    ).rejects.toThrow("worker_deadline_required");
    await expect(
      nativeWorkerFetch(origin + "/media", {
        ...options(),
        signal: AbortSignal.abort(),
      }),
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(calls).toBe(0);
  });

  it("keeps the media RPC open until the existing explicit cancel/reap response", async () => {
    let release!: (response: Response) => void,
      entered!: () => void,
      cancelled!: () => void;
    const accepted = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const cancellation = new Promise<void>((resolve) => {
      cancelled = resolve;
    });
    const calls: string[] = [];
    const transport: typeof fetch = async (input) => {
      const path = new URL(String(input)).pathname;
      calls.push(path);
      if (path === "/media") {
        entered();
        return new Promise<Response>((resolve) => {
          release = resolve;
        });
      }
      cancelled();
      return new Response(null, { status: 202 });
    };
    const native = localWorkerPort(4200, "synthetic-test", transport);
    const controller = new AbortController();
    let settled = false;
    const pending = native(
      { operation: "inspect", workspaceId: randomUUID() },
      controller.signal,
    ).finally(() => {
      settled = true;
    });
    const rejected = expect(pending).rejects.toMatchObject({
      name: "AbortError",
    });
    await accepted;
    controller.abort();
    await cancellation;
    expect(settled).toBe(false);
    expect(calls).toEqual(["/media", "/cancel"]);
    release(new Response("{}", { status: 200 }));
    await rejected;
  });
});
