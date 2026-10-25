// Explicit legacy content for synthetic editor/render regressions only. Never composed by the app.
import { fakeOwnerClipPreparation } from "../apps/backend/local/fake-clips.ts";
import sharp from "../apps/backend/node_modules/sharp/dist/index.mjs";
import { readFile } from "node:fs/promises";
import { OWNER_FPS } from "../packages/contracts/local/policy.ts";
import type { OwnerClipPorts } from "../apps/backend/local/clip-batch.ts";

export const editorContentFixture: Pick<
  OwnerClipPorts,
  "mode" | "plan" | "image" | "focus"
> = {
  ...fakeOwnerClipPreparation,
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
      new URL("../apps/backend/local/sample-earth.jpg", import.meta.url),
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
