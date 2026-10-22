import { z } from "zod";

/** Local-only; deliberately absent from the public contracts entrypoint/build. */
export const OWNER_LIMITS = {
  sourceBytes: 10 * 1024 ** 3,
  sourceMs: 60 * 60 * 1000,
  clipMs: 300_000,
  ranges: 10,
  suggestions: 4,
  clips: 10,
  scratchBytes: 20 * 1024 ** 3,
  reserveBytes: 10 * 1024 ** 3,
  libraryWarningBytes: 50 * 1024 ** 3,
  outputBytes: 1024 ** 3,
  workspaceMs: 2 * 60 * 60 * 1000,
  jsonBytes: 1024 * 1024,
} as const;

export const ownerIdSchema = z.uuid();
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
    mode: z.literal("synthetic-ai"),
    revision: z.number().int().nonnegative(),
  })
  .strict();
export type OwnerWorkspace = z.infer<typeof ownerWorkspaceSchema>;

export const ownerMediaJobSchema = z
  .object({
    workspaceId: ownerIdSchema,
    operation: z.enum(["inspect", "portrait"]),
  })
  .strict();
export type OwnerMediaJob = z.infer<typeof ownerMediaJobSchema>;
export const ownerMediaResultSchema = z.discriminatedUnion("operation", [
  z
    .object({ operation: z.literal("inspect"), source: ownerSourceSchema })
    .strict(),
  z
    .object({
      operation: z.literal("portrait"),
      bytes: z.number().int().positive().max(OWNER_LIMITS.outputBytes),
      durationMs: z.number().int().positive(),
    })
    .strict(),
]);
export type OwnerMediaResult = z.infer<typeof ownerMediaResultSchema>;
