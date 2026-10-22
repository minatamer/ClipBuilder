import { z } from "zod";

import { OWNER_LIMITS, ownerIdSchema, ownerCutSchema } from "./policy.ts";
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
    mode: z.literal("synthetic-ai"),
    revision: z.number().int().nonnegative(),
  })
  .strict();
export type OwnerWorkspace = z.infer<typeof ownerWorkspaceSchema>;

export const ownerMediaJobSchema = z.discriminatedUnion("operation", [
  z
    .object({ workspaceId: ownerIdSchema, operation: z.literal("inspect") })
    .strict(),
  z
    .object({
      workspaceId: ownerIdSchema,
      operation: z.literal("portrait"),
      cut: ownerCutSchema,
      fingerprint: ownerSourceSchema.shape.fingerprint,
    })
    .strict(),
]);
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
      frames: z.number().int().positive(),
    })
    .strict(),
]);
export type OwnerMediaResult = z.infer<typeof ownerMediaResultSchema>;
