import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Clock3, Play, Trash2 } from "lucide-react";
import { Button } from "../../shared/ui/button";
import { InlineFeedback } from "../../shared/ui/inline-feedback";
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
import { HeadSelectionView } from "./head-selection-view";
import { FocusPreviewSlot } from "./focus-preview-slot";
import { motionForCameraPosition } from "./head-motion-selection.ts";
import {
  ownerFollowWindow,
  setOwnerFollowWindow,
} from "../../../../../packages/contracts/local/camera-follow-window.ts";
import type { HeadBox } from "../../../../../packages/composition/local/head-pixel-tracker.ts";

type Draft = Pick<
  OwnerCameraTrack,
  | "id"
  | "occurrence"
  | "personId"
  | "startFrame"
  | "endFrame"
  | "sourceStartFrame"
  | "seed"
  | "followWindow"
> & { marked: boolean };
const name = (id: string | null) => (id ? `Person ${id.slice(-1)}` : "Camera");
function FollowWindowField({
  value,
  disabled,
  onChange,
}: {
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <label className="motion-follow-window">
      Follow window (%)
      <input
        type="number"
        aria-label="Follow window percent"
        min={0}
        max={60}
        step={5}
        value={value}
        disabled={disabled}
        onChange={(event) => {
          const next = Number(event.currentTarget.value);
          if (
            event.currentTarget.value !== "" &&
            Number.isInteger(next) &&
            next >= 0 &&
            next <= 60
          )
            onChange(next);
        }}
      />
      <span>Larger keeps framing still through small movements.</span>
    </label>
  );
}
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
  selectionKey,
  selectionFrame,
  onCameraPositionSelect,
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
  selectionKey?: string | undefined;
  selectionFrame?: number | undefined;
  onCameraPositionSelect?: ((frame: number) => void) | undefined;
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
    alive = useRef(false);
  const progressSlot = useRef<HTMLDivElement>(null);
  const prefix = ownerHookFrames({ hook }),
    content = ownerSourceContent(focus.source);
  const chosen =
    tracks.find((t) => t.id === selected) ??
    (selectionKey ? undefined : tracks[0]);
  const selecting = draft !== null || bulk;
  const selectionRequest = useRef("");
  useEffect(() => {
    if (
      !selectionKey ||
      selectionFrame === undefined ||
      selectionRequest.current === `${selectionKey}:${selectionFrame}`
    )
      return;
    selectionRequest.current = `${selectionKey}:${selectionFrame}`;
    const path = motionForCameraPosition(
      focus,
      tracks,
      selectionFrame,
      selected,
    );
    setSelected(path?.id ?? null);
  }, [selectionKey, selectionFrame, tracks, focus, selected]);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      request.current?.abort();
    };
  }, []);
  const reportMode = useEffectEvent((value: boolean) => onMode(value));
  const reportBusy = useEffectEvent((value: boolean) => onBusy(value));
  useEffect(() => {
    reportMode(selecting);
  }, [selecting]);
  useEffect(() => {
    reportBusy(busy);
    if (busy) progressSlot.current?.scrollIntoView({ block: "nearest" });
  }, [busy]);
  useEffect(
    () => () => {
      reportMode(false);
      reportBusy(false);
    },
    [],
  );
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
    if (
      selectionFrame !== undefined &&
      shot !== ownerFocusAt(focus, selectionFrame)
    ) {
      setMessage("Choose a frame inside the selected camera position.");
      return;
    }
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
      followWindow: OWNER_CAMERA_FOLLOW.followWindow,
    });
    setMessage("");
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
    <div
      className="head-motion-editor"
      data-mode={
        bulk ? "bulk" : draft ? (busy ? "tracking" : "marking") : "idle"
      }
    >
      {!bulk && !draft && (
        <div className="collection-navigation">
          {selectionKey ? (
            <div className="motion-target">
              <span>Follow</span>
              <strong>{name(person)}</strong>
            </div>
          ) : (
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
          )}
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
          <div className="motion-marking-context">
            <strong>{name(draft.personId)}</strong>
            <span>
              {draft.occurrence === "hook" ? "Hook" : "Clip"} ·{" "}
              {((offset + draft.startFrame) / OWNER_FPS).toFixed(2)}–
              {((offset + draft.endFrame) / OWNER_FPS).toFixed(2)}s
            </span>
          </div>
          <FocusPreviewSlot>
            <HeadSelectionView
              sourceUrl={sourceUrl}
              content={content}
              sourceFrame={draft.sourceStartFrame}
              seed={draft.seed}
              disabled={disabled || busy}
              tracking={busy}
              onChange={updateSeed}
              onConfirm={() => setDraft({ ...draft, marked: true })}
              followWindow={ownerFollowWindow(focus, draft).box}
            />
          </FocusPreviewSlot>
          <div className="motion-editing-slot" ref={progressSlot}>
            {busy ? (
              <Progress label="Tracking head" fraction={progress} />
            ) : (
              <>
                <div className="motion-interval-fields">
                  <p className="motion-start-time">
                    <span>Start</span>
                    <strong>
                      {((offset + draft.startFrame) / OWNER_FPS).toFixed(3)}s
                    </strong>
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
                              draft.occurrence === "hook"
                                ? prefix
                                : focus.frames,
                            )) /
                          OWNER_FPS
                        }
                        step={1 / OWNER_FPS}
                        disabled={disabled || busy || capturingEnd}
                        value={
                          Number.isFinite(draft.endFrame)
                            ? Number(
                                ((offset + draft.endFrame) / OWNER_FPS).toFixed(
                                  3,
                                ),
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
                      disabled={
                        disabled || busy || capturingEnd || !captureReady
                      }
                      onClick={() => void captureEnd()}
                    >
                      Capture
                    </Button>
                  </div>
                </div>
                <FollowWindowField
                  value={draft.followWindow ?? 0}
                  disabled={disabled}
                  onChange={(followWindow) =>
                    setDraft({ ...draft, followWindow })
                  }
                />
                <details className="motion-head-details">
                  <summary>Head region</summary>
                  <div className="motion-head-fields">
                    {(["x", "y", "width", "height"] as const).map((key) => (
                      <label key={key}>
                        Head {key === "x" ? "left" : key === "y" ? "top" : key}{" "}
                        (%)
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
                </details>
              </>
            )}
          </div>
          <WorkflowActions
            target={footerTarget}
            label="Motion tracking actions"
          >
            <span className="head-motion-actions">
              <InlineFeedback message={message} />
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
                  value={chosen?.id ?? ""}
                  onChange={(e) => {
                    const path = tracks.find(
                      (track) => track.id === e.currentTarget.value,
                    );
                    if (!path) return;
                    setSelected(path.id);
                    onCameraPositionSelect?.(path.sourceStartFrame);
                    seek(
                      path.startFrame +
                        (path.occurrence === "body" ? prefix : 0),
                    );
                  }}
                >
                  <option value="" disabled>
                    Choose Motion
                  </option>
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
                <FollowWindowField
                  value={chosen.followWindow ?? 0}
                  disabled={disabled}
                  onChange={(value) =>
                    onChange(setOwnerFollowWindow(tracks, chosen.id, value))
                  }
                />
              )}
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
                        followWindow:
                          chosen.followWindow ??
                          OWNER_CAMERA_FOLLOW.followWindow,
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
      {!draft && !bulk && <InlineFeedback message={message} />}
    </div>
  );
}
