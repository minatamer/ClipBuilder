import { z } from "zod";
import { OWNER_FPS, OWNER_LIMITS, ownerIdSchema } from "./policy.ts";
import { ownerDigestSchema } from "./assets.ts";
import { ownerHookFrames, type OwnerHook } from "./hook.ts";

export const OWNER_AUDIO_LIMITS = {
  inputBytes: 12 * 1024 ** 2,
  bytes: 24 * 1024 ** 2,
  durationMs: 120_000,
  assets: 8,
  cues: 12,
  sampleRate: 48_000,
  channels: 2,
  fadeSeconds: 0.005,
} as const;
export const OWNER_SOUND_IDS = [
  "pop",
  "snap",
  "whoosh",
  "ding",
  "tension",
  "pulse",
  "bamboo",
  "boom",
  "discord",
] as const;
export type OwnerSoundId = (typeof OWNER_SOUND_IDS)[number];
export const OWNER_SOUNDS: readonly {
  id: OwnerSoundId;
  label: string;
  seconds: number;
  music: boolean;
  retired?: true;
  recordingDigest?: string;
}[] = [
  {
    id: "pop",
    label: "Pop SFX",
    seconds: 9 / OWNER_FPS,
    music: false,
    recordingDigest:
      "d46fb1fd3d2718b99b133c1a13b17f3d1a4b7886eee8b849739a1f440a43f0dd",
  },
  {
    id: "discord",
    label: "Discord notification",
    seconds: 15 / OWNER_FPS,
    music: false,
    recordingDigest:
      "8a0183278548b8b507bf741a5b633c5fadb316b9f0063fbe0abe360cbd7312d3",
  },
  {
    id: "bamboo",
    label: "Bamboo hit",
    seconds: 19 / OWNER_FPS,
    music: false,
    recordingDigest:
      "f2c49b6a01d2bc405947dc4c0f2e1bff41052cc204129dafee1cf704a9395c0b",
  },
  {
    id: "boom",
    label: "Vine boom",
    seconds: 38 / OWNER_FPS,
    music: false,
    recordingDigest:
      "e6bdddf69536e45d0c97181b9c4f108d40572b115e5990e5fc2078d49f87b73e",
  },
  {
    id: "tension",
    label: "Sator suspense",
    seconds: 123 / OWNER_FPS,
    music: true,
    retired: true,
    recordingDigest:
      "af916117498f9621d58f88ef324b42af2319c66c3a7bcb61ff8b292dd3f64385",
  },
  {
    id: "snap",
    label: "Snap",
    seconds: 4 / OWNER_FPS,
    music: false,
    retired: true,
  },
  {
    id: "whoosh",
    label: "Whoosh",
    seconds: 14 / OWNER_FPS,
    music: false,
    retired: true,
  },
  {
    id: "ding",
    label: "Ding",
    seconds: 20 / OWNER_FPS,
    music: false,
    retired: true,
  },
  {
    id: "pulse",
    label: "Background pulse",
    seconds: 4,
    music: true,
    retired: true,
  },
];
export const ownerAudioAssetSchema = z
  .object({
    id: ownerIdSchema,
    digest: ownerDigestSchema,
    bytes: z.number().int().positive().max(OWNER_AUDIO_LIMITS.bytes),
    durationMs: z.number().int().positive().max(OWNER_AUDIO_LIMITS.durationMs),
    frames: z
      .number()
      .int()
      .positive()
      .max((OWNER_AUDIO_LIMITS.durationMs * OWNER_FPS) / 1000),
  })
  .strict()
  .refine(
    (asset) =>
      asset.durationMs === Math.round((asset.frames * 1000) / OWNER_FPS),
  );
export type OwnerAudioAsset = z.infer<typeof ownerAudioAssetSchema>;
export const ownerAudioCueSchema = z
  .object({
    id: ownerIdSchema,
    source: z.discriminatedUnion("kind", [
      z
        .object({ kind: z.literal("builtin"), id: z.enum(OWNER_SOUND_IDS) })
        .strict(),
      z.object({ kind: z.literal("upload"), id: ownerIdSchema }).strict(),
    ]),
    placement: z.enum(["clip", "hook", "video"]),
    startFrame: z.number().int().nonnegative(),
    endFrame: z
      .number()
      .int()
      .positive()
      .max((OWNER_LIMITS.clipMs * OWNER_FPS) / 1000 + 300),
    offsetFrame: z
      .number()
      .int()
      .nonnegative()
      .max((OWNER_AUDIO_LIMITS.durationMs * OWNER_FPS) / 1000),
    volume: z.number().int().min(0).max(100),
    loop: z.boolean(),
    visualId: ownerIdSchema.optional(),
  })
  .strict()
  .refine((cue) => cue.endFrame > cue.startFrame);
