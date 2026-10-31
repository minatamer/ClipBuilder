import { z } from "zod";
import { ownerIdSchema } from "./policy.ts";

export const codexStepIdSchema = z.enum([
  "inspect",
  "audio",
  "transcription",
  "speakers",
  "frames",
  "selection",
  "planning",
  "pictures",
  "preview",
]);
export type CodexStepId = z.infer<typeof codexStepIdSchema>;
export const codexProgressStepSchema = z
  .object({
    id: codexStepIdSchema,
    state: z.enum(["pending", "running", "done", "failed", "canceled"]),
    elapsedMs: z.number().int().min(0).max(86400000),
  })
  .strict();
export type CodexProgressStep = z.infer<typeof codexProgressStepSchema>;
export const codexProgressStepsSchema = z
  .array(codexProgressStepSchema)
  .max(9)
  .refine(
    (steps) => new Set(steps.map((step) => step.id)).size === steps.length,
  );
export const codexProgressSchema = z
  .object({
    runId: ownerIdSchema,
    clipId: ownerIdSchema.optional(),
    steps: codexProgressStepsSchema,
  })
  .strict();
export type CodexProgress = z.infer<typeof codexProgressSchema>;

export const CODEX_TIMING_OPERATION = {
  inspect: "codex_inspect",
  audio: "codex_audio",
  transcription: "codex_transcription",
  speakers: "codex_speakers",
  frames: "codex_frames",
  selection: "codex_selection",
  planning: "codex_planning",
  pictures: "codex_pictures",
  preview: "codex_preview",
} as const;
