import { expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { startHookEditorFixture } from "./owner-hook-browser-fixture.ts";
import { EDITOR_TOUR_STEPS } from "../apps/frontend/src/features/local-editing/editor-sections.ts";
import { EDITOR_TOUR_SEEN_KEY } from "../apps/frontend/src/features/local-editing/editor-tour-preference.ts";

declare global {
  function verifyEditorTour(
    action:
      | "wait"
      | "welcome"
      | "start"
      | "replay-welcome"
      | "check"
      | "next"
      | "back"
      | "skip"
      | "replay"
      | "closed"
      | "state"
      | "done"
      | "seen"
      | "sibling"
      | "focus"
      | "typing"
      | "leave-input"
      | "focus-inside"
      | "dirty"
      | "discard"
      | "hide-hook"
      | "restore-hook"
      | "next-missing"
      | "prepare-scroll"
      | "read-scroll"
      | "next-twice"
      | "close-moving"
      | "close-entering"
      | "resized"
      | "start-over"
      | "fresh-video"
      | "not-open",
  ): Promise<string>;
  function editorTourMotionReport(): {
    errors: string[];
    entryFrames: number;
    stepFrames: number;
    exitFrames: number;
  };
}

it("starts only after real fixture media is ready, guides every viewport, and preserves clips with zero work requests", async () => {
  const fixture = await startHookEditorFixture(undefined, {
    editorTour: true,
    holdPreview: true,
    configure(clip) {
      clip.state = "queued";
    },
  });
  const original = structuredClone(fixture.clip.edit);
  const siblingOriginal = structuredClone(fixture.sibling!.edit);
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
    await client.send("Runtime.enable");
    client.on(
      "Runtime.exceptionThrown",
      (event: { exceptionDetails: { text: string } }) =>
        issues.push(event.exceptionDetails.text),
    );
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.goto({ url: fixture.url, timeout: 15000 });
    const freshVideo = (await readFile(fixture.syntheticMedia!.video)).toString(
      "base64",
    );
    const install = async () => {
      await client.send("Runtime.evaluate", {
        expression: `{
        const report={errors:[],entryFrames:0,stepFrames:0,exitFrames:0};
        let previous=null,shown=false;
        const frame=()=>{
          const scene=document.querySelector('[data-editor-tour-phase]'),card=scene?.querySelector('article');
          if(scene&&card){
            const phase=scene.dataset.editorTourPhase,opacity=Number(getComputedStyle(card).opacity),outer=Number(getComputedStyle(scene).opacity),cover=scene.querySelector('[data-editor-tour-cover]');
            const r=card.getBoundingClientRect(),mask=cover?.getBoundingClientRect();
            const current={card,opacity,outer,left:r.left,top:r.top,width:r.width,text:card.textContent,mask:mask&&[mask.left,mask.top,mask.width,mask.height].join(','),covered:cover?Number(getComputedStyle(cover).opacity):1};
            if(previous){
              if(previous.card!==card)report.errors.push('card_remounted');
              if(previous.opacity>.03&&opacity>.03&&(Math.abs(previous.left-r.left)>1||Math.abs(previous.top-r.top)>1||Math.abs(previous.width-r.width)>1||previous.text!==current.text))report.errors.push('visible_card_jump_'+JSON.stringify({phase,previousOpacity:previous.opacity,opacity,previousBox:[previous.left,previous.top,previous.width],box:[r.left,r.top,r.width],textChanged:previous.text!==current.text}));
              if(previous.mask!==current.mask&&previous.covered<.97&&current.covered<.97)report.errors.push('visible_mask_jump');
            }
            if(shown&&phase!=='closing'&&outer<.97)report.errors.push('backdrop_flash');
            if(phase==='shown')shown=true;
            if(phase==='entering'&&outer>0&&outer<1)report.entryFrames++;
            if(phase==='leaving'&&opacity>0&&opacity<1)report.stepFrames++;
            if(phase==='closing'&&outer>0&&outer<1)report.exitFrames++;
            previous=current;
          }else{
            if(previous&&previous.outer>.03)report.errors.push('abrupt_modal_exit');
            previous=null;shown=false;
          }
          requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
        globalThis.editorTourMotionReport=()=>report;
        }
        globalThis.verifyEditorTour=async action=>{
        const wait=async(fn,label)=>{for(let i=0;i<600;i++){const value=fn();if(value)return value;await new Promise(r=>setTimeout(r,25));}throw Error('tour_timeout_'+label)};
        const modal=()=>document.querySelector('dialog:modal');
        const guide=()=>document.querySelector('[data-editor-tour-step]');
        const button=name=>[...(modal()??document).querySelectorAll('button')].find(n=>n.getClientRects().length&&(n.textContent.trim()===name||n.getAttribute('aria-label')===name));
        const current=()=>guide()?.dataset.editorTourStep;
        const fullyClosed=()=>!modal()&&!document.querySelector('[data-editor-tour-phase]');
        if(action==='state')return JSON.stringify({editor:!!document.querySelector('.clip-editor'),video:!!document.querySelector('.editor-preview video'),modal:!!modal(),section:document.querySelector('.editor-tabs [aria-selected="true"]')?.textContent.trim()});
        if(action==='start-over'){document.querySelector('[data-workspace-toolbar] summary').click();button('Start over').click();await wait(()=>document.querySelector('.upload-card input'),'intake');if(localStorage.getItem(${JSON.stringify(EDITOR_TOUR_SEEN_KEY)})!==null)throw Error('tour_not_rearmed');return 'cleared'}
        if(action==='fresh-video'){const input=document.querySelector('.upload-card input'),transfer=new DataTransfer();transfer.items.add(new File([Uint8Array.from(atob(${JSON.stringify(freshVideo)}),c=>c.charCodeAt(0))],'synthetic-fresh.mp4',{type:'video/mp4'}));input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));await wait(()=>document.querySelector('.editor-preview video'),'fresh_editor');return 'loading'}
        if(action==='not-open'){await new Promise(r=>setTimeout(r,700));if(modal())throw Error('tour_opened_before_ready');return 'waiting'}
        if(action==='done'){button('Done').click();return 'done'}
        if(action==='seen')return localStorage.getItem(${JSON.stringify(EDITOR_TOUR_SEEN_KEY)});
        if(action==='sibling'){document.querySelectorAll('.clip-choice')[1].click();return 'selected'}
        if(action==='focus')return document.activeElement?.getAttribute('aria-label');
        if(action==='focus-inside')return String(modal()?.contains(document.activeElement));
        if(action==='close-entering'){await wait(fullyClosed,'prior_teardown');button('Replay editor tour').click();await wait(()=>document.querySelector('[data-editor-tour-phase="entering"]'),'entering');button('Close editor tour').click();button('Close editor tour').click();await wait(fullyClosed,'early_close');return 'closed'}
        if(action==='close-moving'){button('Next').click();button('Close editor tour').click();button('Close editor tour').click();await wait(fullyClosed,'moving_close');return 'closed'}
        if(action==='prepare-scroll'||action==='read-scroll'){const tab=button('Captions');tab.click();await new Promise(requestAnimationFrame);const n=await wait(()=>{const p=document.querySelector('[data-editor-panel="captions"] .editor-context-inspector');return p?.clientHeight>0&&p.scrollHeight>p.clientHeight&&p},'scrollable');if(action==='prepare-scroll')n.scrollTop=Math.min(120,n.scrollHeight-n.clientHeight);return String(n.scrollTop)}
        if(action==='typing'){await wait(()=>document.querySelector('.editor-panels:not([hidden])'),'typing_ready');button('Captions').click();await new Promise(requestAnimationFrame);const n=await wait(()=>document.querySelector('.editor-panels:not([hidden]) input:not(:disabled)'),'typing');n.focus();return 'typing'}
        if(action==='leave-input'){document.activeElement.blur();return 'left'}
        if(action==='dirty'){const tab=[...document.querySelectorAll('.editor-tabs button')].find(n=>n.textContent==='Captions');tab.click();await new Promise(requestAnimationFrame);const n=document.querySelector('[aria-label="Font size"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(n,65);n.dispatchEvent(new Event('input',{bubbles:true}));await wait(()=>button('Replay editor tour').disabled,'dirty_guard');return 'blocked'}
        if(action==='discard'){button('Undo').click();await wait(()=>!button('Replay editor tour').disabled,'undo');return 'clean'}
        if(action==='hide-hook'){document.querySelector('[data-editor-panel="hook"]').dataset.editorPanel='missing-fixture-target';return 'hidden'}
        if(action==='restore-hook'){document.querySelector('[data-editor-panel="missing-fixture-target"]').dataset.editorPanel='hook';return 'restored'}
        if(action==='next-missing'){button('Next').click();await wait(()=>current()==='hook','missing');if(document.querySelector('[data-editor-tour-spotlight]')||!button('Skip tour')||!button('Close editor tour'))throw Error('missing_target_trap');return 'dismissible'}
        if(action==='resized'){for(let i=0;i<3;i++)await new Promise(requestAnimationFrame);await wait(current,'resized')}
        else if(action==='welcome')await wait(()=>current()==='welcome','welcome');
        else if(action==='start'){button('Start tour').click();await wait(()=>current()==='preview','started')}
        else if(action==='wait'){await wait(current,'guide');if(current()==='welcome'){button('Start tour').click();await wait(()=>current()==='preview','started')}}
        else if(action==='next-twice'){const before=current(),n=button('Next');n.click();n.click();await wait(()=>current()&&current()!==before,'double_next')}
        else if(action==='next'||action==='back'){const before=current();button(action==='next'?'Next':'Back').click();await wait(()=>current()&&current()!==before,'next');}
        else if(action==='skip'){(button('Skip tour')??button('Skip')).click();await wait(fullyClosed,'skip');return 'closed';}
        else if(action==='replay'||action==='replay-welcome'){button('Replay editor tour').click();await wait(()=>current()==='welcome','replay');if(action==='replay'){button('Start tour').click();await wait(()=>current()==='preview','started')}}
        else if(action==='closed'){await new Promise(r=>setTimeout(r,900));if(modal())throw Error('tour_repeated');return 'closed';}
        const card=guide();if(!card||!modal())throw Error('tour_not_modal');
        const bounds=card.getBoundingClientRect(),vw=document.documentElement.clientWidth,vh=innerHeight;
        if(bounds.left<-.5||bounds.top<-.5||bounds.right>vw+.5||bounds.bottom>vh+.5)throw Error('tour_card_outside_'+current()+'_'+vw+'x'+vh+'_'+JSON.stringify(bounds));
        const actions=[...card.querySelectorAll('button')];
        for(const n of actions){const r=n.getBoundingClientRect();if(r.bottom>bounds.bottom+.5||r.right>bounds.right+.5)throw Error('tour_action_outside_'+current());}
        if(current()==='welcome'){
          if(Math.abs(bounds.left+bounds.width/2-vw/2)>.5||Math.abs(bounds.top+bounds.height/2-vh/2)>.5)throw Error('welcome_not_centered_'+vw+'x'+vh+'_'+JSON.stringify(bounds));
          if(document.querySelector('[data-editor-tour-spotlight]')||!button('Start tour')||!button('Skip')||button('Back')||button('Next')||card.querySelector('header span').textContent.trim()!=='EDITOR TOUR')throw Error('welcome_controls');
          if(card.querySelector('h2').textContent!=='Welcome to the editor')throw Error('welcome_title');
          return current();
        }
        const hole=document.querySelector('[data-editor-tour-spotlight]');if(!hole)throw Error('tour_missing_spotlight_'+current()+'_'+vw+'x'+vh+'_'+JSON.stringify({target:document.querySelector('.clip-list [aria-selected=true]')?.getBoundingClientRect(),message:card.textContent}));
        const h=hole.getBoundingClientRect();if(h.width<=0||h.height<=0||h.left<0||h.top<0||h.right>vw+.5||h.bottom>vh+.5)throw Error('tour_hole_outside_'+current());
        const overlap=Math.max(0,Math.min(h.right,bounds.right)-Math.max(h.left,bounds.left))*Math.max(0,Math.min(h.bottom,bounds.bottom)-Math.max(h.top,bounds.top));
        if(overlap>.5)throw Error('tour_card_covers_target_'+current());
        const section=${JSON.stringify(Object.fromEntries(EDITOR_TOUR_STEPS.filter((step) => step.section).map((step) => [step.target, step.section])))}[current()];
        if(section){
          const panel=document.querySelector('[data-editor-panel="'+section+'"]');
          const main=document.getElementById(panel.getAttribute('aria-labelledby'));
          const tabs=[main,...panel.querySelectorAll(':scope > [role="tablist"] [aria-selected="true"]')].filter(n=>n.getClientRects().length);
          for(const tab of tabs){const r=tab.getBoundingClientRect();if(r.left<h.left-.5||r.top<h.top-.5||r.right>h.right+.5||r.bottom>h.bottom+.5)throw Error('tour_tab_outside_'+current()+'_'+vw+'x'+vh+'_'+JSON.stringify({tab:r,hole:h}));}
        }
        if(document.documentElement.scrollWidth>vw)throw Error('tour_page_overflow');
        return current();
      };`,
      });
    };
    await install();
    const run = (action: Parameters<typeof globalThis.verifyEditorTour>[0]) =>
      page.evaluate((action) => globalThis.verifyEditorTour(action), action);
    await new Promise((done) => setTimeout(done, 1000));
    expect(JSON.parse(await run("state"))).toMatchObject({
      editor: false,
      modal: false,
    });
    fixture.clip.state = "ready";
    await new Promise((done) => setTimeout(done, 1500));
    expect(JSON.parse(await run("state"))).toMatchObject({
      video: true,
      modal: false,
    });
    fixture.releasePreview();
    expect(await run("typing")).toBe("typing");
    await new Promise((done) => setTimeout(done, 800));
    expect(JSON.parse(await run("state"))).toMatchObject({ modal: false });
    await run("leave-input");
    expect(await run("welcome")).toBe("welcome");
    expect(JSON.parse(await run("state"))).toMatchObject({
      modal: true,
      section: "Captions",
    });
    expect(fixture.counts()).toEqual({ edits: 0, unexpected: 0 });
    expect(await run("skip")).toBe("closed");
    expect(await run("closed")).toBe("closed");
    expect(await run("replay-welcome")).toBe("welcome");
    expect(await run("start")).toBe("preview");
    const targets = EDITOR_TOUR_STEPS.map((step) => step.target);
    for (const [width, height] of [
      [1440, 900],
      [834, 900],
      [390, 844],
      [320, 430],
    ] as const) {
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      if (width !== 1440) {
        expect(await run("replay-welcome")).toBe("welcome");
        expect(await run("start")).toBe("preview");
      }
      expect(await run("wait")).toBe(targets[0]);
      for (const target of targets.slice(1))
        expect(await run("next")).toBe(target);
      expect(await run("back")).toBe("hook");
      expect(await run("next")).toBe("actions");
      await run("done");
      expect(await run("closed")).toBe("closed");
    }
    expect(await run("seen")).toBe("seen");
    await run("replay");
    expect(await run("next-twice")).toBe("clips");
    for (const target of targets.slice(2, targets.indexOf("audio")))
      expect(await run("next")).toBe(target);
    await page.setViewport({ width: 834, height: 900, deviceScaleFactor: 1 });
    expect(await run("resized")).toBe("pictures");
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    expect(await run("resized")).toBe("pictures");
    expect(await run("close-moving")).toBe("closed");
    expect(await run("close-entering")).toBe("closed");
    const motion = await page.evaluate(() =>
      globalThis.editorTourMotionReport(),
    );
    expect(motion.errors).toEqual([]);
    expect(motion.entryFrames).toBeGreaterThan(0);
    expect(motion.stepFrames).toBeGreaterThan(0);
    expect(motion.exitFrames).toBeGreaterThan(0);
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    const previousScroll = await run("prepare-scroll");
    expect(Number(previousScroll)).toBeGreaterThan(0);
    await run("replay");
    for (const target of targets.slice(1))
      expect(await run("next")).toBe(target);
    await run("done");
    await run("closed");
    expect(await run("read-scroll")).toBe(previousScroll);
    await page.goto({ url: fixture.url, timeout: 15000 });
    await install();
    await new Promise((done) => setTimeout(done, 1500));
    expect(await run("closed")).toBe("closed");
    fixture.sibling!.state = "ready";
    await new Promise((done) => setTimeout(done, 800));
    await run("sibling");
    await new Promise((done) => setTimeout(done, 1500));
    expect(await run("closed")).toBe("closed");
    expect(await run("replay")).toBe("preview");
    for (let tab = 0; tab < 5; tab++) {
      await client.send("Input.dispatchKeyEvent", {
        type: "keyDown",
        key: "Tab",
        code: "Tab",
        windowsVirtualKeyCode: 9,
      });
      await client.send("Input.dispatchKeyEvent", {
        type: "keyUp",
        key: "Tab",
        code: "Tab",
        windowsVirtualKeyCode: 9,
      });
      expect(await run("focus-inside")).toBe("true");
    }
    await client.send("Input.dispatchKeyEvent", {
      type: "keyDown",
      key: "Escape",
      code: "Escape",
      windowsVirtualKeyCode: 27,
    });
    await client.send("Input.dispatchKeyEvent", {
      type: "keyUp",
      key: "Escape",
      code: "Escape",
      windowsVirtualKeyCode: 27,
    });
    expect(await run("closed")).toBe("closed");
    expect(await run("focus")).toBe("Replay editor tour");
    expect(await run("replay")).toBe("preview");
    expect(await run("skip")).toBe("closed");
    expect(await run("dirty")).toBe("blocked");
    expect(await run("discard")).toBe("clean");
    expect(await run("replay")).toBe("preview");
    for (const target of targets.slice(1, targets.indexOf("hook")))
      expect(await run("next")).toBe(target);
    await run("hide-hook");
    expect(await run("next-missing")).toBe("dismissible");
    await run("skip");
    await run("restore-hook");
    fixture.sibling!.state = "rendering";
    await new Promise((done) => setTimeout(done, 1200));
    expect(JSON.parse(await run("state"))).toMatchObject({
      editor: false,
      modal: false,
    });
    fixture.sibling!.state = "ready";
    await new Promise((done) => setTimeout(done, 1500));
    expect(await run("closed")).toBe("closed");
    expect(await run("start-over")).toBe("cleared");
    expect(await run("not-open")).toBe("waiting");
    fixture.holdPreview();
    expect(await run("fresh-video")).toBe("loading");
    expect(await run("not-open")).toBe("waiting");
    expect(fixture.tourSessionCounts()).toMatchObject({ resets: 1, opens: 1 });
    expect(fixture.tourSessionCounts().pendingPreviews).toBeGreaterThan(0);
    fixture.releasePreview();
    expect(await run("wait")).toBe("preview");
    await run("skip");
    await page.goto({ url: fixture.url, timeout: 15000 });
    await install();
    expect(await run("closed")).toBe("closed");
    expect(await run("start-over")).toBe("cleared");
    await page.goto({ url: fixture.url, timeout: 15000 });
    await install();
    expect(await run("not-open")).toBe("waiting");
    expect(await run("fresh-video")).toBe("loading");
    expect(await run("wait")).toBe("preview");
    await run("skip");
    expect(fixture.tourSessionCounts()).toEqual({
      resets: 2,
      opens: 2,
      pendingPreviews: 0,
    });
    expect(fixture.clip.edit).toEqual(original);
    expect(fixture.sibling!.edit).toEqual(siblingOriginal);
    expect(fixture.counts()).toEqual({ edits: 0, unexpected: 0 });
    expect(fixture.clip.calls).toEqual({ plan: 0, image: 0, render: 0 });
    expect(fixture.titleCounts().titleSuggestions).toBe(0);
    expect(issues).toEqual([]);
  } finally {
    await browser?.close({ silent: true });
    await fixture.close();
  }
}, 180000);
