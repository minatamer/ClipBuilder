import { createApplication, type LocalWorkflowSlot } from "./app.js";
import { loadConfig } from "./config/loadConfig.js";
import { AnalysisDiagnostics } from "./analysis/analysis.diagnostics.js";

export function composeBackend(
  environment: NodeJS.ProcessEnv,
  diagnostics = new AnalysisDiagnostics(),
) {
  const config = loadConfig(environment);
  const localWorkflow: LocalWorkflowSlot = { current: null };
  const hostedWorkflow: LocalWorkflowSlot = { current: null };

  return {
    application: createApplication(
      config,
      diagnostics,
      undefined,
      localWorkflow,
      hostedWorkflow,
    ),
    localWorkflow,
    hostedWorkflow,
    config,
  };
}
