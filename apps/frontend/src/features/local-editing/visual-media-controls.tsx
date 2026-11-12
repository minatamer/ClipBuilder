import { useEffect, useId, useRef, useState } from "react";
import { Button } from "../../shared/ui/button";
import { MediaLoadingOverlay } from "../../shared/ui/media-loading-overlay";
import { InlineFeedback } from "../../shared/ui/inline-feedback";
import { OWNER_FPS } from "../../../../../packages/contracts/local/policy.ts";
import type { OwnerVisualEdit } from "../../../../../packages/contracts/local/assets.ts";
import type { OwnerVideoAsset } from "../../../../../packages/contracts/local/video-assets.ts";

export function VisualPresentation({
  cue,
  onChange,
  onBackground,
  validationMessage,
}: {
  cue: OwnerVisualEdit;
  onChange: (cue: OwnerVisualEdit) => void;
  onBackground: (cue: OwnerVisualEdit) => void;
  validationMessage?: string | undefined;
}) {
  const feedbackId = useId();
  const focal = cue.focal ?? { x: 0.5, y: 0.5 };
  const coordinate = (
    label: string,
    value: number,
    change: (value: number) => void,
  ) => (
    <label>
      {label}
      <input
        type="number"
        aria-label={label}
        aria-invalid={!!validationMessage || undefined}
        aria-describedby={validationMessage ? feedbackId : undefined}
        min={0}
        max={100}
        step={1}
        value={Number.isFinite(value) ? Number((value * 100).toFixed(2)) : ""}
        onChange={(event) =>
          change(
            event.currentTarget.value === ""
              ? NaN
              : Number(event.currentTarget.value) / 100,
          )
        }
      />
    </label>
  );

  return (
    <>
      <div className="editor-fields">
        <label>
          Presentation
          <select
            className="select-control"
            aria-label="Visual presentation"
            value={cue.presentation ?? "inset"}
            onChange={(event) => {
              const next = {
                ...cue,
                presentation:
                  event.currentTarget.value === "full-frame"
                    ? ("full-frame" as const)
                    : ("inset" as const),
              };
              if (
                next.presentation === "full-frame" &&
                cue.presentation !== "full-frame"
              )
                onBackground(next);
              else onChange(next);
            }}
          >
            <option value="inset">Inset</option>
            <option value="full-frame">Full frame</option>
          </select>
        </label>
        {coordinate("Focal X (%)", focal.x, (x) =>
          onChange({ ...cue, focal: { ...focal, x } }),
        )}
        {coordinate("Focal Y (%)", focal.y, (y) =>
          onChange({ ...cue, focal: { ...focal, y } }),
        )}
      </div>
      <label className="visual-bar-option">
        <input
          type="checkbox"
          checked={cue.ignoreBlackBars ?? false}
          onChange={(event) =>
            onChange({ ...cue, ignoreBlackBars: event.currentTarget.checked })
          }
        />
        Ignore black bars
      </label>
      <InlineFeedback id={feedbackId} message={validationMessage} />
    </>
  );
}

