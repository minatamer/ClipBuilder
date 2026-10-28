import { expect, it } from "vitest";
import { get } from "node:http";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";

// The Vitest setup installs fake/paid-off and socket interception before imports.
// This read-only browser proof refuses a live normal app and intercepts every
// page request before network dispatch. No session/media/processing action runs.
it("reviews roomy responsive platform cards and illustrative count-ups in the actual fake/no-key app", async () => {
  const config = await new Promise<string>((done, reject) => {
    get("http://localhost:3000/api/sample/config", (response) => {
      let body = "";
      response.on("data", (chunk: Buffer) => {
        body += chunk.toString();
      });
      response.on("end", () => done(body));
      response.on("error", reject);
    }).on("error", reject);
  });
  expect(JSON.parse(config)).toMatchObject({
    mode: "fake",
    liveAnalysisEnabled: false,
    liveAssemblyEnabled: false,
    liveRenderEnabled: false,
  });
  const evidence = resolve(".local-build/evidence");
  await mkdir(evidence, { recursive: true });
  const browser = await openBrowser("chrome", {
    browserExecutable: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    chromiumOptions: { headless: true },
    logLevel: "error",
  });
  let external = 0;
  let mutations = 0;
  let blockedDiagnostics = 0;
  let closing = false;
  let interceptionFailed = false;
  const pendingInterceptions = new Set<Promise<void>>();

  try {
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
      "Fetch.requestPaused",
      (event: {
        requestId: string;
        request: { url: string; method: string };
      }) => {
        const url = new URL(event.request.url);
        const remote = !["localhost", "127.0.0.1", "[::1]"].includes(
          url.hostname,
        );
        const mutate = !["GET", "HEAD"].includes(event.request.method);
        if (remote) external++;
        if (mutate) {
          mutations++;
          if (url.pathname === "/api/diagnostics") blockedDiagnostics++;
        }
        const blocked = remote || mutate;
        const command = blocked
          ? // @ts-expect-error Installed Chrome supports Fetch; pinned CDP types predate it.
            client.send("Fetch.failRequest", {
              requestId: event.requestId,
              errorReason: "BlockedByClient",
            })
          : // @ts-expect-error Installed Chrome supports Fetch; pinned CDP types predate it.
            client.send("Fetch.continueRequest", {
              requestId: event.requestId,
            });
        const pending = command.then(
          () => {},
          (error: unknown) => {
            // Navigation may cancel a paused request before its interception reply.
            const cancelled =
              error instanceof Error &&
              error.message.includes("Invalid InterceptionId.");
            if (!cancelled && !closing) interceptionFailed = true;
          },
        );
        pendingInterceptions.add(pending);
        void pending.then(() => pendingInterceptions.delete(pending));
      },
    );
    // @ts-expect-error Installed Chrome supports Fetch; pinned CDP types predate it.
    await client.send("Fetch.enable", {
      patterns: [{ urlPattern: "*", requestStage: "Request" }],
    });
    const evaluate = async (expression: string) => {
      const result = await client.send("Runtime.evaluate", {
        expression,
        awaitPromise: true,
        returnByValue: true,
      });
      if (result.value.exceptionDetails)
        throw new Error("landing_browser_expression_failed");
      return result.value.result.value;
    };
    const capture = async (name: string) => {
      const shot = await client.send("Page.captureScreenshot", {
        format: "png",
        fromSurface: true,
      });
      await writeFile(
        join(evidence, name + ".png"),
        Buffer.from(shot.value.data, "base64"),
      );
    };
    await page.setViewport({ width: 1366, height: 900, deviceScaleFactor: 1 });
    await page.goto({ url: "http://localhost:3000/", timeout: 30_000 });
    await new Promise((done) => setTimeout(done, 1600));
    const scrollTo = async (selector: string) => {
      await evaluate(
        `window.scrollTo({top:document.querySelector('${selector}').getBoundingClientRect().top+scrollY-120,behavior:'instant'})`,
      );
    };
    const values = () =>
      evaluate(
        `[...document.querySelectorAll('[data-count-target]:not([data-minutes-back])')].map(n=>Number(n.textContent))`,
      );
    const savings = () =>
      evaluate(
        `[...document.querySelectorAll('[data-minutes-back]')].map(n=>Number(n.textContent))`,
      );
    const headlineGeometry = () =>
      evaluate(
        `['[data-savings-before]','[data-headline-saved]','[data-savings-after]'].flatMap(selector=>{const r=document.querySelector(selector).getBoundingClientRect();return [r.x,r.y,r.width,r.height]})`,
      );
    expect(
      await evaluate(
        `document.querySelectorAll('[data-campaign-shining],[data-campaign-shone]').length`,
      ),
    ).toBe(0);
    await evaluate(
      `(()=>{const n=document.querySelector('[data-market-section] li');window.scrollTo({top:n.getBoundingClientRect().top+scrollY-innerHeight+16,behavior:'instant'})})()`,
    );
    await new Promise((done) => setTimeout(done, 200));
    expect(
      await evaluate(
        `document.querySelectorAll('[data-campaign-shining],[data-campaign-shone]').length`,
      ),
    ).toBe(0);
    await scrollTo("[data-campaign-wall]");
    const shineTrace: { brand: string | null; at: number; sheen: string }[] =
      [];
    const shineSeen = new Map<string, number>();
    const shineCaptured = new Set<string>();
    const shineStart = Date.now();
    while (Date.now() - shineStart < 3500) {
      const state = await evaluate(
        `(()=>{const cards=[...document.querySelectorAll('[data-campaign-shining]')],card=cards[0];return {active:cards.length,brand:card?.dataset.brand??null,sheen:card?getComputedStyle(card,'::before').translate:'none',hover:!!document.querySelector('[data-market-section] li:hover')}})()`,
      );
      expect(state.active).toBeLessThanOrEqual(1);
      expect(state.hover).toBe(false);
      shineTrace.push({
        brand: state.brand,
        at: Date.now() - shineStart,
        sheen: state.sheen,
      });
      if (state.brand) {
        if (!shineSeen.has(state.brand)) shineSeen.set(state.brand, Date.now());
        if (
          Date.now() - shineSeen.get(state.brand)! > 300 &&
          !shineCaptured.has(state.brand)
        ) {
          await capture(`cl112-shine-${state.brand}`);
          shineCaptured.add(state.brand);
        }
      }
      await new Promise((done) => setTimeout(done, 45));
    }
    expect([...shineSeen.keys()]).toEqual(["whop", "clipster", "picsart"]);
    for (const brand of shineSeen.keys()) {
      const samples = shineTrace.filter((item) => item.brand === brand);
      expect(new Set(samples.map((item) => item.sheen)).size).toBeGreaterThan(
        5,
      );
      expect(samples.at(-1)!.at - samples[0]!.at).toBeGreaterThan(800);
    }
    expect(
      await evaluate(
        `document.querySelectorAll('[data-campaign-shone]').length`,
      ),
    ).toBe(3);
    expect(
      await evaluate(
        `document.querySelectorAll('[data-campaign-shining]').length`,
      ),
    ).toBe(0);
    await evaluate(`window.scrollTo({top:0,behavior:'instant'})`);
    await new Promise((done) => setTimeout(done, 100));
    await scrollTo("[data-campaign-wall]");
    await new Promise((done) => setTimeout(done, 150));
    expect(
      await evaluate(
        `document.querySelectorAll('[data-campaign-shining]').length`,
      ),
    ).toBe(0);
    await scrollTo("[data-market-section]");
    await new Promise((done) => setTimeout(done, 600));
    expect(
      await evaluate(`(() => {
      const section=document.querySelector('[data-market-section]');
      return {height:section.getBoundingClientRect().height,logos:[...section.querySelectorAll('img')].map(n=>({loaded:n.complete&&n.naturalWidth>0,src:n.getAttribute('src'),fit:getComputedStyle(n).objectFit}))};
    })()`),
    ).toMatchObject({
      logos: [
        { loaded: true, src: "/platforms/whop.svg", fit: "contain" },
        { loaded: true, src: "/platforms/clipster.svg", fit: "contain" },
        { loaded: true, src: "/platforms/picsart.svg", fit: "contain" },
      ],
    });
    expect(
      await evaluate(
        `document.querySelector('[data-market-section]').getBoundingClientRect().height`,
      ),
    ).toBeLessThan(400);
    await capture("cl109-market-desktop");
    expect(
      await evaluate(
        `document.querySelector('[data-market-section]').querySelectorAll('a,button,[tabindex]').length`,
      ),
    ).toBe(0);
    expect(
      await evaluate(
        `document.querySelector('[data-market-section]').textContent.includes('Explore')`,
      ),
    ).toBe(false);
    expect(
      await evaluate(
        `document.querySelector('[data-market-section]').textContent.includes('ClipBuilder is not affiliated with or partnered with these platforms.')`,
      ),
    ).toBe(true);
    const initialUrl = await evaluate("location.href");
    const hover = await evaluate(
      `(() => {const r=document.querySelector('[data-market-section] li').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`,
    );
    await client.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: hover.x,
      y: hover.y,
    });
    await new Promise((done) => setTimeout(done, 700));
    expect(
      await evaluate(
        `getComputedStyle(document.querySelector('[data-market-section] li')).rotate`,
      ),
    ).toBe("0deg");
    await client.send("Input.dispatchMouseEvent", {
      type: "mousePressed",
      x: hover.x,
      y: hover.y,
      button: "left",
      clickCount: 1,
    });
    await client.send("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      x: hover.x,
      y: hover.y,
      button: "left",
      clickCount: 1,
    });
    expect(await evaluate("location.href")).toBe(initialUrl);
    await capture("cl109-market-hover");
    // Reload at the top so the short market section cannot start counters early.
    await evaluate(`window.scrollTo({top:0,behavior:'instant'})`);
    await page.goto({ url: "http://localhost:3000/", timeout: 30_000 });
    await new Promise((done) => setTimeout(done, 600));
    expect(await values()).toEqual([100, 60, 60]);
    expect(await savings()).toEqual([0, 0]);
    expect(
      await evaluate(
        `[...document.querySelectorAll('[data-minutes-back]')].map(n=>n.textContent)`,
      ),
    ).toEqual(["00", "00"]);
    await evaluate(
      `(()=>{const n=document.querySelector('[data-time-example]');window.scrollTo({top:n.getBoundingClientRect().top+scrollY-innerHeight+16,behavior:'instant'})})()`,
    );
    await new Promise((done) => setTimeout(done, 300));
    expect(await values()).toEqual([100, 60, 60]);
    expect(
      await evaluate(
        `document.querySelector('[data-time-example]').dataset.entered`,
      ),
    ).toBeUndefined();
    await capture("cl110-card-sliver-pending");
    await evaluate(
      `(()=>{const n=document.querySelector('[data-time-trigger]'),r=n.getBoundingClientRect();window.scrollTo({top:r.top+scrollY-(innerHeight-48-r.height*.25),behavior:'instant'})})()`,
    );
    await new Promise((done) => setTimeout(done, 200));
    expect(await values()).toEqual([100, 60, 60]);
    expect(
      await evaluate(
        `document.querySelector('[data-time-example]').style.getPropertyValue('--time-progress')`,
      ),
    ).toBe("0");
    await capture("cl110-metric-partial-pending");
    expect(await savings()).toEqual([0, 0]);
    await evaluate(
      `Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});document.dispatchEvent(new Event('visibilitychange'))`,
    );
    await scrollTo("[data-time-trigger]");
    await new Promise((done) => setTimeout(done, 200));
    expect(await values()).toEqual([100, 60, 60]);
    expect(
      await evaluate(
        `document.querySelector('[data-time-example]').dataset.entered`,
      ),
    ).toBeUndefined();
    expect(await savings()).toEqual([0, 0]);
    await evaluate(
      `delete document.visibilityState;document.dispatchEvent(new Event('visibilitychange'))`,
    );
    const trace: number[][] = [];
    const clockTrace: string[] = [];
    const fillTrace: number[] = [];
    const savedTrace: {
      at: number;
      progress: number;
      saved: number[];
      words: number[];
    }[] = [];
    for (let sample = 0; sample < 44; sample++) {
      const motion = await evaluate(
        `(() => {const fill=document.querySelector('[data-time-fill]');return {values:[...document.querySelectorAll('[data-count-target]:not([data-minutes-back])')].map(n=>Number(n.textContent)),clock:getComputedStyle(document.querySelector('[data-clock-hand]')).transform,fraction:fill.getBoundingClientRect().width/fill.parentElement.getBoundingClientRect().width,
        at:performance.now(),progress:Number(document.querySelector('[data-time-example]').style.getPropertyValue('--time-progress')),saved:[...document.querySelectorAll('[data-minutes-back]')].map(n=>Number(n.textContent)),
        words:['[data-savings-before]','[data-headline-saved]','[data-savings-after]'].flatMap(selector=>{const r=document.querySelector(selector).getBoundingClientRect();return [r.x,r.y,r.width,r.height]})};})()`,
      );
      trace.push(motion.values);
      clockTrace.push(motion.clock);
      fillTrace.push(motion.fraction);
      savedTrace.push({
        at: motion.at,
        progress: motion.progress,
        saved: motion.saved,
        words: motion.words,
      });
      if (sample === 20) await capture("cl113-time-midcount");
      await new Promise((done) => setTimeout(done, 50));
    }
    expect(trace.some((row) => (row[0] ?? 0) > 17 && (row[0] ?? 0) < 100)).toBe(
      true,
    );
    expect(await values()).toEqual([17, 60, 10]);
    expect(await savings()).toEqual([50, 50]);
    expect(
      savedTrace.some((row) => row.saved[0]! > 0 && row.saved[0]! < 50),
    ).toBe(true);
    for (let i = 0; i < savedTrace.length; i++) {
      const row = savedTrace[i]!;
      expect(row.saved).toEqual([
        Math.round(50 * row.progress),
        Math.round(50 * row.progress),
      ]);
      expect(Math.abs(row.saved[0]! + trace[i]![2]! - 60)).toBeLessThanOrEqual(
        1,
      );
      if (i > 0)
        expect(row.saved[0]).toBeGreaterThanOrEqual(
          savedTrace[i - 1]!.saved[0]!,
        );
      row.words.forEach((value, index) =>
        expect(Math.abs(value - savedTrace[0]!.words[index]!)).toBeLessThan(
          0.1,
        ),
      );
    }
    const rates = savedTrace.slice(1).map((row, i) => ({
      progress: row.progress,
      rate:
        (row.progress - savedTrace[i]!.progress) / (row.at - savedTrace[i]!.at),
    }));
    const mean = (items: typeof rates) =>
      items.reduce((sum, item) => sum + item.rate, 0) / items.length;
    const early = rates.filter(
        (row) => row.progress > 0 && row.progress < 0.08,
      ),
      middle = rates.filter((row) => row.progress > 0.3 && row.progress < 0.7),
      late = rates.filter((row) => row.progress > 0.92 && row.progress < 1);
    expect(Math.min(early.length, middle.length, late.length)).toBeGreaterThan(
      1,
    );
    expect(mean(middle)).toBeGreaterThan(mean(early) * 1.8);
    expect(mean(middle)).toBeGreaterThan(mean(late) * 1.8);
    expect(trace.every((row) => row[1] === 60)).toBe(true);
    expect(trace.some((row) => (row[2] ?? 0) > 10 && (row[2] ?? 0) < 60)).toBe(
      true,
    );
    expect(new Set(clockTrace).size).toBeGreaterThan(10);
    expect(fillTrace.some((fraction) => fraction > 0.2 && fraction < 0.9)).toBe(
      true,
    );
    expect(
      trace.every(
        (row) => Math.abs((row[0] ?? 0) - (100 * (row[2] ?? 0)) / 60) <= 2,
      ),
    ).toBe(true);
    const geometry = await evaluate(`(() => {
      const fill=document.querySelector('[data-time-fill]');
      return {fraction:fill.getBoundingClientRect().width/fill.parentElement.getBoundingClientRect().width,progress:getComputedStyle(document.querySelector('[data-time-example]')).getPropertyValue('--time-progress').trim(),clock:document.querySelector('[data-clock-hand]').style.transform};
    })()`);
    expect(geometry.fraction).toBeCloseTo(1 / 6, 2);
    expect(geometry.progress).toBe("1");
    expect(
      await evaluate(
        `document.querySelector('[data-time-section]').textContent.includes('Illustrative goal')`,
      ),
    ).toBe(false);
    expect(
      await evaluate(
        `document.querySelector('[data-clock-hand]').closest('svg').getBoundingClientRect().width`,
      ),
    ).toBeGreaterThanOrEqual(160);
    await capture("cl113-time-desktop");
    await evaluate(`window.scrollTo({top:0,behavior:'instant'})`);
    await new Promise((done) => setTimeout(done, 100));
    await scrollTo("[data-time-section]");
    await new Promise((done) => setTimeout(done, 100));
    expect(await values()).toEqual([17, 60, 10]);
    expect(await savings()).toEqual([50, 50]);
    for (const [width, height] of [
      [1024, 768],
      [768, 1024],
      [640, 960],
      [639, 960],
      [390, 844],
      [320, 568],
    ] as const) {
      await page.setViewport({
        width,
        height,
        deviceScaleFactor: 1,
      });
      for (const section of ["market", "time"]) {
        await scrollTo(`[data-${section}-section]`);
        await new Promise((done) => setTimeout(done, 300));
        expect(
          await evaluate(`document.documentElement.scrollWidth<=innerWidth`),
        ).toBe(true);
        expect(
          await evaluate(
            `(() => { const s=document.querySelector('[data-${section}-section]');return [...s.querySelectorAll('h2,p,a,img')].every(n=>{const r=n.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1})})()`,
          ),
        ).toBe(true);
        if (section === "market") {
          const layout = await evaluate(`(()=>{
            const section=document.querySelector('[data-market-section]'),wall=section.querySelector('ul'),cards=[...wall.children];
            const widths=cards.map(n=>n.getBoundingClientRect().width);
            const labels=[...wall.querySelectorAll('li span')];
            const whole=labels.every(n=>{const b=n.closest('li').getBoundingClientRect(),range=document.createRange();range.selectNodeContents(n);return [...range.getClientRects()].every(r=>r.left>=b.left&&r.right<=b.right&&r.top>=b.top&&r.bottom<=b.bottom)});
            return {dots:cards.some(n=>!['none','normal'].includes(getComputedStyle(n,'::after').content)),columns:getComputedStyle(wall).gridTemplateColumns.split(' ').length,widths,whole,
              minLogo:Math.min(...[...wall.querySelectorAll('img')].map(n=>n.getBoundingClientRect().width)),
              minLabel:Math.min(...labels.map(n=>parseFloat(getComputedStyle(n).fontSize))),
              horizontal:cards.every(n=>{const label=n.querySelector('span').getBoundingClientRect(),logo=n.querySelector('img').getBoundingClientRect();return label.right+8<=logo.left}),
              stacked:cards.every((n,i)=>i===0||n.getBoundingClientRect().top>=cards[i-1].getBoundingClientRect().bottom+4)};
          })()`);
          const columns = width < 640 ? 1 : width <= 928 ? 2 : 3;
          expect(layout.columns, `${width}px card columns`).toBe(columns);
          expect(layout.whole).toBe(true);
          expect(layout.dots).toBe(false);
          expect(layout.minLabel).toBeGreaterThanOrEqual(10);
          expect(layout.minLogo).toBeGreaterThanOrEqual(90);
          if (columns === 2)
            expect(layout.widths[2]).toBeGreaterThan(layout.widths[0] * 1.9);
          if (columns === 1)
            expect({
              horizontal: layout.horizontal,
              stacked: layout.stacked,
            }).toEqual({ horizontal: true, stacked: true });
        }
        if (section === "time") {
          const clockLayout = await evaluate(
            `(()=>{const n=document.querySelector('[data-count-target="17"]').parentElement.getBoundingClientRect(),clock=document.querySelector('[data-clock-hand]').closest('svg').getBoundingClientRect();return {width:clock.width,gap:clock.left-n.right}})()`,
          );
          expect(
            clockLayout.width,
            `${width}px larger clock`,
          ).toBeGreaterThanOrEqual(120);
          expect(
            clockLayout.gap,
            `${width}px clock/number clearance`,
          ).toBeGreaterThanOrEqual(4);
        }
        await capture(`cl109-${section}-${width}`);
      }
      if (width <= 390) {
        await scrollTo("[data-time-example]");
        await capture(`cl110-time-example-${width}`);
      }
    }
    await page.setViewport({ width: 320, height: 568, deviceScaleFactor: 1 });
    await evaluate(`window.scrollTo({top:0,behavior:'instant'})`);
    await page.goto({ url: "http://localhost:3000/", timeout: 30_000 });
    await new Promise((done) => setTimeout(done, 500));
    expect(await values()).toEqual([100, 60, 60]);
    await evaluate(
      `(()=>{const n=document.querySelector('[data-market-section] li'),r=n.getBoundingClientRect();window.scrollTo({top:r.top+scrollY-(innerHeight-48-r.height*.85),behavior:'instant'})})()`,
    );
    await new Promise((done) => setTimeout(done, 450));
    expect(
      await evaluate(
        `document.querySelector('[data-campaign-shining]')?.dataset.brand`,
      ),
    ).toBe("whop");
    await capture("cl112-phone-first-shine");
    await new Promise((done) => setTimeout(done, 800));
    expect(
      await evaluate(
        `document.querySelectorAll('[data-campaign-shone]').length`,
      ),
    ).toBe(1);
    expect(
      await evaluate(
        `document.querySelectorAll('[data-campaign-shining]').length`,
      ),
    ).toBe(0);
    await scrollTo("[data-campaign-wall]");
    await new Promise((done) => setTimeout(done, 2300));
    expect(
      await evaluate(
        `document.querySelectorAll('[data-campaign-shone]').length`,
      ),
    ).toBe(3);
    await evaluate(`window.scrollTo({top:0,behavior:'instant'})`);
    await new Promise((done) => setTimeout(done, 100));
    await scrollTo("[data-campaign-wall]");
    await new Promise((done) => setTimeout(done, 100));
    expect(
      await evaluate(
        `document.querySelectorAll('[data-campaign-shining]').length`,
      ),
    ).toBe(0);
    expect(
      await evaluate(
        `(()=>{const n=document.querySelector('[data-count-target="17"]').parentElement.getBoundingClientRect(),clock=document.querySelector('[data-clock-hand]').closest('svg').getBoundingClientRect();return clock.left-n.right})()`,
      ),
    ).toBeGreaterThanOrEqual(4);
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await evaluate(`window.scrollTo({top:0,behavior:'instant'})`);
    await page.goto({ url: "http://localhost:3000/", timeout: 30_000 });
    await new Promise((done) => setTimeout(done, 500));
    await scrollTo("[data-time-example]");
    await new Promise((done) => setTimeout(done, 350));
    const phoneValues = await values();
    expect(phoneValues[0]).toBeGreaterThan(17);
    expect(phoneValues[0]).toBeLessThan(100);
    expect(phoneValues[1]).toBe(60);
    expect(phoneValues[2]).toBeGreaterThan(10);
    expect(phoneValues[2]).toBeLessThan(60);
    const phoneWords = await headlineGeometry();
    for (let sample = 0; sample < 12; sample++) {
      const saved = await savings();
      expect(saved[0]).toBe(saved[1]);
      const words = await headlineGeometry();
      words.forEach((value: number, index: number) =>
        expect(Math.abs(value - phoneWords[index])).toBeLessThan(0.1),
      );
      if (sample === 6) await capture("cl113-time-phone-midcount");
      await new Promise((done) => setTimeout(done, 75));
    }
    await new Promise((done) => setTimeout(done, 1500));
    expect(await values()).toEqual([17, 60, 10]);
    expect(await savings()).toEqual([50, 50]);
    await client.send("Emulation.setEmulatedMedia", {
      // @ts-expect-error Installed Chrome supports forced colors; pinned CDP types only allow dark mode.
      features: [{ name: "forced-colors", value: "active" }],
    });
    await scrollTo("[data-market-section]");
    expect(
      await evaluate(
        `getComputedStyle(document.querySelector('[data-market-section] li > div')).color`,
      ),
    ).toBe("rgb(255, 255, 255)");
    await capture("cl109-market-forced-colors");
    await scrollTo("[data-time-example]");
    await capture("cl110-time-forced-colors");
    // @ts-expect-error Installed Chrome supports media features; pinned CDP types predate it.
    await client.send("Emulation.setEmulatedMedia", { features: [] });
    // No-JS SSR retains the completed example, informational cards and vector logos.
    // @ts-expect-error Installed Chrome supports this command; pinned CDP types predate it.
    await client.send("Emulation.setScriptExecutionDisabled", { value: true });
    await page.goto({ url: "http://localhost:3000/", timeout: 30_000 });
    expect(await values()).toEqual([17, 60, 10]);
    expect(await savings()).toEqual([50, 50]);
    expect(
      await evaluate(
        `document.querySelector('[data-time-section]').textContent`,
      ),
    ).not.toContain("An example for a batch of");
    await scrollTo("[data-time-section]");
    await capture("cl110-time-no-js");
    await writeFile(
      join(evidence, "cl113-count-trace.json"),
      JSON.stringify({
        numbers: trace,
        clock: clockTrace,
        fill: fillTrace,
        saved: savedTrace,
      }),
    );
    expect({
      external,
      processingRequests: mutations - blockedDiagnostics,
    }).toEqual({ external: 0, processingRequests: 0 });
  } finally {
    closing = true;
    try {
      await browser.close({ silent: true });
    } finally {
      await Promise.all(pendingInterceptions);
      expect(interceptionFailed).toBe(false);
    }
  }
}, 45_000);
