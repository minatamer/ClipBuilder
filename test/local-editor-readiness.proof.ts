import { transform } from "esbuild";
import { expect, it } from "vitest";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { startHookEditorFixture } from "./owner-hook-browser-fixture.ts";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

declare global {
  function runEditorReadiness(): Promise<{
    initial: number;
    afterRerenders: number;
    warnings: number;
    editor: boolean;
  }>;
}

it("does not re-notify preview readiness when its consumer updates or rerenders", async () => {
  const current = await readFile(
    resolve("apps/frontend/src/features/local-editing/clip-editor.tsx"),
    "utf8",
  );
  const effect = `useEffect(() => {\n    if (previewLoaded) reportPreviewReady();\n  }, [previewLoaded]);`;
  expect(current.includes(effect)).toBe(true);
  const baseline = current.replace(
    effect,
    `useEffect(() => {\n    if (previewLoaded) onPreviewReady?.();\n  }, [previewLoaded, onPreviewReady]);`,
  );
  const fixture = await startHookEditorFixture(baseline, {
    readinessFeedback: true,
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
    await page.goto({
      url: new URL("loop-baseline.html", fixture.url).href,
      timeout: 15000,
    });
    const baselineDriver = await transform(
      `globalThis.readinessBefore=async()=>{for(let i=0;i<400&&Number(document.documentElement.dataset.fixtureReadyReports??0)<61;i++)await new Promise(r=>setTimeout(r,10));return{reports:Number(document.documentElement.dataset.fixtureReadyReports??0),warnings:Number(document.documentElement.dataset.fixtureUpdateDepth??0)}}`,
      { loader: "ts" },
    );
    await page.evaluate(baselineDriver.code);
    const before = await page._client().send("Runtime.evaluate", {
      expression: "readinessBefore()",
      awaitPromise: true,
      returnByValue: true,
    });
    expect(before.value.result.value).toMatchObject({ reports: 61 });
    expect(before.value.result.value.warnings).toBeGreaterThan(0);
    await page.goto({
      url: new URL("loop.html", fixture.url).href,
      timeout: 15000,
    });
    const driver = await transform(
      `globalThis.runEditorReadiness = async () => {

      const ready=()=>Number(document.querySelector('[aria-label="Preview ready reports"]')?.textContent??document.documentElement.dataset.fixtureReadyReports??0);
      for(let i=0;i<200&&ready()<1;i++)await new Promise(r=>setTimeout(r,20));
      await new Promise(r=>setTimeout(r,1200));
      const initial=ready();
      for(let i=0;i<20;i++){
        [...document.querySelectorAll<HTMLButtonElement>('button')].find(b=>b.textContent==='Render host')?.click();
        await new Promise(r=>setTimeout(r,10));
      }
      return {initial,afterRerenders:ready(),warnings:Number(document.documentElement.dataset.fixtureUpdateDepth??0),editor:Boolean(document.querySelector('.editor-panels:not([hidden])'))};

};`,
      { loader: "ts" },
    );
    await page.evaluate(driver.code);
    const result = await page.evaluate(() => runEditorReadiness());
    expect(result).toEqual({
      initial: 1,
      afterRerenders: 1,
      warnings: 0,
      editor: true,
    });
    expect(fixture.counts()).toEqual({ edits: 0, unexpected: 0 });
    expect(fixture.clip.calls).toEqual({ plan: 0, image: 0, render: 0 });
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    await writeFile(
      resolve(".local-build/evidence/cl255-readiness-before-after.json"),
      JSON.stringify(
        {
          synthetic: true,
          providerCalls: 0,
          before: before.value.result.value,
          after: result,
        },
        null,
        2,
      ),
    );
    const records = fixture
      .diagnostics()
      .filter((record) => record.kind === "editor-lifecycle");
    expect(
      records.filter((record) => record.event === "preview-ready"),
    ).toHaveLength(1);
    expect(records.every((record) => record.state.readyReports <= 1)).toBe(
      true,
    );
  } finally {
    try {
      await browser?.close({ silent: true });
    } finally {
      await fixture.close();
    }
  }
}, 30000);
