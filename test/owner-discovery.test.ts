import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  link,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { basename, join } from "node:path";
import { tmpdir } from "node:os";
import {
  clearOwnerDiscovery,
  discoverOwnerHost,
  publishOwnerDiscovery,
} from "../scripts/owner-discovery.mjs";

let temporary: string, runtime: string, clock: number;
let identities: { pid: number; parent: number; created: string }[];
let probe: ReturnType<
  typeof vi.fn<(pid: number) => Promise<typeof identities>>
>;
const pointer = () => join(temporary, "clipbuilder-owner-active.json");
const options = () => ({ temporaryRoot: temporary, probe, now: () => clock });
beforeEach(async () => {
  temporary = await mkdtemp(
    join(tmpdir(), "clipbuilder-owner-discovery-test-"),
  );
  clock = Date.now();
  identities = [
    {
      pid: process.pid,
      parent: process.ppid,
      created: new Date(clock - 5000).toISOString(),
    },
    {
      pid: process.pid + 10_001,
      parent: process.pid,
      created: new Date(clock - 4000).toISOString(),
    },
    {
      pid: process.pid + 10_002,
      parent: process.pid,
      created: new Date(clock - 3000).toISOString(),
    },
  ];
  probe = vi.fn(async () => structuredClone(identities));
  runtime = await fixture();
});
afterEach(async () => {
  await rm(temporary, { recursive: true, force: true });
});
async function fixture() {
  const directory = await mkdtemp(
    join(temporary, "clipbuilder-owner-runtime-"),
  );
  await mkdir(join(directory, "workspaces"));
  await writeFile(
    join(directory, "processes.json"),
    JSON.stringify({
      supervisor: process.pid,
      startedAt: new Date(clock).toISOString(),
      identities,
      ports: [4100, 4200],
    }),
  );
  await writeFile(
    join(directory, "state.json"),
    JSON.stringify({
      root: join(directory, "workspaces"),
      ui: join(temporary, "synthetic-ui"),
      token: "a".repeat(64),
      workerToken: "b".repeat(64),
      tools: {
        ffmpeg: join(temporary, "synthetic-ffmpeg"),
        ffprobe: join(temporary, "synthetic-ffprobe"),
      },
      overlayBundle: join(temporary, "synthetic-overlay"),
      chromium: join(temporary, "synthetic-chrome"),
      desktopStorageRoot: join(temporary, "synthetic-desktop", "ClipBuilder"),
    }),
  );
  return directory;
}

it("publishes only opaque discovery metadata after validating the stable process ledger, and clears only its owned record", async () => {
  await publishOwnerDiscovery(runtime, options());
  const metadata = JSON.parse(await readFile(pointer(), "utf8"));
  expect(Object.keys(metadata).sort()).toEqual([
    "publishedAt",
    "runtime",
    "supervisor",
    "version",
  ]);
  expect(metadata.runtime).toBe(basename(runtime));
  expect(JSON.stringify(metadata)).not.toContain(temporary);
  expect(JSON.stringify(metadata)).not.toContain("a".repeat(64));
  expect(await discoverOwnerHost(options())).toEqual({
    token: "a".repeat(64),
    runtime,
  });
  expect(probe).toHaveBeenCalledWith(process.pid);
  await clearOwnerDiscovery(runtime, options());
  await expect(discoverOwnerHost(options())).rejects.toThrow(
    /^owner_host_unavailable$/,
  );
  expect(
    (await readdir(temporary)).filter((name) => name.endsWith(".tmp")),
  ).toEqual([]);
});

it("rejects unknown fields, escaped paths, malformed or oversized records with only a safe error", async () => {
  await publishOwnerDiscovery(runtime, options());
  const good = JSON.parse(await readFile(pointer(), "utf8"));
  for (const invalid of [
    { ...good, runtime: "../state.json" },
    { ...good, token: "a".repeat(64) },
    { version: 1 },
    { ...good, publishedAt: "invalid" },
  ]) {
    await writeFile(pointer(), JSON.stringify(invalid));
    await expect(discoverOwnerHost(options())).rejects.toThrow(
      /^owner_host_unavailable$/,
    );
  }
  await writeFile(pointer(), "x".repeat(2049));
  await expect(discoverOwnerHost(options())).rejects.toThrow(
    /^owner_host_unavailable$/,
  );
  await writeFile(pointer(), JSON.stringify(good));
  const stateFile = join(runtime, "state.json");
  const state = JSON.parse(await readFile(stateFile, "utf8"));
  await writeFile(
    stateFile,
    JSON.stringify({ ...state, desktopStorageRoot: "relative-desktop" }),
  );
  await expect(discoverOwnerHost(options())).rejects.toThrow(
    /^owner_host_unavailable$/,
  );
  await writeFile(
    stateFile,
    JSON.stringify({ ...state, root: join(temporary, "outside") }),
  );
  await expect(discoverOwnerHost(options())).rejects.toThrow(
    /^owner_host_unavailable$/,
  );
  await writeFile(
    stateFile,
    JSON.stringify({ ...state, arbitraryEnvironment: "not admitted" }),
  );
  await expect(discoverOwnerHost(options())).rejects.toThrow(
    /^owner_host_unavailable$/,
  );
});

