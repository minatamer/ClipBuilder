import { afterEach, expect, it, vi } from "vitest";
import robots from "./robots";
afterEach(() => vi.unstubAllEnvs());
it("keeps local and preview unindexed and opens only the production landing", () => {
  expect(robots().rules).toEqual({ userAgent: "*", disallow: "/" });
  vi.stubEnv("FRONTEND_ORIGIN", "https://synthetic-frontend.run.app");
  vi.stubEnv("PRIVATE_BACKEND_ORIGIN", "https://synthetic-backend.run.app");
  vi.stubEnv("BACKEND_AUDIENCE", "https://synthetic-backend.run.app");
  vi.stubEnv("APP_ENV", "preview");
  expect(robots().rules).toEqual({ userAgent: "*", disallow: "/" });
  vi.stubEnv("APP_ENV", "production");
  expect(robots().rules).toEqual({
    userAgent: "*",
    allow: "/",
    disallow: ["/start", "/api/"],
  });
});
