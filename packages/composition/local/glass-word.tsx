import { useId } from "react";

/** Fixed alpha material: no background read, external texture or clock-dependent randomness. */
export function OwnerGlassWord({
  text,
  color,
  outlineColor = "#10243b",
  outlineWidth = 0,
}: {
  text: string;
  color: string;
  outlineColor?: string | undefined;
  outlineWidth?: number | undefined;
}) {
  const id = useId(),
    surface = `${id}-surface`,
    edge = `${id}-edge`,
    grain = `${id}-grain`;
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
      }}
    >
      {text}
      <svg
        aria-hidden="true"
        focusable="false"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
        }}
      >
        <defs>
          <linearGradient id={surface} x1="8%" y1="0%" x2="92%" y2="100%">
            <stop stopColor={color} stopOpacity="0.28" />
            <stop offset="0.22" stopColor="#ffffff" stopOpacity="0.68" />
            <stop offset="0.38" stopColor={color} stopOpacity="0.18" />
            <stop offset="0.5" stopColor="#c3e5f4" stopOpacity="0.1" />
            <stop offset="0.51" stopColor="#142a42" stopOpacity="0.32" />
            <stop offset="0.67" stopColor={color} stopOpacity="0.12" />
            <stop offset="0.88" stopColor="#effaff" stopOpacity="0.48" />
            <stop offset="1" stopColor={color} stopOpacity="0.28" />
          </linearGradient>
          <linearGradient id={edge} x1="0%" y1="0%" x2="35%" y2="100%">
            <stop stopColor="#ffffff" stopOpacity="0.98" />
            <stop offset="0.36" stopColor="#d5f1ff" stopOpacity="0.65" />
            <stop offset="0.55" stopColor="#122338" stopOpacity="0.85" />
            <stop offset="1" stopColor="#f2faff" stopOpacity="0.8" />
          </linearGradient>
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
        <text
          {...glyph}
          fill="none"
          stroke={outlineColor}
          strokeOpacity="0.55"
          strokeWidth={outlineWidth + 2}
          strokeLinejoin="round"
          transform="translate(0.8 1.2)"
        >
          {text}
        </text>
        <text
          {...glyph}
          fill={`url(#${surface})`}
          stroke={`url(#${edge})`}
          strokeWidth="1.25"
          strokeLinejoin="round"
          paintOrder="stroke fill"
        >
          {text}
        </text>
        <text
          {...glyph}
          fill="#ffffff"
          opacity="0.11"
          filter={`url(#${grain})`}
        >
          {text}
        </text>
      </svg>
    </span>
  );
}
