import { vi as captionFixtureMock } from "vitest";
captionFixtureMock.mock("../apps/backend/local/fake-content.ts", () => ({
  FAKE_CAPTIONS_ENABLED: true,
}));
import { loadConfig } from "../apps/backend/src/config/loadConfig.js";
import { expect, it, vi } from "vitest";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { createOwnerHost } from "../apps/backend/local/server.ts";
import { composeOwnerProviders } from "../apps/backend/local/provider-composition.ts";
import { localProviderReadiness } from "../apps/backend/local/provider-readiness.ts";
import { localWorkerPort } from "../apps/backend/local/worker-port.ts";
import { editorContentFixture as fakeOwnerClipPreparation } from "./owner-content-fixture.ts";
import type { GeminiTransport } from "../apps/backend/src/analysis/gemini.adapter.ts";
import { createOwnerWorker } from "../apps/renderer/local/server.ts";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import {
  ownerWorkspaceSchema,
  type OwnerMediaResult,
} from "../packages/contracts/local/index.ts";
import { ownerAnalysisSchema } from "../packages/contracts/local/selection.ts";
import { ownerClipListSchema } from "../packages/contracts/local/clips.ts";
import { OWNER_CAPTION_PRESETS } from "../packages/contracts/local/editor.ts";
import { GENERATED_PICTURE_MODEL } from "../packages/contracts/src/contextual-picture.schema.ts";
import { listenOwner, ownerRequest } from "./owner-http.ts";

