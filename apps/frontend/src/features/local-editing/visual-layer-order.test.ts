import { expect, it } from "vitest";
import { independentHookFixture } from "../../../../../test/owner-hook-fixture.ts";
import { reorderVisualLayers } from "./visual-layer-order";
import { ownerEditOperations } from "./editor-state";

function fixture() {
  const clip = independentHookFixture();
  const original = clip.edit!;
  original.visuals = Array.from({ length: 4 }, (_, index) => ({
    ...original.visuals[0]!,
    id: crypto.randomUUID(),
    ...(index % 2
      ? { video: { offsetFrame: 12, muted: true, volume: 65 } }
      : {}),
  }));
  return { clip, original, cues: original.visuals };
}

it("maps front-first drop positions to the existing back-first render order without altering cue data", () => {
  const { cues } = fixture();
  const retained = structuredClone(cues);
  for (const cue of cues)
    for (let position = 0; position < cues.length; position++) {
      const next = reorderVisualLayers(cues, cue.id, position);
      expect(next[cues.length - 1 - position]).toBe(cue);
      expect(new Set(next.map((item) => item.id)).size).toBe(cues.length);
      for (const item of next)
        expect(item).toBe(cues.find((source) => source.id === item.id));
      expect(cues).toEqual(retained);
    }
});

it("ignores invalid targets and unchanged positions so canceled and edge gestures cannot create an edit", () => {
  const { cues } = fixture();
  for (const position of [-1, cues.length, 1.5, NaN, Infinity])
    expect(reorderVisualLayers(cues, cues[0]!.id, position)).toBe(cues);
  expect(reorderVisualLayers(cues, "missing", 0)).toBe(cues);
  expect(reorderVisualLayers([], "missing", 0)).toEqual([]);
  for (const [index, cue] of cues.entries())
    expect(reorderVisualLayers(cues, cue.id, cues.length - 1 - index)).toBe(
      cues,
    );
});

it("emits a single existing visual-order operation for a mixed-media reorder, without upserting media or other fixed layers", () => {
  const { cues, clip, original } = fixture();
  const visuals = reorderVisualLayers(cues, cues[0]!.id, 0);
  expect(ownerEditOperations(original, { ...original, visuals }, clip)).toEqual(
    [{ kind: "visual-order", ids: visuals.map((cue) => cue.id) }],
  );
  expect(clip.calls).toEqual({ plan: 0, image: 0, render: 0 });
});
