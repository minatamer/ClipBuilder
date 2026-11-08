import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  access,
  mkdir,
  mkdtemp,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
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
import { ownerWorkspaceSchema } from "../packages/contracts/local/index.ts";
import { ownerAnalysisSchema } from "../packages/contracts/local/selection.ts";
import { ownerClipListSchema } from "../packages/contracts/local/clips.ts";
import type { OwnerAnalysisPorts } from "../apps/backend/local/analysis.ts";

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
    visualDiscovery: true,
    hookTitleSuggestions: true,
    capacity: {
      profile: "bounded",
      longSources: false,
      manyClips: false,
      sourceBytes: 10 * 1024 ** 3,
      sourceMs: 3_600_000,
      scratchBytes: 20 * 1024 ** 3,
      clips: 10,
      moments: 360,
    },
    localMedia: true,
    cloud: false,
  });
  expect(cleanup).toHaveBeenCalledTimes(0);
});

it("accepts a two-hour local Gemini source over authenticated HTTP and prepares only its manual 41-second clip", async () => {
  await host.close();
  const transcribe = vi.fn(fakeOwnerAnalysis.transcribe),
    select = vi.fn(fakeOwnerAnalysis.select),
    transcribeCut = vi.fn<NonNullable<OwnerAnalysisPorts["transcribeCut"]>>(
      async (workspace, cut, signal) => {
        const words = await fakeOwnerAnalysis.transcribe(
          {
            ...workspace,
            source: {
              ...workspace.source,
              durationMs: ((cut.endFrame - cut.startFrame) * 1000) / 30,
            },
          },
          signal,
        );
        return words.map((word) => ({
          ...word,
          startMs: word.startMs + (cut.startFrame * 1000) / 30,
          endMs: word.endMs + (cut.startFrame * 1000) / 30,
        }));
      },
    ),
    plan = vi.fn(async () => []),
    image = vi.fn(fakeOwnerClipPreparation.image);
  const media = vi.fn<OwnerHostOptions["media"]>(async (job) => {
    if (job.operation === "inspect")
      return {
        operation: "inspect",
        source: {
          fingerprint: createHash("sha256").update("fake").digest("hex"),
          bytes: 4,
          durationMs: 7_200_000,
          width: 320,
          height: 180,
          fps: 30,
        },
      };
    if (job.operation !== "clip-preview")
      throw Error("unexpected_synthetic_job");
    await writeFile(
      join(scratch, job.workspaceId, `${job.clipId}.source.mp4`),
      "synthetic-preview",
    );
    const frames = job.cut.endFrame - job.cut.startFrame;
    return {
      operation: "clip-preview",
      frames,
      bytes: 17,
      durationMs: (frames * 1000) / 30,
    };
  });
  host = createOwnerHost({
    root: scratch,
    token: "synthetic-token",
    port: 0,
    aiProvider: "gemini",
    media,
    providers: () => ({
      analysis: { ...fakeOwnerAnalysis, transcribe, transcribeCut, select },
      clipPreparation: { ...fakeOwnerClipPreparation, plan, image },
    }),
  });
  port = await listenOwner(host.server);
  const cap = await ownerRequest(port, "/api/capabilities", { headers: auth });
  expect(JSON.parse(cap.body.toString()).capacity).toMatchObject({
    profile: "local-gemini",
    sourceMs: null,
    sourceBytes: 10 * 1024 ** 3,
    clips: 10,
  });
  expect(media).not.toHaveBeenCalled();
  const post = (path: string, body: unknown) =>
    ownerRequest(port, path, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  const upload = await ownerRequest(port, "/api/source", {
    method: "POST",
    headers: { ...auth, "Content-Type": "video/mp4" },
    body: "fake",
  });
  expect(upload.status).toBe(200);
  const workspace = ownerWorkspaceSchema.parse(
    JSON.parse(upload.body.toString()),
  );
  const base = `/api/workspace/${workspace.id}`;
  const response = await post(base + "/analysis", {
    sourceRevision: 0,
    policyRevision: 0,
    ranges: [{ id: randomUUID(), startMs: 64_000, endMs: 105_000 }],
    aiDuration: { minMs: 10_000, maxMs: 60_000 },
    manualOnly: true,
  });
  expect(response.status).toBe(200);
  const analysis = ownerAnalysisSchema.parse(
    JSON.parse(response.body.toString()),
  );
  expect(
    (
      await post(base + "/clips", {
        operationId: randomUUID(),
        analysisId: analysis.id,
        sourceRevision: 0,
        policyRevision: 0,
        momentIds: [analysis.manual[0]!.id],
      })
    ).status,
  ).toBe(202);
  let settled = false;
  for (let i = 0; i < 200; i++) {
    const response = await ownerRequest(port, base + "/clips", {
      headers: auth,
    });
    const list = ownerClipListSchema.parse(
      JSON.parse(response.body.toString()),
    );
    if (!list.active) {
      expect(list.clips[0]!.state).toBe("review-ready");
      settled = true;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  expect(settled).toBe(true);
  expect(transcribeCut).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({
      source: expect.objectContaining({ durationMs: 7_200_000 }),
    }),
    { startFrame: 1920, endFrame: 3150 },
    expect.any(AbortSignal),
  );
  expect(transcribe).not.toHaveBeenCalled();
  expect(select).not.toHaveBeenCalled();
  expect(plan).toHaveBeenCalledTimes(1);
  expect(image).not.toHaveBeenCalled();
  expect(
    media.mock.calls.map(([job]) => ({
      operation: job.operation,
      ...("cut" in job ? { cut: job.cut } : {}),
    })),
  ).toEqual([
    { operation: "inspect" },
    { operation: "clip-preview", cut: { startFrame: 1920, endFrame: 3150 } },
  ]);
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
