import { PUBLIC_LIMITS } from "@clipbuilder/contracts";
import { MediaFailure } from "./media.failure.js";

const MAX_HEADER_BYTES = 4096;
export const DECODED_AUDIO_MAX_BYTES =
  PUBLIC_LIMITS.maxClipSeconds * 1000 * 32 + MAX_HEADER_BYTES;

// Accept only the bounded PCM WAV written by the packaged FFmpeg decoder.
export function assertDecodedAudio(bytes: Buffer, durationMs: number): void {
  const invalid = () => {
    throw new MediaFailure("invalid");
  };
  if (
    !Number.isFinite(durationMs) ||
    durationMs < PUBLIC_LIMITS.minClipSeconds * 1000 ||
    durationMs > PUBLIC_LIMITS.maxClipSeconds * 1000 ||
    bytes.length < 44 ||
    bytes.length > DECODED_AUDIO_MAX_BYTES ||
    bytes.toString("latin1", 0, 4) !== "RIFF" ||
    bytes.readUInt32LE(4) !== bytes.length - 8 ||
    bytes.toString("latin1", 8, 12) !== "WAVE"
  )
    invalid();
  let offset = 12,
    formatSeen = false,
    dataBytes: number | undefined;
  while (offset < bytes.length) {
    if (offset + 8 > bytes.length) invalid();
    const name = bytes.toString("latin1", offset, offset + 4),
      size = bytes.readUInt32LE(offset + 4),
      start = offset + 8,
      end = start + size;
    if (end > bytes.length || end + (size % 2) > bytes.length) invalid();
    if (name === "fmt ") {
      if (
        formatSeen ||
        size !== 16 ||
        bytes.readUInt16LE(start) !== 1 ||
        bytes.readUInt16LE(start + 2) !== 1 ||
        bytes.readUInt32LE(start + 4) !== 16000 ||
        bytes.readUInt32LE(start + 8) !== 32000 ||
        bytes.readUInt16LE(start + 12) !== 2 ||
        bytes.readUInt16LE(start + 14) !== 16
      )
        invalid();
      formatSeen = true;
    } else if (name === "data") {
      if (!formatSeen || dataBytes !== undefined || size === 0 || size % 2)
        invalid();
      dataBytes = size;
    }
    offset = end + (size % 2);
  }
  if (
    !formatSeen ||
    dataBytes === undefined ||
    bytes.length - dataBytes > MAX_HEADER_BYTES ||
    Math.abs(dataBytes / 32 - durationMs) > 100
  )
    invalid();
}
