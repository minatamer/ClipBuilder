import { describe, expect, it } from "vitest";
import type { OwnerVisualEdit } from "../../../../../packages/contracts/local/assets.ts";
import {
  removeVisualMotion,
  removeVisualZoom,
  setVisualZoom,
  visualCameraCrop,
  visualCameraPoint,
  visualCameraSourceFrame,
  visualHasMotion,
} from "./visual-camera-target.ts";

const cue = (): OwnerVisualEdit => ({
  id: crypto.randomUUID(),
  assetId: crypto.randomUUID(),
  startFrame: 300,
  endFrame: 600,
  fit: "cover",
  presentation: "full-frame",
  box: { x: 0.1, y: 0.2, width: 0.4, height: 0.225 },
  effect: {
    startFrame: 330,
    endFrame: 570,
    zoom: 2,
    fromX: 0.2,
    fromY: 0.3,
    toX: 0.8,
    toY: 0.7,
  },
});
describe("placed-media Camera target geometry", () => {
  it("changes zoom around the chosen source center while keeping the motion start", () => {
    const item = cue(),
      asset = { width: 1920, height: 1080 };
    const before = visualCameraCrop(
      item,
      asset,
      { x: item.effect!.toX, y: item.effect!.toY },
      2,
    );
    const next = setVisualZoom(item, asset, 3);
    const after = visualCameraCrop(
      next,
      asset,
      { x: next.effect!.toX, y: next.effect!.toY },
      3,
    );
    expect(after.x + after.width / 2).toBeCloseTo(before.x + before.width / 2);
    expect(after.y + after.height / 2).toBeCloseTo(
      before.y + before.height / 2,
    );
    expect(next.effect!.fromX).toBe(item.effect!.fromX);
    expect(next.effect!.fromY).toBe(item.effect!.fromY);
    expect(setVisualZoom(item, asset, NaN).effect!.toX).toBe(item.effect!.toX);
  });
  it("keeps fixed picture zoom fixed when magnification changes", () => {
    const item = cue();
    item.effect = { ...item.effect!, fromX: 0.8, fromY: 0.7 };
    const next = setVisualZoom(item, { width: 1920, height: 1080 }, 2.5);
    expect(visualHasMotion(next)).toBe(false);
    expect(next.effect!.zoom).toBe(2.5);
  });
  it("combines landscape source, vertical cover and zoom into the actual source crop", () => {
    const crop = visualCameraCrop(
      cue(),
      { width: 1920, height: 1080 },
      { x: 0.8, y: 0.7 },
      2,
    );
    expect(crop.width).toBeCloseTo(0.158203125);
    expect(crop.height).toBe(0.5);
    expect(crop.x).toBeCloseTo((1 - crop.width) * 0.8);
    expect(crop.y).toBeCloseTo(0.35);
    const point = visualCameraPoint(crop, {
      x: crop.x + crop.width / 2,
      y: crop.y + crop.height / 2,
    });
    expect(point.x).toBeCloseTo(0.8);
    expect(point.y).toBeCloseTo(0.7);
    expect(visualCameraPoint(crop, { x: -1, y: 2 })).toEqual({ x: 0, y: 1 });
  });
  it("uses inset geometry and retains contain letterboxing in source space", () => {
    const item = { ...cue(), presentation: "inset" as const };
    const crop = visualCameraCrop(
      item,
      { width: 1920, height: 1080 },
      { x: 0.5, y: 0.5 },
      1,
    );
    expect(crop.width).toBeCloseTo(0.5625);
    expect(crop.height).toBe(1);
    const contain = visualCameraCrop(
      { ...item, fit: "contain" },
      { width: 1920, height: 1080 },
      { x: 0.5, y: 0.5 },
      1,
    );
    expect(contain.width).toBe(1);
    expect(contain.height).toBeCloseTo(16 / 9);
    expect(contain.y).toBeLessThan(0);
  });
  it("keeps an uncropped axis centered without non-finite coordinates", () => {
    const crop = visualCameraCrop(
      { ...cue(), presentation: "inset" },
      { width: 240, height: 240 },
      { x: 0.5, y: 0.5 },
      1,
    );
    expect(visualCameraPoint(crop, { x: 0.1, y: 0.9 })).toEqual({
      x: 0.5,
      y: 0.5,
    });
  });
  it("maps effect frames into a trimmed source once, including Hook source offsets", () => {
    const item = {
      ...cue(),
      startFrame: 630,
      endFrame: 720,
      video: { offsetFrame: 90, sourceEndFrame: 300, volume: 100, muted: true },
    };
    expect(visualCameraSourceFrame(item, 660)).toBe(120);
    expect(visualCameraSourceFrame(item, 0)).toBe(90);
    expect(visualCameraSourceFrame(item, 999)).toBe(179);
  });
  it("removes magnification without changing the motion path or its timing", () => {
    const item = cue(),
      next = removeVisualZoom(item);
    expect(next.effect).toEqual({ ...item.effect, zoom: 1 });
    expect(item.effect?.zoom).toBe(2);
  });
  it("removes pan but retains the final zoom target and timing", () => {
    const item = cue(),
      next = removeVisualMotion(item);
    expect(next.effect).toEqual({ ...item.effect, fromX: 0.8, fromY: 0.7 });
    expect(visualHasMotion(next)).toBe(false);
    expect(removeVisualZoom(next).effect).toBeUndefined();
    expect(
      removeVisualMotion({ ...item, effect: { ...item.effect!, zoom: 1 } })
        .effect,
    ).toBeUndefined();
  });
  it("keeps a blank fixed zoom point fixed while it is corrected", () => {
    const item = cue();
    item.effect = {
      ...item.effect!,
      fromX: NaN,
      toX: NaN,
      fromY: 0.5,
      toY: 0.5,
    };
    expect(visualHasMotion(item)).toBe(false);
  });
});
