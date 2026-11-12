import { z } from "zod";
import { OWNER_PRESENTATION_MAX_FRAMES } from "../../../packages/contracts/local/hook.ts";
import { OWNER_FPS } from "../../../packages/contracts/local/policy.ts";

/** Private raster-page input, built from a confined, already prepared scene. */
export const preparedOverlaySceneSchema = z
  .object({
    src: z.string().regex(/^http:\/\/127\.0\.0\.1:\d+\/scene\.mp4$/),
    fps: z.number().min(12).max(60),
    frames: z
      .number()
      .int()
      .min(1)
      .max(OWNER_PRESENTATION_MAX_FRAMES * 2 + 2),
    startFrame: z
      .number()
      .int()
      .min(0)
      .max(OWNER_PRESENTATION_MAX_FRAMES * 2),
  })
  .strict();
export type PreparedOverlayScene = z.infer<typeof preparedOverlaySceneSchema>;

export function preparedSceneLogicalFrame(
  frame: number,
  scene: Pick<PreparedOverlayScene, "fps" | "frames">,
) {
  if (!Number.isInteger(frame) || frame < 0 || frame >= scene.frames)
    throw Error("invalid_scene_frame");
  return (frame * OWNER_FPS) / scene.fps;
}
