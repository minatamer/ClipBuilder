import { afterEach, expect, it, vi } from "vitest";
import request from "supertest";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createApplication } from "./app.js";
import { loadConfig } from "./config/loadConfig.js";
import { createOwnerHost } from "../local/server.ts";
let host: ReturnType<typeof createOwnerHost> | undefined;
let root: string | undefined;
afterEach(async () => {
  await host?.close();
  if (root) await rm(root, { recursive: true, force: true });
});
it("mounts the same local use cases while retaining bearer, host and origin checks", async () => {
  root = await mkdtemp(join(tmpdir(), "clipbuilder-local-mount-"));
  const media = vi.fn(async () => {
    throw new Error("unexpected_media");
  });
  host = createOwnerHost({
    root,
    token: "synthetic-token",
    port: 4000,
    frontendOrigin: "http://localhost:3000",
    media,
  });
  const config = loadConfig({
    NODE_ENV: "test",
    FAKE_MODE: "true",
    PAID_DEMO_ENABLED: "false",
  });
  const app = createApplication(config, undefined, undefined, {
    current: host,
  });
  const call = () =>
    request(app).get("/v1/local/capabilities").set("Host", "127.0.0.1:4000");
  expect((await call()).status).toBe(403);
  expect(
    (
      await call()
        .set("Authorization", "Bearer synthetic-token")
        .set("Origin", "http://localhost:3000")
    ).status,
  ).toBe(200);
  expect(
    (
      await call()
        .set("Authorization", "Bearer synthetic-token")
        .set("Origin", "http://attacker.invalid")
    ).status,
  ).toBe(403);
  expect(
    (
      await call()
        .set("Authorization", "Bearer synthetic-token")
        .set("Host", "attacker.invalid")
    ).status,
  ).toBe(403);
  expect(media).toHaveBeenCalledTimes(0);
});
it("keeps hosted routes and uncomposed local runtimes unavailable without dispatch", async () => {
  const dispatch = vi.fn(async () => {});
  const config = loadConfig({
    NODE_ENV: "test",
    APP_ENV: "preview",
    FAKE_MODE: "true",
    PAID_DEMO_ENABLED: "false",
  });
  expect(
    (
      await request(
        createApplication(config, undefined, undefined, {
          current: { dispatch },
        }),
      ).get("/v1/local/capabilities")
    ).status,
  ).toBe(404);
  expect(dispatch).toHaveBeenCalledTimes(0);
  const local = { ...config, appEnv: "local" as const };
  expect(
    (await request(createApplication(local)).get("/v1/local/capabilities"))
      .status,
  ).toBe(404);
});
