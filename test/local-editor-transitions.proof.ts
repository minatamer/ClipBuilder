import { expect, it } from "vitest";
import { transform } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { startHookEditorFixture } from "./owner-hook-browser-fixture.ts";
import { ownerRequest } from "./owner-http.ts";
import { withIndependentOwnerHook } from "../packages/contracts/local/hook-content.ts";
import { ownerCameraFollowKey } from "../packages/contracts/local/camera-follow.ts";

declare global {
  function editorGesture(
    kind: string,
  ): Promise<{ x: number; y: number; errors: string[] }>;
  function editorTransitions(): Promise<{ actions: number; errors: string[] }>;
}
it("survives real Next development Camera/Zoom/Motion and image edit transitions with isolated fake HTTP", async () => {
  const fixture = await startHookEditorFixture(undefined, {
    durationFrames: 240,
    configure(clip) {
      clip.assets.push({ ...clip.assets[0]!, id: crypto.randomUUID() });
      const base = clip.base!,
        focus = base.overlay.focus!;
      base.overlay.frames = 240;
      base.cut.endFrame = 240;
      focus.frames = 240;
      focus.people = ["person_1", "person_2"].map((id, i) => ({
        id,
        observations: [
          {
            startFrame: 0,
            endFrame: 240,
            box: { x: 0.1 + i * 0.5, y: 0.1, width: 0.3, height: 0.7 },
          },
        ],
      }));
      focus.shots = Array.from({ length: 4 }, (_, i) => ({
        ...focus.shots[0]!,
        personId: focus.people[i % 2]!.id,
        startFrame: i * 60,
        endFrame: (i + 1) * 60,
        centerX: i % 2 ? 0.7 : 0.3,
      }));
      clip.edit!.focus = structuredClone(focus);
      clip.edit!.cameraTracks = [
        {
          id: crypto.randomUUID(),
          occurrence: "body",
          personId: "person_1",
          startFrame: 0,
          endFrame: 30,
          sourceStartFrame: 0,
          focusKey: ownerCameraFollowKey(focus, "person_1"),
          seed: { x: 0.2, y: 0.3, width: 0.1, height: 0.1 },
          outcome: "complete",
          points: Array.from({ length: 16 }, (_, i) => Math.min(i * 2, 29)).map(
            (frame) => ({ frame, x: 0.25 + frame / 2000, y: 0.35 }),
          ),
        },
      ];
      delete clip.edit!.hookContent;
      clip.edit = withIndependentOwnerHook(base, clip.edit!, clip.assets, [], {
        startFrame: 60,
        endFrame: 120,
      });
    },
  });
  let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
  let closing = false,
    external = 0,
    intercepted = 0,
    interceptionFailures = 0;
  const pending = new Set<Promise<void>>();
  try {
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
      }),
      client = page._client();
    // Every API request is fulfilled from the generated fixture. No normal app
    // API, workspace, draft, saved media or processing route can be reached.
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
          if (url.pathname.startsWith("/api/")) {
            intercepted++;
            const result = await ownerRequest(
              Number(new URL(fixture.url).port),
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
          if (url.port !== "3000") throw Error("unexpected_editor_origin");
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
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.goto({ url: "http://localhost:3000/start", timeout: 60000 });
    const driver = await transform(
      `globalThis.editorTransitions=async()=>{
      const errors:string[]=[];let actions=0;const original=console.error;console.error=(...args)=>{const text=args.filter(a=>typeof a==='string').join(' ');if(/Maximum update depth|Too many re-renders|should be cached/.test(text))errors.push(text);original(...args)};
      const wait=async(fn:()=>unknown,label:string)=>{for(let i=0;i<600;i++){if(errors.length)throw Error('react_cycle_'+label+'_'+errors[0]);if(fn())return;await new Promise(r=>setTimeout(r,10))}throw Error('transition_not_ready_'+label+'_'+document.body.innerText.slice(-500))};
      const pause=()=>new Promise(r=>setTimeout(r,35));
      const tab=async(group:string,name:string)=>{const find=()=>[...document.querySelectorAll<HTMLButtonElement>('[role="tablist"][aria-label="'+group+'"] [role="tab"]')].find(b=>b.textContent===name);await wait(()=>find()&&!find()!.disabled,'tab_'+group+'_'+name);find()!.click();actions++;await wait(()=>find()?.getAttribute('aria-selected')==='true','selected_'+name);await pause()};
      const button=(name:string)=>[...document.querySelectorAll<HTMLButtonElement>('button')].find(b=>b.textContent?.trim()===name&&!b.closest('[hidden]'));
      const input=(name:string)=>document.querySelector<HTMLInputElement>('input[aria-label="'+name+'"]');
      const set=async(name:string,value:string)=>{const n=input(name);if(!n)throw Error('missing_input_'+name);Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(n,value);n.dispatchEvent(new Event('input',{bubbles:true}));actions++;await pause()};
      const key=async(selector:string,key:string)=>{const n=document.querySelector<HTMLElement>(selector);if(!n)throw Error('missing_key_'+selector);n.focus();n.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true}));actions++;await pause()};
      await wait(()=>document.querySelector('.editor-panels:not([hidden])'),'editor');
      for(let round=0;round<8;round++){
        await tab('Clip settings','Camera');
        for(const row of [...document.querySelectorAll<HTMLButtonElement>('[aria-label="Camera timeline"] button')]){row.click();actions++;await pause()}
        await tab('Focus controls','Camera');await tab('Camera controls','Advanced');
        for(const value of ['', '1.2','3.1','1'])await set('Camera zoom',value);
        await key('.numbered-focus-preview .focus-person-handle','ArrowRight');
        await tab('Focus controls','Zoom');
        if(!input('Zoom magnification')){button('Add at playhead')!.click();actions++;await wait(()=>input('Zoom magnification'),'add_zoom')}
        for(const value of ['','1.6','9','1.5'])await set('Zoom magnification',value);
        for(const value of ['','0.3','1'])await set('Zoom duration seconds',value);
        await key('[aria-label="Zoom target"]','ArrowRight');
        await tab('Focus controls','Motion');
        document.querySelector<HTMLButtonElement>('[data-timeline-key="body:camera:2"]')!.click();actions++;
        await wait(()=>{const v=document.querySelector<HTMLVideoElement>('.editor-preview video[data-editor-active="true"]');return v&&!v.seeking&&v.readyState>=3&&Math.abs(v.currentTime-4)<.01&&button('Add at playhead')&&!button('Add at playhead')!.disabled},'motion_capture_ready');await new Promise(r=>setTimeout(r,100));
        button('Add at playhead')!.click();actions++;await wait(()=>button('Cancel'),'motion_draft');
        button('Cancel')!.click();actions++;await pause();
        await tab('Clip settings','Media');await tab('Media controls','Pictures');
        button('Add picture')!.click();actions++;await pause();
        await tab('Picture controls','Timing');for(const value of ['','0','0.1'])await set('Picture start seconds',value);
        await tab('Picture controls','Position');document.querySelector<HTMLButtonElement>('[aria-label="Picture timeline"] button[aria-pressed="true"]')!.click();actions++;await wait(()=>document.querySelector('.editor-layer.selected[aria-label^="Select and move picture"]'),'picture_visible');await key('.editor-layer.selected[aria-label^="Select and move picture"]','ArrowRight');
        await tab('Picture controls','Image');button('Remove picture')!.click();actions++;await pause();
        if(round%2){button('Discard changes')!.click();actions++;await wait(()=>!button('Apply changes'),'discard')}
        else{await wait(()=>button('Apply changes')&&!button('Apply changes')!.disabled,'apply_ready');button('Apply changes')!.click();actions++;await wait(()=>button('Add more clips')&&![...document.querySelectorAll<HTMLButtonElement>('[aria-label="Clip settings"] button')].some(b=>b.disabled),'apply')}
      }
      globalThis.editorGesture=async(kind:string)=>{
        if(kind==='done'){console.error=original;return{x:0,y:0,errors}};
        if(kind==='commit'){await wait(()=>button('Apply changes')&&!button('Apply changes')!.disabled,'gesture_apply');button('Apply changes')!.click();await wait(()=>button('Add more clips'),'gesture_saved');return{x:0,y:0,errors}}
        if(kind==='finish-motion'){button('Cancel')?.click();await pause();return{x:0,y:0,errors}}
        let target:HTMLElement|null=null;
        if(kind==='camera'){
          await tab('Clip settings','Camera');await tab('Focus controls','Camera');document.querySelector<HTMLButtonElement>('[data-timeline-key="body:camera:0"]')!.click();await pause();target=document.querySelector('.focus-person-handle');
        }else if(kind==='zoom'){
          await tab('Focus controls','Zoom');await wait(()=>button('Add at playhead')&&!button('Add at playhead')!.disabled,'gesture_zoom_ready');button('Add at playhead')!.click();await wait(()=>document.querySelector('[aria-label="Zoom target"]'),'gesture_zoom_added');target=document.querySelector('[aria-label="Zoom target"]');
        }else if(kind==='motion'){
          await tab('Focus controls','Motion');document.querySelector<HTMLButtonElement>('[data-timeline-key="body:camera:2"]')!.click();await wait(()=>{const v=document.querySelector<HTMLVideoElement>('.editor-preview video[data-editor-active="true"]');return v&&!v.seeking&&Math.abs(v.currentTime-4)<.01&&button('Add at playhead')&&!button('Add at playhead')!.disabled},'gesture_motion_ready');await new Promise(r=>setTimeout(r,100));button('Add at playhead')!.click();await wait(()=>document.querySelector('[aria-label="Head to follow"]'),'gesture_head');target=document.querySelector('[aria-label="Head to follow"]');
        }else if(kind==='image'){
          await tab('Clip settings','Media');await tab('Media controls','Pictures');button('Add picture')!.click();await pause();const image=document.querySelector<HTMLSelectElement>('[aria-label="Picture controls"]')?.closest('fieldset')?.querySelector<HTMLSelectElement>('select');if(!image||image.options.length<2)throw Error('replacement_image_missing');const replacement=image.options[1]!.value;Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value')!.set!.call(image,replacement);image.dispatchEvent(new Event('change',{bubbles:true}));await pause();if(image.value!==replacement)throw Error('replacement_image_not_selected');
          document.querySelector<HTMLButtonElement>('[aria-label="Picture timeline"] button[aria-pressed="true"]')!.click();await wait(()=>document.querySelector('.editor-layer.selected[aria-label^="Select and move picture"]'),'gesture_image');target=document.querySelector('.editor-layer.selected[aria-label^="Select and move picture"]');
        }
        if(!target)throw Error('gesture_target_'+kind);target.scrollIntoView({block:'center',inline:'center'});await pause();const rect=target.getBoundingClientRect();return{x:rect.left+rect.width*.5,y:rect.top+rect.height*.5,errors};
      };return{actions,errors};
    };`,
      { loader: "ts" },
    );
    await page.evaluate(driver.code);
    const result = await page.evaluate(() => editorTransitions());
    let gestures = 0;
    for (let round = 0; round < 4; round++) {
      for (const kind of ["camera", "zoom", "motion", "image"]) {
        const point = await page.evaluate((kind) => editorGesture(kind), kind);
        expect(point.errors).toEqual([]);
        await client.send("Input.dispatchMouseEvent", {
          type: "mouseMoved",
          x: point.x,
          y: point.y,
        });
        await client.send("Input.dispatchMouseEvent", {
          type: "mousePressed",
          x: point.x,
          y: point.y,
          button: "left",
          clickCount: 1,
        });
        for (let n = 1; n <= 24; n++)
          await client.send("Input.dispatchMouseEvent", {
            type: "mouseMoved",
            x: point.x + n * 0.3,
            y: point.y + n * 0.2,
            buttons: 1,
          });
        await client.send("Input.dispatchMouseEvent", {
          type: "mouseReleased",
          x: point.x + 7.2,
          y: point.y + 4.8,
          button: "left",
          clickCount: 1,
        });
        gestures++;
        if (kind === "motion")
          await page.evaluate(() => editorGesture("finish-motion"));
      }
      await page.evaluate(() => editorGesture("commit"));
    }
    expect((await page.evaluate(() => editorGesture("done"))).errors).toEqual(
      [],
    );
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    await writeFile(
      resolve(".local-build/evidence/cl255-next-transitions.json"),
      JSON.stringify(
        { synthetic: true, providerCalls: 0, result, gestures },
        null,
        2,
      ),
    );
    expect(result.errors).toEqual([]);
    expect(result.actions).toBeGreaterThan(150);
    expect(intercepted).toBeGreaterThan(5);
    expect(external).toBe(0);
    expect(interceptionFailures).toBe(0);
    expect(fixture.counts().unexpected).toBe(0);
    expect(fixture.clip.calls).toEqual({ plan: 0, image: 0, render: 0 });
  } finally {
    closing = true;
    try {
      await browser?.close({ silent: true });
    } finally {
      await Promise.allSettled(pending);
      await fixture.close();
    }
  }
}, 180000);
