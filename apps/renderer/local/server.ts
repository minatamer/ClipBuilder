import {
  ownerDiagnosticRecordSchema,
  describeOwnerDiagnosticError,
  type OwnerDiagnosticOperation,
} from "../../../packages/contracts/local/diagnostics.ts";
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import {
  ownerMediaJobSchema,
  OWNER_LIMITS,
  type OwnerMediaJob,
  type OwnerMediaResult,
} from "../../../packages/contracts/local/index.ts";
import {
  inspectOwnerSource,
  ownerMediaPath,
  ownerPortrait,
  type OwnerNativeTools,
} from "./media.ts";
import { renderOwnerClip, type OwnerCutCache } from "./clip-render.ts";
import { prepareOwnerClipPreview } from "./clip-preview.ts";
import {
  inspectOwnerAcquisition,
  prepareOwnerAcquisition,
  synthesizeOwnerAcquisition,
} from "./acquisition-media.ts";
import type { OwnerAcquisitionNativeStage } from "../../../packages/contracts/local/acquisition-profile.ts";
import { ownerAcquisitionFailureCodeSchema } from "../../../packages/contracts/local/acquisition.ts";
import { prepareOwnerProviderMedia } from "./provider-media.ts";
import { normalizeOwnerAudio } from "./audio-media.ts";

