/* eslint-disable @next/next/no-img-element -- Shared native raster and local review use admitted JPEG assets directly. */
import type { OwnerOverlay } from "../../contracts/owner/clips.ts";
import { FixedCaption } from "../src/fixed-layers.tsx";
import { ownerOverlayFrame } from "./overlay-frame.ts";

/** The same fixed overlay tree runs in local review and transparent export. */
export function OwnerAutomaticOverlay({
  overlay,
  assets,
  frame,
}: {
  overlay: OwnerOverlay;
  assets: Record<string, string>;
  frame: number;
}) {
  const width = 1080,
    height = 1920;
  const { ms, caption, visuals } = ownerOverlayFrame(overlay, frame);
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
      {visuals.map((cue) => (
        <img
          key={cue.id}
          src={assets[cue.assetId]!}
          alt={
            cue.origin === "synthetic"
              ? "Synthetic picture placeholder"
              : "Owner picture"
          }
          style={{
            position: "absolute",
            left: cue.box.x * width,
            top: cue.box.y * height,
            width: cue.box.width * width,
            height: cue.box.height * height,
            objectFit: cue.fit,
            borderRadius: 20,
          }}
        />
      ))}
      {caption && <FixedCaption caption={caption} ms={ms} />}
    </div>
  );
}
