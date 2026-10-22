import {
  ownerMediaResultSchema,
  OWNER_FPS,
  type OwnerMediaJob,
} from "../../../packages/contracts/owner/index.ts";

export function localWorkerPort(
  port: number,
  token: string,
  transport: typeof fetch = fetch,
) {
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("invalid_port");
  return async (job: OwnerMediaJob, signal: AbortSignal) => {
    signal.throwIfAborted();
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const body = JSON.stringify(job);
    // Keep the RPC open until the worker has reaped its native child. A caller
    // abort cancels the operation separately, then the host can safely delete scratch.
    const cancel = () => {
      void transport(`http://127.0.0.1:${port}/cancel`, {
        method: "POST",
        headers,
        body,
        redirect: "error",
        signal: AbortSignal.timeout(5000),
      })
        .then((r) => r.body?.cancel())
        .catch(() => undefined);
    };
    signal.addEventListener("abort", cancel, { once: true });
    try {
      const response = await transport(`http://127.0.0.1:${port}/media`, {
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(11 * 60_000),
        redirect: "error",
      });
      if (!response.ok) throw new Error("media_unavailable");
      if (!response.body) throw new Error("invalid_media_result");
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      try {
        while (true) {
          const next = await reader.read();
          if (next.done) break;
          size += next.value.length;
          if (size > 8192) throw new Error("invalid_media_result");
          chunks.push(next.value);
        }
      } finally {
        await reader.cancel();
        reader.releaseLock();
      }
      signal.throwIfAborted();
      const result = ownerMediaResultSchema.parse(
        JSON.parse(Buffer.concat(chunks).toString("utf8")),
      );
      if (result.operation !== job.operation)
        throw new Error("invalid_media_result");
      if (
        job.operation === "portrait" &&
        result.operation === "portrait" &&
        (result.frames !== job.cut.endFrame - job.cut.startFrame ||
          result.durationMs !== Math.round((result.frames * 1000) / OWNER_FPS))
      )
        throw new Error("invalid_media_result");
      return result;
    } finally {
      signal.removeEventListener("abort", cancel);
    }
  };
}
