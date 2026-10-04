import { createApplication } from "./app.js";
import { loadConfig } from "./config/loadConfig.js";
import type { RuntimeSettings } from "./config/runtime.schema.js";

export function composeBackend(
  environment: NodeJS.ProcessEnv,
  runtime: RuntimeSettings = {},
) {
  const config = loadConfig(environment, runtime);

  return {
    application: createApplication(config),
    config,
  };
}
