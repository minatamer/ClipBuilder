import { useId } from "react";
import { OWNER_GLASS_OPACITY } from "../../contracts/local/editor.ts";

// A subtle optical field: inward displacement magnifies the sampled backdrop.
// The map is code-owned, local and independent of video/content or wall time.
const lensMap =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="128"><defs><linearGradient id="r"><stop stop-color="#ff0000"/><stop offset="1" stop-color="#000000"/></linearGradient><linearGradient id="g" x2="0" y2="1"><stop stop-color="#00ff00"/><stop offset="1" stop-color="#000000"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#r)"/><rect width="100%" height="100%" fill="url(#g)" style="mix-blend-mode:screen"/></svg>',
  );

/** Scene-driven glyph optics and neutral edge lighting; no painted environment. */
export function OwnerGlassWord({
  text,
  fontSize,
  color,
  outlineColor = "#10243b",
  outlineWidth = 0,
  opacity = OWNER_GLASS_OPACITY,
  appearance = 1,
}: {
  text: string;
  fontSize: number;
  color: string;
  outlineColor?: string | undefined;
  outlineWidth?: number | undefined;
  opacity?: number | undefined;
  appearance?: number | undefined;
}) {
  const id = useId(),
    surface = `${id}-surface`,
    bevel = `${id}-bevel`,
    shadow = `${id}-shadow`,
    clip = `${id}-clip`,
    mask = `${id}-mask`,
    lens = `${id}-lens`;
  const scale = fontSize / 180;
  const glyph = {
    x: "50%",
    y: "50%",
    textAnchor: "middle" as const,
    dominantBaseline: "central" as const,
  };
  return (
    <span
      data-glass-word
      style={{
        position: "relative",
        display: "inline-block",
        color: "transparent",
        WebkitTextStroke: 0,
        textShadow: "none",
        verticalAlign: "top",
        letterSpacing: "-0.025em",
      }}
    >
      {text}
      <span
        aria-hidden="true"
        data-glass-refraction
        style={{
          position: "absolute",
          inset: 0,
          clipPath: `url(#${clip})`,
          maskImage: `url(#${mask})`,
          WebkitMaskImage: `url(#${mask})`,
          maskMode: "alpha",
          backdropFilter: `url(#${lens})`,
          WebkitBackdropFilter: `url(#${lens})`,
          opacity: opacity ** 0.25 * appearance,
        }}
      />
      <svg
        aria-hidden="true"
        focusable="false"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
          opacity: appearance,
        }}
      >
        <defs>
          <clipPath id={clip} clipPathUnits="userSpaceOnUse">
            <text {...glyph}>{text}</text>
          </clipPath>
          <mask
            id={mask}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="100%"
            height="100%"
            style={{ maskType: "alpha" }}
          >
            <text {...glyph} fill="white">
              {text}
            </text>
          </mask>
          <filter
            id={lens}
            x="-25%"
            y="-25%"
            width="150%"
            height="150%"
            colorInterpolationFilters="sRGB"
          >
            <feImage
              href={lensMap}
              x="0"
              y="0"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              result="lens-map"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="lens-map"
              scale={10 * scale}
              xChannelSelector="R"
              yChannelSelector="G"
              result="refracted-scene"
            />
            {/* Reverse luminance for a polished light-on-dark/dark-on-light
                face, retaining scene chroma rather than painting blue clouds.
                RGB = .98 - luminance + .35 * (channel - luminance). */}
            <feColorMatrix
              in="refracted-scene"
              type="matrix"
              values="0.06299 -0.96552 -0.09747 0 .98  -0.28701 -0.61552 -0.09747 0 .98  -0.28701 -0.96552 0.25253 0 .98  0 0 0 1 0"
            />
          </filter>
          <linearGradient id={surface} x1="0" y1="0" x2="0.28" y2="1">
            <stop stopColor={color} stopOpacity="0.16" />
            <stop offset="0.28" stopColor="white" stopOpacity="0.02" />
            <stop offset="0.48" stopColor="black" stopOpacity="0.12" />
            <stop offset="0.56" stopColor="white" stopOpacity="0.12" />
            <stop offset="0.82" stopColor="white" stopOpacity="0.01" />
            <stop offset="1" stopColor={color} stopOpacity="0.1" />
          </linearGradient>
          <filter
            id={bevel}
            x="-10%"
            y="-20%"
            width="120%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur
              in="SourceAlpha"
              stdDeviation={1.3 * scale}
              result="soft-glyph"
            />
            <feSpecularLighting
              in="soft-glyph"
              surfaceScale={4 * scale}
              specularConstant="1.1"
              specularExponent="24"
              lightingColor="#ffffff"
              result="lit-edge"
            >
              <feDistantLight azimuth="235" elevation="48" />
            </feSpecularLighting>
            <feMorphology
              in="SourceAlpha"
              operator="erode"
              radius={5 * scale}
              result="inset-glyph"
            />
            <feComposite
              in="SourceAlpha"
              in2="inset-glyph"
              operator="out"
              result="inner-rim"
            />
            <feComposite in="lit-edge" in2="inner-rim" operator="in" />
          </filter>
          <filter id={shadow} x="-10%" y="-15%" width="120%" height="140%">
            <feGaussianBlur
              in="SourceAlpha"
              stdDeviation={1.1 * scale}
              result="blurred-glyph"
            />
            <feOffset
              in="blurred-glyph"
              dx={1.5 * scale}
              dy={3.5 * scale}
              result="offset-glyph"
            />
            <feFlood floodColor="#000000" floodOpacity="0.85" />
            <feComposite in2="offset-glyph" operator="in" />
            <feComposite in2="SourceAlpha" operator="out" />
          </filter>
        </defs>
        <text
          {...glyph}
          fill="black"
          opacity={opacity ** 0.5}
          filter={`url(#${shadow})`}
        >
          {text}
        </text>
        <g clipPath={`url(#${clip})`}>
          <text {...glyph} fill={`url(#${surface})`} opacity={opacity ** 0.25}>
            {text}
          </text>
          <text
            {...glyph}
            fill="none"
            stroke={outlineColor}
            strokeOpacity={opacity ** 0.5}
            strokeWidth={outlineWidth + 4.5 * scale}
            strokeLinejoin="round"
            transform={`translate(${1.2 * scale} ${1.5 * scale})`}
          >
            {text}
          </text>
          <text
            {...glyph}
            fill="none"
            stroke="#f0fcff"
            strokeOpacity={opacity ** 0.5}
            strokeWidth={2 * scale}
            strokeLinejoin="round"
            transform={`translate(${-0.5 * scale} ${-0.6 * scale})`}
          >
            {text}
          </text>
          <text
            {...glyph}
            fill="white"
            opacity={opacity ** 0.35}
            filter={`url(#${bevel})`}
          >
            {text}
          </text>
        </g>
      </svg>
    </span>
  );
}
