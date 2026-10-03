import { describe, expect, it } from "vitest";
import { sourceChecksum } from "./source.checksum";
describe("streaming source checksum", () => {
  it.each([0, 1, 55, 56, 63, 64, 65, 127, 128, 4097])(
    "matches standard SHA-256 at padding/chunk boundary length %i",
    async (length) => {
      const bytes = Uint8Array.from({ length }, (_, i) => i % 251);
      const expected = Array.from(
        new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
        (n) => n.toString(16).padStart(2, "0"),
      ).join("");
      for (const chunk of [1, 63, 64, 65, 1024])
        expect(
          await sourceChecksum(
            new Blob([bytes]),
            new AbortController().signal,
            chunk,
          ),
        ).toBe(expected);
    },
  );
  it("never reads a whole multi-chunk input and honors cancellation", async () => {
    const file = new Blob([new Uint8Array(5 * 1024 * 1024)]);
    const sizes: number[] = [],
      original = file.slice.bind(file);
    file.slice = (start, end, type) => {
      sizes.push((end ?? file.size) - (start ?? 0));
      return original(start, end, type);
    };
    await sourceChecksum(file, new AbortController().signal);
    expect(Math.max(...sizes)).toBe(4 * 1024 * 1024);
    expect(sizes).toHaveLength(2);
    const controller = new AbortController();
    controller.abort();
    await expect(sourceChecksum(file, controller.signal)).rejects.toThrow();
  });
});
