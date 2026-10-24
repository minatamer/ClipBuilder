import { expect, it, vi } from "vitest";
import { createServer } from "node:http";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import {
  createHostedEditingWorkflow,
  EDITING_CSRF_COOKIE,
  editingCookie,
} from "../apps/backend/local/hosted-workflow.ts";
import { fakeOwnerAnalysis } from "../apps/backend/local/fake-analysis.ts";
import { fakeOwnerClipPreparation } from "../apps/backend/local/fake-clips.ts";
import { createOwnerWorker } from "../apps/renderer/local/server.ts";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { localWorkerPort } from "../apps/backend/local/worker-port.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { listenOwner, ownerRequest } from "./owner-http.ts";
import {
  prepareLocalControlsFixture,
  prepareLocalOverlayFixture,
} from "./owner-controls-browser.ts";

it("takes a hosted-shaped upload through the shared editor and native re-export without YouTube or paid calls", async () => {
  const directory = await mkdtemp(
      join(tmpdir(), "clipbuilder-hosted-editor-proof-"),
    ),
    root = join(directory, "workspaces");
  await mkdir(root);
  const tools = await ownerNativeTools(resolve(".")),
    signal = AbortSignal.timeout(180_000);
  const worker = createOwnerWorker({
    root,
    token: "synthetic-worker",
    tools,
    chromium: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    overlayBundle: await prepareLocalOverlayFixture(directory),
  });
  const workerPort = await listenOwner(worker.server);
  const transport: typeof fetch = async (input, init) => {
    const url = new URL(String(input));
    if (url.origin !== `http://127.0.0.1:${workerPort}`)
      throw new Error("unexpected_transport");
    const result = await ownerRequest(workerPort, url.pathname, {
      method: init?.method ?? "GET",
      headers: Object.fromEntries(new Headers(init?.headers)),
      ...(typeof init?.body === "string" ? { body: init.body } : {}),
    });
    return new Response(result.status === 204 ? null : result.body.toString(), {
      status: result.status,
    });
  };
  const media = vi.fn(
      localWorkerPort(workerPort, "synthetic-worker", transport),
    ),
    transcribe = vi.fn(fakeOwnerAnalysis.transcribe),
    plan = vi.fn(fakeOwnerClipPreparation.plan),
    image = vi.fn(fakeOwnerClipPreparation.image);
  const ui = await prepareLocalControlsFixture(directory, true);
  let releaseConnection: () => void = () => {};
  const connection = new Promise<void>((done) => {
    releaseConnection = done;
  });
  let origin = "";
  const server = createServer((req, res) => {
    void (async () => {
      if (req.url?.startsWith("/api/local/")) {
        if (req.url === "/api/local/capabilities") await connection;
        req.url = req.url.replace("/api/local/", "/");
        req.headers.origin = origin;
        req.headers["sec-fetch-site"] = "same-origin";
        const csrf = editingCookie(req.headers.cookie, EDITING_CSRF_COOKIE);
        if (csrf) req.headers["x-csrf-token"] = csrf;
        await flow!.dispatch(req, res);
        return;
      }
      const name =
        req.url === "/"
          ? "index.html"
          : req.url === "/app.js"
            ? "app.js"
            : req.url === "/app.css"
              ? "app.css"
              : null;
      if (!name) {
        res.writeHead(404).end();
        return;
      }
      res
        .writeHead(200, {
          "Content-Security-Policy":
            "default-src 'self' blob: data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'",
          "Content-Type": name.endsWith("js")
            ? "text/javascript"
            : name.endsWith("css")
              ? "text/css"
              : "text/html",
        })
        .end(await readFile(join(ui, name)));
    })().catch(() => res.destroy());
  });
  const port = await listenOwner(server);
  origin = `http://localhost:${port}`;
  const flow = createHostedEditingWorkflow({
    root,
    origin,
    ttlMs: 120_000,
    siteKey: "synthetic-site-key",
    aiMode: "synthetic-ai",
    sourceLimits: { bytes: 10 * 1024 ** 2, durationMs: 60000 },
    abuse: { verify: async () => true },
    capacity: async () => {},
    media,
    providers: () => ({
      analysis: { ...fakeOwnerAnalysis, transcribe },
      clipPreparation: { ...fakeOwnerClipPreparation, plan, image },
    }),
  });
  const browser = await openBrowser("chrome", {
    browserExecutable: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    chromiumOptions: { headless: true },
    logLevel: "error",
  });
  try {
    const source = join(directory, "synthetic.mp4");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-f",
        "lavfi",
        "-i",
        "color=c=blue:size=160x90:rate=30:duration=4",
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=440:sample_rate=48000:duration=4",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-threads",
        "2",
        source,
      ],
      signal,
    );
    const page = await browser.newPage({
      context: () => null,
      logLevel: "error",
      indent: false,
      pageIndex: 0,
      onBrowserLog: null,
      onLog: () => {},
    });
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto({ url: origin + "/", timeout: 10000 });
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    await page._client().send("Runtime.evaluate", {
      expression: `
      window.turnstile={render(_node,options){queueMicrotask(()=>options.callback('synthetic-proof'));return 'synthetic-widget';},remove(){}};
      globalThis.hostedWait=async (read,phase="step")=>{for(let i=0;i<1200;i++){const value=read();if(value)return value;await new Promise(done=>setTimeout(done,50));}throw new Error('hosted_browser_timeout_'+phase+'_'+[...document.querySelectorAll('button')].map(n=>n.textContent.trim()).join('|')+'_'+document.querySelector('.flow-notice')?.textContent+'_'+[...document.querySelectorAll('.clip-state')].map(n=>n.textContent).join('_'));};
      globalThis.hostedIntakeReady=()=>globalThis.hostedWait(()=>document.querySelector('.upload-card input:not(:disabled)'));
    `,
    });
    const evaluate = async (expression: string) => {
      const result = await page._client().send("Runtime.evaluate", {
        expression,
        awaitPromise: true,
        returnByValue: true,
      });
      if (result.value.exceptionDetails)
        throw new Error(
          "loading_browser_check_" +
            JSON.stringify(result.value.exceptionDetails),
        );
      return result.value.result.value;
    };
    const captureLoading = async (
      label: string,
      name: string,
      measured = false,
    ) => {
      await evaluate(
        `globalThis.hostedWait(()=>[...document.querySelectorAll('[role="status"]')].some(n=>n.textContent.trim()===${JSON.stringify(label)}),'loading_${name}').then(()=>true)`,
      );
      for (const [width, height] of [
        [1440, 900],
        [390, 844],
        [320, 568],
      ]) {
        await page.setViewport({
          width: width!,
          height: height!,
          deviceScaleFactor: 1,
        });
        const geometry = JSON.parse(
          await evaluate(`(async()=>{
          const status=[...document.querySelectorAll('[role="status"]')].find(n=>n.textContent.trim()===${JSON.stringify(label)});
          const panel=status.parentElement;
          panel.scrollIntoView({block:'center'});await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);
          const rect=panel.getBoundingClientRect(), title=status.getBoundingClientRect(),footer=document.querySelector('#sample-main > footer')?.getBoundingClientRect()??{top:innerHeight,bottom:innerHeight};
          return JSON.stringify({overflow:document.documentElement.scrollWidth>innerWidth,footer:footer.top>=0&&footer.bottom<=innerHeight+1,centered:Math.abs(title.left+title.width/2-(rect.left+rect.width/2))<2,animation:getComputedStyle(panel.querySelector('svg')).animationName!=='none',bar:!!panel.querySelector('[role="progressbar"]'),percentage:panel.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')??null,editor:!!document.querySelector('.editor-panels:not([hidden])'),titleVisible:title.top>=0&&title.bottom<=footer.top+1});
        })()`),
        );
        const shot = await page
          ._client()
          .send("Page.captureScreenshot", { format: "png", fromSurface: true });
        await writeFile(
          resolve(`.local-build/evidence/cl062-${name}-${width}.png`),
          Buffer.from(shot.value.data, "base64"),
        );
        expect(geometry).toMatchObject({
          overflow: false,
          footer: true,
          centered: true,
          animation: true,
          bar: measured,
          titleVisible: true,
        });
        if (!measured) expect(geometry.percentage).toBeNull();
      }
      await page.setViewport({
        width: 1440,
        height: 1000,
        deviceScaleFactor: 1,
      });
    };
    await captureLoading("Connecting", "connecting");
    releaseConnection();
    await page.evaluate(() => {
      return (
        globalThis as unknown as { hostedIntakeReady: () => Promise<unknown> }
      )
        .hostedIntakeReady()
        .then(() => true);
    });
    for (const width of [1440, 390]) {
      await page.setViewport({ width, height: 1000, deviceScaleFactor: 1 });
      const result = await page._client().send("Runtime.evaluate", {
        expression: `JSON.stringify({youtube:document.body.textContent.includes('YouTube'),sample:document.body.textContent.includes('Use demo sample'),cards:document.querySelectorAll('.source-card').length,overflow:document.documentElement.scrollWidth>innerWidth})`,
        returnByValue: true,
      });
      expect(JSON.parse(result.value.result.value)).toEqual({
        youtube: false,
        sample: false,
        cards: 1,
        overflow: false,
      });
      const shot = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        resolve(".local-build/evidence/cl061-upload-" + width + ".png"),
        Buffer.from(shot.value.data, "base64"),
      );
    }
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    const encoded = (await readFile(source)).toString("base64");
    await page._client().send("Runtime.evaluate", {
      expression: `globalThis.hostedRun=async()=>{
      const wait=globalThis.hostedWait,button=text=>[...document.querySelectorAll('button')].find(n=>n.textContent.trim()===text);
      const originalFetch=window.fetch;
      globalThis.loadingStage='upload';globalThis.loadingRelease=false;
      window.fetch=async(input,init)=>{
        const path=new URL(String(input),location.href).pathname;
        const stage=init?.method==='PUT'?'upload':path.endsWith('/open/video')?'opening':path.endsWith('/analysis')?(init?.method==='POST'?'analysis':'restoring'):null;
        if(stage&&stage===globalThis.loadingStage){await wait(()=>globalThis.loadingRelease,'release_'+stage);globalThis.loadingRelease=false;globalThis.loadingStage=stage==='upload'?'opening':stage==='opening'?'restoring':stage==='restoring'?'analysis':null;}
        return originalFetch(input,init);
      };
      const input=document.querySelector('.upload-card input');const transfer=new DataTransfer();transfer.items.add(new File([Uint8Array.from(atob(${JSON.stringify(encoded)}),c=>c.charCodeAt(0))],'synthetic.mp4',{type:'video/mp4'}));input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));
      await wait(()=>button('Add clip')&&!button('Add clip').matches(':disabled'),'uploaded');button('Add clip').click();await wait(()=>document.querySelector('[aria-label="Clip 1 end"]'),'manual_row');
      const change=async(node,value)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(node,value);node.dispatchEvent(new Event('input',{bubbles:true}));await new Promise(requestAnimationFrame);};
      await change(document.querySelector('[aria-label="Clip 1 start"]'),'00:00:01');await change(document.querySelector('[aria-label="Clip 1 end"]'),'00:00:02');
      const ai=document.querySelector('.selection input[type="checkbox"]');if(ai.checked)ai.click();await wait(()=>button('Use clips')&&!button('Use clips').disabled);button('Use clips').click();await wait(()=>button('Process clips')&&!button('Process clips').disabled);
      const add=document.querySelector('.moment-tabs [role="tab"]');add.click();await new Promise(requestAnimationFrame);
      if(document.querySelector('[aria-label="Clip 1 start"]').value!=='00:00:01'||document.querySelector('[aria-label="Clip 1 end"]').value!=='00:00:02')throw new Error('loading_lost_manual_input');
      add.focus();add.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));await new Promise(requestAnimationFrame);
      if(document.activeElement.textContent.trim()!=='Your clips'||document.activeElement.getAttribute('aria-selected')!=='true')throw new Error('loading_broke_keyboard_tabs');
      button('Process clips').click();
      await wait(()=>document.querySelector('a[aria-label="Download clip"]')&&document.querySelector('.editor-panels:not([hidden])'));
      if(document.querySelector('.moment-selection').getClientRects().length || document.querySelectorAll('.clip-editor').length!==1)throw new Error('hosted_editor_not_exclusive');
      const font=[...document.querySelectorAll('.clip-editor label')].find(n=>n.firstChild?.textContent.trim().startsWith('Font size')).querySelector('input');await change(font,'72');await wait(()=>button('Apply changes'));button('Apply changes').click();await wait(()=>button('Export clip'));button('Export clip').click();
      const download=await wait(()=>document.querySelector('a[aria-label="Download clip"]')&&document.querySelector('.editor-panels:not([hidden])')&&document.querySelector('a[aria-label="Download clip"]'));const response=await fetch(download.href);if(!response.ok)throw new Error('hosted_download_failed');return (await response.arrayBuffer()).byteLength;
    };`,
    });
    const run = page.evaluate(() =>
      (
        globalThis as unknown as { hostedRun: () => Promise<number> }
      ).hostedRun(),
    );
    await captureLoading("Uploading video", "upload", true);
    await evaluate("globalThis.loadingRelease=true");
    await captureLoading("Opening video", "opening");
    await evaluate("globalThis.loadingRelease=true");
    await captureLoading("Loading moments", "restoring");
    await evaluate("globalThis.loadingRelease=true");
    await captureLoading("Preparing moments", "analysis");
    await evaluate("globalThis.loadingRelease=true");
    const size = await run;
    expect(size).toBeGreaterThan(1000);
    for (const width of [1440, 390]) {
      await page.setViewport({ width, height: 1000, deviceScaleFactor: 1 });
      const shot = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        resolve(".local-build/evidence/cl061-editor-" + width + ".png"),
        Buffer.from(shot.value.data, "base64"),
      );
    }
    expect(transcribe).toHaveBeenCalledTimes(1);
    expect(plan).toHaveBeenCalledTimes(1);
    expect(image).toHaveBeenCalledTimes(1);
    expect(media.mock.calls.map(([job]) => job.operation)).toEqual([
      "inspect",
      "clip",
      "clip",
    ]);
    // Retain real synthetic prepared data and exercise response-driven readiness states.
    // These overrides never call a provider or mutate a saved workspace.
    await evaluate(`globalThis.loadingClipState='queued';
      const fetchBeforeStates=window.fetch;
      window.fetch=async(input,init)=>{
        const response=await fetchBeforeStates(input,init),path=new URL(String(input),location.href).pathname;
        if((init?.method??'GET')==='GET'&&path.endsWith('/clips')&&response.ok){
          const list=await response.json();
          list.clips[0].state=globalThis.loadingClipState;
          list.clips[0].error=globalThis.loadingClipState==='failed'?'local_clip_failed':null;
          list.active=['queued','preparing','rendering','canceling'].includes(globalThis.loadingClipState);
          return Response.json(list);
        }return response;
      };`);
    for (const [state, label] of [
      ["queued", "Queued"],
      ["preparing", "Preparing clip"],
      ["rendering", "Exporting clip"],
      ["canceling", "Canceling"],
    ]) {
      await evaluate(`globalThis.loadingClipState=${JSON.stringify(state)}`);
      await captureLoading(label!, state!);
      expect(
        await evaluate(
          "!!document.querySelector('.clip-editor') || !!document.querySelector('a[aria-label=\"Download clip\"]')",
        ),
      ).toBe(false);
    }
    for (const state of ["failed", "canceled"]) {
      await evaluate(
        `globalThis.loadingClipState=${JSON.stringify(state)};globalThis.hostedWait(()=>document.querySelector('.clip-state')?.textContent.trim()===${JSON.stringify(state)}).then(()=>true)`,
      );
      expect(
        await evaluate(
          "[...document.querySelectorAll('button')].some(n=>n.textContent.trim()==='Retry clip') && !document.querySelector('.clip-editor') && !document.querySelector('.clip-preparing')",
        ),
      ).toBe(true);
      for (const [width, height] of [
        [1440, 900],
        [390, 844],
        [320, 568],
      ]) {
        await page.setViewport({
          width: width!,
          height: height!,
          deviceScaleFactor: 1,
        });
        expect(
          await evaluate(
            `(()=>{const retry=[...document.querySelectorAll('button')].find(n=>n.textContent.trim()==='Retry clip'),r=retry.getBoundingClientRect();return document.documentElement.scrollWidth<=innerWidth&&r.top>=0&&r.bottom<=innerHeight+1&&document.querySelector('#sample-main > footer').contains(retry);})()`,
          ),
        ).toBe(true);
        const shot = await page
          ._client()
          .send("Page.captureScreenshot", { format: "png", fromSurface: true });
        await writeFile(
          resolve(`.local-build/evidence/cl062-${state}-${width}.png`),
          Buffer.from(shot.value.data, "base64"),
        );
      }
      await page.setViewport({
        width: 1440,
        height: 1000,
        deviceScaleFactor: 1,
      });
    }
    await evaluate(
      `globalThis.holdLoadingPreview=event=>event.stopImmediatePropagation();document.addEventListener('loadeddata',globalThis.holdLoadingPreview,true);globalThis.loadingClipState='ready';`,
    );
    await captureLoading("Loading preview", "preview");
    expect(
      await evaluate(
        "!!document.querySelector('.editor-panels:not([hidden])')",
      ),
    ).toBe(false);
    await evaluate(
      `document.removeEventListener('loadeddata',globalThis.holdLoadingPreview,true);document.querySelector('.editor-preview video').dispatchEvent(new Event('loadeddata'));globalThis.hostedWait(()=>document.querySelector('.editor-panels:not([hidden])')).then(()=>true)`,
    );
    await page._client().send("Runtime.evaluate", {
      expression: `fetch('/api/local/session',{method:'DELETE'}).then(response=>{if(response.status!==204)throw new Error('hosted_exit_failed');})`,
      awaitPromise: true,
    });
  } finally {
    releaseConnection();
    await browser.close({ silent: true });
    await flow.close();
    await worker.close();
    await new Promise<void>((done) => server.close(() => done()));
    expect(await readdir(root)).toEqual([]);
    await rm(directory, { recursive: true, force: true });
  }
}, 200_000);
