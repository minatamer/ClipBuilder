import { expect, it } from "vitest";
import { normalizeClipTitle, chooseClipTitle } from "./clip-title.ts";
import type { OwnerMoment } from "../../../packages/contracts/local/selection.ts";

const moment: OwnerMoment = {
  id: crypto.randomUUID(),
  processingIdentity: "a".repeat(64),
  cut: { startFrame: 0, endFrame: 90 },
  rangeIds: [],
  evidence: null,
  cues: [
    {
      id: "w_000001",
      speakerId: "spk_1",
      text: "A transcript excerpt",
      punctuatedText: "A transcript excerpt",
      confidence: null,
      startMs: 0,
      endMs: 2000,
    },
  ],
};
it("uses a supplied headline then the existing moment title or transcript without another AI call", () => {
  expect(chooseClipTitle(moment, "  A short\nheadline  ")).toBe(
    "A short headline",
  );
  expect(chooseClipTitle(moment, null)).toBe("A transcript excerpt");
  expect(chooseClipTitle({ ...moment, cues: [] }, null)).toBe(
    "Clip highlights",
  );
  expect(normalizeClipTitle("x\u202ey")).toBeNull();
  const text = "😀".repeat(100),
    limited = normalizeClipTitle(text)!;
  expect(limited.length).toBe(80);
  expect(limited).toBe("😀".repeat(40));
});
