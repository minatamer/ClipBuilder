import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import {
  ownerOverlaySchema,
  type OwnerOverlay,
} from "../../../packages/contracts/owner/clips.ts";
import { OwnerAutomaticOverlay } from "../../../packages/composition/owner/automatic-overlay.tsx";
import type {} from "./overlay-protocol.ts";
const root = createRoot(document.getElementById("root")!);
let current:
  { overlay: OwnerOverlay; assets: Record<string, string> } | undefined;
globalThis.clipbuilderOwnerPrepare = (value) => {
  current = {
    overlay: ownerOverlaySchema.parse(value.overlay),
    assets: value.assets,
  };
};
globalThis.clipbuilderOwnerPaint = async (frame) => {
  if (
    !current ||
    !Number.isInteger(frame) ||
    frame < 0 ||
    frame >= current.overlay.frames
  )
    throw new Error("invalid_frame");
  flushSync(() =>
    root.render(<OwnerAutomaticOverlay {...current!} frame={frame} />),
  );
  await document.fonts.ready;
  await Promise.all([...document.images].map((image) => image.decode()));
};
