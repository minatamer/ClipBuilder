import { expect, it } from "vitest";
import { ownerClipSchema } from "./clips.ts";
import { OWNER_SOCIAL_TEXT_PRESETS } from "./text-style.ts";
import { ownerTextLayerSchema } from "./text-layers.ts";
import {
  editOwnerStyledText,
  normalizeOwnerStyledText,
  resolveOwnerTitleEmphasis,
  styleOwnerTextRange,
} from "./text-ranges.ts";
import { automaticOwnerEdit, compileOwnerOverlay } from "./edit-overlay.ts";
import { withIndependentOwnerHook } from "./hook-content.ts";

// Contract-only values: no fixture/application dependency enters this boundary.
function syntheticTextLayer() {
  return ownerTextLayerSchema.parse({
    id: crypto.randomUUID(),
    text: "A synthetic title",
    startFrame: 15,
    endFrame: 60,
    style: {
      ...OWNER_SOCIAL_TEXT_PRESETS.tiktok,
      box: { x: 0.1, y: 0.1, width: 0.8, height: 0.2 },
    },
  });
}
function syntheticTextClip() {
  const id = crypto.randomUUID(),
    analysisId = crypto.randomUUID(),
    momentId = crypto.randomUUID();
  return ownerClipSchema.parse({
    id,
    analysisId,
    momentId,
    mode: "synthetic-ai",
    sourceRevision: 0,
    revision: 0,
    assemblyRevision: 0,
    state: "review-ready",
    assets: [],
    outputs: [],
    preview: { frames: 90, bytes: 1000 },
    calls: { plan: 0, image: 0, render: 0 },
    error: null,
    baseHash: "a".repeat(64),
    edit: null,
    base: {
      version: 1,
      analysisId,
      momentId,
      sourceRevision: 0,
      fingerprint: "b".repeat(64),
      processingIdentity: "c".repeat(64),
      cut: { startFrame: 0, endFrame: 90 },
      words: [],
      overlay: { version: 1, frames: 90, visuals: [], captions: [], texts: [] },
    },
  });
}

it("patches only selected properties, splits/merges ranges and clears only the selection", () => {
  const text = "Why buyers wait";
  let spans = styleOwnerTextRange(text, [], 4, 10, {
    color: "#FF3B30",
    font: "Georgia",
  });
  spans = styleOwnerTextRange(text, spans, 7, 10, { fontWeight: 900 });
  expect(spans).toEqual([
    { start: 4, end: 7, style: { color: "#FF3B30", font: "Georgia" } },
    {
      start: 7,
      end: 10,
      style: { color: "#FF3B30", font: "Georgia", fontWeight: 900 },
    },
  ]);
  expect(
    styleOwnerTextRange(text, spans, 7, 10, {
      font: "Georgia",
      fontWeight: 900,
    }),
  ).toEqual(spans);
  expect(styleOwnerTextRange(text, spans, 4, 7, null)).toEqual([spans[1]]);
  expect(
    styleOwnerTextRange(text, spans, 7, 10, { fontWeight: undefined }),
  ).toHaveLength(1);
});
it("rebases insert/replace/delete and never transfers a deleted accent to its neighbor", () => {
  const spans = [{ start: 4, end: 10, style: { color: "#FF3B30" } }];
  expect(
    editOwnerStyledText("Why buyers wait", spans, "Why wait").spans,
  ).toEqual([]);
  expect(
    editOwnerStyledText("Why buyers wait", spans, "Now Why buyers wait").spans,
  ).toEqual([{ ...spans[0], start: 8, end: 14 }]);
  expect(
    editOwnerStyledText("Why buyers wait", spans, "Why buyer!s wait").spans,
  ).toEqual([{ ...spans[0], end: 11 }]);
  expect(
    editOwnerStyledText(
      "Why buyers wait",
      spans,
      "Why shoppers wait",
      {},
      { start: 4, end: 10 },
    ).spans,
  ).toEqual([]);
});
it("normalizes NFC/CRLF/trim and offsets together, rejecting divided graphemes and bounded overflow", () => {
  expect(
    normalizeOwnerStyledText("  cafe\u0301\r\nnext  ", [
      { start: 2, end: 7, style: { font: "Georgia" } },
    ]),
  ).toEqual({
    text: "café\nnext",
    spans: [{ start: 0, end: 4, style: { font: "Georgia" } }],
  });
  for (const text of ["👩‍🚀", "e\u0301", "🇬🇧"])
    expect(() =>
      styleOwnerTextRange(text, [], 0, 1, { color: "#FF0000" }),
    ).toThrow();
  const text = "x".repeat(100),
    spans = Array.from({ length: 32 }, (_, index) => ({
      start: index * 2,
      end: index * 2 + 1,
      style: { color: "#FF0000" },
    }));
  expect(() =>
    styleOwnerTextRange(text, spans, 90, 91, { color: "#FF0000" }),
  ).toThrow("32");
  expect(spans).toHaveLength(32);
  const layer = {
    ...syntheticTextLayer(),
    text: "hello",
    spans: [{ start: 0, end: 99, style: {} }],
  };
  expect(ownerTextLayerSchema.safeParse(layer).success).toBe(false);
  expect(
    ownerTextLayerSchema.safeParse({
      ...layer,
      spans: [{ start: 0, end: 2, style: { font: "https://bad.test/font" } }],
    }).success,
  ).toBe(false);
});
it("resolves exact repeated phrase identity and ignores malformed optional AI style", () => {
  expect(
    resolveOwnerTitleEmphasis("Go buyers go buyers", [
      { text: "buyers", occurrence: 1, style: { color: "#FF3B30" } },
    ]),
  ).toEqual([{ start: 13, end: 19, style: { color: "#FF3B30" } }]);
  expect(
    resolveOwnerTitleEmphasis("Go buyers", [
      { text: "missing", occurrence: 0, style: { color: "#FF3B30" } },
      { text: "buyers", occurrence: 0, style: { color: "red;url(x)" } },
    ]),
  ).toEqual([]);
});
it("retains normalized spans across edit transport, reopening and independent Hook compilation", () => {
  const clip = syntheticTextClip();
  const layer = {
    ...syntheticTextLayer(),
    text: "Why buyers wait",
    startFrame: 0,
    endFrame: 75,
    role: "opening-title" as const,
    spans: [
      {
        start: 4,
        end: 10,
        style: { color: "#FF3B30", font: "Georgia" as const },
      },
    ],
  };
  clip.base!.overlay.texts = [layer];
  clip.base!.overlay.captions = [];
  let document = automaticOwnerEdit(clip.base!, clip.id, clip.baseHash!);
  document = withIndependentOwnerHook(clip.base!, document, [], [], {
    startFrame: 0,
    endFrame: 30,
  });
  clip.edit = document;
  const main = {
    ...layer,
    spans: [{ start: 4, end: 10, style: { color: "#64D2FF" } }],
  };
  const edit = { ...document, texts: [main] };
  const overlay = compileOwnerOverlay(
    clip.base!,
    JSON.parse(JSON.stringify(edit)),
    [],
  );
  expect(overlay.texts![0]!.spans).toEqual(main.spans);
  expect(overlay.hookContent!.texts![0]!.spans).toEqual(layer.spans);
  expect(clip.base!.overlay.texts[0]!.spans).toEqual(layer.spans);
});
