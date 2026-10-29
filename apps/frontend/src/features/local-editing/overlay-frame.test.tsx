import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { OwnerAutomaticOverlay } from "../../../../../packages/composition/local/automatic-overlay.tsx";
import { ownerOverlayFrame } from "../../../../../packages/composition/local/overlay-frame.ts";
import type { OwnerOverlay } from "../../../../../packages/contracts/local/clips.ts";
import { ownerPresentationFrames } from "../../../../../packages/contracts/local/hook.ts";
import { OWNER_CAPTION_PRESETS } from "../../../../../packages/contracts/local/editor.ts";
import {
  defaultOwnerFocus,
  ownerFocusAt,
  ownerFocusCrop,
} from "../../../../../packages/contracts/local/focus.ts";
import { ownerSourceFrame } from "../../../../../packages/contracts/local/hook.ts";
import { OWNER_SOCIAL_TEXT_PRESETS } from "../../../../../packages/contracts/local/text-style.ts";

it("repeats speaker colors, captions and animated pictures/text using source time while trimming only the hook caption", () => {
  const focus = defaultOwnerFocus({ width: 1280, height: 720 }, 90);
  focus.shots = [
    { ...focus.shots[0]!, endFrame: 30, centerX: 0.25 },
    {
      ...focus.shots[0]!,
      startFrame: 30,
      centerX: 0.75,
      centerY: 0.65,
      zoom: 1.6,
    },
  ];
  const overlay: OwnerOverlay = {
    version: 1,
    frames: 90,
    hook: { startFrame: 24, endFrame: 36 },
    captionStyle: {
      ...OWNER_CAPTION_PRESETS.boxed,
      fontSize: 84,
      box: { x: 0.1, y: 0.4, width: 0.8, height: 0.3 },
    },
    focus,
    videoLook: { preset: "warm", strength: 70 },
    captionSpeakers: {
      enabled: true,
      colors: [
        {
          speakerId: "spk_0",
          color: "#ff0000",
          backgroundColor: "#000000",
          highlight: "#ff8800",
        },
        {
          speakerId: "spk_1",
          color: "#0000ff",
          backgroundColor: "#000000",
          highlight: "#0088ff",
        },
      ],
      assignments: [
        { wordId: "w_000001", speakerId: "spk_0" },
        { wordId: "w_000002", speakerId: "spk_1" },
      ],
    },
    captions: [
      {
        startMs: 0,
        endMs: 2000,
        text: "First second",
        lines: ["First second"],
        wordIds: ["w_000001", "w_000002"],
        wordCues: [
          { wordId: "w_000001", text: "First", startMs: 0, endMs: 1000 },
          { wordId: "w_000002", text: "second", startMs: 1000, endMs: 2000 },
        ],
      },
    ],
    visuals: [
      {
        id: crypto.randomUUID(),
        assetId: crypto.randomUUID(),
        digest: "a".repeat(64),
        startFrame: 10,
        endFrame: 50,
        origin: "synthetic",
        box: { x: 0.1, y: 0.1, width: 0.8, height: 0.3 },
        fit: "contain",
        entrance: "fade",
        exit: "slide",
        animationFrames: 9,
      },
    ],
    texts: [
      {
        id: crypto.randomUUID(),
        text: "Owner text",
        startFrame: 26,
        endFrame: 34,
        style: {
          ...OWNER_SOCIAL_TEXT_PRESETS.tiktok,
          color: "#ffff00",
          box: { x: 0.2, y: 0.6, width: 0.6, height: 0.2 },
        },
      },
    ],
  };
  const seen = new Map<string, string>();
  for (let frame = 0; frame < ownerPresentationFrames(overlay); frame++) {
    const state = ownerOverlayFrame(overlay, frame),
      html = renderToStaticMarkup(
        <OwnerAutomaticOverlay
          overlay={overlay}
          assets={{
            [overlay.visuals[0]!.assetId]: "data:image/jpeg;base64,synthetic",
          }}
          frame={frame}
        />,
      );
    if (seen.has(state.key)) expect(html).toBe(seen.get(state.key));
    else seen.set(state.key, html);
  }
  expect(ownerOverlayFrame(overlay, 0).caption?.startMs).toBe(800);
  expect(ownerOverlayFrame(overlay, 8).caption?.endMs).toBe(1200);
  expect(ownerOverlayFrame(overlay, 0).colors?.speakerId).toBe("spk_0");
  expect(ownerOverlayFrame(overlay, 8).colors?.speakerId).toBe("spk_1");
  expect(ownerOverlayFrame(overlay, 36).ms).toBe(
    ownerOverlayFrame(overlay, 0).ms,
  );
  expect(ownerOverlayFrame(overlay, 12).frame).toBe(0);
  const assets = {
    [overlay.visuals[0]!.assetId]: "data:image/jpeg;base64,synthetic",
  };
  for (let frame = 0; frame < 12; frame++) {
    const bodyFrame = 36 + frame,
      repeated = ownerOverlayFrame(overlay, frame),
      ordinary = ownerOverlayFrame(overlay, bodyFrame);
    expect(repeated.frame).toBe(ordinary.frame);
    expect(repeated.visuals).toEqual(ordinary.visuals);
    expect(repeated.texts).toEqual(ordinary.texts);
    expect(repeated.colors).toEqual(ordinary.colors);
    const shot = ownerFocusAt(focus, ownerSourceFrame(overlay, frame));
    expect(shot).toEqual(
      ownerFocusAt(focus, ownerSourceFrame(overlay, bodyFrame)),
    );
    expect(shot.centerX).toBe(frame < 6 ? 0.25 : 0.75);
    expect(shot.zoom).toBe(frame < 6 ? 1 : 1.6);
    expect(ownerFocusCrop(focus, shot)).toEqual(
      ownerFocusCrop(focus, ownerFocusAt(focus, ordinary.frame)),
    );
    // Caption words are deliberately excerpted at Hook boundaries; every other
    // layer's actual React geometry and animation state must be identical.
    const paint = (at: number) =>
      renderToStaticMarkup(
        <OwnerAutomaticOverlay
          overlay={{ ...overlay, captions: [] }}
          assets={assets}
          frame={at}
        />,
      );
    expect(paint(frame)).toBe(paint(bodyFrame));
  }
  expect(ownerOverlayFrame(overlay, 0).colors?.color).toBe("#ff0000");
  expect(ownerOverlayFrame(overlay, 8).colors?.color).toBe("#0000ff");
  expect(ownerOverlayFrame(overlay, 0).texts).toHaveLength(0);
  expect(ownerOverlayFrame(overlay, 4).texts).toHaveLength(1);
  expect(ownerOverlayFrame(overlay, 10).texts).toHaveLength(0);
});

