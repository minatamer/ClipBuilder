import { createHash, randomUUID } from "node:crypto";
import {
  lstat,
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { z } from "zod";
import {
  ownerWordsSchema,
  ownerAnalysisSchema,
} from "../../../packages/contracts/local/selection.ts";
import { confinedPath, requireDisk } from "./workspace-files.ts";

// Each receipt is independently bounded. There is no growing transcript document.
const MAX_BYTES = 4 * 1024 ** 2;
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const receipt = z
  .object({
    key: z.string().max(8192),
    value: z.union([
      z.object({ kind: z.literal("speech"), words: ownerWordsSchema }).strict(),
      z
        .object({ kind: z.literal("selection"), analysis: ownerAnalysisSchema })
        .strict(),
    ]),
  })
  .strict();
type Receipt = z.infer<typeof receipt>;
const missing = (error: unknown) =>
  error instanceof Error && "code" in error && error.code === "ENOENT";

export class AnalysisChunks {
  constructor(
    readonly parent: string,
    private readonly capacity = requireDisk,
  ) {}
  private async directory() {
    const path = await confinedPath(this.parent, "analysis-chunks");
    await mkdir(path, { recursive: true, mode: 0o700 });
    return path;
  }
  async read(
    key: string,
    signal: AbortSignal,
  ): Promise<Receipt["value"] | undefined> {
    const dir = await this.directory();
    const path = await confinedPath(dir, `${hash(key)}.json`);
    try {
      signal.throwIfAborted();
      const info = await lstat(path);
      if (
        !info.isFile() ||
        info.isSymbolicLink() ||
        info.nlink !== 1 ||
        info.size > MAX_BYTES
      )
        throw Error("analysis_chunk_invalid");
      const record = receipt.parse(
        JSON.parse(await readFile(path, { encoding: "utf8", signal })),
      );
      if (record.key !== key) throw Error("analysis_chunk_invalid");
      return record.value;
    } catch (error) {
      if (missing(error)) return undefined;
      throw error;
    }
  }
  async coveringSpeech(
    compatibility: string,
    fingerprint: string,
    window: { startMs: number; endMs: number },
    signal: AbortSignal,
  ) {
    const dir = await this.directory();
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      signal.throwIfAborted();
      if (!/^[a-f0-9]{64}\.json$/.test(entry.name)) continue;
      const path = await confinedPath(dir, entry.name),
        info = await lstat(path);
      if (!info.isFile() || info.nlink !== 1 || info.size > MAX_BYTES)
        throw Error("analysis_chunk_invalid");
      const record = receipt.parse(
        JSON.parse(await readFile(path, { encoding: "utf8", signal })),
      );
      if (`${hash(record.key)}.json` !== entry.name)
        throw Error("analysis_chunk_invalid");
      const key: unknown = JSON.parse(record.key);
      if (
        Array.isArray(key) &&
        key[0] === "speech-v1" &&
        key[1] === compatibility &&
        key[2] === fingerprint
      ) {
        const coverage = z
          .object({ startMs: z.number(), endMs: z.number() })
          .strict()
          .parse(key[3]);
        if (
          coverage.startMs <= window.startMs &&
          coverage.endMs >= window.endMs &&
          record.value.kind === "speech"
        )
          return record.value;
      }
    }
    return undefined;
  }
  async write(key: string, value: Receipt["value"], signal: AbortSignal) {
    const bytes = Buffer.from(JSON.stringify(receipt.parse({ key, value })));
    if (bytes.length > MAX_BYTES) throw Error("analysis_chunk_limit");
    const dir = await this.directory();
    await this.capacity(dir, bytes.length);
    const path = await confinedPath(dir, `${hash(key)}.json`);
    const temporary = await confinedPath(dir, `${randomUUID()}.partial`);
    try {
      await writeFile(temporary, bytes, { flag: "wx", mode: 0o600, signal });
      signal.throwIfAborted();
      await rename(temporary, path);
    } finally {
      await rm(temporary, { force: true });
    }
  }
  /** Copy only acknowledged receipts; interrupted .partial files are never reused. */
  async copyTo(parent: string, signal: AbortSignal) {
    let dir: string;
    try {
      dir = await confinedPath(this.parent, "analysis-chunks");
      await lstat(dir);
    } catch (error) {
      if (missing(error)) return;
      throw error;
    }
    const target = new AnalysisChunks(parent, this.capacity);
    for await (const entry of await readdir(dir, { withFileTypes: true })) {
      signal.throwIfAborted();
      if (!/^[a-f0-9]{64}\.json$/.test(entry.name)) continue;
      const path = await confinedPath(dir, entry.name),
        info = await lstat(path);
      if (!info.isFile() || info.nlink !== 1 || info.size > MAX_BYTES)
        throw Error("analysis_chunk_invalid");
      const record = receipt.parse(
        JSON.parse(await readFile(path, { encoding: "utf8", signal })),
      );
      if (`${hash(record.key)}.json` !== entry.name)
        throw Error("analysis_chunk_invalid");
      if (!(await target.read(record.key, signal)))
        await target.write(record.key, record.value, signal);
    }
  }
}
