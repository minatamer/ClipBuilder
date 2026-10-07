import {
  browserDiagnosticSchema,
  browserErrorDigestSchema,
  BROWSER_DIAGNOSTIC_LIMITS,
  type BrowserDiagnostic,
} from "@clipbuilder/contracts";

export function reportBrowserViewFailure(digest: unknown): Promise<void> {
  const parsed = browserErrorDigestSchema.safeParse(digest);
  return reportBrowserDiagnostic({
    kind: "view-failed",
    ...(parsed.success ? { digest: parsed.data } : {}),
  });
}

/** Private reporting must never block processing or print in the browser. */
export async function reportBrowserDiagnostic(
  value: BrowserDiagnostic,
  transport: typeof fetch = (...args) => fetch(...args),
): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    BROWSER_DIAGNOSTIC_LIMITS.timeoutMs,
  );
  let response: Response | undefined;
  try {
    const record = browserDiagnosticSchema.parse(value);
    response = await transport("/api/diagnostics", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      redirect: "error",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
      signal: controller.signal,
    });
  } catch {
    // No retry, UI change, console output or provider work on reporting failure.
  } finally {
    clearTimeout(timer);
    await response?.body?.cancel().catch(() => undefined);
  }
}
