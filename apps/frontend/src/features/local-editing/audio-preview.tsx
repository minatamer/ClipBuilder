import { useEffect, useEffectEvent, useRef, useState } from "react";
import {
  Html5Audio,
  Loop,
  Sequence,
  useVideoConfig,
  useBufferState,
} from "remotion";
import { ownerAudioDuration } from "../../../../../packages/contracts/local/audio.ts";
import {
  ownerOverlayAudioSegments,
  ownerOverlayAudioAssets,
} from "../../../../../packages/contracts/local/occurrence-audio.ts";
import type { OwnerOverlay } from "../../../../../packages/contracts/local/clips.ts";
import {
  ownerHookFrames,
  ownerPresentationFrames,
} from "../../../../../packages/contracts/local/hook.ts";
import { preparePreviewAudio } from "./prepare-preview-audio.ts";
import {
  ownerSoundAudio,
  ownerAudioSourceKey,
} from "../../../../../packages/composition/local/audio-sources.ts";

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
  const ready = useRef(new Set<string>());
  const prepared = useRef(false);
  const reportError = useEffectEvent(onError);
  const cues = [
    ...(overlay.audio?.cues ?? []),
    ...(overlay.hookContent?.audio?.cues ?? []),
  ];
  const assets = ownerOverlayAudioAssets(overlay);
  const key = JSON.stringify(
    [...new Set(cues.map((cue) => ownerAudioSourceKey(cue.source)))].sort(),
  );
  useEffect(() => {
    const next = cache.current;
    const pending = prepared.current ? null : delayPlayback();
    const controller = new AbortController();
    // Defer PCM preparation so changing controls can paint before synthesis.
    const timer = window.setTimeout(() => {
      const needed = new Set<string>();
      for (const cue of cues) {
        const source = cue.source,
          id = ownerAudioSourceKey(source);
        needed.add(id);
        if (next[id]) continue;
        if (source.kind === "builtin") {
          const sample = ownerSoundAudio(source.id);
          next[id] = URL.createObjectURL(
            new Blob([sample.bytes], { type: sample.mimeType }),
          );
        } else
          next[id] =
            `/api/local/workspace/${workspaceId}/audio-assets/${source.id}`;
      }
      for (const [id, url] of Object.entries(next))
        if (!needed.has(id)) {
          if (url.startsWith("blob:")) URL.revokeObjectURL(url);
          delete next[id];
          ready.current.delete(id);
        }
      void Promise.all(
        [...needed]
          .filter((id) => !ready.current.has(id))
          .map(async (id) => {
            if (!next[id]!.startsWith("blob:")) {
              const response = await fetch(next[id]!, {
                signal: controller.signal,
              });
              if (!response.ok) throw new Error("preview_audio_unavailable");
              const bytes = await response.blob();
              controller.signal.throwIfAborted();
              next[id] = URL.createObjectURL(bytes);
            }
            await preparePreviewAudio(next[id]!, controller.signal);
            if (!controller.signal.aborted) ready.current.add(id);
          }),
      )
        .then(() => {
          if (controller.signal.aborted) return;
          prepared.current = true;
          setSources({ ...next });
        })
        .catch(() => {
          if (!controller.signal.aborted) reportError();
        })
        .finally(() => pending?.unblock());
    }, 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
      pending?.unblock();
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
      {ownerOverlayAudioSegments(overlay).map((segment) => {
        const src = sources[ownerAudioSourceKey(segment.cue.source)];
        if (!src) return null;
        // Remotion pools tags by URL and clock. Distinct cues must still mix
        // independently when they use the same source at the same time.
        const cueSource = `${src}#${segment.cue.source.kind}-${segment.cue.id}`;
        const offset = Math.round(segment.offset * fps),
          duration = Math.max(
            1,
            Math.round(ownerAudioDuration(segment.cue.source, assets) * fps),
          );
        const track = (
          <Html5Audio
            src={cueSource}
            preload="auto"
            volume={segment.cue.volume / 100}
            pauseWhenBuffering={false}
            onError={onError}
          />
        );
        return (
          <Sequence
            // Inserting a Hook cue must not remount existing body tracks: an
            // old pooled tag's cleanup can otherwise release its replacement.
            key={`${segment.cue.id}-${segment.start < ownerHookFrames(overlay) / fps ? "hook" : "body"}`}
            from={Math.round(segment.start * fps)}
            durationInFrames={Math.max(
              1,
              Math.round((segment.end - segment.start) * fps),
            )}
            style={{ pointerEvents: "none" }}
            premountFor={ownerPresentationFrames(overlay)}
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
                preload="auto"
                trimBefore={offset}
                volume={segment.cue.volume / 100}
                pauseWhenBuffering={false}
                onError={onError}
              />
            )}
          </Sequence>
        );
      })}
    </>
  );
}
