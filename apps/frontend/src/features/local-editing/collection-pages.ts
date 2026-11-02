import {
  ownerAnalysisPageSchema,
  ownerClipsPageSchema,
} from "../../../../../packages/contracts/local/collection-pages.ts";
import { ownerAnalysisSchema } from "../../../../../packages/contracts/local/selection.ts";
import { ownerClipListSchema } from "../../../../../packages/contracts/local/clips.ts";

/** Read-only pages never repeat the operation which produced the first response. */
export async function readOwnerAnalysis(
  response: Response,
  workspaceId: string,
  signal: AbortSignal,
  request: typeof fetch = fetch,
) {
  const first: unknown = await response.json();
  if (first === null) return null;
  const parsed = ownerAnalysisPageSchema.safeParse(first);
  if (!parsed.success) return ownerAnalysisSchema.parse(first);
  const result = parsed.data.value,
    seen = new Set<number>();
  let next = parsed.data.page.next;
  while (next !== null) {
    signal.throwIfAborted();
    if (seen.has(next)) throw Error("collection_cursor_invalid");
    seen.add(next);
    const response = await request(
      `/api/local/workspace/${workspaceId}/analysis-pages/${result.id}/${next}`,
      {
        signal: AbortSignal.any([signal, AbortSignal.timeout(4000)]),
        cache: "no-store",
      },
    );
    if (!response.ok) throw Error("collection_unavailable");
    const part = ownerAnalysisPageSchema.parse(await response.json());
    if (
      part.value.id !== result.id ||
      part.page.total !== parsed.data.page.total
    )
      throw Error("collection_changed");
    // Review needs identity/clock/evidence; words remain on the server/receipts.
    for (const item of part.value.suggestions) result.suggestions.push(item);
    next = part.page.next;
  }
  if (result.suggestions.length !== parsed.data.page.total)
    throw Error("collection_incomplete");
  return ownerAnalysisSchema.parse(result);
}
export async function readOwnerClips(
  response: Response,
  workspaceId: string,
  signal: AbortSignal,
  request: typeof fetch = fetch,
) {
  const first: unknown = await response.json();
  const parsed = ownerClipsPageSchema.safeParse(first);
  if (!parsed.success) return ownerClipListSchema.parse(first);
  const result = parsed.data.value,
    seen = new Set<number>();
  let next = parsed.data.page.next;
  while (next !== null) {
    signal.throwIfAborted();
    if (seen.has(next)) throw Error("collection_cursor_invalid");
    seen.add(next);
    const response = await request(
      `/api/local/workspace/${workspaceId}/clip-pages/${next}`,
      {
        signal: AbortSignal.any([signal, AbortSignal.timeout(4000)]),
        cache: "no-store",
      },
    );
    if (!response.ok) throw Error("collection_unavailable");
    const part = ownerClipsPageSchema.parse(await response.json());
    if (part.page.total !== parsed.data.page.total)
      throw Error("collection_changed");
    for (const clip of part.value.clips) result.clips.push(clip);
    next = part.page.next;
  }
  if (
    result.clips.length !== parsed.data.page.total ||
    new Set(result.clips.map((clip) => clip.id)).size !== result.clips.length
  )
    throw Error("collection_incomplete");
  return ownerClipListSchema.parse(result);
}
