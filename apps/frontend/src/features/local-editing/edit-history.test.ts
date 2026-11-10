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
