import { describe, expect, it, vi } from "vitest";
import { loadRetainedSample } from "./retained-sample.input";

describe("sample input becomes a disposable browser copy", () => {
  it("downloads only the fixed same-origin route, creates a generic file and sends no analysis", async () => {
    const transport = vi.fn<typeof fetch>(
      async () =>
        new Response(new Uint8Array(10), {
          headers: { "Content-Type": "video/mp4", "Content-Length": "10" },
        }),
    );
    const file = await loadRetainedSample(
      new AbortController().signal,
      100,
      transport,
    );
    expect(file.size).toBe(10);
    expect(file.name).toBe("input.mp4");
    expect(file.type).toBe("video/mp4");
    expect(transport).toHaveBeenCalledTimes(1);
    expect(transport.mock.calls[0]).toMatchObject([
      "/api/analysis/sample-source",
      { credentials: "same-origin", redirect: "error", cache: "no-store" },
    ]);
  });
  it.each(["large", "truncated", "oversized", "type", "status"])(
    "rejects %s content without leaking provider data",
    async (kind) => {
      const body = new ReadableStream<Uint8Array>({
        start(output) {
          output.enqueue(
            new Uint8Array(
              kind === "truncated" ? 9 : kind === "oversized" ? 11 : 10,
            ),
          );
          output.close();
        },
      });
      const transport = vi.fn<typeof fetch>(
        async () =>
          new Response(body, {
            status: kind === "status" ? 403 : 200,
            headers: {
              "Content-Type": kind === "type" ? "text/plain" : "video/mp4",
              "Content-Length": kind === "large" ? "101" : "10",
            },
          }),
      );
      await expect(
        loadRetainedSample(new AbortController().signal, 100, transport),
      ).rejects.toMatchObject({ failure: { code: "INTERNAL_ERROR" } });
      expect(transport).toHaveBeenCalledTimes(1);
      expect(body.locked).toBe(false);
    },
  );
  it("makes zero calls when aborted and releases a stalled body on cancellation", async () => {
    const transport = vi.fn<typeof fetch>();
    const pre = new AbortController();
    pre.abort();
    await expect(
      loadRetainedSample(pre.signal, 100, transport),
    ).rejects.toThrow();
    expect(transport).not.toHaveBeenCalled();
    const cancel = vi.fn();
    const body = new ReadableStream<Uint8Array>({ cancel });
    transport.mockResolvedValue(
      new Response(body, {
        headers: { "Content-Type": "video/mp4", "Content-Length": "10" },
      }),
    );
    const controller = new AbortController();
    const work = loadRetainedSample(controller.signal, 100, transport);
    const rejected = expect(work).rejects.toThrow();
    await vi.waitFor(() => expect(body.locked).toBe(true));
    controller.abort();
    await rejected;
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(body.locked).toBe(false);
  });
});
