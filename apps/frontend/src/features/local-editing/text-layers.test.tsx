import { expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup as markup } from "react-dom/server";
import { OWNER_SOCIAL_TEXT_PRESETS } from "../../../../../packages/contracts/local/text-style.ts";
import { OWNER_CAPTION_PRESETS } from "../../../../../packages/contracts/local/editor.ts";
import { OwnerAutomaticOverlay } from "../../../../../packages/composition/local/automatic-overlay.tsx";
import { OwnerStyledCaption } from "../../../../../packages/composition/local/styled-caption.tsx";
import { ownerOverlayFrame } from "../../../../../packages/composition/local/overlay-frame.ts";
import { constrainOwnerBox, ownerCaptionPreset } from "./editor-state.ts";
import {
  syntheticTextClip,
  syntheticTextLayer,
} from "../../../../../test/owner-text-fixture.ts";
it.each(["tiktok", "solid", "translucent"] as const)(
  "shares %s typography and preserves caption placement/word identity",
  (preset) => {
    const clip = syntheticTextClip(),
      layer = syntheticTextLayer(preset),
      caption = clip.base!.overlay.captions[0]!;
    const current = {
        ...OWNER_CAPTION_PRESETS.clean,
        box: { x: 0.1, y: 0.2, width: 0.8, height: 0.2 },
      },
      style = ownerCaptionPreset(current, preset);
    expect(style.box).toEqual(current.box);
    const text = markup(
      createElement(OwnerAutomaticOverlay, {
        overlay: { ...clip.base!.overlay, texts: [layer] },
        assets: {},
        frame: 20,
      }),
    );
    const words = markup(
      createElement(OwnerStyledCaption, { caption, ms: 700, style }),
    );
    expect(words).toContain(`data-caption-preset="${preset}"`);
    expect(text).toContain(`data-text-preset="${preset}"`);
    for (const html of [text, words]) {
      expect(html).toContain(
        preset === "tiktok" ? "5px #000000" : "0px #000000",
      );
      expect(html).toContain(
        preset === "solid"
          ? "background-color:#ffffffff"
          : preset === "translucent"
            ? "background-color:#17171799"
            : "background-color:#17171700",
      );
    }
    expect(caption.wordCues.map((word) => word.wordId)).toEqual([
      "w_000001",
      "w_000002",
    ]);
    expect(OWNER_SOCIAL_TEXT_PRESETS[preset].color).toBe(style.color);
  },
);

it("changes raster identity at each text boundary, including text-only overlays and invisible gaps", () => {
  const layer = syntheticTextLayer(),
    overlay = {
      ...syntheticTextClip().base!.overlay,
      captions: [],
      texts: [
        layer,
        {
          ...layer,
          id: crypto.randomUUID(),
          text: "Later",
          startFrame: 70,
          endFrame: 80,
        },
      ],
    };
  const seen = new Map<string, string>();
  for (let frame = 0; frame < 90; frame++) {
    const state = ownerOverlayFrame(overlay, frame),
      html = markup(
        createElement(OwnerAutomaticOverlay, { overlay, assets: {}, frame }),
      );
    if (seen.has(state.key)) expect(html).toBe(seen.get(state.key));
    else seen.set(state.key, html);
    expect(html.includes("data-text-layer")).toBe(
      (frame >= 15 && frame < 60) || (frame >= 70 && frame < 80),
    );
  }
  expect(seen.size).toBe(3);
  for (const frame of [15, 60, 70, 80])
    expect(ownerOverlayFrame(overlay, frame).key).not.toBe(
      ownerOverlayFrame(overlay, frame - 1).key,
    );
  const box = constrainOwnerBox(
    { x: -1, y: 2, width: 0.05, height: 0.001 },
    layer.style,
  );
  expect(box.x).toBe(0.05);
  expect(box.width).toBe(0.2);
  expect(box.y + box.height).toBeCloseTo(0.95);
});

it("escapes user markup and fits long text without discarding characters or hard line breaks", () => {
  const layer = {
    ...syntheticTextLayer(),
    text: '<script>alert("plain")</script>\n' + "W".repeat(400),
  };
  const html = markup(
    createElement(OwnerAutomaticOverlay, {
      overlay: {
        ...syntheticTextClip().base!.overlay,
        captions: [],
        texts: [layer],
      },
      assets: {},
      frame: 20,
    }),
  );
  expect(html).not.toContain("<script>");
  expect(html).toContain("&lt;script&gt;");
  expect((html.match(/W/gu) ?? []).length).toBe(400);
  expect(Number(/font-size:(\d+)px/u.exec(html)?.[1])).toBeGreaterThan(10);
});
