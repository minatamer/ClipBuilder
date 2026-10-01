import {
  ASSEMBLY_LIMITS,
  LOCAL_WORKSPACE_LIMITS,
  PUBLIC_LIMITS,
} from "@clipbuilder/contracts";
import { LocalMediaError } from "./media.errors";

export function requiredWorkspaceBytes(sourceBytes: number): number {
  const subtotal =
    sourceBytes +
    LOCAL_WORKSPACE_LIMITS.provisionalAudioBytes +
    ASSEMBLY_LIMITS.maxVisualCues * ASSEMBLY_LIMITS.maxGeneratedAssetBytes +
    PUBLIC_LIMITS.maxOutputBytes * 2 +
    LOCAL_WORKSPACE_LIMITS.scratchIoBytes;
  return (
    subtotal +
    Math.max(
      LOCAL_WORKSPACE_LIMITS.minimumReserveBytes,
      Math.ceil(subtotal * 0.1),
    )
  );
}

export function assertWorkspaceQuota(
  estimate: StorageEstimate,
  sourceBytes: number,
): void {
  if (
    !Number.isFinite(estimate.quota) ||
    !Number.isFinite(estimate.usage) ||
    estimate.quota === undefined ||
    estimate.usage === undefined ||
    estimate.quota - estimate.usage < requiredWorkspaceBytes(sourceBytes)
  )
    throw new LocalMediaError("storage");
}
