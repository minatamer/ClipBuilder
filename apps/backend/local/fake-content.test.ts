import { expect, it } from "vitest";
import { FAKE_CAPTIONS_ENABLED } from "./fake-content.ts";
import { fakeOwnerAnalysis, fakeOwnerCaptionWords } from "./fake-analysis.ts";
import { fakeOwnerClipPreparation } from "./fake-clips.ts";
import { ownerWorkspaceSchema } from "../../../packages/contracts/local/index.ts";
import { ownerWordsSchema } from "../../../packages/contracts/local/selection.ts";
import type { OwnerClipPorts } from "./clip-batch.ts";
import { OWNER_AI_HOOK_POLICY } from "../../../packages/contracts/local/hook-sounds.ts";

it("simulates a varied source-contained Hook range that stays stable for a clip", () => {
  const starts = new Set<number>();
  const workspace = ownerWorkspaceSchema.parse({
    id: crypto.randomUUID(),
    revision: 0,
    mode: "synthetic-ai",
    source: {
      fingerprint: "a".repeat(64),
      bytes: 24,
      durationMs: 20000,
      width: 1920,
      height: 1080,
      fps: 30,
    },
  });
  const minimum =
    OWNER_AI_HOOK_POLICY.earliestStartFrame +
    OWNER_AI_HOOK_POLICY.minimumPreferredFrames;
  for (const frames of [1, 30, minimum - 1, minimum, 600]) {
    for (let index = 0; index < 12; index++) {
      const request: Parameters<
        NonNullable<OwnerClipPorts["hookSuggestion"]>
      >[0] = {
        workspace,
        clipId: `synthetic-${index}`,
        moment: {
          id: crypto.randomUUID(),
          processingIdentity: "b".repeat(64),
          cut: { startFrame: 120, endFrame: 120 + frames },
          rangeIds: [],
          cues: [],
          evidence: null,
        },
      };
      const range = fakeOwnerClipPreparation.hookSuggestion!(request);
      expect(range).toEqual(fakeOwnerClipPreparation.hookSuggestion!(request));
      if (frames < minimum) {
        expect(range).toBeUndefined();
        continue;
      }
      expect(range!.startFrame).toBeGreaterThanOrEqual(
        OWNER_AI_HOOK_POLICY.earliestStartFrame,
      );
      expect(range!.endFrame).toBeLessThanOrEqual(frames);
      expect(range!.endFrame - range!.startFrame).toBeLessThanOrEqual(
        OWNER_AI_HOOK_POLICY.preferredFrames,
      );
      expect(range!.endFrame - range!.startFrame).toBeGreaterThanOrEqual(
        OWNER_AI_HOOK_POLICY.minimumPreferredFrames,
      );
      if (frames === 600) starts.add(range!.startFrame);
    }
  }
  expect(starts.size).toBeGreaterThan(1);
});

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
  for (const durationMs of [1000, 3000]) {
    const captions = ownerWordsSchema.parse(
      await fakeOwnerCaptionWords(
        { ...workspace, source: { ...workspace.source, durationMs } },
        signal,
      ),
    );
    expect(new Set(captions.map((word) => word.speakerId)).size).toBe(2);
    expect(captions.at(-1)!.endMs).toBe(durationMs);
    expect(captions.map((word) => word.id)).toEqual(
      captions.map((_, i) => `w_${String(i + 1).padStart(6, "0")}`),
    );
  }
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
