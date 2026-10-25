import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { access, mkdir, mkdtemp, readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  createOwnerHost,
  type OwnerHostOptions,
} from "../apps/backend/local/server.ts";
import type { WorkspaceFiles } from "../apps/backend/local/workspace-files.ts";
import { fakeOwnerAnalysis } from "../apps/backend/local/fake-analysis.ts";
import { editorContentFixture as fakeOwnerClipPreparation } from "./owner-content-fixture.ts";
import { listenOwner, ownerRequest } from "./owner-http.ts";

let root: string, scratch: string, host: ReturnType<typeof createOwnerHost>;
let files: WorkspaceFiles, port: number;
let cleanup: ReturnType<typeof vi.fn<(id: string) => Promise<void>>>;
let close: ReturnType<typeof vi.fn<() => Promise<void>>>;
let expectedCloseCalls: number;
const auth = { Authorization: "Bearer synthetic-token" };
beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "clipbuilder-owner-provider-host-"));
  scratch = join(root, "scratch");
  await mkdir(scratch);
  cleanup = vi.fn(async (id) => {
    await access(await files.file(id, "source.mp4"));
  });
  close = vi.fn(async () => {});
  expectedCloseCalls = 1;
  const media: OwnerHostOptions["media"] = async (job) => {
    if (job.operation !== "inspect")
      throw new Error("unexpected_synthetic_job");
    return {
      operation: "inspect",
      source: {
        fingerprint: "a".repeat(64),
        bytes: 4,
        durationMs: 12000,
        width: 320,
        height: 180,
        fps: 30,
      },
    };
  };
  host = createOwnerHost({
    root: scratch,
    ui: root,
    port: 0,
    token: "synthetic-token",
    media,
    providers(workspaceFiles) {
      files = workspaceFiles;
      return {
        analysis: { ...fakeOwnerAnalysis, mode: "provider-ai" },
        clipPreparation: { ...fakeOwnerClipPreparation, mode: "provider-ai" },
        cleanupWorkspace: cleanup,
        close,
      };
    },
  });
  port = await listenOwner(host.server);
});
afterEach(async () => {
  await host.close();
  expect(close).toHaveBeenCalledTimes(expectedCloseCalls);
  expect(await readdir(scratch)).toEqual([]);
  await rm(root, { recursive: true, force: true });
});

it("reports the composed provider mode without invoking any provider", async () => {
  const response = await ownerRequest(port, "/api/capabilities", {
    headers: auth,
  });
  expect(JSON.parse(response.body.toString())).toEqual({
    aiMode: "provider-ai",
    sourceMode: null,
    planningAvailable: true,
    captionGeneration: false,
    localMedia: true,
    cloud: false,
  });
  expect(cleanup).toHaveBeenCalledTimes(0);
});

it("keeps the workspace owned if provider cleanup fails and allows a later explicit clear", async () => {
  const uploaded = await ownerRequest(port, "/api/source", {
    method: "POST",
    headers: { ...auth, "Content-Type": "video/mp4" },
    body: "fake",
  });
  expect(uploaded.status).toBe(200);
  const workspace = JSON.parse(uploaded.body.toString()) as { id: string };
  cleanup.mockRejectedValueOnce(new Error("synthetic_cleanup_pending"));
  const path = `/api/workspace/${workspace.id}`;
  expect(
    (await ownerRequest(port, path, { method: "DELETE", headers: auth }))
      .status,
  ).toBe(400);
  expect(await readdir(scratch)).toEqual([workspace.id]);
  expect(
    (await ownerRequest(port, path, { method: "DELETE", headers: auth }))
      .status,
  ).toBe(204);
  expect(cleanup).toHaveBeenCalledTimes(2);
  expect(await readdir(scratch)).toEqual([]);
});

it("closes its listener even when provider cleanup requires later recovery", async () => {
  close.mockRejectedValueOnce(new Error("synthetic_cleanup_pending"));
  expectedCloseCalls = 2;
  await expect(host.close()).rejects.toThrow("synthetic_cleanup_pending");
  expect(host.server.listening).toBe(false);
});
