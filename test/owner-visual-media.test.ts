import { expect, it } from "vitest";
import { syntheticTextClip } from "./owner-text-fixture.ts";
import {
  compileOwnerOverlay,
  automaticOwnerEdit,
} from "../packages/contracts/local/edit-overlay.ts";
import { ownerClipSchema } from "../packages/contracts/local/clips.ts";
import { ownerVideoOverlapFits } from "../packages/contracts/local/video-assets.ts";
import { ownerVisualTransform } from "../packages/contracts/local/visual-effects.ts";
import { copyOwnerHookContent } from "../packages/contracts/local/hook-content.ts";
import { ownerOverlayFrame } from "../packages/composition/local/overlay-frame.ts";
import { applyOwnerEdit } from "../apps/backend/local/edit-clip.ts";
import { ownerEditOperations } from "../apps/frontend/src/features/local-editing/editor-state.ts";
import {
  ownerVisualTrackingSchema,
  ownerVisualTrackingFits,
} from "../packages/contracts/local/visual-tracking.ts";

function fixture() {
  const clip = syntheticTextClip();
  clip.base!.words = clip.base!.overlay.captions.flatMap((caption) =>
    caption.wordCues.map((word) => ({
      id: word.wordId,
      text: word.text,
      punctuatedText: word.text,
      speakerId: null,
      confidence: null,
      startMs: word.startMs,
      endMs: word.endMs,
    })),
  );
  const asset = {
    id: crypto.randomUUID(),
    digest: "d".repeat(64),
    width: 640,
    height: 360,
    bytes: 1000,
    frames: 150,
    hasAudio: true,
    audioAssetId: crypto.randomUUID(),
  };
  clip.videoAssets = [asset];
  clip.audioAssets = [
    {
      id: asset.audioAssetId,
      digest: "e".repeat(64),
      bytes: 1000,
      frames: 150,
      durationMs: 5000,
    },
  ];
  const edit = automaticOwnerEdit(clip.base!, clip.id, clip.baseHash!);
  edit.visuals = [
    {
      id: crypto.randomUUID(),
      assetId: asset.id,
      startFrame: 15,
      endFrame: 75,
      box: { x: 0.1, y: 0.1, width: 0.8, height: 0.4 },
      fit: "cover",
      presentation: "full-frame",
      video: { offsetFrame: 30, volume: 40, muted: true },
      effect: {
        startFrame: 15,
        endFrame: 60,
        zoom: 2,
        fromX: 0.2,
        fromY: 0.5,
        toX: 0.8,
        toY: 0.5,
      },
    },
  ];
  clip.edit = edit;
  const compile = () =>
    compileOwnerOverlay(
      clip.base!,
      clip.edit,
      clip.assets,
      clip.audioAssets,
      clip.videoAssets,
    );
  return { clip, asset, edit, compile };
}

function trackingPath(assetId = crypto.randomUUID()) {
  return ownerVisualTrackingSchema.parse({
    assetId,
    startFrame: 15,
    endFrame: 75,
    sourceStartFrame: 30,
    seed: { x: 0.4, y: 0.3, width: 0.2, height: 0.2 },
    outcome: "complete",
    points: [
      ...Array.from({ length: 30 }, (_, i) => ({
        frame: i * 2,
        x: 0.5 + i / 200,
        y: 0.4,
      })),
      { frame: 59, x: 0.65, y: 0.4 },
    ],
  });
}

