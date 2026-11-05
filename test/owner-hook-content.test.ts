import { expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { independentHookFixture } from "./owner-hook-fixture.ts";
import { compileOwnerOverlay } from "../packages/contracts/local/edit-overlay.ts";
import {
  ownerContentEdits,
  withIndependentOwnerHook,
  ownerOccurrencePresentationFrame,
} from "../packages/contracts/local/hook-content.ts";
import {
  OWNER_CAPTION_PRESETS,
  ownerEditDocumentSchema,
} from "../packages/contracts/local/editor.ts";
import { ownerOverlayAudioSegments } from "../packages/contracts/local/occurrence-audio.ts";
import { applyOwnerEdit } from "../apps/backend/local/edit-clip.ts";
import { ownerEditOperations } from "../apps/frontend/src/features/local-editing/editor-state.ts";
import { ownerOverlayFrame } from "../packages/composition/local/overlay-frame.ts";

const hook = { startFrame: 30, endFrame: 60 };
it("copies only repeated captions, preserves media identity, and isolates every supported content edit in both directions", () => {
  const clip = independentHookFixture(),
    original = clip.edit!;
  const document = withIndependentOwnerHook(
    clip.base!,
    original,
    clip.assets,
    [],
    hook,
  );
  expect(original.hook).toBeUndefined();
  expect(document.hookContent!.captions.map((c) => c.text)).toEqual(["Hook"]);
  expect(document.hookContent!.edits.visuals[0]!.assetId).toBe(
    document.visuals[0]!.assetId,
  );
  document.texts![0]!.text = "Main";
  document.captions = { ...OWNER_CAPTION_PRESETS.bold, color: "#0000ff" };
  document.audio!.originalVolume = 60;
  const h = document.hookContent!.edits;
  h.texts![0]!.text = "Hook only";
  h.visuals[0]!.box.x = 0.5;
  h.captions = { ...OWNER_CAPTION_PRESETS.clean, color: "#ff0000" };
  h.captionText = [{ wordId: "w_000002", text: "Changed" }];
  h.audio!.originalVolume = 0;
  h.audio!.cues[0]!.volume = 80;
  h.videoLook = { preset: "warm", strength: 30 };
  h.focus!.shots[0]!.centerX = 0.75;
  const overlay = compileOwnerOverlay(clip.base!, document, clip.assets, []);
  expect(overlay.texts![0]!.text).toBe("Main");
  expect(overlay.hookContent!.texts![0]!.text).toBe("Hook only");
  expect(overlay.visuals[0]!.box.x).toBe(0.1);
  expect(overlay.hookContent!.visuals[0]!.box.x).toBe(0.5);
  expect(overlay.hookContent!.captions[0]!.text).toBe("Changed");
  expect(overlay.captions[1]!.text).toBe("Hook");
  expect(overlay.audio!.originalVolume).toBe(60);
  expect(overlay.hookContent!.audio!.originalVolume).toBe(0);
  expect(overlay.focus!.shots[0]!.centerX).not.toBe(0.75);
  expect(overlay.hookContent!.focus!.shots[0]!.centerX).toBe(0.75);
  expect(ownerOverlayFrame(overlay, 0).captionStyle!.color).toBe("#ff0000");
  expect(ownerOverlayFrame(overlay, 60).captionStyle!.color).toBe("#0000ff");
  const segments = ownerOverlayAudioSegments(overlay);
  expect(segments.map((s) => [s.start, s.end, s.offset, s.cue.volume])).toEqual(
    [
      [0, 1, 0, 80],
      [1, 5, 0, 20],
    ],
  );
  const operations = ownerEditOperations(original, document, clip);
  const saved = applyOwnerEdit(
    clip,
    {
      operationId: randomUUID(),
      expectedRevision: 0,
      baseHash: clip.baseHash,
      operations,
    },
    { width: 640, height: 360 },
  );
  expect(saved.hookContent).toEqual(document.hookContent);
  expect(
    ownerEditDocumentSchema.parse(JSON.parse(JSON.stringify(saved))),
  ).toEqual(saved);
});
it("legacy reads remain linked, while an explicit body edit freezes the prior Hook before changing the body", () => {
  const clip = independentHookFixture();
  clip.edit!.hook = hook;
  expect(
    compileOwnerOverlay(clip.base!, clip.edit, clip.assets).hookContent,
  ).toBeUndefined();
  const saved = applyOwnerEdit(clip, {
    operationId: randomUUID(),
    expectedRevision: 0,
    baseHash: clip.baseHash,
    operations: [
      {
        kind: "text-layers",
        layers: clip.edit!.texts!.map((t) => ({ ...t, text: "Main changed" })),
      },
    ],
  });
  expect(saved.texts![0]!.text).toBe("Main changed");
  expect(saved.hookContent!.edits.texts![0]!.text).toBe("Original");
});
it("range changes retain overlapping edits, add newly repeated content, and removal drops only Hook edits", () => {
  const clip = independentHookFixture();
  const first = withIndependentOwnerHook(
    clip.base!,
    clip.edit!,
    clip.assets,
    [],
    hook,
  );
  first.hookContent!.edits.texts![0]!.text = "Retained";
  first.hookContent!.edits.visuals = [];
  first.captionText = [{ wordId: "w_000002", text: "Main changed later" }];
  const widened = withIndependentOwnerHook(clip.base!, first, clip.assets, [], {
    startFrame: 30,
    endFrame: 90,
  });
  expect(widened.hookContent!.captions.map((c) => c.text)).toEqual([
    "Hook",
    "After",
  ]);
  expect(widened.hookContent!.edits.texts![0]!.text).toBe("Retained");
  expect(widened.hookContent!.edits.visuals).toEqual([]);
  const removed = withIndependentOwnerHook(
    clip.base!,
    widened,
    clip.assets,
    [],
    undefined,
  );
  expect(removed.hookContent).toBeUndefined();
  expect(removed.visuals).toHaveLength(1);
  expect(removed.captionText).toEqual(first.captionText);
});
it("validates clock, immutable asset and source bindings without recursive overlays or silent clamping", () => {
  const clip = independentHookFixture(),
    doc = withIndependentOwnerHook(
      clip.base!,
      clip.edit!,
      clip.assets,
      [],
      hook,
    );
  doc.hookContent!.window.endFrame = 61;
  expect(() => compileOwnerOverlay(clip.base!, doc, clip.assets)).toThrow();
  doc.hookContent!.window.endFrame = 60;
  doc.hookContent!.edits.visuals[0]!.assetId = randomUUID();
  expect(() => compileOwnerOverlay(clip.base!, doc, clip.assets)).toThrow(
    "missing_edit_asset",
  );
  expect(ownerOccurrencePresentationFrame(hook, 45, "hook")).toBe(15);
  expect(ownerOccurrencePresentationFrame(hook, 45, "body")).toBe(75);
  expect(Object.keys(ownerContentEdits(doc))).not.toContain("hookContent");
});

it("rejects invented caption clocks and keeps provisional invalid Hook edits local", () => {
  const clip = independentHookFixture(),
    document = withIndependentOwnerHook(
      clip.base!,
      clip.edit!,
      clip.assets,
      [],
      hook,
    );
  document.hookContent!.captions[0]!.wordCues[0]!.startMs += 20;
  expect(() =>
    applyOwnerEdit(clip, {
      operationId: randomUUID(),
      expectedRevision: 0,
      baseHash: clip.baseHash,
      operations: [
        { kind: "hook", hook },
        { kind: "hook-content", content: document.hookContent },
      ],
    }),
  ).toThrow("stale_hook_content");
  const provisional = ownerContentEdits({
    ...document.hookContent!.edits,
    texts: document.hookContent!.edits.texts!.map((layer) => ({
      ...layer,
      text: "",
    })),
  });
  expect(provisional.texts![0]!.text).toBe("");
  expect(() =>
    compileOwnerOverlay(
      clip.base!,
      {
        ...document,
        hookContent: { ...document.hookContent!, edits: provisional },
      },
      clip.assets,
    ),
  ).toThrow();
});

it("stores bounded integer caption clocks for a one-frame non-millisecond Hook boundary", () => {
  const clip = independentHookFixture(),
    range = { startFrame: 31, endFrame: 32 };
  const document = withIndependentOwnerHook(
    clip.base!,
    clip.edit!,
    clip.assets,
    [],
    range,
  );
  expect(document.hookContent!.captions[0]!.startMs).toBe(1033);
  expect(document.hookContent!.captions[0]!.endMs).toBe(1067);
  const saved = applyOwnerEdit(clip, {
    operationId: randomUUID(),
    expectedRevision: 0,
    baseHash: clip.baseHash,
    operations: [
      { kind: "hook", hook: range },
      { kind: "hook-content", content: document.hookContent },
    ],
  });
  expect(saved.hookContent).toEqual(document.hookContent);
});

it("restarts each opening title on its own native occurrence clock", () => {
  const clip = independentHookFixture();
  clip.edit!.texts![0] = {
    ...clip.edit!.texts![0]!,
    role: "opening-title",
    startFrame: 0,
    endFrame: 1,
  };
  const document = withIndependentOwnerHook(
    clip.base!,
    clip.edit!,
    clip.assets,
    [],
    { startFrame: 31, endFrame: 32 },
  );
  document.hookContent!.edits.texts![0]!.text = "Hook title";
  const overlay = compileOwnerOverlay(clip.base!, document, clip.assets);
  expect(ownerOverlayFrame(overlay, 0).texts[0]!.text).toBe("Hook title");
  expect(
    ownerOverlayFrame(overlay, 0, {
      hook: false,
      presentationStartFrame: 2.5,
      sourceStartFrame: 0,
      sourceEndFrame: 120,
      frames: 120,
    }).texts[0]!.text,
  ).toBe("Original");
  expect(ownerOverlayFrame(overlay, 1).texts[0]!.text).toBe("Original");
});

it("copies repeated media/text into a different Hook even when their IDs appeared in the old window", () => {
  const clip = independentHookFixture(),
    first = withIndependentOwnerHook(clip.base!, clip.edit!, clip.assets, [], {
      startFrame: 0,
      endFrame: 30,
    });
  first.hookContent!.edits.captions = {
    ...OWNER_CAPTION_PRESETS.clean,
    color: "#ff0000",
  };
  const moved = withIndependentOwnerHook(clip.base!, first, clip.assets, [], {
    startFrame: 90,
    endFrame: 120,
  });
  expect(moved.hookContent!.edits.visuals).toHaveLength(1);
  expect(moved.hookContent!.edits.visuals[0]!.id).toBe(first.visuals[0]!.id);
  expect(moved.hookContent!.edits.visuals[0]!.startFrame).toBe(90);
  expect(moved.hookContent!.edits.texts).toHaveLength(1);
  expect(moved.hookContent!.edits.captions!.color).toBe("#ff0000");
  expect(moved.visuals).toEqual(first.visuals);
});
