import { after } from "next/server";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  if (
    request.headers.get("origin") !== origin ||
    request.headers.get("sec-fetch-site") !== "same-origin"
  )
    return new Response(null, { status: 403 });
  // Next's Node adapter supplies a stream even for an empty POST.
  const reader = request.body?.getReader();
  if (reader) {
    let valid = true;
    const cancel = () => {
      valid = false;
      void reader.cancel().catch(() => undefined);
    };
    const timer = setTimeout(cancel, 2000);
    request.signal.addEventListener("abort", cancel, { once: true });
    if (request.signal.aborted) cancel();
    try {
      for (let reads = 0; reads < 3; reads++) {
        const chunk = await reader.read();
        if (chunk.done) break;
        if (chunk.value.byteLength || reads === 2) {
          valid = false;
          break;
        }
      }
    } catch {
      valid = false;
    } finally {
      clearTimeout(timer);
      request.signal.removeEventListener("abort", cancel);
      void reader.cancel().catch(() => undefined);
      reader.releaseLock();
    }
    if (!valid) return new Response(null, { status: 403 });
  }
  const cookies = (request.headers.get("cookie") ?? "")
    .split(";")
    .map((value) => value.trim())
    .filter((value) => value.startsWith("__Host-clipping_session="));
  const fixture = (request.headers.get("cookie") ?? "")
    .split(";")
    .map((value) => value.trim())
    .filter((value) => /^clipbuilder_fixture=[a-f0-9]{32}$/.test(value));
  const headers = new Headers({ "Cache-Control": "no-store" });
  headers.append(
    "Set-Cookie",
    "__Host-clipping_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict",
  );
  headers.append(
    "Set-Cookie",
    "clipbuilder_fixture=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict",
  );
  // Finish the response and reset cookies even when the control API is offline.
  // Next owns the callback lifetime across client navigation.
  if (
    (cookies.length === 1 && cookies[0]!.length <= 8192) ||
    fixture.length === 1
  )
    after(async () => {
      let response: Response | undefined;
      try {
        response = await fetch("http://127.0.0.1:4000/v1/session/exit", {
          method: "POST",
          cache: "no-store",
          redirect: "error",
          headers: {
            "Content-Type": "application/json",
            Origin: origin,
            "Sec-Fetch-Site": "same-origin",
            Cookie: [
              cookies.length === 1 && cookies[0]!.length <= 8192
                ? cookies[0]!
                : "",
              fixture.length === 1 ? fixture[0]! : "",
            ]
              .filter(Boolean)
              .join("; "),
          },
          body: "{}",
          signal: AbortSignal.timeout(5000),
        });
      } catch {
        // Private media expiry remains the fallback; visitors never retry cleanup.
      } finally {
        await response?.body?.cancel().catch(() => undefined);
      }
    });
  return new Response(null, { status: 204, headers });
}
