import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { OwnerStyledCaption } from "../../../packages/composition/local/styled-caption.tsx";
import { ownerOverlayFrame } from "../../../packages/composition/local/overlay-frame.ts";
import {
  ownerTypographyWeight,
  OWNER_FONT_SIZE,
} from "../../../packages/contracts/local/text-style.ts";
import type { OwnerOverlay } from "../../../packages/contracts/local/clips.ts";

/** Test-only SVG material proof. It does not replace the app's HTML export renderer. */
export function glassMaterialFrame(overlay: OwnerOverlay, frame: number) {
  const state = ownerOverlayFrame(overlay, frame),
    style = state.captionStyle;
  const empty =
    '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920"/>';
  if (!state.caption) return empty;
  if (style?.material !== "glass" || style.animation !== "single-word")
    throw Error("glass_material_proof_scope");
  const markup = renderToStaticMarkup(
    createElement(OwnerStyledCaption, {
      caption: state.caption,
      ms: state.ms,
      style,
    }),
  );
  const body = markup.match(/<svg[^>]*>([\s\S]*?)<\/svg>/)?.[1];
  if (!body) return empty;
  const size = Number(markup.match(/font-size:(\d+)px/)?.[1]);
  if (!Number.isInteger(size) || size < 1 || size > OWNER_FONT_SIZE.max)
    throw Error("glass_material_proof_font");
  const height = size * 1.2,
    box = style.box;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920"><svg x="${box.x * 1080}" y="${box.y * 1920 + (box.height * 1920 - height) / 2}" width="${box.width * 1080}" height="${height}" font-family="${style.font ?? "Arial"}" font-size="${size}" font-weight="${ownerTypographyWeight(style)}">${body}</svg></svg>`;
}
