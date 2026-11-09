import { createHash } from "node:crypto";
import { lstat, readFile } from "node:fs/promises";
import type { OwnerOverlay } from "../../../packages/contracts/local/clips.ts";
import { OWNER_VIDEO_LIMITS } from "../../../packages/contracts/local/video-assets.ts";
import { ownerVideoMediaPath } from "./media.ts";

/** Only fixed normalized, hash-bound B-roll may reach the private raster page. */
export async function prepareOwnerVideoFiles(
  options: {
    root: string;
    workspaceId: string;
    overlay: OwnerOverlay;
  },
  signal: AbortSignal,
) {
  const visuals = [
    ...options.overlay.visuals,
    ...(options.overlay.hookContent?.visuals ?? []),
  ];
  const assets = new Map(
    [
      ...(options.overlay.videoAssets ?? []),
      ...(options.overlay.hookContent?.videoAssets ?? []),
    ]
      .filter((asset) =>
        visuals.some((cue) => cue.video && cue.assetId === asset.id),
      )
      .map((asset) => [asset.id, asset]),
  );
  const files: Record<string, { file: string; bytes: number }> = {};
  for (const asset of assets.values()) {
    signal.throwIfAborted();
    const file = await ownerVideoMediaPath(
        options.root,
        options.workspaceId,
        asset.id,
      ),
      info = await lstat(file);
    if (
      !info.isFile() ||
      info.isSymbolicLink() ||
      info.nlink !== 1 ||
      info.size !== asset.bytes ||
      info.size > OWNER_VIDEO_LIMITS.bytes ||
      createHash("sha256")
        .update(await readFile(file))
        .digest("hex") !== asset.digest
    )
      throw new Error("invalid_video_asset");
    files[asset.id] = { file, bytes: asset.bytes };
  }
  return files;
}
