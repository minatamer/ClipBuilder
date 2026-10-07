import {
  SAFE_ERROR_MESSAGES,
  errorEnvelopeSchema,
} from "@clipbuilder/contracts";
import {
  acquireControlRequest,
  controlRequestOrigin,
  controlIsLocal,
  fetchControlApi,
} from "../../../../server/control-api";

const allowed = new Map([
  ["GET config", "config"],
  ["POST sessions", "sessions"],
  ["GET session", "session"],
  ["POST assemble", "assemble"],
  ["POST upload/authorize", "upload/authorize"],
  ["POST upload/complete", "upload/complete"],
  ["POST analyze", "analyze"],
  ["POST render", "render"],
  ["POST clear", "clear"],
]);

async function proxy(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const resource = path.join("/");
  const destination =
    allowed.get(`${request.method} ${resource}`) ??
    (request.method === "GET" &&
    /^(?:analysis\/ana_|assembly\/asm_|operations\/op_)[A-Za-z0-9_-]{22}$/u.test(
      resource,
    )
      ? resource
      : null);
  const fail = (status: number, code: "INVALID_REQUEST" | "INTERNAL_ERROR") =>
    Response.json(
      {
        error: {
          code,
          message: SAFE_ERROR_MESSAGES[code],
          retryable: code === "INTERNAL_ERROR",
          requestId: `req_${"0".repeat(32)}`,
        },
      },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  if (destination === null) return fail(400, "INVALID_REQUEST");
  if (request.headers.get("sec-fetch-site") === "cross-site")
    return fail(400, "INVALID_REQUEST");
  let origin: string | null;
  try {
    origin = controlRequestOrigin(request);
    if (origin === null) return fail(400, "INVALID_REQUEST");
    if (!controlIsLocal() && destination !== "config")
      return fail(404, "INVALID_REQUEST");
  } catch {
    return fail(503, "INTERNAL_ERROR");
  }
  const declaredOrigin = request.headers.get("origin");
  if (declaredOrigin !== null && declaredOrigin !== origin)
    return fail(400, "INVALID_REQUEST");
  if (request.signal.aborted) return fail(503, "INTERNAL_ERROR");
  const controller = new AbortController();
  let reader =
    request.method === "POST" ? request.body?.getReader() : undefined;
  const onAbort = () => {
    controller.abort();
    if (reader !== undefined) void reader.cancel().catch(() => {});
  };
  request.signal.addEventListener("abort", onAbort, { once: true });
  const timeout = setTimeout(onAbort, 5_000);
  let release: (() => void) | undefined;
  let upstream: Response | undefined;
  try {
    release = acquireControlRequest();
    let body = request.method === "POST" ? "" : undefined;
    if (reader !== undefined) {
      const decoder = new TextDecoder();
      let bytes = 0;
      while (!controller.signal.aborted) {
        const chunk = await reader.read();
        if (chunk.done) break;
        bytes += chunk.value.byteLength;
        if (bytes > 8_192) return fail(400, "INVALID_REQUEST");
        body += decoder.decode(chunk.value, { stream: true });
      }
      body += decoder.decode();
      reader.releaseLock();
      reader = undefined;
    }
    if (controller.signal.aborted) return fail(503, "INTERNAL_ERROR");
    const cookie =
      request.headers
        .get("cookie")
        ?.split(";")
        .map((value) => value.trim())
        .find((value) => /^clipbuilder_fixture=[a-f0-9]{32}$/u.test(value)) ??
      "";
    upstream = await fetchControlApi(`/v1/sample/${destination}`, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
        Cookie: cookie,
      },
      ...(body === undefined ? {} : { body }),
      signal: controller.signal,
      cache: "no-store",
    });
    const headers = new Headers({
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
    });
    for (const cookie of upstream.headers.getSetCookie())
      headers.append("Set-Cookie", cookie);
    let content: string | null = null;
    if (upstream.status !== 204) {
      if (!upstream.body) return fail(503, "INTERNAL_ERROR");
      reader = upstream.body.getReader();
      const chunks: ArrayBuffer[] = [];
      let bytes = 0;
      for (let reads = 0; ; reads++) {
        const chunk = await reader.read();
        controller.signal.throwIfAborted();
        if (chunk.done) break;
        bytes += chunk.value.byteLength;
        if (bytes > 32768 || reads >= 1024) return fail(503, "INTERNAL_ERROR");
        chunks.push(new Uint8Array(chunk.value).buffer);
      }
      content = await new Blob(chunks).text();
    }
    if (controller.signal.aborted) return fail(503, "INTERNAL_ERROR");
    if (!upstream.ok) {
      const error = errorEnvelopeSchema.safeParse(
        JSON.parse(content ?? "null"),
      );
      if (
        !error.success ||
        error.data.error.message !== SAFE_ERROR_MESSAGES[error.data.error.code]
      )
        return fail(503, "INTERNAL_ERROR");
      content = JSON.stringify(error.data);
    }
    return new Response(content, { status: upstream.status, headers });
  } catch {
    return fail(503, "INTERNAL_ERROR");
  } finally {
    release?.();
    clearTimeout(timeout);
    request.signal.removeEventListener("abort", onAbort);
    if (reader !== undefined) {
      void reader.cancel().catch(() => {});
      reader.releaseLock();
    }
    if (upstream?.body && !upstream.body.locked)
      void upstream.body.cancel().catch(() => undefined);
  }
}

export const GET = proxy;
export const POST = proxy;
