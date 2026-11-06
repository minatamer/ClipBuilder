import { z } from "zod";
import { ownerIdSchema } from "./policy.ts";
import { ownerHookSchema } from "./hook.ts";
import { ownerTextLayerSchema } from "./text-layers.ts";

export const OWNER_HOOK_TITLE_LIMIT = 12;
export const OWNER_HOOK_TITLE_SETTLE_MS = 900;
export const ownerHookTitleRequestSchema = z
  .object({
    operationId: ownerIdSchema,
    expectedRevision: z.number().int().nonnegative(),
    sourceRevision: z.number().int().nonnegative(),
    hook: ownerHookSchema,
  })
  .strict();
export const ownerHookTitleResultSchema = z
  .object({
    clipId: ownerIdSchema,
    expectedRevision: z.number().int().nonnegative(),
    sourceRevision: z.number().int().nonnegative(),
    hook: ownerHookSchema,
    title: ownerTextLayerSchema.nullable(),
  })
  .strict()
  .refine(
    (value) =>
      !value.title ||
      (value.title.role === "opening-title" &&
        value.title.startFrame === 0 &&
        value.title.endFrame <= value.hook.endFrame - value.hook.startFrame),
    { message: "Title must fit the selected Hook." },
  );
export type OwnerHookTitleResult = z.infer<typeof ownerHookTitleResultSchema>;
