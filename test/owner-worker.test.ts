import { expect, it, vi } from "vitest";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createOwnerWorker } from "../apps/renderer/local/server.ts";
import type {
  OwnerMediaJob,
  OwnerMediaResult,
} from "../packages/contracts/local/index.ts";
import { listenOwner, ownerRequest } from "./owner-http.ts";

it("does not let a delayed cancel for one operation abort a sibling, and skips pre-canceled work", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-owner-worker-test-")),
    workspaceId = crypto.randomUUID();
  await mkdir(join(root, workspaceId));
  await writeFile(join(root, workspaceId, "source.mp4"), "synthetic");
  let enter!: () => void, release!: () => void;
  let entered = new Promise<void>((done) => {
      enter = done;
    }),
    held = new Promise<void>((done) => {
      release = done;
    });
  const execute = vi.fn(
    async (
      _job: OwnerMediaJob,
      signal: AbortSignal,
    ): Promise<OwnerMediaResult> => {
      enter();
      await held;
      signal.throwIfAborted();
      return { operation: "portrait", bytes: 20, durationMs: 1000, frames: 30 };
    },
  );
  const worker = createOwnerWorker({
    root,
    token: "test",
    tools: { ffmpeg: "unused", ffprobe: "unused" },
    execute,
  });
  const port = await listenOwner(worker.server),
    auth = { Authorization: "Bearer test" };
  const job = () => ({
    workspaceId,
    jobId: crypto.randomUUID(),
    operation: "portrait",
    cut: { startFrame: 0, endFrame: 30 },
    fingerprint: "a".repeat(64),
  });
  const post = (path: string, body: unknown) =>
    ownerRequest(port, path, {
      method: "POST",
      headers: auth,
      body: JSON.stringify(body),
    });
  try {
    const first = job(),
      second = job(),
      third = job();
    const runningFirst = post("/media", first);
    await entered;
    release();
    expect((await runningFirst).status).toBe(200);
    entered = new Promise<void>((done) => {
      enter = done;
    });
    held = new Promise<void>((done) => {
      release = done;
    });
    const runningSecond = post("/media", second);
    await entered;
    expect((await post("/cancel", first)).status).toBe(204);
    release();
    expect((await runningSecond).status).toBe(200);
    expect((await post("/cancel", third)).status).toBe(204);
    expect((await post("/media", third)).status).toBe(400);
    expect(execute).toHaveBeenCalledTimes(2);
  } finally {
    release();
    await worker.close();
    expect(worker.server.listening).toBe(false);
    await rm(root, { recursive: true, force: true });
  }
});
