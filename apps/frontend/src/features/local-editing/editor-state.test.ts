import { expect, it } from "vitest";
import {
  OWNER_CAPTION_PRESETS,
  ownerCaptionStyleSchema,
  ownerEditRequestSchema,
} from "../../../../../packages/contracts/local/editor.ts";
import {
  ownerClipSchema,
  type OwnerClip,
} from "../../../../../packages/contracts/local/clips.ts";
import { compileOwnerOverlay } from "../../../../../packages/contracts/local/edit-overlay.ts";
import { normalizedBoxSchema } from "@clipbuilder/contracts";
import { defaultOwnerFocus } from "../../../../../packages/contracts/local/focus.ts";
import {
  automaticVisualEdits,
  constrainOwnerBox,
  initialOwnerEdit,
  ownerBoxesOverlap,
  ownerEditOperations,
  ownerGestureBox,
  sameOwnerEdit,
  centeredOwnerBox,
  ownerCaptionPreset,
} from "./editor-state.ts";

it("keeps caption placement when changing typography, fitting larger presets around the same center", () => {
  const current = {
    ...OWNER_CAPTION_PRESETS.clean,
    verticalAlign: "center" as const,
    box: centeredOwnerBox(
      OWNER_CAPTION_PRESETS.clean.box,
      0.5,
      OWNER_CAPTION_PRESETS.clean,
    ),
  };
  const next = ownerCaptionPreset(current, "bold");
  expect(next.box.x + next.box.width / 2).toBeCloseTo(0.5, 12);
  expect(next.box.y + next.box.height / 2).toBeCloseTo(0.5, 12);
  expect(next.verticalAlign).toBe("center");
  expect(next.preset).toBe("bold");
  expect(ownerCaptionStyleSchema.safeParse(next).success).toBe(true);
});

it("centers caption text boxes exactly at portrait quarters within safe bounds", () => {
  for (const caption of Object.values(OWNER_CAPTION_PRESETS)) {
    for (const center of [0.25, 0.5, 0.75] as const) {
      const box = centeredOwnerBox(caption.box, center, caption);
      expect(box.x + box.width / 2).toBeCloseTo(0.5, 12);
      expect(box.y + box.height / 2).toBeCloseTo(center, 12);
      expect(
        ownerCaptionStyleSchema.safeParse({
          ...caption,
          box,
          verticalAlign: "center",
        }).success,
      ).toBe(true);
    }
  }
});

it("fits oversized boxes before applying exact quarter/center presets", () => {
  for (const center of [0.25, 0.5, 0.75] as const) {
    const caption = { ...OWNER_CAPTION_PRESETS.bold, fontSize: 120 };
    const box = centeredOwnerBox(
      { x: 0.05, y: 0.05, width: 0.9, height: 0.9 },
      center,
      caption,
    );
    expect(box.y + box.height / 2).toBeCloseTo(center, 12);
    expect(ownerCaptionStyleSchema.safeParse({ ...caption, box }).success).toBe(
      true,
    );
    const picture = centeredOwnerBox(
      { x: 0, y: 0, width: 1, height: 1 },
      center,
      null,
    );
    expect(picture.y + picture.height / 2).toBeCloseTo(center, 12);
    expect(normalizedBoxSchema.safeParse(picture).success).toBe(true);
  }
});

function clip(): OwnerClip {
  const id = crypto.randomUUID(),
    assetId = crypto.randomUUID();
  return ownerClipSchema.parse({
    id,
    momentId: crypto.randomUUID(),
    analysisId: crypto.randomUUID(),
    mode: "synthetic-ai",
    sourceRevision: 0,
    revision: 0,
    assemblyRevision: 0,
    baseHash: "a".repeat(64),
    state: "ready",
    edit: null,
    assets: [
      {
        id: assetId,
        digest: "b".repeat(64),
        origin: "synthetic",
        bytes: 10,
        width: 100,
        height: 100,
      },
    ],
    outputs: [],
    calls: { plan: 1, image: 1, render: 1 },
    error: null,
    base: {
      version: 1,
      analysisId: crypto.randomUUID(),
      momentId: crypto.randomUUID(),
      sourceRevision: 0,
      fingerprint: "c".repeat(64),
      processingIdentity: "d".repeat(64),
      cut: { startFrame: 0, endFrame: 90 },
      words: [],
      overlay: {
        version: 1,
        frames: 90,
        captions: [],
        visuals: [
          {
            id: crypto.randomUUID(),
            assetId,
            digest: "b".repeat(64),
            origin: "synthetic",
            startFrame: 0,
            endFrame: 60,
            box: { x: 0.1, y: 0.1, width: 0.8, height: 0.3 },
            fit: "contain",
          },
        ],
      },
    },
  });
}

