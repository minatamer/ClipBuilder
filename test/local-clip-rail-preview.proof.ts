import { expect, it } from "vitest";
import { transform } from "esbuild";
import sharp from "../apps/backend/node_modules/sharp/dist/index.mjs";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { ownerRequest } from "./owner-http.ts";
import { startHookEditorFixture } from "./owner-hook-browser-fixture.ts";

type RailRect = { x: number; y: number; width: number; height: number };
declare global {
  function railReady(): Promise<boolean>;
  function railMetrics(): { rect: RailRect; time: number; paused: boolean };
  function railAction(action: string): Promise<boolean>;
}
declare module "../apps/renderer/node_modules/@remotion/renderer/dist/browser/devtools-commands.js" {
  interface Commands {
    "Page.reload": {
      paramsType: [{ ignoreCache: boolean }];
      returnType: Record<string, never>;
    };
  }
}

it("paints a visible clip-card preview on initial load and reload without hover", async () => {
  const fixture = await startHookEditorFixture();
  let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
  let closing = false,
    external = 0,
    intercepted = 0,
    interceptionFailures = 0;
  const pending = new Set<Promise<void>>();
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
      (event: {
        requestId: string;
        request: {
          url: string;
          method: string;
          headers: Record<string, string>;
          postData?: string;
        };
      }) => {
        const task = (async () => {
          const url = new URL(event.request.url);
          if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
            external++;
            // @ts-expect-error Chromium Fetch is outside Remotion's typed subset.
            await client.send("Fetch.failRequest", {
              requestId: event.requestId,
              errorReason: "BlockedByClient",
            });
            return;
          }
          if (url.pathname.startsWith("/api/")) {
            intercepted++;
            const result = await ownerRequest(
              Number(new URL(fixture.url).port),
              url.pathname + url.search,
              {
                method: event.request.method,
                headers: {
                  ...(event.request.headers.Range
                    ? { Range: event.request.headers.Range }
                    : {}),
                  ...(event.request.headers["Content-Type"]
                    ? { "Content-Type": event.request.headers["Content-Type"] }
                    : {}),
                },
                ...(event.request.postData
                  ? { body: event.request.postData }
                  : {}),
                signal: AbortSignal.timeout(15000),
              },
            );
            // @ts-expect-error Chromium Fetch is outside Remotion's typed subset.
            await client.send("Fetch.fulfillRequest", {
              requestId: event.requestId,
              responseCode: result.status,
              responseHeaders: Object.entries(result.headers)
                .filter(
                  ([name]) =>
                    !["connection", "transfer-encoding"].includes(name),
                )
                .map(([name, value]) => ({ name, value: String(value) })),
              body: result.body.toString("base64"),
            });
            return;
          }
          if (url.port !== "3000") throw Error("unexpected_editor_origin");
          // @ts-expect-error Chromium Fetch is outside Remotion's typed subset.
          await client.send("Fetch.continueRequest", {
            requestId: event.requestId,
          });
        })().catch((error) => {
          if (!closing && !String(error).includes("Invalid InterceptionId"))
            interceptionFailures++;
        });
        pending.add(task);
        void task.then(() => pending.delete(task));
      },
    );
    // @ts-expect-error Chromium Fetch is outside Remotion's typed subset.
    await client.send("Fetch.enable", {
      patterns: [{ urlPattern: "*", requestStage: "Request" }],
    });

    await client.send("Page.addScriptToEvaluateOnNewDocument", {
      source: `const NativeObserver=window.IntersectionObserver;window.IntersectionObserver=class extends NativeObserver{constructor(callback,options){let first=true;super((entries,observer)=>{if(first&&entries.some(entry=>entry.target.classList.contains('clip-rail-preview'))){first=false;return}callback(entries,observer)},options)}}`,
    });
    const reload = async () => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      let loaded: () => void = () => {};
      const complete = new Promise<void>((done, fail) => {
        loaded = done;
        client.once("Page.loadEventFired", loaded);
        timer = setTimeout(() => fail(Error("rail_reload_timeout")), 15000);
      });
      try {
        await client.send("Page.reload", { ignoreCache: true });
        await complete;
      } finally {
        clearTimeout(timer);
        client.off("Page.loadEventFired", loaded);
      }
    };
    const driver = await transform(
      `
      globalThis.railReady=async()=>{
        for(let i=0;i<300;i++){
          const rail=document.querySelector<HTMLElement>('.clip-rail-preview'),video=rail?.querySelector('video');
          if(rail&&rail.getBoundingClientRect().width>0&&video&&video.readyState>=2&&!video.seeking&&video.videoWidth>0&&rail.textContent?.includes('Original')){await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);return true;}
          await new Promise(done=>setTimeout(done,20));
        }return false;
      };
      globalThis.railMetrics=()=>{const rail=document.querySelector<HTMLElement>('.clip-rail-preview')!,video=rail.querySelector('video')!;return{rect:rail.getBoundingClientRect().toJSON(),time:video.currentTime,paused:video.paused}};
      globalThis.railAction=async(action:string)=>{
        const wait=async(fn:()=>boolean)=>{for(let i=0;i<300;i++){if(fn())return true;await new Promise(r=>setTimeout(r,20))}return false};
        if(action==='hover')return wait(()=>[...document.querySelectorAll<HTMLVideoElement>('.clip-rail-preview video')].some(n=>!n.paused&&n.currentTime>1.1));
        if(action==='pause')return wait(()=>[...document.querySelectorAll<HTMLVideoElement>('.clip-rail-preview video')].every(n=>n.paused));
        if(action==='hide'){[...document.querySelectorAll<HTMLButtonElement>('button')].find(n=>n.textContent?.replace(/\\s+/g,' ').trim()==='Add more clips')!.click();return wait(()=>!document.querySelector('.clip-rail-preview video'))}
        if(action==='show'){[...document.querySelectorAll<HTMLButtonElement>('button')].find(n=>n.textContent?.trim()==='Back to editor')!.click();return railReady()}
        if(action==='offscreen'){const tail=document.createElement('div');tail.id='fixture-scroll-tail';tail.style.height='2000px';document.body.append(tail);window.scrollTo({top:1200,behavior:'instant'});return wait(()=>scrollY>500&&!document.querySelector('.clip-rail-preview video'))}
        if(action==='return'){window.scrollTo({top:0,behavior:'instant'});document.getElementById('fixture-scroll-tail')!.remove();return railReady()}
        if(action==='compact')return wait(()=>document.querySelector('[aria-label="Choose a clip"]')?.getAttribute('aria-orientation')==='horizontal'&&!!document.querySelector('.editor-preview video')&&!document.querySelector('.clip-rail-preview')&&document.documentElement.scrollWidth<=innerWidth);
        throw Error('unknown_rail_action');
      };
    `,
      { loader: "ts" },
    );
    await page.evaluateOnNewDocument(driver.code);
    const ready = () => page.evaluate(() => railReady());
    const run = (action: string) =>
      page.evaluate((action) => railAction(action), action);
    const evidence = [];
    for (const viewport of [
      { width: 1280, height: 720 },
      { width: 1342, height: 586 },
      { width: 1440, height: 900 },
    ]) {
      await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
      for (const phase of ["initial", "reload"]) {
        if (phase === "initial")
          await page.goto({
            url: "http://localhost:3000/start",
            timeout: 15000,
          });
        else await reload();
        expect(await ready(), phase + JSON.stringify(viewport)).toBe(true);
        const state = await page.evaluate(() => railMetrics());
        const image = await client.send("Page.captureScreenshot", {
          format: "png",
          fromSurface: true,
          clip: {
            x: state.rect.x,
            y: state.rect.y,
            width: state.rect.width,
            height: state.rect.height,
            scale: 1,
          },
        });
        const pixel = await sharp(Buffer.from(image.value.data, "base64"))
          .removeAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true });
        const index =
          (Math.floor(pixel.info.height * 0.3) * pixel.info.width +
            Math.floor(pixel.info.width * 0.5)) *
          pixel.info.channels;
        expect(
          pixel.data[index + 1],
          "decoded teal source instead of blank navy card",
        ).toBeGreaterThan(70);
        expect(pixel.data[index]).toBeLessThan(80);
        expect(state.paused).toBe(true);
        expect(state.time).toBeCloseTo(1, 1);
        evidence.push({
          phase,
          viewport,
          paused: state.paused,
          sourceTime: state.time,
          decodedPixel: true,
        });
      }
    }
    const { rect: rail } = await page.evaluate(() => railMetrics());
    await client.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: rail.x + rail.width / 2,
      y: rail.y + rail.height / 2,
    });
    expect(await run("hover")).toBe(true);
    await client.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: 20,
      y: 100,
    });
    for (const action of ["pause", "hide", "show", "offscreen", "return"])
      expect(await run(action), action).toBe(true);
    for (const viewport of [
      { width: 834, height: 1194 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
      await reload();
      expect(await run("compact")).toBe(true);
    }
    await page.setViewport({ width: 1342, height: 586, deviceScaleFactor: 1 });
    expect(await ready()).toBe(true);
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    await writeFile(
      resolve(".local-build/evidence/cl257-rail.json"),
      JSON.stringify(
        {
          synthetic: true,
          providerCalls: 0,
          deferredObserver: true,
          evidence,
          hoverPause: true,
          hiddenView: true,
          offscreenRelease: true,
          compactWidths: [834, 390],
        },
        null,
        2,
      ),
    );
    const shot = await client.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
    });
    await writeFile(
      resolve(".local-build/evidence/cl257-rail.png"),
      Buffer.from(shot.value.data, "base64"),
    );
    expect(intercepted).toBeGreaterThan(0);
    expect(external).toBe(0);
    expect(interceptionFailures).toBe(0);
    expect(fixture.counts()).toEqual({ edits: 0, unexpected: 0 });
    expect(fixture.clip.calls).toEqual({ plan: 0, image: 0, render: 0 });
  } finally {
    closing = true;
    try {
      await browser?.close({ silent: true });
    } finally {
      await Promise.allSettled(pending);
      await fixture.close();
    }
  }
}, 120000);
