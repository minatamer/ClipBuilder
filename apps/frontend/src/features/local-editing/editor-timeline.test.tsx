import { expect, it } from "vitest";
import { createElement, createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { PlayerRef } from "@remotion/player";
import { independentHookFixture } from "../../../../../test/owner-hook-fixture.ts";
import { withIndependentOwnerHook } from "../../../../../packages/contracts/local/hook-content.ts";
import { compileOwnerOverlay } from "../../../../../packages/contracts/local/edit-overlay.ts";
import {
  editorTimelineItems,
  editorTimelineVisual,
} from "./editor-timeline.ts";
import {
  EditorHookClock,
  EditorOccurrence,
  EditorPresentationClock,
  editorClockOffset,
} from "./editor-clock.ts";
import { PictureTiming } from "./picture-timing.tsx";

function fixture() {
  const clip = independentHookFixture();
  const edit = withIndependentOwnerHook(
    clip.base!,
    clip.edit!,
    clip.assets,
    [],
    { startFrame: 30, endFrame: 90 },
  );
  return {
    clip,
    edit,
    overlay: compileOwnerOverlay(clip.base!, edit, clip.assets, []),
  };
}

it("projects Home camera targets, partial tracking windows and video source thumbnails through each occurrence exactly once", () => {
  const { overlay } = fixture();
  overlay.cameraEffects = (["hook", "body"] as const).map((occurrence) => ({
    id: crypto.randomUUID(),
    occurrence,
    startFrame: 12,
    zoomFrames: 6,
    holdFrames: 0,
    returnFrames: 0,
    target: { centerX: 0.5, centerY: 0.5, zoom: 2 },
  }));
  for (const content of [overlay, overlay.hookContent!]) {
    const cue = content.visuals[0]!;
    cue.startFrame = 0;
    cue.endFrame = 150;
    cue.video = {
      offsetFrame: 10,
      sourceEndFrame: 150,
      muted: true,
      volume: 100,
    };
    cue.effect = {
      startFrame: 45,
      endFrame: 60,
      zoom: 1.5,
      fromX: 0.4,
      toX: 0.6,
      fromY: 0.5,
      toY: 0.5,
    };
    cue.tracking = {
      assetId: cue.assetId,
      startFrame: 45,
      endFrame: 60,
      sourceStartFrame: 55,
      seed: { x: 0.4, y: 0.4, width: 0.2, height: 0.2 },
      outcome: "complete",
      points: Array.from({ length: 15 }, (_, frame) => ({
        frame,
        x: 0.5,
        y: 0.5,
      })),
    };
  }
  const effects = editorTimelineItems(overlay, "effect");
  expect(
    effects
      .filter((item) => item.targetId === "original")
      .map((item) => [
        item.occurrence,
        item.startFrame,
        item.endFrame,
        item.effectTab,
      ]),
  ).toEqual([
    ["hook", 12, 18, "zoom"],
    ["body", 72, 78, "zoom"],
  ]);
  expect(
    effects
      .filter((item) => item.effectTab === "motion")
      .map((item) => [
        item.occurrence,
        item.startFrame,
        item.endFrame,
        item.targetId,
      ]),
  ).toEqual([
    ["hook", 15, 30, overlay.visuals[0]!.id],
    ["body", 105, 120, overlay.visuals[0]!.id],
  ]);
  expect(effects.filter((item) => item.effectTab === "pan")).toHaveLength(2);
  expect(
    editorTimelineItems(overlay, "picture").map(
      (item) => editorTimelineVisual(overlay, item).frame,
    ),
  ).toEqual([40, 10]);
});

it("seeds filter rows from camera positions and preserves custom ranges across positions", () => {
  const { overlay } = fixture();
  for (const content of [overlay, overlay.hookContent!]) {
    const shot = content.focus!.shots[0]!;
    content.focus!.shots = [
      { ...shot, endFrame: 60 },
      { ...shot, startFrame: 60 },
    ];
  }
  expect(
    editorTimelineItems(overlay, "look").map((item) => [
      item.occurrence,
      item.startFrame,
      item.endFrame,
    ]),
  ).toEqual([
    ["hook", 0, 30],
    ["hook", 30, 60],
    ["body", 60, 120],
    ["body", 120, 180],
  ]);
  overlay.videoLooks = [
    { preset: "mono", strength: 100, startFrame: 30, endFrame: 90 },
  ];
  const items = editorTimelineItems(overlay, "look"),
    body = items.filter((item) => item.occurrence === "body");
  expect(body.map((item) => [item.startFrame, item.endFrame])).toEqual([
    [60, 90],
    [90, 150],
    [150, 180],
  ]);
  expect(body[1]!.title).toContain("Custom position 1 → Custom position 2");
  expect(body[1]!.title).toContain("Black and white");
  expect(items.filter((item) => item.occurrence === "hook")).toHaveLength(2);
});

it("lists both independent occurrences in presentation order without merging repeated IDs", () => {
  const { overlay } = fixture();
  for (const kind of [
    "picture",
    "text",
    "caption",
    "camera",
    "look",
    "audio",
  ] as const) {
    const items = editorTimelineItems(overlay, kind);
    expect(items.some((item) => item.occurrence === "hook")).toBe(true);
    expect(items.some((item) => item.occurrence === "body")).toBe(true);
    expect(new Set(items.map((item) => item.key)).size).toBe(items.length);
    expect(items.map((item) => item.startFrame)).toEqual(
      items.map((item) => item.startFrame).toSorted((a, b) => a - b),
    );
    for (const item of items) {
      expect(item.startFrame).toBeGreaterThanOrEqual(
        item.occurrence === "hook" ? 0 : 60,
      );
      expect(item.endFrame).toBeLessThanOrEqual(
        item.occurrence === "hook" ? 60 : 180,
      );
      expect(item.title.includes("[Hook]")).toBe(item.occurrence === "hook");
    }
  }
  const pictures = editorTimelineItems(overlay, "picture");
  expect(
    pictures.map((item) => [item.id, item.startFrame, item.endFrame]),
  ).toEqual([
    [overlay.visuals[0]!.id, 0, 60],
    [overlay.visuals[0]!.id, 60, 180],
  ]);
});

it("keeps future items and their full clock independently from the selected or playing frame", () => {
  const { overlay } = fixture();
  overlay.visuals.push({
    ...overlay.visuals[0]!,
    id: "future_picture",
    startFrame: 100,
    endFrame: 120,
  });
  expect(editorTimelineItems(overlay, "picture").at(-1)).toMatchObject({
    occurrence: "body",
    startFrame: 160,
    endFrame: 180,
  });
});

it("maps independent opening-title clocks once and handles clips without a Hook", () => {
  const { overlay } = fixture();
  overlay.texts![0]!.role = "opening-title";
  overlay.texts![0]!.startFrame = 0;
  overlay.texts![0]!.endFrame = 30;
  overlay.hookContent!.texts![0]!.role = "opening-title";
  overlay.hookContent!.texts![0]!.startFrame = 0;
  overlay.hookContent!.texts![0]!.endFrame = 15;
  expect(
    editorTimelineItems(overlay, "text").map((item) => [
      item.startFrame,
      item.endFrame,
    ]),
  ).toEqual([
    [0, 15],
    [60, 90],
  ]);
  delete overlay.hook;
  delete overlay.hookContent;
  expect(editorTimelineItems(overlay, "text")).toMatchObject([
    { occurrence: "body", startFrame: 0, endFrame: 30 },
  ]);
});

it.each(["hook", "body"] as const)(
  "displays %s source timing on the final-video clock without changing stored source endpoints",
  (occurrence) => {
    const hook = { startFrame: 30, endFrame: 90 },
      cue = { startFrame: 60, endFrame: 75 };
    const offset = editorClockOffset(hook, occurrence);
    const markup = renderToStaticMarkup(
      createElement(
        EditorPresentationClock,
        { value: true },
        createElement(
          EditorHookClock,
          { value: hook },
          createElement(
            EditorOccurrence,
            { value: occurrence },
            createElement(PictureTiming, {
              cue,
              frames: 120,
              player: createRef<PlayerRef>(),
              available: false,
              attempt: 0,
              onChange: () => {},
            }),
          ),
        ),
      ),
    );
    expect(markup).toContain(`value="${(cue.startFrame + offset) / 30}"`);
    expect(markup).toContain(`value="${(cue.endFrame + offset) / 30}"`);
    expect(cue).toEqual({ startFrame: 60, endFrame: 75 });
    expect(editorClockOffset(hook, occurrence, true)).toBe(
      occurrence === "hook" ? 0 : 60,
    );
    expect(editorClockOffset(hook, undefined)).toBe(0);
  },
);
