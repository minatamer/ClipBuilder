import { expect, it } from "vitest";
import {
  compileAutomaticOwnerFocus,
  defaultOwnerFocus,
  ownerFocusAt,
  ownerFocusCrop,
  ownerFocusSchema,
  ownerSourceContent,
  splitOwnerFocus,
  removeOwnerFocusShot,
} from "./focus.ts";

const source = { width: 1280, height: 720 },
  frames = 240;
const people = [
  {
    id: "person_1",
    observations: [
      {
        startFrame: 0,
        endFrame: frames,
        box: { x: 0.1, y: 0.1, width: 0.3, height: 0.6 },
      },
    ],
  },
  {
    id: "person_2",
    observations: [
      {
        startFrame: 0,
        endFrame: frames,
        box: { x: 0.6, y: 0.1, width: 0.3, height: 0.6 },
      },
    ],
  },
];
const word = { id: "w_1", speakerId: "spk_1", startMs: 2000, endMs: 5000 };
const decision = {
  startFrame: 60,
  endFrame: 180,
  personId: "person_2",
  speakerId: "spk_1",
  confidence: 0.95,
  evidenceWordIds: ["w_1"],
  shotStart: false,
};
it("fills from opening, holds uncertainty, switches only after supported speech and holds through the following pause", () => {
  const { focus, summary } = compileAutomaticOwnerFocus(
    {
      people,
      decisions: [
        { ...decision, startFrame: 15, confidence: 0.5 },
        decision,
        {
          ...decision,
          startFrame: 180,
          endFrame: 240,
          personId: null,
          speakerId: null,
          evidenceWordIds: [],
        },
      ],
    },
    source,
    frames,
    [word],
  );
  expect(focus.shots).toHaveLength(2);
  expect(ownerFocusAt(focus, 0).personId).toBe("person_1");
  expect(ownerFocusAt(focus, 89).personId).toBe("person_1");
  expect(ownerFocusAt(focus, 90).personId).toBe("person_2");
  expect(ownerFocusAt(focus, 239).personId).toBe("person_2");
  expect(summary).toMatchObject({ switches: 1, held: 2, fallback: 0 });
});
it("prefers the confirmed opening speaker over the left-most person", () => {
  const { focus } = compileAutomaticOwnerFocus(
    { people, decisions: [{ ...decision, startFrame: 0 }] },
    source,
    frames,
    [{ ...word, startMs: 0 }],
  );
  expect(focus.shots[0]!.personId).toBe("person_2");
});
it("uses sustained visual evidence for a right-hand opening without inventing an audio speaker", () => {
  const openingWord = { ...word, startMs: 0, endMs: 1800, speakerId: null };
  const { focus } = compileAutomaticOwnerFocus(
    {
      people,
      decisions: [{ ...decision, startFrame: 0, speakerId: null }],
    },
    source,
    frames,
    [openingWord],
  );
  expect(focus.shots).toMatchObject([
    {
      startFrame: 0,
      endFrame: frames,
      personId: "person_2",
      reason: "opening",
    },
  ]);
  expect(focus.decisions[0]!.speakerId).toBeNull();
  expect(openingWord.speakerId).toBeNull();
});
it("keeps visual-only opening evidence conservative and never uses it for later switches", () => {
  const opening = { ...decision, startFrame: 0, speakerId: null };
  const unknown = { ...word, startMs: 0, endMs: 1800, speakerId: null };
  for (const [current, cues] of [
    [{ ...opening, confidence: 0.94 }, [unknown]],
    [{ ...opening, evidenceWordIds: ["invented"] }, [unknown]],
    [opening, [{ ...unknown, endMs: 900 }]],
    [opening, [{ ...unknown, speakerId: "spk_1" }]],
    [opening, [unknown, { ...unknown, id: "other", speakerId: "spk_0" }]],
    [
      { ...opening, startFrame: 60 },
      [{ ...unknown, startMs: 2000, endMs: 3800 }],
    ],
    [opening, [{ ...unknown, startMs: 1000, endMs: 2800 }]],
  ] as const) {
    const { focus } = compileAutomaticOwnerFocus(
      { people, decisions: [current] },
      source,
      frames,
      cues,
    );
    expect(focus.shots.every((s) => s.personId === "person_1")).toBe(true);
  }
});
it("does not choose between contradictory visible opening speakers", () => {
  const { focus } = compileAutomaticOwnerFocus(
    {
      people,
      decisions: ["person_1", "person_2"].map((personId) => ({
        ...decision,
        startFrame: 0,
        personId,
        speakerId: null,
      })),
    },
    source,
    frames,
    [{ ...word, startMs: 0, speakerId: null }],
  );
  expect(focus.shots[0]!.personId).toBe("person_1");
});
it("permits visual-only re-establishment at a real shot boundary", () => {
  const { focus } = compileAutomaticOwnerFocus(
    {
      people,
      decisions: [
        {
          ...decision,
          startFrame: 120,
          endFrame: 240,
          speakerId: null,
          shotStart: true,
        },
      ],
    },
    source,
    frames,
    [{ ...word, startMs: 4000, endMs: 6000, speakerId: null }],
  );
  expect(ownerFocusAt(focus, 119).personId).toBe("person_1");
  expect(ownerFocusAt(focus, 120).personId).toBe("person_2");
});
it("waits for the actual supporting words rather than switching early at the decision's start", () => {
  const { focus } = compileAutomaticOwnerFocus(
    { people, decisions: [{ ...decision, startFrame: 0 }] },
    source,
    frames,
    [word],
  );
  expect(ownerFocusAt(focus, 0).personId).toBe("person_1");
  expect(ownerFocusAt(focus, 89).personId).toBe("person_1");
  expect(ownerFocusAt(focus, 90).personId).toBe("person_2");
});
it("chooses the first person when people enter after an empty opening", () => {
  const { focus } = compileAutomaticOwnerFocus(
    {
      people: [
        {
          ...people[1],
          observations: [{ ...people[1]!.observations[0], startFrame: 45 }],
        },
      ],
      decisions: [],
    },
    source,
    frames,
  );
  expect(ownerFocusAt(focus, 44).personId).toBeNull();
  expect(ownerFocusAt(focus, 45).personId).toBe("person_2");
});
it("holds through cross-talk or disconnected evidence and never switches to someone who has left", () => {
  const raw = { people, decisions: [decision] };
  expect(
    compileAutomaticOwnerFocus(raw, source, frames, [
      word,
      {
        ...word,
        id: "w_other",
        speakerId: "spk_0",
        startMs: 2500,
        endMs: 2900,
      },
    ]).focus.shots,
  ).toHaveLength(1);
  expect(
    compileAutomaticOwnerFocus(
      {
        ...raw,
        people: [
          people[0],
          {
            ...people[1],
            observations: [{ ...people[1]!.observations[0], endFrame: 75 }],
          },
        ],
      },
      source,
      frames,
      [word],
    ).focus.shots,
  ).toHaveLength(1);
  expect(
    compileAutomaticOwnerFocus(
      {
        ...raw,
        decisions: [
          { ...decision, endFrame: 240, evidenceWordIds: ["w_a", "w_b"] },
        ],
      },
      source,
      frames,
      [
        { ...word, id: "w_a", startMs: 2000, endMs: 2500 },
        { ...word, id: "w_b", startMs: 6000, endMs: 6500 },
      ],
    ).focus.shots,
  ).toHaveLength(1);
});
it("orders overlapping proposals by their actual confirmation clocks", () => {
  const { focus } = compileAutomaticOwnerFocus(
    {
      people,
      decisions: [
        {
          ...decision,
          startFrame: 0,
          endFrame: 210,
          evidenceWordIds: ["late"],
        },
        {
          ...decision,
          startFrame: 30,
          endFrame: 120,
          personId: "person_1",
          speakerId: "spk_0",
          evidenceWordIds: ["early"],
        },
      ],
    },
    source,
    frames,
    [
      { ...word, id: "late", startMs: 4000, endMs: 6000 },
      { ...word, id: "early", speakerId: "spk_0", startMs: 1000, endMs: 3000 },
    ],
  );
  expect(ownerFocusAt(focus, 149).personId).toBe("person_1");
  expect(ownerFocusAt(focus, 150).personId).toBe("person_2");
});
it("does not switch for invented evidence, brief speech, offscreen people or duplicate evidence", () => {
  for (const current of [
    { ...decision, evidenceWordIds: ["invented"] },
    { ...decision, personId: "person_3" },
    { ...decision, evidenceWordIds: ["w_1", "w_1"] },
  ]) {
    const { focus } = compileAutomaticOwnerFocus(
      { people, decisions: [current] },
      source,
      frames,
      [{ ...word, endMs: 2400 }],
    );
    expect(focus.shots).toHaveLength(1);
    expect(focus.shots[0]!.personId).toBe("person_1");
  }
});
it("resets geometry at real cuts without carrying an offscreen person", () => {
  const { focus } = compileAutomaticOwnerFocus(
    {
      people: [
        {
          ...people[0],
          observations: [{ ...people[0]!.observations[0], endFrame: 120 }],
        },
        {
          ...people[1],
          observations: [{ ...people[1]!.observations[0], startFrame: 120 }],
        },
      ],
      decisions: [
        {
          ...decision,
          startFrame: 120,
          endFrame: 240,
          shotStart: true,
          confidence: 0,
        },
      ],
    },
    source,
    frames,
    [],
  );
  expect(ownerFocusAt(focus, 119).personId).toBe("person_1");
  expect(ownerFocusAt(focus, 120).personId).toBe("person_2");
});
it("keeps usable people when neighbouring observations fail and converts only physical clocks", () => {
  const { focus, summary } = compileAutomaticOwnerFocus(
    {
      people: [
        {
          ...people[0],
          observations: [
            { ...people[0]!.observations[0], startFrame: -0.4, endFrame: 260 },
            { box: { x: NaN } },
          ],
        },
        { id: "unsafe", observations: [] },
      ],
      decisions: [{ ...decision, startFrame: 30.2, endFrame: 99.9 }, null],
    },
    source,
    frames,
    [],
  );
  expect(focus.people).toHaveLength(1);
  expect(focus.people[0]!.observations[0]).toMatchObject({
    startFrame: 0,
    endFrame: 240,
  });
  expect(summary.rejected).toBeGreaterThan(0);
  expect(summary.converted).toBe(2);
});
it("uses a bounded provisional side crop when nothing is returned, with no wide mode", () => {
  for (const raw of [null, [], {}, { people: [null], decisions: [null] }]) {
    const { focus } = compileAutomaticOwnerFocus(raw, source, frames);
    expect(focus.shots[0]).toMatchObject({
      centerX: 0.25,
      zoom: 1,
      personId: null,
    });
  }
});
it.each([
  { width: 1280, height: 720 },
  { width: 720, height: 1280 },
  { width: 720, height: 720 },
  { width: 3840, height: 1080 },
  { width: 100, height: 3840 },
])("keeps all crops inside source content at every edge and zoom: %o", (s) => {
  const focus = defaultOwnerFocus(s, frames),
    content = ownerSourceContent(s);
  for (const centerX of [0, 0.5, 1])
    for (const centerY of [0, 0.5, 1])
      for (const zoom of [1, 1.5, 3]) {
        const crop = ownerFocusCrop(focus, {
          ...focus.shots[0]!,
          centerX,
          centerY,
          zoom,
        });
        expect(crop.x).toBeGreaterThanOrEqual(content.x);
        expect(crop.y).toBeGreaterThanOrEqual(content.y);
        expect(crop.x + crop.width).toBeLessThanOrEqual(
          content.x + content.width,
        );
        expect(crop.y + crop.height).toBeLessThanOrEqual(
          content.y + content.height,
        );
        for (const v of Object.values(crop)) expect(v % 2).toBe(0);
      }
});
it("splits and removes with exact half-open coverage without mutating the input", () => {
  const focus = defaultOwnerFocus(source, frames),
    initial = JSON.stringify(focus),
    split = splitOwnerFocus(focus, 90);
  expect(split.shots).toHaveLength(2);
  expect(ownerFocusAt(split, 89)).toBe(split.shots[0]);
  expect(ownerFocusAt(split, 90)).toBe(split.shots[1]);
  expect(ownerFocusSchema.parse(split)).toEqual(split);
  expect(JSON.stringify(focus)).toBe(initial);
  expect(removeOwnerFocusShot(split, 0).shots[0]).toMatchObject({
    startFrame: 0,
    endFrame: frames,
  });
  expect(removeOwnerFocusShot(split, 1)).toEqual(focus);
  for (const at of [-1, 0, frames, NaN, 1.5])
    expect(splitOwnerFocus(focus, at)).toBe(focus);
});
it("bounds returned complexity and still covers the entire clip", () => {
  const { focus } = compileAutomaticOwnerFocus(
    {
      people,
      decisions: Array.from({ length: 120 }, (_, i) => ({
        ...decision,
        startFrame: i * 2,
        endFrame: i * 2 + 2,
        shotStart: true,
      })),
    },
    source,
    frames,
    [word],
  );
  expect(focus.shots.length).toBeLessThanOrEqual(60);
  expect(focus.shots.at(-1)!.endFrame).toBe(frames);
});
it("rejects malformed manual tracks instead of silently changing the user's intent", () => {
  const focus = defaultOwnerFocus(source, frames);
  for (const change of [
    { startFrame: 1 },
    { endFrame: frames + 1 },
    { zoom: 0.9 },
    { centerX: NaN },
    { personId: "person_8" },
  ])
    expect(
      ownerFocusSchema.safeParse({
        ...focus,
        shots: [{ ...focus.shots[0], ...change }],
      }).success,
    ).toBe(false);
});
