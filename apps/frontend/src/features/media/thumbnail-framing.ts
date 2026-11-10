const thumbnailAspect = 16 / 9;

/** Preserve a source-shaped card/poster while bounding both decoded edges. */
export function thumbnailSize(aspectRatio = thumbnailAspect) {
  const aspect =
    Number.isFinite(aspectRatio) && aspectRatio > 0
      ? aspectRatio
      : thumbnailAspect;
  return {
    width: Math.max(1, Math.round(320 * Math.min(1, aspect))),
    height: Math.max(1, Math.round(320 / Math.max(1, aspect))),
  };
}

/** Only trim paired, almost-black bands around a visibly non-dark frame. */
export function thumbnailZoom(
  pixels: { data: Uint8ClampedArray; width: number; height: number },
  sourceAspect = pixels.width / pixels.height,
  targetAspect = thumbnailAspect,
): number {
  const { data, width, height } = pixels;
  if (
    width < 16 ||
    height < 16 ||
    data.length !== width * height * 4 ||
    !Number.isFinite(sourceAspect) ||
    sourceAspect <= 0 ||
    !Number.isFinite(targetAspect) ||
    targetAspect <= 0
  )
    return 1;
  const dark = (x: number, y: number) => {
    const index = (y * width + x) * 4;
    return (
      data[index + 3]! >= 250 &&
      data[index]! <= 24 &&
      data[index + 1]! <= 24 &&
      data[index + 2]! <= 24
    );
  };
  let visible = 0;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) if (!dark(x, y)) visible++;
  if (visible < width * height * 0.35) return 1;
  function band(
    size: number,
    across: number,
    pixel: (a: number, b: number) => boolean,
  ) {
    let edge = 0;
    while (
      edge <= Math.floor(size * 0.2) &&
      Array.from({ length: across }, (_, p) => pixel(edge, p)).every(Boolean)
    )
      edge++;
    return edge;
  }
  const top = band(height, width, (y, x) => dark(x, y)),
    bottom = band(height, width, (y, x) => dark(x, height - 1 - y)),
    left = band(width, height, (x, y) => dark(x, y)),
    right = band(width, height, (x, y) => dark(width - 1 - x, y));
  const paired = (a: number, b: number, size: number) =>
    a >= 2 && b >= 2 && Math.abs(a - b) <= 1 && Math.max(a, b) <= size * 0.2
      ? Math.max(a, b) / size
      : 0;
  const horizontal = paired(left, right, width),
    vertical = paired(top, bottom, height);
  return Math.max(
    1,
    Math.min(1, targetAspect / sourceAspect) / (1 - 2 * horizontal),
    Math.min(1, sourceAspect / targetAspect) / (1 - 2 * vertical),
  );
}
