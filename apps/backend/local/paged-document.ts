import { createHash, randomUUID } from "node:crypto";
import { lstat, mkdir, open, readFile, rename, rm } from "node:fs/promises";
import { dirname } from "node:path";
import { ownerDigestSchema } from "../../../packages/contracts/local/assets.ts";
import { z } from "zod";
import { confinedPath, requireDisk } from "./workspace-files.ts";
import { requireLocalMemory } from "./machine-memory.ts";

const PAGE_BYTES = 512 * 1024,
  MAX_ITEM_BYTES = 32 * 1024 ** 2,
  FANOUT = 128;
const digest = ownerDigestSchema;
const pointer = z
  .object({
    $clipbuilderArray: digest,
    count: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  })
  .strict();
const node = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("leaf"), values: z.array(z.unknown()) }).strict(),
  z
    .object({
      kind: z.literal("branch"),
      children: z.array(digest).min(1).max(FANOUT),
    })
    .strict(),
  z
    .object({
      kind: z.literal("document"),
      value: z.record(z.string(), z.unknown()),
    })
    .strict(),
]);
const envelope = z
  .object({
    version: z.literal(1),
    format: z.literal("clipbuilder-paged-v1"),
    id: z.uuid().optional(),
    source: z.unknown().optional(),
    root: digest,
  })
  .strict();
const hash = (bytes: Buffer) =>
  createHash("sha256").update(bytes).digest("hex");
const missing = (e: unknown) =>
  e instanceof Error && "code" in e && e.code === "ENOENT";

/** Immutable bounded pages and a fixed-size root; unchanged pages are not rewritten. */
export async function pageDocument(
  path: string,
  value: unknown,
  signal: AbortSignal,
  capacity = requireDisk,
) {
  const dir = await confinedPath(dirname(path), "state-pages");
  await mkdir(dir, { recursive: true, mode: 0o700 });
  const store = async (value: z.infer<typeof node>) => {
    const bytes = Buffer.from(JSON.stringify(value));
    if (bytes.length > MAX_ITEM_BYTES) throw Error("draft_item_large");
    const id = hash(bytes),
      destination = await confinedPath(dir, `${id}.json`);
    try {
      const info = await lstat(destination);
      if (
        !info.isFile() ||
        info.nlink !== 1 ||
        info.size !== bytes.length ||
        hash(await readFile(destination, { signal })) !== id
      )
        throw Error("draft_page_invalid");
      return id;
    } catch (error) {
      if (!missing(error)) throw error;
    }
    await capacity(dir, bytes.length);
    signal.throwIfAborted();
    const temporary = await confinedPath(dir, `${randomUUID()}.partial`);
    try {
      const handle = await open(temporary, "wx", 0o600);
      try {
        await handle.writeFile(bytes, { signal });
        await handle.sync();
      } finally {
        await handle.close();
      }
      signal.throwIfAborted();
      await rename(temporary, destination);
      return id;
    } finally {
      await rm(temporary, { force: true });
    }
  };
  const array = async (values: unknown[]) => {
    let leaves: string[] = [],
      group: unknown[] = [],
      bytes = 32;
    for (const [index, item] of values.entries()) {
      signal.throwIfAborted();
      const size = Buffer.byteLength(JSON.stringify(item));
      if (size > MAX_ITEM_BYTES - 128) throw Error("draft_item_large");
      if (group.length && (bytes + size > PAGE_BYTES || index % 16 === 0)) {
        leaves.push(await store({ kind: "leaf", values: group }));
        group = [];
        bytes = 32;
      }
      group.push(item);
      bytes += size + 1;
    }
    if (group.length || !leaves.length)
      leaves.push(await store({ kind: "leaf", values: group }));
    while (leaves.length > 1) {
      const parents: string[] = [];
      for (let i = 0; i < leaves.length; i += FANOUT)
        parents.push(
          await store({
            kind: "branch",
            children: leaves.slice(i, i + FANOUT),
          }),
        );
      leaves = parents;
    }
    return { $clipbuilderArray: leaves[0]!, count: values.length };
  };
  const encode = async (value: unknown): Promise<unknown> => {
    if (Array.isArray(value)) return array(value);
    if (value !== null && typeof value === "object") {
      const result: Record<string, unknown> = {};
      for (const [key, child] of Object.entries(value))
        result[key] = await encode(child);
      return result;
    }
    return value;
  };
  const object = z.record(z.string(), z.unknown()).parse(value);
  const id = z.uuid().safeParse(object.id);
  const encoded = z.record(z.string(), z.unknown()).parse(await encode(value));
  return envelope.parse({
    version: 1,
    format: "clipbuilder-paged-v1",
    ...(id.success ? { id: id.data, source: object.source } : {}),
    root: await store({ kind: "document", value: encoded }),
  });
}

/** Loads only confined, digest-verified pages; decoding never dispatches work. */
export async function unpageDocument(
  path: string,
  value: unknown,
  signal: AbortSignal,
) {
  const parsed = envelope.safeParse(value);
  if (!parsed.success) return value;
  const dir = await confinedPath(dirname(path), "state-pages"),
    active = new Set<string>();
  let decodedBytes = 0;
  const load = async (id: string) => {
    signal.throwIfAborted();
    const file = await confinedPath(dir, `${digest.parse(id)}.json`),
      info = await lstat(file);
    if (
      !info.isFile() ||
      info.nlink !== 1 ||
      info.size < 1 ||
      info.size > MAX_ITEM_BYTES
    )
      throw Error("draft_page_invalid");
    decodedBytes += info.size;
    requireLocalMemory(decodedBytes * 3);
    const bytes = await readFile(file, { signal });
    if (hash(bytes) !== id) throw Error("draft_page_invalid");
    return node.parse(JSON.parse(bytes.toString("utf8")));
  };
  const visit = async (id: string, depth = 0): Promise<unknown[]> => {
    if (depth > 16 || active.has(id)) throw Error("draft_page_invalid");
    active.add(id);
    try {
      const value = await load(id);
      if (value.kind === "leaf") return value.values;
      if (value.kind !== "branch") throw Error("draft_page_invalid");
      const result: unknown[] = [];
      for (const child of value.children) {
        const values = await visit(child, depth + 1);
        for (const item of values) result.push(item);
      }
      return result;
    } finally {
      active.delete(id);
    }
  };
  const decode = async (value: unknown): Promise<unknown> => {
    const ref = pointer.safeParse(value);
    if (ref.success) {
      const values = await visit(ref.data.$clipbuilderArray);
      if (values.length !== ref.data.count) throw Error("draft_page_invalid");
      return values;
    }
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      const result: Record<string, unknown> = {};
      for (const [key, child] of Object.entries(value))
        result[key] = await decode(child);
      return result;
    }
    return value;
  };
  const root = await load(parsed.data.root);
  if (root.kind !== "document") throw Error("draft_page_invalid");
  const result = await decode(root.value);
  if (parsed.data.id !== undefined) {
    const identity = z
      .object({ id: z.uuid(), source: z.unknown() })
      .passthrough()
      .parse(result);
    if (
      identity.id !== parsed.data.id ||
      JSON.stringify(identity.source) !== JSON.stringify(parsed.data.source)
    )
      throw Error("draft_page_invalid");
  }
  return result;
}
