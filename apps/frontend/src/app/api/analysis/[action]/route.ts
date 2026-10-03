import {
  SAFE_ERROR_MESSAGES,
  GROUNDED_ANALYSIS_LIMITS,
  TEMPORARY_MEDIA_LIMITS,
} from "@clipbuilder/contracts";

async function proxy(
  request: Request,
  context: { params: Promise<{ action: string }> },
) {
  const { action } = await context.params;
  const fail = (status: number) =>
    Response.json(
      {
        error: {
          code: "INVALID_REQUEST",
          message: SAFE_ERROR_MESSAGES.INVALID_REQUEST,
          retryable: false,
          requestId: `req_${"0".repeat(32)}`,
        },
      },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  const origin = new URL(request.url).origin;
  if (
    !["grant", "session", "upload", "run", "clear"].includes(action) ||
    origin !== "http://localhost:3000" ||
    request.headers.get("origin") !== origin ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    return fail(400);
  const controller = new AbortController(),
    abort = () => controller.abort();
  request.signal.addEventListener("abort", abort, { once: true });
  if (request.signal.aborted) abort();
  let timer = setTimeout(abort, 5000);
  let reader = request.body?.getReader();
  let upstream: Response | undefined;
  try {
    const chunks: ArrayBuffer[] = [];
    let size = 0;
    const cancelBody = () => {
      void reader?.cancel().catch(() => undefined);
    };
    controller.signal.addEventListener("abort", cancelBody, { once: true });
    try {
      if (reader)
        for (;;) {
          const chunk = await reader.read();
          if (chunk.done) break;
          size += chunk.value.byteLength;
          if (size > GROUNDED_ANALYSIS_LIMITS.requestBytes) return fail(413);
          chunks.push(new Uint8Array(chunk.value).buffer);
        }
    } finally {
      controller.signal.removeEventListener("abort", cancelBody);
      await reader?.cancel();
      reader?.releaseLock();
      reader = undefined;
    }
    controller.signal.throwIfAborted();
    clearTimeout(timer);
    timer = setTimeout(
      abort,
      TEMPORARY_MEDIA_LIMITS.workDeadlineMs +
        GROUNDED_ANALYSIS_LIMITS.cleanupMs,
    );
    const cookies = (request.headers.get("cookie") ?? "")
      .split(";")
      .map((v) => v.trim())
      .filter((v) => v.startsWith("__Host-clipping_session="));
    if (cookies.length > 1 || (cookies[0]?.length ?? 0) > 8192)
      return fail(400);
    const csrf = request.headers.get("x-csrf-token") ?? "";
    if (csrf.length > 64) return fail(400);
    upstream = await fetch(`http://127.0.0.1:4000/v1/analysis/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
        "Sec-Fetch-Site": "same-origin",
        Cookie: cookies[0] ?? "",
        "X-CSRF-Token": csrf,
      },
      body: new Blob(chunks).size ? await new Blob(chunks).text() : "{}",
      signal: controller.signal,
      redirect: "error",
      cache: "no-store",
    });
    const headers = new Headers({
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
    });
    for (const cookie of upstream.headers.getSetCookie())
      headers.append("Set-Cookie", cookie);
    if (upstream.status === 204)
      return new Response(null, { status: 204, headers });
    if (!upstream.body) return fail(503);
    reader = upstream.body.getReader();
    const output: ArrayBuffer[] = [];
    size = 0;
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > GROUNDED_ANALYSIS_LIMITS.responseBytes) return fail(503);
      output.push(new Uint8Array(chunk.value).buffer);
    }
    controller.signal.throwIfAborted();
    return new Response(new Blob(output), { status: upstream.status, headers });
  } catch {
    return fail(503);
  } finally {
    clearTimeout(timer);
    request.signal.removeEventListener("abort", abort);
    if (reader) {
      await reader.cancel().catch(() => undefined);
      reader.releaseLock();
    }
    if (upstream?.body && !upstream.body.locked)
      await upstream.body.cancel().catch(() => undefined);
  }
}
export const POST = proxy;
