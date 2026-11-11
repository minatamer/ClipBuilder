import { expect, it } from "vitest";
import { ownerCut } from "../../../../../packages/contracts/local/selection.ts";
import {
  capturePreviewTime,
  normalizeManualTime,
  parseManualTime,
  manualPreviewJumpSeconds,
} from "./manual-time.ts";

it("jumps to precise local endpoint clocks and uses the last playable frame for physical EOF", () => {
  const source = { durationMs: 20000 };
  expect(manualPreviewJumpSeconds(10633, source, "start")).toBe(10.633);
  expect(manualPreviewJumpSeconds(17333, source, "end")).toBe(17.333);
  expect(manualPreviewJumpSeconds(20000, source, "end")).toBeCloseTo(
    19.9666667,
  );
  expect(manualPreviewJumpSeconds(20000, source, "start")).toBeNull();
  expect(
    manualPreviewJumpSeconds(
      12000,
      { ...source, availableWindow: { startMs: 5000, endMs: 12000 } },
      "end",
    ),
  ).toBeCloseTo(11.9666667);
});
it("blocks invalid/outside endpoints without silently clipping them to the available source", () => {
  const source = {
    durationMs: 20000,
    availableWindow: { startMs: 5000, endMs: 15000 },
  };
  for (const value of [NaN, Infinity, -1, 5000.5, 4999, 15001, 20001])
    expect(manualPreviewJumpSeconds(value, source, "end")).toBeNull();
  expect(manualPreviewJumpSeconds(5000, source, "start")).toBe(5);
  expect(manualPreviewJumpSeconds(15000, source, "start")).toBeNull();
});

it.each([
  ["00:00:60", "00:01:00"],
  ["00:60:00", "01:00:00"],
  ["00:00:90", "00:01:30"],
  ["00:90:00", "01:30:00"],
  ["1:90:90", "02:31:30"],
  ["0:0:0", "00:00:00"],
  ["100:00:00", "100:00:00"],
  ["99:59:60", "100:00:00"],
  [" 00:59:120 ", "01:01:00"],
])("carries complete clock %s into %s", (input, output) => {
  expect(normalizeManualTime(input)).toBe(output);
});

it.each([
  "",
  "00:",
  "00:00:",
  "-1:00:00",
  "00:-1:00",
  "00:00:-1",
  "00:00:01.5",
  "00:1e2:00",
  "Infinity:00:00",
  "0:99999999999999999999999999999999999:0",
])("rejects partial, fractional, signed or oversized clock %s", (input) => {
  expect(() => normalizeManualTime(input)).toThrow("invalid_manual_time");
});

it("uses carried values at submission without relaxing source or clip bounds", () => {
  expect(parseManualTime("00:00:90")).toBe(90_000);
  expect(parseManualTime("00:60:00")).toBe(3_600_000);
  expect(parseManualTime("00:90:00")).toBe(5_400_000);
  expect(() => parseManualTime("999999999999999:00:00")).toThrow();
  const range = {
    startMs: parseManualTime("00:00:60"),
    endMs: parseManualTime("00:00:90"),
  };
  expect(ownerCut(range, 90_000)).toMatchObject({
    startFrame: 1800,
    endFrame: 2700,
  });
  expect(() => ownerCut(range, 75_000)).toThrow();
  expect(() => ownerCut({ startMs: 90_000, endMs: 60_000 }, 90_000)).toThrow();
});

const preview = {
  currentTime: 90.987,
  duration: 200,
  readyState: 4,
  error: null,
  seeking: false,
};
it("captures the playhead in whole seconds and bounds it to both known source clocks", () => {
  expect(capturePreviewTime(preview, 200_000)).toBe("00:01:30");
  expect(capturePreviewTime({ ...preview, currentTime: 60 }, 200_000)).toBe(
    "00:01:00",
  );
  expect(capturePreviewTime(preview, 89_999)).toBe("00:01:29");
  expect(capturePreviewTime({ ...preview, duration: 61.7 }, 200_000)).toBe(
    "00:01:01",
  );
  expect(capturePreviewTime({ ...preview, currentTime: 0 }, 200_000)).toBe(
    "00:00:00",
  );
});
it("does not return a timestamp for absent, loading, seeking or failed media", () => {
  expect(capturePreviewTime(null, 200_000)).toBeNull();
  for (const invalid of [
    { ...preview, readyState: 0 },
    { ...preview, seeking: true },
    { ...preview, currentTime: NaN },
    { ...preview, currentTime: Infinity },
    { ...preview, currentTime: -1 },
    { ...preview, duration: Infinity },
    { ...preview, duration: 0 },
    {
      ...preview,
      error: {
        code: 3,
        message: "synthetic_decode_failure",
        MEDIA_ERR_ABORTED: 1 as const,
        MEDIA_ERR_NETWORK: 2 as const,
        MEDIA_ERR_DECODE: 3 as const,
        MEDIA_ERR_SRC_NOT_SUPPORTED: 4 as const,
      },
    },
  ])
    expect(capturePreviewTime(invalid, 200_000)).toBeNull();
  for (const invalid of [0, -1, NaN, Infinity])
    expect(capturePreviewTime(preview, invalid)).toBeNull();
});
