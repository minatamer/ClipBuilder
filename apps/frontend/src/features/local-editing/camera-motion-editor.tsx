import { useEffect, useRef, useState } from "react";
import { Clock3, Play, Trash2 } from "lucide-react";
import { Button } from "../../shared/ui/button";
import { InlineFeedback } from "../../shared/ui/inline-feedback";
import { CameraTargetSurface } from "./camera-target-surface.tsx";
import { FocusPreviewSlot } from "./focus-preview-slot";
import { defaultCameraZoom } from "./camera-zoom-default.ts";
import { OWNER_FPS } from "../../../../../packages/contracts/local/policy.ts";
import {
  ownerHookFrames,
  type OwnerHook,
} from "../../../../../packages/contracts/local/hook.ts";
import {
  ownerFocusAt,
  ownerFocusCrop,
  ownerSourceContent,
  type OwnerFocus,
} from "../../../../../packages/contracts/local/focus.ts";
import {
  OWNER_CAMERA_MOTION,
  ownerCameraEffectEnd,
  ownerCameraEffectsSchema,
  ownerCameraEffectSchema,
  ownerCameraTargetSchema,
  ownerCameraTargetCrop,
  ownerCameraEffectsFit,
  ownerCameraCropAt,
  ownerCameraPanCrop,
  type OwnerCameraEffect,
} from "../../../../../packages/contracts/local/camera-motion.ts";
import type { OwnerCameraTrack } from "../../../../../packages/contracts/local/camera-follow.ts";

const seconds = (frames: number) =>
  Number.isFinite(frames) ? Number((frames / OWNER_FPS).toFixed(3)) : "";
