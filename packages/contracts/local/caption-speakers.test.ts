import { expect, it } from "vitest";
import {
  captionSpeakerFrame,
  defaultSpeakerColor,
  resolveCaptionSpeakers,
  ownerCaptionSpeakersSchema,
} from "./caption-speakers.ts";
import { OWNER_CAPTION_PRESETS } from "./editor.ts";
import type { OwnerOverlay } from "./clips.ts";

const caption: OwnerOverlay["captions"][number] = {
  startMs: 0,
  endMs: 1500,
  text: "One two three four",
  lines: ["One two", "three four"],
  wordIds: ["w_000001", "w_000002", "w_000003", "w_000004"],
  wordCues: ["One", "two", "three", "four"].map((text, i) => ({
    wordId: `w_00000${i + 1}`,
    text,
    startMs: i * 350,
    endMs: (i + 1) * 350,
  })),
};
const words = caption.wordCues.map((w, i) => ({
  id: w.wordId,
  startMs: w.startMs,
  endMs: w.endMs,
  text: w.text,
  punctuatedText: w.text,
  speakerId: i < 2 ? "spk_0" : "spk_1",
  confidence: 1,
}));

it("enables coloring automatically when complete captions have different known speakers", () => {
  const captions = [0, 2].map((offset) => ({
    ...caption,
    wordIds: caption.wordIds.slice(offset, offset + 2),
    wordCues: caption.wordCues.slice(offset, offset + 2),
  }));
  const result = resolveCaptionSpeakers(captions, words);
  expect(result.enabled).toBe(true);
  expect(result.assignments.map((word) => word.speakerId)).toEqual([
    "spk_0",
    "spk_0",
    "spk_1",
    "spk_1",
  ]);
});

it("assigns one stable speaker to the full caption, breaks ties by word order, and falls back for unknown labels", () => {
  const config = resolveCaptionSpeakers([caption], words, {
    enabled: true,
    colors: [],
    assignments: [],
  });
  expect(config.enabled).toBe(true);
  const first = captionSpeakerFrame(
    caption,
    100,
    config,
    OWNER_CAPTION_PRESETS.clean,
  );
  const next = captionSpeakerFrame(
    caption,
    1000,
    config,
    OWNER_CAPTION_PRESETS.clean,
  );
  expect(first.caption).toBe(caption);
  expect(next.caption).toBe(caption);
  expect(first.colors?.speakerId).toBe("spk_0");
  expect(first.colors).toEqual(next.colors);
  expect(config.assignments.map((word) => word.speakerId)).toEqual(
    Array(4).fill("spk_0"),
  );
  expect(
    captionSpeakerFrame(caption, 1450, config, OWNER_CAPTION_PRESETS.clean)
      .caption?.text,
  ).toBe(caption.text);
  expect(resolveCaptionSpeakers([caption], []).enabled).toBe(false);
  expect(
    captionSpeakerFrame(
      caption,
      100,
      { ...config, enabled: false },
      OWNER_CAPTION_PRESETS.clean,
    ).caption,
  ).toBe(caption);
  const neutral = {
    ...config,
    assignments: config.assignments.map((w) => ({ ...w, speakerId: null })),
  };
  expect(
    captionSpeakerFrame(caption, 100, neutral, OWNER_CAPTION_PRESETS.clean)
      .colors,
  ).toBeUndefined();
});
it("honors whole-caption correction and all color roles without changing IDs/timing", () => {
  const config = resolveCaptionSpeakers([caption], words, {
    enabled: true,
    colors: [
      {
        speakerId: "spk_7",
        color: "#112233",
        backgroundColor: "#445566",
        highlight: "#778899",
      },
    ],
    assignments: caption.wordIds.map((wordId) => ({
      wordId,
      speakerId: "spk_7",
    })),
  });
  const frame = captionSpeakerFrame(
    caption,
    100,
    config,
    OWNER_CAPTION_PRESETS.clean,
  );
  expect(frame.caption?.lines).toEqual(caption.lines);
  expect(frame.colors).toEqual(config.colors[0]);
  expect(frame.caption?.wordCues).toEqual(caption.wordCues);
  expect(() =>
    resolveCaptionSpeakers([caption], words, {
      ...config,
      assignments: [{ wordId: "absent", speakerId: null }],
    }),
  ).toThrow("unknown_caption_word");
  expect(
    ownerCaptionSpeakersSchema.safeParse({
      ...config,
      colors: [...config.colors, ...config.colors],
    }).success,
  ).toBe(false);
  expect(
    new Set(
      Array.from(
        { length: 16 },
        (_, i) =>
          defaultSpeakerColor(`spk_${i}`, OWNER_CAPTION_PRESETS.clean).color,
      ),
    ).size,
  ).toBe(16);
});

it("uses a known majority for legacy mixed edits, including when the first word is unknown", () => {
  const legacy = {
    enabled: true,
    colors: [],
    assignments: caption.wordIds.map((wordId, i) => ({
      wordId,
      speakerId: i === 0 ? null : i === 1 ? "spk_0" : "spk_1",
    })),
  };
  const before = structuredClone(caption);
  const resolved = resolveCaptionSpeakers([caption], words, legacy);
  expect(resolved.assignments.every((word) => word.speakerId === "spk_1")).toBe(
    true,
  );
  for (const ms of [0, 400, 800, 1450]) {
    const frame = captionSpeakerFrame(
      caption,
      ms,
      legacy,
      OWNER_CAPTION_PRESETS.clean,
    );
    expect(frame.caption).toBe(caption);
    expect(frame.colors?.speakerId).toBe("spk_1");
  }
  expect(caption).toEqual(before);
});
