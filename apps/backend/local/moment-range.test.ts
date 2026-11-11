import { expect, it, vi } from "vitest";
import { createHash, randomUUID } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readdir,
  rmdir,
  writeFile,
  rm,
} from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createOwnerHost, type OwnerHostOptions } from "./server.ts";
import { listenOwner, ownerRequest } from "../../../test/owner-http.ts";
import {
  ownerAnalysisSchema,
  ownerReviewedMomentCut,
  type OwnerMomentRangeRequest,
} from "../../../packages/contracts/local/selection.ts";
import { hostedEditingPath } from "../../../packages/contracts/local/hosted-editing.ts";
import { OwnerClipBatch } from "./clip-batch.ts";
import { WorkspaceFiles } from "./workspace-files.ts";
import { editOwnerMomentRange } from "./moment-range.ts";
import { fakeOwnerAnalysis } from "./fake-analysis.ts";

it("edits across long-source speech sections and recovers the result with zero extra inference", async () => {
  const directory = await mkdtemp(
    join(tmpdir(), "clipbuilder-range-recovery-"),
  );
  const root = join(directory, "workspaces");
  await mkdir(root);
  const bytes = Buffer.from("generated-long-range-source"),
    auth = { Authorization: "Bearer synthetic-range" };
  const speech = vi.fn(fakeOwnerAnalysis.transcribeWindow!),
    select = vi.fn(fakeOwnerAnalysis.select);
  const media = vi.fn<OwnerHostOptions["media"]>(async () => ({
    operation: "inspect",
    source: {
      fingerprint: createHash("sha256").update(bytes).digest("hex"),
      bytes: bytes.length,
      durationMs: 540000,
      width: 320,
      height: 180,
      fps: 30,
    },
  }));
  const create = () =>
    createOwnerHost({
      root,
      storageRoot: join(directory, "library"),
      recoverSession: true,
      port: 0,
      token: "synthetic-range",
      capacity: async () => {},
      media,
      providers: () => ({
        localAi: {
          aiProvider: "codex",
          aiSetup: "ready",
          captionProvider: "local-speech",
        },
        analysis: { ...fakeOwnerAnalysis, transcribeWindow: speech, select },
      }),
    });
  let host = create();
  try {
    let port = await listenOwner(host.server);
    const opened = await ownerRequest(port, "/api/source", {
      method: "POST",
      headers: { ...auth, "Content-Type": "video/mp4" },
      body: bytes,
    });
    const workspace = JSON.parse(opened.body.toString());
    const path = `/api/workspace/${workspace.id}/analysis`;
    const response = await ownerRequest(port, path, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceRevision: 0,
        policyRevision: 0,
        ranges: [],
        manualOnly: false,
        aiCount: 2,
        aiDuration: { minMs: 10000, maxMs: 30000 },
      }),
    });
    expect(response.status).toBe(200);
    const result = ownerAnalysisSchema.parse(
      JSON.parse(response.body.toString()),
    );
    expect(result.words).toEqual([]);
    expect(result.coverage?.completed).toBe(2);
    const calls = {
      speech: speech.mock.calls.length,
      selection: select.mock.calls.length,
    };
    const original = result.suggestions[0]!;
    const request = {
      operationId: randomUUID(),
      analysisId: result.id,
      sourceRevision: 0,
      policyRevision: 0,
      momentId: original.id,
      expectedCut: original.cut,
      range: { startMs: 470000, endMs: 500000 },
    };
    const editedResponse = await ownerRequest(
      port,
      `${path}/${original.id}/edit`,
      {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify(request),
      },
    );
    expect(editedResponse.status).toBe(200);
    const edited = ownerAnalysisSchema.parse(
      JSON.parse(editedResponse.body.toString()),
    );
    const moment = edited.suggestions[0]!;
    expect(moment.id).toBe(request.operationId);
    expect(moment.cut).toEqual({ startFrame: 14100, endFrame: 15000 });
    expect(moment.cues[0]!.startMs).toBe(0);
    expect(moment.cues.at(-1)!.endMs).toBe(30000);
    expect(moment.cues.some((word) => word.startMs >= 12000)).toBe(true);
    expect(new Set(moment.cues.map((word) => word.id)).size).toBe(
      moment.cues.length,
    );
    expect({
      speech: speech.mock.calls.length,
      selection: select.mock.calls.length,
    }).toEqual(calls);
    expect(media).toHaveBeenCalledTimes(1);
    await host.close();
    host = create();
    port = await listenOwner(host.server);
    const restoredWorkspace = await ownerRequest(port, "/api/workspace", {
      headers: auth,
    });
    const reopened = JSON.parse(restoredWorkspace.body.toString());
    expect(reopened.source.fingerprint).toBe(workspace.source.fingerprint);
    const restored = await ownerRequest(
      port,
      `/api/workspace/${reopened.id}/analysis`,
      { headers: auth },
    );
    expect(JSON.parse(restored.body.toString()).suggestions).toEqual(
      edited.suggestions,
    );
    expect({
      speech: speech.mock.calls.length,
      selection: select.mock.calls.length,
    }).toEqual(calls);
    expect(media).toHaveBeenCalledTimes(1);
  } finally {
    await host.close();
    await rm(directory, { recursive: true, force: true });
  }
});

