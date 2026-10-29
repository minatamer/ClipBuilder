import { expect, it } from "vitest";
import {
  localCodexJobSchema,
  localCodexArtifactSchema,
  LOCAL_CODEX_POLICY,
} from "./codex.ts";
import { ownerMediaJobSchema, ownerMediaResultSchema } from "./index.ts";
import { ownerRuntimeCapabilitiesSchema } from "./runtime.ts";
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
