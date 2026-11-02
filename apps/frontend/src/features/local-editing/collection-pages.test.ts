import { expect, it, vi } from "vitest";
import { readOwnerAnalysis, readOwnerClips } from "./collection-pages.ts";
import { ownerCollectionPage } from "../../../../../packages/contracts/local/collection-pages.ts";
import type { OwnerAnalysis } from "../../../../../packages/contracts/local/selection.ts";
const result: OwnerAnalysis = {
  id: crypto.randomUUID(),
  mode: "synthetic-ai",
  inputs: {
    sourceRevision: 0,
    policyRevision: 0,
    ranges: [],
    manualOnly: false,
    aiCount: "all",
    aiDuration: { minMs: 10_000, maxMs: 60_000 },
  },
  words: [],
  manual: [],
  suggestions: Array.from({ length: 720 }, (_, i) => ({
    id: crypto.randomUUID(),
    processingIdentity: String(i).padStart(64, "0"),
    cut: { startFrame: i * 30, endFrame: i * 30 + 300 },
    rangeIds: [],
    evidence: null,
    cues: [],
  })),
  calls: { transcription: 15, selection: 15 },
};
it("loads every analysis page through GET only without repeating discovery", async () => {
  const request = vi.fn<typeof fetch>(async (input) =>
    Response.json(
      ownerCollectionPage(
        result,
        Number(String(input).split("/").at(-1)),
        true,
      ),
    ),
  );
  const actual = await readOwnerAnalysis(
    Response.json(ownerCollectionPage(result)),
    crypto.randomUUID(),
    new AbortController().signal,
    request,
  );
  expect(actual).toEqual(result);
  expect(request).toHaveBeenCalledTimes(14);
  expect(
    request.mock.calls.every(([, options]) => options?.method === undefined),
  ).toBe(true);
});
it("retains raw legacy/null reads and refuses inconsistent or canceled collection pages", async () => {
  expect(
    await readOwnerAnalysis(
      Response.json(null),
      crypto.randomUUID(),
      new AbortController().signal,
    ),
  ).toBeNull();
  expect(
    await readOwnerClips(
      Response.json({ clips: [], active: false, workers: 1 }),
      crypto.randomUUID(),
      new AbortController().signal,
    ),
  ).toEqual({ clips: [], active: false, workers: 1 });
  const request = vi.fn<typeof fetch>(async () =>
    Response.json({
      value: { ...result, id: crypto.randomUUID(), suggestions: [] },
      page: { total: 720, next: null },
    }),
  );
  await expect(
    readOwnerAnalysis(
      Response.json(ownerCollectionPage(result)),
      crypto.randomUUID(),
      new AbortController().signal,
      request,
    ),
  ).rejects.toThrow("collection_changed");
  request.mockClear();
  await expect(
    readOwnerAnalysis(
      Response.json(ownerCollectionPage(result)),
      crypto.randomUUID(),
      AbortSignal.abort(),
      request,
    ),
  ).rejects.toThrow();
  expect(request).not.toHaveBeenCalled();
});
