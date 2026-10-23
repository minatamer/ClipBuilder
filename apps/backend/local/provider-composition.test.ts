import { loadConfig } from "../src/config/loadConfig.js";
import { expect, it, vi } from "vitest";
import type { GeminiTransport } from "../src/analysis/gemini.adapter.js";
import { composeOwnerProviders } from "./provider-composition.ts";
import { localProviderReadiness } from "./provider-readiness.ts";
import { WorkspaceFiles } from "./workspace-files.ts";

function inertPorts() {
  const unused = vi.fn(async () => {
    throw new Error("unexpected_port_call");
  });
  const transport = {
    upload: unused,
    get: unused,
    transcribe: unused,
    generate: unused,
    candidates: unused,
    delete: unused,
  } satisfies GeminiTransport;
  return { transport, pictures: { find: unused }, media: unused, unused };
}

it("composes no provider ports or synthetic substitute when readiness is incomplete", () => {
  const ports = inertPorts();
  const composed = composeOwnerProviders(
    { ready: false },
    new WorkspaceFiles("unused-synthetic-root"),
    ports.media,
    ports,
  );
  expect(composed).toEqual({});
  expect(ports.unused).toHaveBeenCalledTimes(0);
});

it("wires ready provider analysis and planning with inert injected transports and exposes cleanup", async () => {
  const readiness = localProviderReadiness(
    loadConfig({
      NODE_ENV: "development",
      APP_ENV: "local",
      FAKE_MODE: "false",
      PAID_DEMO_ENABLED: "true",
      CLOUD_SPEND_APPROVED: "true",
      GEMINI_TRANSFER_APPROVED: "true",
      GEMINI_IMAGE_GENERATION_APPROVED: "true",
      GEMINI_PAID_PROJECT_CONFIRMED: "true",
      GEMINI_API_KEY: "synthetic-test-key",
    }),
  );
  const ports = inertPorts();
  const composed = composeOwnerProviders(
    readiness,
    new WorkspaceFiles("unused-synthetic-root"),
    ports.media,
    ports,
  );
  expect(composed.analysis?.mode).toBe("provider-ai");
  expect(composed.clipPreparation?.mode).toBe("provider-ai");
  expect(composed.cleanupWorkspace).toBeTypeOf("function");
  expect(composed.close).toBeTypeOf("function");
  const signal = new AbortController().signal;
  await composed.cleanupWorkspace?.(crypto.randomUUID(), signal);
  await composed.close?.(signal);
  expect(ports.unused).toHaveBeenCalledTimes(0);
});
