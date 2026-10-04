import {
  analysisBundleSchema,
  assemblyRequestSchema,
  sessionResponseSchema,
} from "@clipbuilder/contracts";
import { describe, expect, it } from "vitest";
import request from "supertest";

import { composeBackend } from "../composition.js";
import { createSafeTestEnvironment } from "../../test/environment.fixture.js";
import { FakeClock } from "./fakeClock.js";
import {
  SAMPLE_ANALYSIS,
  SAMPLE_NO_CANDIDATES,
  SAMPLE_ONE_CANDIDATE,
  SAMPLE_FOUR_CANDIDATES,
} from "./sampleAnalysis.js";
import { SampleSession } from "./sampleSession.js";
import { CONVERSATION_SAMPLE } from "./conversationSample.js";

const origin = "http://localhost:3000";

describe("CL-004 local sample control", () => {
  it("uses three original complete 58-second conversation moments for the local UI", () => {
    expect(analysisBundleSchema.safeParse(CONVERSATION_SAMPLE).success).toBe(
      true,
    );
    expect(CONVERSATION_SAMPLE.candidates).toHaveLength(3);
    const words = new Map(
      CONVERSATION_SAMPLE.transcript.words.map((word) => [word.id, word]),
    );
    for (const candidate of CONVERSATION_SAMPLE.candidates) {
      expect(
        words.get(candidate.endWordId)!.endMs -
          words.get(candidate.startWordId)!.startMs,
      ).toBe(58_000);
      expect(
        candidate.evidence.every((item) =>
          item.wordIds.every((id) => words.has(id)),
        ),
      ).toBe(true);
    }
    const sample = new SampleSession(new FakeClock());
    const start = sample.start(null);
    expect(
      sample.analysis(start.token, start.response.sampleAnalysisId!),
    ).toEqual(CONVERSATION_SAMPLE);
    expect(sample.callCounts).toEqual({
      provider: 0,
      inspection: 0,
      render: 0,
      analysis: 0,
      assembly: 0,
    });
  });
  it.each([
    SAMPLE_NO_CANDIDATES,
    SAMPLE_ONE_CANDIDATE,
    SAMPLE_ANALYSIS,
    SAMPLE_FOUR_CANDIDATES,
  ])(
    "serves a validated $outcome fixture without provider or job calls",
    (analysis) => {
      const sample = new SampleSession(new FakeClock(), analysis);
      const started = sample.start(null);
      const evidence = sample.evidence(started.token);
      expect(sessionResponseSchema.safeParse(evidence).success).toBe(true);
      expect(
        analysisBundleSchema.safeParse(
          sample.analysis(started.token, analysis.analysisId),
        ).success,
      ).toBe(true);
      expect(evidence).toMatchObject({
        provenStage: "candidates",
        analysisId: analysis.analysisId,
        analysisRevision: analysis.revision,
      });
      expect(sample.callCounts).toEqual({
        provider: 0,
        inspection: 0,
        render: 0,
        analysis: 0,
        assembly: 0,
      });
    },
  );

  it("starts exactly one selected-range handoff and rejects conflicting selection", () => {
    const sample = new SampleSession(new FakeClock(), SAMPLE_ANALYSIS);
    const started = sample.start(null);
    const candidate = SAMPLE_ANALYSIS.candidates[1]!;
    const body = assemblyRequestSchema.parse({
      analysisId: SAMPLE_ANALYSIS.analysisId,
      selection: {
        candidateId: candidate.id,
        startWordId: candidate.startWordId,
        endWordId: candidate.endWordId,
      },
      turnstileToken: "local-synthetic-fixture",
    });
    const first = sample.build(started.token, body);
    expect(sample.build(started.token, body)).toEqual(first);
    expect(sample.evidence(started.token)).toMatchObject({
      provenStage: "assembling",
      activeOperation: first.operation,
    });
    expect(sample.callCounts).toEqual({
      provider: 0,
      inspection: 0,
      render: 0,
      analysis: 0,
      assembly: 1,
    });
    const other = SAMPLE_ANALYSIS.candidates[0]!;
    expect(() =>
      sample.build(started.token, {
        ...body,
        selection: {
          candidateId: other.id,
          startWordId: other.startWordId,
          endWordId: other.endWordId,
        },
      }),
    ).toThrow("ACTION_IN_PROGRESS");
    expect(() =>
      sample.build(started.token, {
        ...body,
        selection: { ...body.selection, endWordId: other.endWordId },
      }),
    ).toThrow("STALE_REVISION");
    expect(sample.callCounts.assembly).toBe(1);
    sample.clear(started.token);
    expect(() => sample.evidence(started.token)).toThrow("SESSION_MISSING");
  });

  it("rejects missing, expired, duplicate and exhausted fixture sessions", () => {
    const clock = new FakeClock();
    const sample = new SampleSession(clock, SAMPLE_ANALYSIS);
    const started = sample.start(null);
    expect(() => sample.start(started.token)).toThrow("ACTIVE_SESSION_EXISTS");
    expect(() => sample.analysis(null, SAMPLE_ANALYSIS.analysisId)).toThrow(
      "SESSION_MISSING",
    );
    clock.advanceBy(7_200_000);
    expect(() => sample.evidence(started.token)).toThrow("SESSION_EXPIRED");
    for (let index = 0; index < 16; index += 1) sample.start(null);
    expect(() => sample.start(null)).toThrow("CAPACITY_FULL");
    clock.advanceBy(7_200_000);
    expect(sample.start(null).response.stage).toBe("candidates");
    expect(clock.pendingWaitCount).toBe(0);
    expect(sample.callCounts).toEqual({
      provider: 0,
      inspection: 0,
      render: 0,
      analysis: 0,
      assembly: 0,
    });
  });

  it("connects sample start, evidence, analysis, clear and missing-session HTTP states", async () => {
    const { application } = composeBackend(createSafeTestEnvironment());
    const agent = request.agent(application);
    const started = await agent
      .post("/v1/sample/sessions")
      .set("Origin", origin)
      .send({ mode: "sample" })
      .expect(201);
    expect(started.headers["cache-control"]).toBe("no-store");
    expect(started.headers["set-cookie"][0]).toContain("HttpOnly");
    expect(started.headers["set-cookie"][0]).toContain("SameSite=Strict");
    const evidence = await agent
      .get("/v1/sample/session")
      .set("Origin", origin)
      .expect(200);
    expect(evidence.body.sessionId).toBe(started.body.sessionId);
    const result = await agent
      .get(`/v1/sample/analysis/${started.body.sampleAnalysisId}`)
      .set("Origin", origin)
      .expect(200);
    expect(result.body.candidates).toHaveLength(3);
    await agent
      .post("/v1/sample/sessions")
      .set("Origin", origin)
      .send({ mode: "sample" })
      .expect(409);
    await agent.post("/v1/sample/clear").set("Origin", origin).expect(204);
    await agent.get("/v1/sample/session").set("Origin", origin).expect(401);
  });

  it("rejects foreign origins, invalid JSON, oversized requests and fake routes in production", async () => {
    const { application } = composeBackend(createSafeTestEnvironment());
    await request(application)
      .post("/v1/sample/sessions")
      .set("Origin", "https://synthetic.invalid")
      .send({ mode: "sample" })
      .expect(403);
    await request(application)
      .post("/v1/sample/sessions")
      .set("Origin", origin)
      .send({ mode: "upload" })
      .expect(201);
    const malformed = await request(application)
      .post("/v1/sample/sessions")
      .set("Origin", origin)
      .set("Content-Type", "application/json")
      .send('{"synthetic-sentinel":')
      .expect(400);
    expect(JSON.stringify(malformed.body)).not.toContain("synthetic-sentinel");
    await request(application)
      .post("/v1/sample/sessions")
      .set("Origin", origin)
      .send({ unknown: "x".repeat(9_000) })
      .expect(413);
    const production = composeBackend({
      APP_ENV: "production",
      NODE_ENV: "production",
      APP_REVISION: "synthetic-production-check",
      FAKE_MODE: "true",
      PAID_DEMO_ENABLED: "false",
    }).application;
    await request(production)
      .post("/v1/sample/sessions")
      .set("Origin", origin)
      .send({ mode: "sample" })
      .expect(404);
  });
});
