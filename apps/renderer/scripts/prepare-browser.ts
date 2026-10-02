import { ensureBrowser } from "@remotion/renderer";
// This opt-in build/tooling command is never imported by the listening server.
const browser = await ensureBrowser();
if (!("path" in browser))
  throw new Error("Pinned Chromium preparation failed.");
process.stdout.write(
  JSON.stringify({ type: browser.type, path: browser.path }) + "\n",
);
