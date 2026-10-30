/* eslint-disable @next/next/no-img-element -- Shared native raster and local review use admitted static raster assets directly. */
import type { OwnerOverlay } from "../../contracts/local/clips.ts";
import { FixedCaption } from "../src/fixed-layers.tsx";
import { ownerOverlayFrame } from "./overlay-frame.ts";
import { OwnerStyledCaption } from "./styled-caption.tsx";
import { OwnerTextLayerView } from "./text-layer.tsx";
import { ownerVisualMotion } from "./visual-motion.ts";
import { OWNER_CAPTION_PRESETS } from "../../contracts/local/editor.ts";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import type { OwnerOverlayClock } from "../../contracts/local/visual-clock.ts";

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
}: {
  overlay: OwnerOverlay;
  assets: Record<string, string>;
  frame: number;
  clock?: OwnerOverlayClock | undefined;
  renderImage?: ((props: OwnerOverlayImageProps) => ReactNode) | undefined;
  onImageError?: (() => void) | undefined;
}) {
  const width = 1080,
    height = 1920;
  const { ms, frame, caption, colors, visuals, texts } = ownerOverlayFrame(
    overlay,
    presentationFrame,
    clock,
  );
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
            position: "absolute",
            left: cue.box.x * width,
            top: cue.box.y * height,
            width: cue.box.width * width,
            height: cue.box.height * height,
            objectFit: cue.fit,
            borderRadius: 20,
            ...ownerVisualMotion(cue, frame),
          },
        };
        return (
          <Fragment key={cue.id}>
            {renderImage ? (
              renderImage(props)
            ) : (
              <img {...props} alt={props.alt} />
            )}
          </Fragment>
        );
      })}
      {texts.map((layer) => (
        <OwnerTextLayerView key={layer.id} layer={layer} />
      ))}
      {caption &&
        (overlay.captionStyle || colors ? (
          <OwnerStyledCaption
            caption={caption}
            ms={ms}
            style={overlay.captionStyle ?? OWNER_CAPTION_PRESETS.clean}
            {...(colors ? { colors } : {})}
          />
        ) : (
          <FixedCaption caption={caption} ms={ms} />
        ))}
    </div>
  );
}
