import { expect, it, vi } from "vitest";
import { createLocalCodexAi } from "./codex-ai.ts";
import { WorkspaceFiles } from "./workspace-files.ts";
import { ownerSelectionPolicy } from "./selection-policy.ts";
import { FOCUS_PLANNING_POLICY } from "./focus-planning-policy.ts";
import type { CodexInference } from "./codex-exec.ts";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { OwnerMoment } from "../../../packages/contracts/local/selection.ts";
import type { OwnerWorkspace } from "../../../packages/contracts/local/index.ts";
import { retrievedPictureFixture } from "../../../test/owner-content-fixture.ts";
import { LocalDiagnostics } from "./diagnostics.ts";

const words = ["Coral", "reefs", "recover."].map((text, index) => ({
  id: `w_${String(index + 1).padStart(6, "0")}`,
  text,
  punctuatedText: text,
  startMs: index * 400,
  endMs: index * 400 + 350,
  speakerId: null,
  confidence: null,
}));
const policy = { minMs: 10_000, maxMs: 30_000 };
it("retains more than twenty Codex proposals for all-moments selection in one injected request", async () => {
  const candidate = {
    startWordId: words[0]!.id,
    endWordId: words[2]!.id,
    titleWordIds: [words[0]!.id],
    hookWordIds: [words[0]!.id],
    evidence: [],
    caveats: [],
  };
  const infer = vi.fn<CodexInference>(async () => ({
    candidates: Array.from({ length: 30 }, () => candidate),
  }));
  const media = vi.fn();
  const ai = createLocalCodexAi({
    files: new WorkspaceFiles("unused-synthetic"),
    media,
    infer,
  });
  try {
    expect(
      await ai.analysis!.select(
        words,
        policy,
        AbortSignal.timeout(2000),
        ownerSelectionPolicy(policy, "all"),
        "all",
      ),
    ).toHaveLength(30);
    expect(infer).toHaveBeenCalledTimes(1);
    expect(infer.mock.calls[0]![0].prompt).toContain('"requestedCount":"all"');
    expect(infer.mock.calls[0]![0].prompt).not.toContain("aiming for");
    expect(media).not.toHaveBeenCalled();
  } finally {
    await ai.close!(AbortSignal.timeout(2000));
  }
});
it("owns and aborts transcript-only visual planning on close and refuses another dispatch", async () => {
  const infer = vi.fn<CodexInference>(
    async (_request, signal) =>
      new Promise((_resolve, reject) => {
        signal.addEventListener(
          "abort",
          () => reject(Error("synthetic_abort")),
          { once: true },
        );
      }),
  );
  const ai = createLocalCodexAi({
    files: new WorkspaceFiles("unused-synthetic"),
    media: vi.fn(),
    infer,
  });
  const workspace: OwnerWorkspace = {
    id: crypto.randomUUID(),
    revision: 0,
    mode: "provider-ai",
    source: {
      fingerprint: "a".repeat(64),
      bytes: 100,
      durationMs: 10000,
      width: 640,
      height: 360,
      fps: 30,
    },
  };
  const moment: OwnerMoment = {
    id: crypto.randomUUID(),
    processingIdentity: "a".repeat(64),
    cut: { startFrame: 0, endFrame: 90 },
    cues: words,
    rangeIds: [],
    evidence: null,
  };
  const request = { workspace, clipId: crypto.randomUUID(), moment };
  const operation = ai.clipPreparation!.planVisuals!(
    request,
    AbortSignal.timeout(5000),
  );
  const outcome = operation.then(
    () => "completed",
    () => "aborted",
  );
  await vi.waitFor(() => expect(infer).toHaveBeenCalledTimes(1));
  await ai.close!(AbortSignal.timeout(1000));
  expect(await outcome).toBe("aborted");
  await expect(
    ai.clipPreparation!.planVisuals!(request, AbortSignal.timeout(1000)),
  ).rejects.toThrow("codex_unavailable");
  expect(infer).toHaveBeenCalledTimes(1);
});
it("searches before generated fallback and keeps optional visual failures nonfatal", async () => {
  const fixture = await retrievedPictureFixture();
  const pictures = {
    find: vi.fn().mockResolvedValueOnce(fixture.asset).mockResolvedValue(null),
  };
  const infer = vi.fn<CodexInference>(),
    lines: string[] = [];
  const ai = createLocalCodexAi({
    files: new WorkspaceFiles("unused-synthetic"),
    media: vi.fn(),
    infer,
    pictures,
    diagnostics: new LocalDiagnostics((line) => lines.push(line)),
  });
  const request = {
    clipId: crypto.randomUUID(),
    words,
    cue: {
      startFrame: 0,
      endFrame: 90,
      evidenceWordIds: [],
      brief: {
        scene: "Synthetic coral",
        searchQuery: "coral reef",
        requiredTerms: ["coral"],
        avoidTerms: [],
      },
      alternateBriefs: [
        {
          scene: "Synthetic coral",
          searchQuery: "coral reef habitat",
          requiredTerms: ["coral"],
          avoidTerms: [],
        },
      ],
      illustration: {
        layout: "concept" as const,
        heading: "Coral recovery",
        items: [{ label: "Healthy coral", icon: "leaf" as const }],
      },
    },
  };
  try {
    expect(
      (await ai.clipPreparation!.image(request, new AbortController().signal))
        ?.origin,
    ).toBe("retrieved");
    expect(pictures.find).toHaveBeenCalledTimes(1);
    const generated = await ai.clipPreparation!.image(
      request,
      new AbortController().signal,
    );
    expect(generated?.origin).toBe("generated");
    expect(generated?.bytes.subarray(1, 4).toString()).toBe("PNG");
    expect(pictures.find).toHaveBeenCalledTimes(2);
    expect(infer).not.toHaveBeenCalled();
    const outcomes = lines
      .map((line) => JSON.parse(line))
      .filter((entry) => entry.visual)
      .map((entry) => [entry.visual.stage, entry.visual.outcome]);
    expect(outcomes).toEqual([
      ["search", "found"],
      ["search", "miss"],
      ["fallback", "generated"],
    ]);
  } finally {
    await ai.close!(new AbortController().signal);
  }
});
it("defers speaker work until a chosen cut and preserves the existing transcript without inference", async () => {
  const root = await mkdtemp(
      join(tmpdir(), "clipbuilder-codex-deferred-speakers-"),
    ),
    files = new WorkspaceFiles(root);
  vi.spyOn(files, "codexInput").mockResolvedValue(
    join(root, "synthetic-artifact.json"),
  );
  const enriched = words.map((word) => ({ ...word, speakerId: "spk_0" }));
  vi.spyOn(files, "readCodexInput")
    .mockResolvedValueOnce({ kind: "speech", words })
    .mockResolvedValueOnce({ kind: "speakers", words: enriched });
  const media = vi.fn<Parameters<typeof createLocalCodexAi>[0]["media"]>(
    async (job) => {
      if (job.operation !== "codex-input")
        throw Error("unexpected_synthetic_job");
      return {
        operation: "codex-input",
        jobId: job.jobId,
        kind: job.kind,
        bytes: 100,
        digest: "a".repeat(64),
      };
    },
  );
  const infer = vi.fn<CodexInference>(),
    ai = createLocalCodexAi({ files, media, infer });
  const workspace: OwnerWorkspace = {
    id: crypto.randomUUID(),
    revision: 0,
    mode: "provider-ai",
    source: {
      fingerprint: "a".repeat(64),
      bytes: 100,
      durationMs: 60000,
      width: 640,
      height: 360,
      fps: 30,
    },
  };
  const moment: OwnerMoment = {
    id: crypto.randomUUID(),
    processingIdentity: "b".repeat(64),
    cut: { startFrame: 0, endFrame: 300 },
    rangeIds: [],
    evidence: null,
    cues: words,
    speakersPrepared: false,
  };
  try {
    await ai.analysis!.transcribe(workspace, new AbortController().signal);
    const labeled = await ai.clipPreparation!.prepareWords!(
      { workspace, clipId: crypto.randomUUID(), moment },
      new AbortController().signal,
    );
    expect(labeled).toEqual(enriched);
    expect(media.mock.calls.map(([job]) => job)).toMatchObject([
      { kind: "speech", diarize: false },
      { kind: "speakers", cut: moment.cut, words },
    ]);
    expect(media).toHaveBeenCalledTimes(2);
    expect(infer).not.toHaveBeenCalled();
  } finally {
    await ai.close!(new AbortController().signal);
    await rm(root, { recursive: true, force: true });
  }
});
it("sends only the selected speech cut and returns source-relative words without a Codex call", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-codex-cut-test-"));
  const files = new WorkspaceFiles(root);
  vi.spyOn(files, "codexInput").mockResolvedValue(
    join(root, "synthetic-artifact.json"),
  );
  vi.spyOn(files, "readCodexInput").mockResolvedValue({
    kind: "speech",
    words,
  });
  const media = vi.fn<Parameters<typeof createLocalCodexAi>[0]["media"]>(
    async (job) => {
      if (job.operation !== "codex-input")
        throw Error("unexpected_synthetic_job");
      return {
        operation: "codex-input",
        jobId: job.jobId,
        kind: "speech",
        bytes: 100,
        digest: "a".repeat(64),
      };
    },
  );
  const infer = vi.fn<CodexInference>();
  const ai = createLocalCodexAi({ files, media, infer });
  const workspace: OwnerWorkspace = {
    id: crypto.randomUUID(),
    revision: 0,
    mode: "provider-ai",
    source: {
      fingerprint: "a".repeat(64),
      bytes: 100,
      durationMs: 480000,
      width: 640,
      height: 360,
      fps: 30,
    },
  };
  try {
    const value = await ai.analysis!.transcribeCut!(
      workspace,
      { startFrame: 3600, endFrame: 5400 },
      new AbortController().signal,
    );
    expect(media).toHaveBeenCalledTimes(1);
    expect(media.mock.calls[0]![0]).toMatchObject({
      kind: "speech",
      cut: { startFrame: 3600, endFrame: 5400 },
    });
    expect(value.map((word) => [word.id, word.startMs, word.endMs])).toEqual(
      words.map((word) => [
        word.id,
        word.startMs + 120000,
        word.endMs + 120000,
      ]),
    );
    expect(infer).not.toHaveBeenCalled();
  } finally {
    await ai.close!(new AbortController().signal);
    await rm(root, { recursive: true, force: true });
  }
});
it("forwards distinct same-subject alternatives in one search request and never falls back to Gemini", async () => {
  const fixture = await retrievedPictureFixture(),
    lines: string[] = [];
  const brief = (subject: string) => ({
    scene: `Synthetic ${subject}`,
    searchQuery: subject,
    requiredTerms: [subject],
    avoidTerms: [],
  });
  const pictures = {
    find: vi.fn().mockResolvedValueOnce(fixture.asset),
  };
  const ai = createLocalCodexAi({
    files: new WorkspaceFiles("unused-synthetic"),
    media: vi.fn(),
    infer: vi.fn(),
    pictures,
    diagnostics: new LocalDiagnostics((line) => lines.push(line)),
  });
  try {
    const result = await ai.clipPreparation!.image(
      {
        clipId: crypto.randomUUID(),
        words,
        cue: {
          startFrame: 0,
          endFrame: 150,
          evidenceWordIds: [],
          brief: {
            ...brief("coral reef"),
            searchQuery: "coral reef restoration photograph",
          },
          alternateBriefs: [
            {
              ...brief("coral reef"),
              searchQuery: "coral reef underwater illustration",
            },
            brief("parrot"),
          ],
        },
      },
      new AbortController().signal,
    );
    expect(result?.bytes.equals(fixture.bytes)).toBe(true);
    expect(pictures.find).toHaveBeenCalledTimes(1);
    expect(pictures.find.mock.calls[0]![0]).toMatchObject({
      brief: { searchQuery: "coral reef restoration photograph" },
      alternateBriefs: [
        {
          searchQuery: "coral reef underwater illustration",
          requiredTerms: ["coral reef"],
        },
        { searchQuery: "coral reef", requiredTerms: ["coral reef"] },
      ],
    });
    expect(lines.join("")).not.toContain("synthetic-private-query-failure");
  } finally {
    await ai.close?.(new AbortController().signal);
  }
});

