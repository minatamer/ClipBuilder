import { expect, it, vi } from "vitest";
import { parseLocalSpeech, prepareLocalCodexInput } from "./codex-media.ts";
import * as media from "./media.ts";
import * as native from "../src/media/process-runner.ts";
import {
  mkdtemp,
  mkdir,
  readdir,
  rm,
  writeFile,
  readFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
it.each(["asr-only", "speakers-only"] as const)(
  "runs %s without invoking the other speech engine",
  async (mode) => {
    const root = await mkdtemp(
      join(tmpdir(), "clipbuilder-codex-speech-split-"),
    );
    const workspaceId = crypto.randomUUID(),
      jobId = crypto.randomUUID();
    await mkdir(join(root, workspaceId));
    const words = [
      {
        id: "w_000001",
        text: "Synthetic",
        punctuatedText: "Synthetic",
        startMs: 100,
        endMs: 900,
        speakerId: null,
        confidence: null,
      },
    ];
    const inspect = vi.spyOn(media, "inspectOwnerSource").mockResolvedValue({
      fingerprint: "a".repeat(64),
      bytes: 100,
      durationMs: 60000,
      width: 640,
      height: 360,
      fps: 30,
    });
    const extract = vi
      .spyOn(native, "runOwnedProcess")
      .mockImplementation(async (_exe, args) => {
        await writeFile(args.at(-1)!, "synthetic-wav");
        return "";
      });
    const runSpeech = vi.fn<typeof native.runOwnedProcess>(
      async (_exe, args) => {
        await writeFile(
          args[args.indexOf("-of") + 1]! + ".json",
          JSON.stringify({
            transcription: [
              { text: "Synthetic", offsets: { from: 100, to: 900 } },
            ],
          }),
        );
        return "";
      },
    );
    const runSpeakers = vi.fn<typeof native.runOwnedProcess>(
      async () => "0.000 -- 60.000 speaker_00\n",
    );
    try {
      const receipt = await prepareLocalCodexInput(
        {
          root,
          tools: { ffmpeg: "synthetic-ffmpeg", ffprobe: "synthetic-ffprobe" },
          speech: {
            executable: "synthetic-whisper",
            model: "synthetic-model",
            directory: root,
            speakers: {
              executable: "synthetic-speakers",
              segmentation: "synthetic-segmentation",
              embedding: "synthetic-embedding",
              directory: root,
            },
          },
          runSpeech,
          runSpeakers,
        },
        {
          operation: "codex-input",
          workspaceId,
          jobId,
          fingerprint: "a".repeat(64),
          ...(mode === "asr-only"
            ? { kind: "speech" as const, diarize: false }
            : {
                kind: "speakers" as const,
                cut: { startFrame: 0, endFrame: 1800 },
                words,
              }),
        },
        new AbortController().signal,
      );
      expect(runSpeech).toHaveBeenCalledTimes(mode === "asr-only" ? 1 : 0);
      expect(runSpeakers).toHaveBeenCalledTimes(
        mode === "speakers-only" ? 1 : 0,
      );
      const artifact = JSON.parse(
        await readFile(
          await media.ownerCodexMediaPath(root, workspaceId, jobId),
          "utf8",
        ),
      );
      expect(artifact.words).toEqual(
        words.map((word) => ({
          ...word,
          speakerId: mode === "speakers-only" ? "spk_0" : null,
        })),
      );
      expect(receipt.progress!.map((step) => step.id)).toEqual(
        mode === "asr-only"
          ? ["inspect", "audio", "transcription"]
          : ["inspect", "audio", "speakers"],
      );
      expect(await readdir(join(root, workspaceId))).toHaveLength(1);
    } finally {
      inspect.mockRestore();
      extract.mockRestore();
      await rm(root, { recursive: true, force: true });
    }
  },
);
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

it("measures scoped native stages without leaking paths or native output", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-codex-timing-test-"));
  const workspaceId = crypto.randomUUID(),
    jobId = crypto.randomUUID();
  await mkdir(join(root, workspaceId));
  const inspect = vi.spyOn(media, "inspectOwnerSource").mockResolvedValue({
    fingerprint: "a".repeat(64),
    bytes: 100,
    durationMs: 480000,
    width: 640,
    height: 360,
    fps: 30,
  });
  const extract = vi
    .spyOn(native, "runOwnedProcess")
    .mockImplementation(async (_exe, args) => {
      expect(args[args.indexOf("-ss") + 1]).toBe("10");
      expect(args[args.indexOf("-t") + 1]).toBe("60");
      await writeFile(args.at(-1)!, "synthetic-wav");
      return "synthetic-private-native-output";
    });
  const lines: string[] = [],
    snapshots: string[] = [];
  try {
    const receipt = await prepareLocalCodexInput(
      {
        root,
        tools: { ffmpeg: "synthetic-ffmpeg", ffprobe: "synthetic-ffprobe" },
        parallelism: 6,
        speech: {
          executable: "synthetic-whisper",
          model: "synthetic-private-model",
          directory: root,
          speakers: {
            executable: "synthetic-speakers",
            segmentation: "synthetic-private-segmentation",
            embedding: "synthetic-private-embedding",
            directory: root,
          },
        },
        runSpeech: vi.fn(async (_exe, args) => {
          await writeFile(
            args[args.indexOf("-of") + 1]! + ".json",
            JSON.stringify({
              transcription: [
                { text: "Synthetic", offsets: { from: 100, to: 900 } },
              ],
            }),
          );
          return "synthetic-private-speech";
        }),
        runSpeakers: vi.fn(async () => "0.000 -- 60.000 speaker_00\n"),
        diagnostic: (line) => lines.push(line),
        progress: (steps) => snapshots.push(JSON.stringify(steps)),
      },
      {
        operation: "codex-input",
        kind: "speech",
        workspaceId,
        jobId,
        fingerprint: "a".repeat(64),
        cut: { startFrame: 300, endFrame: 2100 },
      },
      new AbortController().signal,
    );
    expect(receipt.kind).toBe("speech");
    expect(extract).toHaveBeenCalledTimes(1);
    const artifact = JSON.parse(
      await readFile(
        await media.ownerCodexMediaPath(root, workspaceId, jobId),
        "utf8",
      ),
    );
    expect(artifact.words[0]).toMatchObject({ startMs: 100, endMs: 900 });
    expect(lines.map((line) => JSON.parse(line).operation)).toEqual(
      expect.arrayContaining([
        "codex_inspect",
        "codex_audio",
        "codex_transcription",
        "codex_speakers",
      ]),
    );
    expect(
      JSON.parse(snapshots.at(-1)!).every(
        (step: { state: string }) => step.state === "done",
      ),
    ).toBe(true);
    expect(lines.join("")).not.toContain("synthetic-private");
    expect(lines.join("")).not.toContain(root);
    expect(await readdir(join(root, workspaceId))).toHaveLength(1);
  } finally {
    inspect.mockRestore();
    extract.mockRestore();
    await rm(root, { recursive: true, force: true });
  }
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
