import { expect, it } from "vitest";
import { cameraPreviewSourceFrame } from "./camera-preview-clock.ts";

it("keeps the current camera for fractional times before a cut instead of rounding ahead", () => {
  for (const frame of [29.1, 29.5, 29.99])
    expect(cameraPreviewSourceFrame(frame / 30, 30, 0, 120, 120)).toBe(29);
  expect(cameraPreviewSourceFrame(1, 30, 0, 120, 120)).toBe(30);
  expect(cameraPreviewSourceFrame(0.033333, 30, 0, 120, 120)).toBe(1);
});
it("clamps Hook and body clocks to their own visible source windows", () => {
  for (const at of [89.5, 90, 90.5])
    expect(cameraPreviewSourceFrame(at / 30, 30, 30, 90, 120)).toBe(89);
  expect(cameraPreviewSourceFrame(0, 30, 30, 90, 120)).toBe(30);
  expect(cameraPreviewSourceFrame(4, 30, 0, 120, 120)).toBe(119);
});
