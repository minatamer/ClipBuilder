import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  ownerTextLayerSchema,
  ownerPlannedTextSchema,
  OWNER_PLANNED_TEXT_LIMIT,
  type OwnerTextLayer,
} from "../../../packages/contracts/local/text-layers.ts";
import { OWNER_SOCIAL_TEXT_PRESETS } from "../../../packages/contracts/local/text-style.ts";
import type { OwnerWord } from "../../../packages/contracts/local/selection.ts";

export const PLANNED_TEXT_POLICY =
  "TEXT: zero to three optional concise title/emphasis overlays, not repeated captions. Return texts with startFrame/endFrame and wordIds selecting short source excerpts in source order (up to twelve words). Prefer one useful opening headline and a small number of meaningful emphasis moments; omit filler. Do not return word IDs as visible text or invent quotations. Times are clip-relative 30fps frames. No separate title field.";
export function decodePlannedText(
  value: unknown,
  words: readonly OwnerWord[],
  frames: number,
): OwnerTextLayer[] {
  const envelope = z.object({ texts: z.array(z.unknown()) }).safeParse(value);
  if (!envelope.success) return [];
  const byId = new Map(words.map((word, index) => [word.id, { word, index }]));
  return envelope.data.texts
    .slice(0, OWNER_PLANNED_TEXT_LIMIT)
    .flatMap((item) => {
      const cue = ownerPlannedTextSchema.element.safeParse(item);
      if (!cue.success || frames < 1) return [];
      const selected = cue.data.wordIds
        .flatMap((id) => (byId.has(id) ? [byId.get(id)!] : []))
        .sort((a, b) => a.index - b.index);
      const text = [
        ...new Map(
          selected.map((value) => [value.word.id, value.word.punctuatedText]),
        ).values(),
      ].join(" ");
      const startFrame = Math.min(frames - 1, Math.max(0, cue.data.startFrame)),
        endFrame = Math.min(
          frames,
          Math.max(startFrame + 1, cue.data.endFrame),
        );
      const layer = ownerTextLayerSchema.safeParse({
        id: randomUUID(),
        text,
        startFrame,
        endFrame,
        style: {
          ...OWNER_SOCIAL_TEXT_PRESETS.tiktok,
          fontSize: 72,
          box: { x: 0.08, y: 0.08, width: 0.84, height: 0.18 },
        },
      });
      return layer.success ? [layer.data] : [];
    });
}
