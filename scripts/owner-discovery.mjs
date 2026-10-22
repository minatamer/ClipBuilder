import { randomUUID } from "node:crypto";
import { lstat, open, realpath, rename, rm } from "node:fs/promises";
import {
  basename,
  isAbsolute,
  join,
  parse,
  relative,
  resolve,
  sep,
} from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { ownerProcessTree } from "./owner-processes.mjs";

const POINTER = "clipbuilder-owner-active.json";
const RUNTIME = /^clipbuilder-owner-runtime-[A-Za-z0-9_-]{6,64}$/u;
const TOKEN = /^[a-f0-9]{64}$/u;
const MAX_AGE = 6 * 60 * 60 * 1000;
const repository = resolve(fileURLToPath(new URL("..", import.meta.url)));
const error = (code = "owner_discovery_invalid") => new Error(code);
const missing = (cause) => cause?.code === "ENOENT";
const inside = (root, target) => {
  const rel = relative(root, target);
  return (
    !rel || (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`))
  );
};
const shape = (value, required, optional = []) => {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    required.some((key) => !Object.hasOwn(value, key)) ||
    Object.keys(value).some((key) => ![...required, ...optional].includes(key))
  )
    throw error();
  return value;
};
const date = (value) => {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3,7}Z$/u.test(value) ||
    !Number.isFinite(Date.parse(value))
  )
    throw error();
  return value;
};
const identity = (value) => {
  shape(value, ["pid", "parent", "created"]);
  if (
    !Number.isSafeInteger(value.pid) ||
    value.pid < 1 ||
    !Number.isSafeInteger(value.parent) ||
    value.parent < 0
  )
    throw error();
  date(value.created);
  return value;
};
const sameIdentity = (first, second) =>
  first.pid === second.pid &&
  first.parent === second.parent &&
  first.created === second.created;
const pathValue = (value) =>
  typeof value === "string" &&
  value.length <= 4096 &&
  isAbsolute(value) &&
  Array.from(value).every((character) => character.charCodeAt(0) >= 32);

async function noLinks(path, directory) {
  const info = await lstat(path);
  if (
    info.isSymbolicLink() ||
    (directory ? !info.isDirectory() : !info.isFile() || info.nlink !== 1)
  )
    throw error();
  return info;
}

async function context(options = {}) {
  if (
    Object.keys(options).length &&
    (process.env.NODE_ENV !== "test" ||
      process.env.FAKE_MODE !== "true" ||
      process.env.PAID_DEMO_ENABLED !== "false")
  )
    throw error();
  const requested = resolve(options.temporaryRoot ?? tmpdir());
  let cursor = parse(requested).root;
  for (const part of relative(cursor, requested).split(sep).filter(Boolean)) {
    cursor = resolve(cursor, part);
    await noLinks(cursor, true);
  }
  const temporary = await realpath(requested);
  if (inside(repository, temporary)) throw error();
  return {
    temporary,
    pointer: join(temporary, POINTER),
    probe: options.probe ?? ownerProcessTree,
    now: options.now ?? (() => Date.now()),
  };
}

/** Read into a fixed buffer, rejecting links and replacement while the file is open. */
async function document(path, maximum) {
  const before = await noLinks(path, false);
  if (before.size < 2 || before.size > maximum) throw error();
  const handle = await open(path, "r");
  try {
    const opened = await handle.stat();
    if (opened.dev !== before.dev || opened.ino !== before.ino) throw error();
    const bytes = Buffer.alloc(maximum + 1);
    let length = 0;
    for (;;) {
      const read = await handle.read(
        bytes,
        length,
        bytes.length - length,
        null,
      );
      length += read.bytesRead;
      if (length > maximum) throw error();
      if (read.bytesRead === 0) break;
    }
    const after = await noLinks(path, false);
    if (
      after.dev !== before.dev ||
      after.ino !== before.ino ||
      after.size !== before.size ||
      after.mtimeMs !== before.mtimeMs ||
      after.ctimeMs !== before.ctimeMs
    )
      throw error();
    return JSON.parse(bytes.subarray(0, length).toString("utf8"));
  } finally {
    await handle.close();
  }
}

function pointerRecord(value) {
  shape(value, ["version", "runtime", "supervisor", "publishedAt"]);
  if (
    value.version !== 1 ||
    typeof value.runtime !== "string" ||
    !RUNTIME.test(value.runtime)
  )
    throw error();
  identity(value.supervisor);
  date(value.publishedAt);
  return value;
}

async function runtimeDirectory(ctx, name) {
  if (!RUNTIME.test(name)) throw error();
  const runtime = join(ctx.temporary, name);
  await noLinks(runtime, true);
  if ((await realpath(runtime)) !== runtime || inside(repository, runtime))
    throw error();
  return runtime;
}

async function readRuntime(ctx, runtime) {
  const ledger = await document(join(runtime, "processes.json"), 64 * 1024);
  shape(ledger, ["supervisor", "startedAt", "identities", "ports"]);
  if (
    !Number.isSafeInteger(ledger.supervisor) ||
    ledger.supervisor < 1 ||
    !Array.isArray(ledger.identities) ||
    ledger.identities.length !== 3 ||
    !Array.isArray(ledger.ports) ||
    ledger.ports.length !== 2 ||
    ledger.ports[0] !== 4100 ||
    ledger.ports[1] !== 4200
  )
    throw error();
  date(ledger.startedAt);
  const rows = ledger.identities.map(identity);
  if (new Set(rows.map((row) => row.pid)).size !== rows.length) throw error();
  const supervisor = rows.find((row) => row.pid === ledger.supervisor);
  if (
    !supervisor ||
    rows
      .filter((row) => row.pid !== supervisor.pid)
      .some((row) => row.parent !== supervisor.pid)
  )
    throw error();
  const age = ctx.now() - Date.parse(ledger.startedAt);
  if (!Number.isFinite(age) || age < -60_000 || age > MAX_AGE)
    throw error("owner_discovery_stale");
  const current = await ctx.probe(supervisor.pid);
  if (
    !Array.isArray(current) ||
    rows.some((row) => !current.some((live) => sameIdentity(row, live)))
  )
    throw error("owner_discovery_stale");
  const state = await document(join(runtime, "state.json"), 64 * 1024);
  shape(
    state,
    [
      "root",
      "ui",
      "token",
      "workerToken",
      "tools",
      "overlayBundle",
      "chromium",
    ],
    ["storageRoot", "desktopStorageRoot"],
  );
  shape(state.tools, ["ffmpeg", "ffprobe"]);
  if (
    !TOKEN.test(state.token) ||
    !TOKEN.test(state.workerToken) ||
    state.token === state.workerToken ||
    ![
      state.root,
      state.ui,
      state.overlayBundle,
      state.chromium,
      state.tools.ffmpeg,
      state.tools.ffprobe,
    ].every(pathValue) ||
    (state.storageRoot !== undefined && !pathValue(state.storageRoot)) ||
    (state.desktopStorageRoot !== undefined &&
      !pathValue(state.desktopStorageRoot)) ||
    state.root !== join(runtime, "workspaces")
  )
    throw error();
  await noLinks(state.root, true);
  if ((await realpath(state.root)) !== state.root) throw error();
  return { supervisor, token: state.token };
}

async function validatePointer(ctx, pointer) {
  const age = ctx.now() - Date.parse(pointer.publishedAt);
  if (!Number.isFinite(age) || age < -60_000 || age > MAX_AGE)
    throw error("owner_discovery_stale");
  const runtime = await runtimeDirectory(ctx, pointer.runtime);
  const owned = await readRuntime(ctx, runtime);
  if (!sameIdentity(owned.supervisor, pointer.supervisor))
    throw error("owner_discovery_stale");
  return { token: owned.token, runtime };
}

/** Optional explicit filesystem/process ports exist only for isolated synthetic checks. */
export async function discoverOwnerHost(options) {
  try {
    const ctx = await context(options);
    const pointer = pointerRecord(await document(ctx.pointer, 2048));
    const host = await validatePointer(ctx, pointer);
    const current = pointerRecord(await document(ctx.pointer, 2048));
    if (JSON.stringify(current) !== JSON.stringify(pointer)) throw error();
    return host;
  } catch {
    throw error("owner_host_unavailable");
  }
}

/** Called only after both fixed listeners are ready and their stable ledger is durable. */
export async function publishOwnerDiscovery(runtime, options) {
  let temporary;
  try {
    const ctx = await context(options);
    const directory = await runtimeDirectory(ctx, basename(runtime));
    if (resolve(runtime) !== directory) throw error();
    const owned = await readRuntime(ctx, directory);
    if (owned.supervisor.pid !== process.pid) throw error();
    try {
      const old = pointerRecord(await document(ctx.pointer, 2048));
      if (
        old.runtime !== basename(directory) ||
        !sameIdentity(old.supervisor, owned.supervisor)
      ) {
        try {
          await validatePointer(ctx, old);
          throw error("owner_discovery_conflict");
        } catch (cause) {
          if (!missing(cause) && cause.message !== "owner_discovery_stale")
            throw cause;
        }
      }
    } catch (cause) {
      if (!missing(cause)) throw cause;
    }
    const pointer = {
      version: 1,
      runtime: basename(directory),
      supervisor: owned.supervisor,
      publishedAt: new Date(ctx.now()).toISOString(),
    };
    temporary = join(ctx.temporary, `${POINTER}.${randomUUID()}.tmp`);
    const handle = await open(temporary, "wx", 0o600);
    try {
      await handle.writeFile(JSON.stringify(pointer));
      await handle.sync();
    } finally {
      await handle.close();
    }
    await rename(temporary, ctx.pointer);
  } catch {
    throw error("owner_host_unavailable");
  } finally {
    if (temporary)
      await rm(temporary, { force: true }).catch(() => {
        throw error("owner_host_unavailable");
      });
  }
}

/** A different or malformed pointer is preserved; only this launcher's identity is removed. */
export async function clearOwnerDiscovery(runtime, options) {
  try {
    const ctx = await context(options);
    const pointer = pointerRecord(await document(ctx.pointer, 2048));
    if (
      pointer.runtime !== basename(runtime) ||
      pointer.supervisor.pid !== process.pid
    )
      return;
    const directory = await runtimeDirectory(ctx, pointer.runtime);
    if (resolve(runtime) !== directory) throw error();
    const ledger = await document(join(directory, "processes.json"), 64 * 1024);
    const supervisor =
      Array.isArray(ledger.identities) &&
      ledger.identities.find((row) => row.pid === process.pid);
    if (!supervisor || !sameIdentity(pointer.supervisor, identity(supervisor)))
      throw error();
    await rm(ctx.pointer);
  } catch (cause) {
    if (!missing(cause)) throw error("owner_host_unavailable");
  }
}
