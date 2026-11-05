import { expect, it } from "vitest";
import { defaultOwnerFocus } from "../../../../../packages/contracts/local/focus.ts";
import { motionForCameraPosition } from "./head-motion-selection.ts";

function fixture() {
  const focus = defaultOwnerFocus({ width: 480, height: 270 }, 120);
  focus.shots = [
    { ...focus.shots[0]!, startFrame: 0, endFrame: 60, personId: "person_1" },
    { ...focus.shots[0]!, startFrame: 60, endFrame: 120, personId: "person_1" },
  ];
  const paths = [
    {
      id: "first",
      personId: "person_1",
      sourceStartFrame: 10,
      startFrame: 10,
      endFrame: 30,
    },
    {
      id: "second",
      personId: "person_1",
      sourceStartFrame: 80,
      startFrame: 80,
      endFrame: 90,
    },
    {
      id: "later",
      personId: "person_1",
      sourceStartFrame: 100,
      startFrame: 100,
      endFrame: 110,
    },
  ];
  return { focus, paths };
}
it("chooses the selected camera's partial Motion even before tracking starts and with the same person in another position", () => {
  const { focus, paths } = fixture();
  expect(motionForCameraPosition(focus, paths, 0, null)?.id).toBe("first");
  expect(motionForCameraPosition(focus, paths, 60, "first")?.id).toBe("second");
  expect(motionForCameraPosition(focus, paths, 60, "later")?.id).toBe("later");
  expect(motionForCameraPosition(focus, paths, 0, "later")?.id).toBe("first");
});
it("does not select an unrelated person or out-of-range camera", () => {
  const { focus, paths } = fixture();
  focus.shots[1]!.personId = "person_2";
  expect(motionForCameraPosition(focus, paths, 60, null)).toBeUndefined();
  for (const at of [-1, 120, NaN, 1.5])
    expect(motionForCameraPosition(focus, paths, at, null)).toBeUndefined();
});
