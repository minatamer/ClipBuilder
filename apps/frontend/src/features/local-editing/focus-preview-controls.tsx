import { useContext, type ComponentProps, type RefObject } from "react";
import type { PlayerRef } from "@remotion/player";
import { CameraMotionEditor } from "./camera-motion-editor.tsx";
import { HeadMotionEditor } from "./head-motion-editor";
import type { OwnerCameraTrack } from "../../../../../packages/contracts/local/camera-follow.ts";
import { EditorHookClock } from "./editor-clock.ts";
import {
  ownerPresentationFrames,
  ownerSourceFrame,
} from "../../../../../packages/contracts/local/hook.ts";
import type { OwnerCameraEffect } from "../../../../../packages/contracts/local/camera-motion.ts";
import { FocusEditor } from "./focus-editor.tsx";
import { useEditorPreview } from "./use-editor-preview.ts";
import { ownerFocusAt } from "../../../../../packages/contracts/local/focus.ts";

type Props = Omit<
  ComponentProps<typeof FocusEditor>,
  | "frame"
  | "playing"
  | "onSeek"
  | "onCaptureFrame"
  | "captureReady"
  | "motion"
  | "tracking"
> & {
  player: RefObject<PlayerRef | null>;
  available: boolean;
  attempt: number;
  cameraEffects: OwnerCameraEffect[];
  onCameraEffects: (effects: OwnerCameraEffect[]) => void;
  cameraAvailable: boolean;
  cameraTracks: OwnerCameraTrack[];
  onCameraTracks: (tracks: OwnerCameraTrack[]) => void;
  onTrackingMode: (active: boolean) => void;
  onTrackingBusy: (active: boolean) => void;
  footerTarget?: HTMLElement | null | undefined;
};

export function FocusPreviewControls({
  player,
  available,
  attempt,
  cameraEffects,
  onCameraEffects,
  cameraAvailable,
  cameraTracks,
  onCameraTracks,
  onTrackingMode,
  onTrackingBusy,
  footerTarget,
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
  const sourceFrame = ownerSourceFrame({ hook }, motion.frame);
  return (
    <FocusEditor
      {...props}
      tracking={
        <HeadMotionEditor
          focus={props.focus}
          tracks={cameraTracks}
          effects={cameraEffects}
          hook={hook}
          sourceUrl={props.sourceUrl}
          personId={ownerFocusAt(props.focus, sourceFrame).personId}
          onPersonChange={(id) => {
            const choices = props.focus.shots.filter(
              (shot) => shot.personId === id,
            );
            const chosen =
              choices.find(
                (shot) =>
                  shot.startFrame <= preview.frame &&
                  preview.frame < shot.endFrame,
              ) ?? choices[0];
            if (chosen)
              preview.seekTo(
                chosen.startFrame <= preview.frame &&
                  preview.frame < chosen.endFrame
                  ? preview.frame
                  : chosen.startFrame,
              );
          }}
          pause={() => player.current?.pause()}
          capture={motion.captureFrame}
          captureReady={motion.captureReady}
          seek={motion.seekTo}
          preview={(at) => {
            motion.seekTo(at);
            void player.current?.play();
          }}
          onChange={onCameraTracks}
          onMode={onTrackingMode}
          onBusy={onTrackingBusy}
          footerTarget={footerTarget}
          disabled={props.disabled}
          available={cameraAvailable}
        />
      }
      motion={
        <CameraMotionEditor
          focus={props.focus}
          effects={cameraEffects}
          tracks={cameraTracks}
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
      frame={sourceFrame}
      playing={preview.playing}
      captureReady={preview.captureReady}
      onCaptureFrame={preview.captureFrame}
      onSeek={preview.seekTo}
    />
  );
}
