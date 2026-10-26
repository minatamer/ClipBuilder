import { createHash, randomUUID } from "node:crypto";
import { mkdtemp, open, rename, rm } from "node:fs/promises";
import { join } from "node:path";
import type { IncomingMessage } from "node:http";
import { z } from "zod";
import { HOSTED_EDITING_POLICY } from "../../../packages/contracts/local/hosted-editing.ts";
import type { WorkspaceFiles } from "./workspace-files.ts";

type UploadBody = Pick<IncomingMessage, "headers"> & AsyncIterable<Uint8Array>;
export async function hostedJson(req: UploadBody) {
  if (req.headers["content-type"] !== "application/json")
    throw new Error("json_required");
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const part of req) {
    size += part.length;
    if (size > 8192) throw new Error("json_large");
    chunks.push(Buffer.from(part));
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}
/** Fixed temporary file, ordered bounded chunks, no client filenames or paths. */
export class HostedUpload {
  private stage:
    | {
        id: string;
        directory: string;
        path: string;
        bytes: number;
        received: number;
        next: number;
        hash: ReturnType<typeof createHash>;
      }
    | undefined;
  private busy = false;
  constructor(
    private readonly root: string,
    private readonly maximum: number,
  ) {}
  async start(req: UploadBody) {
    if (this.busy) throw new Error("upload_busy");
    this.busy = true;
    try {
      const { bytes } = z
        .object({ bytes: z.number().int().positive().max(this.maximum) })
        .strict()
        .parse(await hostedJson(req));
      await this.discard();
      const directory = await mkdtemp(join(this.root, "upload-"));
      this.stage = {
        id: randomUUID(),
        directory,
        path: join(directory, "video.mp4"),
        bytes,
        received: 0,
        next: 0,
        hash: createHash("sha256"),
      };
      const file = await open(this.stage.path, "wx", 0o600);
      await file.close();
      return {
        uploadId: this.stage.id,
        chunkBytes: HOSTED_EDITING_POLICY.chunkBytes,
      };
    } finally {
      this.busy = false;
    }
  }
  async chunk(id: string, index: number, req: UploadBody) {
    if (this.busy) throw new Error("upload_busy");
    const stage = this.stage;
    const expected = stage
      ? Math.min(HOSTED_EDITING_POLICY.chunkBytes, stage.bytes - stage.received)
      : 0;
    if (
      !stage ||
      stage.id !== id ||
      index !== stage.next ||
      expected <= 0 ||
      Number(req.headers["content-length"]) !== expected ||
      req.headers["content-type"] !== "application/octet-stream"
    )
      throw new Error("upload_chunk_invalid");
    this.busy = true;
    try {
      const chunks: Buffer[] = [];
      let bytes = 0;
      for await (const part of req) {
        bytes += part.length;
        if (bytes > expected) throw new Error("upload_chunk_large");
        chunks.push(Buffer.from(part));
      }
      if (bytes !== expected) throw new Error("upload_chunk_incomplete");
      const data = Buffer.concat(chunks),
        file = await open(stage.path, "r+");
      try {
        let written = 0;
        while (written < data.length) {
          const result = await file.write(
            data,
            written,
            data.length - written,
            stage.received + written,
          );
          if (!result.bytesWritten) throw new Error("upload_write_failed");
          written += result.bytesWritten;
        }
      } finally {
        await file.close();
      }
      stage.hash.update(data);
      stage.received += bytes;
      stage.next++;
      return { received: stage.received };
    } finally {
      this.busy = false;
    }
  }
  async finish(
    id: string,
    files: WorkspaceFiles,
    workspaceId: string,
    signal: AbortSignal,
  ) {
    const stage = this.stage;
    if (
      this.busy ||
      !stage ||
      stage.id !== id ||
      stage.received !== stage.bytes
    )
      throw new Error("upload_incomplete");
    signal.throwIfAborted();
    this.busy = true;
    try {
      await rename(stage.path, await files.file(workspaceId, "source.mp4"));
      await rm(stage.directory, { recursive: true, force: true });
      if (this.stage === stage) this.stage = undefined;
      return { fingerprint: stage.hash.digest("hex"), bytes: stage.bytes };
    } finally {
      this.busy = false;
    }
  }
  async discard() {
    const stage = this.stage;
    if (stage) {
      await rm(stage.directory, { recursive: true, force: true });
      if (this.stage === stage) this.stage = undefined;
    }
  }
}
