import { expect, it } from "vitest";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  rm,
  readdir,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, relative, isAbsolute } from "node:path";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import {
  prepareLocalControlsFixture,
  prepareLocalOverlayFixture,
} from "./owner-controls-browser.ts";
import { syntheticTextClip, syntheticTextLayer } from "./owner-text-fixture.ts";
import { OWNER_CAPTION_PRESETS } from "../packages/contracts/local/editor.ts";
import type { OwnerClip } from "../packages/contracts/local/clips.ts";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { applyOwnerEdit } from "../apps/backend/local/edit-clip.ts";
import { compileOwnerOverlay } from "../packages/contracts/local/edit-overlay.ts";
import { renderOwnerClip } from "../apps/renderer/local/clip-render.ts";
import { inspectOwnerSource } from "../apps/renderer/local/media.ts";
import { listenOwner } from "./owner-http.ts";

async function scratch() {
  return mkdtemp(join(tmpdir(), "clipbuilder-text-proof-"));
}
async function cleanup(directory: string) {
  const name = relative(tmpdir(), directory);
  if (
    isAbsolute(name) ||
    name.startsWith("..") ||
    !name.startsWith("clipbuilder-text-proof-")
  )
    throw new Error("text_cleanup_scope");
  await rm(directory, { recursive: true, force: true });
}
async function makeSource(file: string) {
  const tools = await ownerNativeTools(resolve("."));
  await runOwnedProcess(
    tools.ffmpeg,
    [
      "-nostdin",
      "-v",
      "error",
      "-f",
      "lavfi",
      "-i",
      "color=c=blue:s=540x960:r=30:d=3",
      "-f",
      "lavfi",
      "-i",
      "anullsrc=r=48000:cl=stereo",
      "-t",
      "3",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-movflags",
      "+faststart",
      "-threads",
      "2",
      file,
    ],
    AbortSignal.timeout(30_000),
  );
  return tools;
}

