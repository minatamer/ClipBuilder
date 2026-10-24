import request from "supertest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createOwnerHost } from "./server.ts";
import { expect, it } from "vitest";
import { z } from "zod";
import { LocalDiagnostics, LOCAL_DIAGNOSTIC_LIMIT } from "./diagnostics.ts";
import {
  describeOwnerDiagnosticError,
  ownerDiagnosticRecordSchema,
} from "../../../packages/contracts/local/diagnostics.ts";
import { ApplicationError } from "../src/http/errorMapper.ts";

const secret = "synthetic-private-key-filename-transcript-url";
it("correlates local stages and safe provider/validation diagnostics without private capture", async () => {
  const lines: string[] = [];
  const diagnostics = new LocalDiagnostics((line) => lines.push(line));
  await diagnostics.run("find_moments", async () => {
    await expect(
      diagnostics.run("transcript_validate", async () => {
        diagnostics.analysis.privateStageOutput("transcription", secret);
        throw new z.ZodError([
          { code: "custom", path: ["words", secret], message: secret },
        ]);
      }),
    ).rejects.toThrow();
    diagnostics.analysis.failure(
      "transcription_generation",
      new ApplicationError({
        code: "ANALYSIS_PROVIDER_FAILED",
        ruleId: "google_transcription_http_403",
      }),
    );
  });
  const records = lines.map((line) => JSON.parse(line));
  expect(new Set(records.map((record) => record.requestId)).size).toBe(1);
  expect(records).toContainEqual(
    expect.objectContaining({
      operation: "transcript_validate",
      outcome: "failed",
      error: expect.objectContaining({ errorClass: "ZodError", issueCount: 1 }),
    }),
  );
  expect(records).toContainEqual(
    expect.objectContaining({
      phase: "transcription_generation",
      code: "ANALYSIS_PROVIDER_FAILED",
      rules: ["google_transcription_http_403"],
    }),
  );
  expect(lines.join("\n")).not.toContain(secret);
});

it("separates concurrent requests and gives background work its own correlated budget", async () => {
  const records: Record<string, unknown>[] = [];
  const diagnostics = new LocalDiagnostics((line) =>
    records.push(JSON.parse(line)),
  );
  await Promise.all(
    ["transcribe", "candidate_select"].map((operation) =>
      diagnostics.run(
        operation === "transcribe" ? "transcribe" : "candidate_select",
        async () => {
          await Promise.resolve();
          await diagnostics.run("clip_build", async () => {}, {
            independent: true,
          });
        },
      ),
    ),
  );
  const roots = records.filter((record) =>
    ["transcribe", "candidate_select"].includes(String(record.operation)),
  );
  expect(new Set(roots.map((record) => record.requestId)).size).toBe(2);
  for (const record of records.filter(
    (record) => record.operation === "clip_build",
  )) {
    expect(record.requestId).not.toBe(record.parentRequestId);
    expect(
      roots.some((root) => root.requestId === record.parentRequestId),
    ).toBe(true);
  }
});

it("keeps successful polling quiet and records failed reads without bodies or paths", async () => {
  const records: Record<string, unknown>[] = [];
  const diagnostics = new LocalDiagnostics((line) =>
    records.push(JSON.parse(line)),
  );
  await diagnostics.run("http_read", async () => secret, {
    quiet: true,
    status: () => 200,
  });
  expect(records).toEqual([]);
  await diagnostics.run("http_read", async () => secret, {
    quiet: true,
    status: () => 503,
  });
  expect(records).toHaveLength(1);
  expect(records[0]).toMatchObject({
    operation: "http_read",
    outcome: "failed",
    httpStatus: 503,
  });
  expect(ownerDiagnosticRecordSchema.safeParse(records[0]).success).toBe(true);
  expect(JSON.stringify(records)).not.toContain(secret);
});

it("bounds nested records, reserves failures, and never changes behavior when the sink fails", async () => {
  const records: Record<string, unknown>[] = [];
  const diagnostics = new LocalDiagnostics((line) =>
    records.push(JSON.parse(line)),
  );
  await diagnostics.run("clip_build", async () => {
    for (let index = 0; index < 200; index++)
      await diagnostics.run("visual_validate", async () => {});
    diagnostics.failure("cleanup", new Error("owner_provider_cleanup_pending"));
  });
  expect(
    records.filter((record) => record.event === "local_diagnostic").length,
  ).toBeLessThanOrEqual(LOCAL_DIAGNOSTIC_LIMIT);
  expect(records).toContainEqual(
    expect.objectContaining({
      operation: "cleanup",
      outcome: "failed",
      error: expect.objectContaining({
        reason: "owner_provider_cleanup_pending",
      }),
      droppedRecords: expect.any(Number),
    }),
  );
  const broken = new LocalDiagnostics(() => {
    throw new Error(secret);
  });
  expect(await broken.run("find_moments", async () => 7)).toBe(7);
  expect(broken.check("worker_spawn", () => 8)).toBe(8);
  const error = new Error(secret);
  await expect(
    broken.run("find_moments", async () => {
      throw error;
    }),
  ).rejects.toBe(error);
});

it("allowlists causes, system and exit codes while dropping arbitrary messages and attributes", () => {
  const error = Object.assign(
    new Error(secret, {
      cause: Object.assign(new Error("native_filter_unavailable"), {
        code: 9,
        signal: "SIGTERM",
        path: secret,
      }),
    }),
    { code: "ENOSPC", path: secret },
  );
  expect(describeOwnerDiagnosticError(error)).toEqual({
    reason: "native_filter_unavailable",
    errorClass: "Error",
    systemCode: "ENOSPC",
    exitCode: 9,
    signal: "SIGTERM",
  });
  expect(JSON.stringify(describeOwnerDiagnosticError(error))).not.toContain(
    secret,
  );
  expect(
    describeOwnerDiagnosticError(
      new Error("media_failed", {
        cause: new Error("native_encoder_unavailable"),
      }),
    ),
  ).toMatchObject({
    reason: "media_failed",
    causes: ["native_encoder_unavailable"],
  });
});

it("the real host path logs a rejected input while the HTTP body stays generic", async () => {
  const root = await mkdtemp(
    join(tmpdir(), "clipbuilder-local-diagnostic-host-"),
  );
  const lines: string[] = [];
  const host = createOwnerHost({
    root,
    token: "synthetic-token",
    port: 0,
    frontendOrigin: "http://localhost:3000",
    diagnostics: new LocalDiagnostics((line) => lines.push(line)),
    media: async () => {
      throw new Error("unexpected_native_work");
    },
  });
  try {
    const response = await request(host.server)
      .post("/api/source")
      .set("Authorization", "Bearer synthetic-token")
      .set("Origin", "http://localhost:3000")
      .send({ private: "synthetic-private-input" });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "local_operation_unavailable" });
    expect(lines.map((line) => JSON.parse(line))).toContainEqual(
      expect.objectContaining({
        operation: "http_request",
        outcome: "failed",
        error: expect.any(Object),
      }),
    );
    expect(lines.join("\n")).not.toContain("synthetic-private-input");
  } finally {
    await host.close();
    await rm(root, { recursive: true, force: true });
  }
});
