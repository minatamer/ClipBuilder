import { z } from "zod";
import { ownerAudioAssetSchema } from "./audio.ts";
import { localCodexJobSchema, localCodexReceiptSchema } from "./codex.ts";
import { OWNER_PRESENTATION_MAX_FRAMES } from "./hook.ts";

import {
  OWNER_LIMITS,
  OWNER_FPS,
  ownerIdSchema,
  ownerCutSchema,
  ownerAiModeSchema,
} from "./policy.ts";
import {
  ownerOverlaySchema,
  ownerOutputRevisionSchema,
  ownerClipPreviewSchema,
} from "./clips.ts";
import { ownerAcquisitionDescriptorSchema } from "./acquisition-profile.ts";
export {
  OWNER_LIMITS,
  ownerIdSchema,
  OWNER_FPS,
  ownerCutSchema,
  type OwnerCut,
} from "./policy.ts";
export const ownerSourceSchema = z
  .object({
    fingerprint: z.string().regex(/^[a-f0-9]{64}$/),
    bytes: z.number().int().positive().max(OWNER_LIMITS.sourceBytes),
    durationMs: z.number().int().min(1000).max(OWNER_LIMITS.sourceMs),
    width: z.number().int().positive().max(3840),
    height: z.number().int().positive().max(3840),
    fps: z.number().finite().min(12).max(60),
  })
  .strict()
  .refine((s) => s.width * s.height <= 3840 * 2160);
export type OwnerSource = z.infer<typeof ownerSourceSchema>;

export const ownerWorkspaceSchema = z
  .object({
    id: ownerIdSchema,
    source: ownerSourceSchema,
    mode: z.union([ownerAiModeSchema, z.literal("unavailable")]),
    revision: z.number().int().nonnegative(),
  })
  .strict();
export type OwnerWorkspace = z.infer<typeof ownerWorkspaceSchema>;

/** Fixed local provider-input budgets; these do not enable provider dispatch. */
export const OWNER_PROVIDER_MEDIA = {
  bytes: 16 * 1024 ** 2,
  audioSampleRate: 16_000,
  audioBitrate: 32_000,
  videoBitrate: 200_000,
  videoFps: 12,
  videoEdge: 640,
} as const;

