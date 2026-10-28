import { hostedEditingPath as admittedHostedPath } from "../../../../packages/contracts/local/hosted-editing.ts";
import { env } from "node:process";
import { hostedDemoClientIp } from "./demo-client-ip";
import { discoverOwnerHost } from "../../../../scripts/local-discovery.mjs";
import {
  acquireControlRequest,
  controlIsLocal,
  controlRequestOrigin,
  fetchControlApi,
} from "./control-api";

/** The per-run capability stays between the two local servers, never in browser state. */
export async function proxyLocalWorkflow(request: Request, segments: string[]) {
  const origin = controlRequestOrigin(request);
  const site = request.headers.get("sec-fetch-site");
  const local = controlIsLocal();
  if (!local && !hostedEditingPath(request.method, segments))
    return new Response(null, { status: 404 });
  if (
    !origin ||
    (site !== null && site !== "same-origin" && site !== "none") ||
    (request.headers.has("origin") &&
      request.headers.get("origin") !== origin) ||
    (request.method !== "GET" && request.headers.get("origin") !== origin) ||
    !segments.length ||
    segments.some((part) => !/^[A-Za-z0-9_-]{1,128}$/.test(part)) ||
    segments[0] === "agent" ||
    segments[0] === "shutdown" ||
    new URL(request.url).search
  )
    return new Response(null, { status: 403 });
  let release: (() => void) | undefined;
  const controller = new AbortController();
  const abort = () => controller.abort();
  request.signal.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, 30 * 60_000);
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let done = false;
  const finish = async () => {
    if (done) return;
    done = true;
    controller.abort();
    clearTimeout(timer);
    request.signal.removeEventListener("abort", abort);
    try {
      await reader?.cancel();
    } catch {
      /* Connection already closed. */
    }
    reader?.releaseLock();
    release?.();
  };
  try {
    release = acquireControlRequest();
    if (request.signal.aborted) controller.abort();
    controller.signal.throwIfAborted();
    const headers = new Headers({
      Origin: origin,
      "Sec-Fetch-Site": "same-origin",
    });
    if (!local) {
      headers.set(
        "X-ClipBuilder-Client-IP",
        hostedDemoClientIp(
          request.headers,
          env.HOSTED_DEMO_IP_VERIFIED === "true",
        ),
      );
      const cookie = request.headers.get("cookie") ?? "";
      const pairs = cookie
        .split(";")
        .map((part) => part.trim())
        .filter((part) =>
          /^__Host-clipping_editor(?:_csrf)?=[A-Za-z0-9_-]{43}$/u.test(part),
        );
      headers.set("Cookie", pairs.join("; "));
      const csrf = pairs.filter((part) =>
        part.startsWith("__Host-clipping_editor_csrf="),
      );
      if (csrf.length === 1)
        headers.set("X-CSRF-Token", csrf[0]!.split("=")[1]!);
    }
    for (const key of ["content-type", "content-length", "range"]) {
      const value = request.headers.get(key);
      if (value !== null) headers.set(key, value);
    }
    const options: RequestInit & { duplex?: "half" } = {
      method: request.method,
      headers,
      signal: controller.signal,
      cache: "no-store",
      redirect: "error",
    };
    if (request.method !== "GET" && request.body) {
      options.body = request.body;
      options.duplex = "half";
    }
    let response: Response;
    if (local) {
      const host = await discoverOwnerHost();
      headers.set("Authorization", `Bearer ${host.token}`);
      response = await fetch(
        `http://127.0.0.1:4000/v1/local/${segments.join("/")}`,
        options,
      );
    } else
      response = await fetchControlApi(
        `/v1/editing/${segments.join("/")}`,
        options,
      );
    const resultHeaders = new Headers({
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    });
    for (const key of [
      "content-type",
      "content-length",
      "content-range",
      "accept-ranges",
      "content-disposition",
      "retry-after",
    ]) {
      const value = response.headers.get(key);
      if (value !== null) resultHeaders.set(key, value);
    }
    if (!local && segments.join("/") === "session")
      for (const cookie of response.headers.getSetCookie()) {
        if (
          /^__Host-clipping_editor(?:_csrf)?=(?:[A-Za-z0-9_-]{43})?;/u.test(
            cookie,
          ) &&
          /; Secure/iu.test(cookie) &&
          /; HttpOnly/iu.test(cookie) &&
          /; SameSite=Strict/iu.test(cookie)
        )
          resultHeaders.append("Set-Cookie", cookie);
      }
    if (!response.body) {
      await finish();
      return new Response(null, {
        status: response.status,
        headers: resultHeaders,
      });
    }
    reader = response.body.getReader();
    const stream = new ReadableStream<Uint8Array>({
      async pull(output) {
        try {
          const part = await reader!.read();
          if (part.done) {
            output.close();
            await finish();
          } else output.enqueue(part.value);
        } catch {
          output.error(new Error("local_stream_unavailable"));
          await finish();
        }
      },
      async cancel() {
        await finish();
      },
    });
    return new Response(stream, {
      status: response.status,
      headers: resultHeaders,
    });
  } catch {
    await finish();
    return Response.json(
      { error: "local_workflow_unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

/** Hosted requests never discover the owner capability or forward acquisition aliases. */
export function hostedEditingPath(method: string, segments: readonly string[]) {
  return admittedHostedPath(method, "/" + segments.join("/"));
}
