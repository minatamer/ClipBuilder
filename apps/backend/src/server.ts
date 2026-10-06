import { composeBackend } from "./composition.js";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  ANALYSIS_DIAGNOSTIC_VERSION,
  AnalysisDiagnostics,
} from "./analysis/analysis.diagnostics.js";
import { CANDIDATE_GENERATION_SCHEMA_POLICY } from "./analysis/analysis.provider-shape.js";
import { composeLocalGeminiCapture } from "./analysis/gemini.local-capture.js";

// Only the executable entry point loads owner-managed local configuration.
const localEnvironment = fileURLToPath(
  new URL("../.env.local", import.meta.url),
);
if (
  process.env.NODE_ENV !== "test" &&
  (process.env.APP_ENV === undefined || process.env.APP_ENV === "local") &&
  existsSync(localEnvironment)
)
  process.loadEnvFile(localEnvironment);

const diagnostics = new AnalysisDiagnostics((line) => console.warn(line));
const { application, config } = composeBackend(process.env, diagnostics);
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

const server = application.listen(config.port, "127.0.0.1", () => {
  console.warn(`ClipBuilder backend listening on 127.0.0.1:${config.port}`);
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
  server.close((error) => {
    if (error) {
      console.error("ClipBuilder backend failed to close cleanly");
      process.exitCode = 1;
    }
  });
}

process.once("SIGINT", stopServer);
process.once("SIGTERM", stopServer);
