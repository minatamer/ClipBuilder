import type { CompositionManifestV3 } from "@clipbuilder/contracts";
export function focusLayout(
  source: CompositionManifestV3["source"],
  focus: CompositionManifestV3["focus"][number],
  width: number,
  height: number,
  _timeMs = focus.endMs,
) {
  void _timeMs;
  // Legacy motion fields are accepted for saved-result inspection, but every
  // view change uses its target on the first frame: no pan or in-between face.
  const box = focus.mode !== "wide" ? focus.box : null;
  const cover = Math.max(width / source.width, height / source.height);
  const scale = box
    ? Math.max(
        cover,
        Math.min(cover * 2.5, (height * 0.36) / (box.height * source.height)),
      )
    : Math.min(width / source.width, height / source.height);
  const videoWidth = source.width * scale,
    videoHeight = source.height * scale;
  const centerX = box ? (box.x + box.width / 2) * videoWidth : videoWidth / 2;
  const centerY = box
    ? (box.y + box.height / 2) * videoHeight
    : videoHeight / 2;
  return {
    width: videoWidth,
    height: videoHeight,
    left:
      focus.mode === "wide"
        ? (width - videoWidth) / 2
        : Math.max(width - videoWidth, Math.min(0, width / 2 - centerX)),
    top:
      focus.mode === "wide"
        ? (height - videoHeight) / 2
        : Math.max(height - videoHeight, Math.min(0, height * 0.38 - centerY)),
  };
}
