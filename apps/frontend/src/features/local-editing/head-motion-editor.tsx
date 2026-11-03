import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Clock3, Play, Trash2 } from "lucide-react";
import { Button } from "../../shared/ui/button";
import { Progress } from "../../shared/ui/progress";
import { WorkflowActions } from "./workflow-actions";
import { OWNER_FPS } from "../../../../../packages/contracts/local/policy.ts";
import {
  ownerHookFrames,
  type OwnerHook,
} from "../../../../../packages/contracts/local/hook.ts";
import {
  ownerFocusAt,
  ownerSourceContent,
  type OwnerFocus,
} from "../../../../../packages/contracts/local/focus.ts";
import {
  ownerCameraEffectsFit,
  ownerCameraEffectEnd,
  type OwnerCameraEffect,
} from "../../../../../packages/contracts/local/camera-motion.ts";
import {
  OWNER_CAMERA_FOLLOW,
  ownerCameraFollowKey,
  ownerCameraTrackSchema,
  ownerCameraTracksSchema,
  ownerCameraTracksFit,
  ownerHeadBoxSchema,
  ownerCameraWithoutTrack,
  type OwnerCameraTrack,
} from "../../../../../packages/contracts/local/camera-follow.ts";
import { trackHeadVideo } from "./track-head-video";
import { BulkHeadMotionEditor } from "./bulk-head-motion-editor";
import type { HeadBox } from "./head-pixel-tracker";

type Draft = Pick<
  OwnerCameraTrack,
  | "id"
  | "occurrence"
  | "personId"
  | "startFrame"
  | "endFrame"
  | "sourceStartFrame"
  | "seed"
