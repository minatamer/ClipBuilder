import {
  OWNER_FPS,
  type OwnerCut,
} from "../../../packages/contracts/local/selection.ts";

/** Complement of validated manual cuts on the physical, half-open frame clock. */
export function ownerAvailableWindows(
  sourceMs: number,
  excluded: readonly OwnerCut[],
): OwnerCut[] {
  const total = Math.floor((sourceMs * OWNER_FPS) / 1000);
  const windows: OwnerCut[] = [];
  let cursor = 0;
  for (const cut of [...excluded].sort((a, b) => a.startFrame - b.startFrame)) {
    const start = Math.min(total, cut.startFrame);
    if (start > cursor) windows.push({ startFrame: cursor, endFrame: start });
    cursor = Math.min(total, Math.max(cursor, cut.endFrame));
  }
  if (cursor < total) windows.push({ startFrame: cursor, endFrame: total });
  return windows;
}
