import { randomUUID } from "node:crypto";
import {
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
  stat,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it, vi } from "vitest";
import { pageDocument, unpageDocument } from "./paged-document.ts";

it("round-trips beyond the old 32-MiB aggregate envelope using bounded immutable pages and only writes changed pages", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-paged-state-")),
    path = join(root, "draft.json"),
    signal = new AbortController().signal,
    capacity = vi.fn(async () => {});
  try {
    const value = {
      version: 1,
      id: randomUUID(),
      source: { digest: "a".repeat(64) },
      snapshot: {
        clips: Array.from({ length: 1800 }, (_, index) => ({
          index,
          text: "fictional".repeat(2500),
        })),
      },
    };
    expect(Buffer.byteLength(JSON.stringify(value))).toBeGreaterThan(
      32 * 1024 ** 2,
    );
    const encoded = await pageDocument(path, value, signal, capacity);
    await writeFile(path, JSON.stringify(encoded));
    const before = await readdir(join(root, "state-pages")),
      times = new Map<string, number>();
    for (const name of before) {
      const info = await stat(join(root, "state-pages", name));
      expect(info.size).toBeLessThan(1024 ** 2);
      times.set(name, info.mtimeMs);
    }
    expect(Buffer.byteLength(JSON.stringify(encoded))).toBeLessThan(1024);
    expect(await unpageDocument(path, encoded, signal)).toEqual(value);
    value.snapshot.clips[950]!.text = "changed fictional data";
    const next = await pageDocument(path, value, signal, capacity);
    const after = await readdir(join(root, "state-pages"));
    expect(after.length - before.length).toBeLessThan(8);
    for (const [name, time] of times)
      expect((await stat(join(root, "state-pages", name))).mtimeMs).toBe(time);
    expect(await unpageDocument(path, next, signal)).toEqual(value);
    const broken = after.find((name) => !times.has(name))!;
    await writeFile(join(root, "state-pages", broken), "damaged");
    await expect(unpageDocument(path, next, signal)).rejects.toThrow();
    expect(JSON.parse(await readFile(path, "utf8"))).toEqual(encoded);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}, 30_000);
it("preserves a previous root on canceled or low-disk page writes", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-page-failure-")),
    path = join(root, "draft.json"),
    signal = new AbortController().signal;
  try {
    const value = {
      version: 1,
      id: randomUUID(),
      source: { digest: "b".repeat(64) },
      clips: ["fictional"],
    };
    const original = await pageDocument(path, value, signal, async () => {});
    await writeFile(path, JSON.stringify(original));
    await expect(
      pageDocument(path, { ...value, clips: ["changed"] }, signal, async () => {
        throw Error("disk_unavailable");
      }),
    ).rejects.toThrow("disk_unavailable");
    await expect(
      pageDocument(path, value, AbortSignal.abort(), async () => {}),
    ).rejects.toThrow();
    expect(await unpageDocument(path, original, signal)).toEqual(value);
    expect(
      (await readdir(join(root, "state-pages"))).every((name) =>
        name.endsWith(".json"),
      ),
    ).toBe(true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
