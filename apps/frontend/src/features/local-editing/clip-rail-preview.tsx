import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Player, type PlayerRef } from "@remotion/player";
import type {
  OwnerClip,
  OwnerOverlay,
} from "../../../../../packages/contracts/local/clips.ts";
import { compileOwnerOverlay } from "../../../../../packages/contracts/local/edit-overlay.ts";
import { ownerPresentationFrames } from "../../../../../packages/contracts/local/hook.ts";
import { OWNER_FPS } from "../../../../../packages/contracts/local/policy.ts";
import { VideoThumbnail } from "../../shared/ui/video-thumbnail";
import { Review } from "./clip-editor";
import {
  createPreviewRecovery,
  MEDIA_PREVIEW_ATTEMPT_MS,
} from "../media/preview-recovery";

const noop = () => {};

/** Only visible desktop cards own a paused player; hover uses existing media. */
export function ClipRailPreview({
  clip,
  workspaceId,
}: {
  clip: OwnerClip;
  workspaceId: string;
}) {
  const root = useRef<HTMLSpanElement>(null);
  const player = useRef<PlayerRef>(null);
  const [visible, setVisible] = useState(false);
  useLayoutEffect(() => {
    const node = root.current;
    if (!node) return;
    const list = node.closest(".clip-list");
    let disposed = false;
    const threshold = 0.05;
    const measure = () => {
      if (disposed) return;
      const box = node.getBoundingClientRect();
      const bounds = list?.getBoundingClientRect();
      const width = Math.max(
        0,
        Math.min(box.right, bounds?.right ?? innerWidth, innerWidth) -
          Math.max(box.left, bounds?.left ?? 0, 0),
      );
      const height = Math.max(
        0,
        Math.min(box.bottom, bounds?.bottom ?? innerHeight, innerHeight) -
          Math.max(box.top, bounds?.top ?? 0, 0),
      );
      setVisible(
        box.width > 0 &&
          box.height > 0 &&
          (width * height) / (box.width * box.height) >= threshold,
      );
    };
    // A restored card must not wait for the observer's first asynchronous entry.
    // Its workflow can also become visible after mounting in the hidden view.
    measure();
    const observer = new IntersectionObserver(measure, {
      threshold,
    });
    const resize = new ResizeObserver(measure);
    observer.observe(node);
    resize.observe(node);
    if (list) resize.observe(list);
    return () => {
      disposed = true;
      observer.disconnect();
      resize.disconnect();
    };
  }, []);
  const overlay =
    clip.base && clip.edit
      ? compileOwnerOverlay(
          clip.base,
          clip.edit,
          clip.assets,
          clip.audioAssets,
          clip.videoAssets,
        )
      : clip.base?.overlay;
  return (
    <span
      ref={root}
      className="clip-rail-preview"
      aria-hidden="true"
      onPointerEnter={() => {
        player.current?.play();
      }}
      onPointerLeave={() => player.current?.pause()}
    >
      {visible && overlay && (
        <ClipRailSurface
          key={`${workspaceId}:${clip.id}:${clip.revision}:${clip.preview?.bytes ?? 0}`}
          clip={clip}
          overlay={overlay}
          workspaceId={workspaceId}
          player={player}
        />
      )}
    </span>
  );
}
function ClipRailSurface({
  clip,
  overlay,
  workspaceId,
  player,
}: {
  clip: OwnerClip;
  overlay: OwnerOverlay;
  workspaceId: string;
  player: RefObject<PlayerRef | null>;
}) {
  const [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const attemptId = useRef(0);
  const recovery = useRef<ReturnType<typeof createPreviewRecovery> | null>(
    null,
  );
  const failurePending = useRef(false);
  const fail = useCallback(() => {
    if (attempt !== attemptId.current) return;
    setReady(false);
    setFailed(true);
    failurePending.current = true;
    recovery.current?.fail();
  }, [attempt]);
  useLayoutEffect(() => {
    const current = createPreviewRecovery(() => {
      failurePending.current = false;
      setReady(false);
      setFailed(false);
      attemptId.current++;
      setAttempt(attemptId.current);
    });
    recovery.current = current;
    if (failurePending.current) current.fail();
    return () => {
      current.dispose();
      if (recovery.current === current) recovery.current = null;
    };
  }, []);
  useLayoutEffect(() => {
    const current = player.current;
    current?.addEventListener("error", fail);
    return () => current?.removeEventListener("error", fail);
  }, [player, failed, attempt, fail]);
  useLayoutEffect(() => {
    if (ready || failed) return;
    const timer = setTimeout(fail, MEDIA_PREVIEW_ATTEMPT_MS);
    return () => clearTimeout(timer);
  }, [ready, failed, attempt, fail]);
  return (
    <>
      {!ready && (
        <VideoThumbnail
          recovering={failed}
          request={{
            source: `/api/local/workspace/${workspaceId}/clips/${clip.id}/source`,
            timeMs: 1000,
            width: 160,
            height: 284,
          }}
        />
      )}
      {!failed && (
        <Player
          key={attempt}
          ref={player}
          component={Review}
          inputProps={{
            overlay,
            workspaceId,
            assets: Object.fromEntries(
              clip.assets.map((asset) => [
                asset.id,
                `/api/local/workspace/${workspaceId}/assets/${asset.id}`,
              ]),
            ),
            sourceUrl: `/api/local/workspace/${workspaceId}/clips/${clip.id}/source`,
            selection: "",
            onSelect: noop,
            onBox: noop,
            onGestureStart: noop,
            onPlaybackError: fail,
            onPreviewReady: () => {
              if (attempt !== attemptId.current || failurePending.current)
                return;
              failurePending.current = false;
              recovery.current?.ready();
              setReady(true);
            },
            interactive: false,
            setting: "filters",
            silent: true,
          }}
          durationInFrames={ownerPresentationFrames(overlay)}
          compositionWidth={1080}
          compositionHeight={1920}
          fps={OWNER_FPS}
          numberOfSharedAudioTags={0}
          controls={false}
          loop
          initiallyMuted
          clickToPlay={false}
          doubleClickToFullscreen={false}
          spaceKeyToPlayOrPause={false}
          errorFallback={() => <RailPreviewFailure onFailure={fail} />}
          style={{
            width: "100%",
            pointerEvents: "none",
            opacity: ready ? 1 : 0,
          }}
        />
      )}
    </>
  );
}

function RailPreviewFailure({ onFailure }: { onFailure: () => void }) {
  useLayoutEffect(onFailure, [onFailure]);
  return null;
}
