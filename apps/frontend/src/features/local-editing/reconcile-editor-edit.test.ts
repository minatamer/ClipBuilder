import { expect, it } from "vitest";
import { independentHookFixture } from "../../../../../test/owner-hook-fixture.ts";
import { reconcileEditorEdit } from "./reconcile-editor-edit";
import { OWNER_CAPTION_PRESETS } from "../../../../../packages/contracts/local/editor.ts";

const edits = () => {
  const base = independentHookFixture().edit!;
  base.captions = structuredClone(OWNER_CAPTION_PRESETS.tiktok);
  return {
    base,
    local: structuredClone(base),
    saved: { ...structuredClone(base), revision: base.revision + 1 },
  };
};
it("recognizes an acknowledgement without losing newer typed changes or unrelated saved fields", () => {
  const { base, local, saved } = edits();
  local.captions!.color = "#112233";
  saved.captions!.fontWeight = 900;
  const result = reconcileEditorEdit(base, local, saved);
  expect(result.conflicts).toEqual([]);
  expect(result.valid).toBe(true);
  expect(result.draft.captions).toMatchObject({
    color: "#112233",
    fontWeight: 900,
  });
  expect(result.draft.revision).toBe(saved.revision);
  expect(base.captions!.color).not.toBe("#112233");
});
it("accepts identical concurrent values and keeps an invalid in-progress input locally", () => {
  const { base, local, saved } = edits();
  local.captions!.color = saved.captions!.color = "#112233";
  local.captions!.fontSize = NaN;
  const result = reconcileEditorEdit(base, local, saved);
  expect(result.conflicts).toEqual([]);
  expect(result.draft.captions!.fontSize).toBeNaN();
  expect(result.valid).toBe(false);
});
it("merges the first explicit changes against the inherited caption style", () => {
  const { base, local, saved } = edits();
  base.captions = null;
  local.captions!.fontSize = 70;
  saved.captions!.fontWeight = 900;
  const result = reconcileEditorEdit(
    base,
    local,
    saved,
    false,
    OWNER_CAPTION_PRESETS.tiktok,
  );
  expect(result.conflicts).toEqual([]);
  expect(result.draft.captions).toMatchObject({
    fontSize: 70,
    fontWeight: 900,
  });
});
it("requires a deliberate choice for simultaneous changes to the same field", () => {
  const { base, local, saved } = edits();
  local.captions!.color = "#112233";
  saved.captions!.color = "#445566";
  expect(reconcileEditorEdit(base, local, saved).conflicts).toEqual([
    "captions.color",
  ]);
  expect(
    reconcileEditorEdit(base, local, saved, true).draft.captions!.color,
  ).toBe("#112233");
});
it("merges changes by visual identity and retains independent additions and ordering", () => {
  const { base, local, saved } = edits();
  local.visuals[0]!.box.x = 0.2;
  saved.visuals.push({
    ...structuredClone(saved.visuals[0]!),
    id: crypto.randomUUID(),
  });
  const result = reconcileEditorEdit(base, local, saved);
  expect(result.conflicts).toEqual([]);
  expect(result.draft.visuals).toHaveLength(2);
  expect(result.draft.visuals[0]!.box.x).toBe(0.2);
});
it("does not silently resurrect a deleted visual that was edited elsewhere", () => {
  const { base, local, saved } = edits();
  local.visuals = [];
  saved.visuals[0]!.box.x = 0.2;
  expect(reconcileEditorEdit(base, local, saved).conflicts).toEqual([
    `visuals.${base.visuals[0]!.id}`,
  ]);
  expect(reconcileEditorEdit(base, local, saved, true).draft.visuals).toEqual(
    [],
  );
});
it.each(["baseHash", "fingerprint", "clipId"] as const)(
  "never rebases a different %s",
  (key) => {
    const { base, local, saved } = edits();
    saved[key] = key === "clipId" ? crypto.randomUUID() : "f".repeat(64);
    expect(reconcileEditorEdit(base, local, saved, true)).toMatchObject({
      compatible: false,
      conflicts: ["source"],
    });
  },
);
it("rejects an older server snapshot rather than downgrading acknowledgement metadata", () => {
  const { base, local, saved } = edits();
  base.revision = 4;
  saved.revision = 3;
  expect(reconcileEditorEdit(base, local, saved).conflicts).toEqual([
    "revision",
  ]);
});