it("edits independent text with shared typography, timing, gestures, discard/save/reopen and responsive guards without AI", async () => {
  const directory = await scratch(),
    source = join(directory, "synthetic.mp4");
  await makeSource(source);
  const bytes = await readFile(source),
    ui = await prepareLocalControlsFixture(directory),
    workspaceId = randomUUID();
  let clip = syntheticTextClip(),
    hold = false,
    stale = false;
  let phase: OwnerClip["preparationStage"];
  const writes: string[] = [];
  const server = createServer((req, res) => {
    void (async () => {
      const path = req.url ?? "/";
      const json = (value: unknown, status = 200) =>
        res
          .writeHead(status, { "Content-Type": "application/json" })
          .end(JSON.stringify(value));
      const list = () => ({
        clips: [
          phase
            ? { ...clip, state: "preparing", preparationStage: phase }
            : clip,
        ],
        active: Boolean(phase),
        workers: 1,
      });
      if (req.method === "POST") {
        writes.push(path);
        if (!path.endsWith("/edit")) throw new Error("unexpected_mutation");
        const chunks: Buffer[] = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 20000) throw new Error("large_test_body");
          chunks.push(Buffer.from(chunk));
        }
        while (hold) await new Promise((done) => setTimeout(done, 20));
        if (stale) {
          stale = false;
          json({}, 409);
          return;
        }
        const edit = applyOwnerEdit(
          clip,
          JSON.parse(Buffer.concat(chunks).toString()),
        );
        clip = {
          ...clip,
          edit,
          revision: edit.revision,
          state: "validated-revision",
        };
        json(list());
        return;
      }
      if (path === "/api/local/capabilities") {
        json({
          aiMode: "synthetic-ai",
          sourceMode: null,
          planningAvailable: true,
          localMedia: true,
          cloud: false,
        });
        return;
      }
      if (path === "/api/local/workspace") {
        json({
          id: workspaceId,
          revision: 0,
          mode: "synthetic-ai",
          source: {
            fingerprint: clip.base!.fingerprint,
            bytes: bytes.length,
            durationMs: 3000,
            width: 540,
            height: 960,
            fps: 30,
          },
        });
        return;
      }
      if (path.endsWith("/analysis")) {
        json(null);
        return;
      }
      if (path.endsWith("/clips")) {
        json(list());
        return;
      }
      if (path.endsWith("/source")) {
        const range = /^bytes=(\d+)-(\d*)$/u.exec(req.headers.range ?? "");
        const start = Number(range?.[1] ?? 0),
          end = Math.min(
            bytes.length - 1,
            range?.[2] ? Number(range[2]) : bytes.length - 1,
          );
        res
          .writeHead(range ? 206 : 200, {
            "Content-Type": "video/mp4",
            "Content-Length": end - start + 1,
            "Accept-Ranges": "bytes",
            ...(range
              ? { "Content-Range": `bytes ${start}-${end}/${bytes.length}` }
              : {}),
          })
          .end(bytes.subarray(start, end + 1));
        return;
      }
      const file =
        path === "/"
          ? "index.html"
          : path === "/app.js"
            ? "app.js"
            : path === "/app.css"
              ? "app.css"
              : null;
      if (!file) {
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
    })().catch(() => res.destroy());
  });
  const port = await listenOwner(server),
    browser = await openBrowser("chrome", {
      browserExecutable:
        "C:/Program Files/Google/Chrome/Application/chrome.exe",
      chromiumOptions: { headless: true },
      logLevel: "error",
    });
  try {
    const page = await browser.newPage({
      context: () => null,
      logLevel: "error",
      indent: false,
      pageIndex: 0,
      onBrowserLog: null,
      onLog: () => {},
    });
    const evaluate = async (expression: string) => {
      const reply = await page._client().send("Runtime.evaluate", {
        expression,
        awaitPromise: true,
        returnByValue: true,
        userGesture: true,
      });
      if (reply.value.exceptionDetails)
        throw new Error(JSON.stringify(reply.value.exceptionDetails));
      return reply.value.result.value;
    };
    async function ready() {
      await page.goto({ url: `http://localhost:${port}/`, timeout: 10000 });
      await evaluate(
        `globalThis.waitText=async(fn)=>{for(let i=0;i<500;i++){const value=fn();if(value)return value;await new Promise(done=>setTimeout(done,20));}throw new Error('text_wait_'+[...document.querySelectorAll('.editor-warning,.flow-notice')].map(n=>n.textContent).join('|'));};globalThis.textButton=label=>[...document.querySelectorAll('button')].find(n=>n.textContent.trim()===label&&n.getClientRects().length);globalThis.textSetting=async(label)=>{[...document.querySelectorAll('[aria-label="Clip settings"] [role=tab]')].find(n=>n.textContent===label).click();await new Promise(requestAnimationFrame);};globalThis.textPanel=()=>document.getElementById(document.querySelector('[aria-label="Clip settings"] [aria-selected=true]').getAttribute('aria-controls'));globalThis.textControl=label=>[...textPanel().querySelectorAll('label')].find(n=>n.firstChild?.textContent.trim()===label)?.querySelector('input,select,textarea');globalThis.textChange=async(node,value)=>{const proto=node.tagName==='SELECT'?HTMLSelectElement.prototype:node.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(node,value);node.dispatchEvent(new Event(node.tagName==='SELECT'?'change':'input',{bubbles:true}));await new Promise(requestAnimationFrame);};globalThis.textSub=async(label)=>{[...textPanel().querySelectorAll('[role=tab]')].find(n=>n.textContent===label).click();await new Promise(requestAnimationFrame);};waitText(()=>document.querySelector('.editor-panels:not([hidden])')).then(()=>true)`,
      );
    }
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await ready();
    for (const [stage, label] of [
      ["planning", "Planning edits"],
      ["pictures", "Adding pictures"],
      ["captions", "Adding captions"],
      ["preview", "Preparing preview"],
    ] as const) {
      phase = stage;
      expect(
        await evaluate(
          `waitText(()=>document.querySelector('.clip-preparing')?.textContent.includes(${JSON.stringify(label)})&&!document.querySelector('.clip-editor')).then(()=>true)`,
        ),
      ).toBe(true);
    }
    phase = undefined;
    await evaluate(
      `waitText(()=>document.querySelector('.editor-panels:not([hidden])')).then(()=>true)`,
    );
    await evaluate(`textSetting('Text')`);
    expect(
      await evaluate(`textPanel().textContent.includes('No text yet.')`),
    ).toBe(true);
    await evaluate(
      `(async()=>{for(let i=0;i<10;i++){textButton('Add text').click();await waitText(()=>document.querySelectorAll('.text-choice').length===i+1);}return true;})()`,
    );
    expect(await evaluate(`textButton('Add text').disabled`)).toBe(true);
    await evaluate(
      `textButton('Discard changes').click();waitText(()=>document.querySelectorAll('.text-choice').length===0).then(()=>true)`,
    );
    await evaluate(
      `(async()=>{textButton('Add text').click();await waitText(()=>document.querySelector('[aria-label="Text content"]'));await textChange(document.querySelector('[aria-label="Text content"]'),'');return true;})()`,
    );
    await evaluate(`textSub('Style')`);
    expect(await evaluate(`textControl('Style').value`)).toBe("tiktok");
    expect(await evaluate(`textControl('Outline width').value`)).toBe("12");
    await evaluate(`textSub('Content')`);
    expect(await evaluate(`textButton('Apply changes').disabled`)).toBe(true);
    await evaluate(
      `textChange(document.querySelector('[aria-label="Text content"]'),${JSON.stringify(Array(11).fill("line").join("\n"))})`,
    );
    expect(
      await evaluate(
        `textButton('Apply changes').disabled&&document.querySelector('.editor-warning').textContent.includes('10 lines')`,
      ),
    ).toBe(true);
    await evaluate(
      `(async()=>{await textChange(document.querySelector('[aria-label="Text content"]'),${JSON.stringify("A synthetic headline\nSecond line")});await textSub('Timing');await textChange(document.querySelector('[aria-label="Text start seconds"]'),'0.5');await textChange(document.querySelector('[aria-label="Text end seconds"]'),'2');document.querySelector('.text-choice').click();await waitText(()=>document.querySelector('[data-text-layer]'));await textSub('Style');await textChange(textControl('Style'),'solid');return true;})()`,
    );
    expect(
      await evaluate(
        `getComputedStyle(document.querySelector('[data-text-preset=solid]')).color`,
      ),
    ).toBe("rgb(17, 17, 17)");
    // Select seeks to the retained interval; manual timing edits do not move playback.
    await evaluate(
      `(async()=>{document.querySelector('.text-choice').click();await waitText(()=>document.querySelector('[data-text-layer]'));await textSub('Timing');await waitText(()=>!document.querySelector('[aria-label="Capture text start"]').disabled);document.querySelector('[aria-label="Capture text start"]').click();await new Promise(requestAnimationFrame);return true;})()`,
    );
    expect(
      await evaluate(
        `Math.round(Number(document.querySelector('[aria-label="Text start seconds"]').value)*30)`,
      ),
    ).toBe(15);
    expect(
      await evaluate(
        `Math.round(Number(document.querySelector('[aria-label="Text end seconds"]').value)*30)`,
      ),
    ).toBe(60);
    await evaluate(
      `(async()=>{await textChange(document.querySelector('[aria-label="Text end seconds"]'),'0.4');return true;})()`,
    );
    expect(await evaluate(`textButton('Apply changes').disabled`)).toBe(true);
    await evaluate(
      `(async()=>{await textChange(document.querySelector('[aria-label="Text end seconds"]'),'2');await textSub('Style');await textChange(textControl('Style'),'solid-block');await textChange(textControl('Font size'),'');await textChange(textControl('Font size'),'72');await textChange(textControl('Weight'),'800');return true;})()`,
    );
    expect(await evaluate(`textButton('Apply changes').disabled`)).toBe(false);
    await evaluate(
      `(async()=>{await textSub('Position');textButton('Upper half').click();await new Promise(requestAnimationFrame);return true;})()`,
    );
    expect(
      await evaluate(
        `(()=>{const n=document.querySelector('[aria-label="Select and move text 1"]');return (Number.parseFloat(n.style.top)+Number.parseFloat(n.style.height)/2)/1920;})()`,
      ),
    ).toBeCloseTo(0.25);
    const bounds = await evaluate(
      `(()=>{const n=document.querySelector('[aria-label="Select and move text 1"]');n.scrollIntoView({block:'center'});const r=n.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()`,
    );
    for (const [type, x, y] of [
      ["mouseMoved", bounds.x, bounds.y],
      ["mousePressed", bounds.x, bounds.y],
      ["mouseMoved", bounds.x + 16, bounds.y + 20],
      ["mouseReleased", bounds.x + 16, bounds.y + 20],
    ] as const)
      await page._client().send("Input.dispatchMouseEvent", {
        type,
        x,
        y,
        button: "left",
        buttons: type === "mouseReleased" ? 0 : 1,
        clickCount: 1,
      });
    const beforeKey = await evaluate(
      `(()=>{const n=document.querySelector('[aria-label="Select and move text 1"]');n.focus();return Number.parseFloat(n.style.left);})()`,
    );
    for (const type of ["keyDown", "keyUp"] as const)
      await page._client().send("Input.dispatchKeyEvent", {
        type,
        key: "ArrowLeft",
        code: "ArrowLeft",
        windowsVirtualKeyCode: 37,
      });
    expect(
      await evaluate(
        `Number.parseFloat(document.querySelector('[aria-label="Select and move text 1"]').style.left)`,
      ),
    ).toBeCloseTo(beforeKey - 1080 * 0.005);
    const resize = await evaluate(
      `(()=>{const n=document.querySelector('[aria-label="Resize text 1"]');n.scrollIntoView({block:'center'});const r=n.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()`,
    );
    await page._client().send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: resize.x, y: resize.y, id: 1 }],
    });
    await page._client().send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: resize.x - 10, y: resize.y - 10, id: 1 }],
    });
    await page
      ._client()
      .send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    expect(writes).toEqual([]);
    // Add/select another layer, then remove it without touching the first draft.
    await evaluate(
      `(async()=>{textButton('Add text').click();await waitText(()=>document.querySelectorAll('.text-choice').length===2);textButton('Remove text').click();await waitText(()=>document.querySelectorAll('.text-choice').length===1);await textSub('Style');return true;})()`,
    );
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    for (const [width, height] of [
      [1440, 1000],
      [1366, 682],
      [1280, 600],
      [390, 844],
      [320, 844],
    ] as const) {
      await page.setViewport({
        width,
        height,
        deviceScaleFactor: 1,
      });
      expect(
        await evaluate(
          `(async()=>{textPanel().scrollIntoView({block:'start'});await new Promise(requestAnimationFrame);const footer=document.querySelector('#sample-main > footer').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth,footer:footer.top>=0&&footer.bottom<=innerHeight+1,targets:[...textPanel().querySelectorAll('button,input,select')].filter(n=>n.getClientRects().length).every(n=>n.getBoundingClientRect().height>=44),tabs:document.querySelectorAll('[aria-label="Clip settings"] button').length};})()`,
        ),
      ).toEqual({ overflow: false, footer: true, targets: true, tabs: 5 });
      if (width >= 1280) {
        expect(
          await evaluate(
            `(async()=>{const panel=document.querySelector('.editor-panels'),video=document.querySelector('.editor-preview video'),target=[...textPanel().querySelectorAll('input,select')].filter(n=>n.getClientRects().length).at(-1);target.focus();target.scrollIntoView({block:'nearest'});await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);const bounds=target.getBoundingClientRect(),inspector=panel.getBoundingClientRect(),footer=document.querySelector('#sample-main > footer').getBoundingClientRect();return inspector.bottom<=footer.top+1 && bounds.top>=inspector.top-1 && bounds.bottom<=Math.min(inspector.bottom,footer.top)+1 && document.querySelector('.editor-preview video')===video;})()`,
          ),
        ).toBe(true);
      }
      const shot = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        resolve(`.local-build/evidence/cl086-text-${width}.png`),
        Buffer.from(shot.value.data, "base64"),
      );
    }
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    const typographyLabels = await evaluate(
      `[...textPanel().querySelectorAll('.typography-fields label')].map(n=>n.firstChild.textContent.trim().split(' (')[0])`,
    );
    await evaluate(
      `(async()=>{await textSetting('Captions');await textSub('Style');await textChange(textControl('Style'),'solid-block');await textChange(textControl('Animation'),'slide');return true;})()`,
    );
    expect(
      await evaluate(
        `[...textPanel().querySelectorAll('.typography-fields label')].map(n=>n.firstChild.textContent.trim().split(' (')[0])`,
      ),
    ).toEqual(typographyLabels);
    hold = true;
    await evaluate(
      `textButton('Apply changes').click();waitText(()=>document.querySelector('[aria-label="Clip settings"] button').disabled).then(()=>true)`,
    );
    hold = false;
    await evaluate(
      `waitText(()=>textButton('Export clip')&&!textButton('Apply changes')).then(()=>true)`,
    );
    expect(clip.edit?.texts?.[0]).toMatchObject({
      text: "A synthetic headline\nSecond line",
      startFrame: 15,
      endFrame: 60,
      style: { preset: "solid-block", fontSize: 72, fontWeight: 800 },
    });
    expect(clip.edit!.texts![0]!.style.box.x).toBeGreaterThan(0.1);
    expect(clip.edit!.texts![0]!.style.box.y).toBeGreaterThan(0.1);
    expect(clip.edit!.texts![0]!.style.box.width).toBeLessThan(0.8);
    expect(clip.edit!.captions).toMatchObject({
      preset: "solid-block",
      animation: "slide",
    });
    expect(clip.base!.overlay.captions[0]!.wordIds).toEqual([
      "w_000001",
      "w_000002",
    ]);
    const persisted = structuredClone(clip.edit);
    await ready();
    await evaluate(`textSetting('Text')`);
    expect(
      await evaluate(
        `document.querySelector('[aria-label="Text content"]').value`,
      ),
    ).toBe("A synthetic headline\nSecond line");
    await evaluate(`textSub('Style')`);
    expect(await evaluate(`textControl('Style').value`)).toBe("solid-block");
    expect(
      await evaluate(`document.querySelectorAll('[data-text-panel]').length`),
    ).toBe(1);
    await evaluate(
      `(async()=>{await textSetting('Captions');await textSub('Style');return true;})()`,
    );
    expect(await evaluate(`textControl('Animation').value`)).toBe("slide");
    await evaluate(
      `(async()=>{await textSetting('Text');await textSub('Content');return true;})()`,
    );
    stale = true;
    await evaluate(
      `(async()=>{await textChange(document.querySelector('[aria-label="Text content"]'),'Unsaved change');textButton('Apply changes').click();await waitText(()=>document.querySelector('.editor-warning')?.textContent.includes('changed elsewhere'));return true;})()`,
    );
    expect(clip.edit).toEqual(persisted);
    expect(writes.every((path) => path.endsWith("/edit"))).toBe(true);
    expect(writes).toHaveLength(2);
  } finally {
    hold = false;
    await browser.close({ silent: true });
    server.closeAllConnections();
    await new Promise<void>((done) => server.close(() => done()));
    await cleanup(directory);
  }
}, 100_000);

