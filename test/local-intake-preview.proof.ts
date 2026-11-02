import { expect, it } from "vitest";
import { createServer } from "node:http";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { prepareLocalControlsFixture } from "./owner-controls-browser.ts";
import { listenOwner } from "./owner-http.ts";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { fakeOwnerAcquisition } from "../apps/backend/local/fake-acquisition.ts";
import { canonicalOwnerYoutubeSource } from "../apps/backend/local/youtube-url.ts";
import { ownerSourceImportSchema } from "../packages/contracts/local/acquisition-flow.ts";

declare global {
  function intakeChooseSaved(
    waitForFrame?: boolean,
  ): Promise<Record<string, unknown>>;
  function intakeLayout(): Record<string, unknown>;
  function intakeDrop(): Promise<boolean>;
  function intakePicker(): boolean;
  function intakeOverflow(): boolean;
  function intakeFallback(): Promise<boolean>;
  function intakeFooterVisible(): boolean;
  function intakeHostedReady(): Promise<boolean>;
}

async function clearIntakeScratch(directory: string) {
  if (resolve(directory, "..") !== resolve(tmpdir()))
    throw new Error("intake_scratch_path_invalid");
  await rm(directory, { recursive: true, force: true });
}

// Current UI, generated MP4 and loopback-only fake APIs; never owner media/config.
it("decodes saved frames and keeps responsive intake controls and upload areas usable", async () => {
  const directory = await mkdtemp(
    join(tmpdir(), "clipbuilder-intake-preview-"),
  );
  let ui = "",
    bytes = Buffer.alloc(0),
    lookupCalls = 0,
    metadataCalls = 0,
    uploads = 0,
    previewReads = 0;
  let stalled = false;
  let metadataUnavailable = false;
  let stalledStreams = 0;
  let hosted = false;
  let codex = false;
  const requests: string[] = [];
  const sourceImports: ReturnType<typeof ownerSourceImportSchema.parse>[] = [];
  const offer = await fakeOwnerAcquisition.metadata(
    canonicalOwnerYoutubeSource("https://youtu.be/synthetic01"),
    new AbortController().signal,
  );
  const choice = offer.choices.find((item) => item.tier === 720)!;
  const saved = {
    id: crypto.randomUUID(),
    sourceId: offer.sourceId,
    mode: "provider-source",
    acquiredAt: "2026-10-25T00:00:00Z",
    selection: { kind: "variant" },
    video: choice.video,
    audio: choice.audio,
    actual: {
      fingerprint: "a".repeat(64),
      bytes: 8,
      durationMs: 8000,
      width: 1280,
      height: 720,
      fps: 30,
    },
    offsetMs: 0,
    state: "ready",
  };
  const server = createServer((request, response) => {
    response.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; media-src 'self' blob:; img-src 'self' data:; connect-src 'self'",
    );
    const path = request.url ?? "";
    const json = (value: unknown, status = 200) =>
      response
        .writeHead(status, { "Content-Type": "application/json" })
        .end(JSON.stringify(value));
    if (path === "/api/local/capabilities") {
      json(
        hosted
          ? {
              execution: "hosted",
              aiMode: "synthetic-ai",
              sourceMode: null,
              planningAvailable: true,
              localMedia: false,
              cloud: true,
            }
          : {
              aiMode: "synthetic-ai",
              sourceMode: "provider-source",
              planningAvailable: true,
              localMedia: true,
              cloud: false,
              ...(codex ? { aiProvider: "codex" } : {}),
            },
      );
      return;
    }
    if (
      path === "/api/local/workspace" ||
      path === "/api/local/sources/state"
    ) {
      json(null);
      return;
    }
    if (path === "/api/local/session" && request.method === "GET") {
      json({ active: false, limited: false, retryAt: null });
      return;
    }
    if (path === "/api/local/sources/lookup" && request.method === "POST") {
      request.resume();
      lookupCalls++;
      json({
        sourceId: offer.sourceId,
        mode: "provider-source",
        metadataAvailable: true,
        saved: [{ destination: "downloads", variant: saved }],
      });
      return;
    }
    if (path === "/api/local/open/video" && request.method === "POST") {
      request.resume();
      uploads++;
      json({ error: "synthetic_open_failure" }, 400);
      return;
    }
    if (path === "/api/local/sources/metadata" && request.method === "POST") {
      request.resume();
      metadataCalls++;
      if (metadataUnavailable) {
        json({ error: "unavailable" }, 503);
        return;
      }
      json({ ...offer, mode: "provider-source" });
      return;
    }
    if (path === "/api/local/sources/import" && request.method === "POST") {
      void (async () => {
        const chunks: Buffer[] = [];
        for await (const chunk of request) chunks.push(Buffer.from(chunk));
        sourceImports.push(
          ownerSourceImportSchema.parse(
            JSON.parse(Buffer.concat(chunks).toString()),
          ),
        );
        json(
          {
            id: crypto.randomUUID(),
            mode: "provider-source",
            stage: "failed",
            downloadedBytes: 0,
            totalBytes: null,
            variantId: null,
            error: "unsupported",
            diagnostic: "acquisition_section_unsupported",
          },
          202,
        );
      })().catch(() => response.destroy());
      return;
    }
    if (path === `/api/local/sources/downloads/${saved.id}/preview`) {
      previewReads++;
      if (stalled) {
        stalledStreams++;
        response.once("close", () => stalledStreams--);
        return;
      }
      const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
      const start = Number(range?.[1] ?? 0);
      const end = Math.min(
        Number(range?.[2] || bytes.length - 1),
        bytes.length - 1,
        start + 512 * 1024 - 1,
      );
      if (!range || start > end) {
        response.writeHead(416).end();
        return;
      }
      response
        .writeHead(206, {
          "Content-Type": "video/mp4",
          "Content-Length": end - start + 1,
          "Content-Range": `bytes ${start}-${end}/${bytes.length}`,
          "Accept-Ranges": "bytes",
          "Cache-Control": "no-store",
        })
        .end(bytes.subarray(start, end + 1));
      return;
    }
    if (["/", "/app.js", "/app.css"].includes(path)) {
      const file = path === "/" ? "index.html" : path.slice(1);
      void readFile(join(ui, file)).then((content) =>
        response
          .writeHead(200, {
            "Content-Type": file.endsWith("js")
              ? "text/javascript"
              : file.endsWith("css")
                ? "text/css"
                : "text/html",
          })
          .end(content),
      );
      return;
    }
    if (path === "/favicon.ico") {
      response.writeHead(204).end();
      return;
    }
    requests.push(`${request.method} ${path}`);
    response.writeHead(404).end();
  });
  let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
  try {
    ui = await prepareLocalControlsFixture(directory);
    const tools = await ownerNativeTools(resolve("."));
    const video = join(directory, "generated.mp4");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-f",
        "lavfi",
        "-i",
        "testsrc2=size=1280x720:rate=30",
        "-t",
        "8",
        "-an",
        "-vf",
        "drawbox=x=0:y=0:w=iw:h=ih:color=0x235b9d:t=fill:enable='lt(t,1.5)'",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "25",
        "-g",
        "240",
        "-pix_fmt",
        "yuv420p",
        "-threads",
        "2",
        video,
      ],
      AbortSignal.timeout(15000),
    );
    bytes = await readFile(video);
    saved.actual.bytes = bytes.length;
    expect(bytes.length).toBeGreaterThan(512 * 1024);
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
    const driver = `
      const wait=async fn=>{for(let i=0;i<200;i++){const result=fn();if(result)return result;await new Promise(done=>setTimeout(done,50));}throw new Error('intake_wait_timeout');};
      // Exercise the previously missing readiness path: decode without seeked.
      document.addEventListener('seeked',event=>event.stopImmediatePropagation(),true);
      globalThis.intakeLayout=()=>{
        const card=document.querySelector('.youtube-card'),body=card.querySelector('.source-card-body'),upload=document.querySelector('.upload-card'),drop=upload.querySelector('.upload-drop-area');
        const footer=card.querySelector('footer'),video=card.querySelector('video');
        return {bodyHeight:body.clientHeight,bodyScroll:body.scrollHeight,bodyFits:body.scrollHeight<=body.clientHeight+1,overflow:document.documentElement.scrollWidth>innerWidth,drop:!!drop,dropFits:!!drop && drop.getBoundingClientRect().bottom<=upload.querySelector('footer').getBoundingClientRect().top+1,footerFits:footer.scrollWidth<=footer.clientWidth,frameLoaded:video?.dataset.loaded==='true',readyState:video?.readyState,time:video?.currentTime,paused:video?.paused,muted:video?.muted};
      };
      globalThis.intakeChooseSaved=async(waitForFrame=true)=>{
        const input=await wait(()=>document.querySelector('.youtube-card input:enabled'));
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'https://youtu.be/synthetic01');input.dispatchEvent(new Event('input',{bubbles:true}));
        await new Promise(requestAnimationFrame);
        [...document.querySelectorAll('.youtube-card button')].find(node=>node.textContent.trim()==='Continue').click();
        await wait(()=>document.querySelector('.youtube-preview video'));
        if(waitForFrame)await wait(()=>document.querySelector('.youtube-preview video')?.dataset.loaded==='true');
        return globalThis.intakeLayout();
      };
      globalThis.intakeDrop=async()=>{
        const transfer=new DataTransfer();transfer.items.add(new File(['synthetic'],'generated.mp4',{type:'video/mp4'}));
        document.querySelector('.upload-drop-area').dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:transfer}));
        await wait(()=>document.querySelector('[role="status"]')?.textContent.includes('Couldn’t open') || document.body.textContent.includes('Couldn’t open'));
        return !!document.querySelector('.upload-drop-area');
      };
      globalThis.intakePicker=()=>{
        const input=document.querySelector('.upload-card input'),button=document.querySelector('.upload-card button');
        let opened=0;input.addEventListener('click',event=>{event.preventDefault();opened++;},{once:true});
        button.focus();button.click();
        return opened===1 && document.activeElement===button && !button.disabled;
      };
      globalThis.intakeOverflow=()=>{
        const body=document.querySelector('.youtube-card .source-card-body');
        const message=body.querySelector('.flow-notice');
        message.textContent='Synthetic error detail. '.repeat(20);
        body.scrollTop=body.scrollHeight;
        return body.scrollHeight>body.clientHeight && body.scrollTop>0 && getComputedStyle(body).overflowY==='auto';
      };
      globalThis.intakeFallback=async()=>{
        for(let i=0;i<400;i++){
          const frame=document.querySelector('.youtube-thumbnail');
          if(frame?.querySelector('svg:not(.acquisition-spinner)') && !frame.querySelector('video') && !frame.querySelector('.acquisition-spinner'))
            return ![...document.querySelectorAll('.youtube-card button')].find(node=>node.textContent.trim()==='Use video')?.disabled;
          await new Promise(done=>setTimeout(done,50));
        }
        return false;
      };
      globalThis.intakeFooterVisible=()=>[...document.querySelectorAll('.source-card-footer')].some(node=>{const rect=node.getBoundingClientRect();return rect.top>=0 && rect.bottom<=innerHeight;});
      globalThis.intakeHostedReady=async()=>{
        const card=await wait(()=>document.querySelector('.upload-card .upload-drop-area'));
        return !!card && !document.querySelector('.youtube-card') && !document.querySelector('.upload-card a[href*="sample"]') && document.documentElement.scrollWidth<=innerWidth;
      };
    `;
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.goto({ url: `http://localhost:${port}/`, timeout: 15000 });
    await page._client().send("Runtime.evaluate", { expression: driver });
    const initial = await page.evaluate(() => globalThis.intakeChooseSaved());
    expect(initial).toMatchObject({
      frameLoaded: true,
      paused: true,
      muted: true,
      time: 2,
    });
    const evidence = resolve(".local-build/evidence");
    await mkdir(evidence, { recursive: true });
    for (const [width, height] of [
      [1440, 900],
      [390, 844],
      [320, 568],
    ] as const) {
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      const layout = await page.evaluate(() => globalThis.intakeLayout());
      expect(layout).toMatchObject({
        bodyFits: true,
        overflow: false,
        drop: true,
        dropFits: true,
        footerFits: true,
        frameLoaded: true,
      });
      const capture = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        join(evidence, `cl067-intake-${width}.png`),
        Buffer.from(capture.value.data, "base64"),
      );
      if (width < 500) {
        for (const card of ["upload", "youtube"]) {
          await page._client().send("Runtime.evaluate", {
            expression: `document.querySelector('.${card}-card footer').scrollIntoView({block:'end'})`,
          });
          expect(
            await page.evaluate(() => globalThis.intakeFooterVisible()),
          ).toBe(true);
          const visible = await page._client().send("Page.captureScreenshot", {
            format: "png",
            fromSurface: true,
          });
          await writeFile(
            join(evidence, `cl067-${card}-${width}.png`),
            Buffer.from(visible.value.data, "base64"),
          );
        }
      }
    }
    expect(await page.evaluate(() => globalThis.intakePicker())).toBe(true);
    expect(await page.evaluate(() => globalThis.intakeOverflow())).toBe(true);
    expect(await page.evaluate(() => globalThis.intakeDrop())).toBe(true);
    expect(uploads).toBe(1);
    expect(lookupCalls).toBe(1);
    expect(previewReads).toBeGreaterThan(1);
    expect(requests).toEqual([]);
    stalled = true;
    await page.goto({ url: `http://localhost:${port}/`, timeout: 15000 });
    await page._client().send("Runtime.evaluate", { expression: driver });
    expect(
      await page.evaluate(() => globalThis.intakeChooseSaved(false)),
    ).toMatchObject({ frameLoaded: false });
    expect(await page.evaluate(() => globalThis.intakeFallback())).toBe(true);
    await new Promise((done) => setTimeout(done, 100));
    expect(stalledStreams).toBe(0);
    expect(requests).toEqual([]);
    codex = true;
    stalled = false;
    await page.goto({ url: `http://localhost:${port}/`, timeout: 15000 });
    await page._client().send("Runtime.evaluate", { expression: driver });
    await page.evaluate(() => globalThis.intakeChooseSaved());
    const evaluateQuality = async (expression: string) => {
      const result = await page._client().send("Runtime.evaluate", {
        expression,
        awaitPromise: true,
        returnByValue: true,
      });
      if (result.value.exceptionDetails) throw Error("quality_browser_failed");
      return result.value.result.value;
    };
    expect(metadataCalls).toBe(0);
    expect(
      await evaluateQuality(
        `(()=>{const card=document.querySelector('.youtube-card');const select=card.querySelector('select.select-control');return {audio:!!card.querySelector('[aria-label="Audio track"]'),highest:!!card.querySelector('option[value="highest"]'),other:!!card.querySelector('option[value="other-resolutions"]'),saved:select.value.startsWith('saved:'),enabled:!select.disabled};})()`,
      ),
    ).toEqual({
      audio: false,
      highest: false,
      other: true,
      saved: true,
      enabled: true,
    });
    // A real keyboard selection can request other qualities; failure keeps cached use.
    metadataUnavailable = true;
    await evaluateQuality(
      `document.querySelector('.youtube-card select.select-control').focus()`,
    );
    for (const type of ["keyDown", "keyUp"] as const)
      await page._client().send("Input.dispatchKeyEvent", {
        type,
        key: "End",
        code: "End",
        windowsVirtualKeyCode: 35,
      });
    await evaluateQuality(
      `(async()=>{await wait(()=>document.querySelector('.youtube-card .flow-notice').textContent.includes('Couldn’t load resolutions.'));await wait(()=>!document.querySelector('.youtube-card select').disabled);return true;})()`,
    );
    expect(metadataCalls).toBe(1);
    expect(
      await evaluateQuality(
        `(()=>{const card=document.querySelector('.youtube-card');return {saved:card.querySelector('select.select-control').value.startsWith('saved:'),use:[...card.querySelectorAll('button')].some(b=>b.textContent.trim()==='Use video'&&!b.disabled),retry:!!card.querySelector('option[value="other-resolutions"]')};})()`,
      ),
    ).toEqual({ saved: true, use: true, retry: true });
    metadataUnavailable = false;
    await evaluateQuality(
      `(async()=>{const menu=document.querySelector('.youtube-card select.select-control');menu.value='other-resolutions';menu.dispatchEvent(new Event('change',{bubbles:true}));await wait(()=>[...document.querySelectorAll('.youtube-card option')].some(n=>n.textContent.startsWith('2160p')));const select=document.querySelector('.youtube-card select.select-control');select.value='highest';select.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(requestAnimationFrame);return true;})()`,
    );
    expect(metadataCalls).toBe(2);
    expect(sourceImports).toEqual([]);
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
        await evaluateQuality(
          `(async()=>{const card=document.querySelector('.youtube-card');card.querySelector('footer').scrollIntoView({block:'end'});await new Promise(requestAnimationFrame);return {overflow:document.documentElement.scrollWidth>innerWidth,highest:card.textContent.includes('Highest · 2160p'),audio:!!card.querySelector('[aria-label="Audio track"]'),footer:card.querySelector('footer').getBoundingClientRect().bottom<=innerHeight+1};})()`,
        ),
      ).toEqual({ overflow: false, highest: true, audio: false, footer: true });
      const shot = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        join(evidence, `cl195-quality-${width}.png`),
        Buffer.from(shot.value.data, "base64"),
      );
    }
    expect(requests).toEqual([]);
    await evaluateQuality(
      `(async()=>{const card=document.querySelector('.youtube-card'),select=card.querySelector('select.select-control');const online=[...select.options].find(o=>o.parentElement.label==='Available to download'&&o.textContent.startsWith('1080p'));select.value=online.value;select.dispatchEvent(new Event('change',{bubbles:true}));await wait(()=>[...card.querySelectorAll('button')].find(b=>b.textContent.trim()==='Download video'&&!b.disabled));[...card.querySelectorAll('button')].find(b=>b.textContent.trim()==='Download video').click();await wait(()=>card.querySelector('.download-outcome')?.textContent==='Download failed');return true;})()`,
    );
    expect(sourceImports).toEqual([
      expect.objectContaining({
        request: expect.objectContaining({
          choiceId: offer.choices.find((item) => item.tier === 1080)!.id,
          selection: { kind: "variant" },
        }),
      }),
    ]);
    expect(
      (sourceImports[0] as { request: Record<string, unknown> }).request.window,
    ).toBeUndefined();
    expect(saved.actual.height).toBe(720);
    expect(metadataCalls).toBe(2);
    await evaluateQuality(
      `(async()=>{const tab=text=>[...document.querySelectorAll('.acquisition-tabs button')].find(b=>b.textContent===text);tab('Range').click();await wait(()=>document.querySelector('[aria-label="Download range"]'));const select=document.querySelector('[aria-label="Download range"]');select.value='section';select.dispatchEvent(new Event('change',{bubbles:true}));await wait(()=>document.querySelector('[aria-label="Download start"]'));const set=(label,value)=>{const input=document.querySelector('[aria-label="'+label+'"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));};set('Download start','00:00:02');set('Download end','00:00:09');await new Promise(requestAnimationFrame);tab('Quality').click();await new Promise(requestAnimationFrame);const quality=document.querySelector('select.select-control');quality.value='highest';quality.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(requestAnimationFrame);tab('Range').click();await wait(()=>document.querySelector('[aria-label="Download end"]'));return true;})()`,
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
      expect(
        await evaluateQuality(
          `(async()=>{const input=document.querySelector('[aria-label="Download end"]');input.scrollIntoView({block:'center'});await new Promise(requestAnimationFrame);const footer=document.querySelector('.youtube-card footer'),r=footer.getBoundingClientRect();return {start:document.querySelector('[aria-label="Download start"]').value,end:input.value,overflow:document.documentElement.scrollWidth>innerWidth,anchored:footer.parentElement.classList.contains('source-card')};})()`,
        ),
      ).toEqual({
        start: "00:00:02",
        end: "00:00:09",
        overflow: false,
        anchored: true,
      });
      const shot = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        join(evidence, `cl188-section-${width}.png`),
        Buffer.from(shot.value.data, "base64"),
      );
    }
    expect(sourceImports).toHaveLength(1);
    await evaluateQuality(
      `document.querySelector('[aria-label="Download start"]').focus()`,
    );
    for (const type of ["keyDown", "keyUp"] as const)
      await page._client().send("Input.dispatchKeyEvent", {
        type,
        key: "Tab",
        code: "Tab",
        windowsVirtualKeyCode: 9,
      });
    expect(
      await evaluateQuality(
        `document.activeElement.getAttribute('aria-label')`,
      ),
    ).toBe("Download end");
    await evaluateQuality(
      `(async()=>{[...document.querySelectorAll('.youtube-card button')].find(b=>b.textContent.trim()==='Download video').click();await wait(()=>document.body.textContent.includes('Retry or choose Entire video.'));return true;})()`,
    );
    expect(sourceImports).toEqual([
      expect.objectContaining({
        request: expect.objectContaining({
          choiceId: offer.choices.find((item) => item.tier === 1080)!.id,
        }),
      }),
      expect.objectContaining({
        request: expect.objectContaining({
          window: { startMs: 2000, endMs: 9000 },
          choiceId: offer.choices.find((item) => item.tier === 2160)!.id,
        }),
      }),
    ]);
    // The same upload area remains usable in the upload-only hosted view.
    hosted = true;
    const hostedDirectory = join(directory, "hosted");
    await mkdir(hostedDirectory);
    ui = await prepareLocalControlsFixture(hostedDirectory, true);
    for (const [width, height] of [
      [1440, 900],
      [390, 844],
      [320, 568],
    ] as const) {
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      await page.goto({ url: `http://localhost:${port}/`, timeout: 15000 });
      await page._client().send("Runtime.evaluate", { expression: driver });
      expect(await page.evaluate(() => globalThis.intakeHostedReady())).toBe(
        true,
      );
    }
    expect(uploads).toBe(1);
    expect(requests).toEqual([]);
  } finally {
    await browser?.close({ silent: true });
    server.closeAllConnections();
    await new Promise<void>((done) => server.close(() => done()));
    expect(server.listening).toBe(false);
    await clearIntakeScratch(directory);
  }
}, 60_000);
