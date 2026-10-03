import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "./proxy";
describe("request-scoped browser security", () => {
  it("replaces an untrusted nonce, forwards it to rendering and never caches a document", () => {
    const request = new NextRequest("http://localhost:3000/start", {
      headers: { "x-nonce": "untrusted" },
    });
    const a = proxy(request),
      b = proxy(request),
      policy = a.headers.get("Content-Security-Policy")!;
    expect(policy).toContain("'strict-dynamic'");
    expect(policy).not.toContain("unsafe-eval");
    expect(
      policy.split("; ").find((value) => value.startsWith("script-src")),
    ).not.toContain("unsafe-inline");
    expect(policy).not.toContain("untrusted");
    expect(policy).not.toBe(b.headers.get("Content-Security-Policy"));
    expect(a.headers.get("x-middleware-request-content-security-policy")).toBe(
      policy,
    );
    expect(a.headers.get("x-middleware-request-x-nonce")).toMatch(
      /^[A-Za-z0-9+/]{22}==$/,
    );
    expect(a.headers.get("Cache-Control")).toBe("no-store");
    expect(a.headers.get("Referrer-Policy")).toBe("no-referrer");
    expect(a.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(a.headers.get("X-Frame-Options")).toBe("DENY");
    expect(policy).toContain("frame-src https://challenges.cloudflare.com");
    expect(policy).toContain(
      "connect-src 'self' https://storage.googleapis.com https://challenges.cloudflare.com",
    );
    expect(policy).not.toContain("*");
    expect(policy).toContain("object-src 'none'");
    expect(a.headers.get("Strict-Transport-Security")).toBeNull();
  });
  it("enables HSTS only over HTTPS while Trusted Types stays report-only", () => {
    const response = proxy(
      new NextRequest("https://clipbuilder.example.test/start"),
    );
    expect(response.headers.get("Strict-Transport-Security")).toBe(
      "max-age=31536000",
    );
    expect(response.headers.get("Content-Security-Policy-Report-Only")).toBe(
      "require-trusted-types-for 'script'",
    );
    expect(response.headers.get("Content-Security-Policy")).not.toContain(
      "require-trusted-types",
    );
  });
});
