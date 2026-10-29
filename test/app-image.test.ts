import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { lstat, readdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
const run = promisify(execFile);
describe("closed frontend/backend image inputs", () => {
  it.each(["frontend", "backend"])(
    "excludes secrets, tests, authoring tools and other applications from %s",
    async (application) => {
      const { stdout } = await run(
        process.execPath,
        [
          "--experimental-strip-types",
          "scripts/prepare-app-image.mjs",
          application,
        ],
        { cwd: resolve("."), timeout: 15000 },
      );
      const directory = stdout.trim();
      expect(resolve(directory, "..")).toBe(resolve(tmpdir()));
      expect(directory).toContain(`clipbuilder-${application}-context-`);
      const paths: string[] = [];
      async function inventory(folder: string, prefix = "") {
        for (const child of await readdir(folder)) {
          const path = join(folder, child);
          const info = await lstat(path);
          expect(info.isSymbolicLink()).toBe(false);
          if (info.isDirectory()) await inventory(path, prefix + child + "/");
          else paths.push(prefix + child);
        }
      }
      try {
        await inventory(directory);
        expect(paths).toContain(`apps/${application}/Dockerfile`);
        expect(paths).toContain(
          "packages/composition/local/sound-recordings.ts",
        );
        expect(paths).toContain("packages/composition/local/audio-sources.ts");
        expect(paths).toContain(
          `apps/${application}/src/${application === "frontend" ? "server/control-api.ts" : "server.ts"}`,
        );
        expect(
          paths
            .filter((path) => path.startsWith("apps/"))
            .every(
              (path) =>
                path.startsWith(`apps/${application}/`) ||
                (application === "backend" &&
                  path.startsWith("apps/renderer/")),
            ),
        ).toBe(true);
        expect(
          paths.some((path) =>
            /(?:^|\/)(?:\.env|private|artifacts|feasibility|generated|node_modules)|\.test\./.test(
              path,
            ),
          ),
        ).toBe(false);
        if (application === "frontend") {
          expect(
            paths.filter((path) => path.startsWith("apps/frontend/public/"))
              .length,
          ).toBe(15);
          expect(
            paths.some((path) =>
              /capture-index|capture-product-film|studio/.test(path),
            ),
          ).toBe(false);
        } else {
          expect(paths).toContain("apps/renderer/local/entry.ts");
          expect(paths).toContain("scripts/editing-worker-build.mjs");
          expect(paths).toContain("scripts/local-speech-tools.ts");
          expect(
            paths.some((path) =>
              /(?:yt-dlp|python|codex|whisper-cli)\.exe|ggml-.*\.bin|cookiejar|(?:^|\/)\.env(?:\.|$)/u.test(
                path,
              ),
            ),
          ).toBe(false);
          expect(
            paths.filter((path) => /\.(?:jpg|jpeg|png|webp)$/.test(path)),
          ).toEqual(["apps/backend/local/sample-earth.jpg"]);
        }
      } finally {
        await rm(directory, { recursive: true, force: true });
      }
    },
    20000,
  );
});
