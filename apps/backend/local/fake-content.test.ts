import { expect, it } from "vitest";
import { FAKE_CAPTIONS_ENABLED } from "./fake-content.ts";
import { fakeOwnerAnalysis } from "./fake-analysis.ts";
import { fakeOwnerClipPreparation } from "./fake-clips.ts";
import { ownerWorkspaceSchema } from "../../../packages/contracts/local/index.ts";
import { ownerWordsSchema } from "../../../packages/contracts/local/selection.ts";

it("uses deterministic fictional dialogue with speakers and source-bounded word clocks", async () => {
  const workspace = ownerWorkspaceSchema.parse({
    id: crypto.randomUUID(),
    mode: "synthetic-ai",
    revision: 0,
    source: {
      fingerprint: "a".repeat(64),
      bytes: 24,
      durationMs: 15300,
      width: 1920,
      height: 1080,
      fps: 30,
    },
  });
  const signal = new AbortController().signal;
  const words = ownerWordsSchema.parse(
    await fakeOwnerAnalysis.transcribe(workspace, signal),
  );
  expect(words).toEqual(await fakeOwnerAnalysis.transcribe(workspace, signal));
  expect(new Set(words.map((word) => word.text)).size).toBeGreaterThan(15);
  expect(new Set(words.map((word) => word.speakerId)).size).toBe(2);
  expect(words.at(-1)!.endMs).toBe(15300);
  expect(words.every((word) => word.startMs < word.endMs)).toBe(true);
  const proposals = await fakeOwnerAnalysis.select(
    words,
    { minMs: 4000, maxMs: 4000 },
    signal,
    "",
    2,
  );
  expect(proposals.length).toBeGreaterThanOrEqual(2);
});

it("defaults fake captions off and permanently disables fake picture generation", async () => {
  expect(FAKE_CAPTIONS_ENABLED).toBe(false);
  await expect(
    fakeOwnerClipPreparation.image(
      {
        clipId: crypto.randomUUID(),
        words: [],
        cue: {
          startFrame: 0,
          endFrame: 30,
          evidenceWordIds: [],
          brief: {
            scene: "sample",
            searchQuery: "sample",
            requiredTerms: [],
            avoidTerms: [],
          },
        },
      },
      new AbortController().signal,
    ),
  ).rejects.toThrow("synthetic_picture_generation_disabled");
});
