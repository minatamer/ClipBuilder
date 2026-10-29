import {
  OWNER_SOUNDS,
  type OwnerSoundId,
  type OwnerAudioCue,
} from "../../contracts/local/audio.ts";
import { ownerBuiltinWav } from "./audio-synthesis.ts";
import { OWNER_SOUND_RECORDINGS } from "./sound-recordings.ts";

/** Catalogue content identity also invalidates stale development-preview Blob URLs. */
export function ownerAudioSourceKey(source: OwnerAudioCue["source"]) {
  return source.kind === "upload"
    ? `upload:${source.id}`
    : `builtin:${source.id}:${OWNER_SOUNDS.find((sound) => sound.id === source.id)?.recordingDigest ?? "legacy"}`;
}

/** Fixed local catalogue bytes only. No URLs, requests, Node or runtime decoding SDK. */
export function ownerSoundAudio(id: OwnerSoundId): {
  bytes: ArrayBuffer;
  extension: "flac" | "wav";
  mimeType: "audio/flac" | "audio/wav";
} {
  const recording = OWNER_SOUND_RECORDINGS[id];
  if (!recording)
    return {
      bytes: ownerBuiltinWav(id),
      extension: "wav",
      mimeType: "audio/wav",
    };
  const encoded = atob(recording);
  const bytes = new Uint8Array(encoded.length);
  for (let index = 0; index < encoded.length; index++)
    bytes[index] = encoded.charCodeAt(index);
  return { bytes: bytes.buffer, extension: "flac", mimeType: "audio/flac" };
}
