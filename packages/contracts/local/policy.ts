import { z } from "zod";

/** Local-only policy; public contracts and defaults remain independent. */
export const OWNER_LIMITS = {
  sourceBytes: 10 * 1024 ** 3,
  sourceMs: 60 * 60 * 1000,
  clipMs: 300_000,
  ranges: 10,
  suggestions: 10,
  clips: 10,
  scratchBytes: 20 * 1024 ** 3,
  reserveBytes: 10 * 1024 ** 3,
  libraryWarningBytes: 50 * 1024 ** 3,
  outputBytes: 1024 ** 3,
  workspaceMs: 2 * 60 * 60 * 1000,
  jsonBytes: 1024 * 1024,
} as const;
export const OWNER_DEFAULT_AI_COUNT = 4;
export const OWNER_MAX_REQUESTED_CLIP_MS = 60_000;
export const OWNER_FPS = 30;
export const ownerAiModeSchema = z.enum(["synthetic-ai", "provider-ai"]);
export type OwnerAiMode = z.infer<typeof ownerAiModeSchema>;
export const ownerIdSchema = z.uuid();
export const ownerCutSchema = z
  .object({
    startFrame: z.number().int().nonnegative(),
    endFrame: z.number().int().positive(),
  })
  .strict()
  .refine(
    (cut) =>
      cut.endFrame > cut.startFrame &&
      cut.endFrame - cut.startFrame <=
        (OWNER_LIMITS.clipMs * OWNER_FPS) / 1000 &&
      cut.endFrame <= (OWNER_LIMITS.sourceMs * OWNER_FPS) / 1000,
  );
export type OwnerCut = z.infer<typeof ownerCutSchema>;
