import { expect, it, vi } from "vitest";
import sharp from "../apps/backend/node_modules/sharp/dist/index.mjs";
import {
  mkdtemp,
  mkdir,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { isAbsolute, join, relative, resolve } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { createOwnerHost } from "../apps/backend/local/server.ts";
import { fakeOwnerAnalysis } from "../apps/backend/local/fake-analysis.ts";
import { fakeOwnerClipPreparation } from "../apps/backend/local/fake-clips.ts";
import { createOwnerWorker } from "../apps/renderer/local/server.ts";
import { localWorkerPort } from "../apps/backend/local/worker-port.ts";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { ownerClipListSchema } from "../packages/contracts/local/clips.ts";
import { openBrowser } from "../apps/renderer/node_modules/@remotion/renderer/dist/index.js";
import { listenOwner, ownerRequest } from "./owner-http.ts";
import { browserSecurityPolicy } from "../apps/frontend/src/browser-security-policy.ts";
import {
  prepareLocalControlsFixture,
  prepareLocalOverlayFixture,
} from "./owner-controls-browser.ts";

async function cleanAudioEditor(root: string) {
  const actual = await realpath(root),
    rel = relative(await realpath(tmpdir()), actual);
  if (
    !rel ||
    isAbsolute(rel) ||
    rel.startsWith("..") ||
    !rel.startsWith("clipbuilder-audio-editor-")
  )
    throw new Error("invalid_audio_cleanup");
  await rm(actual, { recursive: true, force: true });
}
it("edits Media audio through the real authenticated API/worker with audition, upload retry, Apply/Discard, playback and saved reload", async () => {
  const directory = await mkdtemp(join(tmpdir(), "clipbuilder-audio-editor-")),
    root = join(directory, "workspaces");
  await mkdir(root);
  const tools = await ownerNativeTools(resolve(".")),
    signal = AbortSignal.timeout(180000);
  const worker = createOwnerWorker({
    root,
    token: "synthetic-audio-worker",
    tools,
    chromium: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    overlayBundle: await prepareLocalOverlayFixture(directory),
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
  const rpc = localWorkerPort(workerPort, "synthetic-audio-worker", transport);
  let holdAudio = false,
    canceledUploads = 0;
  const media = vi.fn(async (...args: Parameters<typeof rpc>) => {
    const [job, requestSignal] = args;
    if (holdAudio && job.operation === "normalize-audio") {
      holdAudio = false;
      await new Promise<never>((_done, reject) => {
        const cancel = () => {
          canceledUploads++;
          reject(new Error("canceled"));
        };
        if (requestSignal.aborted) cancel();
        else requestSignal.addEventListener("abort", cancel, { once: true });
      });
    }
    return rpc(...args);
  });
  const art = await sharp({
    create: { width: 32, height: 32, channels: 3, background: "#ffd000" },
  })
    .jpeg()
    .toBuffer();
  const transcribe = vi.fn(fakeOwnerAnalysis.transcribe),
    select = vi.fn(fakeOwnerAnalysis.select),
    plan = vi.fn<typeof fakeOwnerClipPreparation.plan>(async () => [
      {
        startFrame: 30,
        endFrame: 60,
        brief: {
          scene: "A bright yellow geometric square",
          searchQuery: "yellow square",
          requiredTerms: ["square"],
          avoidTerms: [],
        },
        evidenceWordIds: [],
      },
    ]),
    image = vi.fn<typeof fakeOwnerClipPreparation.image>(async () => ({
      bytes: art,
      origin: "synthetic",
    }));
  const ui = await prepareLocalControlsFixture(directory);
  let holdYoutube = false,
    failYoutube = false,
    canceledYoutube = 0;
  const youtubeAudio = vi.fn(
    async (
      identity: { videoId: string },
      _directory: string,
      requestSignal: AbortSignal,
    ) => {
      expect(identity.videoId).toBe("SYNTHETIC01");
      requestSignal.throwIfAborted();
      if (holdYoutube) {
        holdYoutube = false;
        await new Promise<never>((_done, fail) => {
          const abort = () => {
            canceledYoutube++;
            fail(new Error("canceled"));
          };
          if (requestSignal.aborted) abort();
          else requestSignal.addEventListener("abort", abort, { once: true });
        });
      }
      if (failYoutube) {
        failYoutube = false;
        throw new Error("youtube_audio_duration");
      }
      return new Uint8Array(await readFile(join(directory, "synthetic.wav")));
    },
  );
  await writeFile(
    join(ui, "index.html"),
    '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script nonce="synthetic-audio" type="module" src="/app.js"></script></body></html>',
  );
  const host = createOwnerHost({
    root,
    ui,
    storageRoot: join(directory, "library"),
    port: 0,
    token: "a".repeat(64),
    analysis: { ...fakeOwnerAnalysis, transcribe, select },
    acquisition: {
      mode: "synthetic-source",
      audio: youtubeAudio,
      metadata: async () => {
        throw new Error("unexpected_metadata");
      },
      download: async () => {
        throw new Error("unexpected_video_download");
      },
    },
    clipPreparation: { ...fakeOwnerClipPreparation, plan, image },
    media,
    capacity: async () => {},
  });
  host.server.prependListener("request", (req, res) => {
    const setHeader = res.setHeader.bind(res);
    res.setHeader = (name, value) =>
      setHeader(
        name,
        name.toLowerCase() === "content-security-policy"
          ? browserSecurityPolicy("synthetic-audio", true)
          : value,
      );
    if (req.url?.startsWith("/api/local/"))
      req.url = req.url.replace("/api/local/", "/api/");
  });
  const port = await listenOwner(host.server),
    auth = { Authorization: `Bearer ${"a".repeat(64)}` },
    json = { ...auth, "Content-Type": "application/json" };
  let browser: Awaited<ReturnType<typeof openBrowser>> | undefined;
  try {
    const source = join(directory, "synthetic.mp4"),
      wave = join(directory, "synthetic.wav");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-f",
        "lavfi",
        "-i",
        "color=navy:s=240x320:r=30:d=4",
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=440:sample_rate=48000:duration=4",
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
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=880:sample_rate=44100:duration=0.473",
        "-c:a",
        "pcm_s16le",
        wave,
      ],
      signal,
    );
    const uploaded = await ownerRequest(port, "/api/source", {
      method: "POST",
      headers: { ...auth, "Content-Type": "video/mp4" },
      body: await readFile(source),
    });
    expect(uploaded.status).toBe(200);
    const workspace = JSON.parse(uploaded.body.toString()),
      endpoint = `/api/workspace/${workspace.id}`;
    const analyzed = await ownerRequest(port, `${endpoint}/analysis`, {
      method: "POST",
      headers: json,
      body: JSON.stringify({
        sourceRevision: 0,
        policyRevision: 1,
        ranges: [{ id: randomUUID(), startMs: 0, endMs: 3000 }],
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
            policyRevision: 1,
            momentIds: [analysis.manual[0].id],
          }),
        })
      ).status,
    ).toBe(202);
    let list = ownerClipListSchema.parse({
      clips: [],
      active: false,
      workers: 1,
    });
    for (let i = 0; i < 600; i++) {
      list = ownerClipListSchema.parse(
        JSON.parse(
          (
            await ownerRequest(port, `${endpoint}/clips`, { headers: auth })
          ).body.toString(),
        ),
      );
      if (list.clips[0]?.base && !list.active) break;
      await new Promise((done) => setTimeout(done, 25));
    }
    const clip = list.clips[0]!;
    expect(clip.base).toBeTruthy();
    expect(
      (
        await ownerRequest(port, `${endpoint}/clips/${clip.id}/youtube-audio`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: "https://youtu.be/SYNTHETIC01" }),
        })
      ).status,
    ).toBe(403);
    expect(youtubeAudio).not.toHaveBeenCalled();
    expect(
      (
        await ownerRequest(port, `${endpoint}/clips/${clip.id}/edit`, {
          method: "POST",
          headers: json,
          body: JSON.stringify({
            operationId: randomUUID(),
            expectedRevision: clip.revision,
            baseHash: clip.baseHash,
            operations: [
              { kind: "hook", hook: { startFrame: 30, endFrame: 53 } },
            ],
          }),
        })
      ).status,
    ).toBe(200);
    // The shared hosted allowlist and actual workspace authentication stay closed.
    expect(
      (await ownerRequest(port, `${endpoint}/audio-assets/${randomUUID()}`))
        .status,
    ).toBe(403);
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
    const driver = `globalThis.audioRun=async action=>{
      const wait=async(fn,label)=>{for(let i=0;i<1200;i++){if(fn())return;await new Promise(r=>setTimeout(r,25));}throw new Error('audio_ui_'+label);};
      const button=text=>[...document.querySelectorAll('button,a')].find(n=>n.getClientRects().length&&n.textContent.trim()===text), named=label=>document.querySelector('[aria-label="'+label+'"]');
      const tab=async(root,label)=>{[...document.querySelectorAll('[aria-label="'+root+'"] [role=tab]')].find(n=>n.textContent===label||n.textContent.startsWith(label+' (')).click();await new Promise(requestAnimationFrame);};
      const set=async(label,value)=>{const n=named(label),type=n.tagName==='SELECT'?HTMLSelectElement:HTMLInputElement;Object.getOwnPropertyDescriptor(type.prototype,'value').set.call(n,value);n.dispatchEvent(new Event(n.tagName==='SELECT'?'change':'input',{bubbles:true}));await new Promise(r=>setTimeout(r,60));};
      await wait(()=>document.querySelector('.editor-panels:not([hidden])'),'ready');
      if(action==='library'){await tab('Clip settings','Media');await tab('Media controls','Audio');await tab('Audio views','Sound library');document.querySelector('.audio-inspector').scrollIntoView({block:'start'});await new Promise(r=>setTimeout(r,180));
        const frame=document.querySelector('#sample-main').getBoundingClientRect(),footer=document.querySelector('#sample-main > footer').getBoundingClientRect();
        if(footer.bottom>innerHeight+1||footer.top<0||document.documentElement.scrollWidth>innerWidth||[...document.querySelectorAll('.sound-card')].some(n=>n.getBoundingClientRect().right>frame.right))throw new Error('audio_layout');
      }
      if(action==='audition-ready'){const n=document.querySelector('.audio-inspector > audio');globalThis.auditions=0;n.addEventListener('play',()=>globalThis.auditions++);const r=named('Preview Discord notification').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};}
      if(action==='audition-check'){await wait(()=>globalThis.auditions===1,'audition');const n=document.querySelector('.audio-inspector > audio');await wait(()=>n.duration===.5,'discord_decoded');if(button('Apply changes'))throw new Error('audition_changed_edit');}
      if(action==='anchors'){
        await tab('Clip settings','Media');await tab('Media controls','Audio');await tab('Audio views','Your audio');
        await wait(()=>document.querySelector('.audio-inspector').textContent.includes('At visual start · 1.00s'),'visual_anchor');
        if(button('Apply changes'))throw new Error('auto_sound_dirty');
        await set('Added audio volume','12');await wait(()=>button('Apply changes'),'volume_dirty');
        if(named('Added audio volume').value!=='12')throw new Error('cue_volume');
        button('Discard changes').click();await wait(()=>!button('Apply changes')&&named('Added audio volume').value==='35','volume_discard');
        button('Edit timing').click();await wait(()=>named('Sound start seconds'),'detached');await set('Sound start seconds','.5');
        button('Discard changes').click();await wait(()=>!button('Apply changes')&&!named('Sound start seconds'),'anchor_restore');
        document.querySelector('.audio-settings').scrollIntoView({block:'center'});await new Promise(requestAnimationFrame);
        const footer=document.querySelector('#sample-main > footer').getBoundingClientRect();if(footer.bottom>innerHeight+1||document.documentElement.scrollWidth>innerWidth)throw new Error('anchor_layout');
      }
      if(action==='remove-accent'){
        button('Remove sound').click();await wait(()=>button('Apply changes'));button('Apply changes').click();await wait(()=>!button('Apply changes')&&document.querySelector('.audio-inspector').textContent.includes('No added audio.'),'remove_accent');
      }
      if(action==='discard'){
        for(let i=0;i<12;i++){await tab('Audio views','Sound library');named('Add Vine boom').click();await new Promise(r=>setTimeout(r,30));}
        await wait(()=>[...document.querySelectorAll('audio')].filter(n=>n.src.startsWith('blob:')&&!n.closest('.audio-inspector')).length===12,'twelve_simultaneous_tracks');
        if(button('Reload preview')||document.body.textContent.includes('Preview unavailable'))throw new Error('track_capacity');
        await wait(()=>button('Apply changes'),'dirty');button('Discard changes').click();await wait(()=>!button('Apply changes'),'discard');
      }
      if(action==='upload-bad'||action==='upload-good'||action==='upload-cancel'){
        await tab('Audio views','Sound library');const n=named('Upload audio'),transfer=new DataTransfer();
        const bytes=action==='upload-bad'?new Uint8Array([1,2,3]):Uint8Array.from(atob('${(await readFile(wave)).toString("base64")}'),c=>c.charCodeAt(0));
        transfer.items.add(new File([bytes],'synthetic.wav',{type:'audio/wav'}));n.files=transfer.files;n.dispatchEvent(new Event('change',{bubbles:true}));
        if(action==='upload-cancel'){
          await wait(()=>button('Cancel upload'),'cancel_ready');const footer=document.querySelector('#sample-main > footer').getBoundingClientRect();if(footer.height>76||footer.bottom>innerHeight+1)throw new Error('upload_footer');
          button('Cancel upload').click();await wait(()=>!button('Cancel upload'),'canceled');
        }
        else if(action==='upload-bad')await wait(()=>document.querySelector('.clip-editor > .flow-notice')?.textContent.includes('Couldn’t add this audio'),'upload_failure');
        else await wait(()=>button('Apply changes')&&document.querySelector('.audio-cue')&&!button('Uploading…'),'uploaded');
      }
      if(action==='add-hook-sound'){await tab('Audio views','Sound library');if(named('Add Sator suspense'))throw new Error('retired_sator_visible');named('Add Vine boom').click();await wait(()=>button('Apply changes'),'hook_sound');await set('Audio placement','hook');button('Apply changes').click();await wait(()=>!button('Apply changes')&&!named('Audio placement').matches(':disabled'),'apply');}
      if(action==='add-discord'){await tab('Audio views','Sound library');named('Add Discord notification').click();await wait(()=>button('Apply changes'),'discord_added');if(named('Audio placement').value!=='clip'||named('Added audio volume').value!=='35')throw new Error('discord_defaults');await set('Added audio volume','42');button('Apply changes').click();await wait(()=>!button('Apply changes')&&!named('Audio placement').matches(':disabled'),'discord_saved');}
      if(action==='cue-preview-ready'){
        await tab('Clip settings','Focus');await tab('Focus controls','Camera');await tab('Camera controls','Advanced');await set('Focus playhead seconds','1.5');
        await tab('Clip settings','Media');await tab('Media controls','Audio');await tab('Audio views','Your audio');
        [...document.querySelectorAll('.audio-cue')].find(n=>n.textContent.includes('Vine boom')).click();await new Promise(requestAnimationFrame);
        const preview=button('Preview in clip');await wait(()=>preview&&!preview.matches(':disabled'),'cue_preview_ready');preview.scrollIntoView({block:'center'});await new Promise(requestAnimationFrame);
        preview.addEventListener('click',()=>{globalThis.cueContext=new AudioContext();void globalThis.cueContext.resume();},{once:true});
        const r=preview.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};
      }
      if(action==='cue-energy-check'){
        const context=globalThis.cueContext;let stream,node,analyser;
        try{
          await wait(()=>context?.state==='running','audio_context');
          const track=()=>[...document.querySelectorAll('.editor-preview audio')].find(n=>n.src.startsWith('blob:')&&n.duration>1.2&&n.duration<1.3&&!n.paused);
          await wait(()=>track(),'hook_track_playing');const element=track();if(element.muted||element.volume<.05)throw new Error('hook_track_muted');
          stream=element.captureStream();if(!stream.getAudioTracks().length)throw new Error('no_rendered_audio');node=context.createMediaStreamSource(stream);analyser=context.createAnalyser();analyser.fftSize=2048;node.connect(analyser);
          const samples=new Float32Array(analyser.fftSize),energy=()=>{analyser.getFloatTimeDomainData(samples);return Math.sqrt(samples.reduce((sum,value)=>sum+value*value,0)/samples.length);};
          let peak=0;for(let tick=0;tick<16;tick++){await new Promise(r=>setTimeout(r,20));peak=Math.max(peak,energy());}
          await wait(()=>{const body=document.querySelector('.editor-preview video[data-editor-video="body"][data-editor-active="true"]');return body&&body.readyState>=2&&!body.seeking&&body.currentTime>.1;},'body_after_hook');await new Promise(r=>setTimeout(r,80));const after=energy();named('Pause video')?.click();return {peak,after};
        }finally{node?.disconnect();analyser?.disconnect();stream?.getTracks().forEach(track=>track.stop());await context?.close();delete globalThis.cueContext;}
      }
      if(action==='play-ready'){const r=named('Play video').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};}
      if(action==='youtube-open'){
        await tab('Audio views','Sound library');await wait(()=>button('From YouTube')&&!button('From YouTube').matches(':disabled'),'youtube_available');button('From YouTube').click();await wait(()=>named('YouTube audio URL')&&button('Download sound')&&!button('Export clip'),'youtube_form');
        if(![...document.querySelectorAll('#sample-main > footer button')].some(n=>n.textContent==='Download sound'))throw new Error('youtube_footer');
      }
      if(action==='youtube-layout'){
        named('YouTube audio URL').scrollIntoView({block:'center'});await new Promise(requestAnimationFrame);
        const footer=document.querySelector('#sample-main > footer').getBoundingClientRect(),input=named('YouTube audio URL').getBoundingClientRect();
        if(footer.top<0||footer.bottom>innerHeight+1||input.left<0||input.right>innerWidth+1||document.documentElement.scrollWidth>innerWidth)throw new Error('youtube_layout');
      }
      if(action==='youtube-cancel'){
        button('Cancel import').click();await wait(()=>named('YouTube audio URL')&&!button('Cancel import'),'youtube_canceled');
      }
      if(action==='youtube-invalid'||action==='youtube-pending'||action==='youtube-fail'||action==='youtube-good'){
        await set('YouTube audio URL',action==='youtube-invalid'?'https://example.invalid/sound':'https://youtu.be/SYNTHETIC01');button('Download sound').click();
        if(action==='youtube-pending')await wait(()=>button('Cancel import'),'youtube_pending');
        else if(action==='youtube-good'){await wait(()=>!named('YouTube audio URL')&&button('Apply changes'),'youtube_added');button('Apply changes').click();await wait(()=>!button('Apply changes'),'youtube_saved');}
        else await wait(()=>named('YouTube audio URL')&&!button('Cancel import')&&document.querySelector('.clip-editor > .flow-notice')?.textContent.includes('Couldn’t import this sound'),'youtube_error');
      }
      if(action==='play-check'){
        const tracks=()=>[...document.querySelectorAll('audio')].filter(n=>!n.closest('.audio-inspector')&&(n.src.startsWith('blob:')||n.src.includes('/audio-assets/')));
        await wait(()=>named('Pause video'),'playing');await wait(()=>tracks().some(n=>!n.paused&&n.currentTime>.03),'added_audio_playing');
        named('Mute sound').click();await wait(()=>tracks().every(n=>n.muted||n.volume===0),'mute_all');named('Unmute sound').click();
        named('Pause video').click();await new Promise(r=>setTimeout(r,100));if(tracks().some(n=>!n.paused))throw new Error('added_audio_not_paused');
        await tab('Clip settings','Focus');await tab('Focus controls','Camera');await tab('Camera controls','Advanced');await set('Focus playhead seconds','1.5');
        await wait(()=>Math.abs(document.querySelector('.editor-preview video').currentTime-1.5)<.08,'video_seek');
        await wait(()=>tracks().some(n=>n.src.includes('/audio-assets/')&&n.currentTime>.18&&n.currentTime<.38),'music_seek_phase');
        if(tracks().some(n=>!n.paused))throw new Error('seek_started_audio');
      }
      if(action==='tracks'){[...document.querySelectorAll('[aria-label="Audio views"] button')].find(n=>n.textContent.startsWith('Your audio')).click();await new Promise(requestAnimationFrame);document.querySelector('.audio-inspector').scrollIntoView({block:'start'});await new Promise(r=>setTimeout(r,180));}
      if(action==='discord-restored'){await tab('Audio views','Your audio');const cue=[...document.querySelectorAll('.audio-cue')].find(n=>n.textContent.includes('Discord notification'));if(!cue)throw new Error('discord_not_restored');cue.click();await new Promise(requestAnimationFrame);if(named('Added audio volume').value!=='42')throw new Error('discord_volume_not_restored');}
      if(action==='export'){button('Export clip').click();await wait(()=>named('Download clip'),'export');}
      return {x:0,y:0};
    };`;
    await page._client().send("Runtime.evaluate", { expression: driver });
    const run = async (action: string) => {
      const result = await page._client().send("Runtime.evaluate", {
        expression: `globalThis.audioRun(${JSON.stringify(action)})`,
        awaitPromise: true,
        returnByValue: true,
      });
      if (result.value.exceptionDetails)
        throw new Error(JSON.stringify(result.value.exceptionDetails));
      return result.value.result.value;
    };
    const click = async (position: { x: number; y: number }) => {
      await page._client().send("Input.dispatchMouseEvent", {
        type: "mousePressed",
        ...position,
        button: "left",
        clickCount: 1,
      });
      await page._client().send("Input.dispatchMouseEvent", {
        type: "mouseReleased",
        ...position,
        button: "left",
        clickCount: 1,
      });
    };
    for (const width of [1440, 390]) {
      await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
      await run("anchors");
      const shot = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await mkdir(resolve(".local-build/evidence"), { recursive: true });
      await writeFile(
        resolve(`.local-build/evidence/cl138-anchor-${width}.png`),
        Buffer.from(shot.value.data, "base64"),
      );
    }
    await run("remove-accent");
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await run("library");
    await click(await run("audition-ready"));
    await run("audition-check");
    await run("discard");
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await run("library");
    holdAudio = true;
    await run("upload-cancel");
    for (let i = 0; i < 200 && canceledUploads === 0; i++)
      await new Promise((done) => setTimeout(done, 10));
    expect(canceledUploads).toBe(1);
    await run("upload-bad");
    await run("upload-good");
    await run("add-hook-sound");
    await click(await run("cue-preview-ready"));
    const energy = await run("cue-energy-check");
    expect(energy.peak).toBeGreaterThan(0.003);
    expect(energy.after).toBeLessThan(0.001);
    await run("add-discord");
    await run("youtube-open");
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    for (const width of [1440, 834, 390, 320]) {
      await page.setViewport({
        width,
        height: width === 320 ? 568 : 900,
        deviceScaleFactor: 1,
      });
      await run("youtube-layout");
      const youtubeShot = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        resolve(`.local-build/evidence/cl139-youtube-audio-${width}.png`),
        Buffer.from(youtubeShot.value.data, "base64"),
      );
    }
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await run("youtube-invalid");
    expect(youtubeAudio).not.toHaveBeenCalled();
    holdYoutube = true;
    await run("youtube-pending");
    for (
      let index = 0;
      index < 200 && youtubeAudio.mock.calls.length === 0;
      index++
    )
      await new Promise((done) => setTimeout(done, 10));
    expect(youtubeAudio).toHaveBeenCalledTimes(1);
    expect(
      (
        await ownerRequest(port, `${endpoint}/clips/${clip.id}/youtube-audio`, {
          method: "POST",
          headers: json,
          body: JSON.stringify({ url: "https://youtu.be/SYNTHETIC01" }),
        })
      ).status,
    ).toBe(409);
    expect(youtubeAudio).toHaveBeenCalledTimes(1);
    await run("youtube-cancel");
    for (let index = 0; index < 200 && canceledYoutube === 0; index++)
      await new Promise((done) => setTimeout(done, 10));
    expect(canceledYoutube).toBe(1);
    failYoutube = true;
    await run("youtube-fail");
    await run("youtube-good");
    // Capture/inspect actual Audio library and controls at all relevant geometries.
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 834, height: 1194 },
      { width: 390, height: 844 },
      { width: 320, height: 568 },
    ]) {
      await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
      await run("library");
      const shot = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        resolve(`.local-build/evidence/cl133-library-${viewport.width}.png`),
        Buffer.from(shot.value.data, "base64"),
      );
      await run("tracks");
      const controls = await page
        ._client()
        .send("Page.captureScreenshot", { format: "png", fromSurface: true });
      await writeFile(
        resolve(`.local-build/evidence/cl133-tracks-${viewport.width}.png`),
        Buffer.from(controls.value.data, "base64"),
      );
    }
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page._client().send("Runtime.evaluate", {
      expression:
        "document.querySelector('.editor-preview').scrollIntoView({block:'start'})",
    });
    await click(await run("play-ready"));
    await run("play-check");
    await run("export");
    const final = ownerClipListSchema.parse(
      JSON.parse(
        (
          await ownerRequest(port, `${endpoint}/clips`, { headers: auth })
        ).body.toString(),
      ),
    );
    expect(final.clips[0]!.edit!.audio!.cues).toHaveLength(4);
    expect(final.clips[0]!.edit!.audio!.cues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: { kind: "builtin", id: "discord" },
          volume: 42,
          loop: false,
          placement: "clip",
        }),
      ]),
    );
    expect(final.clips[0]!.audioAssets).toHaveLength(2);
    expect(final.clips[0]!.outputs.at(-1)!.frames).toBe(113);
    await page.goto({ url: `http://localhost:${port}/`, timeout: 10000 });
    await page._client().send("Runtime.evaluate", { expression: driver });
    await run("library");
    await run("discord-restored");
    expect(
      media.mock.calls.filter(([job]) => job.operation === "normalize-audio"),
    ).toHaveLength(4);
    expect(youtubeAudio).toHaveBeenCalledTimes(3);
    expect(image).toHaveBeenCalledTimes(1);
    expect(plan).toHaveBeenCalledTimes(1);
    expect(select).not.toHaveBeenCalled();
  } finally {
    await browser?.close({ silent: true });
    await host.close();
    await worker.close();
    await cleanAudioEditor(directory);
  }
}, 190000);
