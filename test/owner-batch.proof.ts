import { expect, it } from "vitest";
import { join, resolve } from "node:path";
import { mkdtemp, mkdir, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { createOwnerHost } from "../apps/backend/owner/server.ts";
import { fakeOwnerAnalysis } from "../apps/backend/owner/fake-analysis.ts";
import { fakeOwnerClipPreparation } from "../apps/backend/owner/fake-clips.ts";
import { createOwnerWorker } from "../apps/renderer/owner/server.ts";
import { ownerNativeTools } from "../apps/renderer/owner/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { ownerWorkspaceSchema } from "../packages/contracts/owner/index.ts";
import { ownerAnalysisSchema } from "../packages/contracts/owner/selection.ts";
import {
  ownerClipListSchema,
  type OwnerClipList,
} from "../packages/contracts/owner/clips.ts";
import { listenOwner, ownerRequest } from "./owner-http.ts";
import { localWorkerPort } from "../apps/backend/owner/worker-port.ts";
import { ownerClipMediaPath } from "../apps/renderer/owner/media.ts";

it("makes three independent caption/picture MP4s locally, re-exports without AI and preserves their common source", async () => {
  const tools = await ownerNativeTools(resolve(".")),
    directory = await mkdtemp(join(tmpdir(), "clipbuilder-owner-batch-proof-")),
    root = join(directory, "workspaces");
  await mkdir(root);
  const worker = createOwnerWorker({
    root,
    token: "proof-worker",
    tools,
    chromium: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    overlayBundle: resolve(".owner-build/overlay"),
  });
  const workerPort = await listenOwner(worker.server),
    signal = AbortSignal.timeout(150_000);
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
    ui: directory,
    port: 0,
    token: "proof-host",
    analysis: fakeOwnerAnalysis,
    clipPreparation: fakeOwnerClipPreparation,
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
  const port = await listenOwner(host.server),
    auth = { Authorization: "Bearer proof-host" },
    json = { ...auth, "Content-Type": "application/json" };
  try {
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
        "color=c=blue:size=160x90:rate=30:duration=16,drawbox=color=green:t=fill:enable='gte(t,2)',drawbox=color=red:t=fill:enable='gte(t,10)'",
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=440:sample_rate=48000:duration=16",
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
    const analyzed = await ownerRequest(port, `${endpoint}/analysis`, {
      method: "POST",
      headers: json,
      body: JSON.stringify({
        sourceRevision: 0,
        policyRevision: 1,
        ranges: [
          { id: crypto.randomUUID(), startMs: 200, endMs: 1200 },
          { id: crypto.randomUUID(), startMs: 2000, endMs: 4000 },
        ],
        aiDuration: { minMs: 10_000, maxMs: 10_000 },
        manualOnly: false,
      }),
    });
    expect(analyzed.status).toBe(200);
    const analysis = ownerAnalysisSchema.parse(
      JSON.parse(analyzed.body.toString()),
    );
    expect(analysis.fakeCalls).toEqual({ transcription: 1, selection: 1 });
    const body = JSON.stringify({
      operationId: crypto.randomUUID(),
      analysisId: analysis.id,
      sourceRevision: 0,
      policyRevision: 1,
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
    expect(picture[0]).toBeGreaterThan(100);
    expect(picture[1]).toBeLessThan(100);
    const captions = await luma(
      aiFile,
      "eq(n,0)+eq(n,59)",
      "crop=920:200:80:1500",
    );
    expect(captions[0]).toBeGreaterThan(20);
    expect(captions[1]).toBeLessThan(18);
    for (const clip of result.clips) {
      expect(clip.fakeCalls).toEqual({ plan: 1, image: 1, render: 1 });
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
    const clip = result.clips[0]!;
    expect(
      (
        await ownerRequest(port, `${endpoint}/clips/${clip.id}/render`, {
          method: "POST",
          headers: json,
          body: JSON.stringify({
            operationId: crypto.randomUUID(),
            expectedRevision: 0,
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
      (await ownerRequest(port, `${endpoint}/source`, { headers: auth })).body,
    ).toEqual(await readFile(input));
  } finally {
    await host.close();
    await worker.close();
    expect(await readdir(root)).toEqual([]);
    expect(host.server.listening).toBe(false);
    expect(worker.server.listening).toBe(false);
    await rm(directory, { recursive: true, force: true });
  }
}, 160_000);
