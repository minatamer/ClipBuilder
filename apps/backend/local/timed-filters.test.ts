import { expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { independentHookFixture } from "../../../test/owner-hook-fixture.ts";
import {
  withIndependentOwnerHook,
  copyOwnerHookContent,
} from "../../../packages/contracts/local/hook-content.ts";
import { compileOwnerOverlay } from "../../../packages/contracts/local/edit-overlay.ts";
import { ownerVideoLookAt } from "../../../packages/contracts/local/video-look.ts";
import { applyOwnerEdit } from "./edit-clip.ts";
import { ownerAgentClip, ownerAgentValidation } from "./agent-view.ts";

it("round-trips independent timed filters through the edit boundary without changing base or sibling content", () => {
  const clip = independentHookFixture(),
    before = structuredClone(clip.base);
  clip.edit = withIndependentOwnerHook(
    clip.base!,
    clip.edit!,
    clip.assets,
    [],
    { startFrame: 30, endFrame: 90 },
  );
  clip.edit.hookContent!.edits.videoLooks = [
    { preset: "mono", strength: 100, startFrame: 30, endFrame: 60 },
  ];
  const next = applyOwnerEdit(clip, {
    operationId: randomUUID(),
    baseHash: clip.baseHash,
    expectedRevision: 0,
    operations: [
      {
        kind: "video-looks",
        looks: [{ preset: "warm", strength: 70, startFrame: 60, endFrame: 90 }],
      },
    ],
  });
  const overlay = compileOwnerOverlay(clip.base!, next, clip.assets, []);
  expect(ownerVideoLookAt(overlay, 45)).toBeUndefined();
  expect(ownerVideoLookAt(overlay.hookContent!, 45)).toEqual({
    preset: "mono",
    strength: 100,
  });
  expect(ownerVideoLookAt(overlay, 60)).toEqual({
    preset: "warm",
    strength: 70,
  });
  expect(ownerVideoLookAt(overlay.hookContent!, 60)).toBeUndefined();
  expect(clip.base).toEqual(before);
  expect(next.revision).toBe(1);
  expect(ownerAgentValidation(clip, next).videoLooks).toEqual(next.videoLooks);
  expect(ownerAgentClip({ ...clip, edit: next }).videoLooks).toEqual(
    next.videoLooks,
  );
  const restored = JSON.parse(JSON.stringify(next));
  expect(compileOwnerOverlay(clip.base!, restored, clip.assets, [])).toEqual(
    overlay,
  );
  expect(clip.calls).toEqual({ plan: 0, image: 0, render: 0 });
});

it("inherits the body legacy fallback only in newly added Hook footage", () => {
  const clip = independentHookFixture();
  clip.edit!.videoLook = { preset: "warm", strength: 70 };
  const edit = withIndependentOwnerHook(
    clip.base!,
    clip.edit!,
    clip.assets,
    [],
    { startFrame: 30, endFrame: 90 },
  );
  edit.hookContent!.edits.videoLook = { preset: "mono", strength: 100 };
  edit.videoLook = { preset: "cool", strength: 80 };
  const next = withIndependentOwnerHook(clip.base!, edit, clip.assets, [], {
    startFrame: 60,
    endFrame: 120,
  });
  const overlay = compileOwnerOverlay(clip.base!, next, clip.assets, []);
  expect(ownerVideoLookAt(overlay.hookContent!, 60)).toEqual({
    preset: "mono",
    strength: 100,
  });
  expect(ownerVideoLookAt(overlay.hookContent!, 89)).toEqual({
    preset: "mono",
    strength: 100,
  });
  expect(ownerVideoLookAt(overlay.hookContent!, 90)).toEqual({
    preset: "cool",
    strength: 80,
  });
  expect(ownerVideoLookAt(overlay.hookContent!, 119)).toEqual({
    preset: "cool",
    strength: 80,
  });
  expect(ownerVideoLookAt(overlay, 60)).toEqual({
    preset: "cool",
    strength: 80,
  });
});

it("rejects an expanded Hook above its filter budget without changing saved ranges", () => {
  const clip = independentHookFixture();
  const edit = withIndependentOwnerHook(
    clip.base!,
    clip.edit!,
    clip.assets,
    [],
    { startFrame: 30, endFrame: 90 },
  );
  edit.hookContent!.edits.videoLooks = Array.from({ length: 32 }, (_, i) => ({
    startFrame: 30 + i,
    endFrame: 31 + i,
    preset: "mono" as const,
    strength: 100,
  }));
  edit.videoLook = { preset: "warm", strength: 70 };
  const original = structuredClone(edit);
  expect(() =>
    withIndependentOwnerHook(clip.base!, edit, clip.assets, [], {
      startFrame: 30,
      endFrame: 120,
    }),
  ).toThrow();
  expect(edit).toEqual(original);
});

it("clips preserved Hook filters and inherits only newly covered source portions", () => {
  const clip = independentHookFixture();
  clip.edit!.videoLooks = [
    { preset: "warm", strength: 80, startFrame: 0, endFrame: 120 },
  ];
  const edit = withIndependentOwnerHook(
    clip.base!,
    clip.edit!,
    clip.assets,
    [],
    { startFrame: 30, endFrame: 90 },
  );
  edit.hookContent!.edits.videoLooks = [
    { preset: "mono", strength: 100, startFrame: 40, endFrame: 90 },
  ];
  const changed = copyOwnerHookContent(
    clip.base!,
    edit,
    clip.assets,
    [],
    { startFrame: 60, endFrame: 120 },
    edit.hookContent,
  );
  expect(changed.edits.videoLooks).toEqual([
    { preset: "mono", strength: 100, startFrame: 60, endFrame: 90 },
    { preset: "warm", strength: 80, startFrame: 90, endFrame: 120 },
  ]);
  expect(edit.videoLooks).toEqual(clip.edit!.videoLooks);
});

it("rejects out-of-clip and forged out-of-Hook ranges while retaining legacy whole filters", () => {
  const clip = independentHookFixture();
  const request = (operations: unknown[]) => ({
    operationId: randomUUID(),
    baseHash: clip.baseHash,
    expectedRevision: 0,
    operations,
  });
  expect(() =>
    applyOwnerEdit(
      clip,
      request([
        {
          kind: "video-looks",
          looks: [
            { preset: "mono", strength: 100, startFrame: 0, endFrame: 121 },
          ],
        },
      ]),
    ),
  ).toThrow();
  const edit = withIndependentOwnerHook(
    clip.base!,
    clip.edit!,
    clip.assets,
    [],
    { startFrame: 30, endFrame: 90 },
  );
  edit.hookContent!.edits.videoLooks = [
    { preset: "warm", strength: 100, startFrame: 0, endFrame: 30 },
  ];
  expect(() =>
    applyOwnerEdit(
      clip,
      request([
        { kind: "hook", hook: edit.hook },
        { kind: "hook-content", content: edit.hookContent },
      ]),
    ),
  ).toThrow();
  clip.edit!.videoLook = { preset: "cool", strength: 50 };
  const legacy = compileOwnerOverlay(clip.base!, clip.edit, clip.assets, []);
  expect(legacy.videoLooks).toBeUndefined();
  expect(ownerVideoLookAt(legacy, 0)).toEqual(clip.edit!.videoLook);
  expect(ownerVideoLookAt(legacy, 119)).toEqual(clip.edit!.videoLook);
});
