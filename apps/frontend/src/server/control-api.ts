import { env } from "node:process";
import { PUBLIC_SITE_HOSTNAME } from "@clipbuilder/contracts";

type Configuration = {
  environment: "local" | "preview" | "production";
  frontendOrigin: string;
  backendOrigin: string;
  audience: string;
};
const unavailable = () => new Error("control-api-unavailable");
function hostedOrigin(
  value: string | undefined,
  publicFrontend = false,
): string {
  if (!value) throw unavailable();
  const url = new URL(value);
  if (
    url.origin !== value ||
    url.protocol !== "https:" ||
    (!url.hostname.endsWith(".run.app") &&
      !(publicFrontend && url.origin === `https://${PUBLIC_SITE_HOSTNAME}`)) ||
    url.username ||
    url.password
  )
    throw unavailable();
  return value;
}
export function readControlApiConfiguration(
  environment: Readonly<Record<string, string | undefined>>,
): Configuration {
  const mode = environment.APP_ENV ?? "local";
  if (mode === "local")
    return {
      environment: mode,
      frontendOrigin: "http://localhost:3000",
      backendOrigin: "http://127.0.0.1:4000",
      audience: "",
    };
  if (mode !== "preview" && mode !== "production") throw unavailable();
  const backendOrigin = hostedOrigin(environment.PRIVATE_BACKEND_ORIGIN);
  if (environment.BACKEND_AUDIENCE !== backendOrigin) throw unavailable();
  return {
    environment: mode,
    frontendOrigin: hostedOrigin(
      environment.FRONTEND_ORIGIN,
      mode === "production",
    ),
    backendOrigin,
    audience: backendOrigin,
  };
}
let configuration: { key: string; value: Configuration } | undefined;
function currentConfiguration() {
  const key = JSON.stringify([
    env.APP_ENV,
    env.FRONTEND_ORIGIN,
    env.PRIVATE_BACKEND_ORIGIN,
    env.BACKEND_AUDIENCE,
  ]);
  if (configuration?.key !== key)
    configuration = { key, value: readControlApiConfiguration(env) };
  return configuration.value;
}
export function controlFrontendOrigin() {
  return currentConfiguration().frontendOrigin;
}
/** Next standalone uses its bind address in request.url behind Cloud Run. */
export function controlRequestOrigin(request: Request): string | null {
  const target = currentConfiguration();
  if (target.environment === "local")
    return new URL(request.url).origin === target.frontendOrigin
      ? target.frontendOrigin
      : null;
  const expected = new URL(target.frontendOrigin);
  // Use the exact public Host and the TLS proxy marker; never trust a forwarded host.
  return request.headers.get("host") === expected.host &&
    request.headers.get("x-forwarded-proto") === "https"
    ? target.frontendOrigin
    : null;
}
export function controlIsLocal() {
  return currentConfiguration().environment === "local";
}
export function controlEnvironment() {
  return currentConfiguration().environment;
}

/** Bound control HTTP work before metadata/authentication or private API I/O. */
let active = 0;
export function acquireControlRequest(): () => void {
  if (active >= 8) throw unavailable();
  active++;
  let released = false;
  return () => {
    if (!released) {
      released = true;
      active--;
    }
  };
}

let identity:
  { audience: string; token: string; expiresAt: number } | undefined;
let pending: { audience: string; value: Promise<string> } | undefined;
async function readIdentity(audience: string): Promise<string> {
  const response = await fetch(
    "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?format=full&audience=" +
      encodeURIComponent(audience),
    {
      headers: { "Metadata-Flavor": "Google" },
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    },
  );
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  try {
    if (!response.ok || !response.body) throw unavailable();
    reader = response.body.getReader();
    const chunks: Uint8Array<ArrayBuffer>[] = [];
    let size = 0;
    for (;;) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > 8192) throw unavailable();
      chunks.push(new Uint8Array(part.value));
    }
    const token = (await new Blob(chunks).text()).trim();
    if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token))
      throw unavailable();
    // Only fixed Google metadata can supply this token; backend verifies its signature.
    const claims: unknown = JSON.parse(
      atob(token.split(".")[1]!.replaceAll("-", "+").replaceAll("_", "/")),
    );
    if (
      !claims ||
      typeof claims !== "object" ||
      !("exp" in claims) ||
      typeof claims.exp !== "number" ||
      !Number.isSafeInteger(claims.exp) ||
      claims.exp * 1000 <= Date.now() + 60_000
    )
      throw unavailable();
    identity = {
      audience,
      token,
      expiresAt: Math.min(claims.exp * 1000 - 60_000, Date.now() + 50 * 60_000),
    };
    return token;
  } finally {
    await reader?.cancel().catch(() => undefined);
    reader?.releaseLock();
    if (!response.body?.locked)
      await response.body?.cancel().catch(() => undefined);
  }
}
async function identityToken(audience: string) {
  if (identity?.audience === audience && identity.expiresAt > Date.now())
    return identity.token;
  if (pending && pending.audience !== audience) throw unavailable();
  if (!pending) {
    const value = readIdentity(audience).finally(() => {
      pending = undefined;
    });
    pending = { audience, value };
  }
  return pending.value;
}
export async function fetchControlApi(path: string, options: RequestInit) {
  if (
    !/^\/v1\/(?:editing\/[A-Za-z0-9/_-]+|analysis\/[a-z-]+|session\/exit|diagnostics|sample\/[A-Za-z0-9/_-]+|retained-sample\/video)$/.test(
      path,
    )
  )
    throw unavailable();
  const target = currentConfiguration();
  options.signal?.throwIfAborted();
  const headers = new Headers(options.headers);
  if (target.environment !== "local") {
    const token = await identityToken(target.audience);
    options.signal?.throwIfAborted();
    headers.set("X-Serverless-Authorization", `Bearer ${token}`);
    headers.set("X-ClipBuilder-Frontend-Authorization", `Bearer ${token}`);
  }
  return fetch(target.backendOrigin + path, {
    ...options,
    headers:
      target.environment === "local" ? (options.headers ?? headers) : headers,
    redirect: "error",
    cache: "no-store",
  });
}
