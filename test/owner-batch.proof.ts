import { expect, it } from "vitest";
import { join, resolve } from "node:path";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { createOwnerHost } from "../apps/backend/local/server.ts";
import { fakeOwnerAnalysis } from "../apps/backend/local/fake-analysis.ts";
import { fakeOwnerClipPreparation } from "../apps/backend/local/fake-clips.ts";
import { createOwnerWorker } from "../apps/renderer/local/server.ts";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { ownerWorkspaceSchema } from "../packages/contracts/local/index.ts";
import { ownerAnalysisSchema } from "../packages/contracts/local/selection.ts";
import {
  ownerClipListSchema,
  type OwnerClipList,
} from "../packages/contracts/local/clips.ts";
import { listenOwner, ownerRequest } from "./owner-http.ts";
import { localWorkerPort } from "../apps/backend/local/worker-port.ts";
import { ownerClipMediaPath } from "../apps/renderer/local/media.ts";
import { OWNER_CAPTION_PRESETS } from "../packages/contracts/local/editor.ts";
import { ownerDraftStatusSchema } from "../packages/contracts/local/drafts.ts";
import { ownerPickedFileResultSchema } from "../packages/contracts/local/drafts.ts";
import {
  executeOwnerAgentCommand,
  type OwnerAgentPorts,
} from "../apps/backend/local/agent-client.ts";
import type { OwnerAgentCommand } from "../packages/contracts/local/agent.ts";
import { sampleOwnerResources } from "./owner-resource-sampler.ts";
import {
  reviewOwnerControls,
  prepareLocalControlsFixture,
  prepareLocalOverlayFixture,
  reviewFreshLocalFlow,
} from "./owner-controls-browser.ts";

