import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { rm } from "node:fs/promises";
import {
  OWNER_FPS,
  type OwnerMediaJob,
} from "../../../packages/contracts/local/index.ts";
import { OWNER_BATCH_POLICY } from "../../../packages/contracts/local/clips.ts";
import {
  ownerClipMediaPath,
  ownerMediaPath,
  ownerPreviewCut,
  type OwnerNativeTools,
} from "./media.ts";

type Preview = { frames: number; bytes: number; durationMs: number };
type CachedCut = { binding: string; digest: string; preview: Preview };
export type OwnerCutCache = Map<string, CachedCut>;
const hashFile = async (file: string, signal: AbortSignal) => {
  const hash = createHash("sha256");
  for await (const bytes of createReadStream(file, { signal }))
    hash.update(bytes);
  return hash.digest("hex");
};

/** Playback preparation only: no browser, overlays or downloadable final MP4. */
export async function prepareOwnerClipPreview(
  options: { root: string; tools: OwnerNativeTools; cache: OwnerCutCache },
  job: Extract<OwnerMediaJob, { operation: "clip" | "clip-preview" }>,
  signal: AbortSignal,
) {
  signal.throwIfAborted();
  for (const key of options.cache.keys())
    if (!key.startsWith(`${job.workspaceId}:`)) options.cache.delete(key);
  const raw = await ownerClipMediaPath(
    options.root,
    job.workspaceId,
    job.clipId,
    "source",
  );
  const binding = JSON.stringify({
      fingerprint: job.fingerprint,
      cut: job.cut,
    }),
    key = `${job.workspaceId}:${job.clipId}`,
    cached = options.cache.get(key);
  if (cached) {
    if (
      cached.binding !== binding ||
      (await hashFile(raw, signal)) !== cached.digest
    )
      throw new Error("stale_clip_source");
    return { operation: "clip-preview" as const, ...cached.preview };
  }
  const result = await ownerPreviewCut(
    await ownerMediaPath(options.root, job.workspaceId, "source.mp4"),
    raw,
    options.tools,
    signal,
    job.cut,
    job.fingerprint,
  );
  if (result.bytes > OWNER_BATCH_POLICY.clipReservationBytes) {
    await rm(raw, { force: true });
    throw new Error("clip_capacity");
  }
  const preview = {
    frames: job.cut.endFrame - job.cut.startFrame,
    bytes: result.bytes,
    durationMs: Math.round(
      ((job.cut.endFrame - job.cut.startFrame) * 1000) / OWNER_FPS,
    ),
  };
  options.cache.set(key, {
    binding,
    digest: await hashFile(raw, signal),
    preview,
  });
  return { operation: "clip-preview" as const, ...preview };
}
