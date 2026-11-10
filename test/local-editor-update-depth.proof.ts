import { transform } from "esbuild";
import { expect, it } from "vitest";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { startHookEditorFixture } from "./owner-hook-browser-fixture.ts";
import { ownerCameraFollowKey } from "../packages/contracts/local/camera-follow.ts";
import { withIndependentOwnerHook } from "../packages/contracts/local/hook-content.ts";

declare global {
  function runEditorStress(): Promise<{
    changes: number;
    updateErrors: number;
    preview: boolean;
  }>;
}

it("keeps repeated editor changes and acknowledgements free of update-depth loops", async () => {
  const fixture = await startHookEditorFixture(undefined, {
    durationFrames: 1230,
    configure(clip) {
      clip.base!.overlay.frames = 1230;
      clip.base!.cut.endFrame = clip.base!.cut.startFrame + 1230;
      clip.base!.words = Array.from({ length: 131 }, (_, i) => ({
        id: `w_${String(i + 1).padStart(6, "0")}`,
        text: "Sample",
        punctuatedText: "Sample",
        startMs: Math.floor((i * 41000) / 131),
        endMs: Math.floor(((i + 1) * 41000) / 131),
        confidence: null,
        speakerId: i % 2 ? "spk_1" : "spk_0",
      }));
      clip.base!.overlay.captions = Array.from({ length: 33 }, (_, i) => {
        const words = clip.base!.words.slice(i * 4, i * 4 + 4);
        return {
          startMs: words[0]!.startMs,
          endMs: words.at(-1)!.endMs,
          text: words.map((w) => w.text).join(" "),
          lines: [words.map((w) => w.text).join(" ")],
          wordIds: words.map((w) => w.id),
          wordCues: words.map((w) => ({
            wordId: w.id,
            text: w.text,
            startMs: w.startMs,
            endMs: w.endMs,
          })),
        };
      });
      const focus = clip.base!.overlay.focus!;
      focus.frames = 1230;
      focus.shots = Array.from({ length: 6 }, (_, index) => ({
        ...focus.shots[0]!,
        startFrame: index * 205,
        endFrame: (index + 1) * 205,
        centerX: index % 2 ? 0.75 : 0.25,
      }));
      clip.edit!.focus = structuredClone(focus);
      clip.edit!.cameraTracks = focus.shots.slice(0, 3).map((shot, index) => ({
        id: crypto.randomUUID(),
        occurrence: "body",
        personId: null,
        startFrame: shot.startFrame,
        endFrame: shot.endFrame,
        sourceStartFrame: shot.startFrame,
        focusKey: ownerCameraFollowKey(focus, null),
        seed: { x: 0.2 + index * 0.25, y: 0.35, width: 0.1, height: 0.1 },
        outcome: "complete",
        points: Array.from({ length: 103 }, (_, i) => i * 2).map((frame) => ({
          frame,
          x: 0.25 + index * 0.25 + frame / 20400,
          y: 0.4,
        })),
      }));
      delete clip.edit!.hookContent;
      clip.edit = withIndependentOwnerHook(
        clip.base!,
        clip.edit!,
        clip.assets,
        clip.audioAssets ?? [],
        { startFrame: 30, endFrame: 210 },
      );
      clip.edit.hookContent!.edits.cameraTracks = [];
      clip.edit.hookContent!.edits.cameraEffects = [
        {
          id: crypto.randomUUID(),
          occurrence: "hook",
          startFrame: 0,
          zoomFrames: 180,
          holdFrames: 0,
          returnFrames: 0,
          target: { centerX: 0.25, centerY: 0.5, zoom: 1.5 },
        },
      ];
    },
  });
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
    await page.goto({ url: fixture.url, timeout: 15000 });
    const driver = await transform(
      `globalThis.runEditorStress = async () => {

      const errors: string[] = [];
      const original = console.error;
      console.error = (...values) => {
        const text = values.filter((v) => typeof v === "string").join(" ");
        if (/Maximum update depth|Too many re-renders/u.test(text))
          errors.push(text);
        original(...values);
      };
      const wait = async (predicate: () => unknown, phase: string) => {
        for (let i = 0; i < 300; i++) {
          if (errors.length)
            throw Error("editor_update_loop_" + phase + "_" + errors[0]);
          if (predicate()) return;
          await new Promise((r) => setTimeout(r, 10));
        }
        throw Error("editor_stress_not_ready_" + phase);
      };
      const pause = () => new Promise((r) => setTimeout(r, 20));
      const button = (name: string) =>
        [...document.querySelectorAll<HTMLButtonElement>("button")].find(
          (b) => b.textContent?.trim() === name && !b.closest("[hidden]"),
        );
      const input = (label: string) =>
        document.querySelector<HTMLInputElement>(
          \`input[aria-label="\${label}"]\`,
        );
      const mainTab = async (name: string) => {
        const tab = [
          ...document.querySelectorAll<HTMLButtonElement>(
            '[aria-label="Clip settings"] [role="tab"]',
          ),
        ].find((b) => b.textContent === name)!;
        tab.click();
        await pause();
      };
      const set = async (element: HTMLInputElement, value: string) => {
        Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value",
        )!.set!.call(element, value);
        element.dispatchEvent(new Event("input", { bubbles: true }));
        await pause();
      };
      await wait(
        () => document.querySelector(".editor-layout:not([data-loading]) .editor-panels"),
        "preview",
      );
      let changes = 0;
      for (let round = 0; round < 12; round++) {
        await mainTab("Camera");
        const zoom = [
          ...document.querySelectorAll<HTMLButtonElement>(
            '[aria-label="Focus controls"] [role="tab"]',
          ),
        ].find((b) => b.textContent === "Zoom")!;
        zoom.click();
        await pause();
        if (!input("Zoom magnification")) {
          button("Add at playhead")!.click();
          await pause();
        }
        await wait(() => input("Zoom magnification"), "zoom");
        for (let n = 0; n < 10; n++) {
          await set(
            input("Zoom magnification")!,
            String(1.5 + (round * 10 + n) / 100),
          );
          changes++;
          await set(input("Zoom duration seconds")!, n % 2 ? "2" : "1.5");
          changes++;
        }
        document
          .querySelector<HTMLButtonElement>('[aria-label="Play video"]')
          ?.click();
        await new Promise((r) => setTimeout(r, 120));
        document
          .querySelector<HTMLButtonElement>('[aria-label="Pause video"]')
          ?.click();
        await pause();
        await mainTab("Captions");
        const size = document.querySelector<HTMLInputElement>(
          'input[type="number"]',
        )!;
        await set(size, String(64 + round));
        changes++;
        if (round % 3 === 2) {
          button("Discard changes")!.click();
          await pause();
        } else {
          await wait(
            () => button("Apply changes") && !button("Apply changes")!.disabled,
            "apply",
          );
          button("Apply changes")!.click();
          await wait(() => !button("Apply changes"), "acknowledged");
        }
        await mainTab("Filters");
        await mainTab("Text");
        await mainTab("Media");
        await mainTab("Hook");
        await mainTab("Camera");
        [
          ...document.querySelectorAll<HTMLButtonElement>(
            '[aria-label="Focus controls"] [role="tab"]',
          ),
        ]
          .find((b) => b.textContent === "Motion")!
          .click();
        await pause();
        const bodyPosition = [
          ...document.querySelectorAll<HTMLButtonElement>(
            '[aria-label="Camera timeline"] button',
          ),
        ].find((b) => !b.textContent!.includes("[Hook]"))!;
        bodyPosition.click();
        await pause();
        const interval = document.querySelector<HTMLSelectElement>(
          '[aria-label="Motion interval"]',
        );
        if (interval) {
          for (const option of [...interval.options].filter((o) => o.value)) {
            Object.getOwnPropertyDescriptor(
              HTMLSelectElement.prototype,
              "value",
            )!.set!.call(interval, option.value);
            interval.dispatchEvent(new Event("change", { bubbles: true }));
            await pause();
            changes++;
          }
          button("Adjust")?.click();
          await pause();
          button("Cancel")?.click();
          await pause();
        }
        const firstHook = [
          ...document.querySelectorAll<HTMLButtonElement>(
            '[aria-label="Camera timeline"] button',
          ),
        ].find((b) => b.textContent!.includes("[Hook]"));
        firstHook?.click();
        await pause();
        await pause();
      }
      for (const view of ["Zoom", "Motion", "Hook"]) {
        await mainTab(view === "Hook" ? "Hook" : "Camera");
        if (view !== "Hook") {
          [
            ...document.querySelectorAll<HTMLButtonElement>(
              '[aria-label="Focus controls"] [role="tab"]',
            ),
          ]
            .find((b) => b.textContent === view)!
            .click();
          await pause();
          [
            ...document.querySelectorAll<HTMLButtonElement>(
              '[aria-label="Camera timeline"] button',
            ),
          ]
            .find((b) => b.textContent!.includes("[Hook]"))
            ?.click();
          await pause();
        }
        document
          .querySelector<HTMLButtonElement>('[aria-label="Play video"]')
          ?.click();
        await new Promise((r) => setTimeout(r, 6200));
        document
          .querySelector<HTMLButtonElement>('[aria-label="Pause video"]')
          ?.click();
        await wait(() => true, "sustained_" + view);
      }
      await pause();
      await mainTab("Camera");
      [...document.querySelectorAll<HTMLButtonElement>('[aria-label="Camera timeline"] button')].find(b=>b.textContent!.includes("[Hook]"))?.click();
      await pause();
      document.querySelector<HTMLButtonElement>('[aria-label="Play video"]')?.click();
      await new Promise(r=>setTimeout(r,47200));
      await wait(()=>true,"full_generated_playback");
      console.error = original;
      return {
        changes,
        updateErrors: errors.length,
        preview: Boolean(
          document.querySelector(
            '.editor-preview video[data-editor-active="true"]',
          ),
        ),
      };

};`,
      { loader: "ts" },
    );
    await page.evaluate(driver.code);
    const result = await page.evaluate(() => runEditorStress());
    expect(result).toMatchObject({ updateErrors: 0, preview: true });
    expect(fixture.counts().edits).toBe(8);
    expect(fixture.counts().unexpected).toBe(0);
    expect(fixture.clip.calls).toEqual({ plan: 0, image: 0, render: 0 });
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    await writeFile(
      resolve(".local-build/evidence/cl255-editor-stress.json"),
      JSON.stringify(
        {
          synthetic: true,
          result,
          counts: fixture.counts(),
          calls: fixture.clip.calls,
        },
        null,
        2,
      ),
    );
  } finally {
    await browser.close({ silent: true });
    await fixture.close();
  }
}, 180000);
