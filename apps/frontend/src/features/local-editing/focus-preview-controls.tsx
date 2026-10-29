import type { ComponentProps, RefObject } from "react";
import type { PlayerRef } from "@remotion/player";
import { FocusEditor } from "./focus-editor.tsx";
import { useEditorPreview } from "./use-editor-preview.ts";

type Props = Omit<
  ComponentProps<typeof FocusEditor>,
  "frame" | "playing" | "onSeek" | "onCaptureFrame" | "captureReady"
> & {
  player: RefObject<PlayerRef | null>;
  available: boolean;
  attempt: number;
};

export function FocusPreviewControls({
  player,
  available,
  attempt,
  ...props
}: Props) {
  const preview = useEditorPreview({
    player,
    available: available && !props.disabled,
    attempt,
    frames: props.focus.frames,
    captureTarget: props.focus,
  });
  return (
    <FocusEditor
      {...props}
      frame={preview.frame}
      playing={preview.playing}
      captureReady={preview.captureReady}
      onCaptureFrame={preview.captureFrame}
      onSeek={preview.seekTo}
    />
  );
}