it("exports text-only TikTok, solid and alpha backgrounds at exact frame boundaries from the current shared tree", async () => {
  const directory = await scratch();
  try {
    const root = join(directory, "workspaces"),
      workspaceId = randomUUID(),
      clipId = randomUUID(),
      workspace = join(root, workspaceId);
    await mkdir(workspace, { recursive: true });
    const tools = await makeSource(join(workspace, "source.mp4"));
    const metadata = await inspectOwnerSource(
      join(workspace, "source.mp4"),
      tools,
      AbortSignal.timeout(10000),
    );
    const texts = (["tiktok", "solid", "translucent"] as const).map(
      (preset, index) => ({
        ...syntheticTextLayer(preset),
        text: "SYNTHETIC TEXT",
        startFrame: 10 + index * 25,
        endFrame: 30 + index * 25,
      }),
    );
    const clip = syntheticTextClip(),
      edit = {
        ...applyOwnerEdit(clip, {
          operationId: randomUUID(),
          expectedRevision: 0,
          baseHash: clip.baseHash,
          operations: [{ kind: "text-layers", layers: texts }],
        }),
        captionText: [],
      };
    const overlay = {
      ...compileOwnerOverlay(clip.base!, edit, []),
      captions: [],
    };
    const result = await renderOwnerClip(
      {
        root,
        tools,
        chromium: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        bundle: await prepareLocalOverlayFixture(directory),
        cache: new Map(),
      },
      {
        operation: "clip",
        workspaceId,
        clipId,
        jobId: randomUUID(),
        renderRevision: 0,
        cut: { startFrame: 0, endFrame: 90 },
        fingerprint: metadata.fingerprint,
        overlay,
      },
      AbortSignal.timeout(90_000),
    );
    expect(result).toMatchObject({ frames: 90, durationMs: 3000 });
    const output = join(workspace, `${clipId}.r0.mp4`),
      measured = await inspectOwnerSource(
        output,
        tools,
        AbortSignal.timeout(10000),
      );
    expect(measured).toMatchObject({
      width: 540,
      height: 960,
      fps: 30,
      durationMs: 3000,
    });
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    for (const [preset, at] of [
      ["tiktok", "0.5"],
      ["solid", "1.5"],
      ["translucent", "2.2"],
    ] as const)
      await runOwnedProcess(
        tools.ffmpeg,
        [
          "-nostdin",
          "-v",
          "error",
          "-ss",
          at,
          "-i",
          output,
          "-frames:v",
          "1",
          "-y",
          resolve(`.local-build/evidence/cl086-native-${preset}.png`),
        ],
        AbortSignal.timeout(10000),
      );
    const sample = async (frame: number) => {
      const raw = join(directory, `frame-${frame}.rgb`);
      await runOwnedProcess(
        tools.ffmpeg,
        [
          "-nostdin",
          "-v",
          "error",
          "-i",
          output,
          "-vf",
          `select=eq(n\\,${frame})`,
          "-frames:v",
          "1",
          "-f",
          "rawvideo",
          "-pix_fmt",
          "rgb24",
          raw,
        ],
        AbortSignal.timeout(10000),
      );
      const pixels = await readFile(raw);
      let white = 0,
        black = 0,
        alpha = 0;
      for (let y = 96; y < 288; y++)
        for (let x = 54; x < 486; x++) {
          const at = (y * 540 + x) * 3,
            r = pixels[at]!,
            g = pixels[at + 1]!,
            b = pixels[at + 2]!;
          if (r > 220 && g > 220 && b > 220) white++;
          if (r < 45 && g < 45 && b < 45) black++;
          if (r < 35 && g < 35 && b > 60 && b < 170) alpha++;
        }
      return { white, black, alpha };
    };
    for (const frame of [9, 30, 55, 80])
      expect(await sample(frame)).toEqual({ white: 0, black: 0, alpha: 0 });
    for (const frame of [10, 29]) {
      const pixels = await sample(frame);
      expect(pixels.white).toBeGreaterThan(30);
      expect(pixels.black).toBeGreaterThan(15);
    }
    for (const frame of [35, 54]) {
      const pixels = await sample(frame);
      expect(pixels.white).toBeGreaterThan(400);
      expect(pixels.black).toBeGreaterThan(15);
    }
    for (const frame of [60, 79]) {
      const pixels = await sample(frame);
      expect(pixels.white).toBeGreaterThan(30);
      expect(pixels.alpha).toBeGreaterThan(400);
    }
    expect(
      (await readdir(workspace)).some(
        (name) => name.startsWith("overlay-") || name.endsWith(".partial.mp4"),
      ),
    ).toBe(false);
  } finally {
    await cleanup(directory);
  }
}, 120_000);

