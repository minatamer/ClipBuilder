import { createRequire } from "node:module";
import { pathToFileURL, fileURLToPath } from "node:url";
import process from "node:process";

// Isolated upload-only authoring surfaces; use Codex browser to capture them.
// Never launches an external/headless browser or touches owner media.
const require = createRequire(import.meta.url);
const remotionRequire = createRequire(
  require.resolve("@remotion/cli/package.json"),
);
const { register } = await import(
  pathToFileURL(remotionRequire.resolve("tsx/esm/api")).href
);
register();
process.chdir(fileURLToPath(new URL("../../../", import.meta.url)));
const { installTestEnvironment } =
  await import("../../../test/deterministic.environment.ts");
installTestEnvironment();
const { startMarketingFixtures } =
  await import("../../../test/owner-marketing-fixture.ts");
const fixtures = await startMarketingFixtures({
  portfolio: process.argv.includes("--portfolio"),
});
process.once("SIGINT", () => {
  void fixtures.close();
});
process.once("SIGTERM", () => {
  void fixtures.close();
});
process.stdout.write(JSON.stringify(fixtures) + "\n");
