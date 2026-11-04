import { expect, it } from "vitest";
import {
  exportOwnerTimestamps,
  importOwnerTimestamps,
  localTimestampExchangeAllowed,
  OWNER_TIMESTAMP_FILE_BYTES,
} from "./timestamp-exchange.ts";
import { ownerCut } from "./selection.ts";

const source = {
  fingerprint: "a".repeat(64),
  bytes: 100,
  width: 320,
  height: 180,
  fps: 30,
  durationMs: 120000,
};
it("round-trips original clocks and frame boundaries without exporting transcript or media content", () => {
  const partial = {
    ...source,
    durationMs: 20000,
    origin: { startMs: 1800000, durationMs: 7200000 },
    availableWindow: { startMs: 2000, endMs: 18000 },
  };
  const cuts = [
    { startFrame: 61, endFrame: 94 },
    { startFrame: 300, endFrame: 450 },
  ];
  const text = exportOwnerTimestamps(partial, cuts);
  expect(JSON.parse(text).clips[0]).toEqual({
    startMs: 1802033,
    endMs: 1803133,
  });
  expect(
    importOwnerTimestamps(text, partial).map((range) =>
      ownerCut(range, partial.durationMs),
    ),
  ).toEqual(cuts);
  expect(Object.keys(JSON.parse(text)).sort()).toEqual([
    "clips",
    "clock",
    "kind",
    "source",
    "version",
  ]);
});
it("deduplicates exact ranges and imports more than ten distinct rows without truncation", () => {
  const text = exportOwnerTimestamps(
    source,
    Array.from({ length: 11 }, () => ({ startFrame: 0, endFrame: 60 })),
  );
  expect(importOwnerTimestamps(text, source)).toHaveLength(1);
  const many = exportOwnerTimestamps(
    source,
    Array.from({ length: 25 }, (_, i) => ({
      startFrame: i * 90,
      endFrame: i * 90 + 60,
    })),
  );
  expect(importOwnerTimestamps(many, source)).toHaveLength(25);
});
it("rejects wrong source, malformed, oversized, unsafe and out-of-window files before returning rows", () => {
  const text = exportOwnerTimestamps(source, [{ startFrame: 0, endFrame: 60 }]);
  expect(() =>
    importOwnerTimestamps(text, { ...source, fingerprint: "b".repeat(64) }),
  ).toThrow("timestamp_source_mismatch");
  for (const mutate of [
    (v: Record<string, unknown>) => ({ ...v, version: 2 }),
    (v: Record<string, unknown>) => ({ ...v, transcript: "private sentinel" }),
    (v: Record<string, unknown>) => ({
      ...v,
      clips: [{ startMs: 0.1, endMs: 2000 }],
    }),
    (v: Record<string, unknown>) => ({
      ...v,
      clips: [{ startMs: 3000, endMs: 1000 }],
    }),
    (v: Record<string, unknown>) => ({
      ...v,
      clips: [{ startMs: 119000, endMs: 122000 }],
    }),
  ])
    expect(() =>
      importOwnerTimestamps(JSON.stringify(mutate(JSON.parse(text))), source),
    ).toThrow();
  expect(() =>
    importOwnerTimestamps(" ".repeat(OWNER_TIMESTAMP_FILE_BYTES + 1), source),
  ).toThrow("timestamp_file_large");
  expect(() =>
    importOwnerTimestamps(text, {
      ...source,
      availableWindow: { startMs: 3000, endMs: 10000 },
    }),
  ).toThrow("timestamp_range_invalid");
});
it("excludes Android, phones and hosted mode even with a desktop-sized display", () => {
  expect(localTimestampExchangeAllowed(true, true, "Windows Chrome")).toBe(
    true,
  );
  expect(localTimestampExchangeAllowed(false, true, "Windows Chrome")).toBe(
    false,
  );
  expect(localTimestampExchangeAllowed(true, false, "Windows Chrome")).toBe(
    false,
  );
  expect(
    localTimestampExchangeAllowed(true, true, "Linux Android Chrome"),
  ).toBe(false);
});
