import { expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { independentHookFixture } from "../../../../../test/owner-hook-fixture.ts";
import { compileOwnerOverlay } from "../../../../../packages/contracts/local/edit-overlay.ts";
import { OwnerAutomaticOverlay } from "../../../../../packages/composition/local/automatic-overlay.tsx";
import { ownerOverlayFrame } from "../../../../../packages/composition/local/overlay-frame.ts";
import { ownerEditOperations, sameOwnerEdit } from "./editor-state.ts";

it("records the media flag as one undoable cue edit without changing other settings", () => {
  const clip = independentHookFixture(),
    original = structuredClone(clip.edit!);
  const cue = { ...original.visuals[0]!, ignoreBlackBars: true };
  const draft = { ...original, visuals: [cue] };
  expect(sameOwnerEdit(original, draft)).toBe(false);
  expect(ownerEditOperations(original, draft, clip)).toEqual([
    { kind: "visual-upsert", cue },
  ]);
  expect(sameOwnerEdit(original, structuredClone(original))).toBe(true);
});

it("retains mixed layer order while clipping only opted-in scene visuals and keeps captions/text above them", () => {
  const clip = independentHookFixture();
  const overlay = compileOwnerOverlay(
    clip.base!,
    { ...clip.edit!, blackBars: true },
    clip.assets,
  );
  const first = overlay.visuals[0]!;
  const videoId = randomUUID();
  overlay.videoAssets = [
    {
      id: videoId,
      digest: "f".repeat(64),
      bytes: 100,
      width: 100,
      height: 100,
      frames: 120,
      hasAudio: false,
    },
  ];
  overlay.visuals = [
    { ...first, id: randomUUID(), ignoreBlackBars: true },
    {
      ...first,
      id: randomUUID(),
      assetId: videoId,
      origin: "owner-supplied",
      digest: "f".repeat(64),
      ignoreBlackBars: false,
      video: { offsetFrame: 0, volume: 0, muted: true },
    },
  ];
  const paint = () =>
    renderToStaticMarkup(
      createElement(OwnerAutomaticOverlay, {
        overlay,
        frame: 0,
        assets: {
          [first.assetId]: "data:image/png;base64,AA==",
          [videoId]: "video.mp4",
        },
      }),
    );
  const html = paint();
  const order = overlay.visuals.map((c) =>
    html.indexOf(`data-visual-id="${c.id}"`),
  );
  expect(order[0]).toBeGreaterThan(html.indexOf("data-scene-mattes"));
  expect(order[1]).toBeGreaterThan(order[0]!);
  expect(html.indexOf("Original")).toBeGreaterThan(order[1]!);
  expect(html.match(/clip-path:inset\(420px 0 420px 0\)/g)).toHaveLength(1);
  expect(html).toContain("<video");
  const key = ownerOverlayFrame(overlay, 0).key;
  overlay.visuals[0]!.ignoreBlackBars = false;
  expect(ownerOverlayFrame(overlay, 0).key).not.toBe(key);
  overlay.blackBars = false;
  expect(paint()).not.toContain("clip-path:inset");
  expect(paint()).not.toContain("data-scene-mattes");
});
