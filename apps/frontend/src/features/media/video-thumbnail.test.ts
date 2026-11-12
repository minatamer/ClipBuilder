import { expect, it, vi } from "vitest";
import {
  decodeVideoThumbnail,
  subscribeVideoThumbnail,
  videoThumbnailSnapshot,
  createVideoThumbnailStore,
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

it("recovers shared failed stills once for all subscribers and releases their URL", async () => {
  vi.useFakeTimers();
  const decode = vi
    .fn()
    .mockRejectedValueOnce(Error("temporary_read"))
    .mockResolvedValue(new Blob(["frame"]));
  const create = vi
    .spyOn(URL, "createObjectURL")
    .mockReturnValue("blob:recovered");
  const revoke = vi.spyOn(URL, "revokeObjectURL");
  const store = createVideoThumbnailStore(decode);
  const request = { source: "/generated-retry" };
  const first = store.subscribe(request, () => {}),
    second = store.subscribe(request, () => {});
  try {
    await vi.advanceTimersByTimeAsync(0);
    expect(store.snapshot(request).state).toBe("retrying");
    expect(decode).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1000);
    expect(store.snapshot(request)).toEqual({
      state: "ready",
      url: "blob:recovered",
    });
    expect(decode).toHaveBeenCalledTimes(2);
    expect(create).toHaveBeenCalledTimes(1);
    first();
    expect(revoke).not.toHaveBeenCalled();
    second();
    expect(revoke).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    first();
    second();
    vi.restoreAllMocks();
    vi.useRealTimers();
  }
});

it("releases the serial queue after a stalled decoder and ignores stale image failures", async () => {
  vi.useFakeTimers();
  const decode = vi.fn(async (request: { source: string }) =>
    request.source === "/hung"
      ? new Promise<Blob>(() => {})
      : new Blob(["frame"]),
  );
  let serial = 0;
  vi.spyOn(URL, "createObjectURL").mockImplementation(
    () => `blob:frame-${serial++}`,
  );
  const store = createVideoThumbnailStore(decode);
  const hung = { source: "/hung" },
    good = { source: "/good" };
  const a = store.subscribe(hung, () => {}),
    b = store.subscribe(good, () => {});
  try {
    await vi.advanceTimersByTimeAsync(30000);
    expect(store.snapshot(hung).state).toBe("retrying");
    expect(store.snapshot(good)).toEqual({
      state: "ready",
      url: "blob:frame-0",
    });
    store.invalidate(good, "blob:stale");
    expect(store.snapshot(good).state).toBe("ready");
    store.invalidate(good, "blob:frame-0");
    expect(store.snapshot(good).state).toBe("retrying");
    a();
    await vi.advanceTimersByTimeAsync(1000);
    expect(store.snapshot(good)).toEqual({
      state: "ready",
      url: "blob:frame-1",
    });
    b();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    a();
    b();
    vi.restoreAllMocks();
    vi.useRealTimers();
  }
});
it("does not publish a late decode after its source consumer is replaced", async () => {
  let finish!: (value: Blob) => void;
  const decode = vi
    .fn()
    .mockImplementationOnce(() => new Promise<Blob>((done) => (finish = done)))
    .mockResolvedValue(new Blob(["current"]));
  const create = vi
    .spyOn(URL, "createObjectURL")
    .mockReturnValue("blob:current");
  const store = createVideoThumbnailStore(decode);
  const oldRequest = { source: "/old-source" },
    currentRequest = { source: "/current-source" };
  const old = store.subscribe(oldRequest, () => {});
  await vi.waitFor(() => expect(decode).toHaveBeenCalledOnce());
  old();
  const current = store.subscribe(currentRequest, () => {});
  try {
    await vi.waitFor(() =>
      expect(store.snapshot(currentRequest).state).toBe("ready"),
    );
    finish(new Blob(["stale"]));
    await Promise.resolve();
    expect(store.snapshot(oldRequest).state).toBe("loading");
    expect(store.snapshot(currentRequest).url).toBe("blob:current");
    expect(create).toHaveBeenCalledOnce();
  } finally {
    old();
    current();
    vi.restoreAllMocks();
  }
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
