import { expect, it } from "vitest";
import { createElement, createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { PlayerRef } from "@remotion/player";
import { independentHookFixture } from "../../../../../test/owner-hook-fixture.ts";
import { withIndependentOwnerHook } from "../../../../../packages/contracts/local/hook-content.ts";
import { compileOwnerOverlay } from "../../../../../packages/contracts/local/edit-overlay.ts";
import { editorTimelineItems } from "./editor-timeline.ts";
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
