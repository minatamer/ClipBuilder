import {
  browserDiagnosticSchema,
  BROWSER_DIAGNOSTIC_LIMITS,
} from "@clipbuilder/contracts";
import {
  acquireControlRequest,
  controlRequestOrigin,
  fetchControlApi,
} from "../../../server/control-api";

/** The browser receives an empty acknowledgement, never private diagnostic output. */
export async function POST(request: Request): Promise<Response> {
  const acknowledge = () =>
    new Response(null, {
      status: 204,
      headers: { "Cache-Control": "no-store" },
    });
  let origin: string | null;
  try {
    origin = controlRequestOrigin(request);
  } catch {
    return acknowledge();
  }
  if (
    origin === null ||
    request.headers.get("origin") !== origin ||
    request.headers.get("sec-fetch-site") !== "same-origin" ||
    request.headers.get("content-type")?.split(";")[0] !== "application/json" ||
    (request.headers.get("content-encoding") ?? "identity") !== "identity"
  )
    return acknowledge();
  const controller = new AbortController();
  const abort = () => controller.abort();
  const timer = setTimeout(abort, BROWSER_DIAGNOSTIC_LIMITS.timeoutMs);
  request.signal.addEventListener("abort", abort, { once: true });
  const reader = request.body?.getReader();
  const cancel = () => {
    void reader?.cancel().catch(() => undefined);
  };
  controller.signal.addEventListener("abort", cancel);
  if (request.signal.aborted) abort();
  let response: Response | undefined;
  let release: (() => void) | undefined;
  try {
    release = acquireControlRequest();
    if (!reader) return acknowledge();
    const chunks: Uint8Array<ArrayBuffer>[] = [];
    let size = 0,
      done = false;
    for (let reads = 0; reads < 128; reads++) {
      const chunk = await reader.read();
      controller.signal.throwIfAborted();
      if (chunk.done) {
        done = true;
        break;
      }
      size += chunk.value.byteLength;
      if (size > BROWSER_DIAGNOSTIC_LIMITS.requestBytes) return acknowledge();
      chunks.push(new Uint8Array(chunk.value));
    }
    if (!done) return acknowledge();
    const value: unknown = JSON.parse(await new Blob(chunks).text());
    const record = browserDiagnosticSchema.safeParse(value);
    if (!record.success) return acknowledge();
    response = await fetchControlApi("/v1/diagnostics", {
      method: "POST",
      cache: "no-store",
      redirect: "error",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
        "Sec-Fetch-Site": "same-origin",
      },
      body: JSON.stringify(record.data),
      signal: controller.signal,
    });
  } catch {
    // Reporting failure cannot expose a backend error or affect the visitor's flow.
  } finally {
    release?.();
    clearTimeout(timer);
    request.signal.removeEventListener("abort", abort);
    controller.signal.removeEventListener("abort", cancel);
    void reader?.cancel().catch(() => undefined);
    reader?.releaseLock();
    void response?.body?.cancel().catch(() => undefined);
  }
  return acknowledge();
}
