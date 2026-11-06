import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { appendFileSync, closeSync, fsyncSync, openSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createLocalDiagnosticLog } from "./diagnostic-log.ts";
import { LocalDiagnostics } from "./diagnostics.ts";
import {
  createLocalCodexInference,
  runCodexProcess,
  type CodexProcess,
} from "./codex-exec.ts";

let root: string;
const logs: ReturnType<typeof createLocalDiagnosticLog>[] = [];
beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "clipbuilder-diagnostic-log-test-"));
});
afterEach(async () => {
  for (const log of logs.splice(0)) log.close();
  await rm(root, { recursive: true, force: true });
});
const read = async () =>
  (
    await Promise.all(
      (await readdir(root))
        .filter((n) => n.endsWith(".jsonl"))
        .sort()
        .map((n) => readFile(join(root, n), "utf8")),
    )
  ).join("");
function log(policy?: Parameters<typeof createLocalDiagnosticLog>[2]) {
  const value = createLocalDiagnosticLog(
    root,
    () => {
      throw Error("fallback failure");
    },
    policy,
  );
  logs.push(value);
  return value;
}
const secret = "synthetic-private-transcript-key-url";

it("persists correlated nested stages and the real process failure through inference cleanup without private text", async () => {
  const output = log(),
    diagnostics = new LocalDiagnostics(output.write);
  const processPort = vi.fn<CodexProcess>(async (call, signal) =>
    call.statusOnly
      ? "Logged in using ChatGPT"
      : runCodexProcess(
          {
            ...call,
            executable: process.execPath,
            args: [
              "-e",
              `process.stderr.write('HTTP 400 invalid_json_schema additionalProperties ${secret}');process.exitCode=2;`,
            ],
          },
          signal,
        ),
  );
  const infer = createLocalCodexInference({
    root,
    executable: "synthetic",
    process: processPort,
    observe: (detail) => diagnostics.trace(detail),
  });
  await expect(
    diagnostics.run("clip_build", () =>
      diagnostics.run("clip_prepare", () =>
        diagnostics.run("codex_planning", () =>
          infer(
            {
              prompt: secret,
              schema: {
                type: "object",
                properties: {},
                additionalProperties: false,
              },
            },
            AbortSignal.timeout(5000),
          ),
        ),
      ),
    ),
  ).rejects.toThrow("codex_process_failed");
  output.close();
  const text = await read(),
    records = text
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
  expect(text).not.toContain(secret);
  expect(processPort).toHaveBeenCalledTimes(2);
  expect(records).toContainEqual(
    expect.objectContaining({
      event: "execution_trace",
      phase: "process",
      outcome: "failed",
      exitCode: 2,
      error: expect.objectContaining({
        category: "schema_rejected",
        httpStatus: 400,
        providerCode: "invalid_json_schema",
        schemaKeyword: "additionalProperties",
      }),
    }),
  );
  expect(records).toContainEqual(
    expect.objectContaining({
      event: "execution_trace",
      phase: "cleanup",
      outcome: "succeeded",
    }),
  );
  for (const operation of ["clip_build", "clip_prepare", "codex_planning"])
    expect(records).toContainEqual(
      expect.objectContaining({ operation, outcome: "failed" }),
    );
  expect(
    new Set(records.filter((r) => r.requestId).map((r) => r.requestId)).size,
  ).toBe(1);
  expect(records.at(-1)).toMatchObject({
    event: "diagnostic_log",
    state: "closed",
    dropped: 0,
  });
});

it("refuses arbitrary fields, malformed lines and oversized records", async () => {
  const output = log(),
    diagnostics = new LocalDiagnostics(output.write);
  diagnostics.failure("clip_build", new Error(secret));
  output.write(JSON.stringify({ event: "local_diagnostic", message: secret }));
  output.write(JSON.stringify({ event: "unknown", secret }));
  output.write("not json");
  output.write(secret.repeat(1000));
  output.close();
  const text = await read();
  expect(text).not.toContain(secret);
  expect(JSON.parse(text.trim().split("\n").at(-1)!)).toMatchObject({
    state: "closed",
    dropped: 4,
  });
  expect(text).toContain('"operation":"clip_build"');
});

it("segments without deleting older records and reserves bounded space for terminal failures", async () => {
  const output = log({
    fileBytes: 700,
    totalBytes: 5000,
    failureReserveBytes: 1800,
  });
  const diagnostics = new LocalDiagnostics(output.write);
  for (let i = 0; i < 100; i++)
    diagnostics.focus("focus_plan", {
      people: 1,
      observations: 1,
      decisions: 1,
      shots: 1,
    });
  diagnostics.failure("clip_build", new Error("codex_response_invalid"));
  output.close();
  const text = await read();
  expect(Buffer.byteLength(text)).toBeLessThanOrEqual(5000);
  expect((await readdir(root)).length).toBeGreaterThan(1);
  expect(text).toContain('"state":"limited"');
  expect(text).toContain('"reason":"codex_response_invalid"');
  expect(JSON.parse(text.trim().split("\n").at(-1)!)).toMatchObject({
    state: "closed",
    dropped: expect.any(Number),
  });
});

it("isolates disk/fallback failures and closes its descriptor exactly once", () => {
  const unavailable = vi.fn(() => {
      throw Error(secret);
    }),
    close = vi.fn(closeSync);
  const output = createLocalDiagnosticLog(root, unavailable, undefined, {
    open: openSync,
    append: vi.fn(() => {
      throw Error(secret);
    }),
    sync: fsyncSync,
    close,
  });
  expect(() => output.write(secret)).not.toThrow();
  expect(() => {
    output.close();
    output.close();
  }).not.toThrow();
  expect(unavailable).toHaveBeenCalledTimes(1);
  expect(close).toHaveBeenCalledTimes(1);
});

it("does not reopen a closed log", async () => {
  const output = log();
  output.close();
  const before = await read();
  new LocalDiagnostics(output.write).failure(
    "clip_build",
    new Error("invalid"),
  );
  output.close();
  expect(await read()).toBe(before);
});

it.each(["open", "sync", "close"] as const)(
  "isolates a %s failure and reports its original safe-classifiable cause",
  (stage) => {
    const error = Object.assign(new Error(secret), { code: "EACCES" });
    const unavailable = vi.fn();
    const close = vi.fn((descriptor: number) => {
      closeSync(descriptor);
      if (stage === "close") throw error;
    });
    const output = createLocalDiagnosticLog(root, unavailable, undefined, {
      open:
        stage === "open"
          ? () => {
              throw error;
            }
          : openSync,
      append: appendFileSync,
      sync:
        stage === "sync"
          ? () => {
              throw error;
            }
          : fsyncSync,
      close,
    });
    expect(() => {
      output.close();
      output.close();
    }).not.toThrow();
    expect(unavailable).toHaveBeenCalledExactlyOnceWith(error);
    expect(close).toHaveBeenCalledTimes(stage === "open" ? 0 : 1);
  },
);
