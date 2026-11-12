import { OWNER_GEOMETRIC_FONT } from "../../contracts/local/text-style.ts";
export const OWNER_CAPTION_FONT_URL = "/fonts/league-spartan.woff2";
/** One self-hosted variable face in browser preview and the private raster page. */
export function OwnerCaptionFontFace() {
  return (
    <style
      href="clipbuilder-caption-font"
      precedence="caption-font"
    >{`@font-face{font-family:"${OWNER_GEOMETRIC_FONT}";src:url("${OWNER_CAPTION_FONT_URL}") format("woff2");font-style:normal;font-weight:100 900;font-display:swap;}`}</style>
  );
}
