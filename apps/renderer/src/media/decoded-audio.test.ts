import { describe, expect, it } from "vitest";
import { assertDecodedAudio } from "./decoded-audio.js";

function wav(durationMs = 10000) {
  const bytes = Buffer.alloc(44 + durationMs * 32);
  bytes.write("RIFF", 0);
  bytes.writeUInt32LE(bytes.length - 8, 4);
  bytes.write("WAVEfmt ", 8);
  bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20);
  bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(16000, 24);
  bytes.writeUInt32LE(32000, 28);
  bytes.writeUInt16LE(2, 32);
  bytes.writeUInt16LE(16, 34);
  bytes.write("data", 36);
  bytes.writeUInt32LE(bytes.length - 44, 40);
  return bytes;
}

describe("decoded output audio", () => {
  it("accepts bounded mono 16 kHz PCM and optional metadata chunks", () => {
    const bytes = wav();
    assertDecodedAudio(bytes, 10000);
    const metadata = Buffer.from("LIST\x04\0\0\0INFO", "binary");
    const withMetadata = Buffer.concat([
      bytes.subarray(0, 36),
      metadata,
      bytes.subarray(36),
    ]);
    withMetadata.writeUInt32LE(withMetadata.length - 8, 4);
    assertDecodedAudio(withMetadata, 10000);
  });

  it.each([
    ["wrong container", 0, 0],
    ["RIFF size mismatch", 4, 0],
    ["compressed audio", 20, 3],
    ["stereo", 22, 2],
    ["wrong sample rate", 24, 48000],
    ["wrong byte rate", 28, 96000],
    ["wrong alignment", 32, 4],
    ["wrong sample width", 34, 8],
    ["truncated data", 40, 0xffffffff],
  ])("rejects %s", (_name, offset, value) => {
    const bytes = wav();
    bytes.writeUInt32LE(value, offset);
    expect(() => assertDecodedAudio(bytes, 10000)).toThrow("invalid");
  });

  it("rejects duplicate chunks and mismatched decoded duration", () => {
    const bytes = wav();
    const duplicate = Buffer.concat([bytes, bytes.subarray(36)]);
    duplicate.writeUInt32LE(duplicate.length - 8, 4);
    expect(() => assertDecodedAudio(duplicate, 10000)).toThrow("invalid");
    expect(() => assertDecodedAudio(bytes, 11000)).toThrow("invalid");
    expect(() => assertDecodedAudio(bytes.subarray(0, 40), 10000)).toThrow(
      "invalid",
    );
  });
});
