import { describe, expect, it } from "vitest";
import { parseRendererConfig } from "./config.js";
describe("renderer composition gates", () => {
  it("accepts one exact hosted upload origin without replacing localhost", () => {
    for (const origin of [
      "https://synthetic-frontend.run.app",
      "https://tryclipbuilder.com",
    ])
      expect(
        parseRendererConfig({ HOSTED_FRONTEND_ORIGIN: origin }),
      ).toMatchObject({
        FRONTEND_ORIGIN: "http://localhost:3000",
        HOSTED_FRONTEND_ORIGIN: origin,
      });
    for (const origin of [
      "http://synthetic-frontend.run.app",
      "https://other.example",
      "https://tryclipbuilding.com",
      "https://www.tryclipbuilder.com",
      "https://tryclipbuilder.com:8443",
      "https://user@synthetic-frontend.run.app",
      "https://synthetic-frontend.run.app/path",
      "https://synthetic-frontend.run.app:8443",
    ])
      expect(() =>
        parseRendererConfig({ HOSTED_FRONTEND_ORIGIN: origin }),
      ).toThrow();
  });
  it("prevents production from routing uploaded media back through vendor tools", () => {
    const environment = {
      NODE_ENV: "production",
      RENDERER_ENABLED: "true",
      CLOUD_SPEND_APPROVED: "true",
      REMOTION_LICENSE_CONFIRMED: "true",
      RENDERER_BUCKET: "synthetic-bucket",
      RENDERER_AUDIENCE: "https://synthetic-renderer.run.app",
      RENDERER_CALLER_EMAIL: "synthetic-control@example.com",
      RENDERER_EXPIRY_CALLER_EMAIL: "synthetic-expiry@example.com",
      RENDERER_CLEANUP_KEY_FILE: "/synthetic/key",
      CHROMIUM_PATH: "/synthetic/chrome",
      REMOTION_BUNDLE_PATH: "/synthetic/bundle",
      FFMPEG_PATH: "/usr/bin/ffmpeg",
      FFPROBE_PATH: "/usr/bin/ffprobe",
    };
    expect(parseRendererConfig(environment).FFMPEG_PATH).toBe(
      "/usr/bin/ffmpeg",
    );
    for (const changed of [
      { FFMPEG_PATH: "/opt/clipbuilder/compositor/ffmpeg" },
      { FFPROBE_PATH: "/opt/clipbuilder/compositor/ffprobe" },
    ])
      expect(() => parseRendererConfig({ ...environment, ...changed })).toThrow(
        "maintained system tools",
      );
  });
  it("defaults disabled and prevents cloud composition in tests", () => {
    expect(parseRendererConfig({ NODE_ENV: "test" })).toMatchObject({
      RENDERER_ENABLED: false,
      CLOUD_SPEND_APPROVED: false,
    });
    for (const override of [
      { RENDERER_ENABLED: "true" },
      { CLOUD_SPEND_APPROVED: "true" },
      { RENDERER_MAX_OPERATIONS: "1" },
      { RENDERER_CLEANUP_KEY_FILE: "/synthetic/key" },
    ])
      expect(() =>
        parseRendererConfig({ NODE_ENV: "test", ...override }),
      ).toThrow();
  });
  it("rejects the retired lifetime cap instead of silently applying it", () => {
    for (const value of ["0", "2", "4"])
      expect(() =>
        parseRendererConfig({ RENDERER_MAX_OPERATIONS: value }),
      ).toThrow("retired");
  });
  it("requires complete private runtime gates even when AI is fake", () => {
    expect(() =>
      parseRendererConfig({
        NODE_ENV: "production",
        FAKE_MODE: "true",
        RENDERER_ENABLED: "true",
      }),
    ).toThrow("gates");
  });
});
