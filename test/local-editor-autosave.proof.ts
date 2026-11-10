import { expect, it } from "vitest";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { startHookEditorFixture } from "./owner-hook-browser-fixture.ts";

declare global {
  function autosaveAction(action: string, value?: string): Promise<string>;
}

it("serializes autosave, preserves later changes, reconciles uncertain saves and keeps history across sections", async () => {
  const fixture = await startHookEditorFixture(undefined, {
    siblingClip: true,
    configure: (clip) => {
      clip.edit!.captions = structuredClone(clip.base!.overlay.captionStyle!);
    },
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
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto({ url: fixture.url, timeout: 15000 });
    await page.evaluate(`globalThis.autosaveAction=async(action,value)=>{
      const visible=n=>n&&n.getClientRects().length&&!n.closest('[hidden]');
      const button=text=>[...document.querySelectorAll('button')].find(n=>visible(n)&&(n.getAttribute('aria-label')===text||n.textContent.trim()===text));
      const wait=async(fn,label)=>{for(let i=0;i<400;i++){if(fn())return;await new Promise(r=>setTimeout(r,25));}throw Error('autosave_timeout_'+label);};
      const status=()=>document.querySelector('.editor-save-status')?.textContent.trim();
      if(action==='geometry'){for(let i=0;i<3;i++)await new Promise(requestAnimationFrame);return JSON.stringify(['[data-workspace-toolbar]','.editor-preview','.editor-panels'].map(selector=>{const r=document.querySelector(selector).getBoundingClientRect();return [r.x,r.y,r.width,r.height]}));}
      const field=()=>[...document.querySelectorAll('.editor-properties label')].find(n=>n.firstChild?.textContent.trim()==='Font size')?.querySelector('input');
      await wait(()=>button('Captions')&&!button('Captions').disabled,'ready');
      if(action==='section'){button(value).click();await new Promise(requestAnimationFrame);return status();}
      if(action==='wait'){await wait(()=>status()===value,value);return status();}
      if(action==='click'){await wait(()=>button(value)&&!button(value).disabled,value);button(value).click();await new Promise(requestAnimationFrame);return status();}
      if(action==='body'){button('Captions').click();await new Promise(requestAnimationFrame);document.querySelector('[data-timeline-key^="body:caption:"]').click();await new Promise(requestAnimationFrame);return status();}
      if(action==='reset-guard'){document.querySelector('[data-workspace-toolbar] summary').click();await new Promise(requestAnimationFrame);button('Start over').click();await wait(()=>button('Reset options'),'reset_guard');document.querySelector('[data-workspace-toolbar] summary').click();return status();}
      if(action==='hook-incomplete'){
        button('Hook').click();await new Promise(requestAnimationFrame);
        const input=document.querySelector('[aria-label="Hook start seconds"]');
        input.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'4');input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));await new Promise(requestAnimationFrame);
        if(document.querySelector('[aria-label="Hook end seconds"]').value!=='')throw Error('hook_end_not_cleared');return status();
      }
      if(action==='hook-end')return document.querySelector('[aria-label="Hook end seconds"]').value;
      if(action==='preset-count')return String(document.querySelector('[role="radiogroup"][aria-label="Style"]').querySelectorAll('[role="radio"]').length);
      if(!field()){button('Captions').click();await new Promise(requestAnimationFrame);}
      await wait(()=>field(),'font');
      if(action==='set'){field().dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(field(),value);field().dispatchEvent(new Event('input',{bubbles:true}));field().dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));await new Promise(requestAnimationFrame);}
      return field().value;
    }`);
    const run = (action: string, value?: string) =>
      page.evaluate((a, v) => autosaveAction(a, v), action, value ?? "");
    const geometryAtSizes = async () => {
      const result = [];
      for (const width of [1440, 768, 390, 320]) {
        await page.setViewport({ width, height: 1000, deviceScaleFactor: 1 });
        result.push(await run("geometry"));
      }
      await page.setViewport({
        width: 1440,
        height: 1000,
        deviceScaleFactor: 1,
      });
      return result;
    };
    const pending = async () => {
      for (let i = 0; i < 160 && !fixture.editTransport().pending; i++)
        await new Promise((done) => setTimeout(done, 25));
      expect(fixture.editTransport().pending).toBe(1);
    };
    await run("body");
    fixture.setEditOutcome("hold");
    await run("set", "70");
    await pending();
    await run("reset-guard");
    expect(fixture.tourSessionCounts().resets).toBe(0);
    await run("set", "74");
    expect(fixture.editTransport().requests).toHaveLength(1);
    fixture.releaseEdits();
    await run("wait", "Saved");
    expect(fixture.clip.edit!.captions!.fontSize).toBe(74);
    const savedGeometry = await geometryAtSizes();
    const beforeIncomplete = fixture.editTransport().requests.length;
    await run("hook-incomplete");
    await run("wait", "Check edits");
    await new Promise((done) => setTimeout(done, 800));
    expect(fixture.editTransport().requests).toHaveLength(beforeIncomplete);
    await run("click", "Undo");
    expect(await run("hook-end")).toBe("3");
    await run("click", "Redo");
    expect(await run("hook-end")).toBe("");
    await run("click", "Undo");
    await run("wait", "Saved");
    expect(fixture.counts().edits).toBe(2);
    await run("section", "Media");
    await run("click", "Undo");
    await run("wait", "Saved");
    expect(fixture.clip.edit!.captions!.fontSize).toBe(70);
    await run("click", "Undo");
    await run("wait", "Saved");
    expect(fixture.clip.edit!.captions!.fontSize).toBe(64);
    await run("click", "Redo");
    await run("wait", "Saved");
    expect(fixture.clip.edit!.captions!.fontSize).toBe(70);
    await run("click", "Redo");
    await run("wait", "Saved");
    expect(fixture.clip.edit!.captions!.fontSize).toBe(74);
    await run("click", "Edit Clip 2");
    await run("set", "66");
    await run("wait", "Saved");
    expect(fixture.sibling!.edit!.hookContent!.edits.captions!.fontSize).toBe(
      66,
    );
    expect(fixture.clip.edit!.captions!.fontSize).toBe(74);
    await run("click", "Edit Clip 1");
    await run("body");
    await run("click", "Undo");
    await run("wait", "Saved");
    expect(fixture.clip.edit!.captions!.fontSize).toBe(70);
    await run("click", "Undo");
    await run("wait", "Saved");
    expect(fixture.clip.edit!.captions!.fontSize).toBe(64);
    await run("click", "Redo");
    await run("wait", "Saved");
    await run("click", "Redo");
    await run("wait", "Saved");
    expect(fixture.clip.edit!.captions!.fontSize).toBe(74);
    fixture.setEditOutcome("fail-after");
    await run("set", "76");
    await run("wait", "Couldn’t save");
    expect(await geometryAtSizes()).toEqual(savedGeometry);
    const failedBody = fixture.editTransport().requests.at(-1);
    expect(fixture.clip.edit!.captions!.fontSize).toBe(76);
    await run("set", "78");
    await new Promise((done) => setTimeout(done, 900));
    expect(fixture.editTransport().requests.at(-1)).toBe(failedBody);
    fixture.setEditOutcome("ready");
    await run("click", "Retry save");
    await run("wait", "Saved");
    expect(fixture.editTransport().requests.at(-2)).toBe(failedBody);
    expect(fixture.clip.edit!.captions!.fontSize).toBe(78);
    const requests = fixture.editTransport().requests.length;
    await run("set", "");
    await run("wait", "Check edits");
    await new Promise((done) => setTimeout(done, 800));
    expect(fixture.editTransport().requests).toHaveLength(requests);
    await run("click", "Undo");
    await run("wait", "Saved");
    fixture.setEditOutcome("hold");
    await run("set", "80");
    await pending();
    await run("click", "Undo");
    fixture.releaseEdits();
    await run("wait", "Saved");
    expect(fixture.clip.edit!.captions!.fontSize).toBe(78);
    fixture.setEditOutcome("conflict");
    await run("set", "82");
    await run("wait", "Clip changed elsewhere");
    expect(await geometryAtSizes()).toEqual(savedGeometry);
    const conflicts = fixture.editTransport().requests.length;
    await new Promise((done) => setTimeout(done, 800));
    expect(fixture.editTransport().requests).toHaveLength(conflicts);
    fixture.setEditOutcome("ready");
    await run("click", "Reload clip");
    await run("wait", "Saved");
    expect(await run("get")).toBe("78");
    expect(await run("preset-count")).toBe("9");
    const captionBox = structuredClone(fixture.clip.edit!.captions!.box);
    await run("click", "Classic");
    await run("wait", "Saved");
    expect(fixture.clip.edit!.captions!.preset).toBe("classic");
    expect(fixture.clip.edit!.captions!.box).toEqual(captionBox);
    await run("click", "Undo");
    await run("wait", "Saved");
    expect(fixture.clip.edit!.captions!.fontSize).toBe(78);
    await run("section", "Filters");
    await run("click", "Warm");
    await run("wait", "Saved");
    expect(
      fixture.clip.edit!.videoLooks?.some((range) => range.preset === "warm"),
    ).toBe(true);
    expect(fixture.counts().unexpected).toBe(0);
    expect(fixture.clip.calls).toEqual({ plan: 0, image: 0, render: 0 });
    expect(fixture.editTransport().pending).toBe(0);
  } finally {
    await browser?.close({ silent: true });
    await fixture.close();
  }
}, 75000);
