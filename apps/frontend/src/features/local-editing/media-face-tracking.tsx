import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import type { PlayerRef } from "@remotion/player";
import { Play, Trash2 } from "lucide-react";
import { Button } from "../../shared/ui/button";
import { InlineFeedback } from "../../shared/ui/inline-feedback";
import { Progress } from "../../shared/ui/progress";
import { WorkflowActions } from "./workflow-actions";
import { HeadSelectionView } from "./head-selection-view";
import { PictureTiming } from "./picture-timing";
import { trackHeadVideo } from "./track-head-video";
import { useEditorPreview } from "./use-editor-preview";
import type { OwnerVisualEdit } from "../../../../../packages/contracts/local/assets.ts";
import type { OwnerVideoAsset } from "../../../../../packages/contracts/local/video-assets.ts";
import {
  OWNER_HEAD_PATH,
  ownerHeadBoxSchema,
} from "../../../../../packages/contracts/local/head-path.ts";
import { ownerVisualTrackingSchema } from "../../../../../packages/contracts/local/visual-tracking.ts";

type Draft = {
  startFrame: number;
  endFrame: number;
  seed: { x: number; y: number; width: number; height: number };
  marked: boolean;
};
export function MediaFaceTracking({
  cue,
  asset,
  sourceUrl,
  player,
  available,
  attempt,
  disabled,
  frames,
  previewTarget,
  footerTarget,
  onChange,
  onMode,
  onBusy,
  feedback,
}: {
  cue: OwnerVisualEdit;
  asset: OwnerVideoAsset;
  sourceUrl: string;
  player: RefObject<PlayerRef | null>;
  available: boolean;
  attempt: number;
  disabled: boolean;
  frames: number;
  previewTarget: HTMLElement | null;
  footerTarget?: HTMLElement | null | undefined;
  onChange: (cue: OwnerVisualEdit) => void;
  onMode: (active: boolean) => void;
  onBusy: (active: boolean) => void;
  feedback?: string | undefined;
}) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const request = useRef<AbortController | null>(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      request.current?.abort();
      onBusy(false);
      onMode(false);
    };
  }, [onBusy, onMode]);
  useEffect(() => {
    onMode(!!draft);
  }, [draft, onMode]);
  const preview = useEditorPreview({
    player,
    available: available && !disabled,
    attempt,
    frames,
    captureTarget: cue,
  });
  const track = cue.tracking;
  const sourceFrame = draft
    ? (cue.video?.offsetFrame ?? 0) + draft.startFrame - cue.startFrame
    : (cue.video?.offsetFrame ?? 0) +
      Math.max(
        0,
        Math.min(
          cue.endFrame - cue.startFrame - 1,
          preview.frame - cue.startFrame,
        ),
      );
  const valid =
    !!draft &&
    Number.isInteger(draft.startFrame) &&
    Number.isInteger(draft.endFrame) &&
    draft.startFrame >= cue.startFrame &&
    draft.endFrame <= cue.endFrame &&
    draft.endFrame - draft.startFrame >= 6 &&
    draft.endFrame - draft.startFrame <= OWNER_HEAD_PATH.frames &&
    sourceFrame >= 0 &&
    sourceFrame + draft.endFrame - draft.startFrame <= asset.frames;
  function mark(at: number, previous = false) {
    player.current?.pause();
    setMessage("");
    const startFrame =
      previous && track ? Math.max(cue.startFrame, track.startFrame) : at;
    const endFrame = Math.min(
      cue.endFrame,
      startFrame + OWNER_HEAD_PATH.frames,
      previous && track ? track.endFrame : cue.endFrame,
    );
    setDraft({
      startFrame,
      endFrame,
      seed:
        previous && track
          ? track.seed
          : { x: 0.4, y: 0.3, width: 0.2, height: 0.3 },
      marked: false,
    });
    preview.seekTo(startFrame);
  }
  async function add() {
    const at = await preview.captureFrame();
    if (!alive.current) return;
    if (at === null || at < cue.startFrame || at >= cue.endFrame - 5) {
      setMessage(
        "Choose a settled frame inside this video with at least 0.2 s remaining.",
      );
      return;
    }
    mark(at);
  }
  async function run() {
    if (!draft || !valid || !draft.marked || busy || disabled) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    onBusy(true);
    setProgress(0);
    setMessage("");
    try {
      const result = await trackHeadVideo({
        sourceUrl,
        source: asset,
        rawSource: true,
        seed: draft.seed,
        startFrame: sourceFrame,
        frames: draft.endFrame - draft.startFrame,
        signal: controller.signal,
        progress: (done, total) => {
          if (alive.current) setProgress(done / total);
        },
      });
      if (!alive.current || controller.signal.aborted) return;
      const duration = (result.points.at(-1)?.frame ?? -1) + 1;
      if (duration < 6) {
        setMessage(
          "The face was lost too soon. Mark a clearer region and try again.",
        );
        return;
      }
      const tracking = ownerVisualTrackingSchema.parse({
        assetId: asset.id,
        startFrame: draft.startFrame,
        endFrame: draft.startFrame + duration,
        sourceStartFrame: sourceFrame,
        seed: draft.seed,
        ...result,
      });
      onChange({ ...cue, tracking });
      setDraft(null);
      setMessage(
        result.outcome === "lost"
          ? "Face lost. Kept the tracked interval; adjust the region to track again."
          : "",
      );
      preview.seekTo(cue.startFrame);
    } catch {
      if (alive.current && !controller.signal.aborted)
        setMessage(
          "Couldn’t follow this region. Choose a clear, detailed face and try again.",
        );
    } finally {
      if (request.current === controller) request.current = null;
      if (alive.current) {
        setBusy(false);
        onBusy(false);
      }
    }
  }
  const seed = draft?.seed ??
    track?.seed ?? { x: 0.4, y: 0.3, width: 0.2, height: 0.3 };
  return (
    <div
      className="head-motion-editor media-face-tracking"
      data-mode={draft ? (busy ? "tracking" : "marking") : "idle"}
    >
      {previewTarget &&
        createPortal(
          <HeadSelectionView
            sourceUrl={sourceUrl}
            content={{ x: 0, y: 0, width: asset.width, height: asset.height }}
            rawSource
            sourceFrame={
              Number.isFinite(sourceFrame)
                ? sourceFrame
                : (cue.video?.offsetFrame ?? 0)
            }
            seed={seed}
            disabled={disabled || busy || !draft}
            tracking={busy}
            onChange={(box) => {
              if (!draft) return;
              const width = Math.max(0.02, Math.min(0.7, box.width)),
                height = Math.max(0.02, Math.min(0.7, box.height));
              const next = {
                x: Math.max(0, Math.min(1 - width, box.x)),
                y: Math.max(0, Math.min(1 - height, box.y)),
                width,
                height,
              };
              if (ownerHeadBoxSchema.safeParse(next).success)
                setDraft({ ...draft, seed: next, marked: true });
            }}
            onConfirm={() => draft && setDraft({ ...draft, marked: true })}
          />,
          previewTarget,
        )}
      {!draft ? (
        <div className="collection-navigation">
          <Button
            variant="secondary"
            disabled={disabled || !available || !preview.captureReady}
            onClick={() => void add()}
          >
            Add at playhead
          </Button>
          {track && (
            <>
              <Button
                variant="secondary"
                icon={Play}
                disabled={disabled || !available}
                onClick={() => {
                  preview.seekTo(cue.startFrame);
                  void player.current?.play();
                }}
              >
                Preview tracking
              </Button>
              <Button
                variant="secondary"
                disabled={disabled || !available}
                onClick={() => mark(track.startFrame, true)}
              >
                Adjust tracking
              </Button>
              <Button
                variant="quiet"
                icon={Trash2}
                disabled={disabled}
                onClick={() => {
                  const next = { ...cue };
                  delete next.tracking;
                  onChange(next);
                }}
              >
                Remove tracking
              </Button>
            </>
          )}
        </div>
      ) : (
        <>
          <fieldset disabled={disabled || busy}>
            <PictureTiming
              label="Face tracking"
              className="focus-boundaries"
              cue={draft}
              frames={frames}
              player={player}
              available={available && !busy && !disabled}
              attempt={attempt}
              validationMessage={
                valid
                  ? undefined
                  : "Choose 0.2–30 s inside this media interval."
              }
              onChange={(next) => {
                setDraft({ ...next, marked: false });
                if (
                  Number.isInteger(next.startFrame) &&
                  next.startFrame >= cue.startFrame &&
                  next.startFrame < cue.endFrame
                )
                  preview.seekTo(next.startFrame);
              }}
            />
          </fieldset>
          <div className="motion-editing-slot">
            {busy && <Progress label="Tracking face" fraction={progress} />}
          </div>
          <WorkflowActions
            target={footerTarget}
            label="Media face tracking actions"
          >
            <Button
              variant="quiet"
              onClick={() => {
                request.current?.abort();
                setDraft(null);
                setMessage("");
              }}
            >
              Cancel
            </Button>
            {!busy && (
              <Button
                variant="primary"
                disabled={disabled || !available || !valid || !draft.marked}
                onClick={() => void run()}
              >
                Track face
              </Button>
            )}
          </WorkflowActions>
        </>
      )}
      <InlineFeedback message={message || feedback} />
    </div>
  );
}
