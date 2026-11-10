import { expect, it } from "vitest";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { startBrandSpinnerFixture } from "./owner-brand-spinner-fixture.ts";

it("keeps the full floating logo inside its rotating ring at every supported scale", async () => {
  const fixture = await startBrandSpinnerFixture();
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
    expect(
      await page.evaluate(`(async()=>{
      for(let i=0;i<200&&!document.querySelector('[data-branded-spinner]');i++)await new Promise(r=>setTimeout(r,20));
      const roots=[...document.querySelectorAll('[data-branded-spinner]')];
      return {count:roots.length,running:roots.every(n=>n.getAnimations({subtree:true}).length===3&&n.getAnimations({subtree:true}).every(a=>a.playState==='running')),statuses:document.querySelectorAll('p[role="status"]').length,progress:document.querySelector('[role="progressbar"]').getAttribute('aria-valuenow')};
    })()`),
    ).toEqual({ count: 12, running: true, statuses: 6, progress: "42" });
    await page.evaluate(`
      globalThis.spinnerClearance=()=>Math.min(...[...document.querySelectorAll('[data-branded-spinner]')].map(root=>{
        const ring=root.querySelector('[data-brand-spinner-ring]'),svg=ring.ownerSVGElement,mark=root.querySelector(':scope > span[aria-hidden="true"]');
        const m=ring.getScreenCTM(),center=new DOMPoint(50,50).matrixTransform(m),b=mark.getBoundingClientRect();
        const innerRadius=(ring.r.baseVal.value-Number(ring.getAttribute('stroke-width'))/2)*Math.hypot(m.a,m.b);
        if(Number(getComputedStyle(svg).zIndex)<=Number(getComputedStyle(mark).zIndex))throw Error('spinner_stacking');
        return innerRadius-Math.max(...[[b.left,b.top],[b.right,b.top],[b.right,b.bottom],[b.left,b.bottom]].map(([x,y])=>Math.hypot(x-center.x,y-center.y)));
      }));
      for(const a of document.getAnimations())a.pause();
    `);
    for (const [width, height] of [
      [320, 568],
      [390, 844],
      [768, 1024],
      [1440, 900],
    ]) {
      await page.setViewport({
        width: width!,
        height: height!,
        deviceScaleFactor: 1,
      });
      for (const [rootSize, zoom] of [
        [12, 1],
        [16, 1],
        [24, 1.25],
        [32, 2],
      ]) {
        const clearance = await page.evaluate(`(async()=>{
          document.documentElement.style.fontSize='${rootSize}px';document.body.style.zoom='${zoom}';
          let minimum=Infinity;
          for(const time of [0,400,800,1200,1600,2000,2400,2800,3200]){
            for(const a of document.getAnimations())a.currentTime=time;
            await new Promise(requestAnimationFrame);minimum=Math.min(minimum,spinnerClearance());
          }
          return minimum;
        })()`);
        expect(
          clearance,
          `${width}px / ${rootSize}px text / ${zoom} zoom`,
        ).toBeGreaterThan(1);
      }
    }
    await page._client().send("Emulation.setEmulatedMedia", {
      // @ts-expect-error Installed Chrome supports forced colors; pinned types only allow dark mode.
      features: [{ name: "forced-colors", value: "active" }],
    });
    expect(
      await page.evaluate(`(()=>{
      const ring=document.querySelector('[data-brand-spinner-ring]');
      return matchMedia('(forced-colors: active)').matches&&getComputedStyle(ring).stroke!=='none'&&spinnerClearance()>1;
    })()`),
    ).toBe(true);
    // The old fixed logo at compact size must fail the same geometric assertion.
    expect(
      await page.evaluate(`(()=>{
      document.documentElement.style.fontSize='16px';document.body.style.zoom='1';
      const logo=document.querySelector('[data-size="compact"] > span[aria-hidden="true"]');
      logo.style.width='3.15rem';logo.style.height='3.15rem';logo.style.transform='translateY(-0.3rem)';logo.style.animation='none';
      return spinnerClearance();
    })()`),
    ).toBeLessThan(0);
  } finally {
    await browser?.close({ silent: true });
    await fixture.close();
  }
}, 60000);
