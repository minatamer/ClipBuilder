import { expect, it } from "vitest";
import { createServer } from "node:http";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { openBrowser } from "@remotion/renderer";
import { OwnerVideoLookLayer } from "../../../packages/composition/local/video-look.tsx";
import { OWNER_VIDEO_LOOKS } from "../../../packages/contracts/local/video-look.ts";
import { ownerVideoLookFilter } from "./video-look.ts";
import { ownerNativeTools } from "../../../scripts/native-tools.ts";
import { runOwnedProcess } from "../src/media/process-runner.ts";

it("matches browser source-video looks to native RGB transforms while leaving overlay colors unchanged", async () => {
  const tools = await ownerNativeTools(resolve("."));
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-owner-presentation-"));
  const signal = AbortSignal.timeout(60_000);
  let html = "";
  let video = Buffer.alloc(0);
  const server = createServer((req, res) => {
    const address = server.address();
    if (
      req.method !== "GET" ||
      !address ||
      typeof address === "string" ||
      req.headers.host !== `127.0.0.1:${address.port}`
    ) {
      res.writeHead(403).end();
      return;
    }
    if (req.url === "/")
      res.writeHead(200, { "Content-Type": "text/html" }).end(html);
    else if (req.url === "/synthetic.mp4")
      res
        .writeHead(200, {
          "Content-Type": "video/mp4",
          "Content-Length": video.length,
        })
        .end(video);
    else res.writeHead(404).end();
  });
  let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
  try {
    const source = join(root, "synthetic.mp4");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-f",
        "lavfi",
        "-i",
        "color=c=0xCC8844:size=128x128:rate=30:duration=1",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-threads",
        "2",
        source,
      ],
      signal,
    );
    video = await readFile(source);
    await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("proof_listener_missing");
    browser = await openBrowser("chrome", {
      browserExecutable:
        "C:/Program Files/Google/Chrome/Application/chrome.exe",
      chromiumOptions: { headless: true },
      logLevel: "error",
    });
    const page = await browser.newPage({
      context: () => null,
      logLevel: "error",
      indent: false,
      pageIndex: 0,
      onBrowserLog: null,
      onLog: () => {},
    });
    await page.setViewport({ width: 128, height: 128, deviceScaleFactor: 1 });
    for (const preset of OWNER_VIDEO_LOOKS) {
      const look = { preset, strength: preset === "warm" ? 50 : 100 };
      const layer = renderToStaticMarkup(
        createElement(
          OwnerVideoLookLayer,
          { look },
          createElement("video", {
            id: "media",
            src: "/synthetic.mp4",
            muted: true,
            preload: "auto",
            style: { width: "100%", height: "100%", objectFit: "cover" },
          }),
        ),
      );
      html = `<!doctype html><html><body style="margin:0">${layer}<div style="position:absolute;left:0;top:0;width:16px;height:16px;background:rgb(0,255,255)"></div></body></html>`;
      await page.goto({
        url: `http://127.0.0.1:${address.port}/`,
        timeout: 10_000,
      });
      await page.evaluate(async () => {
        const media = document.getElementById("media") as HTMLVideoElement;
        async function waitFor(event: string, action?: () => void) {
          await new Promise<void>((done, fail) => {
            const cleanup = () => {
              clearTimeout(timer);
              media.removeEventListener(event, ready);
              media.removeEventListener("error", failed);
            };
            const ready = () => {
              cleanup();
              done();
            };
            const failed = () => {
              cleanup();
              fail(new Error("synthetic_media_failed"));
            };
            const timer = setTimeout(failed, 5000);
            media.addEventListener(event, ready);
            media.addEventListener("error", failed);
            action?.();
          });
        }
        if (media.readyState < 2) await waitFor("loadeddata");
        media.pause();
        await waitFor("seeked", () => {
          media.currentTime = 0.25;
        });
        await new Promise<void>((done) =>
          requestAnimationFrame(() => requestAnimationFrame(() => done())),
        );
      });
      const screenshot = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      const captured = Buffer.from(screenshot.value.data, "base64");
      const native = join(root, "frame.png");
      await runOwnedProcess(
        tools.ffmpeg,
        [
          "-nostdin",
          "-y",
          "-v",
          "error",
          "-i",
          source,
          "-vf",
          ownerVideoLookFilter(look),
          "-frames:v",
          "1",
          "-threads",
          "2",
          native,
        ],
        signal,
      );
      const preview = join(root, "preview.png");
      await writeFile(preview, captured);
      async function pixel(file: string, x: number, y: number) {
        const output = join(root, "pixel.rgb");
        await runOwnedProcess(
          tools.ffmpeg,
          [
            "-nostdin",
            "-y",
            "-v",
            "error",
            "-i",
            file,
            "-vf",
            `crop=8:8:${x}:${y},scale=1:1:flags=area,format=rgb24`,
            "-frames:v",
            "1",
            "-threads",
            "2",
            "-f",
            "rawvideo",
            output,
          ],
          signal,
        );
        return [...(await readFile(output))];
      }
      const previewPixel = await pixel(preview, 60, 60);
      const nativePixel = await pixel(native, 60, 60);
      for (let channel = 0; channel < 3; channel++)
        expect(
          Math.abs(previewPixel[channel]! - nativePixel[channel]!),
          `${preset} channel ${channel}`,
        ).toBeLessThanOrEqual(12);
      expect(await pixel(preview, 2, 2)).toEqual([0, 255, 255]);
    }
    expect(await readFile(source)).toEqual(video);
  } finally {
    try {
      await browser?.close({ silent: true });
    } finally {
      server.closeAllConnections();
      await new Promise<void>((done) => server.close(() => done()));
      await rm(root, { recursive: true, force: true });
    }
  }
}, 70_000);
