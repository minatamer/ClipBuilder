import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  mkdtemp,
  mkdir,
  writeFile,
  readdir,
  rm,
  symlink,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createOwnerHost,
  type OwnerHostOptions,
} from "../apps/backend/owner/server.ts";
import {
  WorkspaceFiles,
  confinedPath,
} from "../apps/backend/owner/workspace-files.ts";
import {
  assertOwnerFakeMode,
  nativeEnvironment,
} from "../apps/backend/owner/local-mode.ts";
import {
  ownerMediaJobSchema,
  ownerWorkspaceSchema,
  OWNER_LIMITS,
} from "../packages/contracts/owner/index.ts";
import { listenOwner, ownerRequest } from "./owner-http.ts";
import { localWorkerPort } from "../apps/backend/owner/worker-port.ts";
import { fakeOwnerAnalysis } from "../apps/backend/owner/fake-analysis.ts";
import {
  ownerAnalysisSchema,
  type OwnerAnalysisInputs,
} from "../packages/contracts/owner/selection.ts";

const source = {
  fingerprint: "a".repeat(64),
  bytes: 4,
  durationMs: 12_000,
  width: 320,
  height: 180,
  fps: 30,
};
describe("isolated owner host", () => {
  let directory: string,
    root: string,
    ui: string,
    host: ReturnType<typeof createOwnerHost>,
    port: number;
  let media: ReturnType<typeof vi.fn<OwnerHostOptions["media"]>>;
  let shutdown: ReturnType<typeof vi.fn<() => void>>;
  let analysis: {
    mode: "synthetic-ai";
    transcribe: ReturnType<typeof vi.fn<typeof fakeOwnerAnalysis.transcribe>>;
    select: ReturnType<typeof vi.fn<typeof fakeOwnerAnalysis.select>>;
  };
  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), "clipbuilder-owner-test-"));
    root = join(directory, "scratch");
    ui = join(directory, "ui");
    await mkdir(root);
    await mkdir(ui);
    await writeFile(join(ui, "index.html"), "synthetic UI");
    media = vi.fn(async (job) => {
      if (job.operation === "inspect") return { operation: "inspect", source };
      if (job.operation !== "portrait" && job.operation !== "clip")
        throw new Error("unexpected_media_operation");
      return {
        operation: "portrait",
        bytes: 10,
        frames: job.cut.endFrame - job.cut.startFrame,
        durationMs: Math.round(
          ((job.cut.endFrame - job.cut.startFrame) * 1000) / 30,
        ),
      };
    });
    shutdown = vi.fn();
    analysis = {
      mode: "synthetic-ai",
      transcribe: vi.fn(fakeOwnerAnalysis.transcribe),
      select: vi.fn(fakeOwnerAnalysis.select),
    };
    host = createOwnerHost({
      root,
      ui,
      token: "test-token",
      port: 0,
      media,
      shutdown,
      analysis,
    });
    port = await listenOwner(host.server);
  });
  afterEach(async () => {
    await host.close();
    expect(await readdir(root)).toEqual([]);
    await rm(directory, { recursive: true, force: true });
  });
  const auth = { Authorization: "Bearer test-token" };
  it("exposes protected content-free runtime capabilities without dispatch", async () => {
    expect((await ownerRequest(port, "/api/capabilities")).status).toBe(403);
    const response = await ownerRequest(port, "/api/capabilities", {
      headers: auth,
    });
    expect(response.status).toBe(200);
    expect(JSON.parse(response.body.toString())).toEqual({
      aiMode: "synthetic-ai",
      sourceMode: null,
      planningAvailable: false,
      localMedia: true,
      cloud: false,
    });
    expect(media).toHaveBeenCalledTimes(0);
    expect(analysis.transcribe).toHaveBeenCalledTimes(0);
  });
  it("protects the supervisor shutdown path with the same caller policy", async () => {
    expect(
      (await ownerRequest(port, "/api/shutdown", { method: "POST" })).status,
    ).toBe(403);
    expect(shutdown).toHaveBeenCalledTimes(0);
    expect(
      (
        await ownerRequest(port, "/api/shutdown", {
          method: "POST",
          headers: auth,
        })
      ).status,
    ).toBe(204);
    expect(shutdown).toHaveBeenCalledTimes(1);
    expect(media).toHaveBeenCalledTimes(0);
  });
  async function upload() {
    const response = await ownerRequest(port, "/api/source", {
      method: "POST",
      headers: { ...auth, "Content-Type": "video/mp4" },
      body: "fake",
    });
    expect(response.status).toBe(200);
    return ownerWorkspaceSchema.parse(JSON.parse(response.body.toString()));
  }
  const inputs = (): OwnerAnalysisInputs => ({
    sourceRevision: 0,
    policyRevision: 1,
    ranges: [{ id: crypto.randomUUID(), startMs: 200, endMs: 2200 }],
    aiDuration: { minMs: 10_000, maxMs: 60_000 },
    manualOnly: false,
  });
  async function analyze(id: string, value = inputs()) {
    return ownerRequest(port, `/api/workspace/${id}/analysis`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });
  }
  async function selection(id: string) {
    const response = await analyze(id);
    expect(response.status).toBe(200);
    const result = ownerAnalysisSchema.parse(
      JSON.parse(response.body.toString()),
    );
    return {
      analysisId: result.id,
      momentId: result.manual[0]!.id,
      policyRevision: result.inputs.policyRevision,
    };
  }
  it("restores a completed fake analysis without calls and rejects stale selections before rendering", async () => {
    const workspace = await upload();
    const chosen = await selection(workspace.id);
    const restored = await ownerRequest(
      port,
      `/api/workspace/${workspace.id}/analysis`,
      { headers: auth },
    );
    expect(
      ownerAnalysisSchema.parse(JSON.parse(restored.body.toString())).id,
    ).toBe(chosen.analysisId);
    expect(analysis.transcribe).toHaveBeenCalledTimes(1);
    expect(analysis.select).toHaveBeenCalledTimes(1);
    const newer = inputs();
    newer.policyRevision = 2;
    expect((await analyze(workspace.id, newer)).status).toBe(200);
    expect((await analyze(workspace.id)).status).toBe(409);
    expect(analysis.transcribe).toHaveBeenCalledTimes(2);
    expect(analysis.select).toHaveBeenCalledTimes(2);
    const rendered = await ownerRequest(
      port,
      `/api/workspace/${workspace.id}/portrait`,
      {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify(chosen),
      },
    );
    expect(rendered.status).toBe(409);
    expect(media).toHaveBeenCalledTimes(1);
  });
  it("rejects invalid source revisions/ranges without AI or native work", async () => {
    const workspace = await upload();
    const stale = inputs();
    stale.sourceRevision++;
    const outside = inputs();
    outside.ranges[0]!.endMs = source.durationMs + 1;
    for (const value of [stale, outside])
      expect((await analyze(workspace.id, value)).status).toBe(400);
    expect(analysis.transcribe).toHaveBeenCalledTimes(0);
    expect(analysis.select).toHaveBeenCalledTimes(0);
    expect(media).toHaveBeenCalledTimes(1);
  });
  it("restores the running session after refresh and expires only temporary copies", async () => {
    const workspace = await upload();
    const current = await ownerRequest(port, "/api/workspace", {
      headers: auth,
    });
    expect(
      ownerWorkspaceSchema.parse(JSON.parse(current.body.toString())).id,
    ).toBe(workspace.id);
    const clock = vi
      .spyOn(Date, "now")
      .mockReturnValue(Date.now() + OWNER_LIMITS.workspaceMs + 1);
    try {
      await host.expire();
    } finally {
      clock.mockRestore();
    }
    expect(
      (
        await ownerRequest(port, "/api/workspace", { headers: auth })
      ).body.toString(),
    ).toBe("null");
    expect(await readdir(root)).toEqual([]);
    expect(media).toHaveBeenCalledTimes(1);
  });
  it("requires authentication and exact loopback Host/Origin", async () => {
    expect((await ownerRequest(port, "/health")).status).toBe(403);
    expect(
      (await ownerRequest(port, "/health", { headers: auth })).status,
    ).toBe(200);
    for (const headers of [
      { ...auth, Origin: "https://foreign.invalid" },
      { ...auth, Host: "foreign.invalid" },
      { ...auth, "Sec-Fetch-Site": "cross-site" },
    ])
      expect((await ownerRequest(port, "/health", { headers })).status).toBe(
        403,
      );
    expect(media).toHaveBeenCalledTimes(0);
  });
  it("bootstraps a private same-site browser session and rejects cookie-only mutations", async () => {
    const page = await ownerRequest(port, "/", {
      headers: { Host: `localhost:${port}`, "Sec-Fetch-Site": "none" },
    });
    expect(page.status).toBe(200);
    expect(page.headers["set-cookie"]?.[0]).toContain(
      "HttpOnly; SameSite=Strict",
    );
    expect(page.body.toString()).not.toContain("test-token");
    const cookie = { Cookie: "owner=test-token" };
    expect(
      (
        await ownerRequest(port, "/api/source", {
          method: "POST",
          headers: cookie,
          body: "fake",
        })
      ).status,
    ).toBe(403);
    expect(media).toHaveBeenCalledTimes(0);
  });
  it("owns one temporary copy, supports bounded playback, and preserves originals", async () => {
    await writeFile(join(directory, "saved-original.mp4"), "original");
    const workspace = await upload();
    const range = await ownerRequest(
      port,
      `/api/workspace/${workspace.id}/source`,
      { headers: { ...auth, Range: "bytes=1-2" } },
    );
    expect(range.status).toBe(206);
    expect(range.body.toString()).toBe("ak");
    expect(
      (
        await ownerRequest(port, `/api/workspace/${workspace.id}/source`, {
          headers: { ...auth, Range: "bytes=9-" },
        })
      ).status,
    ).toBe(416);
    expect(media).toHaveBeenCalledTimes(1);
    expect(
      (
        await ownerRequest(port, `/api/workspace/${workspace.id}`, {
          method: "DELETE",
          headers: auth,
        })
      ).status,
    ).toBe(204);
    expect(await readdir(root)).toEqual([]);
    expect(await readdir(directory)).toContain("saved-original.mp4");
  });
  it("rejects source limits, invalid jobs, and traversal before native dispatch", async () => {
    expect(
      (
        await ownerRequest(port, "/api/source", {
          method: "POST",
          headers: { ...auth, "Content-Type": "text/plain" },
          body: "fake",
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await ownerRequest(port, "/api/workspace/../../private", {
          headers: auth,
        })
      ).status,
    ).toBe(404);
    expect(
      ownerMediaJobSchema.safeParse({
        workspaceId: "../private",
        operation: "inspect",
      }).success,
    ).toBe(false);
    expect(
      ownerMediaJobSchema.safeParse({
        workspaceId: crypto.randomUUID(),
        operation: "inspect",
        path: "private",
      }).success,
    ).toBe(false);
    expect(OWNER_LIMITS.sourceBytes).toBe(10 * 1024 ** 3);
    expect(media).toHaveBeenCalledTimes(0);
  });
  it("does not delete a source during native work; close cancels and drains before cleanup", async () => {
    const workspace = await upload();
    const chosen = await selection(workspace.id);
    let entered!: () => void,
      drained = false;
    const started = new Promise<void>((done) => {
      entered = done;
    });
    media.mockImplementationOnce(async (_job, signal) => {
      entered();
      await new Promise<void>((done) =>
        signal.addEventListener(
          "abort",
          () => {
            drained = true;
            done();
          },
          { once: true },
        ),
      );
      throw new Error("canceled");
    });
    const active = ownerRequest(
      port,
      `/api/workspace/${workspace.id}/portrait`,
      {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify(chosen),
      },
    ).catch(() => undefined);
    await started;
    expect(
      (
        await ownerRequest(port, `/api/workspace/${workspace.id}`, {
          method: "DELETE",
          headers: auth,
        })
      ).status,
    ).toBe(409);
    await host.close();
    await active;
    expect(drained).toBe(true);
    expect(media).toHaveBeenCalledTimes(2);
  });
  it("locks analysis inputs and drains cancellation before source cleanup", async () => {
    const workspace = await upload();
    let entered!: () => void,
      drained = false;
    const started = new Promise<void>((done) => {
      entered = done;
    });
    analysis.transcribe.mockImplementationOnce(async (_workspace, signal) => {
      entered();
      await new Promise<void>((done) =>
        signal.addEventListener(
          "abort",
          () => {
            drained = true;
            done();
          },
          { once: true },
        ),
      );
      signal.throwIfAborted();
      return [];
    });
    const active = analyze(workspace.id).catch(() => undefined);
    await started;
    expect((await analyze(workspace.id)).status).toBe(409);
    expect(
      (
        await ownerRequest(port, `/api/workspace/${workspace.id}`, {
          method: "DELETE",
          headers: auth,
        })
      ).status,
    ).toBe(409);
    await host.close();
    await active;
    expect(drained).toBe(true);
    expect(analysis.transcribe).toHaveBeenCalledTimes(1);
    expect(analysis.select).toHaveBeenCalledTimes(0);
  });
});

