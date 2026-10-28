import { describe, expect, it } from "vitest";

import {
  processSequenceCycleDurationMilliseconds,
  processSequencePhases,
} from "./process-narrative-timing";

describe("process narrative timing", () => {
  it("runs one mutually exclusive Upload, Read, handoff, and Cut cycle", () => {
    expect(processSequencePhases).toEqual([
      { atMilliseconds: 0, activeStep: 0, isHandoff: false },
      { atMilliseconds: 3000, activeStep: 1, isHandoff: false },
      { atMilliseconds: 5600, activeStep: 1, isHandoff: true },
      { atMilliseconds: 6400, activeStep: 2, isHandoff: false },
    ]);
    expect(processSequenceCycleDurationMilliseconds).toBe(12_000);
    expect(
      processSequenceCycleDurationMilliseconds -
        processSequencePhases.at(-1)!.atMilliseconds,
    ).toBe(5600);
    const times = processSequencePhases.map((phase) => phase.atMilliseconds);
    expect(
      times.every((time, index) => index === 0 || time > times[index - 1]!),
    ).toBe(true);
    // Each dependent visual finishes before its phase ends: upload 2.55s,
    // transcript 2.05s, handoff 0.65s and complete preview 5.3s.
    expect(times[1]! - times[0]!).toBeGreaterThan(2550);
    expect(times[2]! - times[1]!).toBeGreaterThan(2050);
    expect(times[3]! - times[2]!).toBeGreaterThan(650);
    expect(
      processSequenceCycleDurationMilliseconds - times[3]!,
    ).toBeGreaterThan(5300);
  });
});
