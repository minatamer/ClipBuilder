import type { OwnerHostProviders } from "./server.ts";
import type { WorkspaceFiles } from "./workspace-files.ts";
import type {
  OwnerMediaJob,
  OwnerMediaResult,
} from "../../../packages/contracts/local/index.ts";
import type { LocalDiagnostics } from "./diagnostics.ts";
import { createLocalCodexInference } from "./codex-exec.ts";
import { createLocalCodexAi } from "./codex-ai.ts";
import { CommonsPictureSource } from "../src/assembly/commons-pictures.ts";

/** Local-only composition. Checking prerequisites never logs in or infers. */
export function composeLocalCodex(options: {
  enabled?: boolean;
  executable: string | null;
  speechReady: boolean;
  root: string;
  files: WorkspaceFiles;
  media: (job: OwnerMediaJob, signal: AbortSignal) => Promise<OwnerMediaResult>;
  diagnostics: LocalDiagnostics;
}): OwnerHostProviders {
  const aiSetup =
    options.enabled === false
      ? "disabled"
      : !options.executable
        ? "codex-missing"
        : !options.speechReady
          ? "speech-missing"
          : "ready";
  if (aiSetup !== "ready")
    return {
      localAi: {
        aiProvider: "codex",
        aiSetup,
        captionProvider: "local-speech",
      },
    };
  return createLocalCodexAi({
    ...options,
    pictures: new CommonsPictureSource(),
    infer: createLocalCodexInference({
      executable: options.executable!,
      root: options.root,
    }),
  });
}
