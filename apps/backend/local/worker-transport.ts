import { request } from "node:http";
import { OWNER_LIMITS } from "../../../packages/contracts/local/policy.ts";

export const WORKER_RESPONSE_BYTES = 8192;

/** Native RPC headers may arrive only after encoding. Honor the caller's
 * explicit deadline instead of fetch's shorter implicit headers timeout. */
export const nativeWorkerFetch: typeof fetch = async (input, init) => {
  const url = new URL(
    typeof input === "string" || input instanceof URL ? input : input.url,
  );
  const method = init?.method ?? "GET";
  if (
    url.protocol !== "http:" ||
    url.hostname !== "127.0.0.1" ||
    url.port === "0" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !(
      (method === "POST" && ["/media", "/cancel"].includes(url.pathname)) ||
      (method === "GET" && /^\/progress\/[a-f0-9-]{36}$/.test(url.pathname))
    )
  )
    throw new Error("invalid_worker_request");
  const body = init?.body;
  if (
    (method === "POST" && typeof body !== "string") ||
    (method === "GET" && body != null) ||
    (typeof body === "string" &&
      Buffer.byteLength(body) > OWNER_LIMITS.jsonBytes)
  )
    throw new Error("invalid_worker_body");
  const signal = init?.signal;
  if (!signal) throw new Error("worker_deadline_required");
  signal.throwIfAborted();
  const headers = Object.fromEntries(new Headers(init?.headers));
  return new Promise<Response>((resolve, reject) => {
    const pending = request(
      url,
      { method, headers, signal, agent: false },
      (response) => {
        const chunks: Buffer[] = [];
        let size = 0;
        response.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > WORKER_RESPONSE_BYTES) {
            const error = new Error("worker_response_too_large");
            reject(error);
            pending.destroy(error);
            return;
          }
          chunks.push(chunk);
        });
        response.once("error", reject);
        response.once("aborted", () =>
          reject(new Error("worker_response_incomplete")),
        );
        response.once("end", () => {
          if (!response.complete) {
            reject(new Error("worker_response_incomplete"));
            return;
          }
          try {
            const status = response.statusCode ?? 502;
            resolve(
              new Response(
                [204, 205, 304].includes(status)
                  ? null
                  : Buffer.concat(chunks).toString("utf8"),
                { status },
              ),
            );
          } catch (error) {
            reject(error);
          }
        });
      },
    );
    pending.once("error", reject);
    pending.end(typeof body === "string" ? body : undefined);
  });
};
