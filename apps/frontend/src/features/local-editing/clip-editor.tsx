import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { AbsoluteFill, Html5Video, useCurrentFrame } from "remotion";
import { OwnerAutomaticOverlay } from "../../../../../packages/composition/local/automatic-overlay.tsx";
import { OwnerVideoLookLayer } from "../../../../../packages/composition/local/video-look.tsx";
import {
  OWNER_VIDEO_LOOKS,
  type OwnerVideoLook,
} from "../../../../../packages/contracts/local/video-look.ts";
import { compileOwnerOverlay } from "../../../../../packages/composition/local/edit-overlay.ts";
import {
  ownerClipListSchema,
  type OwnerClip,
  type OwnerClipList,
  type OwnerOverlay,
} from "../../../../../packages/contracts/local/clips.ts";
import {
  OWNER_CAPTION_PRESETS,
  OWNER_CAPTION_FONTS,
  OWNER_CAPTION_ANIMATIONS,
  ownerEditDocumentSchema,
  ownerEditRequestSchema,
  type OwnerCaptionStyle,
  type OwnerEditDocument,
} from "../../../../../packages/contracts/local/editor.ts";
import {
  OWNER_PICTURE_LIMITS,
  type OwnerVisualEdit,
} from "../../../../../packages/contracts/local/assets.ts";
import { OWNER_FPS } from "../../../../../packages/contracts/local/index.ts";
import { CONTEXTUAL_PICTURE_POLICY } from "@clipbuilder/contracts";
import {
  automaticVisualEdits,
  captionForOwnerEdit,
  constrainOwnerBox,
  initialOwnerEdit,
  ownerBoxesOverlap,
  ownerEditOperations,
  ownerGestureBox,
  sameOwnerEdit,
  type OwnerEditorBox,
} from "./editor-state.ts";

type LayerControls = {
  selection: string;
  onSelect: (id: string) => void;
  onBox: (id: string, box: OwnerEditorBox) => void;
};

function SelectionBox({
  id,
  label,
  box,
  selected,
  caption,
  onSelect,
  onBox,
}: {
  id: string;
  label: string;
  box: OwnerEditorBox;
  selected: boolean;
  caption: OwnerCaptionStyle | null;
} & Pick<LayerControls, "onSelect" | "onBox">) {
  const gesture = useRef<{
    pointer: number;
    x: number;
    y: number;
    width: number;
    height: number;
    box: OwnerEditorBox;
    resize: boolean;
  } | null>(null);
  function start(event: PointerEvent<HTMLButtonElement>, resize: boolean) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const canvas = event.currentTarget.parentElement!.getBoundingClientRect();
    gesture.current = {
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      width: canvas.width,
      height: canvas.height,
      box,
      resize,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus();
    onSelect(id);
  }
  function move(event: PointerEvent<HTMLButtonElement>) {
    const current = gesture.current;
    if (!current || current.pointer !== event.pointerId) return;
    onBox(
      id,
      ownerGestureBox(
        current.box,
        event.clientX - current.x,
        event.clientY - current.y,
        current,
        current.resize,
        caption,
      ),
    );
  }
  function key(event: KeyboardEvent<HTMLButtonElement>, resize: boolean) {
    const delta = event.altKey ? 0.05 : 0.005;
    const dx =
      event.key === "ArrowRight"
        ? delta
        : event.key === "ArrowLeft"
          ? -delta
          : 0;
    const dy =
      event.key === "ArrowDown" ? delta : event.key === "ArrowUp" ? -delta : 0;
    if (!dx && !dy) return;
    event.preventDefault();
    event.stopPropagation();
    onBox(
      id,
      constrainOwnerBox(
        resize
          ? { ...box, width: box.width + dx, height: box.height + dy }
          : { ...box, x: box.x + dx, y: box.y + dy },
        caption,
      ),
    );
  }
  const handlers = {
    onPointerMove: move,
    onPointerUp: () => {
      gesture.current = null;
    },
    onPointerCancel: () => {
      gesture.current = null;
    },
    onLostPointerCapture: () => {
      gesture.current = null;
    },
  };
  return (
    <>
      <button
        type="button"
        className={`editor-layer${selected ? " selected" : ""}`}
        aria-label={`Select and move ${label}`}
        aria-pressed={selected}
        style={{
          left: box.x * 1080,
          top: box.y * 1920,
          width: box.width * 1080,
          height: box.height * 1920,
        }}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(id);
        }}
        onPointerDown={(event) => start(event, false)}
        onKeyDown={(event) => key(event, false)}
        {...handlers}
      />
      {selected && (
        <button
          type="button"
          className="editor-resize"
          aria-label={`Resize ${label}`}
          style={{
            left: Math.max(
              0,
              Math.min(1080 - 84, (box.x + box.width) * 1080 - 42),
            ),
            top: Math.max(
              0,
              Math.min(1920 - 84, (box.y + box.height) * 1920 - 42),
            ),
          }}
          onPointerDown={(event) => start(event, true)}
          onKeyDown={(event) => key(event, true)}
          {...handlers}
        >
          ↘
        </button>
      )}
    </>
  );
}

