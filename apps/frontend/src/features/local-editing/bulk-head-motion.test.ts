import { expect, it, vi } from "vitest";
import { planBulkHeadMotion, trackBulkHeadMotion } from "./bulk-head-motion";
import { defaultOwnerFocus } from "../../../../../packages/contracts/local/focus.ts";
import {
  ownerCameraFollowKey,
  ownerCameraTracksSchema,
  type OwnerCameraTrack,
} from "../../../../../packages/contracts/local/camera-follow.ts";
import type { OwnerCameraEffect } from "../../../../../packages/contracts/local/camera-motion.ts";
import type { trackHeadVideo } from "./track-head-video";

function fixture(frames = 120) {
  const focus = defaultOwnerFocus({ width: 480, height: 270 }, frames);
  focus.people = [1, 2].map((i) => ({
    id: `person_${i}`,
    observations: [
      {
        startFrame: 0,
        endFrame: frames,
        box: { x: i === 1 ? 0.1 : 0.6, y: 0.1, width: 0.15, height: 0.3 },
      },
    ],
  }));
  focus.shots = [{ ...focus.shots[0]!, personId: "person_1" }];
  return {
    focus,
    tracks: [] as OwnerCameraTrack[],
    effects: [] as OwnerCameraEffect[],
    hook: undefined as { startFrame: number; endFrame: number } | undefined,
  };
}
const sample = vi.fn<typeof trackHeadVideo>(
  async ({ seed, frames, signal, progress }) => {
    signal.throwIfAborted();
    progress(1, 2);
    await Promise.resolve();
    progress(2, 2);
    return {
      outcome: "complete",
      points: Array.from(
        { length: Math.ceil((frames - 1) / 2) + 1 },
        (_, i) => ({
          frame: Math.min(i * 2, frames - 1),
          x: Number((seed.x + seed.width / 2 + (i ? 0.01 : 0)).toFixed(6)),
          y: Number((seed.y + seed.height / 2).toFixed(6)),
        }),
      ),
    };
  },
);
const runInput = (
  input: ReturnType<typeof fixture>,
  signal = new AbortController().signal,
) => ({ ...input, sourceUrl: "/synthetic-source", signal, progress: vi.fn() });

it("plans each camera transition and Hook on exact independent clocks, taking the latest covering head", () => {
  const input = fixture();
  input.hook = { startFrame: 30, endFrame: 90 };
  input.focus.shots = [
    { ...input.focus.shots[0]!, endFrame: 60 },
    { ...input.focus.shots[0]!, startFrame: 60, personId: "person_2" },
  ];
  input.focus.people[1]!.observations.unshift({
    ...input.focus.people[1]!.observations[0]!,
    startFrame: 60,
    box: { x: 0.62, y: 0.1, width: 0.15, height: 0.3 },
  });
  const before = JSON.stringify(input),
    plan = planBulkHeadMotion(input);
  expect(plan.blocked).toBeNull();
  expect(
    plan.intervals.map((i) => [
      i.occurrence,
      i.startFrame,
      i.endFrame,
      i.sourceStartFrame,
      i.personId,
    ]),
  ).toEqual([
    ["hook", 0, 30, 30, "person_1"],
    ["hook", 30, 60, 60, "person_2"],
    ["body", 0, 60, 0, "person_1"],
    ["body", 60, 120, 60, "person_2"],
  ]);
  expect(plan.intervals[1]!.seed.x).toBe(0.62);
  expect(plan.intervals.every((i) => !i.continuation)).toBe(true);
  expect(JSON.stringify(input)).toBe(before);
});

it("preserves existing Motion/Zoom and reports unseeded, custom and short gaps", () => {
  const input = fixture();
  input.tracks = [
    {
      id: crypto.randomUUID(),
      occurrence: "body",
      personId: "person_1",
      startFrame: 0,
      endFrame: 10,
      sourceStartFrame: 0,
      focusKey: ownerCameraFollowKey(input.focus, "person_1"),
      seed: input.focus.people[0]!.observations[0]!.box,
      outcome: "complete",
      points: [0, 2, 4, 6, 8, 9].map((frame) => ({ frame, x: 0.175, y: 0.25 })),
    },
  ];
  input.effects = [
    {
      id: crypto.randomUUID(),
      occurrence: "body",
      startFrame: 20,
      zoomFrames: 9,
      holdFrames: 9,
      returnFrames: 12,
      target: { centerX: 0.5, centerY: 0.5, zoom: 2 },
    },
  ];
  expect(
    planBulkHeadMotion(input).intervals.map((i) => [i.startFrame, i.endFrame]),
  ).toEqual([
    [10, 20],
    [53, 120],
  ]);
  input.focus.shots = [
    { ...input.focus.shots[0]!, endFrame: 3 },
    { ...input.focus.shots[0]!, startFrame: 3, endFrame: 20, personId: null },
    { ...input.focus.shots[0]!, startFrame: 20 },
  ];
  input.tracks = [];
  input.effects = [];
  input.focus.people[0]!.observations = [];
  expect(planBulkHeadMotion(input).blocked).toBe("invalid");
  input.focus.people[0]!.observations = [
    {
      startFrame: 0,
      endFrame: 3,
      box: { x: 0.1, y: 0.1, width: 0.15, height: 0.3 },
    },
  ];
  expect(planBulkHeadMotion(input).skipped).toMatchObject({
    short: 1,
    custom: 1,
    unseeded: 1,
  });
});

