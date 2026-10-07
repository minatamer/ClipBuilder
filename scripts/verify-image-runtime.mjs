import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import process from "node:process";

// Mounted into a network-isolated build probe; never copied into a runtime image.
assert.equal(process.env.NODE_ENV, "test");
assert.equal(process.env.FAKE_MODE, "true");
assert.equal(process.env.PAID_DEMO_ENABLED, "false");
for (const path of [
  "/usr/local/lib/node_modules/npm",
  "/usr/local/lib/node_modules/corepack",
])
  assert.equal(existsSync(path), false);
assert.notEqual(process.getuid(), 0);
const target = process.argv[2];
let server, child;
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function fetchLocal(path, options) {
  return fetch(
    (target === "frontend"
      ? "http://localhost:3000"
      : "http://127.0.0.1:8080") + path,
    {
      ...options,
      signal: AbortSignal.timeout(5000),
      redirect: "error",
    },
  );
}
try {
  if (target === "frontend") {
    child = spawn(process.execPath, ["apps/frontend/server.js"], {
      cwd: "/app",
      stdio: "ignore",
      env: {
        ...process.env,
        NODE_ENV: "production",
        APP_ENV: "local",
        PORT: "3000",
        HOSTNAME: "127.0.0.1",
        NEXT_TELEMETRY_DISABLED: "1",
      },
    });
    for (let attempt = 0; attempt < 100; attempt++) {
      if (child.exitCode !== null)
        throw new Error("frontend_probe_startup_failed");
      if (
        await fetchLocal("/").then(
          (response) => response.status === 200,
          () => false,
        )
      )
        break;
      if (attempt === 99) throw new Error("frontend_probe_unavailable");
      await pause(100);
    }
    const landing = await fetchLocal("/");
    const html = await landing.text();
    assert.equal(landing.status, 200);
    assert.match(html, /ClipBuilder/);
    assert.match(html, /favicon\.png/);
    assert.match(
      landing.headers.get("content-security-policy"),
      /script-src 'self' 'nonce-/,
    );
    const assets = JSON.parse(
      await readFile("/tmp/delivery-assets.json", "utf8"),
    );
    for (const [name, hash] of Object.entries(assets)) {
      const response = await fetchLocal("/" + name);
      assert.equal(response.status, 200);
      assert.equal(
        createHash("sha256")
          .update(new Uint8Array(await response.arrayBuffer()))
          .digest("hex"),
        hash,
      );
    }
    const paths = [
      "/motion-preview",
      "/main.mjs",
      "/worker.mjs",
      "/sync-access.mjs",
      "/mediabunny.mjs",
      "/audio-extraction.mjs",
      "/audio-samples.mjs",
      "/audio-profile.mjs",
      "/opfs-access.mjs",
      "/media-errors.mjs",
      "/audio-contracts.mjs",
      "/feasibility/browser-media/index.html",
    ];
    for (const path of paths)
      assert.equal((await fetchLocal(path)).status, 404);
    assert.match(
      await (await fetchLocal("/robots.txt")).text(),
      /Disallow: \/\s/,
    );
    const config = await fetchLocal("/api/sample/config");
    assert.equal(config.status, 503); // No control API/network in this isolated image probe.
    const error = await config.json();
    assert.equal(error.error.code, "INTERNAL_ERROR");
    assert.equal(
      (
        await fetchLocal("/api/analysis/sample-replay-options", {
          method: "POST",
        })
      ).status,
      404,
    );
  } else {
    let application;
    if (target === "backend") {
      const { composeBackend } = await import("/app/dist/composition.js");
      application = composeBackend({
        NODE_ENV: "test",
        APP_ENV: "preview",
        FAKE_MODE: "true",
        PAID_DEMO_ENABLED: "false",
      }).application;
    } else if (target === "renderer") {
      const { createRendererApplication } = await import("/app/dist/app.js");
      application = createRendererApplication(
        {
          assertIntakeReady: () => {},
          sessions: {
            admit: () => {
              throw new Error("unexpected_media_admission");
            },
          },
        },
        { verify: async () => "control" },
      );
    } else throw new Error("invalid_probe_target");
    server = await new Promise((resolve, reject) => {
      const value = application.listen(8080, "127.0.0.1", () => resolve(value));
      value.once("error", reject);
    });
    assert.equal((await fetchLocal("/v1/health")).status, 200);
    if (target === "backend") {
      const config = await (await fetchLocal("/v1/sample/config")).json();
      assert.equal(config.sampleEnabled, false);
      assert.equal(config.liveAnalysisEnabled, false);
      assert.equal(config.liveAssemblyEnabled, false);
      assert.equal(config.liveRenderEnabled, false);
      assert.equal(
        (
          await fetchLocal("/v1/analysis/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{}",
          })
        ).status,
        404,
      );
      assert.equal(
        (
          await fetchLocal("/v1/sample/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{}",
          })
        ).status,
        404,
      );
    } else {
      assert.equal(
        (
          await fetchLocal("/internal/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{}",
          })
        ).status,
        400,
      );
      const proof = JSON.parse(
        await readFile("/opt/clipbuilder/linux-media-proof.json", "utf8"),
      );
      assert.equal(proof.synthetic, true);
      assert.equal(proof.canceled, true);
      assert.equal(proof.aiCalls, 0);
      assert.equal(proof.ownedProcessesRemaining, 0);
      assert.equal(proof.manifestVersion, 3);
      const tools = JSON.parse(
        await readFile("/opt/clipbuilder/runtime-tools.json", "utf8"),
      );
      assert.equal(tools.remotion, "4.0.534");
      assert.equal(tools.chromium, "155.0.8059.39");
      assert.equal(tools.sourceFfmpegPackage, "7:5.1.9-0+deb12u1");
      assert.equal(tools.remotionAacEncoder, "libfdk_aac");
      for (const name of ["ffmpeg", "ffprobe"]) {
        const path = `/usr/bin/${name}`;
        assert.equal(
          createHash("sha256")
            .update(await readFile(path))
            .digest("hex"),
          tools[path],
        );
        assert.match(tools[`source${name}`], /5\.1\.9-0\+deb12u1/);
      }
      process.stdout.write(
        JSON.stringify({ nativeProof: proof, runtimeTools: tools }) + "\n",
      );
    }
  }
  process.stdout.write(
    JSON.stringify({
      target,
      runtimeVerified: true,
      nonRoot: true,
      externalNetwork: false,
      aiCalls: 0,
      mediaSessions: 0,
    }) + "\n",
  );
} finally {
  if (server) {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
  if (child && child.exitCode === null) {
    const stopped = new Promise((resolve) => child.once("exit", resolve));
    child.kill("SIGTERM");
    const force = setTimeout(() => child.kill("SIGKILL"), 5000);
    try {
      await stopped;
    } finally {
      clearTimeout(force);
    }
  }
}
