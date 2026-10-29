import type { BackendConfig } from "../src/config/env.schema.ts";
import { composeGeminiTransport } from "../src/analysis/gemini.adapter.ts";
import { createOwnerProviderAi } from "./provider-ai.ts";
import type { OwnerHostProviders } from "./server.ts";
import type { WorkspaceFiles } from "./workspace-files.ts";
import { LocalDiagnostics } from "./diagnostics.ts";

/** CL-078 owner exception. Only the confirmed clip-caption route receives this port. */
export function composeLocalCaptionProvider(
  config: BackendConfig,
  files: WorkspaceFiles,
  media: Parameters<typeof createOwnerProviderAi>[0]["media"],
  diagnostics = new LocalDiagnostics(),
  transport?: Parameters<typeof createOwnerProviderAi>[0]["transport"],
): OwnerHostProviders {
  if (
    config.appEnv !== "local" ||
    config.nodeEnv === "test" ||
    config.aiProvider !== "gemini" ||
    !config.gemini.apiKey
  )
    return {};
  const scoped = {
    nodeEnv: config.nodeEnv,
    providerMode: "live" as const,
    paidDemoEnabled: true,
    features: { liveAnalysis: true, liveAssembly: false },
    gemini: {
      ...config.gemini,
      transferApproved: true,
      paidProjectConfirmed: true,
    },
  };
  const provider = createOwnerProviderAi({
    files,
    media,
    diagnostics,
    transport:
      transport ??
      composeGeminiTransport(scoped, undefined, diagnostics.analysis, {
        responseBytes: 16 * 1024 ** 2,
      }),
    pictures: { find: async () => null },
    timeoutMs: config.gemini.timeoutMs,
  });
  return {
    captionTranscription: provider.captionTranscription,
    close: provider.close,
    cleanupWorkspace: provider.cleanupWorkspace,
  };
}
