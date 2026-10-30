// Explicit legacy content for synthetic editor/render regressions only. Never composed by the app.
import { fakeOwnerClipPreparation } from "../apps/backend/local/fake-clips.ts";
import sharp from "../apps/backend/node_modules/sharp/dist/index.mjs";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { commonsPictureAssetSchema } from "../packages/contracts/src/contextual-picture.schema.ts";
import { OWNER_FPS } from "../packages/contracts/local/policy.ts";
import type { OwnerClipPorts } from "../apps/backend/local/clip-batch.ts";

/** Synthetic raster/metadata for injected lookup tests, never a live fallback. */
export async function retrievedPictureFixture() {
  const bytes = await sharp(
    Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#58c9e8"/><circle cx="490" cy="90" r="48" fill="#ffcf45"/><path d="M0 270 180 85 390 315 520 160 640 300V360H0Z" fill="#288465"/><path d="M0 315Q180 245 360 310T640 305V360H0Z" fill="#efb46b"/></svg>',
    ),
  )
    .jpeg({ quality: 85 })
    .toBuffer();
  return {
    bytes,
    asset: commonsPictureAssetSchema.parse({
      repository: "wikimedia-commons",
      license: "CC0",
      pageId: 1,
      title: "File:Synthetic landscape fixture",
      width: 640,
      height: 360,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      dataUri: `data:image/jpeg;base64,${bytes.toString("base64")}`,
    }),
  };
}

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