it("binds video tracking to raw trim clocks, preserves paths through edit transport and Hook clipping, and changes the native cache key", () => {
  const { clip, edit, asset, compile } = fixture();
  edit.visuals[0]!.tracking = trackingPath(asset.id);
  const overlay = compile();
  const track = overlay.visuals[0]!.tracking!;
  expect(track).toEqual(trackingPath(asset.id));
  const initial = automaticOwnerEdit(clip.base!, clip.id, clip.baseHash!);
  const saved = applyOwnerEdit(
    { ...clip, edit: initial },
    {
      operationId: crypto.randomUUID(),
      expectedRevision: clip.revision,
      baseHash: clip.baseHash!,
      operations: ownerEditOperations(initial, edit, clip),
    },
    { width: 640, height: 360 },
  );
  expect(saved.visuals[0]!.tracking).toEqual(track);
  const hook = copyOwnerHookContent(
    clip.base!,
    edit,
    clip.assets,
    clip.audioAssets ?? [],
    { startFrame: 30, endFrame: 60 },
    undefined,
    [asset],
  );
  expect(hook.edits.visuals[0]!.tracking).toEqual(track);
  expect(hook.edits.visuals[0]!.video!.offsetFrame).toBe(45);
  const retained = compileOwnerOverlay(
    clip.base!,
    { ...edit, hook: { startFrame: 30, endFrame: 60 }, hookContent: hook },
    clip.assets,
    clip.audioAssets,
    [asset],
  );
  expect(retained.hookContent!.visuals[0]!.tracking).toEqual(track);
  const cue = overlay.visuals[0]!;
  const raw = { ...cue, tracking: undefined };
  expect(ownerVisualTransform(cue, 15, asset)).toEqual(
    ownerVisualTransform(raw, 15, asset),
  );
  const before = ownerVisualTransform(raw, 45, asset);
  expect(ownerVisualTransform(cue, 45, asset).x).toBeGreaterThan(before.x);
  expect(ownerVisualTransform(cue, 45, asset).zoom).toBe(before.zoom);
  expect(ownerOverlayFrame(overlay, 45).key).not.toBe(
    ownerOverlayFrame({ ...overlay, visuals: [raw] }, 45).key,
  );
  edit.visuals[0]!.video!.offsetFrame++;
  expect(compile).toThrow();
  edit.visuals[0]!.video!.offsetFrame--;
  edit.visuals[0]!.tracking!.assetId = crypto.randomUUID();
  expect(compile).toThrow();
  const later = ownerVisualTrackingSchema.parse({
    ...track,
    startFrame: 6015,
    endFrame: 6075,
  });
  expect(
    ownerVisualTrackingFits({
      ...cue,
      startFrame: 6015,
      endFrame: 6075,
      tracking: later,
    }),
  ).toBe(true);
});

it("rejects picture tracking, gaps, seed mismatch, overlong paths and raw source overflow", () => {
  const { edit, compile } = fixture();
  edit.visuals[0]!.tracking = trackingPath();
  delete edit.visuals[0]!.video;
  expect(compile).toThrow();
  const track = trackingPath();
  expect(
    ownerVisualTrackingSchema.safeParse({ ...track, endFrame: 1000 }).success,
  ).toBe(false);
  expect(
    ownerVisualTrackingSchema.safeParse({
      ...track,
      points: track.points.filter((point) => point.frame !== 2),
    }).success,
  ).toBe(false);
  expect(
    ownerVisualTrackingSchema.safeParse({
      ...track,
      seed: { ...track.seed, x: 0.3 },
    }).success,
  ).toBe(false);
});

it("keeps default-muted video silent, derives one shared sound cue on enable, and preserves source trim/caption boundaries", () => {
  const { clip, edit, compile } = fixture();
  expect(compile().audio).toBeUndefined();
  edit.visuals[0]!.video!.muted = false;
  const overlay = compile();
  expect(overlay.audio?.originalVolume).toBe(100);
  expect(overlay.audio?.cues).toMatchObject([
    {
      id: edit.visuals[0]!.id,
      offsetFrame: 30,
      volume: 40,
      loop: false,
      startFrame: 15,
      endFrame: 75,
    },
  ]);
  expect(ownerOverlayFrame(overlay, 14).visuals).toHaveLength(0);
  expect(ownerOverlayFrame(overlay, 15).visuals).toHaveLength(1);
  expect(ownerOverlayFrame(overlay, 75).visuals).toHaveLength(0);
  expect(ownerOverlayFrame(overlay, 50).caption?.text).toBe(
    "Synthetic captions",
  );
  expect(ownerClipSchema.parse(JSON.parse(JSON.stringify(clip)))).toEqual(clip);
  edit.visuals[0]!.video!.muted = true;
  expect(compile().audio).toBeUndefined();
  expect(edit.visuals[0]!.video!.volume).toBe(40);
});

