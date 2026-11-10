import { expect, it } from "vitest";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { startHookEditorFixture } from "./owner-hook-browser-fixture.ts";

it("resolves a saved destination before rendering stages and keeps decoding inside the editor", async () => {
  const fixture = await startHookEditorFixture(undefined, {
    workflowScreens: true,
    holdWorkspace: true,
    holdClips: true,
    holdPreview: true,
  });
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
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.goto({ url: fixture.url, timeout: 15000 });
    await page.evaluate(`
      globalThis.entryStages=new Set();
      globalThis.entryObserve=()=>{const stage=document.querySelector('main')?.dataset.stage;if(stage)entryStages.add(stage);};
      globalThis.entryObserver=new MutationObserver(entryObserve);entryObserver.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-stage']});entryObserve();
      globalThis.entryWait=async state=>{for(let i=0;i<400;i++){const found=state==='opening'?document.querySelector('[data-stage="opening"]'):state==='held'?document.querySelector('.editor-layout[data-loading]'):document.querySelector('.editor-layout:not([data-loading])');if(found)return true;await new Promise(r=>setTimeout(r,20));}throw Error('entry_'+state);};
      globalThis.entryClick=label=>{const n=[...document.querySelectorAll('button')].find(n=>n.textContent.trim()===label);if(!n)throw Error('entry_button');n.click();};
      globalThis.entryBounds=()=>['.editor-layout','.editor-preview','.editor-preview-canvas','.editor-panels'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return [r.x,r.y,r.width,r.height].map(v=>Math.round(v));});
    `);
    expect(await page.evaluate("entryWait('opening')")).toBe(true);
    expect(
      await page.evaluate(
        "!!document.querySelector('[aria-label=\"Workflow progress\"],.source-intake,.moment-selection')",
      ),
    ).toBe(false);
    fixture.releaseEntry("workspace");
    for (let i = 0; i < 100 && fixture.entryReads().clips === 0; i++)
      await new Promise((done) => setTimeout(done, 10));
    expect(fixture.entryReads().clips).toBeGreaterThan(0);
    expect(await page.evaluate("[...entryStages]")).toEqual(["opening"]);
    expect(fixture.entryReads()).toMatchObject({ source: 0, analysis: 0 });
    fixture.releaseEntry("clips");
    expect(await page.evaluate("entryWait('held')")).toBe(true);
    const held = await page.evaluate(
      `(()=>{const spinner=document.querySelector('.editor-preview-loading').getBoundingClientRect(),canvas=document.querySelector('.editor-preview-canvas').getBoundingClientRect();return {stage:document.querySelector('main').dataset.stage,stages:[...entryStages],blocked:document.querySelector('.editor-layout').inert,local:spinner.left>=canvas.left-1&&spinner.right<=canvas.right+1&&spinner.top>=canvas.top-1&&spinner.bottom<=canvas.bottom+1,panels:document.querySelector('.editor-panels').getBoundingClientRect().width>100,giant:!!document.querySelector('.clip-editor>.clip-preparing')};})()`,
    );
    expect(held).toEqual({
      stage: "2",
      stages: ["opening", "2"],
      blocked: true,
      local: true,
      panels: true,
      giant: false,
    });
    const before = await page.evaluate("entryBounds()");
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await page.evaluate(
      "(async()=>{for(let i=0;i<4;i++)await new Promise(requestAnimationFrame);})()",
    );
    const phoneBefore = await page.evaluate("entryBounds()");
    fixture.releasePreview();
    expect(await page.evaluate("entryWait('ready')")).toBe(true);
    expect(await page.evaluate("entryBounds()")).toEqual(phoneBefore);
    expect(
      await page.evaluate("document.documentElement.scrollWidth<=innerWidth"),
    ).toBe(true);
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.evaluate(
      "(async()=>{for(let i=0;i<4;i++)await new Promise(requestAnimationFrame);})()",
    );
    expect(await page.evaluate("entryBounds()")).toEqual(before);
    expect(fixture.entryReads()).toMatchObject({ source: 0, analysis: 0 });
    // Visiting Moments is explicit; its forms remain mounted across Back/Add.
    await page.evaluate("entryClick('+ Add')");
    await page.evaluate(
      `(async()=>{for(let i=0;i<300&&!document.querySelector('.selection:not([data-waiting]) .manual-clip-actions');i++)await new Promise(r=>setTimeout(r,20));entryClick('Add clip');})()`,
    );
    await page.evaluate(
      `(async()=>{for(let i=0;i<50&&!document.querySelector('[aria-label="Clip 1 start"]');i++)await new Promise(requestAnimationFrame);const n=document.querySelector('[aria-label="Clip 1 start"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(n,'00:00:01');n.dispatchEvent(new Event('input',{bubbles:true}));entryClick('Back to editor');})()`,
    );
    await page.evaluate("entryClick('+ Add')");
    expect(
      await page.evaluate(
        "document.querySelector('[aria-label=\"Clip 1 start\"]').value",
      ),
    ).toBe("00:00:01");
    expect(fixture.entryReads().analysis).toBe(1);
    // A rejected initial clip read stays in the neutral shell with explicit recovery.
    fixture.setEntryMissing(true);
    await page.goto({ url: fixture.url, timeout: 15000 });
    expect(
      await page.evaluate(
        `(async()=>{for(let i=0;i<300&&!document.querySelector('.workspace-opening-failure');i++)await new Promise(r=>setTimeout(r,20));return {stage:document.querySelector('main').dataset.stage,source:!!document.querySelector('.source-intake,.moment-selection'),retry:[...document.querySelectorAll('button')].some(n=>n.textContent.trim()==='Try again')};})()`,
      ),
    ).toEqual({ stage: "opening", source: false, retry: true });
    const missingReads = fixture.entryReads().clips;
    await new Promise((done) => setTimeout(done, 100));
    expect(fixture.entryReads().clips).toBe(missingReads);
    fixture.setEntryMissing(false);
    expect(
      await page.evaluate(
        `(async()=>{[...document.querySelectorAll('button')].find(n=>n.textContent.trim()==='Try again').click();for(let i=0;i<400&&!document.querySelector('.editor-layout:not([data-loading])');i++)await new Promise(r=>setTimeout(r,20));return document.querySelector('main').dataset.stage;})()`,
      ),
    ).toBe("2");
    await page.goto({ url: fixture.url + "intake.html", timeout: 15000 });
    expect(
      await page.evaluate(
        `(async()=>{for(let i=0;i<300&&!document.querySelector('.source-intake');i++)await new Promise(r=>setTimeout(r,20));return {stage:document.querySelector('main').dataset.stage,moments:!!document.querySelector('.moment-selection')};})()`,
      ),
    ).toEqual({ stage: "0", moments: false });
    await page.goto({ url: fixture.url + "moments.html", timeout: 15000 });
    expect(
      await page.evaluate(
        `(async()=>{for(let i=0;i<300&&!document.querySelector('.selection:not([data-waiting])');i++)await new Promise(r=>setTimeout(r,20));return {stage:document.querySelector('main').dataset.stage,source:!!document.querySelector('.source-preview'),editor:!!document.querySelector('.clip-editor')};})()`,
      ),
    ).toEqual({ stage: "1", source: true, editor: false });
    expect(fixture.counts()).toEqual({ edits: 0, unexpected: 0 });
    expect(fixture.clip.calls).toEqual({ plan: 0, image: 0, render: 0 });
  } finally {
    await browser?.close({ silent: true });
    await fixture.close();
  }
}, 60000);
