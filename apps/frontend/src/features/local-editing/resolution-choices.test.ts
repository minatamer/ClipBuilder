import { expect, it } from "vitest";
import { ownerYoutubeChoiceSchema } from "../../../../../packages/contracts/local/acquisition.ts";
import {
  resolutionChoices,
  savedResolutionChoices,
} from "./resolution-choices.ts";
import type { OwnerSavedSourceEntry } from "../../../../../packages/contracts/local/acquisition-flow.ts";

function choice(id: string, video: string, bitrate: number) {
  return ownerYoutubeChoiceSchema.parse({
    id: id.repeat(64),
    tier: 720,
    preferredAudio: false,
    supported: true,
    reason: null,
    bytes: null,
    bytesEstimated: false,
    video: {
      formatId: video,
      width: 1280,
      height: 720,
      fps: 30,
      codec: "h264",
      protocol: "https",
      drm: false,
      bytes: null,
      bytesEstimated: false,
      bitrateKbps: 1000,
      dynamicRange: "sdr",
      quality: null,
      preference: null,
    },
    audio: {
      formatId: "audio-" + id,
      codec: "aac",
      protocol: "https",
      drm: false,
      bytes: null,
      bytesEstimated: false,
      bitrateKbps: bitrate,
      channels: 2,
      sampleRate: 48000,
      language: "en",
      trackId: "original",
      role: "original",
    },
  });
}
it("collapses repeated encodings while retaining the server's video rank and exact choice", () => {
  const lowerAudio = choice("a", "higher-ranked-video", 64);
  const higherAudio = choice("b", "higher-ranked-video", 160);
  const laterVideo = choice("c", "later-video", 320);
  expect(resolutionChoices([lowerAudio, higherAudio, laterVideo])).toEqual([
    higherAudio,
  ]);
  expect(lowerAudio.audio?.bitrateKbps).toBe(64);
});
it("keeps one English resolution and prefers original admitted audio on the ranked video", () => {
  const first = choice("a", "video", 160);
  const preferred = { ...choice("b", "video", 128), preferredAudio: true };
  const otherTrack = {
    ...choice("c", "video", 160),
    audio: { ...first.audio!, trackId: "other", language: "fr" },
  };
  const fast = {
    ...choice("d", "video60", 160),
    video: { ...first.video, fps: 60 },
  };
  expect(resolutionChoices([first, preferred, otherTrack, fast])).toEqual([
    preferred,
  ]);
});
it("shows only 480p through 1440p and accepts English regional tags", () => {
  const choices = [360, 480, 720, 1080, 1440, 2160].map((tier, index) => {
    const item = choice("abcdef"[index]!, "video-" + tier, 160);
    return {
      ...item,
      tier,
      video: {
        ...item.video,
        width: Math.round((tier * 16) / 9),
        height: tier,
      },
      audio: { ...item.audio!, language: index % 2 ? "en-US" : "EN-gb" },
    };
  });
  expect(resolutionChoices(choices).map((item) => item.tier)).toEqual([
    480, 720, 1080, 1440,
  ]);
  for (const language of [null, "fr", "ar", "eng", "enough"]) {
    expect(
      resolutionChoices([
        { ...choices[1]!, audio: { ...choices[1]!.audio!, language } },
      ]),
    ).toEqual([]);
  }
});
it("retains original English over a higher-bitrate dubbed/default track", () => {
  const original = { ...choice("a", "video", 128), preferredAudio: false };
  const dubbed = {
    ...choice("b", "video", 256),
    preferredAudio: true,
    audio: {
      ...original.audio!,
      formatId: "default-audio",
      role: "default" as const,
      trackId: "dubbed",
      bitrateKbps: 256,
    },
  };
  expect(resolutionChoices([dubbed, original])).toEqual([original]);
});
it("never exposes unsupported variants as downloadable choices", () => {
  const unsupported = {
    ...choice("a", "video", 160),
    supported: false,
    reason: "video-codec" as const,
  };
  expect(resolutionChoices([unsupported])).toEqual([]);
});
it("filters and deduplicates saved qualities without losing their exact registered identity", () => {
  const first = choice("a", "video", 128);
  const saved: OwnerSavedSourceEntry = {
    destination: "downloads",
    variant: {
      id: crypto.randomUUID(),
      sourceId: "a".repeat(64),
      mode: "provider-source",
      acquiredAt: "2026-10-23T10:00:00Z",
      selection: { kind: "variant" },
      video: first.video,
      audio: first.audio!,
      actual: {
        fingerprint: "b".repeat(64),
        bytes: 8,
        durationMs: 10000,
        width: 1280,
        height: 720,
        fps: 30,
      },
      offsetMs: 0,
      state: "ready",
    },
  };
  const duplicate = { ...saved, destination: "desktop" as const };
  const foreign = {
    ...saved,
    variant: {
      ...saved.variant,
      audio: { ...saved.variant.audio, language: "fr" },
    },
  };
  const low = {
    ...saved,
    variant: {
      ...saved.variant,
      actual: { ...saved.variant.actual, width: 640, height: 360 },
    },
  };
  expect(savedResolutionChoices([foreign, low, saved, duplicate])).toEqual([
    saved,
  ]);
});
