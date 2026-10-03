import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
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
