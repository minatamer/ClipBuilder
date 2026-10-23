import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { OWNER_FPS } from "../../../packages/contracts/local/policy.ts";
import type { OwnerClipPorts } from "./clip-batch.ts";

export const fakeOwnerClipPreparation: Pick<
  OwnerClipPorts,
  "mode" | "plan" | "image"
> = {
  mode: "synthetic-ai",
  async plan({ moment }, signal) {
    signal.throwIfAborted();
    return moment.cues.length
      ? [
          {
            startFrame: 0,
            endFrame: Math.min(
              4 * OWNER_FPS,
              moment.cut.endFrame - moment.cut.startFrame,
            ),
            brief: {
              scene:
                "A sample photograph of Earth from space for the fictional conversation.",
              searchQuery: "Earth from space",
              requiredTerms: ["Earth"],
              avoidTerms: [],
            },
            evidenceWordIds: [moment.cues[0]!.id],
          },
        ]
      : [];
  },
  async image(_request, signal) {
    signal.throwIfAborted();
    const sample = await readFile(
      new URL("./sample-earth.jpg", import.meta.url),
    );
    const bytes = await sharp(sample)
      .resize({
        width: 640,
        height: 640,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toBuffer();
    signal.throwIfAborted();
    return { bytes, origin: "synthetic" };
  },
};
