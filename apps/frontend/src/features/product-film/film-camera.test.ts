import { describe, expect, it } from "vitest";
import { screenCamera } from "./film-camera";
import { FILM_FORMAT, FILM_TIMELINES } from "./film-timeline";

describe("cinematic screen camera", () => {
  it("keeps one analysis angle while continuously pushing in until the next shot", () => {
    const shot = FILM_TIMELINES.walkthrough.find(
      (item) => item.beat === "analysis",
    )!;
    let previous = screenCamera("analysis", 9 * FILM_FORMAT.fps - shot.from);
    for (
      let frame = 9 * FILM_FORMAT.fps + 1;
      frame < shot.from + shot.duration;
      frame++
    ) {
      const pose = screenCamera("analysis", frame - shot.from);
      expect([pose.pitch, pose.yaw, pose.roll]).toEqual([0, -8, 0]);
      expect(pose.scale).toBeGreaterThan(previous.scale);
      expect(pose.scale - previous.scale).toBeLessThan(0.002);
      expect(pose.x).toBeLessThan(previous.x);
      expect(pose.y).toBeLessThan(previous.y);
      previous = pose;
    }
  });

  it("settles the candidate close-up face-on with the actual click target in view", () => {
    const pose = screenCamera("choose", 83);
    expect([pose.pitch, pose.yaw, pose.roll]).toEqual([0, 0, 0]);
    const x = pose.x + 308 * pose.scale;
    const y = pose.y + 580 * pose.scale;
    expect(x).toBeGreaterThan(100);
    expect(x).toBeLessThan(FILM_FORMAT.width - 100);
    expect(y).toBeGreaterThan(100);
    expect(y).toBeLessThan(FILM_FORMAT.height - 100);
    expect(screenCamera("choose", 68)).toEqual(screenCamera("choose", 87));
  });
});
