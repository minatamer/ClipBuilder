import { composeBackend } from "./composition.js";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { readLocalRuntimeSettings } from "./config/runtime.local.js";

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

const runtime =
  process.env.NODE_ENV !== "test" &&
  (process.env.APP_ENV === undefined || process.env.APP_ENV === "local")
    ? readLocalRuntimeSettings(
        new URL("../runtime.local.json", import.meta.url),
      )
    : {};
const { application, config } = composeBackend(process.env, runtime);
if (config.processingUnavailableReasons.length)
  console.warn(
    `ClipBuilder paid processing unavailable: ${config.processingUnavailableReasons.join(", ")}`,
  );

const server = application.listen(config.port, "127.0.0.1", () => {
  console.warn(`ClipBuilder backend listening on 127.0.0.1:${config.port}`);
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
