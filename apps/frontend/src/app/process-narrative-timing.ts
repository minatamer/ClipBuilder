export const processSequencePhases = [
  { atMilliseconds: 0, activeStep: 0, isHandoff: false },
  { atMilliseconds: 5600, activeStep: 1, isHandoff: false },
  { atMilliseconds: 10_800, activeStep: 1, isHandoff: true },
  { atMilliseconds: 12_000, activeStep: 2, isHandoff: false },
] as const;

export const processSequenceCycleDurationMilliseconds = 21_100;
