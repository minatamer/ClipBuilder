import { z } from "zod";
import { ownerIdSchema } from "./policy.ts";
import { utf8ByteLength } from "./utf8.ts";

const validNameCharacter = (character: string) => {
  const code = character.codePointAt(0) ?? 0;
  return (
    code >= 32 &&
    (code < 127 || code > 159) &&
    code !== 0x2028 &&
    code !== 0x2029 &&
    (code < 0xd800 || code > 0xdfff)
  );
};

export const ownerClipNameSchema = z
  .string()
  .trim()
  .max(160)
  .refine(
    (value) =>
      value.length > 0 &&
      Array.from(value).length <= 80 &&
      Array.from(value).every(validNameCharacter),
  );
export const ownerClipRenameSchema = z
  .object({
    operationId: ownerIdSchema,
    expectedName: ownerClipNameSchema.nullable(),
    name: ownerClipNameSchema.nullable(),
  })
  .strict();

export function ownerClipDisplayName(
  clip: { displayName?: string | undefined },
  index: number,
) {
  return clip.displayName ?? `Clip ${index}`;
}

export function ownerClipDownloadName(
  clip: { displayName?: string | undefined },
  index: number,
  revision: number,
) {
  let stem = (clip.displayName ?? "")
    .normalize("NFKC")
    .replace(/[<>:"/\\|?*]/gu, "-")
    .trim()
    .replace(/[. ]+$/u, "");
  const points = Array.from(stem, (character) =>
    validNameCharacter(character) ? character : "-",
  );
  while (utf8ByteLength(points.join("")) > 160) points.pop();
  stem = points.join("").replace(/[. ]+$/u, "");
  if (/^(con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)/iu.test(stem))
    stem = `clip-${stem}`;
  return `${stem ? `${stem}-` : ""}clip-${index}-r${revision}.mp4`;
}
