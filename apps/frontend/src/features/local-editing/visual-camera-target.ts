import type { OwnerVisualEdit } from "../../../../../packages/contracts/local/assets.ts";

type Point = { x: number; y: number };
const bounded = (value: number) => Math.max(0, Math.min(1, value));

/** Source-space viewport after CSS fit, object-position and scale are combined. */
export function visualCameraCrop(
  cue: OwnerVisualEdit,
  asset: { width: number; height: number },
  point: Point,
  zoom: number,
) {
  const width = cue.presentation === "full-frame" ? 1080 : cue.box.width * 1080;
  const height =
    cue.presentation === "full-frame" ? 1920 : cue.box.height * 1920;
  const fit =
    cue.presentation === "full-frame" || cue.fit === "cover"
      ? Math.max
      : Math.min;
  const scale = fit(width / asset.width, height / asset.height) * zoom;
  const cropWidth = width / (asset.width * scale);
  const cropHeight = height / (asset.height * scale);
  return {
    x: (1 - cropWidth) * point.x,
    y: (1 - cropHeight) * point.y,
    width: cropWidth,
    height: cropHeight,
  };
}

export function visualCameraPoint(
  crop: ReturnType<typeof visualCameraCrop>,
  center: Point,
) {
  return {
    x:
      Math.abs(1 - crop.width) < 1e-9
        ? 0.5
        : bounded((center.x - crop.width / 2) / (1 - crop.width)),
    y:
      Math.abs(1 - crop.height) < 1e-9
        ? 0.5
        : bounded((center.y - crop.height / 2) / (1 - crop.height)),
  };
}

export function visualCameraSourceFrame(cue: OwnerVisualEdit, frame: number) {
  return (
    (cue.video?.offsetFrame ?? 0) +
    Math.max(
      0,
      Math.min(cue.endFrame - cue.startFrame - 1, frame - cue.startFrame),
    )
  );
}

export const visualHasMotion = (cue: OwnerVisualEdit) =>
  !!cue.effect &&
  ((!Object.is(cue.effect.fromX, cue.effect.toX) &&
    cue.effect.fromX !== cue.effect.toX) ||
    (!Object.is(cue.effect.fromY, cue.effect.toY) &&
      cue.effect.fromY !== cue.effect.toY));

export function removeVisualZoom(cue: OwnerVisualEdit): OwnerVisualEdit {
  const next = { ...cue };
  if (next.effect && visualHasMotion(next))
    next.effect = { ...next.effect, zoom: 1 };
  else delete next.effect;
  return next;
}

/** Magnification keeps the chosen source-frame center, as original Camera does. */
export function setVisualZoom(
  cue: OwnerVisualEdit,
  asset: { width: number; height: number },
  zoom: number,
  priorZoom = 1,
  preserveMotion = visualHasMotion(cue),
): OwnerVisualEdit {
  if (!cue.effect) return cue;
  const effect = { ...cue.effect, zoom };
  if (
    Number.isFinite(zoom) &&
    zoom >= 1 &&
    zoom <= 3 &&
    Number.isFinite(effect.toX) &&
    Number.isFinite(effect.toY)
  ) {
    const oldZoom =
      Number.isFinite(cue.effect.zoom) &&
      cue.effect.zoom >= 1 &&
      cue.effect.zoom <= 3
        ? cue.effect.zoom
        : priorZoom;
    const oldCrop = visualCameraCrop(
      cue,
      asset,
      { x: effect.toX, y: effect.toY },
      oldZoom,
    );
    const next = visualCameraPoint(
      visualCameraCrop(cue, asset, { x: effect.toX, y: effect.toY }, zoom),
      { x: oldCrop.x + oldCrop.width / 2, y: oldCrop.y + oldCrop.height / 2 },
    );
    effect.toX = next.x;
    effect.toY = next.y;
    if (!preserveMotion) {
      effect.fromX = next.x;
      effect.fromY = next.y;
    }
  }
  return { ...cue, effect };
}

export function removeVisualMotion(cue: OwnerVisualEdit): OwnerVisualEdit {
  const next = { ...cue };
  if (next.effect && next.effect.zoom !== 1)
    next.effect = {
      ...next.effect,
      fromX: next.effect.toX,
      fromY: next.effect.toY,
    };
  else delete next.effect;
  return next;
}
