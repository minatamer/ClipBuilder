import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => vi.resetModules());
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
const frontend = "https://synthetic-frontend.run.app";
const backend = "https://synthetic-backend.run.app";
function hosted() {
  vi.stubEnv("APP_ENV", "production");
  vi.stubEnv("FRONTEND_ORIGIN", frontend);
  vi.stubEnv("PRIVATE_BACKEND_ORIGIN", backend);
  vi.stubEnv("BACKEND_AUDIENCE", backend);
}
const token = () =>
  "synthetic." +
  btoa(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }),
  ).replaceAll("=", "") +
  ".signature";
describe("private control transport", () => {
  it("resolves a hosted request from the exact public host and HTTPS proxy marker rather than the container URL", async () => {
    hosted();
    const api = await import("./control-api");
    const request = (headers: Record<string, string>) =>
      new Request("https://0.0.0.0:8080/api/sample/config", { headers });
    const headers = {
      Host: "synthetic-frontend.run.app",
      "X-Forwarded-Proto": "https",
    };
    expect(api.controlRequestOrigin(request(headers))).toBe(frontend);
    for (const invalid of [
      {},
      { ...headers, Host: "other.run.app" },
      { ...headers, Host: "synthetic-frontend.run.app:8080" },
      { ...headers, "X-Forwarded-Proto": "http" },
      { ...headers, "X-Forwarded-Proto": "https,http" },
      { "X-Forwarded-Host": headers.Host, "X-Forwarded-Proto": "https" },
    ])
      expect(api.controlRequestOrigin(request(invalid))).toBeNull();
    vi.stubEnv("FRONTEND_ORIGIN", "https://tryclipbuilder.com");
    expect(
      api.controlRequestOrigin(
        request({ ...headers, Host: "tryclipbuilder.com" }),
      ),
    ).toBe("https://tryclipbuilder.com");
    vi.stubEnv("APP_ENV", "local");
    expect(
      api.controlRequestOrigin(new Request("http://localhost:3000/start")),
    ).toBe("http://localhost:3000");
    expect(api.controlRequestOrigin(request(headers))).toBeNull();
  });
  it("accepts only the owner public hostname in production while keeping the private target on Cloud Run", async () => {
    const api = await import("./control-api");
    const values = {
      APP_ENV: "production",
      FRONTEND_ORIGIN: "https://tryclipbuilder.com",
      PRIVATE_BACKEND_ORIGIN: backend,
      BACKEND_AUDIENCE: backend,
    };
    expect(api.readControlApiConfiguration(values).frontendOrigin).toBe(
      values.FRONTEND_ORIGIN,
    );
    for (const origin of [
      "https://tryclipbuilding.com",
      "https://www.tryclipbuilder.com",
      "https://tryclipbuilder.com.evil.example",
      "https://tryclipbuilder.com:8443",
      "http://tryclipbuilder.com",
      "https://tryclipbuilder.com/path",
    ]) {
      expect(() =>
        api.readControlApiConfiguration({ ...values, FRONTEND_ORIGIN: origin }),
      ).toThrow();
    }
    expect(() =>
      api.readControlApiConfiguration({ ...values, APP_ENV: "preview" }),
    ).toThrow();
    expect(() =>
      api.readControlApiConfiguration({
        ...values,
        PRIVATE_BACKEND_ORIGIN: values.FRONTEND_ORIGIN,
        BACKEND_AUDIENCE: values.FRONTEND_ORIGIN,
      }),
    ).toThrow();
  });
  it("retains fixed localhost behavior without metadata or hosted configuration", async () => {
    const api = await import("./control-api");
    vi.stubEnv("PRIVATE_BACKEND_ORIGIN", "https://ignored.example");
    const transport = vi.fn<typeof fetch>(async () => Response.json({}));
    vi.stubGlobal("fetch", transport);
    expect(api.controlFrontendOrigin()).toBe("http://localhost:3000");
    await api.fetchControlApi("/v1/sample/config", {});
    expect(transport).toHaveBeenCalledOnce();
    expect(transport.mock.calls[0]?.[0]).toBe(
      "http://127.0.0.1:4000/v1/sample/config",
    );
    expect(
      new Headers(transport.mock.calls[0]?.[1]?.headers).has(
        "X-Serverless-Authorization",
      ),
    ).toBe(false);
  });
  it.each([
    "https://other.example",
    backend + "/",
    "http://synthetic.run.app",
    "https://user@synthetic.run.app",
    "https://synthetic.run.app/path",
  ])("rejects an unapproved target %s", async (origin) => {
    const api = await import("./control-api");
    expect(() =>
      api.readControlApiConfiguration({
        APP_ENV: "production",
        PRIVATE_BACKEND_ORIGIN: origin,
        BACKEND_AUDIENCE: origin,
        FRONTEND_ORIGIN: frontend,
      }),
    ).toThrow();
  });
  it("uses a single bounded metadata identity request with the exact audience, caches it and replaces visitor identity headers", async () => {
    hosted();
    const api = await import("./control-api");
    const jwt = token();
    const transport = vi.fn<typeof fetch>(async (url) =>
      String(url).startsWith("http://metadata.")
        ? new Response(jwt)
        : Response.json({}),
    );
    vi.stubGlobal("fetch", transport);
    const options = {
      headers: {
        "X-Serverless-Authorization": "untrusted",
        "X-ClipBuilder-Frontend-Authorization": "untrusted",
        Origin: frontend,
      },
    };
    await Promise.all([
      api.fetchControlApi("/v1/analysis/session", options),
      api.fetchControlApi("/v1/session/exit", options),
    ]);
    await api.fetchControlApi("/v1/sample/config", options);
    expect(transport).toHaveBeenCalledTimes(4);
    expect(String(transport.mock.calls[0]?.[0])).toContain(
      "audience=" + encodeURIComponent(backend),
    );
    expect(
      new Headers(transport.mock.calls[0]?.[1]?.headers).get("Metadata-Flavor"),
    ).toBe("Google");
    for (const [url, request] of transport.mock.calls.slice(1)) {
      expect(String(url).startsWith(backend + "/v1/")).toBe(true);
      const headers = new Headers(request?.headers);
      expect(headers.get("X-Serverless-Authorization")).toBe("Bearer " + jwt);
      expect(headers.get("X-ClipBuilder-Frontend-Authorization")).toBe(
        "Bearer " + jwt,
      );
      expect(request?.redirect).toBe("error");
    }
  });
  it.each([
    "x".repeat(8193),
    "invalid",
    "synthetic." + btoa('{"exp":1}') + ".signature",
  ])("fails closed before API dispatch for invalid metadata", async (value) => {
    hosted();
    const api = await import("./control-api");
    const transport = vi.fn<typeof fetch>(async () => new Response(value));
    vi.stubGlobal("fetch", transport);
    await expect(
      api.fetchControlApi("/v1/sample/config", {}),
    ).rejects.toThrow();
    expect(transport).toHaveBeenCalledOnce();
  });
  it("holds capacity until explicit release and rejects arbitrary or aborted destinations without I/O", async () => {
    const api = await import("./control-api");
    const slots = Array.from({ length: 8 }, () => api.acquireControlRequest());
    expect(() => api.acquireControlRequest()).toThrow();
    slots[0]!();
    slots[0]!();
    const replacement = api.acquireControlRequest();
    expect(() => api.acquireControlRequest()).toThrow();
    replacement();
    slots.forEach((release) => release());
    const transport = vi.fn();
    vi.stubGlobal("fetch", transport);
    await expect(
      api.fetchControlApi("//foreign.example", {}),
    ).rejects.toThrow();
    await expect(
      api.fetchControlApi("/v1/sample/config", { signal: AbortSignal.abort() }),
    ).rejects.toThrow();
    expect(transport).not.toHaveBeenCalled();
  });
});
