import {
  AbsoluteFill,
  Html5Video,
  OffthreadVideo,
  getRemotionEnvironment,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { CompositionManifestV2 } from "@clipbuilder/contracts";
import { focusLayout } from "./focus-layout.js";
export type ClipCompositionProps = {
  manifest: CompositionManifestV2;
  sourceUrl: string;
  sourceStartMs: number;
};
export function ClipComposition({
  manifest,
  sourceUrl,
  sourceStartMs,
}: ClipCompositionProps) {
  const frame = useCurrentFrame(),
    { fps, width, height } = useVideoConfig(),
    ms = (frame * 1000) / fps;
  const focus = manifest.focus.find((s) => s.startMs <= ms && ms < s.endMs) ?? {
    mode: "wide" as const,
    startMs: 0,
    endMs: manifest.range.endMs - manifest.range.startMs,
  };
  const caption = manifest.captions.find(
      (s) => s.startMs <= ms && ms < s.endMs,
    ),
    card = manifest.cards.find((s) => s.startMs <= ms && ms < s.endMs);
  const Video = getRemotionEnvironment().isRendering
    ? OffthreadVideo
    : Html5Video;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#101215",
        overflow: "hidden",
        fontFamily: "Arial",
        color: "white",
      }}
    >
      <Video
        src={sourceUrl}
        trimBefore={Math.round((sourceStartMs * fps) / 1000)}
        style={{
          position: "absolute",
          ...focusLayout(manifest.source, focus, width, height),
        }}
      />
      {card && (
        <div
          style={{
            position: "absolute",
            top: 200,
            left: 80,
            right: 80,
            padding: 48,
            backgroundColor: "#172c38",
            borderRadius: 24,
            opacity: Math.min(1, (ms - card.startMs) / 200),
          }}
        >
          <div style={{ fontSize: 56, fontWeight: 700, marginBottom: 24 }}>
            {card.title}
          </div>
          {card.lines.map((line, i) => (
            <div key={i} style={{ fontSize: 42, marginBottom: 16 }}>
              {line}
            </div>
          ))}
        </div>
      )}
      {caption && (
        <div
          style={{
            position: "absolute",
            left: 80,
            right: 80,
            bottom: 220,
            padding: 28,
            backgroundColor: "#101215",
            borderRadius: 16,
            textAlign: "center",
            fontSize: 52,
            fontWeight: 700,
          }}
        >
          {caption.text}
        </div>
      )}
    </AbsoluteFill>
  );
}
