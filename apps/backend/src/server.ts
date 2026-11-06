import { composeBackend } from "./composition.js";
import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ANALYSIS_DIAGNOSTIC_VERSION,
  AnalysisDiagnostics,
} from "./analysis/analysis.diagnostics.js";
import { CANDIDATE_GENERATION_SCHEMA_POLICY } from "./analysis/analysis.provider-shape.js";
import { composeLocalGeminiCapture } from "./analysis/gemini.local-capture.js";
import { startLocalWorkflow } from "../local/runtime.ts";
import { LocalDiagnostics } from "../local/diagnostics.ts";
import { startHostedEditingWorkflow } from "../local/hosted-runtime.ts";
import { ZodError } from "zod";
import { ENVIRONMENT_KEYS } from "./config/env.schema.js";
import { createLocalDiagnosticLog } from "../local/diagnostic-log.ts";

// Only the executable entry point loads owner-managed local configuration.
function loadLocalEnvironment(): void {
  const localEnvironment = fileURLToPath(
    new URL("../.env.local", import.meta.url),
  );
  if (
    process.env.NODE_ENV !== "test" &&
    (process.env.APP_ENV === undefined || process.env.APP_ENV === "local") &&
    existsSync(localEnvironment)
  )
    process.loadEnvFile(localEnvironment);
}

