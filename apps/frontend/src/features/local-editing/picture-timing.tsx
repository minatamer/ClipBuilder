import { useContext, useState, type RefObject } from "react";
import type { PlayerRef } from "@remotion/player";
import { Clock3 } from "lucide-react";
import type { OwnerVisualEdit } from "../../../../../packages/contracts/local/assets.ts";
import { OWNER_FPS } from "../../../../../packages/contracts/local/policy.ts";
import { Button } from "../../shared/ui/button";
import {
  EditorHookClock,
  EditorOccurrence,
  EditorPresentationClock,
  editorClockOffset,
} from "./editor-clock.ts";
import { useEditorPreview } from "./use-editor-preview.ts";

export function PictureTiming<
  T extends Pick<OwnerVisualEdit, "startFrame" | "endFrame">,
>({
  cue,
  frames,
  player,
  available,
  attempt,
  onChange,
  label = "Picture",
  presentationClock = false,
  onStartAfterEnd,
}: {
  cue: T;
  frames: number;
  player: RefObject<PlayerRef | null>;
  available: boolean;
  attempt: number;
  onChange: (cue: T) => void;
  label?: string;
  presentationClock?: boolean;
  onStartAfterEnd?: ((frame: number) => void) | undefined;
}) {
  const hook = useContext(EditorHookClock);
  const occurrence = useContext(EditorOccurrence);
  const unifiedClock = useContext(EditorPresentationClock);
  const displayOffset = unifiedClock
    ? editorClockOffset(hook, occurrence, presentationClock)
    : 0;
  const minimum =
    !presentationClock && occurrence === "hook" && hook ? hook.startFrame : 0;
  const maximum =
    occurrence === "hook" && hook
      ? presentationClock
        ? hook.endFrame - hook.startFrame
        : hook.endFrame
      : frames;
  const preview = useEditorPreview({
    player,
    available,
    attempt,
    frames,
    captureTarget: cue,
    presentationClock,
    occurrenceClock: presentationClock,
  });
  const [error, setError] = useState("");
  async function capture(key: "startFrame" | "endFrame") {
    const at = await preview.captureFrame();
    if (at === null) {
      setError("Wait for the preview to finish seeking.");
      return;
    }
    if (
      key === "startFrame" &&
      onStartAfterEnd &&
      at >= minimum &&
      at < maximum &&
      (!Number.isFinite(cue.endFrame) || at >= cue.endFrame)
    ) {
      setError("");
      onStartAfterEnd(at);
      return;
    }
    const next = { ...cue, [key]: key === "startFrame" ? at : at + 1 };
    if (
      !Number.isFinite(next.startFrame) ||
      !Number.isFinite(next.endFrame) ||
      next.startFrame < minimum ||
      next.endFrame > maximum ||
      next.startFrame >= next.endFrame
    ) {
      setError(
        key === "startFrame"
          ? `Choose a frame before the ${label.toLowerCase()}'s end.`
          : `Choose a frame at or after the ${label.toLowerCase()}'s start.`,
      );
      return;
    }
    setError("");
    onChange(next);
  }
  return (
    <>
      <div className="editor-fields picture-timing">
        {(["startFrame", "endFrame"] as const).map((key) => {
          const start = key === "startFrame";
          return (
            <div className="range-time" key={key}>
              <label>
                {start ? "Start (s)" : "End (s)"}
                <input
                  type="number"
                  aria-label={`${label} ${start ? "start" : "end"} seconds`}
                  min={(displayOffset + minimum + (start ? 0 : 1)) / OWNER_FPS}
                  max={
                    (displayOffset + (start ? maximum - 1 : maximum)) /
                    OWNER_FPS
                  }
                  step="0.033333"
                  value={
                    Number.isFinite(cue[key])
                      ? Number(
                          ((cue[key] + displayOffset) / OWNER_FPS).toFixed(3),
                        )
                      : ""
                  }
                  onChange={(event) => {
                    setError("");
                    onChange({
                      ...cue,
                      [key]:
                        event.currentTarget.value === ""
                          ? NaN
                          : Math.round(
                              Number(event.currentTarget.value) * OWNER_FPS,
                            ) - displayOffset,
                    });
                  }}
                />
              </label>
              <Button
                variant="quiet"
                icon={Clock3}
                disabled={!preview.captureReady}
                aria-label={`Capture ${label.toLowerCase()} ${start ? "start" : "end"}`}
                title={
                  start
                    ? "Use current preview frame"
                    : "End after current frame"
                }
                onClick={() => capture(key)}
              >
                Capture
              </Button>
            </div>
          );
        })}
      </div>
      {error && (
        <p className="local-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
