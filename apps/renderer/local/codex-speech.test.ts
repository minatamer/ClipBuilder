import { expect, it, vi } from "vitest";
import { runLocalSpeechPair } from "./codex-speech.ts";

it("overlaps independent consumers and joins both before returning", async () => {
  let completeSpeech!: () => void, completeSpeakers!: () => void;
  const speech = vi.fn(
    () =>
      new Promise<void>((done) => {
        completeSpeech = done;
      }),
  );
  const speakers = vi.fn(
    () =>
      new Promise<string>((done) => {
        completeSpeakers = () => done("synthetic-speakers");
      }),
  );
  const task = runLocalSpeechPair(
    new AbortController().signal,
    true,
    speech,
    speakers,
  );
  expect(speech).toHaveBeenCalledTimes(1);
  expect(speakers).toHaveBeenCalledTimes(1);
  completeSpeech();
  completeSpeakers();
  expect(await task).toBe("synthetic-speakers");
});

it("keeps constrained CPUs sequential without changing the native work", async () => {
  let completeSpeakers!: () => void;
  const speech = vi.fn(async () => {});
  const speakers = vi.fn(
    () =>
      new Promise<string>((done) => {
        completeSpeakers = () => done("turns");
      }),
  );
  const task = runLocalSpeechPair(
    new AbortController().signal,
    false,
    speech,
    speakers,
  );
  expect(speech).not.toHaveBeenCalled();
  completeSpeakers();
  expect(await task).toBe("turns");
  expect(speech).toHaveBeenCalledTimes(1);
});

it("aborts the sibling on failure and waits for it to be reaped before rejecting", async () => {
  const failure = Error("synthetic-primary");
  let reap!: () => void,
    aborted = false,
    settled = false;
  const task = runLocalSpeechPair(
    new AbortController().signal,
    true,
    async () => {
      throw failure;
    },
    (signal) =>
      new Promise<string>((_resolve, reject) => {
        signal.addEventListener(
          "abort",
          () => {
            aborted = true;
            reap = () => reject(Error("synthetic-sibling"));
          },
          { once: true },
        );
      }),
  );
  const result = task.catch((error: unknown) => {
    settled = true;
    return error;
  });
  await new Promise<void>((done) => setTimeout(done, 0));
  expect(aborted).toBe(true);
  expect(settled).toBe(false);
  reap();
  expect(await result).toBe(failure);
});

it("propagates caller cancellation to both consumers and waits for completion", async () => {
  const controller = new AbortController();
  let finished = 0;
  const consumer = (signal: AbortSignal) =>
    new Promise<string>((_resolve, reject) => {
      signal.addEventListener(
        "abort",
        () => {
          finished++;
          reject(signal.reason);
        },
        { once: true },
      );
    });
  const task = runLocalSpeechPair(controller.signal, true, consumer, consumer);
  controller.abort();
  await expect(task).rejects.toThrow();
  expect(finished).toBe(2);
});
