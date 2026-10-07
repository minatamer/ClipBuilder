import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { ensureBrowser } from "@remotion/renderer";

// Explicit tooling only: neither this module nor its downloader enters runtime.
// Stable Chrome for Testing release with October 6 security fixes.
export const PINNED_CHROMIUM_VERSION = "155.0.8059.39";

async function browserVersion(path: string): Promise<string> {
  const { stdout } = await promisify(execFile)(path, ["--version"], {
    timeout: 10000,
    windowsHide: true,
    maxBuffer: 4096,
  });
  return stdout;
}

export async function preparePinnedBrowser(
  prepare = ensureBrowser,
  inspect = browserVersion,
) {
  let lastProgress = -1;
  const browser = await prepare({
    chromeMode: "headless-shell",
    onBrowserDownload: () => ({
      version: PINNED_CHROMIUM_VERSION,
      onProgress: ({ percent }) => {
        const progress = Math.floor(percent * 10) * 10;
        if (progress !== lastProgress) {
          process.stdout.write(`Preparing pinned Chromium: ${progress}%\n`);
          lastProgress = progress;
        }
      },
    }),
  });
  if (!("path" in browser) || !browser.path)
    throw new Error("Pinned Chromium preparation failed.");
  const stdout = await inspect(browser.path);
  if (stdout.trim().split(/\s+/u).at(-1) !== PINNED_CHROMIUM_VERSION)
    throw new Error(
      "Prepared Chromium does not match the pinned security baseline.",
    );
  return browser;
}
