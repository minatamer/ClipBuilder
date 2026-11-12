import { useId } from "react";
import { OWNER_GLASS_OPACITY } from "../../contracts/local/editor.ts";

// A fixed optical field: inward displacement magnifies the sampled backdrop.
// The map is code-owned, local and independent of video/content or wall time.
const lensMap =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="128"><defs><linearGradient id="r"><stop stop-color="#ff0000"/><stop offset="1" stop-color="#000000"/></linearGradient><linearGradient id="g" x2="0" y2="1"><stop stop-color="#00ff00"/><stop offset="1" stop-color="#000000"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#r)"/><rect width="100%" height="100%" fill="url(#g)" style="mix-blend-mode:screen"/></svg>',
  );

/** The same glyph-clipped backdrop lens runs over the live and prepared scene. */
export function OwnerGlassWord({
  text,
  color,
  outlineColor = "#10243b",
  outlineWidth = 0,
  opacity = OWNER_GLASS_OPACITY,
  appearance = 1,
}: {
  text: string;
  color: string;
  outlineColor?: string | undefined;
  outlineWidth?: number | undefined;
  opacity?: number | undefined;
  appearance?: number | undefined;
}) {
  const id = useId(),
    surface = `${id}-surface`,
    edge = `${id}-edge`,
    grain = `${id}-grain`,
    clip = `${id}-clip`,
    lens = `${id}-lens`,
    reflection = `${id}-reflection`,
    shadow = `${id}-shadow`;
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
          backdropFilter: `url(#${lens})`,
          WebkitBackdropFilter: `url(#${lens})`,
          opacity: Math.sin(Math.PI * opacity) * appearance,
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
          opacity: appearance * Math.min(1, opacity / OWNER_GLASS_OPACITY),
        }}
      >
        <defs>
          <clipPath id={clip}>
            <text {...glyph}>{text}</text>
          </clipPath>
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
              scale="48"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <linearGradient id={surface} x1="8%" y1="0%" x2="92%" y2="100%">
            <stop stopColor="#536d7e" stopOpacity="0.8" />
            <stop offset="0.16" stopColor="#d9edf4" stopOpacity="0.94" />
            <stop offset="0.3" stopColor={color} stopOpacity="0.98" />
            <stop offset="0.47" stopColor="#8ca4ad" stopOpacity="0.7" />
            <stop offset="0.54" stopColor="#283e4c" stopOpacity="0.8" />
            <stop offset="0.65" stopColor="#78b0cd" stopOpacity="0.75" />
            <stop offset="0.8" stopColor="#f5fbff" stopOpacity="0.96" />
            <stop offset="1" stopColor="#698e9f" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id={edge} x1="0%" y1="0%" x2="35%" y2="100%">
            <stop stopColor="#ffffff" stopOpacity="0.98" />
            <stop offset="0.36" stopColor="#d5f1ff" stopOpacity="0.65" />
            <stop offset="0.55" stopColor="#122338" stopOpacity="0.85" />
            <stop offset="1" stopColor="#f2faff" stopOpacity="0.8" />
          </linearGradient>
          <filter
            id={reflection}
            x="-15%"
            y="-20%"
            width="130%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.006 0.018"
              numOctaves="2"
              seed="23"
              result="reflection-field"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="reflection-field"
              scale="42"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter id={shadow} x="-15%" y="-20%" width="130%" height="140%">
            <feDropShadow
              dx="1"
              dy="3"
              stdDeviation="1.2"
              floodColor="#000000"
              floodOpacity="0.65"
            />
          </filter>
          <filter
            id={grain}
            x="0"
            y="0"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="1"
              seed="7"
            />
            <feColorMatrix type="saturate" values="0" />
            <feComposite in2="SourceAlpha" operator="in" />
          </filter>
        </defs>
        <text {...glyph} fill={color} opacity={opacity * opacity}>
          {text}
        </text>
        <text
          {...glyph}
          fill="none"
          stroke={outlineColor}
          strokeOpacity="0.8"
          strokeWidth={outlineWidth + 3.5}
          strokeLinejoin="round"
          transform="translate(0.8 1.2)"
          filter={`url(#${shadow})`}
        >
          {text}
        </text>
        <g clipPath={`url(#${clip})`} opacity={opacity}>
          <rect
            width="100%"
            height="100%"
            fill={`url(#${surface})`}
            filter={`url(#${reflection})`}
          />
        </g>
        <text
          {...glyph}
          fill={`url(#${surface})`}
          stroke={`url(#${edge})`}
          strokeWidth="1.8"
          strokeLinejoin="round"
          paintOrder="stroke fill"
          fillOpacity={opacity * 0.2}
        >
          {text}
        </text>
        <text
          {...glyph}
          fill="#ffffff"
          opacity={0.035 * opacity}
          filter={`url(#${grain})`}
        >
          {text}
        </text>
      </svg>
    </span>
  );
}
