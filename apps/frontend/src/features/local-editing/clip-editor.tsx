import { Button } from "../../shared/ui/button";
import { ProcessingState } from "../../shared/ui/processing-state";
import { LoaderCircle, RotateCw, Upload } from "lucide-react";
import { WorkflowActions } from "./workflow-actions.tsx";
import { ControlTabs } from "./control-tabs.tsx";
import { FocusPreviewControls } from "./focus-preview-controls.tsx";
import { PictureTiming } from "./picture-timing.tsx";
import { CaptionTextEditor } from "./caption-text-editor.tsx";
import { TypographyFields } from "./typography-fields.tsx";
import { TextInspector } from "./text-inspector.tsx";
import { BoxFields, TextPositionFields } from "./position-fields.tsx";
import { OWNER_SOCIAL_TEXT_PRESETS } from "../../../../../packages/contracts/local/text-style.ts";
import {
  OWNER_TEXT_LIMITS,
  ownerLayerTextSchema,
  type OwnerTextLayer,
} from "../../../../../packages/contracts/local/text-layers.ts";
import { OWNER_CAPTION_GENERATION_ATTEMPTS } from "../../../../../packages/contracts/local/caption-generation.ts";
import {
  defaultOwnerFocus,
  ownerFocusAt,
  ownerFocusCrop,
  ownerFocusSchema,
} from "../../../../../packages/contracts/local/focus.ts";
import {
  useEffect,
  useCallback,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { Player, type PlayerRef } from "@remotion/player";
import {
  AbsoluteFill,
  Html5Video,
  useCurrentFrame,
  useCurrentScale,
} from "remotion";
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
  OWNER_CAPTION_ANIMATIONS,
  ownerEditDocumentSchema,
  ownerEditRequestSchema,
  type OwnerCaptionStyle,
  type OwnerEditDocument,
} from "../../../../../packages/contracts/local/editor.ts";
import {
  OWNER_PICTURE_LIMITS,
  OWNER_VISUAL_ANIMATIONS,
  type OwnerVisualEdit,
} from "../../../../../packages/contracts/local/assets.ts";
import { OWNER_FPS } from "../../../../../packages/contracts/local/index.ts";
import {
  captionForOwnerEdit,
  constrainOwnerBox,
  initialOwnerEdit,
  ownerEditOperations,
  ownerGestureBox,
  sameOwnerEdit,
  centeredOwnerBox,
  type OwnerTextGeometry,
  ownerCaptionPreset,
  type OwnerEditorBox,
} from "./editor-state.ts";

type LayerControls = {
  selection: string;
  onSelect: (id: string) => void;
  onBox: (id: string, box: OwnerEditorBox) => void;
  onGestureStart: () => void;
};

const SETTINGS = ["captions", "text", "filters", "pictures", "focus"] as const;
type EditorSetting = (typeof SETTINGS)[number];

