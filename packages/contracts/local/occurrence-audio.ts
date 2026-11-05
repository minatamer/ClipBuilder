import { ownerAudioSegments, type OwnerAudioAsset } from "./audio.ts";
import type { OwnerOverlay } from "./clips.ts";
import { ownerHookFrames } from "./hook.ts";
import { OWNER_FPS } from "./policy.ts";

export function ownerOverlayAudioAssets(
  overlay: OwnerOverlay,
): OwnerAudioAsset[] {
  return [
    ...new Map(
      [
        ...(overlay.audio?.assets ?? []),
        ...(overlay.hookContent?.audio?.assets ?? []),
      ].map((asset) => [asset.id, asset]),
    ).values(),
  ];
}

/** Independent copies restart their own media clocks at each occurrence. */
export function ownerOverlayAudioSegments(
  overlay: OwnerOverlay,
  clock?: Parameters<typeof ownerAudioSegments>[3],
): ReturnType<typeof ownerAudioSegments> {
  if (!overlay.hookContent || !overlay.hook)
    return ownerAudioSegments(
      overlay.audio,
      overlay.frames,
      overlay.hook,
      clock,
      overlay.visuals,
    );
  const prefix = clock?.hookSeconds ?? ownerHookFrames(overlay) / OWNER_FPS;
  const body = ownerAudioSegments(
    overlay.audio,
    overlay.frames,
    undefined,
    clock ? { ...clock, hookSeconds: 0 } : undefined,
    overlay.visuals,
  ).map((segment) => ({
    ...segment,
    start: segment.start + prefix,
    end: segment.end + prefix,
  }));
  const content = overlay.hookContent;
  const hook = ownerAudioSegments(
    content.audio,
    overlay.frames,
    overlay.hook,
    clock,
    content.visuals,
  )
    .filter((segment) => segment.start < prefix)
    .map((segment) => ({ ...segment, end: Math.min(prefix, segment.end) }));
  return [...hook, ...body];
}