export async function startBackend(environment: NodeJS.ProcessEnv) {
  let diagnosticLog: ReturnType<typeof createLocalDiagnosticLog> | undefined;
  const warn = (line: string) => {
    try {
      console.warn(line);
    } catch {
      /* Detached or broken console. */
    }
  };
  const writeDiagnostic = (line: string) => {
    diagnosticLog?.write(line);
    warn(line);
  };
  const diagnostics = new AnalysisDiagnostics(writeDiagnostic);
  const localDiagnostics = new LocalDiagnostics(writeDiagnostic);
  const { application, config, localWorkflow, hostedWorkflow } = composeBackend(
    environment,
    diagnostics,
  );
  if (config.appEnv === "local" && config.nodeEnv !== "test") {
    try {
      diagnosticLog = createLocalDiagnosticLog(
        mkdtempSync(join(tmpdir(), "clipbuilder-backend-diagnostics-")),
        (error) => {
          localDiagnostics.failure("storage", error);
          warn(
            "ClipBuilder durable diagnostics unavailable; stderr remains active",
          );
        },
      );
    } catch (error) {
      localDiagnostics.failure("storage", error);
      warn(
        "ClipBuilder durable diagnostics unavailable; stderr remains active",
      );
    }
  }
  const closeDiagnosticLog = () => diagnosticLog?.close();
  if (diagnosticLog) process.once("exit", closeDiagnosticLog);
  let stopLocalFailure = () => {
    process.exitCode = 1;
  };
  const local = await startLocalWorkflow(
    config,
    () => stopLocalFailure(),
    localDiagnostics,
  );
  localWorkflow.current = local;
  const hosted = await startHostedEditingWorkflow(
    config,
    localDiagnostics,
    () => stopLocalFailure(),
  );
  hostedWorkflow.current = hosted;
  let editingClose: Promise<void> | undefined,
    localClose: Promise<void> | undefined;
  const closeEditing = () =>
    (editingClose ??= (async () => {
      hostedWorkflow.current = null;
      await hosted?.close();
    })());
  const closeLocal = () =>
    (localClose ??= (async () => {
      localWorkflow.current = null;
      await local?.close();
    })());
  const privateCapture = composeLocalGeminiCapture(
    config,
    undefined,
    undefined,
    () => console.warn("ClipBuilder private Gemini capture unavailable"),
  );
  diagnostics.enablePrivateCapture(privateCapture);
  if (config.processingUnavailableReasons.length)
    console.warn(
      `ClipBuilder paid processing unavailable: ${config.processingUnavailableReasons.join(", ")}`,
    );

  const host = config.appEnv === "local" ? "127.0.0.1" : "0.0.0.0";
  const server = application.listen(config.port, host, () => {
    console.warn(`ClipBuilder backend listening on ${host}:${config.port}`);
    console.warn(
      "ClipBuilder analysis diagnostics v" +
        ANALYSIS_DIAGNOSTIC_VERSION +
        " ready",
    );
    console.warn(
      `ClipBuilder Gemini analysis schema policy ${CANDIDATE_GENERATION_SCHEMA_POLICY} ready`,
    );
    console.warn("ClipBuilder reconciliation diagnostics ready");
    console.warn("ClipBuilder renderer diagnostics ready");
    console.warn("ClipBuilder candidate decoding array_or_envelope ready");
    console.warn(
      privateCapture?.isArmed()
        ? "ClipBuilder private Gemini response capture armed"
        : "ClipBuilder private Gemini response capture off",
    );
  });

  function stopServer(signal: NodeJS.Signals): void {
    console.warn(`ClipBuilder backend received ${signal}; shutting down`);
    localWorkflow.current = null;
    void closeEditing().catch((error) =>
      localDiagnostics.failure("cleanup", error),
    );
    void closeLocal().catch((error: unknown) => {
      localDiagnostics.failure("cleanup", error);
      process.exitCode = 1;
    });
    server.close((error) => {
      if (error) {
        localDiagnostics.failure("cleanup", error);
        console.error("ClipBuilder backend failed to close cleanly");
        process.exitCode = 1;
      }
    });
  }
  stopLocalFailure = () => stopServer("SIGTERM");
  server.once("error", (error) => {
    void closeEditing().catch((error) =>
      localDiagnostics.failure("cleanup", error),
    );
    localDiagnostics.failure("startup", error);
    localWorkflow.current = null;
    void closeLocal().catch((error: unknown) => {
      localDiagnostics.failure("cleanup", error);
      process.exitCode = 1;
    });
    process.exitCode = 1;
  });
  if (local) {
    try {
      await new Promise<void>((done, reject) => {
        server.once("listening", done);
        server.once("error", reject);
      });
      await local.publish();
      console.warn(
        `ClipBuilder local media ready; content-safe logs: ${local.runtime}`,
      );
    } catch {
      await closeLocal();
      server.closeAllConnections();
      server.close();
      throw new Error("local_workflow_unavailable");
    }
  }

  const interrupt = () => stopServer("SIGINT");
  const terminate = () => stopServer("SIGTERM");
  process.once("SIGINT", interrupt);
  process.once("SIGTERM", terminate);
  server.once("close", () => {
    const editingStopped = closeEditing().catch((error) =>
      localDiagnostics.failure("cleanup", error),
    );
    localWorkflow.current = null;
    const localStopped = closeLocal().catch((error: unknown) => {
      localDiagnostics.failure("cleanup", error);
      process.exitCode = 1;
    });
    void Promise.allSettled([editingStopped, localStopped]).then(() => {
      closeDiagnosticLog();
      process.removeListener("exit", closeDiagnosticLog);
    });
    process.removeListener("SIGINT", interrupt);
    process.removeListener("SIGTERM", terminate);
  });
  return server;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void (async () => {
    loadLocalEnvironment();
    await startBackend(process.env);
  })().catch((error: unknown) => {
    if (error instanceof ZodError) {
      const fields = [...ENVIRONMENT_KEYS, "NODE_ENV", "PORT"].filter((key) =>
        error.issues.some((issue) => issue.path[0] === key),
      );
      if (fields.length)
        console.warn(
          `ClipBuilder startup configuration invalid fields: ${fields.join(", ")}`,
        );
    }
    new LocalDiagnostics((line) => console.warn(line)).failure(
      "startup",
      error,
    );
    console.error(
      "ClipBuilder backend startup unavailable; check local prerequisites",
    );
    process.exitCode = 1;
  });
}
