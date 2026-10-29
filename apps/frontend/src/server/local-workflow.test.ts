import { afterEach, beforeEach, expect, it, vi } from "vitest";
vi.mock("./control-api", async (original) => ({
  ...(await original<typeof import("./control-api")>()),
  fetchControlApi: vi.fn(),
}));
vi.mock("../../../../scripts/local-discovery.mjs", () => ({
  discoverOwnerHost: vi.fn(),
}));
vi.mock("./local-ai-request", async (original) => ({
  ...(await original<typeof import("./local-ai-request")>()),
  fetchLocalAi: vi.fn(),
}));
import { discoverOwnerHost } from "../../../../scripts/local-discovery.mjs";
import { proxyLocalWorkflow } from "./local-workflow";
import { fetchControlApi } from "./control-api";
import { fetchLocalAi } from "./local-ai-request";
const fetcher = vi.fn<typeof fetch>();
beforeEach(() => {
  vi.stubEnv("APP_ENV", "local");
  vi.stubGlobal("fetch", fetcher);
  vi.mocked(discoverOwnerHost).mockResolvedValue({
    token: "synthetic-private-token",
    runtime: "unused",
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetcher.mockReset();
  vi.mocked(discoverOwnerHost).mockReset();
  vi.mocked(fetchControlApi).mockReset();
  vi.mocked(fetchLocalAi).mockReset();
});
const input = (method = "GET", headers: Record<string, string> = {}) =>
  new Request("http://localhost:3000/api/local/capabilities", {
    method,
    headers: { "sec-fetch-site": "same-origin", ...headers },
  });
it("forwards a private capability and exact range only to the fixed backend, then streams without exposing it", async () => {
  fetcher.mockResolvedValue(
    new Response("synthetic", {
      status: 206,
      headers: {
        "Content-Range": "bytes 0-8/9",
        "Set-Cookie": "private",
        "Content-Type": "video/mp4",
      },
    }),
  );
  const result = await proxyLocalWorkflow(
    input("GET", { Range: "bytes=0-8" }),
    ["workspace", "synthetic", "source"],
  );
  const [url, options] = fetcher.mock.calls[0]!;
  expect(url).toBe("http://127.0.0.1:4000/v1/local/workspace/synthetic/source");
  expect(new Headers(options?.headers).get("authorization")).toBe(
    "Bearer synthetic-private-token",
  );
  expect(new Headers(options?.headers).get("range")).toBe("bytes=0-8");
  expect(result.status).toBe(206);
  expect(result.headers.get("content-range")).toBe("bytes 0-8/9");
  expect(result.headers.has("set-cookie")).toBe(false);
  expect(await result.text()).toBe("synthetic");
  expect(options?.signal?.aborted).toBe(true);
});
it("rejects cross-site, missing write Origin and agent access before private discovery", async () => {
  expect((await proxyLocalWorkflow(input("POST"), ["source"])).status).toBe(
    403,
  );
  expect(
    (await proxyLocalWorkflow(input("POST"), ["open", "video"])).status,
  ).toBe(403);
  expect(
    (
      await proxyLocalWorkflow(
        input("POST", {
          Origin: "https://other.example.test",
          "sec-fetch-site": "cross-site",
        }),
        ["open", "video"],
      )
    ).status,
  ).toBe(403);
  expect(
    (
      await proxyLocalWorkflow(
        input("GET", { "sec-fetch-site": "cross-site" }),
        ["capabilities"],
      )
    ).status,
  ).toBe(403);
  expect((await proxyLocalWorkflow(input(), ["agent", "status"])).status).toBe(
    403,
  );
  expect(discoverOwnerHost).toHaveBeenCalledTimes(0);
  expect(fetcher).toHaveBeenCalledTimes(0);
});
it("rejects hosted acquisition without capability discovery or upstream I/O", async () => {
  vi.stubEnv("APP_ENV", "preview");
  vi.stubEnv("PRIVATE_BACKEND_ORIGIN", "https://backend.run.app");
  vi.stubEnv("BACKEND_AUDIENCE", "https://backend.run.app");
  vi.stubEnv("FRONTEND_ORIGIN", "https://frontend.run.app");
  expect(
    (await proxyLocalWorkflow(input(), ["sources", "lookup"])).status,
  ).toBe(404);
  expect(discoverOwnerHost).toHaveBeenCalledTimes(0);
  expect(fetcher).toHaveBeenCalledTimes(0);
  expect(
    (
      await proxyLocalWorkflow(
        input("POST", { Origin: "http://localhost:3000" }),
        [
          "workspace",
          "00000000-0000-4000-8000-000000000001",
          "clips",
          "00000000-0000-4000-8000-000000000002",
          "youtube-audio",
        ],
      )
    ).status,
  ).toBe(404);
  expect(fetchControlApi).not.toHaveBeenCalled();
});
it("forwards hosted editor requests through authenticated control transport with session cookies and CSRF", async () => {
  vi.stubEnv("HOSTED_DEMO_IP_VERIFIED", "true");
  vi.stubEnv("APP_ENV", "production");
  vi.stubEnv("PRIVATE_BACKEND_ORIGIN", "https://backend.run.app");
  vi.stubEnv("BACKEND_AUDIENCE", "https://backend.run.app");
  vi.stubEnv("FRONTEND_ORIGIN", "https://frontend.run.app");
  vi.mocked(fetchControlApi).mockResolvedValue(
    new Response(null, { status: 204 }),
  );
  const cookie = `__Host-clipping_editor=${"a".repeat(43)}; __Host-clipping_editor_csrf=${"b".repeat(43)}; unrelated=private`;
  const response = await proxyLocalWorkflow(
    new Request("https://frontend.run.app/api/local/session", {
      method: "DELETE",
      headers: {
        Host: "frontend.run.app",
        "X-Forwarded-Proto": "https",
        "X-Forwarded-For": "spoofed-prefix, 203.0.113.9, 192.0.2.7",
        "X-ClipBuilder-Client-IP": "203.0.113.9",
        Origin: "https://frontend.run.app",
        "Sec-Fetch-Site": "same-origin",
        Cookie: cookie,
      },
    }),
    ["session"],
  );
  expect(response.status).toBe(204);
  expect(discoverOwnerHost).not.toHaveBeenCalled();
  const [path, options] = vi.mocked(fetchControlApi).mock.calls[0]!;
  expect(path).toBe("/v1/editing/session");
  const headers = new Headers(options.headers);
  expect(headers.get("X-CSRF-Token")).toBe("b".repeat(43));
  expect(headers.get("Cookie")).not.toContain("unrelated");
  expect(headers.has("Authorization")).toBe(false);
  expect(headers.get("X-ClipBuilder-Client-IP")).toBe("192.0.2.7");
});
it("dispatches no hosted request while ingress verification is disabled", async () => {
  vi.stubEnv("HOSTED_DEMO_IP_VERIFIED", "false");
  vi.stubEnv("APP_ENV", "production");
  vi.stubEnv("PRIVATE_BACKEND_ORIGIN", "https://backend.run.app");
  vi.stubEnv("BACKEND_AUDIENCE", "https://backend.run.app");
  vi.stubEnv("FRONTEND_ORIGIN", "https://frontend.run.app");
  const response = await proxyLocalWorkflow(
    new Request("https://frontend.run.app/api/local/capabilities", {
      headers: {
        Host: "frontend.run.app",
        "X-Forwarded-Proto": "https",
        "X-Forwarded-For": "203.0.113.9, 192.0.2.7",
        "X-ClipBuilder-Client-IP": "203.0.113.9",
        "Sec-Fetch-Site": "same-origin",
      },
    }),
    ["capabilities"],
  );
  expect(response.status).toBe(503);
  expect(fetchControlApi).toHaveBeenCalledTimes(0);
  expect(discoverOwnerHost).toHaveBeenCalledTimes(0);
});
it("propagates browser cancellation into the upstream stream", async () => {
  fetcher.mockResolvedValue(
    new Response(
      new ReadableStream({
        start(output) {
          output.enqueue(new Uint8Array([1]));
        },
      }),
    ),
  );
  const result = await proxyLocalWorkflow(input(), ["capabilities"]);
  await result.body!.cancel();
  expect(fetcher.mock.calls[0]![1]?.signal?.aborted).toBe(true);
});
it("uses the bounded long-running transport only for authenticated local AI writes", async () => {
  const id = "00000000-0000-4000-8000-000000000001";
  vi.mocked(fetchLocalAi).mockResolvedValue(Response.json({ synthetic: true }));
  const result = await proxyLocalWorkflow(
    input("POST", { Origin: "http://localhost:3000" }),
    ["workspace", id, "analysis"],
  );
  expect(await result.json()).toEqual({ synthetic: true });
  expect(fetcher).not.toHaveBeenCalled();
  expect(fetchLocalAi).toHaveBeenCalledTimes(1);
  const [segments, options] = vi.mocked(fetchLocalAi).mock.calls[0]!;
  expect(segments).toEqual(["workspace", id, "analysis"]);
  expect(new Headers(options.headers).get("authorization")).toBe(
    "Bearer synthetic-private-token",
  );
  expect(options.signal?.aborted).toBe(true);
});