it("reuses frames only when the shared React output is identical, preserving highlight onset and cue boundaries", () => {
  const overlay: OwnerOverlay = {
    version: 1,
    frames: 90,
    visuals: [
      {
        id: crypto.randomUUID(),
        assetId: crypto.randomUUID(),
        digest: "a".repeat(64),
        startFrame: 5,
        endFrame: 45,
        box: { x: 0.1, y: 0.5, width: 0.8, height: 0.2 },
        fit: "contain",
        origin: "synthetic",
      },
    ],
    captions: [
      {
        startMs: 0,
        endMs: 2100,
        text: "Synthetic words",
        wordIds: ["w_000001", "w_000002"],
        lines: ["Synthetic words"],
        wordCues: [
          { wordId: "w_000001", text: "Synthetic", startMs: 0, endMs: 800 },
          { wordId: "w_000002", text: "words", startMs: 1000, endMs: 2000 },
        ],
      },
    ],
  };
  const seen = new Map<string, string>();
  for (let frame = 0; frame < overlay.frames; frame++) {
    const html = renderToStaticMarkup(
        <OwnerAutomaticOverlay
          overlay={overlay}
          assets={{
            [overlay.visuals[0]!.assetId]: "data:image/jpeg;base64,synthetic",
          }}
          frame={frame}
        />,
      ),
      key = ownerOverlayFrame(overlay, frame).key;
    if (seen.has(key)) expect(html).toBe(seen.get(key));
    else seen.set(key, html);
  }
  expect(seen.size).toBeLessThan(20);
  expect(ownerOverlayFrame(overlay, 0).key).not.toBe(
    ownerOverlayFrame(overlay, 1).key,
  );
  expect(ownerOverlayFrame(overlay, 4).key).not.toBe(
    ownerOverlayFrame(overlay, 5).key,
  );
  expect(ownerOverlayFrame(overlay, 44).key).not.toBe(
    ownerOverlayFrame(overlay, 45).key,
  );
});
