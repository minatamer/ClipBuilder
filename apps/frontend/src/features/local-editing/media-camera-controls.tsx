/* eslint-disable @next/next/no-img-element -- Admitted local media uses the same source-space picker as Camera. */
import {
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { PlayerRef } from "@remotion/player";
import { Clock3, Play, Trash2 } from "lucide-react";
import { Button } from "../../shared/ui/button";
import { InlineFeedback } from "../../shared/ui/inline-feedback";
import { ControlPanel, ControlTabs } from "./control-tabs.tsx";
import { CameraTargetSurface } from "./camera-target-surface.tsx";
import { PictureTiming } from "./picture-timing.tsx";
import { MediaFaceTracking } from "./media-face-tracking.tsx";
import { useEditorPreview } from "./use-editor-preview.ts";
import { useInspectorPlayback } from "./use-inspector-playback.ts";
import { focusTimestamp } from "./focus-positions.ts";
import {
  EditorHookClock,
  EditorOccurrence,
  EditorPresentationClock,
  editorClockOffset,
} from "./editor-clock.ts";
import { OWNER_FPS } from "../../../../../packages/contracts/local/policy.ts";
import {
  OWNER_VISUAL_ANIMATIONS,
  type OwnerAsset,
  type OwnerVisualEdit,
} from "../../../../../packages/contracts/local/assets.ts";
import {
  ownerVideoFrameSampleTime,
  type OwnerVideoAsset,
} from "../../../../../packages/contracts/local/video-assets.ts";
import type { OwnerEditDocument } from "../../../../../packages/contracts/local/editor.ts";
import {
  removeVisualMotion,
  removeVisualZoom,
  setVisualZoom,
  visualCameraCrop,
  visualCameraPoint,
  visualCameraSourceFrame,
  visualHasMotion,
} from "./visual-camera-target.ts";

function MediaCameraSource({
  src,
  video,
  frame,
  playing,
  onReady,
  onFailed,
}: {
  src: string;
  video: boolean;
  frame: number;
  playing: boolean;
  onReady: (ready: boolean) => void;
  onFailed: (failed: boolean) => void;
}) {
  const media = useRef<HTMLVideoElement>(null);
  useInspectorPlayback(
    media,
    src,
    ownerVideoFrameSampleTime(frame) * OWNER_FPS,
    playing,
  );
  const settle = useCallback(() => {
    const node = media.current;
    if (!node || !Number.isFinite(node.duration)) return;
    onReady(node.readyState >= 2 && !node.seeking && !node.error);
  }, [onReady]);
  useEffect(() => {
    onReady(false);
    onFailed(false);
    const node = media.current;
    if (!node) return;
    node.src = src;
    node.load();
    return () => {
      node.pause();
      node.removeAttribute("src");
      node.load();
    };
  }, [src, onReady, onFailed]);
  useEffect(settle, [settle, src]);
  const style = {
    position: "absolute" as const,
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "fill" as const,
  };
  return video ? (
    <video
      ref={media}
      src={src}
      aria-label="Media camera source"
      muted
      playsInline
      preload="auto"
      style={style}
      onLoadedMetadata={settle}
      onLoadedData={settle}
      onSeeking={() => onReady(false)}
      onSeeked={settle}
      onError={() => {
        onReady(false);
        onFailed(true);
      }}
    />
  ) : (
    <img
      src={src}
      alt="Selected media source"
      style={style}
      onLoad={() => {
        onFailed(false);
        onReady(true);
      }}
      onError={() => {
        onReady(false);
        onFailed(true);
      }}
    />
  );
}

export function MediaCameraControls({
  navigationRequest,
  cue,
  previewCue,
  acceptedEdit,
  targetName,
  asset,
  workspaceId,
  frames,
  player,
  available,
  attempt,
  disabled,
  invalid,
  feedback,
  onChange,
  onInspect,
  actionTarget,
  onTrackingMode,
  onTrackingBusy,
}: {
  navigationRequest?:
    import("./editor-camera-request").EditorCameraRequest | undefined;
  cue: OwnerVisualEdit;
  previewCue?: OwnerVisualEdit | undefined;
  acceptedEdit: OwnerEditDocument;
  targetName: string;
  asset: OwnerAsset | OwnerVideoAsset | undefined;
  workspaceId: string;
  frames: number;
  player: RefObject<PlayerRef | null>;
  available: boolean;
  attempt: number;
  disabled: boolean;
  invalid: boolean;
  feedback?: { message: string; path: readonly PropertyKey[] } | undefined;
  onChange: (cue: OwnerVisualEdit) => void;
  onInspect: (endpoint: "start" | "end" | null) => void;
  actionTarget?: HTMLElement | null | undefined;
  onTrackingMode: (active: boolean) => void;
  onTrackingBusy: (active: boolean) => void;
}) {
  const id = useId();
  const [tab, setTab] = useState(
    navigationRequest?.targetId !== cue.id
      ? "zoom"
      : navigationRequest?.tab === "motion"
        ? "tracking"
        : (navigationRequest?.tab ?? "zoom"),
  );
  const [requestKey, setRequestKey] = useState(navigationRequest?.key);
  if (
    navigationRequest &&
    requestKey !== navigationRequest.key &&
    navigationRequest.targetId === cue.id
  ) {
    setRequestKey(navigationRequest.key);
    setTab(
      navigationRequest.tab === "motion" ? "tracking" : navigationRequest.tab,
    );
  }
  const [trackingTarget, setTrackingTarget] = useState<HTMLDivElement | null>(
    null,
  );
  const [endpoint, setEndpoint] = useState("start");
  const [ready, setReady] = useState(false);
  const [sourceFailed, setSourceFailed] = useState(false);
  const [adding, setAdding] = useState(false);
  const [motionEditing, setMotionEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [acknowledgedEdit, setAcknowledgedEdit] = useState(acceptedEdit);
  if (acknowledgedEdit !== acceptedEdit) {
    setAcknowledgedEdit(acceptedEdit);
    // Autosave acknowledgements must not turn an unfinished Pan into a Zoom.
    if (acknowledgedEdit.baseHash !== acceptedEdit.baseHash) {
      setMotionEditing(false);
      setMessage("");
    }
  }
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const preview = useEditorPreview({
    player,
    available: available && !disabled,
    attempt,
    frames,
    captureTarget: cue,
  });
  const effect = cue.effect;
  const painted = previewCue ?? cue;
  const paintedEffect = painted.effect;
  const hook = useContext(EditorHookClock),
    occurrence = useContext(EditorOccurrence),
    unified = useContext(EditorPresentationClock);
  const displayOffset = unified ? editorClockOffset(hook, occurrence) : 0;
  const duration =
    effect && Number.isFinite(effect.startFrame)
      ? effect.endFrame - effect.startFrame
      : effect && Number.isFinite(effect.endFrame) && paintedEffect
        ? paintedEffect.endFrame - paintedEffect.startFrame
        : NaN;
  function startZoom(at: number) {
    if (effect)
      change({
        ...cue,
        effect: {
          ...effect,
          startFrame: at,
          endFrame: Number.isFinite(at) ? at + duration : effect.endFrame,
        },
      });
  }
  async function captureZoomStart() {
    if (adding) return;
    setAdding(true);
    try {
      const at = await preview.captureFrame();
      if (!alive.current) return;
      if (
        at === null ||
        !Number.isInteger(duration) ||
        duration < 1 ||
        at < cue.startFrame ||
        at + duration > cue.endFrame
      ) {
        setMessage(
          "Choose a settled frame with room for this zoom inside the media interval.",
        );
        return;
      }
      startZoom(at);
    } finally {
      if (alive.current) setAdding(false);
    }
  }
  const zoomed = !!effect && effect.zoom !== 1;
  const moving = visualHasMotion(cue);
  const active =
    tab === "zoom"
      ? zoomed
      : tab === "pan"
        ? !!effect && (moving || motionEditing)
        : false;
  const focal = cue.focal ?? { x: 0.5, y: 0.5 };
  const point = effect
    ? tab === "pan" && endpoint === "start"
      ? { x: effect.fromX, y: effect.fromY }
      : { x: effect.toX, y: effect.toY }
    : focal;
  const paintedPoint = paintedEffect
    ? tab === "pan" && endpoint === "start"
      ? { x: paintedEffect.fromX, y: paintedEffect.fromY }
      : { x: paintedEffect.toX, y: paintedEffect.toY }
    : (painted.focal ?? { x: 0.5, y: 0.5 });
  const zoom =
    tab === "pan" && endpoint === "start" ? 1 : (paintedEffect?.zoom ?? 1);
  const crop = visualCameraCrop(
    painted,
    asset ?? { width: 1080, height: 1920 },
    paintedPoint,
    zoom,
  );
  const inputCrop = visualCameraCrop(
    cue,
    asset ?? { width: 1080, height: 1920 },
    point,
    tab === "pan" && endpoint === "start"
      ? 1
      : effect &&
          Number.isFinite(effect.zoom) &&
          effect.zoom >= 1 &&
          effect.zoom <= 3
        ? effect.zoom
        : zoom,
  );
  const center = {
    x: inputCrop.x + inputCrop.width / 2,
    y: inputCrop.y + inputCrop.height / 2,
  };
  const referenceFrame = Number.isFinite(preview.frame)
    ? Math.max(
        painted.startFrame,
        Math.min(painted.endFrame - 1, preview.frame),
      )
    : painted.startFrame;
  const effectError = feedback?.path.includes("effect");
  const timingError =
    effectError &&
    (feedback?.path.at(-1) === "effect" ||
      feedback?.path.includes("startFrame") ||
      feedback?.path.includes("endFrame"));
  const issueTab = feedback?.path.includes("tracking")
    ? "tracking"
    : effectError
      ? feedback?.path.includes("zoom") || !moving
        ? "zoom"
        : "pan"
      : "transitions";
  const localFeedback =
    feedback && ((effectError && tab !== "transitions") || issueTab === tab)
      ? feedback.message
      : undefined;
  const fieldsFeedback = timingError ? undefined : localFeedback;
  function change(
    next: OwnerVisualEdit,
    inspection: "start" | "end" | null = tab === "zoom"
      ? "end"
      : tab === "pan"
        ? endpoint === "start"
          ? "start"
          : "end"
        : null,
  ) {
    setMessage("");
    player.current?.pause();
    onChange(next);
    onInspect(inspection);
  }
  function selectEndpoint(next: string) {
    setEndpoint(next);
    onInspect(next === "start" ? "start" : "end");
    if (paintedEffect)
      preview.seekTo(
        Math.max(
          painted.startFrame,
          Math.min(
            painted.endFrame - 1,
            next === "start"
              ? paintedEffect.startFrame
              : paintedEffect.endFrame - 1,
          ),
        ),
      );
  }
  function move(x: number, y: number) {
    if (!effect || disabled || !active) return;
    const selected = visualCameraPoint(crop, { x, y });
    change({
      ...cue,
      effect:
        tab === "pan" && endpoint === "start"
          ? { ...effect, fromX: selected.x, fromY: selected.y }
          : {
              ...effect,
              toX: selected.x,
              toY: selected.y,
              ...(tab === "zoom" && !moving && !motionEditing
                ? { fromX: selected.x, fromY: selected.y }
                : {}),
            },
    });
  }
  async function add(kind: "zoom" | "pan") {
    if (adding || disabled || !asset) return;
    setAdding(true);
    try {
      let next = effect;
      if (!next) {
        const at = await preview.captureFrame();
        if (!alive.current) return;
        if (at === null || at < cue.startFrame || at >= cue.endFrame - 1) {
          setMessage(
            "Choose a settled frame inside this media interval with room for the effect.",
          );
          return;
        }
        next = {
          startFrame: at,
          endFrame: cue.endFrame,
          zoom: 1,
          fromX: focal.x,
          fromY: focal.y,
          toX: focal.x,
          toY: focal.y,
        };
      }
      if (kind === "pan") setMotionEditing(true);
      change({
        ...cue,
        effect:
          kind === "zoom"
            ? { ...next, zoom: 1.25 }
            : {
                ...next,
                toX: next.fromX > 0.8 ? next.fromX - 0.15 : next.fromX + 0.15,
              },
      });
    } finally {
      if (alive.current) setAdding(false);
    }
  }
  function play() {
    if (effect) {
      onInspect(null);
      preview.seekTo(cue.startFrame);
      void player.current?.play();
    }
  }
  function positionFields() {
    return (["x", "y"] as const).map((axis) => (
      <label key={axis}>
        Target {axis.toUpperCase()} (%)
        <input
          aria-label={`${tab === "zoom" ? "Zoom" : "Pan"} target ${axis}`}
          type="number"
          min={0}
          max={100}
          step={1}
          aria-invalid={!!fieldsFeedback || undefined}
          aria-describedby={fieldsFeedback ? `${id}-feedback` : undefined}
          value={
            Number.isFinite(center[axis])
              ? Number((center[axis] * 100).toFixed(2))
              : ""
          }
          onChange={(event) =>
            move(
              axis === "x"
                ? event.currentTarget.value === ""
                  ? NaN
                  : Number(event.currentTarget.value) / 100
                : center.x,
              axis === "y"
                ? event.currentTarget.value === ""
                  ? NaN
                  : Number(event.currentTarget.value) / 100
                : center.y,
            )
          }
        />
      </label>
    ));
  }
  return (
    <fieldset
      className="focus-editor media-camera-editor"
      disabled={disabled || adding}
    >
      <legend className="local-sr-only">Media camera</legend>
      <div className="focus-left-column">
        <div className="focus-preview-column">
          <div ref={setTrackingTarget} hidden={tab !== "tracking"} />
          {tab !== "tracking" &&
            (asset ? (
              <div
                className="focus-source media-camera-source"
                style={{
                  aspectRatio: `${asset.width}/${asset.height}`,
                  width: `min(100%, calc(var(--focus-preview-height, 40dvh) * ${asset.width / asset.height}))`,
                }}
              >
                <MediaCameraSource
                  src={`/api/local/workspace/${workspaceId}/${cue.video ? "video-assets" : "assets"}/${asset.id}`}
                  video={!!cue.video}
                  frame={visualCameraSourceFrame(painted, referenceFrame)}
                  playing={
                    preview.playing &&
                    preview.frame >= painted.startFrame &&
                    preview.frame < painted.endFrame
                  }
                  onReady={setReady}
                  onFailed={setSourceFailed}
                />
                {active && (
                  <CameraTargetSurface
                    label={
                      tab === "zoom" ? "Zoom target" : `Pan ${endpoint} target`
                    }
                    x={crop.x + crop.width / 2}
                    y={crop.y + crop.height / 2}
                    crop={crop}
                    disabled={disabled || adding || !ready || !available}
                    onSelect={() => preview.seekTo(referenceFrame)}
                    onMove={move}
                  />
                )}
              </div>
            ) : (
              <p className="focus-empty">Choose a media asset in Media.</p>
            ))}
          <InlineFeedback
            message={
              sourceFailed
                ? "Couldn’t load this media preview. Reopen the Camera target."
                : undefined
            }
          />
          <div className="focus-context">
            <strong>{targetName}</strong>
            <span aria-label="Media camera time">
              {focusTimestamp(referenceFrame + displayOffset)}
            </span>
          </div>
          {tab === "pan" && active && (
            <ControlTabs
              id={`${id}-framing`}
              label="Pan framing"
              value={endpoint}
              onChange={selectEndpoint}
              disabled={disabled || adding}
              items={[
                { value: "start", label: "Start frame" },
                { value: "end", label: "End frame" },
              ]}
            />
          )}
        </div>
      </div>
      <div
        className="focus-inspector"
        role="region"
        aria-label="Media camera settings"
        tabIndex={0}
      >
        <ControlTabs
          id={id}
          label="Focus controls"
          items={[
            {
              value: "zoom",
              label: "Zoom",
              issue:
                feedback && (issueTab === "zoom" || timingError)
                  ? feedback.message
                  : undefined,
            },
            {
              value: "pan",
              label: "Pan",
              issue:
                feedback && (issueTab === "pan" || timingError)
                  ? feedback.message
                  : undefined,
            },
            ...(cue.video
              ? [
                  {
                    value: "tracking",
                    label: "Face tracking",
                    issue:
                      issueTab === "tracking" ? feedback?.message : undefined,
                  },
                ]
              : []),
            {
              value: "transitions",
              label: "Transitions",
              issue:
                feedback && issueTab === "transitions"
                  ? feedback.message
                  : undefined,
            },
          ]}
          value={tab}
          onChange={(next) => {
            setTab(next);
            setMessage("");
            if (next === "pan") {
              if (moving) setMotionEditing(true);
              selectEndpoint("start");
            } else if (next === "zoom") {
              preview.seekTo(painted.startFrame);
              onInspect("end");
            } else onInspect(null);
          }}
          disabled={disabled || adding}
        />
        <ControlPanel id={id} value="tracking" active={tab}>
          {tab === "tracking" && cue.video && asset && "frames" in asset && (
            <MediaFaceTracking
              cue={cue}
              asset={asset}
              sourceUrl={`/api/local/workspace/${workspaceId}/video-assets/${asset.id}`}
              player={player}
              available={available}
              attempt={attempt}
              disabled={disabled}
              frames={frames}
              previewTarget={trackingTarget}
              actionTarget={actionTarget}
              onChange={onChange}
              onMode={onTrackingMode}
              onBusy={onTrackingBusy}
              feedback={issueTab === "tracking" ? feedback?.message : undefined}
            />
          )}
        </ControlPanel>
        {(["zoom", "pan"] as const).map((kind) => (
          <ControlPanel key={kind} id={id} value={kind} active={tab}>
            {tab === kind && (
              <fieldset
                className="camera-motion-editor"
                disabled={disabled || adding}
              >
                <legend className="local-sr-only">
                  {kind === "zoom" ? "Manual zoom" : "Manual pan"}
                </legend>
                <div className="collection-navigation zoom-effect-actions">
                  <label>
                    {kind === "zoom" ? "Zoom effect" : "Pan effect"}
                    <select
                      className="select-control"
                      aria-label={
                        kind === "zoom" ? "Zoom effect" : "Pan effect"
                      }
                      value={active ? cue.id : ""}
                      onChange={() =>
                        effect && preview.seekTo(effect.startFrame)
                      }
                    >
                      <option value="" disabled>
                        {kind === "zoom" ? "No zooms" : "No pans"}
                      </option>
                      {active && (
                        <option value={cue.id}>
                          1 · {kind === "zoom" ? "Zoom" : "Pan"}
                        </option>
                      )}
                    </select>
                  </label>
                  <Button
                    variant="secondary"
                    icon={Clock3}
                    disabled={active || !asset || !preview.captureReady}
                    onClick={() => void add(kind)}
                  >
                    {effect
                      ? kind === "zoom"
                        ? "Add zoom"
                        : "Add pan"
                      : "Add at playhead"}
                  </Button>
                </div>
                {active && effect && (
                  <>
                    {kind === "pan" && (
                      <PictureTiming
                        className="focus-fields"
                        label="Pan"
                        cue={effect}
                        frames={frames}
                        player={player}
                        available={available && !disabled && tab === kind}
                        attempt={attempt}
                        validationMessage={
                          timingError ? localFeedback : undefined
                        }
                        onChange={(next) => change({ ...cue, effect: next })}
                      />
                    )}
                    <div className="editor-fields focus-fields">
                      {kind === "zoom" && (
                        <>
                          <div className="range-time">
                            <label>
                              Start (s)
                              <input
                                aria-label="Zoom start seconds"
                                type="number"
                                min={
                                  (cue.startFrame + displayOffset) / OWNER_FPS
                                }
                                max={
                                  (cue.endFrame - 1 + displayOffset) / OWNER_FPS
                                }
                                step={1 / OWNER_FPS}
                                value={
                                  Number.isFinite(effect.startFrame)
                                    ? Number(
                                        (
                                          (effect.startFrame + displayOffset) /
                                          OWNER_FPS
                                        ).toFixed(3),
                                      )
                                    : ""
                                }
                                aria-invalid={
                                  (!!localFeedback && !!timingError) ||
                                  undefined
                                }
                                aria-describedby={
                                  localFeedback && timingError
                                    ? `${id}-feedback`
                                    : undefined
                                }
                                onChange={(event) =>
                                  startZoom(
                                    event.currentTarget.value === ""
                                      ? NaN
                                      : Math.round(
                                          Number(event.currentTarget.value) *
                                            OWNER_FPS,
                                        ) - displayOffset,
                                  )
                                }
                              />
                            </label>
                            <Button
                              variant="quiet"
                              icon={Clock3}
                              aria-label="Capture zoom start"
                              title="Use current preview frame"
                              disabled={!preview.captureReady}
                              onClick={() => void captureZoomStart()}
                            >
                              Capture
                            </Button>
                          </div>
                          <label>
                            Reach target in (s)
                            <input
                              aria-label="Zoom duration seconds"
                              type="number"
                              min={1 / OWNER_FPS}
                              max={
                                (cue.endFrame - effect.startFrame) / OWNER_FPS
                              }
                              step={1 / OWNER_FPS}
                              disabled={!Number.isFinite(effect.startFrame)}
                              value={
                                Number.isFinite(duration)
                                  ? Number((duration / OWNER_FPS).toFixed(3))
                                  : ""
                              }
                              aria-invalid={
                                (!!localFeedback && !!timingError) || undefined
                              }
                              aria-describedby={
                                localFeedback && timingError
                                  ? `${id}-feedback`
                                  : undefined
                              }
                              onChange={(event) =>
                                change({
                                  ...cue,
                                  effect: {
                                    ...effect,
                                    endFrame:
                                      event.currentTarget.value === ""
                                        ? NaN
                                        : effect.startFrame +
                                          Math.round(
                                            Number(event.currentTarget.value) *
                                              OWNER_FPS,
                                          ),
                                  },
                                })
                              }
                            />
                          </label>
                        </>
                      )}
                      {kind === "zoom" && (
                        <label>
                          Target zoom
                          <input
                            aria-label="Zoom magnification"
                            type="number"
                            min={1}
                            max={3}
                            step={0.05}
                            value={
                              Number.isFinite(effect.zoom) ? effect.zoom : ""
                            }
                            aria-invalid={!!fieldsFeedback || undefined}
                            aria-describedby={
                              fieldsFeedback ? `${id}-feedback` : undefined
                            }
                            onChange={(event) =>
                              change(
                                setVisualZoom(
                                  cue,
                                  asset ?? { width: 1080, height: 1920 },
                                  event.currentTarget.value === ""
                                    ? NaN
                                    : Number(event.currentTarget.value),
                                  paintedEffect?.zoom,
                                  moving || motionEditing,
                                ),
                              )
                            }
                          />
                        </label>
                      )}
                      {positionFields()}
                    </div>
                    <div className="collection-navigation">
                      <Button
                        variant="secondary"
                        icon={Play}
                        disabled={invalid || !preview.captureReady}
                        onClick={play}
                      >
                        {kind === "zoom" ? "Preview zoom" : "Preview pan"}
                      </Button>
                      <Button
                        variant="quiet"
                        icon={Trash2}
                        onClick={() => {
                          const next =
                            kind === "zoom"
                              ? removeVisualZoom(cue)
                              : removeVisualMotion(cue);
                          if (kind === "pan" || !next.effect)
                            setMotionEditing(false);
                          change(next, null);
                        }}
                      >
                        {kind === "zoom" ? "Remove zoom" : "Remove pan"}
                      </Button>
                    </div>
                  </>
                )}
              </fieldset>
            )}
          </ControlPanel>
        ))}
        <ControlPanel id={id} value="transitions" active={tab}>
          {tab === "transitions" && (
            <div className="editor-fields focus-fields">
              {(["entrance", "exit"] as const).map((key) => (
                <label key={key}>
                  {key === "entrance" ? "Entrance" : "Exit"}
                  <select
                    className="select-control"
                    value={cue[key] ?? "none"}
                    onChange={(event) =>
                      change({
                        ...cue,
                        [key]: event.currentTarget.value as NonNullable<
                          OwnerVisualEdit[typeof key]
                        >,
                      })
                    }
                  >
                    {OWNER_VISUAL_ANIMATIONS.map((animation) => (
                      <option key={animation} value={animation}>
                        {
                          {
                            none: "None",
                            fade: "Fade",
                            pop: "Pop",
                            slide: "Slide",
                          }[animation]
                        }
                      </option>
                    ))}
                  </select>
                </label>
              ))}
              <label>
                Duration (s)
                <input
                  aria-label="Transition duration seconds"
                  type="number"
                  min={1 / OWNER_FPS}
                  max={1}
                  step={1 / OWNER_FPS}
                  value={
                    Number.isFinite(cue.animationFrames ?? 9)
                      ? Number(
                          ((cue.animationFrames ?? 9) / OWNER_FPS).toFixed(3),
                        )
                      : ""
                  }
                  aria-invalid={!!localFeedback || undefined}
                  aria-describedby={
                    localFeedback ? `${id}-feedback` : undefined
                  }
                  onChange={(event) =>
                    change({
                      ...cue,
                      animationFrames:
                        event.currentTarget.value === ""
                          ? NaN
                          : Math.round(
                              Number(event.currentTarget.value) * OWNER_FPS,
                            ),
                    })
                  }
                />
              </label>
            </div>
          )}
        </ControlPanel>
        <InlineFeedback
          id={`${id}-feedback`}
          message={
            message ||
            (timingError && tab === "pan" ? undefined : localFeedback)
          }
        />
      </div>
    </fieldset>
  );
}
