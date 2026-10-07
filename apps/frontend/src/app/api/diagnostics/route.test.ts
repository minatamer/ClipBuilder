import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
afterEach(() => vi.unstubAllGlobals());
function input(value: unknown) {
  return new Request("http://localhost:3000/api/diagnostics", {
    method: "POST",
    headers: {
      Origin: "http://localhost:3000",
      "Content-Type": "application/json",
      "Sec-Fetch-Site": "same-origin",
      Cookie: "secret-cookie",
    },
    body: JSON.stringify(value),
  });
}
describe("private diagnostic bridge", () => {
  it("forwards only validated records and never echoes private output or credentials", async () => {
    const transport = vi.fn<typeof fetch>(
      async () =>
        new Response("synthetic private backend detail", { status: 500 }),
    );
    vi.stubGlobal("fetch", transport);
    const response = await POST(
      input({ kind: "view-failed", digest: "12345" }),
    );
    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
    expect(transport).toHaveBeenCalledOnce();
    const options = transport.mock.calls[0]?.[1];
    expect(options).toBeDefined();
    expect(JSON.stringify(options)).not.toContain("secret-cookie");
  });
  it.each([
    { kind: "view-failed", digest: "https://private.example/media" },
    { kind: "view-failed", message: "synthetic transcript" },
    { kind: "cleanup-failed", resource: "stopper", path: "private-path" },
    { kind: "view-failed", extra: "x".repeat(8192) },
  ])(
    "rejects arbitrary diagnostic content before upstream work",
    async (value) => {
      const transport = vi.fn();
      vi.stubGlobal("fetch", transport);
      expect((await POST(input(value))).status).toBe(204);
      expect(transport).not.toHaveBeenCalled();
    },
  );
  it("fails closed for another origin and for an offline backend", async () => {
    const transport = vi.fn(async () => {
      throw new Error("synthetic private detail");
    });
    vi.stubGlobal("fetch", transport);
    const foreign = input({ kind: "view-failed" });
    foreign.headers.set("origin", "https://foreign.example");
    expect((await POST(foreign)).status).toBe(204);
    expect(transport).not.toHaveBeenCalled();
    expect((await POST(input({ kind: "view-failed" }))).status).toBe(204);
    expect(transport).toHaveBeenCalledOnce();
  });
});
