import {
  ownerClipTitleSchema,
  OWNER_TEXT_LIMITS,
} from "../../../packages/contracts/local/text-layers.ts";
import type { OwnerMoment } from "../../../packages/contracts/local/selection.ts";

/** A physical text bound, independent of advisory AI editorial judgments. */
export function normalizeClipTitle(value: unknown): string | null {
  if (typeof value !== "string") return null;
  let title = "";
  for (const character of value.normalize("NFC").trim().replace(/\s+/gu, " ")) {
    if (title.length + character.length > OWNER_TEXT_LIMITS.titleCharacters)
      break;
    title += character;
  }
  const result = ownerClipTitleSchema.safeParse(title);
  return result.success ? result.data : null;
}

export function chooseClipTitle(
  moment: OwnerMoment,
  supplied: unknown,
): string {
  return (
    normalizeClipTitle(supplied) ??
    normalizeClipTitle(moment.evidence?.title) ??
    normalizeClipTitle(
      moment.cues
        .slice(0, 10)
        .map((word) => word.text)
        .join(" "),
    ) ??
    "Clip highlights"
  );
}
