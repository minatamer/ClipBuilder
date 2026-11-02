import { expect, it } from "vitest";
import {
  ownerAcquisitionSectionSchema,
  ownerPaddedAcquisitionWindow,
  ownerSourceCoversOriginalWindow,
  ownerScopeImportedSource,
} from "./acquisition-section.ts";
import { ownerSavedSourceVariantSchema } from "./acquisition.ts";
import type { OwnerSource } from "./index.ts";

const full: OwnerSource = {
  fingerprint: "a".repeat(64),
  bytes: 100,
  durationMs: 10000,
  width: 320,
  height: 180,
  fps: 30,
};
it("bounds original ranges/padding and checks full/partial coverage without mixing clocks", () => {
  expect(
    ownerPaddedAcquisitionWindow({
      window: { startMs: 1_800_000, endMs: 3_000_000 },
      durationMs: 7_200_000,
    }),
  ).toEqual({ startMs: 1_798_000, endMs: 3_002_000 });
  expect(
    ownerPaddedAcquisitionWindow({
      window: { startMs: 100, endMs: 2000 },
      durationMs: 2100,
    }),
  ).toEqual({ startMs: 0, endMs: 2100 });
  expect(
    ownerAcquisitionSectionSchema.safeParse({
      window: { startMs: 0, endMs: 3000 },
      durationMs: 2000,
    }).success,
  ).toBe(false);
  const partial = {
    ...full,
    origin: { startMs: 100_000, durationMs: 7_200_000 },
    availableWindow: { startMs: 2000, endMs: 9000 },
  };
  expect(ownerSourceCoversOriginalWindow(full)).toBe(true);
  expect(ownerSourceCoversOriginalWindow(partial)).toBe(false);
  expect(
    ownerSourceCoversOriginalWindow(partial, {
      startMs: 102_000,
      endMs: 109_000,
    }),
  ).toBe(true);
  expect(
    ownerSourceCoversOriginalWindow(partial, {
      startMs: 100_000,
      endMs: 103_000,
    }),
  ).toBe(false);
  expect(
    ownerScopeImportedSource(partial, { startMs: 103_000, endMs: 105_000 })
      .availableWindow,
  ).toEqual({ startMs: 3000, endMs: 5000 });
  expect(ownerScopeImportedSource(partial)).toEqual(partial);
  expect(() =>
    ownerScopeImportedSource(partial, { startMs: 104_000, endMs: 110_000 }),
  ).toThrow("source_section_unavailable");
  expect(
    ownerSavedSourceVariantSchema.shape.offsetMs.safeParse(Infinity).success,
  ).toBe(false);
});
