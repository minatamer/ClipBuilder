import { afterEach, describe, expect, it, vi } from "vitest";
import { POST, GET } from "./route";
afterEach(() => vi.unstubAllGlobals());
const context = (action: string) => ({ params: Promise.resolve({ action }) });
function input(action: string, body = "{}", origin = "http://localhost:3000") {
  return new Request(`http://localhost:3000/api/analysis/${action}`, {
    method: "POST",
    body,
    headers: {
      Origin: origin,
      "Content-Type": "application/json",
      "Sec-Fetch-Site": "same-origin",
      Cookie: "unrelated=secret; __Host-clipping_session=synthetic",
      "X-CSRF-Token": "c".repeat(43),
    },
  });
}
describe("bounded same-origin analysis bridge", () => {
  it.each(["output", "download"])(
    "streams %s within the final output cap without dispatch or signed URL",
    async (action) => {
      const transport = vi.fn(async (_url: RequestInfo | URL) => {
        void _url;
        return new Response(new Uint8Array(10), {
          headers: { "Content-Type": "video/mp4", "Content-Length": "10" },
        });
      });
      vi.stubGlobal("fetch", transport);
      const response = await GET(
        new Request(`http://localhost:3000/api/analysis/${action}`, {
          headers: {
            "Sec-Fetch-Site": "same-origin",
            Cookie: "__Host-clipping_session=synthetic",
          },
        }),
        context(action),
      );
      expect(response.status).toBe(200);
      expect((await response.arrayBuffer()).byteLength).toBe(10);
      expect(response.headers.get("content-disposition")).toBe(
        action === "download" ? 'attachment; filename="clipbuilder.mp4"' : null,
      );
      expect(transport.mock.calls[0]![0]).toBe(
        `http://127.0.0.1:4000/v1/analysis/${action}`,
      );
    },
  );
  it("streams selected preview ranges and forwards only the protected cookie", async () => {
    const transport = vi.fn(
      async (_url: RequestInfo | URL, _options?: RequestInit) => {
        void [_url, _options];
        return new Response(new Uint8Array(10), {
          status: 206,
          headers: {
            "Content-Type": "video/mp4",
            "Content-Length": "10",
            "Content-Range": "bytes 10-19/1024",
          },
        });
      },
    );
    vi.stubGlobal("fetch", transport);
    const response = await GET(
      new Request("http://localhost:3000/api/analysis/preview", {
        headers: {
          "Sec-Fetch-Site": "same-origin",
          Cookie: "unrelated=private; __Host-clipping_session=synthetic",
          Range: "bytes=10-19",
        },
      }),
      context("preview"),
    );
    expect(response.status).toBe(206);
    expect((await response.arrayBuffer()).byteLength).toBe(10);
    expect(response.headers.get("content-range")).toBe("bytes 10-19/1024");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(transport.mock.calls[0]![0]).toBe(
      "http://127.0.0.1:4000/v1/analysis/preview",
    );
    expect(JSON.stringify(transport.mock.calls[0]![1])).not.toContain(
      "unrelated",
    );
  });
  it.each(["bytes=0-1,4-5", "bytes=bad", "items=0-2"])(
    "rejects %s before upstream access",
    async (range) => {
      const transport = vi.fn();
      vi.stubGlobal("fetch", transport);
      const response = await GET(
        new Request("http://localhost:3000/api/analysis/preview", {
          headers: {
            "Sec-Fetch-Site": "same-origin",
            Cookie: "__Host-clipping_session=synthetic",
            Range: range,
          },
        }),
        context("preview"),
      );
      expect(response.status).toBe(503);
      expect(transport).not.toHaveBeenCalled();
    },
  );
  it("cancels truncated/oversized streams without buffering a source or exposing an upstream error", async () => {
    const transport = vi.fn(
      async () =>
        new Response(new Uint8Array(11), {
          headers: { "Content-Type": "video/mp4", "Content-Length": "10" },
        }),
    );
    vi.stubGlobal("fetch", transport);
    const response = await GET(
      new Request("http://localhost:3000/api/analysis/preview", {
        headers: {
          "Sec-Fetch-Site": "same-origin",
          Cookie: "__Host-clipping_session=synthetic",
        },
      }),
      context("preview"),
    );
    await expect(response.arrayBuffer()).rejects.toThrow("media-unavailable");
  });
  it("admits the larger signed assembly context only on its fixed action and caps it", async () => {
    const transport = vi.fn(async () => Response.json({ ok: true }));
    vi.stubGlobal("fetch", transport);
    expect(
      (
        await POST(
          input("assemble", JSON.stringify({ synthetic: "x".repeat(9000) })),
          context("assemble"),
        )
      ).status,
    ).toBe(200);
    expect(transport).toHaveBeenCalledTimes(1);
    expect(
      (
        await POST(
          input("assemble", "x".repeat(4 * 1024 * 1024 + 1)),
          context("assemble"),
        )
      ).status,
    ).toBe(413);
    expect(transport).toHaveBeenCalledTimes(1);
  });
  it("forwards only protected headers to the fixed loopback API and carries the secure cookie", async () => {
    const transport = vi.fn(
      async (_url: RequestInfo | URL, _options?: RequestInit) => {
        void _url;
        void _options;
        return Response.json(
          { ok: true },
          {
            headers: {
              "Set-Cookie":
                "__Host-clipping_session=synthetic; Secure; HttpOnly; Path=/; SameSite=Strict",
            },
          },
        );
      },
    );
    vi.stubGlobal("fetch", transport);
    const response = await POST(input("grant"), context("grant"));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const [url, options] = transport.mock.calls[0]!;
    expect(url).toBe("http://127.0.0.1:4000/v1/analysis/grant");
    expect(options?.headers).toMatchObject({
      Cookie: "__Host-clipping_session=synthetic",
      "X-CSRF-Token": "c".repeat(43),
    });
    expect(JSON.stringify(options)).not.toContain("unrelated=secret");
    expect(response.headers.get("set-cookie")).toContain("Secure");
  });
  it("rejects unknown actions, cross-origin and oversized bodies before zero upstream calls", async () => {
    const transport = vi.fn();
    vi.stubGlobal("fetch", transport);
    expect((await POST(input("execute"), context("execute"))).status).toBe(400);
    expect(
      (
        await POST(
          input("run", "{}", "https://untrusted.invalid"),
          context("run"),
        )
      ).status,
    ).toBe(400);
    expect(
      (await POST(input("upload", "x".repeat(8193)), context("upload"))).status,
    ).toBe(413);
    expect(transport).toHaveBeenCalledTimes(0);
  });
});
