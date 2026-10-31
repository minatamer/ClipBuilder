import {
  composeGeminiTransport,
  type GeminiTransport,
} from "../src/analysis/gemini.adapter.js";
import { LocalDiagnostics } from "./diagnostics.ts";
import { GeminiPictureGenerator } from "../src/assembly/gemini-pictures.js";
import type { OwnerHostProviders } from "./server.ts";
import type { WorkspaceFiles } from "./workspace-files.ts";
import type { OwnerProviderReadiness } from "./provider-readiness.ts";
import { createOwnerProviderAi } from "./provider-ai.ts";
import { WebPictureSource } from "../src/assembly/web-pictures.js";
import { geminiImageDiscovery } from "../src/assembly/gemini-image-search.js";

type ProviderAiOptions = Parameters<typeof createOwnerProviderAi>[0];

/** Explicit local host composition. Construction is inert until a protected action. */
export function composeOwnerProviders(
  readiness: OwnerProviderReadiness,
  files: WorkspaceFiles,
  media: ProviderAiOptions["media"],
  injected?: {
    transport: GeminiTransport;
    pictures: Pick<GeminiPictureGenerator, "find">;
    search?: ProviderAiOptions["search"];
  },
  diagnostics = new LocalDiagnostics(),
): OwnerHostProviders {
  if (!readiness.ready) return {};
  return createOwnerProviderAi({
    files,
    media,
    diagnostics,
    search: injected
      ? injected.search
      : new WebPictureSource(
          geminiImageDiscovery(
            readiness.config.gemini.apiKey!,
            readiness.config.gemini.model,
          ),
          (facts) => diagnostics.visual({ stage: "search", ...facts }),
          undefined,
          undefined,
          (detail) => diagnostics.trace(detail),
        ),
    transport:
      injected?.transport ??
      composeGeminiTransport(
        readiness.config,
        undefined,
        diagnostics.analysis,
        {
          responseBytes: 16 * 1024 * 1024,
        },
      ),
    pictures:
      injected?.pictures ??
      new GeminiPictureGenerator(
        readiness.config.gemini.apiKey!,
        undefined,
        undefined,
        diagnostics.analysis,
      ),
    timeoutMs: readiness.config.gemini.timeoutMs,
  });
}
