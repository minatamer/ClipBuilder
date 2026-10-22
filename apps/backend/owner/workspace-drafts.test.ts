import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { OwnerWorkspaceDrafts } from "./workspace-drafts.ts";
import { WorkspaceFiles } from "./workspace-files.ts";
import type { OwnerDraftStore } from "./draft-store.ts";
import type {
  OwnerDraftSnapshot,
  OwnerDraftSummary,
} from "../../../packages/contracts/owner/drafts.ts";

const firstSavedAt = "2026-10-22T10:00:00.000Z";
const nextSavedAt = "2026-10-22T10:00:01.000Z";
let workspaceId: string, draftId: string, snapshot: OwnerDraftSnapshot;
let save: ReturnType<typeof vi.fn<OwnerDraftStore["save"]>>,
  drafts: OwnerWorkspaceDrafts;
beforeEach(() => {
  vi.useFakeTimers();
  workspaceId = randomUUID();
  draftId = randomUUID();
  snapshot = {
    version: 1,
    workspace: {
      id: workspaceId,
      source: {
        fingerprint: "a".repeat(64),
        bytes: 9,
        durationMs: 2000,
        width: 320,
        height: 180,
        fps: 30,
      },
      mode: "synthetic-ai",
      revision: 0,
    },
    analysis: null,
    clips: [],
  };
  save = vi
    .fn<OwnerDraftStore["save"]>()
    .mockResolvedValue({ id: draftId, savedAt: firstSavedAt, clips: 0 });
  // WorkspaceFiles is inert here: the persistence port below never touches files.
  drafts = new OwnerWorkspaceDrafts(
    { save },
    new WorkspaceFiles(join(tmpdir(), "unused-owner-draft-scratch")),
    () => structuredClone(snapshot),
  );
});
afterEach(async () => {
  await drafts.close();
  expect(vi.getTimerCount()).toBe(0);
  vi.useRealTimers();
});
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

it("requires an explicit first Save, then coalesces changes into the latest debounced snapshot", async () => {
  drafts.changed(workspaceId);
  await vi.advanceTimersByTimeAsync(5000);
  expect(save).toHaveBeenCalledTimes(0);
  expect(drafts.status(workspaceId)).toEqual({
    id: null,
    savedAt: null,
    state: "session-only",
  });
  expect((await drafts.save(workspaceId)).state).toBe("saved");
  expect(save.mock.calls[0]![0]).toBeUndefined();
  snapshot.workspace.revision = 1;
  drafts.changed(workspaceId);
  await vi.advanceTimersByTimeAsync(250);
  snapshot.workspace.revision = 2;
  drafts.changed(workspaceId);
  await vi.advanceTimersByTimeAsync(499);
  expect(save).toHaveBeenCalledTimes(1);
  expect(drafts.status(workspaceId).state).toBe("unsaved");
  await vi.advanceTimersByTimeAsync(1);
  expect(save).toHaveBeenCalledTimes(2);
  expect(save.mock.calls[1]![0]).toBe(draftId);
  expect(save.mock.calls[1]![1].workspace.revision).toBe(2);
  expect(drafts.status(workspaceId).state).toBe("saved");
});

it("does not label a newer acknowledged generation saved when an earlier snapshot finishes", async () => {
  const held = deferred<OwnerDraftSummary>();
  save.mockImplementationOnce(() => held.promise);
  const saving = drafts.save(workspaceId);
  await Promise.resolve();
  expect(save.mock.calls[0]![1].workspace.revision).toBe(0);
  snapshot.workspace.revision = 1;
  drafts.changed(workspaceId);
  await vi.advanceTimersByTimeAsync(1000);
  expect(save).toHaveBeenCalledTimes(1);
  expect(drafts.status(workspaceId).state).toBe("unsaved");
  held.resolve({ id: draftId, savedAt: firstSavedAt, clips: 0 });
  expect(await saving).toEqual({
    id: draftId,
    savedAt: firstSavedAt,
    state: "unsaved",
  });
  await vi.advanceTimersByTimeAsync(499);
  expect(save).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(1);
  expect(save).toHaveBeenCalledTimes(2);
  expect(save.mock.calls[1]![1].workspace.revision).toBe(1);
  expect(drafts.status(workspaceId).state).toBe("saved");
});

it("preserves the last durable identity/date on save failure and permits an explicit retry", async () => {
  await drafts.save(workspaceId);
  save.mockRejectedValueOnce(new Error("synthetic_disk_failure"));
  drafts.changed(workspaceId);
  await vi.advanceTimersByTimeAsync(500);
  expect(drafts.status(workspaceId)).toEqual({
    id: draftId,
    savedAt: firstSavedAt,
    state: "unsaved",
  });
  await vi.advanceTimersByTimeAsync(5000);
  expect(save).toHaveBeenCalledTimes(2);
  save.mockResolvedValueOnce({ id: draftId, savedAt: nextSavedAt, clips: 0 });
  expect(await drafts.save(workspaceId)).toEqual({
    id: draftId,
    savedAt: nextSavedAt,
    state: "saved",
  });
  expect(save).toHaveBeenCalledTimes(3);
});

it("drains forgotten work and removes its timers while closing flushes only an existing saved binding", async () => {
  await drafts.save(workspaceId);
  const held = deferred<OwnerDraftSummary>();
  save.mockImplementationOnce(() => held.promise);
  drafts.changed(workspaceId);
  await vi.advanceTimersByTimeAsync(500);
  const forgetting = drafts.forget(workspaceId);
  snapshot.workspace.revision = 1;
  drafts.changed(workspaceId);
  held.resolve({ id: draftId, savedAt: nextSavedAt, clips: 0 });
  await forgetting;
  await vi.advanceTimersByTimeAsync(5000);
  expect(save).toHaveBeenCalledTimes(2);
  expect(drafts.status(workspaceId).state).toBe("session-only");
  expect(vi.getTimerCount()).toBe(0);
  drafts.bind(workspaceId, draftId, nextSavedAt);
  drafts.changed(workspaceId);
  await drafts.close();
  expect(save).toHaveBeenCalledTimes(3);
  expect(save.mock.calls[2]![0]).toBe(draftId);
  expect(save.mock.calls[2]![1].workspace.revision).toBe(1);
  expect(vi.getTimerCount()).toBe(0);
});

it("does not retry a failed bulk first save during shutdown", async () => {
  save.mockRejectedValueOnce(new Error("synthetic_first_save_canceled"));
  expect(await drafts.save(workspaceId)).toEqual({
    id: null,
    savedAt: null,
    state: "unsaved",
  });
  await drafts.close();
  expect(save).toHaveBeenCalledTimes(1);
  expect(vi.getTimerCount()).toBe(0);
});
