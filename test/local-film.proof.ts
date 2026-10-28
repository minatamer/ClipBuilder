import { expect, it } from "vitest";
import { build } from "esbuild";
import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { listenOwner } from "./owner-http.ts";
import {
  FILM_CAPTURES,
  FILM_TIMELINES,
} from "../apps/frontend/src/features/product-film/film-timeline.ts";

it("reviews integrated full-canvas scenes, action-only passages and shared-object handoffs", async () => {
  const frontend = resolve("apps/frontend");
  const bundle = await build({
    absWorkingDir: frontend,
    outfile: resolve(".local-build/film-review.js"),
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"' },
    stdin: {
      resolveDir: frontend,
      loader: "tsx",
      sourcefile: "film-review.tsx",
      contents: `
      import React,{createRef} from 'react';import{createRoot}from'react-dom/client';
      import{Player}from'@remotion/player';import{ProductFilm}from'./src/features/product-film/product-film';
      import{ProductFilmPoster}from'./src/features/product-film/product-film-poster';
      const root=createRoot(document.getElementById('app')),ref=createRef();
      const settle=async()=>{for(let i=0;i<3;i++)await new Promise(requestAnimationFrame)};
      window.reviewFilm=async(frame,height)=>{root.render(<Player ref={ref} component={ProductFilm} inputProps={{variant:'walkthrough'}} durationInFrames={720} compositionWidth={1920} compositionHeight={height} fps={30} controls={false} clickToPlay={false} autoPlay={false} style={{width:'100%',height:'100%'}}/>);await settle();ref.current.seekTo(frame);await settle()};
      window.reviewPoster=async()=>{root.render(<ProductFilmPoster/>);await settle()};
    `,
    },
  });
  const script = bundle.outputFiles.find((file) => file.path.endsWith(".js"));
  const stylesheet = bundle.outputFiles.find((file) =>
    file.path.endsWith(".css"),
  );
  if (!script || !stylesheet) throw new Error("film_bundle_unavailable");
  const allowed = new Set<string>(Object.values(FILM_CAPTURES));
  const server = createServer((request, response) => {
    const path = new URL(request.url ?? "/", "http://localhost").pathname;
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405).end();
      return;
    }
    if (path === "/") {
      response.setHeader("content-type", "text/html");
      response.end(
        '<style>html,body,#app{margin:0;width:100%;height:100%;overflow:hidden}#app{position:relative;background:#07162d}svg{display:block}</style><link rel="stylesheet" href="/bundle.css"><div id="app"></div><script src="/bundle.js"></script>',
      );
      return;
    }
    if (path === "/bundle.js") {
      response.setHeader("content-type", "text/javascript");
      response.end(script.contents);
      return;
    }
    if (path === "/bundle.css") {
      response.setHeader("content-type", "text/css");
      response.end(stylesheet.contents);
      return;
    }
    if (allowed.has(path)) {
      void readFile(resolve(frontend, "public", "." + path)).then(
        (bytes) => {
          response.setHeader("content-type", "image/png");
          response.end(bytes);
        },
        () => response.writeHead(404).end(),
      );
      return;
    }
    response.writeHead(404).end();
  });
  const evidence = resolve(".local-build/evidence");
  await mkdir(evidence, { recursive: true });
  const port = await listenOwner(server);
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
        const remote = !["localhost", "127.0.0.1"].includes(
          new URL(event.request.url).hostname,
        );
        if (remote) external++;
        if (remote) {
          // @ts-expect-error Installed Chrome supports Fetch; pinned CDP types predate it.
          void client.send("Fetch.failRequest", {
            requestId: event.requestId,
            errorReason: "BlockedByClient",
          });
        } else {
          // @ts-expect-error Installed Chrome supports Fetch; pinned CDP types predate it.
          void client.send("Fetch.continueRequest", {
            requestId: event.requestId,
          });
        }
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
        throw new Error("film_review_expression_failed");
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
    await page.goto({ url: `http://localhost:${port}/`, timeout: 30_000 });
    const shots = [25, 90, 195, 268, 390, 460, 490, 590, 690] as const;
    for (const [width, height] of [
      [686, 549],
      [304, 228],
      [960, 540],
    ] as const) {
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      const canvasHeight = Math.round((1920 * height) / width);
      for (const frame of shots) {
        await evaluate(`window.reviewFilm(${frame},${canvasHeight})`);
        const geometry = await evaluate(`(()=>{
          const root=document.querySelector('[data-film-beat]'),title=root.querySelector('[data-film-title]');
          const frame=root.querySelector('[data-film-demo]'),portrait=root.querySelector('[data-film-portrait]');
          const rect=title?.getBoundingClientRect(),bounds=root.getBoundingClientRect(),screen=root.querySelector("[data-film-screen]")?.getBoundingClientRect();
          return {beat:root.dataset.filmBeat,titleFits:!rect||(rect.left>=bounds.left-1&&rect.right<=bounds.right+1&&rect.top>=bounds.top-1&&rect.bottom<=bounds.bottom+1),
            hasTitle:!!title,fullBleed:!screen||(Math.abs(screen.left-bounds.left)<1&&Math.abs(screen.top-bounds.top)<1&&Math.abs(screen.width-bounds.width)<1&&Math.abs(screen.height-bounds.height)<1),
            titlePx:title?parseFloat(getComputedStyle(title).fontSize)*innerWidth/1920:0,
            frameWidth:frame?.getBoundingClientRect().width/innerWidth,
            portraitHeight:portrait?.getBoundingClientRect().height/innerHeight};
        })()`);
        expect(geometry.titleFits).toBe(true);
        if (geometry.hasTitle)
          expect(geometry.titlePx).toBeGreaterThanOrEqual((width / 1920) * 138);
        expect(geometry.fullBleed).toBe(true);
        expect(geometry.hasTitle).toBe(![390, 490].includes(frame));
        if (
          [
            "intake",
            "analysis",
            "choose",
            "review",
            "identity",
            "close",
          ].includes(geometry.beat)
        )
          expect(geometry.frameWidth).toBeGreaterThan(0.9);
        if (geometry.beat === "result")
          expect(geometry.portraitHeight).toBeGreaterThan(0.85);
        await capture(`cl107-${width}-${geometry.beat}-${frame}`);
      }
      const samples = new Set<number>(
        Array.from({ length: 36 }, (_, index) => index * 20),
      );
      for (const shot of FILM_TIMELINES.walkthrough) {
        for (const local of [
          0,
          1,
          3,
          6,
          9,
          12,
          18,
          23,
          26,
          30,
          shot.duration - 1,
        ])
          samples.add(shot.from + local);
      }
      for (const frame of [...samples].sort((a, b) => a - b)) {
        await evaluate(`window.reviewFilm(${frame},${canvasHeight})`);
        const safety = await evaluate(`(() => {
          const root=document.querySelector('[data-film-beat]'),bounds=root.getBoundingClientRect();
          const opacity=n=>{let result=1;for(let node=n;node&&node!==root;node=node.parentElement)result*=Number(getComputedStyle(node).opacity);return result};
          const copy=[...root.querySelectorAll('[data-film-copy]')].filter(n=>opacity(n)>.02);
          const text=[...root.querySelectorAll('[data-film-title],[data-film-detail]')].filter(n=>opacity(n)>.02);
          const whole=text.every(n=>{const range=document.createRange();range.selectNodeContents(n);return [...range.getClientRects()].every(r=>r.left>=bounds.left-1&&r.right<=bounds.right+1&&r.top>=bounds.top-1&&r.bottom<=bounds.bottom+1)});
          const unmasked=text.every(n=>{for(let node=n;node&&node!==root;node=node.parentElement){if(getComputedStyle(node).clipPath!=='none')return false}return true});
          const addedTracks=[...root.querySelectorAll('[data-film-demo]>div')].filter(n=>{const s=getComputedStyle(n);return s.position==='absolute'&&parseFloat(s.bottom)===0&&parseFloat(s.height)<=8});
          const detailsWhole=[...root.querySelectorAll('[data-film-clip-details]')].filter(n=>opacity(n)>.02).every(n=>{const r=n.getBoundingClientRect();return ['[data-film-portrait]','[data-film-portrait-boundary]'].every(selector=>{const b=n.closest(selector).getBoundingClientRect();return r.left>=b.left-2&&r.right<=b.right+2&&r.top>=b.top-2&&r.bottom<=b.bottom+2})});
          const cursor=root.querySelector('[data-film-cursor]');const cursorClear=!cursor||opacity(cursor)<.05||copy.every(n=>{const a=n.getBoundingClientRect(),b=cursor.getBoundingClientRect();return !(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top)});
          const globalMasks=[...root.querySelectorAll('[data-film-stage],[data-film-stage]>div')].some(n=>getComputedStyle(n).clipPath!=='none');return {whole,unmasked,detailsWhole,cursorClear,globalMasks,visibleCopy:copy.length,tracks:addedTracks.length};
        })()`);
        expect(safety.whole, `${width}px frame ${frame}`).toBe(true);
        expect(safety.unmasked).toBe(true);
        expect(
          safety.cursorClear,
          `${width}px frame ${frame} pointer/copy clearance`,
        ).toBe(true);
        expect(safety.detailsWhole, `${width}px frame ${frame} clip copy`).toBe(
          true,
        );
        expect(safety.globalMasks).toBe(false);
        expect(safety.visibleCopy).toBeLessThanOrEqual(1);
        expect(safety.tracks).toBe(0);
        if (
          FILM_TIMELINES.walkthrough.some((shot) =>
            [shot.from, shot.from + 12, shot.from + 26].includes(frame),
          )
        )
          await capture(`cl107-transition-${width}-${frame}`);
      }
      for (const quiet of [130, 220, 310, 390, 510]) {
        await evaluate(`window.reviewFilm(${quiet},${canvasHeight})`);
        expect(
          await evaluate(
            `document.querySelectorAll('[data-film-copy]').length`,
          ),
        ).toBe(0);
        await capture(`cl107-action-${width}-${quiet}`);
      }
      await evaluate(`window.reviewFilm(719,${canvasHeight})`);
      await evaluate(
        `window.heldArt=document.querySelector('[data-film-conversation]:not([data-film-portrait])');window.heldArtHtml=window.heldArt.innerHTML;window.heldArtRect=JSON.stringify(window.heldArt.getBoundingClientRect().toJSON());window.heldBrand=document.querySelector('[data-film-brand]');true`,
      );
      for (const frame of [0, 6, 12, 24]) {
        await evaluate(`window.reviewFilm(${frame},${canvasHeight})`);
        expect(
          await evaluate(
            `(() => {const art=document.querySelector('[data-film-conversation]:not([data-film-portrait])');return art===window.heldArt&&art.innerHTML===window.heldArtHtml&&JSON.stringify(art.getBoundingClientRect().toJSON())===window.heldArtRect&&document.querySelector('[data-film-brand]')===window.heldBrand})()`,
          ),
        ).toBe(true);
      }
      await evaluate("window.reviewPoster()");
      await capture(`cl107-${width}-poster`);
    }
    await page.setViewport({ width: 686, height: 549, deviceScaleFactor: 1 });
    for (const frame of [268, 280, 295, 316]) {
      await evaluate(`window.reviewFilm(${frame},1536)`);
      expect(
        await evaluate(
          `(()=>{const cursor=document.querySelector('[data-film-cursor]'),frame=document.querySelector('[data-film-screen]');if(!cursor)return false;const c=cursor.getBoundingClientRect(),r=frame.getBoundingClientRect();return c.left>=r.left&&c.right<=r.right+1&&c.top>=r.top&&c.bottom<=r.bottom+1})()`,
        ),
      ).toBe(true);
      await capture(`cl107-cursor-${frame}`);
    }
    for (const frame of [455, 460, 480, 490, 510, 520]) {
      await evaluate(`window.reviewFilm(${frame},1536)`);
      expect(
        await evaluate(
          `(()=>{const cursor=document.querySelector('[data-film-cursor]'),copy=document.querySelector('[data-film-copy]');if(!cursor||!copy)return true;const c=cursor.getBoundingClientRect(),t=copy.getBoundingClientRect();return getComputedStyle(cursor).opacity<.05||!(c.left<t.right&&c.right>t.left&&c.top<t.bottom&&c.bottom>t.top)})()`,
        ),
      ).toBe(true);
    }
    await capture("cl107-review-click-clear");
    expect(external).toBe(0);
  } finally {
    try {
      await browser?.close({ silent: true });
    } finally {
      await new Promise<void>((done, reject) => {
        server.closeAllConnections();
        server.close((error) => (error ? reject(error) : done()));
      });
    }
  }
}, 90_000);
