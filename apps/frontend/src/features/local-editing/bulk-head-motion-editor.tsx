import { useContext } from "react";
import { EditorOccurrence } from "./editor-clock.ts";
import { useEffect, useRef, useState } from "react";
import { Button } from "../../shared/ui/button";
import { Progress } from "../../shared/ui/progress";
import { WorkflowActions } from "./workflow-actions";
import {
  planBulkHeadMotion,
  trackBulkHeadMotion,
  type BulkHeadProgress,
} from "./bulk-head-motion";
import type { OwnerFocus } from "../../../../../packages/contracts/local/focus.ts";
import type { OwnerCameraTrack } from "../../../../../packages/contracts/local/camera-follow.ts";
import type { OwnerCameraEffect } from "../../../../../packages/contracts/local/camera-motion.ts";
import type { OwnerHook } from "../../../../../packages/contracts/local/hook.ts";

export function BulkHeadMotionEditor(props: {
  focus: OwnerFocus;
  tracks: OwnerCameraTrack[];
  effects: OwnerCameraEffect[];
  hook: OwnerHook | undefined;
  sourceUrl: string;
  disabled: boolean;
  footerTarget?: HTMLElement | null | undefined;
  onChange: (tracks: OwnerCameraTrack[]) => void;
  onBusy: (busy: boolean) => void;
  pause: () => void;
  seek: (frame: number) => void;
  onClose: () => void;
  onResult: (message: string) => void;
}) {
  const { onBusy } = props;
  const [busy, setBusy] = useState(false),
    [progress, setProgress] = useState<BulkHeadProgress | null>(null);
  const request = useRef<AbortController | null>(null),
    alive = useRef(false),
    interval = useRef(0);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      request.current?.abort();
    };
  }, []);
  useEffect(() => {
    onBusy(busy);
    return () => onBusy(false);
  }, [busy, onBusy]);
  const occurrence = useContext(EditorOccurrence);
  const plan = planBulkHeadMotion({ ...props, occurrence });
  const people = new Set(plan.intervals.map((interval) => interval.personId))
    .size;
  async function run() {
    if (
      request.current ||
      props.disabled ||
      plan.blocked ||
      !plan.intervals.length
    )
      return;
    const controller = new AbortController();
    request.current = controller;
    props.pause();
    setBusy(true);
    try {
      const result = await trackBulkHeadMotion({
        occurrence,
        ...props,
        signal: controller.signal,
        progress: (value) => {
          if (alive.current) {
            if (interval.current !== value.index) {
              interval.current = value.index;
              props.seek(value.presentationFrame);
            }
            setProgress(value);
          }
        },
      });
      controller.signal.throwIfAborted();
      if (alive.current) {
        if (result.complete + result.partial) props.onChange(result.tracks);
        props.onResult(
          `${result.complete} complete · ${result.partial} partial · ${result.failed} need attention. Preview the paths before applying.`,
        );
        props.onClose();
      }
    } catch {
      if (alive.current && !controller.signal.aborted)
        props.onResult(
          "Couldn’t track these intervals. Existing Motion is unchanged.",
        );
    } finally {
      if (request.current === controller) request.current = null;
      if (alive.current) setBusy(false);
    }
  }
  return (
    <div className="bulk-head-motion">
      <p>
        {plan.intervals.length} camera intervals · {people} people
      </p>
      {!!plan.skipped.covered && (
        <p>Existing Motion and Zoom ranges will be kept.</p>
      )}
      {!!(plan.skipped.custom + plan.skipped.unseeded + plan.skipped.short) && (
        <p role="status">
          Skipped: {plan.skipped.unseeded} without a head box ·{" "}
          {plan.skipped.custom} custom camera · {plan.skipped.short} too short.
        </p>
      )}
      {plan.blocked === "capacity" && (
        <p role="status">
          This would exceed 20 Motion intervals. Use Add at playhead for smaller
          ranges.
        </p>
      )}
      {plan.blocked === "invalid" && (
        <p role="status">
          Finish the camera and Zoom edits before tracking all speakers.
        </p>
      )}
      {!plan.blocked && !plan.intervals.length && (
        <p role="status">
          No uncovered intervals with a head box. Use Add at playhead to mark
          one manually.
        </p>
      )}
      {busy && (
        <>
          <Progress
            label="Tracking all speakers"
            fraction={progress?.fraction ?? 0}
          />
          <p role="status">
            Person {progress?.personId?.slice(-1) ?? "—"} · Interval{" "}
            {progress?.index ?? 0} of {progress?.total ?? plan.intervals.length}
          </p>
        </>
      )}
      <WorkflowActions target={props.footerTarget} label="Bulk Motion actions">
        <span className="head-motion-actions">
          <Button
            variant="primary"
            disabled={
              busy || props.disabled || !!plan.blocked || !plan.intervals.length
            }
            onClick={() => void run()}
          >
            Track all
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              request.current?.abort();
              props.onClose();
            }}
          >
            Cancel
            <span className="local-action-detail">
              {busy ? " tracking" : ""}
            </span>
          </Button>
        </span>
      </WorkflowActions>
    </div>
  );
}
