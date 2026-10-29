import { useEffect, useRef, useState } from "react";
import {
  Html5Audio,
  Loop,
  Sequence,
  useVideoConfig,
  useBufferState,
} from "remotion";
import {
  ownerAudioDuration,
  ownerAudioSegments,
} from "../../../../../packages/contracts/local/audio.ts";
import type { OwnerOverlay } from "../../../../../packages/contracts/local/clips.ts";
import { ownerBuiltinWav } from "../../../../../packages/composition/local/audio-synthesis.ts";

/** Player-owned audio follows playback, seeking, muting and its presentation clock. */
export function OwnerAudioPreview({
  overlay,
  workspaceId,
  onError,
}: {
  overlay: OwnerOverlay;
  workspaceId: string;
  onError: () => void;
}) {
  const { fps } = useVideoConfig();
  const { delayPlayback } = useBufferState();
  const [sources, setSources] = useState<Record<string, string>>({});
  const cache = useRef<Record<string, string>>({});
  const audio = overlay.audio;
  const key = JSON.stringify(
    [
      ...new Set(
        audio?.cues.map((cue) => `${cue.source.kind}:${cue.source.id}`),
      ),
    ].sort(),
  );
  useEffect(() => {
    const next = cache.current;
    const pending = delayPlayback();
    // Defer PCM preparation so changing controls can paint before synthesis.
    const timer = window.setTimeout(() => {
      for (const cue of audio?.cues ?? []) {
        const source = cue.source,
          id = `${source.kind}:${source.id}`;
        if (next[id]) continue;
        if (source.kind === "builtin") {
          next[id] = URL.createObjectURL(
            new Blob([ownerBuiltinWav(source.id)], { type: "audio/wav" }),
          );
        } else
          next[id] =
            `/api/local/workspace/${workspaceId}/audio-assets/${source.id}`;
      }
      setSources({ ...next });
      pending.unblock();
    }, 0);
    return () => {
      window.clearTimeout(timer);
      pending.unblock();
    };
    // The source identities, not gains/timestamps, own these immutable URLs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, workspaceId, delayPlayback]);
  useEffect(() => {
    const owned = cache.current;
    return () => {
      Object.values(owned).forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, []);
  return (
    <>
      {ownerAudioSegments(audio, overlay.frames, overlay.hook).map(
        (segment, index) => {
          const src =
            sources[`${segment.cue.source.kind}:${segment.cue.source.id}`];
          if (!src || !audio) return null;
          // Remotion pools tags by URL and clock. Distinct cues must still mix
          // independently when they use the same source at the same time.
          const cueSource = `${src}#${segment.cue.id}`;
          const offset = Math.round(segment.offset * fps),
            duration = Math.max(
              1,
              Math.round(
                ownerAudioDuration(segment.cue.source, audio.assets) * fps,
              ),
            );
          const track = (
            <Html5Audio
              src={cueSource}
              volume={segment.cue.volume / 100}
              pauseWhenBuffering
              onError={onError}
            />
          );
          return (
            <Sequence
              key={`${segment.cue.id}-${index}`}
              from={Math.round(segment.start * fps)}
              durationInFrames={Math.max(
                1,
                Math.round((segment.end - segment.start) * fps),
              )}
              layout="none"
            >
              {segment.cue.loop ? (
                <Sequence from={-offset} layout="none">
                  <Loop durationInFrames={duration} layout="none">
                    {track}
                  </Loop>
                </Sequence>
              ) : (
                <Html5Audio
                  src={cueSource}
                  trimBefore={offset}
                  volume={segment.cue.volume / 100}
                  pauseWhenBuffering
                  onError={onError}
                />
              )}
            </Sequence>
          );
        },
      )}
    </>
  );
}
