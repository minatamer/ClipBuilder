import { expect, it } from "vitest";
import { get } from "node:http";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";

// The Vitest setup installs fake/paid-off and socket interception before imports.
// This read-only browser proof refuses a live normal app and intercepts every
// page request before network dispatch. No session/media/processing action runs.
it("reviews the landing visual changes in the actual fake/no-key app", async () => {
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
  let failImages = false;
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
        const blocked =
          remote || mutate || (failImages && url.pathname.endsWith(".png"));
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
    await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
    await page.goto({ url: "http://localhost:3000/", timeout: 30_000 });
    const seen = new Set<string>();
    const deadline = Date.now() + 35_000;
    let looped = false;
    let previous = -1;
    while (Date.now() < deadline && !looped) {
      const state = await evaluate(`(() => {
        const film=document.querySelector('[data-film-beat]');
        if(!film) return null;
        return {beat:film.dataset.filmBeat, frame:Number(film.dataset.filmFrame),
          text:film.textContent, controls:!!film.closest('[aria-label="ClipBuilder cinematic walkthrough"]')?.querySelector('button')};
      })()`);
      if (state && state.frame > previous) {
        expect(state.controls).toBe(false);
        if (!seen.has(state.beat) && state.frame > 40) {
          // Let the scene's entrance finish before inspecting its representative frame.
          await new Promise((done) =>
            setTimeout(done, state.beat === "identity" ? 200 : 800),
          );
          await capture(`cl095-film-${state.beat}`);
          seen.add(state.beat);
        }
        previous = state.frame;
      } else if (state && previous > 650 && state.frame < 60) looped = true;
      await new Promise((done) => setTimeout(done, 80));
    }
    expect([...seen]).toEqual([
      "identity",
      "intake",
      "analysis",
      "choose",
      "build",
      "review",
      "result",
      "close",
    ]);
    expect(looped).toBe(true);
    const frame = () =>
      evaluate(
        `Number(document.querySelector('[data-film-frame]').dataset.filmFrame)`,
      );
    await evaluate(
      `Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'}); document.dispatchEvent(new Event('visibilitychange'))`,
    );
    await new Promise((done) => setTimeout(done, 250));
    const hiddenFrame = await frame();
    await new Promise((done) => setTimeout(done, 350));
    expect(await frame()).toBe(hiddenFrame);
    await evaluate(
      `delete document.visibilityState; document.dispatchEvent(new Event('visibilitychange'))`,
    );
    await new Promise((done) => setTimeout(done, 350));
    expect(await frame()).not.toBe(hiddenFrame);
    await evaluate(
      `window.scrollTo({top:document.body.scrollHeight,behavior:'instant'})`,
    );
    await new Promise((done) => setTimeout(done, 400));
    const paused = await frame();
    await new Promise((done) => setTimeout(done, 400));
    expect(await frame()).toBe(paused);
    await evaluate(`window.scrollTo({top:0,behavior:'instant'})`);
    await new Promise((done) => setTimeout(done, 400));
    expect(await frame()).not.toBe(paused);
    for (const [width, height] of [
      [320, 568],
      [390, 844],
      [768, 1024],
      [1024, 768],
      [1366, 600],
      [1366, 768],
      [1440, 900],
      [1920, 1080],
      [1920, 450],
    ] as const) {
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      await evaluate(`window.scrollTo({top:0,behavior:'instant'})`);
      await new Promise((done) => setTimeout(done, 350));
      const geometry = await evaluate(`(() => {
        const surface=document.querySelector('[data-film-surface]').getBoundingClientRect();
        const film=document.querySelector('[data-film-beat]').getBoundingClientRect();
        const hero=document.querySelector('#top').getBoundingClientRect();
        return {overflow:document.documentElement.scrollWidth>innerWidth,
          duplicateFlow:document.body.textContent.includes('One conversation. One finished clip.'),
          frameFits:Math.abs(film.width-surface.width)<2 && Math.abs(film.height-surface.height)<2,
          inside:surface.left>=0 && surface.right<=innerWidth+1 && surface.bottom<=hero.bottom+1,
          taller:surface.height>surface.width*9/16+10,
          noCropping:surface.height>=surface.width*9/16-1};
      })()`);
      expect(geometry).toEqual({
        overflow: false,
        duplicateFlow: false,
        frameFits: true,
        inside: true,
        taller: height > 450,
        noCropping: true,
      });
      await capture(`cl096-hero-${width}x${height}`);
    }
    await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
    await evaluate(`window.scrollTo({top:0,behavior:'instant'})`);
    await new Promise((done) => setTimeout(done, 750));
    const fullWidth = await evaluate(
      `document.querySelector('header>div').getBoundingClientRect().width`,
    );
    await evaluate(
      `document.querySelector('header a[href="#how-it-works"]').focus()`,
    );
    const shrink = await evaluate(`(async () => {
      const header=document.querySelector('header'),pill=header.firstElementChild;
      window.scrollTo({top:document.querySelector('#top').offsetHeight+20,behavior:'instant'});
      const widths=[];for(let i=0;i<55;i++){await new Promise(requestAnimationFrame);widths.push(pill.getBoundingClientRect().width)}
      const link=header.querySelector('a[href="#how-it-works"]');
      return {widths,compact:header.dataset.compact,hidden:link.inert&&link.getAttribute('aria-hidden')==='true',
        homeFocused:document.activeElement===header.querySelector('a[href="#top"]'),
        targets:[...header.querySelectorAll('a[href="#top"],button[aria-haspopup],a[href="/start"]')].map(n=>{const r=n.getBoundingClientRect();return Math.min(r.width,r.height)})};
    })()`);
    expect(shrink.compact).toBe("true");
    expect(shrink.hidden).toBe(true);
    expect(shrink.homeFocused).toBe(true);
    expect(shrink.widths.at(-1)).toBeLessThan(fullWidth * 0.6);
    expect(
      shrink.widths.some((w: number) => w > 500 && w < fullWidth - 20),
    ).toBe(true);
    expect(Math.min(...shrink.targets)).toBeGreaterThanOrEqual(44);
    await capture("cl097-navbar-compact");
    const key = async (name: string, code: number) => {
      await client.send("Input.dispatchKeyEvent", {
        type: "keyDown",
        key: name,
        code: name,
        windowsVirtualKeyCode: code,
        ...(name === "Enter" ? { text: "\r", unmodifiedText: "\r" } : {}),
      });
      await client.send("Input.dispatchKeyEvent", {
        type: "keyUp",
        key: name,
        code: name,
        windowsVirtualKeyCode: code,
      });
    };
    await key("Tab", 9);
    expect(await evaluate(`document.activeElement.textContent`)).toBe(
      "Privacy",
    );
    await key("Enter", 13);
    await new Promise((done) => setTimeout(done, 150));
    expect(await evaluate(`!!document.querySelector('dialog[open]')`)).toBe(
      true,
    );
    await capture("cl100-privacy-desktop");
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await capture("cl100-privacy-phone");
    expect(
      await evaluate(
        `(()=>{const d=document.querySelector('dialog[open]'),c=d.querySelector('[aria-label="Close privacy"]'),r=c.getBoundingClientRect();return d.getBoundingClientRect().width<=innerWidth&&r.top>=0&&r.bottom<=innerHeight&&r.width>=44&&r.height>=44})()`,
      ),
    ).toBe(true);
    await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
    await key("Escape", 27);
    expect(
      await evaluate(
        `!document.querySelector('dialog[open]')&&document.activeElement.textContent==='Privacy'`,
      ),
    ).toBe(true);
    await key("Tab", 9);
    expect(await evaluate(`document.activeElement.getAttribute('href')`)).toBe(
      "/start",
    );
    const expand = await evaluate(`(async()=>{
      window.scrollTo({top:0,behavior:'instant'}); const widths=[];
      for(let i=0;i<55;i++){await new Promise(requestAnimationFrame);widths.push(document.querySelector('header>div').getBoundingClientRect().width)}
      return {widths,compact:document.querySelector('header').dataset.compact,inert:document.querySelector('header a[href="#how-it-works"]').inert};
    })()`);
    expect(expand.compact).toBe("false");
    expect(expand.inert).toBe(false);
    expect(expand.widths.at(-1)).toBeCloseTo(fullWidth, 0);
    expect(
      expand.widths.some((w: number) => w > 500 && w < fullWidth - 20),
    ).toBe(true);
    for (const offset of [1, 0, -1]) {
      await evaluate(
        `window.scrollTo({top:document.querySelector('#top').offsetHeight+${offset},behavior:'instant'})`,
      );
      await new Promise((done) => setTimeout(done, 120));
      expect(
        await evaluate(`document.querySelector('header').dataset.compact`),
      ).toBe(offset > 0 ? "true" : "false");
    }
    await page.goto({
      url: "http://localhost:3000/#how-it-works",
      timeout: 30_000,
    });
    await evaluate(
      `window.scrollTo({top:document.querySelector('#top').offsetHeight+20,behavior:'instant'});window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}))`,
    );
    await new Promise((done) => setTimeout(done, 750));
    expect(
      await evaluate(`document.querySelector('header').dataset.compact`),
    ).toBe("true");
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await new Promise((done) => setTimeout(done, 750));
    expect(
      await evaluate(`document.querySelector('header').dataset.compact`),
    ).toBe("false");
    await capture("cl097-navbar-phone");
    await page.setViewport({ width: 1366, height: 600, deviceScaleFactor: 1 });
    await evaluate(
      `window.scrollTo({top:document.querySelector('#top').offsetHeight+20,behavior:'instant'})`,
    );
    await new Promise((done) => setTimeout(done, 750));
    await capture("cl097-navbar-short-laptop");
    await evaluate(`window.scrollTo({top:0,behavior:'instant'})`);
    await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
    await page.goto({ url: "http://localhost:3000/", timeout: 30_000 });
    const showProcess = () =>
      evaluate(
        `window.scrollTo({top:document.querySelector('#how-it-works>div:last-child').getBoundingClientRect().top+scrollY-120,behavior:'instant'})`,
      );
    await showProcess();
    const phases: { phase: string; at: number }[] = [];
    let uploadComplete = false,
      readComplete = false,
      previewComplete = false,
      leftEntrance = false;
    const phaseCaptures = new Set<string>();
    const processStart = Date.now();
    while (Date.now() - processStart < 12_600) {
      const state = await evaluate(`(() => {
        const section=document.querySelector('#how-it-works');
        const scale=selector=>{const n=section.querySelector(selector);return n?new DOMMatrix(getComputedStyle(n).transform).m11:0};
        const text=section.querySelector('[data-process-step][data-active="true"]');
        const style=getComputedStyle(text),matrix=new DOMMatrix(style.transform);
        return {phase:section.dataset.activeStep+':'+section.dataset.handoff,visible:section.dataset.visible,
          x:matrix.m41,y:matrix.m42,opacity:Number(style.opacity),
          visibleTexts:[...section.querySelectorAll('[data-process-step]')].filter(n=>{const s=getComputedStyle(n);return s.visibility==='visible'&&Number(s.opacity)>.05}).length,
          upload:scale('[class*="uploadProgressTrack"] span'),
          read:scale('[class*="consoleLine"]:last-child i'),
          preview:scale('[class*="videoTimeline"] span'),
          previewLoop:section.querySelector('[data-video-timeline] span')?.getAnimations().some(animation=>animation.effect?.getComputedTiming().currentIteration>=1)};
      })()`);
      if (state.visible === "true") {
        expect(state.visibleTexts).toBeLessThanOrEqual(1);
        if (phases.at(-1)?.phase !== state.phase)
          phases.push({ phase: state.phase, at: Date.now() - processStart });
        if (state.phase === "0:false" && state.upload > 0.99)
          uploadComplete = true;
        if (state.phase === "1:false" && state.read > 0.99) readComplete = true;
        // CDP sampling can skip the last 48ms of the 4.8s timeline. Its next
        // iteration also proves the first fill reached completion.
        if (
          state.phase === "2:false" &&
          (state.preview > 0.99 || state.previewLoop)
        )
          previewComplete = true;
        if (
          state.phase === "1:false" &&
          state.x < -1 &&
          Math.abs(state.y) < 0.1 &&
          state.opacity > 0
        )
          leftEntrance = true;
        if (!phaseCaptures.has(state.phase) && state.opacity > 0.99) {
          await capture("cl098-process-" + state.phase.replace(":", "-"));
          phaseCaptures.add(state.phase);
        }
      }
      await new Promise((done) => setTimeout(done, 45));
    }
    expect(phases.map((item) => item.phase)).toEqual([
      "0:false",
      "1:false",
      "1:true",
      "2:false",
      "0:false",
    ]);
    expect(phases[1]!.at).toBeGreaterThan(2700);
    expect(phases[1]!.at).toBeLessThan(3400);
    expect(phases[4]!.at).toBeGreaterThan(11_700);
    expect(phases[4]!.at).toBeLessThan(12_400);
    expect({
      uploadComplete,
      readComplete,
      previewComplete,
      leftEntrance,
    }).toEqual({
      uploadComplete: true,
      readComplete: true,
      previewComplete: true,
      leftEntrance: true,
    });
    await writeFile(
      join(evidence, "cl098-phase-timings.json"),
      JSON.stringify(phases),
    );
    await evaluate(`window.scrollTo({top:0,behavior:'instant'})`);
    await new Promise((done) => setTimeout(done, 3300));
    expect(
      await evaluate(`document.querySelector('#how-it-works').dataset.visible`),
    ).toBe("false");
    expect(
      await evaluate(
        `document.querySelector('#how-it-works').dataset.activeStep`,
      ),
    ).toBe("0");
    await showProcess();
    await new Promise((done) => setTimeout(done, 150));
    await evaluate(
      `Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});document.dispatchEvent(new Event('visibilitychange'))`,
    );
    await new Promise((done) => setTimeout(done, 3300));
    expect(
      await evaluate(
        `document.querySelector('#how-it-works').dataset.activeStep`,
      ),
    ).toBe("0");
    expect(
      await evaluate(`document.querySelector('#how-it-works').dataset.visible`),
    ).toBe("false");
    await evaluate(
      `delete document.visibilityState;document.dispatchEvent(new Event('visibilitychange'))`,
    );
    await new Promise((done) => setTimeout(done, 150));
    expect(
      await evaluate(`document.querySelector('#how-it-works').dataset.visible`),
    ).toBe("true");
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await showProcess();
    await new Promise((done) => setTimeout(done, 3300));
    expect(
      await evaluate(`document.documentElement.scrollWidth<=innerWidth`),
    ).toBe(true);
    await capture("cl098-process-phone");
    failImages = true;
    await page.goto({ url: "http://localhost:3000/", timeout: 30_000 });
    for (let attempt = 0; attempt < 100; attempt++) {
      if (await evaluate(`!!document.querySelector('[role="alert"]')`)) break;
      await new Promise((done) => setTimeout(done, 100));
    }
    expect(
      await evaluate(`document.querySelector('[role="alert"]')?.textContent`),
    ).toContain("Motion preview unavailable");
    await capture("cl095-film-fallback");
    failImages = false;
    // @ts-expect-error Installed Chrome supports this command; pinned CDP types predate it.
    await client.send("Emulation.setScriptExecutionDisabled", { value: true });
    await page.goto({ url: "http://localhost:3000/", timeout: 30_000 });
    await new Promise((done) => setTimeout(done, 800));
    await capture("cl096-poster-desktop");
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await capture("cl096-poster-phone");
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
}, 100_000);
