import { expect, it } from "vitest";
import { independentHookFixture } from "../../../../../test/owner-hook-fixture.ts";
import { WorkspaceEditHistory } from "./edit-history";
import type { OwnerEditDocument } from "../../../../../packages/contracts/local/editor.ts";
import { OWNER_CAPTION_PRESETS } from "../../../../../packages/contracts/local/editor.ts";
import type { OwnerHookDraft } from "./hook-range-draft";

const snapshot = (draft: OwnerEditDocument, hookDraft?: OwnerHookDraft) => ({
  draft,
  hookDraft,
});

const change = (edit: OwnerEditDocument, size: number) => ({
  ...edit,
  captions: {
    ...(edit.captions ?? OWNER_CAPTION_PRESETS.tiktok),
    fontSize: size,
  },
});

it("coalesces one gesture, branches after undo and restores current server metadata", () => {
  const history = new WorkspaceEditHistory();
  const clip = independentHookFixture(),
    original = clip.edit!;
  const first = change(original, 70),
    second = change(first, 72);
  history.record(clip.id, snapshot(original), snapshot(first), "font", 0);
  history.record(clip.id, snapshot(first), snapshot(second), "font", 200);
  const acknowledged = { ...second, revision: 8 };
  const undone = history.move(clip.id, snapshot(acknowledged), "undo")!;
  expect(undone.draft.captions).toEqual(original.captions);
  expect(undone.draft.revision).toBe(8);
  expect(history.availability(clip.id, undone.draft)).toEqual({
    undo: false,
    redo: true,
  });
  const redone = history.move(clip.id, undone, "redo")!;
  expect(redone.draft.captions!.fontSize).toBe(72);
  history.move(clip.id, redone, "undo");
  history.record(
    clip.id,
    undone,
    snapshot(change(undone.draft, 80)),
    "font",
    400,
  );
  expect(history.availability(clip.id, undone.draft).redo).toBe(false);
});

it("keeps distinct actions and clips, caps history, and clears changed-base/removed clips", () => {
  const history = new WorkspaceEditHistory();
  const clip = independentHookFixture(),
    original = clip.edit!;
  let current = original;
  for (let i = 0; i < 65; i++) {
    const next = change(current, i + 20);
    history.record(
      clip.id,
      snapshot(current),
      snapshot(next),
      "font",
      i * 1000,
    );
    current = next;
  }
  history.record("other", snapshot(original), snapshot(change(original, 90)));
  let steps = 0;
  for (;;) {
    const next = history.move(clip.id, snapshot(current), "undo");
    if (!next) break;
    current = next.draft;
    steps++;
  }
  expect(steps).toBe(50);
  expect(history.availability("other", original).undo).toBe(true);
  expect(
    history.move(
      "other",
      snapshot({ ...original, baseHash: "e".repeat(64) }),
      "undo",
    ),
  ).toBeNull();
  history.retain(new Set());
  expect(history.availability(clip.id, current)).toEqual({
    undo: false,
    redo: false,
  });
});

it("ignores revision-only acknowledgements and keeps snapshots isolated from callers", () => {
  const history = new WorkspaceEditHistory(),
    clip = independentHookFixture(),
    before = change(clip.edit!, 64);
  history.record(
    clip.id,
    snapshot(before),
    snapshot({ ...before, revision: 4 }),
  );
  expect(history.availability(clip.id, before).undo).toBe(false);
  const after = change(before, 70);
  history.record(clip.id, snapshot(before), snapshot(after));
  const expected = before.captions!.fontSize;
  before.captions!.fontSize = 99;
  expect(
    history.move(clip.id, snapshot(after), "undo")!.draft.captions!.fontSize,
  ).toBe(expected);
});

it("restores an incomplete Hook endpoint through Undo/Redo without undoing an unrelated caption edit", () => {
  const history = new WorkspaceEditHistory(),
    clip = independentHookFixture(),
    original = clip.edit!;
  const edited = snapshot(change(original, 70)),
    incomplete = snapshot(edited.draft, { startFrame: 90, endFrame: null });
  history.record(clip.id, snapshot(original), edited);
  history.record(clip.id, edited, incomplete);
  const undone = history.move(clip.id, incomplete, "undo")!;
  expect(undone.hookDraft).toBeUndefined();
  expect(undone.draft.captions!.fontSize).toBe(70);
  const redone = history.move(clip.id, undone, "redo")!;
  expect(redone.hookDraft).toEqual({ startFrame: 90, endFrame: null });
  expect(redone.draft.captions!.fontSize).toBe(70);
});
it("keeps an independently saved property through Undo and Redo after a safe rebase", () => {
  const history = new WorkspaceEditHistory(),
    clip = independentHookFixture();
  const original = change(clip.edit!, 64),
    local = change(original, 70);
  history.record(clip.id, snapshot(original), snapshot(local));
  const remote = structuredClone(original);
  remote.revision++;
  remote.captions!.fontWeight = 900;
  history.reconcile(clip.id, original, remote, original.captions!);
  const current = {
    ...local,
    revision: remote.revision,
    captions: { ...local.captions!, fontWeight: 900 as const },
  };
  const undone = history.move(clip.id, snapshot(current), "undo")!;
  expect(undone.draft.captions).toMatchObject({
    fontSize: 64,
    fontWeight: 900,
  });
  expect(history.move(clip.id, undone, "redo")!.draft.captions).toMatchObject({
    fontSize: 70,
    fontWeight: 900,
  });
});
it("retains an incoming property when Undo returns to inherited typography after a clean update", () => {
  const history = new WorkspaceEditHistory(),
    clip = independentHookFixture(),
    before = clip.edit!;
  const base = {
    ...structuredClone(before),
    captions: { ...OWNER_CAPTION_PRESETS.tiktok, fontSize: 70 },
  };
  history.record(clip.id, snapshot(before), snapshot(base));
  const remote = structuredClone(base);
  remote.revision++;
  remote.captions.fontWeight = 900;
  history.reconcile(clip.id, base, remote, OWNER_CAPTION_PRESETS.tiktok);
  const undone = history.move(clip.id, snapshot(remote), "undo")!;
  expect(undone.draft.captions).toMatchObject({
    fontSize: 64,
    fontWeight: 900,
    preset: "tiktok",
  });
});
it("keeps unedited caption inheritance when only another section changes remotely", () => {
  const history = new WorkspaceEditHistory(),
    clip = independentHookFixture(),
    before = clip.edit!;
  const edited = structuredClone(before);
  edited.videoLook = { preset: "warm", strength: 70 };
  history.record(clip.id, snapshot(before), snapshot(edited));
  const remote = structuredClone(edited);
  remote.revision++;
  remote.videoLook = { preset: "cool", strength: 70 };
  history.reconcile(clip.id, edited, remote, OWNER_CAPTION_PRESETS.tiktok);
  expect(
    history.move(clip.id, snapshot(remote), "undo")!.draft.captions,
  ).toBeNull();
});
