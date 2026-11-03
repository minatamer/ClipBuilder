import { expect, it } from "vitest";
import {
  compileAutomaticOwnerFocus,
  defaultOwnerFocus,
  ownerFocusAt,
  ownerFocusSchema,
  type OwnerFocus,
} from "./focus.ts";

const source = { width: 1280, height: 720 },
  frames = 240;
const person = (id: string, startFrame = 0, endFrame = frames, x = 0.6) => ({
  id,
  observations: [
    { startFrame, endFrame, box: { x, y: 0.1, width: 0.2, height: 0.3 } },
  ],
});
const speech = (
  id: string,
  speakerId = "spk_0",
  startMs = 0,
  endMs = 2500,
) => ({ id, speakerId, startMs, endMs });
const decision = (
  personId: string,
  wordId: string,
  startFrame = 0,
  endFrame = 90,
  speakerId = "spk_0",
  shotStart = false,
) => ({
  personId,
  speakerId,
  startFrame,
  endFrame,
  shotStart,
  confidence: 0.99,
  evidenceWordIds: [wordId],
});

it.each([false, true])(
  "reuses the earliest person for a later same-speaker view, preserving baseline and cut geometry (cut=%s)",
  (cut) => {
    const raw = {
      people: [
        person("person_5", 90, frames, cut ? 0.25 : 0.64),
        person("person_2", 0, 90),
        person("person_1", 0, 90, 0.05),
      ],
      decisions: [
        decision("person_2", "opening"),
        decision("person_5", "later", 90, frames, "spk_0", cut),
      ],
    };
    const words = [speech("opening"), speech("later", "spk_0", 3000, 7000)];
    const before = JSON.stringify({ raw, words });
    const { focus, summary } = compileAutomaticOwnerFocus(
      raw,
      source,
      frames,
      words,
    );
    expect(focus.people.map((p) => p.id)).toEqual(["person_1", "person_2"]);
    expect(focus.decisions.map((d) => d.personId)).toEqual([
      "person_2",
      "person_2",
    ]);
    expect(
      focus.people.find((p) => p.id === "person_2")!.observations,
    ).toHaveLength(2);
    expect(ownerFocusAt(focus, 0).centerX).toBeCloseTo(0.7);
    expect(ownerFocusAt(focus, 200).centerX).toBeCloseTo(cut ? 0.35 : 0.7);
    expect(ownerFocusAt(focus, 200).personId).toBe("person_2");
    expect(focus.shots).toHaveLength(cut ? 2 : 1);
    expect(summary.mergedPeople).toBe(1);
    expect(JSON.stringify({ raw, words })).toBe(before);
  },
);

it.each([0, 63])(
  "merges a strongly coincident or short same-shot unknown continuation (start=%s)",
  (start) => {
    const { focus } = compileAutomaticOwnerFocus(
      {
        people: [
          person("person_5", start, 120, 0.61),
          person("person_2", 0, start ? 60 : 120),
          person("person_1", 0, 120, 0.05),
        ],
        decisions: [],
      },
      source,
      frames,
    );
    expect(focus.people.map((p) => p.id)).toEqual(["person_1", "person_2"]);
    expect(focus.people[1]!.observations[0]!.box.x).toBe(0.6);
  },
);

it("never equates unknown people by screen position across a cut or a long gap", () => {
  for (const cut of [false, true]) {
    const { focus } = compileAutomaticOwnerFocus(
      {
        people: [
          person("person_2", 0, 60),
          person("person_5", cut ? 60 : 90, frames),
        ],
        decisions: cut
          ? [
              {
                ...decision("person_5", "unknown", 60, frames),
                shotStart: true,
                speakerId: null,
              },
            ]
          : [],
      },
      source,
      frames,
    );
    expect(focus.people).toHaveLength(2);
  }
});

