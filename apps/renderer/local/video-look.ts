import {
  ownerVideoLookMatrix,
  ownerVideoLookSegments,
  type OwnerVideoLookContent,
  type OwnerVideoLook,
} from "../../../packages/contracts/local/video-look.ts";
import { OWNER_FPS } from "../../../packages/contracts/local/policy.ts";

function channelMixer(look: OwnerVideoLook) {
  const matrix = ownerVideoLookMatrix(look),
    channels = ["rr", "rg", "rb", "gr", "gg", "gb", "br", "bg", "bb"];
  return `colorchannelmixer=${channels.map((key, index) => `${key}=${matrix[index]}`).join(":")}`;
}

/** Only validated fixed RGB coefficients enter the native graph, before overlays. */
export function ownerVideoLookFilter(look?: OwnerVideoLook): string {
  if (!look || look.preset === "original" || look.strength === 0) return "null";
  return `format=gbrp,${channelMixer(look)}`;
}

/** Half-open source ranges map onto the measured native occurrence clock. */
export function ownerTimedVideoLookFilter(
  content: OwnerVideoLookContent,
  clock: {
    fps: number;
    frames: number;
    sourceStartFrame: number;
    startFrame: number;
    endFrame: number;
  },
): string {
  if (!content.videoLooks?.length)
    return ownerVideoLookFilter(content.videoLook);
  const filters = ownerVideoLookSegments(content, clock).flatMap((range) => {
    if (range.preset === "original" || range.strength === 0) return [];
    const first =
      range.startFrame <= clock.startFrame
        ? 0
        : Math.max(
            0,
            Math.ceil((range.startFrame * clock.fps) / OWNER_FPS - 1e-9) -
              clock.sourceStartFrame,
          );
    const past =
      range.endFrame >= clock.endFrame
        ? clock.frames
        : Math.min(
            clock.frames,
            Math.ceil((range.endFrame * clock.fps) / OWNER_FPS - 1e-9) -
              clock.sourceStartFrame,
          );
    if (past <= first) return [];
    return [
      `${channelMixer({ preset: range.preset, strength: range.strength })}:enable='gte(n,${first})*lt(n,${past})'`,
    ];
  });
  return filters.length ? `format=gbrp,${filters.join(",")}` : "null";
}
