import { env } from "node:process";
import { NextResponse, type NextRequest } from "next/server";

// A fresh server nonce is forwarded to Next's dynamic document renderer.
export function proxy(request: NextRequest) {
  const nonce = btoa(
      String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))),
    ),
    development = env.NODE_ENV === "development";
  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://challenges.cloudflare.com${development ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'nonce-${nonce}'`,
    // React/Remotion's fixed geometry is expressed as style attributes, not code.
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    `connect-src 'self' https://storage.googleapis.com https://challenges.cloudflare.com${development ? " ws://localhost:3000" : ""}`,
    "frame-src https://challenges.cloudflare.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
  ].join("; ");
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", policy);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", policy);
  // Observe Trusted Types compatibility without breaking Next/Player/Turnstile.
  response.headers.set(
    "Content-Security-Policy-Report-Only",
    "require-trusted-types-for 'script'",
  );
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Cache-Control", "no-store");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), fullscreen=(self)",
  );
  if (request.nextUrl.protocol === "https:")
    response.headers.set("Strict-Transport-Security", "max-age=31536000");
  return response;
}
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|icon.svg|favicon.ico|robots.txt).*)",
  ],
};
