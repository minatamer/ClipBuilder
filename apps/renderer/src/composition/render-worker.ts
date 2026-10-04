import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import {
  compositionManifestV2Schema,
  PUBLIC_LIMITS,
} from "@clipbuilder/contracts";
import {
  openBrowser,
  selectComposition,
  renderMedia,
} from "@remotion/renderer";
const jobSchema = z
  .object({
    manifest: compositionManifestV2Schema,
    source: z.string(),
    output: z.string(),
    chromium: z.string(),
    bundle: z.string(),
  })
  .strict();
export async function renderWorker(jobPath: string) {
  const job = jobSchema.parse(JSON.parse(await readFile(jobPath, "utf8"))),
    size = (await stat(job.source)).size;
  if (size <= 0 || size > PUBLIC_LIMITS.maxSourceBytes)
    throw new Error("invalid");
  const server = createServer((request, response) => {
    if (
      request.url !== "/source.mp4" ||
      !["GET", "HEAD"].includes(request.method ?? "")
    ) {
      response.writeHead(404).end();
      return;
    }
    const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/),
      start = range ? Number(range[1]) : 0,
      end = range?.[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if ((request.headers.range && !range) || start > end || start >= size) {
      response.writeHead(416).end();
      return;
    }
    response.writeHead(range ? 206 : 200, {
      "Content-Type": "video/mp4",
      "Content-Length": end - start + 1,
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-store",
      ...(range ? { "Content-Range": `bytes ${start}-${end}/${size}` } : {}),
    });
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    const stream = createReadStream(job.source, { start, end });
    stream.on("error", () => response.destroy());
    response.once("close", () => stream.destroy());
    stream.pipe(response);
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("invalid");
  let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
  try {
    browser = await openBrowser("chrome", {
      browserExecutable: job.chromium,
      logLevel: "error",
    });
    const inputProps = {
      manifest: job.manifest,
      sourceUrl: `http://127.0.0.1:${address.port}/source.mp4`,
      sourceStartMs: 0,
    };
    const composition = await selectComposition({
      serveUrl: job.bundle,
      id: "Clip",
      inputProps,
      puppeteerInstance: browser,
      logLevel: "error",
    });
    await renderMedia({
      composition,
      serveUrl: job.bundle,
      inputProps,
      puppeteerInstance: browser,
      codec: "h264",
      audioCodec: "aac",
      audioBitrate: "160k",
      sampleRate: 48000,
      pixelFormat: "yuv420p",
      colorSpace: "bt709",
      outputLocation: job.output,
      concurrency: 2,
      imageFormat: "jpeg",
      jpegQuality: 80,
      crf: 20,
      logLevel: "error",
      timeoutInMilliseconds: 30_000,
      offthreadVideoCacheSizeInBytes: 128 * 1024 * 1024,
    });
  } finally {
    try {
      await browser?.close({ silent: true });
    } finally {
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  }
}
if (process.argv[1] === fileURLToPath(import.meta.url))
  renderWorker(process.argv[2] ?? "").catch(() => {
    process.stderr.write("media_failed\n");
    process.exitCode = 1;
  });
