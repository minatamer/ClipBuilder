import { afterEach, expect, it, vi } from "vitest";
import { mkdtemp, mkdir, readdir, readFile, rm } from "node:fs/promises";
import { join, basename, relative } from "node:path";
import { tmpdir } from "node:os";
import { createHash, randomUUID } from "node:crypto";
import { OwnerAnalysisNotebook } from "./analysis-notebook.ts";
import { AnalysisChunks } from "./analysis-chunks.ts";
import { createOwnerHost, type OwnerHostOptions } from "./server.ts";
import { LocalDiagnostics } from "./diagnostics.ts";
import type { OwnerAnalysisPorts } from "./analysis.ts";
import { listenOwner, ownerRequest } from "../../../test/owner-http.ts";
import {
  ownerAnalysisSchema,
  type OwnerAnalysis,
} from "../../../packages/contracts/local/selection.ts";

const scratch: string[] = [];
async function root() {
  const path = await mkdtemp(join(tmpdir(), "cb-note-"));
  scratch.push(path);
  return path;
}
afterEach(async () => {
  for (const path of scratch.splice(0)) {
    expect(relative(tmpdir(), path)).toMatch(/^cb-note-[^\\/]+$/);
    await rm(path, { recursive: true, force: true });
  }
});
function workspace(offset = 0) {
  return {
    id: randomUUID(),
    revision: 0,
    mode: "synthetic-ai" as const,
    source: {
      fingerprint: "a".repeat(64),
      bytes: 100,
      durationMs: 12000,
      width: 320,
      height: 180,
      fps: 30,
      ...(offset ? { origin: { startMs: offset, durationMs: 120000 } } : {}),
    },
  };
}
const words = Array.from({ length: 12 }, (_, index) => ({
  id: `w_${String(index + 1).padStart(6, "0")}`,
  startMs: index * 1000,
  endMs: index * 1000 + 600,
  text: "private-notebook-word",
  punctuatedText: "private-notebook-word.",
  speakerId: null,
  confidence: null,
}));
function analysis(): OwnerAnalysis {
  return ownerAnalysisSchema.parse({
    id: randomUUID(),
    mode: "synthetic-ai",
    inputs: {
      sourceRevision: 0,
      policyRevision: 0,
      ranges: [],
      manualOnly: true,
      aiDuration: { minMs: 10000, maxMs: 30000 },
    },
    words: [],
    manual: [],
    suggestions: [],
    calls: { transcription: 0, selection: 0 },
  });
}

it("keeps independent attempts and the widest transcript with original clocks across disk reopen", async () => {
  const directory = await root(),
    source = workspace(64000),
    before = structuredClone(words);
  const notebook = new OwnerAnalysisNotebook(
    join(directory, "Research"),
    async () => {},
  );
  const input = {
    workspace: source,
    analysis: analysis(),
    speechRoot: directory,
    compatibility: "fixture-v1",
    outcome: "complete" as const,
    transcript: {
      fingerprint: source.source.fingerprint,
      sourceRevision: 0,
      mode: source.mode,
      words,
    },
  };
  const first = (await notebook.capture(input))!;
  expect(first.wordCount).toBe(12);
  expect(first.coversRequestedWindow).toBe(true);
  const firstWords = (
    await readFile(join(first.directory, "transcript.words.jsonl"), "utf8")
  )
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
  expect(firstWords[0].startMs).toBe(64000);
  expect(firstWords.at(-1).endMs).toBe(75600);
  expect(
    await readFile(join(first.directory, "transcript.txt"), "utf8"),
  ).toContain("00:01:04.000");
  expect(words).toEqual(before);
  const narrower = (await new OwnerAnalysisNotebook(
    notebook.root,
    async () => {},
  ).capture({
    ...input,
    analysis: analysis(),
    transcript: {
      ...input.transcript,
      window: { startMs: 1000, endMs: 3000 },
      words: words.slice(1, 3),
    },
  }))!;
  const pointer = JSON.parse(
    await readFile(join(first.sourceDirectory, "latest.json"), "utf8"),
  );
  expect(pointer.latestRunId).toBe(basename(narrower.directory));
  expect(pointer.aiRunId).toBe(basename(narrower.directory));
  expect(pointer.transcriptRunId).toBe(basename(first.directory));
  expect(pointer.transcriptCoverageMs).toBe(12000);
  expect((await readdir(join(first.sourceDirectory, "Runs"))).length).toBe(2);
  expect(
    (await readdir(first.sourceDirectory)).some((name) =>
      name.startsWith(".pending-"),
    ),
  ).toBe(false);
  expect(
    JSON.parse(await readFile(join(narrower.directory, "run.json"), "utf8")),
  ).toMatchObject({
    mode: "synthetic-ai",
    coversRequestedWindow: false,
    wordCount: 2,
  });
});

