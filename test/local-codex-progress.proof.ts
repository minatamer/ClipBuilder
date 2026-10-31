import { expect, it } from "vitest";
import { createServer } from "node:http";
import { mkdtemp, readFile, writeFile, rm, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { build, stop } from "esbuild";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { listenOwner } from "./owner-http.ts";

it("shows observed Codex spinners/ticks with a visible footer at desktop and phone sizes", async () => {
  const directory = await mkdtemp(
    join(tmpdir(), "clipbuilder-codex-progress-proof-"),
  );
  let requests = 0;
  const runId = crypto.randomUUID();
  const server = createServer(async (req, res) => {
    if (req.url?.endsWith("/codex-progress")) {
      requests++;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          runId,
          steps: [
            { id: "inspect", state: "done", elapsedMs: 120 },
            { id: "audio", state: "done", elapsedMs: 200 },
            { id: "transcription", state: "running", elapsedMs: 0 },
            { id: "speakers", state: "done", elapsedMs: 1300 },
            { id: "selection", state: "pending", elapsedMs: 0 },
          ],
        }),
      );
      return;
    }
    const file =
      req.url === "/app.js"
        ? "app.js"
        : req.url === "/app.css"
          ? "app.css"
          : "index.html";
    res.setHeader(
      "Content-Type",
      file.endsWith(".js")
        ? "text/javascript"
        : file.endsWith(".css")
          ? "text/css"
          : "text/html",
    );
    res.end(await readFile(join(directory, file)));
  });
  let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
  try {
    await build({
      stdin: {
        resolveDir: resolve("."),
        loader: "tsx",
        contents: `
      import React from 'react'; import {createRoot} from 'react-dom/client';
      import {ProcessingState} from './apps/frontend/src/shared/ui/processing-state.tsx';
      import {CodexPreparationSteps} from './apps/frontend/src/features/local-editing/codex-preparation-steps.tsx';
      import {Button} from './apps/frontend/src/shared/ui/button.tsx';
      import './apps/frontend/src/styles/tokens.css';
      const root=createRoot(document.getElementById('root'));
      globalThis.unmountProgress=()=>root.unmount();
      root.render(<main><h1>Choose your moments</h1><section><ProcessingState label="Preparing moments"><CodexPreparationSteps workspaceId="${crypto.randomUUID()}"/></ProcessingState></section><footer><Button>Cancel analysis</Button></footer></main>);
    `,
      },
      nodePaths: [resolve("apps/frontend/node_modules")],
      bundle: true,
      jsx: "automatic",
      platform: "browser",
      format: "esm",
      outfile: join(directory, "app.js"),
    });
    await stop();
    await writeFile(
      join(directory, "index.html"),
      `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"><style>
      *,*::before,*::after{box-sizing:border-box}
      body{margin:0;background:#0b2459;color:white;font:16px Arial;--cb-ink:white;--cb-ink-soft:#bed2ed}
      main{height:100dvh;display:flex;flex-direction:column;box-sizing:border-box;padding:16px;gap:12px}
      h1{margin:0;font-size:24px}section{flex:1;min-height:0;overflow:auto}footer{flex:none;display:flex;justify-content:flex-end}
      </style></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>`,
    );
    const port = await listenOwner(server);
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
    await page.goto({ url: `http://localhost:${port}`, timeout: 10000 });
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    for (const [width, height] of [
      [1440, 900],
      [390, 844],
      [320, 568],
    ] as const) {
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      await page._client().send("Runtime.evaluate", {
        expression: `globalThis.checkProgress=async()=>{for(let i=0;i<100;i++){const list=document.querySelector('[aria-label="Preparation stages"]');if(list){const running=list.querySelector('[data-state="running"] svg'),done=list.querySelector('[data-state="done"] svg'),footer=document.querySelector('footer').getBoundingClientRect();return {running:getComputedStyle(running).animationName!=='none',blue:getComputedStyle(done).color,done:list.querySelectorAll('[data-state="done"]').length,pending:list.querySelector('[data-state="pending"] svg').getAttribute('class')??'',fits:list.getBoundingClientRect().right<=innerWidth,footer:footer.bottom<=innerHeight&&footer.top>=0};}await new Promise(r=>setTimeout(r,25));}throw Error('missing_progress');}`,
      });
      const result = await page._client().send("Runtime.evaluate", {
        expression: "globalThis.checkProgress()",
        awaitPromise: true,
        returnByValue: true,
      });
      expect(result.value.exceptionDetails).toBeUndefined();
      expect(result.value.result.value).toMatchObject({
        running: true,
        blue: "rgb(120, 175, 255)",
        done: 3,
        fits: true,
        footer: true,
      });
      await page._client().send("Runtime.evaluate", {
        expression:
          "new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done)))",
        awaitPromise: true,
      });
      const shot = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        resolve(`.local-build/evidence/cl168-progress-${width}.png`),
        Buffer.from(shot.value.data, "base64"),
      );
    }
    await page
      ._client()
      .send("Runtime.evaluate", { expression: "globalThis.unmountProgress()" });
    const count = requests;
    await new Promise<void>((done) => setTimeout(done, 900));
    expect(requests).toBe(count);
  } finally {
    await stop();
    await browser?.close({ silent: true });
    server.closeAllConnections();
    await new Promise<void>((done) => server.close(() => done()));
    await rm(directory, { recursive: true, force: true });
  }
}, 30000);
