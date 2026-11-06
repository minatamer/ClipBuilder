import { OWNER_LIMITS } from "../../../packages/contracts/local/policy.ts";

/** One fixed, source-independent policy; never accept a requested speaker count. */
export const LOCAL_SPEAKER_WINDOWS = {
  samplesPerSecond: 16000,
  windowSamples: 24000,
  stepSamples: 12000,
  minimumSamples: 8000,
  distance: 0.35,
  minimumEvidence: 2,
  maximumWindows: Math.ceil(OWNER_LIMITS.clipMs / 750),
  maximumSpeakers: 16,
} as const;

export type SpeakerWindow = {
  start: number;
  end: number;
  embedding: readonly number[];
};
export type SpeakerTurn = { start: number; end: number; speaker: number };

/** Window labels locate a change coarsely. A measured quiet gap refines its clock;
 * never move a boundary without a clear energy drop or across an unknown gap. */
export function refineSpeakerBoundaries(
  turns: readonly SpeakerTurn[],
  samples: Float32Array,
): SpeakerTurn[] {
  const result = turns.map((turn) => ({ ...turn }));
  const rate = LOCAL_SPEAKER_WINDOWS.samplesPerSecond;
  const radius = LOCAL_SPEAKER_WINDOWS.stepSamples / 2;
  const halfGap = Math.round(rate * 0.04),
    step = Math.round(rate * 0.01);
  const energy = (from: number, to: number) => {
    let sum = 0;
    for (let i = from; i < to; i++) sum += samples[i]! * samples[i]!;
    return sum / Math.max(1, to - from);
  };
  for (let index = 1; index < result.length; index++) {
    const prior = result[index - 1]!,
      next = result[index]!;
    if (prior.end !== next.start || prior.speaker === next.speaker) continue;
    const boundary = Math.round(next.start * rate);
    const low = Math.max(
      halfGap,
      Math.ceil(prior.start * rate) + halfGap,
      boundary - radius,
    );
    const high = Math.min(
      samples.length - halfGap,
      Math.floor(next.end * rate) - halfGap,
      boundary + radius,
    );
    if (high <= low) continue;
    const baseline = energy(low - halfGap, high + halfGap);
    let best = boundary,
      minimum = Infinity;
    for (let at = low; at <= high; at += step) {
      const value = energy(at - halfGap, at + halfGap);
      if (
        value < minimum ||
        (value === minimum &&
          Math.abs(at - boundary) < Math.abs(best - boundary))
      ) {
        minimum = value;
        best = at;
      }
    }
    if (baseline > 1e-10 && minimum < baseline * 0.1) {
      prior.end = best / rate;
      next.start = best / rate;
    }
  }
  return result;
}

/** Average-link cosine clustering retains short voices without pooling a reply. */
export function clusterSpeakerWindows(windows: readonly SpeakerWindow[]) {
  const policy = LOCAL_SPEAKER_WINDOWS;
  if (windows.length > policy.maximumWindows)
    throw Error("codex_input_invalid");
  if (!windows.length) return [];
  const dimension = windows[0]!.embedding.length;
  if (dimension < 2 || dimension > 512) throw Error("codex_input_invalid");
  const vectors = windows.map((window, index) => {
    if (
      !Number.isFinite(window.start) ||
      !Number.isFinite(window.end) ||
      window.start < 0 ||
      window.end <= window.start ||
      window.end > OWNER_LIMITS.clipMs / 1000 + 0.001 ||
      (index > 0 && window.start <= windows[index - 1]!.start) ||
      window.embedding.length !== dimension ||
      window.embedding.some((value) => !Number.isFinite(value))
    )
      throw Error("codex_input_invalid");
    const norm = Math.hypot(...window.embedding);
    if (!norm) throw Error("codex_input_invalid");
    return window.embedding.map((value) => value / norm);
  });
  const distances = vectors.map((a) =>
    vectors.map((b) =>
      Math.max(
        0,
        1 - a.reduce((sum, value, index) => sum + value * b[index]!, 0),
      ),
    ),
  );
  const groups = windows.map((_, index) => [index]);
  while (groups.length > 1) {
    let distance = Infinity,
      first = -1,
      second = -1;
    for (let a = 0; a < groups.length; a++)
      for (let b = 0; b < a; b++) {
        let sum = 0;
        for (const i of groups[a]!)
          for (const j of groups[b]!) sum += distances[i]![j]!;
        const mean = sum / (groups[a]!.length * groups[b]!.length);
        if (mean < distance) {
          distance = mean;
          first = a;
          second = b;
        }
      }
    if (distance > policy.distance) break;
    groups[second]!.push(...groups[first]!);
    groups.splice(first, 1);
  }
  // An isolated noisy/transition window cannot invent a speaker. Leave it neutral.
  const supported = groups
    .filter(
      (group) => windows.length === 1 || group.length >= policy.minimumEvidence,
    )
    .sort((a, b) => b.length - a.length || Math.min(...a) - Math.min(...b))
    .slice(0, policy.maximumSpeakers)
    .sort((a, b) => Math.min(...a) - Math.min(...b));
  const labels: (number | null)[] = windows.map(() => null);
  supported.forEach((group, speaker) =>
    group.forEach((index) => {
      labels[index] = speaker;
    }),
  );
  return labels;
}

/** Centers divide overlapping windows once; unknown cells remain gaps in turns. */
export function speakerWindowTurns(
  windows: readonly SpeakerWindow[],
): SpeakerTurn[] {
  const labels = clusterSpeakerWindows(windows);
  const center = (index: number) =>
    (windows[index]!.start + windows[index]!.end) / 2;
  const turns: SpeakerTurn[] = [];
  for (let index = 0; index < windows.length; index++) {
    const speaker = labels[index];
    if (speaker === null || speaker === undefined) continue;
    const start = Math.max(
      windows[index]!.start,
      index === 0
        ? windows[index]!.start
        : (center(index - 1) + center(index)) / 2,
    );
    const end = Math.min(
      windows[index]!.end,
      index === windows.length - 1
        ? windows[index]!.end
        : (center(index) + center(index + 1)) / 2,
    );
    const prior = turns.at(-1);
    if (prior?.speaker === speaker && prior.end === start) prior.end = end;
    else turns.push({ start, end, speaker });
  }
  return turns;
}
