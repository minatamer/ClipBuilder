import { expect, it, vi } from "vitest";
import { loadConfig } from "../src/config/loadConfig.ts";
import { composeLocalCaptionProvider } from "./caption-provider-composition.ts";
import { WorkspaceFiles } from "./workspace-files.ts";
import { LocalDiagnostics } from "./diagnostics.ts";
import type { GeminiTransport } from "../src/analysis/gemini.adapter.ts";

it("provides only explicit clip transcription in local fake/paid-off mode without changing normal gates", async () => {
  const config = loadConfig({
    NODE_ENV: "development",
    APP_ENV: "local",
    FAKE_MODE: "true",
    PAID_DEMO_ENABLED: "false",
    GEMINI_API_KEY: "synthetic-key",
  });
  const before = structuredClone(config),
    unused = vi.fn(async () => {
      throw new Error("unexpected_provider_call");
    });
  const transport = {
    upload: unused,
    get: unused,
    generate: unused,
    transcribe: unused,
    candidates: unused,
    delete: unused,
  } satisfies GeminiTransport;
  const ports = composeLocalCaptionProvider(
    config,
    new WorkspaceFiles("unused-synthetic-root"),
    unused,
    new LocalDiagnostics(),
    transport,
  );
  expect(ports.captionTranscription).toBeTypeOf("function");
  expect(ports.analysis).toBeUndefined();
  expect(ports.clipPreparation).toBeUndefined();
  expect(config).toEqual(before);
  expect(config.paidDemoEnabled).toBe(false);
  expect(config.providerMode).toBe("fake");
  await ports.close?.(new AbortController().signal);
  expect(unused).toHaveBeenCalledTimes(0);
  for (const guarded of [
    { ...config, nodeEnv: "test" as const },
    { ...config, appEnv: "production" as const },
    { ...config, gemini: { ...config.gemini, apiKey: null } },
  ])
    expect(
      composeLocalCaptionProvider(
        guarded,
        new WorkspaceFiles("unused-synthetic-root"),
        unused,
        new LocalDiagnostics(),
        transport,
      ),
    ).toEqual({});
});
