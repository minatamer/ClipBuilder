import { afterEach, expect, it, vi } from "vitest";
import type { OwnerEditRequest } from "../../../../../packages/contracts/local/editor.ts";
import { saveEditorEdit } from "./save-editor-edit";

const body: OwnerEditRequest = {
  operationId: "00000000-0000-4000-8000-000000000001",
  expectedRevision: 0,
  baseHash: "a".repeat(64),
  operations: [{ kind: "reset", panel: "captions" }],
};
const list = { clips: [], active: false, workers: 1 };
afterEach(() => vi.useRealTimers());

it("replays a transient or lost response with identical operation bytes and bounded backoff", async () => {
  vi.useFakeTimers();
  const request = vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(new Response(null, { status: 503 }))
    .mockRejectedValueOnce(new TypeError("synthetic connection loss"))
    .mockResolvedValueOnce(Response.json(list));
  const result = saveEditorEdit(
    "workspace",
    "clip",
    body,
    new AbortController().signal,
    request,
  );
  expect(request).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(999);
  expect(request).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(1);
  expect(request).toHaveBeenCalledTimes(2);
  await vi.advanceTimersByTimeAsync(2000);
  expect(await result).toEqual(list);
  expect(request).toHaveBeenCalledTimes(3);
  expect(new Set(request.mock.calls.map(([, init]) => init?.body)).size).toBe(
    1,
  );
  expect(
    request.mock.calls.every(
      ([url, init]) => String(url).endsWith("/edit") && init?.method === "POST",
    ),
  ).toBe(true);
});

it("stops after three transient attempts and leaves explicit recovery to the editor", async () => {
  vi.useFakeTimers();
  const request = vi.fn<typeof fetch>(
    async () => new Response(null, { status: 503 }),
  );
  const result = expect(
    saveEditorEdit(
      "workspace",
      "clip",
      body,
      new AbortController().signal,
      request,
    ),
  ).rejects.toThrow("edit_save_unavailable");
  await vi.runAllTimersAsync();
  await result;
  expect(request).toHaveBeenCalledTimes(3);
});

it.each([400, 401, 403, 404, 410, 413, 422, 429])(
  "never automatically retries rejected save status %s",
  async (status) => {
    const request = vi.fn<typeof fetch>(
      async () => new Response(null, { status }),
    );
    await expect(
      saveEditorEdit(
        "workspace",
        "clip",
        body,
        new AbortController().signal,
        request,
      ),
    ).rejects.toThrow("edit_save_rejected");
    expect(request).toHaveBeenCalledTimes(1);
  },
);

it("returns a revision conflict without overwriting or retrying it", async () => {
  const request = vi.fn<typeof fetch>(
    async () => new Response(null, { status: 409 }),
  );
  expect(
    await saveEditorEdit(
      "workspace",
      "clip",
      body,
      new AbortController().signal,
      request,
    ),
  ).toBeNull();
  expect(request).toHaveBeenCalledTimes(1);
});

it("cancels backoff on unmount without leaving a timer or submitting another save", async () => {
  vi.useFakeTimers();
  const controller = new AbortController();
  const request = vi.fn<typeof fetch>(
    async () => new Response(null, { status: 503 }),
  );
  const result = expect(
    saveEditorEdit("workspace", "clip", body, controller.signal, request),
  ).rejects.toThrow();
  await vi.advanceTimersByTimeAsync(10);
  controller.abort();
  await result;
  await vi.runAllTimersAsync();
  expect(request).toHaveBeenCalledTimes(1);
  expect(vi.getTimerCount()).toBe(0);
});

it("does not retry a malformed acknowledgement", async () => {
  const request = vi.fn<typeof fetch>(async () =>
    Response.json({ malformed: true }),
  );
  await expect(
    saveEditorEdit(
      "workspace",
      "clip",
      body,
      new AbortController().signal,
      request,
    ),
  ).rejects.toThrow();
  expect(request).toHaveBeenCalledTimes(1);
});

it("releases unused error bodies before recovery", async () => {
  const cancel = vi.fn();
  const request = vi.fn<typeof fetch>(
    async () => new Response(new ReadableStream({ cancel }), { status: 409 }),
  );
  expect(
    await saveEditorEdit(
      "workspace",
      "clip",
      body,
      new AbortController().signal,
      request,
    ),
  ).toBeNull();
  expect(cancel).toHaveBeenCalledTimes(1);
});

it("safely reconciles a failed paged acknowledgement without changing operation identity", async () => {
  vi.useFakeTimers();
  const request = vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(
      Response.json({ value: list, page: { total: 0, next: 1 } }),
    )
    .mockResolvedValueOnce(new Response(null, { status: 503 }))
    .mockResolvedValueOnce(Response.json(list));
  const result = saveEditorEdit(
    "workspace",
    "clip",
    body,
    new AbortController().signal,
    request,
  );
  await vi.advanceTimersByTimeAsync(1000);
  expect(await result).toEqual(list);
  expect(request).toHaveBeenCalledTimes(3);
  expect(request.mock.calls[1]?.[0]).toBe(
    "/api/local/workspace/workspace/clip-pages/1",
  );
  expect(request.mock.calls[0]?.[1]?.body).toBe(
    request.mock.calls[2]?.[1]?.body,
  );
});
