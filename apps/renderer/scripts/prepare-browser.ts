import { preparePinnedBrowser } from "./browser-tooling.js";
// This opt-in build/tooling command is never imported by the listening server.
const browser = await preparePinnedBrowser();
process.stdout.write(
  JSON.stringify({ type: browser.type, path: browser.path }) + "\n",
);
