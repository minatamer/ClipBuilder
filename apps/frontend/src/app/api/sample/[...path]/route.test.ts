import { afterEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "./route";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});
const context = (path: string[]) => ({ params: Promise.resolve({ path }) });

describe("local sample proxy", () => {
  it("forwards hosted configuration through metadata identity using the public origin and denies foreign browser origins", async () => {
    const origin = "https://synthetic-frontend.run.app";
    const backend = "https://synthetic-backend.run.app";
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("FRONTEND_ORIGIN", origin);
    vi.stubEnv("PRIVATE_BACKEND_ORIGIN", backend);
    vi.stubEnv("BACKEND_AUDIENCE", backend);
    const token =
      "synthetic." +
      btoa(
        JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }),
      ).replaceAll("=", "") +
      ".signature";
    const transport = vi.fn<typeof fetch>(async (url) =>
      String(url).startsWith("http://metadata.")
        ? new Response(token)
        : Response.json({ sampleEnabled: false }),
    );
    vi.stubGlobal("fetch", transport);
    const headers = {
      Host: "synthetic-frontend.run.app",
      "X-Forwarded-Proto": "https",
    };
    const request = (extra: Record<string, string> = {}) =>
      new Request("https://0.0.0.0:8080/api/sample/config", {
        headers: { ...headers, ...extra },
      });
    expect((await GET(request(), context(["config"]))).status).toBe(200);
    expect(transport).toHaveBeenCalledTimes(2);
    expect(transport.mock.calls[1]?.[0]).toBe(backend + "/v1/sample/config");
    expect(
      new Headers(transport.mock.calls[1]?.[1]?.headers).get("origin"),
    ).toBe(origin);
    expect(
      new Headers(transport.mock.calls[1]?.[1]?.headers).get(
        "X-Serverless-Authorization",
      ),
    ).toBe("Bearer " + token);
    for (const extra of [
      { Origin: "https://foreign.invalid" },
      { "Sec-Fetch-Site": "cross-site" },
      { Host: "foreign.invalid", "X-Forwarded-Host": headers.Host },
    ])
      expect((await GET(request(extra), context(["config"]))).status).toBe(400);
    expect(transport).toHaveBeenCalledTimes(2);
  });
  it("pins loopback, forwards only the fixture cookie and preserves no-store/clear", async () => {
    const transport = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", transport);
    const request = new Request("http://localhost:3000/api/sample/clear", {
      method: "POST",
      headers: {
        Cookie: `unrelated=synthetic-sentinel; clipbuilder_fixture=${"a".repeat(32)}`,
      },
    });
    const cleanup = vi.spyOn(request.signal, "removeEventListener");
    const response = await POST(request, context(["clear"]));
    expect(response.status).toBe(204);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(transport).toHaveBeenCalledTimes(1);
    expect(transport.mock.calls[0]?.[0]).toBe(
      "http://127.0.0.1:4000/v1/sample/clear",
    );
    expect(transport.mock.calls[0]?.[1]?.headers).toMatchObject({
      Cookie: `clipbuilder_fixture=${"a".repeat(32)}`,
      Origin: "http://localhost:3000",
    });
    expect(cleanup).toHaveBeenCalledWith("abort", expect.any(Function));
  });
  it("rejects unallowlisted paths, foreign origins, oversized and pre-aborted bodies without dispatch", async () => {
    const transport = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", transport);
    expect(
      (
        await GET(
          new Request("http://localhost:3000/api/sample/other"),
          context(["other"]),
        )
      ).status,
    ).toBe(400);
    expect(
      (
        await POST(
          new Request("http://localhost:3000/api/sample/sessions", {
            method: "POST",
            headers: { Origin: "https://synthetic.invalid" },
          }),
          context(["sessions"]),
        )
      ).status,
    ).toBe(400);
    expect(
      (
        await POST(
          new Request("http://localhost:3000/api/sample/sessions", {
            method: "POST",
            body: "x".repeat(8_193),
          }),
          context(["sessions"]),
        )
      ).status,
    ).toBe(400);
    const controller = new AbortController();
    controller.abort();
    expect(
      (
        await GET(
          new Request("http://localhost:3000/api/sample/session", {
            signal: controller.signal,
          }),
          context(["session"]),
        )
      ).status,
    ).toBe(503);
    expect(transport).not.toHaveBeenCalled();
  });
  it("aborts timed-out upstream work, removes its listener/timer and returns a safe failure", async () => {
    vi.useFakeTimers();
    const transport = vi
      .fn<typeof fetch>()
      .mockImplementation(
        (_input, init) =>
          new Promise((_resolve, reject) =>
            init?.signal?.addEventListener(
              "abort",
              () => reject(new Error("synthetic-secret-sentinel")),
              { once: true },
            ),
          ),
      );
    vi.stubGlobal("fetch", transport);
    const request = new Request("http://localhost:3000/api/sample/session");
    const cleanup = vi.spyOn(request.signal, "removeEventListener");
    const response = GET(request, context(["session"]));
    await vi.advanceTimersByTimeAsync(5_001);
    const result = await response;
    expect(result.status).toBe(503);
    expect(JSON.stringify(await result.json())).not.toContain(
      "synthetic-secret-sentinel",
    );
    expect(transport.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
    expect(cleanup).toHaveBeenCalledWith("abort", expect.any(Function));
    expect(vi.getTimerCount()).toBe(0);
  });
});
