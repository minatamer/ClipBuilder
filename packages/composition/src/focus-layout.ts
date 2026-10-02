import type { CompositionManifestV2 } from "@clipbuilder/contracts";
export function focusLayout(
  source: CompositionManifestV2["source"],
  focus: CompositionManifestV2["focus"][number],
  width: number,
  height: number,
) {
  const scale =
    focus.mode === "wide"
      ? Math.min(width / source.width, height / source.height)
      : Math.max(width / source.width, height / source.height);
  const videoWidth = source.width * scale,
    videoHeight = source.height * scale;
  const centerX =
    focus.mode === "speaker"
      ? (focus.box.x + focus.box.width / 2) * videoWidth
      : videoWidth / 2;
  const centerY =
    focus.mode === "speaker"
      ? (focus.box.y + focus.box.height / 2) * videoHeight
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
        : Math.max(height - videoHeight, Math.min(0, height / 2 - centerY)),
  };
}
