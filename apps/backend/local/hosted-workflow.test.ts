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
import { demoUsageFixture } from "../../../test/demo-usage-fixture.ts";
import type { HostedDemoUsage } from "./demo-usage.ts";
let root: string, flow: ReturnType<typeof createHostedEditingWorkflow>;
let now: number;
let usage: HostedDemoUsage;
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
    if (job.operation === "clip-preview") {
      const frames = job.cut.endFrame - job.cut.startFrame;
      await writeFile(
        join(root, job.workspaceId, `${job.clipId}.source.mp4`),
        "synthetic-preview",
      );
      return {
        operation: "clip-preview",
        frames,
        bytes: 17,
        durationMs: Math.round((frames * 1000) / 30),
      };
    }
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
  usage = demoUsageFixture(() => now).usage;
  flow = createHostedEditingWorkflow({
    usage,
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
    req.headers["x-clipbuilder-client-ip"] ??= "192.0.2.1";
    void flow.dispatch(req, res);
  });
const start = async (app: ReturnType<typeof server>, ip = "192.0.2.1") => {
  const response = await request(app)
    .post("/session")
    .set({
      Origin: origin,
      "Sec-Fetch-Site": "same-origin",
      "X-ClipBuilder-Client-IP": ip,
    })
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
    "X-ClipBuilder-Client-IP": ip,
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
    `/workspace/${randomUUID()}/portrait`,
    `/workspace/${randomUUID()}/clips/${randomUUID()}/youtube-audio`,
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
  expect((await settled()).clips[0].state).toBe("review-ready");
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
  expect((await settled()).clips[0].outputs).toEqual([]);
  expect(
    (await request(app).get(`${base}/clips/${failed.id}/output/0`).set(headers))
      .status,
  ).toBe(404);
  expect(
    (
      await request(app)
        .post(`${base}/clips/${failed.id}/render`)
        .set(headers)
        .send({ operationId: randomUUID(), expectedRevision: 0 })
    ).status,
  ).toBe(202);
  expect((await settled()).clips[0].state).toBe("ready");
  // No download is needed to consume the trial; the active editor stays usable.
  const beforeDownload = await request(app)
    .get("/session")
    .set({ Origin: origin, "Sec-Fetch-Site": "same-origin" });
  expect(beforeDownload.body).toMatchObject({
    active: false,
    limited: true,
    retryAt: now + 86_400_000,
  });
  expect(media).toHaveBeenCalledTimes(4);
  expect(plan).toHaveBeenCalledTimes(1);
  expect(image).toHaveBeenCalledTimes(1);

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
  const denied = await request(app)
    .post("/session")
    .set({ Origin: origin, "Sec-Fetch-Site": "same-origin" })
    .send({ startNonce: randomUUID(), turnstileToken: "synthetic-proof" });
  expect(denied.status).toBe(429);
  expect(denied.body.limited).toBe(true);
  const other = await start(app, "192.0.2.2");
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
    limited: false,
    retryAt: null,
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
    .set("X-ClipBuilder-Client-IP", "192.0.2.1")
    .set({ Origin: origin, "Sec-Fetch-Site": "same-origin" });
  expect(response.status).toBe(200);
  expect(response.body.sourceMode).toBeNull();
  expect((await request(app).get("/v1/local/capabilities")).status).toBe(404);
  expect(media).not.toHaveBeenCalled();
});

