import {
  request,
  type RequestOptions,
  type IncomingMessage,
  type ClientRequest,
} from "node:http";
import { Buffer } from "node:buffer";
import { OWNER_LIMITS } from "../../../../packages/contracts/local/policy.ts";
import { LOCAL_CODEX_POLICY } from "../../../../packages/contracts/local/codex.ts";

export function localAiRequestPath(
  method: string,
  segments: readonly string[],
) {
  return (
    method === "POST" &&
    /^workspace\/[a-f0-9-]{36}\/(?:analysis|clips\/[a-f0-9-]{36}\/(?:captions|visuals))$/u.test(
      segments.join("/"),
    )
  );
}
type Transport = (
  options: RequestOptions,
  callback: (response: IncomingMessage) => void,
) => ClientRequest;
/** Fixed private JSON requests can wait for bounded CPU work before headers. */
export async function fetchLocalAi(
  segments: readonly string[],
  options: RequestInit,
  transport: Transport = request,
) {
  if (!localAiRequestPath(options.method ?? "GET", segments))
    throw new Error("local_ai_request_invalid");
  const signal =
    options.signal ??
    AbortSignal.timeout(
      LOCAL_CODEX_POLICY.speechTimeoutMs +
        LOCAL_CODEX_POLICY.inferenceTimeoutMs +
        60_000,
    );
  signal.throwIfAborted();
  const chunks: Uint8Array[] = [],
    body = options.body;
  let bytes = 0;
  const add = (chunk: Uint8Array) => {
    bytes += chunk.length;
    if (bytes > OWNER_LIMITS.jsonBytes)
      throw new Error("local_ai_request_large");
    chunks.push(chunk);
  };
  if (typeof body === "string") add(new TextEncoder().encode(body));
  else if (body instanceof ReadableStream) {
    const reader = body.getReader(),
      abort = () => {
        void reader.cancel().catch(() => {});
      };
    signal.addEventListener("abort", abort, { once: true });
    try {
      for (;;) {
        signal.throwIfAborted();
        const part = await reader.read();
        if (part.done) break;
        add(part.value);
      }
      signal.throwIfAborted();
    } finally {
      signal.removeEventListener("abort", abort);
      await reader.cancel().catch(() => {});
      reader.releaseLock();
    }
  } else if (body instanceof Uint8Array) add(body);
  else if (body != null) throw new Error("local_ai_request_invalid");
  const input = Buffer.concat(chunks),
    headers = new Headers(options.headers);
  headers.set("Content-Length", String(input.length));
  return new Promise<Response>((done, fail) => {
    const pending = transport(
      {
        hostname: "127.0.0.1",
        port: 4000,
        path: `/v1/local/${segments.join("/")}`,
        method: "POST",
        headers: Object.fromEntries(headers),
        signal,
        agent: false,
      },
      (response) => {
        const output: Buffer[] = [];
        let received = 0;
        response.on("data", (chunk: Buffer) => {
          received += chunk.length;
          if (received > LOCAL_CODEX_POLICY.artifactBytes) {
            const error = new Error("local_ai_response_large");
            fail(error);
            pending.destroy(error);
            response.destroy(error);
          } else output.push(chunk);
        });
        response.once("error", () =>
          fail(new Error("local_ai_request_unavailable")),
        );
        response.once("aborted", () =>
          fail(new Error("local_ai_request_unavailable")),
        );
        response.once("end", () => {
          if (!response.complete) {
            fail(new Error("local_ai_request_unavailable"));
            return;
          }
          const resultHeaders = new Headers();
          for (const [key, value] of Object.entries(response.headers))
            if (value !== undefined)
              for (const item of Array.isArray(value) ? value : [value])
                resultHeaders.append(key, item);
          done(
            new Response(
              response.statusCode === 204
                ? null
                : new Uint8Array(Buffer.concat(output)),
              { status: response.statusCode ?? 502, headers: resultHeaders },
            ),
          );
        });
      },
    );
    pending.once("error", () =>
      fail(new Error("local_ai_request_unavailable")),
    );
    pending.end(input);
  });
}
