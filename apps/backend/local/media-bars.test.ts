import { expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { independentHookFixture } from "../../../test/owner-hook-fixture.ts";
import { applyOwnerEdit } from "./edit-clip.ts";
import { compileOwnerOverlay } from "../../../packages/contracts/local/edit-overlay.ts";
import { ownerEditDocumentSchema } from "../../../packages/contracts/local/editor.ts";
import { withIndependentOwnerHook } from "../../../packages/contracts/local/hook-content.ts";

it("saves an independent media bar override through the normal edit/compile boundary and JSON reopen", () => {
  const clip = independentHookFixture(),
    before = structuredClone(clip.edit!);
  const cue = { ...before.visuals[0]!, ignoreBlackBars: true };
  const draft = { ...before, blackBars: true, visuals: [cue] };
  const operations = [
    { kind: "black-bars" as const, enabled: true },
    { kind: "visual-upsert" as const, cue: draft.visuals[0]! },
  ];
  const saved = applyOwnerEdit(clip, {
    operationId: randomUUID(),
    expectedRevision: clip.revision,
    baseHash: clip.baseHash!,
    operations,
  });
  const independent = withIndependentOwnerHook(
    clip.base!,
    saved,
    clip.assets,
    [],
    { startFrame: 30, endFrame: 90 },
  );
  expect(independent.hookContent!.edits.visuals[0]!.ignoreBlackBars).toBe(true);
  independent.hookContent!.edits.visuals[0]!.ignoreBlackBars = false;
  const restored = ownerEditDocumentSchema.parse(
    JSON.parse(JSON.stringify(independent)),
  );
  const overlay = compileOwnerOverlay(clip.base!, restored, clip.assets);
  expect(overlay.visuals[0]!.ignoreBlackBars).toBe(true);
  expect(overlay.hookContent!.visuals[0]!.ignoreBlackBars).toBe(false);
  expect(overlay.audio).toEqual(clip.base!.overlay.audio);
  expect(overlay.focus).toEqual(clip.base!.overlay.focus);
  expect(overlay.texts).toEqual(clip.base!.overlay.texts);
  expect(overlay.visuals[0]!.box).toEqual(cue.box);
  expect(overlay.visuals[0]!.startFrame).toBe(cue.startFrame);
  expect(clip.edit).toEqual(before);
  expect(clip.calls).toEqual({ plan: 0, image: 0, render: 0 });
  expect(
    ownerEditDocumentSchema.safeParse({
      ...before,
      visuals: [{ ...cue, ignoreBlackBars: "yes" }],
    }).success,
  ).toBe(false);
});
