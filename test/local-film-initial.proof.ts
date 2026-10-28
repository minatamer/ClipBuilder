import { expect, it } from "vitest";
import { get } from "node:http";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";

it("keeps the poster proportional before hydration and waits for measured player dimensions", async () => {
  const config = await new Promise<string>((done, reject) => {
    get("http://localhost:3000/api/sample/config", (response) => {
      let body = "";
      response.on("data", (chunk: Buffer) => {
        body += chunk.toString();
      });
      response.on("end", () => done(body));
      response.on("error", reject);
    }).on("error", reject);
  });
  expect(JSON.parse(config)).toMatchObject({
    mode: "fake",
    liveAnalysisEnabled: false,
    liveAssemblyEnabled: false,
    liveRenderEnabled: false,
  });
  const evidence = resolve(".local-build/evidence");
  await mkdir(evidence, { recursive: true });
  const browser = await openBrowser("chrome", {
    browserExecutable: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    chromiumOptions: { headless: true },
    logLevel: "error",
  });
  let external = 0,
    processing = 0,
    closing = false,
    interceptionFailed = false;
  const pending = new Set<Promise<void>>();
  try {
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
        request: { url: string; method: string };
      }) => {
        const url = new URL(event.request.url);
        const remote = !["localhost", "127.0.0.1", "[::1]"].includes(
          url.hostname,
        );
        const mutation = !["GET", "HEAD"].includes(event.request.method);
        if (remote) external++;
        if (mutation && url.pathname !== "/api/diagnostics") processing++;
        const command =
          remote || mutation
            ? // @ts-expect-error Installed Chrome supports Fetch; pinned CDP types predate it.
              client.send("Fetch.failRequest", {
                requestId: event.requestId,
                errorReason: "BlockedByClient",
              })
            : // @ts-expect-error Installed Chrome supports Fetch; pinned CDP types predate it.
              client.send("Fetch.continueRequest", {
                requestId: event.requestId,
              });
        const task = command.then(
          () => {},
          (error: unknown) => {
            if (
              !closing &&
              !(
                error instanceof Error &&
                error.message.includes("Invalid InterceptionId.")
              )
            )
              interceptionFailed = true;
          },
        );
        pending.add(task);
        void task.then(() => pending.delete(task));
      },
    );
    // @ts-expect-error Installed Chrome supports Fetch; pinned CDP types predate it.
    await client.send("Fetch.enable", {
      patterns: [{ urlPattern: "*", requestStage: "Request" }],
    });
    const evaluate = async (expression: string) => {
      const result = await client.send("Runtime.evaluate", {
        expression,
        awaitPromise: true,
        returnByValue: true,
      });
      if (result.value.exceptionDetails)
        throw new Error("film_initial_expression_failed");
      return result.value.result.value;
    };
    const capture = async (name: string) => {
      const shot = await client.send("Page.captureScreenshot", {
        format: "png",
        fromSurface: true,
      });
      await writeFile(
        join(evidence, name + ".png"),
        Buffer.from(shot.value.data, "base64"),
      );
    };
    const inspectPoster = () =>
      evaluate(`(()=>{
      const surface=document.querySelector('[data-film-surface]'),poster=surface.querySelector('[data-film-poster]');
      const bounds=(window.clNativeRect||Element.prototype.getBoundingClientRect).call(surface),p=poster.getBoundingClientRect();
      const art=poster.querySelector('[data-film-conversation]').getBoundingClientRect();
      const title=poster.querySelector('[data-film-title]'),t=title.getBoundingClientRect();
      const logo=poster.querySelector('svg'),l=logo.getBoundingClientRect();
      const range=document.createRange();range.selectNodeContents(title);
      return {fills:[p,art].every(r=>Math.abs(r.left-bounds.left)<1&&Math.abs(r.top-bounds.top)<1&&Math.abs(r.width-bounds.width)<1&&Math.abs(r.height-bounds.height)<1),
        typeAligned:Math.abs(t.left-bounds.left-bounds.width*88/1920)<1&&Math.abs(t.top-bounds.top-bounds.height*.28)<1,
        typeWhole:[...range.getClientRects()].every(r=>r.left>=bounds.left-1&&r.right<=bounds.right+1&&r.top>=bounds.top-1&&r.bottom<=bounds.bottom+1),
        fontFits:Math.abs(parseFloat(getComputedStyle(title).fontSize)-bounds.width*144/1920)<.1,
        squareLogo:Math.abs(l.width-l.height)<.1&&Math.abs(l.width-bounds.width*64/1920)<.1,
        player:!!surface.querySelector('[data-film-frame]')};
    })()`);
    // Read server-rendered markup with no hydration or observer execution.
    // @ts-expect-error Installed Chrome supports script disabling; pinned CDP types predate it.
    await client.send("Emulation.setScriptExecutionDisabled", { value: true });
    for (const [width, height] of [
      [1366, 768],
      [390, 844],
      [1920, 450],
    ] as const) {
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      await page.goto({ url: "http://localhost:3000/", timeout: 30_000 });
      expect(await inspectPoster()).toEqual({
        fills: true,
        typeAligned: true,
        typeWhole: true,
        fontFits: true,
        squareLogo: true,
        player: false,
      });
      await capture(`cl108-nojs-${width}x${height}`);
    }
    // Hold the first real measurement at zero while hydration and intersection
    // effects run. This reproduces the race without changing application code.
    await client.send("Page.addScriptToEvaluateOnNewDocument", {
      source: `
      window.clNativeRect=Element.prototype.getBoundingClientRect;
      let held=true;const observers=[];const NativeResizeObserver=window.ResizeObserver;
      Element.prototype.getBoundingClientRect=function(){return held&&this.hasAttribute('data-film-surface')?new DOMRect(0,0,0,0):window.clNativeRect.call(this)};
      window.ResizeObserver=class{
        constructor(callback){this.callback=callback;this.entries=null;this.native=new NativeResizeObserver(entries=>{if(held)this.entries=entries;else callback(entries,this)});observers.push(this)}
        observe(...args){this.native.observe(...args)}unobserve(...args){this.native.unobserve(...args)}disconnect(){this.native.disconnect();this.entries=null}
      };
      window.clReleaseFilm=()=>{held=false;for(const observer of observers){if(observer.entries){observer.callback(observer.entries,observer);observer.entries=null}}};
      Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});
    `,
    });
    // @ts-expect-error Installed Chrome supports script disabling; pinned CDP types predate it.
    await client.send("Emulation.setScriptExecutionDisabled", { value: false });
    await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
    await page.goto({ url: "http://localhost:3000/", timeout: 30_000 });
    for (let attempt = 0; attempt < 100; attempt++) {
      if (
        await evaluate(
          `document.querySelector('#how-it-works')?.dataset.enhanced==='true'`,
        )
      )
        break;
      await new Promise((done) => setTimeout(done, 50));
    }
    expect(
      await evaluate(
        `document.querySelector('#how-it-works')?.dataset.enhanced`,
      ),
    ).toBe("true");
    await new Promise((done) => setTimeout(done, 200));
    expect(await inspectPoster()).toEqual({
      fills: true,
      typeAligned: true,
      typeWhole: true,
      fontFits: true,
      squareLogo: true,
      player: false,
    });
    await capture("cl108-measurement-delayed");
    await evaluate("window.clReleaseFilm()");
    for (let attempt = 0; attempt < 100; attempt++) {
      if (await evaluate(`!!document.querySelector('[data-film-frame]')`))
        break;
      await new Promise((done) => setTimeout(done, 50));
    }
    const compare = () =>
      evaluate(`(()=>{
      const surface=document.querySelector('[data-film-surface]'),b=surface.getBoundingClientRect();
      const film=surface.querySelector('[data-film-frame]'),f=film.getBoundingClientRect();
      const poster=surface.querySelector('[data-film-poster]'),p=poster.querySelector('[data-film-title]').getBoundingClientRect(),t=film.querySelector('[data-film-title]').getBoundingClientRect();
      return {frame:Number(film.dataset.filmFrame),fills:Math.abs(f.left-b.left)<1&&Math.abs(f.top-b.top)<1&&Math.abs(f.width-b.width)<1&&Math.abs(f.height-b.height)<1,
        sameType:Math.abs(p.left-t.left)<1&&Math.abs(p.top-t.top)<1&&Math.abs(p.width-t.width)<1&&Math.abs(p.height-t.height)<1};
    })()`);
    expect(await compare()).toEqual({ frame: 25, fills: true, sameType: true });
    await capture("cl108-first-player");
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await new Promise((done) => setTimeout(done, 200));
    expect(await compare()).toEqual({ frame: 25, fills: true, sameType: true });
    expect(await inspectPoster()).toMatchObject({
      fills: true,
      typeAligned: true,
      typeWhole: true,
      fontFits: true,
      squareLogo: true,
    });
    await capture("cl108-resized-phone");
    expect({ external, processing }).toEqual({ external: 0, processing: 0 });
  } finally {
    closing = true;
    try {
      await browser.close({ silent: true });
    } finally {
      await Promise.all(pending);
      expect(interceptionFailed).toBe(false);
    }
  }
}, 45_000);
