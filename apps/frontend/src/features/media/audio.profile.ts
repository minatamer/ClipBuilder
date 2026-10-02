import { LOCAL_WORKSPACE_LIMITS, PUBLIC_LIMITS } from "@clipbuilder/contracts";

// Candidate profiles only. Neither enables a provider route or proves speech quality.
export const AUDIO_PROFILES = {
  "opus-webm": {
    codec: "opus",
    contentType: "audio/webm",
    sampleRate: 16_000,
    maxBytes: LOCAL_WORKSPACE_LIMITS.provisionalAudioBytes,
    bitrate: 64_000,
  },
  "pcm-wav-reference": {
    codec: "pcm-s16",
    contentType: "audio/wav",
    sampleRate: 16_000,
    maxBytes: PUBLIC_LIMITS.maxSourceSeconds * 16_000 * 2 + 65_536,
    bitrate: undefined,
  },
} as const;

export type AudioProfile = keyof typeof AUDIO_PROFILES;
export const AUDIO_SCRATCH_FOLDER = "audio-scratch-v1";
export const AUDIO_LIFETIME = {
  deadlineMs: 300_000,
  stallMs: 20_000,
  codecPaddingMs: 120,
} as const;

export interface AudioProgress {
  phase: "encoding" | "validating";
  processedMs: number;
  bytes: number;
}

export interface ExtractedAudio {
  profile: AudioProfile;
  file: Blob;
  sourceDurationMs: number;
  sourceFirstSampleMs: number;
  sourceLastSampleMs: number;
  presentationDurationMs: number;
  decodedFirstSampleMs: number;
  decodedLastSampleMs: number;
  decodedSampleRate: number;
  bytes: number;
}