it("makes three independent caption/picture MP4s locally, re-exports without AI and preserves their common source", async () => {
  const tools = await ownerNativeTools(resolve(".")),
    directory = await mkdtemp(join(tmpdir(), "clipbuilder-owner-batch-proof-")),
    root = join(directory, "workspaces");
  await mkdir(root);
  let resources: Awaited<ReturnType<typeof sampleOwnerResources>> | undefined;
  let completed = false;
  let cancellationMs: number | null = null;
  let transcriptions = 0,
    selections = 0,
    plans = 0,
    pictures = 0;
  const worker = createOwnerWorker({
    root,
    token: "proof-worker",
    tools,
    chromium: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    overlayBundle: await prepareLocalOverlayFixture(directory),
  });
  const workerPort = await listenOwner(worker.server),
    signal = AbortSignal.timeout(240_000);
  let nativeCalls = 0,
    inFlight = 0,
    peak = 0;
  const transport: typeof fetch = async (input, init) => {
    const url = new URL(String(input));
    if (
      url.origin !== `http://127.0.0.1:${workerPort}` ||
      (init?.body !== undefined && typeof init.body !== "string")
    )
      throw new Error("invalid_proof_transport");
    const response = await ownerRequest(workerPort, url.pathname, {
      method: init?.method ?? "GET",
      headers: Object.fromEntries(new Headers(init?.headers)),
      ...(typeof init?.body === "string" ? { body: init.body } : {}),
    });
    return new Response(
      response.status === 204 ? null : response.body.toString("utf8"),
      { status: response.status },
    );
  };
  const workerRpc = localWorkerPort(workerPort, "proof-worker", transport);
  const host = createOwnerHost({
    root,
    ui: await prepareLocalControlsFixture(directory),
    storageRoot: join(directory, "library"),
    port: 0,
    token: "a".repeat(64),
    analysis: {
      ...fakeOwnerAnalysis,
      async transcribe(...args) {
        transcriptions++;
        return fakeOwnerAnalysis.transcribe(...args);
      },
      async select(...args) {
        selections++;
        return fakeOwnerAnalysis.select(...args);
      },
    },
    clipPreparation: {
      ...fakeOwnerClipPreparation,
      async plan(...args) {
        plans++;
        return fakeOwnerClipPreparation.plan(...args);
      },
      async image(...args) {
        pictures++;
        return fakeOwnerClipPreparation.image(...args);
      },
    },
    media: async (job, requestSignal) => {
      nativeCalls++;
      inFlight++;
      peak = Math.max(peak, inFlight);
      try {
        return await workerRpc(job, AbortSignal.any([requestSignal, signal]));
      } finally {
        inFlight--;
      }
    },
  });
  host.server.prependListener("request", (request) => {
    if (request.url?.startsWith("/api/local/"))
      request.url = request.url.replace("/api/local/", "/api/");
  });
  const port = await listenOwner(host.server),
    auth = { Authorization: `Bearer ${"a".repeat(64)}` },
    json = { ...auth, "Content-Type": "application/json" };
  try {
    resources = await sampleOwnerResources(directory);
    const input = join(directory, "synthetic.mp4");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-f",
        "lavfi",
        "-i",
        "color=c=blue:size=160x90:rate=30:duration=61,drawbox=color=green:t=fill:enable='gte(t,2)',drawbox=color=red:t=fill:enable='gte(t,10)'",
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=440:sample_rate=48000:duration=61",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-threads",
        "2",
        input,
      ],
      signal,
    );
    const uploaded = await ownerRequest(port, "/api/source", {
      method: "POST",
      headers: { ...auth, "Content-Type": "video/mp4" },
      body: await readFile(input),
    });
    expect(uploaded.status).toBe(200);
    const workspace = ownerWorkspaceSchema.parse(
        JSON.parse(uploaded.body.toString()),
      ),
      endpoint = `/api/workspace/${workspace.id}`;
    for (const [index, bounds] of [
      { minMs: 30_000, maxMs: 30_000 },
      { minMs: 60_000, maxMs: 60_000 },
      { minMs: 20_000, maxMs: 40_000 },
    ].entries()) {
      const response = await ownerRequest(port, `${endpoint}/analysis`, {
        method: "POST",
        headers: json,
        body: JSON.stringify({
          sourceRevision: 0,
          policyRevision: index + 1,
          ranges: [
            { id: crypto.randomUUID(), startMs: 200, endMs: 1200 },
            { id: crypto.randomUUID(), startMs: 2000, endMs: 4000 },
          ],
          aiDuration: bounds,
          manualOnly: false,
        }),
      });
      expect(response.status).toBe(200);
      const result = ownerAnalysisSchema.parse(
        JSON.parse(response.body.toString()),
      );
      expect(result.manual.map((moment) => moment.cut)).toEqual([
        { startFrame: 6, endFrame: 36 },
        { startFrame: 60, endFrame: 120 },
      ]);
      expect(result.suggestions.length).toBeGreaterThan(0);
      for (const moment of result.suggestions) {
        const frames = moment.cut.endFrame - moment.cut.startFrame;
        expect(frames).toBeGreaterThanOrEqual((bounds.minMs * 30) / 1000);
        expect(frames).toBeLessThanOrEqual((bounds.maxMs * 30) / 1000);
      }
    }
    const analyzed = await ownerRequest(port, `${endpoint}/analysis`, {
      method: "POST",
      headers: json,
      body: JSON.stringify({
        sourceRevision: 0,
        policyRevision: 4,
        ranges: [
          { id: crypto.randomUUID(), startMs: 200, endMs: 1200 },
          { id: crypto.randomUUID(), startMs: 2000, endMs: 4000 },
        ],
        aiDuration: { minMs: 10_000, maxMs: 10_000 },
        aiCount: 5,
        manualOnly: false,
      }),
    });
    expect(analyzed.status).toBe(200);
    const analysis = ownerAnalysisSchema.parse(
      JSON.parse(analyzed.body.toString()),
    );
    expect(analysis.calls).toEqual({ transcription: 1, selection: 1 });
    expect(analysis.suggestions).toHaveLength(5);
    const body = JSON.stringify({
      operationId: crypto.randomUUID(),
      analysisId: analysis.id,
      sourceRevision: 0,
      policyRevision: 4,
      momentIds: [...analysis.manual, analysis.suggestions[0]!].map(
        (moment) => moment.id,
      ),
    });
    const submitted = await ownerRequest(port, `${endpoint}/clips`, {
      method: "POST",
      headers: json,
      body,
    });
    expect(submitted.status).toBe(202);
    expect(
      (await ownerRequest(port, endpoint, { method: "DELETE", headers: auth }))
        .status,
    ).toBe(409);
    let reviewDuringWork = false;
    async function waitForClips() {
      let result: OwnerClipList | undefined;
      for (let n = 0; n < 600; n++) {
        const response = await ownerRequest(port, `${endpoint}/clips`, {
          headers: auth,
        });
        result = ownerClipListSchema.parse(
          JSON.parse(response.body.toString()),
        );
        const ready = result.clips.find((clip) => clip.outputs.length > 0);
        if (result.active && ready && !reviewDuringWork) {
          expect(
            (
              await ownerRequest(
                port,
                `${endpoint}/clips/${ready.id}/output/0`,
                { headers: auth },
              )
            ).status,
          ).toBe(200);
          reviewDuringWork = true;
        }
        if (!result.active) return result;
        await new Promise((done) => setTimeout(done, 150));
      }
      throw new Error(
        `synthetic_batch_timeout:${result?.clips.map((clip) => clip.state).join(",")}`,
      );
    }
    const result = await waitForClips();
    expect(reviewDuringWork).toBe(true);
    expect(result.clips.map((clip) => clip.state)).toEqual([
      "ready",
      "ready",
      "ready",
    ]);
    expect(result.clips.map((clip) => clip.outputs[0]?.frames)).toEqual([
      30, 60, 300,
    ]);
    expect(peak).toBe(1);
    async function luma(file: string, selected: string, crop: string) {
      const pixels = await runOwnedProcess(
        tools.ffmpeg,
        [
          "-nostdin",
          "-v",
          "error",
          "-i",
          file,
          "-vf",
          `select='${selected}',${crop},signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-`,
          "-an",
          "-f",
          "null",
          "-",
        ],
        signal,
      );
      return [...pixels.matchAll(/lavfi\.signalstats\.YAVG=([\d.]+)/g)].map(
        (match) => Number(match[1]),
      );
    }
    const firstRaw = await luma(
      await ownerClipMediaPath(
        root,
        workspace.id,
        result.clips[0]!.id,
        "source",
      ),
      "eq(n,0)",
      "crop=8:8:536:956",
    );
    const secondRaw = await luma(
      await ownerClipMediaPath(
        root,
        workspace.id,
        result.clips[1]!.id,
        "source",
      ),
      "eq(n,0)",
      "crop=8:8:536:956",
    );
    expect(firstRaw[0]).toBeLessThan(60);
    expect(secondRaw[0]).toBeGreaterThan(70);
    const aiFile = await ownerClipMediaPath(
      root,
      workspace.id,
      result.clips[2]!.id,
      0,
    );
    const picture = await luma(aiFile, "eq(n,0)+eq(n,150)", "crop=8:8:536:956");
    const aiSource = await ownerClipMediaPath(
      root,
      workspace.id,
      result.clips[2]!.id,
      "source",
    );
    const rawPicture = await luma(
      aiSource,
      "eq(n,0)+eq(n,150)",
      "crop=8:8:536:956",
    );
    expect(Math.abs(picture[0]! - rawPicture[0]!)).toBeGreaterThan(10);
    expect(Math.abs(picture[1]! - rawPicture[1]!)).toBeLessThan(3);
    const captions = await luma(
      aiFile,
      "eq(n,0)+eq(n,59)",
      "crop=920:200:80:1500",
    );
    const rawCaptions = await luma(
      aiSource,
      "eq(n,0)+eq(n,59)",
      "crop=920:200:80:1500",
    );
    expect(captions).toHaveLength(2);
    for (let index = 0; index < 2; index++)
      expect(captions[index]! - rawCaptions[index]!).toBeGreaterThan(1);
    for (const clip of result.clips) {
      expect(clip.calls).toEqual({ plan: 1, image: 1, render: 1 });
      const output = await ownerRequest(
        port,
        `${endpoint}/clips/${clip.id}/output/0`,
        { headers: auth },
      );
      expect(output.status).toBe(200);
      expect(output.body.length).toBeGreaterThan(1000);
      const raw = await ownerRequest(
        port,
        `${endpoint}/clips/${clip.id}/source`,
        { headers: auth },
      );
      expect(raw.status).toBe(200);
    }
    expect(
      (
        await ownerRequest(port, `${endpoint}/clips`, {
          method: "POST",
          headers: json,
          body,
        })
      ).status,
    ).toBe(202);
    expect(nativeCalls).toBe(4);
    expect([transcriptions, selections, plans, pictures]).toEqual([4, 4, 3, 3]);
    const clip = result.clips[0]!;
    const oldOutput = (
      await ownerRequest(port, `${endpoint}/clips/${clip.id}/output/0`, {
        headers: auth,
      })
    ).body;
    const pictureInput = join(directory, "synthetic-picture.jpg");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-f",
        "lavfi",
        "-i",
        "color=c=white:s=640x360",
        "-frames:v",
        "1",
        "-update",
        "1",
        pictureInput,
      ],
      signal,
    );
    const imported = await ownerRequest(
      port,
      `${endpoint}/clips/${clip.id}/picture`,
      {
        method: "POST",
        headers: { ...auth, "Content-Type": "image/jpeg" },
        body: await readFile(pictureInput),
      },
    );
    expect(imported.status).toBe(200);
    const importedClips = ownerClipListSchema.parse(
      JSON.parse(imported.body.toString()),
    );
    const asset = importedClips.clips[0]!.assets.find(
      (asset) => asset.origin === "owner-supplied",
    )!;
    const cue = clip.edit!.visuals[0]!;
    const style = {
      ...OWNER_CAPTION_PRESETS.bold,
      font: "Georgia" as const,
      fontSize: 90,
      animation: "pop" as const,
      color: "#00ffff",
      highlight: "#552255",
      box: { ...OWNER_CAPTION_PRESETS.bold.box, y: 0.2 },
    };
    const edited = await ownerRequest(
      port,
      `${endpoint}/clips/${clip.id}/edit`,
      {
        method: "POST",
        headers: json,
        body: JSON.stringify({
          operationId: crypto.randomUUID(),
          expectedRevision: 0,
          baseHash: clip.baseHash,
          operations: [
            { kind: "caption", style },
            { kind: "video-look", look: { preset: "mono", strength: 100 } },
            {
              kind: "visual-upsert",
              cue: {
                ...cue,
                assetId: asset.id,
                startFrame: 0,
                endFrame: 30,
                box: { x: 0.1, y: 0.4, width: 0.3, height: 0.1 },
              },
            },
          ],
        }),
      },
    );
    expect(edited.status).toBe(200);
    expect(
      ownerClipListSchema
        .parse(JSON.parse(edited.body.toString()))
        .clips.map((clip) => clip.revision),
    ).toEqual([1, 0, 0]);
    expect(
      (
        await ownerRequest(port, `${endpoint}/clips/${clip.id}/render`, {
          method: "POST",
          headers: json,
          body: JSON.stringify({
            operationId: crypto.randomUUID(),
            expectedRevision: 1,
          }),
        })
      ).status,
    ).toBe(202);
    const rendered = await waitForClips();
    expect(rendered.clips[0]?.outputs.map((output) => output.revision)).toEqual(
      [0, 1],
    );
    expect(nativeCalls).toBe(5);
    expect(
      rendered.clips[0]!.outputs.map((output) => output.editRevision),
    ).toEqual([0, 1]);
    expect(rendered.clips[0]!.calls).toEqual({ plan: 1, image: 1, render: 2 });
    const editedFile = await ownerClipMediaPath(root, workspace.id, clip.id, 1);
    const saturation = await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-i",
        editedFile,
        "-vf",
        "select='eq(n,10)',crop=8:8:700:960,signalstats,metadata=print:key=lavfi.signalstats.SATAVG:file=-",
        "-an",
        "-f",
        "null",
        "-",
      ],
      signal,
    );
    expect(
      Number(/lavfi\.signalstats\.SATAVG=([\d.]+)/u.exec(saturation)?.[1]),
    ).toBeLessThan(2);
    expect(
      (await luma(editedFile, "eq(n,0)", "crop=8:8:266:860"))[0],
    ).toBeGreaterThan(220);
    expect(
      (await luma(editedFile, "eq(n,0)", "crop=920:240:80:384"))[0],
    ).toBeGreaterThan(20);
    expect(
      (await luma(editedFile, "eq(n,0)", "crop=920:200:80:1500"))[0],
    ).toBeLessThan(18);
    expect(
      (
        await ownerRequest(port, `${endpoint}/clips/${clip.id}/output/0`, {
          headers: auth,
        })
      ).body,
    ).toEqual(oldOutput);
    expect(
      (await ownerRequest(port, `${endpoint}/source`, { headers: auth })).body,
    ).toEqual(await readFile(input));
    const save = await ownerRequest(port, `${endpoint}/draft`, {
      method: "POST",
      headers: auth,
    });
    expect(save.status).toBe(200);
    const saved = ownerDraftStatusSchema.parse(
      JSON.parse(save.body.toString()),
    );
    expect(saved.state).toBe("saved");
    expect(
      (await ownerRequest(port, endpoint, { method: "DELETE", headers: auth }))
        .status,
    ).toBe(204);
    const reopen = await ownerRequest(port, `/api/drafts/${saved.id}/open`, {
      method: "POST",
      headers: auth,
    });
    expect(reopen.status).toBe(200);
    const reopened = ownerWorkspaceSchema.parse(
      JSON.parse(reopen.body.toString()),
    );
    expect(reopened.id).not.toBe(workspace.id);
    const restoredEndpoint = `/api/workspace/${reopened.id}`;
    const restored = ownerClipListSchema.parse(
      JSON.parse(
        (
          await ownerRequest(port, `${restoredEndpoint}/clips`, {
            headers: auth,
          })
        ).body.toString(),
      ),
    );
    expect(restored.clips[0]?.edit).toEqual(rendered.clips[0]?.edit);
    expect(restored.clips.map((clip) => clip.calls)).toEqual(
      rendered.clips.map((clip) => clip.calls),
    );
    expect(
      (
        await ownerRequest(
          port,
          `${restoredEndpoint}/clips/${clip.id}/output/0`,
          { headers: auth },
        )
      ).body,
    ).toEqual(oldOutput);
    expect(
      (
        await ownerRequest(
          port,
          `${restoredEndpoint}/clips/${clip.id}/source`,
          { headers: auth },
        )
      ).status,
    ).toBe(200);
    expect(nativeCalls).toBe(5);
    const agentPorts: OwnerAgentPorts = {
      discover: async () => ({ token: "a".repeat(64) }),
      picture: async () => {
        throw new Error("unexpected_picture_read");
      },
      transport: async (request) => {
        const response = await ownerRequest(port, request.path, {
          method: request.method,
          headers: {
            Authorization: `Bearer ${request.token}`,
            ...(request.contentType
              ? { "Content-Type": request.contentType }
              : {}),
          },
          ...(request.body === undefined
            ? {}
            : {
                body: Buffer.isBuffer(request.body)
                  ? request.body
                  : JSON.stringify(request.body),
              }),
        });
        return {
          status: response.status,
          value:
            response.status >= 200 && response.status < 300
              ? JSON.parse(response.body.toString())
              : null,
        };
      },
    };
    const agent = (command: OwnerAgentCommand) =>
      executeOwnerAgentCommand(command, agentPorts, signal);
    const target = { workspaceId: reopened.id, clipId: clip.id };
    const inspection = await agent({ command: "inspect", ...target });
    if (inspection.kind !== "clip") throw new Error("expected_agent_clip");
    expect(inspection.clip.videoLook).toEqual({
      preset: "mono",
      strength: 100,
    });
    expect(inspection.clip.captions).toMatchObject({
      font: "Georgia",
      fontSize: 90,
      animation: "pop",
    });
    const proposed = {
      operationId: crypto.randomUUID(),
      expectedRevision: inspection.clip.revision,
      baseHash: inspection.clip.baseHash!,
      operations: [
        {
          kind: "caption" as const,
          style: {
            ...OWNER_CAPTION_PRESETS.classic,
            box: { ...OWNER_CAPTION_PRESETS.classic.box, y: 0.3 },
          },
        },
        {
          kind: "visual-upsert" as const,
          cue: {
            ...cue,
            assetId: asset.id,
            startFrame: 0,
            endFrame: 30,
            box: { x: 0.55, y: 0.45, width: 0.3, height: 0.1 },
          },
        },
      ],
    };
    const validation = await agent({
      command: "validate",
      ...target,
      request: proposed,
    });
    if (validation.kind !== "validation")
      throw new Error("expected_validation");
    expect(nativeCalls).toBe(5);
    const applied = await agent({
      command: "apply",
      ...target,
      request: proposed,
    });
    if (applied.kind !== "clip") throw new Error("expected_agent_clip");
    expect(applied.clip.revision).toBe(2);
    expect(applied.clip.overlayHash).toBe(validation.validation.overlayHash);
    expect(
      await agent({ command: "apply", ...target, request: proposed }),
    ).toEqual(applied);
    const exportRequest = {
      operationId: crypto.randomUUID(),
      expectedRevision: 2,
    };
    await agent({ command: "render", ...target, request: exportRequest });
    await agent({ command: "render", ...target, request: exportRequest });
    const settledAgent = async () => {
      for (let attempt = 0; attempt < 500; attempt++) {
        signal.throwIfAborted();
        const value = await agent({ command: "inspect", ...target });
        if (value.kind !== "clip") throw new Error("expected_agent_clip");
        if (
          !["queued", "rendering", "canceling", "preparing"].includes(
            value.clip.state,
          )
        )
          return value.clip;
        await new Promise((done) => setTimeout(done, 50));
      }
      throw new Error("agent_native_timeout");
    };
    const agentExport = await settledAgent();
    expect(agentExport.state).toBe("ready");
    expect(agentExport.outputs.map((output) => output.editRevision)).toEqual([
      0, 1, 2,
    ]);
    expect(agentExport.calls).toEqual({ plan: 1, image: 1, render: 3 });
    expect(nativeCalls).toBe(6);
    const agentFile = await ownerClipMediaPath(root, reopened.id, clip.id, 2);
    expect(
      (await luma(agentFile, "eq(n,0)", "crop=8:8:700:900"))[0],
    ).toBeGreaterThan(220);
    expect(
      (await luma(agentFile, "eq(n,0)", "crop=8:8:266:860"))[0],
    ).toBeLessThan(100);
    expect(
      (
        await ownerRequest(
          port,
          `${restoredEndpoint}/clips/${clip.id}/output/0`,
          { headers: auth },
        )
      ).body,
    ).toEqual(oldOutput);
    await agent({
      command: "render",
      ...target,
      request: { operationId: crypto.randomUUID(), expectedRevision: 2 },
    });
    const cancellationStarted = performance.now();
    await agent({ command: "cancel", ...target });
    const canceled = await settledAgent();
    cancellationMs = Math.round(performance.now() - cancellationStarted);
    expect(canceled.state).toBe("canceled");
    expect(canceled.outputs).toEqual(agentExport.outputs);
    expect(canceled.calls.plan).toBe(1);
    expect(canceled.calls.image).toBe(1);
    expect([transcriptions, selections, plans, pictures]).toEqual([4, 4, 3, 3]);
    expect(
      (
        await ownerRequest(port, `${restoredEndpoint}/source`, {
          headers: auth,
        })
      ).body,
    ).toEqual(await readFile(input));
    const beforeReopen = nativeCalls;
    expect(
      (
        await ownerRequest(port, restoredEndpoint, {
          method: "DELETE",
          headers: auth,
        })
      ).status,
    ).toBe(204);
    const pickedVideo = await ownerRequest(port, "/api/open/video", {
      method: "POST",
      headers: { ...auth, "Content-Type": "video/mp4" },
      body: oldOutput,
    });
    expect(pickedVideo.status).toBe(200);
    const picked = ownerPickedFileResultSchema.parse(
      JSON.parse(pickedVideo.body.toString()),
    );
    expect(picked.kind).toBe("draft");
    expect(picked.clipId).toBe(clip.id);
    expect(
      (
        await ownerRequest(
          port,
          `/api/workspace/${picked.workspace.id}/clips/${clip.id}/output/0`,
          { headers: auth },
        )
      ).body,
    ).toEqual(oldOutput);
    expect(nativeCalls).toBe(beforeReopen);
    expect(
      (
        await ownerRequest(port, `/api/workspace/${picked.workspace.id}`, {
          method: "DELETE",
          headers: auth,
        })
      ).status,
    ).toBe(204);
    await reviewOwnerControls(port, {
      id: saved.id!,
      sourceFingerprint: workspace.source.fingerprint,
    });
    expect(nativeCalls).toBe(beforeReopen);
    expect({ transcriptions, selections, plans, pictures }).toEqual({
      transcriptions: 4,
      selections: 4,
      plans: 3,
      pictures: 3,
    });
    const freshSource = join(directory, "synthetic-fresh.mp4");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-f",
        "lavfi",
        "-i",
        "testsrc2=size=160x90:rate=30:duration=6",
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=550:sample_rate=48000:duration=6",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-threads",
        "2",
        freshSource,
      ],
      signal,
    );
    const freshExport = await reviewFreshLocalFlow(
      port,
      await readFile(freshSource),
    );
    const freshOutput = join(directory, "synthetic-fresh-export.mp4");
    await writeFile(freshOutput, freshExport);
    await runOwnedProcess(
      tools.ffmpeg,
      ["-nostdin", "-v", "error", "-i", freshOutput, "-f", "null", "-"],
      signal,
    );
    expect({ transcriptions, selections, plans, pictures }).toEqual({
      transcriptions: 5,
      selections: 4,
      plans: 5,
      pictures: 5,
    });
    completed = true;
  } finally {
    await host.close();
    await worker.close();
    expect(await readdir(root)).toEqual([]);
    expect(host.server.listening).toBe(false);
    expect(worker.server.listening).toBe(false);
    try {
      const measured = await resources?.finish();
      if (measured) {
        await mkdir(resolve(".local-build/evidence"), { recursive: true });
        await writeFile(
          resolve(".local-build/evidence/cl024-batch.json"),
          JSON.stringify({
            ...measured,
            completed,
            nativePeak: peak,
            cancellationMs,
            transcriptions,
            selections,
            plans,
            pictures,
          }),
        );
        if (completed) {
          expect(measured.survivors).toBe(0);
          expect(measured.peaks.ffmpegProcesses).toBeLessThanOrEqual(1);
          expect(measured.samples).toBeGreaterThan(2);
        }
      }
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }
}, 250_000);
