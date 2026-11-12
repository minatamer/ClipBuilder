import { expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { independentHookFixture } from "../../../../../test/owner-hook-fixture.ts";
import { compileOwnerOverlay } from "../../../../../packages/contracts/local/edit-overlay.ts";
import { OwnerAutomaticOverlay } from "../../../../../packages/composition/local/automatic-overlay.tsx";
import { ownerEditOperations, sameOwnerEdit } from "./editor-state.ts";
import { ownerOverlayFrame } from "../../../../../packages/composition/local/overlay-frame.ts";
import { withIndependentOwnerHook } from "../../../../../packages/contracts/local/hook-content.ts";
import {
  defaultOwnerFocus,
  ownerFocusCrop,
  ownerSourceContent,
} from "../../../../../packages/contracts/local/focus.ts";
import {
  ownerCameraCropAt,
  type OwnerCameraEffect,
} from "../../../../../packages/contracts/local/camera-motion.ts";
import { moveFocusPosition } from "./focus-positions.ts";

it("saves framing changes and clips scene visuals above the mattes but below text", () => {
  const clip = independentHookFixture(),
    original = clip.edit!;
  expect(sameOwnerEdit(original, { ...original, blackBars: false })).toBe(true);
  expect(
    ownerEditOperations(original, { ...original, blackBars: true }, clip),
  ).toEqual([{ kind: "black-bars", enabled: true }]);
  const overlay = compileOwnerOverlay(
    clip.base!,
    { ...original, blackBars: true },
    clip.assets,
  );
  const paint = (blackBars: boolean) =>
    renderToStaticMarkup(
      createElement(OwnerAutomaticOverlay, {
        overlay: { ...overlay, blackBars },
        frame: 0,
        assets: { [clip.assets[0]!.id]: "data:image/png;base64,AA==" },
      }),
    );
  const html = paint(true);
  expect(html).toContain('y="0" width="1080" height="420"');
  expect(html).toContain('y="1500" width="1080" height="420"');
  expect(html.indexOf("data-scene-mattes")).toBeLessThan(
    html.indexOf("data-visual-id"),
  );
  expect(html).toContain("clip-path:inset(420px 0 420px 0)");
  expect(html.indexOf("data-scene-mattes")).toBeLessThan(
    html.indexOf("Original"),
  );
  expect(paint(false)).not.toContain("data-scene-mattes");
  expect(sameOwnerEdit(original, { ...original, blackBarPosition: 0.5 })).toBe(
    true,
  );
  expect(
    ownerEditOperations({ ...original, blackBarPosition: 0.2 }, original, clip),
  ).toEqual([{ kind: "black-bars", enabled: false, position: 0.5 }]);
  const edit = withIndependentOwnerHook(
    clip.base!,
    { ...original, blackBars: true },
    clip.assets,
    [],
    { startFrame: 30, endFrame: 90 },
  );
  edit.hookContent!.edits.blackBars = false;
  const hooked = compileOwnerOverlay(clip.base!, edit, clip.assets);
  expect(ownerOverlayFrame(hooked, 0).blackBars).toBe(false);
  expect(ownerOverlayFrame(hooked, 60).blackBars).toBe(true);
});

it("moves the square to every source edge without the old portrait bounds and reopens the same camera", () => {
  for (const source of [
    { width: 1920, height: 1080 },
    { width: 1080, height: 1920 },
  ]) {
    const focus = defaultOwnerFocus(source, 120);
    focus.shots[0]!.zoom = 1.5;
    const content = ownerSourceContent(source);
    for (const position of [0, 0.5, 1]) {
      for (const [x, y] of [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ]) {
        const moved = moveFocusPosition(focus, 0, x!, y!, position);
        const crop = ownerFocusCrop(moved, moved.shots[0]!, position);
        expect(crop.width).toBe(crop.height);
        expect(crop.x).toBe(
          x === 0 ? content.x : content.x + content.width - crop.width,
        );
        expect(crop.y).toBe(
          y === 0 ? content.y : content.y + content.height - crop.height,
        );
        const reopened = JSON.parse(JSON.stringify(moved));
        expect(
          ownerCameraCropAt(reopened, [], 0, "body", 0, [], position),
        ).toEqual(crop);
        expect(ownerFocusCrop(moved, moved.shots[0]!).height).toBeGreaterThan(
          crop.height,
        );
      }
    }
    const upper = moveFocusPosition(focus, 0, 0.5, 0, 0.5);
    const portrait = ownerFocusCrop(upper, upper.shots[0]!);
    expect(ownerFocusCrop(upper, upper.shots[0]!, 0.5).y).toBeLessThan(
      portrait.y + (portrait.height - portrait.width) / 2,
    );
  }
});

it("keeps Zoom and Pan square throughout their transition without changing vertical playback", () => {
  const focus = defaultOwnerFocus({ width: 1920, height: 1080 }, 120);
  const effects: OwnerCameraEffect[] = [
    {
      id: "00000000-0000-4000-8000-000000000001",
      occurrence: "body",
      startFrame: 0,
      zoomFrames: 12,
      holdFrames: 18,
      returnFrames: 0,
      target: { centerX: 0.3, centerY: 0.1, zoom: 2 },
    },
    {
      id: "00000000-0000-4000-8000-000000000002",
      kind: "pan",
      occurrence: "body",
      startFrame: 30,
      zoomFrames: 12,
      holdFrames: 18,
      returnFrames: 0,
      target: { centerX: 0.8, centerY: 0.9, zoom: 2 },
    },
  ];
  const content = ownerSourceContent(focus.source);
  for (let frame = 0; frame < 60; frame++) {
    const crop = ownerCameraCropAt(
      focus,
      effects,
      frame,
      "body",
      frame,
      [],
      0.5,
    );
    expect(crop.width).toBeCloseTo(crop.height, 8);
    expect(crop.x).toBeGreaterThanOrEqual(content.x);
    expect(crop.y).toBeGreaterThanOrEqual(content.y);
    expect(crop.x + crop.width).toBeLessThanOrEqual(
      content.x + content.width + 1e-7,
    );
    expect(crop.y + crop.height).toBeLessThanOrEqual(
      content.y + content.height + 1e-7,
    );
  }
  const vertical = ownerCameraCropAt(focus, effects, 45, "body", 45);
  expect(vertical.height / vertical.width).toBeCloseTo(16 / 9, 8);
});
