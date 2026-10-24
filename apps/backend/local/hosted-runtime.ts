import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdtemp, mkdir, stat, statfs, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { BackendConfig } from "../src/config/env.schema.js";
import { composeAbuseVerifier } from "../src/admission/turnstile.verifier.js";
import {
  createHostedEditingWorkflow,
  HOSTED_EDITING_POLICY,
} from "./hosted-workflow.ts";
import { composeOwnerProviders } from "./provider-composition.ts";
import { localWorkerPort } from "./worker-port.ts";
import { nativeEnvironment } from "./local-mode.ts";
import { LocalDiagnostics } from "./diagnostics.ts";

/** Explicit executable composition only. Hosted imports/tests never spawn media. */
export function hostedEditingReady(config: BackendConfig) {
  return (
    config.appEnv === "production" &&
    config.nodeEnv !== "test" &&
    config.providerMode === "live" &&
    config.paidDemoEnabled &&
    config.publicPaidProcessingApproved &&
    config.admission.grantsEnabled &&
    config.admission.maxProcessDispatches > 0 &&
    config.features.liveAnalysis &&
    config.features.liveAssembly &&
    config.features.liveRender &&
    config.features.liveImageGeneration &&
    config.renderer.spendApproved &&
    Boolean(
      config.gemini.apiKey &&
      config.turnstile.siteKey &&
      config.turnstile.secretKey &&
      config.turnstile.expectedHostname,
    ) &&
    config.gemini.transferApproved &&
    config.gemini.paidProjectConfirmed &&
    config.gemini.imageGenerationApproved
  );
}
export async function startHostedEditingWorkflow(
  config: BackendConfig,
  diagnostics = new LocalDiagnostics(),
  failed = () => {},
) {
  if (!hostedEditingReady(config)) return null;
  if (process.platform !== "linux" || process.arch !== "x64")
    throw new Error("hosted_native_platform_unavailable");
  // These are fixed image-owned inputs, never environment paths or runtime downloads.
  const workerFile = "/app/media/dist/editing-worker.js",
    overlayBundle = "/app/media/editing-overlay",
    chromium = "/usr/bin/chromium";
  const tools = { ffmpeg: "/usr/bin/ffmpeg", ffprobe: "/usr/bin/ffprobe" };
  for (const file of [
    workerFile,
    join(overlayBundle, "index.html"),
    chromium,
    tools.ffmpeg,
    tools.ffprobe,
  ])
    await stat(file);
  const runtime = await mkdtemp(join(tmpdir(), "clipbuilder-editing-")),
    root = join(runtime, "workspaces");
  await mkdir(root);
  const workerToken = randomBytes(32).toString("hex"),
    state = join(runtime, "worker.json");
  await writeFile(
    state,
    JSON.stringify({ root, workerToken, tools, overlayBundle, chromium }),
    { flag: "wx", mode: 0o600 },
  );
  const worker = spawn(process.execPath, [workerFile], {
    windowsHide: true,
    stdio: ["ignore", "ignore", "inherit", "ipc"],
    env: { ...nativeEnvironment(runtime), CLIPBUILDER_LOCAL_STATE: state },
  });
  let workerError = false;
  worker.once("error", () => {
    workerError = true;
  });
  const exited = new Promise<void>((resolve) =>
    worker.once("close", () => resolve()),
  );
  let stopping = false,
    closing: Promise<void> | undefined;
  worker.once("close", () => {
    if (!stopping) failed();
  });
  let workflow: ReturnType<typeof createHostedEditingWorkflow> | undefined;
  const close = () =>
    (closing ??= (async () => {
      stopping = true;
      await workflow?.close();
      if (worker.connected) worker.send("stop");
      const force = setTimeout(() => worker.kill("SIGKILL"), 5000);
      await exited;
      clearTimeout(force);
      await rm(runtime, { recursive: true, force: true });
    })());
  try {
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      if (workerError || worker.exitCode !== null)
        throw new Error("hosted_worker_unavailable");
      try {
        const response = await fetch("http://127.0.0.1:4200/health", {
          headers: { Authorization: "Bearer " + workerToken },
          signal: AbortSignal.timeout(500),
        });
        await response.body?.cancel();
        if (response.ok) {
          ready = true;
          break;
        }
      } catch {
        /* bounded startup poll */
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!ready) throw new Error("hosted_worker_unavailable");
    const media = localWorkerPort(4200, workerToken, undefined, diagnostics);
    workflow = createHostedEditingWorkflow({
      root,
      origin: config.frontendOrigin,
      ttlMs: config.session.accessTtlSeconds * 1000,
      siteKey: config.turnstile.siteKey!,
      aiMode: "provider-ai",
      providerCalls: config.admission.maxProcessDispatches,
      sourceLimits: {
        bytes: config.limits.sourceBytes,
        durationMs: config.limits.sourceSeconds * 1000,
      },
      abuse: composeAbuseVerifier(config),
      diagnostics,
      media,
      async capacity(directory, peak) {
        const disk = await statfs(directory);
        if (
          peak < 0 ||
          peak > HOSTED_EDITING_POLICY.scratchBytes ||
          disk.bavail * disk.bsize - peak < HOSTED_EDITING_POLICY.reserveBytes
        )
          throw new Error("disk_unavailable");
      },
      providers: (files) =>
        composeOwnerProviders(
          {
            ready: true,
            config: {
              nodeEnv: config.nodeEnv,
              providerMode: config.providerMode,
              paidDemoEnabled: config.paidDemoEnabled,
              features: { liveAnalysis: true, liveAssembly: true },
              gemini: config.gemini,
            },
          },
          files,
          media,
          undefined,
          diagnostics,
        ),
    });
    return { dispatch: workflow.dispatch, close };
  } catch (error) {
    await close();
    throw error;
  }
}
