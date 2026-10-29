import { expect, it, vi } from "vitest";
import { createLocalCodexAi } from "./codex-ai.ts";
import { WorkspaceFiles } from "./workspace-files.ts";
import { ownerSelectionPolicy } from "./selection-policy.ts";
import type { CodexInference } from "./codex-exec.ts";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { OwnerMoment } from "../../../packages/contracts/local/selection.ts";
import type { OwnerWorkspace } from "../../../packages/contracts/local/index.ts";

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
it.each([false, true])(
  "uses audio-backed speaker evidence for sustained camera changes and clears invented labels: %s",
  async (invented) => {
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
      speakerId: index < 5 ? "spk_0" : "spk_1",
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
      expect(request.prompt).not.toContain("speakerId must be null");
      expect(JSON.stringify(request.schema)).toContain('"texts"');
      return {
        texts: [
          {
            startFrame: 0,
            endFrame: 60,
            wordIds: cues.slice(0, 2).map((word) => word.id),
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
            personId: `person_${index + 1}`,
            speakerId: invented ? "spk_99" : `spk_${index}`,
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
    const ai = createLocalCodexAi({ files, media, infer }),
      request = { workspace, moment, clipId: crypto.randomUUID() };
    try {
      const plan = await ai.clipPreparation!.plan(
        request,
        AbortSignal.timeout(2000),
      );
      expect(plan).toHaveLength(1);
      expect(ai.clipPreparation!.texts!(request)).toMatchObject([
        { text: "Coral reefs", startFrame: 0, endFrame: 60 },
      ]);
      const image = await ai.clipPreparation!.image(
        { clipId: request.clipId, cue: plan[0]!, words: cues },
        AbortSignal.timeout(2000),
      );
      expect(image?.origin).toBe("generated");
      expect(image?.bytes.subarray(1, 4).toString()).toBe("PNG");
      const focus = ai.clipPreparation!.focus!(request);
      expect(focus.decisions.map((item) => item.speakerId)).toEqual(
        invented ? [null, null] : ["spk_0", "spk_1"],
      );
      expect(
        focus.shots.some(
          (shot) => shot.personId === "person_2" && shot.reason === "speaker",
        ),
      ).toBe(!invented);
      expect(infer).toHaveBeenCalledTimes(1);
      expect(media).toHaveBeenCalledTimes(1);
    } finally {
      await ai.close?.(AbortSignal.timeout(2000));
      await rm(root, { recursive: true, force: true });
    }
  },
);