it("enforces mixed manual/AI slots and three cumulative clips against direct API requests", async () => {
  const app = server(),
    headers = await start(app);
  const upload = await request(app)
    .post("/upload")
    .set(headers)
    .send({ bytes: 9 });
  await request(app)
    .put(`/upload/${upload.body.uploadId}/0`)
    .set(headers)
    .set("Content-Type", "application/octet-stream")
    .send(Buffer.from("synthetic"));
  const opened = await request(app)
    .post("/open/video")
    .set(headers)
    .send({ uploadId: upload.body.uploadId });
  const base = `/workspace/${opened.body.workspace.id}`;
  const inputs = {
    sourceRevision: 0,
    policyRevision: 0,
    manualOnly: false,
    aiCount: 10,
    aiDuration: { minMs: 10000, maxMs: 60000 },
    ranges: Array.from({ length: 2 }, (_, i) => ({
      id: randomUUID(),
      startMs: i * 10000,
      endMs: (i + 1) * 10000,
    })),
  };
  const mixed = await request(app)
    .post(base + "/analysis")
    .set(headers)
    .send(inputs);
  expect(mixed.status).toBe(200);
  expect(mixed.body.inputs.aiCount).toBe(1);
  expect(
    mixed.body.manual.length + mixed.body.suggestions.length,
  ).toBeLessThanOrEqual(3);
  const analysis = await request(app)
    .post(base + "/analysis")
    .set(headers)
    .send({
      ...inputs,
      policyRevision: 1,
      ranges: Array.from({ length: 10 }, (_, i) => ({
        id: randomUUID(),
        startMs: i * 1000,
        endMs: (i + 1) * 1000,
      })),
    });
  expect(analysis.status).toBe(200);
  expect(analysis.body.manual).toHaveLength(3);
  expect(analysis.body.suggestions).toHaveLength(0);
  expect(analysis.body.inputs.manualOnly).toBe(true);
  const batch = {
    operationId: randomUUID(),
    analysisId: analysis.body.id,
    sourceRevision: 0,
    policyRevision: 1,
    momentIds: analysis.body.manual.map((moment: { id: string }) => moment.id),
  };
  expect(
    (
      await request(app)
        .post(base + "/clips")
        .set(headers)
        .send(batch)
    ).status,
  ).toBe(202);
  await vi.waitFor(async () =>
    expect(
      (
        await request(app)
          .get(base + "/clips")
          .set(headers)
      ).body.active,
    ).toBe(false),
  );
  expect(plan).toHaveBeenCalledTimes(3);
  const current = await request(app)
    .post(base + "/analysis")
    .set(headers)
    .send({
      ...inputs,
      policyRevision: 2,
      manualOnly: true,
      ranges: [{ id: randomUUID(), startMs: 30000, endMs: 31000 }],
    });
  const before = plan.mock.calls.length;
  expect(
    (
      await request(app)
        .post(base + "/clips")
        .set(headers)
        .send({
          ...batch,
          operationId: randomUUID(),
          analysisId: current.body.id,
          policyRevision: 2,
          momentIds: [current.body.manual[0].id],
        })
    ).status,
  ).toBe(429);
  expect(plan).toHaveBeenCalledTimes(before);
  expect(
    (await request(app).post("/upload").set(headers).send({ bytes: 9 })).status,
  ).toBe(409);
  const calls = media.mock.calls.length;
  expect(
    (
      await request(app)
        .post(base + "/portrait")
        .set(headers)
        .send({})
    ).status,
  ).toBe(404);
  expect(media).toHaveBeenCalledTimes(calls);
  await request(app).delete(base).set(headers);
  expect(
    (
      await request(app)
        .post("/open/video")
        .set(headers)
        .send({ uploadId: upload.body.uploadId })
    ).status,
  ).toBe(400);
});

it("dispatches no native or provider work when durable charging fails", async () => {
  const app = server(),
    headers = await start(app);
  vi.spyOn(usage, "charge").mockRejectedValue(
    new Error("synthetic_ledger_offline"),
  );
  const upload = await request(app)
    .post("/upload")
    .set(headers)
    .send({ bytes: 9 });
  await request(app)
    .put(`/upload/${upload.body.uploadId}/0`)
    .set(headers)
    .set("Content-Type", "application/octet-stream")
    .send(Buffer.from("synthetic"));
  expect(
    (
      await request(app)
        .post("/open/video")
        .set(headers)
        .send({ uploadId: upload.body.uploadId })
    ).status,
  ).toBe(400);
  expect(media).not.toHaveBeenCalled();
  expect(transcribe).not.toHaveBeenCalled();
  expect(plan).not.toHaveBeenCalled();
  expect(image).not.toHaveBeenCalled();
  expect(
    (
      await request(app).get("/capabilities").set({
        Origin: origin,
        "Sec-Fetch-Site": "same-origin",
        "X-ClipBuilder-Client-IP": "forged, 192.0.2.1",
      })
    ).status,
  ).toBe(503);
});

it("rechecks session capacity after asynchronous durable reservation", async () => {
  const app = server(),
    original = usage.reserve.bind(usage);
  let waiting = 0,
    release: () => void = () => {};
  const barrier = new Promise<void>((done) => {
    release = done;
  });
  vi.spyOn(usage, "reserve").mockImplementation(async (...args) => {
    await original(...args);
    if (++waiting === 2) release();
    await barrier;
  });
  const replies = await Promise.all(
    ["192.0.2.1", "192.0.2.2"].map((ip) =>
      request(app)
        .post("/session")
        .set({
          Origin: origin,
          "Sec-Fetch-Site": "same-origin",
          "X-ClipBuilder-Client-IP": ip,
        })
        .send({ startNonce: randomUUID(), turnstileToken: "synthetic-proof" }),
    ),
  );
  expect(replies.map((reply) => reply.status).sort()).toEqual([201, 429]);
  expect(media).not.toHaveBeenCalled();
  expect(plan).not.toHaveBeenCalled();
});

it("does not publish a new host when shutdown wins during durable admission", async () => {
  const app = server(),
    original = usage.reserve.bind(usage);
  let reserved: () => void = () => {},
    release: () => void = () => {};
  const entered = new Promise<void>((done) => {
      reserved = done;
    }),
    barrier = new Promise<void>((done) => {
      release = done;
    });
  vi.spyOn(usage, "reserve").mockImplementation(async (...args) => {
    await original(...args);
    reserved();
    await barrier;
  });
  const response = request(app)
    .post("/session")
    .set({ Origin: origin, "Sec-Fetch-Site": "same-origin" })
    .send({ startNonce: randomUUID(), turnstileToken: "synthetic-proof" })
    .then((value) => value);
  await entered;
  await flow.close();
  release();
  expect((await response).status).toBe(503);
  expect(media).not.toHaveBeenCalled();
  expect(plan).not.toHaveBeenCalled();
});
