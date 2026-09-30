export const PUBLIC_LIMITS = {
  maxJsonRequestBytes: 64 * 1024,
  maxJsonResponseBytes: 2 * 1024 * 1024,
  maxSourceBytes: 500 * 1024 * 1024,
  minSourceSeconds: 15,
  maxSourceSeconds: 20 * 60,
  minClipSeconds: 10,
  maxClipSeconds: 60,
  maxTranscriptWords: 12_000,
  maxTranscriptCharacters: 200_000,
  candidateTarget: 3,
  maxCandidateCount: 4,
  maxFinalRenders: 1,
  maxOutputBytes: 200 * 1024 * 1024,
} as const;

export const OWNER_VALIDATION_LIMITS = {
  maxJsonRequestBytes: 128 * 1024,
  maxJsonResponseBytes: 4 * 1024 * 1024,
  maxSourceBytes: 1.5 * 1024 * 1024 * 1024,
  minSourceSeconds: 15,
  maxSourceSeconds: 60 * 60,
  minClipSeconds: 10,
  maxClipSeconds: 60,
  maxTranscriptWords: 30_000,
  maxTranscriptCharacters: 500_000,
  candidateTarget: 3,
  maxCandidateCount: 4,
  maxFinalRenders: 3,
  maxOutputBytes: 300 * 1024 * 1024,
} as const;

export const MEDIA_LIMITS = {
  maxVideoWidth: 3_840,
  maxVideoHeight: 3_840,
  maxFramePixels: 8_294_400,
  minFrameRate: 12,
  maxFrameRate: 60,
  maxVideoStreams: 1,
  maxAudioStreams: 1,
} as const;

export const ASSEMBLY_LIMITS = {
  maxFaceTracksPerShot: 4,
  maxVisualCues: 3,
  minVisualCueMilliseconds: 1_500,
  maxVisualCueMilliseconds: 4_500,
  maxVisualCoveragePercent: 45,
  maxGeneratedImageCalls: 3,
  maxGeneratedAssetBytes: 15 * 1024 * 1024,
} as const;

export const LIMIT_PROFILES = {
  public: PUBLIC_LIMITS,
  validation: OWNER_VALIDATION_LIMITS,
} as const;

export type LimitProfile = keyof typeof LIMIT_PROFILES;

export function isSourceWithinLimitProfile(
  source: { bytes: number; durationMs: number },
  profile: LimitProfile,
): boolean {
  const limits = LIMIT_PROFILES[profile];

  return (
    Number.isFinite(source.bytes) &&
    Number.isFinite(source.durationMs) &&
    source.bytes >= 1 &&
    source.bytes <= limits.maxSourceBytes &&
    source.durationMs >= limits.minSourceSeconds * 1_000 &&
    source.durationMs <= limits.maxSourceSeconds * 1_000
  );
}
