import { env } from "node:process";
import { NextResponse, type NextRequest } from "next/server";
import { browserSecurityPolicy } from "./browser-security-policy";

// A fresh server nonce is forwarded to Next's dynamic document renderer.
export function proxy(request: NextRequest) {
  const nonce = btoa(
      String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))),
    ),
    development = env.NODE_ENV === "development";
  const policy = browserSecurityPolicy(nonce, development);
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
  // Picked MP4s stream through the route's own origin/auth checks. Document
  // Proxy clones bodies and truncates large uploads at its 10 MB default.
  matcher: [
    "/((?!api/local/open/video/?$|_next/static|_next/image|icon.svg|favicon.ico|favicon.png|robots.txt).*)",
  ],
};
