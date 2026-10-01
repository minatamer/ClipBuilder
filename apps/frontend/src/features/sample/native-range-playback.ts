export function attachNativeRangePlayback(
  video: HTMLVideoElement,
  sourceUrl: string,
  range: { startMs: number; endMs: number },
  initialMs: number,
  autoplay: boolean,
  report: (sourceMs: number) => void,
  playing: (value: boolean) => void,
): () => void {
  let frame: number | null = null;
  let stopped = false;
  const update = () => {
    const actual = video.currentTime * 1000;
    const value = Math.max(range.startMs, Math.min(range.endMs, actual));
    if (actual >= range.endMs) video.pause();
    if (Math.abs(actual - value) > 0.01) video.currentTime = value / 1000;
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
    video.currentTime =
      Math.max(range.startMs, Math.min(range.endMs, initialMs)) / 1000;
    update();
    if (autoplay) void video.play().catch(pause);
  };
  video.addEventListener("loadedmetadata", ready);
  video.addEventListener("timeupdate", update);
  video.addEventListener("seeking", update);
  video.addEventListener("play", play);
  video.addEventListener("pause", pause);
  video.addEventListener("ended", pause);
  video.addEventListener("error", pause);
  video.src = sourceUrl;
  video.load();
  return () => {
    if (stopped) return;
    stopped = true;
    if (frame !== null) video.cancelVideoFrameCallback(frame);
    video.pause();
    video.removeEventListener("loadedmetadata", ready);
    video.removeEventListener("timeupdate", update);
    video.removeEventListener("seeking", update);
    video.removeEventListener("play", play);
    video.removeEventListener("pause", pause);
    video.removeEventListener("ended", pause);
    video.removeEventListener("error", pause);
    video.removeAttribute("src");
    video.load();
  };
}
