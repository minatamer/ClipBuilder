import { expect, it, vi } from "vitest";
import { randomUUID, createHash } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createLocalCodexAi } from "../apps/backend/local/codex-ai.ts";
import { WorkspaceFiles } from "../apps/backend/local/workspace-files.ts";
import { OwnerClipBatch } from "../apps/backend/local/clip-batch.ts";
import { fakeOwnerClipPreparation } from "../apps/backend/local/fake-clips.ts";
import { withIndependentOwnerHook } from "../packages/contracts/local/hook-content.ts";
import { compileOwnerOverlay } from "../packages/contracts/local/edit-overlay.ts";
import { ownerOverlayFrame } from "../packages/composition/local/overlay-frame.ts";
import { independentHookFixture } from "./owner-hook-fixture.ts";

const source = {
  fingerprint: "a".repeat(64),
  bytes: 1000,
  durationMs: 4000,
  width: 640,
  height: 360,
  fps: 30,
};

it("reuses prepared canonical speaker labels and clocks with zero ASR, diarization or inference dispatches", async () => {
  const clip = independentHookFixture();
  clip.base!.words = clip.base!.words.map((word, index) => ({
    ...word,
    speakerId: index < 2 ? "spk_0" : "spk_1",
  }));
  const before = structuredClone(clip.base!.words),
    media = vi.fn(),
    infer = vi.fn();
  const ai = createLocalCodexAi({
    files: new WorkspaceFiles("unused-synthetic"),
    media,
    infer,
  });
  try {
    const result = await ai.captionTranscription!(
      { id: randomUUID(), revision: 0, mode: "provider-ai", source },
      clip,
      new AbortController().signal,
    );
    expect(result).toEqual(before);
    expect(result).not.toBe(clip.base!.words);
    expect(media).toHaveBeenCalledTimes(0);
    expect(infer).toHaveBeenCalledTimes(0);
  } finally {
    await ai.close!(new AbortController().signal);
  }
});

it("enriches unlabeled existing words through speakers-only transport and rejects altered source words", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-caption-labels-")),
    files = new WorkspaceFiles(root),
    clip = independentHookFixture();
  const workspace = {
    id: await files.create(),
    revision: 0,
    mode: "provider-ai" as const,
    source,
  };
  clip.base!.words = clip.base!.words.map((word) => ({
    ...word,
    speakerId: null,
  }));
  const labeled = clip.base!.words.map((word, index) => ({
    ...word,
    speakerId: index < 2 ? "spk_0" : "spk_1",
  }));
  const read = vi
    .spyOn(files, "readCodexInput")
    .mockResolvedValueOnce({ kind: "speakers", words: labeled })
    .mockResolvedValueOnce({
      kind: "speakers",
      words: labeled.map((word, index) =>
        index ? word : { ...word, startMs: 1 },
      ),
    });
  const media = vi.fn<Parameters<typeof createLocalCodexAi>[0]["media"]>(
      async (job) => {
        if (job.operation !== "codex-input")
          throw Error("unexpected_synthetic_job");
        expect(job).toMatchObject({
          kind: "speakers",
          cut: clip.base!.cut,
          words: clip.base!.words,
        });
        return {
          operation: "codex-input",
          jobId: job.jobId,
          kind: job.kind,
          bytes: 100,
          digest: "a".repeat(64),
        };
      },
    ),
    infer = vi.fn(),
    ai = createLocalCodexAi({ files, media, infer });
  try {
    expect(
      await ai.captionTranscription!(
        workspace,
        clip,
        new AbortController().signal,
      ),
    ).toEqual(labeled);
    await expect(
      ai.captionTranscription!(workspace, clip, new AbortController().signal),
    ).rejects.toThrow("codex_input_invalid");
    expect(media).toHaveBeenCalledTimes(2);
    expect(read).toHaveBeenCalledTimes(2);
    expect(infer).toHaveBeenCalledTimes(0);
  } finally {
    await ai.close!(new AbortController().signal);
    await files.close();
    await rm(root, { recursive: true, force: true });
  }
});

it("generates captions after Hook creation without losing the independent Hook's speaker labels or title", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-caption-hook-")),
    files = new WorkspaceFiles(root),
    clip = independentHookFixture();
  const workspace = {
    id: randomUUID(),
    revision: 0,
    mode: "synthetic-ai" as const,
    source,
  };
  clip.base!.words = clip.base!.words.map((word, index) => ({
    ...word,
    speakerId: index < 2 ? "spk_0" : "spk_1",
  }));
  clip.base!.overlay.captions = [];
  clip.baseHash = createHash("sha256")
    .update(JSON.stringify(clip.base))
    .digest("hex");
  clip.edit!.baseHash = clip.baseHash;
  clip.edit = withIndependentOwnerHook(
    clip.base!,
    clip.edit!,
    clip.assets,
    [],
    { startFrame: 30, endFrame: 120 },
  );
  const originalTitle = structuredClone(clip.edit.hookContent!.edits.texts);
  const unexpected = vi.fn(async () => {
    throw Error("unexpected_synthetic_job");
  });
  const batch = new OwnerClipBatch(workspace, files, {
    ...fakeOwnerClipPreparation,
    render: unexpected,
  });
  try {
    batch.restore([clip]);
    const transcribe = vi.fn(async () => structuredClone(clip.base!.words));
    const result = await batch.generateCaptions(
      clip.id,
      { operationId: randomUUID(), expectedRevision: 0 },
      transcribe,
      new AbortController().signal,
      false,
      true,
    );
    const current = result.clips[0]!,
      overlay = compileOwnerOverlay(
        current.base!,
        current.edit!,
        current.assets,
        [],
      );
    expect(current.base!.words).toEqual(clip.base!.words);
    expect(overlay.hookContent!.captions.length).toBeGreaterThan(0);
    expect(overlay.hookContent!.captionSpeakers?.enabled).toBe(true);
    expect(overlay.hookContent!.texts).toEqual(originalTitle);
    expect(
      new Set(
        overlay.hookContent!.captionSpeakers!.assignments.map(
          (word) => word.speakerId,
        ),
      ),
    ).toEqual(new Set(["spk_0", "spk_1"]));
    expect(ownerOverlayFrame(overlay, 5).colors?.color).not.toBe(
      ownerOverlayFrame(overlay, 60).colors?.color,
    );
    expect(transcribe).toHaveBeenCalledTimes(1);
    expect(unexpected).toHaveBeenCalledTimes(0);
  } finally {
    await batch.close();
    await files.close();
    await rm(root, { recursive: true, force: true });
  }
});
