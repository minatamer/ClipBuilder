import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import {
  mkdtemp,
  mkdir,
  open,
  rm,
  stat,
  writeFile,
  lstat,
  realpath,
  type FileHandle,
} from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import type { BackendConfig } from "../src/config/env.schema.js";
import { ownerNativeTools } from "../../../scripts/native-tools.ts";
import {
  ownerProcessTree,
  forceOwnerTree,
} from "../../../scripts/local-processes.mjs";
import {
  publishOwnerDiscovery,
  clearOwnerDiscovery,
} from "../../../scripts/local-discovery.mjs";
import { nativeEnvironment } from "./local-mode.ts";
import { ownerAcquisitionTools } from "./acquisition-tools.ts";
import { createYtDlpAcquisitionPort } from "./yt-dlp-acquisition.ts";
import { createOwnerHost } from "./server.ts";
import { localWorkerPort } from "./worker-port.ts";
import { fakeOwnerAnalysis } from "./fake-analysis.ts";
import { fakeOwnerClipPreparation } from "./fake-clips.ts";
import { resolveOwnerStorage } from "./owner-storage.ts";
import { composeLocalCodex } from "./codex-composition.ts";
import { composeOwnerProviders } from "./provider-composition.ts";
import { localProviderReadiness } from "./provider-readiness.ts";
import { findLocalCodex } from "./codex-exec.ts";
import { localSpeechTools } from "../../../scripts/local-speech-tools.ts";
import { composeLocalCaptionProvider } from "./caption-provider-composition.ts";
import { LocalDiagnostics } from "./diagnostics.ts";

