import sharp from "sharp";
import { OWNER_FPS } from "../../../packages/contracts/owner/policy.ts";
import type { OwnerClipPorts } from "./clip-batch.ts";

export const fakeOwnerClipPreparation: Pick<OwnerClipPorts, "plan" | "image"> =
  {
    async plan(moment, signal) {
      signal.throwIfAborted();
      return moment.cues.length
        ? [
            {
              startFrame: 0,
              endFrame: Math.min(
                4 * OWNER_FPS,
                moment.cut.endFrame - moment.cut.startFrame,
              ),
            },
          ]
        : [];
    },
    async image(signal) {
      signal.throwIfAborted();
      const bytes = await sharp({
        create: { width: 640, height: 360, channels: 3, background: "#e39731" },
      })
        .jpeg({ quality: 80 })
        .toBuffer();
      signal.throwIfAborted();
      return { bytes, width: 640, height: 360 };
    },
  };
