import { expect, it } from "vitest";
import { build } from "esbuild";
import { createServer, get } from "node:http";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { listenOwner } from "./owner-http.ts";

it("reviews the matte two-point Privacy dialog in every disclosure mode", async () => {
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
  const frontend = resolve("apps/frontend");
  const bundle = await build({
    absWorkingDir: frontend,
    outfile: resolve(".local-build/privacy-review.js"),
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"' },
    stdin: {
      resolveDir: frontend,
      loader: "tsx",
      sourcefile: "privacy-review.tsx",
      contents: `
      import React from 'react';import{createRoot}from'react-dom/client';
      import './src/styles/tokens.css';import{PrivacyDialog}from'./src/app/privacy-dialog';
      createRoot(document.getElementById('app')).render(<div style={{display:'flex',flexWrap:'wrap',gap:16,padding:24}}>
        <PrivacyDialog triggerLabel="Preview privacy" triggerVariant="secondary"/>
        <PrivacyDialog triggerLabel="Local privacy" triggerVariant="secondary" localMedia/>
        <PrivacyDialog triggerLabel="Cloud privacy" triggerVariant="secondary" localMedia cloudMedia/>
        <PrivacyDialog triggerLabel="Generated privacy" triggerVariant="secondary" localMedia cloudMedia illustrativePictures/>
      </div>);
    `,
    },
  });
  const js = bundle.outputFiles.find((file) => file.path.endsWith(".js"));
  const css = bundle.outputFiles.find((file) => file.path.endsWith(".css"));
  if (!js || !css) throw new Error("privacy_bundle_unavailable");
  const server = createServer((request, response) => {
    if (!["GET", "HEAD"].includes(request.method ?? "")) {
      response.writeHead(405).end();
      return;
    }
    const path = new URL(request.url ?? "/", "http://localhost").pathname;
    if (path === "/") {
      response.setHeader("content-type", "text/html");
      response.end(
        '<link rel="stylesheet" href="/bundle.css"><div id="app"></div><script src="/bundle.js"></script>',
      );
      return;
    }
    if (path === "/bundle.js") {
      response.setHeader("content-type", "text/javascript");
      response.end(js.contents);
      return;
    }
    if (path === "/bundle.css") {
      response.setHeader("content-type", "text/css");
      response.end(css.contents);
      return;
    }
    response.writeHead(404).end();
  });
  const evidence = resolve(".local-build/evidence");
  await mkdir(evidence, { recursive: true });
  const port = await listenOwner(server);
  let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
  let closing = false,
    external = 0,
    processing = 0,
    interceptionFailed = false;
  const pending = new Set<Promise<void>>();
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
    const client = page._client();
    client.on(
      "Fetch.requestPaused",
      (event: {
        requestId: string;
        request: { url: string; method: string };
      }) => {
        const url = new URL(event.request.url),
          remote = !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname),
          mutation = !["GET", "HEAD"].includes(event.request.method);
        if (remote) external++;
        if (mutation && url.pathname !== "/api/diagnostics") processing++;
        const command =
          remote || mutation
            ? // @ts-expect-error Installed Chrome supports Fetch; pinned CDP types predate it.
              client.send("Fetch.failRequest", {
                requestId: event.requestId,
                errorReason: "BlockedByClient",
              })
            : // @ts-expect-error Installed Chrome supports Fetch; pinned CDP types predate it.
              client.send("Fetch.continueRequest", {
                requestId: event.requestId,
              });
        const task = command.then(
          () => {},
          (error: unknown) => {
            if (
              !closing &&
              !(
                error instanceof Error &&
                error.message.includes("Invalid InterceptionId.")
              )
            )
              interceptionFailed = true;
          },
        );
        pending.add(task);
        void task.then(() => pending.delete(task));
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
        throw new Error("privacy_expression_failed");
      return result.value.result.value;
    };
    const key = async (name: string, code: number, shift = false) => {
      await client.send("Input.dispatchKeyEvent", {
        type: "keyDown",
        key: name,
        code: name,
        windowsVirtualKeyCode: code,
        // @ts-expect-error Installed Chrome supports Shift modifiers; pinned CDP types omit them.
        modifiers: shift ? 8 : 0,
        ...(name === "Enter" ? { text: "\r", unmodifiedText: "\r" } : {}),
      });
      await client.send("Input.dispatchKeyEvent", {
        type: "keyUp",
        key: name,
        code: name,
        windowsVirtualKeyCode: code,
        // @ts-expect-error Installed Chrome supports Shift modifiers; pinned CDP types omit them.
        modifiers: shift ? 8 : 0,
      });
    };
    const click = async (x: number, y: number) => {
      await client.send("Input.dispatchMouseEvent", {
        type: "mousePressed",
        x,
        y,
        button: "left",
        clickCount: 1,
      });
      await client.send("Input.dispatchMouseEvent", {
        type: "mouseReleased",
        x,
        y,
        button: "left",
        clickCount: 1,
      });
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
    await page.goto({ url: `http://localhost:${port}/`, timeout: 30_000 });
    for (const [width, height] of [
      [1366, 768],
      [768, 1024],
      [390, 844],
      [320, 568],
      [844, 390],
    ] as const) {
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      for (const mode of ["Preview", "Local", "Cloud", "Generated"]) {
        await evaluate(
          `(()=>{const trigger=[...document.querySelectorAll('[aria-haspopup="dialog"]')].find(n=>n.textContent==='${mode} privacy');trigger.focus();return true})()`,
        );
        await key("Enter", 13);
        const geometry = await evaluate(`(()=>{
          const d=document.querySelector('dialog[open]'),r=d.getBoundingClientRect(),s=getComputedStyle(d),c=d.querySelector('[aria-label="Close privacy"]').getBoundingClientRect(),body=d.querySelector('[role="region"]'),b=body.getBoundingClientRect();
          const inside=r.left>=8&&r.right<=innerWidth-8&&r.top>=8&&r.bottom<=innerHeight-8;
          const text=[...body.querySelectorAll('h3,p')].every(n=>{const range=document.createRange();range.selectNodeContents(n);return [...range.getClientRects()].every(t=>t.left>=b.left&&t.right<=b.right)});
          const layer=[d,...d.querySelectorAll('div')].every(n=>{const style=getComputedStyle(n);return style.backgroundImage==='none'&&style.backdropFilter==='none'});
          return {inside,text,layer,sections:d.querySelectorAll('[data-privacy-point]').length,close:c.width>=44&&c.height>=44&&c.top>=r.top&&c.bottom<=r.bottom,titleFocus:document.activeElement===d.querySelector('h2'),noBlur:getComputedStyle(d,'::backdrop').backdropFilter==='none',opaque:s.backgroundColor==='rgb(11, 27, 52)',scrolls:body.scrollHeight>body.clientHeight};
        })()`);
        expect(geometry, `${width}px ${mode}`).toMatchObject({
          inside: true,
          text: true,
          layer: true,
          sections: 2,
          close: true,
          titleFocus: true,
          noBlur: true,
          opaque: true,
        });
        await capture(`cl111-${mode.toLowerCase()}-${width}x${height}`);
        for (let step = 0; step < 3; step++) {
          await key("Tab", 9);
          expect(
            await evaluate(
              `document.querySelector('dialog[open]').contains(document.activeElement)`,
            ),
          ).toBe(true);
        }
        await evaluate(
          `document.querySelector('dialog[open] [aria-label="Close privacy"]').focus()`,
        );
        await key("Tab", 9, true);
        expect(
          await evaluate(
            `document.activeElement===document.querySelector('dialog[open] [role="region"]')`,
          ),
        ).toBe(true);
        if (geometry.scrolls) {
          await evaluate(
            `document.querySelector('dialog[open] [role="region"]').focus()`,
          );
          await key("End", 35);
          await new Promise((done) => setTimeout(done, 150));
          expect(
            await evaluate(
              `(()=>{const d=document.querySelector('dialog[open]'),b=d.querySelector('[role="region"]'),p=[...b.querySelectorAll('p')].at(-1).getBoundingClientRect(),r=b.getBoundingClientRect(),c=d.querySelector('[aria-label="Close privacy"]').getBoundingClientRect();return b.scrollTop>0&&p.bottom<=r.bottom&&c.top>=0&&c.bottom<=innerHeight})()`,
            ),
          ).toBe(true);
          await capture(`cl111-${mode.toLowerCase()}-${width}-scrolled`);
        }
        await key("Escape", 27);
        expect(
          await evaluate(
            `!document.querySelector('dialog[open]')&&document.activeElement.textContent==='${mode} privacy'`,
          ),
        ).toBe(true);
      }
    }
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await evaluate(
      `document.querySelector('[aria-haspopup="dialog"]').click()`,
    );
    await click(2, 2);
    expect(await evaluate(`!document.querySelector('dialog[open]')`)).toBe(
      true,
    );
    await evaluate(
      `document.querySelector('[aria-haspopup="dialog"]').click()`,
    );
    const close = await evaluate(
      `(()=>{const r=document.querySelector('dialog[open] [aria-label="Close privacy"]').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}})()`,
    );
    await click(close.x, close.y);
    expect(await evaluate(`!document.querySelector('dialog[open]')`)).toBe(
      true,
    );
    await client.send("Emulation.setEmulatedMedia", {
      // @ts-expect-error Installed Chrome supports forced colors; pinned CDP types predate it.
      features: [{ name: "forced-colors", value: "active" }],
    });
    await evaluate(
      `document.querySelector('[aria-haspopup="dialog"]').click()`,
    );
    expect(
      await evaluate(
        `getComputedStyle(document.querySelector('dialog[open]')).boxShadow`,
      ),
    ).toBe("none");
    await capture("cl111-forced-colors");
    await key("Escape", 27);
    // @ts-expect-error Installed Chrome supports media features; pinned CDP types predate it.
    await client.send("Emulation.setEmulatedMedia", { features: [] });
    // Actual landing integration: no session, upload or processing interaction.
    await page.setViewport({ width: 900, height: 700, deviceScaleFactor: 1 });
    await page.goto({ url: "http://localhost:3000/", timeout: 30_000 });
    await evaluate(
      `document.querySelector('[aria-haspopup="dialog"]').focus()`,
    );
    await key("Enter", 13);
    expect(
      await evaluate(
        `(()=>{const d=document.querySelector('dialog[open]');return !!d&&d.querySelectorAll('[data-privacy-point]').length===2&&getComputedStyle(d).backgroundImage==='none'&&document.activeElement===d.querySelector('h2')&&getComputedStyle(d.querySelector('h2')).outlineStyle==='none'})()`,
      ),
    ).toBe(true);
    await capture("cl111-actual-landing");
    await key("Escape", 27);
    expect(
      await evaluate(
        `!document.querySelector('dialog[open]')&&document.activeElement.textContent==='Privacy'`,
      ),
    ).toBe(true);
    expect({ external, processing }).toEqual({ external: 0, processing: 0 });
  } finally {
    closing = true;
    try {
      await browser?.close({ silent: true });
    } finally {
      await Promise.all(pending);
      await new Promise<void>((done, reject) => {
        server.closeAllConnections();
        server.close((error) => (error ? reject(error) : done()));
      });
      expect(interceptionFailed).toBe(false);
    }
  }
}, 60_000);
