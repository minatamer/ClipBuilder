import { ownerYoutubeVideoIdSchema } from "../../../packages/contracts/local/acquisition.ts";

const maximumBytes = 256 * 1024;

/** One fixed public thumbnail, memory-only; no caller-supplied host or URL. */
export async function fetchYoutubeThumbnail(
  videoId: string,
  signal: AbortSignal,
  read: typeof fetch = fetch,
): Promise<Uint8Array> {
  const id = ownerYoutubeVideoIdSchema.parse(videoId);
  signal.throwIfAborted();
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, 5000);
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  try {
    const response = await read(`https://i.ytimg.com/vi/${id}/mqdefault.jpg`, {
      signal: controller.signal,
      redirect: "error",
      credentials: "omit",
      cache: "no-store",
      referrerPolicy: "no-referrer",
    });
    reader = response.body?.getReader();
    if (
      !response.ok ||
      response.headers.get("content-type")?.split(";", 1)[0]?.trim() !==
        "image/jpeg" ||
      Number(response.headers.get("content-length") ?? 0) > maximumBytes ||
      !reader
    )
      throw new Error();
    const chunks: Uint8Array[] = [];
    let length = 0;
    for (;;) {
      const chunk = await reader.read();
      controller.signal.throwIfAborted();
      if (chunk.done) break;
      length += chunk.value.byteLength;
      if (length > maximumBytes) throw new Error();
      chunks.push(chunk.value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff)
      throw new Error();
    return bytes;
  } catch {
    throw new Error("source_thumbnail_unavailable");
  } finally {
    controller.abort();
    clearTimeout(timer);
    signal.removeEventListener("abort", abort);
    await reader?.cancel().catch(() => undefined);
    reader?.releaseLock();
  }
}
