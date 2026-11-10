import { expect, it } from "vitest";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { startHookEditorFixture } from "./owner-hook-browser-fixture.ts";

declare global {
  function hookEditorRun(action: string): Promise<void>;
}

it("edits the unified Hook/main collections and preserves independent edits, clocks, Motion selection and incomplete Hook drafts", async () => {
  const fixture = await startHookEditorFixture();
  let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
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
    const driver = `globalThis.hookEditorRun=async action=>{
 const wait=async(fn,label)=>{for(let i=0;i<400;i++){if(fn())return;await new Promise(r=>setTimeout(r,25));}throw Error('editor_timeout_'+label);};
 const visible=n=>n&&n.getClientRects().length&&!n.closest('[hidden]');
 const field=label=>document.querySelector('[aria-label="'+label+'"]');
 const button=text=>[...document.querySelectorAll('button')].find(n=>visible(n)&&n.textContent.trim()===text);
 const click=async text=>{await wait(()=>button(text),text);button(text).click();await new Promise(requestAnimationFrame);};
 const set=(n,v)=>{Object.getOwnPropertyDescriptor(n.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(n,v);n.dispatchEvent(new Event('input',{bubbles:true}));n.dispatchEvent(new Event('change',{bubbles:true}));};
 const setting=async text=>{[...document.querySelectorAll('.editor-tabs button')].find(n=>n.textContent.trim()===text).click();await new Promise(requestAnimationFrame);};
 const rows=(kind,part)=>[...document.querySelectorAll('[data-timeline-key]')].filter(n=>n.dataset.timelineKey.startsWith(part+':'+kind+':'));
 const choose=async(kind,part,i=0)=>{const n=rows(kind,part)[i];if(!n)throw Error('missing_'+kind+'_'+part+'_'+i);n.click();await new Promise(requestAnimationFrame);};
 const actual=kind=>document.querySelector('.editor-preview video[data-editor-video="'+kind+'"][data-editor-active=true]');
 const fits=()=>{if(document.documentElement.scrollWidth>innerWidth)throw Error('editor_overflow');const f=document.querySelector('#sample-main>footer').getBoundingClientRect();if(f.bottom>innerHeight+1||f.top<0)throw Error('footer_outside');for(const n of document.querySelectorAll('.editor-panels input,.editor-panels select,.editor-panels textarea'))if(visible(n)){const r=n.getBoundingClientRect();if(r.left<0||r.right>innerWidth+1)throw Error('control_outside_'+n.getAttribute('aria-label'));}};
 await wait(()=>document.querySelector('.editor-layout:not([data-loading]) .editor-panels'),'ready');
 if(document.querySelector('[aria-label="Editing occurrence"]'))throw Error('separate_occurrence_switch');
 if(action==='open-hook'){
  await setting('Camera');await choose('camera','body');await click('Advanced');set(field('Focus playhead seconds'),'5.5');await wait(()=>actual('body')&&!actual('body').seeking&&Math.abs(actual('body').currentTime-3.5)<.04,'hook_start_settled');
  await setting('Hook');await wait(()=>!field('Capture hook start').disabled,'hook_capture');field('Capture hook start').click();await wait(()=>field('Hook start seconds').value==='3.5'&&field('Hook end seconds').value==='','end_cleared');if(!button('Preview hook').disabled||!button('Apply changes').disabled)throw Error('partial_hook_enabled');
  await setting('Camera');await click('Advanced');set(field('Focus playhead seconds'),'5.8');await wait(()=>actual('body')&&!actual('body').seeking&&Math.abs(actual('body').currentTime-3.8)<.04,'hook_end_settled');await setting('Hook');await wait(()=>!field('Capture hook end').disabled,'hook_end_ready');field('Capture hook end').click();await wait(()=>!button('Preview hook').disabled,'hook_complete');if(field('Hook start seconds').value!=='3.5')throw Error('start_changed');
  await click('Discard changes');await wait(()=>!document.querySelector('[aria-label="Edit actions"]'),'discard');await setting('Hook');set(field('Hook start seconds'),'3');await wait(()=>field('Hook end seconds').value==='','equal_clear');set(field('Hook start seconds'),'3.2');await new Promise(requestAnimationFrame);set(field('Hook end seconds'),'3.7');await wait(()=>!button('Preview hook').disabled,'typed_complete');set(field('Hook end seconds'),'');await click('Remove hook');await click('Discard changes');await wait(()=>!document.querySelector('[aria-label="Edit actions"]'),'remove_discard');
 }else if(action==='lists'){
  await setting('Media');await click('Pictures');if(rows('picture','hook').length!==1||rows('picture','body').length!==2)throw Error('picture_list');await choose('picture','hook');field('Play video').click();await wait(()=>actual('body'),'crossed_hook');field('Pause video')?.click();if(rows('picture','hook').length!==1||rows('picture','body').length!==2)throw Error('playback_filtered_list');if(getComputedStyle(document.querySelector('.editor-interaction')).visibility!=='hidden')throw Error('wrong_copy_handles');
  await choose('picture','body',1);await wait(()=>actual('body')?.currentTime>=3,'future_picture');await click('Timing');if(field('Picture start seconds').value!=='5')throw Error('picture_clock');
  await setting('Text');if(rows('text','hook').length!==1||rows('text','body').length!==2)throw Error('text_list');await choose('text','body',1);await wait(()=>actual('body')?.currentTime>=3,'future_text');
  await setting('Captions');if(rows('caption','hook').length!==2||rows('caption','body').length!==4)throw Error('caption_list');await choose('caption','body',3);await wait(()=>actual('body')?.currentTime>=3,'future_caption');
  await setting('Media');await click('Audio');if(rows('audio','hook').length!==2||rows('audio','body').length!==3)throw Error('audio_list');await choose('audio','body',2);await wait(()=>actual('body')?.currentTime>=3,'future_audio');if(document.querySelector('[aria-label="Edit actions"]'))throw Error('selection_created_edit');
 }else if(action==='motion'){
  await setting('Camera');await click('Motion');await choose('camera','body');await wait(()=>button('Add at playhead')&&!button('Add at playhead').disabled,'motion_ready');await click('Add at playhead');await wait(()=>field('Motion end seconds'),'motion_draft');if(field('Motion end seconds').value!=='6')throw Error('motion_clock');await wait(()=>document.querySelector('.editor-tabs button').disabled,'motion_navigation_lock');fits();field('Head to follow').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));await click('Track head');await wait(()=>document.querySelector('.head-motion-editor [role=status]'),'failure_retained');await click('Cancel');fits();
 }else if(action==='link-audio'){
  await setting('Media');await click('Pictures');field('Add audio to Picture 1 [Hook]').click();await new Promise(requestAnimationFrame);field('Add Discord notification').click();await wait(()=>button('Apply changes'),'linked_dirty');await click('Apply changes');await wait(()=>!document.querySelector('[aria-label="Edit actions"]'),'linked_saved');
 }else if(action==='edit'){
  await setting('Text');await choose('text','hook');await click('Content');set(field('Text content'),'Hook copy');await new Promise(requestAnimationFrame);await choose('text','body');if(field('Text content').value!=='Original')throw Error('text_leak');set(field('Text content'),'Main copy');await new Promise(requestAnimationFrame);await choose('text','hook');if(field('Text content').value!=='Hook copy')throw Error('main_text_leak');
  await setting('Captions');await choose('caption','hook');[...document.querySelectorAll('[aria-label="Caption controls"] button')].find(n=>n.textContent.trim()==='Text').click();await new Promise(requestAnimationFrame);set(field('Caption 1 word 1'),'Hook word');await new Promise(requestAnimationFrame);await choose('caption','body',1);if(field('Caption 2 word 1').value!=='Hook')throw Error('caption_leak');set(field('Caption 2 word 1'),'Main word');await new Promise(requestAnimationFrame);
  await setting('Media');await click('Pictures');await choose('picture','hook');await click('Image');await click('Remove picture');if(rows('picture','hook').length)throw Error('hook_picture_retained');if(rows('picture','body').length!==2)throw Error('main_picture_removed');
  await click('Audio');rows('audio','hook').find(n=>n.dataset.timelineKey.endsWith(':original')).click();await new Promise(requestAnimationFrame);set(field('Original audio volume'),'0');await new Promise(requestAnimationFrame);rows('audio','body').find(n=>n.dataset.timelineKey.endsWith(':original')).click();await new Promise(requestAnimationFrame);if(field('Original audio volume').value!=='100')throw Error('audio_leak');set(field('Original audio volume'),'40');await new Promise(requestAnimationFrame);await click('Apply changes');await wait(()=>!document.querySelector('[aria-label="Edit actions"]'),'saved');
 }else if(action==='restore'){
  await setting('Text');await choose('text','hook');await click('Content');if(field('Text content').value!=='Hook copy')throw Error('hook_restore');await click('Timing');await wait(()=>!field('Capture text end').disabled,'capture_ready');field('Capture text end').click();await wait(()=>field('Text end seconds').value!=='2','captured');if(Number(field('Text end seconds').value)>=2)throw Error('capture_clock');await click('Discard changes');await wait(()=>!document.querySelector('[aria-label="Edit actions"]'),'discard');await choose('text','body');await click('Content');if(field('Text content').value!=='Main copy')throw Error('main_restore');
 }else if(action==='audit'){
  for(const name of ['Captions','Text','Filters','Media','Camera','Hook']){await setting(name);fits();}
 }
 fits();
};`;
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto({ url: fixture.url, timeout: 15000 });
    await page._client().send("Runtime.evaluate", { expression: driver });
    for (const width of [1440, 390, 320]) {
      await page.setViewport({
        width,
        height: width === 1440 ? 1000 : 844,
        deviceScaleFactor: 1,
      });
      for (const action of ["open-hook", "lists", "motion", "audit"])
        await page.evaluate(
          (action) => globalThis.hookEditorRun(action),
          action,
        );
    }
    await page.evaluate(() => globalThis.hookEditorRun("link-audio"), null);
    expect(
      fixture.clip.edit!.hookContent!.edits.audio!.cues.some(
        (cue) => cue.visualId,
      ),
    ).toBe(true);
    expect(fixture.clip.edit!.audio!.cues.some((cue) => cue.visualId)).toBe(
      false,
    );
    await page.evaluate(() => globalThis.hookEditorRun("edit"), null);
    expect(fixture.clip.edit!.texts![0]!.text).toBe("Main copy");
    expect(fixture.clip.edit!.hookContent!.edits.texts![0]!.text).toBe(
      "Hook copy",
    );
    expect(fixture.clip.edit!.hookContent!.edits.visuals).toEqual([]);
    expect(fixture.clip.edit!.visuals).toHaveLength(2);
    await page.goto({ url: fixture.url, timeout: 15000 });
    await page._client().send("Runtime.evaluate", { expression: driver });
    await page.evaluate(() => globalThis.hookEditorRun("restore"), null);
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    for (const width of [1440, 390, 320]) {
      await page.setViewport({
        width,
        height: width === 1440 ? 1000 : 844,
        deviceScaleFactor: 1,
      });
      await page.evaluate(() => globalThis.hookEditorRun("audit"), null);
      const screenshot = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        resolve(`.local-build/evidence/cl224-editor-${width}.png`),
        Buffer.from(screenshot.value.data, "base64"),
      );
    }
    expect(fixture.counts()).toEqual({ edits: 2, unexpected: 0 });
  } finally {
    await browser?.close({ silent: true });
    await fixture.close();
  }
}, 100000);
