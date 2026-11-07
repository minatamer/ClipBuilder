/** Media clocks must not round ahead into the next camera or trimmed occurrence. */
export function cameraPreviewSourceFrame(
  time: number,
  fps: number,
  start: number,
  end: number,
  frames: number,
) {
  const last = Math.max(start, Math.min(end, frames) - 1);
  return Math.max(start, Math.min(last, Math.floor(time * fps + 0.0001)));
}
