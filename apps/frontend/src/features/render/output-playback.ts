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