it("exports a continuous opaque/alpha text panel and a highlight that slides between measured word bounds", async () => {
  const directory = await scratch();
  try {
    const root = join(directory, "workspaces"),
      workspaceId = randomUUID(),
      clipId = randomUUID(),
      workspace = join(root, workspaceId);
    await mkdir(workspace, { recursive: true });
    const tools = await makeSource(join(workspace, "source.mp4"));
    const metadata = await inspectOwnerSource(
      join(workspace, "source.mp4"),
      tools,
      AbortSignal.timeout(10000),
    );
    const layer = {
      ...syntheticTextLayer("solid-block"),
      text: "WWWWWWWW\nI",
      startFrame: 0,
      endFrame: 45,
    };
    const overlay = {
      ...syntheticTextClip().base!.overlay,
      texts: [
        layer,
        {
          ...layer,
          id: randomUUID(),
          startFrame: 45,
          endFrame: 90,
          style: { ...layer.style, backgroundOpacity: 0.5 },
        },
      ],
      captionStyle: {
        ...OWNER_CAPTION_PRESETS.tiktok,
        outlineWidth: 0,
        highlight: "#ff00ff",
        animation: "slide" as const,
        box: { x: 0.1, y: 0.6, width: 0.8, height: 0.2 },
      },
      captions: [
        {
          startMs: 0,
          endMs: 3000,
          text: "ONE TWO SIX",
          lines: ["ONE TWO SIX"],
          wordIds: ["w_000001", "w_000002", "w_000003"],
          wordCues: [
            { wordId: "w_000001", text: "ONE", startMs: 0, endMs: 500 },
            { wordId: "w_000002", text: "TWO", startMs: 500, endMs: 1000 },
            { wordId: "w_000003", text: "SIX", startMs: 1000, endMs: 1500 },
          ],
        },
      ],
    };
    const result = await renderOwnerClip(
      {
        root,
        tools,
        chromium: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        bundle: await prepareLocalOverlayFixture(directory),
        cache: new Map(),
      },
      {
        operation: "clip",
        workspaceId,
        clipId,
        jobId: randomUUID(),
        renderRevision: 0,
        cut: { startFrame: 0, endFrame: 90 },
        fingerprint: metadata.fingerprint,
        overlay,
      },
      AbortSignal.timeout(90000),
    );
    expect(result).toMatchObject({ frames: 90, durationMs: 3000 });
    const output = join(workspace, `${clipId}.r0.mp4`);
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    const samples = new Map<
      number,
      { panel: number[]; left: number; right: number; count: number }
    >();
    for (const frame of [14, 15, 16, 18, 60]) {
      const raw = join(directory, `slide-${frame}.rgb`);
      await runOwnedProcess(
        tools.ffmpeg,
        [
          "-nostdin",
          "-v",
          "error",
          "-i",
          output,
          "-vf",
          `select=eq(n\\,${frame})`,
          "-frames:v",
          "1",
          "-f",
          "rawvideo",
          "-pix_fmt",
          "rgb24",
          raw,
        ],
        AbortSignal.timeout(10000),
      );
      const pixels = await readFile(raw);
      let left = 540,
        right = 0,
        count = 0;
      for (let y = 576; y < 768; y++)
        for (let x = 54; x < 486; x++) {
          const i = (y * 540 + x) * 3;
          if (pixels[i]! > 180 && pixels[i + 1]! < 80 && pixels[i + 2]! > 180) {
            left = Math.min(left, x);
            right = Math.max(right, x);
            count++;
          }
        }
      samples.set(frame, {
        panel: [
          ...pixels.subarray((214 * 540 + 190) * 3, (214 * 540 + 190) * 3 + 3),
        ],
        left,
        right,
        count,
      });
      await runOwnedProcess(
        tools.ffmpeg,
        [
          "-nostdin",
          "-v",
          "error",
          "-i",
          output,
          "-vf",
          `select=eq(n\\,${frame})`,
          "-frames:v",
          "1",
          "-y",
          resolve(`.local-build/evidence/cl092-native-${frame}.png`),
        ],
        AbortSignal.timeout(10000),
      );
    }
    const before = samples.get(14)!,
      onset = samples.get(15)!,
      moving = samples.get(16)!,
      settled = samples.get(18)!,
      silent = samples.get(60)!;
    expect(onset.count).toBeGreaterThan(100);
    expect(Math.abs(onset.left - before.left)).toBeLessThanOrEqual(2);
    expect(moving.left).toBeGreaterThan(onset.left + 5);
    expect(moving.left).toBeLessThan(settled.left - 5);
    expect(moving.right).toBeLessThan(settled.right - 5);
    expect(silent.count).toBe(0);
    expect(before.panel.every((channel) => channel > 230)).toBe(true);
    expect(silent.panel[0]).toBeGreaterThan(110);
    expect(silent.panel[0]).toBeLessThan(150);
    expect(silent.panel[1]).toBeGreaterThan(110);
    expect(silent.panel[1]).toBeLessThan(150);
    expect(silent.panel[2]).toBeGreaterThan(230);
    expect(
      (await readdir(workspace)).some(
        (name) => name.startsWith("overlay-") || name.endsWith(".partial.mp4"),
      ),
    ).toBe(false);
  } finally {
    await cleanup(directory);
  }
}, 120_000);
