import { randomUUID } from "node:crypto";
import {
  ownerClipSchema,
  type OwnerClip,
} from "../packages/contracts/local/clips.ts";
import { automaticOwnerEdit } from "../packages/contracts/local/edit-overlay.ts";
import { OWNER_CAPTION_PRESETS } from "../packages/contracts/local/editor.ts";
import { OWNER_SOCIAL_TEXT_PRESETS } from "../packages/contracts/local/text-style.ts";
import { defaultOwnerFocus } from "../packages/contracts/local/focus.ts";
export function independentHookFixture(): OwnerClip {
  const words = Array.from({ length: 4 }, (_, index) => ({
    id: `w_${String(index + 1).padStart(6, "0")}`,
    text: ["Before", "Hook", "After", "End"][index]!,
    punctuatedText: ["Before", "Hook", "After", "End"][index]!,
    startMs: index * 1000,
    endMs: (index + 1) * 1000,
    confidence: null,
    speakerId: "spk_0",
  }));
  const asset = {
    id: randomUUID(),
    digest: "d".repeat(64),
    bytes: 100,
    width: 100,
    height: 100,
    origin: "synthetic" as const,
    format: "png" as const,
  };
  const visual = {
    id: randomUUID(),
    assetId: asset.id,
    digest: asset.digest,
    origin: asset.origin,
    format: asset.format,
    startFrame: 0,
    endFrame: 120,
    box: { x: 0.1, y: 0.65, width: 0.3, height: 0.2 },
    fit: "contain" as const,
  };
  const base = {
    version: 1 as const,
    analysisId: randomUUID(),
    momentId: randomUUID(),
    sourceRevision: 0,
    fingerprint: "a".repeat(64),
    processingIdentity: "b".repeat(64),
    cut: { startFrame: 0, endFrame: 120 },
    words,
    overlay: {
      version: 1 as const,
      frames: 120,
      focus: defaultOwnerFocus({ width: 640, height: 360 }, 120),
      captionStyle: OWNER_CAPTION_PRESETS.tiktok,
      captions: words.map((w) => ({
        startMs: w.startMs,
        endMs: w.endMs,
        text: w.text,
        lines: [w.text],
        wordIds: [w.id],
        wordCues: [
          { wordId: w.id, text: w.text, startMs: w.startMs, endMs: w.endMs },
        ],
      })),
      visuals: [visual],
      texts: [
        {
          id: randomUUID(),
          text: "Original",
          startFrame: 0,
          endFrame: 120,
          style: {
            ...OWNER_SOCIAL_TEXT_PRESETS.tiktok,
            box: { x: 0.1, y: 0.1, width: 0.8, height: 0.2 },
          },
        },
      ],
      audio: {
        originalVolume: 100,
        cues: [
          {
            id: randomUUID(),
            source: { kind: "builtin" as const, id: "pulse" as const },
            placement: "video" as const,
            startFrame: 0,
            endFrame: 120,
            offsetFrame: 0,
            volume: 20,
            loop: true,
          },
        ],
        assets: [],
      },
    },
  };
  const clip = ownerClipSchema.parse({
    id: randomUUID(),
    momentId: base.momentId,
    analysisId: base.analysisId,
    mode: "synthetic-ai",
    sourceRevision: 0,
    revision: 0,
    assemblyRevision: 0,
    baseHash: "c".repeat(64),
    state: "ready",
    base,
    edit: null,
    assets: [asset],
    audioAssets: [],
    outputs: [],
    calls: { plan: 0, image: 0, render: 0 },
    error: null,
  });
  clip.edit = automaticOwnerEdit(clip.base!, clip.id, clip.baseHash!);
  return clip;
}
