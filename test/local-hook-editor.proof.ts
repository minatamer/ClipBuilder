import { expect, it } from "vitest";
import { createServer } from "node:http";
import {
  mkdtemp,
  mkdir,
  readFile,
  realpath,
  writeFile,
  rm,
} from "node:fs/promises";
import { randomUUID, createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, resolve, relative, isAbsolute } from "node:path";
import sharp from "../apps/backend/node_modules/sharp/dist/index.mjs";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { independentHookFixture } from "./owner-hook-fixture.ts";
import { withIndependentOwnerHook } from "../packages/contracts/local/hook-content.ts";
import { applyOwnerEdit } from "../apps/backend/local/edit-clip.ts";
import { prepareLocalControlsFixture } from "./owner-controls-browser.ts";
import { listenOwner } from "./owner-http.ts";

declare global {
  function hookEditorRun(action: string): Promise<void>;
  function hookEditorPointer(): { x: number; y: number };
  function hookEditorScope(): string;
  function hookEditorFocus(): void;
}
it("edits repeated captions/text/pictures/audio separately, captures the correct occurrence, and persists/discards on desktop and phone", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-hook-editor-"));
  let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
  const clip = independentHookFixture(),
    workspace = {
      id: randomUUID(),
      mode: "synthetic-ai",
      revision: 0,
      source: {
        fingerprint: "a".repeat(64),
        bytes: 1000,
        durationMs: 4000,
        width: 640,
        height: 360,
        fps: 30,
      },
    };
  clip.outputs = [
    {
      id: "e".repeat(64),
      revision: 0,
      editRevision: 0,
      frames: 120,
      bytes: 1000,
    },
  ];
  // Late items must remain discoverable before their timestamps, in every picker.
  clip.edit!.visuals.push({
    ...clip.edit!.visuals[0]!,
    id: randomUUID(),
    startFrame: 90,
    endFrame: 120,
  });
  clip.edit!.texts!.push({
    ...clip.edit!.texts![0]!,
    id: randomUUID(),
    text: "Later text",
    startFrame: 90,
    endFrame: 120,
  });
  clip.edit!.audio!.cues.push({
    ...clip.edit!.audio!.cues[0]!,
    id: randomUUID(),
    placement: "clip",
    startFrame: 90,
    endFrame: 120,
  });
  clip.edit = withIndependentOwnerHook(
    clip.base!,
    clip.edit!,
    clip.assets,
    [],
    { startFrame: 30, endFrame: 90 },
  );
  let ui = "",
    bytes = Buffer.alloc(0),
    edits = 0,
    unexpected = 0;
  const picture = await sharp({
    create: { width: 100, height: 100, channels: 3, background: "yellow" },
  })
    .png()
    .toBuffer();
  clip.assets[0] = {
    ...clip.assets[0]!,
    bytes: picture.length,
    digest: createHash("sha256").update(picture).digest("hex"),
  };
  clip.base!.overlay.visuals[0]!.digest = clip.assets[0]!.digest;
  const list = () => ({ clips: [clip], active: false, workers: 1 });
  const server = createServer((req, res) => {
    void (async () => {
      res.setHeader("Content-Type", "application/json");
      if (req.method === "POST" && req.url?.endsWith("/edit")) {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(Buffer.from(chunk));
        const edit = applyOwnerEdit(
          clip,
          JSON.parse(Buffer.concat(chunks).toString()),
          { width: 640, height: 360 },
        );
        Object.assign(clip, {
          edit,
          revision: edit.revision,
          state: "validated-revision",
        });
        edits++;
        res.end(JSON.stringify(list()));
        return;
      }
      if (req.method !== "GET") {
        unexpected++;
        res.writeHead(405).end();
        return;
      }
      if (req.url === "/api/local/capabilities") {
        res.end(
          JSON.stringify({
            aiMode: "synthetic-ai",
            sourceMode: null,
            planningAvailable: true,
            captionGeneration: false,
            localMedia: true,
            cloud: false,
          }),
        );
        return;
      }
      if (req.url === "/api/local/workspace") {
        res.end(JSON.stringify(workspace));
        return;
      }
      if (req.url?.endsWith("/clips")) {
        res.end(JSON.stringify(list()));
        return;
      }
      if (req.url?.endsWith("/analysis")) {
        res.end("null");
        return;
      }
      if (req.url?.includes("/assets/")) {
        res.writeHead(200, { "Content-Type": "image/png" }).end(picture);
        return;
      }
      if (req.url?.endsWith("/source")) {
        const match = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/),
          start = Number(match?.[1] ?? 0),
          end = Math.min(
            Number(match?.[2] || bytes.length - 1),
            bytes.length - 1,
          );
        res
          .writeHead(match ? 206 : 200, {
            "Content-Type": "video/mp4",
            "Accept-Ranges": "bytes",
            "Content-Length": end - start + 1,
            ...(match
              ? { "Content-Range": `bytes ${start}-${end}/${bytes.length}` }
              : {}),
          })
          .end(bytes.subarray(start, end + 1));
        return;
      }
      if (req.url === "/favicon.ico") {
        res.writeHead(204).end();
        return;
      }
      const file =
        req.url === "/"
          ? "index.html"
          : req.url === "/app.js"
            ? "app.js"
            : req.url === "/app.css"
              ? "app.css"
              : null;
      if (!file) {
        unexpected++;
        res.writeHead(404).end();
        return;
      }
      res
        .writeHead(200, {
          "Content-Type": file.endsWith("js")
            ? "text/javascript"
            : file.endsWith("css")
              ? "text/css"
              : "text/html",
        })
        .end(await readFile(join(ui, file)));
    })().catch(() => res.writeHead(500).end());
  });
  try {
    const tools = await ownerNativeTools(resolve(".")),
      source = join(root, "synthetic.mp4");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-f",
        "lavfi",
        "-i",
        "color=teal:s=640x360:r=30:d=4",
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
      AbortSignal.timeout(30000),
    );
    bytes = await readFile(source);
    ui = await prepareLocalControlsFixture(root);
    await writeFile(
      join(ui, "index.html"),
      '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>',
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
    const driver = `globalThis.hookEditorPointer=()=>{const n=[...document.querySelector('[aria-label="Editing occurrence"]').querySelectorAll('button')].find(n=>n.textContent==='Main clip');n.scrollIntoView({block:'center',behavior:'instant'});const r=n.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};};
globalThis.hookEditorScope=()=>document.querySelector('[aria-label="Editing occurrence"] button[aria-pressed="true"]').textContent;
globalThis.hookEditorFocus=()=>document.querySelector('[aria-label="Editing occurrence"] button').focus();
globalThis.hookEditorRun=async action=>{
 const wait=async(fn,label)=>{for(let i=0;i<400;i++){if(fn())return;await new Promise(r=>setTimeout(r,25));}throw Error('hook_editor_timeout_'+label+'_'+[...document.querySelectorAll('[role=alert]')].map(n=>n.textContent).join('_'));};
 const visible=n=>n&&n.getClientRects().length&&!n.closest('[hidden]');
 const button=text=>[...document.querySelectorAll('.control-tabs button'),...document.querySelectorAll('button')].find(n=>visible(n)&&n.textContent.trim()===text);
 const click=async text=>{await wait(()=>button(text),text);button(text).click();await new Promise(requestAnimationFrame);};
 const field=label=>document.querySelector('[aria-label="'+label+'"]');
 const set=(node,value)=>{Object.getOwnPropertyDescriptor(node.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(node,value);node.dispatchEvent(new Event('input',{bubbles:true}));node.dispatchEvent(new Event('change',{bubbles:true}));};
 const scope=async text=>{const n=[...document.querySelector('[aria-label="Editing occurrence"]').querySelectorAll('button')].find(n=>n.textContent===text);n.click();await wait(()=>n.getAttribute('aria-pressed')==='true','scope_'+text);await new Promise(requestAnimationFrame);};
 const setting=async text=>{const n=[...document.querySelectorAll('.editor-tabs button')].find(n=>n.textContent.trim()===text);n.click();await wait(()=>n.getAttribute('aria-selected')==='true'&&!document.getElementById(n.getAttribute('aria-controls'))?.hidden,'setting_'+text);await new Promise(requestAnimationFrame);};
 const fits=()=>{if(document.documentElement.scrollWidth>innerWidth)throw Error('hook_editor_overflow');const footer=document.querySelector('#sample-main > footer').getBoundingClientRect();if(footer.bottom>innerHeight+1||footer.top<0)throw Error('hook_footer_outside');const selector=document.querySelector('[aria-label="Editing occurrence"]');selector.scrollIntoView({block:'nearest',behavior:'instant'});const r=selector.getBoundingClientRect();if(r.right>innerWidth||r.left<0||r.bottom>footer.top+1)throw Error('hook_selector_outside_'+JSON.stringify({width:innerWidth,left:r.left,right:r.right,bottom:r.bottom,footer:footer.top}));};
 await wait(()=>document.querySelector('.editor-panels:not([hidden])'),'ready');
 if(action==='open-hook'||action==='open-hook-blank'){
 await scope('Main clip');await setting('Focus');await click('Advanced');set(field('Focus playhead seconds'),'3.5');
 await wait(()=>{const v=document.querySelector('.editor-preview video[data-editor-active=true]');return v&&!v.seeking&&Math.abs(v.currentTime-3.5)<.04;},'new_hook_start_settled');
 await setting('Hook');await wait(()=>!field('Capture hook start').disabled,'capture_hook_start_ready');field('Capture hook start').click();
 await wait(()=>field('Hook start seconds').value==='3.5'&&field('Hook end seconds').value==='','hook_end_cleared');
 if(!button('Preview hook').disabled||(button('Use suggestion')&&!button('Use suggestion').disabled)||!button('Apply changes').disabled)throw Error('incomplete_hook_action_enabled');
 if(document.querySelector('.hook-controls [role=alert]'))throw Error('later_start_rejected');
 if(action==='open-hook-blank'){field('Hook end seconds').scrollIntoView({block:'center',behavior:'instant'});await new Promise(requestAnimationFrame);return;}
 await setting('Focus');await click('Advanced');set(field('Focus playhead seconds'),'3.8');
 await wait(()=>{const v=document.querySelector('.editor-preview video[data-editor-active=true]');return v&&!v.seeking&&Math.abs(v.currentTime-3.8)<.04;},'new_hook_end_settled');
 await setting('Hook');await wait(()=>!field('Capture hook end').disabled,'capture_hook_end_ready');field('Capture hook end').click();
 await wait(()=>Number(field('Hook end seconds').value)>3.8&&!button('Preview hook').disabled&&!button('Apply changes').disabled,'hook_range_completed');
 if(field('Hook start seconds').value!=='3.5')throw Error('end_capture_changed_start');
 await click('Discard changes');await wait(()=>!document.querySelector('[aria-label="Edit actions"]'),'new_hook_discarded');await setting('Hook');
 if(field('Hook start seconds').value!=='1'||field('Hook end seconds').value!=='3')throw Error('hook_discard_failed');
 set(field('Hook start seconds'),'3');await wait(()=>field('Hook end seconds').value==='','equal_start_clears_end');
 set(field('Hook start seconds'),'3.2');await new Promise(requestAnimationFrame);if(field('Hook end seconds').value!=='')throw Error('invented_hook_end');
 field('Hook end seconds').focus();set(field('Hook end seconds'),'3.7');await wait(()=>!button('Apply changes').disabled&&!button('Preview hook').disabled,'typed_end_completes');
 set(field('Hook end seconds'),'');await wait(()=>button('Apply changes').disabled&&button('Preview hook').disabled,'cleared_end_disables');
 button('Remove hook').click();await wait(()=>button('Add hook')&&!button('Apply changes').disabled,'remove_incomplete_hook');
 await click('Discard changes');await wait(()=>!document.querySelector('[aria-label="Edit actions"]'),'removed_hook_discarded');
 }else if(action==='stable-lists'){
 const pictures=()=>document.querySelectorAll('.picture-picker [aria-label^="Edit picture "]').length;
 const texts=()=>document.querySelectorAll('[aria-label="Text layers"] button').length;
 const words=()=>document.querySelectorAll('.caption-text-editor input').length;
 const sounds=()=>document.querySelectorAll('[aria-label="Added audio"] button').length;
 const actual=kind=>document.querySelector('.editor-preview video[data-editor-video="'+kind+'"][data-editor-active="true"]');
 const chosen=()=>document.querySelector('[aria-label="Editing occurrence"] button[aria-pressed="true"]').textContent;
 await scope('Hook');await setting('Text');field('Edit text 1').click();await setting('Media');await click('Pictures');if(pictures()!==1)throw Error('hook_picture_list_incomplete');
 field('Play video').click();await wait(()=>actual('body'),'playback_crossed_hook');
 if(chosen()!=='Hook'||pictures()!==1)throw Error('playback_changed_picture_context');
 if(getComputedStyle(document.querySelector('.editor-preview .editor-interaction')).visibility!=='hidden')throw Error('other_occurrence_drag_enabled');
 field('Pause video')?.click();await setting('Text');if(texts()!==1)throw Error('hook_text_list_changed');await click('Timing');
 if(!field('Capture text start').disabled)throw Error('other_occurrence_capture_enabled');
 await setting('Media');await click('Audio');await click('Sound library');field('Add Discord notification').click();await new Promise(requestAnimationFrame);if(Number(field('Sound start seconds').value)<1||Number(field('Sound end seconds').value)>3)throw Error('pinned_hook_new_audio_outside_window');await click('Discard changes');await wait(()=>!document.querySelector('[aria-label="Edit actions"]'),'audio_draft_discarded');await setting('Text');

 field('Edit text 1').click();await wait(()=>actual('hook'),'text_seeks_own_hook');
 await scope('Main clip');await setting('Media');await click('Pictures');if(pictures()!==2)throw Error('future_picture_hidden');
 field('Edit picture 2').click();await wait(()=>actual('body')?.currentTime>=3,'future_picture_seek');await click('Timing');if(field('Picture start seconds').value!=='3')throw Error('future_picture_clock');
 await setting('Text');if(texts()!==2)throw Error('future_text_hidden');field('Edit text 2').click();await wait(()=>actual('body')?.currentTime>=3,'future_text_seek');
 await setting('Captions');await click('Text');if(words()!==4)throw Error('caption_list_incomplete');field('Preview caption 1').click();await wait(()=>actual('body')?.currentTime<.1,'caption_seek_start');if(words()!==4)throw Error('captions_hidden_near_start');
 field('Preview caption 4').click();await wait(()=>actual('body')?.currentTime>=3,'caption_seek_end');if(words()!==4)throw Error('captions_hidden_near_end');
 await setting('Media');await click('Audio');await click('Your audio (2)');if(sounds()!==2)throw Error('future_audio_hidden');document.querySelectorAll('[aria-label="Added audio"] button')[1].click();await wait(()=>actual('body')?.currentTime>=3,'audio_select_seek');if(sounds()!==2)throw Error('audio_list_changed');
 await scope('Hook');await click('Your audio (1)');if(sounds()!==1)throw Error('hook_audio_list_incomplete');document.querySelector('[aria-label="Added audio"] button').click();await wait(()=>actual('hook'),'audio_seeks_hook');
 await setting('Captions');await click('Text');if(words()!==2)throw Error('hook_caption_list_incomplete');field('Preview caption 2').click();await new Promise(requestAnimationFrame);if(words()!==2||chosen()!=='Hook')throw Error('hook_caption_context_changed');
 if(document.querySelector('[aria-label="Edit actions"]'))throw Error('playback_created_edit');
 await setting('Media');await click('Pictures');fits();
 }else if(action==='list-overview'){
 await scope('Main clip');await setting('Media');await click('Pictures');field('Edit picture 1').click();await new Promise(requestAnimationFrame);
 const items=document.querySelectorAll('.picture-picker [aria-label^="Edit picture "]');if(items.length!==2)throw Error('complete_picture_overview');items[0].scrollIntoView({block:'center',behavior:'instant'});
 if(document.documentElement.scrollWidth>innerWidth)throw Error('picture_overview_overflow');
 }else if(action==='edit'){
 await scope('Hook');await setting('Text');await click('Content');set(field('Text content'),'Hook copy');await new Promise(requestAnimationFrame);
 await scope('Main clip');if(field('Text content').value!=='Original')throw Error('hook_text_leaked');set(field('Text content'),'Main copy');await new Promise(requestAnimationFrame);
 await scope('Hook');if(field('Text content').value!=='Hook copy')throw Error('main_text_leaked');
 await setting('Captions');await click('Text');set(field('Caption 1 word 1'),'Hook word');await new Promise(requestAnimationFrame);
 await scope('Main clip');if(field('Caption 2 word 1').value!=='Hook')throw Error('hook_caption_leaked');set(field('Caption 2 word 1'),'Main word');await new Promise(requestAnimationFrame);
 await scope('Hook');if(field('Caption 1 word 1').value!=='Hook word')throw Error('main_caption_leaked');
 await setting('Media');await click('Picture 1');await click('Image');await click('Remove picture');await new Promise(requestAnimationFrame);
 if(field('Edit picture 1'))throw Error('hook_picture_not_removed');await scope('Main clip');if(!field('Edit picture 1'))throw Error('hook_picture_leaked');
 await scope('Hook');await click('Audio');await click('Your audio (1)');set(field('Original audio volume'),'0');await new Promise(requestAnimationFrame);
 await scope('Main clip');if(field('Original audio volume').value!=='100')throw Error('hook_audio_leaked');set(field('Original audio volume'),'60');await new Promise(requestAnimationFrame);
 await scope('Hook');if(field('Original audio volume').value!=='0')throw Error('main_audio_leaked');
 await setting('Focus');await click('Advanced');set(field('Camera zoom'),'1.5');await new Promise(requestAnimationFrame);
 await scope('Main clip');if(field('Camera zoom').value!=='1')throw Error('hook_focus_leaked');
 await scope('Hook');if(field('Camera zoom').value!=='1.5')throw Error('hook_focus_missing');await click('Reset focus');if(field('Camera zoom').value!=='1')throw Error('hook_focus_reset_failed');set(field('Camera zoom'),'1.25');await new Promise(requestAnimationFrame);
 fits();await click('Apply changes');await wait(()=>!document.querySelector('[aria-label="Edit actions"]'),'applied');await new Promise(requestAnimationFrame);
 }else if(action==='restore'){
 await scope('Hook');await setting('Text');if(field('Text content').value!=='Hook copy')throw Error('hook_restore_failed');
 await click('Timing');await wait(()=>field('Capture text end')&&!field('Capture text end').disabled,'capture_ready');await wait(()=>{const v=document.querySelector('.editor-preview video[data-editor-video=hook]');return v&&v.readyState>=2&&!v.seeking&&Math.abs(v.currentTime-1)<.04;},'hook_video_settled');await new Promise(r=>setTimeout(r,150));field('Capture text end').click();await wait(()=>field('Text end seconds').value!=='3','capture_hook_source');
 if(Number(field('Text end seconds').value)<1||Number(field('Text end seconds').value)>=3)throw Error('hook_capture_wrong_clock');
 await click('Discard changes');await wait(()=>!document.querySelector('[aria-label="Edit actions"]'),'discarded');
 await scope('Main clip');await setting('Text');await click('Content');if(field('Text content').value!=='Main copy')throw Error('main_restore_failed');
 fits();
 }else{await scope('Hook');fits();}
};`;
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto({ url: `http://localhost:${port}/`, timeout: 15000 });
    await page._client().send("Runtime.evaluate", { expression: driver });
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    for (const width of [1440, 390, 320]) {
      await page.setViewport({
        width,
        height: width === 1440 ? 1000 : 844,
        deviceScaleFactor: 1,
      });
      await page.evaluate(
        () => globalThis.hookEditorRun("open-hook-blank"),
        null,
      );
      const pendingShot = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        resolve(`.local-build/evidence/cl223-open-end-${width}.png`),
        Buffer.from(pendingShot.value.data, "base64"),
      );
      await page.evaluate(() => globalThis.hookEditorRun("open-hook"), null);
      await page.evaluate(() => globalThis.hookEditorRun("stable-lists"), null);
      await page.evaluate(
        () => globalThis.hookEditorRun("list-overview"),
        null,
      );
      const shot = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        resolve(`.local-build/evidence/cl222-items-${width}.png`),
        Buffer.from(shot.value.data, "base64"),
      );
    }
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.evaluate(() => globalThis.hookEditorRun("edit"), null);
    expect(edits).toBe(1);
    expect(clip.edit!.texts![0]!.text).toBe("Main copy");
    expect(clip.edit!.hookContent!.edits.texts![0]!.text).toBe("Hook copy");
    expect(clip.edit!.hookContent!.edits.visuals).toEqual([]);
    expect(clip.edit!.visuals).toHaveLength(2);
    await page.goto({ url: `http://localhost:${port}/`, timeout: 15000 });
    await page._client().send("Runtime.evaluate", { expression: driver });
    await page.evaluate(() => globalThis.hookEditorRun("restore"), null);
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    for (const width of [1440, 390, 320]) {
      await page.setViewport({
        width,
        height: width === 1440 ? 1000 : 844,
        deviceScaleFactor: 1,
      });
      await page.evaluate(() => globalThis.hookEditorRun("fits"), null);
      const shot = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        resolve(`.local-build/evidence/cl220-editor-${width}.png`),
        Buffer.from(shot.value.data, "base64"),
      );
    }
    // Actual pointer and keyboard activation use the same scoped editor controls.
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    const point = await page.evaluate(
      () => globalThis.hookEditorPointer(),
      null,
    );
    await page._client().send("Input.dispatchMouseEvent", {
      type: "mousePressed",
      ...point,
      button: "left",
      buttons: 1,
      clickCount: 1,
    });
    await page._client().send("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      ...point,
      button: "left",
      buttons: 0,
      clickCount: 1,
    });
    expect(await page.evaluate(() => globalThis.hookEditorScope(), null)).toBe(
      "Main clip",
    );
    await page.evaluate(() => globalThis.hookEditorFocus(), null);
    await page._client().send("Input.dispatchKeyEvent", {
      type: "keyDown",
      text: "\r",
      key: "Enter",
      code: "Enter",
      windowsVirtualKeyCode: 13,
    });
    await page._client().send("Input.dispatchKeyEvent", {
      type: "keyUp",
      key: "Enter",
      code: "Enter",
      windowsVirtualKeyCode: 13,
    });
    expect(await page.evaluate(() => globalThis.hookEditorScope(), null)).toBe(
      "Hook",
    );
    expect(edits).toBe(1);
    expect(unexpected).toBe(0);
  } finally {
    await browser?.close({ silent: true });
    server.closeAllConnections();
    if (server.listening)
      await new Promise<void>((done, reject) =>
        server.close((e) => (e ? reject(e) : done())),
      );
    await clearHookScratch(root);
  }
}, 100000);

async function clearHookScratch(root: string) {
  const owned = relative(await realpath(tmpdir()), await realpath(root));
  if (
    !owned ||
    owned.startsWith("..") ||
    isAbsolute(owned) ||
    !owned.startsWith("clipbuilder-hook-editor-")
  )
    throw Error("invalid_hook_proof_cleanup");
  await rm(root, { recursive: true, force: true });
}
