import {
  OWNER_FPS,
  OWNER_SAFE_SOURCE_MS,
} from "../../../../../packages/contracts/local/policy.ts";
import type { OwnerSource } from "../../../../../packages/contracts/local/index.ts";
import { ownerAvailableSourceWindow } from "../../../../../packages/contracts/local/source-window.ts";
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
  if (!Number.isSafeInteger(seconds) || seconds * 1000 > OWNER_SAFE_SOURCE_MS)
    throw new Error("invalid_manual_time");
  return ownerTimestamp(seconds * 1000).replace(/\.\d{3}$/, "");
}

export function parseManualTime(value: string): number {
  return parseOwnerTimestamp(normalizeManualTime(value));
}

/** Receives an already mapped local clock; navigation never changes an endpoint. */
export function manualPreviewJumpSeconds(
  localMs: number,
  source: Pick<OwnerSource, "durationMs" | "availableWindow">,
  endpoint: "start" | "end",
): number | null {
  const available = ownerAvailableSourceWindow(source);
  if (
    !Number.isSafeInteger(localMs) ||
    !Number.isSafeInteger(source.durationMs) ||
    source.durationMs <= 0 ||
    localMs < 0 ||
    localMs > source.durationMs ||
    localMs < available.startMs ||
    localMs > available.endMs ||
    (endpoint === "start" && localMs === available.endMs)
  )
    return null;
  return localMs === available.endMs
    ? Math.max(0, Math.ceil((available.endMs * OWNER_FPS) / 1000) - 1) /
        OWNER_FPS
    : localMs / 1000;
}

export function capturePreviewTime(
  preview: Pick<
    HTMLVideoElement,
    "currentTime" | "duration" | "readyState" | "error" | "seeking"
  > | null,
  sourceMs: number,
  originalOffsetMs = 0,
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
  return ownerTimestamp(seconds * 1000 + originalOffsetMs).replace(
    /\.\d{3}$/u,
    "",
  );
}
