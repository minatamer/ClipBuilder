import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import { constants } from "node:fs";
import { lstat, readFile, writeFile, link, copyFile } from "node:fs/promises";
import { join } from "node:path";
import { openBrowser } from "@remotion/renderer";
import {
  OWNER_BATCH_POLICY,
  type OwnerOverlay,
} from "../../../packages/contracts/local/clips.ts";
import { ownerOverlayFrame } from "../../../packages/composition/local/overlay-frame.ts";
import { ownerPresentationFrames } from "../../../packages/contracts/local/hook.ts";
import type {} from "./overlay-protocol.ts";
import type { OwnerOverlayClock } from "../../../packages/contracts/local/visual-clock.ts";

// Keep each shared PNG below Windows' per-file hardlink limit.
const OVERLAY_LINKS_PER_FILE = 512;

/** Fixed local React page; no Remotion media proxy, arbitrary URL or source video. */
export async function rasterizeOwnerOverlay(
  options: {
    bundle: string;
    chromium: string;
    overlay: OwnerOverlay;
    assets: Record<string, string>;
    frames: string;
    pixelRatio?: number;
    clock?: OwnerOverlayClock;
    budget?: { bytes: number };
  },
  signal: AbortSignal,
) {
  const token = randomBytes(32).toString("hex");
  const staticFiles = new Map<string, { bytes: Buffer; type: string }>();
  for (const [url, name, type] of [
    ["/", "index.html", "text/html"],
    ["/app.js", "app.js", "text/javascript"],
  ] as const) {
    const file = join(options.bundle, name),
      info = await lstat(file);
    if (!info.isFile() || info.isSymbolicLink() || info.size > 10 * 1024 ** 2)
      throw new Error("overlay_bundle_invalid");
    staticFiles.set(url, { bytes: await readFile(file), type });
  }
  const server = createServer((req, res) => {
    const address = server.address(),
      port = address && typeof address === "object" ? address.port : 0;
    const canonical = `127.0.0.1:${port}`;
    const navigation =
      req.url === "/" &&
      [undefined, "none", "same-origin"].includes(
        req.headers["sec-fetch-site"] as string | undefined,
      );
    const cookie = req.headers.cookie?.split("; ").includes(`overlay=${token}`);
    if (
      req.method !== "GET" ||
      req.headers.host !== canonical ||
      req.headers["sec-fetch-site"] === "cross-site" ||
      (req.headers.origin && req.headers.origin !== `http://${canonical}`) ||
      (!navigation && !cookie)
    ) {
      res.writeHead(403).end();
      return;
    }
    if (req.url === "/favicon.ico") {
      res.writeHead(204).end();
      return;
    }
    const file = staticFiles.get(req.url ?? "");
    if (!file) {
      res.writeHead(404).end();
      return;
    }
    if (navigation)
      res.setHeader(
        "Set-Cookie",
        `overlay=${token}; HttpOnly; SameSite=Strict; Path=/`,
      );
    res
      .writeHead(200, {
        "Content-Type": file.type,
        "Content-Length": file.bytes.length,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      })
      .end(file.bytes);
  });
  let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
  let browserClosing: Promise<void> | undefined;
  const cancel = () => {
    browserClosing ??= browser?.close({ silent: true });
    void browserClosing?.catch(() => undefined);
  };
  signal.addEventListener("abort", cancel, { once: true });
  try {
    signal.throwIfAborted();
    await new Promise<void>((done, fail) => {
      server.once("error", fail);
      server.listen(0, "127.0.0.1", done);
    });
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("overlay_listener_invalid");
    browser = await openBrowser("chrome", {
      browserExecutable: options.chromium,
      chromiumOptions: { headless: true },
      logLevel: "error",
    });
    signal.throwIfAborted();
    const page = await browser.newPage({
      context: () => null,
      logLevel: "error",
      indent: false,
      pageIndex: 0,
      onBrowserLog: null,
      onLog: () => {},
    });
    await page.setViewport({
      width: 1080,
      height: 1920,
      deviceScaleFactor: options.pixelRatio ?? 1,
    });
    await page._client().send("Emulation.setDefaultBackgroundColorOverride", {
      color: { r: 0, g: 0, b: 0, a: 0 },
    });
    await page.goto({
      url: `http://127.0.0.1:${address.port}/`,
      timeout: 15_000,
    });
    await page.evaluate(
      (value) => globalThis.clipbuilderOwnerPrepare(value),
      JSON.stringify({
        overlay: options.overlay,
        assets: options.assets,
        ...(options.clock ? { clock: options.clock } : {}),
      }),
    );
    const budget = options.budget ?? { bytes: 0 };
    const cache = new Map<
      string,
      { file: string; links: number; bytes: number }
    >();
    for (
      let frame = 0;
      frame <
      (options.clock?.frames ?? ownerPresentationFrames(options.overlay));
      frame++
    ) {
      signal.throwIfAborted();
      const frameFile = join(
        options.frames,
        `${String(frame).padStart(6, "0")}.png`,
      );
      const key = ownerOverlayFrame(options.overlay, frame, options.clock).key,
        cached = cache.get(key);
      if (cached) {
        if (cached.links < OVERLAY_LINKS_PER_FILE) {
          await link(cached.file, frameFile);
          cached.links++;
        } else {
          if (budget.bytes + cached.bytes > OWNER_BATCH_POLICY.overlayBytes)
            throw new Error("overlay_capacity");
          await copyFile(cached.file, frameFile, constants.COPYFILE_EXCL);
          budget.bytes += cached.bytes;
          cached.file = frameFile;
          cached.links = 1;
        }
        continue;
      }
      await page.evaluate(async (value) => {
        await globalThis.clipbuilderOwnerPaint(value);
      }, frame);
      const captured = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      const buffer = Buffer.from(captured.value.data, "base64");
      budget.bytes += buffer.length;
      if (budget.bytes > OWNER_BATCH_POLICY.overlayBytes)
        throw new Error("overlay_capacity");
      await writeFile(frameFile, buffer, { flag: "wx", mode: 0o600 });
      cache.set(key, { file: frameFile, links: 1, bytes: buffer.length });
    }
  } finally {
    signal.removeEventListener("abort", cancel);
    try {
      if (browserClosing) await browserClosing;
      else await browser?.close({ silent: true });
    } finally {
      server.closeAllConnections();
      await new Promise<void>((done) => server.close(() => done()));
      staticFiles.clear();
    }
  }
}
