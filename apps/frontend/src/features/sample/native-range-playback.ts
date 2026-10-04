export function playbackPosition(
  value: number,
  range: { startMs: number; endMs: number },
) {
  return Number.isFinite(value)
    ? Math.max(range.startMs, Math.min(range.endMs, value))
    : range.startMs;
}

export function attachNativeRangePlayback(
  video: HTMLVideoElement,
  sourceUrl: string,
  range: { startMs: number; endMs: number },
  initialMs: number,
  autoplay: boolean,
  report: (sourceMs: number) => void,
  playing: (value: boolean) => void,
  loading?: (value: boolean) => void,
): () => void {
  let frame: number | null = null;
  let stopped = false;
  const waiting = () => {
    if (!stopped) loading?.(true);
  };
  const mediaReady = () => {
    if (!stopped) loading?.(video.seeking || video.readyState < 2);
  };
  const update = () => {
    const actual = video.currentTime * 1000;
    const value = playbackPosition(actual, range);
    if (actual >= range.endMs) video.pause();
    if (!Number.isFinite(actual) || Math.abs(actual - value) > 0.01)
      video.currentTime = value / 1000;
    report(value);
  };
  const tick = () => {
    frame = null;
    if (stopped) return;
    update();
    if (!video.paused && !video.ended && video.currentTime * 1000 < range.endMs)
      frame = video.requestVideoFrameCallback(tick);
  };
  const play = () => {
    playing(true);
    if (frame === null && video.requestVideoFrameCallback)
      frame = video.requestVideoFrameCallback(tick);
  };
  const pause = () => {
    playing(false);
    if (frame !== null) video.cancelVideoFrameCallback(frame);
    frame = null;
  };
  const ready = () => {
    video.currentTime = playbackPosition(initialMs, range) / 1000;
    update();
    if (autoplay) void video.play().catch(pause);
  };
  const seeking = () => {
    waiting();
    update();
  };
  const failed = () => {
    pause();
    if (!stopped) loading?.(false);
  };
  video.addEventListener("loadedmetadata", ready);
  video.addEventListener("loadeddata", mediaReady);
  video.addEventListener("canplay", mediaReady);
  video.addEventListener("playing", mediaReady);
  video.addEventListener("seeked", mediaReady);
  video.addEventListener("waiting", waiting);
  video.addEventListener("timeupdate", update);
  video.addEventListener("seeking", seeking);
  video.addEventListener("play", play);
  video.addEventListener("pause", pause);
  video.addEventListener("ended", pause);
  video.addEventListener("error", failed);
  waiting();
  video.src = sourceUrl;
  video.load();
  return () => {
    if (stopped) return;
    stopped = true;
    if (frame !== null) video.cancelVideoFrameCallback(frame);
    video.pause();
    video.removeEventListener("loadedmetadata", ready);
    video.removeEventListener("loadeddata", mediaReady);
    video.removeEventListener("canplay", mediaReady);
    video.removeEventListener("playing", mediaReady);
    video.removeEventListener("seeked", mediaReady);
    video.removeEventListener("waiting", waiting);
    video.removeEventListener("timeupdate", update);
    video.removeEventListener("seeking", seeking);
    video.removeEventListener("play", play);
    video.removeEventListener("pause", pause);
    video.removeEventListener("ended", pause);
    video.removeEventListener("error", failed);
    video.removeAttribute("src");
    video.load();
  };
}
