import type { OwnerHostProviders } from "./server.ts";
import type { WorkspaceFiles } from "./workspace-files.ts";
import type {
  OwnerMediaJob,
  OwnerMediaResult,
} from "../../../packages/contracts/local/index.ts";
import type { LocalDiagnostics } from "./diagnostics.ts";
import {
  createLocalCodexInference,
  type CodexInference,
} from "./codex-exec.ts";
import { createLocalCodexAi } from "./codex-ai.ts";
import {
  WebPictureSource,
  WEB_PICTURE_INSTRUCTIONS,
  searchBrief,
  webPictureCandidatesSchema,
  type PictureDiscovery,
} from "../src/assembly/web-pictures.ts";
import { z } from "zod";

/** One production request builder, also exercised by the installed-CLI proof. */
export function codexImageDiscovery(infer: CodexInference): PictureDiscovery {
  return (request, signal) =>
    infer(
      {
        prompt: `${WEB_PICTURE_INSTRUCTIONS}\nCodex: Use functions.exec to call tools.web__run now with image_query and/or search_query. This is the available web-search tool in your Code Mode runtime. Await and inspect its actual results before producing candidate JSON; enabling search or merely describing a search does not satisfy this task. Do not call shell, file, image-generation or other tools.\n${searchBrief(request)}`,
        schema: z.toJSONSchema(webPictureCandidatesSchema, { io: "input" }),
        webSearch: true,
      },
      signal,
    );
}

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
  const infer = createLocalCodexInference({
    executable: options.executable!,
    root: options.root,
    observe: (detail) => options.diagnostics.trace(detail),
  });
  return createLocalCodexAi({
    ...options,
    pictures: new WebPictureSource(
      codexImageDiscovery(infer),
      (facts) => options.diagnostics.visual({ stage: "search", ...facts }),
      undefined,
      undefined,
      (detail) => options.diagnostics.trace(detail),
    ),
    infer,
  });
}
