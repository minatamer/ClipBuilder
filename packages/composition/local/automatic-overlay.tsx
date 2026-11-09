/* eslint-disable @next/next/no-img-element -- Shared native raster and local review use admitted static raster assets directly. */
import type { OwnerOverlay } from "../../contracts/local/clips.ts";
import { FixedCaption } from "../src/fixed-layers.tsx";
import { ownerOverlayFrame } from "./overlay-frame.ts";
import { OwnerStyledCaption } from "./styled-caption.tsx";
import { OwnerTextLayerView } from "./text-layer.tsx";
import { ownerVisualMotion } from "./visual-motion.ts";
import { OWNER_CAPTION_PRESETS } from "../../contracts/local/editor.ts";
import { type CSSProperties, type ReactNode } from "react";
import type { OwnerOverlayClock } from "../../contracts/local/visual-clock.ts";
import { ownerVisualTransform } from "../../contracts/local/visual-effects.ts";
import type { OwnerOverlayContent } from "../../contracts/local/clips.ts";

export type OwnerOverlayImageProps = {
  src: string;
  alt: string;
  style: CSSProperties;
  onError?: (() => void) | undefined;
};

/** The same fixed overlay tree runs in local review and transparent export. */
export function OwnerAutomaticOverlay({
  overlay,
  assets,
  frame: presentationFrame,
  clock,
  renderImage,
  onImageError,
  renderVideo,
}: {
  overlay: OwnerOverlay;
  assets: Record<string, string>;
  frame: number;
  clock?: OwnerOverlayClock | undefined;
  renderImage?: ((props: OwnerOverlayImageProps) => ReactNode) | undefined;
  onImageError?: (() => void) | undefined;
  renderVideo?:
    | ((
        props: OwnerOverlayImageProps,
        cue: OwnerOverlayContent["visuals"][number],
        frame: number,
      ) => ReactNode)
    | undefined;
}) {
  const width = 1080,
    height = 1920;
  const { ms, frame, caption, colors, visuals, texts, captionStyle } =
    ownerOverlayFrame(overlay, presentationFrame, clock);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        color: "white",
        fontFamily: "Arial",
        overflow: "hidden",
      }}
    >
      {visuals.map((cue) => {
        const transform = ownerVisualTransform(
          cue,
          frame,
          overlay.videoAssets?.find((asset) => asset.id === cue.assetId),
        );
        const full = cue.presentation === "full-frame";
        const props: OwnerOverlayImageProps = {
          src: assets[cue.assetId]!,
          onError: onImageError,
          alt:
            cue.origin === "synthetic"
              ? "Sample picture"
              : cue.origin === "generated"
                ? "Generated illustration"
                : "Owner picture",
          style: {
            width: "100%",
            height: "100%",
            display: "block",
            objectFit: full ? "cover" : cue.fit,
            objectPosition: `${transform.x * 100}% ${transform.y * 100}%`,
            transform: `scale(${transform.zoom})`,
            transformOrigin: `${transform.x * 100}% ${transform.y * 100}%`,
          },
        };
        return (
          <div
            key={cue.id}
            data-visual-id={cue.id}
            style={{
              position: "absolute",
              left: full ? 0 : cue.box.x * width,
              top: full ? 0 : cue.box.y * height,
              width: full ? width : cue.box.width * width,
              height: full ? height : cue.box.height * height,
              overflow: "hidden",
              borderRadius: full ? 0 : 20,
              ...ownerVisualMotion(cue, frame),
            }}
          >
            {cue.video ? (
              renderVideo ? (
                renderVideo(props, cue, frame)
              ) : (
                <video
                  src={props.src}
                  muted
                  preload="auto"
                  style={props.style}
                  data-source-frame={Math.floor(
                    frame - cue.startFrame + cue.video.offsetFrame + 1e-6,
                  )}
                />
              )
            ) : renderImage ? (
              renderImage(props)
            ) : (
              <img {...props} alt={props.alt} />
            )}
          </div>
        );
      })}
      {texts.map((layer) => (
        <OwnerTextLayerView key={layer.id} layer={layer} />
      ))}
      {caption &&
        (captionStyle || colors ? (
          <OwnerStyledCaption
            caption={caption}
            ms={ms}
            style={captionStyle ?? OWNER_CAPTION_PRESETS.clean}
            {...(colors ? { colors } : {})}
          />
        ) : (
          <FixedCaption caption={caption} ms={ms} />
        ))}
    </div>
  );
}