it.each([false, true])(
  "persists manual/suggested corrections through HTTP without new AI/media work (hosted=%s)",
  async (hosted) => {
    const root = await mkdtemp(join(tmpdir(), "clipbuilder-range-http-"));
    const bytes = Buffer.from("generated-range-source");
    const transcribe = vi.fn(async () =>
      Array.from({ length: 24 }, (_, index) => ({
        id: `w_${String(index + 1).padStart(6, "0")}`,
        text: "word",
        punctuatedText: "word",
        speakerId: null,
        confidence: null,
        startMs: index * 1000,
        endMs: index * 1000 + 600,
      })),
    );
    const select = vi.fn(async () => [
      {
        startWordId: "w_000011",
        endWordId: "w_000020",
        title: "word",
        hook: "word",
        rationale: "Synthetic evidence",
        evidence: [],
        caveats: [],
      },
    ]);
    const media = vi.fn<OwnerHostOptions["media"]>(async () => ({
      operation: "inspect",
      source: {
        fingerprint: createHash("sha256").update(bytes).digest("hex"),
        bytes: bytes.length,
        durationMs: 90000,
        width: 320,
        height: 180,
        fps: 30,
      },
    }));
    const host = createOwnerHost({
      root,
      port: 0,
      token: "synthetic-range",
      hosted,
      media,
      capacity: async () => {},
      analysis: { mode: "synthetic-ai", transcribe, select },
    });
    try {
      const port = await listenOwner(host.server);
      const headers = {
        Authorization: "Bearer synthetic-range",
        "Content-Type": "application/json",
      };
      const opened = await ownerRequest(port, "/api/source", {
        method: "POST",
        headers: { ...headers, "Content-Type": "video/mp4" },
        body: bytes,
      });
      const workspace = JSON.parse(opened.body.toString());
      const path = `/api/workspace/${workspace.id}/analysis`;
      const found = await ownerRequest(port, path, {
        method: "POST",
        headers,
        body: JSON.stringify({
          sourceRevision: 0,
          policyRevision: 2,
          ranges: [{ id: randomUUID(), startMs: 1000, endMs: 5000 }],
          manualOnly: false,
          aiDuration: { minMs: 10000, maxMs: 20000 },
          aiCount: 1,
        }),
      });
      expect(found.status).toBe(200);
      let analysis = ownerAnalysisSchema.parse(
        JSON.parse(found.body.toString()),
      );
      expect(analysis.manual).toHaveLength(1);
      expect(analysis.suggestions).toHaveLength(1);
      const initialCalls = structuredClone(analysis.calls);
      for (const group of ["manual", "suggestions"] as const) {
        const original = analysis[group][0]!;
        const body: OwnerMomentRangeRequest = {
          operationId: randomUUID(),
          analysisId: analysis.id,
          momentId: original.id,
          sourceRevision: workspace.revision,
          policyRevision: 2,
          expectedCut: original.cut,
          range: {
            startMs: (original.cut.startFrame * 1000) / 30 + 1000,
            endMs: (original.cut.endFrame * 1000) / 30 + 1000,
          },
        };
        const editPath = `${path}/${original.id}/edit`;
        expect(hostedEditingPath("POST", editPath.replace("/api", ""))).toBe(
          true,
        );
        for (const invalid of [
          { ...body, sourceRevision: 9 },
          { ...body, analysisId: randomUUID() },
          { ...body, expectedCut: { startFrame: 0, endFrame: 30 } },
          { ...body, range: { startMs: 0, endMs: 61000 } },
          { ...body, range: { startMs: 89000, endMs: 91000 } },
          { ...body, range: { startMs: 4000, endMs: 3000 } },
        ]) {
          const rejected = await ownerRequest(port, editPath, {
            method: "POST",
            headers,
            body: JSON.stringify(invalid),
          });
          expect([400, 409]).toContain(rejected.status);
        }
        const result = await ownerRequest(port, editPath, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });
        expect(result.status).toBe(200);
        analysis = ownerAnalysisSchema.parse(
          JSON.parse(result.body.toString()),
        );
        const edited = analysis[group][0]!;
        expect(edited.id).toBe(body.operationId);
        expect(edited.cut).toEqual({
          startFrame: original.cut.startFrame + 30,
          endFrame: original.cut.endFrame + 30,
        });
        expect(edited.processingIdentity).not.toBe(original.processingIdentity);
        expect(edited.cues[0]!.startMs).toBe(0);
        expect(edited.cues[0]!.id).not.toBe(original.cues[0]!.id);
        const retried = await ownerRequest(port, editPath, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });
        expect(retried.status).toBe(200);
        expect(JSON.parse(retried.body.toString())).toEqual(analysis);
        expect(analysis.calls).toEqual(initialCalls);
      }
      const restored = await ownerRequest(port, path, { headers });
      expect(JSON.parse(restored.body.toString())).toEqual(analysis);
      expect(transcribe).toHaveBeenCalledTimes(1);
      expect(select).toHaveBeenCalledTimes(1);
      expect(media).toHaveBeenCalledTimes(1);
      expect(
        (
          await ownerRequest(port, `${path}/${analysis.manual[0]!.id}/edit`, {
            method: "POST",
            body: "{}",
          })
        ).status,
      ).toBe(403);
      let selectedAgain!: () => void;
      let finishSelection!: () => void;
      const entered = new Promise<void>((done) => {
        selectedAgain = done;
      });
      const held = new Promise<void>((done) => {
        finishSelection = done;
      });
      select.mockImplementationOnce(async () => {
        selectedAgain();
        await held;
        return [];
      });
      const pending = ownerRequest(port, path, {
        method: "POST",
        headers,
        body: JSON.stringify({ ...analysis.inputs, policyRevision: 3 }),
      });
      await entered;
      try {
        expect(
          (
            await ownerRequest(port, `${path}/${analysis.manual[0]!.id}/edit`, {
              method: "POST",
              headers,
              body: "{}",
            })
          ).status,
        ).toBe(409);
      } finally {
        finishSelection();
        await pending;
      }
    } finally {
      await host.close();
      expect(await readdir(root)).toEqual([]);
      await rmdir(root);
    }
  },
);

