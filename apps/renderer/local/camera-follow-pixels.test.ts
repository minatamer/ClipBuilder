import { expect, it } from "vitest";
import { preparedCameraPixels } from "./camera-follow-pixels.ts";
import { defaultOwnerFocus } from "../../../packages/contracts/local/focus.ts";
import { planBulkHeadMotion } from "../../../packages/contracts/local/camera-follow-plan.ts";
import { OWNER_BATCH_POLICY } from "../../../packages/contracts/local/clips.ts";
const camera = (frames: number) => {
  const focus = defaultOwnerFocus({ width: 3840, height: 2160 }, frames);
  focus.people = [
    {
      id: "person_1",
      observations: [
        {
          startFrame: 0,
          endFrame: frames,
          box: { x: 0.3, y: 0.2, width: 0.15, height: 0.3 },
        },
      ],
    },
  ];
  focus.shots[0]!.personId = "person_1";
  return focus;
};
it("covers full admitted five-minute clips with bounded pixels and a short fixed expression", () => {
  const focus = camera(9000),
    plan = planBulkHeadMotion({
      focus,
      tracks: [],
      effects: [],
      hook: undefined,
    });
  for (const preparedBytes of [1024 ** 2, 300 * 1024 ** 2]) {
    const pixels = preparedCameraPixels(focus, plan.intervals, preparedBytes)!;
    expect(pixels.indices.length).toBeGreaterThan(1000);
    expect(pixels.indices.at(-1)).toBe(8999);
    expect(pixels.width).toBeLessThan(512);
    expect(pixels.bytes).toBeLessThanOrEqual(192 * 1024 ** 2);
    expect(pixels.bytes + preparedBytes + 16 * 1024 ** 2).toBeLessThanOrEqual(
      OWNER_BATCH_POLICY.clipReservationBytes,
    );
    expect(pixels.select.length).toBeLessThan(4096);
  }
});
it("retains exact odd camera boundaries and returns no work without safe scratch capacity", () => {
  const focus = camera(14);
  focus.shots = [
    { ...focus.shots[0]!, endFrame: 7 },
    { ...focus.shots[0]!, startFrame: 7 },
  ];
  const plan = planBulkHeadMotion({
    focus,
    tracks: [],
    effects: [],
    hook: undefined,
  });
  const pixels = preparedCameraPixels(focus, plan.intervals, 1000)!;
  expect(pixels.indices).toEqual([0, 2, 4, 6, 7, 9, 11, 13]);
  expect(
    preparedCameraPixels(
      focus,
      plan.intervals,
      OWNER_BATCH_POLICY.clipReservationBytes,
    ),
  ).toBeNull();
});