function Review({
  overlay,
  assets,
  sourceUrl,
  selection,
  onSelect,
  onBox,
}: {
  overlay: OwnerOverlay;
  assets: Record<string, string>;
  sourceUrl: string;
} & LayerControls) {
  const frame = useCurrentFrame();
  const caption = overlay.captionStyle ?? OWNER_CAPTION_PRESETS.clean;
  return (
    <AbsoluteFill style={{ backgroundColor: "#101215" }}>
      <OwnerVideoLookLayer look={overlay.videoLook}>
        <Html5Video
          src={sourceUrl}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
          pauseWhenBuffering
        />
      </OwnerVideoLookLayer>
      <OwnerAutomaticOverlay overlay={overlay} assets={assets} frame={frame} />
      <AbsoluteFill
        className="editor-interaction"
        style={{ pointerEvents: "none" }}
      >
        {overlay.visuals
          .filter((cue) => cue.startFrame <= frame && cue.endFrame > frame)
          .map((cue, index) => (
            <SelectionBox
              key={cue.id}
              id={cue.id}
              label={`picture ${index + 1}`}
              box={cue.box}
              selected={selection === cue.id}
              caption={null}
              onSelect={onSelect}
              onBox={onBox}
            />
          ))}
        <SelectionBox
          id="captions"
          label="captions"
          box={caption.box}
          selected={selection === "captions"}
          caption={caption}
          onSelect={onSelect}
          onBox={onBox}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function BoxFields({
  label,
  box,
  onChange,
}: {
  label: string;
  box: OwnerEditorBox;
  onChange: (box: OwnerEditorBox) => void;
}) {
  return (
    <div className="editor-box-fields">
      {(["x", "y", "width", "height"] as const).map((key) => (
        <label key={key}>
          {label} {key} (0–1)
          <input
            type="number"
            step="0.005"
            min="0"
            max="1"
            value={Number.isFinite(box[key]) ? box[key] : ""}
            onChange={(event) =>
              onChange({
                ...box,
                [key]:
                  event.currentTarget.value === ""
                    ? NaN
                    : Number(event.currentTarget.value),
              })
            }
          />
        </label>
      ))}
    </div>
  );
}

/** Local form state never starts AI or a render; only Apply writes a revision. */
export function ClipEditor({
  clip,
  workspaceId,
  onAccepted,
  onDirty,
}: {
  clip: OwnerClip;
  workspaceId: string;
  onAccepted: (list: OwnerClipList) => void;
  onDirty: (clipId: string, dirty: boolean) => void;
}) {
  const [form, setForm] = useState(() => {
    const original = initialOwnerEdit(clip);
    return { original, draft: structuredClone(original) };
  });
  const [selection, setSelection] = useState("captions");
  const [message, setMessage] = useState(
    "Adjust presentation locally, then Apply changes before an explicit export.",
  );
  const [pending, setPending] = useState(false);
  const [forcedStale, setForcedStale] = useState(false);
  const player = useRef<PlayerRef | null>(null);
  const request = useRef<AbortController | null>(null);
  const alive = useRef(true);
  const changed = !sameOwnerEdit(form.original, form.draft);
  const revisionChanged = form.original.revision !== clip.revision;
  const original =
    revisionChanged && !changed ? initialOwnerEdit(clip) : form.original;
  const draft = revisionChanged && !changed ? original : form.draft;
  const dirty = !sameOwnerEdit(original, draft);
  const stale = forcedStale || (revisionChanged && changed);
  const base = clip.base!;
  let error: string | null = null;
  let previewUnavailable = false;
  let overlay: OwnerOverlay = base.overlay;
  try {
    ownerEditDocumentSchema.parse(draft);
    overlay = compileOwnerOverlay(base, draft, clip.assets);
  } catch {
    error =
      "Use valid geometry, registered pictures and increasing clip-relative frame times. Captions need 5% margins, width ≥ 0.6 and room for two lines.";
    try {
      overlay = compileOwnerOverlay(base, original, clip.assets);
    } catch {
      previewUnavailable = true;
    }
  }
  const caption = captionForOwnerEdit(draft);
  const selectedCue = draft.visuals.find((cue) => cue.id === selection);
  const overlaps = overlay.visuals.some(
    (cue) =>
      ownerBoxesOverlap(
        cue.box,
        overlay.captionStyle?.box ?? OWNER_CAPTION_PRESETS.clean.box,
      ) &&
      overlay.captions.some(
        (item) =>
          item.startMs < (cue.endFrame * 1000) / OWNER_FPS &&
          item.endMs > (cue.startFrame * 1000) / OWNER_FPS,
      ),
  );
  const endpoint = `/api/local/workspace/${workspaceId}/clips/${clip.id}`;
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      request.current?.abort();
    };
  }, []);
  useEffect(() => {
    onDirty(clip.id, dirty);
    return () => onDirty(clip.id, false);
  }, [clip.id, dirty, onDirty]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function update(next: OwnerEditDocument) {
    setForm({ original, draft: next });
  }
  function setCaption(next: OwnerCaptionStyle) {
    if (Number.isFinite(next.fontSize) && next.fontSize !== caption.fontSize)
      next = { ...next, box: constrainOwnerBox(next.box, next) };
    update({ ...draft, captions: next });
  }
  function setCue(next: OwnerVisualEdit) {
    update({
      ...draft,
      visuals: draft.visuals.map((cue) => (cue.id === next.id ? next : cue)),
    });
  }
  function setBox(id: string, box: OwnerEditorBox) {
    if (pending) return;
    if (id === "captions") setCaption({ ...caption, box });
    else {
      const cue = draft.visuals.find((item) => item.id === id);
      if (cue) setCue({ ...cue, box });
    }
  }
  async function perform(kind: "edit" | "picture" | "reload", file?: File) {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    try {
      const body =
        kind === "edit"
          ? ownerEditRequestSchema.parse({
              operationId: crypto.randomUUID(),
              expectedRevision: original.revision,
              baseHash: original.baseHash,
              operations: ownerEditOperations(original, draft, clip),
            })
          : null;
      const response = await fetch(
        kind === "reload"
          ? `/api/local/workspace/${workspaceId}/clips`
          : `${endpoint}/${kind}`,
        {
          method: kind === "reload" ? "GET" : "POST",
          signal: controller.signal,
          ...(kind === "edit"
            ? {
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
              }
            : kind === "picture"
              ? {
                  headers: { "Content-Type": file?.type ?? "" },
                  body: file ?? null,
                }
              : {}),
        },
      );
      if (!alive.current || controller.signal.aborted) return;
      if (response.status === 409) {
        setForcedStale(true);
        throw new Error("stale");
      }
      if (!response.ok) throw new Error("unacknowledged");
      const value = ownerClipListSchema.parse(await response.json());
      const acknowledged = value.clips.find((item) => item.id === clip.id);
      if (!acknowledged?.base) throw new Error("unacknowledged");
      if (!alive.current) return;
      onAccepted(value);
      if (kind !== "picture") {
        const accepted = initialOwnerEdit(acknowledged);
        setForm({ original: accepted, draft: structuredClone(accepted) });
        setForcedStale(false);
      }
      setMessage(
        kind === "picture"
          ? "Picture normalized and registered locally. Choose it below to replace or add a cue; no cue changed automatically."
          : kind === "reload"
            ? "Acknowledged revision reloaded; unapplied changes discarded."
            : "Changes acknowledged. Preview uses this revision; export it explicitly when ready. No AI work was started.",
      );
    } catch (failure) {
      if (alive.current && !controller.signal.aborted)
        setMessage(
          failure instanceof Error && failure.message === "stale"
            ? "A newer revision exists. Your unapplied controls are preserved. Reload the acknowledged revision before applying again."
            : "The action was not acknowledged. Your unapplied controls are preserved. Reload status before retrying; no automatic retry is made.",
        );
    } finally {
      request.current = null;
      if (alive.current) setPending(false);
    }
  }
  function upload(file: File | undefined) {
    if (!file) return;
    if (file.size > OWNER_PICTURE_LIMITS.inputBytes || file.size === 0) {
      setMessage(
        "Choose a nonempty JPEG or PNG of at most 4 MiB. Actual image bytes and pixel limits are checked locally before admission.",
      );
      return;
    }
    void perform("picture", file);
  }
  return (
    <section
      className="clip-editor"
      aria-label="Local caption and picture editor"
    >
      <p role="status" aria-live="polite">
        {dirty
          ? "Unapplied local changes. "
          : `Acknowledged revision ${clip.revision}. `}
        {message}
      </p>
      {stale && (
        <p className="editor-warning" role="alert">
          Revision conflict: reload before applying. Local controls remain
          visible.
        </p>
      )}
      {error && (
        <p className="editor-warning" role="alert">
          {error} Preview retains the acknowledged revision until controls are
          valid.
        </p>
      )}
      {overlaps && (
        <p className="editor-warning" role="status">
          Caption and picture bounds overlap. Captions render above pictures;
          placement is retained.
        </p>
      )}
      <div className="editor-layout">
        <div className="editor-preview">
          {previewUnavailable ? (
            <p role="alert">
              Preview is unavailable because the acknowledged composition has a
              missing or invalid asset. Reload a validated revision before
              exporting.
            </p>
          ) : (
            <Player
              ref={player}
              key={clip.id}
              component={Review}
              inputProps={{
                overlay,
                sourceUrl: `${endpoint}/source`,
                assets: Object.fromEntries(
                  clip.assets.map((asset) => [
                    asset.id,
                    `/api/local/workspace/${workspaceId}/assets/${asset.id}`,
                  ]),
                ),
                selection,
                onSelect: setSelection,
                onBox: setBox,
              }}
              durationInFrames={base.overlay.frames}
              compositionWidth={1080}
              compositionHeight={1920}
              fps={OWNER_FPS}
              controls
              style={{ width: "100%", maxWidth: 360 }}
            />
          )}
          <p>
            Drag a visible layer or its corner to resize. Arrow keys move the
            focused layer or resize its corner; Alt uses larger steps. Numeric
            fields give the same controls. Preview geometry is scaled from
            1080×1920.
          </p>
        </div>
        <div className="editor-panels">
          <fieldset disabled={pending}>
            <legend>Captions</legend>
            <button
              type="button"
              aria-pressed={selection === "captions"}
              onClick={() => setSelection("captions")}
            >
              Select caption layer
            </button>
            <div className="editor-fields">
              <label>
                Caption preset
                <select
                  value={caption.preset}
                  onChange={(event) =>
                    setCaption(
                      structuredClone(
                        OWNER_CAPTION_PRESETS[
                          event.currentTarget
                            .value as OwnerCaptionStyle["preset"]
                        ],
                      ),
                    )
                  }
                >
                  <option value="clean">Clean</option>
                  <option value="classic">Classic</option>
                  <option value="bold">Bold</option>
                </select>
              </label>
              <label>
                Caption font size (24–120 px)
                <input
                  type="number"
                  min="24"
                  max="120"
                  step="1"
                  value={
                    Number.isFinite(caption.fontSize) ? caption.fontSize : ""
                  }
                  onChange={(event) => {
                    const fontSize =
                      event.currentTarget.value === ""
                        ? NaN
                        : Number(event.currentTarget.value);
                    setCaption({ ...caption, fontSize });
                  }}
                />
              </label>
              <label>
                Caption font
                <select
                  value={caption.font ?? "Arial"}
                  onChange={(event) =>
                    setCaption({
                      ...caption,
                      font: event.currentTarget.value as NonNullable<
                        OwnerCaptionStyle["font"]
                      >,
                    })
                  }
                >
                  {OWNER_CAPTION_FONTS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Caption animation
                <select
                  value={caption.animation ?? "highlight"}
                  onChange={(event) =>
                    setCaption({
                      ...caption,
                      animation: event.currentTarget.value as NonNullable<
                        OwnerCaptionStyle["animation"]
                      >,
                    })
                  }
                >
                  {OWNER_CAPTION_ANIMATIONS.map((animation) => (
                    <option key={animation} value={animation}>
                      {
                        {
                          highlight: "Spoken-word highlight",
                          pop: "Word pop",
                          fade: "Line fade",
                          none: "Static",
                        }[animation]
                      }
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Caption text color
                <input
                  type="color"
                  value={caption.color}
                  onChange={(event) =>
                    setCaption({ ...caption, color: event.currentTarget.value })
                  }
                />
              </label>
              <label>
                Caption highlight color
                <input
                  type="color"
                  value={caption.highlight}
                  onChange={(event) =>
                    setCaption({
                      ...caption,
                      highlight: event.currentTarget.value,
                    })
                  }
                />
              </label>
              <label>
                Caption alignment
                <select
                  value={caption.align}
                  onChange={(event) =>
                    setCaption({
                      ...caption,
                      align: event.currentTarget
                        .value as OwnerCaptionStyle["align"],
                    })
                  }
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </label>
            </div>
            <BoxFields
              label="Caption"
              box={caption.box}
              onChange={(box) => setCaption({ ...caption, box })}
            />
            <button
              type="button"
              onClick={() => update({ ...draft, captions: null })}
            >
              Reset captions to automatic
            </button>
          </fieldset>
          <fieldset disabled={pending}>
            <legend>Video look</legend>
            <label>
              Filter
              <select
                value={draft.videoLook?.preset ?? "original"}
                onChange={(event) =>
                  update({
                    ...draft,
                    videoLook: {
                      preset: event.currentTarget
                        .value as OwnerVideoLook["preset"],
                      strength: draft.videoLook?.strength ?? 100,
                    },
                  })
                }
              >
                {OWNER_VIDEO_LOOKS.map((look) => (
                  <option key={look} value={look}>
                    {
                      {
                        original: "Original",
                        vivid: "Vivid",
                        warm: "Warm",
                        cool: "Cool",
                        mono: "Black and white",
                      }[look]
                    }
                  </option>
                ))}
              </select>
            </label>
            <label>
              Filter strength ({draft.videoLook?.strength ?? 100}%)
              <input
                aria-label="Filter strength"
                type="range"
                min="0"
                max="100"
                step="1"
                value={draft.videoLook?.strength ?? 100}
                disabled={
                  !draft.videoLook || draft.videoLook.preset === "original"
                }
                onChange={(event) =>
                  update({
                    ...draft,
                    videoLook: {
                      preset: draft.videoLook?.preset ?? "original",
                      strength: Number(event.currentTarget.value),
                    },
                  })
                }
              />
            </label>
            <p>
              Changes source video only. Pictures and captions keep their own
              colors. Apply, then export to save this look in a new MP4.
            </p>
            <button
              type="button"
              onClick={() => {
                const next = { ...draft };
                delete next.videoLook;
                update(next);
              }}
            >
              Reset video to original
            </button>
          </fieldset>
          <fieldset disabled={pending}>
            <legend>
              Pictures · {draft.visuals.length}/
              {CONTEXTUAL_PICTURE_POLICY.maxPictures} cues
            </legend>
            <label>
              Picture cue
              <select
                value={selectedCue?.id ?? ""}
                onChange={(event) => {
                  setSelection(event.currentTarget.value);
                  const cue = draft.visuals.find(
                    (item) => item.id === event.currentTarget.value,
                  );
                  if (cue) player.current?.seekTo(cue.startFrame);
                }}
              >
                <option value="">Choose a picture cue</option>
                {draft.visuals.map((cue, index) => (
                  <option key={cue.id} value={cue.id}>
                    Picture {index + 1}
                  </option>
                ))}
              </select>
            </label>
            {selectedCue && (
              <>
                <div className="editor-fields">
                  <label>
                    Picture asset
                    <select
                      value={selectedCue.assetId}
                      onChange={(event) =>
                        setCue({
                          ...selectedCue,
                          assetId: event.currentTarget.value,
                        })
                      }
                    >
                      {clip.assets.map((asset, index) => (
                        <option key={asset.id} value={asset.id}>
                          Asset {index + 1} · {asset.origin}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Picture fit
                    <select
                      value={selectedCue.fit}
                      onChange={(event) =>
                        setCue({
                          ...selectedCue,
                          fit: event.currentTarget
                            .value as OwnerVisualEdit["fit"],
                        })
                      }
                    >
                      <option value="contain">Contain entire picture</option>
                      <option value="cover">Crop to fill</option>
                    </select>
                  </label>
                  <label>
                    Start frame (clip relative)
                    <input
                      type="number"
                      min="0"
                      max={base.overlay.frames - 1}
                      step="1"
                      value={
                        Number.isFinite(selectedCue.startFrame)
                          ? selectedCue.startFrame
                          : ""
                      }
                      onChange={(event) =>
                        setCue({
                          ...selectedCue,
                          startFrame:
                            event.currentTarget.value === ""
                              ? NaN
                              : Number(event.currentTarget.value),
                        })
                      }
                    />
                  </label>
                  <label>
                    End frame (exclusive)
                    <input
                      type="number"
                      min="1"
                      max={base.overlay.frames}
                      step="1"
                      value={
                        Number.isFinite(selectedCue.endFrame)
                          ? selectedCue.endFrame
                          : ""
                      }
                      onChange={(event) =>
                        setCue({
                          ...selectedCue,
                          endFrame:
                            event.currentTarget.value === ""
                              ? NaN
                              : Number(event.currentTarget.value),
                        })
                      }
                    />
                  </label>
                </div>
                <p>
                  {(selectedCue.startFrame / OWNER_FPS).toFixed(3)}–
                  {(selectedCue.endFrame / OWNER_FPS).toFixed(3)} seconds ·{" "}
                  {OWNER_FPS} frames/second. Layer order follows the picture
                  list.
                </p>
                <BoxFields
                  label="Picture"
                  box={selectedCue.box}
                  onChange={(box) => setCue({ ...selectedCue, box })}
                />
                <button
                  type="button"
                  onClick={() => {
                    update({
                      ...draft,
                      visuals: draft.visuals.filter(
                        (cue) => cue.id !== selectedCue.id,
                      ),
                    });
                    setSelection("captions");
                  }}
                >
                  Remove selected picture cue
                </button>
              </>
            )}
            <nav>
              <button
                type="button"
                disabled={
                  !clip.assets.length ||
                  draft.visuals.length >= CONTEXTUAL_PICTURE_POLICY.maxPictures
                }
                onClick={() => {
                  const id = crypto.randomUUID();
                  update({
                    ...draft,
                    visuals: [
                      ...draft.visuals,
                      {
                        id,
                        assetId: clip.assets[0]!.id,
                        startFrame: 0,
                        endFrame: Math.min(base.overlay.frames, OWNER_FPS * 4),
                        box: { x: 0.1, y: 0.1, width: 0.8, height: 0.3 },
                        fit: "contain",
                      },
                    ],
                  });
                  setSelection(id);
                  player.current?.seekTo(0);
                }}
              >
                Add picture cue
              </button>
              <button
                type="button"
                onClick={() => {
                  update({ ...draft, visuals: automaticVisualEdits(clip) });
                  setSelection("captions");
                }}
              >
                Reset pictures to automatic
              </button>
            </nav>
            <label className="file">
              Add your JPEG or PNG
              <input
                type="file"
                accept="image/jpeg,image/png"
                disabled={
                  clip.assets.length >= OWNER_PICTURE_LIMITS.assetsPerClip
                }
                onChange={(event) => {
                  upload(event.currentTarget.files?.[0]);
                  event.currentTarget.value = "";
                }}
              />
            </label>
            <p>
              Use pictures you own or have permission to use. At most 4 MiB and
              16 million decoded pixels; local import strips metadata and
              normalizes to a bounded JPEG. Registered assets:{" "}
              {clip.assets.length}/{OWNER_PICTURE_LIMITS.assetsPerClip}. Owner
              pictures keep their own provenance.
            </p>
          </fieldset>
        </div>
      </div>
      <nav>
        <button
          type="button"
          disabled={!dirty || !!error || stale || pending}
          onClick={() => void perform("edit")}
        >
          Apply changes to clip
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => void perform("reload")}
        >
          Reload acknowledged revision (discard unapplied changes)
        </button>
      </nav>
      <p>
        Reading, seeking, changing controls and resetting use no provider calls.{" "}
        {clip.mode === "synthetic-ai"
          ? "This bundle uses simulated AI captions and pictures; real processing needs its provider adapters, keys, live flags and owner approval."
          : "This bundle retains its provider provenance. Manual editing and native export use no AI keys."}{" "}
        No offline AI model is supplied.
      </p>
    </section>
  );
}
