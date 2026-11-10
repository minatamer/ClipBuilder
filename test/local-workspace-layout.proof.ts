import { expect, it } from "vitest";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { startHookEditorFixture } from "./owner-hook-browser-fixture.ts";

declare global {
  function compactPlaybackSeek(): Promise<void>;
  function workspaceNavigationLayout(): Promise<boolean>;
  function compactPlaybackPoint(label: string): { x: number; y: number };
  function compactPlaybackFullscreen(): Promise<{
    active: boolean;
    fits: boolean;
    native: boolean;
    duplicate: boolean;
    bounds: number[];
  }>;
  function compactPlaybackRestored(): Promise<{
    position: string | undefined;
    muted: boolean;
  }>;
  function checkWorkspaceSection(section: string): Promise<{
    overflow: number;
    preview: boolean;
    panels: boolean;
    toolbar: boolean;
    inputs: boolean;
    legacy: boolean;
    transport: boolean;
    orientation: string;
  }>;
}

it("keeps the preview and canonical controls reachable across laptop, tablet and phone sizes", async () => {
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
    await page.goto({ url: fixture.url, timeout: 15000 });
    await page.evaluate(`globalThis.checkWorkspaceSection=async section=>{
      const wait=async fn=>{for(let i=0;i<400;i++){if(fn())return;await new Promise(r=>setTimeout(r,25));}throw Error('workspace_not_ready');};
      await wait(()=>document.querySelector('.editor-layout:not([data-loading]) .editor-panels'));
      const tab=[...document.querySelectorAll('.editor-tabs button')].find(n=>n.textContent.trim()===section);tab.click();
      for(let i=0;i<3;i++)await new Promise(requestAnimationFrame);
      if(section==='Media'){document.querySelector('[data-timeline-key^="body:picture:"]').click();for(let i=0;i<3;i++)await new Promise(requestAnimationFrame);}
      const box=selector=>document.querySelector(selector).getBoundingClientRect();
      const header=box('[data-workspace-toolbar]'),preview=box('.editor-preview'),panels=box('.editor-panels');
      const within=r=>r.left>=-1&&r.right<=innerWidth+1&&r.top>=header.bottom-1&&r.bottom<=innerHeight+1&&r.height>60&&r.width>40;
      const inputs=[...document.querySelectorAll('.editor-panels input,.editor-panels select,.editor-panels textarea')].filter(n=>n.getClientRects().length&&!n.closest('[hidden]'));
      const transport=document.querySelector('.compact-editor-playback'),clock=transport?.querySelector('.compact-playback-clock').getBoundingClientRect();
      return {orientation:document.querySelector('[aria-label="Choose a clip"]').getAttribute('aria-orientation'),overflow:document.documentElement.scrollWidth-innerWidth,preview:within(preview),panels:within(panels),toolbar:header.top>=-1&&header.bottom<=innerHeight,inputs:inputs.every(n=>{const r=n.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1}),legacy:!!document.querySelector('#sample-main>footer')||[...document.querySelectorAll('button')].some(n=>['Apply changes','Discard changes'].includes(n.textContent.trim())),transport:!transport||(within(transport.getBoundingClientRect())&&clock.height<24&&transport.querySelectorAll('button').length===3&&document.querySelectorAll('button[aria-label="Play video"],button[aria-label="Pause video"]').length===1)};
    };
    globalThis.compactPlaybackSeek=async()=>{
      const position=document.querySelector('[aria-label="Preview position"]');
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(position,'60');position.dispatchEvent(new Event('input',{bubbles:true}));
      for(let i=0;i<4;i++)await new Promise(requestAnimationFrame);
    };
    globalThis.compactPlaybackPoint=label=>{const b=document.querySelector('[aria-label="'+label+'"]').getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2};};
    globalThis.compactPlaybackFullscreen=async()=>{
      for(let i=0;i<100&&(!document.querySelector('[aria-label="Exit fullscreen"]')||document.querySelector('.compact-editor-playback'));i++)await new Promise(requestAnimationFrame);
      for(let i=0;i<4;i++)await new Promise(requestAnimationFrame);
      const r=document.fullscreenElement?.getBoundingClientRect();
      return {active:!!r,fits:!!r&&Math.abs(r.width-document.documentElement.getBoundingClientRect().width)<2&&Math.abs(r.height-innerHeight)<2,native:!!document.querySelector('[aria-label="Exit fullscreen"]'),duplicate:!!document.querySelector('.compact-editor-playback'),bounds:r?[r.x,r.y,r.width,r.height,innerWidth,innerHeight,document.documentElement.clientWidth,document.documentElement.clientHeight]:[]};
    };
    globalThis.compactPlaybackRestored=async()=>{
      for(let i=0;i<50&&!document.querySelector('.compact-editor-playback');i++)await new Promise(requestAnimationFrame);
      return {position:document.querySelector('[aria-label="Preview position"]')?.value,muted:!!document.querySelector('.compact-editor-playback [aria-label="Unmute sound"]')};
    };
    globalThis.workspaceNavigationLayout=async()=>{
      document.querySelector('.clip-rail-heading button').click();
      for(let i=0;i<100&&document.querySelector('h1').textContent!=='Choose your moments';i++)await new Promise(requestAnimationFrame);
      for(let i=0;i<4;i++)await new Promise(requestAnimationFrame);
      const visible=document.querySelector('h1').getBoundingClientRect().top>=document.querySelector('[data-workspace-toolbar]').getBoundingClientRect().bottom;
      [...document.querySelectorAll('button')].find(n=>n.textContent.trim()==='Back to editor').click();
      for(let i=0;i<100&&!document.querySelector('.editor-preview');i++)await new Promise(requestAnimationFrame);
      return visible&&!!document.querySelector('.editor-preview')&&document.querySelector('.source-preview video').paused;
    }`);
    for (const [width, height] of [
      [1920, 1080],
      [1440, 900],
      [1280, 720],
      [1366, 600],
      [1024, 768],
      [768, 1024],
      [390, 844],
      [320, 568],
      [844, 390],
    ] as const) {
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      for (const section of [
        "Home",
        "Captions",
        "Text",
        "Filters",
        "Media",
        "Camera",
        "Hook",
      ]) {
        const result = await page.evaluate(
          (section) => checkWorkspaceSection(section),
          section,
        );
        expect(result, `${width}x${height} ${section}`).toEqual({
          overflow: expect.any(Number),
          preview: true,
          panels: true,
          toolbar: true,
          inputs: true,
          legacy: false,
          transport: true,
          orientation: width < 1024 ? "horizontal" : "vertical",
        });
        expect(result.overflow).toBeLessThanOrEqual(0);
      }
    }
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await page.evaluate(() => compactPlaybackSeek());
    const click = async (label: string) => {
      const point = await page.evaluate(
        (label) => compactPlaybackPoint(label),
        label,
      );
      await page._client().send("Input.dispatchMouseEvent", {
        type: "mousePressed",
        ...point,
        button: "left",
        buttons: 1,
        clickCount: 1,
      });
      await page._client().send("Input.dispatchMouseEvent", {
        type: "mouseReleased",
        ...point,
        button: "left",
        buttons: 0,
        clickCount: 1,
      });
    };
    await click("Mute sound");
    await click("Enter Fullscreen");
    const fullscreen = await page.evaluate(() => compactPlaybackFullscreen());
    expect(fullscreen, JSON.stringify(fullscreen)).toMatchObject({
      active: true,
      fits: true,
      native: true,
      duplicate: false,
    });
    await click("Exit fullscreen");
    expect(await page.evaluate(() => compactPlaybackRestored())).toEqual({
      position: "60",
      muted: true,
    });
    expect(await page.evaluate(() => workspaceNavigationLayout())).toBe(true);
    expect(fixture.counts()).toEqual({ edits: 0, unexpected: 0 });
  } finally {
    await browser?.close({ silent: true });
    await fixture.close();
  }
}, 45000);