it("preserves fractional frames/available coverage and bounds edits of longer legacy AI cuts", () => {
  const analysis = ownerAnalysisSchema.parse({
    id: randomUUID(),
    mode: "synthetic-ai",
    inputs: {
      sourceRevision: 0,
      policyRevision: 0,
      ranges: [],
      manualOnly: false,
      aiDuration: { minMs: 10000, maxMs: 60000 },
    },
    words: [],
    manual: [],
    suggestions: [],
    calls: { transcription: 0, selection: 0 },
  });
  const moment = {
    id: randomUUID(),
    processingIdentity: "a".repeat(64),
    cut: { startFrame: 301, endFrame: 2701 },
    rangeIds: [],
    evidence: null,
    cues: [],
  };
  const source = {
    durationMs: 120000,
    availableWindow: { startMs: 5000, endMs: 100000 },
    origin: { startMs: 64000, durationMs: 1000000 },
  };
  expect(
    ownerReviewedMomentCut(source, analysis, moment, {
      startMs: 10033,
      endMs: 90033,
    }),
  ).toEqual(moment.cut);
  const fractional = { ...moment, cut: { startFrame: 301, endFrame: 2702 } };
  expect(
    ownerReviewedMomentCut(source, analysis, fractional, {
      startMs: 10033,
      endMs: 90067,
    }),
  ).toEqual(fractional.cut);
  expect(() =>
    ownerReviewedMomentCut(source, analysis, moment, {
      startMs: 4000,
      endMs: 5000,
    }),
  ).toThrow();
  expect(() =>
    ownerReviewedMomentCut(source, analysis, moment, {
      startMs: 10000,
      endMs: 91000,
    }),
  ).toThrow();
  analysis.coverage = {
    state: "partial",
    completed: 1,
    planned: 2,
    coveredThroughMs: 50000,
  };
  expect(() =>
    ownerReviewedMomentCut(source, analysis, moment, {
      startMs: 49000,
      endMs: 51000,
    }),
  ).toThrow();
});

