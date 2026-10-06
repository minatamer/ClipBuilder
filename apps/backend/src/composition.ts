import { createApplication } from "./app.js";
import { loadConfig } from "./config/loadConfig.js";
import { AnalysisDiagnostics } from "./analysis/analysis.diagnostics.js";

export function composeBackend(
  environment: NodeJS.ProcessEnv,
  diagnostics = new AnalysisDiagnostics(),
) {
  const config = loadConfig(environment);

  return {
    application: createApplication(config, diagnostics),
    config,
  };
}
