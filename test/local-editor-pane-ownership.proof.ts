import { expect, it } from "vitest";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { startHookEditorFixture } from "./owner-hook-browser-fixture.ts";

it("keeps editing forms with their sub-tabs in the inspector and preserves caption save/Undo across responsive panes", async () => {
  const fixture = await startHookEditorFixture(undefined, {
    youtubeAudio: true,
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
      globalThis.paneWait=async predicate=>{for(let i=0;i<400;i++){if(predicate())return;await new Promise(r=>setTimeout(r,20));}throw Error('pane_wait');};
      globalThis.paneVisible=n=>!!n&&n.getClientRects().length>0&&!n.closest('[hidden]');
      globalThis.paneClick=async(label,root=document)=>{const n=[...root.querySelectorAll('button')].find(n=>paneVisible(n)&&(n.getAttribute('aria-label')===label||n.textContent.trim()===label));if(!n||n.disabled)throw Error('pane_button_'+label);n.click();for(let i=0;i<3;i++)await new Promise(requestAnimationFrame);};
      globalThis.paneLayout=()=>[...document.querySelectorAll('.editor-inspector-layout')].find(paneVisible);
      globalThis.paneCheck=()=>({misplaced:[...document.querySelectorAll('.editor-collection input:not([type="file"]),.editor-collection select,.editor-collection textarea')].filter(paneVisible).map(n=>n.getAttribute('aria-label')||n.tagName),forms:[...document.querySelectorAll('.editor-context-inspector .editor-properties')].filter(paneVisible).length});
      globalThis.paneSection=async label=>{await paneWait(()=>document.querySelector('.editor-layout:not([data-loading])'));await paneClick(label,document.querySelector('.editor-tabs'));};
      globalThis.paneSubtab=async label=>{await paneClick(label,paneLayout().querySelector('.editor-context-inspector'));return paneCheck();};
      globalThis.paneSaved=()=>paneWait(()=>document.querySelector('.editor-save-status')?.textContent.trim()==='Saved');
    `);
    const check = async () =>
      expect(await page.evaluate("paneCheck()")).toMatchObject({
        misplaced: [],
        forms: expect.any(Number),
      });
    await page.evaluate("paneSection('Captions')");
    await page.evaluate(
      `document.querySelector('[data-timeline-key^="body:caption:"]').click()`,
    );
    for (const tab of ["Style", "Position", "Text", "Speakers"]) {
      expect(
        await page.evaluate(`paneSubtab(${JSON.stringify(tab)})`),
      ).toMatchObject({ misplaced: [], forms: 1 });
    }
    await page.evaluate("paneSubtab('Text')");
    expect(
      await page.evaluate(
        `(()=>{const n=document.querySelector('[aria-label="Caption 1 word 1"]');return {right:!!n?.closest('.editor-context-inspector'),timeline:!!document.querySelector('.editor-collection [data-timeline-key^="body:caption:"]')};})()`,
      ),
    ).toEqual({ right: true, timeline: true });
    const word = fixture.clip.base!.overlay.captions[0]!.wordCues[0]!;
    await page.evaluate(
      `(()=>{const n=document.querySelector('[aria-label="Caption 1 word 1"]');n.focus();Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(n,'Revised');n.dispatchEvent(new Event('input',{bubbles:true}));})()`,
    );
    await page.evaluate(
      "paneWait(()=>document.querySelector('.editor-save-status')?.textContent.trim()==='Saving…')",
    );
    await page.evaluate("paneSaved()");
    expect(
      fixture.clip.edit!.captionText?.find(
        (item) => item.wordId === word.wordId,
      )?.text,
    ).toBe("Revised");
    await page.evaluate("paneClick('Undo')");
    await page.evaluate("paneSaved()");
    expect(
      fixture.clip.edit!.captionText?.some(
        (item) => item.wordId === word.wordId && item.text === "Revised",
      ),
    ).toBe(false);
    for (const [width, height] of [
      [1440, 900],
      [1024, 768],
      [390, 844],
    ] as const) {
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      await page.evaluate(
        "(async()=>{for(let i=0;i<4;i++)await new Promise(requestAnimationFrame);})()",
      );
      expect(
        await page.evaluate(
          `(()=>{const n=document.querySelector('[aria-label="Caption 1 word 1"]');return {right:!!n?.closest('.editor-context-inspector'),visible:paneVisible(n),overflow:document.documentElement.scrollWidth>innerWidth};})()`,
        ),
      ).toEqual({ right: true, visible: true, overflow: false });
      if (width < 1440) {
        await page.evaluate(
          "paneClick('Layers',paneLayout().querySelector('.editor-narrow-navigation'))",
        );
        expect(
          await page.evaluate(
            "paneLayout().querySelector('.editor-collection').querySelectorAll('input,textarea,select').length",
          ),
        ).toBe(0);
        await page.evaluate(
          `(async()=>{document.querySelector('[data-timeline-key^="body:caption:"]').click();for(let i=0;i<4;i++)await new Promise(requestAnimationFrame);})()`,
        );
        // Re-selecting the same timeline item need not force a pane; Properties is always reachable.
        await page.evaluate(
          "paneClick('Properties',paneLayout().querySelector('.editor-narrow-navigation'))",
        );
        expect(
          await page.evaluate(
            `paneVisible(document.querySelector('[aria-label="Caption 1 word 1"]'))`,
          ),
        ).toBe(true);
      }
    }
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.evaluate("paneSection('Text')");
    for (const tab of ["Content", "Style", "Timing", "Position"]) {
      await page.evaluate(`paneSubtab(${JSON.stringify(tab)})`);
      await check();
    }
    await page.evaluate("paneSection('Filters')");
    await check();
    await page.evaluate("paneSection('Media')");
    await page.evaluate(
      `(async()=>{document.querySelector('[data-timeline-key^="body:picture:"]').click();await new Promise(requestAnimationFrame);})()`,
    );
    for (const tab of ["Image", "Timing", "Position"]) {
      await page.evaluate(`paneSubtab(${JSON.stringify(tab)})`);
      await check();
    }
    await page.evaluate("paneClick('Audio')");
    await page.evaluate(
      `paneClick([...document.querySelectorAll('button')].find(n=>n.textContent.trim().startsWith('Your audio')).textContent.trim())`,
    );
    await check();
    await page.evaluate("paneClick('Sound library')");
    await page.evaluate("paneClick('From YouTube')");
    expect(
      await page.evaluate(
        `!!document.querySelector('[aria-label="YouTube audio URL"]')?.closest('.editor-context-inspector')`,
      ),
    ).toBe(true);
    await check();
    await page.evaluate("paneClick('Back to sounds')");
    await page.evaluate("paneSection('Camera')");
    await page.evaluate(
      `(async()=>{const target=document.querySelector('[aria-label="Camera target"]');target.value='original';target.dispatchEvent(new Event('change',{bubbles:true}));for(let i=0;i<4;i++)await new Promise(requestAnimationFrame);})()`,
    );
    for (const tab of ["Camera", "People", "Zoom", "Pan", "Face tracking"]) {
      await page.evaluate(
        `paneClick(${JSON.stringify(tab)},document.querySelector('.focus-inspector'))`,
      );
      expect(
        await page.evaluate(
          `(()=>{const source=document.querySelector('.focus-source').getBoundingClientRect(),settings=document.querySelector('.focus-inspector').getBoundingClientRect();return settings.x>source.x&&settings.width>100;})()`,
        ),
      ).toBe(true);
    }
    await page.evaluate("paneSection('Hook')");
    await check();
    expect(fixture.counts()).toEqual({ edits: 2, unexpected: 0 });
    expect(fixture.clip.calls).toEqual({ plan: 0, image: 0, render: 0 });
  } finally {
    await browser?.close({ silent: true });
    await fixture.close();
  }
}, 60000);
