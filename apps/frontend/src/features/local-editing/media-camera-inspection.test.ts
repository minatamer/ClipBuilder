import { describe, expect, it } from "vitest";
import type { OwnerOverlay } from "../../../../../packages/contracts/local/clips.ts";
import { ownerVisualTransform } from "../../../../../packages/contracts/local/visual-effects.ts";
import { ownerVisualMotion } from "../../../../../packages/contracts/local/visual-clock.ts";
import { mediaCameraInspectionOverlay } from "./media-camera-inspection.ts";
import { visualCameraCrop } from "./visual-camera-target.ts";

const content = (): OwnerOverlay => ({
  version: 1,
  frames: 90,
  captions: [],
  visuals: [
    {
      id: "selected",
      assetId: "asset",
      digest: "a".repeat(64),
      origin: "owner-supplied",
      startFrame: 30,
      endFrame: 90,
      fit: "cover",
      presentation: "full-frame",
      box: { x: 0.1, y: 0.2, width: 0.5, height: 0.3 },
      effect: {
        startFrame: 45,
        endFrame: 90,
        zoom: 2.4,
        fromX: 0.2,
        fromY: 0.4,
        toX: 0.8,
        toY: 0.7,
      },
      video: { offsetFrame: 15, sourceEndFrame: 90, muted: true, volume: 35 },
      entrance: "fade",
      exit: "fade",
      animationFrames: 9,
    },
  ],
});
const end = {
  cueId: "selected",
  occurrence: "body" as const,
  endpoint: "end" as const,
};

describe("temporary media camera crop inspection", () => {
  it.each(["full-frame", "inset"] as const)(
    "matches the source picker's exact %s crop at the current moment",
    (presentation) => {
      const overlay = content();
      const cue = overlay.visuals[0]!;
      cue.presentation = presentation;
      const before = structuredClone(overlay);
      expect(ownerVisualTransform(cue, 30).zoom).toBe(1);
      const inspected = mediaCameraInspectionOverlay(overlay, end, 30);
      const chosen = inspected.visuals[0]!;
      const transform = ownerVisualTransform(chosen, 30);
      expect(transform).toEqual({ x: 0.8, y: 0.7, zoom: 2.4 });
      expect(
        visualCameraCrop(
          chosen,
          { width: 1920, height: 1080 },
          transform,
          transform.zoom,
        ),
      ).toEqual(
        visualCameraCrop(
          cue,
          { width: 1920, height: 1080 },
          { x: 0.8, y: 0.7 },
          2.4,
        ),
      );
      expect(chosen.video).toBe(cue.video);
      expect(chosen.box).toBe(cue.box);
      expect(inspected.captions).toBe(overlay.captions);
      expect(overlay).toEqual(before);
    },
  );
  it("shows Motion start independently of end magnification, including a fading boundary", () => {
    const overlay = content();
    expect(ownerVisualMotion(overlay.visuals[0]!, 89).opacity).toBe(0);
    const start = mediaCameraInspectionOverlay(
      overlay,
      { ...end, endpoint: "start" },
      89,
    );
    expect(ownerVisualTransform(start.visuals[0]!, 89)).toEqual({
      x: 0.2,
      y: 0.4,
      zoom: 1,
    });
    expect(ownerVisualMotion(start.visuals[0]!, 89).opacity).toBe(1);
    expect(ownerVisualMotion(overlay.visuals[0]!, 89).opacity).toBe(0);
  });
  it("keeps other layers, saved path timing and source trims intact for pictures and videos", () => {
    const overlay = content();
    const picture = { ...overlay.visuals[0]!, id: "picture", video: undefined };
    overlay.visuals.push(picture);
    const inspected = mediaCameraInspectionOverlay(
      overlay,
      { ...end, cueId: "picture" },
      50,
    );
    expect(inspected.visuals.map((cue) => cue.id)).toEqual([
      "selected",
      "picture",
    ]);
    expect(inspected.visuals[0]).toBe(overlay.visuals[0]);
    expect(inspected.visuals[1]!.effect!.startFrame).toBe(45);
    expect(inspected.visuals[1]!.effect!.endFrame).toBe(90);
    expect(ownerVisualTransform(inspected.visuals[1]!, 50)).toEqual({
      x: 0.8,
      y: 0.7,
      zoom: 2.4,
    });
  });
  it("isolates independent Hook/body crops and maps the source clock once", () => {
    const overlay = {
      ...content(),
      hook: { startFrame: 15, endFrame: 75 },
      hookContent: content(),
    };
    const hook = { ...end, occurrence: "hook" as const };
    const inspected = mediaCameraInspectionOverlay(overlay, hook, 20);
    expect(inspected.visuals).toBe(overlay.visuals);
    expect(
      ownerVisualTransform(inspected.hookContent!.visuals[0]!, 35).zoom,
    ).toBe(2.4);
    expect(mediaCameraInspectionOverlay(overlay, hook, 90)).toBe(overlay);
    const body = mediaCameraInspectionOverlay(overlay, end, 90);
    expect(body.hookContent).toBe(overlay.hookContent);
    expect(ownerVisualTransform(body.visuals[0]!, 30).zoom).toBe(2.4);
  });
  it("restores normal animation when inspection ends or the selected media is absent", () => {
    const overlay = content();
    expect(mediaCameraInspectionOverlay(overlay, null, 30)).toBe(overlay);
    expect(
      mediaCameraInspectionOverlay(overlay, { ...end, cueId: "missing" }, 30),
    ).toBe(overlay);
    expect(mediaCameraInspectionOverlay(overlay, end, 29)).toBe(overlay);
    expect(mediaCameraInspectionOverlay(overlay, end, 90)).toBe(overlay);
    delete overlay.visuals[0]!.effect;
    expect(mediaCameraInspectionOverlay(overlay, end, 30)).toBe(overlay);
  });
});