it.each([0.05, 0.44])(
  "holds conflicting speech associations instead of merging distinct co-visible heads or choosing a second target (x=%s)",
  (x) => {
    const { focus, summary } = compileAutomaticOwnerFocus(
      {
        people: [person("person_2", 0, frames, x), person("person_5")],
        decisions: [
          decision("person_2", "opening"),
          decision("person_5", "later", 120, frames),
        ],
      },
      source,
      frames,
      [speech("opening"), speech("later", "spk_0", 4000, 7000)],
    );
    expect(focus.people).toHaveLength(2);
    expect(focus.decisions.map((d) => d.personId)).toEqual(["person_2", null]);
    expect(focus.shots).toHaveLength(1);
    expect(ownerFocusAt(focus, 200).personId).toBe("person_2");
    expect(summary.speakerConflicts).toBe(1);
  },
);

it("does not collapse coincident estimates assigned to different supported speakers", () => {
  const { focus } = compileAutomaticOwnerFocus(
    {
      people: [person("person_2"), person("person_5", 0, frames, 0.61)],
      decisions: [
        decision("person_2", "opening"),
        decision("person_5", "later", 120, frames, "spk_1"),
      ],
    },
    source,
    frames,
    [speech("opening"), speech("later", "spk_1", 4000, 7000)],
  );
  expect(focus.people).toHaveLength(2);
  expect(ownerFocusAt(focus, 200).personId).toBe("person_5");
});

it("requires the existing sustained speech gate before joining disjoint same-speaker views", () => {
  const raw = {
    people: [person("person_2", 0, 90), person("person_5", 90, frames, 0.05)],
    decisions: [
      decision("person_2", "opening"),
      decision("person_5", "later", 90, frames, "spk_0", true),
    ],
  };
  for (const words of [
    [],
    [speech("opening", "spk_0", 0, 500), speech("later", "spk_0", 3000, 3500)],
  ]) {
    const { focus } = compileAutomaticOwnerFocus(raw, source, frames, words);
    expect(focus.people).toHaveLength(2);
    expect(focus.decisions.every((d) => d.personId === null)).toBe(true);
  }
});

it("does not let an overlapping alias chain swallow separated heads", () => {
  const { focus } = compileAutomaticOwnerFocus(
    {
      people: Array.from({ length: 8 }, (_, i) => ({
        ...person(`person_${i + 1}`),
        observations: [
          {
            startFrame: 0,
            endFrame: frames,
            box: { x: 0.1 + i * 0.02, y: 0.1, width: 0.1, height: 0.2 },
          },
        ],
      })),
      decisions: [],
    },
    source,
    frames,
  );
  expect(focus.people.length).toBeGreaterThan(1);
  for (const current of focus.people) {
    const positions = current.observations.map((o) => o.box.x);
    expect(Math.max(...positions) - Math.min(...positions)).toBeLessThanOrEqual(
      0.100001,
    );
  }
});

it("keeps the original bounds, complete shot coverage and deliberately saved/manual identities", () => {
  const { focus } = compileAutomaticOwnerFocus(
    {
      people: Array.from({ length: 8 }, (_, i) => ({
        ...person(`person_${i + 1}`),
        observations: Array.from({ length: 15 }, (_, n) => ({
          ...person("person_1").observations[0]!,
          startFrame: n * 15,
          endFrame: n * 15 + 15,
        })),
      })),
      decisions: [],
    },
    source,
    frames,
  );
  expect(
    focus.people.flatMap((p) => p.observations).length,
  ).toBeLessThanOrEqual(120);
  expect(focus.shots[0]!.startFrame).toBe(0);
  expect(focus.shots.at(-1)!.endFrame).toBe(frames);
  const saved: OwnerFocus = {
    ...defaultOwnerFocus(source, frames),
    people: [person("person_2"), person("person_5")],
    shots: [{ ...focus.shots[0]!, personId: "person_5", reason: "manual" }],
  };
  expect(ownerFocusSchema.parse(JSON.parse(JSON.stringify(saved)))).toEqual(
    saved,
  );
});
