import { describe, expect, it } from "vitest";
import { parseRendererConfig } from "./config.js";
describe("renderer composition gates", () => {
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
