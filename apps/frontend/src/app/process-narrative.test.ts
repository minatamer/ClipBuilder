import { describe, expect, it } from "vitest";

import {
  processSequenceCycleDurationMilliseconds,
  processSequencePhases,
} from "./process-narrative-timing";

describe("process narrative timing", () => {
  it("runs one mutually exclusive Upload, Read, handoff, and Cut cycle", () => {
    expect(processSequencePhases).toEqual([
      { atMilliseconds: 0, activeStep: 0, isHandoff: false },
      { atMilliseconds: 5600, activeStep: 1, isHandoff: false },
      { atMilliseconds: 10_800, activeStep: 1, isHandoff: true },
      { atMilliseconds: 12_000, activeStep: 2, isHandoff: false },
    ]);
    expect(processSequenceCycleDurationMilliseconds).toBe(21_100);
    expect(
      processSequenceCycleDurationMilliseconds -
        processSequencePhases.at(-1)!.atMilliseconds,
    ).toBe(9100);
  });
});
