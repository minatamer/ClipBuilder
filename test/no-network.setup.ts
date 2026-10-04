import net from "node:net";
import { afterAll, expect, vi } from "vitest";
import { installTestEnvironment } from "./deterministic.environment.js";

const originalConnect = net.Socket.prototype.connect;
const permittedImportGuardHost = "pre-import-network-guard.invalid";
const permittedImportGuardUrl = `https://${permittedImportGuardHost}`;
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

export function connectionHost(args: readonly unknown[]): string | undefined {
  // net.connect/createConnection forwards Node's normalized [options, callback].
  const values = Array.isArray(args[0]) ? args[0] : args;
  const first = values[0];
  if (typeof first === "object" && first !== null)
    return "host" in first && typeof first.host === "string"
      ? first.host
      : undefined;
  if (typeof first === "number" && typeof values[1] === "string")
    return values[1];
  if (typeof first === "string") return first;
  return undefined;
}

installTestEnvironment();

// Keep this worker-lifetime guard independent of test-owned Vitest mocks.
net.Socket.prototype.connect = function (this: net.Socket, ...args: unknown[]) {
  const host = connectionHost(args);

  if (typeof host === "string" && !isLoopbackHost(host)) {
    if (host !== permittedImportGuardHost) unexpectedSocketConnections += 1;
    throw new Error("Unexpected network access during deterministic test");
  }

  return Reflect.apply(originalConnect, this, args);
};

globalThis.fetch = blockedFetch;

afterAll(() => {
  const unexpectedFetchCalls = blockedFetch.mock.calls.filter(
    ([input]) => String(input) !== permittedImportGuardUrl,
  );
  expect(unexpectedFetchCalls).toEqual([]);
  expect(unexpectedSocketConnections).toBe(0);
  vi.restoreAllMocks();
  globalThis.fetch = blockedFetch;
  installTestEnvironment();
});
