import { expect, it } from "vitest";
import { transform } from "esbuild";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { startHookEditorFixture } from "./owner-hook-browser-fixture.ts";
import { withIndependentOwnerHook } from "../packages/contracts/local/hook-content.ts";
import { ownerAudioSegments } from "../packages/contracts/local/audio.ts";

declare global {
  function hookAudioEdit(action: string): Promise<void>;
}

it("keeps fresh short/long Hook recording edits aligned through HTTP Apply, reload, Capture and responsive validation", async () => {
  const fixture = await startHookEditorFixture(undefined, {
    durationFrames: 900,
    configure(clip) {
      const base = clip.base!,
        edit = clip.edit!;
      base.overlay.frames = base.cut.endFrame = 900;
      base.overlay.focus!.frames = 900;
      base.overlay.focus!.shots.at(-1)!.endFrame = 900;
      edit.focus = structuredClone(base.overlay.focus);
      base.hookSuggestion = { startFrame: 300, endFrame: 450 };
      delete edit.hookContent;
      clip.edit = withIndependentOwnerHook(base, edit, clip.assets, [], {
        startFrame: 30,
        endFrame: 90,
      });
    },
  });
  let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
  const issues: string[] = [];
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
    });
    const client = page._client();
    client.on(
      "Runtime.exceptionThrown",
      (event: { exceptionDetails: { text: string } }) =>
        issues.push(event.exceptionDetails.text),
    );
    await client.send("Runtime.enable");
    const driver = (
      await transform(
        `globalThis.hookAudioEdit=async action=>{
      const wait=async(fn,label)=>{for(let i=0;i<400;i++){if(fn())return;await new Promise(r=>setTimeout(r,25));}throw Error('hook_audio_timeout_'+label);};
      const visible=n=>n&&n.getClientRects().length&&!n.closest('[hidden]');
      const field=label=>document.querySelector('[aria-label="'+label+'"]');
      const button=text=>[...document.querySelectorAll('button')].find(n=>visible(n)&&(n.textContent.trim()===text||(text==='Your audio'&&n.textContent.trim().startsWith(text))));
      const click=async text=>{await wait(()=>button(text)&&!button(text).disabled,text);button(text).click();await new Promise(requestAnimationFrame);};
      const set=async(label,value)=>{const n=field(label);Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(n,value);n.dispatchEvent(new Event('input',{bubbles:true}));n.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(requestAnimationFrame);};
      const setting=async text=>{await wait(()=>[...document.querySelectorAll('.editor-tabs button')].some(n=>n.textContent.trim()===text&&!n.disabled),'tab_'+text);[...document.querySelectorAll('.editor-tabs button')].find(n=>n.textContent.trim()===text).click();await new Promise(requestAnimationFrame);};
      const audio=async()=>{await setting('Media');await click('Audio');};
      const managed=()=>[...document.querySelectorAll('[data-audio-cue]')].find(n=>/Riser|Rising tension/.test(n.textContent));
      const choose=async()=>{await audio();await click('Your audio');await wait(()=>managed(),'managed');managed().click();await new Promise(requestAnimationFrame);};
      const save=async()=>{await click('Apply changes');await wait(()=>!button('Discard changes'),'saved');};
      const defaults=(volume,offset)=>{if(field('Added audio volume').value!==volume||field('Audio offset seconds').value!==offset||field('Audio placement').value!=='hook')throw Error('sound_defaults_'+field('Added audio volume').value+'_'+field('Audio offset seconds').value);};
      await wait(()=>document.querySelector('.editor-panels:not([hidden])'),'ready');
      if(action==='suggest'){
        await setting('Hook');[...document.querySelectorAll('.hook-options label')].find(n=>n.textContent.trim()==='Add Hook audio').querySelector('input').click();await new Promise(requestAnimationFrame);await click('Use suggestion');await wait(()=>field('Hook end seconds').value==='15.3','short_window');if(field('Hook start seconds').value!=='10')throw Error('start_changed');await choose();defaults('85','0');await save();
      }else if(action==='long'||action==='short'){
        await audio();
        if(action==='short'){const n=document.querySelector('[data-timeline-key="body:audio:original"]');n.click();await new Promise(requestAnimationFrame);}
        await click('Sound library');field(action==='long'?'Preview Rising tension':'Preview Riser').click();if(document.querySelector('.audio-inspector > audio').volume!==0.85)throw Error('recording_audition_gain');field(action==='long'?'Add Rising tension':'Add Riser').click();await wait(()=>field('Added audio volume'),'recording_selected');defaults(action==='long'?'85':'63','0');
        await setting('Hook');if(field('Hook end seconds').value!==(action==='long'?'17.4':'15.3'))throw Error('recording_window');
        await choose();if(action==='long')await set('Added audio volume','63');await save();
      }else if(action==='manual'){
        await setting('Hook');await set('Hook end seconds','16.1');await choose();defaults('63','1.3');if(!managed().textContent.includes('0:06.100'))throw Error('short_audio_row');await save();
      }else if(action==='reload'){
        await choose();defaults('63','1.3');await setting('Hook');if(field('Hook start seconds').value!=='10'||field('Hook end seconds').value!=='16.1')throw Error('window_restore');
      }else if(action==='validation'){
        await setting('Hook');
        const geometry=()=>['Hook start seconds','Hook end seconds'].map(label=>{const r=field(label).getBoundingClientRect();return [r.x,r.y,r.width,r.height];}).concat([button('Preview hook'),button('Remove hook'),document.querySelector('#sample-main>footer')].map(n=>{const r=n.getBoundingClientRect();return [r.x,r.y,r.width,r.height];}));
        const before=geometry();await set('Hook end seconds','18');await wait(()=>button('Apply changes')?.disabled,'invalid_guard');
        if(!document.querySelector('.hook-controls [role="alert"]')?.textContent.includes('up to 7.4s'))throw Error('missing_local_validation');
        if(JSON.stringify(before)!==JSON.stringify(geometry()))throw Error('validation_resized_fields');
        await set('Hook end seconds','16.1');await wait(()=>!button('Discard changes'),'corrected');
        if(document.documentElement.scrollWidth>innerWidth)throw Error('page_overflow');
      }else if(action==='capture'){
        await setting('Camera');const n=document.querySelector('[data-timeline-key^="body:camera:"]');n.click();await new Promise(requestAnimationFrame);await click('Advanced');await set('Focus playhead seconds','17.1');
        const video=()=>document.querySelector('video[data-editor-video="body"][data-editor-active="true"]');await wait(()=>video()&&!video().seeking&&Math.abs(video().currentTime-11)<.04,'capture_seek');
        const expected=(Math.round(video().currentTime*30)+1)/30;
        await setting('Hook');await wait(()=>!field('Capture hook end').disabled,'capture_ready');field('Capture hook end').click();await wait(()=>Math.abs(Number(field('Hook end seconds').value)-expected)<.001,'captured_exact');if(field('Hook start seconds').value!=='10')throw Error('capture_changed_start');await choose();defaults('63',String(Math.round((222-(Math.round(expected*30)-300))/30*1000)/1000));await click('Discard changes');await wait(()=>!button('Discard changes'),'capture_discard');
      }
    };`,
        { loader: "js" },
      )
    ).code;
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.goto({ url: fixture.url, timeout: 15000 });
    await client.send("Runtime.evaluate", { expression: driver });
    const run = (action: string) =>
      page.evaluate((action) => globalThis.hookAudioEdit(action), action);
    await run("suggest");
    const id = fixture.clip.edit!.hookContent!.edits.audio!.cues.find(
      (c) => c.suggestedHook,
    )!.id;
    const body = structuredClone(fixture.clip.edit!.audio);
    for (const action of ["long", "short", "manual"]) await run(action);
    const edit = fixture.clip.edit!,
      audio = edit.hookContent!.edits.audio!;
    expect(edit.hook).toEqual({ startFrame: 300, endFrame: 483 });
    expect(audio.cues.filter((c) => c.suggestedHook)).toEqual([
      expect.objectContaining({
        id,
        volume: 63,
        offsetFrame: 39,
        endFrame: 183,
        source: { kind: "builtin", id: "rising-tension" },
      }),
    ]);
    expect(
      ownerAudioSegments({ ...audio, assets: [] }, 900, edit.hook).find(
        (s) => s.cue.id === id,
      ),
    ).toMatchObject({ start: 0, end: 6.1, offset: 1.3 });
    expect(edit.audio).toEqual(body);
    await page.goto({ url: fixture.url, timeout: 15000 });
    await client.send("Runtime.evaluate", { expression: driver });
    await run("reload");
    for (const width of [1440, 834, 390]) {
      await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
      await run("validation");
    }
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await run("capture");
    expect(fixture.counts()).toEqual({ edits: 4, unexpected: 0 });
    expect(issues).toEqual([]);
    expect(fixture.clip.calls).toEqual({ plan: 0, image: 0, render: 0 });
  } finally {
    await browser?.close({ silent: true });
    await fixture.close();
  }
}, 90000);
