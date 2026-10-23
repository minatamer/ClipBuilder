import { expect, it } from "vitest";
import { matchesOfferedFrameRate } from "./acquisition-profile.ts";

it.each([24, 30, 60])(
  "accepts measured NTSC for nominal %s without admitting another family",
  (nominal) => {
    expect(matchesOfferedFrameRate((nominal * 1000) / 1001, nominal)).toBe(
      true,
    );
    expect(matchesOfferedFrameRate(nominal, nominal)).toBe(true);
    expect(matchesOfferedFrameRate(nominal - 0.2, nominal)).toBe(false);
    expect(matchesOfferedFrameRate(nominal + 1, nominal)).toBe(false);
  },
);
it("rejects nonfinite clocks and unrelated fractional changes", () => {
  expect(matchesOfferedFrameRate(NaN, 30)).toBe(false);
  expect(matchesOfferedFrameRate(30, Infinity)).toBe(false);
  expect(matchesOfferedFrameRate(25, 30)).toBe(false);
  expect(matchesOfferedFrameRate(30, 29.97)).toBe(false);
  expect(matchesOfferedFrameRate(30000 / 1001, 29.97)).toBe(true);
});
