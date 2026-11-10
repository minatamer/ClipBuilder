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
import type { OwnerAnalysisPorts } from "./analysis.ts";
import type { HookTitlePlanning } from "./hook-title-planner.ts";
import { ownerClipListSchema } from "../../../packages/contracts/local/clips.ts";
import sharp from "sharp";
import { applyOwnerEdit } from "./edit-clip.ts";
let root: string, flow: ReturnType<typeof createHostedEditingWorkflow>;
let now: number;
let usage: HostedDemoUsage;
let boundedTranscription: boolean;
const origin = "https://frontend.run.app";
const media = vi.fn(),
  transcribe = vi.fn(fakeOwnerAnalysis.transcribe),
  transcribeCut = vi.fn<NonNullable<OwnerAnalysisPorts["transcribeCut"]>>(),
  select = vi.fn(fakeOwnerAnalysis.select),
  plan = vi.fn(fakeOwnerClipPreparation.plan),
  image = vi.fn(fakeOwnerClipPreparation.image),
  hookTitle = vi.fn<HookTitlePlanning>(async () => null),
  abuse = vi.fn(async () => true);
beforeEach(async () => {
  vi.clearAllMocks();
  boundedTranscription = false;
  now = 1000;
  root = await mkdtemp(join(tmpdir(), "clipbuilder-hosted-editing-test-"));
  media.mockImplementation(async (job) => {
    if (job.operation === "normalize-video") {
      const video = Buffer.from("synthetic-broll"),
        audio = Buffer.from("synthetic-audio");
      await writeFile(
        join(root, job.workspaceId, `${job.assetId}.video.mp4`),
        video,
      );
      await writeFile(
        join(root, job.workspaceId, `${job.audioAssetId}.wav`),
        audio,
      );
      return {
        operation: "normalize-video",
        asset: {
          id: job.assetId,
          digest: createHash("sha256").update(video).digest("hex"),
          bytes: video.length,
          width: 320,
          height: 180,
          frames: 90,
          hasAudio: true,
          audioAssetId: job.audioAssetId,
        },
        audioAsset: {
          id: job.audioAssetId,
          digest: createHash("sha256").update(audio).digest("hex"),
          bytes: audio.length,
          frames: 90,
          durationMs: 3000,
        },
      };
    }
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
  flow = createFlow();
});
function createFlow(
  overrides: Partial<Parameters<typeof createHostedEditingWorkflow>[0]> = {},
) {
  return createHostedEditingWorkflow({
    usage,
    root,
    origin,
    ttlMs: 5000,
    now: () => now,
    aiMode: "synthetic-ai",
    hookTitleSuggestions: true,
    siteKey: "synthetic-site-key",
    sourceLimits: { bytes: 100, durationMs: 60000 },
    abuse: { verify: abuse },
    capacity: async () => {},
    media,
    providers: () => ({
      analysis: {
        ...fakeOwnerAnalysis,
        transcribe,
        select,
        ...(boundedTranscription ? { transcribeCut } : {}),
      },
      clipPreparation: { ...fakeOwnerClipPreparation, plan, image, hookTitle },
    }),
    ...overrides,
  });
}
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
async function preparedClip(
  app: ReturnType<typeof server>,
  headers: Awaited<ReturnType<typeof start>>,
  framing?: "fit",
) {
  const upload = await request(app)
    .post("/upload")
    .set(headers)
    .send({ bytes: 9 });
  expect(upload.status).toBe(201);
  expect(
    (
      await request(app)
        .put(`/upload/${upload.body.uploadId}/0`)
        .set(headers)
        .set("Content-Type", "application/octet-stream")
        .send(Buffer.from("synthetic"))
    ).status,
  ).toBe(200);
  const opened = await request(app)
    .post("/open/video")
    .set(headers)
    .send({ uploadId: upload.body.uploadId });
  expect(opened.status).toBe(200);
  const base = `/workspace/${opened.body.workspace.id}`;
  const analysis = await request(app)
    .post(base + "/analysis")
    .set(headers)
    .send({
      sourceRevision: 0,
      policyRevision: 0,
      ranges: [{ id: randomUUID(), startMs: 1000, endMs: 2000 }],
      aiDuration: { minMs: 10000, maxMs: 10000 },
      manualOnly: true,
    });
  expect(analysis.status).toBe(200);
  expect(
    (
      await request(app)
        .post(base + "/clips")
        .set(headers)
        .send({
          operationId: randomUUID(),
          analysisId: analysis.body.id,
          sourceRevision: 0,
          policyRevision: 0,
          momentIds: [analysis.body.manual[0].id],
          ...(framing ? { framing } : {}),
        })
    ).status,
  ).toBe(202);
  for (let index = 0; index < 200; index++) {
    const response = await request(app)
      .get(base + "/clips")
      .set(headers);
    expect(response.status).toBe(200);
    const list = ownerClipListSchema.parse(response.body);
    if (!list.active) {
      const clip = list.clips[0]!;
      expect(clip.state).toBe("review-ready");
      expect(clip.framing).toBe("tracked");
      return { base, clip };
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error("synthetic_timeout");
}

it("admits hosted uploaded videos, streams isolated assets, and exports layered picture/video camera edits without new AI", async () => {
  const app = server(),
    headers = await start(app);
  const { base, clip } = await preparedClip(app, headers, "fit");
  expect(clip.framing).toBe("tracked");
  expect(plan).toHaveBeenCalledTimes(1);
  const counts = {
    transcribe: transcribe.mock.calls.length,
    image: image.mock.calls.length,
  };
  const path = `${base}/clips/${clip.id}`;
  const before = media.mock.calls.length;
  expect(
    (
      await request(app)
        .post(path + "/video")
        .set({ ...headers, "X-CSRF-Token": "invalid" })
        .set("Content-Type", "video/mp4")
        .send(Buffer.from("synthetic"))
    ).status,
  ).toBe(403);
  expect(
    (
      await request(app)
        .post(path + "/video")
        .set(headers)
        .set("Content-Type", "text/plain")
        .send("synthetic")
    ).status,
  ).toBe(400);
  expect(media).toHaveBeenCalledTimes(before);
  const uploaded = await request(app)
    .post(path + "/video")
    .set(headers)
    .set("Content-Type", "video/mp4")
    .send(Buffer.from("synthetic"));
  expect(uploaded.status).toBe(200);
  const video = ownerClipListSchema.parse(uploaded.body).clips[0]!
    .videoAssets![0]!;
  const assetPath = `${base}/video-assets/${video.id}`;
  expect(
    (
      await request(app)
        .get(assetPath)
        .set({ ...headers, Cookie: "__Host-clipping_editor=" + "x".repeat(43) })
    ).status,
  ).toBe(401);
  const streamed = await request(app)
    .get(assetPath)
    .set(headers)
    .set("Range", "bytes=0-8");
  expect(streamed.status).toBe(206);
  expect(streamed.headers["content-type"]).toContain("video/mp4");
  expect(streamed.headers["cache-control"]).toContain("no-store");
  const png = await sharp({
    create: { width: 64, height: 64, channels: 4, background: "#8833aa" },
  })
    .png()
    .toBuffer();
  const pictured = await request(app)
    .post(path + "/picture")
    .set(headers)
    .set("Content-Type", "image/png")
    .send(png);
  expect(pictured.status).toBe(200);
  const current = ownerClipListSchema.parse(pictured.body).clips[0]!;
  const effect = {
    startFrame: 0,
    endFrame: 30,
    zoom: 1.4,
    fromX: 0.2,
    fromY: 0.5,
    toX: 0.8,
    toY: 0.5,
  };
  const visual = {
    id: randomUUID(),
    assetId: video.id,
    startFrame: 0,
    endFrame: 30,
    box: { x: 0.1, y: 0.1, width: 0.5, height: 0.3 },
    fit: "cover",
    presentation: "full-frame",
    effect,
    video: { offsetFrame: 0, sourceEndFrame: 90, volume: 35, muted: false },
  };
  const inset = {
    ...visual,
    id: randomUUID(),
    presentation: "inset",
    video: { ...visual.video, offsetFrame: 15, muted: true },
  };
  const picture = {
    ...visual,
    id: randomUUID(),
    assetId: current.assets[0]!.id,
    presentation: "inset",
    video: undefined,
  };
  const visualIds = [
    ...current.edit!.visuals.map((cue) => cue.id),
    visual.id,
    inset.id,
    picture.id,
  ];
  const editRequest = {
    operationId: randomUUID(),
    expectedRevision: current.revision,
    baseHash: current.baseHash,
    operations: [
      ...[visual, inset, picture].map((cue) => ({
        kind: "visual-upsert",
        cue,
      })),
      { kind: "visual-order", ids: visualIds },
    ],
  };
  applyOwnerEdit(current, editRequest, { width: 320, height: 180 });
  const edited = await request(app)
    .post(path + "/edit")
    .set(headers)
    .send(editRequest);
  expect(edited.status).toBe(200);
  const saved = ownerClipListSchema.parse(edited.body).clips[0]!;
  expect(saved.edit!.visuals.map((cue) => cue.id)).toEqual(visualIds);
  expect(
    (
      await request(app)
        .post(path + "/render")
        .set(headers)
        .send({ operationId: randomUUID(), expectedRevision: saved.revision })
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
  const exportJob = media.mock.calls
    .map(([job]) => job)
    .findLast((job) => job.operation === "clip");
  expect(exportJob?.operation).toBe("clip");
  if (exportJob?.operation !== "clip") throw Error("missing_synthetic_export");
  expect(exportJob.overlay.visuals).toHaveLength(visualIds.length);
  expect(exportJob.overlay.visuals.at(-1)!.effect).toEqual(effect);
  expect(exportJob.overlay.audio?.cues).toHaveLength(
    (current.edit!.audio?.cues.length ?? 0) + 1,
  );
  expect(
    exportJob.overlay.audio?.cues.find((cue) => cue.id === visual.id)?.volume,
  ).toBe(35);
  expect(exportJob.overlay.captions).toEqual(clip.base!.overlay.captions);
  expect(transcribe).toHaveBeenCalledTimes(counts.transcribe);
  expect(image).toHaveBeenCalledTimes(counts.image);
  expect(plan).toHaveBeenCalledTimes(1);
  expect(
    media.mock.calls.filter(([job]) => job.operation === "normalize-video"),
  ).toHaveLength(1);
  now += 5001;
  expect((await request(app).get(assetPath).set(headers)).status).toBe(401);
});
it.each([false, true])(
  "advertises hosted Hook titles only when configured (%s), with Find visuals always off",
  async (enabled) => {
    await flow.close();
    flow = createFlow({ hookTitleSuggestions: enabled });
    const app = server(),
      headers = await start(app);
    const response = await request(app).get("/capabilities").set(headers);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      hookTitleSuggestions: enabled,
      visualDiscovery: false,
    });
    if (!enabled)
      expect(
        (
          await request(app)
            .post(`/workspace/${randomUUID()}/clips/${randomUUID()}/hook-title`)
            .set(headers)
            .send({})
        ).status,
      ).toBe(404);
    expect(hookTitle).not.toHaveBeenCalled();
    expect(media).not.toHaveBeenCalled();
    expect(transcribe).not.toHaveBeenCalled();
  },
);
it.each([false, true])(
  "meters each new hosted Hook title, reuses receipts, and refuses Find visuals even with exemption (%s)",
  async (exempt) => {
    const identity = usage.identity.bind(usage);
    vi.spyOn(usage, "identity").mockImplementation((ip) => ({
      ...identity(ip),
      exempt,
    }));
    const app = server(),
      headers = await start(app);
    const { base, clip } = await preparedClip(app, headers);
    expect(hookTitle).not.toHaveBeenCalled();
    const charge = vi.spyOn(usage, "charge"),
      path = `${base}/clips/${clip.id}/hook-title`,
      operation = {
        operationId: randomUUID(),
        expectedRevision: clip.revision,
        sourceRevision: 0,
        hook: { startFrame: 0, endFrame: 15 },
      };
    for (const [invalid, status] of [
      [{ ...operation, expectedRevision: clip.revision + 1 }, 409],
      [{ ...operation, hook: { startFrame: 0, endFrame: 31 } }, 400],
    ] as const)
      expect(
        (await request(app).post(path).set(headers).send(invalid)).status,
      ).toBe(status);
    expect(charge).not.toHaveBeenCalled();
    const first = await request(app).post(path).set(headers).send(operation);
    expect(first.status).toBe(200);
    expect(first.body).toMatchObject({
      clipId: clip.id,
      title: null,
      hook: operation.hook,
    });
    const replay = await request(app).post(path).set(headers).send(operation);
    expect(replay.status).toBe(200);
    expect(replay.body).toEqual(first.body);
    expect(hookTitle).toHaveBeenCalledTimes(1);
    expect(charge.mock.calls.map(([, kind]) => kind)).toEqual(["provider"]);
    expect(
      (
        await request(app)
          .post(`${base}/clips/${clip.id}/visuals`)
          .set(headers)
          .send({ operationId: randomUUID(), expectedRevision: clip.revision })
      ).status,
    ).toBe(404);
    expect(charge).toHaveBeenCalledTimes(1);
    expect(transcribe).toHaveBeenCalledTimes(1);
    expect(plan).toHaveBeenCalledTimes(1);
    expect(image).toHaveBeenCalledTimes(1);
    expect(media).toHaveBeenCalledTimes(2);
  },
);
it.each(["ledger", "budget", "provider"] as const)(
  "keeps hosted title %s failures bounded without automatic retry",
  async (failure) => {
    await flow.close();
    flow = createFlow({ providerCalls: 5 });
    const app = server(),
      headers = await start(app);
    const { base, clip } = await preparedClip(app, headers);
    const charge = vi.spyOn(usage, "charge"),
      path = `${base}/clips/${clip.id}/hook-title`,
      operation = {
        operationId: randomUUID(),
        expectedRevision: clip.revision,
        sourceRevision: 0,
        hook: { startFrame: 0, endFrame: 15 },
      };
    if (failure === "ledger")
      charge.mockRejectedValueOnce(Error("synthetic_ledger_failure"));
    if (failure === "provider")
      hookTitle.mockRejectedValueOnce(Error("synthetic_title_failure"));
    const first = await request(app).post(path).set(headers).send(operation);
    expect(first.status).toBe(failure === "budget" ? 200 : 400);
    expect(hookTitle).toHaveBeenCalledTimes(failure === "ledger" ? 0 : 1);
    // Four preparation reservations plus the first title exhaust the five-operation runtime budget.
    expect(
      (
        await request(app)
          .post(path)
          .set(headers)
          .send({ ...operation, operationId: randomUUID() })
      ).status,
    ).toBe(400);
    if (failure !== "budget")
      expect(
        (await request(app).post(path).set(headers).send(operation)).status,
      ).toBe(400);
    expect(charge).toHaveBeenCalledTimes(1);
    expect(hookTitle).toHaveBeenCalledTimes(failure === "ledger" ? 0 : 1);
  },
);
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
    `/workspace/${randomUUID()}/clips/${randomUUID()}/visuals`,
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
it.each([false, true])(
  "refuses local-only all-moments requests before AI work, including hosted exemption (%s)",
  async (exempt) => {
    const identity = usage.identity.bind(usage);
    vi.spyOn(usage, "identity").mockImplementation((ip) => ({
      ...identity(ip),
      exempt,
    }));
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
    expect(opened.status).toBe(200);
    const result = await request(app)
      .post(`/workspace/${opened.body.workspace.id}/analysis`)
      .set(headers)
      .send({
        sourceRevision: 0,
        policyRevision: 0,
        ranges: [],
        aiDuration: { minMs: 10000, maxMs: 60000 },
        manualOnly: false,
        aiCount: "all",
      });
    expect(result.status).toBe(400);
    expect(transcribe).not.toHaveBeenCalled();
    expect(select).not.toHaveBeenCalled();
  },
);
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
  const forbidden = await request(app)
    .post(base + "/analysis")
    .set(headers)
    .send({
      sourceRevision: 0,
      policyRevision: 0,
      ranges: [],
      aiDuration: { minMs: 10000, maxMs: 60000 },
      manualOnly: false,
      aiCount: "all",
    });
  expect(forbidden.status).toBe(400);
  expect(transcribe).not.toHaveBeenCalled();
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

it.each([false, true])(
  "charges bounded manual transcription before dispatch and retains zero-call cache reuse (ledger fails=%s)",
  async (fails) => {
    boundedTranscription = true;
    transcribeCut.mockResolvedValue([
      {
        id: "w_000001",
        text: "Synthetic",
        punctuatedText: "Synthetic",
        startMs: 1100,
        endMs: 1500,
        speakerId: null,
        confidence: 1,
      },
    ]);
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
    expect(opened.status).toBe(200);
    const charge = vi.spyOn(usage, "charge");
    if (fails)
      charge.mockRejectedValueOnce(new Error("synthetic_ledger_offline"));
    const path = `/workspace/${opened.body.workspace.id}/analysis`;
    const result = await request(app)
      .post(path)
      .set(headers)
      .send({
        sourceRevision: 0,
        policyRevision: 0,
        ranges: [{ id: randomUUID(), startMs: 1000, endMs: 2000 }],
        aiDuration: { minMs: 10000, maxMs: 10000 },
        manualOnly: true,
      });
    expect(charge).toHaveBeenCalledExactlyOnceWith(
      expect.any(String),
      "provider",
    );
    expect(transcribe).not.toHaveBeenCalled();
    expect(select).not.toHaveBeenCalled();
    if (fails) {
      expect(result.status).toBe(400);
      expect(transcribeCut).not.toHaveBeenCalled();
    } else {
      expect(result.status).toBe(200);
      expect(transcribeCut).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ id: opened.body.workspace.id }),
        { startFrame: 30, endFrame: 60 },
        expect.any(AbortSignal),
      );
      const repeated = await request(app)
        .post(path)
        .set(headers)
        .send(result.body.inputs);
      expect(repeated.status).toBe(200);
      expect(repeated.body.calls).toEqual({ transcription: 0, selection: 0 });
      expect(transcribeCut).toHaveBeenCalledTimes(1);
      expect(charge).toHaveBeenCalledTimes(1);
    }
  },
);

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
