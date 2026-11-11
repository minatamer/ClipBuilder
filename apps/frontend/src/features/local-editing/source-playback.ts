import type { OwnerSourceWindow } from "../../../../../packages/contracts/local/source-window.ts";

/** Only the current explicit play intent may report a genuine failure. */
export class SourcePlayRequests {
  private revision = 0;
  cancel() {
    this.revision++;
  }
  play(
    video: Pick<HTMLVideoElement, "play">,
    failed: (reason: "blocked" | "failed") => void,
  ) {
    const revision = ++this.revision;
    const rejected = (error: unknown) => {
      if (revision !== this.revision) return;
      const name =
        error && typeof error === "object" && "name" in error
          ? error.name
          : null;
      // Seeking, Pause, a new load or a newer play can interrupt a healthy player.
      if (name === "AbortError") return;
      failed(name === "NotAllowedError" ? "blocked" : "failed");
    };
    try {
      void video.play().catch(rejected);
    } catch (error) {
      rejected(error);
    }
  }
}

/** A padded master stays intact; the preview plays only its requested interval. */
export function constrainSourcePlayback(
  video: Pick<HTMLVideoElement, "currentTime" | "pause">,
  window: OwnerSourceWindow | undefined,
  phase: "loaded" | "seeking" | "time" | "play",
) {
  if (!window) return;
  const start = window.startMs / 1000,
    end = window.endMs / 1000;
  if (phase === "play" && video.currentTime >= end) video.currentTime = start;
  else if (video.currentTime < start) video.currentTime = start;
  else if (video.currentTime > end) video.currentTime = end;
  if (phase === "time" && video.currentTime >= end) video.pause();
}
