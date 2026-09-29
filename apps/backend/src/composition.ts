import { createApplication } from "./app.js";
import { loadConfig } from "./config/loadConfig.js";

export function composeBackend(environment: NodeJS.ProcessEnv) {
  const config = loadConfig(environment);

  return {
    application: createApplication(config),
    config,
  };
}
