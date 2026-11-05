import { expect, it } from "vitest";
import {
  changeOwnerHookEndpoint,
  completeOwnerHookDraft,
} from "./hook-range-draft.ts";
it.each([90, 120, 990])(
  "accepts later/equal start %s and clears the end without mutating the old range",
  (start) => {
    const prior = { startFrame: 0, endFrame: 90 },
      next = changeOwnerHookEndpoint(prior, "startFrame", start);
    expect(next).toEqual({ startFrame: start, endFrame: null });
    expect(prior).toEqual({ startFrame: 0, endFrame: 90 });
    expect(completeOwnerHookDraft(next, 1230)).toBeUndefined();
  },
);
it("retains an end for an earlier start and completes only after an explicit valid end", () => {
  expect(
    changeOwnerHookEndpoint({ startFrame: 30, endFrame: 90 }, "startFrame", 15),
  ).toEqual({ startFrame: 15, endFrame: 90 });
  const open = changeOwnerHookEndpoint(
    { startFrame: 0, endFrame: 90 },
    "startFrame",
    990,
  );
  expect(
    completeOwnerHookDraft(
      changeOwnerHookEndpoint(open, "endFrame", 1110),
      1230,
    ),
  ).toEqual({ startFrame: 990, endFrame: 1110 });
});
it("keeps blank/invalid endpoints provisional, preserving end edits rather than erasing typed digits", () => {
  const open = { startFrame: 990, endFrame: null };
  expect(changeOwnerHookEndpoint(open, "endFrame", NaN)).toEqual(open);
  const early = changeOwnerHookEndpoint(open, "endFrame", 90);
  expect(early.endFrame).toBe(90);
  expect(completeOwnerHookDraft(early, 1230)).toBeUndefined();
  expect(
    completeOwnerHookDraft({ startFrame: null, endFrame: 1100 }, 1230),
  ).toBeUndefined();
});
it("enforces clip and ten-second bounds and admits one-frame selections", () => {
  for (const range of [
    { startFrame: -1, endFrame: 10 },
    { startFrame: 0, endFrame: 301 },
    { startFrame: 1190, endFrame: 1231 },
    { startFrame: 90, endFrame: 90 },
  ])
    expect(completeOwnerHookDraft(range, 1230)).toBeUndefined();
  expect(
    completeOwnerHookDraft({ startFrame: 1199, endFrame: 1200 }, 1200),
  ).toEqual({ startFrame: 1199, endFrame: 1200 });
});
