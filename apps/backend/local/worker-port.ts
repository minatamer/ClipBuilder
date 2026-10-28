import { ownerPresentationFrames } from "../../../packages/contracts/local/hook.ts";
import {
  ownerMediaResultSchema,
  OWNER_FPS,
  type OwnerMediaJob,
} from "../../../packages/contracts/local/index.ts";
import { randomUUID } from "node:crypto";
import { ownerAcquisitionFailureCodeSchema } from "../../../packages/contracts/local/acquisition.ts";
import { z } from "zod";
import {
  ownerAcquisitionNativeStageSchema,
  type OwnerAcquisitionNativeStage,
} from "../../../packages/contracts/local/acquisition-profile.ts";

import { LocalDiagnostics } from "./diagnostics.ts";
import {
  nativeWorkerFetch,
  WORKER_RESPONSE_BYTES,
} from "./worker-transport.ts";

async function workerBody(response: Response, maximum: number) {
  if (!response.body) throw new Error("invalid_media_result");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.length;
      if (size > maximum) throw new Error("invalid_media_result");
      chunks.push(next.value);
    }
  } finally {
    await reader.cancel();
    reader.releaseLock();
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
const stageSchema = z
  .object({ stage: ownerAcquisitionNativeStageSchema })
  .strict();

export function localWorkerPort(
  port: number,
  token: string,
  transport: typeof fetch = nativeWorkerFetch,
  diagnostics = new LocalDiagnostics(),
) {
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("invalid_port");
  return async (
    job: OwnerMediaJob,
    signal: AbortSignal,
    stage?: (value: OwnerAcquisitionNativeStage) => void,
  ) => {
    const jobId = job.jobId ?? randomUUID();
    return diagnostics.run(
      job.operation,
      async () => {
        signal.throwIfAborted();
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };
        const body = JSON.stringify({ ...job, jobId });
        const polling = new AbortController();
        let progress: Promise<void> | undefined;
        const poll = async () => {
          while (!polling.signal.aborted && !signal.aborted) {
            try {
              const response = await transport(
                `http://127.0.0.1:${port}/progress/${jobId}`,
                {
                  headers,
                  redirect: "error",
                  signal: AbortSignal.any([
                    polling.signal,
                    signal,
                    AbortSignal.timeout(1000),
                  ]),
                },
              );
              if (response.ok)
                stage?.(
                  stageSchema.parse(await workerBody(response, 128)).stage,
                );
              else await response.body?.cancel();
            } catch {
              /* A missing progress sample cannot start or retry media work. */
            }
            if (!polling.signal.aborted && !signal.aborted)
              await new Promise<void>((resolve) => {
                const abort = () => {
                  clearTimeout(timer);
                  resolve();
                };
                const timer = setTimeout(() => {
                  polling.signal.removeEventListener("abort", abort);
                  resolve();
                }, 250);
                polling.signal.addEventListener("abort", abort, { once: true });
              });
          }
        };
        // Keep the RPC open until the worker has reaped its native child. A caller
        // abort cancels the operation separately, then the host can safely delete scratch.
        let cancellation: Promise<unknown> | undefined;
        const cancel = () => {
          cancellation ??= transport(`http://127.0.0.1:${port}/cancel`, {
            method: "POST",
            headers,
            body,
            redirect: "error",
            signal: AbortSignal.timeout(5000),
          })
            .then((r) => r.body?.cancel())
            .catch((error: unknown) => diagnostics.failure("cleanup", error));
        };
        signal.addEventListener("abort", cancel, { once: true });
        try {
          const requested = transport(`http://127.0.0.1:${port}/media`, {
            method: "POST",
            headers,
            body,
            signal: AbortSignal.timeout(11 * 60_000),
            redirect: "error",
          });
          if (
            stage &&
            [
              "prepare-acquisition",
              "synthesize-acquisition",
              "inspect-acquisition",
            ].includes(job.operation)
          )
            progress = poll();
          const response = await requested;
          if (!response.ok) {
            const failure = await workerBody(response, 1024).catch(() => null);
            const parsed = ownerAcquisitionFailureCodeSchema.safeParse(
              typeof failure === "object" &&
                failure !== null &&
                "reason" in failure
                ? failure.reason
                : null,
            );
            if (parsed.success) throw new Error(parsed.data);
            throw new Error("media_unavailable");
          }
          const value = await workerBody(response, WORKER_RESPONSE_BYTES);
          signal.throwIfAborted();
          const result = ownerMediaResultSchema.parse(value);
          if (result.operation !== job.operation)
            throw new Error("invalid_media_result");
          if (
            (job.operation === "portrait" ||
              job.operation === "clip" ||
              job.operation === "clip-preview") &&
            (result.operation === "portrait" ||
              result.operation === "clip" ||
              result.operation === "clip-preview") &&
            (result.frames !==
              (job.operation === "clip"
                ? ownerPresentationFrames(job.overlay)
                : job.cut.endFrame - job.cut.startFrame) ||
              result.durationMs !==
                Math.round((result.frames * 1000) / OWNER_FPS))
          )
            throw new Error("invalid_media_result");
          return result;
        } finally {
          polling.abort();
          await progress;
          await cancellation;
          signal.removeEventListener("abort", cancel);
        }
      },
      { jobId },
    );
  };
}