it("confines scratch and rejects junctions without touching saved inputs", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-confinement-"));
  const outside = await mkdtemp(join(tmpdir(), "clipbuilder-preserve-"));
  try {
    await expect(confinedPath(root, "..", "outside")).rejects.toThrow(
      "invalid_path",
    );
    await symlink(
      outside,
      join(root, "escape"),
      process.platform === "win32" ? "junction" : "dir",
    );
    await expect(confinedPath(root, "escape", "source.mp4")).rejects.toThrow(
      "invalid_path",
    );
    const files = new WorkspaceFiles(root);
    const id = await files.create();
    await expect(
      files.file("00000000-0000-4000-8000-000000000000", "source.mp4"),
    ).rejects.toThrow();
    await files.remove(id);
    expect(await readdir(outside)).toEqual([]);
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(outside, { recursive: true, force: true });
  }
});

it("requires explicit fake/paid-off and strips inherited credentials from children", () => {
  expect(() =>
    assertOwnerFakeMode({ FAKE_MODE: "true", PAID_DEMO_ENABLED: "fake" }),
  ).toThrow();
  expect(() =>
    assertOwnerFakeMode({ FAKE_MODE: "true", PAID_DEMO_ENABLED: "false" }),
  ).not.toThrow();
  const environment = nativeEnvironment("synthetic");
  expect(environment.PAID_DEMO_ENABLED).toBe("false");
  expect(environment.GOOGLE_APPLICATION_CREDENTIALS).toBeUndefined();
  expect(environment.GEMINI_API_KEY).toBeUndefined();
});

it("cancels worker work separately and waits for the worker response before host cleanup", async () => {
  let finish!: (response: Response) => void;
  const transport = vi.fn<typeof fetch>(async (input) => {
    if (String(input).endsWith("/cancel")) {
      finish(new Response(null, { status: 400 }));
      return new Response(null, { status: 204 });
    }
    return new Promise<Response>((done) => {
      finish = done;
    });
  });
  const controller = new AbortController();
  const operation = localWorkerPort(
    4200,
    "synthetic-token",
    transport,
  )(
    {
      workspaceId: crypto.randomUUID(),
      operation: "portrait",
      cut: { startFrame: 0, endFrame: 30 },
      fingerprint: "a".repeat(64),
    },
    controller.signal,
  );
  controller.abort();
  await expect(operation).rejects.toThrow("media_unavailable");
  expect(transport).toHaveBeenCalledTimes(2);
  expect(
    transport.mock.calls.every(([url]) =>
      String(url).startsWith("http://127.0.0.1:4200/"),
    ),
  ).toBe(true);
});
