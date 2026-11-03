import { expect, it } from "vitest";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import {
  mkdtemp,
  readFile,
  rm,
  writeFile,
  mkdir,
  realpath,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, relative, isAbsolute } from "node:path";
import { build, stop } from "esbuild";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { listenOwner } from "./owner-http.ts";

declare module "../apps/renderer/node_modules/@remotion/renderer/dist/browser/devtools-commands.js" {
  interface Commands {
    "Network.setUserAgentOverride": {
      paramsType: [{ userAgent: string }];
      returnType: Record<string, never>;
    };
  }
}
declare global {
  function timestampProof(action: string): Promise<boolean>;
}

async function clearTimestampScratch(root: string) {
  const rel = relative(await realpath(tmpdir()), await realpath(root));
  if (!rel || rel.startsWith("..") || isAbsolute(rel))
    throw Error("proof_cleanup_invalid");
  await rm(root, { recursive: true, force: true });
}

it("exports all retained pages and imports only manual rows on local desktop, excluding phone Android and hosted", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-timestamp-browser-"));
  const workspace = {
    id: randomUUID(),
    mode: "synthetic-ai",
    revision: 0,
    source: {
      fingerprint: "a".repeat(64),
      bytes: 100,
      durationMs: 120000,
      width: 320,
      height: 180,
      fps: 30,
      origin: { startMs: 100000, durationMs: 220000 },
    },
  };
  const analysis = {
    id: randomUUID(),
    inputs: {
      sourceRevision: 0,
      policyRevision: 1,
      ranges: [],
      aiDuration: { minMs: 10000, maxMs: 10000 },
      manualOnly: false,
      aiCount: 40,
    },
    mode: "synthetic-ai",
    words: [],
    manual: [],
    suggestions: Array.from({ length: 25 }, (_, i) => ({
      id: randomUUID(),
      processingIdentity: i.toString(16).padStart(64, "0"),
      cut: { startFrame: i * 90, endFrame: i * 90 + 60 },
      rangeIds: [],
      evidence: null,
      cues: [],
    })),
    calls: { transcription: 0, selection: 0 },
  };
  let unexpected = 0;
  const server = createServer((req, res) => {
    void (async () => {
      if (req.method !== "GET") {
        unexpected++;
        res.writeHead(405).end();
        return;
      }
      const file = req.url?.endsWith("app.js")
        ? "app.js"
        : req.url?.endsWith("app.css")
          ? "app.css"
          : "index.html";
      res
        .writeHead(200, {
          "Content-Type": file.endsWith(".js")
            ? "text/javascript"
            : file.endsWith(".css")
              ? "text/css"
              : "text/html",
        })
        .end(await readFile(join(root, file)));
    })().catch(() => {
      unexpected++;
      res.writeHead(500).end();
    });
  });
  let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
  try {
    await build({
      stdin: {
        resolveDir: resolve("."),
        loader: "tsx",
        contents: `
      import React,{useState,useCallback} from 'react';import{createRoot}from'react-dom/client';
      import{OwnerSelectionPanel}from'./apps/frontend/src/features/local-editing/selection-panel.tsx';
      import{Workspace}from'./apps/frontend/src/shared/ui/workspace.tsx';
      import './apps/frontend/src/styles/tokens.css';import './apps/frontend/src/features/local-editing/style.css';
      const workspace=${JSON.stringify(workspace)},analysis=${JSON.stringify(analysis)};
      window.timestampPosts=0;window.timestampReads=0;window.timestampCapture=null;
      window.fetch=async(url,options)=>{if(options?.method&&options.method!=='GET'){window.timestampPosts++;throw Error('unexpected_processing');}window.timestampReads++;return new Response(JSON.stringify(analysis),{status:200,headers:{'Content-Type':'application/json'}});};
      const noop=()=>{};const hosted=location.pathname==='/hosted';
      const caps=hosted?{execution:'hosted',aiMode:'synthetic-ai',sourceMode:null,planningAvailable:true,localMedia:false,cloud:true}:{aiMode:'synthetic-ai',sourceMode:null,planningAvailable:true,localMedia:true,cloud:false,capacity:{manyClips:true}};
      function App(){const[busy,setBusy]=useState(false),[ready,setReady]=useState(false);window.timestampReady=setReady;const onBusy=useCallback(value=>setBusy(value),[]);return <Workspace localMode={!hosted}><div className="local-editing"><OwnerSelectionPanel workspace={workspace} capabilities={caps} busy={busy} onBusy={onBusy} onChoose={noop} previewReady={ready} onCaptureTime={()=>window.timestampCapture} onJumpTo={noop} onResultsViewChange={noop}/></div></Workspace>;}
      createRoot(document.getElementById('root')).render(<App/>);
    `,
      },
      nodePaths: [resolve("apps/frontend/node_modules")],
      bundle: true,
      platform: "browser",
      format: "esm",
      jsx: "automatic",
      outfile: join(root, "app.js"),
    });
    await stop();
    await writeFile(
      join(root, "index.html"),
      '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"></head><body style="background:#0a2454;padding:24px"><div id="root"></div><script type="module" src="/app.js"></script></body></html>',
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
    const driver = `globalThis.timestampProof=async action=>{
      const wait=async(fn,label)=>{for(let i=0;i<200;i++){if(fn())return;await new Promise(r=>setTimeout(r,25));}throw Error('timestamp_timeout_'+label);};
      const button=text=>[...document.querySelectorAll('button')].find(n=>n.textContent.trim()===text);
      if(action==='capture'){
        const named=name=>document.querySelector('[aria-label="'+name+'"]');
        const set=async(name,value)=>{const n=named(name);Object.getOwnPropertyDescriptor(n.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype,'value').set.call(n,value);n.dispatchEvent(new Event(n.tagName==='SELECT'?'change':'input',{bubbles:true}));await new Promise(requestAnimationFrame);};
        button('Add clips').click();await wait(()=>named('Analysis range'),'analysis_range');await set('Analysis range','range');
        await wait(()=>named('Capture analysis start')&&named('Capture analysis end'),'capture_buttons');
        if(!named('Capture analysis start').disabled||!named('Capture analysis end').disabled)throw Error('unready_analysis_capture');
        window.timestampReady(true);await wait(()=>!named('Capture analysis start').disabled,'capture_ready');
        await set('Analysis end','00:03:39.567');const preciseEnd=named('Analysis end').value;
        window.timestampCapture='00:02:10';named('Capture analysis start').click();await wait(()=>named('Analysis start').value==='00:02:10','capture_original_offset');
        if(named('Analysis end').value!==preciseEnd)throw Error('capture_lost_other_precision');
        window.timestampCapture='00:02:09';named('Capture analysis end').click();await new Promise(requestAnimationFrame);
        if(named('Analysis end').value!==preciseEnd)throw Error('capture_bad_order');
        window.timestampCapture='00:02:20';named('Capture analysis end').click();await wait(()=>named('Analysis end').value==='00:02:20','capture_end');
        window.timestampCapture='00:04:10';named('Capture analysis end').click();await new Promise(requestAnimationFrame);
        if(named('Analysis end').value!=='00:02:20')throw Error('capture_outside_source');
        window.timestampCapture=null;named('Capture analysis start').click();await new Promise(requestAnimationFrame);
        if(named('Analysis start').value!=='00:02:10'||!document.body.textContent.includes('Wait for the source preview'))throw Error('capture_null');
        window.timestampReady(false);await wait(()=>named('Capture analysis start').disabled,'capture_unready');
        for(const edge of ['start','end']){const input=named('Analysis '+edge),cta=named('Capture analysis '+edge);if(!input.closest('.range-time').contains(cta))throw Error('analysis_capture_placement');}
        if(window.timestampPosts!==0||document.documentElement.scrollWidth>innerWidth)throw Error('analysis_capture_side_effect');
        named('Analysis range').scrollIntoView({block:'start'});return true;
      }
      await wait(()=>button('Your clips')&&!button('Your clips').disabled,'restored');
      if(action==='hidden'){if(button('Export Timestamps')||button('Import JSON'))throw Error('exchange_exposed');return true;}
      await wait(()=>button('Export Timestamps'),'export');
      const heading=button('Export Timestamps').closest('.moment-section-heading');
      if(heading.querySelector('h3').getBoundingClientRect().left>=button('Export Timestamps').getBoundingClientRect().left)throw Error('export_placement');
      if(action==='layout')return true;
      let blob;const originalURL=URL.createObjectURL.bind(URL);URL.createObjectURL=value=>{blob=value;return originalURL(value);};
      const click=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(this.download!=='clipbuilder-timestamps.json')click.call(this);};
      button('Export Timestamps').click();await wait(()=>blob,'file');const documentData=JSON.parse(await blob.text());
      if(documentData.clips.length!==25)throw Error('incomplete_paged_export');
      button('Add clips').click();await wait(()=>button('Import JSON'),'import');
      const input=document.querySelector('input[aria-label="Import timestamps JSON"]');
      const importText=async text=>{const transfer=new DataTransfer();transfer.items.add(new File([text],'synthetic-timestamps.json',{type:'application/json'}));input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));await wait(()=>!button('Import JSON').disabled,'read_done');await new Promise(r=>setTimeout(r,30));};
      await importText(JSON.stringify(documentData));
      if(!document.querySelector('.flow-notice').textContent.includes('at most 10'))throw Error('missing_count_error');
      documentData.clips=documentData.clips.slice(0,9);await importText(JSON.stringify(documentData));
      await wait(()=>document.querySelectorAll('.range-row').length===9,'rows');
      const before=document.querySelector('input[aria-label="Clip 1 start"]').value;
      if([...document.querySelectorAll('label.check')].find(n=>n.textContent.includes('Suggest clips')).querySelector('input').checked)throw Error('auto_ai_enabled');
      await importText('{"version":0}');if(document.querySelector('input[aria-label="Clip 1 start"]').value!==before||document.querySelectorAll('.range-row').length!==9)throw Error('failed_import_changed_rows');
      if(window.timestampPosts!==0)throw Error('import_started_processing');
      const add=button('Add clip').getBoundingClientRect(),imp=button('Import JSON').getBoundingClientRect();if(imp.left<add.right||Math.abs(imp.top-add.top)>2)throw Error('import_placement');
      return true;
    };`;
    for (const scenario of [
      {
        path: "/",
        width: 1440,
        ua: "Mozilla/5.0 Windows Chrome/140.0",
        action: "roundtrip",
      },
      { path: "/", width: 390, ua: "Mozilla/5.0 iPhone", action: "hidden" },
      {
        path: "/",
        width: 1440,
        ua: "Mozilla/5.0 Linux Android Chrome/140.0",
        action: "hidden",
      },
      {
        path: "/hosted",
        width: 1440,
        ua: "Mozilla/5.0 Windows Chrome/140.0",
        action: "hidden",
      },
    ]) {
      await page.setViewport({
        width: scenario.width,
        height: 900,
        deviceScaleFactor: 1,
      });
      await page
        ._client()
        .send("Network.setUserAgentOverride", { userAgent: scenario.ua });
      await page.goto({
        url: `http://localhost:${port}${scenario.path}`,
        timeout: 10000,
      });
      await page._client().send("Runtime.evaluate", { expression: driver });
      if (scenario.action === "roundtrip") {
        await page.evaluate(() => globalThis.timestampProof("layout"));
        await mkdir(resolve(".local-build/evidence"), { recursive: true });
        const shot = await page
          ._client()
          .send("Page.captureScreenshot", { format: "png", fromSurface: true });
        await writeFile(
          resolve(".local-build/evidence/cl200-suggestions.png"),
          Buffer.from(shot.value.data, "base64"),
        );
      }
      expect(
        await page.evaluate(
          (action) => globalThis.timestampProof(action),
          scenario.action,
        ),
      ).toBe(true);
      if (scenario.action === "roundtrip") {
        await page._client().send("Runtime.evaluate", {
          expression:
            'document.querySelector(".manual-clip-actions")?.scrollIntoView({ block: "center" })',
        });
        await mkdir(resolve(".local-build/evidence"), { recursive: true });
        const shot = await page
          ._client()
          .send("Page.captureScreenshot", { format: "png", fromSurface: true });
        await writeFile(
          resolve(".local-build/evidence/cl200-desktop.png"),
          Buffer.from(shot.value.data, "base64"),
        );
      }
      expect(
        await page.evaluate(() => globalThis.timestampProof("capture")),
      ).toBe(true);
      if (scenario.ua.includes("Windows") && scenario.path === "/") {
        const captureShot = await page
          ._client()
          .send("Page.captureScreenshot", { format: "png", fromSurface: true });
        await writeFile(
          resolve(".local-build/evidence/cl207-analysis.png"),
          Buffer.from(captureShot.value.data, "base64"),
        );
      }
    }
    expect(unexpected).toBe(0);
  } finally {
    await stop();
    await browser?.close({ silent: true });
    server.closeAllConnections();
    if (server.listening)
      await new Promise<void>((done) => server.close(() => done()));
    await clearTimestampScratch(root);
  }
}, 60000);
