import { expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import sharp from "../apps/backend/node_modules/sharp/dist/index.mjs";
import { ownerVisualProtectedBoxes } from "../packages/contracts/local/visual-placement.ts";
import type { ContextualPictureRequest } from "../packages/contracts/src/contextual-picture.schema.ts";
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  rm,
  realpath,
  readdir,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, relative, isAbsolute } from "node:path";
import { createOwnerHost } from "../apps/backend/local/server.ts";
import { createOwnerWorker } from "../apps/renderer/local/server.ts";
import { createLocalCodexAi } from "../apps/backend/local/codex-ai.ts";
import type { CodexInference } from "../apps/backend/local/codex-exec.ts";
import { localWorkerPort } from "../apps/backend/local/worker-port.ts";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { retrievedPictureFixture } from "./owner-content-fixture.ts";
import { ownerClipListSchema } from "../packages/contracts/local/clips.ts";
import { ownerDraftStatusSchema } from "../packages/contracts/local/drafts.ts";
import { ownerWorkspaceSchema } from "../packages/contracts/local/index.ts";
import { browserSecurityPolicy } from "../apps/frontend/src/browser-security-policy.ts";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { listenOwner, ownerRequest } from "./owner-http.ts";
import {
  prepareLocalControlsFixture,
  prepareLocalOverlayFixture,
} from "./owner-controls-browser.ts";

