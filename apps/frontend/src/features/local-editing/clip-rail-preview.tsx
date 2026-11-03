import { useEffect, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import type { OwnerClip } from "../../../../../packages/contracts/local/clips.ts";
import { compileOwnerOverlay } from "../../../../../packages/contracts/local/edit-overlay.ts";
import { ownerPresentationFrames } from "../../../../../packages/contracts/local/hook.ts";
import { OWNER_FPS } from "../../../../../packages/contracts/local/policy.ts";
import { Review } from "./clip-editor";

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
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry?.isIntersecting === true);
      },
      { root: node.closest(".clip-list"), threshold: 0.05 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const overlay =
    clip.base && clip.edit
      ? compileOwnerOverlay(clip.base, clip.edit, clip.assets, clip.audioAssets)
      : clip.base?.overlay;
  return (
    <span
      ref={root}
      className="clip-rail-preview"
      aria-hidden="true"
      onPointerEnter={() => {
        if (!failed) player.current?.play();
      }}
      onPointerLeave={() => player.current?.pause()}
    >
      {visible && overlay && !failed && (
        <Player
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
            onPlaybackError: () => setFailed(true),
            onPreviewReady: noop,
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
          errorFallback={() => (
            <span className="clip-rail-placeholder">Preview unavailable</span>
          )}
          style={{ width: "100%", pointerEvents: "none" }}
        />
      )}
      {failed && (
        <span className="clip-rail-placeholder">Preview unavailable</span>
      )}
    </span>
  );
}