function SelectionBox({
  id,
  label,
  box,
  selected,
  caption,
  onSelect,
  onBox,
  onGestureStart,
}: {
  id: string;
  label: string;
  box: OwnerEditorBox;
  selected: boolean;
  caption: OwnerTextGeometry | null;
} & Pick<LayerControls, "onSelect" | "onBox" | "onGestureStart">) {
  const scale = useCurrentScale();
  const handle = Math.max(84, 44 / scale);
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
    onGestureStart();
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
            width: handle,
            height: handle,
            fontSize: Math.max(56, 18 / scale),
            left: Math.max(
              0,
              Math.min(1080 - handle, (box.x + box.width) * 1080 - handle / 2),
            ),
            top: Math.max(
              0,
              Math.min(1920 - handle, (box.y + box.height) * 1920 - handle / 2),
            ),
          }}
          onPointerDown={(event) => start(event, true)}
          onKeyDown={(event) => key(event, true)}
          {...handlers}
        >
          <span
            aria-hidden="true"
            style={{
              display: "grid",
              placeItems: "center",
              width: 22 / scale,
              height: 22 / scale,
              fontSize: 14 / scale,
              borderRadius: 4 / scale,
              background: "#b7d3ff",
              color: "#07142f",
            }}
          >
            ↘
          </span>
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
  onGestureStart,
  onPlaybackError,
  onPreviewReady,
  interactive,
  setting,
}: {
  overlay: OwnerOverlay;
  assets: Record<string, string>;
  sourceUrl: string;
  onPlaybackError: () => void;
  onPreviewReady: () => void;
  interactive: boolean;
  setting: EditorSetting;
} & LayerControls) {
  const frame = useCurrentFrame();
  const caption = overlay.captionStyle ?? OWNER_CAPTION_PRESETS.clean;
  const crop = overlay.focus
    ? ownerFocusCrop(overlay.focus, ownerFocusAt(overlay.focus, frame))
    : null;
  return (
    <AbsoluteFill style={{ backgroundColor: "#101215" }}>
      <OwnerVideoLookLayer look={overlay.videoLook}>
        <Html5Video
          src={sourceUrl}
          style={
            crop
              ? {
                  position: "absolute",
                  width: (1080 * 1080) / crop.width,
                  height: (1920 * 1920) / crop.height,
                  maxWidth: "none",
                  left: (-crop.x * 1080) / crop.width,
                  top: (-crop.y * 1920) / crop.height,
                }
              : { width: "100%", height: "100%", objectFit: "contain" }
          }
          pauseWhenBuffering
          onLoadedData={onPreviewReady}
          onErrorCapture={(event) => {
            // Next treats Remotion's native-error console log as a page error too.
            event.stopPropagation();
            onPlaybackError();
          }}
          onError={onPlaybackError}
        />
      </OwnerVideoLookLayer>
      <OwnerAutomaticOverlay overlay={overlay} assets={assets} frame={frame} />
      <AbsoluteFill
        className="editor-interaction"
        style={{
          pointerEvents: "none",
          visibility: interactive ? "visible" : "hidden",
        }}
      >
        {setting === "pictures" &&
          overlay.visuals
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
                onGestureStart={onGestureStart}
              />
            ))}
        {setting === "text" &&
          (overlay.texts ?? [])
            .map((layer, index) => ({ layer, index }))
            .filter(
              ({ layer }) =>
                layer.startFrame <= frame && frame < layer.endFrame,
            )
            .map(({ layer, index }) => (
              <SelectionBox
                key={layer.id}
                id={layer.id}
                label={`text ${index + 1}`}
                box={layer.style.box}
                caption={layer.style}
                selected={selection === layer.id}
                onSelect={onSelect}
                onBox={onBox}
                onGestureStart={onGestureStart}
              />
            ))}
        {setting === "captions" && overlay.captions.length > 0 && (
          <SelectionBox
            id="captions"
            label="captions"
            box={caption.box}
            selected={selection === "captions"}
            caption={caption}
            onSelect={onSelect}
            onBox={onBox}
            onGestureStart={onGestureStart}
          />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function PreviewFailure({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="editor-preview-failure" role="alert">
      <p>Preview unavailable.</p>
      <Button
        variant="secondary"
        icon={RotateCw}
        aria-label="Retry preview"
        onClick={onRetry}
      >
        Retry
      </Button>
    </div>
  );
}

/** Local form state never starts AI or a render; only Apply writes a revision. */
export function ClipEditor({
  clip,
  workspaceId,
  source,
  onAccepted,
  onDirty,
  footerTarget,
  actionsVisible = true,
  captionGeneration = false,
  fakeCaptionGeneration = false,
  onBusy,
}: {
  clip: OwnerClip;
  workspaceId: string;
  source?: { width: number; height: number };
  onAccepted: (list: OwnerClipList) => void;
  onDirty: (clipId: string, dirty: boolean) => void;
  footerTarget?: HTMLElement | null | undefined;
  actionsVisible?: boolean;
  captionGeneration?: boolean;
  fakeCaptionGeneration?: boolean;
  onBusy?: (busy: boolean) => void;
}) {
  const [form, setForm] = useState(() => {
    const original = initialOwnerEdit(clip);
    return { original, draft: structuredClone(original) };
  });
  const [selection, setSelection] = useState("captions");
  const [setting, setSetting] = useState<EditorSetting>("captions");
  const [captionTab, setCaptionTab] = useState("style");
  const [textTab, setTextTab] = useState("content");
  const [pictureTab, setPictureTab] = useState("image");
  const tabsId = useId();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [forcedStale, setForcedStale] = useState(false);
  const [captionConfirm, setCaptionConfirm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const captionWasConfirming = useRef(false);
  const player = useRef<PlayerRef | null>(null);
  const alive = useRef(true);
  const [playbackFailed, setPlaybackFailed] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const previewReady = useCallback(() => {
    if (alive.current) setPreviewLoaded(true);
  }, []);
  const [previewAttempt, setPreviewAttempt] = useState(0);
  const [previewFrame, setPreviewFrame] = useState(0);
  const pictureInput = useRef<HTMLInputElement>(null);
  const request = useRef<AbortController | null>(null);
  const playbackError = useCallback(() => {
    if (!alive.current) return;
    setPreviewFrame(player.current?.getCurrentFrame() ?? 0);
    player.current?.pause();
    setPlaybackFailed(true);
  }, []);
  function retryPreview() {
    const frame = player.current?.getCurrentFrame();
    if (frame !== undefined) setPreviewFrame(frame);
    player.current?.pause();
    setPreviewAttempt((value) => value + 1);
    setPlaybackFailed(false);
  }
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
    error = draft.texts?.some(
      (layer) => !ownerLayerTextSchema.safeParse(layer.text).success,
    )
      ? "Use 1–500 plain-text characters and up to 10 lines per text layer."
      : draft.texts?.some(
            (layer) =>
              !Number.isInteger(layer.startFrame) ||
              !Number.isInteger(layer.endFrame) ||
              layer.startFrame < 0 ||
              layer.endFrame <= layer.startFrame ||
              layer.endFrame > base.overlay.frames,
          )
        ? "Set each text layer’s end after its start, within this clip."
        : draft.captionText?.some((word) => !word.text.trim())
          ? "Enter text for each caption word."
          : draft.captionText?.length
            ? "Keep each caption under 80 characters and use plain text."
            : draft.focus && !ownerFocusSchema.safeParse(draft.focus).success
              ? "Set camera changes inside this clip, with zoom from 1 to 3."
              : draft.visuals.some(
                    (cue) =>
                      !Number.isFinite(cue.startFrame) ||
                      !Number.isFinite(cue.endFrame) ||
                      cue.startFrame < 0 ||
                      cue.endFrame <= cue.startFrame ||
                      cue.endFrame > base.overlay.frames,
                  )
                ? "Set each picture’s end after its start, within this clip."
                : draft.captions &&
                    (!Number.isInteger(draft.captions.fontSize) ||
                      draft.captions.fontSize < 24 ||
                      draft.captions.fontSize > 120)
                  ? "Use a font size from 24 to 120."
                  : "Keep layers inside the preview and check their size.";
    try {
      overlay = compileOwnerOverlay(base, original, clip.assets);
    } catch {
      previewUnavailable = true;
    }
  }
  const caption = captionForOwnerEdit(draft, base.overlay.captionStyle);
  const selectedCue = draft.visuals.find((cue) => cue.id === selection);
  const endpoint = `/api/local/workspace/${workspaceId}/clips/${clip.id}`;
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      request.current?.abort();
    };
  }, []);
  useEffect(() => {
    onDirty(clip.id, dirty || captionConfirm || generating);
    return () => onDirty(clip.id, false);
  }, [clip.id, dirty, captionConfirm, generating, onDirty]);
  useEffect(() => {
    if (captionConfirm) {
      const target = footerTarget ?? document.querySelector(".clip-editor");
      target
        ?.querySelector<HTMLButtonElement>(
          '[aria-label="Caption generation actions"] button',
        )
        ?.focus();
    } else if (captionWasConfirming.current) {
      if (base.overlay.captions.length)
        document.getElementById(`${tabsId}-caption-text`)?.focus();
      else
        document
          .querySelector<HTMLButtonElement>(".caption-empty-actions button")
          ?.focus();
    }
    captionWasConfirming.current = captionConfirm;
  }, [captionConfirm, footerTarget, base.overlay.captions.length, tabsId]);
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
    else if (draft.texts?.some((layer) => layer.id === id))
      update({
        ...draft,
        texts: draft.texts.map((layer) =>
          layer.id === id
            ? { ...layer, style: { ...layer.style, box } }
            : layer,
        ),
      });
    else {
      const cue = draft.visuals.find((item) => item.id === id);
      if (cue) setCue({ ...cue, box });
    }
  }
  function selectLayer(id: string) {
    setSelection(id);
    setSetting(
      id === "captions"
        ? "captions"
        : draft.texts?.some((layer) => layer.id === id)
          ? "text"
          : "pictures",
    );
  }
  function selectSetting(value: EditorSetting) {
    if (pending) return;
    setCaptionConfirm(false);
    setSetting(value);
    if (value === "captions") setSelection("captions");
    if (
      value === "text" &&
      !draft.texts?.some((layer) => layer.id === selection) &&
      draft.texts?.[0]
    )
      chooseText(draft.texts[0]);
  }
  function chooseText(layer: OwnerTextLayer) {
    setSelection(layer.id);
    player.current?.pause();
    if (
      Number.isInteger(layer.startFrame) &&
      layer.startFrame >= 0 &&
      layer.startFrame < base.overlay.frames
    )
      player.current?.seekTo(layer.startFrame);
  }
  function addText() {
    if (pending || (draft.texts?.length ?? 0) >= OWNER_TEXT_LIMITS.layers)
      return;
    const startFrame = Math.max(
      0,
      Math.min(player.current?.getCurrentFrame() ?? 0, base.overlay.frames - 1),
    );
    const layer: OwnerTextLayer = {
      id: crypto.randomUUID(),
      text: "Your text",
      startFrame,
      endFrame: Math.min(base.overlay.frames, startFrame + 4 * OWNER_FPS),
      style: {
        ...OWNER_SOCIAL_TEXT_PRESETS.tiktok,
        box: { x: 0.1, y: 0.1, width: 0.8, height: 0.2 },
      },
    };
    update({ ...draft, texts: [...(draft.texts ?? []), layer] });
    setTextTab("content");
    chooseText(layer);
  }
  function newPicture(assetId: string): OwnerVisualEdit {
    const startFrame = Math.min(
      player.current?.getCurrentFrame() ?? 0,
      base.overlay.frames - 1,
    );
    return {
      id: crypto.randomUUID(),
      assetId,
      startFrame,
      endFrame: Math.min(base.overlay.frames, startFrame + 4 * OWNER_FPS),
      box: { x: 0.1, y: 0.1, width: 0.8, height: 0.3 },
      fit: "contain",
      entrance: "fade",
      exit: "fade",
      animationFrames: 9,
    };
  }
  function choosePicture(cue: OwnerVisualEdit) {
    setSelection(cue.id);
    player.current?.pause();
    player.current?.seekTo(
      cue.startFrame +
        Math.min(
          cue.animationFrames ?? 9,
          Math.floor((cue.endFrame - cue.startFrame - 1) / 2),
        ),
    );
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
      } else {
        const assetId = value.pictureAssetId;
        if (
          !assetId ||
          !acknowledged.assets.some((asset) => asset.id === assetId)
        )
          throw new Error("unacknowledged");
        const cue = newPicture(assetId);
        update({ ...draft, visuals: [...draft.visuals, cue] });
        choosePicture(cue);
        setPictureTab("image");
      }
      setMessage("");
    } catch (failure) {
      if (alive.current && !controller.signal.aborted)
        setMessage(
          failure instanceof Error && failure.message === "stale"
            ? "This clip changed elsewhere. Reload it to continue."
            : kind === "picture"
              ? "Couldn’t add this image. Use a static JPEG, PNG or WebP under 4 MB."
              : "Couldn’t save these changes. Try again.",
        );
    } finally {
      request.current = null;
      if (alive.current) setPending(false);
    }
  }
  function upload(file: File | undefined) {
    if (!file || draft.visuals.length >= OWNER_PICTURE_LIMITS.cuesPerClip)
      return;
    if (file.size > OWNER_PICTURE_LIMITS.inputBytes || file.size === 0) {
      setMessage("Choose a JPEG, PNG or WebP under 4 MB.");
      return;
    }
    void perform("picture", file);
  }
  async function generateCaptions(fake = false) {
    if (
      request.current ||
      dirty ||
      stale ||
      (fake
        ? !fakeCaptionGeneration
        : !captionConfirm ||
          !captionGeneration ||
          (clip.captionAttempts ?? 0) >= OWNER_CAPTION_GENERATION_ATTEMPTS)
    )
      return;
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setGenerating(true);
    onBusy?.(true);
    setMessage("");
    player.current?.pause();
    try {
      const response = await fetch(
        `${endpoint}/${fake ? "fake-captions" : "captions"}`,
        {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operationId: crypto.randomUUID(),
            expectedRevision: clip.revision,
            ...(!fake ? { paidConsent: true } : {}),
          }),
        },
      );
      if (!response.ok) throw new Error("caption_generation_failed");
      const list = ownerClipListSchema.parse(await response.json()),
        accepted = list.clips.find((item) => item.id === clip.id);
      if (!accepted?.base || !alive.current) return;
      onAccepted(list);
      const edit = initialOwnerEdit(accepted);
      setForm({ original: edit, draft: structuredClone(edit) });
      setCaptionConfirm(false);
      setCaptionTab("text");
      if (!accepted.base.overlay.captions.length)
        setMessage("No speech found in this clip.");
    } catch {
      if (alive.current && !controller.signal.aborted)
        setMessage(
          fake
            ? "Couldn’t add fake captions. Try again."
            : "Couldn’t generate captions. Check Gemini setup and try again explicitly.",
        );
    } finally {
      request.current = null;
      if (alive.current) {
        setPending(false);
        setGenerating(false);
        onBusy?.(false);
      }
    }
  }
  const previewLoading =
    !previewLoaded && !playbackFailed && !previewUnavailable;
  return (
    <section className="clip-editor" aria-label="Clip editor">
      <p className="flow-notice" role="status" aria-live="polite">
        {!stale && message}
      </p>
      {stale && (
        <p className="editor-warning" role="alert">
          This clip changed elsewhere. Reload it to continue.
        </p>
      )}
      {error && (
        <p className="editor-warning" role="alert">
          {error}
        </p>
      )}
      {previewLoading && (
        <ProcessingState className="clip-preparing" label="Loading preview" />
      )}
      <div
        className="editor-layout"
        data-loading={previewLoading || undefined}
        aria-hidden={previewLoading || undefined}
        inert={previewLoading}
      >
        <div className="editor-preview">
          {previewUnavailable ? (
            <p role="alert">Preview unavailable. Reload this clip.</p>
          ) : playbackFailed ? (
            <PreviewFailure onRetry={retryPreview} />
          ) : (
            <Player
              ref={player}
              key={`${clip.id}-${previewAttempt}`}
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
                onSelect: selectLayer,
                onBox: setBox,
                onGestureStart: () => player.current?.pause(),
                onPlaybackError: playbackError,
                onPreviewReady: previewReady,
                interactive: previewLoaded,
                setting,
              }}
              durationInFrames={base.overlay.frames}
              compositionWidth={1080}
              compositionHeight={1920}
              fps={OWNER_FPS}
              initialFrame={Math.min(previewFrame, base.overlay.frames - 1)}
              errorFallback={() => <PreviewFailure onRetry={retryPreview} />}
              controls
              clickToPlay={false}
              doubleClickToFullscreen={false}
              spaceKeyToPlayOrPause={false}
              style={{ width: "100%", maxWidth: 360 }}
            />
          )}
        </div>
        <div className="editor-panels" hidden={!previewLoaded}>
          <div
            className="editor-tabs"
            role="tablist"
            aria-label="Clip settings"
          >
            {SETTINGS.map((value, index) => (
              <button
                key={value}
                id={`${tabsId}-${value}`}
                type="button"
                role="tab"
                disabled={pending}
                aria-selected={setting === value}
                aria-controls={`${tabsId}-${value}-panel`}
                tabIndex={setting === value ? 0 : -1}
                onClick={() => {
                  selectSetting(value);
                }}
                onKeyDown={(event) => {
                  if (
                    !["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                      event.key,
                    )
                  )
                    return;
                  event.preventDefault();
                  const next =
                    SETTINGS[
                      event.key === "Home"
                        ? 0
                        : event.key === "End"
                          ? SETTINGS.length - 1
                          : (index +
                              (event.key === "ArrowRight" ? 1 : -1) +
                              SETTINGS.length) %
                            SETTINGS.length
                    ]!;
                  selectSetting(next);
                  document.getElementById(`${tabsId}-${next}`)?.focus();
                }}
              >
                {
                  {
                    captions: "Captions",
                    text: "Text",
                    filters: "Filters",
                    pictures: "Pictures",
                    focus: "Focus",
                  }[value]
                }
              </button>
            ))}
          </div>
          <div
            id={`${tabsId}-text-panel`}
            role="tabpanel"
            aria-labelledby={`${tabsId}-text`}
            hidden={setting !== "text"}
            tabIndex={0}
          >
            {setting === "text" && (
              <fieldset disabled={pending}>
                <legend className="local-sr-only">Text</legend>
                <TextInspector
                  id={`${tabsId}-text-controls`}
                  layers={draft.texts ?? []}
                  selected={selection}
                  onSelect={chooseText}
                  onAdd={addText}
                  onChange={(texts) => update({ ...draft, texts })}
                  frames={base.overlay.frames}
                  player={player}
                  available={!playbackFailed && previewLoaded && !pending}
                  attempt={previewAttempt}
                  tab={textTab}
                  onTab={setTextTab}
                />
              </fieldset>
            )}
          </div>
          <div
            id={`${tabsId}-focus-panel`}
            role="tabpanel"
            aria-labelledby={`${tabsId}-focus`}
            hidden={setting !== "focus"}
            tabIndex={0}
          >
            {setting === "focus" && (
              <FocusPreviewControls
                attempt={previewAttempt}
                player={player}
                available={!playbackFailed && previewLoaded}
                focus={
                  draft.focus ??
                  defaultOwnerFocus(
                    source ?? { width: 1080, height: 1920 },
                    base.overlay.frames,
                  )
                }
                automatic={base.overlay.focus}
                sourceUrl={`${endpoint}/source`}
                disabled={pending}
                onChange={(focus) => {
                  const next = { ...draft };
                  if (focus) next.focus = focus;
                  else delete next.focus;
                  update(next);
                }}
              />
            )}
          </div>
          <div
            id={`${tabsId}-captions-panel`}
            role="tabpanel"
            aria-labelledby={`${tabsId}-captions`}
            hidden={setting !== "captions"}
            tabIndex={0}
          >
            {!base.overlay.captions.length ? (
              <div className="caption-empty">
                <h4>No captions yet</h4>
                {generating ? (
                  <ProcessingState label="Generating captions" />
                ) : captionConfirm ? (
                  <p>
                    Send this clip’s audio to Gemini to generate captions? This
                    uses Gemini credits, including in fake mode.
                  </p>
                ) : (
                  <>
                    <div className="caption-empty-actions">
                      <Button
                        variant="secondary"
                        disabled={
                          pending ||
                          dirty ||
                          stale ||
                          !captionGeneration ||
                          (clip.captionAttempts ?? 0) >=
                            OWNER_CAPTION_GENERATION_ATTEMPTS
                        }
                        onClick={() => {
                          setCaptionConfirm(true);
                          setMessage("");
                        }}
                      >
                        Generate captions
                      </Button>
                      {fakeCaptionGeneration && (
                        <Button
                          variant="quiet"
                          disabled={pending || dirty || stale}
                          onClick={() => void generateCaptions(true)}
                        >
                          Generate fake captions
                        </Button>
                      )}
                    </div>
                    {!captionGeneration && (
                      <p>Gemini setup is required to generate captions.</p>
                    )}
                    {(clip.captionAttempts ?? 0) >=
                      OWNER_CAPTION_GENERATION_ATTEMPTS && (
                      <p>Caption generation limit reached for this clip.</p>
                    )}
                    {dirty && <p>Apply or discard your changes first.</p>}
                  </>
                )}
              </div>
            ) : (
              <>
                <fieldset disabled={pending}>
                  <legend className="local-sr-only">Captions</legend>
                  <ControlTabs
                    id={`${tabsId}-caption`}
                    label="Caption controls"
                    items={[
                      { value: "style", label: "Style" },
                      { value: "position", label: "Position" },
                      { value: "text", label: "Text" },
                    ]}
                    value={captionTab}
                    onChange={setCaptionTab}
                  />
                  <div
                    role="tabpanel"
                    id={`${tabsId}-caption-style-panel`}
                    aria-labelledby={`${tabsId}-caption-style`}
                    hidden={captionTab !== "style"}
                    tabIndex={0}
                  >
                    <TypographyFields
                      value={caption}
                      onChange={(style) => setCaption({ ...caption, ...style })}
                      onPreset={(preset) =>
                        setCaption(ownerCaptionPreset(caption, preset))
                      }
                    />
                    <div className="editor-fields">
                      <label>
                        Animation
                        <select
                          className="select-control"
                          value={caption.animation ?? "highlight"}
                          onChange={(event) =>
                            setCaption({
                              ...caption,
                              animation: event.currentTarget
                                .value as NonNullable<
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
                                  slide: "Sliding highlight",
                                  bounce: "Word bounce",
                                  reveal: "Typewriter reveal",
                                  "single-word": "Word by word",
                                  fade: "Line fade",
                                  none: "Static",
                                }[animation]
                              }
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Highlight
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
                    </div>
                  </div>
                  <div
                    role="tabpanel"
                    id={`${tabsId}-caption-position-panel`}
                    aria-labelledby={`${tabsId}-caption-position`}
                    hidden={captionTab !== "position"}
                    tabIndex={0}
                  >
                    <TextPositionFields
                      label="Caption"
                      style={caption}
                      onChange={(box, centered) =>
                        setCaption({
                          ...caption,
                          ...(centered
                            ? { align: "center", verticalAlign: "center" }
                            : {}),
                          box,
                        })
                      }
                    />
                  </div>
                  <Button
                    variant="secondary"
                    type="button"
                    hidden={captionTab === "text"}
                    onClick={() => update({ ...draft, captions: null })}
                  >
                    Reset captions
                  </Button>
                  <div
                    role="tabpanel"
                    id={`${tabsId}-caption-text-panel`}
                    aria-labelledby={`${tabsId}-caption-text`}
                    hidden={captionTab !== "text"}
                    tabIndex={0}
                  >
                    {captionTab === "text" && (
                      <CaptionTextEditor
                        captions={base.overlay.captions}
                        edits={draft.captionText}
                        player={player}
                        available={
                          setting === "captions" &&
                          previewLoaded &&
                          !playbackFailed &&
                          !pending
                        }

                        frames={base.overlay.frames}
                        onChange={(captionText) =>
                          update({ ...draft, captionText })
                        }
                      />
                    )}
                  </div>
                </fieldset>
              </>
            )}
          </div>
          <div
            id={`${tabsId}-filters-panel`}
            role="tabpanel"
            aria-labelledby={`${tabsId}-filters`}
            hidden={setting !== "filters"}
            tabIndex={0}
          >
            <fieldset disabled={pending}>
              <legend className="local-sr-only">Filters</legend>
              <label>
                Filter
                <select
                  className="select-control"
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
                Strength ({draft.videoLook?.strength ?? 100}%)
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
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  const next = { ...draft };
                  delete next.videoLook;
                  update(next);
                }}
              >
                Reset filter
              </Button>
            </fieldset>
          </div>
          <div
            id={`${tabsId}-pictures-panel`}
            role="tabpanel"
            aria-labelledby={`${tabsId}-pictures`}
            hidden={setting !== "pictures"}
            tabIndex={0}
          >
            <fieldset disabled={pending}>
              <legend className="local-sr-only">Pictures</legend>
              <div
                className="picture-picker"
                role="group"
                aria-label="Pictures"
              >
                {draft.visuals.map((cue, index) => (
                  <Button
                    key={cue.id}
                    variant="secondary"
                    className="picture-choice"
                    aria-label={`Edit picture ${index + 1}`}
                    aria-pressed={selection === cue.id}
                    onClick={() => choosePicture(cue)}
                  >
                    <span
                      className="picture-thumb"
                      aria-hidden="true"
                      style={{
                        backgroundImage: `url(/api/local/workspace/${workspaceId}/assets/${cue.assetId})`,
                      }}
                    />
                    <span>Picture {index + 1}</span>
                  </Button>
                ))}
              </div>
              <div className="picture-tools">
                <Button
                  variant="secondary"
                  disabled={
                    pending ||
                    clip.assets.length >= OWNER_PICTURE_LIMITS.assetsPerClip ||
                    draft.visuals.length >= OWNER_PICTURE_LIMITS.cuesPerClip
                  }
                  onClick={() => pictureInput.current?.click()}
                >
                  {pending ? (
                    <LoaderCircle
                      size={18}
                      className="acquisition-spinner"
                      aria-hidden="true"
                    />
                  ) : (
                    <Upload size={18} aria-hidden="true" />
                  )}
                  {pending ? "Uploading…" : "Upload image"}
                </Button>
                <Button
                  variant="quiet"
                  disabled={
                    !clip.assets.length ||
                    draft.visuals.length >= OWNER_PICTURE_LIMITS.cuesPerClip
                  }
                  onClick={() => {
                    const cue = newPicture(
                      selectedCue?.assetId ?? clip.assets[0]!.id,
                    );
                    update({ ...draft, visuals: [...draft.visuals, cue] });
                    choosePicture(cue);
                  }}
                >
                  Add picture
                </Button>
              </div>
              <input
                ref={pictureInput}
                className="local-file-input"
                aria-label="Upload picture"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={
                  pending ||
                  clip.assets.length >= OWNER_PICTURE_LIMITS.assetsPerClip ||
                  draft.visuals.length >= OWNER_PICTURE_LIMITS.cuesPerClip
                }
                onChange={(event) => {
                  upload(event.currentTarget.files?.[0]);
                  event.currentTarget.value = "";
                }}
              />
              <p className="source-hint">JPEG, PNG, WebP · Max 4 MB</p>
              {selectedCue && (
                <>
                  <ControlTabs
                    id={`${tabsId}-picture`}
                    label="Picture controls"
                    items={[
                      { value: "image", label: "Image" },
                      { value: "timing", label: "Timing" },
                      { value: "motion", label: "Motion" },
                      { value: "position", label: "Position" },
                    ]}
                    value={pictureTab}
                    onChange={setPictureTab}
                  />
                  <div
                    role="tabpanel"
                    id={`${tabsId}-picture-image-panel`}
                    aria-labelledby={`${tabsId}-picture-image`}
                    hidden={pictureTab !== "image"}
                    tabIndex={0}
                  >
                    <div className="editor-fields">
                      <label>
                        Image
                        <select
                          className="select-control"
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
                              Image {index + 1}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Fit
                        <select
                          className="select-control"
                          value={selectedCue.fit}
                          onChange={(event) =>
                            setCue({
                              ...selectedCue,
                              fit: event.currentTarget
                                .value as OwnerVisualEdit["fit"],
                            })
                          }
                        >
                          <option value="contain">Fit</option>
                          <option value="cover">Fill</option>
                        </select>
                      </label>
                    </div>
                    <Button
                      variant="quiet"
                      onClick={() => {
                        update({
                          ...draft,
                          visuals: draft.visuals.filter(
                            (cue) => cue.id !== selectedCue.id,
                          ),
                        });
                        setSelection(
                          draft.visuals.find((cue) => cue.id !== selectedCue.id)
                            ?.id ?? "captions",
                        );
                      }}
                    >
                      Remove picture
                    </Button>
                  </div>
                  <div
                    role="tabpanel"
                    id={`${tabsId}-picture-timing-panel`}
                    aria-labelledby={`${tabsId}-picture-timing`}
                    hidden={pictureTab !== "timing"}
                    tabIndex={0}
                  >
                    <PictureTiming
                      key={selectedCue.id}
                      cue={selectedCue}
                      frames={base.overlay.frames}
                      player={player}
                      available={
                        setting === "pictures" &&
                        pictureTab === "timing" &&
                        previewLoaded &&
                        !playbackFailed &&
                        !pending
                      }
                      attempt={previewAttempt}
                      onChange={setCue}
                    />
                  </div>
                  <div
                    role="tabpanel"
                    id={`${tabsId}-picture-motion-panel`}
                    aria-labelledby={`${tabsId}-picture-motion`}
                    hidden={pictureTab !== "motion"}
                    tabIndex={0}
                  >
                    <div className="editor-fields">
                      {(["entrance", "exit"] as const).map((key) => (
                        <label key={key}>
                          {key === "entrance" ? "Entrance" : "Exit"}
                          <select
                            className="select-control"
                            value={selectedCue[key] ?? "none"}
                            onChange={(event) =>
                              setCue({
                                ...selectedCue,
                                [key]: event.currentTarget.value as NonNullable<
                                  OwnerVisualEdit[typeof key]
                                >,
                              })
                            }
                          >
                            {OWNER_VISUAL_ANIMATIONS.map((animation) => (
                              <option key={animation} value={animation}>
                                {
                                  {
                                    none: "None",
                                    fade: "Fade",
                                    pop: "Pop",
                                    slide: "Slide",
                                  }[animation]
                                }
                              </option>
                            ))}
                          </select>
                        </label>
                      ))}
                      <label>
                        Duration (s)
                        <input
                          type="number"
                          min="0.1"
                          max="1"
                          step="0.1"
                          value={
                            Number.isFinite(selectedCue.animationFrames ?? 9)
                              ? Number(
                                  (
                                    (selectedCue.animationFrames ?? 9) /
                                    OWNER_FPS
                                  ).toFixed(2),
                                )
                              : ""
                          }
                          onChange={(event) =>
                            setCue({
                              ...selectedCue,
                              animationFrames:
                                event.currentTarget.value === ""
                                  ? NaN
                                  : Math.round(
                                      Number(event.currentTarget.value) *
                                        OWNER_FPS,
                                    ),
                            })
                          }
                        />
                      </label>
                    </div>
                    <Button
                      variant="secondary"
                      disabled={!!error || playbackFailed}
                      onClick={() => {
                        player.current?.seekTo(selectedCue.startFrame);
                        player.current?.play();
                      }}
                    >
                      Preview motion
                    </Button>
                  </div>
                  <div
                    role="tabpanel"
                    id={`${tabsId}-picture-position-panel`}
                    aria-labelledby={`${tabsId}-picture-position`}
                    hidden={pictureTab !== "position"}
                    tabIndex={0}
                  >
                    <div
                      className="position-presets"
                      role="group"
                      aria-label="Picture position"
                    >
                      {(
                        [
                          { center: 0.25, label: "Upper half" },
                          { center: 0.5, label: "Center" },
                          { center: 0.75, label: "Lower half" },
                        ] as const
                      ).map((item) => (
                        <Button
                          key={item.center}
                          variant="secondary"
                          aria-pressed={
                            Math.abs(
                              selectedCue.box.x +
                                selectedCue.box.width / 2 -
                                0.5,
                            ) < 0.00001 &&
                            Math.abs(
                              selectedCue.box.y +
                                selectedCue.box.height / 2 -
                                item.center,
                            ) < 0.00001
                          }
                          onClick={() =>
                            setCue({
                              ...selectedCue,
                              box: centeredOwnerBox(
                                selectedCue.box,
                                item.center,
                                null,
                              ),
                            })
                          }
                        >
                          {item.label}
                        </Button>
                      ))}
                    </div>
                    <BoxFields
                      label="Picture"
                      box={selectedCue.box}
                      onChange={(box) => setCue({ ...selectedCue, box })}
                    />
                  </div>
                </>
              )}
            </fieldset>
          </div>
          {actionsVisible && captionConfirm && (
            <WorkflowActions
              target={footerTarget}
              label="Caption generation actions"
            >
              <Button
                variant="primary"
                disabled={
                  pending ||
                  generating ||
                  (clip.captionAttempts ?? 0) >=
                    OWNER_CAPTION_GENERATION_ATTEMPTS
                }
                onClick={() => void generateCaptions()}
              >
                {generating ? "Generating…" : "Generate captions"}
              </Button>
              <Button
                variant="quiet"
                disabled={pending || generating}
                onClick={() => setCaptionConfirm(false)}
              >
                Cancel
              </Button>
            </WorkflowActions>
          )}
          {actionsVisible &&
            !captionConfirm &&
            (dirty || stale || previewUnavailable) && (
              <WorkflowActions target={footerTarget} label="Edit actions">
                <Button
                  variant="primary"
                  type="button"
                  disabled={!dirty || !!error || stale || pending}
                  onClick={() => void perform("edit")}
                >
                  {pending ? (
                    <>
                      <LoaderCircle
                        size={18}
                        className="acquisition-spinner"
                        aria-hidden="true"
                      />
                      Working…
                    </>
                  ) : (
                    "Apply changes"
                  )}
                </Button>
                <Button
                  variant="quiet"
                  type="button"
                  disabled={
                    pending || (!dirty && !stale && !previewUnavailable)
                  }
                  onClick={() => void perform("reload")}
                >
                  {(previewUnavailable && !dirty) || stale
                    ? "Reload clip"
                    : "Discard changes"}
                </Button>
              </WorkflowActions>
            )}
        </div>
      </div>
    </section>
  );
}
