import { useContext, type ComponentProps, type RefObject } from "react";
import type { PlayerRef } from "@remotion/player";
import { CameraMotionEditor } from "./camera-motion-editor.tsx";
import { EditorHookClock } from "./editor-clock.ts";
import { ownerPresentationFrames } from "../../../../../packages/contracts/local/hook.ts";
import type { OwnerCameraEffect } from "../../../../../packages/contracts/local/camera-motion.ts";
import { FocusEditor } from "./focus-editor.tsx";
import { useEditorPreview } from "./use-editor-preview.ts";

type Props = Omit<
  ComponentProps<typeof FocusEditor>,
  "frame" | "playing" | "onSeek" | "onCaptureFrame" | "captureReady" | "motion"
> & {
  player: RefObject<PlayerRef | null>;
  available: boolean;
  attempt: number;
  cameraEffects: OwnerCameraEffect[];
  onCameraEffects: (effects: OwnerCameraEffect[]) => void;
  cameraAvailable: boolean;
};

export function FocusPreviewControls({
  player,
  available,
  attempt,
  cameraEffects,
  onCameraEffects,
  cameraAvailable,
  ...props
}: Props) {
  const preview = useEditorPreview({
    player,
    available: available && !props.disabled,
    attempt,
    frames: props.focus.frames,
    captureTarget: props.focus,
  });
  const hook = useContext(EditorHookClock);
  const motion = useEditorPreview({
    player,
    available: available && !props.disabled,
    attempt,
    frames: ownerPresentationFrames({ frames: props.focus.frames, hook }),
    captureTarget: cameraEffects,
    presentationClock: true,
  });
  return (
    <FocusEditor
      {...props}
      motion={
        <CameraMotionEditor
          focus={props.focus}
          effects={cameraEffects}
          hook={hook}
          sourceUrl={props.sourceUrl}
          onChange={onCameraEffects}
          captureReady={motion.captureReady}
          capture={motion.captureFrame}
          seek={motion.seekTo}
          preview={(at) => {
            motion.seekTo(at);
            void player.current?.play();
          }}
          available={cameraAvailable}
          disabled={props.disabled}
        />
      }
      frame={preview.frame}
      playing={preview.playing}
      captureReady={preview.captureReady}
      onCaptureFrame={preview.captureFrame}
      onSeek={preview.seekTo}
    />
  );
}
