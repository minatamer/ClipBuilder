import { expect, it, vi } from "vitest";
import { demoUsageFixture } from "./demo-usage-fixture.ts";
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
  const captionTranscription = vi.fn(async (_workspace, clip) => {
    if (captionTranscription.mock.calls.length === 1)
      throw new Error("synthetic_caption_failure");
    expect(clip.base!.cut).toEqual({ startFrame: 30, endFrame: 60 });
    return fakeOwnerAnalysis.transcribe(
      { ..._workspace, source: { ..._workspace.source, durationMs: 1000 } },
      new AbortController().signal,
    );
  }) as import("vitest").Mock<
    import("../apps/backend/local/clip-caption-port.ts").ClipCaptionTranscription
  >;
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
        req.headers["x-clipbuilder-client-ip"] = "192.0.2.1";
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
    usage: demoUsageFixture().usage,
    root,
    origin,
    ttlMs: 120_000,
    siteKey: "synthetic-site-key",
    aiMode: "synthetic-ai",
    captionGeneration: true,
    sourceLimits: { bytes: 10 * 1024 ** 2, durationMs: 60000 },
    abuse: { verify: async () => true },
    capacity: async () => {},
    media,
    providers: () => ({
      analysis: { ...fakeOwnerAnalysis, transcribe },
      captionTranscription,
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
    for (const [width, height] of [
      [1440, 1000],
      [1366, 600],
      [1024, 768],
      [768, 1024],
      [390, 844],
      [320, 568],
    ] as const) {
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
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
      expression: `globalThis.hostedRunSteps=async()=>{
      const wait=globalThis.hostedWait;const longWait=wait;const button=text=>[...document.querySelectorAll('button')].find(n=>n.textContent.trim()===text);
      const originalFetch=window.fetch;
      globalThis.loadingStage='upload';globalThis.loadingRelease=false;
      window.fetch=async(input,init)=>{
        const path=new URL(String(input),location.href).pathname;const workspaceMatch=path.match(new RegExp("/workspace/([a-f0-9-]{36})"));if(workspaceMatch)globalThis.pictureWorkspace=workspaceMatch[1];
        const stage=init?.method==='PUT'?'upload':path.endsWith('/open/video')?'opening':path.endsWith('/analysis')?(init?.method==='POST'?'analysis':'restoring'):null;
        if(stage&&stage===globalThis.loadingStage){await longWait(()=>globalThis.loadingRelease,'release_'+stage);globalThis.loadingRelease=false;globalThis.loadingStage=stage==='upload'?'opening':stage==='opening'?'restoring':stage==='restoring'?'analysis':null;}
        if(path.endsWith('/edit')&&init?.method==='POST'&&globalThis.holdPictureSave)await longWait(()=>globalThis.releasePictureSave,'picture_save_release');
        const response=await originalFetch(input,init);
        if(path.endsWith('/edit')&&response.ok)globalThis.pictureSavedList=await response.clone().json();if(path.endsWith('/picture')&&response.ok)globalThis.alphaAssetList=await response.clone().json();
        return response;
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
      await wait(()=>button('Export clip')&&document.querySelector('.editor-panels:not([hidden])'));
      const prepared=await (await fetch('/api/local/workspace/'+globalThis.pictureWorkspace+'/clips')).json();if(prepared.clips[0].outputs.length||!prepared.clips[0].preview||prepared.clips[0].calls.render)throw new Error('unexpected_eager_export');if(prepared.clips[0].base.overlay.texts?.length)throw new Error('unexpected_automatic_text');
      if(document.querySelector('.moment-selection').getClientRects().length || document.querySelectorAll('.clip-editor').length!==1)throw new Error('hosted_editor_not_exclusive');
      const captionPause=async stage=>{globalThis.captionStage=stage;globalThis.captionStageReleased=false;await wait(()=>globalThis.captionStageReleased,'caption_'+stage);globalThis.captionStage=null;};
      if(button('Generate fake captions')||!document.querySelector('.caption-empty')||document.querySelectorAll('.picture-choice').length||document.querySelector('[aria-label="Select and move captions"]'))throw new Error('fake_content_not_empty');
      await captionPause('empty');button('Generate captions').click();await wait(()=>document.querySelector('[aria-label="Caption generation actions"]'));await captionPause('confirm');if(!document.querySelector('.caption-empty').textContent.includes('Gemini credits'))throw new Error('caption_paid_consent_missing');button('Cancel').click();await wait(()=>!document.querySelector('[aria-label="Caption generation actions"]'));
      button('Generate captions').click();await wait(()=>document.querySelector('[aria-label="Caption generation actions"]'));[...document.querySelectorAll('[aria-label="Caption generation actions"] button')].find(n=>n.textContent==='Generate captions').click();await wait(()=>document.querySelector('.clip-editor .flow-notice').textContent.includes('generate captions.'));await new Promise(done=>setTimeout(done,200));
      [...document.querySelectorAll('[aria-label="Caption generation actions"] button')].find(n=>n.textContent==='Generate captions').click();await wait(()=>document.querySelector('[aria-label="Caption 1 word 1"]'));
      globalThis.pictureCaptionBase=(await (await fetch('/api/local/workspace/'+globalThis.pictureWorkspace+'/clips')).json());if(globalThis.pictureCaptionBase.clips[0].base.overlay.captionStyle?.preset!=='tiktok')throw new Error('caption_default_not_tiktok');
      const font=[...document.querySelectorAll('.clip-editor label')].find(n=>n.firstChild?.textContent.trim().startsWith('Font size')).querySelector('input');await change(font,'72');
      const named=label=>document.querySelector('[aria-label="'+label+'"]');
      [...document.querySelectorAll('[aria-label="Caption controls"] button')].find(n=>n.textContent==='Text').click();await new Promise(requestAnimationFrame);const first=named('Caption 1 word 1');const originalWord=first.value;await change(first,'Martian');button('Discard changes').click();await wait(()=>named('Caption 1 word 1')?.value===originalWord);await change(named('Caption 1 word 1'),'Martian');await captionPause('text');
      const canvas=document.createElement('canvas');canvas.width=100;canvas.height=100;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,100,100);ctx.fillStyle='rgba(255,255,255,0.5)';ctx.fillRect(25,0,25,100);ctx.fillStyle='#fff';ctx.fillRect(50,0,25,100);const blob=await new Promise(done=>canvas.toBlob(done,'image/png'));const transferPicture=new DataTransfer();transferPicture.items.add(new File([blob],'synthetic-picture.png',{type:'image/png'}));[...document.querySelectorAll('[aria-label="Clip settings"] button')].find(n=>n.textContent==='Media').click();await new Promise(requestAnimationFrame);const pictureInput=named('Upload picture');pictureInput.files=transferPicture.files;pictureInput.dispatchEvent(new Event('change',{bubbles:true}));await wait(()=>document.querySelector('.picture-choice')&&!button('Uploading…'));const assetResponse=await fetch('/api/local/workspace/'+globalThis.pictureWorkspace+'/assets/'+globalThis.alphaAssetList.pictureAssetId);if(assetResponse.headers.get('content-type')!=='image/png')throw new Error('transparent_asset_mime');const bitmap=await createImageBitmap(await assetResponse.blob());const check=document.createElement('canvas');check.width=100;check.height=100;const checkContext=check.getContext('2d');checkContext.drawImage(bitmap,0,0);bitmap.close();if(checkContext.getImageData(10,40,1,1).data[3]!==0||checkContext.getImageData(40,40,1,1).data[3]!==128||checkContext.getImageData(60,40,1,1).data[3]!==255)throw new Error('browser_transparency_lost');[...document.querySelectorAll('[aria-label="Picture controls"] button')].find(n=>n.textContent==='Motion').click();await new Promise(requestAnimationFrame);for(const label of ['Entrance','Exit']){const select=[...document.querySelectorAll('.clip-editor label')].find(n=>n.firstChild?.textContent.trim()===label).querySelector('select');Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(select,'none');select.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(requestAnimationFrame);}[...document.querySelectorAll('[aria-label="Picture controls"] button')].find(n=>n.textContent==='Position').click();await new Promise(requestAnimationFrame);[...document.querySelectorAll('[aria-label="Picture position"] button')].find(n=>n.textContent==='Center').click();await new Promise(requestAnimationFrame);

      const pictureWait=async(fn,phase)=>{for(let i=0;i<200;i++){const value=fn();if(value)return value;await new Promise(done=>setTimeout(done,20));}const v=document.querySelector('.editor-preview video');throw new Error('picture_timeout_'+phase+'_'+globalThis.picturePhase+'_'+JSON.stringify({time:v?.currentTime,ready:v?.readyState,seeking:v?.seeking,disabled:named('Capture picture start')?.disabled,start:named('Picture start seconds')?.value,end:named('Picture end seconds')?.value}));};
      const settings=async label=>{[...document.querySelectorAll('[aria-label="Clip settings"] [role="tab"]')].find(n=>n.textContent===label).click();await new Promise(requestAnimationFrame);};
      const timing=async(index=0)=>{await settings('Media');document.querySelectorAll('.picture-choice')[index].click();await new Promise(requestAnimationFrame);[...document.querySelectorAll('[aria-label="Picture controls"] button')].find(n=>n.textContent==='Timing').click();await pictureWait(()=>named('Capture picture start')&&!named('Capture picture start').disabled,'picture_capture_ready');};
      const values=()=>['start','end'].map(key=>Math.round(Number(named('Picture '+key+' seconds').value)*30));
      const seek=async(frame,index=0)=>{globalThis.picturePhase='seek_'+frame;await timing(index);const bar=[...document.querySelectorAll('.editor-preview div')].find(n=>n.style.touchAction==='none'&&n.style.cursor==='pointer'&&n.style.paddingTop);if(!bar)throw new Error('preview_seek_bar_missing');const rect=bar.getBoundingClientRect();bar.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,button:0,buttons:1,pointerId:17,clientX:rect.left+rect.width*frame/29,clientY:rect.top+rect.height/2}));await new Promise(requestAnimationFrame);document.documentElement.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,button:0,pointerId:17}));await pictureWait(()=>{const v=document.querySelector('.editor-preview video');return v&&!v.seeking&&Math.abs(v.currentTime-frame/30)<.035&&!named('Capture picture start').disabled;},'picture_seek');};
      const capture=async(key,frame,index=0)=>{await seek(frame,index);const video=document.querySelector('.editor-preview video');const before=video.currentTime;named('Capture picture '+key).click();await new Promise(requestAnimationFrame);if(!video.paused||Math.abs(video.currentTime-before)>.035)throw new Error('picture_capture_sought_or_not_paused');};
      await capture('start',0);await capture('end',29);await capture('start',29);
      if(JSON.stringify(values())!=='[29,30]')throw new Error('picture_last_frame_boundary');
      await capture('start',6);await capture('end',23);
      if(JSON.stringify(values())!=='[6,24]')throw new Error('picture_capture_not_exact');
      await capture('start',25);if(JSON.stringify(values())!=='[6,24]'||!document.querySelector('.picture-timing').parentElement.querySelector('[role="alert"]'))throw new Error('picture_invalid_start_mutated');
      await capture('end',2);if(JSON.stringify(values())!=='[6,24]')throw new Error('picture_invalid_end_mutated');
      await capture('end',23);
      const video=document.querySelector('.editor-preview video');Object.defineProperty(video,'seeking',{configurable:true,value:true});video.dispatchEvent(new Event('seeking'));await wait(()=>named('Capture picture start').disabled,'picture_seeking_guard');named('Capture picture start').click();if(JSON.stringify(values())!=='[6,24]')throw new Error('picture_seeking_overwrite');delete video.seeking;video.dispatchEvent(new Event('seeked'));await wait(()=>!named('Capture picture start').disabled);
      video.dispatchEvent(new Event('waiting'));await wait(()=>named('Capture picture end').disabled,'picture_buffer_guard');video.dispatchEvent(new Event('canplay'));await wait(()=>!named('Capture picture end').disabled);
      button('Add picture').click();await new Promise(requestAnimationFrame);await capture('start',20,1);if(JSON.stringify(values())!=='[20,30]')throw new Error('second_picture_capture');await timing();if(JSON.stringify(values())!=='[6,24]')throw new Error('capture_changed_other_picture');await timing(1);[...document.querySelectorAll('[aria-label="Picture controls"] button')].find(n=>n.textContent==='Image').click();await new Promise(requestAnimationFrame);button('Remove picture').click();await timing();
      document.querySelector('.editor-preview video').dispatchEvent(new Event('error'));await pictureWait(()=>named('Retry preview'),'picture_failed_preview');if(!named('Capture picture start').disabled||!named('Capture picture end').disabled)throw new Error('picture_failed_capture_enabled');named('Retry preview').click();await timing();if(JSON.stringify(values())!=='[6,24]')throw new Error('picture_retry_lost_timing');
      globalThis.pictureCaptureReady=true;await longWait(()=>globalThis.pictureCaptureRelease,'picture_layout_release');
      await wait(()=>button('Apply changes'));globalThis.holdPictureSave=true;button('Apply changes').click();await pictureWait(()=>named('Capture picture start').matches(':disabled')&&named('Capture picture end').matches(':disabled'),'picture_busy_guard');globalThis.releasePictureSave=true;globalThis.picturePhase='apply_ack';await wait(()=>button('Export clip')&&!button('Export clip').disabled&&!button('Apply changes'));
      const saved=globalThis.pictureSavedList.clips[0].edit.visuals[0];if(saved.startFrame!==6||saved.endFrame!==24)throw new Error('picture_capture_not_saved');
      globalThis.picturePhase='download_wait';button('Export clip').click();
      const download=await wait(()=>document.querySelector('a[aria-label="Download clip"]')&&document.querySelector('.editor-panels:not([hidden])')&&document.querySelector('a[aria-label="Download clip"]'));const response=await fetch(download.href);if(!response.ok)throw new Error('hosted_download_failed');return [...new Uint8Array(await response.arrayBuffer())];
    };globalThis.hostedRun=()=>globalThis.hostedRunSteps().catch(error=>{globalThis.pictureCaptureError=String(error);throw error;});`,
    });
    const run = page.evaluate(() =>
      (
        globalThis as unknown as { hostedRun: () => Promise<number[]> }
      ).hostedRun(),
    );
    void run.catch(() => {});
    await captureLoading("Uploading video", "upload", true);
    await evaluate("globalThis.loadingRelease=true");
    await captureLoading("Opening video", "opening");
    await evaluate("globalThis.loadingRelease=true");
    await captureLoading("Loading moments", "restoring");
    await evaluate("globalThis.loadingRelease=true");
    await captureLoading("Preparing moments", "analysis");
    await evaluate("globalThis.loadingRelease=true");
    for (const stage of ["empty", "confirm", "text"]) {
      await evaluate(
        `globalThis.hostedWait(()=>{if(globalThis.pictureCaptureError)throw new Error(globalThis.pictureCaptureError);return globalThis.captionStage===${JSON.stringify(stage)};},'caption_stage').then(()=>true)`,
      );
      expect(
        media.mock.calls.filter(([job]) => job.operation === "clip"),
      ).toHaveLength(0);
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
            `(async()=>{const panel=document.querySelector('[id$="-captions-panel"]');panel.scrollIntoView({block:'center'});await new Promise(requestAnimationFrame);const footer=document.querySelector('#sample-main > footer').getBoundingClientRect();return document.documentElement.scrollWidth<=innerWidth&&footer.top>=0&&footer.bottom<=innerHeight+1&&[...panel.querySelectorAll('button,input')].filter(n=>n.getClientRects().length).every(n=>n.getBoundingClientRect().height>=44);})()`,
          ),
        ).toBe(true);
        const shot = await page
          ._client()
          .send("Page.captureScreenshot", { format: "png", fromSurface: true });
        await writeFile(
          resolve(`.local-build/evidence/cl084-${stage}-${width}.png`),
          Buffer.from(shot.value.data, "base64"),
        );
      }
      await page.setViewport({
        width: 1440,
        height: 1000,
        deviceScaleFactor: 1,
      });
      await evaluate("globalThis.captionStageReleased=true");
    }
    await evaluate(
      "globalThis.hostedWait(()=>{if(globalThis.pictureCaptureError)throw new Error(globalThis.picturePhase+'_'+globalThis.pictureCaptureError);return globalThis.pictureCaptureReady;},'picture_capture_layout').then(()=>true)",
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
      const geometry = await evaluate(
        `(async()=>{const panel=document.querySelector('.picture-timing');panel.scrollIntoView({block:'center'});await new Promise(requestAnimationFrame);const footer=document.querySelector('#sample-main > footer').getBoundingClientRect(),buttons=[...panel.querySelectorAll('button')];return document.documentElement.scrollWidth<=innerWidth&&buttons.length===2&&buttons.every(n=>{const r=n.getBoundingClientRect();return r.width>=44&&r.height>=44&&r.bottom<=footer.top+1;})&&footer.top>=0&&footer.bottom<=innerHeight+1;})()`,
      );
      expect(geometry).toBe(true);
      const shot = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        resolve(`.local-build/evidence/cl077-timing-${width}.png`),
        Buffer.from(shot.value.data, "base64"),
      );
    }
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await evaluate("globalThis.pictureCaptureRelease=true");
    let completionTimer: ReturnType<typeof setTimeout> | undefined;
    let finalBytes: number[];
    try {
      finalBytes = await Promise.race([
        run,
        new Promise<never>((_resolve, reject) => {
          completionTimer = setTimeout(() => {
            void evaluate(
              "({phase:globalThis.picturePhase,error:globalThis.pictureCaptureError,states:[...document.querySelectorAll('.clip-state')].map(n=>n.textContent),buttons:[...document.querySelectorAll('footer button')].map(n=>({text:n.textContent,disabled:n.disabled})),notices:[...document.querySelectorAll('.flow-notice')].map(n=>n.textContent)})",
            ).then(
              (value) =>
                reject(
                  new Error(
                    "export_completion_" +
                      JSON.stringify({
                        value,
                        operations: media.mock.calls.map(
                          ([job]) => job.operation,
                        ),
                      }),
                  ),
                ),
              reject,
            );
          }, 30_000);
        }),
      ]);
    } finally {
      clearTimeout(completionTimer);
    }
    const bytes = Buffer.from(finalBytes);
    expect(bytes.length).toBeGreaterThan(1000);
    const output = join(directory, "captured-picture.mp4");
    await writeFile(output, bytes);
    const luma = await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-i",
        output,
        "-vf",
        "select='eq(n,5)+eq(n,6)+eq(n,23)+eq(n,24)',crop=8:8:20:48,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-",
        "-an",
        "-f",
        "null",
        "-",
      ],
      signal,
    );
    const samples = [
      ...luma.matchAll(/lavfi\.signalstats\.YAVG=([\d.]+)/g),
    ].map((match) => Number(match[1]));
    expect(samples).toHaveLength(4);
    expect(Math.abs(samples[0]! - samples[3]!)).toBeLessThan(2);
    expect(Math.abs(samples[1]! - samples[0]!)).toBeGreaterThan(5);
    expect(Math.abs(samples[2]! - samples[3]!)).toBeGreaterThan(5);
    const alphaSamples = async (crop: string) => {
      const value = await runOwnedProcess(
        tools.ffmpeg,
        [
          "-nostdin",
          "-v",
          "error",
          "-i",
          output,
          "-vf",
          `select='eq(n,5)+eq(n,10)',${crop},signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-`,
          "-an",
          "-f",
          "null",
          "-",
        ],
        signal,
      );
      return [...value.matchAll(/lavfi\.signalstats\.YAVG=([\d.]+)/g)].map(
        (match) => Number(match[1]),
      );
    };
    const transparent = await alphaSamples("crop=2:2:14:40"),
      partial = await alphaSamples("crop=2:2:21:40"),
      opaque = await alphaSamples("crop=2:2:28:40");
    expect(transparent).toHaveLength(2);
    expect(Math.abs(transparent[1]! - transparent[0]!)).toBeLessThan(5);
    expect(partial[1]).toBeGreaterThan(130);
    expect(partial[1]).toBeLessThan(170);
    expect(opaque[1]).toBeGreaterThan(210);
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
    expect(image).toHaveBeenCalledTimes(0);
    expect(captionTranscription).toHaveBeenCalledTimes(2);
    const finalJob = media.mock.calls
      .filter(([job]) => job.operation === "clip")
      .at(-1)![0];
    if (finalJob.operation !== "clip") throw new Error("missing_clip_job");
    expect(finalJob.overlay.captions[0]!.wordCues[0]!.text).toBe("Martian");
    const originalClocks = await evaluate(
      "globalThis.pictureCaptionBase.clips[0].base.overlay.captions.map(c=>({startMs:c.startMs,endMs:c.endMs,words:c.wordCues.map(({text,...clock})=>clock)}))",
    );
    expect(
      finalJob.overlay.captions.map((c) => ({
        startMs: c.startMs,
        endMs: c.endMs,
        words: c.wordCues.map((word) => ({
          wordId: word.wordId,
          startMs: word.startMs,
          endMs: word.endMs,
        })),
      })),
    ).toEqual(originalClocks);

    expect(media.mock.calls.map(([job]) => job.operation)).toEqual([
      "inspect",
      "clip-preview",
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
        `globalThis.loadingClipState=${JSON.stringify(state)};globalThis.hostedWait(()=>document.querySelector('.clip-state')?.textContent.trim().toLowerCase()===${JSON.stringify(state)}).then(()=>true)`,
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
