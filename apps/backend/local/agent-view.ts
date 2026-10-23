import { createHash } from "node:crypto";
import {
  ownerAgentClipSchema,
  ownerAgentValidationSchema,
} from "../../../packages/contracts/local/agent.ts";
import { compileOwnerOverlay } from "../../../packages/contracts/local/edit-overlay.ts";
import type { OwnerClip } from "../../../packages/contracts/local/clips.ts";
import type { OwnerEditDocument } from "../../../packages/contracts/local/editor.ts";

const hash = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
/** Explicit allowlist: this surface cannot serialize timed dialogue or paths. */
export function ownerAgentClip(clip: OwnerClip) {
  const overlay = clip.base
    ? compileOwnerOverlay(clip.base, clip.edit, clip.assets)
    : null;
  return ownerAgentClipSchema.parse({
    id: clip.id,
    momentId: clip.momentId,
    analysisId: clip.analysisId,
    mode: clip.mode,
    sourceRevision: clip.sourceRevision,
    revision: clip.revision,
    baseHash: clip.baseHash,
    state: clip.state,
    assets: clip.assets,
    outputs: clip.outputs,
    calls: clip.calls,
    error: clip.error,
    captions: overlay?.captionStyle ?? null,
    ...(overlay?.videoLook ? { videoLook: overlay.videoLook } : {}),
    visuals: overlay?.visuals ?? [],
    overlayHash: overlay ? hash(overlay) : null,
  });
}
export function ownerAgentValidation(clip: OwnerClip, edit: OwnerEditDocument) {
  if (!clip.base || !clip.baseHash) throw new Error("clip_unavailable");
  const overlay = compileOwnerOverlay(clip.base, edit, clip.assets);
  return ownerAgentValidationSchema.parse({
    clipId: clip.id,
    sourceRevision: clip.sourceRevision,
    expectedRevision: clip.revision,
    nextRevision: edit.revision,
    baseHash: clip.baseHash,
    overlayHash: hash(overlay),
    captions: overlay.captionStyle ?? null,
    ...(overlay.videoLook ? { videoLook: overlay.videoLook } : {}),
    visuals: overlay.visuals,
  });
}
