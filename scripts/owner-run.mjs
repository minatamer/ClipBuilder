import { randomBytes } from "node:crypto";
import { createServer } from "node:net";
import { spawn } from "node:child_process";
import {
  mkdtemp,
  mkdir,
  open,
  realpath,
  lstat,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import {
  nativeEnvironment,
  assertOwnerFakeMode,
} from "../apps/backend/owner/local-mode.ts";
import { ownerProcessTree, forceOwnerTree } from "./owner-processes.mjs";
import { ownerNativeTools } from "../apps/renderer/owner/native-tools.ts";

assertOwnerFakeMode(process.env);
for (const port of [4100, 4200])
  await new Promise((done, fail) => {
    const probe = createServer();
    probe.once("error", () => fail(new Error("owner_port_in_use")));
    probe.listen(port, "127.0.0.1", () => probe.close(done));
  });
const tools = await ownerNativeTools(resolve("."));
for (const file of [
  ...Object.values(tools),
  resolve(".owner-build/server.mjs"),
  resolve(".owner-build/worker.mjs"),
  resolve(".owner-build/overlay/index.html"),
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
])
  await stat(file);
const runtime = await mkdtemp(join(tmpdir(), "clipbuilder-owner-runtime-"));
const root = join(runtime, "workspaces");
await mkdir(root, { mode: 0o700 });
const stateFile = join(runtime, "state.json");
const state = {
  root,
  ui: resolve(".owner-build/ui"),
  token: randomBytes(32).toString("hex"),
  workerToken: randomBytes(32).toString("hex"),
  tools,
  overlayBundle: resolve(".owner-build/overlay"),
  chromium: "C:/Program Files/Google/Chrome/Application/chrome.exe",
};
await writeFile(stateFile, JSON.stringify(state), { flag: "wx", mode: 0o600 });
const children = [];
const identities = new Map();
const logs = [];
let stopping;
const stopSafely = () => {
  void stop().catch(() => {
    process.stderr.write("owner_cleanup_requires_recovery\n");
    process.exitCode = 1;
  });
};
async function stop() {
  if (stopping) return stopping;
  stopping = (async () => {
    // Stop host first. It cancels/drains worker RPCs before deleting scratch.
    for (const child of [...children].reverse()) {
      if (child.exitCode !== null || child.signalCode !== null) continue;
      await new Promise((done, fail) => {
        const timer = setTimeout(() => {
          void forceOwnerTree(child, identities.get(child.pid)).catch(fail);
        }, 15_000);
        child.once("exit", () => {
          clearTimeout(timer);
          done();
        });
        if (child.connected) child.send("stop");
        else child.kill("SIGTERM");
      });
    }
    for (const log of logs) await log.close();
    // Keep content-safe logs; remove the private capability and owned media scratch.
    if (
      (await realpath(root)) !== join(await realpath(runtime), "workspaces") ||
      (await lstat(root)).isSymbolicLink()
    )
      throw new Error("owner_cleanup_path_invalid");
    await rm(root, { recursive: true, force: true });
    await rm(stateFile, { force: true });
  })();
  return stopping;
}
process.once("SIGINT", stopSafely);
process.once("SIGTERM", stopSafely);
try {
  for (const [name, port, token] of [
    ["worker", 4200, state.workerToken],
    ["server", 4100, state.token],
  ]) {
    const stdout = await open(join(runtime, `${name}.stdout.log`), "a", 0o600);
    const stderr = await open(join(runtime, `${name}.stderr.log`), "a", 0o600);
    logs.push(stdout, stderr);
    const child = spawn(
      process.execPath,
      [resolve(`.owner-build/${name}.mjs`)],
      {
        windowsHide: true,
        env: { ...nativeEnvironment(root), CLIPBUILDER_OWNER_STATE: stateFile },
        stdio: ["ignore", stdout.fd, stderr.fd, "ipc"],
      },
    );
    children.push(child);
    child.on("message", (message) => {
      if (message === "stop") stopSafely();
    });
    const [identity] = await ownerProcessTree(child.pid);
    if (!identity) throw new Error("owner_process_identity_missing");
    identities.set(child.pid, identity);
    child.once("error", stopSafely);
    let ready = false;
    for (let attempt = 0; attempt < 50; attempt++) {
      if (child.exitCode !== null) break;
      try {
        ready = (
          await fetch(`http://127.0.0.1:${port}/health`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: AbortSignal.timeout(1000),
          })
        ).ok;
      } catch {
        /* Startup only; no processing retry. */
      }
      if (ready) break;
      await new Promise((done) => setTimeout(done, 100));
    }
    if (!ready) throw new Error("owner_start_failed");
  }
  await writeFile(
    join(runtime, "processes.json"),
    JSON.stringify({
      supervisor: process.pid,
      startedAt: new Date().toISOString(),
      identities: await ownerProcessTree(process.pid),
      ports: [4100, 4200],
    }),
    { mode: 0o600 },
  );
  process.stdout.write(
    `Local owner: http://localhost:4100\nContent-safe runtime logs: ${runtime}\n`,
  );
  await Promise.race(
    children.map((child) => new Promise((done) => child.once("exit", done))),
  );
  if (!stopping) process.exitCode = 1;
} catch {
  process.stderr.write("Owner runtime unavailable; check content-safe logs.\n");
  process.exitCode = 1;
} finally {
  try {
    await stop();
  } catch {
    process.stderr.write("owner_cleanup_requires_recovery\n");
    process.exitCode = 1;
  }
}