export type OwnerAudioCue = z.infer<typeof ownerAudioCueSchema>;
export const ownerAudioEditSchema = z
  .object({
    originalVolume: z.number().int().min(0).max(100),
    cues: z
      .array(ownerAudioCueSchema)
      .max(OWNER_AUDIO_LIMITS.cues)
      .refine(
        (cues) => new Set(cues.map((cue) => cue.id)).size === cues.length,
      ),
  })
  .strict();
export type OwnerAudioEdit = z.infer<typeof ownerAudioEditSchema>;

/** Anchored accents follow an edited visual; removing it removes only its accent. */
export function resolveOwnerAudioCues(
  cues: readonly OwnerAudioCue[],
  visuals: readonly { id: string; startFrame: number }[],
  frames: number,
): OwnerAudioCue[] {
  return cues.flatMap((cue) => {
    if (!cue.visualId) return [cue];
    const visual = visuals.find((item) => item.id === cue.visualId);
    if (!visual) return [];
    const length =
      cue.source.kind === "builtin"
        ? Math.round(ownerAudioDuration(cue.source, []) * OWNER_FPS)
        : cue.endFrame - cue.startFrame;
    return [
      {
        ...cue,
        placement: "clip" as const,
        startFrame: visual.startFrame,
        endFrame: Math.min(frames, visual.startFrame + length),
      },
    ];
  });
}
export const ownerAudioTrackSchema = ownerAudioEditSchema
  .extend({
    assets: z.array(ownerAudioAssetSchema).max(OWNER_AUDIO_LIMITS.assets),
  })
  .refine(
    (track) =>
      new Set(track.assets.map((asset) => asset.id)).size ===
        track.assets.length &&
      track.cues.every(
        (cue) =>
          cue.source.kind === "builtin" ||
          track.assets.some((asset) => asset.id === cue.source.id),
      ),
  );
export type OwnerAudioTrack = z.infer<typeof ownerAudioTrackSchema>;

export function ownerAudioDuration(
  source: OwnerAudioCue["source"],
  assets: readonly OwnerAudioAsset[],
) {
  const seconds =
    source.kind === "builtin"
      ? OWNER_SOUNDS.find((sound) => sound.id === source.id)?.seconds
      : (assets.find((asset) => asset.id === source.id)?.frames ?? 0) /
        OWNER_FPS;
  if (!seconds || !Number.isFinite(seconds))
    throw new Error("invalid_audio_asset");
  return seconds;
}
export type OwnerAudioSegment = {
  cue: OwnerAudioCue;
  start: number;
  end: number;
  offset: number;
};
/** One projection for preview and native mixing; native supplies its physical clocks. */
export function ownerAudioSegments(
  audio: OwnerAudioTrack | undefined,
  frames: number,
  hook?: OwnerHook,
  clock?: { hookSeconds: number; bodySeconds: number },
): OwnerAudioSegment[] {
  if (!audio) return [];
  const prefix = clock?.hookSeconds ?? ownerHookFrames({ hook }) / OWNER_FPS,
    body = clock?.bodySeconds ?? frames / OWNER_FPS;
  const segments: OwnerAudioSegment[] = [];
  const add = (
    cue: OwnerAudioCue,
    start: number,
    end: number,
    offset: number,
  ) => {
    const duration = ownerAudioDuration(cue.source, audio.assets);
    if (cue.loop) offset %= duration;
    else end = Math.min(end, start + Math.max(0, duration - offset));
    if (end > start) segments.push({ cue, start, end, offset });
  };
  for (const cue of audio.cues) {
    const offset = cue.offsetFrame / OWNER_FPS;
    if (cue.placement === "video") add(cue, 0, prefix + body, offset);
    else if (cue.placement === "hook") {
      if (hook && prefix > 0) add(cue, 0, prefix, offset);
    } else {
      const from = cue.startFrame / OWNER_FPS,
        to = Math.min(body, cue.endFrame / OWNER_FPS);
      if (hook) {
        const start = Math.max(from, hook.startFrame / OWNER_FPS),
          end = Math.min(to, hook.endFrame / OWNER_FPS);
        add(
          cue,
          Math.max(0, start - hook.startFrame / OWNER_FPS),
          Math.min(prefix, end - hook.startFrame / OWNER_FPS),
          offset + start - from,
        );
      }
      add(cue, prefix + from, prefix + to, offset);
    }
  }
  return segments;
}
