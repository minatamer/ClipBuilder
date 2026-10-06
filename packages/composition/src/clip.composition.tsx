import {
  AbsoluteFill,
  Html5Video,
  OffthreadVideo,
  getRemotionEnvironment,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { CompositionManifestV3 } from "@clipbuilder/contracts";
import { focusLayout } from "./focus-layout.js";
import {
  ContextualCard,
  ContextualPicture,
  FixedCaption,
} from "./fixed-layers.js";
export type ClipCompositionProps = {
  manifest: CompositionManifestV3;
  sourceUrl: string;
};
export function ClipComposition({ manifest, sourceUrl }: ClipCompositionProps) {
  const frame = useCurrentFrame(),
    { fps, width, height } = useVideoConfig(),
    ms = (frame * 1000) / fps;
  const focus = manifest.focus.find((s) => s.startMs <= ms && ms < s.endMs) ?? {
    mode: "wide" as const,
    reason: "initial" as const,
    startMs: 0,
    endMs: manifest.range.endMs - manifest.range.startMs,
  };
  const caption = manifest.captions.find(
      (s) => s.startMs <= ms && ms < s.endMs,
    ),
    card = manifest.cards.find((s) => s.startMs <= ms && ms < s.endMs),
    picture = manifest.pictures?.find((s) => s.startMs <= ms && ms < s.endMs);
  // Both inputs are already physically trimmed. Source range clocks are used
  // only for grounding; the one mounted media element starts at clip zero.
  const videoProps = {
    src: sourceUrl,
    style: {
      position: "absolute" as const,
      ...focusLayout(manifest.source, focus, width, height, ms),
    },
  };
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#101215",
        overflow: "hidden",
        fontFamily: "Arial",
        color: "white",
      }}
    >
      {getRemotionEnvironment().isRendering ? (
        <OffthreadVideo {...videoProps} />
      ) : (
        <Html5Video {...videoProps} pauseWhenBuffering />
      )}
      {card && <ContextualCard card={card} ms={ms} />}
      {picture && <ContextualPicture picture={picture} ms={ms} />}
      {caption && <FixedCaption caption={caption} ms={ms} />}
    </AbsoluteFill>
  );
}
