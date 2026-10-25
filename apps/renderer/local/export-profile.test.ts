import { expect, it } from "vitest";
import { defaultOwnerFocus } from "../../../packages/contracts/local/focus.ts";
import {
  ownerOutputProfile,
  ownerOriginalFocusCrop,
  ownerCutVideoFilter,
  ownerCutAudioFilter,
} from "./export-profile.ts";

it("preserves native portrait resolution and source cadence without a 1080p ceiling", () => {
  expect(
    ownerOutputProfile({ width: 2160, height: 3840, fps: 60 }, 60),
  ).toEqual({ width: 2160, height: 3840, fps: 60, frames: 120 });
  expect(
    ownerOutputProfile({ width: 1080, height: 1920, fps: 24 }, 60),
  ).toEqual({ width: 1080, height: 1920, fps: 24, frames: 48 });
  expect(
    ownerOutputProfile({ width: 3840, height: 2160, fps: 30 }, 60),
  ).toEqual({ width: 1216, height: 2160, fps: 30, frames: 60 });
  expect(ownerOutputProfile({ width: 1280, height: 720, fps: 30 }, 60)).toEqual(
    { width: 406, height: 720, fps: 30, frames: 60 },
  );
  expect(
    ownerOutputProfile({ width: 1920, height: 1080, fps: 30000 / 1001 }, 60)
      .fps,
  ).toBe(30000 / 1001);
  expect(
    ownerOutputProfile({ width: 720, height: 1280, fps: 24 }, 1).frames,
  ).toBe(1);
  expect(() =>
    ownerOutputProfile({ width: 3840, height: 4000, fps: 30 }, 60),
  ).toThrow();
  expect(() =>
    ownerOutputProfile({ width: 1920, height: 1080, fps: NaN }, 60),
  ).toThrow();
  for (const height of [2, 4, 6, 180, 720, 1080, 3840]) {
    const profile = ownerOutputProfile({ width: 2, height, fps: 30 }, 30);
    expect(profile.width).toBeLessThan(profile.height);
    expect(profile.width % 2).toBe(0);
    expect(profile.height % 2).toBe(0);
  }
});
it("projects a 4K crop from original pixels and preserves the accepted field of view within chroma rounding", () => {
  const focus = defaultOwnerFocus({ width: 3840, height: 2160 }, 60);
  const original = ownerOriginalFocusCrop(focus, focus.shots[0]!);
  expect(original).toEqual({ width: 1152, height: 2046, x: 384, y: 56 });
  for (const key of ["width", "height", "x", "y"] as const)
    expect(original[key] % 2).toBe(0);
  const edge = ownerOriginalFocusCrop(focus, {
    ...focus.shots[0]!,
    centerX: 1,
    centerY: 1,
    zoom: 3,
  });
  expect(edge.x + edge.width).toBeLessThanOrEqual(3840);
  expect(edge.y + edge.height).toBeLessThanOrEqual(2160);
  const portrait = defaultOwnerFocus({ width: 2160, height: 3840 }, 60);
  expect(ownerOriginalFocusCrop(portrait, portrait.shots[0]!)).toEqual({
    width: 2160,
    height: 3840,
    x: 0,
    y: 0,
  });
});
it("converts physical frame counts while keeping logical cuts and audio clocks", () => {
  const cut = { startFrame: 29, endFrame: 89 };
  const profile = ownerOutputProfile(
    { width: 1920, height: 1080, fps: 60 },
    60,
  );
  expect(ownerCutVideoFilter(2.5, cut, profile)).toContain(
    "trim=start_frame=58:end_frame=178",
  );
  expect(ownerCutVideoFilter(2.5, cut, profile)).toContain("fps=fps=60:");
  expect(ownerCutAudioFilter(2.5, cut)).toContain(
    "atrim=start=0.9666666666666667:end=2.966666666666667",
  );
  expect(cut).toEqual({ startFrame: 29, endFrame: 89 });
  const late = { startFrame: 89, endFrame: 119 },
    lateProfile = ownerOutputProfile(
      { width: 1920, height: 1080, fps: 60 },
      30,
    );
  expect(ownerCutVideoFilter(2.5, late, lateProfile)).toContain(
    "trim=start_frame=178:end_frame=238",
  );
  expect(
    ownerCutVideoFilter(
      0,
      { startFrame: 4, endFrame: 5 },
      { width: 608, height: 1080, fps: 12, frames: 1 },
    ),
  ).toContain("trim=start_frame=1:end_frame=2");
});
