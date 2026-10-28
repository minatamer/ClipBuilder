import { describe, expect, it } from "vitest";
import { screenCamera } from "./film-camera";
import {
  FILM_COPY,
  FILM_FORMAT,
  FILM_TIMELINES,
  filmDuration,
} from "./film-timeline";

describe("contextual landing film", () => {
  it("keeps the full story within 24 seconds with readable context for every beat", () => {
    expect(filmDuration("walkthrough") / FILM_FORMAT.fps).toBe(24);
    expect(filmDuration("style") / FILM_FORMAT.fps).toBe(8);
    let end = 0;
    for (const shot of FILM_TIMELINES.walkthrough) {
      expect(shot.from).toBe(end);
      expect(shot.duration).toBeGreaterThanOrEqual(2 * FILM_FORMAT.fps);
      expect(FILM_COPY[shot.beat].title.length).toBeGreaterThan(0);
      expect(FILM_COPY[shot.beat].detail.length).toBeGreaterThan(0);
      end += shot.duration;
    }
  });

  it("covers every viewport and keeps the tracked cursor inside the crop", () => {
    for (const beat of ["intake", "analysis", "choose", "review"] as const) {
      for (const height of [584, 696, 1056, 1160]) {
        const duration = beat === "review" ? 105 : 90;
        let previous = screenCamera(beat, 0, duration, 1776, height);
        let previousVelocity = { x: 0, y: 0 };
        for (let frame = 0; frame < duration; frame++) {
          const pose = screenCamera(beat, frame, duration, 1776, height);
          expect(pose.x).toBeLessThanOrEqual(0);
          expect(pose.y).toBeLessThanOrEqual(0);
          expect(pose.x + 1440 * pose.scale).toBeGreaterThanOrEqual(
            1776 - 0.001,
          );
          expect(pose.y + 1000 * pose.scale).toBeGreaterThanOrEqual(
            height - 0.001,
          );
          expect(pose.zoom).toBeLessThanOrEqual(1.221);
          expect(pose.zoom).toBeGreaterThanOrEqual(previous.zoom - 0.000001);
          const velocity = { x: pose.x - previous.x, y: pose.y - previous.y };
          expect(Math.hypot(velocity.x, velocity.y)).toBeLessThan(36);
          expect(
            Math.hypot(
              velocity.x - previousVelocity.x,
              velocity.y - previousVelocity.y,
            ),
          ).toBeLessThan(4);
          previousVelocity = velocity;
          if (pose.cursor && pose.cursor.opacity > 0.1) {
            const x = pose.x + pose.cursor.x * pose.scale;
            const y = pose.y + pose.cursor.y * pose.scale;
            expect(x).toBeGreaterThanOrEqual(-0.001);
            expect(y).toBeGreaterThanOrEqual(-0.001);
            expect(x + 120 * pose.scale).toBeLessThanOrEqual(1776 + 0.001);
            expect(y + 52 * pose.scale).toBeLessThanOrEqual(height + 0.001);
            expect(x - 120 * pose.scale).toBeGreaterThanOrEqual(-0.001);
            expect(y - 60 * pose.scale).toBeGreaterThanOrEqual(-0.001);
          }
          previous = pose;
        }
      }
    }
  });

  it("follows the two useful selection actions with one steady lens and an uninterrupted mouse", () => {
    const pick = screenCamera("choose", 28, 90, 1776, 1056);
    const proceed = screenCamera("choose", 76, 90, 1776, 1056);
    expect(pick.cursor).toMatchObject({ x: 307, y: 575, ring: 1 });
    expect(proceed.cursor).toMatchObject({ x: 1264, y: 945, ring: 1 });
    expect(proceed.x).toBeLessThan(pick.x);
    expect(proceed.y).toBeLessThan(pick.y);
    expect(proceed.zoom - pick.zoom).toBeLessThan(0.12);
    const middle = screenCamera("choose", 54, 90, 1776, 1056);
    expect(
      Math.abs(middle.x + middle.cursor!.x * middle.scale - 888),
    ).toBeLessThan(36);
    expect(screenCamera("choose", 35, 90, 1776, 1056).cursor?.x).toBe(307);
    expect(screenCamera("choose", 36, 90, 1776, 1056).cursor?.x).toBe(307);
    let previousX = 307;
    for (let frame = 36; frame < 90; frame++) {
      const cursor = screenCamera("choose", frame, 90, 1776, 1056).cursor!;
      expect(cursor.opacity).toBe(1);
      expect(cursor.x).toBeGreaterThanOrEqual(previousX);
      previousX = cursor.x;
    }
  });

  it("holds the noninteractive analysis screen completely steady", () => {
    const initial = screenCamera("analysis", 0, 90, 1776, 1056);
    for (let frame = 1; frame < 90; frame++)
      expect(screenCamera("analysis", frame, 90, 1776, 1056)).toEqual(initial);
  });

  it("allows editorial framing without changing the mouse action or exposing image edges", () => {
    for (let frame = 0; frame < 105; frame++) {
      const pose = screenCamera("review", frame, 105, 1920, 1440, {
        anchorX: 0.7,
        anchorY: 0.55,
        lens: 1.18,
        focus: { x: 732, y: 526 },
        focusWeight: 1,
      });
      expect(pose.cursor).toEqual(
        screenCamera("review", frame, 105, 1920, 1440).cursor,
      );
      expect(pose.x).toBeLessThanOrEqual(0);
      expect(pose.y).toBeLessThanOrEqual(0);
      expect(pose.x + 1440 * pose.scale).toBeGreaterThanOrEqual(1920 - 0.001);
      expect(pose.y + 1000 * pose.scale).toBeGreaterThanOrEqual(1440 - 0.001);
    }
    expect(screenCamera("review", 31, 105, 1920, 1440).cursor?.x).toBe(1050);
    expect(screenCamera("review", 80, 105, 1920, 1440).cursor?.ring).toBe(1);
  });
});
