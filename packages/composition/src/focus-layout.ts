import type { CompositionManifestV2 } from "@clipbuilder/contracts";
export function focusLayout(
  source: CompositionManifestV2["source"],
  focus: CompositionManifestV2["focus"][number],
  width: number,
  height: number,
  timeMs = focus.endMs,
) {
  const progress = Math.max(
    0,
    Math.min(1, (timeMs - focus.startMs) / (focus.endMs - focus.startMs)),
  );
  const box =
    focus.mode === "speaker"
      ? {
          x: focus.fromBox
            ? focus.fromBox.x + (focus.box.x - focus.fromBox.x) * progress
            : focus.box.x,
          y: focus.fromBox
            ? focus.fromBox.y + (focus.box.y - focus.fromBox.y) * progress
            : focus.box.y,
          width: focus.fromBox
            ? focus.fromBox.width +
              (focus.box.width - focus.fromBox.width) * progress
            : focus.box.width,
          height: focus.fromBox
            ? focus.fromBox.height +
              (focus.box.height - focus.fromBox.height) * progress
            : focus.box.height,
        }
      : null;
  const scale =
    focus.mode === "wide"
      ? Math.min(width / source.width, height / source.height)
      : Math.max(width / source.width, height / source.height);
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
        : Math.max(height - videoHeight, Math.min(0, height / 2 - centerY)),
  };
}
