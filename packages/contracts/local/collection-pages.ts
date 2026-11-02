import { z } from "zod";
import { ownerAnalysisSchema } from "./selection.ts";
import { ownerClipListSchema } from "./clips.ts";

export const OWNER_COLLECTION_PAGE_ITEMS = 50;
const PAGE_BYTES = 2 * 1024 ** 2;
const page = z
  .object({
    total: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
    next: z.number().int().nonnegative().nullable(),
  })
  .strict();
export const ownerAnalysisPageSchema = z
  .object({ value: ownerAnalysisSchema, page })
  .strict();
export const ownerClipsPageSchema = z
  .object({ value: ownerClipListSchema, page })
  .strict();
function jsonBytes(value: unknown) {
  let bytes = 0;
  for (const character of JSON.stringify(value)) {
    const code = character.codePointAt(0)!;
    bytes += code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4;
  }
  return bytes;
}
function pageItems<T>(items: readonly T[], start: number) {
  if (!Number.isSafeInteger(start) || start < 0 || start > items.length)
    throw Error("collection_cursor_invalid");
  const values: T[] = [];
  let bytes = 0,
    cursor = start;
  while (cursor < items.length && values.length < OWNER_COLLECTION_PAGE_ITEMS) {
    const item = items[cursor]!,
      size = jsonBytes(item);
    if (values.length && bytes + size > PAGE_BYTES) break;
    values.push(item);
    bytes += size;
    cursor++;
  }
  return {
    values,
    page: { total: items.length, next: cursor < items.length ? cursor : null },
  };
}
/** Only the server's composed profile decides whether to use these wire pages. */
export function ownerCollectionPage(
  value: unknown,
  start = 0,
  force = false,
): unknown {
  if (
    value &&
    typeof value === "object" &&
    "clips" in value &&
    "workers" in value
  ) {
    if (!Array.isArray(value.clips)) return value;
    const part = pageItems(value.clips, start);
    const parsed = ownerClipListSchema.safeParse({
      ...value,
      clips: part.values,
    });
    if (!parsed.success) return value;
    const clips = parsed.data;
    return force || part.page.next !== null
      ? { value: clips, page: part.page }
      : clips;
  }
  if (
    value &&
    typeof value === "object" &&
    "suggestions" in value &&
    "inputs" in value
  ) {
    if (!Array.isArray(value.suggestions)) return value;
    const part = pageItems(value.suggestions, start);
    const analysis = ownerAnalysisSchema.parse({
      ...value,
      ...(force || part.page.next !== null ? { words: [] } : {}),
      suggestions: part.values,
    });
    return force || part.page.next !== null
      ? {
          value: { ...analysis, words: [] },
          page: part.page,
        }
      : analysis;
  }
  return value;
}
