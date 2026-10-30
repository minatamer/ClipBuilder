import { expect, it } from "vitest";
import { ownerVisualSchema } from "./assets.ts";
import {
  defaultOwnerFocus,
  ownerFocusCrop,
  ownerSourceContent,
} from "./focus.ts";
import {
  ownerVisualProtectedBoxes,
  placeOwnerPlannedVisual,
} from "./visual-placement.ts";

const interval = { startFrame: 30, endFrame: 120 };
function sample() {
  const focus = defaultOwnerFocus({ width: 1280, height: 720 }, 180);
  focus.people = [
    {
      id: "person_1",
      observations: [
        {
          startFrame: 0,
          endFrame: 180,
          box: { x: 0.08, y: 0.12, width: 0.3, height: 0.48 },
        },
      ],
    },
  ];
  return focus;
}
const overlaps = (
  a: { x: number; y: number; width: number; height: number },
  b: typeof a,
) =>
  a.x < b.x + b.width &&
  b.x < a.x + a.width &&
  a.y < b.y + b.height &&
  b.y < a.y + a.height;
it("moves the old face-covering picture to a clear readable slot after portrait cropping", () => {
  const focus = sample(),
    protectedBoxes = ownerVisualProtectedBoxes(focus, interval),
    old = placeOwnerPlannedVisual(undefined, interval),
    box = placeOwnerPlannedVisual(focus, interval);
  expect(protectedBoxes.some((face) => overlaps(old, face))).toBe(true);
  expect(protectedBoxes.every((face) => !overlaps(box, face))).toBe(true);
  expect(box.width).toBe(old.width);
  expect(box.height / box.width).toBeCloseTo(old.height / old.width);
});
it("projects source boxes through actual integer crops, including padding, zoom and offscreen people", () => {
  const focus = sample();
  focus.shots[0]!.zoom = 1.5;
  const crop = ownerFocusCrop(focus, focus.shots[0]!),
    content = ownerSourceContent(focus.source);
  const visible = ownerVisualProtectedBoxes(focus, interval)[0]!;
  expect(visible.y).toBeCloseTo(
    Math.max(
      0,
      (content.y + 0.12 * content.height - crop.y) / crop.height - 0.025,
    ),
  );
  focus.people[0]!.observations[0]!.box = {
    x: 0.9,
    y: 0.1,
    width: 0.08,
    height: 0.4,
  };
  expect(ownerVisualProtectedBoxes(focus, interval)).toEqual([]);
});
it("protects every intersecting observation/camera shot for the whole cue without jitter", () => {
  const focus = sample();
  focus.shots = [
    { ...focus.shots[0]!, endFrame: 75 },
    { ...focus.shots[0]!, startFrame: 75, centerX: 0.75 },
  ];
  focus.people.push({
    id: "person_2",
    observations: [
      {
        startFrame: 75,
        endFrame: 180,
        box: { x: 0.65, y: 0.05, width: 0.25, height: 0.45 },
      },
    ],
  });
  const faces = ownerVisualProtectedBoxes(focus, interval),
    box = placeOwnerPlannedVisual(focus, interval);
  expect(faces.length).toBeGreaterThan(1);
  expect(faces.every((face) => !overlaps(box, face))).toBe(true);
  expect(placeOwnerPlannedVisual(focus, interval)).toEqual(box);
  expect(
    ownerVisualProtectedBoxes(focus, { startFrame: 0, endFrame: 30 }),
  ).toHaveLength(1);
});
it("ignores expired observations and retains a bounded editable fallback for fully occupied frames", () => {
  const focus = sample();
  focus.people[0]!.observations[0]!.endFrame = 30;
  expect(placeOwnerPlannedVisual(focus, interval)).toEqual(
    placeOwnerPlannedVisual(undefined, interval),
  );
  focus.people[0]!.observations = [
    { startFrame: 0, endFrame: 180, box: { x: 0, y: 0, width: 1, height: 1 } },
  ];
  const original = structuredClone(focus),
    box = placeOwnerPlannedVisual(focus, interval);
  expect(ownerVisualSchema.shape.box.safeParse(box).success).toBe(true);
  expect(box.width).toBeGreaterThanOrEqual(0.44);
  expect(placeOwnerPlannedVisual(focus, interval)).toEqual(box);
  expect(focus).toEqual(original);
});
it.each([
  { width: 720, height: 1280 },
  { width: 720, height: 720 },
  { width: 3840, height: 1080 },
  { width: 100, height: 3840 },
])(
  "keeps projected protection and new placements bounded across source aspect ratios: %o",
  (source) => {
    const focus = sample();
    focus.source = source;
    const box = placeOwnerPlannedVisual(focus, interval);
    expect(ownerVisualSchema.shape.box.safeParse(box).success).toBe(true);
    for (const face of ownerVisualProtectedBoxes(focus, interval))
      expect(ownerVisualSchema.shape.box.safeParse(face).success).toBe(true);
  },
);
