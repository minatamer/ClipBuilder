import { spawnSync } from "node:child_process";
import { stat } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  FILM_OPENING_FRAME,
  FILM_POSTER,
} from "../src/features/product-film/film-timeline.ts";

async function renderPoster() {
  const browserArgument = process.argv
    .slice(2)
    .find((argument) => argument.startsWith("--browser-executable="));
  const executable = browserArgument?.slice("--browser-executable=".length);
  if (!executable || !(await stat(executable)).isFile())
    throw new Error("browser_required");

  const require = createRequire(import.meta.url);
  const cli = join(
    dirname(require.resolve("@remotion/cli/package.json")),
    "remotion-cli.js",
  );
  const result = spawnSync(
    process.execPath,
    [
      cli,
      "still",
      "src/features/product-film/studio.tsx",
      "ClipBuilderWalkthrough",
      fileURLToPath(new URL(`../public${FILM_POSTER}`, import.meta.url)),
      `--frame=${FILM_OPENING_FRAME}`,
      "--image-format=jpeg",
      "--jpeg-quality=85",
      "--scale=0.5",
      browserArgument,
    ],
    { cwd: fileURLToPath(new URL("../", import.meta.url)), stdio: "inherit" },
  );
  if (result.error || result.status !== 0)
    throw new Error("poster_render_failed");
}

renderPoster().catch(() => {
  process.stderr.write(
    "film_poster_unavailable: provide an existing Chromium executable. No browser download or MP4 export is allowed.\n",
  );
  process.exitCode = 1;
});
