import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";

declare global {
  function clipbuilderReviewControls(): Promise<boolean>;
}

/** Opt-in synthetic UI exercise only; never accepts media or arbitrary URLs. */
export async function reviewOwnerControls(port: number) {
  const browser = await openBrowser("chrome", {
    browserExecutable: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    chromiumOptions: { headless: true },
    logLevel: "error",
  });
  try {
    const page = await browser.newPage({
      context: () => null,
      logLevel: "error",
      indent: false,
      pageIndex: 0,
      onBrowserLog: null,
      onLog: () => {},
    });
    await page.setViewport({ width: 1440, height: 1200, deviceScaleFactor: 1 });
    await page.goto({ url: `http://localhost:${port}/`, timeout: 10_000 });
    await page._client().send("Runtime.evaluate", {
      expression: `globalThis.clipbuilderReviewControls = async () => {
        const wait = async (read) => {
          for (let i = 0; i < 200; i++) { const value = read(); if (value) return value; await new Promise(done => setTimeout(done, 50)); }
          throw new Error('synthetic_controls_timeout');
        };
        const control = (label) => [...document.querySelectorAll('label')].find(node => {
          const text = node.firstChild?.textContent.trim() ?? '';
          return text === label || text.startsWith(label + ' (');
        })?.querySelector('input,select');
        const count = await wait(() => { const node = control('Number of additional AI moments'); return node?.value === '5' ? node : null; });
        if (count.value !== '5') throw new Error('count_not_restored');
        const review = await wait(() => [...document.querySelectorAll('button')].find(node => node.textContent.trim() === 'Review clip 1' && !node.disabled));
        review.click();
        await wait(() => control('Caption animation'));
        const font = control('Caption font');
        if (![...font.options].some(option => option.value === 'Georgia')) throw new Error('font_missing');
        const change = async (name, value) => {
          const node = control(name); if (!node) throw new Error('control_missing');
          const prototype = node.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
          Object.getOwnPropertyDescriptor(prototype, 'value').set.call(node, value);
          node.dispatchEvent(new Event(node.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
          await new Promise(done => setTimeout(done, 50));
          if (control(name).value !== value) throw new Error('control_not_updated');
        };
        await change('Caption font size', '96');
        await change('Caption font', 'Verdana');
        await change('Caption animation', 'fade');
        await change('Filter', 'warm');
        await change('Filter strength', '60');
        await wait(() => document.querySelector('feColorMatrix'));
        const panel = document.querySelector('.editor-panels'); panel.scrollIntoView({ block: 'start' });
        return true;
      }`,
    });
    const passed = await page.evaluate(() =>
      globalThis.clipbuilderReviewControls(),
    );
    if (!passed) throw new Error("synthetic_controls_failed");
    const captured = await page
      ._client()
      .send("Page.captureScreenshot", { format: "png", fromSurface: true });
    await mkdir(resolve(".owner-build/evidence"), { recursive: true });
    await writeFile(
      resolve(".owner-build/evidence/cl026-controls.png"),
      Buffer.from(captured.value.data, "base64"),
    );
  } finally {
    await browser.close({ silent: true });
  }
}