it("connects local native provider inputs, injected Gemini-shaped transports and native edit/re-export with no live configuration", async () => {
  expect(process.env.FAKE_MODE).toBe("true");
  expect(process.env.PAID_DEMO_ENABLED).toBe("false");
  expect(process.env.GEMINI_API_KEY).toBeUndefined();
  const tools = await ownerNativeTools(resolve("."));
  const directory = await mkdtemp(
    join(tmpdir(), "clipbuilder-owner-handoff-proof-"),
  );
  const root = join(directory, "workspaces");
  await mkdir(root);
  const signal = AbortSignal.timeout(90_000);
  const worker = createOwnerWorker({
    root,
    tools,
    token: "synthetic-worker",
    chromium: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    overlayBundle: resolve(".local-build/overlay"),
  });
  const workerPort = await listenOwner(worker.server);
  const rpc = localWorkerPort(
    workerPort,
    "synthetic-worker",
    async (input, init) => {
      const url = new URL(String(input));
      if (
        url.origin !== `http://127.0.0.1:${workerPort}` ||
        (init?.body !== undefined && typeof init.body !== "string")
      )
        throw new Error("unexpected_proof_request");
      const response = await ownerRequest(workerPort, url.pathname, {
        method: init?.method ?? "GET",
        headers: Object.fromEntries(new Headers(init?.headers)),
        ...(typeof init?.body === "string" ? { body: init.body } : {}),
      });
      return new Response(
        response.status === 204 ? null : response.body.toString(),
        { status: response.status },
      );
    },
  );
  const receipts: OwnerMediaResult[] = [];
  const media: typeof rpc = async (...args) => {
    const result = await rpc(...args);
    receipts.push(result);
    return result;
  };
  const remote = new Set<string>();
  // These transports return invented data and never instantiate an SDK client.
  const transport = {
    upload: vi.fn<GeminiTransport["upload"]>(async (name, input) => {
      remote.add(name);
      const receipt = receipts.at(-1);
      if (!receipt || !("digest" in receipt))
        throw new Error("missing_native_receipt");
      expect(
        createHash("sha256")
          .update(Buffer.from(await input.arrayBuffer()))
          .digest("hex"),
      ).toBe(receipt.digest);
      return {
        name,
        state: "ACTIVE",
        mimeType: input.type,
        uri: `https://generativelanguage.googleapis.com/v1beta/${name}`,
      };
    }),
    get: vi.fn<GeminiTransport["get"]>(async () => {
      throw new Error("unexpected_poll");
    }),
    transcribe: vi.fn<GeminiTransport["transcribe"]>(async () => ({
      steps: [
        {
          type: "model_output",
          content: [
            {
              annotations: [
                {
                  type: "word_info",
                  text: "Synthetic",
                  start_offset: "0.3s",
                  end_offset: "0.8s",
                  speaker: null,
                },
              ],
            },
          ],
        },
      ],
    })),
    candidates: vi.fn<GeminiTransport["candidates"]>(async () => {
      throw new Error("unexpected_selection");
    }),
    generate: vi.fn<GeminiTransport["generate"]>(
      async (_uri, _signal, task) => {
        expect(task.prompt).toContain('"frames":30');
        expect(task.prompt).toContain('"startMs":100');
        return {
          finished: true,
          text: JSON.stringify({
            pictures: [
              {
                startFrame: 0,
                endFrame: 30,
                evidenceWordIds: ["w_000001"],
                brief: {
                  scene: "A fictional rectangle used for synthetic testing",
                  searchQuery: "synthetic rectangle",
                  requiredTerms: ["rectangle"],
                  avoidTerms: [],
                },
              },
            ],
          }),
        };
      },
    ),
    delete: vi.fn<GeminiTransport["delete"]>(async (name) => {
      remote.delete(name);
    }),
  } satisfies GeminiTransport;
  const pictures = {
    find: vi.fn(async () => {
      // A synthetic raster is wrapped in invented generated-asset metadata.
      const image = await fakeOwnerClipPreparation.image(
        {
          clipId: randomUUID(),
          cue: {
            startFrame: 0,
            endFrame: 1,
            evidenceWordIds: ["w_000001"],
            brief: {
              scene: "Synthetic orange rectangle",
              searchQuery: "rectangle",
              requiredTerms: ["rectangle"],
              avoidTerms: [],
            },
          },
          words: [],
        },
        signal,
      );
      if (!image) throw new Error("synthetic_picture_missing");
      return {
        repository: "google-gemini" as const,
        model: GENERATED_PICTURE_MODEL,
        policy: "contextual-generated-v1" as const,
        width: 640,
        height: 360,
        sha256: createHash("sha256").update(image.bytes).digest("hex"),
        dataUri: `data:image/jpeg;base64,${image.bytes.toString("base64")}`,
      };
    }),
  };
  const readiness = localProviderReadiness(
    loadConfig({
      NODE_ENV: "development",
      APP_ENV: "local",
      FAKE_MODE: "false",
      PAID_DEMO_ENABLED: "true",
      CLOUD_SPEND_APPROVED: "true",
      GEMINI_TRANSFER_APPROVED: "true",
      GEMINI_IMAGE_GENERATION_APPROVED: "true",
      GEMINI_PAID_PROJECT_CONFIRMED: "true",
      GEMINI_API_KEY: "invented-test-key",
    }),
  );
  const host = createOwnerHost({
    root,
    ui: directory,
    token: "synthetic-host",
    port: 0,
    media,
    providers: (files) =>
      composeOwnerProviders(readiness, files, media, { transport, pictures }),
  });
  const port = await listenOwner(host.server);
  const auth = { Authorization: "Bearer synthetic-host" },
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
        "color=blue:s=160x90:r=30:d=6",
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=440:sample_rate=48000:duration=6",
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
    );
    const endpoint = `/api/workspace/${workspace.id}`;
    const analyzed = await ownerRequest(port, `${endpoint}/analysis`, {
      method: "POST",
      headers: json,
      body: JSON.stringify({
        sourceRevision: 0,
        policyRevision: 1,
        ranges: [{ id: randomUUID(), startMs: 200, endMs: 1200 }],
        aiDuration: { minMs: 10_000, maxMs: 10_000 },
        manualOnly: true,
      }),
    });
    expect(analyzed.status).toBe(200);
    const analysis = ownerAnalysisSchema.parse(
      JSON.parse(analyzed.body.toString()),
    );
    expect(analysis.mode).toBe("provider-ai");
    expect(analysis.calls).toEqual({ transcription: 1, selection: 0 });
    expect(analysis.manual[0]?.cues[0]).toMatchObject({
      startMs: 100,
      endMs: 600,
    });
    const submitted = await ownerRequest(port, `${endpoint}/clips`, {
      method: "POST",
      headers: json,
      body: JSON.stringify({
        operationId: randomUUID(),
        analysisId: analysis.id,
        sourceRevision: 0,
        policyRevision: 1,
        momentIds: [analysis.manual[0]!.id],
      }),
    });
    expect(submitted.status).toBe(202);
    async function settled() {
      for (;;) {
        signal.throwIfAborted();
        const response = await ownerRequest(port, `${endpoint}/clips`, {
          headers: auth,
        });
        const list = ownerClipListSchema.parse(
          JSON.parse(response.body.toString()),
        );
        if (!list.active) return list.clips[0]!;
        await new Promise((done) => setTimeout(done, 50));
      }
    }
    const clip = await settled();
    expect(clip.state).toBe("ready");
    expect(clip.mode).toBe("provider-ai");
    expect(clip.assets[0]?.origin).toBe("generated");
    expect(clip.base?.fingerprint).toBe(workspace.source.fingerprint);
    expect(clip.base?.cut).toEqual({ startFrame: 6, endFrame: 36 });
    expect(clip.outputs[0]?.frames).toBe(30);
    const first = (
      await ownerRequest(port, `${endpoint}/clips/${clip.id}/output/0`, {
        headers: auth,
      })
    ).body;
    expect(first.length).toBeGreaterThan(1000);
    const edited = await ownerRequest(
      port,
      `${endpoint}/clips/${clip.id}/edit`,
      {
        method: "POST",
        headers: json,
        body: JSON.stringify({
          operationId: randomUUID(),
          expectedRevision: 0,
          baseHash: clip.baseHash,
          operations: [
            {
              kind: "caption",
              style: {
                ...OWNER_CAPTION_PRESETS.bold,
                box: { ...OWNER_CAPTION_PRESETS.bold.box, y: 0.2 },
              },
            },
          ],
        }),
      },
    );
    expect(edited.status).toBe(200);
    expect(
      (
        await ownerRequest(port, `${endpoint}/clips/${clip.id}/render`, {
          method: "POST",
          headers: json,
          body: JSON.stringify({
            operationId: randomUUID(),
            expectedRevision: 1,
          }),
        })
      ).status,
    ).toBe(202);
    const exported = await settled();
    expect(exported.state).toBe("ready");
    expect(exported.outputs.map((output) => output.editRevision)).toEqual([
      0, 1,
    ]);
    expect(exported.calls).toEqual({ plan: 1, image: 1, render: 2 });
    expect(
      (
        await ownerRequest(port, `${endpoint}/clips/${clip.id}/output/0`, {
          headers: auth,
        })
      ).body,
    ).toEqual(first);
    expect(receipts.map((receipt) => receipt.operation)).toEqual([
      "inspect",
      "prepare-owner-audio",
      "prepare-owner-video",
      "clip",
      "clip",
    ]);
    expect(transport.upload).toHaveBeenCalledTimes(2);
    expect(transport.delete).toHaveBeenCalledTimes(2);
    expect(transport.transcribe).toHaveBeenCalledTimes(1);
    expect(transport.generate).toHaveBeenCalledTimes(1);
    expect(transport.get).toHaveBeenCalledTimes(0);
    expect(transport.candidates).toHaveBeenCalledTimes(0);
    expect(pictures.find).toHaveBeenCalledTimes(1);
    expect(remote.size).toBe(0);
    expect(
      (await readdir(join(root, workspace.id))).filter((name) =>
        name.includes("provider"),
      ),
    ).toEqual([]);
  } finally {
    await host.close();
    await worker.close();
    expect(await readdir(root)).toEqual([]);
    expect(host.server.listening || worker.server.listening).toBe(false);
    await rm(directory, { recursive: true, force: true });
  }
}, 100_000);
