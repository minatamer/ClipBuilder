import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { z } from "zod";
import {
  ownerOverlaySchema,
  type OwnerOverlay,
} from "../../../packages/contracts/local/clips.ts";
import { OwnerAutomaticOverlay } from "../../../packages/composition/local/automatic-overlay.tsx";
import type {} from "./overlay-protocol.ts";
const root = createRoot(document.getElementById("root")!);
let current:
  { overlay: OwnerOverlay; assets: Record<string, string> } | undefined;
globalThis.clipbuilderOwnerPrepare = (value) => {
  current = z
    .object({
      overlay: ownerOverlaySchema,
      assets: z.record(z.uuid(), z.string()),
    })
    .strict()
    .parse(JSON.parse(value));
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
