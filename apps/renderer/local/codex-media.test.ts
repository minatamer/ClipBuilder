import { expect, it, vi } from "vitest";
import { parseLocalSpeech, prepareLocalCodexInput } from "./codex-media.ts";
import * as media from "./media.ts";
import * as native from "../src/media/process-runner.ts";
import { mkdtemp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
it("normalizes bounded offline word clocks to stable IDs without inventing diarization", () => {
  const value = {
    transcription: [
      { text: "Synthetic caption.", offsets: { from: 100, to: 1000 } },
      { text: " Next", offsets: { from: 1000, to: 2500 } },
      { text: "", offsets: { from: 3000, to: 3000 } },
    ],
  };
  const words = parseLocalSpeech(value, 2000);
  expect(
    words.map(({ id, startMs, endMs, speakerId }) => ({
      id,
      startMs,
      endMs,
      speakerId,
    })),
  ).toEqual([
    { id: "w_000001", startMs: 100, endMs: 550, speakerId: null },
    { id: "w_000002", startMs: 550, endMs: 1000, speakerId: null },
    { id: "w_000003", startMs: 1000, endMs: 2000, speakerId: null },
  ]);
  expect(words.map((word) => word.punctuatedText)).toEqual([
    "Synthetic",
    "caption.",
    "Next",
  ]);
  expect(words.every((word) => word.confidence === null)).toBe(true);
  expect(() =>
    parseLocalSpeech(
      { transcription: [{ text: "bad", offsets: { from: NaN, to: 1 } }] },
      2000,
    ),
  ).toThrow();
});
it("removes partial transition images on cancellation without publishing an artifact", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-codex-cancel-test-")),
    workspaceId = crypto.randomUUID(),
    directory = join(root, workspaceId),
    controller = new AbortController();
  await mkdir(directory);
  const inspect = vi.spyOn(media, "inspectOwnerSource").mockResolvedValue({
    fingerprint: "a".repeat(64),
    bytes: 100,
    durationMs: 4000,
    width: 640,
    height: 360,
    fps: 30,
  });
  const run = vi
    .spyOn(native, "runOwnedProcess")
    .mockImplementation(async (_exe, args, signal) => {
      expect(args[args.indexOf("-vf") + 1]).toContain("tile=3x1");
      await writeFile(args.at(-1)!, Buffer.from([255, 216, 255]));
      controller.abort(new Error("synthetic_cancel"));
      signal.throwIfAborted();
      return "";
    });
  try {
    await expect(
      prepareLocalCodexInput(
        {
          root,
          tools: { ffmpeg: "synthetic-ffmpeg", ffprobe: "synthetic-ffprobe" },
        },
        {
          operation: "codex-input",
          workspaceId,
          jobId: crypto.randomUUID(),
          fingerprint: "a".repeat(64),
          kind: "frames",
          cut: { startFrame: 0, endFrame: 120 },
          speakerChanges: [60],
        },
        controller.signal,
      ),
    ).rejects.toThrow("synthetic_cancel");
    expect(run).toHaveBeenCalledTimes(1);
    expect(await readdir(directory)).toEqual([]);
  } finally {
    inspect.mockRestore();
    run.mockRestore();
    await rm(root, { recursive: true, force: true });
  }
});
