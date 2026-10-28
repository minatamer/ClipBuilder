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

it("uses existing anonymous labels, splits turns, retains lines and clocks, and falls back for unknown labels", () => {
  const config = resolveCaptionSpeakers([caption], words);
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
  expect(first.caption?.text).toBe("One two");
  expect(next.caption?.text).toBe("three four");
  expect(first.colors?.color).not.toBe(next.colors?.color);
  expect(next.caption?.wordCues).toEqual(caption.wordCues.slice(2));
  expect(
    captionSpeakerFrame(caption, 1450, config, OWNER_CAPTION_PRESETS.clean)
      .caption?.text,
  ).toBe("three four");
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
it("honors manual word corrections and all color roles without changing IDs/timing", () => {
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
