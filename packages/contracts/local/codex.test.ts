import { expect, it } from "vitest";
import {
  localCodexJobSchema,
  localCodexArtifactSchema,
  LOCAL_CODEX_POLICY,
  localCodexFocusSchema,
} from "./codex.ts";
import { ownerMediaJobSchema, ownerMediaResultSchema } from "./index.ts";
import { ownerRuntimeCapabilitiesSchema } from "./runtime.ts";
import { ownerClipPlanSchema } from "./clips.ts";
it("separates ASR-only discovery from selected-cut speaker assignment without admitting unbounded inputs", () => {
  const base = {
    operation: "codex-input",
    workspaceId: crypto.randomUUID(),
    jobId: crypto.randomUUID(),
    fingerprint: "a".repeat(64),
  };
  const words = [
    {
      id: "w_000001",
      text: "Synthetic",
      punctuatedText: "Synthetic",
      startMs: 100,
      endMs: 700,
      speakerId: null,
      confidence: null,
    },
  ];
  expect(
    localCodexJobSchema.parse({ ...base, kind: "speech", diarize: false }),
  ).toMatchObject({ diarize: false });
  const job = {
    ...base,
    kind: "speakers",
    cut: { startFrame: 30, endFrame: 60 },
    words,
  };
  expect(localCodexJobSchema.safeParse(job).success).toBe(true);
  for (const invalid of [
    { ...job, cut: undefined },
    { ...job, words: undefined },
    { ...job, words: [{ ...words[0], endMs: 1001 }] },
    { ...job, diarize: false },
    { ...base, kind: "speech", words },
    { ...base, kind: "frames", cut: job.cut, diarize: false },
  ])
    expect(localCodexJobSchema.safeParse(invalid).success).toBe(false);
});
it("requests a search brief and bounded generated fallback in the same planning call", () => {
  const cue = {
    startFrame: 0,
    endFrame: 60,
    evidenceWordIds: ["w_000001"],
    brief: {
      scene: "A playful robot toy",
      searchQuery: "robot toy",
      requiredTerms: ["robot"],
      avoidTerms: [],
    },
  };
  const illustration = {
    layout: "concept",
    heading: "Toy",
    items: [{ label: "Play", icon: "box" }],
  };
  expect(
    localCodexFocusSchema.shape.pictures.element.parse({
      ...cue,
      alternateBriefs: [],
      illustration,
    }),
  ).toEqual({ ...cue, alternateBriefs: [], illustration });
  expect(localCodexFocusSchema.shape.pictures.element.shape).toHaveProperty(
    "illustration",
  );
  expect(
    ownerClipPlanSchema.parse([
      {
        ...cue,
        illustration: {
          layout: "concept",
          heading: "Legacy",
          items: [{ label: "Toy", icon: "box" }],
        },
      },
    ]),
  ).toHaveLength(1);
});
it("admits only bounded ordered clip-relative speaker hints on frame jobs", () => {
  const job = {
    operation: "codex-input",
    workspaceId: crypto.randomUUID(),
    jobId: crypto.randomUUID(),
    fingerprint: "a".repeat(64),
    kind: "frames",
    cut: { startFrame: 300, endFrame: 600 },
    speakerChanges: [1, 150, 299],
  };
  expect(localCodexJobSchema.parse(job)).toEqual(job);
  for (const speakerChanges of [
    [0],
    [-1],
    [300],
    [1.5],
    [NaN],
    [20, 10],
    [10, 10],
    Array.from({ length: 61 }, (_, i) => i + 1),
  ]) {
    expect(
      localCodexJobSchema.safeParse({ ...job, speakerChanges }).success,
    ).toBe(false);
  }
  expect(
    localCodexJobSchema.safeParse({ ...job, kind: "speech" }).success,
  ).toBe(false);
  expect(
    localCodexJobSchema.safeParse({
      ...job,
      kind: "speech",
      speakerChanges: [],
    }).success,
  ).toBe(false);
});
it("admits only bounded speech/frame jobs and keeps local provider metadata out of hosted capabilities", () => {
  const job = {
    operation: "codex-input",
    workspaceId: crypto.randomUUID(),
    jobId: crypto.randomUUID(),
    fingerprint: "a".repeat(64),
    kind: "speech",
  };
  expect(ownerMediaJobSchema.parse(job)).toEqual(job);
  expect(
    localCodexJobSchema.safeParse({ ...job, kind: "frames" }).success,
  ).toBe(false);
  expect(
    localCodexJobSchema.safeParse({ ...job, executable: "untrusted" }).success,
  ).toBe(false);
  expect(
    localCodexJobSchema.safeParse({
      ...job,
      kind: "frames",
      cut: { startFrame: 0, endFrame: 30 },
    }).success,
  ).toBe(true);
  expect(
    localCodexArtifactSchema.safeParse({
      kind: "frames",
      frames: [{ frame: 0, sampleFrames: [0, 6], jpeg: "AAAA" }],
    }).success,
  ).toBe(false);
  expect(
    localCodexArtifactSchema.safeParse({
      kind: "frames",
      frames: Array.from({ length: LOCAL_CODEX_POLICY.frames + 1 }, () => ({
        frame: 0,
        jpeg: "AAAA",
      })),
    }).success,
  ).toBe(false);
  expect(
    ownerMediaResultSchema.safeParse({
      operation: "codex-input",
      jobId: job.jobId,
      kind: "speech",
      bytes: LOCAL_CODEX_POLICY.artifactBytes + 1,
      digest: "b".repeat(64),
    }).success,
  ).toBe(false);
  const local = {
    aiMode: "provider-ai",
    sourceMode: null,
    planningAvailable: true,
    captionGeneration: true,
    localMedia: true,
    cloud: false,
    aiProvider: "codex",
    aiSetup: "ready",
    captionProvider: "local-speech",
  };
  expect(ownerRuntimeCapabilitiesSchema.safeParse(local).success).toBe(true);
  expect(
    ownerRuntimeCapabilitiesSchema.safeParse({
      ...local,
      execution: "hosted",
      localMedia: false,
      cloud: true,
    }).success,
  ).toBe(false);
});
