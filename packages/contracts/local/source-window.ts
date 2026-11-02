import { z } from "zod";
import { OWNER_FPS } from "./policy.ts";
import { OWNER_SAFE_SOURCE_MS } from "./capacity.ts";

const time = z.number().int().nonnegative().max(OWNER_SAFE_SOURCE_MS);
/** Imported-media milliseconds, independent of the short output-clip contract. */
export const ownerSourceWindowSchema = z
  .object({ startMs: time, endMs: time })
  .strict()
  .refine((window) => window.endMs - window.startMs >= 1000);
export type OwnerSourceWindow = z.infer<typeof ownerSourceWindowSchema>;
/** Original video time of imported-media zero; optional for old/full sources. */
export const ownerSourceOriginSchema = z
  .object({ startMs: time, durationMs: time })
  .strict()
  .refine((origin) => origin.durationMs > origin.startMs);
type SourceClock = {
  durationMs: number;
  origin?: z.infer<typeof ownerSourceOriginSchema> | undefined;
  availableWindow?: OwnerSourceWindow | undefined;
};

export function ownerAvailableSourceWindow(
  source: SourceClock,
): OwnerSourceWindow {
  return source.availableWindow ?? { startMs: 0, endMs: source.durationMs };
}
export function ownerAnalysisWindow(
  source: SourceClock,
  requested?: OwnerSourceWindow,
): OwnerSourceWindow {
  const available = ownerAvailableSourceWindow(source);
  const window = ownerSourceWindowSchema.parse(requested ?? available);
  if (
    window.startMs < available.startMs ||
    window.endMs > available.endMs ||
    window.endMs > source.durationMs
  )
    throw new Error("source_window_invalid");
  return window;
}
export function ownerWindowFrames(window: OwnerSourceWindow) {
  return {
    startFrame: Math.ceil((window.startMs * OWNER_FPS) / 1000),
    endFrame: Math.floor((window.endMs * OWNER_FPS) / 1000),
  };
}
export function ownerOriginalSourceTime(source: SourceClock, localMs: number) {
  return localMs + (source.origin?.startMs ?? 0);
}
export function ownerLocalSourceTime(source: SourceClock, originalMs: number) {
  return originalMs - (source.origin?.startMs ?? 0);
}
export function ownerSourceTimestamp(milliseconds: number) {
  const value = Math.max(0, Math.round(milliseconds));
  return `${String(Math.floor(value / 3_600_000)).padStart(2, "0")}:${String(Math.floor(value / 60_000) % 60).padStart(2, "0")}:${String(Math.floor(value / 1000) % 60).padStart(2, "0")}.${String(value % 1000).padStart(3, "0")}`;
}
export function parseOwnerSourceTimestamp(value: string) {
  const match = /^(\d+):(\d+):(\d+)(?:\.(\d{1,3}))?$/.exec(value.trim());
  if (!match || value.length > 32) throw new Error("source_window_invalid");
  const result =
    Number(match[1]) * 3_600_000 +
    Number(match[2]) * 60_000 +
    Number(match[3]) * 1000 +
    Number((match[4] ?? "").padEnd(3, "0"));
  if (
    !Number.isSafeInteger(result) ||
    result < 0 ||
    result > OWNER_SAFE_SOURCE_MS
  )
    throw new Error("source_window_invalid");
  return result;
}
