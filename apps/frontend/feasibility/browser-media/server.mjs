import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const files = new Map([
  ["/", [new URL("./index.html", import.meta.url), "text/html"]],
  ["/main.mjs", [new URL("./main.mjs", import.meta.url), "text/javascript"]],
  [
    "/sync-access.mjs",
    [new URL("./sync-access.mjs", import.meta.url), "text/javascript"],
  ],
  [
    "/worker.mjs",
    [new URL("./worker.mjs", import.meta.url), "text/javascript"],
  ],
  [
    "/mediabunny.mjs",
    [
      new URL(
        "../../node_modules/mediabunny/dist/bundles/mediabunny.mjs",
        import.meta.url,
      ),
      "text/javascript",
    ],
  ],
]);
export function createFeasibilityServer() {
  return createServer(async (request, response) => {
    const entry = files.get(request.url);
    if (request.method !== "GET" || !entry) {
      response.writeHead(404).end();
      return;
    }
    try {
      const body = await readFile(fileURLToPath(entry[0]));
      response.writeHead(200, {
        "Content-Type": entry[1],
        "Cache-Control": "no-store",
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self'; worker-src 'self'; media-src 'self' blob:; style-src 'self' 'unsafe-inline'; connect-src 'self';",
      });
      response.end(body);
    } catch {
      response.writeHead(500).end();
    }
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const server = createFeasibilityServer();
  server.listen(4185, "127.0.0.1", () =>
    process.stdout.write(
      `CL-005 loopback spike PID ${process.pid}, port 4185\n`,
    ),
  );
  const stop = () => {
    process.off("SIGINT", stop);
    process.off("SIGTERM", stop);
    server.close();
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}