export const ownerMediaJobSchema = z.discriminatedUnion("operation", [
  localCodexJobSchema,
  z
    .object({
      operation: z.literal("normalize-audio"),
      workspaceId: ownerIdSchema,
      jobId: ownerIdSchema,
      assetId: ownerIdSchema,
    })
    .strict(),
  z
    .object({
      workspaceId: ownerIdSchema,
      jobId: ownerIdSchema,
      operation: z.literal("clip-preview"),
      clipId: ownerIdSchema,
      cut: ownerCutSchema,
      fingerprint: ownerSourceSchema.shape.fingerprint,
    })
    .strict(),
  z
    .object({
      workspaceId: ownerIdSchema,
      jobId: ownerIdSchema,
      operation: z.literal("prepare-owner-audio"),
      fingerprint: ownerSourceSchema.shape.fingerprint,
      clipId: ownerIdSchema.optional(),
      cut: ownerCutSchema.optional(),
    })
    .strict()
    .refine((job) => Boolean(job.clipId) === Boolean(job.cut)),
  z
    .object({
      workspaceId: ownerIdSchema,
      jobId: ownerIdSchema,
      operation: z.literal("prepare-owner-video"),
      clipId: ownerIdSchema,
      cut: ownerCutSchema,
      fingerprint: ownerSourceSchema.shape.fingerprint,
    })
    .strict(),
  z
    .object({
      workspaceId: ownerIdSchema,
      jobId: ownerIdSchema.optional(),
      operation: z.literal("synthesize-acquisition"),
      expected: ownerAcquisitionDescriptorSchema,
    })
    .strict(),
  z
    .object({
      workspaceId: ownerIdSchema,
      jobId: ownerIdSchema.optional(),
      operation: z.literal("prepare-acquisition"),
      expected: ownerAcquisitionDescriptorSchema,
      combined: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      workspaceId: ownerIdSchema,
      jobId: ownerIdSchema.optional(),
      operation: z.literal("inspect-acquisition"),
      expected: ownerAcquisitionDescriptorSchema,
    })
    .strict(),
  z
    .object({
      workspaceId: ownerIdSchema,
      operation: z.literal("inspect"),
      jobId: ownerIdSchema.optional(),
    })
    .strict(),
  z
    .object({
      workspaceId: ownerIdSchema,
      operation: z.literal("clip"),
      jobId: ownerIdSchema,
      clipId: ownerIdSchema,
      renderRevision: ownerOutputRevisionSchema,
      cut: ownerCutSchema,
      fingerprint: ownerSourceSchema.shape.fingerprint,
      overlay: ownerOverlaySchema,
    })
    .strict()
    .refine(
      (job) => job.overlay.frames === job.cut.endFrame - job.cut.startFrame,
    ),
  z
    .object({
      workspaceId: ownerIdSchema,
      operation: z.literal("portrait"),
      jobId: ownerIdSchema.optional(),
      cut: ownerCutSchema,
      fingerprint: ownerSourceSchema.shape.fingerprint,
    })
    .strict(),
]);
export type OwnerMediaJob = z.infer<typeof ownerMediaJobSchema>;
export const ownerMediaResultSchema = z.discriminatedUnion("operation", [
  localCodexReceiptSchema,
  z
    .object({
      operation: z.literal("normalize-audio"),
      asset: ownerAudioAssetSchema,
    })
    .strict(),
  ownerClipPreviewSchema
    .extend({
      operation: z.literal("clip-preview"),
      durationMs: z.number().int().positive().max(OWNER_LIMITS.clipMs),
    })
    .strict(),
  z
    .object({
      operation: z.literal("prepare-owner-audio"),
      bytes: z.number().int().positive().max(OWNER_PROVIDER_MEDIA.bytes),
      durationMs: z.number().int().min(1000).max(OWNER_LIMITS.sourceMs),
      digest: ownerSourceSchema.shape.fingerprint,
    })
    .strict(),
  z
    .object({
      operation: z.literal("prepare-owner-video"),
      bytes: z.number().int().positive().max(OWNER_PROVIDER_MEDIA.bytes),
      durationMs: z.number().int().positive().max(OWNER_LIMITS.clipMs),
      digest: ownerSourceSchema.shape.fingerprint,
    })
    .strict(),
  z
    .object({
      operation: z.enum([
        "synthesize-acquisition",
        "prepare-acquisition",
        "inspect-acquisition",
      ]),
      source: ownerSourceSchema,
      descriptor: ownerAcquisitionDescriptorSchema,
    })
    .strict(),
  z
    .object({
      operation: z.literal("clip"),
      bytes: z.number().int().positive().max(OWNER_LIMITS.outputBytes),
      frames: z.number().int().positive().max(OWNER_PRESENTATION_MAX_FRAMES),
      durationMs: z
        .number()
        .int()
        .positive()
        .max((OWNER_PRESENTATION_MAX_FRAMES * 1000) / OWNER_FPS),
    })
    .strict(),
  z
    .object({ operation: z.literal("inspect"), source: ownerSourceSchema })
    .strict(),
  z
    .object({
      operation: z.literal("portrait"),
      bytes: z.number().int().positive().max(OWNER_LIMITS.outputBytes),
      durationMs: z.number().int().positive(),
      frames: z.number().int().positive(),
    })
    .strict(),
]);
export type OwnerMediaResult = z.infer<typeof ownerMediaResultSchema>;
export type OwnerProviderMediaResult = Extract<
  OwnerMediaResult,
  { operation: "prepare-owner-audio" | "prepare-owner-video" }
>;
