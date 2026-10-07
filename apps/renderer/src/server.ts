import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { parseRendererConfig } from "./config.js";
import { createRendererApplication } from "./app.js";
import { GcsMediaStore } from "./expiry/gcs-media-store.js";
import { UploadCapabilityCipher } from "./expiry/upload-capability.js";
import { MediaSessions } from "./expiry/media-sessions.js";
import { CleanupDiagnostics } from "./expiry/cleanup-diagnostics.js";
import { MediaOperations } from "./media/media-operations.js";
import { NodeMediaPipeline } from "./media/node-pipeline.js";
import { GoogleCallerVerifier } from "./auth/caller-verifier.js";
export async function startRenderer(environment: NodeJS.ProcessEnv) {
  const config = parseRendererConfig(environment);
  if (!config.RENDERER_ENABLED) throw new Error("Renderer is disabled.");
  for (const path of [
    config.CHROMIUM_PATH!,
    config.FFMPEG_PATH!,
    config.FFPROBE_PATH!,
    config.REMOTION_BUNDLE_PATH!,
  ])
    await stat(path);
  const keyFile = await readFile(config.RENDERER_CLEANUP_KEY_FILE!, "utf8");
  const cipher = new UploadCapabilityCipher(
    Buffer.from(keyFile.trim(), "base64url"),
  );
  const store = new GcsMediaStore(
    config.RENDERER_BUCKET!,
    config.FRONTEND_ORIGIN,
  );
  await store.assertDisposable();
  const sessions = new MediaSessions(
    store,
    cipher,
    Date.now,
    new CleanupDiagnostics((record) => {
      process.stderr.write(JSON.stringify(record) + "\n");
    }),
  );
  const operations = new MediaOperations(
    sessions,
    new NodeMediaPipeline({
      ffmpeg: config.FFMPEG_PATH!,
      ffprobe: config.FFPROBE_PATH!,
      chromium: config.CHROMIUM_PATH!,
      bundle: config.REMOTION_BUNDLE_PATH!,
    }),
    Date.now,
  );
  const app = createRendererApplication(
    operations,
    new GoogleCallerVerifier(
      config.RENDERER_AUDIENCE!,
      config.RENDERER_CALLER_EMAIL!,
      config.RENDERER_EXPIRY_CALLER_EMAIL!,
    ),
    [
      config.FRONTEND_ORIGIN,
      ...(config.HOSTED_FRONTEND_ORIGIN ? [config.HOSTED_FRONTEND_ORIGIN] : []),
    ],
  );
  const server = await new Promise<import("node:http").Server>(
    (resolve, reject) => {
      const listening = app.listen(config.PORT, "0.0.0.0", () =>
        resolve(listening),
      );
      listening.once("error", reject);
    },
  );
  const stop = () => {
    server.close();
    server.closeAllConnections();
    operations
      .shutdown()
      .catch(() => process.stderr.write("cleanup_pending\n"));
  };
  process.once("SIGTERM", stop);
  process.once("SIGINT", stop);
  server.once("close", () => {
    process.removeListener("SIGTERM", stop);
    process.removeListener("SIGINT", stop);
  });
  return server;
}
if (process.argv[1] === fileURLToPath(import.meta.url))
  startRenderer(process.env).catch(() => {
    process.stderr.write("renderer_startup_failed\n");
    process.exitCode = 1;
  });
