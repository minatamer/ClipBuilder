import { useState, type RefObject } from "react";
import type { PlayerRef } from "@remotion/player";
import { Clock3 } from "lucide-react";
import type { OwnerVisualEdit } from "../../../../../packages/contracts/local/assets.ts";
import { OWNER_FPS } from "../../../../../packages/contracts/local/policy.ts";
import { Button } from "../../shared/ui/button";
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
}: {
  cue: T;
  frames: number;
  player: RefObject<PlayerRef | null>;
  available: boolean;
  attempt: number;
  onChange: (cue: T) => void;
  label?: string;
}) {
  const preview = useEditorPreview({ player, available, attempt, frames });
  const [error, setError] = useState("");
  function capture(key: "startFrame" | "endFrame") {
    const at = preview.captureFrame();
    if (at === null) return;
    const next = { ...cue, [key]: key === "startFrame" ? at : at + 1 };
    if (
      !Number.isFinite(next.startFrame) ||
      !Number.isFinite(next.endFrame) ||
      next.startFrame < 0 ||
      next.endFrame > frames ||
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
                  min={start ? 0 : 1 / OWNER_FPS}
                  max={(start ? frames - 1 : frames) / OWNER_FPS}
                  step="0.033333"
                  value={
                    Number.isFinite(cue[key])
                      ? Number((cue[key] / OWNER_FPS).toFixed(3))
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
                            ),
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