> & { marked: boolean };
const name = (id: string | null) => (id ? `Person ${id.slice(-1)}` : "Camera");
const clampBox = (box: HeadBox): HeadBox => {
  const width = Math.max(0.02, Math.min(0.7, box.width)),
    height = Math.max(0.02, Math.min(0.7, box.height));
  return {
    x: Math.max(0, Math.min(1 - width, box.x)),
    y: Math.max(0, Math.min(1 - height, box.y)),
    width,
    height,
  };
};
export function HeadMotionEditor({
  focus,
  tracks,
  effects,
  hook,
  sourceUrl,
  personId,
  onPersonChange,
  pause,
  capture,
  captureReady,
  seek,
  preview,
  onChange,
  onMode,
  onBusy,
  footerTarget,
  disabled,
  available,
}: {
  focus: OwnerFocus;
  tracks: OwnerCameraTrack[];
  effects: OwnerCameraEffect[];
  hook: OwnerHook | undefined;
  sourceUrl: string;
  personId: string | null;
  onPersonChange: (id: string | null) => void;
  pause: () => void;
  capture: () => Promise<number | null>;
  captureReady: boolean;
  seek: (frame: number) => void;
  preview: (frame: number) => void;
  onChange: (tracks: OwnerCameraTrack[]) => void;
  onMode: (active: boolean) => void;
  onBusy: (active: boolean) => void;
  footerTarget?: HTMLElement | null | undefined;
  disabled: boolean;
  available: boolean;
}) {
  const [draft, setDraft] = useState<Draft | null>(null),
    [bulk, setBulk] = useState(false),
    [capturingEnd, setCapturingEnd] = useState(false),
    [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState(0);
  const person = draft ? draft.personId : personId;
  const request = useRef<AbortController | null>(null),
    alive = useRef(false),
    video = useRef<HTMLVideoElement>(null);
  const gesture = useRef<{ pointer: number; x: number; y: number } | null>(
    null,
  );
  const prefix = ownerHookFrames({ hook }),
    content = ownerSourceContent(focus.source);
  const chosen = tracks.find((t) => t.id === selected) ?? tracks[0];
  const selecting = draft !== null || bulk;
  const seedFrame = draft?.sourceStartFrame;
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      request.current?.abort();
    };
  }, []);
  useEffect(() => {
    onMode(selecting);
    return () => onMode(false);
  }, [selecting, onMode]);
  useEffect(() => {
    onBusy(busy);
    return () => onBusy(false);
  }, [busy, onBusy]);
  useEffect(() => {
    const media = video.current;
    if (media && seedFrame !== undefined && media.readyState >= 1)
      media.currentTime = (seedFrame + 0.25) / OWNER_FPS;
  }, [seedFrame]);
  const offset = draft?.occurrence === "body" ? prefix : 0;
  function updateSeed(seed: HeadBox) {
    if (draft) setDraft({ ...draft, seed: clampBox(seed), marked: true });
  }
  async function add() {
    const at = await capture();
    if (at === null) {
      setMessage("Wait for the preview to finish seeking.");
      return;
    }
    const occurrence = hook && at < prefix ? "hook" : "body",
      startFrame = occurrence === "hook" ? at : at - prefix;
    const sourceStartFrame =
      startFrame + (occurrence === "hook" ? hook!.startFrame : 0);
    const shot = ownerFocusAt(focus, sourceStartFrame);
    if (shot.personId !== person) {
      setMessage("Move the playhead to this person's camera first.");
      return;
    }
    const endFrame = Math.min(
      shot.endFrame - (occurrence === "hook" ? hook!.startFrame : 0),
      startFrame + OWNER_CAMERA_FOLLOW.frames,
      occurrence === "hook" ? prefix : focus.frames,
    );
    if (endFrame - startFrame < 6) {
      setMessage("Choose an earlier start for Motion.");
      return;
    }
    setDraft({
      id: crypto.randomUUID(),
      occurrence,
      personId: person,
      startFrame,
      endFrame,
      sourceStartFrame,
      seed: clampBox({
        x: shot.centerX - 0.06,
        y: 0.1,
        width: 0.12,
        height: 0.25,
      }),
      marked: false,
    });
    setMessage("");
  }
  function pointer(event: PointerEvent<HTMLButtonElement>) {
    const r = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (event.clientX - r.left) / r.width)),
      y: Math.max(0, Math.min(1, (event.clientY - r.top) / r.height)),
    };
  }
  async function captureEnd() {
    if (!draft || busy || disabled || capturingEnd) return;
    setCapturingEnd(true);
    try {
      const at = await capture();
      if (!alive.current) return;
      if (at === null) {
        setMessage("Wait for the preview to finish seeking.");
        return;
      }
      const endFrame = at - offset + 1;
      const duration = endFrame - draft.startFrame;
      const rest = ownerCameraWithoutTrack(tracks, draft.id);
      if (
        duration < 6 ||
        duration > OWNER_CAMERA_FOLLOW.frames ||
        endFrame > (draft.occurrence === "hook" ? prefix : focus.frames) ||
        rest.some(
          (path) =>
            path.occurrence === draft.occurrence &&
            path.startFrame < endFrame &&
            draft.startFrame < path.endFrame,
        ) ||
        effects.some(
          (effect) =>
            effect.occurrence === draft.occurrence &&
            effect.startFrame < endFrame &&
            draft.startFrame < ownerCameraEffectEnd(effect),
        )
      ) {
        setMessage(
          "Choose a frame in this occurrence with 0.2–30 seconds of Motion and no overlap with Zoom or another Motion interval.",
        );
        return;
      }
      setDraft((current) =>
        current === draft ? { ...current, endFrame } : current,
      );
      setMessage("");
    } finally {
      if (alive.current) setCapturingEnd(false);
    }
  }
  async function track() {
    if (!draft || request.current || disabled || !draft.marked) return;
    const clock = { frames: focus.frames, hook };
    const duration = draft.endFrame - draft.startFrame;
    if (
      !Number.isInteger(duration) ||
      duration < 6 ||
      duration > OWNER_CAMERA_FOLLOW.frames
    ) {
      setMessage("Choose a Motion interval from 0.2 to 30 seconds.");
      return;
    }
    const shell = {
      ...draft,
      focusKey: ownerCameraFollowKey(focus, draft.personId),
      outcome: "complete" as const,
      points: Array.from(
        {
          length:
            Math.ceil((duration - 1) / OWNER_CAMERA_FOLLOW.sampleFrames) + 1,
        },
        (_, i) => ({
          frame: Math.min(i * OWNER_CAMERA_FOLLOW.sampleFrames, duration - 1),
          x: Number((draft.seed.x + draft.seed.width / 2).toFixed(6)),
          y: Number((draft.seed.y + draft.seed.height / 2).toFixed(6)),
        }),
      ),
    };
    const validated = ownerCameraTrackSchema.safeParse(
      Object.fromEntries(
        Object.entries(shell).filter(([key]) => key !== "marked"),
      ),
    );
    const rest = ownerCameraWithoutTrack(tracks, draft.id);
    if (
      !validated.success ||
      !ownerCameraTracksSchema.safeParse([...rest, validated.data]).success ||
      !ownerCameraTracksFit([validated.data], focus, clock) ||
      !ownerCameraEffectsFit(effects, {
        ...clock,
        cameraTracks: [...rest, validated.data],
      })
    ) {
      setMessage(
        "Keep Motion inside this occurrence, up to 30 seconds, without overlapping Motion or Zoom.",
      );
      return;
    }
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setProgress(0);
    setMessage("");
    try {
      const result = await trackHeadVideo({
        sourceUrl,
        source: focus.source,
        seed: draft.seed,
        startFrame: draft.sourceStartFrame,
        frames: duration,
        signal: controller.signal,
        progress: (done, total) => {
          if (alive.current) setProgress(done / total);
        },
      });
      controller.signal.throwIfAborted();
      const last = result.points.at(-1)?.frame ?? 0;
      if (last < 5) throw Error("head_not_clear");
      const next = ownerCameraTrackSchema.parse({
        ...validated.data,
        points: result.points,
        endFrame: draft.startFrame + last + 1,
        outcome: result.outcome,
      });
      if (alive.current) {
        onChange([...rest, next]);
        setSelected(next.id);
        setDraft(null);
        setMessage("");
      }
    } catch (error) {
      if (alive.current && !controller.signal.aborted)
        setMessage(
          error instanceof Error && error.message === "head_not_clear"
            ? "Choose a clear, detailed head region, then track again."
            : "Couldn’t track this interval. Check the head and range, then try again.",
        );
    } finally {
      if (request.current === controller) request.current = null;
      if (alive.current) setBusy(false);
    }
  }
  return (
    <div className="head-motion-editor">
      {!bulk && (
        <div className="collection-navigation">
          <label>
            Follow
            <select
              aria-label="Motion person"
              value={person ?? "camera"}
              disabled={disabled || !!draft}
              onChange={(e) => {
                const next =
                  e.currentTarget.value === "camera"
                    ? null
                    : e.currentTarget.value;
                onPersonChange(next);
              }}
            >
              {[...new Set(focus.shots.map((s) => s.personId))].map((id) => (
                <option key={id ?? "camera"} value={id ?? "camera"}>
                  {name(id)}
                </option>
              ))}
            </select>
          </label>
          <Button
            variant="secondary"
            icon={Clock3}
            disabled={
              disabled ||
              !available ||
              !captureReady ||
              !!draft ||
              tracks.length >= OWNER_CAMERA_FOLLOW.tracks
            }
            onClick={() => void add()}
          >
            Add at playhead
          </Button>
          <Button
            variant="secondary"
            disabled={disabled || !available || !captureReady || !!draft}
            onClick={() => {
              pause();
              setMessage("");
              setBulk(true);
            }}
          >
            Add to all speakers
          </Button>
        </div>
      )}
      {!available && (
        <p role="status">Set a camera position before adding Motion.</p>
      )}
      {message && <p role="status">{message}</p>}
      {bulk ? (
        <BulkHeadMotionEditor
          focus={focus}
          tracks={tracks}
          effects={effects}
          hook={hook}
          sourceUrl={sourceUrl}
          disabled={disabled}
          footerTarget={footerTarget}
          pause={pause}
          seek={seek}
          onChange={(next) => {
            onChange(next);
            const added = next.find(
              (path) => !tracks.some((old) => old.id === path.id),
            );
            if (added) setSelected(added.id);
          }}
          onBusy={onBusy}
          onClose={() => setBulk(false)}
          onResult={setMessage}
        />
      ) : draft ? (
        <>
          <p>{name(draft.personId)} · Drag around the head to follow.</p>
          <div
            className="focus-source head-motion-source"
            style={{ aspectRatio: `${content.width}/${content.height}` }}
          >
            <video
              ref={video}
              src={sourceUrl}
              muted
              playsInline
              preload="metadata"
              aria-hidden="true"
              onLoadedMetadata={() => {
                if (video.current)
                  video.current.currentTime =
                    (draft.sourceStartFrame + 0.25) / OWNER_FPS;
              }}
              style={{
                position: "absolute",
                width: `${(1080 / content.width) * 100}%`,
                height: `${(1920 / content.height) * 100}%`,
                maxWidth: "none",
                left: `${(-content.x / content.width) * 100}%`,
                top: `${(-content.y / content.height) * 100}%`,
              }}
            />
            <button
              type="button"
              className="head-seed-surface"
              aria-label="Head to follow"
              disabled={disabled || busy}
              onPointerDown={(e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                e.currentTarget.focus();
                e.currentTarget.setPointerCapture(e.pointerId);
                const p = pointer(e);
                gesture.current = { pointer: e.pointerId, ...p };
                updateSeed({
                  ...draft.seed,
                  x: p.x - draft.seed.width / 2,
                  y: p.y - draft.seed.height / 2,
                });
              }}
              onPointerMove={(e) => {
                const g = gesture.current;
                if (!g || g.pointer !== e.pointerId) return;
                const p = pointer(e);
                updateSeed({
                  x: Math.min(p.x, g.x),
                  y: Math.min(p.y, g.y),
                  width: Math.abs(p.x - g.x),
                  height: Math.abs(p.y - g.y),
                });
              }}
              onPointerUp={() => {
                gesture.current = null;
              }}
              onPointerCancel={() => {
                gesture.current = null;
              }}
              onLostPointerCapture={() => {
                gesture.current = null;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setDraft({ ...draft, marked: true });
                  return;
                }
                const dx =
                    e.key === "ArrowRight"
                      ? 0.01
                      : e.key === "ArrowLeft"
                        ? -0.01
                        : 0,
                  dy =
                    e.key === "ArrowDown"
                      ? 0.01
                      : e.key === "ArrowUp"
                        ? -0.01
                        : 0;
                if (!dx && !dy) return;
                e.preventDefault();
                updateSeed(
                  e.shiftKey
                    ? {
                        ...draft.seed,
                        width: draft.seed.width + dx,
                        height: draft.seed.height + dy,
                      }
                    : {
                        ...draft.seed,
                        x: draft.seed.x + dx,
                        y: draft.seed.y + dy,
                      },
                );
              }}
            >
              <span
                style={{
                  left: `${draft.seed.x * 100}%`,
                  top: `${draft.seed.y * 100}%`,
                  width: `${draft.seed.width * 100}%`,
                  height: `${draft.seed.height * 100}%`,
                }}
              />
            </button>
          </div>
          <div className="editor-fields">
            <p>
              Start: {((offset + draft.startFrame) / OWNER_FPS).toFixed(2)}s ·{" "}
              {draft.occurrence === "hook" ? "Hook" : "Clip"}
            </p>
            <div className="range-time">
              <label>
                End (seconds)
                <input
                  type="number"
                  aria-label="Motion end seconds"
                  min={(offset + draft.startFrame + 6) / OWNER_FPS}
                  max={
                    (offset +
                      Math.min(
                        draft.startFrame + OWNER_CAMERA_FOLLOW.frames,
                        draft.occurrence === "hook" ? prefix : focus.frames,
                      )) /
                    OWNER_FPS
                  }
                  step={1 / OWNER_FPS}
                  disabled={disabled || busy || capturingEnd}
                  value={
                    Number.isFinite(draft.endFrame)
                      ? Number(
                          ((offset + draft.endFrame) / OWNER_FPS).toFixed(3),
                        )
                      : ""
                  }
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      endFrame:
                        e.currentTarget.value === ""
                          ? NaN
                          : Math.round(
                              Number(e.currentTarget.value) * OWNER_FPS,
                            ) - offset,
                    })
                  }
                />
              </label>
              <Button
                variant="quiet"
                icon={Clock3}
                aria-label="Capture motion end"
                title="End after current frame"
                disabled={disabled || busy || capturingEnd || !captureReady}
                onClick={() => void captureEnd()}
              >
                Capture
              </Button>
            </div>
            {(["x", "y", "width", "height"] as const).map((key) => (
              <label key={key}>
                Head {key === "x" ? "left" : key === "y" ? "top" : key} (%)
                <input
                  type="number"
                  aria-label={`Head ${key} percent`}
                  min={0}
                  max={100}
                  step={1}
                  disabled={disabled || busy}
                  value={Number((draft.seed[key] * 100).toFixed(1))}
                  onChange={(e) => {
                    if (
                      e.currentTarget.value !== "" &&
                      Number.isFinite(Number(e.currentTarget.value))
                    )
                      updateSeed({
                        ...draft.seed,
                        [key]: Number(e.currentTarget.value) / 100,
                      });
                  }}
                />
              </label>
            ))}
          </div>
          {busy && <Progress label="Tracking head" fraction={progress} />}
          <WorkflowActions
            target={footerTarget}
            label="Motion tracking actions"
          >
            <span className="head-motion-actions">
              <Button
                variant="primary"
                disabled={
                  busy ||
                  disabled ||
                  !draft.marked ||
                  capturingEnd ||
                  !ownerHeadBoxSchema.safeParse(draft.seed).success
                }
                onClick={() => void track()}
              >
                Track head
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  request.current?.abort();
                  setDraft(null);
                }}
              >
                Cancel
                <span className="local-action-detail">
                  {busy ? " tracking" : ""}
                </span>
              </Button>
            </span>
          </WorkflowActions>
        </>
      ) : (
        <>
          {!!tracks.length && (
            <>
              <label>
                Motion interval
                <select
                  aria-label="Motion interval"
                  value={chosen?.id}
                  onChange={(e) => setSelected(e.currentTarget.value)}
                >
                  {tracks.map((t, i) => (
                    <option key={t.id} value={t.id}>
                      Motion {i + 1} · {name(t.personId)} ·{" "}
                      {t.occurrence === "hook" ? "Hook" : "Clip"} ·{" "}
                      {(
                        (t.startFrame +
                          (t.occurrence === "body" ? prefix : 0)) /
                        OWNER_FPS
                      ).toFixed(1)}
                      –
                      {(
                        (t.endFrame + (t.occurrence === "body" ? prefix : 0)) /
                        OWNER_FPS
                      ).toFixed(1)}
                      s
                    </option>
                  ))}
                </select>
              </label>
              {chosen && (
                <div className="picture-tools">
                  <Button
                    variant="secondary"
                    icon={Play}
                    disabled={disabled}
                    onClick={() =>
                      preview(
                        chosen.startFrame +
                          (chosen.occurrence === "body" ? prefix : 0),
                      )
                    }
                  >
                    Preview motion
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={disabled}
                    onClick={() => {
                      onPersonChange(chosen.personId);
                      setDraft({
                        id: chosen.id,
                        occurrence: chosen.occurrence,
                        personId: chosen.personId,
                        startFrame: chosen.startFrame,
                        endFrame: chosen.endFrame,
                        sourceStartFrame: chosen.sourceStartFrame,
                        seed: chosen.seed,
                        marked: true,
                      });
                      seek(
                        chosen.startFrame +
                          (chosen.occurrence === "body" ? prefix : 0),
                      );
                    }}
                  >
                    Adjust
                  </Button>
                  <Button
                    variant="quiet"
                    icon={Trash2}
                    disabled={disabled}
                    onClick={() => {
                      onChange(ownerCameraWithoutTrack(tracks, chosen.id));
                      setMessage("");
                    }}
                  >
                    Remove motion
                  </Button>
                </div>
              )}
              {chosen?.outcome === "lost" && (
                <p role="status">
                  Tracking stopped at{" "}
                  {(
                    (chosen.endFrame +
                      (chosen.occurrence === "body" ? prefix : 0)) /
                    OWNER_FPS
                  ).toFixed(2)}
                  s. Preview the covered interval; add a new interval to
                  reselect the head.
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
