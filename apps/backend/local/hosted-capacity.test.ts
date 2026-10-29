import { afterEach, expect, it, vi } from "vitest";
import { link, lstat, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  checkHostedScratch,
  createHostedScratchCapacity,
  hostedScratchBytes,
  HOSTED_MEMORY_BYTES,
  HOSTED_SCRATCH_VOLUME_BYTES,
} from "./hosted-capacity.ts";
import { HOSTED_EDITING_POLICY } from "../../../packages/contracts/local/hosted-editing.ts";

const cgroup = vi.hoisted(() => ({
  legacy: false,
  unavailable: false,
  limit: String(8 * 1024 ** 3),
  used: String(512 * 1024 ** 2),
  volume: (5 * 1024 ** 3 + 256 * 1024 ** 2) / 4096,
  type: 0x01021994,
}));
vi.mock("node:fs/promises", async (original) => {
  const fs = await original<typeof import("node:fs/promises")>();
  return {
    ...fs,
    async readFile(...args: Parameters<typeof fs.readFile>) {
      const path = String(args[0]);
      if (!path.startsWith("/sys/fs/cgroup/")) return fs.readFile(...args);
      if (cgroup.unavailable || (cgroup.legacy && !path.includes("/memory/")))
        throw Object.assign(new Error("synthetic_cgroup_missing"), {
          code: "ENOENT",
        });
      return path.endsWith("memory.max") ||
        path.endsWith("memory.limit_in_bytes")
        ? cgroup.limit
        : cgroup.used;
    },
    async statfs() {
      return {
        type: cgroup.type,
        blocks: cgroup.volume,
        bavail: cgroup.volume,
        bsize: 4096,
      };
    },
  };
});

let directory: string | undefined;
afterEach(async () => {
  if (directory) await rm(directory, { recursive: true, force: true });
  directory = undefined;
  Object.assign(cgroup, {
    legacy: false,
    unavailable: false,
    limit: String(HOSTED_MEMORY_BYTES),
    used: String(512 * 1024 ** 2),
    volume: HOSTED_SCRATCH_VOLUME_BYTES / 4096,
    type: 0x01021994,
  });
});
const reading = (overrides = {}) => ({
  volume: HOSTED_SCRATCH_VOLUME_BYTES,
  free: HOSTED_SCRATCH_VOLUME_BYTES,
  retained: 0,
  memoryLimit: HOSTED_MEMORY_BYTES,
  memoryUsed: 512 * 1024 ** 2,
  ...overrides,
});

it("admits a full media reservation without counting retained bytes twice", () => {
  const retained = 3 * 1024 ** 3;
  expect(() =>
    checkHostedScratch(
      HOSTED_EDITING_POLICY.scratchBytes,
      reading({
        retained,
        free: HOSTED_SCRATCH_VOLUME_BYTES - retained,
        memoryUsed: retained + 1024 ** 3,
      }),
    ),
  ).not.toThrow();
});

it("rejects invalid, unbounded, oversized, full-volume and low-cgroup-memory reservations", () => {
  for (const peak of [
    NaN,
    Infinity,
    -1,
    0.5,
    HOSTED_EDITING_POLICY.scratchBytes + 1,
  ])
    expect(() => checkHostedScratch(peak, reading())).toThrow(
      "disk_unavailable",
    );
  for (const current of [
    reading({ volume: 12 * 1024 ** 3 }),
    reading({ retained: HOSTED_EDITING_POLICY.scratchBytes + 1 }),
    reading({ free: HOSTED_EDITING_POLICY.reserveBytes - 1 }),
    reading({ memoryLimit: 4 * 1024 ** 3 }),
    reading({
      memoryUsed: HOSTED_MEMORY_BYTES - HOSTED_EDITING_POLICY.reserveBytes + 1,
    }),
    reading({ memoryUsed: NaN }),
    reading({ free: HOSTED_SCRATCH_VOLUME_BYTES + 1 }),
  ])
    expect(() => checkHostedScratch(0, current)).toThrow("disk_unavailable");
  expect(() =>
    checkHostedScratch(
      1024,
      reading({
        retained: 100,
        free: HOSTED_EDITING_POLICY.reserveBytes + 923,
      }),
    ),
  ).toThrow("disk_unavailable");
});

it("includes browser/runtime files in the media ceiling without subtracting them from future workspace demand", () => {
  const retained = 1024 ** 3;
  const browser = 128 * 1024 ** 2;
  expect(() =>
    checkHostedScratch(
      HOSTED_EDITING_POLICY.scratchBytes,
      reading({
        retained,
        free: HOSTED_SCRATCH_VOLUME_BYTES - retained - browser,
      }),
    ),
  ).toThrow("disk_unavailable");
  expect(() =>
    checkHostedScratch(
      HOSTED_EDITING_POLICY.scratchBytes - browser,
      reading({
        retained,
        free: HOSTED_SCRATCH_VOLUME_BYTES - retained - browser,
      }),
    ),
  ).not.toThrow();
});

it("counts real retained allocation once per hardlink and leaves file bytes intact", async () => {
  directory = await mkdtemp(join(tmpdir(), "clipbuilder-capacity-test-"));
  const source = join(directory, "source.mp4");
  const data = Buffer.alloc(8193, 7);
  await writeFile(source, data);
  await mkdir(join(directory, "overlay"));
  await link(source, join(directory, "overlay", "000000.png"));
  const info = await lstat(source);
  expect(await hostedScratchBytes(directory)).toBe(
    Math.max(info.size, info.blocks * 512),
  );
  expect((await lstat(source)).size).toBe(data.length);
});

it("checks the real capacity adapter at startup and each admission, with cgroup v1 fallback", async () => {
  directory = await mkdtemp(join(tmpdir(), "clipbuilder-capacity-adapter-"));
  const root = join(directory, "workspaces");
  await mkdir(root);
  const capacity = await createHostedScratchCapacity(directory, root);
  await capacity(root, HOSTED_EDITING_POLICY.scratchBytes);
  await expect(capacity(directory, 0)).rejects.toThrow("disk_unavailable");
  cgroup.legacy = true;
  await capacity(root, 0);
  cgroup.limit = "max";
  await expect(capacity(root, 0)).rejects.toThrow("disk_unavailable");
  cgroup.limit = String(HOSTED_MEMORY_BYTES);
  cgroup.type = 0xef53;
  await expect(capacity(root, 0)).rejects.toThrow("disk_unavailable");
  cgroup.type = 0x01021994;
  cgroup.unavailable = true;
  await expect(capacity(root, 0)).rejects.toThrow("synthetic_cgroup_missing");
});
