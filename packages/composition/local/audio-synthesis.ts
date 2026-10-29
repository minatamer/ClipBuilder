import {
  OWNER_AUDIO_LIMITS,
  OWNER_SOUNDS,
  type OwnerSoundId,
} from "../../contracts/local/audio.ts";

/** Original oscillator/noise designs, no recordings or third-party melodies. */
export function ownerBuiltinWav(id: OwnerSoundId): ArrayBuffer {
  const sound = OWNER_SOUNDS.find((item) => item.id === id);
  if (!sound) throw new Error("invalid_audio_asset");
  const rate = OWNER_AUDIO_LIMITS.sampleRate,
    frames = Math.round(sound.seconds * rate);
  const buffer = new ArrayBuffer(44 + frames * 4),
    view = new DataView(buffer);
  const text = (at: number, value: string) =>
    [...value].forEach((char, i) => view.setUint8(at + i, char.charCodeAt(0)));
  text(0, "RIFF");
  view.setUint32(4, buffer.byteLength - 8, true);
  text(8, "WAVEfmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 2, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 4, true);
  view.setUint16(32, 4, true);
  view.setUint16(34, 16, true);
  text(36, "data");
  view.setUint32(40, frames * 4, true);
  let seed = 0x6a09e667,
    filtered = 0;
  for (let i = 0; i < frames; i++) {
    const t = i / rate;
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    const noise = (seed >>> 0) / 2147483648 - 1;
    filtered += 0.12 * (noise - filtered);
    const sine = (frequency: number) => Math.sin(2 * Math.PI * frequency * t);
    let value: number;
    switch (id) {
      case "pop":
        value =
          0.6 *
          Math.sin(2 * Math.PI * (650 * t - 1400 * t * t)) *
          Math.exp(-t * 38);
        break;
      case "snap":
        value = (noise - filtered) * 0.45 * Math.exp(-t * 65);
        break;
      case "whoosh":
        value = filtered * 1.8 * Math.sin((Math.PI * t) / sound.seconds) ** 2;
        break;
      case "ding":
        value = 0.32 * (sine(1320) + 0.35 * sine(2640)) * Math.exp(-t * 9);
        break;
      case "tension": {
        const phase = (t * (2 + t * 0.08)) % 1;
        const pulse = Math.exp(-phase * 12) * Math.min(1, phase / 0.02);
        value =
          (0.16 * sine(55) +
            0.07 * sine(82.4) +
            0.06 * sine(113) +
            0.12 * pulse * sine(110) +
            filtered * t * 0.018) *
          (0.45 + t / 15);
        break;
      }
      case "pulse": {
        const notes = [110, 130.8128, 164.8138, 146.8324],
          phase = t % 1;
        value =
          0.17 * sine(55) +
          Math.sin(2 * Math.PI * notes[Math.floor(t) % notes.length]! * t) *
            Math.exp(-phase * 5) *
            Math.min(1, phase / 0.01) *
            0.18;
        break;
      }
    }
    const edge = Math.min(1, t / 0.004, (sound.seconds - t) / 0.012);
    const sample = Math.round(
      Math.max(-0.8, Math.min(0.8, value * edge)) * 32767,
    );
    view.setInt16(44 + i * 4, sample, true);
    view.setInt16(46 + i * 4, sample, true);
  }
  return buffer;
}
