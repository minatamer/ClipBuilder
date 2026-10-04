import { SAFE_ERROR_MESSAGES } from "@clipbuilder/contracts";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { AnalysisDiagnostics } from "./analysis/analysis.diagnostics.js";

import { composeBackend } from "./composition.js";
import { ApplicationError, mapError } from "./http/errorMapper.js";
import { createSafeTestEnvironment } from "../test/environment.fixture.js";

describe("backend application", () => {
  it("correlates fixed analysis routes without logging request bodies, URLs or headers", async () => {
    const lines: string[] = [];
    const { application } = composeBackend(
      createSafeTestEnvironment(),
      {},
      new AnalysisDiagnostics((line) => lines.push(line)),
    );
    const response = await request(application)
      .post("/v1/analysis/run?private=query")
      .set("Cookie", "synthetic-private-cookie")
      .send({ secret: "synthetic-private-body" })
      .expect(404);
    const records = lines.map((line) => JSON.parse(line));
    expect(records).toHaveLength(2);
    expect(records[0]).toMatchObject({
      phase: "request",
      outcome: "started",
      requestId: response.headers["x-request-id"],
      action: "run",
    });
    expect(records[1]).toMatchObject({
      phase: "request",
      outcome: "completed",
      applicationHttpStatus: 404,
    });
    expect(lines.join("\n")).not.toMatch(/private|secret|Cookie|query/);
    await request(application).get("/v1/health").expect(200);
    expect(lines).toHaveLength(2);
  });
  it("allows Exit with paid processing disabled and no credentials", async () => {
    const { application } = composeBackend(createSafeTestEnvironment());
    const response = await request(application)
      .post("/v1/session/exit")
      .set({ Origin: "http://localhost:3000", "Sec-Fetch-Site": "same-origin" })
      .send({})
      .expect(204);
    expect(response.headers["set-cookie"]).toHaveLength(2);
  });

  it.each(["preview", "production"])(
    "does not expose samples in %s deployment",
    async (appEnvironment) => {
      const { application } = composeBackend({
        NODE_ENV: appEnvironment === "production" ? "production" : "test",
        APP_ENV: appEnvironment,
        APP_REVISION: "synthetic-release",
        FAKE_MODE: "true",
        PAID_DEMO_ENABLED: "false",
      });
      const config = await request(application)
        .get("/v1/sample/config")
        .expect(200);
      expect(config.body).toMatchObject({
        sampleEnabled: false,
        retainedSampleEnabled: false,
      });
      await request(application).get("/v1/retained-sample/video").expect(404);
      await request(application).post("/v1/sample/start").send({}).expect(404);
    },
  );
  it("constructs without listening and serves content-free health", async () => {
    const { application } = composeBackend(
      createSafeTestEnvironment({ APP_REVISION: "test-revision" }),
    );
    const response = await request(application).get("/v1/health").expect(200);

    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.headers["referrer-policy"]).toBe("no-referrer");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["content-security-policy"]).toContain(
      "default-src 'none'",
    );
    expect(response.headers["x-powered-by"]).toBeUndefined();
    expect(response.headers["x-request-id"]).toMatch(/^req_[a-f0-9]{32}$/u);
    expect(response.body).toEqual({
      status: "ok",
      service: "clipping-api",
      version: "test-revision",
    });
  });

  it("returns only a source-controlled message for unknown routes", async () => {
    const { application } = composeBackend(
      createSafeTestEnvironment({ APP_REVISION: "test-revision" }),
    );
    const response = await request(application)
      .get("/private-value")
      .expect(404);

    expect(response.body.error.code).toBe("OPERATION_NOT_FOUND");
    expect(response.body.error.message).toBe(
      SAFE_ERROR_MESSAGES.OPERATION_NOT_FOUND,
    );
    expect(JSON.stringify(response.body)).not.toContain("private-value");
  });

  it("does not reflect unexpected error details", () => {
    const mapped = mapError(
      new Error("provider response and user content"),
      `req_${"a".repeat(32)}`,
    );
    expect(mapped.error.message).toBe(SAFE_ERROR_MESSAGES.INTERNAL_ERROR);
    expect(JSON.stringify(mapped)).not.toContain("provider response");

    const known = mapError(
      new ApplicationError({ code: "REQUEST_TOO_LARGE" }),
      `req_${"b".repeat(32)}`,
    );
    expect(known.status).toBe(413);
  });
});
