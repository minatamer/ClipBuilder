import { expect, it } from "vitest";
import { ownerYoutubeAudioImportSchema } from "./youtube-audio.ts";
import { hostedEditingPath } from "./hosted-editing.ts";
import { ownerRuntimeCapabilitiesSchema } from "./runtime.ts";
it("keeps URL acquisition out of hosted capabilities and routes while retaining audio upload", () => {
  const id = "00000000-0000-4000-8000-000000000001";
  expect(
    hostedEditingPath("POST", `/workspace/${id}/clips/${id}/youtube-audio`),
  ).toBe(false);
  expect(hostedEditingPath("POST", `/workspace/${id}/clips/${id}/audio`)).toBe(
    true,
  );
  const hosted = {
    execution: "hosted",
    aiMode: "synthetic-ai",
    sourceMode: null,
    planningAvailable: true,
    localMedia: false,
    cloud: true,
  };
  expect(ownerRuntimeCapabilitiesSchema.safeParse(hosted).success).toBe(true);
  expect(
    ownerRuntimeCapabilitiesSchema.safeParse({ ...hosted, youtubeAudio: true })
      .success,
  ).toBe(false);
  expect(
    ownerYoutubeAudioImportSchema.safeParse({ url: "x".repeat(2049) }).success,
  ).toBe(false);
  expect(
    ownerYoutubeAudioImportSchema.safeParse({
      url: "https://youtu.be/SYNTHETIC01",
      command: "extra",
    }).success,
  ).toBe(false);
});
