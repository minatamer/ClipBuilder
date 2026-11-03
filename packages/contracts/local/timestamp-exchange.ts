import { z } from "zod";
import { utf8ByteLength } from "./utf8.ts";
import { ownerDigestSchema } from "./assets.ts";
import {
  OWNER_FPS,
  OWNER_LIMITS,
  OWNER_MAX_REQUESTED_CLIP_MS,
  OWNER_SAFE_SOURCE_MS,
} from "./policy.ts";
import type { OwnerSource } from "./index.ts";
import { ownerCut } from "./selection.ts";
import { ownerCutInsideAvailableSource } from "./source-window.ts";

export const OWNER_TIMESTAMP_FILE_BYTES = 1024 * 1024;
const time = z.number().int().nonnegative().max(OWNER_SAFE_SOURCE_MS);
export const ownerTimestampFileSchema = z
  .object({
    version: z.literal(1),
    kind: z.literal("clipbuilder-timestamps"),
    clock: z.literal("original-ms"),
    source: z
      .object({
        fingerprint: ownerDigestSchema,
        durationMs: time,
        originStartMs: time,
      })
      .strict(),
    clips: z
      .array(z.object({ startMs: time, endMs: time }).strict())
      .min(1)
      .max(10_000),
  })
  .strict();

const identity = (source: OwnerSource) => ({
  fingerprint: source.fingerprint,
  durationMs: source.durationMs,
  originStartMs: source.origin?.startMs ?? 0,
});

export function exportOwnerTimestamps(
  source: OwnerSource,
  cuts: { startFrame: number; endFrame: number }[],
) {
  const document = ownerTimestampFileSchema.parse({
    version: 1,
    kind: "clipbuilder-timestamps",
    clock: "original-ms",
    source: identity(source),
    clips: cuts.map((cut) => ({
      startMs:
        Math.round((cut.startFrame * 1000) / OWNER_FPS) +
        (source.origin?.startMs ?? 0),
      endMs:
        Math.round((cut.endFrame * 1000) / OWNER_FPS) +
        (source.origin?.startMs ?? 0),
    })),
  });
  const text = JSON.stringify(document, null, 2);
  if (utf8ByteLength(text) > OWNER_TIMESTAMP_FILE_BYTES)
    throw Error("timestamp_file_large");
  return text;
}

/** Parse everything before returning any rows; importing never submits work. */
export function importOwnerTimestamps(text: string, source: OwnerSource) {
  if (utf8ByteLength(text) > OWNER_TIMESTAMP_FILE_BYTES)
    throw Error("timestamp_file_large");
  const document = ownerTimestampFileSchema.parse(JSON.parse(text));
  const expected = identity(source);
  if (
    document.source.fingerprint !== expected.fingerprint ||
    document.source.durationMs !== expected.durationMs ||
    document.source.originStartMs !== expected.originStartMs
  )
    throw Error("timestamp_source_mismatch");
  const rows = new Map<string, { startMs: number; endMs: number }>();
  for (const clip of document.clips) {
    const range = {
      startMs: clip.startMs - expected.originStartMs,
      endMs: clip.endMs - expected.originStartMs,
    };
    if (range.endMs - range.startMs > OWNER_MAX_REQUESTED_CLIP_MS)
      throw Error("timestamp_range_invalid");
    try {
      const cut = ownerCut(range, source.durationMs);
      if (!ownerCutInsideAvailableSource(source, cut))
        throw Error("timestamp_range_invalid");
    } catch {
      throw Error("timestamp_range_invalid");
    }
    rows.set(`${range.startMs}:${range.endMs}`, range);
  }
  if (rows.size > OWNER_LIMITS.ranges) throw Error("timestamp_row_limit");
  return [...rows.values()];
}

export function localTimestampExchangeAllowed(
  localMedia: boolean,
  desktop: boolean,
  userAgent: string,
) {
  return localMedia && desktop && !/Android|iPhone|iPad|iPod/iu.test(userAgent);
}
