import {
  assemblyBundleSchema,
  developmentUploadResponseSchema,
  publicConfigResponseSchema,
  type OperationStatusV1,
} from "@clipbuilder/contracts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { composeBackend } from "../composition.js";
import { SampleSession } from "./sampleSession.js";
import { FakeClock } from "./fakeClock.js";
import { CONVERSATION_SAMPLE } from "./conversationSample.js";

async function finish(
  sample: SampleSession,
  token: string,
  initial: OperationStatusV1,
) {
  let current = initial;
  for (
    let attempt = 0;
    attempt < 12 && current.state !== "succeeded";
    attempt += 1
  )
    current = await sample.poll(token, current.operationId);
  expect(current.state).toBe("succeeded");
  return current;
}

describe("CL-004 complete development preview", () => {
  it("rejects a WebM upload before allocating or processing media", async () => {
    const authorize = vi.spyOn(SampleSession.prototype, "authorize");
    try {
      const composed = composeBackend({ FAKE_MODE: "true" });
      const agent = request.agent(composed.application);
      const origin = "http://localhost:3000";
      await agent
        .post("/v1/sample/sessions")
        .set("Origin", origin)
        .send({ mode: "upload" })
        .expect(201);
      await agent
        .post("/v1/sample/upload/authorize")
        .set("Origin", origin)
        .send({
          declaredBytes: 8192,
          declaredContentType: "video/webm",
          turnstileToken: "local-synthetic-fixture",
        })
        .expect(400);
      expect(authorize).not.toHaveBeenCalled();
    } finally {
      authorize.mockRestore();
    }
  });

  it.each(["missing", "expired"] as const)(
    "clears %s sessions idempotently before replacement input",
    (condition) => {
      const clock = new FakeClock();
      const sample = new SampleSession(clock);
      const original = sample.start(null, "upload");
      sample.authorize(original.token, {
        declaredBytes: 8192,
        declaredContentType: "video/mp4",
        turnstileToken: "local-synthetic-fixture",
      });
      if (condition === "missing") sample.clear(original.token);
      else {
        clock.advanceBy(7_200_001);
        expect(() => sample.evidence(original.token)).toThrow(
          "SESSION_EXPIRED",
        );
      }
      expect(() => sample.clear(original.token)).not.toThrow();
      expect(() => sample.clear(original.token)).not.toThrow();
      const replacement = sample.start(original.token, "upload");
      expect(replacement.token).not.toBe(original.token);
      expect(() =>
        sample.authorize(replacement.token, {
          declaredBytes: 16384,
          declaredContentType: "video/mp4",
          turnstileToken: "local-synthetic-fixture",
        }),
      ).not.toThrow();
      expect(sample.callCounts).toEqual({
        provider: 0,
        inspection: 0,
        analysis: 0,
        assembly: 0,
        render: 0,
      });
    },
  );

  it.each([
    { declaredBytes: 8192, declaredContentType: "video/mp4" },
    { declaredBytes: 16384, declaredContentType: "video/mp4" },
    { declaredBytes: 32768, declaredContentType: "video/mp4" },
  ] as const)(
    "restarts with $declaredBytes / $declaredContentType while rejecting prior upload capabilities",
    (replacement) => {
      const sample = new SampleSession(new FakeClock());
      const original = sample.start(null, "upload");
      const originalRequest = {
        declaredBytes: 8192,
        declaredContentType: "video/mp4" as const,
        turnstileToken: "local-synthetic-fixture",
      };
      const oldUpload = sample.authorize(original.token, originalRequest);
      expect(sample.start(original.token, "upload").token).toBe(original.token);
      expect(sample.authorize(original.token, originalRequest)).toEqual(
        oldUpload,
      );
      expect(() =>
        sample.authorize(original.token, {
          ...originalRequest,
          declaredBytes: 16384,
        }),
      ).toThrow("STALE_REVISION");
      sample.clear(original.token);
      sample.clear(original.token);
      const restarted = sample.start(original.token, "upload");
      expect(restarted.token).not.toBe(original.token);
      const request = { ...originalRequest, ...replacement };
      const nextUpload = sample.authorize(restarted.token, request);
      expect(nextUpload.uploadId).not.toBe(oldUpload.uploadId);
      expect(sample.authorize(restarted.token, request)).toEqual(nextUpload);
      expect(() =>
        sample.completeUpload(original.token, oldUpload.uploadId, 8192),
      ).toThrow("SESSION_MISSING");
      expect(() =>
        sample.completeUpload(restarted.token, oldUpload.uploadId, 8192),
      ).toThrow("STALE_REVISION");
      const inspection = sample.completeUpload(
        restarted.token,
        nextUpload.uploadId,
        request.declaredBytes,
      );
      expect(
        sample.completeUpload(
          restarted.token,
          nextUpload.uploadId,
          request.declaredBytes,
        ),
      ).toEqual(inspection);
      expect(sample.callCounts).toEqual({
        provider: 0,
        inspection: 1,
        analysis: 0,
        assembly: 0,
        render: 0,
      });
    },
  );
  it("clears retained upload authorization through the cookie-scoped API before replacement", async () => {
    const agent = request.agent(
      composeBackend({ FAKE_MODE: "true" }).application,
    );
    const origin = "http://localhost:3000";
    await agent
      .post("/v1/sample/sessions")
      .set("Origin", origin)
      .send({ mode: "upload" })
      .expect(201);
    const original = {
      declaredBytes: 8192,
      declaredContentType: "video/mp4",
      turnstileToken: "local-synthetic-fixture",
    };
    const first = await agent
      .post("/v1/sample/upload/authorize")
      .set("Origin", origin)
      .send(original)
      .expect(200);
    const retry = await agent
      .post("/v1/sample/upload/authorize")
      .set("Origin", origin)
      .send(original)
      .expect(200);
    expect(retry.body).toEqual(first.body);
    const replacement = {
      ...original,
      declaredBytes: 16384,
      declaredContentType: "video/mp4",
    };
    await agent
      .post("/v1/sample/upload/authorize")
      .set("Origin", origin)
      .send(replacement)
      .expect(409);
    await agent.post("/v1/sample/clear").set("Origin", origin).expect(204);
    await agent.post("/v1/sample/clear").set("Origin", origin).expect(204);
    await agent
      .post("/v1/sample/sessions")
      .set("Origin", origin)
      .send({ mode: "upload" })
      .expect(201);
    const next = await agent
      .post("/v1/sample/upload/authorize")
      .set("Origin", origin)
      .send(replacement)
      .expect(200);
    await agent
      .post("/v1/sample/upload/complete")
      .set("Origin", origin)
      .send({ uploadId: first.body.uploadId, observedBytes: 8192 })
      .expect(409);
    await agent
      .post("/v1/sample/upload/complete")
      .set("Origin", origin)
      .send({
        uploadId: next.body.uploadId,
        observedBytes: replacement.declaredBytes,
      })
      .expect(202);
  });
  it.each([0, 1, 2])(
    "progresses the selected moment %i with one inspection/analysis/build/render and no providers",
    async (index) => {
      const clock = new FakeClock();
      const sample = new SampleSession(clock);
      const { token } = sample.start(null, "upload");
      expect(sample.start(token, "upload").token).toBe(token);
      const authorization = {
        declaredBytes: 8192,
        declaredContentType: "video/mp4" as const,
        turnstileToken: "local-synthetic-fixture",
      };
      const upload = sample.authorize(token, authorization);
      expect(() =>
        sample.authorize(token, { ...authorization, declaredBytes: 524288001 }),
      ).toThrow("SOURCE_TOO_LARGE");
      expect(sample.start(token, "upload").token).toBe(token);
      expect(sample.authorize(token, authorization)).toEqual(upload);
      expect(developmentUploadResponseSchema.safeParse(upload).success).toBe(
        true,
      );
      expect(upload).not.toHaveProperty("uploadUrl");
      expect(() => sample.completeUpload(token, upload.uploadId, 8191)).toThrow(
        "STALE_REVISION",
      );
      const inspection = sample.completeUpload(token, upload.uploadId, 8192);
      expect(sample.completeUpload(token, upload.uploadId, 8192)).toEqual(
        inspection,
      );
      await finish(sample, token, inspection);
      const analyzing = sample.analyze(
        token,
        CONVERSATION_SAMPLE.media.mediaId,
      );
      expect(sample.analyze(token, CONVERSATION_SAMPLE.media.mediaId)).toEqual(
        analyzing,
      );
      await finish(sample, token, analyzing);
      const candidate = CONVERSATION_SAMPLE.candidates[index]!;
      const selection = {
        analysisId: CONVERSATION_SAMPLE.analysisId,
        selection: {
          candidateId: candidate.id,
          startWordId: candidate.startWordId,
          endWordId: candidate.endWordId,
        },
        turnstileToken: "local-synthetic-fixture",
      };
      const built = sample.build(token, selection);
      expect(sample.build(token, selection)).toEqual(built);
      expect(() => sample.assembly(token, built.assemblyId)).toThrow(
        "RESULT_NOT_FOUND",
      );
      await finish(sample, token, built.operation);
      const assembly = sample.assembly(token, built.assemblyId);
      expect(assemblyBundleSchema.safeParse(assembly).success).toBe(true);
      expect(assembly.compositionManifest.baseCandidateId).toBe(candidate.id);
      expect(
        assembly.assets.every((asset) => asset.source === "fake-fixture"),
      ).toBe(true);
      expect(assembly.visualPlan.requests[0]?.equationTex).toBeNull();
      const confirmed = {
        analysisId: CONVERSATION_SAMPLE.analysisId,
        assemblyId: assembly.assemblyId,
        manifestHash: assembly.manifestHash,
        turnstileToken: "local-synthetic-fixture",
      };
      expect(() =>
        sample.render(token, { ...confirmed, manifestHash: "0".repeat(64) }),
      ).toThrow("STALE_REVISION");
      const rendered = sample.render(token, confirmed);
      expect(sample.render(token, confirmed)).toEqual(rendered);
      await finish(sample, token, rendered.operation);
      const evidence = sample.evidence(token);
      expect(evidence).toMatchObject({
        provenStage: "result",
        manifestHash: assembly.manifestHash,
        renderId: rendered.renderId,
        remaining: { renderAttempts: 0 },
      });
      expect(sample.callCounts).toEqual({
        provider: 0,
        inspection: 1,
        analysis: 1,
        assembly: 1,
        render: 1,
      });
      expect(clock.pendingWaitCount).toBe(0);
      const foreign = sample.start(null, "upload");
      await expect(
        sample.poll(foreign.token, rendered.operation.operationId),
      ).rejects.toThrow("OPERATION_NOT_FOUND");
      expect(() => sample.assembly(foreign.token, assembly.assemblyId)).toThrow(
        "RESULT_NOT_FOUND",
      );
      sample.clear(token);
      await expect(
        sample.poll(token, rendered.operation.operationId),
      ).rejects.toThrow("SESSION_MISSING");
    },
  );
  it("exposes only safe availability and never falls back to fake in real or production mode", async () => {
    for (const environment of [
      { FAKE_MODE: "false" },
      {
        FAKE_MODE: "true",
        NODE_ENV: "production",
        APP_ENV: "production",
        APP_REVISION: "fixture-revision",
      },
    ]) {
      const app = composeBackend(environment).application;
      const config = await request(app).get("/v1/sample/config").expect(200);
      expect(publicConfigResponseSchema.safeParse(config.body).success).toBe(
        true,
      );
      expect(config.body.sampleEnabled).toBe(false);
      expect(config.body.localMediaEnabled).toBe(
        environment.FAKE_MODE === "false",
      );
      expect(config.body.mode).toBe(
        environment.FAKE_MODE === "false" ? "live" : "fake",
      );
      expect(Object.keys(config.body)).not.toContain("openAi");
      expect(JSON.stringify(config.body)).not.toContain("backendOrigin");
      await request(app)
        .post("/v1/sample/sessions")
        .set("Origin", "http://localhost:3000")
        .send({ mode: "upload" })
        .expect(404);
      await request(app)
        .post("/v1/sample/download")
        .set("Origin", "http://localhost:3000")
        .send({})
        .expect(404);
    }
  });
});
