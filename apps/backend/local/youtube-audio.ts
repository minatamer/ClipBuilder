import type { OwnerYoutubeMetadata } from "./youtube-formats.ts";
import { OWNER_AUDIO_LIMITS } from "../../../packages/contracts/local/audio.ts";

/** Sound/music imports do not require speech language or a video rendition. */
export function selectYoutubeAudio(metadata: OwnerYoutubeMetadata) {
  if (
    metadata.status !== "vod" ||
    metadata.durationMs < 1 ||
    metadata.durationMs > OWNER_AUDIO_LIMITS.durationMs
  )
    throw new Error("youtube_audio_duration");
  const muxed = new Set(metadata.videos.map((video) => video.formatId));
  const formats = metadata.audios.filter(
    (audio) =>
      !muxed.has(audio.formatId) &&
      audio.protocol === "https" &&
      !audio.drm &&
      /^mp4a(?:\.[A-Za-z0-9]+)*$/u.test(audio.codec) &&
      (audio.channels === null || audio.channels <= 2) &&
      (audio.sampleRate === null || audio.sampleRate <= 192000) &&
      (audio.bytes === null || audio.bytes <= OWNER_AUDIO_LIMITS.inputBytes),
  );
  formats.sort(
    (a, b) =>
      Number(b.role === "default") - Number(a.role === "default") ||
      (b.bitrateKbps ?? 0) - (a.bitrateKbps ?? 0),
  );
  const selected = formats[0];
  if (!selected) throw new Error("youtube_audio_unavailable");
  return selected;
}
