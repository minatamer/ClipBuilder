/** Prepare admitted audio bytes without starting a second playback clock. */
export function preparePreviewAudio(src: string, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const audio = new Audio();
    const finish = (failed: boolean) => {
      clearTimeout(timer);
      audio.removeEventListener("canplay", ready);
      audio.removeEventListener("error", error);
      signal.removeEventListener("abort", aborted);
      audio.removeAttribute("src");
      audio.load();
      if (failed) reject(new Error("preview_audio_unavailable"));
      else resolve();
    };
    const ready = () => finish(false),
      error = () => finish(true),
      aborted = () => finish(true);
    const timer = window.setTimeout(error, 15000);
    audio.addEventListener("canplay", ready, { once: true });
    audio.addEventListener("error", error, { once: true });
    signal.addEventListener("abort", aborted, { once: true });
    if (signal.aborted) {
      aborted();
      return;
    }
    audio.preload = "auto";
    audio.src = src;
    audio.load();
  });
}
