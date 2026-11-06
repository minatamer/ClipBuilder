import {
  OWNER_TEXT_LIMITS,
  ownerLayerTextSchema,
  ownerTextStyleSchema,
  type OwnerTextLayer,
} from "../../../../../packages/contracts/local/text-layers.ts";
import { validOwnerTextSpans } from "../../../../../packages/contracts/local/text-ranges.ts";
import { ownerCaptionTextSchema } from "../../../../../packages/contracts/local/editor.ts";

export function captionWordError(text: string): string | undefined {
  if (!text.trim()) return "Enter a word.";
  if (text.length > 80) return "Max 80 characters.";
  return ownerCaptionTextSchema.element.shape.text.safeParse(text).success
    ? undefined
    : "Use plain text.";
}

export function textContentError(text: string): string | undefined {
  if (!text.trim()) return "Enter text.";
  if (text.length > OWNER_TEXT_LIMITS.characters) return "Max 500 characters.";
  if (text.split(/\r\n?|\n/u).length > OWNER_TEXT_LIMITS.lines)
    return "Max 10 lines.";
  if (!ownerLayerTextSchema.safeParse(text).success) return "Use plain text.";
  return undefined;
}

/** Present the existing contract's failures at the owning text controls. */
export function textLayerErrors(layer: OwnerTextLayer, frames: number) {
  return {
    content: textContentError(layer.text),
    timing:
      !Number.isInteger(layer.startFrame) ||
      !Number.isInteger(layer.endFrame) ||
      layer.startFrame < 0 ||
      layer.endFrame <= layer.startFrame ||
      layer.endFrame > frames
        ? "Set a valid start and end."
        : undefined,
    style: !ownerTextStyleSchema.safeParse(layer.style).success
      ? "Check text size and position."
      : !validOwnerTextSpans(layer.text, layer.spans ?? [])
        ? "Check word styling."
        : undefined,
  };
}
