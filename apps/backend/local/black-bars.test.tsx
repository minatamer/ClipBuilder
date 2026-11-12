import { expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { independentHookFixture } from "../../../test/owner-hook-fixture.ts";
import { applyOwnerEdit } from "./edit-clip.ts";
import { compileOwnerOverlay } from "../../../packages/contracts/local/edit-overlay.ts";
import { withIndependentOwnerHook } from "../../../packages/contracts/local/hook-content.ts";
import { ownerEditDocumentSchema } from "../../../packages/contracts/local/editor.ts";

it("persists framing through the authored edit boundary and independently copies Hook framing", () => {
  const clip = independentHookFixture(),
    original = structuredClone(clip.edit!);
  const saved = applyOwnerEdit(clip, {
    operationId: randomUUID(),
    expectedRevision: clip.revision,
    baseHash: clip.baseHash!,
    operations: [{ kind: "black-bars", enabled: true }],
  });
  const edit = withIndependentOwnerHook(clip.base!, saved, clip.assets, [], {
    startFrame: 30,
    endFrame: 90,
  });
  expect(edit.hookContent!.edits.blackBars).toBe(true);
  edit.hookContent!.edits.blackBars = false;
  const restored = ownerEditDocumentSchema.parse(
    JSON.parse(JSON.stringify(edit)),
  );
  const overlay = compileOwnerOverlay(clip.base!, restored, clip.assets, []);
  expect(overlay.hookContent!.blackBars).toBe(false);
  expect(overlay.blackBars).toBe(true);
  expect(overlay.audio).toEqual(clip.base!.overlay.audio);
  expect(overlay.focus).toEqual(clip.base!.overlay.focus);
  expect(overlay.visuals).toEqual(clip.base!.overlay.visuals);
  expect(clip.edit).toEqual(original);
  expect(clip.calls).toEqual({ plan: 0, image: 0, render: 0 });
  expect(
    ownerEditDocumentSchema.safeParse({ ...saved, blackBars: "yes" }).success,
  ).toBe(false);
});

it("bounds and persists independent reframing, retaining the position while disabled", () => {
  const clip = independentHookFixture();
  const saved = applyOwnerEdit(clip, {
    operationId: randomUUID(),
    expectedRevision: clip.revision,
    baseHash: clip.baseHash!,
    operations: [{ kind: "black-bars", enabled: true, position: 0.15 }],
  });
  expect(saved.blackBarPosition).toBe(0.15);
  const hook = withIndependentOwnerHook(clip.base!, saved, clip.assets, [], {
    startFrame: 30,
    endFrame: 90,
  });
  expect(hook.hookContent!.edits.blackBarPosition).toBe(0.15);
  hook.hookContent!.edits.blackBarPosition = 0.8;
  const overlay = compileOwnerOverlay(
    clip.base!,
    ownerEditDocumentSchema.parse(JSON.parse(JSON.stringify(hook))),
    clip.assets,
  );
  expect(overlay.blackBarPosition).toBe(0.15);
  expect(overlay.hookContent!.blackBarPosition).toBe(0.8);
  expect(overlay.focus).toEqual(clip.base!.overlay.focus);
  expect(overlay.audio).toEqual(clip.base!.overlay.audio);
  expect(overlay.visuals).toEqual(clip.base!.overlay.visuals);
  for (const value of [-0.01, 1.01, NaN, Infinity, "0.5"])
    expect(
      ownerEditDocumentSchema.safeParse({ ...saved, blackBarPosition: value })
        .success,
    ).toBe(false);
});
