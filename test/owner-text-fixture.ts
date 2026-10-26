import { ownerClipSchema } from "../packages/contracts/local/clips.ts";
import { OWNER_SOCIAL_TEXT_PRESETS } from "../packages/contracts/local/text-style.ts";
import type { OwnerTextLayer } from "../packages/contracts/local/text-layers.ts";

export function syntheticTextLayer(
  preset: keyof typeof OWNER_SOCIAL_TEXT_PRESETS = "tiktok",
): OwnerTextLayer {
  return {
    id: crypto.randomUUID(),
    text: "A synthetic headline\nSecond line",
    startFrame: 15,
    endFrame: 60,
    style: {
      ...OWNER_SOCIAL_TEXT_PRESETS[preset],
      box: { x: 0.1, y: 0.1, width: 0.8, height: 0.2 },
    },
  };
}
export function syntheticTextClip() {
  const id = crypto.randomUUID(),
    analysisId = crypto.randomUUID(),
    momentId = crypto.randomUUID();
  return ownerClipSchema.parse({
    id,
    analysisId,
    momentId,
    mode: "synthetic-ai",
    sourceRevision: 0,
    revision: 0,
    assemblyRevision: 0,
    state: "review-ready",
    assets: [],
    outputs: [],
    preview: { frames: 90, bytes: 1000 },
    calls: { plan: 0, image: 0, render: 0 },
    error: null,
    baseHash: "a".repeat(64),
    edit: null,
    base: {
      version: 1,
      analysisId,
      momentId,
      sourceRevision: 0,
      fingerprint: "b".repeat(64),
      processingIdentity: "c".repeat(64),
      cut: { startFrame: 0, endFrame: 90 },
      words: [],
      overlay: {
        version: 1,
        frames: 90,
        visuals: [],
        captions: [
          {
            startMs: 0,
            endMs: 3000,
            text: "Synthetic captions",
            lines: ["Synthetic captions"],
            wordIds: ["w_000001", "w_000002"],
            wordCues: [
              {
                wordId: "w_000001",
                text: "Synthetic",
                startMs: 0,
                endMs: 1500,
              },
              {
                wordId: "w_000002",
                text: "captions",
                startMs: 1500,
                endMs: 3000,
              },
            ],
          },
        ],
      },
    },
  });
}
