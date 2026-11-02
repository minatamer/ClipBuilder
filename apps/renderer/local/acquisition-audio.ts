import type { OwnerAcquisitionDescriptor } from "../../../packages/contracts/local/acquisition-profile.ts";

/** Bind encoded identity while allowing only HE-AAC's signaled SBR rate. */
export function assertAcquisitionAudio(
  stream: {
    codec_type: string;
    codec_name: string;
    channels?: number | undefined;
    sample_rate?: number | undefined;
    profile?: string | undefined;
  },
  selected: OwnerAcquisitionDescriptor,
) {
  if (
    stream.codec_type !== "audio" ||
    stream.codec_name !== selected.audioCodec ||
    stream.channels !== selected.audioChannels
  )
    throw Error("acquisition_selection_changed");
  if (selected.audioSbr && stream.profile !== "HE-AAC")
    throw Error("acquisition_selection_changed", {
      cause: Error("acquisition_audio_profile_changed"),
    });
  if (
    stream.sample_rate !== selected.audioSampleRate &&
    !(
      selected.audioSbr &&
      stream.profile === "HE-AAC" &&
      stream.sample_rate === selected.audioSampleRate * 2 &&
      stream.sample_rate <= 48_000
    )
  )
    throw Error("acquisition_selection_changed", {
      cause: Error("acquisition_audio_rate_changed"),
    });
}

/** Two HE-AAC output packets cover encoder priming/tail rounding, plus one video frame. */
export function matchesAcquisitionAudioClock(
  audioMs: number,
  videoMs: number,
  selected: OwnerAcquisitionDescriptor,
  decodedRate: number | undefined,
) {
  const videoFrameMs = Math.ceil(1000 / selected.fps) + 1;
  const packetMargin =
    selected.audioSbr && decodedRate
      ? Math.ceil((2 * 2048 * 1000) / decodedRate) + videoFrameMs
      : 0;
  return (
    Math.abs(audioMs - videoMs) <= Math.max(100, videoFrameMs, packetMargin)
  );
}