it("applies a bounded patch without modifying the automatic base or retaining generated provenance on a personal replacement", () => {
  const current = clip(),
    original = initialOwnerEdit(current);
  const retainedBase = JSON.stringify(current.base);
  const asset = {
    ...current.assets[0]!,
    id: crypto.randomUUID(),
    origin: "owner-supplied" as const,
    digest: "e".repeat(64),
  };
  current.assets.push(asset);
  const draft = {
    ...structuredClone(original),
    captions: structuredClone(OWNER_CAPTION_PRESETS.bold),
  };
  draft.visuals[0]!.assetId = asset.id;
  draft.visuals[0]!.box.x = 0.15;
  const operations = ownerEditOperations(original, draft, current);
  const request = ownerEditRequestSchema.parse({
    operationId: crypto.randomUUID(),
    expectedRevision: original.revision,
    baseHash: original.baseHash,
    operations,
  });
  expect(request.operations.map((operation) => operation.kind)).toEqual([
    "caption",
    "visual-upsert",
  ]);
  expect(JSON.stringify(request)).not.toContain("digest");
  expect(JSON.stringify(request)).not.toContain("origin");
  expect(
    compileOwnerOverlay(current.base!, draft, current.assets).visuals[0],
  ).toMatchObject({ digest: asset.digest, origin: "owner-supplied" });
  expect(JSON.stringify(current.base)).toBe(retainedBase);
  expect(current.calls).toEqual({ plan: 1, image: 1, render: 1 });
  expect(sameOwnerEdit(original, draft)).toBe(false);
});

it("resets each panel explicitly and emits removals before additions without changing siblings", () => {
  const current = clip(),
    sibling = clip(),
    untouched = JSON.stringify(sibling);
  const original = initialOwnerEdit(current);
  original.captions = structuredClone(OWNER_CAPTION_PRESETS.bold);
  original.visuals[0]!.box.y = 0.4;
  const reset = {
    ...structuredClone(original),
    captions: null,
    visuals: automaticVisualEdits(current),
  };
  expect(ownerEditOperations(original, reset, current)).toEqual([
    { kind: "reset", panel: "captions" },
    { kind: "reset", panel: "visuals" },
  ]);
  const replacement = {
    ...structuredClone(original),
    visuals: [{ ...original.visuals[0]!, id: crypto.randomUUID() }],
  };
  expect(
    ownerEditOperations(original, replacement, current).map(
      (operation) => operation.kind,
    ),
  ).toEqual(["visual-remove", "visual-upsert"]);
  expect(ownerEditOperations(original, original, current)).toEqual([]);
  expect(JSON.stringify(sibling)).toBe(untouched);
});

it("keeps drag and resize geometry identical at full and one-third portrait preview scale and inside contract bounds", () => {
  const box = { x: 0.1, y: 0.1, width: 0.6, height: 0.25 };
  for (const resize of [false, true]) {
    const full = ownerGestureBox(
      box,
      108,
      192,
      { width: 1080, height: 1920 },
      resize,
      null,
    );
    const scaled = ownerGestureBox(
      box,
      36,
      64,
      { width: 360, height: 640 },
      resize,
      null,
    );
    expect(scaled).toEqual(full);
    expect(normalizedBoxSchema.safeParse(scaled).success).toBe(true);
  }
  for (const style of Object.values(OWNER_CAPTION_PRESETS)) {
    for (const extent of [-10, 0, 10]) {
      const next = constrainOwnerBox(
        { x: extent, y: extent, width: extent, height: extent },
        style,
      );
      expect(
        ownerCaptionStyleSchema.safeParse({ ...style, box: next }).success,
      ).toBe(true);
    }
  }
  expect(
    normalizedBoxSchema.safeParse(
      constrainOwnerBox({ x: -2, y: 3, width: -1, height: 4 }, null),
    ).success,
  ).toBe(true);
  expect(
    ownerBoxesOverlap(box, { x: 0.7, y: 0.1, width: 0.2, height: 0.2 }),
  ).toBe(false);
  expect(
    ownerBoxesOverlap(box, { x: 0.6, y: 0.1, width: 0.2, height: 0.2 }),
  ).toBe(true);
});

it("includes video looks in UI/CLI edit operations, compilation and reset without mutating a legacy base", () => {
  const current = clip(),
    original = initialOwnerEdit(current);
  const legacy = JSON.stringify(current.base);
  const draft = {
    ...original,
    videoLook: { preset: "warm" as const, strength: 60 },
  };
  expect(sameOwnerEdit(original, draft)).toBe(false);
  expect(ownerEditOperations(original, draft, current)).toEqual([
    { kind: "video-look", look: draft.videoLook },
  ]);
  expect(
    compileOwnerOverlay(current.base!, draft, current.assets).videoLook,
  ).toEqual(draft.videoLook);
  expect(ownerEditOperations(draft, original, current)).toEqual([
    { kind: "reset", panel: "video" },
  ]);
  expect(JSON.stringify(current.base)).toBe(legacy);
  expect(
    compileOwnerOverlay(current.base!, original, current.assets),
  ).not.toHaveProperty("videoLook");
});

it("adds and resets focus on legacy saved clips without rewriting their base or changing captions/pictures", () => {
  const current = clip(),
    original = initialOwnerEdit(current),
    snapshot = JSON.stringify(current.base);
  const focus = defaultOwnerFocus(
      { width: 1280, height: 720 },
      current.base!.overlay.frames,
    ),
    draft = { ...original, focus };
  expect(sameOwnerEdit(original, draft)).toBe(false);
  expect(ownerEditOperations(original, draft, current)).toEqual([
    { kind: "focus", focus },
  ]);
  expect(
    compileOwnerOverlay(current.base!, draft, current.assets).focus,
  ).toEqual(focus);
  expect(ownerEditOperations(draft, original, current)).toEqual([
    { kind: "reset", panel: "focus" },
  ]);
  expect(
    compileOwnerOverlay(current.base!, original, current.assets).focus,
  ).toBeUndefined();
  expect(JSON.stringify(current.base)).toBe(snapshot);
});
