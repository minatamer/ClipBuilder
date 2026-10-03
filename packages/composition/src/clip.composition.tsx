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
import { ContextualCard, FixedCaption } from "./fixed-layers.js";
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
          ...focusLayout(manifest.source, focus, width, height, ms),
        }}
      />
      {card && <ContextualCard card={card} ms={ms} />}
      {caption && <FixedCaption caption={caption} />}
    </AbsoluteFill>
  );
}
