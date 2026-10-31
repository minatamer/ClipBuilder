/** Both consumers read one immutable WAV; scratch outlives both native children. */
export async function runLocalSpeechPair(
  signal: AbortSignal,
  parallel: boolean,
  transcribe: (signal: AbortSignal) => Promise<unknown>,
  speakers: (signal: AbortSignal) => Promise<string>,
): Promise<string> {
  signal.throwIfAborted();
  if (!parallel) {
    const result = await speakers(signal);
    await transcribe(signal);
    return result;
  }
  const controller = new AbortController();
  const combined = AbortSignal.any([signal, controller.signal]);
  let failed = false,
    failure: unknown;
  const guard = async <T>(work: () => Promise<T>) => {
    try {
      return await work();
    } catch (error) {
      if (!failed) {
        failed = true;
        failure = error;
      }
      controller.abort();
      throw error;
    }
  };
  const results = await Promise.allSettled([
    guard(() => transcribe(combined)),
    guard(() => speakers(combined)),
  ]);
  if (failed) throw failure;
  signal.throwIfAborted();
  const result = results[1];
  if (result.status !== "fulfilled")
    throw new Error("local_speech_unavailable");
  return result.value;
}
