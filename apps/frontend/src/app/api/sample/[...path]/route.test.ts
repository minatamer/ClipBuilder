import { afterEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "./route";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
const context = (path: string[]) => ({ params: Promise.resolve({ path }) });

describe("local sample proxy", () => {
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
