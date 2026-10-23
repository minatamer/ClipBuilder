import { z } from "zod";
export const ownerAcquisitionNativeStageSchema = z.enum([
  "video",
  "audio",
  "merging",
  "inspecting",
]);
export type OwnerAcquisitionNativeStage = z.infer<
  typeof ownerAcquisitionNativeStageSchema
>;
import { OWNER_LIMITS } from "./policy.ts";

/** Owner-only acquisition budgets; these do not enable network or tools. */
export const OWNER_ACQUISITION_LIMITS = {
  metadataMs: 90_000,
  transferMs: 2 * 60 * 60 * 1000,
  idleMs: 30_000,
  lineBytes: 1024 ** 2,
  metadataBytes: 4 * 1024 ** 2,
  maxFormats: 1000,
  maxConnections: 4,
  rateBytes: 50 * 1024 ** 2,
  catalogRecords: 500,
} as const;

export const ownerAcquisitionDescriptorSchema = z
  .object({
    width: z.number().int().positive().max(3840),
    height: z.number().int().positive().max(3840),
    fps: z.number().finite().min(12).max(60),
    durationMs: z.number().int().min(1000).max(OWNER_LIMITS.sourceMs),
    videoCodec: z.enum(["h264", "vp9"]),
    audioCodec: z.enum(["aac", "opus"]),
    audioChannels: z.union([z.literal(1), z.literal(2)]),
    audioSampleRate: z.number().int().min(8000).max(48_000),
  })
  .strict()
  .refine((value) => value.width * value.height <= 3840 * 2160);
export type OwnerAcquisitionDescriptor = z.infer<
  typeof ownerAcquisitionDescriptorSchema
>;
