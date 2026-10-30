import { afterEach, expect, it, vi } from "vitest";
import { pollClipConnection, type ClipConnection } from "./clip-connection.ts";

afterEach(() => vi.useRealTimers());
const list = { clips: [], active: false, workers: 1 };
it("recovers a temporary outage with GETs only and stops all polling on abort", async () => {
  vi.useFakeTimers();
  const controller = new AbortController(),
    states: ClipConnection[] = [];
  const request = vi
    .fn<typeof fetch>()
    .mockRejectedValueOnce(Error("offline"))
    .mockResolvedValueOnce(Response.json(list));
  const work = pollClipConnection({
    workspaceId: crypto.randomUUID(),
    signal: controller.signal,
    revision: () => 3,
    list: (value, revision) => {
      expect(value).toEqual(list);
      expect(revision).toBe(3);
      controller.abort();
    },
    state: (state) => states.push(state),
    request,
  });
  await vi.advanceTimersByTimeAsync(1100);
  await work;
  expect(states).toContain("reconnecting");
  expect(request).toHaveBeenCalledTimes(2);
  expect(request.mock.calls.every(([, init]) => !init?.method)).toBe(true);
  expect(vi.getTimerCount()).toBe(0);
});
it("times out after thirty seconds and permits a fresh user-triggered attempt", async () => {
  vi.useFakeTimers();
  const request = vi.fn<typeof fetch>().mockRejectedValue(Error("offline"));
  const states: ClipConnection[] = [],
    controller = new AbortController();
  await Promise.all([
    pollClipConnection({
      workspaceId: crypto.randomUUID(),
      signal: controller.signal,
      revision: () => 0,
      list: vi.fn(),
      state: (state) => states.push(state),
      request,
    }),
    vi.advanceTimersByTimeAsync(31_000),
  ]);
  expect(states.at(-1)).toBe("unavailable");
  const calls = request.mock.calls.length;
  await vi.advanceTimersByTimeAsync(5000);
  expect(request).toHaveBeenCalledTimes(calls);
  request.mockResolvedValueOnce(Response.json(list));
  await pollClipConnection({
    workspaceId: crypto.randomUUID(),
    signal: controller.signal,
    revision: () => 0,
    list: () => controller.abort(),
    state: vi.fn(),
    request,
  });
  expect(request).toHaveBeenCalledTimes(calls + 1);
  expect(vi.getTimerCount()).toBe(0);
});
it("rebinds to a recovered workspace rather than re-submitting work to the old ID", async () => {
  const controller = new AbortController(),
    recovered = {
      id: crypto.randomUUID(),
      revision: 0,
      mode: "synthetic-ai",
      source: {
        fingerprint: "a".repeat(64),
        bytes: 9,
        durationMs: 1000,
        width: 320,
        height: 180,
        fps: 30,
      },
    };
  const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(Response.json(recovered)),
    onRecovered = vi.fn();
  await pollClipConnection({
    workspaceId: crypto.randomUUID(),
    signal: controller.signal,
    revision: () => 0,
    list: vi.fn(),
    state: vi.fn(),
    recovered: onRecovered,
    request,
  });
  expect(onRecovered).toHaveBeenCalledExactlyOnceWith(recovered);
  expect(request.mock.calls[1]![0]).toBe("/api/local/workspace");
  expect(request.mock.calls.every(([, init]) => !init?.method)).toBe(true);
});
it("reports a missing/expired session without an endless reconnect loop", async () => {
  const states: ClipConnection[] = [],
    request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(Response.json(null));
  await pollClipConnection({
    workspaceId: crypto.randomUUID(),
    signal: new AbortController().signal,
    revision: () => 0,
    list: vi.fn(),
    state: (value) => states.push(value),
    request,
  });
  expect(states).toEqual(["missing"]);
  expect(request).toHaveBeenCalledTimes(2);
});
it("stops on an expired authenticated session instead of retrying forever", async () => {
  const state = vi.fn(),
    request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 401 }));
  await pollClipConnection({
    workspaceId: crypto.randomUUID(),
    signal: new AbortController().signal,
    revision: () => 0,
    list: vi.fn(),
    state,
    request,
  });
  expect(state).toHaveBeenCalledExactlyOnceWith("missing");
  expect(request).toHaveBeenCalledTimes(1);
});
