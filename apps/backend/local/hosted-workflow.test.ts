import { afterEach, beforeEach, expect, it, vi } from "vitest";
import request from "supertest";
import { z } from "zod";
import { createServer } from "node:http";
import { createHash, randomUUID } from "node:crypto";
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  createHostedEditingWorkflow,
  EDITING_CSRF_COOKIE,
} from "./hosted-workflow.ts";
import { fakeOwnerAnalysis } from "./fake-analysis.ts";
import { editorContentFixture as fakeOwnerClipPreparation } from "../../../test/owner-content-fixture.ts";
import { createApplication } from "../src/app.ts";
import { loadConfig } from "../src/config/loadConfig.ts";
let root: string, flow: ReturnType<typeof createHostedEditingWorkflow>;
let now: number;
const origin = "https://frontend.run.app";
const media = vi.fn(),
  transcribe = vi.fn(fakeOwnerAnalysis.transcribe),
  plan = vi.fn(fakeOwnerClipPreparation.plan),
  image = vi.fn(fakeOwnerClipPreparation.image),
  abuse = vi.fn(async () => true);
beforeEach(async () => {
  vi.clearAllMocks();
  now = 1000;
  root = await mkdtemp(join(tmpdir(), "clipbuilder-hosted-editing-test-"));
  media.mockImplementation(async (job) => {
    if (job.operation === "inspect")
      return {
        operation: "inspect",
        source: {
          fingerprint: createHash("sha256").update("synthetic").digest("hex"),
          bytes: 9,
          durationMs: 60000,
          width: 320,
          height: 180,
          fps: 30,
        },
      };
    if (job.operation !== "clip")
      throw new Error("unexpected_native_operation");
    await writeFile(
      join(root, job.workspaceId, `${job.clipId}.r${job.renderRevision}.mp4`),
      "synthetic-output",
    );
    return {
      operation: "clip",
      frames: job.overlay.frames,
      bytes: 16,
      durationMs: Math.round((job.overlay.frames * 1000) / 30),
    };
  });
  flow = createHostedEditingWorkflow({
    root,
    origin,
    ttlMs: 5000,
    now: () => now,
    aiMode: "synthetic-ai",
    siteKey: "synthetic-site-key",
    sourceLimits: { bytes: 100, durationMs: 60000 },
    abuse: { verify: abuse },
    capacity: async () => {},
    media,
    providers: () => ({
      analysis: { ...fakeOwnerAnalysis, transcribe },
      clipPreparation: { ...fakeOwnerClipPreparation, plan, image },
    }),
  });
});
afterEach(async () => {
  await flow.close();
  expect(await readdir(root)).toEqual([]);
  await rm(root, { recursive: true, force: true });
});
const server = () =>
  createServer((req, res) => {
    void flow.dispatch(req, res);
  });
