import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { RetainedSampleProcessing } from "./retained-sample.processing.js";

const uploadUrl =
  "https://storage.googleapis.com/upload/storage/v1/b/synthetic/o?upload_id=synthetic";
const signal = () => new AbortController().signal;
function source(bytes = new Uint8Array([1, 2, 3])) {
  const read = vi.fn(async (range: string | undefined) => {
    const match = /^bytes=(\d+)-(\d+)$/.exec(range ?? "");
    if (!match) throw new Error("invalid-range");
    const start = Number(match[1]),
      end = Number(match[2]);
    return new Response(bytes.slice(start, end + 1), {
      status: 206,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": String(end - start + 1),
        "Content-Range": `bytes ${start}-${end}/${bytes.length}`,
      },
    });
  });
  return { bytes: bytes.length, read };
}

describe("deferred retained sample processing", () => {
  it("reads only after dispatch, fingerprints exact bytes, and copies bounded server chunks", async () => {
    const bytes = new Uint8Array(4 * 1024 * 1024 + 3).fill(7);
    const master = source(bytes);
    const requests: RequestInit[] = [];
    const transport: typeof fetch = vi.fn(async (_url, options) => {
      requests.push(options!);
      if (requests.length === 1)
        return new Response(null, {
          status: 308,
          headers: { Range: "bytes=0-4194303" },
        });
      return Response.json({
        generation: "12",
        bucket: "synthetic",
        name: "synthetic-only",
      });
    });
    const processing = new RetainedSampleProcessing(master, transport);
    expect(master.read).not.toHaveBeenCalled();
    expect(await processing.fingerprint(signal())).toBe(
      createHash("sha256").update(bytes).digest("hex"),
    );
    expect(transport).not.toHaveBeenCalled();
    expect(await processing.transfer(uploadUrl, signal())).toBe("12");
    expect(master.read.mock.calls.map(([range]) => range)).toEqual([
      "bytes=0-4194303",
      "bytes=4194304-4194306",
      "bytes=0-4194303",
      "bytes=4194304-4194306",
    ]);
    expect(transport).toHaveBeenCalledTimes(2);
    expect(
      requests.map((r) => new Headers(r.headers).get("content-range")),
    ).toEqual(["bytes 0-4194303/4194307", "bytes 4194304-4194306/4194307"]);
    for (const r of requests)
      expect(r).toMatchObject({ method: "PUT", redirect: "error" });
    for (const [i, r] of requests.entries()) {
      if (!(r.body instanceof Uint8Array))
        throw new Error("missing-upload-bytes");
      const expected = i === 0 ? bytes.slice(0, 4194304) : bytes.slice(4194304);
      expect(r.body.byteLength).toBe(expected.byteLength);
      expect(createHash("sha256").update(r.body).digest("hex")).toBe(
        createHash("sha256").update(expected).digest("hex"),
      );
    }
  });

  it.each([0, -1, 1.5, 524288001, Number.NaN])(
    "rejects invalid byte bounds %s without reading",
    (bytes) => {
      const master = source();
      expect(
        () => new RetainedSampleProcessing({ ...master, bytes }),
      ).toThrow();
      expect(master.read).not.toHaveBeenCalled();
    },
  );

  it.each(["truncated", "oversized", "wrong-range", "wrong-type"])(
    "rejects %s reads before uploading",
    async (failure) => {
      const master = source();
      master.read.mockImplementation(
        async () =>
          new Response(
            new Uint8Array(
              failure === "truncated" ? 2 : failure === "oversized" ? 4 : 3,
            ),
            {
              status: 206,
              headers: {
                "Content-Type":
                  failure === "wrong-type" ? "video/webm" : "video/mp4",
                "Content-Length": "3",
                "Content-Range":
                  failure === "wrong-range" ? "bytes 1-3/3" : "bytes 0-2/3",
              },
            },
          ),
      );
      const transport = vi.fn<typeof fetch>();
      const processing = new RetainedSampleProcessing(master, transport);
      await expect(processing.transfer(uploadUrl, signal())).rejects.toThrow();
      expect(transport).not.toHaveBeenCalled();
    },
  );

  it("rejects an incomplete resumable acknowledgement without sending the next chunk", async () => {
    const master = source(new Uint8Array(4194305));
    const transport = vi.fn<typeof fetch>(
      async () =>
        new Response(null, { status: 308, headers: { Range: "bytes=0-100" } }),
    );
    await expect(
      new RetainedSampleProcessing(master, transport).transfer(
        uploadUrl,
        signal(),
      ),
    ).rejects.toThrow();
    expect(master.read).toHaveBeenCalledOnce();
    expect(transport).toHaveBeenCalledOnce();
  });

  it.each([
    { generation: "0" },
    { generation: "12/other" },
    { generation: "12", padding: "x".repeat(8192) },
  ])("rejects invalid or excessive final metadata", async (value) => {
    const transport = vi.fn<typeof fetch>(async () => Response.json(value));
    await expect(
      new RetainedSampleProcessing(source(), transport).transfer(
        uploadUrl,
        signal(),
      ),
    ).rejects.toThrow();
    expect(transport).toHaveBeenCalledOnce();
  });

  it("rejects arbitrary destinations and pre-aborted work before any read or write", async () => {
    const master = source(),
      transport = vi.fn<typeof fetch>();
    const processing = new RetainedSampleProcessing(master, transport);
    await expect(
      processing.transfer("https://untrusted.invalid", signal()),
    ).rejects.toThrow();
    const controller = new AbortController();
    controller.abort();
    await expect(processing.fingerprint(controller.signal)).rejects.toThrow();
    await expect(
      processing.transfer(uploadUrl, controller.signal),
    ).rejects.toThrow();
    expect(master.read).not.toHaveBeenCalled();
    expect(transport).not.toHaveBeenCalled();
  });

  it("cancels a stalled final response and releases its reader on abort", async () => {
    const controller = new AbortController(),
      canceled = vi.fn();
    let started = () => {};
    const receiving = new Promise<void>((resolve) => {
      started = resolve;
    });
    const body = new ReadableStream<Uint8Array>(
      {
        pull() {
          started();
        },
        cancel: canceled,
      },
      { highWaterMark: 0 },
    );
    const transport = vi.fn<typeof fetch>(async () => new Response(body));
    const work = new RetainedSampleProcessing(source(), transport).transfer(
      uploadUrl,
      controller.signal,
    );
    const rejected = expect(work).rejects.toThrow();
    await receiving;
    controller.abort();
    await rejected;
    expect(canceled).toHaveBeenCalledOnce();
    expect(body.locked).toBe(false);
  });
});