it("retains independent same-asset trims, gains and explicit front/back order through the real edit operation compiler", () => {
  const { clip, edit, compile } = fixture();
  const first = edit.visuals[0]!;
  edit.visuals.push({
    ...structuredClone(first),
    id: crypto.randomUUID(),
    video: { offsetFrame: 0, volume: 70, muted: false },
  });
  first.video!.muted = false;
  const original = structuredClone(edit),
    draft = structuredClone(edit);
  draft.visuals.reverse();
  const operations = ownerEditOperations(original, draft, clip);
  expect(operations.map((op) => op.kind)).toEqual(["visual-order"]);
  clip.edit = original;
  const changed = applyOwnerEdit(clip, {
    operationId: crypto.randomUUID(),
    expectedRevision: 0,
    baseHash: clip.baseHash,
    operations,
  });
  expect(changed.visuals.map((cue) => cue.id)).toEqual(
    draft.visuals.map((cue) => cue.id),
  );
  clip.edit = changed;
  const overlay = compile();
  expect(
    overlay.audio!.cues.map((cue) => [cue.offsetFrame, cue.volume]),
  ).toEqual([
    [0, 70],
    [30, 40],
  ]);
  expect(ownerOverlayFrame(overlay, 30).visuals.map((cue) => cue.id)).toEqual(
    draft.visuals.map((cue) => cue.id),
  );
});

it("rejects a third simultaneous decoder and source/effect overflow without modifying the valid draft", () => {
  const { edit, compile } = fixture(),
    cue = edit.visuals[0]!;
  edit.visuals.push({ ...structuredClone(cue), id: crypto.randomUUID() });
  expect(ownerVideoOverlapFits(edit.visuals)).toBe(true);
  const before = JSON.stringify(compile());
  edit.visuals.push({ ...structuredClone(cue), id: crypto.randomUUID() });
  expect(ownerVideoOverlapFits(edit.visuals)).toBe(false);
  expect(compile).toThrow();
  edit.visuals.pop();
  expect(JSON.stringify(compile())).toBe(before);
  cue.video!.offsetFrame = 100;
  expect(compile).toThrow();
  cue.video!.offsetFrame = 30;
  cue.video!.sourceEndFrame = 89;
  expect(compile).toThrow();
  cue.video!.sourceEndFrame = 90;
  cue.effect!.endFrame = 76;
  expect(compile).toThrow();
  cue.effect!.endFrame = 60;
  edit.visuals[1]!.startFrame = 75;
  edit.visuals[1]!.endFrame = 90;
  expect(ownerVideoOverlapFits(edit.visuals)).toBe(true);
});

it("uses deterministic easing and holds the end; a Hook preserves exact source offset, gain, order and partial zoom", () => {
  const { clip, edit, compile } = fixture();
  const cue = edit.visuals[0]!;
  expect(ownerVisualTransform(cue, 15)).toEqual({ zoom: 1, x: 0.2, y: 0.5 });
  expect(ownerVisualTransform(cue, 37.5).zoom).toBeCloseTo(1.5);
  expect(ownerVisualTransform(cue, 70)).toEqual({ zoom: 2, x: 0.8, y: 0.5 });
  cue.video!.muted = false;
  const hook = { startFrame: 30, endFrame: 70 };
  edit.hook = hook;
  edit.hookContent = copyOwnerHookContent(
    clip.base!,
    edit,
    [],
    clip.audioAssets!,
    hook,
    undefined,
    clip.videoAssets,
  );
  const copy = edit.hookContent.edits.visuals[0]!;
  expect(copy.video!.offsetFrame).toBe(45);
  expect(copy.video!.volume).toBe(40);
  for (const frame of [30, 45, 60, 69]) {
    const actual = ownerVisualTransform(copy, frame),
      expected = ownerVisualTransform(cue, frame);
    expect(actual.zoom).toBeCloseTo(expected.zoom, 12);
    expect(actual.x).toBeCloseTo(expected.x, 12);
    expect(actual.y).toBeCloseTo(expected.y, 12);
  }
  expect(compile().hookContent?.audio?.cues).toHaveLength(1);
  copy.video!.volume = 15;
  expect(cue.video!.volume).toBe(40);
});
