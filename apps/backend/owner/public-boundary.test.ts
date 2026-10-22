import { expect, it } from "vitest";
import request from "supertest";
import {
  analysisRequestSchema,
  assemblyRequestSchema,
  renderRequestSchema,
  sourceAnalysisRequestSchema,
  selectedAssemblyRequestSchema,
} from "@clipbuilder/contracts";
import { SAMPLE_ANALYSIS } from "../src/demo/sampleAnalysis.ts";
import { composeBackend } from "../src/composition.ts";
import { createSafeTestEnvironment } from "../test/environment.fixture.ts";

it("rejects local ranges, durations, multiple candidates and mutable manifests on valid public request bodies", () => {
  const opaque = (prefix: string) => `${prefix}_${"a".repeat(22)}`;
  const requests = [
    {
      schema: analysisRequestSchema,
      body: {
        mediaId: opaque("med"),
        context: { targetPlatform: "generic-vertical" },
        turnstileToken: "synthetic-token",
      },
    },
    {
      schema: sourceAnalysisRequestSchema,
      body: { generation: "1", turnstileToken: "synthetic-token" },
    },
    {
      schema: assemblyRequestSchema,
      body: {
        analysisId: opaque("ana"),
        selection: {
          candidateId: opaque("cand"),
          startWordId: "w_000001",
          endWordId: "w_000002",
        },
        turnstileToken: "synthetic-token",
      },
    },
    {
      schema: renderRequestSchema,
      body: {
        analysisId: opaque("ana"),
        assemblyId: opaque("asm"),
        manifestHash: "a".repeat(64),
        turnstileToken: "synthetic-token",
      },
    },
    {
      schema: selectedAssemblyRequestSchema,
      body: {
        analysis: {
          binding: {
            sessionId: opaque("ses"),
            sourceRevision: SAMPLE_ANALYSIS.media.sourceRevision,
            fingerprint: "a".repeat(64),
          },
          generation: "1",
          analysis: SAMPLE_ANALYSIS,
          receipt: "synthetic-receipt",
        },
        candidateId: SAMPLE_ANALYSIS.candidates[0]!.id,
        turnstileToken: "synthetic-token",
      },
    },
  ];
  for (const { schema, body } of requests) {
    expect(schema.safeParse(body).success).toBe(true);
    for (const ownerInput of [
      { ranges: [{ startMs: 0, endMs: 1000 }] },
      { aiDuration: { minMs: 30_000, maxMs: 30_000 } },
      { aiCount: 5 },
      { videoLook: { preset: "warm", strength: 60 } },
      { captions: { font: "Georgia", fontSize: 96, animation: "pop" } },
      { candidateIds: [opaque("cand"), `cand_${"b".repeat(22)}`] },
      { manifest: { captionPosition: { x: 0.1, y: 0.2 } } },
      { edit: { version: 1, revision: 2 } },
      { owner: true },
    ])
      expect(schema.safeParse({ ...body, ...ownerInput }).success).toBe(false);
  }
});

it.each([
  "/owner",
  "/api/capabilities",
  "/api/workspace",
  "/api/sources",
  "/api/agent/status",
  "/v1/owner",
])(
  "never enables the owner route %s through a public header, cookie or query",
  async (path) => {
    const { application } = composeBackend(createSafeTestEnvironment());
    await request(application)
      .get(`${path}?owner=true&local=true`)
      .set({ Cookie: "owner=synthetic-capability", "X-Owner-Mode": "true" })
      .expect(404);
  },
);
