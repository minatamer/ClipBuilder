import { describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { createOwnerWorker } from "../apps/renderer/owner/server.ts";
import { localWorkerPort } from "../apps/backend/owner/worker-port.ts";
import type {
  OwnerMediaJob,
  OwnerMediaResult,
} from "../packages/contracts/owner/index.ts";
import type { OwnerAcquisitionDescriptor } from "../packages/contracts/owner/acquisition.ts";
import { listenOwner, ownerRequest } from "./owner-http.ts";

const descriptor: OwnerAcquisitionDescriptor = {
  width: 1280,
  height: 720,
  fps: 30,
  durationMs: 1000,
  videoCodec: "h264",
  audioCodec: "aac",
  audioChannels: 1,
  audioSampleRate: 48_000,
};
const source = {
  fingerprint: "a".repeat(64),
  bytes: 1000,
  durationMs: 1000,
  width: 1280,
  height: 720,
  fps: 30,
};
const job = (
  operation:
    | "synthesize-acquisition"
    | "prepare-acquisition"
    | "inspect-acquisition" = "synthesize-acquisition",
): OwnerMediaJob => ({
  operation,
  workspaceId: randomUUID(),
  jobId: randomUUID(),
  expected: descriptor,
});
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
const response = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), { status });

it("protects only the active native stage and removes progress after completion or cancellation", async () => {
  const root = await mkdtemp(
    join(tmpdir(), "clipbuilder-owner-worker-progress-"),
  );
  const workspaceId = randomUUID();
  await mkdir(join(root, workspaceId));
  await writeFile(
    join(root, workspaceId, "source.mp4"),
    "synthetic-unchanged-source",
  );
  let entered = deferred<void>(),
    held = deferred<void>();
  let running: Promise<{ status: number }> | undefined;
  const execute = vi.fn(
    async (
      request: OwnerMediaJob,
      signal: AbortSignal,
    ): Promise<OwnerMediaResult> => {
      entered.resolve();
      await held.promise;
      signal.throwIfAborted();
      if (
        request.operation === "synthesize-acquisition" ||
        request.operation === "prepare-acquisition" ||
        request.operation === "inspect-acquisition"
      )
        return { operation: request.operation, source, descriptor };
      throw new Error("test_unexpected_job");
    },
  );
  const worker = createOwnerWorker({
    root,
    token: "synthetic-progress",
    tools: { ffmpeg: "unused", ffprobe: "unused" },
    execute,
  });
  const port = await listenOwner(worker.server);
  const headers = { Authorization: "Bearer synthetic-progress" };
  try {
    for (const [operation, stage, cancel] of [
      ["synthesize-acquisition", "video", false],
      ["prepare-acquisition", "merging", false],
      ["inspect-acquisition", "inspecting", false],
      ["inspect-acquisition", "inspecting", true],
    ] as const) {
      entered = deferred<void>();
      held = deferred<void>();
      const request = { ...job(operation), workspaceId };
      running = ownerRequest(port, "/media", {
        method: "POST",
        headers,
        body: JSON.stringify(request),
      });
      await entered.promise;
      const current = await ownerRequest(port, `/progress/${request.jobId}`, {
        headers,
      });
      expect(current.status).toBe(200);
      expect(JSON.parse(current.body.toString())).toEqual({ stage });
      expect(
        (await ownerRequest(port, `/progress/${randomUUID()}`, { headers }))
          .status,
      ).toBe(404);
      expect(
        (await ownerRequest(port, `/progress/${request.jobId}`)).status,
      ).toBe(403);
      expect(
        (
          await ownerRequest(port, `/progress/${request.jobId}`, {
            headers: { ...headers, Origin: "http://localhost:4100" },
          })
        ).status,
      ).toBe(403);
      if (cancel)
        expect(
          (
            await ownerRequest(port, "/cancel", {
              method: "POST",
              headers,
              body: JSON.stringify(request),
            })
          ).status,
        ).toBe(204);
      held.resolve();
      expect((await running).status).toBe(cancel ? 400 : 200);
      expect(
        (await ownerRequest(port, `/progress/${request.jobId}`, { headers }))
          .status,
      ).toBe(404);
    }
    expect(execute).toHaveBeenCalledTimes(4);
    expect(await readFile(join(root, workspaceId, "source.mp4"), "utf8")).toBe(
      "synthetic-unchanged-source",
    );
  } finally {
    held.resolve();
    await running?.catch(() => undefined);
    await worker.close();
    expect(worker.server.listening).toBe(false);
    expect(dirname(root)).toBe(resolve(tmpdir()));
    await rm(root, { recursive: true, force: true });
  }
});

