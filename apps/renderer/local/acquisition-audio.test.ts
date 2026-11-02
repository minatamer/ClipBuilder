import { expect, it } from "vitest";
import {
  assertAcquisitionAudio,
  matchesAcquisitionAudioClock,
} from "./acquisition-audio.ts";
import { ownerAcquisitionDescriptorSchema } from "../../../packages/contracts/local/acquisition-profile.ts";
const selected = {
  width: 256,
  height: 144,
  fps: 30,
  durationMs: 2000,
  videoCodec: "h264",
  audioCodec: "aac",
  audioChannels: 2,
  audioSampleRate: 22050,
} as const;
const stream = {
  codec_type: "audio",
  codec_name: "aac",
  channels: 2,
  sample_rate: 44100,
  profile: "HE-AAC",
};
it.each([22050, 44100])(
  "admits only the offered HE-AAC core or SBR output rate (%s)",
  (sample_rate) => {
    expect(() =>
      assertAcquisitionAudio(
        { ...stream, sample_rate },
        { ...selected, audioSbr: true as const },
      ),
    ).not.toThrow();
  },
);
it.each([
  [
    { ...stream, sample_rate: 48000 },
    { ...selected, audioSbr: true as const },
  ],
  [
    { ...stream, profile: "LC" },
    { ...selected, audioSbr: true as const },
  ],
  [
    { ...stream, profile: undefined },
    { ...selected, audioSbr: true as const },
  ],
  [
    { ...stream, channels: 1 },
    { ...selected, audioSbr: true as const },
  ],
  [stream, selected],
])(
  "rejects changed rates, profiles, channels and unsignaled doubling (%j)",
  (actual, expected) => {
    expect(() => assertAcquisitionAudio(actual, expected)).toThrow(
      "acquisition_selection_changed",
    );
  },
);
it("retains exact AAC-LC/Opus rate binding and legacy descriptor compatibility", () => {
  for (const audioCodec of ["aac", "opus"] as const) {
    const expected = { ...selected, audioCodec };
    expect(ownerAcquisitionDescriptorSchema.parse(expected)).toEqual(expected);
    expect(() =>
      assertAcquisitionAudio(
        {
          ...stream,
          codec_name: audioCodec,
          profile: "LC",
          sample_rate: 22050,
        },
        expected,
      ),
    ).not.toThrow();
    expect(() =>
      assertAcquisitionAudio({ ...stream, codec_name: audioCodec }, expected),
    ).toThrow("acquisition_selection_changed");
  }
  expect(() =>
    ownerAcquisitionDescriptorSchema.parse({
      ...selected,
      audioCodec: "opus",
      audioSbr: true as const,
    }),
  ).toThrow();
});

it("allows HE-AAC packet quantization without admitting large drift or changing legacy clock tolerance", () => {
  const he = { ...selected, audioSbr: true as const };
  expect(matchesAcquisitionAudioClock(2120, 2000, he, 44100)).toBe(true);
  expect(matchesAcquisitionAudioClock(2120, 2000, selected, 44100)).toBe(false);
  expect(matchesAcquisitionAudioClock(2250, 2000, he, 44100)).toBe(false);
  expect(
    matchesAcquisitionAudioClock(
      2120,
      2000,
      { ...selected, audioCodec: "opus" },
      48000,
    ),
  ).toBe(false);
});
