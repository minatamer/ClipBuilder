import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BlobSource, Input, WEBM } from "mediabunny";
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
  it("rejects WebM bytes even when the file is named and declared as MP4", async () => {
    // Synthetic EBML header with WebM DocType; no real media or decoder needed.
    const file = new File(
      [
        new Uint8Array([
          0x1a, 0x45, 0xdf, 0xa3, 0x9f, 0x42, 0x86, 0x81, 0x01, 0x42, 0xf7,
          0x81, 0x01, 0x42, 0xf2, 0x81, 0x04, 0x42, 0xf3, 0x81, 0x08, 0x42,
          0x82, 0x84, 0x77, 0x65, 0x62, 0x6d, 0x42, 0x87, 0x81, 0x02, 0x42,
          0x85, 0x81, 0x02,
        ]),
      ],
      "synthetic.mp4",
      { type: "video/mp4" },
    );
    const detector = new Input({
      source: new BlobSource(file),
      formats: [WEBM],
    });
    try {
      expect((await detector.getFormat()).mimeType).toBe("video/webm");
    } finally {
      detector.dispose();
    }
    await receive({ action: "inspect", jobId: "webm", file });
    expect(messages).toEqual([
      { type: "failed", jobId: "webm", code: "unsupported" },
      { type: "stopped", jobId: "webm" },
    ]);
    expect(getDirectory).not.toHaveBeenCalled();
  });

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
