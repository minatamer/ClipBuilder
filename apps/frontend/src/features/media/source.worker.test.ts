import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SourceCommand, SourceMessage } from "./source.protocol";

const messages: SourceMessage[] = [];
const getDirectory = vi.fn(async () => ({}));

async function receive(
  data: SourceCommand | { action: "abort"; jobId: string },
) {
  const handler = globalThis.onmessage;
  if (!handler) throw new Error("Source worker handler is unavailable.");
  await Reflect.apply(handler, globalThis, [{ data }]);
}

beforeEach(async () => {
  vi.resetModules();
  messages.length = 0;
  getDirectory.mockReset().mockResolvedValue({});
  vi.stubGlobal("onmessage", null);
  vi.stubGlobal("postMessage", (message: SourceMessage) =>
    messages.push(message),
  );
  vi.stubGlobal("isSecureContext", true);
  vi.stubGlobal("navigator", { storage: { getDirectory } });
  vi.stubGlobal("OffscreenCanvas", undefined);
  vi.stubGlobal("VideoEncoder", undefined);
  vi.stubGlobal("AudioEncoder", undefined);
  await import("./source.worker");
});

afterEach(() => vi.unstubAllGlobals());

describe("cloud-flow intake capability probe", () => {
  it("accepts accessible storage without browser output encoders or canvas", async () => {
    await receive({ action: "probe", jobId: "probe" });
    expect(getDirectory).toHaveBeenCalledOnce();
    expect(messages).toEqual([
      { type: "result", jobId: "probe", result: {} },
      { type: "stopped", jobId: "probe" },
    ]);
  });

  it("does not consult unsupported portrait encoding configurations", async () => {
    const isConfigSupported = vi.fn(async () => ({ supported: false }));
    vi.stubGlobal("VideoEncoder", { isConfigSupported });
    vi.stubGlobal("AudioEncoder", { isConfigSupported });
    vi.stubGlobal("OffscreenCanvas", class {});
    await receive({ action: "probe", jobId: "probe" });
    expect(isConfigSupported).not.toHaveBeenCalled();
    expect(messages[0]).toEqual({ type: "result", jobId: "probe", result: {} });
  });

  it.each(["insecure", "missing-storage"])(
    "rejects %s before readiness",
    async (kind) => {
      if (kind === "insecure") vi.stubGlobal("isSecureContext", false);
      else vi.stubGlobal("navigator", { storage: {} });
      await receive({ action: "probe", jobId: "probe" });
      expect(messages).toEqual([
        { type: "failed", jobId: "probe", code: "unavailable" },
        { type: "stopped", jobId: "probe" },
      ]);
      expect(getDirectory).not.toHaveBeenCalled();
    },
  );

  it("rejects denied storage without exposing the underlying error", async () => {
    getDirectory.mockRejectedValue(new Error("synthetic-private-detail"));
    await receive({ action: "probe", jobId: "probe" });
    expect(messages).toEqual([
      { type: "failed", jobId: "probe", code: "storage" },
      { type: "stopped", jobId: "probe" },
    ]);
  });

  it("fences cancellation while storage access is pending", async () => {
    let finish = () => {};
    getDirectory.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = () => resolve({});
        }),
    );
    const pending = receive({ action: "probe", jobId: "probe" });
    await receive({ action: "abort", jobId: "probe" });
    finish();
    await pending;
    expect(messages).toEqual([
      { type: "failed", jobId: "probe", code: "canceled" },
      { type: "stopped", jobId: "probe" },
    ]);
  });
});
