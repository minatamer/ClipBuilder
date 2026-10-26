import { expect, it } from "vitest";
import { createServer } from "node:http";
import { createHash, randomUUID } from "node:crypto";
import { mkdtemp, readFile, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { stop } from "esbuild";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { ownerAnalysisSchema } from "../packages/contracts/local/selection.ts";
import { ownerBatchRequestSchema } from "../packages/contracts/local/clips.ts";
import { prepareLocalControlsFixture } from "./owner-controls-browser.ts";
import { listenOwner } from "./owner-http.ts";

declare module "../apps/renderer/node_modules/@remotion/renderer/dist/browser/devtools-commands.js" {
  interface Commands {
    "Input.dispatchKeyEvent": {
      paramsType: [
        {
          type: "keyDown" | "keyUp";
          key: string;
          code: string;
          windowsVirtualKeyCode: number;
          text?: string;
        },
      ];
      returnType: Record<string, never>;
    };
  }
}

function analysis(total = 3) {
  const manualCount = total > 10 ? 2 : 1;
  const moment = (index: number, manual: boolean) => ({
    id: randomUUID(),
    processingIdentity: "a".repeat(64),
    cut:
      index === 0
        ? { startFrame: 30, endFrame: 120 }
        : index === 1
          ? { startFrame: 135, endFrame: 195 }
          : { startFrame: 210, endFrame: 285 },
    rangeIds: [],
    cues: [],
    evidence: manual
      ? null
      : {
          startWordId: "w_000001",
          endWordId: "w_000002",
          title:
            index === 1
              ? "A long suggestion title that needs to wrap cleanly in a narrow review card"
              : `Suggestion ${index + 1}`,
          hook: "Synthetic hook",
          rationale: "Synthetic rationale",
          evidence: [],
          caveats: [],
        },
  });
  return ownerAnalysisSchema.parse({
    id: randomUUID(),
    mode: "provider-ai",
    words: [],
    inputs: {
      sourceRevision: 0,
      policyRevision: 1,
      ranges: [{ id: randomUUID(), startMs: 1000, endMs: 4000 }],
      aiDuration: { minMs: 10000, maxMs: 60000 },
      manualOnly: false,
    },
    manual: Array.from({ length: manualCount }, (_, i) => moment(i, true)),
    suggestions: Array.from({ length: total - manualCount }, (_, i) =>
      moment(i + manualCount, false),
    ),
    calls: { transcription: 0, selection: 0 },
  });
}

it("reviews manual/AI moment cards with exact source jumps, duration, removal, capacity and responsive footer guards", async () => {
  const directory = await mkdtemp(join(tmpdir(), "clipbuilder-moment-cards-"));
  const source = join(directory, "synthetic.mp4"),
    tools = await ownerNativeTools(resolve("."));
  const signal = AbortSignal.timeout(90_000);
  const ui = await prepareLocalControlsFixture(directory);
  await runOwnedProcess(
    tools.ffmpeg,
    [
      "-nostdin",
      "-v",
      "error",
      "-f",
      "lavfi",
      "-i",
      "testsrc2=size=160x90:rate=30:duration=10",
      "-f",
      "lavfi",
      "-i",
      "sine=frequency=440:sample_rate=48000:duration=10",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-movflags",
      "+faststart",
      "-threads",
      "2",
      source,
    ],
    signal,
  );
  const bytes = await readFile(source);
  const workspace = {
    id: randomUUID(),
    mode: "provider-ai",
    revision: 0,
    source: {
      fingerprint: createHash("sha256").update(bytes).digest("hex"),
      bytes: bytes.length,
      width: 160,
      height: 90,
      fps: 30,
      durationMs: 10000,
    },
  };
  let result = analysis(),
    active = false;
  const submissions: unknown[] = [],
    writes: string[] = [];
  const server = createServer((req, res) => {
    void (async () => {
      const path = req.url ?? "/";
      const json = (body: unknown, status = 200) =>
        res
          .writeHead(status, { "Content-Type": "application/json" })
          .end(JSON.stringify(body));
      if (req.method === "POST") {
        writes.push(path);
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(Buffer.from(chunk));
          if (Buffer.concat(chunks).length > 10000)
            throw new Error("large_test_request");
        }
        if (path.endsWith("/clips")) {
          submissions.push(
            ownerBatchRequestSchema.parse(
              JSON.parse(Buffer.concat(chunks).toString()),
            ),
          );
          json({ clips: [], active: false, workers: 1 }, 202);
          return;
        }
        throw new Error("unexpected_write");
      }
      if (path === "/favicon.ico") {
        res.writeHead(204).end();
        return;
      }
      if (path === "/api/local/capabilities") {
        json({
          aiMode: "provider-ai",
          sourceMode: null,
          planningAvailable: true,
          localMedia: true,
          cloud: false,
        });
        return;
      }
      if (path === "/api/local/workspace") {
        json(workspace);
        return;
      }
      if (path.endsWith("/analysis")) {
        json(result);
        return;
      }
      if (path.endsWith("/clips")) {
        json({ clips: [], active, workers: 1 });
        return;
      }
      if (path.endsWith("/source")) {
        const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range ?? "");
        if (range) {
          const start = Number(range[1]),
            end = Math.min(
              bytes.length - 1,
              range[2] ? Number(range[2]) : bytes.length - 1,
            );
          res
            .writeHead(206, {
              "Content-Type": "video/mp4",
              "Content-Length": end - start + 1,
              "Content-Range": `bytes ${start}-${end}/${bytes.length}`,
              "Accept-Ranges": "bytes",
            })
            .end(bytes.subarray(start, end + 1));
          return;
        }
        res
          .writeHead(200, {
            "Content-Type": "video/mp4",
            "Content-Length": bytes.length,
          })
          .end(bytes);
        return;
      }
      const file =
        path === "/"
          ? "index.html"
          : path === "/app.js"
            ? "app.js"
            : path === "/app.css"
              ? "app.css"
              : null;
      if (!file) {
        res.writeHead(404).end();
        return;
      }
      res
        .writeHead(200, {
          "Content-Type": file.endsWith("js")
            ? "text/javascript"
            : file.endsWith("css")
              ? "text/css"
              : "text/html",
        })
        .end(await readFile(join(ui, file)));
    })().catch(() => res.destroy());
  });
  const port = await listenOwner(server);
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
    const evaluate = async (expression: string) => {
      const reply = await page._client().send("Runtime.evaluate", {
        expression,
        awaitPromise: true,
        returnByValue: true,
        userGesture: true,
      });
      if (reply.value.exceptionDetails)
        throw new Error(JSON.stringify(reply.value.exceptionDetails));
      return reply.value.result.value;
    };
    const ready = async () => {
      await page.goto({ url: `http://localhost:${port}/`, timeout: 10000 });
      await evaluate(
        `globalThis.waitMoment=async(fn)=>{for(let i=0;i<400;i++){const v=fn();if(v)return v;await new Promise(done=>setTimeout(done,25));}const v=document.querySelector('.source-preview video');throw new Error('moment_wait_timeout_'+JSON.stringify({time:v?.currentTime,paused:v?.paused,seeking:v?.seeking,ready:v?.readyState,error:v?.error?.code,network:v?.networkState,focus:document.activeElement?.getAttribute('aria-label')}));};globalThis.momentAction=text=>[...document.querySelectorAll('button')].find(n=>n.textContent.trim()===text);waitMoment(()=>document.querySelectorAll('.moment-card').length&&[...document.querySelectorAll('.moment-card-actions button')].some(n=>n.textContent.trim()==='Jump to'&&!n.disabled)).then(()=>true)`,
      );
    };
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await ready();
    expect(
      await evaluate(
        `({titles:[...document.querySelectorAll('.moment-card-title')].map(n=>n.textContent),duration:[...document.querySelectorAll('.moment-card-duration')].map(n=>n.textContent),toggles:document.querySelectorAll('.moments [aria-pressed]').length,process:momentAction('Process clips').disabled})`,
      ),
    ).toMatchObject({
      duration: ["3s", "2s", "2.5s"],
      toggles: 0,
      process: false,
    });
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    for (const width of [1440, 390, 320]) {
      await page.setViewport({
        width,
        height: width === 1440 ? 1000 : 844,
        deviceScaleFactor: 1,
      });
      const geometry = await evaluate(
        `(async()=>{document.querySelector('.choices').scrollIntoView({block:'start'});await new Promise(requestAnimationFrame);const footer=document.querySelector('#sample-main > footer').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth,footer:footer.top>=0&&footer.bottom<=innerHeight+1,cards:[...document.querySelectorAll('.moment-card')].every(card=>{const r=card.getBoundingClientRect();return [...card.querySelectorAll('button')].every(n=>{const b=n.getBoundingClientRect();return b.height>=44&&b.width>=44&&b.left>=r.left&&b.right<=r.right+1;});})};})()`,
      );
      expect(geometry).toEqual({ overflow: false, footer: true, cards: true });
      const shot = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        resolve(`.local-build/evidence/cl085-cards-${width}.png`),
        Buffer.from(shot.value.data, "base64"),
      );
    }
    // Native keyboard activation, then verify the decoded source timeline.
    await evaluate(
      `document.querySelector('[aria-label="Jump to clip 1"]').focus()`,
    );
    for (const type of ["keyDown", "keyUp"] as const)
      await page._client().send("Input.dispatchKeyEvent", {
        type,
        key: "Enter",
        code: "Enter",
        windowsVirtualKeyCode: 13,
        ...(type === "keyDown" ? { text: "\r" } : {}),
      });
    expect(
      await evaluate(
        `waitMoment(()=>{const v=document.querySelector('.source-preview video');if(!v.seeking&&!v.paused&&Math.abs(v.currentTime-1)<.25){v.pause();return true;}})`,
      ),
    ).toBe(true);
    expect(
      await evaluate(
        `(async()=>{document.querySelector('[aria-label="Jump to clip 2"]').click();await waitMoment(()=>{const v=document.querySelector('.source-preview video');return !v.seeking&&!v.paused&&Math.abs(v.currentTime-4.5)<.25;});document.querySelector('.source-preview video').pause();return document.querySelectorAll('.moment-card').length;})()`,
      ),
    ).toBe(3);
    active = true;
    expect(
      await evaluate(
        `waitMoment(()=>[...document.querySelectorAll('.moment-card-actions button')].every(n=>n.disabled)).then(()=>true)`,
      ),
    ).toBe(true);
    active = false;
    await evaluate(
      `waitMoment(()=>!document.querySelector('[aria-label="Jump to clip 1"]').disabled)`,
    );
    expect(
      await evaluate(
        `(async()=>{const v=document.querySelector('.source-preview video'),before=v.currentTime;Object.defineProperty(v,'readyState',{configurable:true,value:0});v.dispatchEvent(new Event('emptied'));await waitMoment(()=>document.querySelector('[aria-label="Jump to clip 1"]').disabled);document.querySelector('[aria-label="Jump to clip 1"]').click();const same=v.currentTime===before;delete v.readyState;v.dispatchEvent(new Event('loadedmetadata'));await waitMoment(()=>!document.querySelector('[aria-label="Jump to clip 1"]').disabled);return same;})()`,
      ),
    ).toBe(true);
    expect(
      await evaluate(
        `(async()=>{const v=document.querySelector('.source-preview video'),before=v.currentTime;Object.defineProperty(v,'error',{configurable:true,value:{code:3}});v.dispatchEvent(new Event('error'));await waitMoment(()=>document.querySelector('[aria-label="Jump to clip 1"]').disabled);document.querySelector('[aria-label="Jump to clip 1"]').click();const same=v.currentTime===before;delete v.error;v.dispatchEvent(new Event('loadedmetadata'));await waitMoment(()=>!document.querySelector('[aria-label="Jump to clip 1"]').disabled);return same;})()`,
      ),
    ).toBe(true);
    expect(
      await evaluate(
        `(async()=>{const v=document.querySelector('.source-preview video');Object.defineProperty(v,'play',{configurable:true,value:()=>Promise.reject(new DOMException('Synthetic blocked playback','NotAllowedError'))});document.querySelector('[aria-label="Jump to clip 1"]').click();await waitMoment(()=>document.body.textContent.includes('Press play in the video preview.'));delete v.play;return document.querySelectorAll('.moment-card').length;})()`,
      ),
    ).toBe(3);
    expect(writes).toEqual([]);
    expect(
      await evaluate(
        `(async()=>{document.querySelector('[aria-label="Remove clip 2"]').click();await waitMoment(()=>document.querySelectorAll('.moment-card').length===2);const focused=document.activeElement.getAttribute('aria-label');momentAction('Add clips').click();await new Promise(requestAnimationFrame);momentAction('Your clips').click();await waitMoment(()=>document.querySelector('.choices').getClientRects().length);return {focused,count:document.querySelectorAll('.moment-card').length,duration:[...document.querySelectorAll('.moment-card-duration')].map(n=>n.textContent)};})()`,
      ),
    ).toEqual({ focused: "Remove clip 3", count: 2, duration: ["3s", "2.5s"] });
    const kept = [result.manual[0]!.id, result.suggestions[1]!.id];
    await evaluate(
      `momentAction('Process clips').click();waitMoment(()=>document.querySelector('.moment-selection').hidden).then(()=>true)`,
    );
    expect(submissions).toEqual([expect.objectContaining({ momentIds: kept })]);

    result = analysis(12);
    await ready();
    expect(
      await evaluate(
        `({count:document.querySelectorAll('.moment-card').length,disabled:momentAction('Process clips').disabled,guide:document.querySelector('.selection-count').textContent})`,
      ),
    ).toMatchObject({
      count: 12,
      disabled: true,
      guide: expect.stringContaining("Remove 2"),
    });
    await evaluate(
      `(async()=>{for(let i=0;i<2;i++){document.querySelector('.moment-remove').click();await waitMoment(()=>document.querySelectorAll('.moment-card').length===11-i);}return true;})()`,
    );
    expect(await evaluate(`momentAction('Process clips').disabled`)).toBe(
      false,
    );
    expect(submissions).toHaveLength(1);
    expect(
      await evaluate(
        `(async()=>{while(document.querySelector('.moment-remove')){const before=document.querySelectorAll('.moment-card').length;document.querySelector('.moment-remove').click();await waitMoment(()=>document.querySelectorAll('.moment-card').length===before-1);}return {disabled:momentAction('Process clips').disabled,empty:document.querySelector('.selection').textContent.includes('No clips yet.'),focus:document.activeElement.getAttribute('role')};})()`,
      ),
    ).toEqual({ disabled: true, empty: true, focus: "tabpanel" });
    expect(writes).toHaveLength(1);
  } finally {
    await browser.close({ silent: true });
    await new Promise<void>((done) => server.close(() => done()));
    stop();
    expect(
      resolve(directory).startsWith(
        resolve(tmpdir(), "clipbuilder-moment-cards-"),
      ),
    ).toBe(true);
    await rm(directory, { recursive: true, force: true });
  }
}, 100_000);
