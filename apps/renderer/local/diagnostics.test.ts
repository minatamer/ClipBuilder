import { afterEach, expect, it, vi } from "vitest";
import { request as httpRequest } from "node:http";
import { randomUUID } from "node:crypto";
import { mkdtemp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createOwnerWorker } from "./server.ts";
import { ownerDiagnosticRecordSchema } from "../../../packages/contracts/local/diagnostics.ts";

async function call(
  path: string,
  body?: object,
): Promise<{ status: number; body: unknown }> {
  if (!worker) throw new Error("missing_test_worker");
  if (!worker.server.listening)
    await new Promise<void>((done) =>
      worker!.server.listen(0, "127.0.0.1", done),
    );
  const address = worker.server.address();
  if (!address || typeof address === "string")
    throw new Error("missing_test_listener");
  return new Promise((resolve, reject) => {
    const req = httpRequest(
      {
        hostname: "127.0.0.1",
        port: address.port,
        path,
        method: body ? "POST" : "GET",
        headers: {
          Authorization: "Bearer synthetic-token",
          "Content-Type": "application/json",
        },
      },
      (res) => {
        let bytes = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          bytes += chunk;
        });
        res.on("end", () =>
          resolve({
            status: res.statusCode ?? 0,
            body: bytes ? JSON.parse(bytes) : null,
          }),
        );
      },
    );
    req.on("error", reject);
    req.end(body ? JSON.stringify(body) : undefined);
  });
}
let root: string | undefined;
let worker: ReturnType<typeof createOwnerWorker> | undefined;
afterEach(async () => {
  await worker?.close();
  if (root) await rm(root, { recursive: true, force: true });
});

it("correlates native job failures and drops error payloads while health polling stays quiet", async () => {
  root = await mkdtemp(join(tmpdir(), "clipbuilder-diagnostics-"));
  const id = randomUUID(),
    jobId = randomUUID();
  await mkdir(join(root, id));
  const lines: string[] = [];
  const execute = vi.fn(async () => {
    throw Object.assign(new Error("synthetic-private-source-path-command"), {
      code: "ENOENT",
    });
  });
  worker = createOwnerWorker({
    root,
    token: "synthetic-token",
    tools: { ffmpeg: "unused", ffprobe: "unused" },
    execute,
    diagnostic: (line) => lines.push(line),
  });
  expect((await call("/health")).status).toBe(200);
  expect(lines).toEqual([]);
  const response = await call("/media", {
    operation: "inspect",
    workspaceId: id,
    jobId,
  });
  expect(response.status).toBe(400);
  expect(response.body).toEqual({ error: "media_unavailable" });
  expect(execute).toHaveBeenCalledTimes(1);
  const records = lines.map((line) =>
    ownerDiagnosticRecordSchema.parse(JSON.parse(line)),
  );
  expect(records).toHaveLength(2);
  expect(records[1]).toMatchObject({
    service: "worker",
    operation: "inspect",
    jobId,
    outcome: "failed",
    error: { systemCode: "ENOENT" },
  });
  expect(lines.join("\n")).not.toContain("synthetic-private");
  expect(lines.join("\n")).not.toContain("synthetic-token");
});

it("a broken native log sink cannot turn successful work into failure", async () => {
  root = await mkdtemp(join(tmpdir(), "clipbuilder-diagnostics-"));
  const id = randomUUID();
  await mkdir(join(root, id));
  worker = createOwnerWorker({
    root,
    token: "synthetic-token",
    tools: { ffmpeg: "unused", ffprobe: "unused" },
    diagnostic: () => {
      throw new Error("synthetic-log-sink");
    },
    execute: async () => ({
      operation: "portrait",
      frames: 30,
      durationMs: 1000,
      bytes: 10,
    }),
  });
  const response = await call("/media", {
    operation: "inspect",
    workspaceId: id,
    jobId: randomUUID(),
  });
  expect(response.status).toBe(200);
});
