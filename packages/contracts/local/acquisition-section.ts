import { z } from "zod";
import { OWNER_SAFE_SOURCE_MS } from "./capacity.ts";
import {
  ownerSourceWindowSchema,
  ownerAvailableSourceWindow,
  type OwnerSourceWindow,
} from "./source-window.ts";
import type { OwnerSource } from "./index.ts";

export const ownerAcquisitionSectionSchema = z
  .object({
    window: ownerSourceWindowSchema,
    durationMs: z.number().int().positive().max(OWNER_SAFE_SOURCE_MS),
    clockOffsetMs: z.number().finite().nonnegative().max(30_000).optional(),
  })
  .strict()
  .refine((section) => section.window.endMs <= section.durationMs);
export type OwnerAcquisitionSection = z.infer<
  typeof ownerAcquisitionSectionSchema
>;
export function ownerPaddedAcquisitionWindow(value: OwnerAcquisitionSection) {
  const section = ownerAcquisitionSectionSchema.parse(value);
  return {
    startMs: Math.max(0, section.window.startMs - 2000),
    endMs: Math.min(section.durationMs, section.window.endMs + 2000),
  };
}
export function ownerSourceCoversOriginalWindow(
  source: OwnerSource,
  window?: OwnerSourceWindow,
) {
  const available = ownerAvailableSourceWindow(source),
    offset = source.origin?.startMs ?? 0;
  if (!window)
    return (
      offset + available.startMs === 0 &&
      offset + available.endMs ===
        (source.origin?.durationMs ?? source.durationMs)
    );
  return (
    window.startMs >= offset + available.startMs &&
    window.endMs <= offset + available.endMs
  );
}
export function ownerScopeImportedSource(
  source: OwnerSource,
  window?: OwnerSourceWindow,
): OwnerSource {
  if (!window) return source;
  if (!ownerSourceCoversOriginalWindow(source, window))
    throw Error("source_section_unavailable");
  const offset = source.origin?.startMs ?? 0;
  return {
    ...source,
    availableWindow: {
      startMs: window.startMs - offset,
      endMs: window.endMs - offset,
    },
  };
}
