import { expect, it } from "vitest";
import { createServer } from "node:http";
import { createHash, randomUUID } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join, relative, resolve } from "node:path";
import sharp from "../apps/backend/node_modules/sharp/dist/index.mjs";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import {
  defaultOwnerFocus,
  ownerSourceContent,
} from "../packages/contracts/local/focus.ts";
import { ownerClipSchema } from "../packages/contracts/local/clips.ts";
import { automaticOwnerEdit } from "../packages/contracts/local/edit-overlay.ts";
import { applyOwnerEdit } from "../apps/backend/local/edit-clip.ts";
import { ownerCameraFollowKey } from "../packages/contracts/local/camera-follow.ts";
import { prepareLocalControlsFixture } from "./owner-controls-browser.ts";
import { listenOwner } from "./owner-http.ts";
import { browserDiagnosticSchema } from "../packages/contracts/src/browser-diagnostic.schema.ts";

declare global {
  function headMotionRun(action: string): Promise<unknown>;
}

it("tracks a manually marked moving head through real editor controls, cancel, Apply/Discard and reopen without providers", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-head-motion-"));
  let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
  let server: ReturnType<typeof createServer> | undefined;
  try {
    const source = join(root, "synthetic.mp4"),
      tools = await ownerNativeTools(resolve("."));
    const focus = defaultOwnerFocus({ width: 480, height: 270 }, 120);
    focus.people = [
      {
        id: "person_1",
        observations: [
          {
            startFrame: 0,
            endFrame: 120,
            box: {
              x: 70 / 480,
              y: 70 / 270,
              width: 72 / 480,
              height: 96 / 270,
            },
          },
        ],
      },
    ];
    focus.shots = [
      { ...focus.shots[0]!, personId: "person_1", centerX: 106 / 480 },
    ];
    const workspace = {
      id: randomUUID(),
      revision: 0,
      mode: "synthetic-ai",
      source: {
        fingerprint: "a".repeat(64),
        bytes: 1000,
        durationMs: 4000,
        width: 480,
        height: 270,
        fps: 30,
      },
    };
    const base = {
      version: 1,
      analysisId: randomUUID(),
      momentId: randomUUID(),
      sourceRevision: 0,
      fingerprint: workspace.source.fingerprint,
      processingIdentity: "b".repeat(64),
      cut: { startFrame: 0, endFrame: 120 },
      words: [],
      overlay: { version: 1, frames: 120, captions: [], visuals: [], focus },
    };
    const hash = createHash("sha256")
      .update(JSON.stringify(base))
      .digest("hex");
    const original = ownerClipSchema.parse({
      id: randomUUID(),
      momentId: base.momentId,
      mode: "synthetic-ai",
      analysisId: base.analysisId,
      sourceRevision: 0,
      revision: 0,
      assemblyRevision: 0,
      baseHash: hash,
      state: "review-ready",
      base,
      preview: { frames: 120, bytes: 1000 },
      edit: null,
      assets: [],
      outputs: [],
      calls: { plan: 0, image: 0, render: 0 },
      error: null,
    });
    original.edit = automaticOwnerEdit(original.base!, original.id, hash);
    let clip = structuredClone(original),
      bytes = Buffer.alloc(0),
      ui = "",
      edits = 0,
      unexpected = 0,
      diagnosticRecords = 0;
    const reactIssues: string[] = [];
    const list = () => ({ clips: [clip], active: false, workers: 1 });
    server = createServer((req, res) => {
      void (async () => {
        res.setHeader("Content-Type", "application/json");
        if (req.method === "POST" && req.url?.endsWith("/edit")) {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(Buffer.from(chunk));
          const edit = applyOwnerEdit(
            clip,
            JSON.parse(Buffer.concat(chunks).toString()),
            focus.source,
          );
          clip = ownerClipSchema.parse({
            ...clip,
            edit,
            revision: edit.revision,
            state: "validated-revision",
          });
          edits++;
          res.end(JSON.stringify(list()));
          return;
        }
        if (req.url === "/api/diagnostics" && req.method === "POST") {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(Buffer.from(chunk));
          browserDiagnosticSchema.parse(
            JSON.parse(Buffer.concat(chunks).toString()),
          );
          diagnosticRecords++;
          res.writeHead(204).end();
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
              localMedia: true,
              cloud: false,
              captionGeneration: false,
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
        if (req.url?.endsWith("/source")) {
          const range = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/),
            start = Number(range?.[1] ?? 0),
            end = Math.min(
              Number(range?.[2] || bytes.length - 1),
              bytes.length - 1,
            );
          res
            .writeHead(range ? 206 : 200, {
              "Content-Type": "video/mp4",
              "Cache-Control": "no-store",
              "Content-Length": end - start + 1,
              "Accept-Ranges": "bytes",
              ...(range
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
              ? "application/javascript"
              : file.endsWith("css")
                ? "text/css"
                : "text/html",
          })
          .end(await readFile(join(ui, file)));
      })().catch(() => {
        unexpected++;
        res.writeHead(409).end();
      });
    });
    const pixels = Buffer.alloc(72 * 96 * 3);
    for (let y = 0; y < 96; y++)
      for (let x = 0; x < 72; x++) {
        const value = Math.round(
          120 +
            55 * Math.sin((x - 36) * 0.6) * Math.sin((y - 48) * 0.4) +
            30 * Math.cos((x - 36) * 0.2 + (y - 48) * 0.3),
        );
        pixels.fill(value, (y * 72 + x) * 3, (y * 72 + x) * 3 + 3);
      }
    const texture = join(root, "head.png");
    await sharp(pixels, { raw: { width: 72, height: 96, channels: 3 } })
      .png()
      .toFile(texture);
    const c = ownerSourceContent(focus.source);
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-f",
        "lavfi",
        "-i",
        "color=c=0x202020:s=480x270:r=30:d=4",
        "-loop",
        "1",
        "-framerate",
        "30",
        "-i",
        texture,
        "-filter_complex",
        `[1:v]split[head][other];[0:v][head]overlay=x='70+25*t':y='70+5*sin(t*2)':shortest=1[first];[first][other]overlay=x=350:y=70:shortest=1,scale=${c.width}:${c.height},pad=1080:1920:${c.x}:${c.y}`,
        "-t",
        "4",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-pix_fmt",
        "yuv420p",
        "-threads",
        "2",
        source,
      ],
      AbortSignal.timeout(30000),
    );
    const lostSource = join(root, "lost.mp4");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-i",
        source,
        "-vf",
        `drawbox=x=${c.x}:y=${c.y}:w=${c.width}:h=${c.height}:color=0x202020:t=fill:enable='gte(t,1.5)'`,
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-pix_fmt",
        "yuv420p",
        "-threads",
        "2",
        lostSource,
      ],
      AbortSignal.timeout(30000),
    );
    const lostBytes = await readFile(lostSource);
    const fullBytes = await readFile(source);
    bytes = fullBytes;
    ui = await prepareLocalControlsFixture(root);
    await writeFile(
      join(ui, "index.html"),
      '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>',
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
      onBrowserLog: (log) => {
        if (
          /Maximum update depth|Too many re-renders|should be cached/.test(
            log.text,
          )
        )
          reactIssues.push("react_update_cycle");
      },
      onLog: () => {},
    });
    const driver = `globalThis.headMotionRun=async action=>{
      const named=n=>document.querySelector('[aria-label="'+n+'"]');
      const button=n=>[...document.querySelectorAll('button')].find(x=>x.textContent.trim()===n&&x.getClientRects().length);
      const wait=async(fn,name,limit=1000)=>{for(let i=0;i<limit;i++){if(fn())return;await new Promise(r=>setTimeout(r,15));}throw Error('head_motion_'+name);};
      const change=async(name,value)=>{const n=named(name);Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(n,value);n.dispatchEvent(new Event('input',{bubbles:true}));await new Promise(requestAnimationFrame);};
      const footer=()=>{const f=document.querySelector('#sample-main > footer'),r=f.getBoundingClientRect();if(r.top<0||r.bottom>innerHeight+1)throw Error('tracking_footer_bounds');for(const n of f.querySelectorAll('button')){const b=n.getBoundingClientRect();if(b.width&&(b.left<r.left||b.right>r.right||b.bottom>r.bottom))throw Error('tracking_footer_overflow');}if(document.documentElement.scrollWidth>innerWidth)throw Error('tracking_document_overflow');};
      if(action==='open'){
        await wait(()=>document.querySelector('.editor-panels:not([hidden])'),'editor_ready');
        [...named('Clip settings').querySelectorAll('[role=tab]')].find(n=>n.textContent==='Camera').click();
        await wait(()=>named('Focus controls'),'focus');const tabs=[...named('Focus controls').querySelectorAll('[role=tab]')];
        const motion=tabs.find(n=>n.textContent==='Motion');if(tabs[tabs.indexOf(motion)-1].textContent!=='Zoom')throw Error('motion_tab_position');motion.click();
        await wait(()=>button('Add at playhead')&&!button('Add at playhead').disabled,'add_ready');return;
      }
      if(action==='numbered'){
        const root=named('Numbered speaker preview');if(!root||!root.getBoundingClientRect().width)throw Error('numbered_motion_missing');
        const tabs=[...named('Focus controls').querySelectorAll('[role=tab]')];tabs.find(n=>n.textContent==='Zoom').click();
        await wait(()=>named('Zoom effect'),'zoom_context');if(!root.getBoundingClientRect().width)throw Error('numbered_zoom_missing');
        root.querySelector('[aria-pressed=true]').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
        if(button('Apply changes'))throw Error('zoom_context_moved_camera');
        tabs.find(n=>n.textContent==='Motion').click();await wait(()=>named('Camera timeline'),'motion_context');
        [...named('Camera timeline').querySelectorAll('button')].find(n=>n.textContent.includes('Person 2')).click();await wait(()=>named('Selected Person 2'),'person_context_select');
        [...named('Camera timeline').querySelectorAll('button')].find(n=>n.textContent.includes('Person 1')).click();await wait(()=>named('Selected Person 1'),'person_context_return');
        if(button('Apply changes'))throw Error('person_selection_changed_draft');root.scrollIntoView({block:'start'});await new Promise(r=>setTimeout(r,100));footer();return;
      }
      if(action==='bulk-cancel' || action==='bulk'){
        button('Add to all speakers').click();await wait(()=>button('Track all'),'bulk_preflight');
        if(!document.querySelector('#sample-main > footer').contains(button('Track all'))||button('Apply changes')?.getClientRects().length)throw Error('bulk_footer');footer();
        button('Track all').click();await wait(()=>button('Cancel tracking')&&!button('Cancel tracking').disabled,'bulk_running');
        if(action==='bulk-cancel'){button('Cancel tracking').click();await wait(()=>button('Add to all speakers')&&!button('Add to all speakers').disabled,'bulk_canceled');if(button('Apply changes'))throw Error('bulk_cancel_modified_draft');return;}
        const expectedPeople=document.querySelector('.bulk-head-motion p').textContent.includes('2 people'),seen=new Set();
        const inspect=()=>{const label=[...document.querySelectorAll('.bulk-head-motion [role=status]')].find(n=>/^Person [0-9]+/.test(n.textContent.trim()));const match=label?.textContent.match(/Person ([0-9]+)/);if(match&&named('Selected Person '+match[1]))seen.add(match[1]);};
        const observer=new MutationObserver(inspect);observer.observe(document.body,{childList:true,subtree:true,characterData:true});inspect();
        try{await wait(()=>button('Apply changes')&&!button('Apply changes').disabled&&button('Preview motion'),'bulk_done',3000);}finally{observer.disconnect();}
        if(expectedPeople&&(!seen.has('1')||!seen.has('2')))throw Error('bulk_numbered_progress_clock');footer();return;
      }
      if(action==='bulk-covered'){
        button('Add to all speakers').click();await wait(()=>button('Track all'),'covered_preflight');if(!button('Track all').disabled)throw Error('covered_bulk_allowed');button('Cancel').click();await wait(()=>button('Add more clips')&&!button('Track all'),'covered_closed');await new Promise(requestAnimationFrame);return;
      }
      if(action==='add'){
        button('Add at playhead').click();await wait(()=>named('Head to follow'),'seed');
        if(!button('Track head')?.disabled)throw Error('unmarked_head_allowed');
        const target=named('Head to follow');target.scrollIntoView({block:'center'});await new Promise(requestAnimationFrame);const r=target.getBoundingClientRect();footer();
        const slot=document.querySelector('.workflow-footer-slot'),notice=document.createElement('nav');notice.className='workflow-actions';const status=document.createElement('span');status.className='connection-status';status.textContent='Reconnecting…';notice.append(status);slot.append(notice);
        if(!notice.getClientRects().length)throw Error('hidden_reconnection');notice.remove();
        const media=document.querySelector('.head-motion-source video');await wait(()=>media.readyState>=2&&!media.seeking,'seed_frame');const t=Math.floor(media.currentTime*30)/30,x=70+25*t,y=70+5*Math.sin(t*2);
        return {x:r.left+r.width*x/480,y:r.top+r.height*y/270,endX:r.left+r.width*(x+72)/480,endY:r.top+r.height*(y+96)/270};
      }
      if(action==='layout'){
        await wait(()=>named('Head width percent').value==='15'&&named('Head height percent').value==='35.6','pointer_selection_committed');
        if(named('Numbered speaker preview').getBoundingClientRect().width||button('Reset focus'))throw Error('duplicate_marking_preview');
        const group=document.querySelector('.motion-interval-fields'),end=named('Motion end seconds'),r=end.getBoundingClientRect();
        if(!group.contains(end)||r.height<44||r.height>52||!group.contains(named('Capture motion end')))throw Error('motion_time_layout');
        document.querySelector('.motion-head-details').open=true;
        const inputs=[...document.querySelectorAll('.motion-head-fields input')],boxes=inputs.map(n=>n.getBoundingClientRect());
        const columns=getComputedStyle(document.querySelector('.motion-head-fields')).gridTemplateColumns.split(' ').length;
        if(![1,2,4].includes(columns)||boxes.some((b,i)=>b.height<44||b.height>52||b.left<0||b.right>innerWidth||Math.abs(b.width-boxes[0].width)>1||(i%columns!==0&&Math.abs(b.top-boxes[i-i%columns].top)>1)))throw Error('motion_geometry_layout_'+innerWidth+'_'+columns);
        document.querySelector('.motion-head-details').open=false;
        const windowBox=()=>document.querySelector('.head-follow-window');const beforeWindow=windowBox().getBoundingClientRect().width;await change('Follow window percent','45');if(windowBox().getBoundingClientRect().width<=beforeWindow)throw Error('follow_window_not_larger');await change('Follow window percent','30');
        window.headSeedBefore=inputs.map(n=>n.value);window.headInlineWidth=named('Head to follow').getBoundingClientRect().width;
        button('Expand').click();await wait(()=>document.querySelector('dialog[open] [aria-label="Head to follow"]'),'expanded');
        const dialog=document.querySelector('dialog[open]'),box=dialog.getBoundingClientRect();
        if(box.left<0||box.right>innerWidth||box.top<0||box.bottom>innerHeight||!dialog.contains(document.activeElement)||document.querySelectorAll('[aria-label="Head to follow"]').length!==1)throw Error('expanded_selection_bounds');
        if(innerWidth>=1000&&named('Head to follow').getBoundingClientRect().width<=window.headInlineWidth)throw Error('selection_not_enlarged');
        named('Head to follow').focus();return;
      }
      if(action==='expanded-close'){
        await wait(()=>!document.querySelector('dialog[open]')&&named('Head to follow')?.getBoundingClientRect().width>0,'expanded_closed');
        if(JSON.stringify([...document.querySelectorAll('.motion-head-fields input')].map(n=>n.value))!==JSON.stringify(window.headSeedBefore)||button('Track head').disabled)throw Error('expanded_changed_seed');
        if(document.activeElement!==button('Expand'))throw Error('expanded_focus_return');
        footer();return;
      }
      if(action==='numeric'){
        document.querySelector('.motion-head-details').open=true;
        const media=document.querySelector('.head-motion-source video');await wait(()=>media.readyState>=2&&!media.seeking,'numeric_frame');const t=Math.floor(media.currentTime*30)/30;
        for(const [n,v]of[['Head x percent',String((70+25*t)/480*100)],['Head y percent',String((70+5*Math.sin(t*2))/270*100)],['Head width percent','15'],['Head height percent','35.5556']])await change(n,v);
        named('Head to follow').focus();named('Head to follow').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));return;
      }
      if(action==='track' || action==='track-hook'||action==='track-start'){
        await wait(()=>button('Track head')&&!button('Track head').disabled,'marked');
        await change('Motion end seconds','99999');button('Track head').click();await wait(()=>document.querySelector('[aria-label="Motion tracking actions"]')?.textContent.includes('0.2 to 30'),'bad_end');await change('Motion end seconds',action==='track-hook'?'1.5':'4');
        button('Track head').click();await wait(()=>{const n=named('Tracking head');if(!n)return false;const r=n.getBoundingClientRect(),footer=document.querySelector('#sample-main > footer').getBoundingClientRect();return r.top>=0&&r.bottom<=footer.top;},'visible_tracking_progress');if(named('Motion end seconds')||document.querySelector('.motion-head-fields'))throw Error('tracking_kept_fields');footer();if(action==='track-start')return;await wait(()=>button('Apply changes')&&!button('Apply changes').disabled&&button('Preview motion'),'tracked');footer();return;
      }
      if(action==='track-finish'){await wait(()=>button('Apply changes')&&!button('Apply changes').disabled&&button('Preview motion'),'tracked');footer();return;}
      if(action==='cancel'){
        button('Track head').click();await wait(()=>button('Cancel tracking'),'running');button('Cancel tracking').click();await wait(()=>!named('Head to follow')&&button('Add at playhead')&&!button('Add at playhead').disabled,'canceled');
        if(button('Apply changes'))throw Error('cancel_modified_draft');footer();return;
      }
      if(action==='discard'){button('Discard changes').click();await wait(()=>!button('Apply changes')&&button('Add more clips'),'discarded');if(named('Motion interval'))throw Error('discard_kept_track');return;}
      if(action==='apply'){button('Apply changes').click();await wait(()=>!button('Apply changes')&&button('Add more clips'),'applied');return;}
      if(action==='body-camera'){const row=document.querySelector('[data-timeline-key="body:camera:0"]');if(!row)throw Error('body_camera_missing');row.click();await wait(()=>row.getAttribute('aria-pressed')==='true'&&button('Add to all speakers')&&!button('Add to all speakers').disabled,'body_camera_selected');return;}
      if(action==='hook-label')return named('Motion interval').selectedOptions[0].textContent.includes('Hook');
      if(action==='reopened'){if(named('Follow window percent')?.value!=='30')throw Error('follow_window_not_saved');await change('Follow window percent','50');if(!button('Apply changes'))throw Error('follow_window_not_editable');if(!named('Motion interval')||named('Head to follow'))throw Error('restored_track_missing');button('Remove motion').click();await wait(()=>button('Apply changes'),'removed');return;}
      if(action==='preview'){
        const video=()=>document.querySelector('.editor-preview video[data-editor-active=true]');const initial=getComputedStyle(video()).transform;
        button('Preview motion').click();await wait(()=>named('Pause video'),'playing');await wait(()=>video().currentTime>=1.5,'preview_passed_follow_window');named('Pause video').click();if(getComputedStyle(video()).transform===initial)throw Error('preview_did_not_follow');return;
      }
      throw Error('unknown_head_motion_action');
    };`;
    const run = (action: string) =>
      page.evaluate((a) => globalThis.headMotionRun(a), action);
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    for (const width of [1440, 1280, 390, 320]) {
      clip = structuredClone(original);
      await page.setViewport({
        width,
        height:
          width === 1280
            ? 600
            : width === 320
              ? 568
              : width === 390
                ? 844
                : 900,
        deviceScaleFactor: 1,
      });
      await page.goto({ url: `http://localhost:${port}/`, timeout: 15000 });
      await page._client().send("Runtime.evaluate", { expression: driver });
      await run("open");
      const point = (await run("add")) as {
        x: number;
        y: number;
        endX: number;
        endY: number;
      };
      if (width === 1440) {
        await page._client().send("Input.dispatchMouseEvent", {
          type: "mousePressed",
          x: point.x,
          y: point.y,
          button: "left",
          buttons: 1,
          clickCount: 1,
        });
        await page._client().send("Input.dispatchMouseEvent", {
          type: "mouseMoved",
          x: point.endX,
          y: point.endY,
          button: "left",
          buttons: 1,
        });
        await page._client().send("Input.dispatchMouseEvent", {
          type: "mouseReleased",
          x: point.endX,
          y: point.endY,
          button: "left",
          buttons: 0,
        });
      } else if (width === 390) {
        await page._client().send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [{ x: point.x, y: point.y, id: 1 }],
        });
        await page._client().send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: point.endX, y: point.endY, id: 1 }],
        });
        await page._client().send("Input.dispatchTouchEvent", {
          type: "touchEnd",
          touchPoints: [],
        });
      } else await run("numeric");
      await run("layout");
      const expanded = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        resolve(`.local-build/evidence/cl217-${width}-expanded.png`),
        Buffer.from(expanded.value.data, "base64"),
      );
      await page._client().send("Input.dispatchKeyEvent", {
        type: "keyDown",
        key: "Escape",
        code: "Escape",
        windowsVirtualKeyCode: 27,
      });
      await page._client().send("Input.dispatchKeyEvent", {
        type: "keyUp",
        key: "Escape",
        code: "Escape",
        windowsVirtualKeyCode: 27,
      });
      await run("expanded-close");
      const shot = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        resolve(`.local-build/evidence/cl203-${width}-seed.png`),
        Buffer.from(shot.value.data, "base64"),
      );
      await run("track-start");
      const tracking = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        resolve(`.local-build/evidence/cl217-${width}-tracking.png`),
        Buffer.from(tracking.value.data, "base64"),
      );
      await run("track-finish");
      await run("preview");
      await run("discard");
      await run("add");
      await run("numeric");
      if (width === 1440) {
        await run("cancel");
        await run("add");
        await run("numeric");
      }
      await run("track");
      await run("apply");
      const tracked = clip.edit!.cameraTracks![0]!;
      expect(tracked.outcome).toBe("complete");
      expect(tracked.followWindow).toBe(30);
      expect(tracked.points.length).toBe(
        Math.ceil((tracked.endFrame - tracked.startFrame - 1) / 2) + 1,
      );
      expect(tracked.points.at(-1)!.x).toBeGreaterThan(0.39);
      expect(clip.calls).toEqual({ plan: 0, image: 0, render: 0 });
      await page.goto({ url: `http://localhost:${port}/`, timeout: 15000 });
      await page._client().send("Runtime.evaluate", { expression: driver });
      await run("open");
      await run("reopened");
      await run("apply");
      expect(clip.edit!.cameraTracks).toEqual([]);
    }
    clip = structuredClone(original);
    bytes = lostBytes;
    await page.goto({ url: `http://localhost:${port}/`, timeout: 15000 });
    await page._client().send("Runtime.evaluate", { expression: driver });
    await run("open");
    await run("add");
    await run("numeric");
    await run("track");
    await run("apply");
    expect(clip.edit!.cameraTracks![0]!.outcome).toBe("lost");
    expect(clip.edit!.cameraTracks![0]!.endFrame).toBeLessThan(120);
    expect(clip.edit!.cameraTracks![0]!.endFrame).toBeGreaterThan(6);
    clip = structuredClone(original);
    clip.edit!.hook = { startFrame: 15, endFrame: 75 };
    bytes = fullBytes;
    await page.goto({ url: `http://localhost:${port}/`, timeout: 15000 });
    await page._client().send("Runtime.evaluate", { expression: driver });
    await run("open");
    await run("add");
    await run("numeric");
    await run("track-hook");
    await run("apply");
    expect(clip.edit!.hookContent!.edits.cameraTracks![0]!.occurrence).toBe(
      "hook",
    );
    expect(
      clip.edit!.hookContent!.edits.cameraTracks![0]!.sourceStartFrame,
    ).toBe(15);
    expect(await run("hook-label")).toBe(true);
    const bulkFocus = structuredClone(focus);
    bulkFocus.people.push({
      id: "person_2",
      observations: [
        {
          startFrame: 0,
          endFrame: 120,
          box: { x: 350 / 480, y: 70 / 270, width: 72 / 480, height: 96 / 270 },
        },
      ],
    });
    bulkFocus.people[0]!.observations.push({
      startFrame: 30,
      endFrame: 60,
      box: {
        x: 95 / 480,
        y: (70 + 5 * Math.sin(2)) / 270,
        width: 72 / 480,
        height: 96 / 270,
      },
    });
    bulkFocus.shots = [
      { ...bulkFocus.shots[0]!, endFrame: 60 },
      {
        ...bulkFocus.shots[0]!,
        startFrame: 60,
        personId: "person_2",
        centerX: 386 / 480,
      },
    ];
    const bulkOriginal = structuredClone(original);
    bulkOriginal.base!.overlay.focus = bulkFocus;
    bulkOriginal.baseHash = createHash("sha256")
      .update(JSON.stringify(bulkOriginal.base))
      .digest("hex");
    bulkOriginal.edit = automaticOwnerEdit(
      bulkOriginal.base!,
      bulkOriginal.id,
      bulkOriginal.baseHash,
    );
    bulkOriginal.edit.hook = { startFrame: 30, endFrame: 90 };
    for (const width of [1440, 390, 320]) {
      clip = structuredClone(bulkOriginal);
      bytes = fullBytes;
      await page.setViewport({
        width,
        height: width === 320 ? 568 : width === 390 ? 844 : 900,
        deviceScaleFactor: 1,
      });
      await page.goto({ url: `http://localhost:${port}/`, timeout: 15000 });
      await page._client().send("Runtime.evaluate", { expression: driver });
      await run("open");
      await run("numbered");
      const shot = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        resolve(`.local-build/evidence/cl206-${width}-numbered.png`),
        Buffer.from(shot.value.data, "base64"),
      );
      if (width === 1440) await run("bulk-cancel");
      await run("bulk");
      await run("apply");
      expect(clip.edit!.hookContent!.edits.cameraTracks).toHaveLength(2);
      await run("body-camera");
      await run("bulk");
      await run("apply");
      expect(clip.edit!.cameraTracks).toHaveLength(2);
      const allTracks = [
        ...clip.edit!.cameraTracks!,
        ...clip.edit!.hookContent!.edits.cameraTracks!,
      ];
      expect(allTracks.every((track) => track.outcome === "complete")).toBe(
        true,
      );
      expect(new Set(allTracks.map((track) => track.personId))).toEqual(
        new Set(["person_1", "person_2"]),
      );
      expect(clip.calls).toEqual({ plan: 0, image: 0, render: 0 });
      await page.goto({ url: `http://localhost:${port}/`, timeout: 15000 });
      await page._client().send("Runtime.evaluate", { expression: driver });
      await run("open");
      await run("bulk-covered");
    }
    clip = structuredClone(bulkOriginal);
    const seed = bulkFocus.people[1]!.observations[0]!.box;
    clip.edit!.cameraTracks = [
      {
        id: randomUUID(),
        occurrence: "body",
        personId: "person_2",
        startFrame: 60,
        endFrame: 120,
        sourceStartFrame: 60,
        focusKey: ownerCameraFollowKey(bulkFocus, "person_2"),
        seed,
        outcome: "complete",
        points: Array.from({ length: 31 }, (_, i) => ({
          frame: Math.min(i * 2, 59),
          x: seed.x + seed.width / 2,
          y: seed.y + seed.height / 2,
        })),
      },
    ];
    clip.edit!.cameraEffects = [
      {
        id: randomUUID(),
        occurrence: "hook",
        startFrame: 0,
        zoomFrames: 9,
        holdFrames: 9,
        returnFrames: 12,
        target: { centerX: 0.5, centerY: 0.5, zoom: 2 },
      },
    ];
    const retainedTrack = structuredClone(clip.edit!.cameraTracks[0]),
      retainedZoom = structuredClone(clip.edit!.cameraEffects);
    await page.goto({ url: `http://localhost:${port}/`, timeout: 15000 });
    await page._client().send("Runtime.evaluate", { expression: driver });
    await run("open");
    await run("bulk");
    await run("apply");
    expect(clip.edit!.hookContent!.edits.cameraTracks).toHaveLength(1);
    await run("body-camera");
    await run("bulk");
    await run("apply");
    expect(clip.edit!.cameraTracks).toHaveLength(2);
    expect(clip.edit!.cameraTracks).toContainEqual(retainedTrack);
    expect(clip.edit!.hookContent!.edits.cameraEffects).toEqual(retainedZoom);
    const longSource = join(root, "long.mp4");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-f",
        "lavfi",
        "-i",
        "color=c=0x202020:s=480x270:r=30:d=32",
        "-loop",
        "1",
        "-framerate",
        "30",
        "-i",
        texture,
        "-filter_complex",
        `[0:v][1:v]overlay=x='70+2*t':y=70:shortest=1,scale=${c.width}:${c.height},pad=1080:1920:${c.x}:${c.y}`,
        "-t",
        "32",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-pix_fmt",
        "yuv420p",
        "-threads",
        "2",
        longSource,
      ],
      AbortSignal.timeout(60000),
    );
    clip = structuredClone(original);
    bytes = await readFile(longSource);
    workspace.source.durationMs = 32000;
    const longFocus = structuredClone(focus);
    longFocus.frames = 960;
    longFocus.shots[0]!.endFrame = 960;
    longFocus.people[0]!.observations[0]!.endFrame = 960;
    clip.base!.cut.endFrame = 960;
    clip.base!.overlay.frames = 960;
    clip.base!.overlay.focus = longFocus;
    clip.preview = { frames: 960, bytes: bytes.length };
    clip.baseHash = createHash("sha256")
      .update(JSON.stringify(clip.base))
      .digest("hex");
    clip.edit = automaticOwnerEdit(clip.base!, clip.id, clip.baseHash);
    await page.goto({ url: `http://localhost:${port}/`, timeout: 15000 });
    await page._client().send("Runtime.evaluate", { expression: driver });
    await run("open");
    await run("bulk");
    await run("apply");
    expect(
      clip.edit!.cameraTracks,
      JSON.stringify(
        clip.edit!.cameraTracks?.map((t) => ({
          start: t.startFrame,
          end: t.endFrame,
          outcome: t.outcome,
        })),
      ),
    ).toHaveLength(2);
    expect(clip.edit!.cameraTracks![1]!.continues).toBe(
      clip.edit!.cameraTracks![0]!.id,
    );
    expect(clip.edit!.cameraTracks![0]!.endFrame).toBe(900);
    expect(clip.edit!.cameraTracks![1]!.endFrame).toBe(960);
    expect(
      clip.edit!.cameraTracks!.every((track) => track.outcome === "complete"),
    ).toBe(true);
    await page.goto({ url: `http://localhost:${port}/`, timeout: 15000 });
    await page._client().send("Runtime.evaluate", { expression: driver });
    await run("open");
    await run("bulk-covered");
    expect(edits).toBe(19);
    expect(unexpected).toBe(0);
    expect(reactIssues).toEqual([]);
    expect(diagnosticRecords).toBeGreaterThan(0);
    await writeFile(
      resolve(".local-build/evidence/cl255-motion-workflow.json"),
      JSON.stringify(
        {
          synthetic: true,
          providerCalls: 0,
          widths: [1440, 1280, 390, 320],
          edits,
          reactIssues,
          tracking: true,
          loss: true,
          bulk: true,
          applyDiscard: true,
          reopen: true,
        },
        null,
        2,
      ),
    );
  } finally {
    try {
      await browser?.close({ silent: true });
    } finally {
      const owned = server;
      owned?.closeAllConnections();
      try {
        if (owned?.listening)
          await new Promise<void>((done, reject) =>
            owned.close((error) => (error ? reject(error) : done())),
          );
      } finally {
        await clearHeadMotionScratch(root);
      }
    }
  }
}, 240000);
async function clearHeadMotionScratch(root: string) {
  const actual = await realpath(root),
    rel = relative(await realpath(tmpdir()), actual);
  if (
    !rel ||
    rel.startsWith("..") ||
    isAbsolute(rel) ||
    !rel.startsWith("clipbuilder-head-motion-")
  )
    throw Error("invalid_head_proof_cleanup");
  await rm(actual, { recursive: true, force: true });
}
