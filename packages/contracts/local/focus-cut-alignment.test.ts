import { expect, it } from "vitest";
import { alignAutomaticFocusCuts } from "./focus-cut-alignment.ts";
import { defaultOwnerFocus, ownerFocusAt, ownerFocusSchema } from "./focus.ts";

function fixture(samePerson = false) {
  const focus = defaultOwnerFocus({ width: 1280, height: 720 }, 240);
  focus.people = [
    {
      id: "person_1",
      observations: [
        {
          startFrame: 0,
          endFrame: 74,
          box: { x: 0.1, y: 0.1, width: 0.2, height: 0.3 },
        },
        ...(samePerson
          ? [
              {
                startFrame: 74,
                endFrame: 240,
                box: { x: 0.6, y: 0.1, width: 0.2, height: 0.3 },
              },
            ]
          : []),
      ],
    },
    ...(!samePerson
      ? [
          {
            id: "person_2",
            observations: [
              {
                startFrame: 74,
                endFrame: 240,
                box: { x: 0.6, y: 0.1, width: 0.2, height: 0.3 },
              },
            ],
          },
        ]
      : []),
  ];
  focus.decisions = [
    {
      startFrame: 0,
      endFrame: 74,
      personId: "person_1",
      speakerId: null,
      confidence: 0.95,
      evidenceWordIds: [],
      shotStart: true,
    },
    {
      startFrame: 74,
      endFrame: 240,
      personId: samePerson ? "person_1" : "person_2",
      speakerId: null,
      confidence: 0.95,
      evidenceWordIds: [],
      shotStart: true,
    },
  ];
  focus.shots = [
    {
      ...focus.shots[0]!,
      startFrame: 0,
      endFrame: 74,
      personId: "person_1",
      centerX: 0.2,
    },
    {
      ...focus.shots[0]!,
      startFrame: 74,
      endFrame: 240,
      personId: samePerson ? "person_1" : "person_2",
      centerX: 0.7,
      reason: "shot-reset",
    },
  ];
  return ownerFocusSchema.parse(focus);
}
it.each([false, true])(
  "moves a fourteen-frame-late reset and all matching clocks to the first new source frame (same person: %s)",
  (samePerson) => {
    const focus = fixture(samePerson),
      before = structuredClone(focus);
    const result = alignAutomaticFocusCuts(focus, [60]);
    expect(ownerFocusAt(result, 59).centerX).toBe(0.2);
    expect(ownerFocusAt(result, 60).centerX).toBe(0.7);
    expect(result.decisions.map((d) => [d.startFrame, d.endFrame])).toEqual([
      [0, 60],
      [60, 240],
    ]);
    expect(
      result.people
        .flatMap((p) => p.observations)
        .map((o) => [o.startFrame, o.endFrame]),
    ).toEqual([
      [0, 60],
      [60, 240],
    ]);
    expect(
      result.shots.map((shot) => [
        shot.personId,
        shot.centerX,
        shot.centerY,
        shot.zoom,
        shot.reason,
      ]),
    ).toEqual(
      focus.shots.map((shot) => [
        shot.personId,
        shot.centerX,
        shot.centerY,
        shot.zoom,
        shot.reason,
      ]),
    );
    expect(focus).toEqual(before);
    expect(alignAutomaticFocusCuts(result, [60])).toBe(result);
  },
);
it("corrects an early boundary but preserves manual plans, speech switches, ambiguity and unmatched cuts", () => {
  const focus = fixture();
  expect(ownerFocusAt(alignAutomaticFocusCuts(focus, [85]), 84).centerX).toBe(
    0.2,
  );
  for (const cuts of [[], [10], [65, 83], [60, 61], [NaN, -1, 240]])
    expect(alignAutomaticFocusCuts(focus, cuts)).toBe(focus);
  const manual = structuredClone(focus);
  manual.shots[1]!.reason = "manual";
  expect(alignAutomaticFocusCuts(manual, [60])).toBe(manual);
  const speech = structuredClone(focus);
  speech.shots[1]!.reason = "speaker";
  expect(alignAutomaticFocusCuts(speech, [60])).toBe(speech);
  const crossing = structuredClone(focus);
  crossing.decisions.push({
    ...crossing.decisions[0]!,
    startFrame: 65,
    endFrame: 70,
    shotStart: false,
  });
  expect(alignAutomaticFocusCuts(crossing, [60])).toBe(crossing);
});