const start = async (app: ReturnType<typeof server>) => {
  const response = await request(app)
    .post("/session")
    .set({ Origin: origin, "Sec-Fetch-Site": "same-origin" })
    .send({ startNonce: randomUUID(), turnstileToken: "synthetic-proof" });
  expect(response.status).toBe(201);
  const setCookies = z.array(z.string()).parse(response.headers["set-cookie"]);
  const cookies = setCookies.map((value) => value.split(";")[0]!);
  expect(setCookies.join(";")).toMatch(/Secure; HttpOnly; SameSite=Strict/);
  return {
    Origin: origin,
    "Sec-Fetch-Site": "same-origin",
    Cookie: cookies.join("; "),
    "X-CSRF-Token": cookies
      .find((cookie) => cookie.startsWith(EDITING_CSRF_COOKIE + "="))!
      .split("=")[1]!,
  };
};
it("rejects every hosted YouTube/library/agent path before proof verification, media or AI", async () => {
  const app = server();
  for (const path of [
    "/sources",
    "/sources/lookup",
    "/sources/metadata",
    "/sources/import",
    "/sources/open",
    "/sources/state",
    "/sources/cancel",
    "/open/draft",
    "/drafts",
    "/agent/status",
    "/shutdown",
  ]) {
    expect(
      (
        await request(app)
          .post(path)
          .set({ Origin: origin, "Sec-Fetch-Site": "same-origin" })
          .send({ url: "https://www.youtube.com/watch?v=synthetic00" })
      ).status,
    ).toBe(404);
  }
  expect(media).not.toHaveBeenCalled();
  expect(transcribe).not.toHaveBeenCalled();
  expect(abuse).not.toHaveBeenCalled();
});
it("runs upload, preparation and explicit retry through isolated normal editing without repeating AI", async () => {
  const app = server(),
    headers = await start(app);
  expect(
    (
      await request(app)
        .post("/upload")
        .set({ ...headers, "X-CSRF-Token": "wrong" })
        .send({ bytes: 9 })
    ).status,
  ).toBe(403);
  const initialized = await request(app)
    .post("/upload")
    .set(headers)
    .send({ bytes: 9 });
  expect(initialized.status).toBe(201);
  const uploaded = await request(app)
    .put(`/upload/${initialized.body.uploadId}/0`)
    .set(headers)
    .set("Content-Type", "application/octet-stream")
    .send(Buffer.from("synthetic"));
  expect(uploaded.status).toBe(200);
  expect(media).not.toHaveBeenCalled();
  const opened = await request(app)
    .post("/open/video")
    .set(headers)
    .send({ uploadId: initialized.body.uploadId });
  expect(opened.status).toBe(200);
  const id = opened.body.workspace.id,
    base = `/workspace/${id}`;
  const firstAnalysis = await request(app)
    .post(base + "/analysis")
    .set(headers)
    .send({
      sourceRevision: 0,
      policyRevision: 0,
      ranges: [{ id: randomUUID(), startMs: 1000, endMs: 2000 }],
      aiDuration: { minMs: 10000, maxMs: 10000 },
      manualOnly: true,
    });
  expect(firstAnalysis.status).toBe(200);
  expect(firstAnalysis.body.calls).toEqual({ transcription: 1, selection: 0 });
  const analysis = await request(app)
    .post(base + "/analysis")
    .set(headers)
    .send(firstAnalysis.body.inputs);
  expect(analysis.status).toBe(200);
  expect(analysis.body.calls).toEqual({ transcription: 0, selection: 0 });
  media.mockRejectedValueOnce(new Error("synthetic_native_failure"));
  const prepared = await request(app)
    .post(base + "/clips")
    .set(headers)
    .send({
      operationId: randomUUID(),
      analysisId: analysis.body.id,
      sourceRevision: 0,
      policyRevision: 0,
      momentIds: [analysis.body.manual[0].id],
    });
  expect(prepared.status).toBe(202);
  async function settled() {
    for (let index = 0; index < 200; index++) {
      const response = await request(app)
        .get(base + "/clips")
        .set(headers);
      if (!response.body.active) return response.body;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    throw new Error("synthetic_timeout");
  }
  const failed = (await settled()).clips[0];
  expect(failed.state).toBe("failed");
  expect(failed.base).not.toBeNull();
  const operation = { operationId: randomUUID(), expectedRevision: 0 };
  expect(
    (
      await request(app)
        .post(`${base}/clips/${failed.id}/retry`)
        .set(headers)
        .send(operation)
    ).status,
  ).toBe(202);
  expect((await settled()).clips[0].state).toBe("ready");
  expect(
    (
      await request(app)
        .post(`${base}/clips/${failed.id}/retry`)
        .set(headers)
        .send(operation)
    ).status,
  ).toBe(202);
  expect(transcribe).toHaveBeenCalledTimes(1);
  expect(plan).toHaveBeenCalledTimes(1);
  expect(image).toHaveBeenCalledTimes(1);
  expect(media).toHaveBeenCalledTimes(3);
  expect(
    (await request(app).get(`${base}/clips/${failed.id}/output/0`).set(headers))
      .status,
  ).toBe(200);
  expect(
    (
      await request(app)
        .get(base)
        .set({ ...headers, Cookie: "__Host-clipping_editor=" + "x".repeat(43) })
    ).status,
  ).toBe(401);
  expect((await request(app).delete("/session").set(headers)).status).toBe(204);
  expect(await readdir(root)).toEqual([]);
  const other = await start(app);
  expect((await request(app).get(base).set(other)).status).toBe(404);
});
it("requires exact origin, bounds source size and expires the session without provider work", async () => {
  const app = server();
  expect(
    (
      await request(app).get("/capabilities").set({
        Origin: "https://attacker.invalid",
        "Sec-Fetch-Site": "same-origin",
      })
    ).status,
  ).toBe(403);
  const headers = await start(app);
  expect(
    (await request(app).post("/upload").set(headers).send({ bytes: 101 }))
      .status,
  ).toBe(400);
  now = 7000;
  expect((await request(app).get("/session").set(headers)).body).toEqual({
    active: false,
  });
  expect(media).not.toHaveBeenCalled();
  expect(transcribe).not.toHaveBeenCalled();
});
it("mounts hosted editing after frontend identity verification and preserves loopback-only owner APIs", async () => {
  const config = {
    ...loadConfig({
      NODE_ENV: "test",
      FAKE_MODE: "true",
      PAID_DEMO_ENABLED: "false",
    }),
    appEnv: "preview" as const,
  };
  const verify = vi.fn(async () => false),
    app = createApplication(config, undefined, { verify }, undefined, {
      current: flow,
    });
  expect(
    (
      await request(app)
        .get("/v1/editing/capabilities")
        .set({ Origin: origin, "Sec-Fetch-Site": "same-origin" })
    ).status,
  ).toBe(403);
  verify.mockResolvedValue(true);
  const response = await request(app)
    .get("/v1/editing/capabilities")
    .set({ Origin: origin, "Sec-Fetch-Site": "same-origin" });
  expect(response.status).toBe(200);
  expect(response.body.sourceMode).toBeNull();
  expect((await request(app).get("/v1/local/capabilities")).status).toBe(404);
  expect(media).not.toHaveBeenCalled();
});
