import { describe, expect, it, vi } from "vitest";
import type { ensureBrowser } from "@remotion/renderer";
import {
  preparePinnedBrowser,
  PINNED_CHROMIUM_VERSION,
} from "./browser-tooling.js";

describe("explicit pinned browser tooling", () => {
  it("pins the stable download and verifies the actual executable before returning it", async () => {
    const prepare = vi.fn<typeof ensureBrowser>(async (options) => {
      expect(options?.chromeMode).toBe("headless-shell");
      const download = options?.onBrowserDownload?.({
        chromeMode: "headless-shell",
      });
      expect(download?.version).toBe(PINNED_CHROMIUM_VERSION);
      return { type: "local-puppeteer-browser", path: "synthetic-browser" };
    });
    const inspect = vi.fn(
      async () => `Google Chrome for Testing ${PINNED_CHROMIUM_VERSION}\n`,
    );
    expect(await preparePinnedBrowser(prepare, inspect)).toEqual({
      type: "local-puppeteer-browser",
      path: "synthetic-browser",
    });
    expect(prepare).toHaveBeenCalledOnce();
    expect(inspect).toHaveBeenCalledExactlyOnceWith("synthetic-browser");
  });
  it("rejects an old or unexpected cached browser rather than staging it as patched", async () => {
    const prepare = vi.fn<typeof ensureBrowser>(async () => ({
      type: "local-puppeteer-browser",
      path: "synthetic-browser",
    }));
    for (const version of ["149.0.7790.0", "157.0.8080.0"])
      await expect(
        preparePinnedBrowser(prepare, async () => `Chromium ${version}`),
      ).rejects.toThrow("pinned security baseline");
  });
  it("fails without executing anything when the download has no prepared executable", async () => {
    const prepare = vi.fn<typeof ensureBrowser>(async () => ({
      type: "no-browser",
    }));
    const inspect = vi.fn(async () => "");
    await expect(preparePinnedBrowser(prepare, inspect)).rejects.toThrow(
      "preparation failed",
    );
    expect(inspect).not.toHaveBeenCalled();
  });
});
