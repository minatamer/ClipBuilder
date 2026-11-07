import { expect, it } from "vitest";
import { independentHookFixture } from "../../../../../test/owner-hook-fixture.ts";
import { editorPreviewForm } from "./editor-preview-form.ts";
import { defaultCameraZoom } from "./camera-zoom-default.ts";

it("paints valid Zoom changes immediately and retains that draft through blank/invalid numbers", () => {
  const clip = independentHookFixture(),
    original = clip.edit!;
  const result = defaultCameraZoom({
    focus: original.focus!,
    hook: undefined,
    frame: 0,
  });
  if (!("effect" in result)) throw new Error("missing_default");
  const effect = { id: crypto.randomUUID(), ...result.effect };
  const draft = { ...original, cameraEffects: [effect] };
  const first = editorPreviewForm(null, { original, draft }, clip);
  const changed = {
    ...draft,
    cameraEffects: [{ ...effect, target: { ...effect.target, zoom: 2 } }],
  };
  const second = editorPreviewForm(first, { original, draft: changed }, clip);
  expect(second.preview!.cameraEffects![0]!.target.zoom).toBe(2);
  for (const invalid of [
    { ...effect, zoomFrames: NaN },
    { ...effect, zoomFrames: 121 },
    { ...effect, target: { ...effect.target, zoom: NaN } },
  ]) {
    const state = editorPreviewForm(
      second,
      { original, draft: { ...draft, cameraEffects: [invalid] } },
      clip,
    );
    expect(state.preview).toBe(second.preview);
    expect(state.draft.cameraEffects![0]).toEqual(invalid);
  }
  const corrected = editorPreviewForm(second, { original, draft }, clip);
  expect(corrected.preview!.cameraEffects![0]!.target.zoom).toBe(1.5);
  expect(clip.calls).toEqual({ plan: 0, image: 0, render: 0 });
});
it("discard repaints the original and stale/source replacements cannot reuse another draft's preview", () => {
  const clip = independentHookFixture(),
    original = clip.edit!;
  const first = editorPreviewForm(null, { original, draft: original }, clip);
  const discarded = editorPreviewForm(
    first,
    { original, draft: structuredClone(original) },
    clip,
  );
  expect(discarded.preview).toEqual(first.preview);
  const invalid = {
    ...original,
    cameraEffects: [
      {
        id: crypto.randomUUID(),
        occurrence: "body" as const,
        startFrame: 0,
        zoomFrames: NaN,
        holdFrames: 0,
        returnFrames: 0 as const,
        target: { centerX: 0.5, centerY: 0.5, zoom: 1.5 },
      },
    ],
  };
  expect(
    editorPreviewForm(
      first,
      { original: { ...original }, draft: invalid },
      clip,
    ).preview,
  ).toBeNull();
  expect(
    editorPreviewForm(
      first,
      { original, draft: invalid },
      { ...clip, baseHash: "f".repeat(64) },
    ).preview,
  ).toBeNull();
});
