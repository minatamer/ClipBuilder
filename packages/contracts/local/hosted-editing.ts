export const EDITING_SESSION_COOKIE = "__Host-clipping_editor";
export const EDITING_CSRF_COOKIE = "__Host-clipping_editor_csrf";
export const HOSTED_EDITING_POLICY = {
  sessions: 1,
  starts: 3,
  rateWindowMs: 300_000,
  pendingStarts: 2,
  providerCalls: 32,
  nativeCalls: 64,
  reads: 1024,
  readBytes: 2 * 1024 ** 3,
  scratchBytes: 12 * 1024 ** 3,
  reserveBytes: 256 * 1024 ** 2,
  chunkBytes: 8 * 1024 ** 2,
} as const;
/** Shared transport allowlist, independent of caller/authentication checks. */
export function hostedEditingPath(method: string, path: string) {
  if (
    method === "GET" &&
    ["/capabilities", "/workspace", "/session"].includes(path)
  )
    return true;
  if (
    method === "POST" &&
    ["/session", "/upload", "/open/video"].includes(path)
  )
    return true;
  if (method === "PUT" && /^\/upload\/[a-f0-9-]{36}\/\d{1,5}$/u.test(path))
    return true;
  if (method === "DELETE" && path === "/session") return true;
  const match =
    /^\/workspace\/[a-f0-9-]{36}(?:\/(source|portrait|analysis|clips|assets)(?:\/([a-f0-9-]{36}|cancel)(?:\/(render|retry|cancel|output|source|edit|picture|validate|captions)(?:\/(\d{1,2}))?)?)?)?$/u.exec(
      path,
    );
  if (!match) return false;
  if (method === "DELETE") return !match[1];
  if (method === "GET") return true;
  return (
    method === "POST" &&
    Boolean(match[1]) &&
    match[1] !== "source" &&
    match[1] !== "assets"
  );
}
