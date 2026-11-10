import { expect, it, vi } from "vitest";
import {
  decodeVideoThumbnail,
  subscribeVideoThumbnail,
  videoThumbnailSnapshot,
} from "./video-thumbnail";

it("does not let a stale double cleanup delete a replacement subscription", async () => {
  const request = { source: "/generated-replacement", width: 0 };
  const old = subscribeVideoThumbnail(request, () => {});
  old();
  const notify = vi.fn(),
    current = subscribeVideoThumbnail(request, notify);
  try {
    old();
    await vi.waitFor(() =>
      expect(videoThumbnailSnapshot(request).state).toBe("unavailable"),
    );
    expect(notify).toHaveBeenCalledOnce();
  } finally {
    current();
  }
  expect(videoThumbnailSnapshot(request).state).toBe("loading");
});
it("counts separate consumers even when they supply the same callback", async () => {
  const request = { source: "/generated-shared", width: 0 },
    notify = vi.fn();
  const first = subscribeVideoThumbnail(request, notify),
    second = subscribeVideoThumbnail(request, notify);
  try {
    first();
    await vi.waitFor(() =>
      expect(videoThumbnailSnapshot(request).state).toBe("unavailable"),
    );
    expect(notify).toHaveBeenCalledOnce();
  } finally {
    first();
    second();
  }
});
it("validates pixel/time bounds and honors cancellation before touching media", async () => {
  for (const request of [
    { source: "/generated", width: 0 },
    { source: "/generated", height: 641 },
    { source: "/generated", timeMs: NaN },
  ])
    await expect(
      decodeVideoThumbnail(request, new AbortController().signal),
    ).rejects.toThrow("thumbnail_request_invalid");
  const abort = new AbortController();
  abort.abort();
  await expect(
    decodeVideoThumbnail({ source: "/generated" }, abort.signal),
  ).rejects.toMatchObject({ name: "AbortError" });
});