export function VideoSourceControls({
  workspaceId,
  cue,
  asset,
  onChange,
  validationMessage,
  active,
}: {
  workspaceId: string;
  cue: OwnerVisualEdit;
  asset: OwnerVideoAsset;
  onChange: (cue: OwnerVisualEdit) => void;
  validationMessage?: string | undefined;
  active: boolean;
}) {
  const feedbackId = useId();
  const video = useRef<HTMLVideoElement>(null),
    [ready, setReady] = useState(false),
    [message, setMessage] = useState("");
  const sound = cue.video!;
  const feedback = message || validationMessage;
  const end = sound.sourceEndFrame ?? asset.frames;
  const source = `/api/local/workspace/${workspaceId}/video-assets/${asset.id}`;
  useEffect(() => {
    if (!active) video.current?.pause();
  }, [active]);
  useEffect(() => {
    const node = video.current;
    if (node) {
      node.src = source;
      node.load();
    }
    return () => {
      if (node) {
        node.pause();
        node.removeAttribute("src");
        node.load();
      }
    };
  }, [source]);
  function endpoint(key: "start" | "end", frame: number) {
    setMessage("");
    onChange(
      key === "start"
        ? { ...cue, video: { ...sound, offsetFrame: frame } }
        : { ...cue, video: { ...sound, sourceEndFrame: frame } },
    );
  }
  function capture(key: "start" | "end") {
    const node = video.current;
    if (
      !node ||
      node.seeking ||
      node.readyState < 2 ||
      node.error ||
      !Number.isFinite(node.currentTime)
    ) {
      setMessage("Wait for the source preview to finish seeking.");
      return;
    }
    node.pause();
    const frame =
      Math.floor(node.currentTime * OWNER_FPS) + (key === "end" ? 1 : 0);
    const length = cue.endFrame - cue.startFrame;
    const nextStart = key === "start" ? frame : sound.offsetFrame;
    const nextEnd = key === "end" ? frame : end;
    if (
      !Number.isInteger(length) ||
      length < 1 ||
      !Number.isInteger(nextStart) ||
      !Number.isInteger(nextEnd) ||
      nextStart < 0 ||
      nextEnd > asset.frames ||
      nextStart + length > nextEnd
    ) {
      setMessage("Choose a source range inside this video.");
      return;
    }
    endpoint(key, frame);
  }
  return (
    <section
      className="video-source-editor editor-control-group"
      aria-label="Video source"
    >
      <h3>Source video</h3>
      <div
        style={{
          position: "relative",
          width: Math.min(640, (288 * asset.width) / asset.height),
          maxWidth: "100%",
          marginInline: "auto",
          aspectRatio: `${asset.width} / ${asset.height}`,
        }}
      >
        <video
          ref={video}
          aria-label="B-roll source preview"
          src={source}
          controls
          muted
          playsInline
          preload="metadata"
          style={{
            display: "block",
            width: Math.min(640, (288 * asset.width) / asset.height),
            maxWidth: "100%",
            height: "auto",
            aspectRatio: `${asset.width} / ${asset.height}`,
            marginInline: "auto",
            background: "#000",
          }}
          onLoadStart={() => {
            setReady(false);
            setMessage("");
          }}
          onLoadedData={() => setReady(true)}
          onError={() => {
            setReady(false);
            setMessage("Source preview unavailable.");
          }}
        />
        <MediaLoadingOverlay key={source} element={video} showFailure={false} />
      </div>
      <div className="editor-fields picture-timing">
        {(["start", "end"] as const).map((key) => (
          <div className="range-time" key={key}>
            <label>
              Source {key} (s)
              <input
                type="number"
                aria-label={`Video source ${key} seconds`}
                aria-invalid={!!feedback || undefined}
                aria-describedby={feedback ? feedbackId : undefined}
                min={0}
                max={asset.frames / OWNER_FPS}
                step={1 / OWNER_FPS}
                value={
                  Number.isFinite(key === "start" ? sound.offsetFrame : end)
                    ? Number(
                        (
                          (key === "start" ? sound.offsetFrame : end) /
                          OWNER_FPS
                        ).toFixed(3),
                      )
                    : ""
                }
                onChange={(event) =>
                  endpoint(
                    key,
                    event.currentTarget.value === ""
                      ? NaN
                      : Math.round(
                          Number(event.currentTarget.value) * OWNER_FPS,
                        ),
                  )
                }
              />
            </label>
            <Button
              variant="quiet"
              disabled={!ready}
              aria-label={`Capture video source ${key}`}
              onClick={() => capture(key)}
            >
              Capture
            </Button>
          </div>
        ))}
      </div>
      <InlineFeedback id={feedbackId} message={feedback} />
      <div className="editor-fields">
        <label>
          Video volume (%)
          <input
            type="range"
            aria-label="Video volume"
            min={0}
            max={100}
            step={1}
            value={sound.volume}
            disabled={!asset.hasAudio}
            onChange={(event) => {
              const volume = Number(event.currentTarget.value);
              onChange({
                ...cue,
                video: { ...sound, volume, muted: volume === 0 },
              });
            }}
          />
        </label>
        <Button
          variant="secondary"
          disabled={!asset.hasAudio}
          aria-pressed={sound.muted}
          onClick={() =>
            onChange({
              ...cue,
              video: {
                ...sound,
                muted: !sound.muted,
                volume: sound.volume || 100,
              },
            })
          }
        >
          {sound.muted ? "Unmute video" : "Mute video"}
        </Button>
      </div>
      {!asset.hasAudio && (
        <p className="source-hint">This video has no audio track.</p>
      )}
    </section>
  );
}
