import { afterEach, beforeEach, expect, it, vi } from "vitest";
vi.mock("../../../../scripts/local-discovery.mjs", () => ({
  discoverOwnerHost: vi.fn(),
}));
import { discoverOwnerHost } from "../../../../scripts/local-discovery.mjs";
import { proxyLocalWorkflow } from "./local-workflow";
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
it("rejects hosted local routes without metadata, capability or upstream I/O", async () => {
  vi.stubEnv("APP_ENV", "preview");
  vi.stubEnv("PRIVATE_BACKEND_ORIGIN", "https://backend.run.app");
  vi.stubEnv("BACKEND_AUDIENCE", "https://backend.run.app");
  vi.stubEnv("FRONTEND_ORIGIN", "https://frontend.run.app");
  expect((await proxyLocalWorkflow(input(), ["capabilities"])).status).toBe(
    404,
  );
  expect(discoverOwnerHost).toHaveBeenCalledTimes(0);
  expect(fetcher).toHaveBeenCalledTimes(0);
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
