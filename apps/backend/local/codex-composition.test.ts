import { expect, it, vi } from "vitest";
import { composeLocalCodex } from "./codex-composition.ts";
import { WorkspaceFiles } from "./workspace-files.ts";
import { LocalDiagnostics } from "./diagnostics.ts";

it("keeps local prerequisites and the master off switch inert without any job or inference", () => {
  const media = vi.fn();
  const options = {
    executable: null,
    speechReady: false,
    root: "unused-synthetic",
    files: new WorkspaceFiles("unused-synthetic"),
    media,
    diagnostics: new LocalDiagnostics(),
  };
  expect(composeLocalCodex(options)).toEqual({
    localAi: {
      aiProvider: "codex",
      aiSetup: "codex-missing",
      captionProvider: "local-speech",
    },
  });
  expect(composeLocalCodex({ ...options, executable: "synthetic" })).toEqual({
    localAi: {
      aiProvider: "codex",
      aiSetup: "speech-missing",
      captionProvider: "local-speech",
    },
  });
  const ready = composeLocalCodex({
    ...options,
    executable: "synthetic",
    speechReady: true,
  });
  expect(ready.localAi?.aiSetup).toBe("ready");
  expect(ready.analysis?.mode).toBe("provider-ai");
  const disabled = composeLocalCodex({
    ...options,
    executable: "synthetic",
    speechReady: true,
    enabled: false,
  });
  expect(disabled.localAi?.aiSetup).toBe("disabled");
  expect(disabled.analysis).toBeUndefined();
  expect(disabled.captionTranscription).toBeUndefined();
  expect(media).not.toHaveBeenCalled();
});
