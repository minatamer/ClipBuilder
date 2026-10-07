import { readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { prepareBuildContext } from "./build-context.js";
describe("private renderer build upload", () => {
  // Real filesystem copies compete with the full suite's workers on Windows.
  it("includes only the renderer/shared source and pinned build metadata", async () => {
    const directory = await prepareBuildContext(
      fileURLToPath(new URL("../../../", import.meta.url)),
    );
    try {
      const paths: string[] = [];
      async function inventory(root: string, prefix = "") {
        for (const item of await readdir(root, { withFileTypes: true })) {
          const path = prefix + item.name;
          if (item.isDirectory())
            await inventory(join(root, item.name), path + "/");
          else paths.push(path);
        }
      }
      await inventory(directory);
      expect(paths).toContain("apps/renderer/src/server.ts");
      expect(paths).toContain("apps/renderer/Dockerfile");
      expect(paths).toContain("apps/renderer/scripts/browser-tooling.ts");
      expect(paths).toContain("test/deterministic.environment.ts");
      expect(
        paths.some((path) =>
          /frontend|backend|(?:^|\/)\.env(?:$|\.)|\.git|fixture|feasibility|node_modules|\.test\./.test(
            path,
          ),
        ),
      ).toBe(false);
      expect(
        paths
          .filter((path) => path.startsWith("apps/"))
          .every((path) => path.startsWith("apps/renderer/")),
      ).toBe(true);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }, 15_000);
});
