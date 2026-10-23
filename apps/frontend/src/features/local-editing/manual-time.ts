import {
  ownerTimestamp,
  parseOwnerTimestamp,
} from "../../../../../packages/contracts/local/selection.ts";

/** Carry clock parts without silently clipping typed times to the source. */
export function normalizeManualTime(value: string): string {
  const match = /^(\d+):(\d+):(\d+)$/.exec(value.trim());
  if (!match || value.length > 32) throw new Error("invalid_manual_time");
  const seconds =
    Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
  if (!Number.isSafeInteger(seconds) || seconds >= 100 * 3600)
    throw new Error("invalid_manual_time");
  return ownerTimestamp(seconds * 1000).slice(0, 8);
}

export function parseManualTime(value: string): number {
  return parseOwnerTimestamp(normalizeManualTime(value));
}

export function capturePreviewTime(
  preview: Pick<
    HTMLVideoElement,
    "currentTime" | "duration" | "readyState" | "error" | "seeking"
  > | null,
  sourceMs: number,
): string | null {
  if (
    !preview ||
    preview.readyState < 1 ||
    preview.error ||
    preview.seeking ||
    !Number.isFinite(preview.currentTime) ||
    preview.currentTime < 0 ||
    !Number.isFinite(preview.duration) ||
    preview.duration <= 0 ||
    !Number.isFinite(sourceMs) ||
    sourceMs <= 0
  )
    return null;
  const seconds = Math.floor(
    Math.min(preview.currentTime, preview.duration, sourceMs / 1000),
  );
  return ownerTimestamp(seconds * 1000).slice(0, 8);
}
