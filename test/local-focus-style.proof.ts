import { expect, it } from "vitest";
import { build, stop, transform } from "esbuild";
import { createServer } from "node:http";
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  realpath,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { startHookEditorFixture } from "./owner-hook-browser-fixture.ts";
import { ownerRequest, listenOwner } from "./owner-http.ts";
import { withIndependentOwnerHook } from "../packages/contracts/local/hook-content.ts";

declare global {
  function focusCapture(): {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  function focusSweep(): { count: number; issues: string[] };
  function focusAction(group: string, name: string): Promise<void>;
  function focusWait(selector: string): Promise<void>;
}
async function errorViews() {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-focus-errors-"));
  const server = createServer((req, res) => {
    void (async () => {
      if (req.url === "/api/diagnostics" && req.method === "POST") {
        req.resume();
        res.writeHead(204).end();
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
        file.endsWith("js")
          ? "text/javascript"
          : file.endsWith("css")
            ? "text/css"
            : "text/html",
      );
      res.end(await readFile(join(root, file)));
    })().catch(() => res.writeHead(500).end());
  });
  const close = async () => {
    server.closeAllConnections();
    if (server.listening)
      await new Promise<void>((done) => server.close(() => done()));
    if (dirname(await realpath(root)) !== (await realpath(tmpdir())))
      throw Error("invalid_focus_cleanup");
    await rm(root, { recursive: true, force: true });
  };
  try {
    try {
      await build({
        stdin: {
          contents: `import React from 'react';import{createRoot}from'react-dom/client';import ErrorPage from './apps/frontend/src/app/error.tsx';import GlobalError from './apps/frontend/src/app/global-error.tsx';import './apps/frontend/src/styles/tokens.css';const global=location.pathname==='/global.html';createRoot(global?document:document.getElementById('root')).render(global?<GlobalError error={new Error('synthetic')}/>:<ErrorPage error={new Error('synthetic')} reset={()=>{}}/>);`,
          resolveDir: resolve("."),
          loader: "tsx",
        },
        nodePaths: [resolve("apps/frontend/node_modules")],
        bundle: true,
        platform: "browser",
        format: "esm",
        jsx: "automatic",
        outfile: join(root, "app.js"),
      });
    } finally {
      await stop();
    }
    await writeFile(
      join(root, "index.html"),
      '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>',
    );
    return {
      url: "http://localhost:" + (await listenOwner(server)) + "/",
      close,
    };
  } catch (error) {
    await close();
    throw error;
  }
}
it("surveys neutral inset focus across public, intake, moments, editor, dialogs and recovery views", async () => {
  const fixtures: { close: () => Promise<void> }[] = [];
  let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
  let closing = false,
    external = 0,
    intercepted = 0,
    interceptionFailures = 0;
  const pending = new Set<Promise<void>>();
  const cleanupFailures: unknown[] = [];
  try {
    const editor = await startHookEditorFixture(undefined, {
      contextualFeedback: true,
      configure(clip) {
        const focus = clip.base!.overlay.focus!;
        focus.people = [
          {
            id: "person_1",
            observations: [
              {
                startFrame: 0,
                endFrame: 120,
                box: { x: 0.15, y: 0.1, width: 0.3, height: 0.7 },
              },
            ],
          },
        ];
        focus.shots = focus.shots.map((s) => ({ ...s, personId: "person_1" }));
        clip.edit!.focus = structuredClone(focus);
        delete clip.edit!.hookContent;
        clip.edit = withIndependentOwnerHook(
          clip.base!,
          clip.edit!,
          clip.assets,
          [],
          { startFrame: 30, endFrame: 90 },
        );
      },
    });
    fixtures.push(editor);
    const moments = await startHookEditorFixture(undefined, {
      momentsLayout: true,
    });
    fixtures.push(moments);
    const errors = await errorViews();
    fixtures.push(errors);
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
          if (url.port === "3000" && url.pathname.startsWith("/api/")) {
            intercepted++;
            const result = await ownerRequest(
              Number(new URL(editor.url).port),
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
          if (
            ![
              "3000",
              new URL(editor.url).port,
              new URL(moments.url).port,
              new URL(errors.url).port,
            ].includes(url.port)
          )
            throw Error("unexpected_focus_origin");
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

    const driver = await transform(
      `
   const wait=async(fn:()=>unknown)=>{for(let i=0;i<400;i++){if(fn())return;await new Promise(r=>setTimeout(r,10))}throw Error('focus_view_not_ready')};
   globalThis.focusWait=async(selector:string)=>wait(()=>document.querySelector(selector));
   globalThis.focusAction=async(group:string,name:string)=>{
    if(group==='picture'){document.querySelector<HTMLButtonElement>('[aria-label="Picture timeline"] button')!.click();return;}
    if(group==='aria'){const n=()=>document.querySelector<HTMLButtonElement>('[aria-label="'+name+'"]');await wait(()=>n()&&!n()!.disabled);n()!.click();return;}
    if(group==='button'){const button=()=>[...document.querySelectorAll<HTMLButtonElement>('button')].find(n=>n.textContent?.trim()===name&&n.getClientRects().length&&!n.disabled);await wait(button);button()!.click();return;}
    const tab=()=>[...document.querySelectorAll<HTMLButtonElement>('[role="tablist"][aria-label="'+group+'"] [role="tab"]')].find(n=>(n.getAttribute('aria-label')??n.querySelector('span')?.textContent??n.textContent).startsWith(name));await wait(()=>tab()&&!tab()!.disabled);tab()!.click();await wait(()=>tab()?.getAttribute('aria-selected')==='true');await new Promise(r=>setTimeout(r,25));
   };
   globalThis.focusCapture=()=>{const n=document.querySelector<HTMLInputElement>('[aria-label="YouTube link"]')!;n.focus();const r=n.closest('.source-card')!.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}};
   globalThis.focusSweep=()=>{
    const scope=document.querySelector('dialog[open]')??document;const nodes=[...scope.querySelectorAll<HTMLElement>('a[href],button,input,textarea,select,summary,[tabindex],[contenteditable],video[controls],audio[controls]')].filter(n=>n.getClientRects().length&&!n.matches(':disabled')&&(n.tabIndex>=0||n.isContentEditable)).sort((a,b)=>Number(b.isContentEditable)-Number(a.isContentEditable));let count=0;const issues:string[]=[];
    for(const node of nodes){if(!node.isConnected)continue;const before=node.getBoundingClientRect();node.focus({preventScroll:true});if(document.activeElement!==node)continue;const style=getComputedStyle(node),after=node.getBoundingClientRect(),width=parseFloat(style.outlineWidth),offset=parseFloat(style.outlineOffset),rgb=style.outlineColor.match(/[0-9.]+/g)?.slice(0,3).map(Number)??[];const label=node.tagName+':'+(node.getAttribute('aria-label')??node.getAttribute('type')??'control');
     if(style.outlineStyle!=='none'&&width>0){if(rgb.length!==3)issues.push('unparsed-color:'+label);if(offset+width>.1)issues.push('outer:'+label);if(rgb.length===3&&Math.max(...rgb)-Math.min(...rgb)>3)issues.push('color:'+label+':'+style.outlineColor)}
     if(Math.abs(before.width-after.width)>.6||Math.abs(before.height-after.height)>.6)issues.push('geometry:'+label);count++;
    }return{count,issues};
   };
  `,
      { loader: "ts" },
    );
    await page.evaluateOnNewDocument(driver.code);
    const evidence: {
      phase: string;
      width: number;
      count: number;
      issues: string[];
    }[] = [];
    const key = async (key: string, code: number) => {
      await client.send("Input.dispatchKeyEvent", {
        type: "keyDown",
        key,
        code: key,
        windowsVirtualKeyCode: code,
      });
      await client.send("Input.dispatchKeyEvent", {
        type: "keyUp",
        key,
        code: key,
        windowsVirtualKeyCode: code,
      });
    };
    const sweep = async (phase: string, width: number) => {
      await key("Tab", 9);
      const result = await page.evaluate(() => focusSweep());
      evidence.push({ phase, width, ...result });
      expect(result.count, phase).toBeGreaterThan(0);
      expect(result.issues, phase).toEqual([]);
    };
    const tab = (group: string, name: string) =>
      page.evaluate(([g, n]) => focusAction(g!, n!), [group, name]);
    const button = (name: string) =>
      page.evaluate((n) => focusAction("button", n), name);
    for (const width of [1440, 834, 390]) {
      await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
      await page.goto({ url: "http://localhost:3000/", timeout: 30000 });
      await page.evaluate(() => focusWait("main"));
      await sweep("landing", width);
      await button("Privacy");
      await page.evaluate(() => focusWait("dialog[open]"));
      await sweep("landing-privacy", width);
      await key("Escape", 27);
      await page.goto({
        url: new URL("intake.html", editor.url).href,
        timeout: 15000,
      });
      await page.evaluate(() => focusWait('input[aria-label="YouTube link"]'));
      await sweep("intake", width);
      if (width === 1440) {
        const rect = await page.evaluate(() => focusCapture());
        const shot = await client.send("Page.captureScreenshot", {
          format: "png",
          fromSurface: true,
          clip: { ...rect, scale: 1 },
        });
        await mkdir(resolve(".local-build/evidence"), { recursive: true });
        await writeFile(
          resolve(".local-build/evidence/cl258-url-focus.png"),
          Buffer.from(shot.value.data, "base64"),
        );
      }
      await page.goto({ url: editor.url, timeout: 15000 });
      await page.evaluate(() =>
        focusWait(".editor-layout:not([data-loading]) .editor-panels"),
      );
      for (const main of [
        "Captions",
        "Text",
        "Filters",
        "Media",
        "Camera",
        "Hook",
      ]) {
        await tab("Clip settings", main);
        await sweep(main, width);
        const groups: [string, string[]][] =
          main === "Captions"
            ? [["Caption controls", ["Style", "Position", "Text", "Speakers"]]]
            : main === "Text"
              ? [["Text controls", ["Content", "Style", "Timing", "Position"]]]
              : main === "Media"
                ? [["Media controls", ["Pictures", "Audio"]]]
                : main === "Camera"
                  ? [["Focus controls", ["Camera", "People", "Zoom", "Motion"]]]
                  : [];
        for (const [group, names] of groups) {
          for (const name of names) {
            await tab(group, name);
            await sweep(main + "-" + name, width);
          }
        }
      }
      await tab("Clip settings", "Media");
      await tab("Media controls", "Pictures");
      await page.evaluate(() => focusAction("picture", "first"));
      for (const name of ["Image", "Timing", "Motion", "Position"]) {
        await tab("Picture controls", name);
        await sweep("picture-" + name, width);
      }
      await tab("Media controls", "Audio");
      for (const name of ["Sound library", "Your audio"]) {
        if (name.startsWith("Your")) {
          await tab("Audio views", "Your audio");
        } else await tab("Audio views", name);
        await sweep("audio-" + name, width);
      }
      await tab("Clip settings", "Camera");
      await tab("Focus controls", "Camera");
      for (const name of ["Timing", "Advanced"]) {
        await tab("Camera controls", name);
        await sweep("camera-" + name, width);
      }
      await tab("Focus controls", "Zoom");
      await button("Add at playhead");
      await page.evaluate(() => focusWait('[aria-label="Zoom magnification"]'));
      await sweep("zoom-fields", width);
      await button("Discard changes");
      await tab("Clip settings", "Camera");
      await tab("Focus controls", "Motion");
      await button("Add at playhead");
      await page.evaluate(() => focusWait('[aria-label="Head to follow"]'));
      await sweep("motion-fields", width);
      await button("Cancel");
      await page.evaluate(() => focusAction("aria", "Rename clip"));
      await page.evaluate(() => focusWait("dialog[open]"));
      await sweep("rename-dialog", width);
      await key("Escape", 27);
      await button("Privacy");
      await page.evaluate(() => focusWait("dialog[open]"));
      await sweep("editor-privacy", width);
      await key("Escape", 27);
      await page.goto({ url: moments.url, timeout: 15000 });
      await page.evaluate(() => focusWait(".local-moments"));
      await sweep("moments", width);
    }
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    for (const [phase, url] of [
      ["not-found", "http://localhost:3000/focus-audit-missing"],
      ["error", new URL("error.html", errors.url).href],
      ["global-error", new URL("global.html", errors.url).href],
    ]) {
      await page.goto({ url: url!, timeout: 30000 });
      await page.evaluate(() => focusWait("main"));
      await sweep(phase!, 1440);
    }
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    await writeFile(
      resolve(".local-build/evidence/cl258-focus-audit.json"),
      JSON.stringify(
        { synthetic: true, providerCalls: 0, intercepted, evidence },
        null,
        2,
      ),
    );
    expect(external).toBe(0);
    expect(interceptionFailures).toBe(0);
    expect(editor.counts().edits).toBe(0);
    expect(editor.counts().unexpected).toBe(0);
    expect(editor.clip.calls).toEqual({ plan: 0, image: 0, render: 0 });
    expect(moments.clip.calls).toEqual({ plan: 0, image: 0, render: 0 });
  } finally {
    closing = true;
    await browser
      ?.close({ silent: true })
      .catch((error) => cleanupFailures.push(error));
    await Promise.allSettled(pending);
    const closed = await Promise.allSettled(fixtures.map((f) => f.close()));
    for (const item of closed)
      if (item.status === "rejected") cleanupFailures.push(item.reason);
  }
  if (cleanupFailures.length)
    throw new AggregateError(cleanupFailures, "focus_fixture_cleanup_failed");
}, 240000);
