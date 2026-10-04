import { z } from "zod";

// Private connection metadata and recorded approvals, never numerical policy.
export const runtimeSettingsSchema = z
  .object({
    appEnvironment: z.enum(["local", "preview", "production"]).default("local"),
    revision: z.string().max(80).default(""),
    frontendOrigin: z.string().default("http://localhost:3000"),
    backendOrigin: z.string().default("http://localhost:4000"),
    backendAudience: z.string().max(500).default(""),
    rendererOrigin: z.string().max(500).default(""),
    retainedSample: z
      .object({
        bucket: z.string().min(1).max(223),
        object: z.string().min(1).max(1024),
        generation: z.string().regex(/^[1-9]\d{0,29}$/),
        bytes: z.number().int().positive(),
      })
      .strict()
      .nullable()
      .default(null),
    paidValidationStage: z
      .enum(["disabled", "analysis", "assembly", "render"])
      .default("disabled"),
    turnstileHostname: z.string().max(253).default(""),
    approvals: z
      .object({
        cloudSpend: z.boolean().default(false),
        geminiTransfer: z.boolean().default(false),
        paidProject: z.boolean().default(false),
      })
      .strict()
      .prefault({}),
  })
  .strict();

export type RuntimeSettings = z.input<typeof runtimeSettingsSchema>;