async function cleanup(root: string) {
  const actual = await realpath(root),
    rel = relative(await realpath(tmpdir()), actual);
  if (
    !rel ||
    isAbsolute(rel) ||
    rel.startsWith("..") ||
    !rel.startsWith("clipbuilder-codex-proof-")
  )
    throw new Error("invalid_codex_cleanup");
  await rm(actual, { recursive: true, force: true });
}
it("runs the local Codex workflow through real controls/native worker with injected inference, retry, captions, export and saved reload", async () => {
  const directory = await mkdtemp(join(tmpdir(), "clipbuilder-codex-proof-")),
    root = join(directory, "workspaces");
  await mkdir(root);
  const tools = await ownerNativeTools(resolve(".")),
    signal = AbortSignal.timeout(240000);
  const speech = vi.fn<typeof runOwnedProcess>(
    async (_exe, args, speechSignal) => {
      speechSignal.throwIfAborted();
      const prefix = args[args.indexOf("-of") + 1]!,
        wav = args[args.indexOf("-f") + 1]!;
      const probe = JSON.parse(
        await runOwnedProcess(
          tools.ffprobe,
          [
            "-v",
            "error",
            "-show_entries",
            "format=duration:stream=sample_rate,channels",
            "-of",
            "json",
            wav,
          ],
          signal,
        ),
      );
      expect(probe.streams[0]).toMatchObject({
        sample_rate: "16000",
        channels: 1,
      });
      const duration = Number(probe.format.duration),
        count = Math.min(10, Math.floor(duration));
      await writeFile(
        prefix + ".json",
        JSON.stringify({
          transcription: Array.from({ length: count }, (_, index) => ({
            text: ` Synthetic${index + 1}`,
            offsets: { from: index * 1000, to: index * 1000 + 800 },
          })),
        }),
      );
      return "";
    },
  );
  const bundle = await prepareLocalOverlayFixture(directory);
  const diarize = vi.fn(
    async () => "2.000 -- 5.000 speaker_00\n5.000 -- 10.000 speaker_01\n",
  );
  const worker = createOwnerWorker({
    root,
    token: "synthetic-codex-worker",
    tools,
    chromium: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    overlayBundle: bundle,
    speech: {
      executable: "synthetic-whisper",
      model: "synthetic-model",
      directory,
      speakers: {
        executable: "synthetic-speakers",
        segmentation: "synthetic-segmentation",
        embedding: "synthetic-embedding",
        directory,
      },
    },
    runSpeech: speech,
    runSpeakers: diarize,
  });
  const workerPort = await listenOwner(worker.server);
  const transport: typeof fetch = async (input, init) => {
    const url = new URL(String(input));
    if (url.origin !== `http://127.0.0.1:${workerPort}`)
      throw new Error("unexpected_transport");
    const result = await ownerRequest(workerPort, url.pathname, {
      method: init?.method ?? "GET",
      headers: Object.fromEntries(new Headers(init?.headers)),
      ...(typeof init?.body === "string" ? { body: init.body } : {}),
    });
    return new Response(result.status === 204 ? null : result.body.toString(), {
      status: result.status,
    });
  };
  const media = vi.fn(
    localWorkerPort(workerPort, "synthetic-codex-worker", transport),
  );
  let failSelection = true;
  const infer = vi.fn<CodexInference>(async (request) => {
    expect(request.prompt).toContain("untrusted source data");
    if (
      "candidates" in (request.schema.properties as Record<string, unknown>)
    ) {
      if (failSelection) {
        failSelection = false;
        throw new Error("codex_login_required");
      }
      return {
        candidates: [
          {
            startWordId: "w_000001",
            endWordId: "w_000010",
            titleWordIds: ["w_000001", "w_000002"],
            hookWordIds: ["w_000001", "w_000002"],
            evidence: [],
            caveats: [],
          },
        ],
      };
    }
    expect(request.images?.length).toBeGreaterThan(0);
    expect(request.images!.length).toBeLessThanOrEqual(60);
    expect(
      request.images!.every((jpeg) =>
        Buffer.from(jpeg, "base64")
          .subarray(0, 3)
          .equals(Buffer.from([255, 216, 255])),
      ),
    ).toBe(true);
    const match = /\n(\{.*\})$/su.exec(request.prompt),
      context = JSON.parse(match![1]!);
    expect(request.images).toHaveLength(
      Math.min(60, Math.max(1, Math.floor(context.frames / 30))),
    );
    if (
      context.words.some(
        (word: { speakerId: string | null }) => word.speakerId === "spk_1",
      )
    )
      expect(context.images).toContainEqual({
        frame: 144,
        sampleFrames: [144, 150, 156],
      });
    return {
      texts: context.words.length
        ? [
            {
              startFrame: Math.min(context.frames - 1, 90),
              endFrame: context.frames,
              title: "POV: Synthetic ideas come to life",
              hookStyle: "pov",
              wordIds: context.words
                .slice(0, 2)
                .map((word: { id: string }) => word.id),
            },
          ]
        : [],
      pictures: context.words.length
        ? [
            {
              startFrame: 30,
              endFrame: context.frames,
              evidenceWordIds: context.words
                .slice(0, 2)
                .map((word: { id: string }) => word.id),
              brief: {
                scene: "A simple local computer processing concept",
                searchQuery: "local processing",
                requiredTerms: ["processing"],
                avoidTerms: [],
              },
              alternateBriefs: [
                {
                  scene: "A playful robot toy",
                  searchQuery: "robot toy",
                  requiredTerms: ["robot"],
                  avoidTerms: [],
                },
              ],
            },
          ]
        : [],
      hookSuggestion:
        context.frames < 100
          ? { startFrame: "invalid", endFrame: 20 }
          : { startFrame: 0, endFrame: Math.min(context.frames, 60) },
      people: [1, 2].map((number) => ({
        id: `person_${number}`,
        observations: [
          {
            startFrame: 0,
            endFrame: context.frames,
            box: {
              x: number === 1 ? 0.1 : 0.6,
              y: 0.15,
              width: 0.25,
              height: 0.45,
            },
          },
        ],
      })),
      decisions: [0, 60, 150]
        .filter((start) => start < context.frames)
        .map((start, index) => ({
          startFrame: start,
          endFrame: Math.min(context.frames, [60, 150, context.frames][index]),
          personId: index < 2 ? "person_2" : "person_1",
          speakerId: index === 0 ? null : `spk_${index - 1}`,
          evidenceWordIds: context.words
            .filter(
              (word: { speakerId: string | null }) =>
                word.speakerId === (index === 0 ? null : `spk_${index - 1}`),
            )
            .slice(0, 8)
            .map((word: { id: string }) => word.id),
          confidence: 0.99,
          shotStart: index === 0,
        })),
    };
  });
  const ui = await prepareLocalControlsFixture(directory);
  await writeFile(
    join(ui, "index.html"),
    '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script nonce="synthetic" type="module" src="/app.js"></script></body></html>',
  );
  const photo = await retrievedPictureFixture();
  const pictures = {
    find: vi
      .fn(
        async (
          request: ContextualPictureRequest,
          signal: AbortSignal,
        ): Promise<typeof photo.asset | null> => {
          signal.throwIfAborted();
          expect(request.brief.requiredTerms).toEqual(["processing"]);
          return photo.asset;
        },
      )
      .mockResolvedValueOnce(null),
  };
  let simulateOutage = false;
  function makeHost() {
    const host = createOwnerHost({
      root,
      ui,
      storageRoot: join(directory, "library"),
      recoverSession: true,
      token: "a".repeat(64),
      port: 0,
      media,
      capacity: async () => {},
      providers: (files) =>
        createLocalCodexAi({ files, media, infer, pictures }),
    });
    host.server.prependListener("request", (req, response) => {
      // Match the normal frontend policy; the retired host UI predates audio.
      const setHeader = response.setHeader.bind(response);
      response.setHeader = (name, value) =>
        setHeader(
          name,
          name.toLowerCase() === "content-security-policy"
            ? browserSecurityPolicy("synthetic", true)
            : value,
        );
      if (req.url?.startsWith("/api/local/"))
        req.url = req.url.replace("/api/local/", "/api/");
      if (simulateOutage && req.url?.endsWith("/clips"))
        req.url = "/synthetic-outage";
    });
    return host;
  }
  let host = makeHost();
  const port = await listenOwner(host.server),
    auth = { Authorization: `Bearer ${"a".repeat(64)}` },
    json = { ...auth, "Content-Type": "application/json" };
  let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
  let verified = false;
  await mkdir(resolve(".local-build/evidence"), { recursive: true });
  const note = async (phase: string) =>
    writeFile(
      resolve(".local-build/evidence/cl165-progress.json"),
      JSON.stringify({
        phase,
        verified,
        inferences: infer.mock.calls.length,
        mediaCalls: media.mock.calls.length,
        lastMedia: media.mock.lastCall?.[0].operation,
      }),
    );
  try {
    await note("source");
    const source = join(directory, "synthetic.mp4");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-f",
        "lavfi",
        "-i",
        "color=navy:s=320x180:r=30:d=15,drawbox=x=32:y=27:w=80:h=81:color=lime:t=fill,drawbox=x=192:y=27:w=80:h=81:color=yellow:t=fill",
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=440:sample_rate=48000:duration=15",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        source,
      ],
      signal,
    );
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
    await page.goto({ url: `http://localhost:${port}/`, timeout: 10000 });
    const driver = `globalThis.codexRun=async action=>{
      const wait=async(fn,label)=>{const limit=/content|planned_|text_control|picture_control/u.test(label)?400:2400;for(let i=0;i<limit;i++){if(fn())return;await new Promise(r=>setTimeout(r,25));}throw new Error('codex_ui_'+label+JSON.stringify({videos:[...document.querySelectorAll('.editor-preview video')].map(v=>({time:v.currentTime,ready:v.readyState,active:v.dataset.editorActive})),textCount:document.querySelectorAll('.editor-preview [data-text-layer]').length,imageCount:document.querySelectorAll('.editor-preview img').length}));};
      const button=text=>[...document.querySelectorAll('button,a')].find(n=>n.getClientRects().length&&n.textContent.trim()===text),named=label=>document.querySelector('[aria-label="'+label+'"]');
      if(action==='start'){
        await wait(()=>document.querySelector('.upload-card input:not(:disabled)'),'upload_ready');
        const input=document.querySelector('.upload-card input'),transfer=new DataTransfer();transfer.items.add(new File([Uint8Array.from(atob('${(await readFile(source)).toString("base64")}'),c=>c.charCodeAt(0))],'synthetic.mp4',{type:'video/mp4'}));input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));
        await wait(()=>button('Find moments')&&!button('Find moments').disabled,'find_ready');
        const set=async(label,value)=>{const n=[...document.querySelectorAll('.selection label')].find(n=>n.firstChild?.textContent.trim()===label)?.querySelector('input');if(!n)throw new Error('missing_'+label);Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(n,value);n.dispatchEvent(new Event('input',{bubbles:true}));await new Promise(r=>setTimeout(r,40));};
        await set('Clips','1');await set('Max (s)','10');button('Find moments').click();await wait(()=>document.body.textContent.includes('Sign in to Codex CLI with ChatGPT'),'login_error');
        if(document.body.textContent.includes('Gemini credits'))throw new Error('gemini_fallback');
        button('Find moments').click();await wait(()=>button('Process clips')&&!button('Process clips').disabled,'moments_ready');button('Process clips').click();await wait(()=>document.querySelector('.editor-preview video')&&button('Export clip'),'editor');
        return true;
      }
      if(action==='export'){button('Export clip').click();await wait(()=>named('Download clip'),'download');return true;}
      if(action==='local-captions'){
        await wait(()=>document.querySelector('.editor-panels:not([hidden])'),'restore');const clip=[...document.querySelectorAll('[role=tab]')].find(n=>n.textContent.trim().startsWith('Clip 2'));if(!clip)throw new Error('clip_2');clip.click();
        await wait(()=>button('Generate captions')&&!button('Generate captions').disabled,'caption_ready');button('Generate captions').click();await wait(()=>document.body.textContent.includes('This clip’s audio stays local.'),'local_confirmation');
        if(document.body.textContent.includes('uses Gemini credits'))throw new Error('paid_caption_copy');
        const footer=[...document.querySelectorAll('footer button')].find(n=>n.textContent.trim()==='Generate captions');if(!footer)throw new Error('caption_footer');footer.click();await wait(()=>!document.body.textContent.includes('No captions yet')&&!document.body.textContent.includes('Generating captions'),'captions_done');return true;
      }
      if(action==='fits'){
        await wait(()=>document.querySelector('.editor-preview video'),'fits_ready');const footer=document.querySelector('#sample-main > footer').getBoundingClientRect();return document.documentElement.scrollWidth<=innerWidth&&footer.top>=0&&footer.bottom<=innerHeight+1;
      }
      if(action==='first-content'){
        const clip=[...document.querySelectorAll('[role=tab]')].find(n=>n.textContent.trim().startsWith('Clip 1'));if(!clip)throw new Error('clip_1');clip.click();
        await wait(()=>[...document.querySelectorAll('.editor-preview video')].some(video=>video.src.includes(globalThis.firstClipId))&&button('Text')&&!button('Text').disabled,'content_ready');
        await wait(()=>{const node=button('Text');if(!node||node.disabled)return false;node.click();return true;},'text_control');await wait(()=>named('Edit text 1')&&named('Edit text 1').getClientRects().length,'text_control');named('Edit text 1').click();
        await wait(()=>document.querySelector('.editor-preview [data-text-layer]'),'planned_text');
        button('Media').click();button('Pictures')?.click();await wait(()=>named('Edit picture 1')&&named('Edit picture 1').getClientRects().length,'picture_control');named('Edit picture 1').click();
        await wait(()=>[...document.querySelectorAll('.editor-preview img')].some(image=>image.naturalWidth>0),'planned_visual');
        return document.querySelector('.editor-preview [data-text-layer]').textContent.includes('POV: Synthetic');
      }
      if(action==='manual-motion'){
        button('Add picture').click();await wait(()=>button('Discard changes'),'manual_picture');button('Motion').click();
        await wait(()=>[...document.querySelectorAll('[role=tabpanel][aria-labelledby$="-picture-motion"] select')].some(select=>select.getClientRects().length),'manual_motion');
        const selects=[...document.querySelectorAll('label')].filter(label=>label.getClientRects().length&&/^(Entrance|Exit)/.test(label.textContent.trim())).map(label=>label.querySelector('select')?.value);
        const valid=selects.length===2&&selects[0]==='none'&&selects[1]==='fade';button('Discard changes').click();return valid;
      }
      if(action==='section-icons'){
        const tabs=named('Clip settings'),items=[...tabs.querySelectorAll('[role=tab]')],labels=['Captions','Text','Filters','Media','Focus','Hook'];
        if(items.length!==6||items.some((item,index)=>item.textContent.trim()!==labels[index]||!item.querySelector('svg[aria-hidden="true"][focusable="false"]')))throw Error('section_icon_labels');
        const key=async(key,label)=>{document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true}));await wait(()=>items.some(item=>item.textContent.trim()===label&&item.getAttribute('aria-selected')==='true'&&document.activeElement===item),'section_keyboard');};
        items.find(item=>item.getAttribute('aria-selected')==='true').focus();
        await key('Home','Captions');await key('ArrowRight','Text');await key('ArrowLeft','Captions');await key('End','Hook');await key('ArrowRight','Captions');await key('ArrowLeft','Hook');
        items[3].click();await wait(()=>items[3].getAttribute('aria-selected')==='true','section_media');tabs.scrollIntoView({block:'center'});await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
        return items.every(item=>{const box=item.getBoundingClientRect(),icon=item.querySelector('svg').getBoundingClientRect();return box.height>=44&&box.left>=0&&box.right<=innerWidth&&icon.left>=box.left&&icon.right<=box.right&&icon.top>=box.top&&icon.bottom<=box.bottom;});
      }
      return false;
    };`;
    await page._client().send("Runtime.evaluate", { expression: driver });
    const run = async (action: string) => {
      await note(`ui_${action}`);
      const result = await page._client().send("Runtime.evaluate", {
        expression: `globalThis.codexRun(${JSON.stringify(action)})`,
        awaitPromise: true,
        returnByValue: true,
        userGesture: true,
      });
      if (result.value.exceptionDetails)
        throw new Error(JSON.stringify(result.value.exceptionDetails));
      return result.value.result.value;
    };
    expect(await run("start")).toBe(true);
    expect(speech).toHaveBeenCalledTimes(1);
    expect(infer).toHaveBeenCalledTimes(3);
    expect(await run("export")).toBe(true);
    await note("exported");
    const workspace = JSON.parse(
        (
          await ownerRequest(port, "/api/workspace", { headers: auth })
        ).body.toString(),
      ),
      endpoint = `/api/workspace/${workspace.id}`;
    let clips = ownerClipListSchema.parse(
      JSON.parse(
        (
          await ownerRequest(port, `${endpoint}/clips`, { headers: auth })
        ).body.toString(),
      ),
    );
    for (let i = 0; clips.active && i < 400; i++) {
      await new Promise((done) => setTimeout(done, 25));
      clips = ownerClipListSchema.parse(
        JSON.parse(
          (
            await ownerRequest(port, `${endpoint}/clips`, { headers: auth })
          ).body.toString(),
        ),
      );
    }
    expect(clips.clips[0]!.outputs).toHaveLength(1);
    expect(clips.clips[0]!.base!.overlay.focus!.people).toHaveLength(2);
    expect(
      new Set(clips.clips[0]!.base!.words.map((word) => word.speakerId)),
    ).toEqual(new Set([null, "spk_0", "spk_1"]));
    expect(clips.clips[0]!.base!.overlay.focus!.shots[0]!.personId).toBe(
      "person_2",
    );
    expect(
      clips.clips[0]!.base!.overlay.focus!.shots.some(
        (shot) => shot.personId === "person_1" && shot.reason === "speaker",
      ),
    ).toBe(true);
    expect(clips.clips[0]!.base!.hookSuggestion).toBeUndefined();
    expect(clips.clips[0]!.edit?.hook).toBeUndefined();
    expect(clips.clips[0]!.assets).toHaveLength(1);
    expect(clips.clips[0]!.assets[0]!.origin).toBe("retrieved");
    expect(clips.clips[0]!.base!.overlay.visuals[0]).toMatchObject({
      entrance: "none",
      exit: "fade",
    });
    expect(clips.clips[0]!.base!.overlay.texts).toMatchObject([
      {
        text: "POV: Synthetic ideas come to life",
        startFrame: 0,
        endFrame: 83,
      },
    ]);
    expect(clips.clips[0]!.edit!.texts).toEqual(
      clips.clips[0]!.base!.overlay.texts,
    );
    expect(clips.clips[0]!.base!.overlay.visuals).toHaveLength(1);
    expect(clips.clips[0]!.base!.overlay.visuals[0]).toMatchObject({
      startFrame: 30,
      endFrame: 180,
    });
    const first = clips.clips[0]!,
      visual = first.base!.overlay.visuals[0]!;
    for (const face of ownerVisualProtectedBoxes(
      first.base!.overlay.focus!,
      visual,
    )) {
      const overlapX =
        Math.min(face.x + face.width, visual.box.x + visual.box.width) -
        Math.max(face.x, visual.box.x);
      const overlapY =
        Math.min(face.y + face.height, visual.box.y + visual.box.height) -
        Math.max(face.y, visual.box.y);
      expect(overlapX <= 0 || overlapY <= 0).toBe(true);
    }
    const exported = await ownerRequest(
      port,
      `${endpoint}/clips/${first.id}/output/0`,
      { headers: auth },
    );
    expect(exported.status).toBe(200);
    const mp4 = join(directory, "opening-camera.mp4");
    await writeFile(mp4, exported.body);
    for (const second of [0.5, 1, 2, 7]) {
      const frame = resolve(`.local-build/evidence/cl165-native-${second}.png`);
      await runOwnedProcess(
        tools.ffmpeg,
        [
          "-nostdin",
          "-v",
          "error",
          "-y",
          "-ss",
          String(second),
          "-i",
          mp4,
          "-frames:v",
          "1",
          frame,
        ],
        signal,
      );
      const image = sharp(await readFile(frame)),
        metadata = await image.metadata();
      const region = await image
        .extract({
          left: Math.floor(metadata.width! / 2),
          top: Math.floor(metadata.height! * 0.35),
          width: 2,
          height: 2,
        })
        .toBuffer();
      const { channels } = await sharp(region).stats();
      // Synthetic colored heads prove the actual opening crop, later cut and
      // face visibility while the illustration is active (second 2).
      expect(channels[1]!.mean).toBeGreaterThan(180);
      expect(channels[2]!.mean).toBeLessThan(80);
      if (second < 5) expect(channels[0]!.mean).toBeGreaterThan(180);
      else expect(channels[0]!.mean).toBeLessThan(80);
      if (second === 1) {
        const imagePixel = await sharp(await readFile(frame))
          .extract({
            left: Math.floor(
              metadata.width! * (visual.box.x + visual.box.width * 0.1),
            ),
            top: Math.floor(
              metadata.height! * (visual.box.y + visual.box.height / 2),
            ),
            width: 2,
            height: 2,
          })
          .toBuffer();
        expect(
          (await sharp(imagePixel).stats()).channels[1]!.mean,
        ).toBeGreaterThan(50);
      }
    }
    expect(clips.clips[0]!.base!.overlay.audio!.cues).toMatchObject([
      { source: { kind: "builtin", id: "pop" }, startFrame: 30, loop: false },
    ]);
    expect(clips.clips[0]!.base!.overlay.captions.length).toBeGreaterThan(0);
    // A manual clip with no transcript tests explicit local caption generation.
    const previous = JSON.parse(
        (
          await ownerRequest(port, `${endpoint}/analysis`, { headers: auth })
        ).body.toString(),
      ),
      policyRevision = previous.inputs.policyRevision + 1;
    const analyzed = await ownerRequest(port, `${endpoint}/analysis`, {
      method: "POST",
      headers: json,
      body: JSON.stringify({
        sourceRevision: 0,
        policyRevision,
        ranges: [{ id: randomUUID(), startMs: 11000, endMs: 14000 }],
        aiDuration: { minMs: 10000, maxMs: 10000 },
        manualOnly: true,
      }),
    });
    expect(analyzed.status).toBe(200);
    const analysis = JSON.parse(analyzed.body.toString());
    expect(
      (
        await ownerRequest(port, `${endpoint}/clips`, {
          method: "POST",
          headers: json,
          body: JSON.stringify({
            operationId: randomUUID(),
            analysisId: analysis.id,
            sourceRevision: 0,
            policyRevision,
            momentIds: [analysis.manual[0].id],
          }),
        })
      ).status,
    ).toBe(202);
    for (let i = 0; i < 1200; i++) {
      clips = ownerClipListSchema.parse(
        JSON.parse(
          (
            await ownerRequest(port, `${endpoint}/clips`, { headers: auth })
          ).body.toString(),
        ),
      );
      if (clips.clips.length === 2 && !clips.active) break;
      await new Promise((done) => setTimeout(done, 25));
    }
    expect(clips.clips[1]!.base!.overlay.captions).toHaveLength(0);
    expect(clips.clips[1]!.base!.hookSuggestion).toBeUndefined();
    await page.goto({ url: `http://localhost:${port}/`, timeout: 10000 });
    await page._client().send("Runtime.evaluate", { expression: driver });
    expect(await run("local-captions")).toBe(true);
    expect(speech).toHaveBeenCalledTimes(2);
    expect(infer).toHaveBeenCalledTimes(4);
    clips = ownerClipListSchema.parse(
      JSON.parse(
        (
          await ownerRequest(port, `${endpoint}/clips`, { headers: auth })
        ).body.toString(),
      ),
    );
    expect(clips.clips[1]!.base!.overlay.captions.length).toBeGreaterThan(0);
    // Native RPC responses stay receipt-sized, all media artifacts are reaped.
    const prepared = media.mock.calls.filter(
      ([job]) => job.operation === "codex-input",
    );
    expect(prepared).toHaveLength(4);
    expect(
      prepared
        .filter(
          ([job]) => job.operation === "codex-input" && job.kind === "frames",
        )
        .map(([job]) =>
          job.operation === "codex-input" ? job.speakerChanges : undefined,
        ),
    ).toEqual([[150], undefined]);
    for (const name of await readdir(join(root, workspace.id)))
      expect(name).not.toMatch(/codex/);
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    await page._client().send("Runtime.evaluate", {
      expression: `globalThis.firstClipId=${JSON.stringify(clips.clips[0]!.id)}`,
    });
    expect(await run("first-content")).toBe(true);
    expect(await run("manual-motion")).toBe(true);
    const seek = await page._client().send("Runtime.evaluate", {
      expression: `(async()=>{const video=document.querySelector('.editor-preview video');video.pause();if(Math.abs(video.currentTime-2)>.01)await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('synthetic_seek_timeout')),5000);video.addEventListener('seeked',()=>{clearTimeout(timer);resolve();},{once:true});video.currentTime=2;});video.dispatchEvent(new Event('timeupdate'));await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));return true;})()`,
      awaitPromise: true,
      returnByValue: true,
    });
    expect(seek.value.exceptionDetails).toBeUndefined();
    for (const width of [1440, 820, 390, 320]) {
      await page.setViewport({
        width,
        height: width === 320 ? 568 : 900,
        deviceScaleFactor: 1,
      });
      expect(await run("fits")).toBe(true);
      expect(await run("section-icons")).toBe(true);
      const shot = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        resolve(`.local-build/evidence/cl165-editor-${width}.png`),
        Buffer.from(shot.value.data, "base64"),
      );
    }
    expect(
      (await ownerRequest(port, `${endpoint}/draft`, { headers: auth })).status,
    ).toBe(200);
    const savedResponse = await ownerRequest(port, `${endpoint}/draft`, {
      method: "POST",
      headers: auth,
    });
    expect(savedResponse.status).toBe(200);
    const saved = ownerDraftStatusSchema.parse(
      JSON.parse(savedResponse.body.toString()),
    );
    expect(saved.state).toBe("saved");
    await note("saved");
    // Stop old-workspace media/polling before the API-owned clear/restore cycle.
    await page.goto({ url: "about:blank", timeout: 10000 });
    const mediaCount = media.mock.calls.length;
    expect(
      (
        await ownerRequest(port, endpoint, {
          method: "DELETE",
          headers: auth,
          signal: AbortSignal.timeout(30000),
        })
      ).status,
    ).toBe(204);
    const reopenedResponse = await ownerRequest(
      port,
      `/api/drafts/${saved.id}/open`,
      { method: "POST", headers: auth, signal: AbortSignal.timeout(30000) },
    );
    expect(reopenedResponse.status).toBe(200);
    await note("reopened");
    const reopened = ownerWorkspaceSchema.parse(
      JSON.parse(reopenedResponse.body.toString()),
    );
    expect(reopened.id).not.toBe(workspace.id);
    const restored = ownerClipListSchema.parse(
      JSON.parse(
        (
          await ownerRequest(port, `/api/workspace/${reopened.id}/clips`, {
            headers: auth,
          })
        ).body.toString(),
      ),
    );
    expect(
      restored.clips.map((clip) => ({
        focus: clip.base?.overlay.focus,
        suggestion: clip.base?.hookSuggestion,
        captions: clip.base?.overlay.captions,
        texts: clip.base?.overlay.texts,
        visuals: clip.base?.overlay.visuals,
        audio: clip.base?.overlay.audio,
        edit: clip.edit,
        outputs: clip.outputs,
      })),
    ).toEqual(
      clips.clips.map((clip) => ({
        focus: clip.base?.overlay.focus,
        suggestion: clip.base?.hookSuggestion,
        captions: clip.base?.overlay.captions,
        texts: clip.base?.overlay.texts,
        visuals: clip.base?.overlay.visuals,
        audio: clip.base?.overlay.audio,
        edit: clip.edit,
        outputs: clip.outputs,
      })),
    );
    await page.goto({ url: `http://localhost:${port}/`, timeout: 10000 });
    await page._client().send("Runtime.evaluate", { expression: driver });
    expect(await run("fits")).toBe(true);
    expect(media).toHaveBeenCalledTimes(mediaCount);
    expect(speech).toHaveBeenCalledTimes(2);
    expect(diarize).toHaveBeenCalledTimes(2);
    expect(infer).toHaveBeenCalledTimes(4);
    await note("connection_outage");
    simulateOutage = true;
    const disconnected = await page._client().send("Runtime.evaluate", {
      expression: `(async()=>{document.querySelectorAll('video').forEach(video=>video.pause());const start=Date.now();while(!document.querySelector('.connection-status')){if(Date.now()-start>6000)throw Error('reconnecting_missing');await new Promise(resolve=>setTimeout(resolve,50));}return document.querySelector('.connection-status').closest('footer')!==null;})()`,
      awaitPromise: true,
      returnByValue: true,
    });
    expect(disconnected.value.exceptionDetails).toBeUndefined();
    expect(disconnected.value.result.value).toBe(true);
    for (const width of [1440, 390, 320]) {
      await page.setViewport({
        width,
        height: width === 320 ? 568 : 900,
        deviceScaleFactor: 1,
      });
      const bounds = await page._client().send("Runtime.evaluate", {
        expression: `(()=>{const footer=document.querySelector('#sample-main > footer').getBoundingClientRect();const status=document.querySelector('.connection-status').getBoundingClientRect();return footer.bottom<=innerHeight+1&&status.top>=footer.top&&status.bottom<=innerHeight&&document.documentElement.scrollWidth<=innerWidth;})()`,
        returnByValue: true,
      });
      expect(bounds.value.result.value).toBe(true);
      const shot = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        resolve(`.local-build/evidence/cl165-reconnect-${width}.png`),
        Buffer.from(shot.value.data, "base64"),
      );
    }
    const timedOut = await page._client().send("Runtime.evaluate", {
      expression: `(async()=>{const start=Date.now();while(![...document.querySelectorAll('footer button')].some(button=>button.textContent.trim()==='Try again')){if(Date.now()-start>35000)throw Error('reconnect_timeout_missing');await new Promise(resolve=>setTimeout(resolve,100));}return !document.querySelector('.flow-notice')?.textContent.includes('Reconnecting');})()`,
      awaitPromise: true,
      returnByValue: true,
    });
    expect(timedOut.value.exceptionDetails).toBeUndefined();
    expect(timedOut.value.result.value).toBe(true);
    const resetBlocked = await page._client().send("Runtime.evaluate", {
      expression: `(()=>{const button=document.querySelector('.session-controls button');return !button||button.disabled;})()`,
      returnByValue: true,
    });
    expect(resetBlocked.value.result.value).toBe(true);
    for (const width of [1440, 390, 320]) {
      await page.setViewport({
        width,
        height: width === 320 ? 568 : 900,
        deviceScaleFactor: 1,
      });
      const shot = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        resolve(`.local-build/evidence/cl165-timeout-${width}.png`),
        Buffer.from(shot.value.data, "base64"),
      );
      const fit = await page._client().send("Runtime.evaluate", {
        expression: `(()=>{const footer=document.querySelector('#sample-main > footer').getBoundingClientRect();return footer.top>=0&&footer.bottom<=innerHeight+1&&[...document.querySelectorAll('footer button')].every(button=>button.getBoundingClientRect().right<=innerWidth)&&document.documentElement.scrollWidth<=innerWidth;})()`,
        returnByValue: true,
      });
      expect(fit.value.result.value).toBe(true);
    }
    await note("restart_recovery");
    const inferenceCount = infer.mock.calls.length,
      oldId = reopened.id;
    await host.close();
    host = makeHost();
    await new Promise<void>((done, fail) => {
      host.server.once("error", fail);
      host.server.listen(port, "127.0.0.1", done);
    });
    simulateOutage = false;
    const retried = await page._client().send("Runtime.evaluate", {
      expression: `(async()=>{[...document.querySelectorAll('footer button')].find(button=>button.textContent.trim()==='Try again').click();const start=Date.now();while(document.querySelector('.connection-status')){if(Date.now()-start>20000)throw Error('recovery_rebind_timeout');await new Promise(resolve=>setTimeout(resolve,50));}return true;})()`,
      awaitPromise: true,
      returnByValue: true,
    });
    expect(retried.value.exceptionDetails).toBeUndefined();
    const recoveredWorkspace = ownerWorkspaceSchema.parse(
      JSON.parse(
        (
          await ownerRequest(port, "/api/workspace", { headers: auth })
        ).body.toString(),
      ),
    );
    expect(recoveredWorkspace.id).not.toBe(oldId);
    const recoveredClips = ownerClipListSchema.parse(
      JSON.parse(
        (
          await ownerRequest(
            port,
            `/api/workspace/${recoveredWorkspace.id}/clips`,
            { headers: auth },
          )
        ).body.toString(),
      ),
    );
    expect(
      recoveredClips.clips.map((clip) => ({
        id: clip.id,
        base: clip.base,
        edit: clip.edit,
        outputs: clip.outputs,
        calls: clip.calls,
      })),
    ).toEqual(
      restored.clips.map((clip) => ({
        id: clip.id,
        base: clip.base,
        edit: clip.edit,
        outputs: clip.outputs,
        calls: clip.calls,
      })),
    );
    expect(infer).toHaveBeenCalledTimes(inferenceCount);
    expect(speech).toHaveBeenCalledTimes(2);
    expect(diarize).toHaveBeenCalledTimes(2);
    expect(media).toHaveBeenCalledTimes(mediaCount);
    expect(
      (
        await ownerRequest(port, `/api/workspace/${recoveredWorkspace.id}`, {
          method: "DELETE",
          headers: auth,
        })
      ).status,
    ).toBe(204);
    const missing = await page._client().send("Runtime.evaluate", {
      expression: `(async()=>{const start=Date.now();while(![...document.querySelectorAll('footer button')].some(button=>button.textContent.trim()==='Start new session')){if(Date.now()-start>6000)throw Error('missing_session_state');await new Promise(resolve=>setTimeout(resolve,50));}return true;})()`,
      awaitPromise: true,
      returnByValue: true,
    });
    expect(missing.value.exceptionDetails).toBeUndefined();
    for (const width of [1440, 390, 320]) {
      await page.setViewport({
        width,
        height: width === 320 ? 568 : 900,
        deviceScaleFactor: 1,
      });
      const shot = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        resolve(`.local-build/evidence/cl165-missing-${width}.png`),
        Buffer.from(shot.value.data, "base64"),
      );
      const fit = await page._client().send("Runtime.evaluate", {
        expression: `(()=>{const footer=document.querySelector('#sample-main > footer').getBoundingClientRect();return footer.top>=0&&footer.bottom<=innerHeight+1&&document.documentElement.scrollWidth<=innerWidth;})()`,
        returnByValue: true,
      });
      expect(fit.value.result.value).toBe(true);
    }
    expect(
      JSON.parse(
        (
          await ownerRequest(port, "/api/drafts", { headers: auth })
        ).body.toString(),
      ).some((draft: { id: string }) => draft.id === saved.id),
    ).toBe(true);
    expect(
      JSON.parse(
        (
          await ownerRequest(port, "/api/workspace", { headers: auth })
        ).body.toString(),
      ),
    ).toBeNull();
    expect(pictures.find).toHaveBeenCalledTimes(2);
    expect(
      pictures.find.mock.calls.map(([request]) => request.brief.searchQuery),
    ).toEqual(["local processing", "processing"]);
    expect(
      pictures.find.mock.calls.every(
        ([request]) => request.brief.requiredTerms.join(" ") === "processing",
      ),
    ).toBe(true);
    verified = true;
    await note("verified");
  } finally {
    await note("cleanup_browser");
    await browser?.close({ silent: true });
    await note("cleanup_host");
    await host.close();
    await note("cleanup_worker");
    await worker.close();
    await cleanup(directory);
    await note("complete");
  }
}, 250000);
