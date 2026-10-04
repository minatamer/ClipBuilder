import { createHash } from "node:crypto";
import { Writable } from "node:stream";
import {
  mediaUploadRequestSchema,
  mediaUploadResponseSchema,
  retainedSampleAnalysisResponseSchema,
} from "@clipbuilder/contracts";
import type { RetainedSampleReader } from "./retained-sample.js";
import { streamArtifact } from "./artifact-stream.js";

const COPY_CHUNK_BYTES = 4 * 1024 * 1024;

// Reads only the fixed generation-pinned master. Writes only to the temporary
// upload capability allocated by the private renderer, never to the master.
export class RetainedSampleProcessing {
  readonly bytes: number;
  constructor(
    private readonly reader: RetainedSampleReader,
    private readonly transport: typeof fetch = fetch,
  ) {
    this.bytes = mediaUploadRequestSchema.shape.bytes.parse(reader.bytes);
  }
  private async *chunks(signal: AbortSignal) {
    for (let start = 0; start < this.bytes; start += COPY_CHUNK_BYTES) {
      signal.throwIfAborted();
      const end = Math.min(this.bytes - 1, start + COPY_CHUNK_BYTES - 1);
      const chunks: Buffer[] = [];
      await streamArtifact({
        bytes: this.bytes,
        now: 0,
        expiresAtMs: 60_000,
        range: `bytes=${start}-${end}`,
        signal,
        destination: new Writable({
          write(chunk: Buffer, _encoding, callback) {
            chunks.push(chunk);
            callback();
          },
        }),
        fetch: (requestSignal) =>
          this.reader.read(`bytes=${start}-${end}`, requestSignal),
        headers: () => {},
      });
      yield { start, end, bytes: Buffer.concat(chunks) };
    }
  }
  async fingerprint(signal: AbortSignal): Promise<string> {
    const hash = createHash("sha256");
    for await (const chunk of this.chunks(signal)) hash.update(chunk.bytes);
    signal.throwIfAborted();
    return hash.digest("hex");
  }
  async transfer(uploadUrl: string, signal: AbortSignal): Promise<string> {
    mediaUploadResponseSchema.parse({ uploadUrl, expiresAtMs: 1 });
    for await (const chunk of this.chunks(signal)) {
      const response = await this.transport(uploadUrl, {
        method: "PUT",
        redirect: "error",
        signal,
        headers: {
          "Content-Type": "video/mp4",
          "Content-Range": `bytes ${chunk.start}-${chunk.end}/${this.bytes}`,
        },
        body: new Uint8Array(chunk.bytes),
      });
      try {
        signal.throwIfAborted();
        if (chunk.end < this.bytes - 1) {
          if (
            response.status !== 308 ||
            response.headers.get("range") !== `bytes=0-${chunk.end}`
          )
            throw new Error("sample_copy_failed");
          continue;
        }
        if (![200, 201].includes(response.status) || !response.body)
          throw new Error("sample_copy_failed");
        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let size = 0;
        const cancel = () => {
          void reader.cancel().catch(() => undefined);
        };
        signal.addEventListener("abort", cancel, { once: true });
        try {
          for (;;) {
            const value = await reader.read();
            signal.throwIfAborted();
            if (value.done) break;
            size += value.value.byteLength;
            if (size > 8192) throw new Error("sample_copy_failed");
            chunks.push(value.value);
          }
          const value: unknown = JSON.parse(
            Buffer.concat(chunks).toString("utf8"),
          );
          // Storage's object metadata is server-only; return only its generation.
          const generation =
            retainedSampleAnalysisResponseSchema.shape.generation.parse(
              typeof value === "object" &&
                value !== null &&
                "generation" in value
                ? value.generation
                : undefined,
            );
          return generation;
        } finally {
          signal.removeEventListener("abort", cancel);
          await reader.cancel().catch(() => undefined);
          reader.releaseLock();
        }
      } finally {
        if (response.body && !response.body.locked)
          await response.body.cancel().catch(() => undefined);
      }
    }
    throw new Error("sample_copy_failed");
  }
}
