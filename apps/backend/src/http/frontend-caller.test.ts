import { describe, expect, it, vi } from "vitest";
import { OAuth2Client, LoginTicket } from "google-auth-library";
import request from "supertest";
import { GoogleFrontendCaller } from "./frontend-caller.js";
import { createApplication } from "../app.js";
import { loadConfig } from "../config/loadConfig.js";
import { createLiveValidationEnvironment } from "../../test/environment.fixture.js";
const audience = "https://synthetic-backend.run.app";
const frontend = "https://synthetic-frontend.run.app";
const email = "synthetic@synthetic.iam.gserviceaccount.com";
describe("private hosted frontend caller", () => {
  it("verifies signed audience, exact identity and verified email", async () => {
    const verifier = new GoogleFrontendCaller(audience, email);
    const validate = vi.spyOn(OAuth2Client.prototype, "verifyIdToken");
    try {
      for (const value of [undefined, "Bearer invalid", "x".repeat(8193)])
        expect(await verifier.verify(value)).toBe(false);
      expect(validate).not.toHaveBeenCalled();
      for (const [identity, verified, allowed] of [
        [email, true, true],
        [email, false, false],
        ["other@synthetic.example", true, false],
      ] as const) {
        validate.mockResolvedValueOnce(
          new LoginTicket("synthetic", {
            email: identity,
            email_verified: verified,
            iss: "accounts.google.com",
            sub: "synthetic",
            aud: audience,
            iat: 1,
            exp: 2,
          }),
        );
        expect(await verifier.verify("Bearer header.claims.signature")).toBe(
          allowed,
        );
      }
      expect(validate).toHaveBeenLastCalledWith({
        idToken: "header.claims.signature",
        audience,
      });
      validate.mockRejectedValueOnce(new Error("synthetic private failure"));
      expect(await verifier.verify("Bearer header.claims.signature")).toBe(
        false,
      );
    } finally {
      validate.mockRestore();
    }
  });
  it("keeps public paid composition closed unless exact launch configuration is approved", () => {
    const values = {
      ...createLiveValidationEnvironment(),
      NODE_ENV: "production",
      APP_ENV: "production",
      APP_REVISION: "synthetic",
      FRONTEND_ORIGIN: frontend,
      BACKEND_ORIGIN: audience,
      BACKEND_AUDIENCE: audience,
      FRONTEND_CALLER_EMAIL: email,
      TURNSTILE_EXPECTED_HOSTNAME: new URL(frontend).hostname,
    };
    expect(() => loadConfig(values)).toThrow();
    const config = loadConfig({
      ...values,
      PUBLIC_PAID_PROCESSING_APPROVED: "true",
      RETAINED_SAMPLE_BUCKET: "ignored",
      RETAINED_SAMPLE_OBJECT: "ignored",
    });
    expect(config.features.liveRender).toBe(true);
    expect(config.retainedSample.enabled).toBe(false);
    const customDomain = {
      ...values,
      PUBLIC_PAID_PROCESSING_APPROVED: "true",
      FRONTEND_ORIGIN: "https://tryclipbuilding.com",
      TURNSTILE_EXPECTED_HOSTNAME: "tryclipbuilding.com",
    };
    expect(loadConfig(customDomain).features.liveRender).toBe(true);
    for (const origin of [
      "https://www.tryclipbuilding.com",
      "https://tryclipbuilding.com.evil.example",
      "https://tryclipbuilding.com:8443",
      "http://tryclipbuilding.com",
    ])
      expect(() =>
        loadConfig({
          ...customDomain,
          FRONTEND_ORIGIN: origin,
          TURNSTILE_EXPECTED_HOSTNAME: new URL(origin).hostname,
        }),
      ).toThrow();
    expect(() =>
      loadConfig({ ...customDomain, TURNSTILE_EXPECTED_HOSTNAME: "localhost" }),
    ).toThrow();
    for (const changed of [
      { BACKEND_AUDIENCE: frontend },
      { FRONTEND_CALLER_EMAIL: "arbitrary@example.com" },
      { TURNSTILE_EXPECTED_HOSTNAME: "localhost" },
      { APP_ENV: "preview" },
    ])
      expect(() =>
        loadConfig({
          ...values,
          PUBLIC_PAID_PROCESSING_APPROVED: "true",
          ...changed,
        }),
      ).toThrow();
  });
  it("does not trust forwarded protocol or visitor caller headers, and health stays content-free", async () => {
    const config = loadConfig({
      NODE_ENV: "test",
      APP_ENV: "preview",
      FAKE_MODE: "true",
      PAID_DEMO_ENABLED: "false",
      FRONTEND_ORIGIN: frontend,
    });
    const verify = vi.fn(async () => false);
    const application = createApplication(config, undefined, { verify });
    await request(application).get("/v1/health").expect(200);
    expect(verify).not.toHaveBeenCalled();
    const rejected = await request(application)
      .get("/v1/sample/config")
      .set("X-Forwarded-Proto", "https")
      .set("X-ClipBuilder-Frontend-Authorization", "forged")
      .expect(403);
    expect(rejected.text).not.toContain("forged");
    verify.mockResolvedValueOnce(true);
    await request(application).get("/v1/sample/config").expect(200);
    expect(verify).toHaveBeenCalledTimes(2);
  });
});