it("rejects expired, replaced or missing process identities before returning a capability", async () => {
  await publishOwnerDiscovery(runtime, options());
  probe.mockResolvedValueOnce(
    identities.map((row, index) =>
      index === 0
        ? { ...row, created: new Date(clock - 1000).toISOString() }
        : row,
    ),
  );
  await expect(discoverOwnerHost(options())).rejects.toThrow(
    /^owner_host_unavailable$/,
  );
  probe.mockResolvedValueOnce(identities.slice(0, 2));
  await expect(discoverOwnerHost(options())).rejects.toThrow(
    /^owner_host_unavailable$/,
  );
  probe.mockClear();
  clock += 6 * 60 * 60 * 1000 + 1;
  await expect(discoverOwnerHost(options())).rejects.toThrow(
    /^owner_host_unavailable$/,
  );
  expect(probe).toHaveBeenCalledTimes(0);
  // An owner can still withdraw its expired record during shutdown.
  await clearOwnerDiscovery(runtime, options());
});

it("preserves a healthy other pointer, replaces a proved stale record, and does not let the old runtime clear the replacement", async () => {
  await publishOwnerDiscovery(runtime, options());
  const second = await fixture();
  await expect(publishOwnerDiscovery(second, options())).rejects.toThrow(
    /^owner_host_unavailable$/,
  );
  expect((await discoverOwnerHost(options())).runtime).toBe(runtime);
  clock += 6 * 60 * 60 * 1000 + 1;
  const replacement = await fixture();
  await publishOwnerDiscovery(replacement, options());
  await clearOwnerDiscovery(runtime, options());
  expect((await discoverOwnerHost(options())).runtime).toBe(replacement);
  await clearOwnerDiscovery(replacement, options());
});

it("refuses linked runtime paths, hardlinked or nonregular records and leaves outside files untouched", async () => {
  await publishOwnerDiscovery(runtime, options());
  const good = await readFile(pointer());
  const outside = join(temporary, "outside.json");
  await writeFile(outside, good);
  await rm(pointer());
  await link(outside, pointer());
  await expect(discoverOwnerHost(options())).rejects.toThrow(
    /^owner_host_unavailable$/,
  );
  await rm(pointer());
  // Junctions are available without Windows symlink privileges for directory tests.
  const linkedRuntime = join(temporary, "clipbuilder-owner-runtime-linked");
  await symlink(runtime, linkedRuntime, "junction");
  await writeFile(
    pointer(),
    JSON.stringify({
      ...JSON.parse(good.toString()),
      runtime: basename(linkedRuntime),
    }),
  );
  await expect(discoverOwnerHost(options())).rejects.toThrow(
    /^owner_host_unavailable$/,
  );
  expect(await readFile(outside)).toEqual(good);
  await writeFile(pointer(), good);
  const state = await readFile(join(runtime, "state.json"));
  await rm(join(runtime, "state.json"));
  await mkdir(join(runtime, "state.json"));
  await expect(discoverOwnerHost(options())).rejects.toThrow(
    /^owner_host_unavailable$/,
  );
  await rm(join(runtime, "state.json"), { recursive: true });
  await writeFile(join(runtime, "state.json"), state);
  // A pointer directory must also be rejected without traversing its contents.
  await rm(pointer());
  await mkdir(pointer());
  await writeFile(join(pointer(), "outside.txt"), "synthetic");
  await expect(discoverOwnerHost(options())).rejects.toThrow(
    /^owner_host_unavailable$/,
  );
  expect(await readFile(join(pointer(), "outside.txt"), "utf8")).toBe(
    "synthetic",
  );
});
