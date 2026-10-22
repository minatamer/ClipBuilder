import {
  composeGeminiTransport,
  type GeminiTransport,
} from "../src/analysis/gemini.adapter.js";
import { AnalysisDiagnostics } from "../src/analysis/analysis.diagnostics.js";
import { GeminiPictureGenerator } from "../src/assembly/gemini-pictures.js";
import type { OwnerHostProviders } from "./server.ts";
import type { WorkspaceFiles } from "./workspace-files.ts";
import type { OwnerProviderReadiness } from "./provider-readiness.ts";
import { createOwnerProviderAi } from "./provider-ai.ts";

type ProviderAiOptions = Parameters<typeof createOwnerProviderAi>[0];

/** Explicit local host composition. Construction is inert until a protected action. */
export function composeOwnerProviders(
  readiness: OwnerProviderReadiness,
  files: WorkspaceFiles,
  media: ProviderAiOptions["media"],
  injected?: {
    transport: GeminiTransport;
    pictures: Pick<GeminiPictureGenerator, "find">;
  },
): OwnerHostProviders {
  if (!readiness.ready) return {};
  const diagnostics = new AnalysisDiagnostics();
  return createOwnerProviderAi({
    files,
    media,
    transport:
      injected?.transport ??
      composeGeminiTransport(readiness.config, undefined, diagnostics, {
        responseBytes: 16 * 1024 * 1024,
      }),
    pictures:
      injected?.pictures ??
      new GeminiPictureGenerator(
        readiness.config.gemini.apiKey!,
        undefined,
        undefined,
        diagnostics,
      ),
    timeoutMs: readiness.config.gemini.timeoutMs,
  });
}
