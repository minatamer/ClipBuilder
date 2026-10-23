import { Server } from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";
import { composeBackend } from "./composition.js";
import * as composition from "./composition.js";
import { createSafeTestEnvironment } from "../test/environment.fixture.js";

let ownedServer: Server | undefined;
afterEach(() => {
  ownedServer?.emit("close");
  ownedServer = undefined;
  vi.restoreAllMocks();
});

describe("backend executable startup", () => {
  it("does not compose, listen, load configuration files or register signals on import", async () => {
    const compose = vi
      .spyOn(composition, "composeBackend")
      .mockImplementation(() => {
        throw new Error("unexpected startup during import");
      });
    const loadEnv = vi.spyOn(process, "loadEnvFile");
    const before = [
      process.listenerCount("SIGINT"),
      process.listenerCount("SIGTERM"),
    ];
    await import("./server.js");
    expect(compose.mock.calls.length).toBe(0);
    expect(loadEnv).not.toHaveBeenCalled();
    expect([
      process.listenerCount("SIGINT"),
      process.listenerCount("SIGTERM"),
    ]).toEqual(before);
  });

  it("explicitly starts the fake app with the same address and logs, then releases its signal handlers", async () => {
    const { startBackend } = await import("./server.js");
    const environment = createSafeTestEnvironment();
    const composed = composeBackend(environment);
    const server = new Server();
    ownedServer = server;
    const close = vi.spyOn(server, "close").mockImplementation((callback) => {
      callback?.();
      server.emit("close");
      return server;
    });
    const listen = vi
      .spyOn(composed.application, "listen")
      .mockImplementation((_port, _host, callback) => {
        if (typeof callback === "function") callback();
        return server;
      });
    vi.spyOn(composition, "composeBackend").mockReturnValue(composed);
    const log = vi.spyOn(console, "warn").mockImplementation(() => {});
    const before = process.listeners("SIGTERM");
    expect(await startBackend(environment)).toBe(server);
    expect(listen).toHaveBeenCalledWith(
      composed.config.port,
      "127.0.0.1",
      expect.any(Function),
    );
    expect(log.mock.calls).toContainEqual([
      `ClipBuilder backend listening on 127.0.0.1:${composed.config.port}`,
    ]);
    expect(log.mock.calls).toContainEqual([
      "ClipBuilder renderer diagnostics ready",
    ]);
    const stop = process
      .listeners("SIGTERM")
      .find((handler) => !before.includes(handler));
    expect(stop).toBeDefined();
    stop?.("SIGTERM");
    expect(close).toHaveBeenCalledOnce();
    expect(process.listeners("SIGTERM")).toEqual(before);
  });
});