it("reconciles acknowledged speech sections without duplicates or another provider, preserving partial coverage", async () => {
  const directory = await root(),
    source = workspace(),
    speechRoot = join(directory, "speech");
  await mkdir(speechRoot);
  const chunks = new AnalysisChunks(speechRoot, async () => {}),
    signal = AbortSignal.timeout(10000);
  for (const [startMs, endMs] of [
    [0, 8000],
    [6000, 12000],
  ])
    await chunks.write(
      JSON.stringify([
        "speech-v1",
        "fixture-v1",
        source.source.fingerprint,
        { startMs, endMs },
      ]),
      {
        kind: "speech",
        words: words.filter(
          (word) => word.startMs >= startMs! && word.startMs < endMs!,
        ),
      },
      signal,
    );
  await chunks.write(
    JSON.stringify([
      "speech-v1",
      "fixture-v1",
      "b".repeat(64),
      { startMs: 0, endMs: 12000 },
    ]),
    {
      kind: "speech",
      words: [
        { ...words[0]!, text: "wrong-source", punctuatedText: "wrong-source" },
      ],
    },
    signal,
  );
  const notebook = new OwnerAnalysisNotebook(
    join(directory, "Research"),
    async () => {},
  );
  const result = (await notebook.capture({
    workspace: source,
    analysis: analysis(),
    speechRoot,
    compatibility: "fixture-v1",
    outcome: "complete",
  }))!;
  const saved = (
    await readFile(join(result.directory, "transcript.words.jsonl"), "utf8")
  )
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
  expect(saved).toHaveLength(12);
  expect(new Set(saved.map((word) => word.id)).size).toBe(12);
  expect(saved.map((word) => word.startMs)).toEqual(
    words.map((word) => word.startMs),
  );
  expect(
    await readFile(join(result.directory, "transcript.txt"), "utf8"),
  ).not.toContain("wrong-source");
  const partialRoot = join(directory, "partial");
  await mkdir(partialRoot);
  await new AnalysisChunks(partialRoot, async () => {}).write(
    JSON.stringify([
      "speech-v1",
      "fixture-v1",
      source.source.fingerprint,
      { startMs: 0, endMs: 5000 },
    ]),
    { kind: "speech", words: words.slice(0, 5) },
    signal,
  );
  const partial = (await notebook.capture({
    workspace: source,
    analysis: null,
    speechRoot: partialRoot,
    compatibility: "fixture-v1",
    outcome: "interrupted",
  }))!;
  expect(partial.wordCount).toBe(5);
  expect(partial.coversRequestedWindow).toBe(false);
  const pointer = JSON.parse(
    await readFile(join(result.sourceDirectory, "latest.json"), "utf8"),
  );
  expect(pointer.transcriptRunId).toBe(basename(result.directory));
  expect(pointer.aiRunId).toBe(basename(result.directory));
  expect(
    JSON.parse(await readFile(join(partial.directory, "run.json"), "utf8")),
  ).toMatchObject({ outcome: "interrupted", hasAiResults: false });
  const checkpoint = analysis();
  checkpoint.coverage = {
    state: "partial",
    completed: 0,
    planned: 2,
    coveredThroughMs: 0,
  };
  const onlySpeech = (await notebook.capture({
    workspace: source,
    analysis: checkpoint,
    speechRoot: partialRoot,
    compatibility: "fixture-v1",
    outcome: "interrupted",
  }))!;
  expect(
    JSON.parse(
      await readFile(join(onlySpeech.sourceDirectory, "latest.json"), "utf8"),
    ).aiRunId,
  ).toBe(basename(result.directory));
  expect(
    JSON.parse(await readFile(join(onlySpeech.directory, "run.json"), "utf8")),
  ).toMatchObject({ hasAiResults: false });
});

it("removes an incomplete capture after a disk failure and permits a later explicit save", async () => {
  const directory = await root(),
    source = workspace();
  let checks = 0;
  const notebook = new OwnerAnalysisNotebook(
    join(directory, "Research"),
    async () => {
      if (++checks === 3) throw Error("disk_unavailable");
    },
  );
  const input = {
    workspace: source,
    analysis: analysis(),
    speechRoot: directory,
    compatibility: "fixture-v1",
    outcome: "complete" as const,
    transcript: {
      fingerprint: source.source.fingerprint,
      sourceRevision: 0,
      mode: source.mode,
      words,
    },
  };
  await expect(notebook.capture(input)).rejects.toThrow("disk_unavailable");
  const sourceName = (await readdir(notebook.root))[0]!;
  expect(await readdir(join(notebook.root, sourceName))).toEqual(["Runs"]);
  expect(await readdir(join(notebook.root, sourceName, "Runs"))).toEqual([]);
  const result = await notebook.capture(input);
  expect(result?.wordCount).toBe(12);
});

