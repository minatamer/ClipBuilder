import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { z } from "zod";
import {
  ownerOverlaySchema,
  type OwnerOverlay,
} from "../../../packages/contracts/local/clips.ts";
import { OwnerAutomaticOverlay } from "../../../packages/composition/local/automatic-overlay.tsx";
import type {} from "./overlay-protocol.ts";
import {
  preparedOverlaySceneSchema,
  preparedSceneLogicalFrame,
  type PreparedOverlayScene,
} from "./prepared-overlay-scene.ts";
import { OWNER_FPS } from "../../../packages/contracts/local/policy.ts";
import { OWNER_GEOMETRIC_FONT } from "../../../packages/contracts/local/text-style.ts";
import { ownerVideoFrameSampleTime } from "../../../packages/contracts/local/video-assets.ts";
import { ownerPresentationFrames } from "../../../packages/contracts/local/hook.ts";
import {
  ownerOverlayClockSchema,
  type OwnerOverlayClock,
} from "../../../packages/contracts/local/visual-clock.ts";
const root = createRoot(document.getElementById("root")!);
let captionFontReady: Promise<void> | undefined;
const presentedFrames = new WeakMap<
  HTMLVideoElement,
  { src: string; frame: number; fps: number }
>();
let current:
  | {
      overlay: OwnerOverlay;
      assets: Record<string, string>;
      clock?: OwnerOverlayClock | undefined;
      scene?: PreparedOverlayScene | undefined;
    }
  | undefined;
globalThis.clipbuilderOwnerPrepare = (value) => {
  current = z
    .object({
      overlay: ownerOverlaySchema,
      assets: z.record(z.uuid(), z.string()),
      clock: ownerOverlayClockSchema.optional(),
      scene: preparedOverlaySceneSchema.optional(),
    })
    .strict()
    .parse(JSON.parse(value));
};
globalThis.clipbuilderOwnerPaint = async (frame, assets) => {
  if (
    !current ||
    !Number.isInteger(frame) ||
    frame < 0 ||
    frame >=
      (current.scene?.frames ??
        current.clock?.frames ??
        ownerPresentationFrames(current.overlay))
  )
    throw new Error("invalid_frame");
  flushSync(() =>
    root.render(
      <OwnerAutomaticOverlay
        {...current!}
        assets={{ ...current!.assets, ...assets }}
        frame={
          current!.scene
            ? preparedSceneLogicalFrame(frame, current!.scene)
            : frame
        }
        background={
          current!.scene ? (
            <video
              src={current!.scene.src}
              muted
              preload="auto"
              data-source-frame={current!.scene.startFrame + frame}
              data-source-fps={current!.scene.fps}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                display: "block",
              }}
            />
          ) : undefined
        }
      />,
    ),
  );
  await document.fonts.ready;
  // A missing bundled face must not silently export a different typeface.
  captionFontReady ??= document.fonts
    .load(`900 24px "${OWNER_GEOMETRIC_FONT}"`)
    .then((faces) => {
      if (!faces.length || faces.some((face) => face.status !== "loaded"))
        throw Error("caption_font_unavailable");
    });
  await captionFontReady;
  await Promise.all([...document.images].map((image) => image.decode()));
  await Promise.all(
    [
      ...document.querySelectorAll<HTMLVideoElement>(
        "video[data-source-frame]",
      ),
    ].map(async (video) => {
      const wait = (event: "loadeddata" | "seeked") =>
        new Promise<void>((done, fail) => {
          const timer = setTimeout(
            () => finish(new Error("video_frame_timeout")),
            15_000,
          );
          const finish = (error?: Error) => {
            clearTimeout(timer);
            video.removeEventListener(event, ready);
            video.removeEventListener("error", failed);
            if (error) fail(error);
            else done();
          };
          const ready = () => finish(),
            failed = () => finish(new Error("video_frame_unavailable"));
          video.addEventListener(event, ready, { once: true });
          video.addEventListener("error", failed, { once: true });
        });
      if (video.error) throw new Error("video_frame_unavailable");
      if (video.readyState < 2) await wait("loadeddata");
      const frame = Number(video.dataset.sourceFrame);
      const fps = Number(video.dataset.sourceFps ?? OWNER_FPS);
      if (
        !Number.isInteger(frame) ||
        frame < 0 ||
        !Number.isFinite(fps) ||
        fps < 12 ||
        fps > 60
      )
        throw new Error("invalid_video_frame");
      // Seek inside this CFR frame: an exact boundary can decode its predecessor.
      const time = ownerVideoFrameSampleTime(frame, fps);
      if (!Number.isFinite(time) || time < 0 || time >= video.duration)
        throw new Error("invalid_video_frame");
      video.pause();
      const presentedFrame = presentedFrames.get(video);
      if (
        !video.seeking &&
        presentedFrame?.src === video.currentSrc &&
        presentedFrame.frame === frame &&
        presentedFrame.fps === fps
      )
        return;
      await new Promise<void>((done, fail) => {
        let callback: number | undefined;
        const finish = (error?: Error) => {
          clearTimeout(timer);
          if (callback !== undefined) video.cancelVideoFrameCallback(callback);
          video.removeEventListener("error", failed);
          if (error) fail(error);
          else done();
        };
        const failed = () => finish(new Error("video_frame_unavailable"));
        const presented: VideoFrameRequestCallback = (_, metadata) => {
          if (Math.round(metadata.mediaTime * fps) === frame) {
            presentedFrames.set(video, { src: video.currentSrc, frame, fps });
            finish();
          } else callback = video.requestVideoFrameCallback(presented);
        };
        const timer = setTimeout(
          () => finish(new Error("video_frame_timeout")),
          15_000,
        );
        video.addEventListener("error", failed, { once: true });
        callback = video.requestVideoFrameCallback(presented);
        try {
          video.currentTime = time;
        } catch {
          failed();
        }
      });
    }),
  );
  // Frame callbacks precede surface presentation. Let the new video texture and
  // synchronous React geometry reach a committed compositor frame before CDP.
  await new Promise<void>((done) =>
    requestAnimationFrame(() => requestAnimationFrame(() => done())),
  );
};
