import { describe, expect, it } from "vitest";
import { mediaByteRange } from "./media-preview.schema.js";
describe("bounded media ranges", () => {
  it.each([
    [undefined, { start: 0, end: 99, partial: false }],
    ["bytes=0-0", { start: 0, end: 0, partial: true }],
    ["bytes=90-", { start: 90, end: 99, partial: true }],
    ["bytes=-10", { start: 90, end: 99, partial: true }],
    ["bytes=90-120", { start: 90, end: 99, partial: true }],
  ])("maps %s", (range, expected) =>
    expect(mediaByteRange(range, 100)).toEqual(expected),
  );
  it.each([
    "bytes=",
    "bytes=-",
    "bytes=-0",
    "bytes=100-",
    "bytes=5-4",
    "bytes=0-1,4-5",
    "bytes=9007199254740992-",
    "items=0-2",
    "bytes=0-2\n",
  ])("rejects %s", (range) => {
    expect(() => mediaByteRange(range, 100)).toThrow();
  });
});
