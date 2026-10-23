import { expect, it, vi } from "vitest";
import { fetchYoutubeThumbnail } from "./youtube-thumbnail.ts";

const signal = () => new AbortController().signal;
const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
it("reads only the fixed image path with bounded no-store, no-redirect requests", async () => {
  const read = vi.fn<typeof fetch>(
    async () =>
      new Response(jpeg, { headers: { "content-type": "image/jpeg" } }),
  );
  expect(await fetchYoutubeThumbnail("SYNTHETIC01", signal(), read)).toEqual(
    jpeg,
  );
  expect(read).toHaveBeenCalledTimes(1);
  expect(read).toHaveBeenCalledWith(
    "https://i.ytimg.com/vi/SYNTHETIC01/mqdefault.jpg",
    expect.objectContaining({
      redirect: "error",
      credentials: "omit",
      cache: "no-store",
      referrerPolicy: "no-referrer",
    }),
  );
  expect(read.mock.calls[0]![1]?.signal?.aborted).toBe(true);
});
it("rejects arbitrary identifiers before any request", async () => {
  const read = vi.fn<typeof fetch>();
  await expect(
    fetchYoutubeThumbnail("../private", signal(), read),
  ).rejects.toThrow();
  const controller = new AbortController();
  controller.abort();
  await expect(
    fetchYoutubeThumbnail("SYNTHETIC01", controller.signal, read),
  ).rejects.toThrow();
  expect(read).not.toHaveBeenCalled();
});
it.each([
  { status: 302, headers: { "content-type": "image/jpeg" } },
  { status: 200, headers: { "content-type": "image/svg+xml" } },
  {
    status: 200,
    headers: {
      "content-type": "image/jpeg",
      "content-length": String(256 * 1024 + 1),
    },
  },
])(
  "rejects non-JPEG, redirects and oversized declared payloads, canceling the body ($status)",
  async (options) => {
    const cancel = vi.fn();
    const body = new ReadableStream<Uint8Array>({ cancel });
    const read = vi.fn<typeof fetch>(async () => new Response(body, options));
    await expect(
      fetchYoutubeThumbnail("SYNTHETIC01", signal(), read),
    ).rejects.toThrow("source_thumbnail_unavailable");
    expect(cancel).toHaveBeenCalledTimes(1);
  },
);
it("bounds streamed bytes even without Content-Length and rejects disguised content", async () => {
  const cancel = vi.fn();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(256 * 1024 + 1));
    },
    cancel,
  });
  await expect(
    fetchYoutubeThumbnail(
      "SYNTHETIC01",
      signal(),
      async () =>
        new Response(body, { headers: { "content-type": "image/jpeg" } }),
    ),
  ).rejects.toThrow("source_thumbnail_unavailable");
  expect(cancel).toHaveBeenCalledTimes(1);
  await expect(
    fetchYoutubeThumbnail(
      "SYNTHETIC01",
      signal(),
      async () =>
        new Response("synthetic-not-jpeg", {
          headers: { "content-type": "image/jpeg" },
        }),
    ),
  ).rejects.toThrow("source_thumbnail_unavailable");
});
it("propagates cancellation and its fixed deadline without leaking timers", async () => {
  vi.useFakeTimers();
  try {
    const read = vi.fn<typeof fetch>(
      async (_url, options) =>
        new Promise((_done, reject) =>
          options?.signal?.addEventListener(
            "abort",
            () => reject(new Error("synthetic-abort")),
            { once: true },
          ),
        ),
    );
    const controller = new AbortController();
    const canceled = expect(
      fetchYoutubeThumbnail("SYNTHETIC01", controller.signal, read),
    ).rejects.toThrow("source_thumbnail_unavailable");
    controller.abort();
    await canceled;
    const expired = expect(
      fetchYoutubeThumbnail("SYNTHETIC01", signal(), read),
    ).rejects.toThrow("source_thumbnail_unavailable");
    await vi.advanceTimersByTimeAsync(5000);
    await expired;
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
