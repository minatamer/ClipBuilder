import { Writable } from "node:stream";
import { describe, expect, it, vi } from "vitest";
import { streamArtifact } from "./artifact-stream.js";
describe("bounded private stream cleanup", () => {
  it("cancels a stalled reader on disconnect even when the injected transport ignores abort", async () => {
    const canceled = vi.fn(),
      controller = new AbortController(),
      headers = vi.fn();
    const body = new ReadableStream<Uint8Array>({ cancel: canceled });
    const work = streamArtifact({
      bytes: 10,
      expiresAtMs: Date.now() + 60000,
      now: Date.now(),
      range: undefined,
      signal: controller.signal,
      destination: new Writable({
        write(_chunk, _encoding, callback) {
          callback();
        },
      }),
      headers,
      reserve: () => {},
      fetch: async () =>
        new Response(body, {
          headers: { "Content-Type": "video/mp4", "Content-Length": "10" },
        }),
    });
    const rejected = expect(work).rejects.toThrow();
    await vi.waitFor(() => expect(headers).toHaveBeenCalledTimes(1));
    controller.abort();
    await rejected;
    await vi.waitFor(() => expect(body.locked).toBe(false));
    expect(canceled).toHaveBeenCalledTimes(1);
  });
  it.each(["size", "range", "mime"])(
    "refuses %s mismatch before streaming headers and releases body",
    async (kind) => {
      const body = new ReadableStream<Uint8Array>({
          start(output) {
            output.enqueue(new Uint8Array(10));
            output.close();
          },
        }),
        headers = vi.fn();
      await expect(
        streamArtifact({
          bytes: 10,
          expiresAtMs: Date.now() + 60000,
          now: Date.now(),
          range: undefined,
          signal: new AbortController().signal,
          destination: new Writable(),
          headers,
          reserve: () => {},
          fetch: async () =>
            new Response(body, {
              headers: {
                "Content-Type": kind === "mime" ? "text/plain" : "video/mp4",
                "Content-Length": kind === "size" ? "11" : "10",
                ...(kind === "range"
                  ? { "Content-Range": "bytes 0-9/10" }
                  : {}),
              },
            }),
        }),
      ).rejects.toThrow();
      expect(headers).toHaveBeenCalledTimes(0);
      expect(body.locked).toBe(false);
    },
  );
});
