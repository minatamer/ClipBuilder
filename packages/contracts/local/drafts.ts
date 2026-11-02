import { z } from "zod";
import { ownerWorkspaceSchema } from "./index.ts";
import { ownerAnalysisSchema } from "./selection.ts";
import { ownerClipSchema } from "./clips.ts";
import { ownerIdSchema } from "./policy.ts";
import { ownerDigestSchema } from "./assets.ts";

export const OWNER_DRAFT_DOCUMENT_BYTES = 32 * 1024 ** 2;
/** Only identity is read from a selected manifest; supplied paths are ignored. */
export const ownerPickedDraftFileSchema = z.object({
  version: z.literal(1),
  id: ownerIdSchema,
  source: z.object({ digest: ownerDigestSchema }),
});
export const ownerPickedDraftRequestSchema = z
  .object({
    id: ownerIdSchema,
    sourceFingerprint: ownerDigestSchema,
  })
  .strict();
export const ownerPickedFileResultSchema = z
  .object({
    kind: z.enum(["draft", "video"]),
    workspace: ownerWorkspaceSchema,
    clipId: ownerIdSchema.nullable(),
  })
  .strict();
export type OwnerPickedFileResult = z.infer<typeof ownerPickedFileResultSchema>;

export const ownerDraftSnapshotSchema = z
  .object({
    version: z.literal(1),
    workspace: ownerWorkspaceSchema,
    analysis: ownerAnalysisSchema.nullable(),
    clips: z.array(ownerClipSchema),
  })
  .strict();
export type OwnerDraftSnapshot = z.infer<typeof ownerDraftSnapshotSchema>;
export const ownerDraftSummarySchema = z
  .object({
    id: ownerIdSchema,
    savedAt: z.string().datetime(),
    clips: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  })
  .strict();
export const ownerDraftListSchema = z.array(ownerDraftSummarySchema).max(200);
export type OwnerDraftSummary = z.infer<typeof ownerDraftSummarySchema>;
export const ownerDraftStatusSchema = z
  .object({
    id: ownerIdSchema.nullable(),
    state: z.enum(["session-only", "saved", "saving", "unsaved"]),
    savedAt: z.string().datetime().nullable(),
  })
  .strict();
export type OwnerDraftStatus = z.infer<typeof ownerDraftStatusSchema>;
export const ownerWorkspaceClearRequestSchema = z
  .object({ discardUnsaved: z.literal(true) })
  .strict();
