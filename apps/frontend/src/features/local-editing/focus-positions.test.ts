import { expect, it } from "vitest";
import {
  defaultOwnerFocus,
  ownerFocusSchema,
  removeOwnerFocusShot,
  OWNER_FOCUS_LIMITS,
} from "../../../../../packages/contracts/local/focus.ts";
import {
  captureFocusBoundary,
  editFocusPosition,
  focusPositions,
  focusTimestamp,
  moveFocusPosition,
  addFocusPosition,
} from "./focus-positions.ts";

function fixture() {
  const focus = defaultOwnerFocus({ width: 1920, height: 1080 }, 180);
  focus.people = [1, 2].map((n) => ({
    id: `person_${n}`,
    observations: [
      {
        startFrame: 0,
        endFrame: 180,
        box: { x: n === 1 ? 0.1 : 0.6, y: 0.1, width: 0.2, height: 0.4 },
      },
    ],
  }));
  focus.shots = [
    {
      ...focus.shots[0]!,
      startFrame: 0,
      endFrame: 30,
      personId: "person_1",
      centerX: 0.25,
    },
    {
      ...focus.shots[0]!,
      startFrame: 30,
      endFrame: 60,
      personId: "person_2",
      centerX: 0.75,
    },
    {
      ...focus.shots[0]!,
      startFrame: 60,
      endFrame: 90,
      personId: "person_1",
      centerX: 0.25,
    },
    {
      ...focus.shots[0]!,
      startFrame: 90,
      endFrame: 120,
      personId: "person_1",
      centerX: 0.4,
    },
    {
      ...focus.shots[0]!,
      startFrame: 120,
      endFrame: 180,
      personId: "person_1",
      centerX: 0.25,
    },
  ];
  focus.decisions = [
    {
      startFrame: 120,
      endFrame: 180,
      personId: null,
      speakerId: null,
      confidence: 0,
      evidenceWordIds: [],
      shotStart: true,
    },
  ];
  return focus;
}
it("numbers each timestamped position independently without changing automatic data", () => {
  const focus = fixture(),
    before = structuredClone(focus),
    positions = focusPositions(focus);
  expect(positions.map((p) => [p.personId, p.number, p.index])).toEqual([
    ["person_1", 1, 0],
    ["person_2", 1, 1],
    ["person_1", 2, 2],
    ["person_1", 3, 3],
    ["person_1", 4, 4],
  ]);
  expect(focus).toEqual(before);
  expect(focus.shots).toHaveLength(5);
  expect(positions[4]!.sourceStart).toBe(120);
  expect(focusPositions(structuredClone(focus))).toEqual(positions);
});
it("isolates position settings even when another row has identical geometry", () => {
  const focus = fixture(),
    before = structuredClone(focus);
  const moved = moveFocusPosition(focus, 0, 0.33, 0.5);
  const movedAgain = moveFocusPosition(moved, 0, 0.4, 0.5);
  expect(movedAgain.shots[0]!.centerX).toBe(0.4);
  for (const index of [1, 2, 3, 4])
    expect(movedAgain.shots[index]).toEqual(before.shots[index]);
  expect(movedAgain.people).toEqual(before.people);
  expect(movedAgain.decisions).toEqual(before.decisions);
  expect(movedAgain.shots[0]!.personId).toBe("person_1");
  const single = editFocusPosition(focus, 2, { zoom: 2 });
  expect(single.shots[0]).toEqual(focus.shots[0]);
  expect(single.shots[2]!.zoom).toBe(2);
  expect(focus).toEqual(before);
});
it("keeps custom positions independent, treats a change crossing a cut separately, and clamps handles to actual crop centers", () => {
  const focus = fixture();
  focus.shots[0]!.personId = null;
  focus.shots[2]!.personId = null;
  expect(
    focusPositions(focus)
      .filter((p) => p.personId === null)
      .map((p) => p.index),
  ).toEqual([0, 2]);
  const moved = moveFocusPosition(focus, 0, -1, 2);
  ownerFocusSchema.parse(moved);
  expect(moved.shots[0]!.centerX).toBeGreaterThan(0);
  expect(moved.shots[0]!.centerY).toBeLessThan(1);
  focus.shots[3]!.endFrame = 130;
  focus.shots[4]!.startFrame = 130;
  expect(focusPositions(focus)[3]!.sourceEnd).toBe(120);
});
it("appends the next position for a person, with independent timestamps, then renumbers deletions", () => {
  const focus = fixture(),
    before = structuredClone(focus);
  const added = addFocusPosition(focus, 4, "person_1", 150)!;
  expect(added.index).toBe(5);
  expect(added.focus.shots[5]).toMatchObject({
    personId: "person_1",
    startFrame: 150,
    endFrame: 180,
  });
  expect(focusPositions(added.focus)[5]!.number).toBe(5);
  ownerFocusSchema.parse(added.focus);
  expect(added.focus.people).toEqual(before.people);
  expect(added.focus.decisions).toEqual(before.decisions);
  expect(added.focus.shots.slice(0, 4)).toEqual(before.shots.slice(0, 4));
  expect(removeOwnerFocusShot(added.focus, 5)).toEqual(focus);
  const removed = removeOwnerFocusShot(added.focus, 2);
  expect(
    focusPositions(removed)
      .filter((p) => p.personId === "person_1")
      .map((p) => p.number),
  ).toEqual([1, 2, 3, 4]);
  expect(removed.shots[1]!.centerX).toBe(focus.shots[1]!.centerX);
  ownerFocusSchema.parse(removed);
  const reassigned = structuredClone(focus);
  reassigned.shots[0]!.personId = "person_2";
  expect(focusPositions(reassigned).map((p) => p.number)).toEqual([
    1, 2, 1, 2, 3,
  ]);
  expect(focus).toEqual(before);
});
it("uses a safe default range and respects single-frame and maximum-position bounds", () => {
  const focus = fixture();
  for (const frame of [null, 10, 120, 180, NaN, 130.5])
    expect(
      addFocusPosition(focus, 4, "person_1", frame)!.focus.shots[5]!.startFrame,
    ).toBe(150);
  expect(addFocusPosition(focus, 4, "person_8", 150)).toBeNull();
  expect(addFocusPosition(focus, -1, "person_1", 150)).toBeNull();
  focus.shots[3]!.endFrame = 179;
  focus.shots[4]!.startFrame = 179;
  expect(addFocusPosition(focus, 4, "person_1", 179)).toBeNull();
  expect(addFocusPosition(focus, 0, "person_1", 10)!.index).toBe(1);
  const capped = defaultOwnerFocus({ width: 1920, height: 1080 }, 120);
  capped.shots = Array.from({ length: OWNER_FOCUS_LIMITS.shots }, (_, i) => ({
    ...capped.shots[0]!,
    startFrame: i * 2,
    endFrame: (i + 1) * 2,
  }));
  expect(addFocusPosition(capped, 0, null, 119)).toBeNull();
  const custom = defaultOwnerFocus({ width: 1920, height: 1080 }, 120);
  const added = addFocusPosition(custom, 0, null, null)!;
  expect(focusPositions(added.focus).map((p) => p.number)).toEqual([1, 2]);
  ownerFocusSchema.parse(added.focus);
});
it("inserts the confirmed different person below the selected row using their camera settings", () => {
  const focus = fixture();
  focus.shots[1]!.zoom = 1.6;
  const before = structuredClone(focus);
  const added = addFocusPosition(focus, 0, "person_2", 17)!;
  expect(added.index).toBe(1);
  expect(added.focus.shots[0]).toEqual({ ...before.shots[0]!, endFrame: 17 });
  expect(added.focus.shots[1]).toMatchObject({
    personId: "person_2",
    startFrame: 17,
    endFrame: 30,
    centerX: 0.75,
    zoom: 1.6,
  });
  expect(added.focus.shots.slice(2)).toEqual(before.shots.slice(1));
  expect(
    focusPositions(added.focus)
      .filter((p) => p.personId === "person_2")
      .map((p) => p.number),
  ).toEqual([1, 2]);
  ownerFocusSchema.parse(added.focus);
  expect(added.focus.people).toEqual(before.people);
  expect(focus).toEqual(before);
  const unused = structuredClone(focus);
  unused.people.push({
    id: "person_3",
    observations: [
      {
        startFrame: 0,
        endFrame: 180,
        box: { x: 0.4, y: 0.1, width: 0.2, height: 0.5 },
      },
    ],
  });
  const observed = addFocusPosition(unused, 0, "person_3", null)!;
  expect(observed.focus.shots[1]).toMatchObject({
    personId: "person_3",
    centerX: 0.5,
    zoom: 1,
    startFrame: 15,
  });
  ownerFocusSchema.parse(observed.focus);
  const crossing = structuredClone(focus);
  crossing.shots[3]!.endFrame = 130;
  crossing.shots[4]!.startFrame = 130;
  const fenced = addFocusPosition(crossing, 3, "person_2", 125)!;
  expect(fenced.focus.shots[4]!.zoom).toBe(1);
  expect(focusPositions(fenced.focus)[4]!.sourceStart).toBe(120);
  ownerFocusSchema.parse(fenced.focus);
  const custom = addFocusPosition(focus, 0, null, 15)!;
  expect(custom.focus.shots[1]).toMatchObject({
    personId: null,
    centerX: focus.shots[0]!.centerX,
  });
});
it("captures frame-accurate half-open boundaries on a fixed selection and rejects invalid or locked captures", () => {
  const focus = fixture(),
    before = structuredClone(focus);
  const end = captureFocusBoundary(focus, 0, "endFrame", 43)!;
  expect(end.shots[0]!.endFrame).toBe(44);
  expect(end.shots[1]!.startFrame).toBe(44);
  ownerFocusSchema.parse(end);
  const start = captureFocusBoundary(focus, 1, "startFrame", 29)!;
  expect(start.shots[0]!.endFrame).toBe(29);
  expect(start.shots[1]!.startFrame).toBe(29);
  expect(captureFocusBoundary(focus, 0, "startFrame", 1)).toBeNull();
  expect(captureFocusBoundary(focus, 4, "endFrame", 170)).toBeNull();
  for (const frame of [-1, 59, 90, 180, NaN, 1.5])
    expect(captureFocusBoundary(focus, 0, "endFrame", frame)).toBeNull();
  expect(focusTimestamp(29)).toBe("0:00.967");
  expect(Math.round(Number("0.967") * 30)).toBe(29);
  expect(focus).toEqual(before);
});
