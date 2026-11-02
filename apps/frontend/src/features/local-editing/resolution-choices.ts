import type { OwnerYoutubeChoice } from "../../../../../packages/contracts/local/acquisition.ts";
import type { OwnerSavedSourceEntry } from "../../../../../packages/contracts/local/acquisition-flow.ts";

export function eligibleYoutubeResolution(
  tier: number,
  language: string | null,
  codex = false,
) {
  return (
    codex ||
    (tier >= 480 && tier <= 1440 && /^en(?:-|$)/iu.test(language ?? ""))
  );
}

export function youtubeAudioTrack(audio: {
  language: string | null;
  trackId: string | null;
  role: string;
}) {
  return JSON.stringify([audio.language, audio.trackId, audio.role]);
}

const audioRole = { original: 3, default: 2, other: 1, unknown: 0 };

export function savedResolutionChoices(
  entries: readonly OwnerSavedSourceEntry[],
  codex = false,
) {
  const tiers = new Set<number>();
  return entries.filter(({ variant }) => {
    const tier = Math.min(variant.actual.width, variant.actual.height);
    if (
      variant.state !== "ready" ||
      !eligibleYoutubeResolution(tier, variant.audio.language, codex) ||
      tiers.has(tier)
    )
      return false;
    tiers.add(tier);
    return true;
  });
}

/** One English choice per tier; retain the server's highest admitted video rank. */
export function resolutionChoices(
  choices: readonly OwnerYoutubeChoice[],
  codex = false,
) {
  const resolutions = new Map<number, OwnerYoutubeChoice>();
  for (const choice of choices) {
    if (
      !choice.supported ||
      !choice.audio ||
      !eligibleYoutubeResolution(choice.tier, choice.audio.language, codex)
    )
      continue;
    const current = resolutions.get(choice.tier);
    if (!current) resolutions.set(choice.tier, choice);
    else if (
      current.video.formatId === choice.video.formatId &&
      current.audio
    ) {
      const rank =
        audioRole[choice.audio.role] - audioRole[current.audio.role] ||
        Number(choice.preferredAudio) - Number(current.preferredAudio) ||
        (choice.audio.bitrateKbps ?? -1) - (current.audio.bitrateKbps ?? -1);
      if (rank > 0) resolutions.set(choice.tier, choice);
    }
  }
  return [...resolutions.values()];
}
