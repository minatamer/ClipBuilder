import { transform } from "esbuild";
import { expect, it } from "vitest";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { startBrollBrowserFixture } from "./owner-broll-browser-fixture.ts";

declare global {
  function thumbnailProof(): Promise<{
    pixels: { frame: number; rgb: number[] }[];
    pictures: number;
    unique: number;
    revoked: boolean;
    maxDecoders: number;
    activeDecoders: number;
    sizeStable: boolean;
    overflow: boolean;
    footer: boolean;
  }>;
  function thumbnailHide(): void;
  function thumbnailFailure(): Promise<boolean>;
}

it("paints trimmed and repeated video stills through Hook/body, reload and cleanup", async () => {
  const fixture = await startBrollBrowserFixture({
    thumbnails: true,
    hook: true,
  });
  let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
  let external = 0;
  let failVideos = false,
    failedRequests = 0;
  try {
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
    const client = page._client();
    client.on(
      "Fetch.requestPaused",
      (event: { requestId: string; request: { url: string } }) => {
        const allowed = ["localhost", "127.0.0.1"].includes(
          new URL(event.request.url).hostname,
        );
        if (failVideos && event.request.url.includes("/video-assets/")) {
          failedRequests++;
          // @ts-expect-error Chromium Fetch is outside Remotion's command subset.
          void client.send("Fetch.fulfillRequest", {
            requestId: event.requestId,
            responseCode: 404,
            body: "",
          });
          return;
        }
        if (!allowed) external++;
        void client.send(
          // @ts-expect-error Chromium Fetch is outside Remotion's command subset.
          allowed ? "Fetch.continueRequest" : "Fetch.failRequest",
          {
            requestId: event.requestId,
            ...(!allowed ? { errorReason: "BlockedByClient" } : {}),
          },
        );
      },
    );
    // @ts-expect-error Chromium Fetch is outside Remotion's command subset.
    await client.send("Fetch.enable", { patterns: [{ urlPattern: "http*" }] });
    for (const width of [1440, 390]) {
      await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
      // A new navigation reopens the unchanged saved fixture state.
      await page.goto({ url: fixture.url, timeout: 15000 });
      await client.send("Runtime.evaluate", {
        expression: (
          await transform(
            `globalThis.thumbnailProof=async()=>{
        const wait = async (check: () => boolean) => {
          for (let i = 0; i < 200; i++) {
            if (check()) return;
            await new Promise((done) => setTimeout(done, 50));
          }
          throw Error("thumbnail_ui_timeout");
        };
        const tab = (name: string) =>
          [
            ...document.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
          ].find((node) => node.textContent?.trim() === name);
        await wait(() => !!tab("Media"));
        const live = new Set<VideoDecoder>();
        let maxDecoders = 0;
        const original = window.VideoDecoder;
        window.VideoDecoder = new Proxy(original, {
          construct(target, args) {
            const decoder: VideoDecoder = Reflect.construct(target, args);
            live.add(decoder);
            maxDecoders = Math.max(maxDecoders, live.size);
            const close = decoder.close.bind(decoder);
            decoder.close = () => {
              live.delete(decoder);
              close();
            };
            return decoder;
          },
        });
        try {
          tab("Media")!.click();
          const thumbs = () => [
            ...document.querySelectorAll<HTMLElement>("[data-video-thumbnail]"),
          ];
          await wait(
            () =>
              thumbs().length === 6 &&
              thumbs().every((node) => node.dataset.videoThumbnail === "ready"),
          );
          const sources = new Set<string>();
          const pixels = [];
          for (const node of thumbs()) {
            const src = /"(blob:[^"]+)"/.exec(node.style.backgroundImage)?.[1];
            if (!src) throw Error("thumbnail_blob_missing");
            sources.add(src);
            const image = new Image();
            image.src = src;
            await image.decode();
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 1;
            const context = canvas.getContext("2d")!;
            context.drawImage(image, 0, 0, 1, 1);
            pixels.push({
              frame: Number(node.dataset.sourceFrame),
              rgb: [...context.getImageData(0, 0, 1, 1).data].slice(0, 3),
            });
            canvas.width = canvas.height = 0;
            image.removeAttribute("src");
          }
          const pictures = document.querySelectorAll(
            ".editor-timeline .picture-thumb:not([data-video-thumbnail])",
          ).length;
          const before = thumbs()[0]!.getBoundingClientRect();
          tab("Captions")!.click();
          await wait(() => thumbs().length === 0);
          const revoked = await Promise.all(
            [...sources].map(async (src) => {
              try {
                await fetch(src);
                return false;
              } catch {
                return true;
              }
            }),
          );
          tab("Media")!.click();
          await wait(
            () =>
              thumbs().length === 6 &&
              thumbs().every((node) => node.dataset.videoThumbnail === "ready"),
          );
          const after = thumbs()[0]!.getBoundingClientRect();
          return {
            pixels,
            pictures,
            unique: sources.size,
            revoked: revoked.every(Boolean),
            maxDecoders,
            activeDecoders: live.size,
            sizeStable:
              before.width === after.width && before.height === after.height,
            overflow: document.documentElement.scrollWidth > innerWidth,
            footer: [...document.querySelectorAll("button")].some(
              (node) => node.textContent?.trim() === "Apply changes",
            ),
          };
        } finally {
          window.VideoDecoder = original;
        }
};`,
            { loader: "ts" },
          )
        ).code,
      });
      const results = await page.evaluate(() => thumbnailProof());
      expect(results.pictures).toBe(2);
      expect(results.unique).toBe(4);
      expect(results.revoked).toBe(true);
      expect(results.maxDecoders).toBe(1);
      expect(results.activeDecoders).toBe(0);
      expect(results.sizeStable).toBe(true);
      expect(results.overflow).toBe(false);
      expect(results.footer).toBe(false);
      expect(
        [...new Set(results.pixels.map((row) => row.frame))].sort(
          (a, b) => a - b,
        ),
      ).toEqual([0, 15, 30, 45]);
      for (const { frame, rgb } of results.pixels) {
        const expected = Array<number>(3).fill(
          Math.round((((frame * 17) % 200) * 255) / 219),
        );
        expect(
          Math.max(...rgb.map((value, i) => Math.abs(value - expected[i]!))),
          `frame ${frame}`,
        ).toBeLessThan(9);
      }
    }
    await client.send("Runtime.evaluate", {
      expression: (
        await transform(
          `globalThis.thumbnailHide=()=>(      [...document.querySelectorAll<HTMLButtonElement>('[role="tab"]')]
        .find((node) => node.textContent?.trim() === "Captions")!
        .click());globalThis.thumbnailFailure=async()=>{
      [...document.querySelectorAll<HTMLButtonElement>('[role="tab"]')]
        .find((node) => node.textContent?.trim() === "Media")!
        .click();
      for (let n = 0; n < 200; n++) {
        const rows = [
          ...document.querySelectorAll<HTMLElement>("[data-video-thumbnail]"),
        ];
        if (
          rows.length === 6 &&
          rows.every((node) => node.dataset.videoThumbnail === "unavailable")
        )
          return rows.every(
            (node) =>
              !!node.querySelector("svg") && !node.style.backgroundImage,
          );
        await new Promise((done) => setTimeout(done, 50));
      }
      return false;
};`,
          { loader: "ts" },
        )
      ).code,
    });
    await page.evaluate(() => thumbnailHide());
    failVideos = true;
    const fallback = await page.evaluate(() => thumbnailFailure());
    expect(fallback).toBe(true);
    expect(failedRequests).toBe(4); // One failure per unique source frame, no retry.
    expect(fixture.applies()).toBe(0);
    expect(external).toBe(0);
  } finally {
    await browser?.close({ silent: true });
    await fixture.close();
  }
}, 90000);