it("deduplicates searches and discards a result returned after its overall deadline", async () => {
  const fixture = await retrievedPictureFixture(),
    deadline = new AbortController();
  const pictures = {
    find: vi.fn(async (): Promise<typeof fixture.asset | null> => {
      deadline.abort();
      return fixture.asset;
    }),
  };
  const ai = createLocalCodexAi({
    files: new WorkspaceFiles("unused-synthetic"),
    media: vi.fn(),
    infer: vi.fn(),
    pictures,
  });
  const brief = {
    scene: "Synthetic robot",
    searchQuery: "robot",
    requiredTerms: ["robot"],
    avoidTerms: [],
  };
  const request = {
    clipId: crypto.randomUUID(),
    words,
    cue: {
      startFrame: 0,
      endFrame: 150,
      evidenceWordIds: [],
      brief,
      alternateBriefs: [brief, brief],
    },
  };
  const timeout = vi
    .spyOn(AbortSignal, "timeout")
    .mockReturnValue(deadline.signal);
  try {
    expect(
      await ai.clipPreparation!.image(request, new AbortController().signal),
    ).toBeNull();
    expect(pictures.find).toHaveBeenCalledOnce();
    timeout.mockRestore();
    pictures.find.mockImplementation(async () => null);
    expect(
      await ai.clipPreparation!.image(request, new AbortController().signal),
    ).toBeNull();
    expect(pictures.find).toHaveBeenCalledTimes(2);
  } finally {
    timeout.mockRestore();
    await ai.close?.(new AbortController().signal);
  }
});
it("keeps lookup optional and searches before rendering a retained illustration", async () => {
  const pictures = {
    find: vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockRejectedValueOnce(Error("synthetic_lookup_failure")),
  };
  const ai = createLocalCodexAi({
    files: new WorkspaceFiles("unused-synthetic"),
    media: vi.fn(),
    infer: vi.fn(),
    pictures,
  });
  const cue = {
    startFrame: 0,
    endFrame: 90,
    evidenceWordIds: ["w_000001"],
    brief: {
      scene: "A playful robot toy",
      searchQuery: "robot toy",
      requiredTerms: ["robot"],
      avoidTerms: [],
    },
  };
  const request = { clipId: crypto.randomUUID(), cue, words };
  try {
    expect(
      await ai.clipPreparation!.image(request, AbortSignal.timeout(2000)),
    ).toBeNull();
    expect(
      await ai.clipPreparation!.image(request, AbortSignal.timeout(2000)),
    ).toBeNull();
    const legacy = await ai.clipPreparation!.image(
      {
        ...request,
        cue: {
          ...cue,
          illustration: {
            layout: "concept",
            heading: "Retained legacy",
            items: [{ label: "Toy", icon: "box" }],
          },
        },
      },
      AbortSignal.timeout(2000),
    );
    expect(legacy?.origin).toBe("generated");
    expect(legacy?.bytes.subarray(1, 4).toString()).toBe("PNG");
    expect(pictures.find).toHaveBeenCalledTimes(3);
  } finally {
    await ai.close?.(AbortSignal.timeout(2000));
  }
});
it("verifies retrieved-image digests and cancels lookup before exposing bytes", async () => {
  const fixture = await retrievedPictureFixture();
  const pictures = {
    find: vi
      .fn()
      .mockResolvedValue({ ...fixture.asset, sha256: "0".repeat(64) }),
  };
  const ai = createLocalCodexAi({
    files: new WorkspaceFiles("unused-synthetic"),
    media: vi.fn(),
    infer: vi.fn(),
    pictures,
  });
  const request = {
    clipId: crypto.randomUUID(),
    words,
    cue: {
      startFrame: 0,
      endFrame: 90,
      brief: {
        scene: "Synthetic scene",
        searchQuery: "robot toy",
        requiredTerms: ["robot"],
        avoidTerms: [],
      },
      evidenceWordIds: [],
    },
  };
  try {
    await expect(
      ai.clipPreparation!.image(request, AbortSignal.timeout(2000)),
    ).resolves.toBeNull();
    const controller = new AbortController();
    pictures.find.mockImplementationOnce(async () => {
      controller.abort();
      return fixture.asset;
    });
    await expect(
      ai.clipPreparation!.image(request, controller.signal),
    ).rejects.toThrow();
    expect(pictures.find).toHaveBeenCalledTimes(2);
  } finally {
    await ai.close?.(AbortSignal.timeout(2000));
  }
});
it("bounds proposals to the requested analysis pool without rejecting the complete result or retrying", async () => {
  const candidate = {
    startWordId: words[0]!.id,
    endWordId: words[2]!.id,
    titleWordIds: [words[0]!.id],
    hookWordIds: [words[0]!.id],
    evidence: [],
    caveats: [],
  };
  const infer = vi.fn<CodexInference>(async () => ({
    candidates: Array.from({ length: 12 }, () => candidate),
  }));
  const ai = createLocalCodexAi({
    files: new WorkspaceFiles("unused-synthetic"),
    media: vi.fn(),
    infer,
  });
  try {
    expect(
      await ai.analysis!.select(
        words,
        policy,
        AbortSignal.timeout(2000),
        ownerSelectionPolicy(policy, 1),
        1,
      ),
    ).toHaveLength(11);
    expect(infer).toHaveBeenCalledTimes(1);
  } finally {
    await ai.close?.(AbortSignal.timeout(2000));
  }
});
it.each([false, true])(
  "normalizes Codex references to readable copy without another inference (missing references: %s)",
  async (missing) => {
    const infer = vi.fn<CodexInference>(async (request) => {
      expect(request.prompt).toContain("titleWordIds and hookWordIds");
      const schema = JSON.stringify(request.schema);
      expect(schema).toContain('"titleWordIds"');
      expect(schema).not.toContain('"title":{"type":"string"');
      return {
        candidates: [
          {
            startWordId: words[0]!.id,
            endWordId: words[2]!.id,
            titleWordIds: missing ? ["w_999999"] : words.map((word) => word.id),
            hookWordIds: words.slice(0, 2).map((word) => word.id),
            evidence: [{ signal: "self-contained", wordIds: [words[0]!.id] }],
            caveats: [],
          },
        ],
      };
    });
    const media = vi.fn(),
      ai = createLocalCodexAi({
        files: new WorkspaceFiles("unused-synthetic"),
        media,
        infer,
      });
    try {
      const result = await ai.analysis!.select(
        words,
        policy,
        AbortSignal.timeout(2000),
        ownerSelectionPolicy(policy, 1),
        1,
      );
      expect(result[0]?.title).toBe(missing ? "Coral" : "Coral reefs recover.");
      expect(result[0]?.hook).toBe("Coral reefs");
      expect(result[0]?.title).not.toContain("w_");
      expect(infer).toHaveBeenCalledTimes(1);
      expect(media).not.toHaveBeenCalled();
    } finally {
      await ai.close?.(AbortSignal.timeout(2000));
    }
  },
);
it.each(["audio", "invented", "visual-opening"])(
  "uses supported opening/switch evidence and clears invented labels: %s",
  async (mode) => {
    const invented = mode === "invented",
      visualOpening = mode === "visual-opening";
    const root = await mkdtemp(join(tmpdir(), "clipbuilder-codex-ai-test-")),
      files = new WorkspaceFiles(root);
    const cues = Array.from({ length: 10 }, (_, index) => ({
      ...words[0]!,
      text: [
        "Coral",
        "reefs",
        "recover",
        "when",
        "protected.",
        "Ocean",
        "habitats",
        "need",
        "sustained",
        "care.",
      ][index]!,
      punctuatedText: [
        "Coral",
        "reefs",
        "recover",
        "when",
        "protected.",
        "Ocean",
        "habitats",
        "need",
        "sustained",
        "care.",
      ][index]!,
      id: `w_${String(index + 1).padStart(6, "0")}`,
      startMs: index * 400,
      endMs: index * 400 + 350,
      speakerId: index < 5 ? (visualOpening ? null : "spk_0") : "spk_1",
    }));
    const workspace: OwnerWorkspace = {
      id: crypto.randomUUID(),
      revision: 0,
      mode: "provider-ai",
      source: {
        fingerprint: "a".repeat(64),
        bytes: 100,
        durationMs: 4000,
        width: 640,
        height: 360,
        fps: 30,
      },
    };
    const moment: OwnerMoment = {
      id: crypto.randomUUID(),
      processingIdentity: "b".repeat(64),
      cut: { startFrame: 0, endFrame: 120 },
      rangeIds: [],
      evidence: null,
      cues,
    };
    vi.spyOn(files, "codexInput").mockResolvedValue(
      join(root, "artifact.json"),
    );
    vi.spyOn(files, "readCodexInput").mockResolvedValue({
      kind: "frames",
      frames: [{ frame: 0, sampleFrames: [0, 6, 12], jpeg: "/9j/" }],
    });
    const media = vi.fn<Parameters<typeof createLocalCodexAi>[0]["media"]>(
      async (job) => {
        if (job.operation !== "codex-input")
          throw new Error("unexpected_synthetic_job");
        return {
          operation: "codex-input" as const,
          jobId: job.jobId,
          kind: "frames" as const,
          bytes: 100,
          digest: "a".repeat(64),
        };
      },
    );
    const infer = vi.fn<CodexInference>(async (request) => {
      expect(request.prompt).toContain("local audio diarization");
      expect(request.prompt).toContain(
        "each AI-planned picture lasts at most 5 seconds",
      );
      expect(request.prompt).toContain("Leave at least 2 seconds");
      expect(request.prompt).toContain(
        "different explanatory detail of the same passage",
      );
      expect(request.prompt).toContain("Always display the title at the start");
      expect(request.prompt).toContain(
        "visual-only evidence controls the opening crop",
      );
      expect(request.prompt).toContain("excluding the torso");
      expect(request.prompt).toContain(FOCUS_PLANNING_POLICY);
      expect(request.prompt).toContain("No fixed palette");
      expect(request.prompt).toContain(
        "MUST preserve the primary scene's meaning",
      );
      expect(JSON.stringify(request.schema)).toContain('"illustration"');
      expect(request.prompt).toContain(
        "SEARCH FIRST, GENERATED FALLBACK SECOND",
      );
      expect(request.prompt).not.toContain("speakerId must be null");
      expect(JSON.stringify(request.schema)).toContain('"texts"');
      expect(request.prompt).toContain(
        "title words do NOT need to be spoken verbatim",
      );
      expect(request.prompt).toContain("choose the ONE strongest accurate fit");
      return {
        texts: [
          {
            startFrame: 0,
            endFrame: 60,
            wordIds: cues.slice(0, 2).map((word) => word.id),
            title: "POV: Coral reefs get a second chance",
            hookStyle: "pov",
          },
          { startFrame: "invalid" },
        ],
        pictures: [
          {
            startFrame: 0,
            endFrame: 90,
            brief: {
              scene: "Coral reef conservation concept",
              searchQuery: "coral reefs",
              requiredTerms: ["coral", "reefs"],
              avoidTerms: [],
            },
            evidenceWordIds: [cues[0]!.id],
            illustration: {
              layout: "concept",
              heading: "Coral reefs",
              items: [
                { label: "Ocean habitat", icon: "globe" },
                { label: "Protection", icon: "leaf" },
              ],
            },
          },
          { startFrame: 0, endFrame: 90, illustration: { icon: "invalid" } },
        ],
        people: [
          ...[1, 2].map((number) => ({
            id: `person_${number}`,
            observations: [
              {
                startFrame: 0,
                endFrame: 120,
                box: {
                  x: number === 1 ? 0.1 : 0.6,
                  y: 0.1,
                  width: 0.25,
                  height: 0.5,
                },
              },
            ],
          })),
          null,
        ],
        decisions: [
          ...[0, 1].map((index) => ({
            startFrame: index * 60,
            endFrame: (index + 1) * 60,
            personId: visualOpening
              ? `person_${2 - index}`
              : `person_${index + 1}`,
            speakerId: invented
              ? "spk_99"
              : visualOpening && index === 0
                ? null
                : `spk_${index}`,
            evidenceWordIds: cues
              .slice(index * 5, index * 5 + 5)
              .map((word) => word.id),
            confidence: 0.99,
            shotStart: index === 0,
          })),
          null,
        ],
        hookSuggestion: null,
      };
    });
    const fixture = await retrievedPictureFixture();
    const pictures = { find: vi.fn(async () => fixture.asset) };
    const ai = createLocalCodexAi({ files, media, infer, pictures }),
      request = { workspace, moment, clipId: crypto.randomUUID() };
    try {
      const plan = await ai.clipPreparation!.plan(
        request,
        AbortSignal.timeout(2000),
      );
      expect(plan).toHaveLength(1);
      expect(plan[0]).toHaveProperty("illustration");
      expect(ai.clipPreparation!.texts!(request)).toMatchObject([
        {
          text: "POV: Coral reefs get a second chance",
          startFrame: 0,
          endFrame: 93,
        },
      ]);
      const image = await ai.clipPreparation!.image(
        { clipId: request.clipId, cue: plan[0]!, words: cues },
        AbortSignal.timeout(2000),
      );
      expect(image?.origin).toBe("retrieved");
      expect(image?.bytes).toEqual(fixture.bytes);
      expect(pictures.find).toHaveBeenCalledTimes(1);
      const focus = ai.clipPreparation!.focus!(request);
      expect(focus.decisions.map((item) => item.speakerId)).toEqual(
        invented ? [null, null] : [visualOpening ? null : "spk_0", "spk_1"],
      );
      if (visualOpening) {
        expect(focus.shots[0]!.personId).toBe("person_2");
        expect(focus.decisions[0]!.evidenceWordIds).toHaveLength(5);
        expect(cues.slice(0, 5).every((cue) => cue.speakerId === null)).toBe(
          true,
        );
        expect(
          focus.shots.some(
            (shot) => shot.personId === "person_1" && shot.reason === "speaker",
          ),
        ).toBe(true);
      }
      expect(
        focus.shots.some(
          (shot) => shot.personId === "person_2" && shot.reason === "speaker",
        ),
      ).toBe(!invented && !visualOpening);
      expect(infer).toHaveBeenCalledTimes(1);
      expect(media).toHaveBeenCalledTimes(1);
      expect(media.mock.calls[0]![0]).toMatchObject({
        operation: "codex-input",
        kind: "frames",
        ...(visualOpening ? {} : { speakerChanges: [60] }),
      });
      if (visualOpening)
        expect(media.mock.calls[0]![0]).not.toHaveProperty("speakerChanges");
    } finally {
      await ai.close?.(AbortSignal.timeout(2000));
      await rm(root, { recursive: true, force: true });
    }
  },
);