/** Explicit normal-backend lifecycle; imports never start a process or read env files. */
export async function startLocalWorkflow(
  config: BackendConfig,
  failed: () => void,
  diagnostics = new LocalDiagnostics(),
) {
  if (config.appEnv !== "local" || config.nodeEnv === "test") return null;
  return diagnostics.run("startup", () =>
    composeLocalWorkflow(config, failed, diagnostics),
  );
}
async function composeLocalWorkflow(
  config: BackendConfig,
  failed: () => void,
  diagnostics: LocalDiagnostics,
) {
  if (config.port !== 4000) throw new Error("local_backend_port_required");
  await diagnostics.run(
    "worker_port",
    () =>
      new Promise<void>((done, reject) => {
        const probe = createServer();
        probe.once("error", () =>
          reject(new Error("local_worker_port_in_use")),
        );
        probe.listen(4200, "127.0.0.1", () => probe.close(() => done()));
      }),
  );
  const repository = fileURLToPath(new URL("../../../", import.meta.url));
  const tools = await diagnostics.run("native_tools", () =>
    ownerNativeTools(repository),
  );
  const acquisition = await diagnostics.run("acquisition_tools", () =>
    ownerAcquisitionTools(
      repository,
      process.env.SystemRoot,
      AbortSignal.timeout(30_000),
    ),
  );
  const workerFile = resolve(repository, ".local-build/worker.mjs");
  const overlayBundle = resolve(repository, ".local-build/overlay");
  const chromium = "C:/Program Files/Google/Chrome/Application/chrome.exe";
  await diagnostics.run("worker_files", async () => {
    for (const file of [
      workerFile,
      join(overlayBundle, "index.html"),
      chromium,
    ])
      await stat(file);
  });
  const storageRoot = await diagnostics.run("storage", () =>
    resolveOwnerStorage(),
  );
  const desktopStorageRoot = await resolveOwnerStorage("desktop").catch(
    (error: unknown) => {
      diagnostics.failure("storage", error);
      return undefined;
    },
  );
  const runtime = await mkdtemp(join(tmpdir(), "clipbuilder-local-runtime-"));
  // Read local prerequisites only in normal real composition; no CLI auth or
  // inference occurs during startup, and fake mode never loads a speech model.
  const speech =
    config.providerMode === "live" && config.aiProvider === "codex"
      ? await localSpeechTools(repository).catch(() => undefined)
      : undefined;
  const codex =
    config.providerMode === "live" && config.aiProvider === "codex"
      ? await findLocalCodex()
      : null;
  const root = join(runtime, "workspaces");
  const state = {
    root,
    token: randomBytes(32).toString("hex"),
    workerToken: randomBytes(32).toString("hex"),
    tools,
    overlayBundle,
    chromium,
    storageRoot,
    ...(speech ? { speech } : {}),
  };
  const stateFile = join(runtime, "state.json");
  const clearScratch = async () => {
    if (resolve(root, "..") !== runtime)
      throw new Error("local_cleanup_path_invalid");
    let info;
    try {
      info = await lstat(root);
    } catch (error) {
      if (!(
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      ))
        throw error;
    }
    if (info) {
      if (info.isSymbolicLink() || (await realpath(root)) !== root)
        throw new Error("local_cleanup_path_invalid");
      await rm(root, { recursive: true, force: true });
    }
    await rm(stateFile, { force: true });
  };
  let stdout: FileHandle | undefined;
  let stderr: FileHandle | undefined;
  try {
    await mkdir(root, { mode: 0o700 });
    await writeFile(stateFile, JSON.stringify(state), {
      flag: "wx",
      mode: 0o600,
    });
    stdout = await open(join(runtime, "worker.stdout.log"), "a", 0o600);
    stderr = await open(join(runtime, "worker.stderr.log"), "a", 0o600);
  } catch {
    try {
      await stdout?.close();
    } finally {
      await stderr?.close();
      await clearScratch();
    }
    throw new Error("local_runtime_record_unavailable");
  }
  const worker = diagnostics.check("worker_spawn", () =>
    spawn(process.execPath, [workerFile], {
      windowsHide: true,
      env: {
        ...nativeEnvironment(runtime),
        CLIPBUILDER_LOCAL_STATE: stateFile,
      },
      stdio: ["ignore", stdout!.fd, stderr!.fd, "ipc"],
    }),
  );
  let host: ReturnType<typeof createOwnerHost> | undefined;
  let identity: { pid: number; parent: number; created: string } | undefined;
  let stopping: Promise<void> | undefined;
  let workerError = false;
  worker.on("error", (error) => {
    diagnostics.failure("worker_spawn", error);
    workerError = true;
    failed();
  });
  worker.once("exit", (code, signal) => {
    if (!stopping) {
      diagnostics.failure(
        "worker_exit",
        Object.assign(new Error("local_worker_unavailable"), { code, signal }),
      );
      failed();
    }
  });
  const close = () => {
    stopping ??= (async () => {
      let cleanupFailed = false;
      const attempt = async (operation: () => Promise<unknown>) => {
        try {
          await operation();
        } catch (error) {
          diagnostics.failure("cleanup", error);
          cleanupFailed = true;
        }
      };
      await attempt(() => clearOwnerDiscovery(runtime));
      await attempt(async () => {
        await host?.close();
      });
      let workerStopped =
        worker.exitCode !== null || worker.signalCode !== null || workerError;
      await attempt(async () => {
        if (
          worker.exitCode === null &&
          worker.signalCode === null &&
          !workerError
        ) {
          const exited = new Promise<void>((done) =>
            worker.once("exit", () => done()),
          );
          let timer: ReturnType<typeof setTimeout> | undefined;
          try {
            if (worker.connected) worker.send("stop");
            else worker.kill("SIGTERM");
            const timedOut = await Promise.race([
              exited.then(() => false),
              new Promise<boolean>((done) => {
                timer = setTimeout(() => done(true), 15_000);
              }),
            ]);
            if (timedOut) {
              await forceOwnerTree(worker, identity);
              await exited;
            }
          } finally {
            clearTimeout(timer);
          }
        }
        workerStopped = true;
      });
      await attempt(() => stdout!.close());
      await attempt(() => stderr!.close());
      // Preserve the scratch and capability record for recovery if the child did not drain.
      if (!workerStopped) throw new Error("local_cleanup_requires_recovery");
      await attempt(clearScratch);
      if (cleanupFailed) throw new Error("local_cleanup_requires_recovery");
    })();
    return stopping;
  };
  try {
    [identity] = await diagnostics.run("worker_identity", () =>
      ownerProcessTree(worker.pid),
    );
    if (!identity) throw new Error("local_worker_identity_missing");
    await diagnostics.run("worker_ready", async () => {
      let ready = false;
      for (let attempt = 0; attempt < 50; attempt++) {
        if (workerError || worker.exitCode !== null) break;
        try {
          const response = await fetch("http://127.0.0.1:4200/health", {
            headers: { Authorization: `Bearer ${state.workerToken}` },
            signal: AbortSignal.timeout(1000),
          });
          ready = response.ok;
          await response.body?.cancel();
        } catch {
          /* Bounded readiness probe, no media or provider requests. */
        }
        if (ready) break;
        await new Promise((done) => setTimeout(done, 100));
      }
      if (!ready) throw new Error("local_worker_unavailable");
    });
    const media = localWorkerPort(
      4200,
      state.workerToken,
      undefined,
      diagnostics,
    );
    host = createOwnerHost({
      root,
      diagnostics,
      token: state.token,
      port: 4000,
      frontendOrigin: config.frontendOrigin,
      storageRoot: state.storageRoot,
      ...(desktopStorageRoot ? { desktopStorageRoot } : {}),
      media,
      acquisition: createYtDlpAcquisitionPort({
        scratchRoot: root,
        tools: acquisition,
      }),
      providers: (files) => {
        if (config.providerMode === "live" && config.aiProvider === "codex")
          return composeLocalCodex({
            enabled: config.paidDemoEnabled,
            executable: codex,
            speechReady: !!speech?.speakers,
            root,
            files,
            media,
            diagnostics,
          });
        const normal =
          config.providerMode === "fake"
            ? {
                analysis: fakeOwnerAnalysis,
                clipPreparation: fakeOwnerClipPreparation,
              }
            : composeOwnerProviders(
                localProviderReadiness(config),
                files,
                media,
                undefined,
                diagnostics,
              );
        if (config.aiProvider === "codex")
          return {
            ...normal,
            localAi: {
              aiProvider: "codex",
              aiSetup: "disabled",
              captionProvider: "local-speech",
            },
          };
        if ("captionTranscription" in normal) return normal;
        return {
          ...normal,
          ...composeLocalCaptionProvider(config, files, media, diagnostics),
        };
      },
    });
    return {
      dispatch: host.dispatch,
      close,
      runtime,
      async publish() {
        return diagnostics.run("discovery", async () => {
          const tree = await ownerProcessTree(process.pid);
          const supervisor = tree.find(
            (row: { pid: number }) => row.pid === process.pid,
          );
          if (!supervisor) throw new Error("local_process_identity_missing");
          await writeFile(
            join(runtime, "processes.json"),
            JSON.stringify({
              supervisor: process.pid,
              startedAt: new Date().toISOString(),
              identities: [supervisor, identity],
              ports: [4000, 4200],
            }),
            { flag: "wx", mode: 0o600 },
          );
          await publishOwnerDiscovery(runtime);
        });
      },
    };
  } catch (error) {
    await close();
    throw error;
  }
}