export function CameraMotionEditor({
  mode = "zoom",
  focus,
  effects,
  previewEffects,
  tracks = [],
  hook,
  positionIndex,
  sourceUrl,
  onChange,
  captureReady,
  capture,
  seek,
  preview,
  available,
  disabled,
}: {
  mode?: "zoom" | "pan";
  focus: OwnerFocus;
  effects: OwnerCameraEffect[];
  previewEffects?: readonly OwnerCameraEffect[] | undefined;
  tracks?: OwnerCameraTrack[];
  hook: OwnerHook | undefined;
  positionIndex?: number | undefined;
  sourceUrl: string;
  onChange: (effects: OwnerCameraEffect[]) => void;
  captureReady: boolean;
  capture: () => Promise<number | null>;
  seek: (frame: number) => void;
  preview: (frame: number) => void;
  available: boolean;
  disabled: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null),
    [capturingStart, setCapturingStart] = useState(false),
    [message, setMessage] = useState("");
  const choices = effects.filter((item) => (item.kind ?? "zoom") === mode);
  const label = mode === "pan" ? "Pan" : "Zoom";
  const effect = choices.find((item) => item.id === selected) ?? choices[0];
  const paintedEffect =
    previewEffects?.find((item) => item.id === effect?.id) ?? effect;
  const prefix = ownerHookFrames({ hook }),
    offset = effect?.occurrence === "body" ? prefix : 0;
  const start =
    paintedEffect && Number.isFinite(paintedEffect.startFrame)
      ? paintedEffect.startFrame
      : 0;
  const sourceStart = paintedEffect
    ? (paintedEffect.occurrence === "hook" ? (hook?.startFrame ?? 0) : 0) +
      start
    : 0;
  const content = ownerSourceContent(focus.source);
  const baseline =
    mode === "pan"
      ? content
      : ownerFocusCrop(focus, ownerFocusAt(focus, sourceStart));
  const fallback = { centerX: 0.5, centerY: 0.5, zoom: 2 };
  const target =
    paintedEffect &&
    ownerCameraTargetSchema.safeParse(paintedEffect.target).success
      ? paintedEffect.target
      : fallback;
  const crop =
    mode === "pan" && paintedEffect
      ? ownerCameraPanCrop(
          focus,
          target,
          ownerCameraCropAt(
            focus,
            (previewEffects ?? effects).filter(
              (item) => item.id !== paintedEffect.id,
            ),
            sourceStart,
            paintedEffect.occurrence,
            start,
            tracks,
          ),
        )
      : ownerCameraTargetCrop(focus, target);
  const x = (crop.x + crop.width / 2 - baseline.x) / baseline.width,
    y = (crop.y + crop.height / 2 - baseline.y) / baseline.height;
  const arrival = effect ? offset + effect.startFrame + effect.zoomFrames : 0;
  const sourceFrame = paintedEffect
    ? (paintedEffect.occurrence === "hook" ? (hook?.startFrame ?? 0) : 0) +
      start +
      (Number.isFinite(paintedEffect.zoomFrames)
        ? paintedEffect.zoomFrames
        : 1) -
      (paintedEffect.returnFrames === 0 ? 1 : 0)
    : 0;
  const targetFrame =
    sourceFrame +
    (paintedEffect?.occurrence === "hook" ? -(hook?.startFrame ?? 0) : prefix);
  const valid = !!effect && ownerCameraEffectSchema.safeParse(effect).success;
  const requestedX = effect
      ? (content.x + effect.target.centerX * content.width - baseline.x) /
        baseline.width
      : 0.5,
    requestedY = effect
      ? (content.y + effect.target.centerY * content.height - baseline.y) /
        baseline.height
      : 0.5;
  const media = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = media.current;
    if (
      video &&
      Number.isFinite(video.duration) &&
      Math.abs(video.currentTime - sourceFrame / OWNER_FPS) > 0.04
    )
      video.currentTime = Math.min(
        video.duration,
        Math.max(0, sourceFrame / OWNER_FPS),
      );
  }, [sourceFrame]);
  function update(change: Partial<OwnerCameraEffect>) {
    if (!effect) return;
    if (
      effect.returnFrames === 0 &&
      change.zoomFrames !== undefined &&
      Number.isInteger(change.zoomFrames) &&
      change.zoomFrames > 0
    )
      change = {
        ...change,
        holdFrames: Math.max(
          0,
          ownerCameraEffectEnd(paintedEffect ?? effect) -
            effect.startFrame -
            change.zoomFrames,
        ),
      };
    onChange(
      effects.map((item) =>
        item.id === effect.id ? { ...item, ...change } : item,
      ),
    );
    setMessage("");
  }
  async function captureStart() {
    const targetMedia = media.current;
    if (!effect || disabled || capturingStart || !targetMedia) return;
    setCapturingStart(true);
    try {
      const at = await capture();
      if (media.current !== targetMedia) return;
      if (at === null) {
        setMessage("Wait for the preview to finish seeking.");
        return;
      }
      const startFrame = at - offset;
      const next = effects.map((item) =>
        item.id === effect.id ? { ...item, startFrame } : item,
      );
      if (
        startFrame < 0 ||
        startFrame >= (effect.occurrence === "hook" ? prefix : focus.frames) ||
        !ownerCameraEffectsSchema.safeParse(next).success ||
        !ownerCameraEffectsFit(next, {
          frames: focus.frames,
          hook,
          cameraTracks: tracks,
        })
      ) {
        setMessage(
          "Choose a frame in this occurrence with room for the effect, without overlapping another Zoom or Motion.",
        );
        return;
      }
      update({ startFrame });
    } finally {
      if (media.current === targetMedia) setCapturingStart(false);
    }
  }
  function move(px: number, py: number) {
    if (!effect || disabled) return;
    update({
      target: {
        ...target,
        centerX: Math.max(
          0,
          Math.min(
            1,
            (baseline.x +
              Math.max(0, Math.min(1, px)) * baseline.width -
              content.x) /
              content.width,
          ),
        ),
        centerY: Math.max(
          0,
          Math.min(
            1,
            (baseline.y +
              Math.max(0, Math.min(1, py)) * baseline.height -
              content.y) /
              content.height,
          ),
        ),
      },
    });
  }
  async function add() {
    const at = await capture();
    if (at === null) {
      setMessage("Wait for the preview to finish seeking.");
      return;
    }
    const initial = defaultCameraZoom({
      focus,
      hook,
      frame: at,
      positionIndex,
    });
    if ("error" in initial) {
      setMessage(
        initial.error === "position"
          ? "Move the playhead inside the selected camera position."
          : `Choose an earlier start in this position for a gradual ${mode}.`,
      );
      return;
    }
    const next: OwnerCameraEffect = {
      id: crypto.randomUUID(),
      ...initial.effect,
    };
    if (mode === "pan") {
      const sourceAt =
        (next.occurrence === "hook" ? (hook?.startFrame ?? 0) : 0) +
        next.startFrame;
      const current = ownerCameraCropAt(
        focus,
        effects,
        sourceAt,
        next.occurrence,
        next.startFrame,
        tracks,
      );
      const unit = ownerCameraTargetCrop(focus, {
        centerX: 0.5,
        centerY: 0.5,
        zoom: 1,
      });
      next.kind = "pan";
      next.target = {
        centerX: Math.max(
          0,
          Math.min(
            1,
            (current.x + current.width / 2 - content.x) / content.width + 0.15,
          ),
        ),
        centerY: (current.y + current.height / 2 - content.y) / content.height,
        zoom: Math.max(1, Math.min(8, unit.width / current.width)),
      };
    }
    if (
      !ownerCameraEffectsSchema.safeParse([...effects, next]).success ||
      !ownerCameraEffectsFit([...effects, next], {
        frames: focus.frames,
        hook,
        cameraTracks: tracks,
      })
    ) {
      setMessage("Leave space between Zoom, Pan and face-tracking intervals.");
      return;
    }
    onChange([...effects, next]);
    setSelected(next.id);
    setMessage("");
  }
  return (
    <fieldset
      className="camera-motion-editor"
      disabled={disabled || capturingStart}
    >
      <legend className="local-sr-only">Manual {mode}</legend>
      {!available && (
        <p role="status">Set a camera position before adding a zoom.</p>
      )}
      <div className="collection-navigation zoom-effect-actions">
        <label>
          {label} effect
          <select
            className="select-control"
            aria-label={`${label} effect`}
            value={effect?.id ?? ""}
            onChange={(event) => {
              setSelected(event.currentTarget.value);
              setMessage("");
              const item = effects.find(
                (item) => item.id === event.currentTarget.value,
              );
              if (item && Number.isFinite(item.startFrame))
                seek(
                  (item.occurrence === "body" ? prefix : 0) + item.startFrame,
                );
            }}
          >
            <option value="" disabled>
              No {mode === "pan" ? "pans" : "zooms"}
            </option>
            {choices.map((item, index) => (
              <option key={item.id} value={item.id}>
                {index + 1} · {item.occurrence === "hook" ? "Hook" : "Body"} ·{" "}
                {seconds(
                  item.startFrame + (item.occurrence === "body" ? prefix : 0),
                )}
                s
              </option>
            ))}
          </select>
        </label>
        <Button
          variant="secondary"
          icon={Clock3}
          disabled={
            !available ||
            !captureReady ||
            effects.length >= OWNER_CAMERA_MOTION.effects
          }
          onClick={() => void add()}
        >
          Add at playhead
        </Button>
      </div>
      {effect && (
        <>
          <FocusPreviewSlot>
            <div
              className="focus-source zoom-target-preview"
              style={{
                aspectRatio: `${baseline.width}/${baseline.height}`,
                maxWidth: mode === "pan" ? undefined : 150,
              }}
            >
              <video
                ref={media}
                src={sourceUrl}
                muted
                playsInline
                preload="metadata"
                aria-hidden="true"
                onLoadedMetadata={() => {
                  if (media.current)
                    media.current.currentTime = Math.min(
                      media.current.duration,
                      Math.max(0, sourceFrame / OWNER_FPS),
                    );
                }}
                style={{
                  position: "absolute",
                  width: `${(1080 / baseline.width) * 100}%`,
                  height: `${(1920 / baseline.height) * 100}%`,
                  maxWidth: "none",
                  left: `${(-baseline.x / baseline.width) * 100}%`,
                  top: `${(-baseline.y / baseline.height) * 100}%`,
                }}
              />
              <CameraTargetSurface
                label={`${label} target`}
                disabled={disabled || capturingStart}
                x={x}
                y={y}
                crop={{
                  x: (crop.x - baseline.x) / baseline.width,
                  y: (crop.y - baseline.y) / baseline.height,
                  width: crop.width / baseline.width,
                  height: crop.height / baseline.height,
                }}
                onSelect={() =>
                  seek(
                    Math.max(
                      0,
                      Math.min(focus.frames + prefix - 1, targetFrame),
                    ),
                  )
                }
                onMove={move}
              />
            </div>
          </FocusPreviewSlot>
          <div className="editor-fields focus-fields">
            <div className="range-time">
              <label>
                Start (s)
                <input
                  aria-label={`${label} start seconds`}
                  type="number"
                  min={offset / OWNER_FPS}
                  step={1 / OWNER_FPS}
                  value={seconds(effect.startFrame + offset)}
                  onChange={(event) =>
                    update({
                      startFrame:
                        event.currentTarget.value === ""
                          ? NaN
                          : Math.round(
                              Number(event.currentTarget.value) * OWNER_FPS,
                            ) - offset,
                    })
                  }
                />
              </label>
              <Button
                variant="quiet"
                icon={Clock3}
                aria-label={`Capture ${mode} start`}
                title="Use current preview frame"
                disabled={disabled || capturingStart || !captureReady}
                onClick={() => void captureStart()}
              >
                Capture
              </Button>
            </div>
            <label>
              Reach target in (s)
              <input
                aria-label={`${label} duration seconds`}
                type="number"
                min={1 / OWNER_FPS}
                step={1 / OWNER_FPS}
                value={seconds(effect.zoomFrames)}
                onChange={(event) =>
                  update({
                    zoomFrames:
                      event.currentTarget.value === ""
                        ? NaN
                        : Math.round(
                            Number(event.currentTarget.value) * OWNER_FPS,
                          ),
                  })
                }
              />
            </label>
            {mode === "zoom" && (
              <label>
                Target zoom
                <input
                  aria-label="Zoom magnification"
                  type="number"
                  min={1}
                  max={8}
                  step={0.05}
                  value={
                    Number.isFinite(effect.target.zoom)
                      ? effect.target.zoom
                      : ""
                  }
                  onChange={(event) =>
                    update({
                      target: {
                        ...effect.target,
                        zoom:
                          event.currentTarget.value === ""
                            ? NaN
                            : Number(event.currentTarget.value),
                      },
                    })
                  }
                />
              </label>
            )}
            {(["x", "y"] as const).map((axis) => (
              <label key={axis}>
                Target {axis.toUpperCase()} (%)
                <input
                  aria-label={`${label} target ${axis}`}
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={
                    Number.isFinite(axis === "x" ? requestedX : requestedY)
                      ? Number(
                          (
                            (axis === "x" ? requestedX : requestedY) * 100
                          ).toFixed(1),
                        )
                      : ""
                  }
                  onChange={(event) => {
                    const point =
                      event.currentTarget.value === ""
                        ? NaN
                        : Number(event.currentTarget.value) / 100;
                    update({
                      target: {
                        ...effect.target,
                        [axis === "x" ? "centerX" : "centerY"]: Number.isNaN(
                          point,
                        )
                          ? NaN
                          : Math.max(
                              0,
                              Math.min(
                                1,
                                ((axis === "x" ? baseline.x : baseline.y) +
                                  point *
                                    (axis === "x"
                                      ? baseline.width
                                      : baseline.height) -
                                  (axis === "x" ? content.x : content.y)) /
                                  (axis === "x"
                                    ? content.width
                                    : content.height),
                              ),
                            ),
                      },
                    });
                  }}
                />
              </label>
            ))}
          </div>
          <p className="focus-context">
            <span>
              {effect.occurrence === "hook" ? "Hook" : "Body"} · Target at{" "}
              {Number.isFinite(arrival) ? `${seconds(arrival)}s` : "—"}
            </span>
          </p>
          <div className="collection-navigation">
            <Button
              variant="secondary"
              icon={Play}
              disabled={!captureReady || !valid}
              onClick={() => preview(offset + effect.startFrame)}
            >
              Preview {mode}
            </Button>
            <Button
              variant="quiet"
              icon={Trash2}
              onClick={() =>
                onChange(effects.filter((item) => item.id !== effect.id))
              }
            >
              Remove {mode}
            </Button>
          </div>
        </>
      )}
      <InlineFeedback message={message} />
    </fieldset>
  );
}
