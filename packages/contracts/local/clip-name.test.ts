import { expect, it } from "vitest";
import {
  ownerClipNameSchema,
  ownerClipDownloadName,
  ownerClipDisplayName,
} from "./clip-name.ts";
import { hostedEditingPath } from "./hosted-editing.ts";

it("admits rename through the authenticated hosted clip path without exposing local intake", () => {
  const id = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  expect(hostedEditingPath("POST", `/workspace/${id}/clips/${id}/rename`)).toBe(
    true,
  );
  expect(hostedEditingPath("POST", "/sources/open")).toBe(false);
});

it("bounds names by Unicode characters and rejects control/header lines", () => {
  expect(ownerClipNameSchema.parse("  A useful moment  ")).toBe(
    "A useful moment",
  );
  expect(ownerClipNameSchema.parse("😀".repeat(80))).toHaveLength(160);
  for (const value of [
    "",
    " ",
    "a".repeat(81),
    "😀".repeat(81),
    "name\r\nInjected: yes",
    "a\u0000b",
    "a\u2028b",
    "a\ud800b",
  ])
    expect(ownerClipNameSchema.safeParse(value).success).toBe(false);
  expect(ownerClipDisplayName({}, 3)).toBe("Clip 3");
});
it("derives bounded independent filenames without changing display text or identities", () => {
  const clip = { displayName: "../CON: great/answer? " };
  const filename = ownerClipDownloadName(clip, 2, 1);
  expect(filename).not.toMatch(/[<>:"/\\|?*\r\n]/u);
  expect(filename).toContain("clip-2-r1.mp4");
  expect(ownerClipDownloadName({}, 1, 0)).toBe("clip-1-r0.mp4");
  expect(ownerClipDownloadName({ displayName: "CON" }, 1, 0)).toBe(
    "clip-CON-clip-1-r0.mp4",
  );
  expect(
    new TextEncoder().encode(
      ownerClipDownloadName({ displayName: "😀".repeat(80) }, 999, 19),
    ).length,
  ).toBeLessThan(255);
  expect(ownerClipDownloadName({ displayName: "same" }, 1, 0)).not.toBe(
    ownerClipDownloadName({ displayName: "same" }, 2, 0),
  );
  expect(clip.displayName).toBe("../CON: great/answer? ");
});
