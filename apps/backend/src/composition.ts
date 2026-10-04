import { createApplication } from "./app.js";
import { loadConfig } from "./config/loadConfig.js";
import type { RuntimeSettings } from "./config/runtime.schema.js";
import { AnalysisDiagnostics } from "./analysis/analysis.diagnostics.js";

export function composeBackend(
  environment: NodeJS.ProcessEnv,
  runtime: RuntimeSettings = {},
  diagnostics = new AnalysisDiagnostics(),
) {
  const config = loadConfig(environment, runtime);

  return {
    application: createApplication(config, diagnostics),
    config,
  };
}