describe("owner worker progress polling with an injected transport", () => {
  it("drains the cancel acknowledgement before returning from an aborted media RPC", async () => {
    vi.useFakeTimers();
    const media = deferred<Response>(),
      acknowledgment = deferred<Response>();
    const cancellation = new AbortController();
    const request = job("inspect-acquisition");
    const transport = vi.fn<typeof fetch>(async (input) => {
      const path = new URL(String(input)).pathname;
      if (path === "/media") return media.promise;
      if (path === "/cancel") return acknowledgment.promise;
      return response({ stage: "inspecting" });
    });
    const pending = localWorkerPort(4200, "synthetic-token", transport)(
      request,
      cancellation.signal,
      vi.fn(),
    );
    let settled = false;
    void pending.then(
      () => {
        settled = true;
      },
      () => {
        settled = true;
      },
    );
    const rejected = expect(pending).rejects.toThrow();
    try {
      await vi.advanceTimersByTimeAsync(0);
      cancellation.abort();
      media.resolve(response({ error: "media_unavailable" }, 400));
      await vi.advanceTimersByTimeAsync(0);
      expect(
        transport.mock.calls.filter(([url]) => String(url).endsWith("/cancel")),
      ).toHaveLength(1);
      expect(settled).toBe(false);
      acknowledgment.resolve(new Response(null, { status: 204 }));
      await rejected;
      expect(vi.getTimerCount()).toBe(0);
      const count = transport.mock.calls.length;
      await vi.advanceTimersByTimeAsync(2000);
      expect(transport).toHaveBeenCalledTimes(count);
    } finally {
      cancellation.abort();
      media.resolve(response({ error: "media_unavailable" }, 400));
      acknowledgment.resolve(new Response(null, { status: 204 }));
      await pending.catch(() => undefined);
      await rejected;
      vi.useRealTimers();
    }
  });

  it.each([false, true])(
    "bounds samples and drains polling after completion/cancel=%s without retrying media",
    async (cancel) => {
      vi.useFakeTimers();
      const media = deferred<Response>(),
        cancellation = new AbortController();
      const request = job();
      const expected = { operation: request.operation, source, descriptor };
      const stages = vi.fn();
      let oversizedCanceled = 0,
        samples = 0;
      const payloads = [
        response({ stage: "video" }),
        new Response(
          new ReadableStream<Uint8Array>({
            start(controller) {
              controller.enqueue(new TextEncoder().encode("x".repeat(129)));
            },
            cancel() {
              oversizedCanceled++;
            },
          }),
        ),
        response({ stage: "audio", path: "synthetic-private-marker" }),
        new Response("{invalid-json"),
        response({ stage: "audio" }),
        response({ stage: "merging" }),
        response({ stage: "inspecting" }),
      ];
      const transport = vi.fn<typeof fetch>(async (input, init) => {
        const url = new URL(String(input));
        expect(url.origin).toBe("http://127.0.0.1:4200");
        expect(init?.headers).toMatchObject({
          Authorization: "Bearer synthetic-token",
        });
        expect(init?.redirect).toBe("error");
        if (url.pathname === "/media") return media.promise;
        if (url.pathname === "/cancel") {
          expect(JSON.parse(String(init?.body))).toEqual(request);
          return new Response(null, { status: 204 });
        }
        expect(url.pathname).toBe(`/progress/${request.jobId}`);
        const result = payloads[samples++] ?? response({ stage: "inspecting" });
        return result;
      });
      const execute = localWorkerPort(4200, "synthetic-token", transport);
      const pending = execute(request, cancellation.signal, stages);
      let settled = false;
      void pending.then(
        () => {
          settled = true;
        },
        () => {
          settled = true;
        },
      );
      try {
        await vi.advanceTimersByTimeAsync(0);
        for (let index = 1; index < payloads.length; index++)
          await vi.advanceTimersByTimeAsync(250);
        expect(stages.mock.calls.map(([stage]) => stage)).toEqual([
          "video",
          "audio",
          "merging",
          "inspecting",
        ]);
        expect(oversizedCanceled).toBe(1);
        expect(
          transport.mock.calls.filter(([url]) =>
            String(url).endsWith("/media"),
          ),
        ).toHaveLength(1);
        if (cancel) {
          const rejected = expect(pending).rejects.toThrow();
          cancellation.abort();
          await vi.advanceTimersByTimeAsync(0);
          expect(settled).toBe(false);
          const stoppedAt = samples;
          await vi.advanceTimersByTimeAsync(1000);
          expect(samples).toBe(stoppedAt);
          media.resolve(response({ error: "media_unavailable" }, 400));
          await rejected;
          expect(
            transport.mock.calls.filter(([url]) =>
              String(url).endsWith("/cancel"),
            ),
          ).toHaveLength(1);
        } else {
          media.resolve(response(expected));
          expect(await pending).toEqual(expected);
        }
        const completedSamples = samples;
        expect(vi.getTimerCount()).toBe(0);
        await vi.advanceTimersByTimeAsync(2000);
        expect(samples).toBe(completedSamples);
        expect(
          transport.mock.calls.filter(([url]) =>
            String(url).endsWith("/media"),
          ),
        ).toHaveLength(1);
      } finally {
        cancellation.abort();
        media.resolve(response(expected));
        await pending.catch(() => undefined);
        vi.useRealTimers();
      }
    },
  );
});
