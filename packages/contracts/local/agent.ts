import { z } from "zod";
import { ownerIdSchema, OWNER_LIMITS } from "./policy.ts";
import { ownerWorkspaceSchema } from "./index.ts";
import {
  ownerClipSchema,
  ownerClipRenderRequestSchema,
  ownerOverlaySchema,
} from "./clips.ts";
import { ownerDigestSchema } from "./assets.ts";
import { ownerCaptionStyleSchema, ownerEditRequestSchema } from "./editor.ts";
import { ownerDraftListSchema, ownerDraftStatusSchema } from "./drafts.ts";

const target = { workspaceId: ownerIdSchema, clipId: ownerIdSchema };
export const ownerAgentCommandSchema = z.discriminatedUnion("command", [
  z.object({ command: z.literal("status") }).strict(),
  z.object({ command: z.literal("inspect"), ...target }).strict(),
  z
    .object({
      command: z.literal("validate"),
      ...target,
      request: ownerEditRequestSchema,
    })
    .strict(),
  z
    .object({
      command: z.literal("apply"),
      ...target,
      request: ownerEditRequestSchema,
    })
    .strict(),
  z
    .object({
      command: z.literal("picture"),
      ...target,
      path: z.string().min(1).max(4096),
    })
    .strict(),
  z
    .object({
      command: z.literal("render"),
      ...target,
      request: ownerClipRenderRequestSchema,
    })
    .strict(),
  z.object({ command: z.literal("cancel"), ...target }).strict(),
  z.object({ command: z.literal("drafts") }).strict(),
  z
    .object({ command: z.literal("open-draft"), draftId: ownerIdSchema })
    .strict(),
  z.object({ command: z.literal("save"), workspaceId: ownerIdSchema }).strict(),
]);
export type OwnerAgentCommand = z.infer<typeof ownerAgentCommandSchema>;

/** No source path, dialogue, caption words, provider payload or capability. */
export const ownerAgentClipSchema = ownerClipSchema
  .pick({
    id: true,
    momentId: true,
    analysisId: true,
    mode: true,
    sourceRevision: true,
    revision: true,
    baseHash: true,
    state: true,
    assets: true,
    outputs: true,
    calls: true,
    error: true,
  })
  .extend({
    captions: ownerCaptionStyleSchema.nullable(),
    videoLook: ownerOverlaySchema.shape.videoLook,
    visuals: ownerOverlaySchema.shape.visuals,
    overlayHash: ownerDigestSchema.nullable(),
  })
  .strict();
export const ownerAgentClipListSchema = z
  .object({
    clips: z.array(ownerAgentClipSchema).max(OWNER_LIMITS.clips),
    active: z.boolean(),
    workers: z.literal(1),
  })
  .strict();
export const ownerAgentStatusSchema = z
  .object({
    workspace: ownerWorkspaceSchema.nullable(),
    active: z.boolean(),
    clips: z.array(ownerAgentClipSchema).max(OWNER_LIMITS.clips),
  })
  .strict();
export const ownerAgentValidationSchema = z
  .object({
    clipId: ownerIdSchema,
    sourceRevision: z.number().int().nonnegative(),
    expectedRevision: z.number().int().nonnegative(),
    nextRevision: z.number().int().positive(),
    baseHash: ownerDigestSchema,
    overlayHash: ownerDigestSchema,
    captions: ownerCaptionStyleSchema.nullable(),
    videoLook: ownerOverlaySchema.shape.videoLook,
    visuals: ownerOverlaySchema.shape.visuals,
  })
  .strict();
export const ownerAgentResultSchema = z.discriminatedUnion("kind", [
  z
    .object({ kind: z.literal("status"), status: ownerAgentStatusSchema })
    .strict(),
  z.object({ kind: z.literal("clip"), clip: ownerAgentClipSchema }).strict(),
  z
    .object({
      kind: z.literal("validation"),
      validation: ownerAgentValidationSchema,
    })
    .strict(),
  z
    .object({ kind: z.literal("drafts"), drafts: ownerDraftListSchema })
    .strict(),
  z
    .object({ kind: z.literal("draft"), draft: ownerDraftStatusSchema })
    .strict(),
  z
    .object({ kind: z.literal("opened"), workspace: ownerWorkspaceSchema })
    .strict(),
]);
export type OwnerAgentResult = z.infer<typeof ownerAgentResultSchema>;
