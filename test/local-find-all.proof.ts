import { expect, it, vi } from "vitest";
import { mkdtemp, mkdir, readFile, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, isAbsolute, join, relative, resolve } from "node:path";
import { createOwnerHost } from "../apps/backend/local/server.ts";
import { createOwnerWorker } from "../apps/renderer/local/server.ts";
import { createLocalCodexAi } from "../apps/backend/local/codex-ai.ts";
import type { CodexInference } from "../apps/backend/local/codex-exec.ts";
import { localWorkerPort } from "../apps/backend/local/worker-port.ts";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { listenOwner, ownerRequest } from "./owner-http.ts";

async function cleanup(directory: string) {
  const actual = await realpath(directory),
    rel = relative(await realpath(tmpdir()), actual);
  if (
    !rel.startsWith("clipbuilder-find-all-proof-") ||
    isAbsolute(rel) ||
    rel.includes("..")
  )
    throw Error("proof_cleanup_invalid");
  await rm(actual, { recursive: true, force: true });
}

it("runs generated native audio and regional Find all with injected Parakeet/Codex results, then reuses every acknowledged unit", async () => {
  const directory = await mkdtemp(
    join(tmpdir(), "clipbuilder-find-all-proof-"),
  );
  const root = join(directory, "workspaces");
  let worker: ReturnType<typeof createOwnerWorker> | undefined;
  let host: ReturnType<typeof createOwnerHost> | undefined;
  try {
    await mkdir(root);
    const tools = await ownerNativeTools(resolve("."));
    const signal = AbortSignal.timeout(90000);
    const speech = vi.fn<typeof runOwnedProcess>(
      async (_exe, args, taskSignal, options) => {
        const wav = args[args.indexOf("-f") + 1]!;
        const core = Number(/^part-(\d+)\.wav$/u.exec(basename(wav))![1]);
        const begin = Math.max(0, core - 2000);
        const durationMs = Math.round(
          Number(
            (
              await runOwnedProcess(
                tools.ffprobe,
                [
                  "-v",
                  "error",
                  "-show_entries",
                  "format=duration",
                  "-of",
                  "default=nw=1:nk=1",
                  wav,
                ],
                taskSignal,
              )
            ).trim(),
          ) * 1000,
        );
        expect(durationMs).toBeLessThanOrEqual(64000);
        const tokens: string[] = [];
        for (let at = 0; at + 600 <= durationMs; at += 1000)
          tokens.push(
            ` [${tokens.length}] id=1 t0=${at / 10} t1=${(at + 600) / 10} word_start=true "▁Synthetic${begin + at}${(begin + at) % 10000 === 9000 ? "." : ""}"`,
          );
        const dump = `parakeet_print_timings: total time = 1 ms\nTokens [${tokens.length}]:\n${tokens.join("\n")}\n`;
        return runOwnedProcess(
          process.execPath,
          ["-e", "process.stderr.write(process.argv[1])", dump],
          taskSignal,
          { ...options, env: {} },
        );
      },
    );
    worker = createOwnerWorker({
      root,
      token: "synthetic-find-all-worker",
      tools,
      chromium: "unused",
      overlayBundle: directory,
      speech: {
        engine: "parakeet",
        executable: "synthetic-parakeet",
        model: "synthetic-model",
        directory,
      },
      runSpeech: speech,
    });
    const workerPort = await listenOwner(worker.server);
    const transport: typeof fetch = async (input, init) => {
      const url = new URL(String(input));
      if (url.origin !== `http://127.0.0.1:${workerPort}`)
        throw Error("unexpected_transport");
      const result = await ownerRequest(workerPort, url.pathname, {
        method: init?.method ?? "GET",
        headers: Object.fromEntries(new Headers(init?.headers)),
        ...(typeof init?.body === "string" ? { body: init.body } : {}),
      });
      return new Response(
        result.status === 204 ? null : result.body.toString(),
        {
          status: result.status,
        },
      );
    };
    const media = vi.fn(
      localWorkerPort(workerPort, "synthetic-find-all-worker", transport),
    );
    const infer = vi.fn<CodexInference>(async (request, taskSignal) => {
      taskSignal.throwIfAborted();
      const payload = JSON.parse(
        request.prompt.slice(request.prompt.lastIndexOf("\n") + 1),
      );
      expect(payload.requestedCount).toBe("all");
      expect(payload.reviewCore).toBeDefined();
      expect(payload.words[0]).not.toHaveProperty("confidence");
      expect(payload.speechUnits.length).toBeGreaterThan(1);
      const words: { id: string; startMs: number; endMs: number }[] =
        payload.words;
      const candidates = [10000, 12000, 20000, 70000].map((offset) => {
        const start = words.find(
          (w) => w.startMs >= payload.reviewCore.startMs + offset,
        )!;
        const end = words.find((w) => w.startMs >= start.startMs + 11000)!;
        return {
          startWordId: start.id,
          endWordId: end.id,
          titleWordIds: [start.id],
          hookWordIds: [start.id],
          evidence: [],
          caveats: [],
        };
      });
      return { candidates };
    });
    host = createOwnerHost({
      root,
      port: 0,
      token: "synthetic-find-all-host",
      media,
      capacity: async () => {},
      providers: (files) => createLocalCodexAi({ files, media, infer }),
    });
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
        "color=navy:s=320x180:r=12:d=485",
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=440:sample_rate=16000:duration=485",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-threads",
        "2",
        "-shortest",
        source,
      ],
      signal,
    );
    const port = await listenOwner(host.server),
      headers = { Authorization: "Bearer synthetic-find-all-host" };
    const uploaded = await ownerRequest(port, "/api/source", {
      method: "POST",
      headers: { ...headers, "Content-Type": "video/mp4" },
      body: await readFile(source),
    });
    expect(uploaded.status).toBe(200);
    const workspace = JSON.parse(uploaded.body.toString());
    const path = `/api/workspace/${workspace.id}/analysis`;
    const body = JSON.stringify({
      sourceRevision: workspace.revision,
      policyRevision: 0,
      aiCount: "all",
      aiDuration: { minMs: 10000, maxMs: 60000 },
      manualOnly: false,
      ranges: [],
      window: { startMs: 0, endMs: 480500 },
    });
    const run = await ownerRequest(port, path, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body,
    });
    expect(run.status).toBe(200);
    const result = JSON.parse(run.body.toString());
    expect(result.coverage).toEqual({
      state: "complete",
      completed: 4,
      planned: 4,
      coveredThroughMs: 480500,
    });
    expect(result.suggestions).toHaveLength(8);
    const cuts = result.suggestions.map(
      (item: { cut: { startFrame: number; endFrame: number } }) => item.cut,
    );
    expect(
      cuts.every(
        (cut: { startFrame: number; endFrame: number }, index: number) =>
          !index || cuts[index - 1].endFrame <= cut.startFrame,
      ),
    ).toBe(true);
    expect(cuts[0]).toEqual({ startFrame: 300, endFrame: 1188 });
    expect(result.calls).toEqual({ transcription: 1, selection: 4 });
    expect(speech).toHaveBeenCalledTimes(9);
    expect(infer).toHaveBeenCalledTimes(4);
    expect(
      result.suggestions.every((m: { evidence: { startWordId: string } }) =>
        /^w_[a-f0-9]{32}$/u.test(m.evidence.startWordId),
      ),
    ).toBe(true);
    for (let i = 0; i < 2; i++)
      expect((await ownerRequest(port, path, { headers })).status).toBe(200);
    const retry = await ownerRequest(port, path, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body,
    });
    expect(retry.status).toBe(200);
    const reused = JSON.parse(retry.body.toString());
    expect(reused.calls).toEqual({ transcription: 0, selection: 0 });
    expect(reused.suggestions).toEqual(result.suggestions);
    expect(speech).toHaveBeenCalledTimes(9);
    expect(infer).toHaveBeenCalledTimes(4);
    expect(
      media.mock.calls.filter(([job]) => job.operation === "codex-input"),
    ).toHaveLength(1);
  } finally {
    try {
      await host?.close();
    } finally {
      try {
        await worker?.close();
      } finally {
        await cleanup(directory);
      }
    }
  }
}, 100000);
