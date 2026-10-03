import { PUBLIC_LIMITS } from "@clipbuilder/contracts";
import { SampleApiFailure, sampleFailure } from "./sample.api";

export async function loadRetainedSample(
  signal: AbortSignal,
  maximumBytes = PUBLIC_LIMITS.maxSourceBytes,
  transport: typeof fetch = fetch,
): Promise<File> {
  let response: Response | undefined;
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  const cancel = () => {
    void reader?.cancel().catch(() => undefined);
  };
  try {
    signal.throwIfAborted();
    response = await transport("/api/analysis/sample-source", {
      credentials: "same-origin",
      cache: "no-store",
      redirect: "error",
      signal,
    });
    signal.throwIfAborted();
    const bytes = Number(response.headers.get("content-length"));
    if (
      response.status !== 200 ||
      !response.body ||
      response.headers.get("content-type")?.split(";")[0] !== "video/mp4" ||
      !Number.isSafeInteger(bytes) ||
      bytes <= 0 ||
      bytes > Math.min(maximumBytes, PUBLIC_LIMITS.maxSourceBytes)
    )
      throw new Error();
    reader = response.body.getReader();
    signal.addEventListener("abort", cancel, { once: true });
    const chunks: ArrayBuffer[] = [];
    let count = 0;
    for (;;) {
      const chunk = await reader.read();
      signal.throwIfAborted();
      if (chunk.done) break;
      count += chunk.value.byteLength;
      if (count > bytes) throw new Error();
      chunks.push(new Uint8Array(chunk.value).buffer);
    }
    if (count !== bytes) throw new Error();
    signal.throwIfAborted();
    return new File(chunks, "input.mp4", { type: "video/mp4" });
  } catch {
    throw new SampleApiFailure(sampleFailure());
  } finally {
    signal.removeEventListener("abort", cancel);
    if (reader) {
      await reader.cancel().catch(() => undefined);
      reader.releaseLock();
    }
    if (response?.body && !response.body.locked)
      await response.body.cancel().catch(() => undefined);
  }
}
