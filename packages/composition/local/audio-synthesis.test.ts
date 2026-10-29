import { expect, it } from "vitest";
import { ownerBuiltinWav } from "./audio-synthesis.ts";
import {
  OWNER_SOUNDS,
  OWNER_AUDIO_LIMITS,
} from "../../contracts/local/audio.ts";
it("keeps retired original sounds as deterministic stereo PCM with audible energy, bounded peaks and silent edges", () => {
  for (const sound of OWNER_SOUNDS.filter(
    (sound) => sound.retired && !sound.recordingDigest,
  )) {
    const value = ownerBuiltinWav(sound.id),
      view = new DataView(value);
    const first = new Uint8Array(value),
      second = new Uint8Array(ownerBuiltinWav(sound.id));
    let different = 0;
    for (let i = 0; i < first.length; i++)
      if (first[i] !== second[i]) different++;
    expect(different).toBe(0);
    expect(view.getUint32(24, true)).toBe(OWNER_AUDIO_LIMITS.sampleRate);
    expect(view.getUint16(22, true)).toBe(2);
    expect(value.byteLength).toBe(44 + Math.round(sound.seconds * 48000) * 4);
    let energy = 0,
      peak = 0,
      mismatches = 0;
    for (let i = 44; i < value.byteLength; i += 4) {
      const sample = view.getInt16(i, true);
      energy += sample * sample;
      peak = Math.max(peak, Math.abs(sample));
      if (view.getInt16(i + 2, true) !== sample) mismatches++;
    }
    expect(peak).toBeLessThan(27000);
    expect(mismatches).toBe(0);
    expect(peak).toBeGreaterThan(1000);
    expect(energy / (value.byteLength / 4)).toBeGreaterThan(50000);
    expect(view.getInt16(44, true)).toBe(0);
    expect(Math.abs(view.getInt16(value.byteLength - 4, true))).toBeLessThan(
      100,
    );
  }
});
