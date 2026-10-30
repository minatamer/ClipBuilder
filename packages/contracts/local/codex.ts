import { z } from "zod";
import {
  wordIdSchema,
  candidateEvidenceSchema,
  candidateCaveatSchema,
} from "@clipbuilder/contracts";
import {
  ownerCutSchema,
  ownerIdSchema,
  OWNER_FPS,
  OWNER_LIMITS,
} from "./policy.ts";
import { ownerWordsSchema } from "./selection.ts";
import { ownerFocusPersonSchema, ownerFocusDecisionSchema } from "./focus.ts";
import { ownerHookSchema } from "./hook.ts";
import { ownerClipPlanSchema, OWNER_BATCH_POLICY } from "./clips.ts";
import { ownerAuthoredTextPlanSchema } from "./text-layers.ts";

export const LOCAL_CODEX_POLICY = {
  frames: 60,
  imageBytes: 96 * 1024,
  artifactBytes: 12 * 1024 ** 2,
  responseBytes: 4 * 1024 ** 2,
  inputBytes: 16 * 1024 ** 2,
  speechTimeoutMs: 45 * 60_000,
  frameTimeoutMs: 180_000,
  inferenceTimeoutMs: 360_000,
} as const;
export const localCodexFailureSchema = z.enum([
  "codex_unavailable",
  "codex_login_required",
  "codex_subscription_required",
  "codex_response_invalid",
  "codex_process_failed",
  "codex_limit",
  "local_speech_unavailable",
]);
export const localCodexJobSchema = z
  .object({
    operation: z.literal("codex-input"),
    workspaceId: ownerIdSchema,
    jobId: ownerIdSchema,
    kind: z.enum(["speech", "frames"]),
    fingerprint: z.string().regex(/^[a-f0-9]{64}$/),
    cut: ownerCutSchema.optional(),
    speakerChanges: z
      .array(
        z
          .number()
          .int()
          .positive()
          .max((OWNER_LIMITS.clipMs * OWNER_FPS) / 1000),
      )
      .max(LOCAL_CODEX_POLICY.frames)
      .optional(),
  })
  .strict()
  .refine((job) => job.kind === "speech" || !!job.cut)
  .refine(
    (job) =>
      job.speakerChanges === undefined ||
      (job.kind === "frames" &&
        !!job.cut &&
        job.speakerChanges.every(
          (frame, index, changes) =>
            frame < job.cut!.endFrame - job.cut!.startFrame &&
            (index === 0 || frame > changes[index - 1]!),
        )),
  );
export type LocalCodexJob = z.infer<typeof localCodexJobSchema>;
export const localCodexReceiptSchema = z
  .object({
    operation: z.literal("codex-input"),
    jobId: ownerIdSchema,
    kind: z.enum(["speech", "frames"]),
    bytes: z.number().int().positive().max(LOCAL_CODEX_POLICY.artifactBytes),
    digest: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();
export type LocalCodexReceipt = z.infer<typeof localCodexReceiptSchema>;
export const localCodexFrameSchema = z
  .object({
    sampleFrames: z
      .array(
        z
          .number()
          .int()
          .nonnegative()
          .max((OWNER_LIMITS.clipMs * OWNER_FPS) / 1000),
      )
      .length(3)
      .optional(),
    frame: z
      .number()
      .int()
      .nonnegative()
      .max((OWNER_LIMITS.clipMs * OWNER_FPS) / 1000),
    jpeg: z
      .string()
      .min(4)
      .max(Math.ceil(LOCAL_CODEX_POLICY.imageBytes / 3) * 4)
      .regex(/^[A-Za-z0-9+/]+={0,2}$/),
  })
  .strict();
export const localCodexArtifactSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("speech"), words: ownerWordsSchema }).strict(),
  z
    .object({
      kind: z.literal("frames"),
      frames: z
        .array(localCodexFrameSchema)
        .min(1)
        .max(LOCAL_CODEX_POLICY.frames),
    })
    .strict(),
]);
export type LocalCodexArtifact = z.infer<typeof localCodexArtifactSchema>;
export const localCodexCandidatesSchema = z
  .object({
    candidates: z
      .array(
        z
          .object({
            startWordId: wordIdSchema,
            endWordId: wordIdSchema,
            titleWordIds: z.array(wordIdSchema).min(1).max(40),
            hookWordIds: z.array(wordIdSchema).min(1).max(40),
            evidence: z
              .array(
                candidateEvidenceSchema.pick({ signal: true, wordIds: true }),
              )
              .max(8),
            caveats: z.array(candidateCaveatSchema.shape.code).max(3),
          })
          .strict(),
      )
      .max(OWNER_LIMITS.suggestions + OWNER_LIMITS.ranges),
  })
  .strict();
export const localCodexFocusSchema = z
  .object({
    people: z.array(ownerFocusPersonSchema).max(8),
    decisions: z.array(ownerFocusDecisionSchema).max(120),
    hookSuggestion: ownerHookSchema.nullable(),
    pictures: z
      .array(
        ownerClipPlanSchema.element
          .omit({ illustration: true })
          .extend({
            alternateBriefs:
              ownerClipPlanSchema.element.shape.alternateBriefs.unwrap(),
          })
          .strict(),
      )
      .max(OWNER_BATCH_POLICY.imageAttemptsPerClip),
    texts: ownerAuthoredTextPlanSchema,
  })
  .strict();