it("queues the corrected cut separately from an already retained old clip", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-range-batch-"));
  const files = new WorkspaceFiles(root);
  const workspace = {
    id: await files.create(),
    revision: 0,
    mode: "synthetic-ai" as const,
    source: {
      fingerprint: "a".repeat(64),
      bytes: 9,
      durationMs: 30000,
      width: 320,
      height: 180,
      fps: 30,
    },
  };
  await writeFile(await files.file(workspace.id, "source.mp4"), "synthetic");
  const original = {
    id: randomUUID(),
    processingIdentity: "b".repeat(64),
    cut: { startFrame: 0, endFrame: 60 },
    rangeIds: [],
    evidence: null,
    cues: [],
  };
  const analysis = ownerAnalysisSchema.parse({
    id: randomUUID(),
    mode: "synthetic-ai",
    inputs: {
      sourceRevision: 0,
      policyRevision: 0,
      ranges: [],
      manualOnly: true,
      aiDuration: { minMs: 10000, maxMs: 60000 },
    },
    words: [],
    manual: [original],
    suggestions: [],
    calls: { transcription: 0, selection: 0 },
  });
  const ports = {
    mode: "synthetic-ai" as const,
    plan: vi.fn(async () => {
      throw Error("synthetic_plan_stop");
    }),
    image: vi.fn(async () => {
      throw Error("unexpected");
    }),
    render: vi.fn(async () => {
      throw Error("unexpected");
    }),
  };
  const batch = new OwnerClipBatch(
    workspace,
    files,
    ports,
    () => {},
    undefined,
    async () => {},
  );
  try {
    const request = (momentId: string) => ({
      operationId: randomUUID(),
      analysisId: analysis.id,
      sourceRevision: 0,
      policyRevision: 0,
      momentIds: [momentId],
    });
    await batch.submit(request(original.id), analysis);
    const changed = editOwnerMomentRange(workspace, analysis, {
      operationId: randomUUID(),
      analysisId: analysis.id,
      momentId: original.id,
      sourceRevision: 0,
      policyRevision: 0,
      expectedCut: original.cut,
      range: { startMs: 1000, endMs: 3000 },
    });
    await batch.submit(request(changed.manual[0]!.id), changed);
    expect(
      batch.snapshot().clips.map((clip) => clip.preparation!.moment.cut),
    ).toEqual([original.cut, { startFrame: 30, endFrame: 90 }]);
  } finally {
    await batch.close();
    await files.close();
    expect(await readdir(root)).toEqual([]);
    await rmdir(root);
  }
});
