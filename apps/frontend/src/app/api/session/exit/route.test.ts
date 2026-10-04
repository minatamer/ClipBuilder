import { afterEach, describe, expect, it, vi } from "vitest";
const callbacks = vi.hoisted(() => [] as (() => Promise<void>)[]);
vi.mock("next/server", () => ({
  after: (callback: () => Promise<void>) => callbacks.push(callback),
}));
import { POST } from "./route";

afterEach(() => {
  callbacks.length = 0;
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
function request(
  cookie = "__Host-clipping_session=synthetic; unrelated=private",
) {
  return new Request("http://localhost:3000/api/session/exit", {
    method: "POST",
    headers: {
      Origin: "http://localhost:3000",
      "Sec-Fetch-Site": "same-origin",
      Cookie: cookie,
    },
  });
}
describe("session exit cookie boundary", () => {
  it("bounds a stalled body and releases its reader without scheduling cleanup", async () => {
    vi.useFakeTimers();
    const canceled = vi.fn();
    const body = new ReadableStream<Uint8Array>({ cancel: canceled });
    const init: RequestInit & { duplex: string } = { body, duplex: "half" };
    const result = POST(new Request(request(""), init));
    await vi.advanceTimersByTimeAsync(2000);
    expect((await result).status).toBe(403);
    expect(canceled).toHaveBeenCalledOnce();
    expect(body.locked).toBe(false);
    expect(callbacks).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("accepts Next's non-null empty POST stream without treating it as content", async () => {
    const empty = new Request(request(""), { body: "" });
    expect(empty.body).not.toBeNull();
    const response = await POST(empty);
    expect(response.status).toBe(204);
    expect(response.headers.getSetCookie()).toHaveLength(2);
    expect(empty.body?.locked).toBe(false);
    expect(callbacks).toHaveLength(0);
  });

  it("expires only app cookies before background cleanup, even with an offline backend", async () => {
    const transport = vi.fn<typeof fetch>(async () => {
      throw new Error("offline");
    });
    vi.stubGlobal("fetch", transport);
    const response = await POST(request());
    expect(response.status).toBe(204);
    expect(response.headers.getSetCookie()).toHaveLength(2);
    expect(
      response.headers
        .getSetCookie()
        .every(
          (value) => value.includes("Max-Age=0") && value.includes("HttpOnly"),
        ),
    ).toBe(true);
    expect(response.headers.getSetCookie()[0]).toContain("Secure");
    expect(response.headers.getSetCookie().join(";")).not.toContain(
      "unrelated",
    );
    expect(transport).not.toHaveBeenCalled();
    expect(callbacks).toHaveLength(1);
    await callbacks[0]!();
    expect(transport).toHaveBeenCalledWith(
      "http://127.0.0.1:4000/v1/session/exit",
      expect.objectContaining({
        headers: expect.objectContaining({
          Cookie: "__Host-clipping_session=synthetic",
        }),
      }),
    );
  });
  it.each(["", "__Host-clipping_session=a; __Host-clipping_session=b"])(
    "also resets missing or ambiguous cookies without an upstream request",
    async (cookie) => {
      expect((await POST(request(cookie))).status).toBe(204);
      expect(callbacks).toHaveLength(0);
    },
  );
  it("rejects cross-site requests and request bodies before any reset or cleanup", async () => {
    const cross = request();
    cross.headers.set("sec-fetch-site", "cross-site");
    expect((await POST(cross)).status).toBe(403);
    const body = new Request(request(), { body: "untrusted" });
    expect((await POST(body)).status).toBe(403);
    expect(callbacks).toHaveLength(0);
  });
});
