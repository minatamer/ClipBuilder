export function isDecodedOutput(
  video: Pick<
    HTMLVideoElement,
    "readyState" | "videoWidth" | "videoHeight" | "duration"
  >,
  durationMs: number,
) {
  return (
    video.readyState >= 2 &&
    video.videoWidth === 1080 &&
    video.videoHeight === 1920 &&
    Number.isFinite(video.duration) &&
    Math.abs(video.duration * 1000 - durationMs) <= 100
  );
}

// Bounded first-frame wait; media errors continue to invalidate an earlier decode.
export function observeOutputPlayback(
  video: HTMLVideoElement,
  durationMs: number,
  ready: () => void,
  failed: () => void,
) {
  let disposed = false,
    accepted = false,
    rejected = false;
  const error = () => {
    if (disposed || rejected) return;
    rejected = true;
    clearTimeout(timer);
    failed();
  };
  const decoded = () => {
    if (disposed || rejected || accepted) return;
    if (!isDecodedOutput(video, durationMs)) return error();
    accepted = true;
    clearTimeout(timer);
    ready();
  };
  const timer = setTimeout(error, 30_000);
  video.addEventListener("loadeddata", decoded);
  video.addEventListener("error", error);
  if (video.readyState >= 2) decoded();
  return () => {
    disposed = true;
    clearTimeout(timer);
    video.removeEventListener("loadeddata", decoded);
    video.removeEventListener("error", error);
  };
}
