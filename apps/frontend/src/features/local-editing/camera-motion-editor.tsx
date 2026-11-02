import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Clock3, Play, Trash2 } from "lucide-react";
import { Button } from "../../shared/ui/button";
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
  type OwnerCameraEffect,
} from "../../../../../packages/contracts/local/camera-motion.ts";

const seconds = (frames: number) =>
  Number.isFinite(frames) ? Number((frames / OWNER_FPS).toFixed(3)) : "";
export function CameraMotionEditor({
  focus,
  effects,
  hook,
  sourceUrl,
  onChange,
  captureReady,
  capture,
  seek,
  preview,
  available,
  disabled,
}: {
  focus: OwnerFocus;
  effects: OwnerCameraEffect[];
  hook: OwnerHook | undefined;
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
    [message, setMessage] = useState("");
  const effect = effects.find((item) => item.id === selected) ?? effects[0];
  const prefix = ownerHookFrames({ hook }),
    offset = effect?.occurrence === "body" ? prefix : 0;
  const start =
    effect && Number.isFinite(effect.startFrame) ? effect.startFrame : 0;
  const sourceStart = effect
    ? (effect.occurrence === "hook" ? (hook?.startFrame ?? 0) : 0) + start
    : 0;
  const baseline = ownerFocusCrop(focus, ownerFocusAt(focus, sourceStart));
  const content = ownerSourceContent(focus.source);
  const fallback = { centerX: 0.5, centerY: 0.5, zoom: 2 };
  const target =
    effect && ownerCameraTargetSchema.safeParse(effect.target).success
      ? effect.target
      : fallback;
  const crop = ownerCameraTargetCrop(focus, target);
  const x = (crop.x + crop.width / 2 - baseline.x) / baseline.width,
    y = (crop.y + crop.height / 2 - baseline.y) / baseline.height;
  const arrival = effect
    ? offset +
      start +
      (Number.isFinite(effect.zoomFrames) ? effect.zoomFrames : 1)
    : 0;
  const sourceFrame = effect
    ? (effect.occurrence === "hook" ? (hook?.startFrame ?? 0) : 0) +
      start +
      (Number.isFinite(effect.zoomFrames) ? effect.zoomFrames : 1)
    : 0;
  const valid = !!effect && ownerCameraEffectSchema.safeParse(effect).success;
  const requestedX = effect
      ? (content.x + effect.target.centerX * content.width - baseline.x) /
        baseline.width
      : 0.5,
    requestedY = effect
      ? (content.y + effect.target.centerY * content.height - baseline.y) /
        baseline.height
      : 0.5;
  const media = useRef<HTMLVideoElement>(null),
    surface = useRef<HTMLButtonElement>(null),
    pointer = useRef<number | null>(null);
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
    onChange(
      effects.map((item) =>
        item.id === effect.id ? { ...item, ...change } : item,
      ),
    );
    setMessage("");
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
  function point(event: PointerEvent<HTMLButtonElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    move(
      (event.clientX - bounds.left) / bounds.width,
      (event.clientY - bounds.top) / bounds.height,
    );
  }
  async function add() {
    const at = await capture();
    if (at === null) {
      setMessage("Wait for the preview to finish seeking.");
      return;
    }
    const occurrence = hook && at < prefix ? "hook" : "body",
      local = occurrence === "hook" ? at : at - prefix;
    const length = occurrence === "hook" ? prefix : focus.frames;
    const room =
      length -
      local -
      OWNER_CAMERA_MOTION.holdFrames -
      OWNER_CAMERA_MOTION.returnFrames -
      OWNER_CAMERA_MOTION.settleFrames;
    if (room < 1) {
      setMessage(
        "Choose an earlier start to leave room for the zoom and return.",
      );
      return;
    }
    const initial = ownerFocusAt(
      focus,
      occurrence === "hook" ? hook!.startFrame + local : local,
    );
    const next: OwnerCameraEffect = {
      id: crypto.randomUUID(),
      occurrence,
      startFrame: local,
      zoomFrames: Math.min(OWNER_CAMERA_MOTION.defaultZoomFrames, room),
      holdFrames: OWNER_CAMERA_MOTION.holdFrames,
      returnFrames: OWNER_CAMERA_MOTION.returnFrames,
      target: {
        centerX: initial.centerX,
        centerY: initial.centerY,
        zoom: Math.min(8, initial.zoom * 1.8),
      },
    };
    if (!ownerCameraEffectsSchema.safeParse([...effects, next]).success) {
      setMessage("Leave space between zoom effects.");
      return;
    }
    onChange([...effects, next]);
    setSelected(next.id);
    setMessage("");
  }
  return (
    <fieldset className="camera-motion-editor" disabled={disabled}>
      <legend className="local-sr-only">Manual zoom</legend>
      {!available && (
        <p role="status">Set a camera position before adding a zoom.</p>
      )}
      <div className="collection-navigation">
        <label>
          Zoom effect
          <select
            className="select-control"
            aria-label="Zoom effect"
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
              No zooms
            </option>
            {effects.map((item, index) => (
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
          <div
            className="focus-source zoom-target-preview"
            style={{ aspectRatio: "9/16", maxWidth: 150 }}
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
            <button
              ref={surface}
              type="button"
              className="zoom-target-surface"
              aria-label="Zoom target"
              disabled={disabled}
              onPointerDown={(event) => {
                if (event.button !== 0) return;
                event.preventDefault();
                event.currentTarget.focus();
                event.currentTarget.setPointerCapture(event.pointerId);
                pointer.current = event.pointerId;
                seek(Math.max(0, Math.min(focus.frames + prefix - 1, arrival)));
                point(event);
              }}
              onPointerMove={(event) => {
                if (pointer.current === event.pointerId) point(event);
              }}
              onPointerUp={() => {
                pointer.current = null;
              }}
              onPointerCancel={() => {
                pointer.current = null;
              }}
              onLostPointerCapture={() => {
                pointer.current = null;
              }}
              onKeyDown={(event) => {
                const step = event.shiftKey ? 0.05 : 0.01,
                  dx =
                    event.key === "ArrowRight"
                      ? step
                      : event.key === "ArrowLeft"
                        ? -step
                        : 0,
                  dy =
                    event.key === "ArrowDown"
                      ? step
                      : event.key === "ArrowUp"
                        ? -step
                        : 0;
                if (dx || dy) {
                  event.preventDefault();
                  seek(
                    Math.max(0, Math.min(focus.frames + prefix - 1, arrival)),
                  );
                  move(x + dx, y + dy);
                }
              }}
            >
              <span
                className="focus-crop"
                style={{
                  left: `${((crop.x - baseline.x) / baseline.width) * 100}%`,
                  top: `${((crop.y - baseline.y) / baseline.height) * 100}%`,
                  width: `${(crop.width / baseline.width) * 100}%`,
                  height: `${(crop.height / baseline.height) * 100}%`,
                }}
              />
              <span
                className="zoom-target-marker"
                style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
              >
                +
              </span>
            </button>
          </div>
          <div className="editor-fields focus-fields">
            <label>
              Start (s)
              <input
                aria-label="Zoom start seconds"
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
            <label>
              Reach target in (s)
              <input
                aria-label="Zoom duration seconds"
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
            <label>
              Target zoom
              <input
                aria-label="Zoom magnification"
                type="number"
                min={1}
                max={8}
                step={0.05}
                value={
                  Number.isFinite(effect.target.zoom) ? effect.target.zoom : ""
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
            {(["x", "y"] as const).map((axis) => (
              <label key={axis}>
                Target {axis.toUpperCase()} (%)
                <input
                  aria-label={`Zoom target ${axis}`}
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
              {seconds(arrival)}s · Back at{" "}
              {seconds(offset + ownerCameraEffectEnd(effect))}s
            </span>
          </p>
          <div className="collection-navigation">
            <Button
              variant="secondary"
              icon={Play}
              disabled={!captureReady || !valid}
              onClick={() => preview(offset + effect.startFrame)}
            >
              Preview zoom
            </Button>
            <Button
              variant="quiet"
              icon={Trash2}
              onClick={() =>
                onChange(effects.filter((item) => item.id !== effect.id))
              }
            >
              Remove zoom
            </Button>
          </div>
        </>
      )}
      {message && (
        <p role="alert" className="local-error">
          {message}
        </p>
      )}
    </fieldset>
  );
}