it.each([false, true])(
  "isolates local/hosted archive failures and never adds provider calls (hosted=%s)",
  async (hosted) => {
    const directory = await root(),
      appRoot = join(directory, "app"),
      storage = join(directory, "Research");
    await mkdir(appRoot);
    const bytes = Buffer.from("synthetic-notebook-source"),
      lines: string[] = [];
    const transcribe = vi.fn(async () => words),
      select = vi.fn<OwnerAnalysisPorts["select"]>(async () => {
        throw Error("private-notebook-provider-failure");
      });
    const media = vi.fn<OwnerHostOptions["media"]>(async () => ({
      operation: "inspect",
      source: {
        fingerprint: createHash("sha256").update(bytes).digest("hex"),
        bytes: bytes.length,
        durationMs: 12000,
        width: 320,
        height: 180,
        fps: 30,
      },
    }));
    const notebook = new OwnerAnalysisNotebook(storage, async () => {}),
      capture = vi.fn(notebook.capture.bind(notebook));
    select.mockImplementationOnce(async () => {
      if (!hosted) {
        const acknowledged = await capture.mock.results[0]!.value;
        expect(
          JSON.parse(
            await readFile(join(acknowledged!.directory, "run.json"), "utf8"),
          ),
        ).toMatchObject({
          outcome: "partial",
          wordCount: 12,
          hasAiResults: false,
        });
      }
      throw Error("private-notebook-provider-failure");
    });
    const host = createOwnerHost({
      root: appRoot,
      port: 0,
      token: "synthetic-notebook",
      hosted,
      media,
      capacity: async () => {},
      diagnostics: new LocalDiagnostics((line) => lines.push(line)),
      analysisNotebook: { capture },
      analysis: { mode: "synthetic-ai", transcribe, select },
    });
    try {
      const port = await listenOwner(host.server),
        headers = {
          Authorization: "Bearer synthetic-notebook",
          "Content-Type": "application/json",
        };
      const opened = await ownerRequest(port, "/api/source", {
        method: "POST",
        headers: { ...headers, "Content-Type": "video/mp4" },
        body: bytes,
      });
      expect(opened.status).toBe(200);
      const source = JSON.parse(opened.body.toString());
      const input = {
        sourceRevision: 0,
        policyRevision: 0,
        ranges: [],
        manualOnly: false,
        aiCount: 1,
        aiDuration: { minMs: 10000, maxMs: 12000 },
      };
      const path = `/api/workspace/${source.id}/analysis`;
      expect(
        (
          await ownerRequest(port, path, {
            method: "POST",
            headers,
            body: JSON.stringify(input),
          })
        ).status,
      ).toBe(400);
      expect(capture).toHaveBeenCalledTimes(hosted ? 0 : 2);
      if (!hosted) {
        const archived = capture.mock.results.at(-1)!;
        const result = await archived.value;
        expect(result!.wordCount).toBe(12);
        expect(
          JSON.parse(
            await readFile(join(result!.directory, "run.json"), "utf8"),
          ),
        ).toMatchObject({ outcome: "interrupted", hasAiResults: false });
      }
      select.mockImplementation(async () => []);
      const response = await ownerRequest(port, path, {
        method: "POST",
        headers,
        body: JSON.stringify(input),
      });
      expect(response.status).toBe(200);
      if (!hosted) {
        capture.mockRejectedValueOnce(
          Error("private-notebook-storage-failure"),
        );
        expect(
          (
            await ownerRequest(port, path, {
              method: "POST",
              headers,
              body: JSON.stringify(input),
            })
          ).status,
        ).toBe(200);
      }
      expect(transcribe).toHaveBeenCalledTimes(1);
      expect(select).toHaveBeenCalledTimes(hosted ? 2 : 3);
      expect(media).toHaveBeenCalledTimes(1);
      expect(lines.join("\n")).not.toContain("private-notebook");
      expect(lines.join("\n")).not.toContain("synthetic-notebook");
      if (hosted) expect(await readdir(directory)).toEqual(["app"]);
      const cleared = await ownerRequest(port, `/api/workspace/${source.id}`, {
        method: "DELETE",
        headers: { Authorization: headers.Authorization },
      });
      expect(cleared.status).toBe(204);
      if (!hosted) {
        const saved = await capture.mock.results[0]!.value;
        expect(
          JSON.parse(await readFile(join(saved!.directory, "run.json"), "utf8"))
            .wordCount,
        ).toBe(12);
      }
    } finally {
      await host.close();
    }
  },
);
