import { afterEach, describe, expect, it, vi } from "vitest";
import { reportBrowserDiagnostic } from "./browser.diagnostics";
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});
describe("private browser diagnostics", () => {
  it("sends a bounded content-free record without printing", async () => {
    const log = vi.spyOn(console, "info");
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const transport = vi.fn(async () => new Response(null, { status: 204 }));
    const value = { kind: "view-failed", digest: "123456" } as const;
    await reportBrowserDiagnostic(value, transport);
    expect(transport).toHaveBeenCalledWith(
      "/api/diagnostics",
      expect.objectContaining({ body: JSON.stringify(value), keepalive: true }),
    );
    expect(log).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });
  it("does not retry or surface a private transport exception", async () => {
    const transport = vi.fn(async () => {
      throw new Error("synthetic private detail");
    });
    await expect(
      reportBrowserDiagnostic(
        { kind: "cleanup-failed", resource: "stopper" },
        transport,
      ),
    ).resolves.toBeUndefined();
    expect(transport).toHaveBeenCalledOnce();
  });
  it("aborts stalled reporting and releases its timer", async () => {
    vi.useFakeTimers();
    const transport: typeof fetch = (_url, init) =>
      new Promise((_, reject) => {
        init?.signal?.addEventListener(
          "abort",
          () => reject(new Error("synthetic timeout")),
          { once: true },
        );
      });
    const pending = reportBrowserDiagnostic({ kind: "view-failed" }, transport);
    await vi.advanceTimersByTimeAsync(5000);
    await pending;
    expect(vi.getTimerCount()).toBe(0);
  });
});
