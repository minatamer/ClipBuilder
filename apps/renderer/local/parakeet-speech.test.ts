import { expect, it, vi } from "vitest";
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  parseParakeetSpeech,
  parakeetWindows,
  transcribeParakeet,
} from "./parakeet-speech.ts";
import * as native from "../src/media/process-runner.ts";

const token = (
  index: number,
  from: number,
  to: number,
  text: string,
  start = true,
) =>
  ` [${index}] id=1 frame=0 dur_idx=1 dur_val=1 p=1 plog=0 t0=${from} t1=${to} word_start=${start} "${text}"`;
const dump = (...tokens: string[]) =>
  `parakeet_print_timings: total time = 1 ms\nTokens [${tokens.length}]:\n${tokens.join("\n")}\n`;

it("converts native 10-ms SentencePiece tokens once, preserving punctuation and quiet gaps", () => {
  expect(
    parseParakeetSpeech(
      dump(
        token(0, 10, 20, "▁Syn"),
        token(1, 20, 30, "thetic", false),
        token(2, 400, 440, "▁caption."),
      ),
      5000,
    ),
  ).toEqual([
    { text: "Synthetic", offsets: { from: 100, to: 300 } },
    { text: "caption.", offsets: { from: 4000, to: 4400 } },
  ]);
  expect(parseParakeetSpeech(dump(), 1000)).toEqual([]);
});

it.each([
  "",
  dump(token(0, 0, 1, "▁a")).replace("Tokens [1]", "Tokens [2]"),
  dump(token(1, 0, 1, "▁a")),
  dump(token(0, 0, 1, "a", false)),
  dump(token(0, 0, 0, "▁a")),
  dump(token(0, 10, 20, "▁a"), token(1, 5, 8, "▁b")),
  dump(token(0, 0, 200, "▁a")),
  dump(token(0, 0, 10, "▁a b")),
  dump(token(0, 0, 1, "▁a")).replace("total time", "interrupted"),
  "x".repeat(1024 ** 2 + 1),
])("rejects incomplete, oversized or impossible native output", (value) => {
  expect(() => parseParakeetSpeech(value, 1000)).toThrow(
    "local_speech_output_invalid",
  );
});

it("bounds all windows and gives the short final remainder an owner", () => {
  const windows = parakeetWindows(480436);
  expect(windows).toHaveLength(9);
  expect(windows.every((w) => w.stop - w.begin <= 64000)).toBe(true);
  expect(windows.at(-1)).toEqual({
    core: 480000,
    end: 480436,
    begin: 478000,
    stop: 480436,
  });
  expect(() => parakeetWindows(0)).toThrow();
  expect(() => parakeetWindows(900001)).toThrow();
});

it.each(["complete", "failed", "canceled", "malformed", "oversized"])(
  "runs bounded serial chunks and cleans %s work without a retry",
  async (mode) => {
    const root = await mkdtemp(join(tmpdir(), "clipbuilder-parakeet-test-"));
    const controller = new AbortController();
    const extraction = vi
      .spyOn(native, "runOwnedProcess")
      .mockImplementation(async (_exe, args) => {
        await writeFile(args.at(-1)!, "synthetic PCM");
        return "";
      });
    const runSpeech = vi.fn<typeof native.runOwnedProcess>(
      async (_exe, args, signal, options) => {
        expect(args).toEqual(expect.arrayContaining(["-t", "4", "-ng", "-ps"]));
        expect(options?.env).toMatchObject({
          OPENBLAS_NUM_THREADS: "4",
          OMP_NUM_THREADS: "4",
        });
        expect(options?.env).not.toHaveProperty("AI_PROVIDER");
        expect(options?.stdout).toBe("ignore");
        const second = runSpeech.mock.calls.length === 2;
        await writeFile(
          options!.stderrFile!.path,
          mode === "oversized"
            ? "x".repeat(1024 ** 2 + 1)
            : mode === "malformed"
              ? "Tokens [1]:"
              : second
                ? dump(
                    token(0, 190, 210, "▁Boundary"),
                    token(1, 380, 390, "▁Last"),
                  )
                : dump(
                    token(0, 10, 20, "▁First"),
                    token(1, 5990, 6010, "▁Boundary"),
                  ),
        );
        if (mode === "failed") throw Error("synthetic_failure");
        if (mode === "canceled") {
          controller.abort(Error("synthetic_cancel"));
          signal.throwIfAborted();
        }
        return "";
      },
    );
    try {
      const result = transcribeParakeet(
        {
          speech: {
            engine: "parakeet",
            executable: "synthetic",
            model: "synthetic",
            directory: root,
          },
          ffmpeg: "synthetic-ffmpeg",
          wav: join(root, "input.wav"),
          scratch: root,
          durationMs: 62000,
          runSpeech,
        },
        controller.signal,
      );
      if (mode === "complete") {
        expect(await result).toEqual({
          transcription: [
            { text: "First", offsets: { from: 100, to: 200 } },
            { text: "Boundary", offsets: { from: 59900, to: 60100 } },
            { text: "Last", offsets: { from: 61800, to: 61900 } },
          ],
        });
        expect(runSpeech).toHaveBeenCalledTimes(2);
        expect(extraction).toHaveBeenCalledTimes(2);
      } else {
        await expect(result).rejects.toThrow();
        expect(runSpeech).toHaveBeenCalledTimes(1);
      }
      expect(await readdir(root)).toEqual([]);
    } finally {
      extraction.mockRestore();
      await rm(root, { recursive: true, force: true });
    }
  },
);
