import { z } from "zod";
import {
  OWNER_LIMITS,
  OWNER_ALL_AI_MOMENTS_LIMIT,
  OWNER_FPS,
} from "./policy.ts";

/** Structural arithmetic bounds, not a duration/size quota. */
export const OWNER_SAFE_SOURCE_MS = Math.floor(
  Number.MAX_SAFE_INTEGER / OWNER_FPS,
);
/** Enabled only by the packets proving the complete downstream pipelines. */
export const LOCAL_CODEX_CAPACITY_READINESS = {
  longSources: false, // CL-189 owns the full-source coverage gate.
  manyClips: false, // CL-190 owns incremental batch/persistence admission.
} as const;
const quota = z
  .number()
  .int()
  .positive()
  .max(Number.MAX_SAFE_INTEGER)
  .nullable();
export const ownerCapacitySchema = z
  .object({
    profile: z.enum(["bounded", "local-codex"]),
    longSources: z.boolean(),
    manyClips: z.boolean(),
    sourceBytes: quota,
    sourceMs: quota,
    scratchBytes: quota,
    clips: quota,
    moments: quota,
  })
  .strict()
  .refine(
    (value) =>
      (value.profile === "local-codex" ||
        (!value.longSources &&
          !value.manyClips &&
          Object.values(value).every((item) => item !== null))) &&
      (value.longSources ||
        (value.sourceBytes !== null && value.sourceMs !== null)) &&
      (value.manyClips || (value.clips !== null && value.moments !== null)),
  );
export type OwnerCapacity = z.infer<typeof ownerCapacitySchema>;

/** Call only from explicit composition, never from a request or restored record. */
export function resolveOwnerCapacity(
  composition: {
    hosted?: boolean | undefined;
    aiProvider?: "codex" | "gemini" | undefined;
    sourceLimits?: { bytes: number; durationMs: number } | undefined;
  },
  ready: {
    longSources: boolean;
    manyClips: boolean;
  } = LOCAL_CODEX_CAPACITY_READINESS,
): OwnerCapacity {
  const codex = !composition.hosted && composition.aiProvider === "codex";
  const longSources = codex && ready.longSources;
  const manyClips = codex && ready.manyClips;
  return ownerCapacitySchema.parse({
    profile: codex ? "local-codex" : "bounded",
    longSources,
    manyClips,
    sourceBytes: longSources
      ? null
      : Math.min(
          OWNER_LIMITS.sourceBytes,
          composition.sourceLimits?.bytes ?? OWNER_LIMITS.sourceBytes,
        ),
    sourceMs: longSources
      ? null
      : Math.min(
          OWNER_LIMITS.sourceMs,
          composition.sourceLimits?.durationMs ?? OWNER_LIMITS.sourceMs,
        ),
    scratchBytes: codex ? null : OWNER_LIMITS.scratchBytes,
    clips: manyClips ? null : OWNER_LIMITS.clips,
    moments: manyClips ? null : OWNER_ALL_AI_MOMENTS_LIMIT,
  });
}

export function ownerSourceFitsCapacity(
  source: { bytes: number; durationMs: number },
  capacity: OwnerCapacity,
) {
  return (
    Number.isSafeInteger(source.bytes) &&
    source.bytes > 0 &&
    Number.isSafeInteger(source.durationMs) &&
    source.durationMs >= 1000 &&
    source.durationMs <= OWNER_SAFE_SOURCE_MS &&
    (capacity.sourceBytes === null || source.bytes <= capacity.sourceBytes) &&
    (capacity.sourceMs === null || source.durationMs <= capacity.sourceMs)
  );
}

/** Real free space and reserve still constrain quota-free local scratch. */
export function ownerDiskFitsCapacity(
  peakBytes: number,
  freeBytes: number,
  capacity: Pick<OwnerCapacity, "scratchBytes">,
) {
  return (
    Number.isSafeInteger(peakBytes) &&
    peakBytes >= 0 &&
    Number.isSafeInteger(freeBytes) &&
    freeBytes >= 0 &&
    (capacity.scratchBytes === null || peakBytes <= capacity.scratchBytes) &&
    freeBytes - peakBytes >= OWNER_LIMITS.reserveBytes
  );
}
