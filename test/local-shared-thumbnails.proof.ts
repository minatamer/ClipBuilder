import { expect, it } from "vitest";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { startThumbnailBrowserFixture } from "./owner-thumbnail-browser-fixture.ts";

declare global {
  function sharedThumbnailCheck(action: string): Promise<{
    ready: number;
    blue: number[];
    yellow: number[];
    overflow: boolean;
    changed?: boolean;
    portrait?: number[][];
  }>;
}

it("shares real upload/blob, saved, YouTube and candidate stills with replacement/cancel safety", async () => {
  const fixture = await startThumbnailBrowserFixture();
  let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
  let external = 0;
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
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.goto({ url: fixture.url, timeout: 15000 });
    const driver = {
      expression: `
      const wait=async check=>{for(let n=0;n<300;n++){const value=check();if(value)return value;await new Promise(r=>setTimeout(r,50));}throw Error('shared_thumbnail_timeout')};
      const section=label=>document.querySelector('section[aria-label="'+label+'"]');
      const saved=()=>section('Saved source');
      let prior;
      globalThis.sharedThumbnailCheck=async action=>{
        const image=()=>saved()?.querySelector('img');
        if(action==='replace'){prior=image()?.src;document.getElementById('replace').click();await wait(()=>image()?.complete&&image().src!==prior);}
        if(action==='missing'){document.getElementById('missing').click();await wait(()=>saved().querySelector('[data-thumbnail-state="unavailable"]'));return {ready:0,blue:[],yellow:[],overflow:false};}
        if(action==='slow'){document.getElementById('slow').click();await wait(()=>saved().querySelector('[data-thumbnail-state="loading"]'));await new Promise(r=>setTimeout(r,100));document.getElementById('toggle').click();return {ready:0,blue:[],yellow:[],overflow:false};}
        if(action==='reopen'){document.getElementById('toggle').click();}
        await wait(()=>document.querySelector('[aria-label="Uploaded video"]')?.poster.startsWith('blob:')&&document.querySelectorAll('[data-thumbnail-state="ready"]').length>=3);
        await wait(()=>[...document.querySelectorAll('[data-thumbnail-state]')].every(node=>node.dataset.thumbnailState==='ready'));
        const pixels=async src=>{const img=new Image();img.src=src;await img.decode();const c=document.createElement('canvas');c.width=c.height=1;const ctx=c.getContext('2d');ctx.drawImage(img,0,0,1,1);const rgb=[...ctx.getImageData(0,0,1,1).data].slice(0,3);c.width=c.height=0;return rgb;};
        const uploaded=document.querySelector('[aria-label="Uploaded video"]');
        const blue=await pixels(uploaded.poster),yellow=await pixels(section('YouTube offer').querySelector('img').src);
        const portraitImage=section('Portrait moments').querySelector('img');await portraitImage.decode();
        const canvas=document.createElement('canvas');canvas.width=portraitImage.naturalWidth;canvas.height=portraitImage.naturalHeight;const ctx=canvas.getContext('2d');ctx.drawImage(portraitImage,0,0);const portrait=[10,canvas.height-10].map(y=>[...ctx.getImageData(Math.floor(canvas.width/2),y,1,1).data].slice(0,3));canvas.width=canvas.height=0;
        return {ready:document.querySelectorAll('[data-thumbnail-state="ready"]').length,blue,yellow,portrait,overflow:document.documentElement.scrollWidth>innerWidth,changed:action==='replace'?image().src!==prior:undefined};
      };
    `,
    };
    await client.send("Runtime.evaluate", driver);
    for (const width of [1440, 768, 390]) {
      await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
      const result = await page.evaluate(() => sharedThumbnailCheck("ready"));
      expect(result.ready).toBeGreaterThanOrEqual(3);
      expect(result.blue[2]).toBeGreaterThan(130);
      expect(result.blue[0]).toBeLessThan(70);
      expect(result.yellow[0]).toBeGreaterThan(220);
      expect(result.yellow[2]).toBeLessThan(110);
      expect(result.overflow).toBe(false);
      expect(result.portrait?.[0]?.[0]).toBeGreaterThan(200);
      expect(result.portrait?.[1]?.[1]).toBeGreaterThan(90);
    }
    expect(
      (await page.evaluate(() => sharedThumbnailCheck("replace"))).changed,
    ).toBe(true);
    await page.evaluate(() => sharedThumbnailCheck("missing"));
    await page.evaluate(() => sharedThumbnailCheck("replace"));
    await page.evaluate(() => sharedThumbnailCheck("slow"));
    for (let n = 0; n < 30 && fixture.counts().stalled; n++)
      await new Promise((done) => setTimeout(done, 50));
    expect(fixture.counts().stalled).toBe(0);
    expect(
      (await page.evaluate(() => sharedThumbnailCheck("reopen"))).ready,
    ).toBeGreaterThanOrEqual(3);
    expect(fixture.counts().rangeReads).toBeGreaterThan(0);
    expect(fixture.counts().imageReads).toBeGreaterThan(0);
    await page.goto({ url: fixture.url, timeout: 15000 });
    await client.send("Runtime.evaluate", {
      expression: "globalThis.VideoDecoder = undefined",
    });
    await client.send("Runtime.evaluate", driver);
    const native = await page.evaluate(() => sharedThumbnailCheck("ready"));
    expect(native.ready).toBeGreaterThanOrEqual(3);
    expect(native.blue[2]).toBeGreaterThan(130);
    expect(external).toBe(0);
  } finally {
    await browser?.close({ silent: true });
    await fixture.close();
  }
}, 60000);
