import { expect, it } from "vitest";
import { build, stop } from "esbuild";
import { createServer } from "node:http";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { listenOwner } from "./owner-http.ts";

it("corrects hosted shared slots with a visible toast and replaces exhausted intake on desktop/phone while local stays open", async () => {
  const directory = await mkdtemp(join(tmpdir(), "clipbuilder-demo-limits-")),
    evidence = resolve(".local-build/evidence");
  await mkdir(evidence, { recursive: true });
  try {
    await build({
      stdin: {
        contents: `
      import React from 'react';import {createRoot} from 'react-dom/client';
      import {LocalEditingExperience} from './apps/frontend/src/features/local-editing/experience.tsx';
      import {OwnerSelectionPanel} from './apps/frontend/src/features/local-editing/selection-panel.tsx';
      import {Workspace} from './apps/frontend/src/shared/ui/workspace';
      import {WorkflowFrame} from './apps/frontend/src/shared/ui/workflow-frame';
      import './apps/frontend/src/styles/tokens.css';
      const mode=new URL(location.href).searchParams.get('mode');
      const capabilities=mode==='local'?{aiMode:'provider-ai',sourceMode:null,planningAvailable:true,localMedia:true,cloud:false}:{execution:'hosted',aiMode:'provider-ai',sourceMode:null,planningAvailable:true,localMedia:false,cloud:true,demoClipLimit:3};
      const workspace={id:'00000000-0000-4000-8000-000000000001',mode:'provider-ai',revision:0,source:{fingerprint:'a'.repeat(64),bytes:9,durationMs:60000,width:320,height:180,fps:30}};
      const noop=()=>{};
      createRoot(document.getElementById('root')).render(mode==='exhausted'?<LocalEditingExperience hosted/>:<Workspace localMode={mode==='local'} cloudMode={mode!=='local'}><WorkflowFrame title="Choose your moments" step={1}><div className="local-editing"><OwnerSelectionPanel workspace={workspace} capabilities={capabilities} busy={false} onBusy={noop} onChoose={noop} previewReady={false} onCaptureTime={()=>null} onJumpTo={noop} onResultsViewChange={noop}/></div></WorkflowFrame></Workspace>);
    `,
        resolveDir: resolve("."),
        loader: "tsx",
      },
      nodePaths: [resolve("apps/frontend/node_modules")],
      bundle: true,
      platform: "browser",
      format: "esm",
      jsx: "automatic",
      outfile: join(directory, "app.js"),
    });
  } finally {
    await stop();
  }
  await writeFile(
    join(directory, "index.html"),
    '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>',
  );
  let mutations = 0;
  const server = createServer((request, response) => {
    void (async () => {
      const path = new URL(request.url!, "http://localhost").pathname;
      if (path.startsWith("/api/")) {
        if (request.method !== "GET") mutations++;
        let value: unknown = null;
        if (path.endsWith("/capabilities"))
          value = {
            execution: "hosted",
            aiMode: "synthetic-ai",
            sourceMode: null,
            planningAvailable: true,
            localMedia: false,
            cloud: true,
            demoClipLimit: 3,
          };
        if (path.endsWith("/session"))
          value = { active: false, limited: true, retryAt: 1_793_300_000_000 };
        response
          .writeHead(200, { "Content-Type": "application/json" })
          .end(JSON.stringify(value));
        return;
      }
      const name =
        path === "/app.js"
          ? "app.js"
          : path === "/app.css"
            ? "app.css"
            : "index.html";
      response
        .writeHead(200, {
          "Content-Type": name.endsWith("js")
            ? "text/javascript"
            : name.endsWith("css")
              ? "text/css"
              : "text/html",
        })
        .end(await readFile(join(directory, name)));
    })().catch(() => response.writeHead(500).end());
  });
  const port = await listenOwner(server);
  const browser = await openBrowser("chrome", {
    browserExecutable: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    chromiumOptions: { headless: true },
    logLevel: "error",
  });
  const interceptions = new Set<Promise<void>>();
  let closing = false,
    interceptionFailed = false;
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
    await client.send("Network.enable");
    // Block every non-fixture origin before dispatch, including incidental resources.
    client.on(
      "Fetch.requestPaused",
      (event: { requestId: string; request: { url: string } }) => {
        const command = event.request.url.startsWith(
          `http://127.0.0.1:${port}/`,
        )
          ? // @ts-expect-error Installed Chrome supports Fetch; pinned CDP types predate it.
            client.send("Fetch.continueRequest", { requestId: event.requestId })
          : // @ts-expect-error Installed Chrome supports Fetch; pinned CDP types predate it.
            client.send("Fetch.failRequest", {
              requestId: event.requestId,
              errorReason: "BlockedByClient",
            });
        const pending = command.then(
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
        interceptions.add(pending);
        void pending.then(() => interceptions.delete(pending));
      },
    );
    // @ts-expect-error Installed Chrome supports Fetch; pinned CDP types predate it.
    await client.send("Fetch.enable", { patterns: [{ urlPattern: "*" }] });
    const evaluate = async (expression: string) => {
      const result = await client.send("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      expect(result.value.exceptionDetails).toBeUndefined();
      return result.value.result.value;
    };
    const wait = async (expression: string) =>
      evaluate(
        `new Promise((resolve,reject)=>{let n=0;const timer=setInterval(()=>{if(${expression}){clearInterval(timer);resolve(true);}else if(++n>100){clearInterval(timer);reject(new Error('demo_ui_timeout'));}},50);})`,
      );
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
    for (const width of [1366, 390]) {
      await client.send("Emulation.setDeviceMetricsOverride", {
        width,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await page.goto({
        url: `http://127.0.0.1:${port}/?mode=hosted`,
        timeout: 10000,
      });
      await wait(
        "document.querySelector('input[type=number]') && !document.querySelector('[role=tablist]').hidden",
      );
      expect(
        await evaluate(
          `(()=>{const input=document.querySelector('input[type=number]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'9');input.dispatchEvent(new Event('input',{bubbles:true}));return true;})()`,
        ),
      ).toBe(true);
      await wait(
        "document.querySelector('input[type=number]').value==='3' && document.querySelector('.demo-limit-toast')",
      );
      for (let i = 0; i < 4; i++) {
        await evaluate(
          `[...document.querySelectorAll('button')].find(button=>button.textContent==='Add clip').click()`,
        );
        await new Promise((done) => setTimeout(done, 40));
      }
      expect(
        await evaluate("document.querySelectorAll('.range-row').length"),
      ).toBe(3);
      expect(
        await evaluate(
          "document.querySelector('input[type=checkbox]').checked",
        ),
      ).toBe(false);
      expect(
        await evaluate("!!document.querySelector('.demo-limit-toast')"),
      ).toBe(true);
      const fits = await evaluate(
        "(()=>{const box=document.querySelector('.demo-limit-toast').getBoundingClientRect();return {left:box.left,right:box.right,bottom:box.bottom,width:innerWidth,scroll:document.documentElement.scrollWidth};})()",
      );
      await capture(`cl114-toast-${width}`);
      expect((fits as { width: number }).width).toBe(width);
      expect((fits as { scroll: number }).scroll).toBeLessThanOrEqual(width);
      expect((fits as { left: number }).left).toBeGreaterThanOrEqual(0);
      expect((fits as { right: number }).right).toBeLessThanOrEqual(width);
      expect((fits as { bottom: number }).bottom).toBeLessThan(900);
      await evaluate(
        "document.querySelector('[aria-label=\"Dismiss demo limit notice\"]').click()",
      );
      expect(
        await evaluate("!!document.querySelector('.demo-limit-toast')"),
      ).toBe(false);
      await page.goto({
        url: `http://127.0.0.1:${port}/?mode=exhausted`,
        timeout: 10000,
      });
      await wait("!!document.querySelector('.demo-limit-screen')");
      expect(
        await evaluate("document.querySelectorAll('input[type=file]').length"),
      ).toBe(0);
      expect(
        await evaluate("document.documentElement.scrollWidth<=innerWidth"),
      ).toBe(true);
      await capture(`cl114-exhausted-${width}`);
    }
    await page.goto({
      url: `http://127.0.0.1:${port}/?mode=local`,
      timeout: 10000,
    });
    await wait(
      "document.querySelector('input[type=number]') && !document.querySelector('[role=tablist]').hidden",
    );
    expect(
      await evaluate("document.querySelector('input[type=number]').max"),
    ).toBe("10");
    for (let i = 0; i < 4; i++) {
      await evaluate(
        `[...document.querySelectorAll('button')].find(button=>button.textContent==='Add clip').click()`,
      );
      await new Promise((done) => setTimeout(done, 40));
    }
    expect(
      await evaluate("document.querySelectorAll('.range-row').length"),
    ).toBe(4);
    expect(
      await evaluate("!!document.querySelector('.demo-limit-toast')"),
    ).toBe(false);
    expect(mutations).toBe(0);
    expect(interceptionFailed).toBe(false);
  } finally {
    closing = true;
    await browser.close({ silent: true });
    await Promise.allSettled([...interceptions]);
    await new Promise<void>((done) => server.close(() => done()));
    await rm(directory, { recursive: true, force: true });
  }
}, 30_000);