export function createOwnerWorker(options: {
  diagnostic?: (line: string) => void;
  root: string;
  token: string;
  tools: OwnerNativeTools;
  chromium?: string;
  overlayBundle?: string;
  execute?: (
    job: OwnerMediaJob,
    signal: AbortSignal,
  ) => Promise<OwnerMediaResult>;
}) {
  const cache: OwnerCutCache = new Map();
  const controllers = new Set<AbortController>();
  const tasks = new Set<Promise<void>>();
  let current:
    | {
        id: string;
        controller: AbortController;
        stage: OwnerAcquisitionNativeStage | null;
      }
    | undefined;
  let closing = false;
  const pendingCancel = new Set<string>();
  let busy = false;
  const server = createServer((req, res) => {
    const task = handle(req, res);
    tasks.add(task);
    void task.finally(() => tasks.delete(task));
  });
  async function handle(req: IncomingMessage, res: ServerResponse) {
    if (
      closing ||
      req.headers.authorization !== `Bearer ${options.token}` ||
      req.headers.origin ||
      req.headers.host !==
        `127.0.0.1:${(server.address() as { port: number } | null)?.port}`
    ) {
      res.writeHead(403).end();
      return;
    }
    if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200).end('{"mode":"fake","cloud":false}');
      return;
    }
    const progress = req.url?.match(/^\/progress\/([a-f0-9-]{36})$/);
    if (req.method === "GET" && progress) {
      const active = current;
      if (!active || active.id !== progress[1] || !active.stage) {
        res.writeHead(404).end();
        return;
      }
      res
        .writeHead(200, { "Content-Type": "application/json" })
        .end(JSON.stringify({ stage: active.stage }));
      return;
    }
    if (req.method === "POST" && req.url === "/cancel") {
      try {
        const job = await readJob(req);
        const key = job.jobId ?? `${job.workspaceId}:${job.operation}`;
        if (current?.id === key) current.controller.abort();
        else {
          pendingCancel.add(key);
          if (pendingCancel.size > 32)
            pendingCancel.delete(pendingCancel.values().next().value!);
        }
        res.writeHead(204).end();
      } catch {
        res.writeHead(400).end();
      }
      return;
    }
    if (req.method !== "POST" || req.url !== "/media") {
      res.writeHead(404).end();
      return;
    }
    if (busy) {
      res.writeHead(409).end('{"error":"busy"}');
      return;
    }
    busy = true;
    const started = performance.now();
    let operation: OwnerDiagnosticOperation = "worker_request";
    let jobId: string | undefined;
    const report = (
      outcome: "started" | "succeeded" | "failed",
      error?: unknown,
    ) => {
      try {
        options.diagnostic?.(
          JSON.stringify(
            ownerDiagnosticRecordSchema.parse({
              event: "local_diagnostic",
              service: "worker",
              at: new Date().toISOString(),
              operation,
              outcome,
              ...(jobId ? { jobId } : {}),
              elapsedMs: Math.max(
                0,
                Math.min(86400000, Math.round(performance.now() - started)),
              ),
              ...(error === undefined
                ? {}
                : { error: describeOwnerDiagnosticError(error) }),
            }),
          ),
        );
      } catch {
        /* Logging must not affect native work or cleanup. */
      }
    };
    const controller = new AbortController();
    controllers.add(controller);
    res.once("close", () => controller.abort());
    try {
      const job = await readJob(req);
      operation = job.operation;
      jobId = job.jobId;
      report("started");
      const key = job.jobId ?? `${job.workspaceId}:${job.operation}`;
      current = {
        id: key,
        controller,
        stage:
          job.operation === "inspect-acquisition"
            ? "inspecting"
            : job.operation === "synthesize-acquisition"
              ? "video"
              : job.operation === "prepare-acquisition"
                ? "merging"
                : null,
      };
      const stage = (value: OwnerAcquisitionNativeStage) => {
        if (current?.id === key) current.stage = value;
      };
      if (pendingCancel.has(key)) controller.abort();
      pendingCancel.delete(key);
      const source = await ownerMediaPath(
        options.root,
        job.workspaceId,
        "source.mp4",
      );
      const signal = AbortSignal.any([
        controller.signal,
        AbortSignal.timeout(10 * 60_000),
      ]);
      signal.throwIfAborted();
      const result = options.execute
        ? await options.execute(job, signal)
        : job.operation === "normalize-audio"
          ? await normalizeOwnerAudio(options.root, job, options.tools, signal)
          : job.operation === "inspect"
            ? {
                operation: "inspect",
                source: await inspectOwnerSource(source, options.tools, signal),
              }
            : job.operation === "prepare-owner-audio" ||
                job.operation === "prepare-owner-video"
              ? await prepareOwnerProviderMedia(
                  options.root,
                  job,
                  options.tools,
                  signal,
                )
              : job.operation === "prepare-acquisition"
                ? {
                    operation: job.operation,
                    ...(await prepareOwnerAcquisition(
                      options.root,
                      job.workspaceId,
                      job.expected,
                      options.tools,
                      signal,
                      job.combined ?? false,
                      stage,
                    )),
                  }
                : job.operation === "synthesize-acquisition" ||
                    job.operation === "inspect-acquisition"
                  ? {
                      operation: job.operation,
                      ...(await (
                        job.operation === "synthesize-acquisition"
                          ? synthesizeOwnerAcquisition
                          : inspectOwnerAcquisition
                      )(
                        options.root,
                        job.workspaceId,
                        job.expected,
                        options.tools,
                        signal,
                        stage,
                      )),
                    }
                  : job.operation === "clip-preview"
                    ? await prepareOwnerClipPreview(
                        { root: options.root, tools: options.tools, cache },
                        job,
                        signal,
                      )
                    : job.operation === "clip"
                      ? await renderOwnerClip(
                          {
                            root: options.root,
                            tools: options.tools,
                            chromium: options.chromium ?? "",
                            bundle: options.overlayBundle ?? "",
                            cache,
                          },
                          job,
                          signal,
                        )
                      : await ownerPortrait(
                          source,
                          await ownerMediaPath(
                            options.root,
                            job.workspaceId,
                            "portrait.mp4",
                          ),
                          options.tools,
                          signal,
                          job.cut,
                          job.fingerprint,
                        );
      report("succeeded");
      res
        .writeHead(200, {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        })
        .end(JSON.stringify(result));
    } catch (error) {
      report("failed", error);
      const code = ownerAcquisitionFailureCodeSchema.safeParse(
        error instanceof Error ? error.message : null,
      );
      if (!res.destroyed)
        res.writeHead(400).end(
          JSON.stringify({
            error: "media_unavailable",
            ...(code.success ? { reason: code.data } : {}),
          }),
        );
    } finally {
      controllers.delete(controller);
      busy = false;
      current = undefined;
    }
  }
  async function readJob(req: IncomingMessage) {
    const chunks: Buffer[] = [];
    let bytes = 0;
    for await (const chunk of req) {
      bytes += chunk.length;
      if (bytes > OWNER_LIMITS.jsonBytes) throw new Error("invalid");
      chunks.push(Buffer.from(chunk));
    }
    return ownerMediaJobSchema.parse(
      JSON.parse(Buffer.concat(chunks).toString("utf8")),
    );
  }
  return {
    server,
    async close() {
      closing = true;
      for (const controller of controllers) controller.abort();
      server.closeAllConnections();
      await Promise.allSettled([...tasks]);
      cache.clear();
      pendingCancel.clear();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
}