it("preflights capacity without invoking a sampler or silently truncating", async () => {
  const input = fixture(126);
  input.focus.shots = Array.from({ length: 21 }, (_, i) => ({
    ...input.focus.shots[0]!,
    startFrame: i * 6,
    endFrame: (i + 1) * 6,
  }));
  const plan = planBulkHeadMotion(input),
    never = vi.fn<typeof trackHeadVideo>();
  expect(plan.intervals).toHaveLength(21);
  expect(plan.blocked).toBe("capacity");
  await expect(trackBulkHeadMotion(runInput(input), never)).rejects.toThrow(
    "bulk_head_plan_unavailable",
  );
  expect(never).not.toHaveBeenCalled();
});

it("splits long shots without tiny tails, carries the same head between chunks and returns valid paths atomically", async () => {
  const input = fixture(1801),
    before = JSON.stringify(input),
    request = runInput(input),
    sampler = vi.fn(sample.getMockImplementation()!);
  const plan = planBulkHeadMotion(input);
  expect(plan.intervals.map((i) => i.endFrame - i.startFrame)).toEqual([
    900, 895, 6,
  ]);
  const result = await trackBulkHeadMotion(request, sampler);
  expect(result.complete).toBe(3);
  expect(result.tracks[1]!.continues).toBe(result.tracks[0]!.id);
  expect(result.tracks[2]!.continues).toBe(result.tracks[1]!.id);
  expect(result.failed).toBe(0);
  expect(sampler).toHaveBeenCalledTimes(3);
  expect(sampler.mock.calls[1]![0].seed.x).toBeCloseTo(0.11);
  expect(sampler.mock.calls[2]![0].seed.x).toBeCloseTo(0.12);
  expect(ownerCameraTracksSchema.safeParse(result.tracks).success).toBe(true);
  const fractions = request.progress.mock.calls.map(
    ([value]) => value.fraction,
  );
  expect(fractions.at(-1)).toBe(1);
  expect(
    fractions.every((n, i) => n >= (fractions[i - 1] ?? 0) && n <= 1),
  ).toBe(true);
  expect(JSON.stringify(input)).toBe(before);
});

it("keeps a carried head centered near a source edge instead of shifting the target to fit its box", async () => {
  const input = fixture(901);
  const sampler = vi.fn<typeof trackHeadVideo>(async (args) => {
    const result = await sample.getMockImplementation()!(args);
    return {
      ...result,
      points: result.points.map((point, index) => ({
        ...point,
        x: index === 0 ? args.seed.x + args.seed.width / 2 : 0.99,
      })),
    };
  });
  const result = await trackBulkHeadMotion(runInput(input), sampler);
  expect(result.complete).toBe(2);
  const seed = sampler.mock.calls[1]![0].seed;
  expect(seed.x + seed.width / 2).toBeCloseTo(0.99);
  expect(seed.width).toBeCloseTo(0.02);
});

it("keeps a lost partial path and stops dependent chunks without reacquiring or retrying", async () => {
  const input = fixture(1801),
    sampler = vi.fn<typeof trackHeadVideo>(async ({ seed }) => ({
      outcome: "lost",
      points: [0, 2, 4, 6, 8, 9].map((frame) => ({
        frame,
        x: seed.x + seed.width / 2,
        y: seed.y + seed.height / 2,
      })),
    }));
  const result = await trackBulkHeadMotion(runInput(input), sampler);
  expect(result.partial).toBe(1);
  expect(result.failed).toBe(2);
  expect(result.tracks[0]!.endFrame).toBe(10);
  expect(sampler).toHaveBeenCalledTimes(1);
});

it("cancels atomically between intervals and does not alter caller paths", async () => {
  const input = fixture(),
    controller = new AbortController();
  input.hook = { startFrame: 0, endFrame: 30 };
  const before = JSON.stringify(input),
    sampler = vi.fn<typeof trackHeadVideo>(async (args) => {
      const result = await sample.getMockImplementation()!(args);
      controller.abort();
      return result;
    });
  await expect(
    trackBulkHeadMotion(runInput(input, controller.signal), sampler),
  ).rejects.toThrow();
  expect(sampler).toHaveBeenCalledTimes(1);
  expect(JSON.stringify(input)).toBe(before);
});

it("settles local failures once and continues independently at the next camera boundary", async () => {
  const input = fixture();
  input.focus.shots = [
    { ...input.focus.shots[0]!, endFrame: 60 },
    { ...input.focus.shots[0]!, startFrame: 60, personId: "person_2" },
  ];
  const sampler = vi
    .fn(sample.getMockImplementation()!)
    .mockRejectedValueOnce(Error("synthetic_failure"));
  const result = await trackBulkHeadMotion(runInput(input), sampler);
  expect(result.failed).toBe(1);
  expect(result.complete).toBe(1);
  expect(sampler).toHaveBeenCalledTimes(2);
  expect(result.tracks[0]!.personId).toBe("person_2");
});
