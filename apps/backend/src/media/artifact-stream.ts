import { Readable, type Writable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { mediaByteRange } from "@clipbuilder/contracts";
import { ApplicationError } from "../http/errorMapper.js";

// Both private media paths enforce the same exact byte contract before headers.
export async function streamArtifact(input: {
  bytes: number;
  expiresAtMs: number;
  now: number;
  range: string | undefined;
  signal: AbortSignal;
  destination: Writable;
  fetch(signal: AbortSignal): Promise<Response>;
  headers(status: number, fields: Record<string, string>): void;
  attachment?: boolean;
}) {
  let selected;
  try {
    selected = mediaByteRange(input.range, input.bytes);
  } catch {
    throw new ApplicationError({ code: "INVALID_REQUEST" });
  }
  const signal = AbortSignal.any([
    input.signal,
    AbortSignal.timeout(
      Math.max(1, Math.min(60_000, input.expiresAtMs - input.now)),
    ),
  ]);
  signal.throwIfAborted();
  const response = await input.fetch(signal),
    length = selected.end - selected.start + 1,
    contentRange = `bytes ${selected.start}-${selected.end}/${input.bytes}`;
  try {
    signal.throwIfAborted();
    if (
      response.status !== (selected.partial ? 206 : 200) ||
      !response.body ||
      response.headers.get("content-type")?.split(";")[0] !== "video/mp4" ||
      response.headers.get("content-length") !== String(length) ||
      response.headers.get("content-range") !==
        (selected.partial ? contentRange : null)
    )
      throw new ApplicationError({ code: "INVALID_REQUEST" });
    input.headers(response.status, {
      "Content-Type": "video/mp4",
      "Content-Length": String(length),
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...(input.attachment
        ? { "Content-Disposition": 'attachment; filename="clipbuilder.mp4"' }
        : {}),
      ...(selected.partial ? { "Content-Range": contentRange } : {}),
    });
    const body = response.body;
    async function* chunks() {
      const reader = body.getReader();
      const cancel = () => {
        void reader.cancel().catch(() => undefined);
      };
      signal.addEventListener("abort", cancel, { once: true });
      let count = 0;
      try {
        signal.throwIfAborted();
        for (;;) {
          const value = await reader.read();
          signal.throwIfAborted();
          if (value.done) break;
          count += value.value.byteLength;
          if (count > length) throw new Error("invalid-media");
          yield value.value;
        }
        if (count !== length) throw new Error("invalid-media");
      } finally {
        signal.removeEventListener("abort", cancel);
        await reader.cancel().catch(() => undefined);
        reader.releaseLock();
      }
    }
    await pipeline(Readable.from(chunks()), input.destination, { signal });
  } finally {
    if (response.body && !response.body.locked)
      await response.body.cancel().catch(() => undefined);
  }
}
