import {
  SAFE_ERROR_MESSAGES,
  GROUNDED_ANALYSIS_LIMITS,
  TEMPORARY_MEDIA_LIMITS,
  PUBLIC_LIMITS,
  mediaByteRange,
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
    ![
      "grant",
      "session",
      "upload",
      "run",
      "clear",
      "assemble",
      "preview",
      "render",
      "render-result",
      "output",
    ].includes(action) ||
    origin !== "http://localhost:3000" ||
    request.headers.get("origin") !== origin ||
    request.headers.get("content-type")?.split(";")[0] !== "application/json" ||
    (request.headers.get("content-encoding") ?? "identity") !== "identity" ||
    request.headers.get("sec-fetch-site") !== "same-origin"
  )
    return fail(400);
  const controller = new AbortController(),
    abort = () => controller.abort();
  request.signal.addEventListener("abort", abort, { once: true });
  if (request.signal.aborted) abort();
  let timer = setTimeout(abort, 5000);
  let reader = request.body?.getReader();
  const cancelBody = () => {
    void reader?.cancel().catch(() => undefined);
  };
  controller.signal.addEventListener("abort", cancelBody);
  let upstream: Response | undefined;
  try {
    const chunks: ArrayBuffer[] = [];
    let size = 0;
    try {
      if (reader)
        for (;;) {
          const chunk = await reader.read();
          if (chunk.done) break;
          size += chunk.value.byteLength;
          if (
            size >
            ([
              "assemble",
              "preview",
              "render",
              "render-result",
              "output",
            ].includes(action)
              ? GROUNDED_ANALYSIS_LIMITS.responseBytes
              : GROUNDED_ANALYSIS_LIMITS.requestBytes)
          )
            return fail(413);
          chunks.push(new Uint8Array(chunk.value).buffer);
        }
    } finally {
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
    controller.signal.removeEventListener("abort", cancelBody);
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

export async function GET(
  request: Request,
  context: { params: Promise<{ action: string }> },
) {
  const { action } = await context.params;
  const url = new URL(request.url);
  const fail = () =>
    new Response(null, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  if (
    !["preview", "output", "download", "sample-source"].includes(action) ||
    url.origin !== "http://localhost:3000" ||
    url.search ||
    request.headers.get("sec-fetch-site") !== "same-origin"
  )
    return fail();
  const cookie = (request.headers.get("cookie") ?? "")
    .split(";")
    .map((v) => v.trim())
    .filter((v) => v.startsWith("__Host-clipping_session="));
  if (
    action !== "sample-source" &&
    (cookie.length !== 1 || cookie[0]!.length > 8192)
  )
    return fail();
  const range = request.headers.get("range");
  if (range && !/^bytes=\d*-\d*$/.test(range)) return fail();
  const cap =
    action === "sample-source"
      ? PUBLIC_LIMITS.maxSourceBytes
      : action === "preview"
        ? TEMPORARY_MEDIA_LIMITS.proxyBytes
        : PUBLIC_LIMITS.maxOutputBytes;
  const controller = new AbortController(),
    abort = () => controller.abort();
  request.signal.addEventListener("abort", abort, { once: true });
  if (request.signal.aborted) abort();
  const timer = setTimeout(abort, 60_000);
  const dispose = () => {
    clearTimeout(timer);
    request.signal.removeEventListener("abort", abort);
  };
  let upstream: Response | undefined;
  try {
    upstream = await fetch(
      action === "sample-source"
        ? "http://127.0.0.1:4000/v1/retained-sample/video"
        : `http://127.0.0.1:4000/v1/analysis/${action}`,
      {
        headers: {
          ...(action === "sample-source" ? {} : { Cookie: cookie[0]! }),
          Origin: url.origin,
          "Sec-Fetch-Site": "same-origin",
          ...(range ? { Range: range } : {}),
        },
        signal: controller.signal,
        cache: "no-store",
        redirect: "error",
      },
    );
    const length = Number(upstream.headers.get("content-length"));
    if (
      ![200, 206].includes(upstream.status) ||
      !upstream.body ||
      upstream.headers.get("content-type")?.split(";")[0] !== "video/mp4" ||
      !Number.isSafeInteger(length) ||
      length <= 0 ||
      length > cap
    )
      throw new Error();
    const headers = new Headers({
      "Content-Type": "video/mp4",
      "Cache-Control": "no-store",
      "Content-Length": String(length),
      "Accept-Ranges": "bytes",
      "X-Content-Type-Options": "nosniff",
    });
    if (action === "download")
      headers.set(
        "Content-Disposition",
        'attachment; filename="clipbuilder.mp4"',
      );
    const contentRange = upstream.headers.get("content-range");
    if (upstream.status === 206) {
      const parts = contentRange?.match(/^bytes (\d+)-(\d+)\/(\d+)$/),
        total = Number(parts?.[3]);
      if (!range || !parts || !Number.isSafeInteger(total) || total > cap)
        throw new Error();
      const selected = mediaByteRange(range, total);
      if (
        Number(parts[1]) !== selected.start ||
        Number(parts[2]) !== selected.end ||
        length !== selected.end - selected.start + 1
      )
        throw new Error();
      headers.set("Content-Range", contentRange!);
    } else if (range || contentRange) {
      throw new Error();
    }
    controller.signal.throwIfAborted();
    const reader = upstream.body.getReader();
    let count = 0,
      closed = false;
    async function close() {
      if (closed) return;
      closed = true;
      abort();
      await reader.cancel().catch(() => undefined);
      reader.releaseLock();
      controller.signal.removeEventListener("abort", cancelStream);
      dispose();
    }
    const cancelStream = () => {
      void reader.cancel().catch(() => undefined);
    };
    controller.signal.addEventListener("abort", cancelStream, { once: true });
    const body = new ReadableStream<Uint8Array>({
      async pull(output) {
        try {
          const chunk = await reader.read();
          controller.signal.throwIfAborted();
          if (chunk.done) {
            if (count !== length) throw new Error();
            output.close();
            await close();
            return;
          }
          count += chunk.value.byteLength;
          if (count > length) throw new Error();
          output.enqueue(chunk.value);
        } catch {
          output.error(new Error("media-unavailable"));
          await close();
        }
      },
      cancel: close,
    });
    return new Response(body, { status: upstream.status, headers });
  } catch {
    abort();
    await upstream?.body?.cancel().catch(() => undefined);
    dispose();
    return fail();
  }
}
