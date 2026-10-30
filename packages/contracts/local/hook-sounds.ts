import { OWNER_FPS } from "./policy.ts";

/** Owner-selected recordings, padded with less than one video frame of silence. */
export const OWNER_HOOK_SOUNDS = [
  {
    id: "riser",
    label: "Riser",
    frames: 159,
    recordingDigest:
      "63de3e2a3f6bb71372f2d2deeb1b3b2df3bae54eb7085ec1eff07b5a8f257c71",
  },
  {
    id: "rising-tension",
    label: "Rising tension",
    frames: 222,
    recordingDigest:
      "dbe3a51423f692691beaae06b4ff586915dacd00e0dc9bab9cc87dea0a9e19e2",
  },
] as const;

export const OWNER_AI_HOOK_POLICY = {
  earliestStartFrame: 10 * OWNER_FPS,
  minimumPreferredFrames: 3 * OWNER_FPS,
  comfortablePreferredFrames: 4 * OWNER_FPS,
  preferredFrames: OWNER_HOOK_SOUNDS[0].frames,
  maxFrames: OWNER_HOOK_SOUNDS[1].frames,
} as const;
