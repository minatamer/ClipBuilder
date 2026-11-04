import { lstat, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import {
  LOCAL_SPEECH_POLICY,
  type LocalSpeechTools,
} from "../../../scripts/local-speech-tools.ts";
import { runOwnedProcess } from "../src/media/process-runner.ts";

const MAX_DUMP_BYTES = 1024 ** 2;
type Word = { text: string; offsets: { from: number; to: number } };
const invalid = () => new Error("local_speech_output_invalid");

/** The pinned CLI exposes 10-ms token clocks, not Whisper JSON. */
export function parseParakeetSpeech(dump: string, durationMs: number): Word[] {
  if (
    Buffer.byteLength(dump) > MAX_DUMP_BYTES ||
    !Number.isSafeInteger(durationMs) ||
    durationMs < 1
  )
    throw invalid();
  const headers = [...dump.matchAll(/^Tokens \[(\d+)\]:\s*$/gm)];
  if (
    headers.length !== 1 ||
    !/parakeet_print_timings:.*total time\s+=/u.test(dump)
  )
    throw invalid();
  const expected = Number(headers[0]![1]);
  if (!Number.isSafeInteger(expected) || expected > 10000) throw invalid();
  const words: Word[] = [];
  let current: Word | undefined,
    count = 0,
    priorToken = -1;
  const flush = () => {
    if (!current?.text.trim()) return;
    current.text = current.text.trim();
    if (
      current.offsets.to <= current.offsets.from ||
      current.text.length > 10000 ||
      /\s/u.test(current.text) ||
      (words.length && current.offsets.from < words.at(-1)!.offsets.from)
    )
      throw invalid();
    words.push(current);
  };
  for (const line of dump.split(/\r?\n/u)) {
    if (!line.includes("word_start=")) continue;
    const match = line.match(
      /^\s*\[\s*(\d+)\] id=.*\bt0=\s*(\d+)\s+t1=\s*(\d+)\s+word_start=(true|false)\s+"(.*)"\s*$/u,
    );
    if (!match || Number(match[1]) !== count++) throw invalid();
    const begin = Number(match[2]) * 10,
      end = Number(match[3]) * 10;
    if (
      !Number.isSafeInteger(begin) ||
      !Number.isSafeInteger(end) ||
      begin < priorToken ||
      end < begin ||
      end > durationMs + 80
    )
      throw invalid();
    priorToken = begin;
    if (match[4] === "true") {
      flush();
      current = {
        text: "",
        offsets: { from: begin, to: Math.min(end, durationMs) },
      };
    }
    if (!current) throw invalid();
    current.text += match[5]!.replaceAll("▁", " ");
    current.offsets.to = Math.min(
      durationMs,
      Math.max(current.offsets.to, end),
    );
  }
  flush();
  if (count !== expected) throw invalid();
  return words;
}

export function parakeetWindows(durationMs: number) {
  if (
    !Number.isSafeInteger(durationMs) ||
    durationMs <= 0 ||
    durationMs > 15 * 60 * 1000
  )
    throw invalid();
  const windows = [];
  for (let core = 0; core < durationMs; core += LOCAL_SPEECH_POLICY.coreMs) {
    const end = Math.min(durationMs, core + LOCAL_SPEECH_POLICY.coreMs);
    windows.push({
      core,
      end,
      begin: Math.max(0, core - LOCAL_SPEECH_POLICY.overlapMs),
      stop: Math.min(durationMs, end + LOCAL_SPEECH_POLICY.overlapMs),
    });
  }
  return windows;
}

export async function transcribeParakeet(
  options: {
    speech: LocalSpeechTools;
    ffmpeg: string;
    wav: string;
    scratch: string;
    durationMs: number;
    runSpeech?: typeof runOwnedProcess;
  },
  signal: AbortSignal,
) {
  const transcription: Word[] = [];
  const { speech } = options;
  for (const window of parakeetWindows(options.durationMs)) {
    signal.throwIfAborted();
    const wav = join(options.scratch, `part-${window.core}.wav`),
      dump = join(options.scratch, `part-${window.core}.tokens`);
    try {
      await runOwnedProcess(
        options.ffmpeg,
        [
          "-nostdin",
          "-n",
          "-v",
          "error",
          "-threads",
          "2",
          "-ss",
          String(window.begin / 1000),
          "-i",
          options.wav,
          "-t",
          String((window.stop - window.begin) / 1000),
          "-vn",
          "-sn",
          "-dn",
          "-ar",
          "16000",
          "-ac",
          "1",
          "-c:a",
          "pcm_s16le",
          "-map_metadata",
          "-1",
          wav,
        ],
        signal,
      );
      await (options.runSpeech ?? runOwnedProcess)(
        speech.executable,
        [
          "-m",
          speech.model,
          "-f",
          wav,
          "-t",
          String(LOCAL_SPEECH_POLICY.threads),
          "-ng",
          "-ps",
        ],
        signal,
        {
          cwd: speech.directory,
          env: {
            SystemRoot: process.env.SystemRoot,
            PATH: `${speech.directory};${process.env.SystemRoot}\\System32`,
            TEMP: options.scratch,
            TMP: options.scratch,
            OMP_NUM_THREADS: String(LOCAL_SPEECH_POLICY.threads),
            OPENBLAS_NUM_THREADS: String(LOCAL_SPEECH_POLICY.threads),
          },
          stdout: "ignore",
          stderrFile: { path: dump, maxBytes: MAX_DUMP_BYTES },
          timeoutMs: 180000,
        },
      );
      signal.throwIfAborted();
      const info = await lstat(dump);
      if (
        !info.isFile() ||
        info.isSymbolicLink() ||
        info.nlink !== 1 ||
        info.size > MAX_DUMP_BYTES
      )
        throw invalid();
      for (const word of parseParakeetSpeech(
        await readFile(dump, { encoding: "utf8", signal }),
        window.stop - window.begin,
      )) {
        const from = word.offsets.from + window.begin,
          to = word.offsets.to + window.begin;
        if ((from + to) / 2 >= window.core && (from + to) / 2 < window.end)
          transcription.push({ ...word, offsets: { from, to } });
      }
    } finally {
      await Promise.all([rm(wav, { force: true }), rm(dump, { force: true })]);
    }
  }
  transcription.sort((a, b) => a.offsets.from - b.offsets.from);
  return { transcription };
}
