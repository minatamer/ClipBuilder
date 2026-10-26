import type { CSSProperties } from "react";
import {
  ownerTextBackground,
  ownerTypographyWeight,
  type OwnerTypography,
} from "../../contracts/local/text-style.ts";

export function ownerTypographyPaint(style: OwnerTypography): CSSProperties {
  const outline = style.outlineWidth ?? (style.preset === "tiktok" ? 5 : 0);
  const legacyShadow =
    style.outlineWidth === undefined &&
    !["tiktok", "solid", "translucent"].includes(style.preset);
  return {
    fontFamily: style.font ?? "Arial",
    fontWeight: ownerTypographyWeight(style),
    color: style.color,
    textAlign: style.align,
    WebkitTextStroke: `${outline}px ${style.outlineColor ?? "#000000"}`,
    paintOrder: "stroke fill",
    textShadow: legacyShadow
      ? "0 2px 2px #000, 2px 0 2px #000, -2px 0 2px #000, 0 -2px 2px #000"
      : "none",
  };
}
export function ownerTypographyBackground(
  style: OwnerTypography,
  scale = 1,
): CSSProperties {
  const background = ownerTextBackground(style);
  return {
    backgroundColor: `${background.color}${Math.round(background.opacity * 255)
      .toString(16)
      .padStart(2, "0")}`,
    borderRadius: 10 * scale,
    padding: background.opacity ? `${6 * scale}px ${12 * scale}px` : undefined,
    boxDecorationBreak: "clone",
    WebkitBoxDecorationBreak: "clone",
  };
}

/** Same conservative offline font metrics in preview and native Chromium. */
export function ownerTextLineUnits(
  line: string,
  font: OwnerTypography["font"],
) {
  if (font === "Courier New")
    return Array.from(line).reduce(
      (sum, char) => sum + ((char.codePointAt(0) ?? 0) > 127 ? 1.2 : 0.65),
      0,
    );
  return (
    Array.from(line).reduce(
      (total, char) =>
        total +
        (/[MWmw@%]/u.test(char) || (char.codePointAt(0) ?? 0) > 127
          ? 1.1
          : /[A-Z]/u.test(char)
            ? 0.9
            : /[ilj.,'!:; ]/u.test(char)
              ? 0.4
              : 0.7),
      0,
    ) * (font && font !== "Arial" ? 1.15 : 1)
  );
}
