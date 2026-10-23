import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ownerVisualMotion } from "../../../../../packages/composition/local/visual-motion.ts";
import { OwnerAutomaticOverlay } from "../../../../../packages/composition/local/automatic-overlay.tsx";
import { ownerOverlayFrame } from "../../../../../packages/composition/local/overlay-frame.ts";
import {
  OWNER_VISUAL_ANIMATIONS,
  OWNER_PICTURE_LIMITS,
} from "../../../../../packages/contracts/local/assets.ts";
import {
  ownerOverlaySchema,
  OWNER_BATCH_POLICY,
  type OwnerOverlay,
} from "../../../../../packages/contracts/local/clips.ts";
import { ownerEditRequestSchema } from "../../../../../packages/contracts/local/editor.ts";

const cue = {
  id: crypto.randomUUID(),
  assetId: crypto.randomUUID(),
  digest: "a".repeat(64),
  origin: "owner-supplied" as const,
  startFrame: 3,
  endFrame: 24,
  box: { x: 0.1, y: 0.2, width: 0.6, height: 0.3 },
  fit: "contain" as const,
};

it.each(OWNER_VISUAL_ANIMATIONS)(
  "renders %s entrance/exit identically for repeated native raster identities",
  (animation) => {
    const overlay: OwnerOverlay = {
      version: 1,
      frames: 30,
      captions: [],
      visuals: [
        { ...cue, entrance: animation, exit: animation, animationFrames: 6 },
      ],
    };
    const seen = new Map<string, string>();
    for (let frame = 0; frame < 30; frame++) {
      const key = ownerOverlayFrame(overlay, frame).key;
      const html = renderToStaticMarkup(
        <OwnerAutomaticOverlay
          overlay={overlay}
          assets={{ [cue.assetId]: "data:image/jpeg;base64,AA==" }}
          frame={frame}
        />,
      );
      if (seen.has(key)) expect(html).toBe(seen.get(key));
      seen.set(key, html);
    }
    expect(ownerOverlayFrame(overlay, 2).visuals).toHaveLength(0);
    expect(ownerOverlayFrame(overlay, 24).visuals).toHaveLength(0);
    expect(ownerVisualMotion(overlay.visuals[0]!, 12).opacity).toBe(1);
    if (animation !== "none")
      expect(ownerVisualMotion(overlay.visuals[0]!, 3).opacity).toBe(0);
  },
);

it("keeps one/two frame pictures visible, and legacy cues static", () => {
  for (const length of [1, 2])
    for (const entrance of OWNER_VISUAL_ANIMATIONS) {
      expect(
        ownerVisualMotion(
          {
            ...cue,
            endFrame: cue.startFrame + length,
            entrance,
            exit: entrance,
          },
          cue.startFrame,
        ).opacity,
      ).toBe(1);
    }
  expect(ownerVisualMotion(cue, 3)).toEqual(ownerVisualMotion(cue, 23));
});

it("admits twenty manual picture cues without increasing automatic AI attempts, and a full replacement edit", () => {
  const visuals = Array.from(
    { length: OWNER_PICTURE_LIMITS.cuesPerClip },
    () => ({ ...cue, id: crypto.randomUUID() }),
  );
  const overlay = { version: 1, frames: 30, captions: [], visuals };
  expect(ownerOverlaySchema.safeParse(overlay).success).toBe(true);
  expect(
    ownerOverlaySchema.safeParse({
      ...overlay,
      visuals: [...visuals, { ...cue, id: crypto.randomUUID() }],
    }).success,
  ).toBe(false);
  expect(OWNER_BATCH_POLICY.imageAttemptsPerClip).toBe(3);
  expect(
    ownerEditRequestSchema.safeParse({
      operationId: crypto.randomUUID(),
      expectedRevision: 0,
      baseHash: "b".repeat(64),
      operations: [
        ...visuals.map((v) => ({ kind: "visual-remove", cueId: v.id })),
        ...visuals.map((v) => ({
          kind: "visual-upsert",
          cue: {
            id: v.id,
            assetId: v.assetId,
            startFrame: v.startFrame,
            endFrame: v.endFrame,
            box: v.box,
            fit: v.fit,
            entrance: "slide",
            exit: "fade",
          },
        })),
      ],
    }).success,
  ).toBe(true);
});
