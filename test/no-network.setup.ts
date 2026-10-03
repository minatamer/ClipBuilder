import net from "node:net";
import { afterAll, expect, vi } from "vitest";

const originalConnect = net.Socket.prototype.connect;
const originalFetch = globalThis.fetch;
const deterministicEnvironment = {
  NODE_ENV: "test",
  FAKE_MODE: "true",
  PROVIDER_MODE: "fake",
  PAID_DEMO_ENABLED: "false",
  PROCESSING_GRANTS_ENABLED: "false",
  ADMISSION_MAX_PROCESS_DISPATCHES: "0",
  LIVE_ANALYSIS_ENABLED: "false",
  LIVE_ASSEMBLY_ENABLED: "false",
  LIVE_RENDER_ENABLED: "false",
  LIVE_IMAGE_GENERATION_ENABLED: "false",
  CLOUD_RENDER_ENVIRONMENT: "disabled",
  CLOUD_SPEND_APPROVED: "false",
  RENDERER_ENABLED: "false",
  RENDERER_MAX_OPERATIONS: "0",
} as const;
const originalEnvironment = Object.fromEntries(
  Object.keys(deterministicEnvironment).map((key) => [key, process.env[key]]),
);
const permittedImportGuardUrl = "https://pre-import-network-guard.invalid";
const blockedFetch = vi.fn((input: Parameters<typeof globalThis.fetch>[0]) => {
  void input;
  return Promise.reject(
    new Error("Unexpected fetch during deterministic test"),
  );
});
let unexpectedSocketConnections = 0;

function isLoopbackHost(host: string | undefined): boolean {
  return (
    host === undefined ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1"
  );
}

Object.assign(process.env, deterministicEnvironment);

vi.spyOn(net.Socket.prototype, "connect").mockImplementation(function (
  this: net.Socket,
  ...args: unknown[]
) {
  const first = args[0];
  let host: string | undefined;

  if (typeof first === "object" && first !== null) {
    host =
      "host" in first && typeof first.host === "string"
        ? first.host
        : undefined;
  } else if (typeof first === "number" && typeof args[1] === "string") {
    host = args[1];
  } else if (typeof first === "string") {
    host = first;
  }

  if (typeof host === "string" && !isLoopbackHost(host)) {
    unexpectedSocketConnections += 1;
    throw new Error(`Unexpected network access to ${host}`);
  }

  return Reflect.apply(originalConnect, this, args);
});

globalThis.fetch = blockedFetch;

afterAll(() => {
  const unexpectedFetchCalls = blockedFetch.mock.calls.filter(
    ([input]) => String(input) !== permittedImportGuardUrl,
  );
  expect(unexpectedFetchCalls).toEqual([]);
  expect(unexpectedSocketConnections).toBe(0);
  vi.restoreAllMocks();
  globalThis.fetch = originalFetch;
  Object.entries(originalEnvironment).forEach(([key, value]) => {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  });
});
