import {
  mkdtemp,
  mkdir,
  writeFile,
  rm,
  symlink,
  copyFile,
} from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { verifyReleaseArtifact } from "../apps/frontend/scripts/verify-release-artifact.js";
import DELIVERY_ASSETS from "../apps/frontend/scripts/delivery-assets.json" with { type: "json" };

async function fixture() {
  const temporary = await mkdtemp(join(tmpdir(), "clipbuilder-artifact-test-"));
  const root = join(temporary, "apps", "frontend");
  const app = join(root, ".next", "standalone", "apps", "frontend");
  async function put(path: string, value: string) {
    await mkdir(join(root, path, ".."), { recursive: true });
    await writeFile(join(root, path), value);
  }
  const entries = Object.fromEntries(
    [
      "/page",
      "/start/page",
      "/_not-found/page",
      "/_global-error/page",
      "/api/analysis/[action]/route",
      "/api/diagnostics/route",
      "/api/sample/[...path]/route",
      "/api/session/exit/route",
      "/icon.svg/route",
      "/robots.txt/route",
    ].map((key, index) => [
      key,
      key === "/api/sample/[...path]/route"
        ? "app/api/sample/[...path]/route.js"
        : `app/route-${index}.js`,
    ]),
  );
  for (const entry of Object.values(entries))
    await put(
      `.next/standalone/apps/frontend/.next/server/${entry}`,
      "synthetic code",
    );
  await put(".next/standalone/apps/frontend/server.js", "synthetic entry");
  await put(
    ".next/standalone/apps/frontend/.next/server/app-paths-manifest.json",
    JSON.stringify(entries),
  );
  await put(
    ".next/standalone/apps/frontend/.next/server/pages-manifest.json",
    "{}",
  );
  await put(
    ".next/standalone/apps/frontend/.next/routes-manifest.json",
    JSON.stringify({
      rewrites: { beforeFiles: [], afterFiles: [], fallback: [] },
      redirects: [],
    }),
  );
  await put(".next/static/chunks/app.js", "synthetic browser code");
  return {
    root,
    app,
    put,
    entries,
    temporary,
    stop: () => rm(temporary, { recursive: true, force: true }),
  };
}
describe("production-only artifact inspection", () => {
  it("accepts only the reviewed delivery assets and rejects replacements or additional captures", async () => {
    const f = await fixture();
    try {
      for (const name of Object.keys(DELIVERY_ASSETS)) {
        await mkdir(join(f.root, "public", name, ".."), { recursive: true });
        await copyFile(
          new URL("../apps/frontend/public/" + name, import.meta.url),
          join(f.root, "public", name),
        );
      }
      expect((await verifyReleaseArtifact(f.root)).selfContained).toBe(true);
      await f.put(
        "public/product-film/intake.png",
        "synthetic unreviewed replacement",
      );
      await expect(verifyReleaseArtifact(f.root)).rejects.toThrow();
    } finally {
      await f.stop();
    }
  });
  it("rejects the removed film draft route in local and release artifacts", async () => {
    const f = await fixture();
    try {
      const entry = "app/motion-preview/page.js";
      await f.put(
        `.next/standalone/apps/frontend/.next/server/${entry}`,
        "synthetic draft",
      );
      await f.put(
        ".next/standalone/apps/frontend/.next/server/app-paths-manifest.json",
        JSON.stringify({ ...f.entries, "/motion-preview/page": entry }),
      );
      await expect(
        verifyReleaseArtifact(f.root, "local-build"),
      ).rejects.toThrow("release_artifact_invalid");
      await expect(verifyReleaseArtifact(f.root)).rejects.toThrow(
        "release_artifact_invalid",
      );
    } finally {
      await f.stop();
    }
  });
  it("keeps local film captures outside release acceptance", async () => {
    const f = await fixture();
    try {
      await f.put(
        "public/generated/product-film/intake.png",
        "synthetic pixels",
      );
      await expect(
        verifyReleaseArtifact(f.root, "local-build"),
      ).resolves.toMatchObject({ appRoutes: 10 });
      await expect(verifyReleaseArtifact(f.root)).rejects.toThrow(
        "release_artifact_invalid",
      );
    } finally {
      await f.stop();
    }
  });
  it("inspects standalone and separately copied assets with a stable digest and no server", async () => {
    const f = await fixture();
    try {
      const first = await verifyReleaseArtifact(f.root);
      expect(first).toEqual(await verifyReleaseArtifact(f.root));
      expect(first.appRoutes).toBe(10);
      expect(first.sha256).toMatch(/^[a-f0-9]{64}$/);
      await f.put(".next/static/chunks/app.js", "changed synthetic code");
      expect((await verifyReleaseArtifact(f.root)).sha256).not.toBe(
        first.sha256,
      );
    } finally {
      await f.stop();
    }
  });
  it.each([
    "public/main.mjs",
    "public/feasibility/browser-media/index.html",
    ".next/standalone/apps/frontend/.env.local",
    ".next/standalone/apps/frontend/runtime.local.json",
    "public/runtime.local.json",
    ".next/standalone/apps/frontend/src/example.test.ts",
  ])("rejects forbidden artifact %s", async (path) => {
    const f = await fixture();
    try {
      await f.put(path, "synthetic sentinel");
      await expect(verifyReleaseArtifact(f.root)).rejects.toThrow(
        "release_artifact_invalid",
      );
    } finally {
      await f.stop();
    }
  });
  it("rejects a new app route or fallback rewrite before artifact acceptance", async () => {
    const f = await fixture();
    try {
      await f.put(
        ".next/standalone/apps/frontend/.next/server/app-paths-manifest.json",
        JSON.stringify({ ...f.entries, "/main.mjs/route": "app/extra.js" }),
      );
      await expect(verifyReleaseArtifact(f.root)).rejects.toThrow(
        "release_artifact_invalid",
      );
      await f.put(
        ".next/standalone/apps/frontend/.next/server/app-paths-manifest.json",
        JSON.stringify(f.entries),
      );
      await f.put(
        ".next/standalone/apps/frontend/.next/routes-manifest.json",
        JSON.stringify({
          rewrites: {
            beforeFiles: [],
            afterFiles: [],
            fallback: [
              { source: "/:path*", destination: "/feasibility/:path*" },
            ],
          },
          redirects: [],
        }),
      );
      await expect(verifyReleaseArtifact(f.root)).rejects.toThrow(
        "release_artifact_invalid",
      );
    } finally {
      await f.stop();
    }
  });
  it("rejects unresolved public inputs instead of treating them as an absent public directory", async () => {
    const f = await fixture();
    try {
      await f.put("public/ordinary.js", "synthetic code");
      await symlink(
        join(f.root, "missing"),
        join(f.root, "public", "uncertain"),
        process.platform === "win32" ? "junction" : "dir",
      );
      await expect(verifyReleaseArtifact(f.root)).rejects.toThrow();
    } finally {
      await f.stop();
    }
  });
  it("records only known source-package links in local mode and rejects them for release", async () => {
    const f = await fixture();
    try {
      const source = join(f.temporary, "node_modules", "synthetic-package"),
        link = join(
          f.root,
          ".next",
          "standalone",
          "apps",
          "frontend",
          "node_modules",
          "synthetic-package",
        );
      await mkdir(source, { recursive: true });
      await mkdir(join(link, ".."), { recursive: true });
      await f.put(
        ".next/standalone/node_modules/synthetic-package/index.js",
        "synthetic code",
      );
      await symlink(
        source,
        link,
        process.platform === "win32" ? "junction" : "dir",
      );
      await expect(verifyReleaseArtifact(f.root)).rejects.toThrow(
        "release_artifact_invalid",
      );
      expect(await verifyReleaseArtifact(f.root, "local-build")).toMatchObject({
        externalPackageLinks: 1,
        selfContained: false,
      });
    } finally {
      await f.stop();
    }
  });
});
