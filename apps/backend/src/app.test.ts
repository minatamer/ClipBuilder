import { SAFE_ERROR_MESSAGES } from "@clipbuilder/contracts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { composeBackend } from "./composition.js";
import { ApplicationError, mapError } from "./http/errorMapper.js";
import { createSafeTestEnvironment } from "../test/environment.fixture.js";

describe("backend application", () => {
  it("constructs without listening and serves content-free health", async () => {
    const { application } = composeBackend(
      createSafeTestEnvironment({ APP_REVISION: "test-revision" }),
    );
    const response = await request(application).get("/v1/health").expect(200);

    expect(response.headers["cache-control"]).toBe("no-store");
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
