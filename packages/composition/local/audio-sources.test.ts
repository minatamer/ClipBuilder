import { expect, it } from "vitest";
import { ownerSoundAudio } from "./audio-sources.ts";
import {
  OWNER_SOUNDS,
  ownerAudioDuration,
} from "../../contracts/local/audio.ts";

it("serves deterministic real recordings with exact catalogue sample clocks and keeps retired drafts playable", async () => {
  expect(
    OWNER_SOUNDS.filter((sound) => !sound.retired).map((sound) => sound.id),
  ).toEqual(["riser", "rising-tension", "pop", "discord", "bamboo", "boom"]);
  for (const sound of OWNER_SOUNDS) {
    const sample = ownerSoundAudio(sound.id);
    const [digest, repeated] = await Promise.all([
      crypto.subtle.digest("SHA-256", sample.bytes),
      crypto.subtle.digest("SHA-256", ownerSoundAudio(sound.id).bytes),
    ]);
    expect(new Uint8Array(digest)).toEqual(new Uint8Array(repeated));
    const bytes = new DataView(sample.bytes);
    if (!sound.recordingDigest) {
      expect(sample.extension).toBe("wav");
      expect(bytes.getUint32(0)).toBe(0x52494646);
    } else {
      expect(sample.mimeType).toBe("audio/flac");
      expect(sample.extension).toBe("flac");
      expect(
        Array.from(new Uint8Array(digest), (byte) =>
          byte.toString(16).padStart(2, "0"),
        ).join(""),
      ).toBe(sound.recordingDigest);
      expect(bytes.getUint32(0)).toBe(0x664c6143);
      // FLAC STREAMINFO packs the rate, channels, bit depth and total PCM samples.
      const packed = bytes.getBigUint64(18);
      expect(Number(packed >> 44n)).toBe(48000);
      expect(Number((packed >> 41n) & 7n) + 1).toBe(2);
      expect(Number((packed >> 36n) & 31n) + 1).toBe(16);
      expect(Number(packed & 0xfffffffffn)).toBe(
        Math.round(
          ownerAudioDuration({ kind: "builtin", id: sound.id }, []) * 48000,
        ),
      );
      expect(sample.bytes.byteLength).toBeLessThan(
        sound.id === "rising-tension" ? 650_000 : 400_000,
      );
    }
  }
});
