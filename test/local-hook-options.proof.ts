import { expect, it } from "vitest";
import { transform } from "esbuild";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { startHookEditorFixture } from "./owner-hook-browser-fixture.ts";
import { withIndependentOwnerHook } from "../packages/contracts/local/hook-content.ts";

declare global {
  function hookOptionsRun(action: string): Promise<void>;
}

it("requires independent Hook title/audio opt-ins through fake HTTP, cancellation, autosave, Undo/Redo, reload and responsive controls", async () => {
  const fixture = await startHookEditorFixture(undefined, {
    durationFrames: 900,
    hookTitles: true,
    holdHookTitles: true,
    configure(clip) {
      const base = clip.base!,
        edit = clip.edit!;
      base.overlay.frames = base.cut.endFrame = 900;
      base.overlay.focus!.frames = 900;
      base.overlay.focus!.shots.at(-1)!.endFrame = 900;
      edit.focus = structuredClone(base.overlay.focus);
      base.hookSuggestion = { startFrame: 300, endFrame: 450 };
      const laterWords = base.words.map((word, i) => ({
        ...word,
        id: `w_${String(i + 5).padStart(6, "0")}`,
        startMs: word.startMs + 10000,
        endMs: word.endMs + 10000,
      }));
      base.overlay.captions.push(
        ...base.overlay.captions.map((caption, i) => ({
          ...caption,
          startMs: caption.startMs + 10000,
          endMs: caption.endMs + 10000,
          wordIds: [laterWords[i]!.id],
          wordCues: caption.wordCues.map((word) => ({
            ...word,
            wordId: laterWords[i]!.id,
            startMs: word.startMs + 10000,
            endMs: word.endMs + 10000,
          })),
        })),
      );
      base.words.push(...laterWords);
      delete edit.hookContent;
      clip.edit = withIndependentOwnerHook(base, edit, clip.assets, [], {
        startFrame: 30,
        endFrame: 90,
      });
    },
  });
  let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
  const issues: string[] = [];
  const waitFor = async (check: () => boolean) => {
    for (let i = 0; i < 300; i++) {
      if (check()) return;
      await new Promise((r) => setTimeout(r, 20));
    }
    throw Error("hook_option_fixture_timeout");
  };
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
    client.on(
      "Runtime.exceptionThrown",
      (event: { exceptionDetails: { text: string } }) =>
        issues.push(event.exceptionDetails.text),
    );
    await client.send("Runtime.enable");
    const driver = (
      await transform(
        `globalThis.hookOptionsRun=async action=>{
      const wait=async(fn,label)=>{for(let i=0;i<400;i++){if(fn())return;await new Promise(r=>setTimeout(r,25));}throw Error('hook_option_timeout_'+label);};
      const visible=n=>n&&n.getClientRects().length&&!n.closest('[hidden]');
      const button=text=>[...document.querySelectorAll('button')].find(n=>visible(n)&&(n.getAttribute('aria-label')===text||n.textContent.trim()===text));
      const field=label=>document.querySelector('[aria-label="'+label+'"]');
      const option=label=>[...document.querySelectorAll('.hook-options label')].find(n=>n.textContent.trim()===label)?.querySelector('input');
      const tick=async(label,checked)=>{const n=option(label);if(!n||n.disabled)throw Error('option_unavailable_'+label);if(n.checked!==checked)n.click();await new Promise(requestAnimationFrame);};
      const click=async text=>{await wait(()=>button(text)&&!button(text).disabled,text);button(text).click();await new Promise(requestAnimationFrame);};
      const set=async(label,value)=>{const n=field(label);n.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(n,value);n.dispatchEvent(new Event('input',{bubbles:true}));n.dispatchEvent(new Event('change',{bubbles:true}));n.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));await new Promise(requestAnimationFrame);};
      const setting=async text=>{await wait(()=>[...document.querySelectorAll('.editor-tabs button')].some(n=>n.textContent.trim()===text&&!n.disabled),'tab_'+text);[...document.querySelectorAll('.editor-tabs button')].find(n=>n.textContent.trim()===text).click();await new Promise(requestAnimationFrame);};
      const status=()=>document.querySelector('.editor-save-status')?.textContent.trim();
      const save=async()=>{await wait(()=>status()==='Saved','saved');};
      const undo=async()=>{await click('Undo');};
      await wait(()=>document.querySelector('.editor-layout:not([data-loading]) .editor-panels'),'ready');
      await setting('Hook');const layers=[...document.querySelectorAll('.editor-narrow-navigation button')].find(n=>visible(n)&&n.textContent.trim()==='Properties');if(layers){layers.click();await new Promise(requestAnimationFrame);}
      if(action==='before-hook'){
        if(option('Generate title').checked||option('Add Hook audio').checked)throw Error('implicit_options');await click('Remove hook');await tick('Generate title',true);await tick('Add Hook audio',true);
      }else if(action==='add-both'){
        await click('Add hook');await wait(()=>field('Hook end seconds').value==='5.3','audio_window');await wait(()=>button('Cancel'),'title_pending');if(!option('Generate title').checked||!option('Add Hook audio').checked)throw Error('choices_lost');
      }else if(action==='clear-both'){
        await tick('Add Hook audio',false);if(!option('Generate title').checked||!field('Cancel title'))throw Error('audio_off_canceled_title');await tick('Generate title',false);if(field('Hook end seconds').value!=='5.3')throw Error('audio_off_moved_window');await save();
      }else if(action==='suggest-none'){
        if(option('Generate title').checked||option('Add Hook audio').checked)throw Error('discard_preferences');await click('Use suggestion');await wait(()=>field('Hook start seconds').value==='10'&&field('Hook end seconds').value==='15','suggestion_without_audio');await save();
      }else if(action==='title-on'){
        await tick('Generate title',true);await wait(()=>button('Cancel'),'title_started');if(option('Add Hook audio').checked)throw Error('title_added_audio');
      }else if(action==='title-off'){
        await tick('Generate title',false);await wait(()=>!button('Cancel'),'title_stopped');
      }else if(action==='title-ready'){
        await wait(()=>[...document.querySelectorAll('.source-hint')].some(n=>n.textContent.includes('A Fresh Way')),'fake_title');await save();await set('Hook end seconds','14.5');await wait(()=>button('Cancel'),'range_title');
      }else if(action==='cancel'){
        field('Cancel title').click();await wait(()=>!button('Cancel'),'canceled');if(option('Generate title').checked)throw Error('cancel_left_automatic_title');
      }else if(action==='audio-on'){
        await tick('Add Hook audio',true);await wait(()=>field('Hook end seconds').value==='15.3','short_audio_window');if(option('Generate title').checked)throw Error('audio_started_title');await save();
      }else if(action==='audio-off'){
        await tick('Add Hook audio',false);if(field('Hook start seconds').value!=='10'||field('Hook end seconds').value!=='15.3')throw Error('audio_off_changed_hook');await save();
      }else if(action==='restore-audio'){
        await tick('Add Hook audio',true);await setting('Media');await click('Audio');const cue=[...document.querySelectorAll('[data-audio-cue]')].find(n=>n.textContent.includes('Riser'));cue.click();await new Promise(requestAnimationFrame);await set('Added audio volume','47');await save();
      }else if(action==='long-draft'){
        await set('Hook end seconds','18');if(status()!=='Check edits')throw Error('managed_bounds_missing');await tick('Add Hook audio',false);await save();if(field('Hook end seconds').value!=='18')throw Error('draft_endpoint_lost');await undo();await undo();await save();if(!option('Add Hook audio').checked||field('Hook end seconds').value!=='15.3')throw Error('undo_audio_not_restored');
      }else if(action==='incomplete'){
        await tick('Add Hook audio',false);await set('Hook start seconds','16');await tick('Generate title',true);if(field('Hook end seconds').value!==''||status()!=='Check edits'||!option('Add Hook audio').disabled)throw Error('incomplete_guard');
      }else if(action==='undo-incomplete'){
        await tick('Generate title',false);await undo();await undo();await save();if(!option('Add Hook audio').checked)throw Error('undo_state');
      }else if(action==='restored'){
        if(option('Generate title').checked||!option('Add Hook audio').checked)throw Error('reload_state');
      }else if(action==='layout'){
        if(document.documentElement.scrollWidth>innerWidth)throw Error('horizontal_overflow');for(const n of document.querySelectorAll('.hook-options label')){const r=n.getBoundingClientRect(),input=n.querySelector('input').getBoundingClientRect(),text=document.createRange();text.selectNodeContents(n.lastChild);const copy=text.getBoundingClientRect();if(r.height<44||r.left<0||r.right>innerWidth||Math.abs(input.y+input.height/2-copy.y-copy.height/2)>2.5)throw Error('checkbox_target');}
        const f=document.querySelector('[data-workspace-toolbar]').getBoundingClientRect();if(f.bottom>innerHeight+1||f.left<0||f.right>innerWidth+1||document.querySelector('#sample-main>footer'))throw Error('toolbar_outside');
      }
    };`,
        { loader: "js" },
      )
    ).code;
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.goto({ url: fixture.url, timeout: 15000 });
    await client.send("Runtime.evaluate", { expression: driver });
    const run = (action: string) =>
      page.evaluate((action) => globalThis.hookOptionsRun(action), action);
    await run("before-hook");
    await new Promise((r) => setTimeout(r, 1100));
    expect(fixture.titleCounts().titleSuggestions).toBe(0);
    await run("add-both");
    await waitFor(() => fixture.titleCounts().pendingTitles === 1);
    await run("clear-both");
    await waitFor(() => fixture.titleCounts().titleCancellations === 1);
    await run("suggest-none");
    await new Promise((r) => setTimeout(r, 1100));
    expect(fixture.titleCounts().titleSuggestions).toBe(1);
    expect(
      fixture.clip.edit!.hookContent!.edits.audio!.cues.some(
        (c) => c.suggestedHook,
      ),
    ).toBe(false);
    await run("title-on");
    await waitFor(() => fixture.titleCounts().pendingTitles === 1);
    await run("title-off");
    await waitFor(() => fixture.titleCounts().titleCancellations === 2);
    await run("title-on");
    await waitFor(() => fixture.titleCounts().pendingTitles === 1);
    fixture.releaseTitles("ready");
    await run("title-ready");
    await waitFor(() => fixture.titleCounts().pendingTitles === 1);
    const texts = structuredClone(fixture.clip.edit!.hookContent!.edits.texts);
    expect(texts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          role: "opening-title",
          text: "A Fresh Way to See This Moment",
        }),
      ]),
    );
    await run("cancel");
    await waitFor(() => fixture.titleCounts().titleCancellations === 3);
    await run("audio-on");
    const audio = fixture.clip.edit!.hookContent!.edits.audio!;
    expect(audio.cues.find((c) => c.suggestedHook)).toMatchObject({
      volume: 85,
      offsetFrame: 0,
      endFrame: 159,
      loop: false,
    });
    const body = structuredClone(fixture.clip.edit!.audio),
      independent = audio.cues.filter((c) => !c.suggestedHook);
    await run("audio-off");
    expect(fixture.clip.edit!.hookContent!.edits.audio!.cues).toEqual(
      independent,
    );
    expect(fixture.clip.edit!.hookContent!.edits.texts).toEqual(texts);
    expect(fixture.clip.edit!.audio).toEqual(body);
    await run("restore-audio");
    await run("long-draft");
    expect(
      fixture.clip.edit!.hookContent!.edits.audio!.cues.find(
        (c) => c.suggestedHook,
      )!.volume,
    ).toBe(47);
    await run("incomplete");
    await new Promise((r) => setTimeout(r, 1100));
    expect(fixture.titleCounts().titleSuggestions).toBe(4);
    await run("undo-incomplete");
    await page.goto({ url: fixture.url, timeout: 15000 });
    await client.send("Runtime.evaluate", { expression: driver });
    await run("restored");
    expect(
      fixture.clip.edit!.hookContent!.edits.audio!.cues.find(
        (c) => c.suggestedHook,
      )!.volume,
    ).toBe(47);
    for (const width of [1440, 834, 390, 320]) {
      await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
      await run("layout");
    }
    expect(fixture.titleCounts()).toEqual({
      titleSuggestions: 4,
      titleCancellations: 3,
      titleFailures: 0,
      pendingTitles: 0,
    });
    expect(fixture.counts().edits).toBeGreaterThanOrEqual(5);
    expect(fixture.counts().unexpected).toBe(0);
    expect(fixture.clip.calls).toEqual({ plan: 0, image: 0, render: 0 });
    expect(issues).toEqual([]);
  } finally {
    await browser?.close({ silent: true });
    await fixture.close();
  }
}, 100000);
