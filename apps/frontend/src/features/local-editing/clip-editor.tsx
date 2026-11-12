import { ActivityIndicator } from "../../shared/ui/activity-indicator";
import { EditorColorControl } from "./editor-color-control";
import {
  EditorInspectorLayout,
  EditorInspector,
} from "./editor-inspector-layout";
import { pictureLinkedAudio } from "./picture-audio.ts";
import "./style.css";
import "./editor-workspace.css";
import "./editor-controls.css";
import { WorkspaceEditHistory } from "./edit-history";
import { useEditorAutosave } from "./use-editor-autosave";
import { EditorSaveTools } from "./editor-save-tools";
import { EditorSaveConflict } from "./editor-save-conflict";
import { EditorOverview } from "./editor-overview";
import {
  CompactEditorPlayback,
  useCompactEditorPlayback,
} from "./compact-editor-playback";
import type { EditorCameraRequest } from "./editor-camera-request";
import {
  editorPreviewForm,
  type EditorFormDraft,
} from "./editor-preview-form.ts";
import { EditorTimeline, PictureTimelineAudio } from "./editor-timeline.tsx";
import { MediaTimelineThumbnail } from "./media-timeline-thumbnail.tsx";
import { placeOwnerFitOriginalVisual } from "../../../../../packages/contracts/local/visual-placement.ts";
import {
  editorTimelineItems,
  editorTimelineVisual,
  type EditorTimelineItem,
  type EditorTimelineKind,
} from "./editor-timeline.ts";
import {
  ownerCameraEffectsSchema,
  ownerCameraEffectsFit,
} from "../../../../../packages/contracts/local/camera-motion.ts";
import { readOwnerClips } from "./collection-pages.ts";
import { Button } from "../../shared/ui/button";
import { ProcessingState } from "../../shared/ui/processing-state";
import { RotateCw, Sparkles, Upload } from "lucide-react";
import { WorkflowActions } from "./workflow-actions.tsx";
import { ControlPanel, ControlTabs } from "./control-tabs.tsx";
import { EDITOR_SECTIONS, type EditorSetting } from "./editor-sections";
import { EditorTour } from "./editor-tour";
import { isLocalClipEditable } from "./clip-readiness";
import { InlineFeedback } from "../../shared/ui/inline-feedback";
import { ZodError } from "zod";
import { textLayerErrors, captionWordError } from "./text-validation.ts";
import { FocusPreviewControls } from "./focus-preview-controls.tsx";
import { EditorLifecycleTrace } from "../diagnostics/editor-lifecycle";
import { MediaCameraControls } from "./media-camera-controls.tsx";
import {
  mediaCameraInspectionOverlay,
  type MediaCameraInspection,
} from "./media-camera-inspection.ts";
import { CameraPreviewVideo } from "./camera-preview-video.tsx";
import { PictureTiming } from "./picture-timing.tsx";
import { PictureImageDialog } from "./picture-image-dialog";
import {
  ownerCameraTracksFit,
  ownerCameraTracksSchema,
} from "../../../../../packages/contracts/local/camera-follow.ts";
import { CaptionTextEditor } from "./caption-text-editor.tsx";
import { CaptionSpeakers } from "./caption-speakers.tsx";
import { localCodexError, LocalCodexError } from "./codex-errors.ts";
import {
  completeOwnerHookDraft,
  type OwnerHookDraft,
} from "./hook-range-draft.ts";
import { HookControls } from "./hook-controls.tsx";
import { HookTitleProgress } from "./hook-title-progress.tsx";
import {
  HookTitleRequests,
  hookTitleKey,
  hookTitleFingerprint,
  acceptHookTitle,
  type HookTitleState,
} from "./hook-title-request.ts";
import { OWNER_HOOK_TITLE_LIMIT } from "../../../../../packages/contracts/local/hook-title.ts";
import {
  changeManualOwnerHook,
  acceptSuggestedOwnerHook,
  chooseOwnerHookSound,
  removeOwnerHookSound,
  OWNER_MANAGED_HOOK_MAX_FRAMES,
  type OwnerHookSoundId,
} from "./hook-edit.ts";
import { OWNER_HOOK_SOUNDS } from "../../../../../packages/contracts/local/hook-sounds.ts";
import { AudioInspector } from "./audio-inspector.tsx";
import { YoutubeAudioIntake } from "./youtube-audio-intake.tsx";
import { ownerYoutubeAudioImportSchema } from "../../../../../packages/contracts/local/youtube-audio.ts";
import { OwnerAudioPreview } from "./audio-preview.tsx";
import {
  OWNER_AUDIO_LIMITS,
  resolveOwnerAudioCues,
  type OwnerAudioCue,
} from "../../../../../packages/contracts/local/audio.ts";
import {
  copyOwnerHookContent,
  ownerContentEdits,
  ownerOccurrenceOverlay,
  ownerOccurrencePresentationFrame,
  withIndependentOwnerHook,
  type OwnerEditOccurrence,
} from "../../../../../packages/contracts/local/hook-content.ts";
import {
  EditorOccurrence,
  EditorHookClock,
  EditorPresentationClock,
} from "./editor-clock.ts";
import {
  ownerSourceFrame,
  ownerPresentationFrames,
  ownerHookFrames,
  ownerHookSchema,
  decodeOwnerHookSuggestion,
} from "../../../../../packages/contracts/local/hook.ts";
import { TypographyFields } from "./typography-fields.tsx";
import { CaptionPresetPicker } from "./typography-preset-picker";
import { TextInspector } from "./text-inspector.tsx";
import {
  TextSelectionContext,
  TextSelectionScope,
  PreviewTextEditor,
  boundedTextSelection,
  type TextSelection,
} from "./text-selection.tsx";
import { BoxFields, TextPositionFields } from "./position-fields.tsx";
import { PositionPresets } from "./position-presets";
import {
  OWNER_SOCIAL_TEXT_PRESETS,
  OWNER_FONT_SIZE,
} from "../../../../../packages/contracts/local/text-style.ts";
import {
  OWNER_TEXT_LIMITS,
  ownerLayerTextSchema,
  ownerTextFrame,
  boundOwnerOpeningTitles,
  type OwnerTextLayer,
} from "../../../../../packages/contracts/local/text-layers.ts";
import { OWNER_CAPTION_GENERATION_ATTEMPTS } from "../../../../../packages/contracts/local/caption-generation.ts";
import {
  defaultOwnerFocus,
  ownerFocusSchema,
} from "../../../../../packages/contracts/local/focus.ts";
import {
  useEffect,
  useLayoutEffect,
  useContext,
  useEffectEvent,
  useCallback,
  useMemo,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { Player, type PlayerRef } from "@remotion/player";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useCurrentScale,
  useVideoConfig,
} from "remotion";
import { OwnerAutomaticOverlay } from "../../../../../packages/composition/local/automatic-overlay.tsx";
import { usePreviewImages, previewOverlayImage } from "./preview-images.tsx";
import { BrollVideo } from "./broll-video.tsx";
import { VisualLayers } from "./visual-layer-order";
import {
  VisualPresentation,
  VideoSourceControls,
} from "./visual-media-controls.tsx";
import {
  OWNER_VIDEO_LIMITS,
  ownerVideoOverlapFits,
} from "../../../../../packages/contracts/local/video-assets.ts";
import { OwnerVideoLookLayer } from "../../../../../packages/composition/local/video-look.tsx";
import {
  ownerVideoLookAt,
  ownerVideoLookRangeSchema,
  ownerVideoLooksSchema,
  ownerVideoLooksFit,
  replaceOwnerVideoLookRange,
  type OwnerVideoLookRange,
} from "../../../../../packages/contracts/local/video-look.ts";
import { FilterInspector } from "./filter-inspector.tsx";
import { filterRangeKey } from "./filter-ranges.ts";
import { compileOwnerOverlay } from "../../../../../packages/composition/local/edit-overlay.ts";
import {
  OWNER_BATCH_POLICY,
  type OwnerClip,
  type OwnerClipList,
  type OwnerOverlay,
} from "../../../../../packages/contracts/local/clips.ts";
import {
  OWNER_CAPTION_PRESETS,
  OWNER_CAPTION_DEFAULT_CENTER_Y,
  OWNER_CAPTION_ANIMATIONS,
  OWNER_GLASS_OPACITY,
  ownerEditDocumentSchema,
  type OwnerCaptionStyle,
  type OwnerEditDocument,
} from "../../../../../packages/contracts/local/editor.ts";
import {
  OWNER_PICTURE_LIMITS,
  OWNER_VISUAL_DEFAULT_MOTION,
  type OwnerVisualEdit,
} from "../../../../../packages/contracts/local/assets.ts";
import { OWNER_FPS } from "../../../../../packages/contracts/local/index.ts";
import {
  captionForOwnerEdit,
  constrainOwnerBox,
  initialOwnerEdit,
  ownerGestureBox,
  sameOwnerEdit,
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

function visualMotionPath(path: readonly PropertyKey[]) {
  return path.some((part) =>
    [
      "effect",
      "tracking",
      "entrance",
      "exit",
      "animationFrames",
      "enterFrames",
      "exitFrames",
    ].includes(String(part)),
  );
}

function SelectionBox({
  id,
  label,
  box,
  selected,
  caption,
  onSelect,
  onBox,
  onGestureStart,
  onEdit,
  readOnly = false,
}: {
  id: string;
  label: string;
  box: OwnerEditorBox;
  selected: boolean;
  caption: OwnerTextGeometry | null;
  onEdit?: (() => void) | undefined;
  readOnly?: boolean;
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
  const geometry = {
    left: box.x * 1080,
    top: box.y * 1920,
    width: box.width * 1080,
    height: box.height * 1920,
  };
  if (readOnly)
    return (
      <div
        className="editor-layer selected"
        role="img"
        aria-label={`Selected camera target: ${label}`}
        style={{ ...geometry, pointerEvents: "none" }}
      >
        <span
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            padding: `${2 / scale}px ${5 / scale}px`,
            font: `600 ${12 / scale}px Arial, sans-serif`,
            color: "#fff",
            background: "#07142f",
            textTransform: "capitalize",
          }}
        >
          {label}
        </span>
      </div>
    );
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
        style={geometry}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(id);
        }}
        onPointerDown={(event) => start(event, false)}
        onDoubleClick={onEdit}
        onKeyDown={(event) => {
          if (event.key === "Enter" && onEdit) {
            event.preventDefault();
            onEdit();
          } else key(event, false);
        }}
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

export function Review({
  overlay: playbackOverlay,
  workspaceId,
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
  silent = false,
  editingOccurrence,
  cameraInspection,
}: {
  overlay: OwnerOverlay;
  workspaceId: string;
  assets: Record<string, string>;
  sourceUrl: string;
  onPlaybackError: () => void;
  onPreviewReady: () => void;
  interactive: boolean;
  setting: EditorSetting;
  silent?: boolean;
  editingOccurrence?: OwnerEditOccurrence | undefined;
  cameraInspection?: MediaCameraInspection | null | undefined;
} & LayerControls) {
  const preparedImages = usePreviewImages(
    playbackOverlay,
    assets,
    onPlaybackError,
  );
  const presentationFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frame = ownerSourceFrame(playbackOverlay, presentationFrame);
  const overlay = ownerOccurrenceOverlay(
    playbackOverlay,
    playbackOverlay.hook && presentationFrame < ownerHookFrames(playbackOverlay)
      ? "hook"
      : "body",
  );
  const caption = overlay.captionStyle ?? OWNER_CAPTION_PRESETS.clean;
  const textSession = useContext(TextSelectionContext);
  const editingText =
    setting === "text" && textSession?.selection?.editing
      ? textSession.layer
      : null;
  const paintedOverlay = editingText
    ? {
        ...playbackOverlay,
        texts: playbackOverlay.texts?.filter(
          (layer) => layer.id !== editingText.id,
        ),
        ...(playbackOverlay.hookContent
          ? {
              hookContent: {
                ...playbackOverlay.hookContent,
                texts: playbackOverlay.hookContent.texts?.filter(
                  (layer) => layer.id !== editingText.id,
                ),
              },
            }
          : {}),
      }
    : playbackOverlay;
  return (
    <AbsoluteFill style={{ backgroundColor: "#101215" }}>
      <>
        {[
          ...(overlay.hook
            ? [
                {
                  kind: "hook" as const,
                  from: 0,
                  duration: ownerHookFrames(overlay),
                  start: overlay.hook.startFrame,
                  end: overlay.hook.endFrame,
                },
              ]
            : []),
          {
            kind: "body" as const,
            from: ownerHookFrames(overlay),
            duration: overlay.frames,
            start: 0,
            end: overlay.frames,
          },
        ].map((part) => {
          const content = ownerOccurrenceOverlay(playbackOverlay, part.kind);
          return (
            <Sequence
              key={part.kind}
              from={part.from}
              durationInFrames={part.duration}
              premountFor={fps}
            >
              <OwnerVideoLookLayer look={ownerVideoLookAt(content, frame)}>
                <CameraPreviewVideo
                  kind={part.kind}
                  active={
                    part.kind ===
                    (overlay.hook &&
                    presentationFrame < ownerHookFrames(overlay)
                      ? "hook"
                      : "body")
                  }
                  sourceUrl={sourceUrl}
                  volume={
                    silent ? 0 : (content.audio?.originalVolume ?? 100) / 100
                  }
                  start={part.start}
                  end={part.end}
                  focus={content.focus}
                  effects={content.cameraEffects}
                  tracks={content.cameraTracks}
                  onPreviewReady={onPreviewReady}
                  onPlaybackError={onPlaybackError}
                />
              </OwnerVideoLookLayer>
            </Sequence>
          );
        })}
      </>
      {!silent && (
        <OwnerAudioPreview
          overlay={playbackOverlay}
          workspaceId={workspaceId}
          onError={onPlaybackError}
        />
      )}
      <OwnerAutomaticOverlay
        overlay={mediaCameraInspectionOverlay(
          paintedOverlay,
          cameraInspection,
          presentationFrame,
        )}
        assets={preparedImages}
        frame={presentationFrame}
        renderImage={previewOverlayImage}
        onImageError={onPlaybackError}
        renderVideo={(props, cue, at) => (
          <BrollVideo
            workspaceId={workspaceId}
            cue={cue}
            frame={at}
            props={props}
            onError={onPlaybackError}
          />
        )}
      />
      <AbsoluteFill
        className="editor-interaction"
        style={{
          pointerEvents: "none",
          visibility:
            interactive &&
            (!editingOccurrence ||
              editingOccurrence ===
                (playbackOverlay.hook &&
                presentationFrame < ownerHookFrames(playbackOverlay)
                  ? "hook"
                  : "body"))
              ? "visible"
              : "hidden",
        }}
      >
        {(setting === "pictures" || setting === "focus") &&
          overlay.visuals
            .filter(
              (cue) =>
                cue.startFrame <= frame &&
                cue.endFrame > frame &&
                (setting !== "focus" || cue.id === selection),
            )
            .sort(
              (left, right) =>
                Number(left.id === selection) - Number(right.id === selection),
            )
            .map((cue) => (
              <SelectionBox
                key={`${setting}:${cue.id}`}
                id={cue.id}
                label={`${cue.video ? "video" : "picture"} ${overlay.visuals.findIndex((item) => item.id === cue.id) + 1}`}
                box={
                  cue.presentation === "full-frame"
                    ? { x: 0, y: 0, width: 1, height: 1 }
                    : cue.box
                }
                selected={selection === cue.id}
                readOnly={setting === "focus"}
                caption={null}
                onSelect={onSelect}
                onBox={onBox}
                onGestureStart={onGestureStart}
              />
            ))}
        {setting === "text" &&
          (overlay.texts ?? [])
            .map((layer, index) => ({ layer, index }))
            .filter(({ layer }) => {
              const at = ownerTextFrame(
                layer,
                playbackOverlay.hookContent &&
                  !(
                    playbackOverlay.hook &&
                    presentationFrame < ownerHookFrames(playbackOverlay)
                  )
                  ? presentationFrame - ownerHookFrames(playbackOverlay)
                  : presentationFrame,
                frame,
              );
              return layer.startFrame <= at && at < layer.endFrame;
            })
            .filter(({ layer }) => layer.id !== editingText?.id)
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
                onEdit={() => textSession?.begin(layer)}
              />
            ))}
        {editingText && (
          <PreviewTextEditor key={editingText.id} layer={editingText} />
        )}
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

/** Hook choices may request a title; autosave writes only valid edit values. */
export function ClipEditor({
  clip,
  workspaceId,
  source,
  onAccepted,
  onDirty,
  actionTarget,
  actionsVisible = true,
  captionGeneration = false,
  visualDiscovery = false,
  hookTitleSuggestions = false,
  captionProvider = "gemini",
  fakeCaptionGeneration = false,
  youtubeAudio = false,
  onBusy,
  onPending,
  onPreviewReady,
  history: providedHistory,
}: {
  clip: OwnerClip;
  workspaceId: string;
  source?: { width: number; height: number };
  onAccepted: (list: OwnerClipList) => void;
  onDirty: (clipId: string, dirty: boolean) => void;
  actionTarget?: HTMLElement | null | undefined;
  actionsVisible?: boolean;
  captionGeneration?: boolean;
  visualDiscovery?: boolean;
  hookTitleSuggestions?: boolean;
  captionProvider?: "gemini" | "local-speech" | undefined;
  fakeCaptionGeneration?: boolean;
  youtubeAudio?: boolean;
  onBusy?: (busy: boolean) => void;
  onPending?: (pending: boolean) => void;
  onPreviewReady?: (() => void) | undefined;
  history?: WorkspaceEditHistory;
}) {
  const [form, storeForm] = useState(() => {
    const original = initialOwnerEdit(clip);
    return editorPreviewForm(
      null,
      { original, draft: structuredClone(original) },
      clip,
    );
  });
  const currentForm = useRef(form);
  const [localHistory] = useState(() => new WorkspaceEditHistory());
  const history = providedHistory ?? localHistory;
  const editGroup = useRef<string | undefined>(undefined);
  const gestureGroup = useRef<string | undefined>(undefined);
  const inputGroups = useRef(new WeakMap<HTMLElement, string>());
  const [gestureActive, setGestureActive] = useState(false);
  const [hookDraft, storeHookDraft] = useState<OwnerHookDraft | undefined>(
    undefined,
  );
  const currentHookDraft = useRef(hookDraft);
  const diagnostics = useMemo(() => new EditorLifecycleTrace(), []);
  function setForm(
    action: EditorFormDraft | ((current: EditorFormDraft) => EditorFormDraft),
    record = true,
  ) {
    const current = currentForm.current;
    const next = typeof action === "function" ? action(current) : action;
    if (record)
      history.record(
        clip.id,
        { draft: current.draft, hookDraft: currentHookDraft.current },
        { draft: next.draft, hookDraft: currentHookDraft.current },
        editGroup.current,
      );
    const value = editorPreviewForm(current, next, clip);
    currentForm.current = value;
    storeForm(value);
  }
  const [occurrence, setOccurrence] = useState<OwnerEditOccurrence>(
    clip.edit?.hook ? "hook" : "body",
  );
  function setHookDraft(next: OwnerHookDraft | undefined, record = true) {
    if (record)
      history.record(
        clip.id,
        {
          draft: currentForm.current.draft,
          hookDraft: currentHookDraft.current,
        },
        { draft: currentForm.current.draft, hookDraft: next },
        editGroup.current,
      );
    currentHookDraft.current = next;
    storeHookDraft(next);
  }
  const [hookTitleState, setHookTitleState] = useState<HookTitleState | null>(
    null,
  );
  const [hookTitles] = useState(() => new HookTitleRequests(setHookTitleState));
  const [generateHookTitle, setGenerateHookTitle] = useState(false);
  const [preferHookAudio, setPreferHookAudio] = useState(false);
  useEffect(
    () => () => hookTitles.cancel(),
    [hookTitles, clip.revision, workspaceId],
  );
  const [selection, setSelection] = useState("captions");
  const [inspectorRequest, setInspectorRequest] = useState(0);
  function revealInspector() {
    setInspectorRequest((request) => request + 1);
  }
  const [timelineSelection, setTimelineSelection] = useState<
    EditorTimelineItem | undefined
  >();
  const [cameraRequest, setCameraRequest] = useState<EditorCameraRequest>();
  const [audioPicture, setAudioPicture] = useState<string | undefined>();
  const [setting, setSetting] = useState<EditorSetting>("home");
  const [mediaTab, setMediaTab] = useState("pictures");
  const [captionTab, setCaptionTab] = useState("style");
  const [textTab, setTextTab] = useState("content");
  const [textRange, setTextRange] = useState<TextSelection | null>(null);
  const [pictureTabChoice, setPictureTab] = useState("image");
  const pictureTab = ["timing", "position"].includes(pictureTabChoice)
    ? pictureTabChoice
    : "image";
  const tabsId = useId();
  const [message, setMessage] = useState("");
  const [messageArea, setMessageArea] = useState<
    EditorSetting | "audio" | "action"
  >("action");
  const [messageOccurrence, setMessageOccurrence] =
    useState<OwnerEditOccurrence>("body");
  const [requestPending, setPending] = useState(false);
  const [trackingBusy, setTrackingBusy] = useState(false);
  const [trackingMode, setTrackingMode] = useState(false);
  const pending = requestPending || trackingBusy;
  const [audioUploading, setAudioUploading] = useState(false);
  const [audioImport, setAudioImport] = useState<string | null>(null);
  const [importedAudioCue, setImportedAudioCue] = useState<
    string | undefined
  >();
  const [forcedStale, setForcedStale] = useState(false);
  const [reviewSaveConflict, setReviewSaveConflict] = useState(false);
  const [captionConfirm, setCaptionConfirm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [findingVisuals, setFindingVisuals] = useState(false);
  const captionWasConfirming = useRef(false);
  const player = useRef<PlayerRef | null>(null);
  const [cameraInspection, setCameraInspection] = useState<
    (MediaCameraInspection & { original: OwnerEditDocument }) | null
  >(null);
  const alive = useRef(true);
  const [playbackFailed, setPlaybackFailed] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const reportPreviewReady = useEffectEvent(() => {
    diagnostics.ready();
    onPreviewReady?.();
  });
  useEffect(() => {
    if (previewLoaded) reportPreviewReady();
  }, [previewLoaded]);
  const previewReady = useCallback(() => {
    if (alive.current) setPreviewLoaded(true);
  }, []);
  const [previewAttempt, setPreviewAttempt] = useState(0);
  const compactPlayback = useCompactEditorPlayback(player, previewLoaded);
  useEffect(() => {
    const current = player.current;
    if (!previewLoaded || !current) return;
    const clear = () => setCameraInspection(null);
    current.addEventListener("play", clear);
    return () => current.removeEventListener("play", clear);
  }, [previewLoaded, previewAttempt]);
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
    setCameraInspection(null);
    const frame = player.current?.getCurrentFrame();
    if (frame !== undefined) setPreviewFrame(frame);
    player.current?.pause();
    setPreviewAttempt((value) => value + 1);
    setPlaybackFailed(false);
  }
  const changed =
    hookDraft !== undefined || !sameOwnerEdit(form.original, form.draft);
  const revisionChanged = form.original.revision !== clip.revision;
  const original =
    revisionChanged && !changed ? initialOwnerEdit(clip) : form.original;
  const masterDraft = revisionChanged && !changed ? original : form.draft;
  const acceptCleanRevision = useEffectEvent(() => {
    if (!revisionChanged || changed) return;
    const current = currentForm.current;
    if (
      current.original.revision !== form.original.revision ||
      currentHookDraft.current !== undefined ||
      !sameOwnerEdit(current.original, current.draft)
    )
      return;
    const accepted = initialOwnerEdit(clip);
    history.reconcile(
      clip.id,
      current.original,
      accepted,
      clip.base?.overlay.captionStyle ?? OWNER_CAPTION_PRESETS.clean,
    );
    setCameraInspection((value) =>
      value ? { ...value, original: accepted } : null,
    );
    setForm({ original: accepted, draft: structuredClone(accepted) }, false);
  });
  useLayoutEffect(() => {
    acceptCleanRevision();
  }, [clip.revision, revisionChanged, changed]);
  const currentTitle =
    !hookDraft &&
    masterDraft.hook &&
    hookTitleState?.key === hookTitleKey(clip.revision, masterDraft.hook)
      ? hookTitleState
      : null;
  const titleLoading = currentTitle?.phase === "loading";
  const offeredTitle = currentTitle?.result;
  const titleNeedsAccept =
    !!offeredTitle?.title &&
    !masterDraft.hookContent?.edits.texts?.some(
      (layer) => layer.id === offeredTitle.title!.id,
    );
  const titleCanRetry =
    currentTitle?.phase === "failed" &&
    (clip.hookTitleAttempts ?? 0) < OWNER_HOOK_TITLE_LIMIT;
  const activeOccurrence = masterDraft.hook ? occurrence : "body";
  function ownMessage(area: EditorSetting | "audio" | "action") {
    setMessageArea(area);
    setMessageOccurrence(activeOccurrence);
  }
  function messageFor(area: EditorSetting | "audio" | "action") {
    return messageArea === area &&
      (area === "action" || messageOccurrence === activeOccurrence)
      ? message
      : undefined;
  }
  const hookContent =
    masterDraft.hookContent ??
    (masterDraft.hook &&
    ownerHookSchema.safeParse(masterDraft.hook).success &&
    masterDraft.hook.endFrame <= clip.base!.overlay.frames
      ? copyOwnerHookContent(
          clip.base!,
          masterDraft,
          clip.assets,
          clip.audioAssets ?? [],
          masterDraft.hook,
          undefined,
          clip.videoAssets,
        )
      : undefined);
  const draft =
    activeOccurrence === "hook" && hookContent
      ? { ...masterDraft, ...hookContent.edits }
      : {
          ...masterDraft,
          cameraEffects: masterDraft.cameraEffects?.filter(
            (effect) => effect.occurrence === "body",
          ),
          cameraTracks: masterDraft.cameraTracks?.filter(
            (track) => track.occurrence === "body",
          ),
        };
  const managedHookAudio =
    hookContent?.edits.audio?.cues.some((cue) => cue.suggestedHook) ?? false;
  const addHookAudio = masterDraft.hook ? managedHookAudio : preferHookAudio;
  const titleUnavailable = !hookTitleSuggestions
    ? "AI titles unavailable."
    : (clip.hookTitleAttempts ?? 0) >= OWNER_HOOK_TITLE_LIMIT
      ? "Title limit reached for this clip."
      : undefined;
  const hookMaxFrames = managedHookAudio
    ? OWNER_MANAGED_HOOK_MAX_FRAMES
    : 10 * OWNER_FPS;
  const dirty =
    hookDraft !== undefined || !sameOwnerEdit(original, masterDraft);
  const stale = forcedStale || (revisionChanged && changed);
  const rootBase = clip.base!;
  const base =
    activeOccurrence === "hook" && hookContent
      ? {
          ...rootBase,
          words: hookContent.words,
          overlay: {
            ...rootBase.overlay,
            captions: hookContent.captions,
          },
        }
      : rootBase;
  const textIssues = [
    {
      occurrence: "body" as const,
      layers: masterDraft.texts ?? [],
      frames: rootBase.overlay.frames,
    },
    {
      occurrence: "hook" as const,
      layers: masterDraft.hookContent?.edits.texts ?? [],
      frames: masterDraft.hook
        ? masterDraft.hook.endFrame - masterDraft.hook.startFrame
        : rootBase.overlay.frames,
    },
  ].flatMap(({ occurrence, layers, frames }) =>
    layers.flatMap((layer) => {
      const issues = textLayerErrors(
        layer,
        layer.role === "opening-title" ? frames : rootBase.overlay.frames,
      );
      return Object.values(issues).some(Boolean)
        ? [{ layer, occurrence, issues }]
        : [];
    }),
  );
  let error: string | null = null;
  let errorSection: EditorSetting = setting;
  let errorField: PropertyKey | undefined;
  let errorPath: readonly PropertyKey[] = [];
  let errorOccurrence: OwnerEditOccurrence = activeOccurrence;
  let previewUnavailable = false;
  let playbackOverlay: OwnerOverlay = rootBase.overlay;
  try {
    ownerEditDocumentSchema.parse(masterDraft);
    playbackOverlay = compileOwnerOverlay(
      rootBase,
      masterDraft,
      clip.assets,
      clip.audioAssets,
      clip.videoAssets,
    );
  } catch (failure) {
    if (failure instanceof ZodError) {
      const path = failure.issues[0]?.path ?? [];
      const field =
        path[0] === "hookContent"
          ? path[1] === "edits"
            ? path[2]
            : "hook"
          : path[0];
      errorField = field;
      errorPath = path[0] === "hookContent" ? path.slice(2) : path;
      errorOccurrence = path[0] === "hookContent" ? "hook" : "body";
      const owners: Record<string, EditorSetting> = {
        texts: "text",
        hook: "hook",
        captions: "captions",
        captionText: "captions",
        captionSpeakers: "captions",
        videoLook: "filters",
        videoLooks: "filters",
        focus: "focus",
        cameraEffects: "focus",
        cameraTracks: "focus",
        visuals: "pictures",
        audio: "pictures",
      };
      if (typeof field === "string")
        errorSection =
          field === "visuals" && visualMotionPath(errorPath)
            ? "focus"
            : (owners[field] ?? setting);
    }
    error = !ownerVideoOverlapFits(draft.visuals)
      ? "Only two videos can play together. Adjust their intervals or remove a video."
      : draft.visuals.some(
            (cue) =>
              cue.video &&
              !(clip.videoAssets ?? []).some(
                (asset) =>
                  asset.id === cue.assetId &&
                  cue.video!.offsetFrame >= 0 &&
                  cue.video!.offsetFrame + cue.endFrame - cue.startFrame <=
                    (cue.video!.sourceEndFrame ?? asset.frames) &&
                  (cue.video!.sourceEndFrame ?? asset.frames) <= asset.frames,
              ),
          )
        ? "Keep the video source excerpt inside the uploaded asset."
        : draft.visuals.some(
              (cue) =>
                cue.effect &&
                (cue.effect.startFrame < cue.startFrame ||
                  cue.effect.endFrame > cue.endFrame),
            )
          ? "Keep Zoom / Pan inside the visual’s display interval."
          : errorPath.includes("tracking")
            ? "Face tracking no longer matches this video interval or source trim. Remove it or track again."
            : errorPath.includes("effect")
              ? "Use zoom 1–3, focal positions 0–100%, and a valid effect interval."
              : errorField === "visuals" && visualMotionPath(errorPath)
                ? "Use a valid transition and a duration greater than zero, up to 1 second."
                : draft.videoLooks &&
                    (!ownerVideoLooksSchema.safeParse(draft.videoLooks)
                      .success ||
                      !ownerVideoLooksFit(draft.videoLooks, {
                        startFrame:
                          activeOccurrence === "hook"
                            ? masterDraft.hook!.startFrame
                            : 0,
                        endFrame:
                          activeOccurrence === "hook"
                            ? masterDraft.hook!.endFrame
                            : base.overlay.frames,
                      }))
                  ? "Set each filter’s end after its start, inside this occurrence, with up to 32 separate ranges."
                  : draft.hook &&
                      (!ownerHookSchema.safeParse(draft.hook).success ||
                        draft.hook.endFrame > base.overlay.frames)
                    ? "Choose a hook inside this clip, from one frame up to 10 seconds."
                    : draft.texts?.some(
                          (layer) =>
                            !ownerLayerTextSchema.safeParse(layer.text).success,
                        )
                      ? "Use 1–500 plain-text characters and up to 10 lines per text layer."
                      : draft.texts?.some(
                            (layer) =>
                              !Number.isInteger(layer.startFrame) ||
                              !Number.isInteger(layer.endFrame) ||
                              layer.startFrame < 0 ||
                              layer.endFrame <= layer.startFrame ||
                              layer.endFrame >
                                (layer.role === "opening-title"
                                  ? ownerPresentationFrames({
                                      frames: base.overlay.frames,
                                      hook: draft.hook ?? undefined,
                                    })
                                  : base.overlay.frames),
                          )
                        ? "Set each text layer’s end after its start, within this clip."
                        : draft.captionText?.some((word) => !word.text.trim())
                          ? "Enter text for each caption word."
                          : errorField === "captionText"
                            ? "Keep each caption under 80 characters and use plain text."
                            : draft.cameraEffects &&
                                (!ownerCameraEffectsSchema.safeParse(
                                  draft.cameraEffects,
                                ).success ||
                                  !ownerCameraEffectsFit(draft.cameraEffects, {
                                    frames: base.overlay.frames,
                                    hook: draft.hook,
                                    cameraTracks: draft.cameraTracks,
                                  }))
                              ? "Keep zooms separate from other effects and within this clip."
                              : draft.cameraTracks &&
                                  (!ownerCameraTracksSchema.safeParse(
                                    draft.cameraTracks,
                                  ).success ||
                                    !ownerCameraTracksFit(
                                      draft.cameraTracks,
                                      draft.focus ?? base.overlay.focus,
                                      {
                                        frames: base.overlay.frames,
                                        hook: draft.hook,
                                      },
                                    ))
                                ? "Keep motion within this camera and occurrence; leave it separate from Zoom."
                                : draft.focus &&
                                    !ownerFocusSchema.safeParse(draft.focus)
                                      .success
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
                                        (!Number.isInteger(
                                          draft.captions.fontSize,
                                        ) ||
                                          draft.captions.fontSize < 24 ||
                                          draft.captions.fontSize >
                                            OWNER_FONT_SIZE.max)
                                      ? `Use a font size from ${OWNER_FONT_SIZE.min} to ${OWNER_FONT_SIZE.max}.`
                                      : "Keep layers inside the preview and check their size.";
    try {
      playbackOverlay =
        form.original === original && form.preview
          ? form.preview
          : compileOwnerOverlay(
              rootBase,
              original,
              clip.assets,
              clip.audioAssets,
              clip.videoAssets,
            );
    } catch {
      previewUnavailable = true;
    }
  }
  const overlay = ownerOccurrenceOverlay(playbackOverlay, activeOccurrence);
  const caption = captionForOwnerEdit(draft, base.overlay.captionStyle);
  const selectedCue = draft.visuals.find((cue) => cue.id === selection);
  const endpoint = `/api/local/workspace/${workspaceId}/clips/${clip.id}`;
  const autosave = useEditorAutosave({
    workspaceId,
    clip,
    original,
    draft: masterDraft,
    dirty,
    stale,
    blocked:
      !!error ||
      !!hookDraft ||
      pending ||
      titleLoading ||
      trackingMode ||
      captionConfirm ||
      generating ||
      findingVisuals ||
      audioUploading ||
      gestureActive ||
      !previewLoaded,
    onAcknowledged: (accepted, merged, kind, historyBase) => {
      history.reconcile(
        clip.id,
        historyBase,
        accepted,
        rootBase.overlay.captionStyle ?? OWNER_CAPTION_PRESETS.clean,
      );
      if (kind === "save") diagnostics.action("apply");
      setForcedStale(false);
      setCameraInspection((current) =>
        current ? { ...current, original: accepted } : null,
      );
      setForm({ original: accepted, draft: merged }, false);
    },
    onAccepted,
  });
  const historyAvailable = history.availability(clip.id, masterDraft);
  function moveHistory(direction: "undo" | "redo") {
    if (pending || trackingMode || titleLoading) return;
    const restored = history.move(
      clip.id,
      { draft: masterDraft, hookDraft },
      direction,
    );
    if (!restored) return;
    setHookDraft(restored.hookDraft, false);
    setCameraInspection(null);
    setTextRange(null);
    setForm({ original, draft: restored.draft }, false);
  }
  const historyShortcut = useEffectEvent((event: globalThis.KeyboardEvent) => {
    if (
      !actionsVisible ||
      !previewLoaded ||
      pending ||
      trackingMode ||
      titleLoading ||
      !(event.ctrlKey || event.metaKey) ||
      event.altKey
    )
      return;
    if (
      event.target instanceof HTMLElement &&
      event.target.closest("input, textarea, [contenteditable=true]")
    )
      return;
    const key = event.key.toLowerCase();
    const direction =
      key === "y" || (key === "z" && event.shiftKey)
        ? "redo"
        : key === "z"
          ? "undo"
          : null;
    if (!direction || !historyAvailable[direction]) return;
    event.preventDefault();
    moveHistory(direction);
  });
  useEffect(() => {
    const key = (event: globalThis.KeyboardEvent) => historyShortcut(event);
    const release = () => {
      gestureGroup.current = undefined;
      setGestureActive(false);
    };
    document.addEventListener("keydown", key);
    window.addEventListener("pointerup", release);
    window.addEventListener("blur", release);
    return () => {
      document.removeEventListener("keydown", key);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("blur", release);
    };
  }, []);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      request.current?.abort();
    };
  }, []);
  const reportPending = useEffectEvent((value: boolean) => {
    diagnostics.activity();
    onPending?.(value);
  });
  const reportBusy = useEffectEvent((value: boolean) => {
    diagnostics.activity();
    onBusy?.(value);
  });
  const reportDirty = useEffectEvent((value: boolean) => {
    diagnostics.activity();
    onDirty(clip.id, value);
  });
  const editorDirty =
    dirty ||
    autosave.phase === "saving" ||
    autosave.phase === "syncing" ||
    autosave.phase === "failed" ||
    autosave.phase === "conflict" ||
    trackingMode ||
    captionConfirm ||
    generating ||
    (audioUploading && audioImport === null);
  // Observe committed state only; the trace never schedules a React update.
  useEffect(() => {
    diagnostics.commit({
      section: setting,
      occurrence: activeOccurrence,
      revision: clip.revision,
      dirty: editorDirty,
      pending: pending || titleLoading,
      previewReady: previewLoaded,
      hasHook: !!masterDraft.hook,
    });
  });
  useEffect(() => () => diagnostics.close(), [diagnostics]);
  useEffect(() => {
    reportPending(
      pending ||
        titleLoading ||
        autosave.phase === "saving" ||
        autosave.phase === "syncing",
    );
  }, [pending, titleLoading, autosave.phase]);
  useEffect(() => {
    if (trackingBusy) reportBusy(true);
    return () => {
      if (trackingBusy) reportBusy(false);
    };
  }, [trackingBusy]);
  useEffect(() => {
    reportDirty(editorDirty);
  }, [editorDirty]);
  useEffect(
    () => () => {
      reportPending(false);
      reportDirty(false);
    },
    [],
  );
  useEffect(() => {
    if (captionConfirm) {
      const target = actionTarget ?? document.querySelector(".clip-editor");
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
  }, [captionConfirm, actionTarget, base.overlay.captions.length, tabsId]);
  useEffect(() => {
    if (!editorDirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [editorDirty]);

  function update(next: OwnerEditDocument, global = false) {
    diagnostics.action("edit");
    if (next.cameraTracks?.length) {
      const hookChanged =
        JSON.stringify(next.hook) !== JSON.stringify(draft.hook);
      const valid = next.cameraTracks.filter(
        (track) =>
          !(hookChanged && track.occurrence === "hook") &&
          ownerCameraTracksFit([track], next.focus ?? base.overlay.focus, {
            frames: base.overlay.frames,
            hook: next.hook,
          }),
      );
      if (valid.length !== next.cameraTracks.length) {
        ownMessage("focus");
        next = { ...next, cameraTracks: valid };
        setMessage(
          "Motion was cleared for changed camera positions or Hook timing.",
        );
      }
    }
    if (
      JSON.stringify(next.hook) !== JSON.stringify(draft.hook) &&
      next.cameraEffects?.some((effect) => effect.occurrence === "hook")
    ) {
      next = {
        ...next,
        cameraEffects: next.cameraEffects.filter(
          (effect) => effect.occurrence === "body",
        ),
      };
      ownMessage("focus");
      setMessage("Hook zooms were removed because the Hook changed.");
    }
    if (
      next.texts &&
      JSON.stringify(next.hook) !== JSON.stringify(draft.hook) &&
      (!next.hook || ownerHookSchema.safeParse(next.hook).success)
    )
      next = {
        ...next,
        texts: boundOwnerOpeningTitles(
          next.texts,
          ownerPresentationFrames({
            frames: base.overlay.frames,
            hook: next.hook,
          }),
        ),
      };
    if (next.audio)
      next = {
        ...next,
        audio: {
          ...next.audio,
          cues: resolveOwnerAudioCues(
            next.audio.cues,
            next.visuals,
            base.overlay.frames,
          ),
        },
      };
    if (!global) {
      const separated =
        masterDraft.hook && !masterDraft.hookContent
          ? withIndependentOwnerHook(
              rootBase,
              masterDraft,
              clip.assets,
              clip.audioAssets ?? [],
              masterDraft.hook,
              clip.videoAssets,
            )
          : masterDraft;
      next =
        activeOccurrence === "hook" && separated.hookContent
          ? {
              ...separated,
              hookContent: {
                ...separated.hookContent,
                edits: ownerContentEdits(next),
              },
            }
          : { ...next, hookContent: separated.hookContent };
    }
    setForm({ original, draft: next });
  }
  function changeHook(
    hook: OwnerEditDocument["hook"],
    options: {
      suggested?: boolean;
      soundId?: OwnerHookSoundId;
      audio?: boolean;
    } = {},
  ) {
    ownMessage("hook");
    if (
      hook &&
      (!ownerHookSchema.safeParse(hook).success ||
        hook.endFrame > rootBase.overlay.frames)
    ) {
      setForm({ original, draft: { ...masterDraft, hook } });
      return;
    }
    const validPrior = {
      ...masterDraft,
      hook:
        masterDraft.hookContent?.window ??
        (ownerHookSchema.safeParse(masterDraft.hook).success
          ? masterDraft.hook
          : undefined),
    };
    const scopedPrior = { ...validPrior, ...(hookContent?.edits ?? {}) };
    const wantsAudio = options.audio ?? addHookAudio;
    const requestedFrames = hook ? hook.endFrame - hook.startFrame : 0;
    const soundId =
      options.soundId ??
      (hook && wantsAudio && !managedHookAudio
        ? (
            OWNER_HOOK_SOUNDS.find(
              (sound) => sound.frames >= requestedFrames,
            ) ?? OWNER_HOOK_SOUNDS.at(-1)!
          ).id
        : undefined);
    const soundEdit =
      hook && wantsAudio && (options.suggested || soundId)
        ? options.suggested
          ? acceptSuggestedOwnerHook(
              scopedPrior,
              hook,
              crypto.randomUUID(),
              rootBase.overlay.frames,
            )
          : chooseOwnerHookSound(
              scopedPrior,
              hook,
              crypto.randomUUID(),
              rootBase.overlay.frames,
              soundId,
            )
        : undefined;
    if (soundEdit) hook = soundEdit.hook;
    const rangeChanged =
      JSON.stringify(hook) !== JSON.stringify(masterDraft.hook);
    if (rangeChanged || !hook) {
      hookTitles.cancel();
      setHookTitleState(null);
    }
    let next: OwnerEditDocument;
    try {
      next = withIndependentOwnerHook(
        rootBase,
        validPrior,
        clip.assets,
        clip.audioAssets ?? [],
        hook,
        clip.videoAssets,
      );
    } catch {
      setMessage(
        "Complete invalid edits or combine filter ranges before changing the Hook.",
      );
      return;
    }
    if (!hook) next = changeManualOwnerHook(next, undefined);
    else if (next.hookContent) {
      const scoped = { ...next, ...next.hookContent.edits };
      const accepted = soundEdit
        ? { ...scoped, audio: soundEdit.audio }
        : wantsAudio
          ? changeManualOwnerHook(scoped, hook)
          : removeOwnerHookSound(scoped);
      next = {
        ...next,
        hookContent: {
          ...next.hookContent,
          edits: ownerContentEdits(accepted),
        },
      };
    }
    update(next, true);
    if (hook && rangeChanged && generateHookTitle) queueHookTitle(next, hook);
    if (
      hook &&
      JSON.stringify(hook) !== JSON.stringify(masterDraft.hook) &&
      (masterDraft.hookContent?.edits.cameraTracks?.length ?? 0) +
        (masterDraft.hookContent?.edits.cameraEffects?.length ?? 0) >
        0
    )
      setMessage("Motion and Zoom were cleared for the changed Hook range.");
    setOccurrence(hook ? "hook" : "body");
    setTimelineSelection(undefined);
    setAudioPicture(undefined);
    player.current?.seekTo(0);
    return next;
  }
  function toggleHookAudio(enabled: boolean) {
    setPreferHookAudio(enabled);
    if (!masterDraft.hook) return;
    player.current?.pause();
    const completedDraft = hookDraft
      ? completeOwnerHookDraft(hookDraft, rootBase.overlay.frames)
      : undefined;
    try {
      const next = changeHook(completedDraft ?? masterDraft.hook, {
        audio: enabled,
      });
      if (next && completedDraft) setHookDraft(undefined);
    } catch {
      ownMessage("hook");
      setMessage("Remove an audio layer to make room for the Hook’s riser.");
    }
  }
  function cancelHookTitle() {
    setGenerateHookTitle(false);
    hookTitles.cancelCurrent();
  }
  function toggleHookTitle(enabled: boolean) {
    setGenerateHookTitle(enabled);
    if (!enabled) {
      hookTitles.cancel();
      setHookTitleState(null);
    } else if (masterDraft.hook && !hookDraft && !error) {
      queueHookTitle(
        masterDraft,
        masterDraft.hook,
        hookTitleState?.phase === "canceled",
      );
    }
  }
  function queueHookTitle(
    next: OwnerEditDocument,
    hook: NonNullable<OwnerEditDocument["hook"]>,
    retry = false,
  ) {
    if (
      !hookTitleSuggestions ||
      (clip.hookTitleAttempts ?? 0) >= OWNER_HOOK_TITLE_LIMIT
    )
      return;
    const fingerprint = hookTitleFingerprint(next);
    hookTitles.select(
      {
        workspaceId,
        clipId: clip.id,
        revision: clip.revision,
        sourceRevision: clip.sourceRevision,
        hook,
        apply: (result) => {
          if (!alive.current) return;
          setForm((current) => ({
            ...current,
            draft: acceptHookTitle(current.draft, result, fingerprint),
          }));
        },
      },
      retry,
    );
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
      if (cue)
        setCue({
          ...cue,
          box,
          ...(cue.presentation === "full-frame"
            ? { presentation: "inset" as const }
            : {}),
        });
    }
  }
  function selectLayer(id: string) {
    revealInspector();
    if (id !== selection) setTextRange(null);
    setTimelineSelection(undefined);
    setMediaTab(
      draft.visuals.find((cue) => cue.id === id)?.video ? "videos" : "pictures",
    );
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
    if (pending || trackingMode) return;
    revealInspector();
    setCameraInspection(null);
    setCameraRequest(undefined);
    if (value !== setting) diagnostics.action("tab");
    setCaptionConfirm(false);
    if (value !== setting) setTextRange(null);
    setSetting(value);
    if (value === "focus" && selectedCue) choosePicture(selectedCue, true);
    if (value === "captions") setSelection("captions");
    if (
      value === "text" &&
      !draft.texts?.some((layer) => layer.id === selection) &&
      draft.texts?.[0]
    )
      chooseText(draft.texts[0]);
  }
  function chooseText(layer: OwnerTextLayer) {
    revealInspector();
    if (layer.id !== selection) setTextRange(null);
    setTimelineSelection(undefined);
    setSelection(layer.id);
    player.current?.pause();
    if (
      Number.isInteger(layer.startFrame) &&
      layer.startFrame >= 0 &&
      layer.startFrame <
        (layer.role === "opening-title"
          ? ownerPresentationFrames(overlay)
          : base.overlay.frames)
    )
      player.current?.seekTo(
        layer.role === "opening-title"
          ? layer.startFrame +
              (activeOccurrence === "body" && playbackOverlay.hookContent
                ? ownerHookFrames(playbackOverlay)
                : 0)
          : ownerOccurrencePresentationFrame(
              overlay.hook,
              layer.startFrame,
              activeOccurrence,
            ),
      );
  }
  const windowStart =
    activeOccurrence === "hook" ? masterDraft.hook!.startFrame : 0;
  const windowEnd =
    activeOccurrence === "hook"
      ? masterDraft.hook!.endFrame
      : base.overlay.frames;
  const filterOffset =
    activeOccurrence === "hook"
      ? -masterDraft.hook!.startFrame
      : ownerHookFrames(playbackOverlay);
  const filterItem =
    timelineSelection?.kind === "look" &&
    timelineSelection.occurrence === activeOccurrence
      ? timelineSelection
      : editorTimelineItems(playbackOverlay, "look").find(
          (item) => item.occurrence === activeOccurrence,
        );
  const filterWindow = filterItem
    ? {
        startFrame: filterItem.startFrame - filterOffset,
        endFrame: filterItem.endFrame - filterOffset,
      }
    : { startFrame: windowStart, endFrame: windowEnd };
  const selectedFilter: OwnerVideoLookRange = draft.videoLooks?.find(
    (range) =>
      Object.is(range.startFrame, filterWindow.startFrame) &&
      Object.is(range.endFrame, filterWindow.endFrame),
  ) ?? {
    ...filterWindow,
    ...(ownerVideoLookAt(overlay, filterWindow.startFrame) ?? {
      preset: "original",
      strength: 100,
    }),
  };
  function changeFilter(next: OwnerVideoLookRange) {
    ownMessage("filters");
    let videoLooks: OwnerVideoLookRange[];
    if (
      ownerVideoLookRangeSchema.safeParse(next).success &&
      ownerVideoLooksFit([next], {
        startFrame: windowStart,
        endFrame: windowEnd,
      })
    ) {
      try {
        videoLooks = replaceOwnerVideoLookRange(
          draft.videoLooks ?? [],
          selectedFilter,
          next,
        );
      } catch {
        setMessage(
          "Keep up to 32 separate filter ranges. Extend this range to cover an adjacent range, or discard this change.",
        );
        return;
      }
    } else
      videoLooks = [
        ...(draft.videoLooks ?? []).filter(
          (range) =>
            !Object.is(range.startFrame, selectedFilter.startFrame) ||
            !Object.is(range.endFrame, selectedFilter.endFrame),
        ),
        next,
      ];
    update({ ...draft, videoLooks });
    setTimelineSelection({
      kind: "look",
      occurrence: activeOccurrence,
      index: 0,
      id: filterRangeKey(next),
      key: `${activeOccurrence}:look:${filterRangeKey(next)}`,
      title: filterItem?.title ?? "Filter range",
      startFrame: next.startFrame + filterOffset,
      endFrame: next.endFrame + filterOffset,
    });
    setMessage("");
  }
  function selectTimelineItem(item: EditorTimelineItem) {
    diagnostics.action("selection");
    setTextRange(null);
    if (pending || trackingMode || audioImport !== null) return;
    revealInspector();
    setCameraInspection(null);
    player.current?.pause();
    setOccurrence(item.occurrence);
    setTimelineSelection(item);
    setCaptionConfirm(false);
    setAudioPicture(undefined);
    if (item.kind === "picture" || item.kind === "text") setSelection(item.id);
    if (item.kind === "picture")
      setMediaTab(
        ownerOccurrenceOverlay(playbackOverlay, item.occurrence).visuals[
          item.index
        ]?.video
          ? "videos"
          : "pictures",
      );
    if (item.kind === "caption") setSelection("captions");
    if (item.kind === "camera") {
      setSelection("focus");
      setCameraRequest(undefined);
    }
    if (item.kind === "audio")
      setImportedAudioCue(item.index < 0 ? "original" : item.id);
    const inset =
      item.kind === "picture"
        ? Math.min(9, Math.floor((item.endFrame - item.startFrame - 1) / 2))
        : 0;
    player.current?.seekTo(item.startFrame + inset);
  }
  function pictureAudio(item: EditorTimelineItem) {
    selectTimelineItem(item);
    setAudioPicture(item.id);
    setImportedAudioCue(undefined);
    setMediaTab("audio");
  }
  function timeline(kind: EditorTimelineKind, label: string) {
    const items = editorTimelineItems(playbackOverlay, kind).filter(
      (item) =>
        kind !== "picture" ||
        Boolean(editorTimelineVisual(playbackOverlay, item).cue.video) ===
          (mediaTab === "videos"),
    );
    const selected =
      timelineSelection?.kind === kind &&
      (kind === "look" ||
        items.some((item) => item.key === timelineSelection.key))
        ? timelineSelection.key
        : items.find(
            (item) =>
              item.occurrence === activeOccurrence &&
              (kind === "picture" || kind === "text"
                ? item.id === selection
                : true),
          )?.key;
    return (
      <EditorTimeline
        items={items}
        selected={selected}
        label={label}
        frames={ownerPresentationFrames(playbackOverlay)}
        disabled={pending || trackingMode || audioImport !== null}
        onSelect={selectTimelineItem}
        preview={
          kind === "picture"
            ? (item) => {
                const { cue, frame } = editorTimelineVisual(
                  playbackOverlay,
                  item,
                );
                return (
                  <MediaTimelineThumbnail
                    workspaceId={workspaceId}
                    assetId={cue.assetId}
                    frame={frame}
                  />
                );
              }
            : undefined
        }
        accessory={
          kind === "picture"
            ? (item) => (
                <div className="editor-timeline-actions">
                  <PictureTimelineAudio
                    item={item}
                    disabled={pending}
                    onAdd={pictureAudio}
                  />
                  {!ownerOccurrenceOverlay(playbackOverlay, item.occurrence)
                    .visuals[item.index]!.video && (
                    <PictureImageDialog
                      occurrence={item.occurrence}
                      workspaceId={workspaceId}
                      assetId={
                        ownerOccurrenceOverlay(playbackOverlay, item.occurrence)
                          .visuals[item.index]!.assetId
                      }
                      number={item.index + 1}
                      onOpen={() => player.current?.pause()}
                    />
                  )}
                </div>
              )
            : undefined
        }
      />
    );
  }
  function addText() {
    if (pending || (draft.texts?.length ?? 0) >= OWNER_TEXT_LIMITS.layers)
      return;
    const startFrame = Math.max(
      windowStart,
      Math.min(
        ownerSourceFrame(overlay, player.current?.getCurrentFrame() ?? 0),
        windowEnd - 1,
      ),
    );
    const layer: OwnerTextLayer = {
      id: crypto.randomUUID(),
      text: "Your text",
      startFrame,
      endFrame: Math.min(windowEnd, startFrame + 4 * OWNER_FPS),
      style: {
        ...OWNER_SOCIAL_TEXT_PRESETS.tiktok,
        box:
          clip.base?.overlay.framing === "fit" && source
            ? placeOwnerFitOriginalVisual(
                source,
                "above",
                { x: 0.1, y: 0.1, width: 0.8, height: 0.2 },
                (OWNER_SOCIAL_TEXT_PRESETS.tiktok.fontSize * 1.2 + 32) / 1920,
              )
            : { x: 0.1, y: 0.1, width: 0.8, height: 0.2 },
      },
    };
    update({ ...draft, texts: [...(draft.texts ?? []), layer] });
    setTextTab("content");
    chooseText(layer);
  }
  function newPicture(assetId: string, video = false): OwnerVisualEdit {
    const startFrame = Math.max(
      windowStart,
      Math.min(
        ownerSourceFrame(overlay, player.current?.getCurrentFrame() ?? 0),
        windowEnd - 1,
      ),
    );
    return {
      id: crypto.randomUUID(),
      assetId,
      startFrame,
      endFrame: Math.min(windowEnd, startFrame + 4 * OWNER_FPS),
      box:
        !video && clip.base?.overlay.framing === "fit" && source
          ? placeOwnerFitOriginalVisual(source, "below")
          : { x: 0.1, y: 0.1, width: 0.8, height: 0.3 },
      fit: "contain",
      ...OWNER_VISUAL_DEFAULT_MOTION,
    };
  }
  function choosePicture(cue: OwnerVisualEdit, atStart = false) {
    revealInspector();
    setCameraInspection(null);
    setMediaTab(cue.video ? "videos" : "pictures");
    setSelection(cue.id);
    player.current?.pause();
    player.current?.seekTo(
      ownerOccurrencePresentationFrame(
        overlay.hook,
        cue.startFrame +
          (atStart
            ? 0
            : Math.min(
                cue.animationFrames ?? 9,
                Math.floor((cue.endFrame - cue.startFrame - 1) / 2),
              )),
        activeOccurrence,
      ),
    );
  }
  async function perform(
    kind: "picture" | "video" | "reload" | "audio" | "youtube-audio",
    file?: File,
  ) {
    if (
      request.current ||
      autosave.phase === "saving" ||
      autosave.phase === "syncing"
    )
      return;
    if (kind === "reload") setCameraInspection(null);
    if (kind === "reload") {
      hookTitles.cancel();
      setHookTitleState(null);
      setGenerateHookTitle(false);
      setPreferHookAudio(false);
    }
    ownMessage(
      kind === "picture" || kind === "video"
        ? "pictures"
        : kind === "audio" || kind === "youtube-audio"
          ? "audio"
          : "action",
    );
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setAudioUploading(kind === "audio" || kind === "youtube-audio");
    try {
      const body =
        kind === "youtube-audio"
          ? ownerYoutubeAudioImportSchema.parse({ url: audioImport ?? "" })
          : null;
      const response = await fetch(
        kind === "reload"
          ? `/api/local/workspace/${workspaceId}/clips`
          : `${endpoint}/${kind}`,
        {
          method: kind === "reload" ? "GET" : "POST",
          signal: controller.signal,
          ...(kind === "youtube-audio"
            ? {
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
              }
            : kind === "picture" || kind === "video" || kind === "audio"
              ? {
                  headers: {
                    "Content-Type":
                      file?.type ||
                      (kind === "audio"
                        ? file?.name.toLowerCase().endsWith(".mp3")
                          ? "audio/mpeg"
                          : file?.name.toLowerCase().endsWith(".m4a")
                            ? "audio/mp4"
                            : "audio/wav"
                        : ""),
                  },
                  body: file ?? null,
                }
              : {}),
        },
      );
      if (!alive.current || controller.signal.aborted) return;
      if (response.status === 409) {
        if (kind === "audio" || kind === "youtube-audio")
          throw new Error("audio_busy");
        setForcedStale(true);
        throw new Error("stale");
      }
      if (!response.ok) throw new Error("unacknowledged");
      const value = await readOwnerClips(
        response,
        workspaceId,
        controller.signal,
      );
      const acknowledged = value.clips.find((item) => item.id === clip.id);
      if (!acknowledged?.base) throw new Error("unacknowledged");
      if (!alive.current) return;
      onAccepted(value);
      if (kind === "audio" || kind === "youtube-audio") {
        const asset = acknowledged.audioAssets?.find(
          (item) => item.id === value.audioAssetId,
        );
        if (!asset) throw new Error("unacknowledged");
        let cue: OwnerAudioCue = {
          id: crypto.randomUUID(),
          source: { kind: "upload", id: asset.id },
          placement: "video",
          startFrame: 0,
          endFrame: base.overlay.frames,
          offsetFrame: 0,
          volume: 20,
          loop: true,
        };
        const audio = draft.audio ?? { originalVolume: 100, cues: [] };
        const visual = draft.visuals.find((item) => item.id === audioPicture);
        if (visual)
          cue = pictureLinkedAudio(
            cue,
            visual,
            windowEnd,
            Math.round((asset.durationMs * OWNER_FPS) / 1000),
          );
        update({ ...draft, audio: { ...audio, cues: [...audio.cues, cue] } });
        setMessage("");
        if (kind === "youtube-audio") {
          setImportedAudioCue(cue.id);
          setAudioImport(null);
        }
        return asset.id;
      } else if (kind !== "picture" && kind !== "video") {
        setHookDraft(undefined);
        setTimelineSelection(undefined);
        setAudioPicture(undefined);
        const accepted = initialOwnerEdit(acknowledged);
        setForm({ original: accepted, draft: structuredClone(accepted) });
        autosave.reset();
        setForcedStale(false);
      } else {
        const assetId =
          kind === "video" ? value.videoAssetId : value.pictureAssetId;
        if (
          !assetId ||
          !(
            kind === "video"
              ? (acknowledged.videoAssets ?? [])
              : acknowledged.assets
          ).some((asset) => asset.id === assetId)
        )
          throw new Error("unacknowledged");
        const cue = newPicture(assetId, kind === "video");
        if (kind === "video") {
          const asset = acknowledged.videoAssets!.find(
            (asset) => asset.id === assetId,
          )!;
          cue.video = {
            offsetFrame: 0,
            sourceEndFrame: asset.frames,
            volume: 100,
            muted: true,
          };
          cue.endFrame = Math.min(cue.endFrame, cue.startFrame + asset.frames);
        }
        update({ ...draft, visuals: [...draft.visuals, cue] });
        choosePicture(cue);
        setPictureTab("image");
      }
      setMessage("");
    } catch (failure) {
      if (alive.current && !controller.signal.aborted)
        setMessage(
          failure instanceof Error && failure.message === "stale"
            ? ""
            : kind === "video"
              ? "Couldn’t add this video. Use MP4 or MOV under 64 MB and 2 minutes."
              : kind === "picture"
                ? "Couldn’t add this image. Use a static JPEG, PNG or WebP under 4 MB."
                : kind === "youtube-audio"
                  ? "Couldn’t import this sound. Use a public YouTube audio clip under 2 minutes and 12 MB."
                  : kind === "audio"
                    ? "Couldn’t add this audio. Use MP3, WAV or M4A under 12 MB and 2 minutes."
                    : "Couldn’t save these changes. Try again.",
        );
    } finally {
      request.current = null;
      if (alive.current) {
        setPending(false);
        setAudioUploading(false);
      }
    }
  }
  function upload(file: File | undefined) {
    ownMessage("pictures");
    if (!file || draft.visuals.length >= OWNER_PICTURE_LIMITS.cuesPerClip)
      return;
    if (file.size > OWNER_PICTURE_LIMITS.inputBytes || file.size === 0) {
      setMessage("Choose a JPEG, PNG or WebP under 4 MB.");
      return;
    }
    void perform("picture", file);
  }
  async function findVisuals() {
    if (
      request.current ||
      dirty ||
      stale ||
      !visualDiscovery ||
      activeOccurrence === "hook"
    )
      return;
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setFindingVisuals(true);
    ownMessage("pictures");
    setMessage("");
    onBusy?.(true);
    player.current?.pause();
    try {
      const response = await fetch(`${endpoint}/visuals`, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operationId: crypto.randomUUID(),
          expectedRevision: clip.revision,
        }),
      });
      if (!response.ok) throw new Error("visual_discovery_failed");
      const list = await readOwnerClips(
        response,
        workspaceId,
        controller.signal,
      );
      const accepted = list.clips.find((item) => item.id === clip.id);
      if (!accepted?.base || !alive.current) return;
      onAccepted(list);
      const edit = initialOwnerEdit(accepted);
      setForm({ original: edit, draft: structuredClone(edit) });
      if (accepted.visualDiscovery?.outcome !== "found")
        setMessage(
          "No new visuals found. Your current pictures are still here.",
        );
      else setSelection(edit.visuals.at(-1)?.id ?? "captions");
    } catch {
      if (alive.current && !controller.signal.aborted)
        setMessage(
          "Couldn’t find visuals. Your current pictures are still here. Try again.",
        );
    } finally {
      request.current = null;
      if (alive.current) {
        setPending(false);
        setFindingVisuals(false);
        onBusy?.(false);
      }
    }
  }
  async function generateCaptions(fake = false) {
    if (
      request.current ||
      activeOccurrence === "hook" ||
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
    ownMessage("captions");
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
            ...(!fake && captionProvider !== "local-speech"
              ? { paidConsent: true }
              : {}),
          }),
        },
      );
      if (!response.ok)
        throw captionProvider === "local-speech"
          ? await localCodexError(response)
          : new Error("caption_generation_failed");
      const list = await readOwnerClips(
          response,
          workspaceId,
          controller.signal,
        ),
        accepted = list.clips.find((item) => item.id === clip.id);
      if (!accepted?.base || !alive.current) return;
      onAccepted(list);
      const edit = initialOwnerEdit(accepted);
      setForm({ original: edit, draft: structuredClone(edit) });
      setCaptionConfirm(false);
      setCaptionTab("text");
      if (!accepted.base.overlay.captions.length)
        setMessage("No speech found in this clip.");
    } catch (failure) {
      if (alive.current && !controller.signal.aborted)
        setMessage(
          fake
            ? "Couldn’t add fake captions. Try again."
            : captionProvider === "local-speech"
              ? failure instanceof LocalCodexError
                ? failure.message
                : "Couldn’t generate captions. Check local speech setup and try again."
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
  const captionIssueTab =
    errorField === "captionText"
      ? "text"
      : errorField === "captionSpeakers"
        ? "speakers"
        : errorPath.includes("box")
          ? "position"
          : "style";
  const pictureIssueTab = errorPath.includes("box")
    ? "position"
    : errorPath.some((part) =>
          ["assetId", "video", "focal", "presentation"].includes(String(part)),
        )
      ? "image"
      : "timing";
  const captionIssue =
    errorSection === "captions" && errorOccurrence === activeOccurrence
      ? (error ?? undefined)
      : undefined;
  const visualIssue =
    errorField === "visuals" &&
    errorOccurrence === activeOccurrence &&
    (typeof errorPath[1] !== "number" ||
      draft.visuals[errorPath[1]]?.id === selectedCue?.id)
      ? (error ?? undefined)
      : undefined;
  const pictureIssue = errorSection === "pictures" ? visualIssue : undefined;
  const visualMotionIssue = errorSection === "focus" ? visualIssue : undefined;
  const cameraErrorTarget =
    error && errorSection === "focus" && errorOccurrence === activeOccurrence
      ? errorField === "visuals" && typeof errorPath[1] === "number"
        ? draft.visuals[errorPath[1]]?.id
        : "original"
      : undefined;
  const sectionIssue = (section: EditorSetting) => (
    <InlineFeedback
      message={
        errorSection === section &&
        errorOccurrence === activeOccurrence &&
        setting === section &&
        !(section === "text" && textIssues.length)
          ? error
          : undefined
      }
    />
  );
  const content = (
    <section
      className="clip-editor"
      aria-label="Clip editor"
      onClickCapture={(event) => {
        if (
          event.target instanceof HTMLElement &&
          event.target.closest(
            'button, input[type="checkbox"], input[type="radio"]',
          )
        )
          editGroup.current = crypto.randomUUID();
      }}
      onInputCapture={(event) => {
        const target = event.target;
        if (target instanceof HTMLElement) {
          let group = inputGroups.current.get(target);
          if (!group) {
            group = crypto.randomUUID();
            inputGroups.current.set(target, group);
          }
          editGroup.current = gestureGroup.current ?? group;
        }
      }}
      onPointerDownCapture={() => {
        editGroup.current = crypto.randomUUID();
        gestureGroup.current = editGroup.current;
        setGestureActive(true);
      }}
      onPointerUpCapture={() => setGestureActive(false)}
      onPointerCancelCapture={() => setGestureActive(false)}
      onLostPointerCaptureCapture={() => setGestureActive(false)}
    >
      <EditorSaveTools
        phase={autosave.phase}
        dirty={dirty}
        invalid={!!error || !!hookDraft}
        disabled={!previewLoaded || pending || trackingMode || titleLoading}
        canUndo={historyAvailable.undo}
        canRedo={historyAvailable.redo}
        onUndo={() => moveHistory("undo")}
        onRedo={() => moveHistory("redo")}
        onRetry={autosave.retry}
        onResolve={() => setReviewSaveConflict(true)}
        onReload={
          actionsVisible && previewUnavailable && !dirty && !stale
            ? () => void perform("reload")
            : undefined
        }
        reloadDisabled={
          pending || autosave.phase === "saving" || autosave.phase === "syncing"
        }
      />
      {reviewSaveConflict && autosave.conflict && (
        <EditorSaveConflict
          fields={autosave.conflict.fields}
          canKeep={autosave.conflict.canKeep && !error && !hookDraft}
          onClose={() => setReviewSaveConflict(false)}
          onResolve={(keep) => {
            if (autosave.resolve(keep)) setReviewSaveConflict(false);
          }}
        />
      )}
      {previewLoading && (
        <span className="local-sr-only" role="status">
          Loading preview
        </span>
      )}
      <div
        className="editor-layout"
        data-loading={previewLoading || undefined}
        aria-hidden={previewLoading || undefined}
        inert={previewLoading}
      >
        <div
          className="editor-preview"
          data-compact={compactPlayback || undefined}
        >
          <div className="editor-preview-canvas">
            {previewLoading && (
              <div className="editor-preview-loading" aria-hidden="true">
                <ProcessingState
                  label="Loading preview"
                  indicatorSize="compact"
                />
              </div>
            )}
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
                  overlay: playbackOverlay,
                  workspaceId,
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
                  editingOccurrence: activeOccurrence,
                  cameraInspection:
                    setting === "focus" &&
                    cameraInspection?.cueId === selection &&
                    cameraInspection.occurrence === activeOccurrence &&
                    cameraInspection.original === original
                      ? {
                          cueId: cameraInspection.cueId,
                          occurrence: cameraInspection.occurrence,
                          endpoint: cameraInspection.endpoint,
                        }
                      : null,
                  setting:
                    setting === "pictures" && mediaTab === "audio"
                      ? "filters"
                      : setting,
                }}
                durationInFrames={ownerPresentationFrames(overlay)}
                compositionWidth={1080}
                compositionHeight={1920}
                numberOfSharedAudioTags={OWNER_AUDIO_LIMITS.cues * 2}
                fps={OWNER_FPS}
                initialFrame={Math.min(
                  previewFrame,
                  ownerPresentationFrames(overlay) - 1,
                )}
                errorFallback={() => <PreviewFailure onRetry={retryPreview} />}
                controls={!compactPlayback}
                clickToPlay={false}
                doubleClickToFullscreen={false}
                spaceKeyToPlayOrPause={false}
                style={{ width: "100%" }}
              />
            )}
          </div>
          {compactPlayback && !playbackFailed && !previewUnavailable && (
            <CompactEditorPlayback
              player={player}
              frames={ownerPresentationFrames(overlay)}
            />
          )}
        </div>
        <div
          className="editor-panels"
          inert={!previewLoaded}
          aria-busy={previewLoading || undefined}
        >
          <div className="editor-navigation">
            <ControlTabs
              id={tabsId}
              className="editor-tabs"
              label="Clip settings"
              items={EDITOR_SECTIONS.map(({ value, label, icon }) => ({
                value,
                label,
                icon,
                issue:
                  value === "text" && textIssues[0]
                    ? Object.values(textIssues[0].issues).find(Boolean)
                    : error && value === errorSection
                      ? error
                      : message &&
                          value ===
                            (messageArea === "audio" ? "pictures" : messageArea)
                        ? message
                        : value === "hook" && currentTitle?.phase === "failed"
                          ? "Couldn’t suggest a title. Retry when ready."
                          : undefined,
              }))}
              value={setting}
              disabled={pending || trackingMode || audioImport !== null}
              onChange={(next) => {
                selectSetting(next);
                if (error && next === errorSection) {
                  setOccurrence(errorOccurrence);
                  if (next === "captions") setCaptionTab(captionIssueTab);
                  if (next === "pictures")
                    setMediaTab(errorField === "audio" ? "audio" : "pictures");
                  if (next === "focus" && errorField !== "visuals")
                    setSelection("focus");
                  if (
                    (next === "pictures" || next === "focus") &&
                    errorField === "visuals"
                  ) {
                    if (next === "pictures") setPictureTab(pictureIssueTab);
                    if (typeof errorPath[1] === "number") {
                      const edits =
                        errorOccurrence === "hook"
                          ? masterDraft.hookContent?.edits
                          : masterDraft;
                      const cue = edits?.visuals[errorPath[1]];
                      if (cue) {
                        setSelection(cue.id);
                        setMediaTab(cue.video ? "videos" : "pictures");
                      }
                    }
                  }
                }
                if (
                  message &&
                  next === (messageArea === "audio" ? "pictures" : messageArea)
                ) {
                  setOccurrence(messageOccurrence);
                  if (messageArea === "audio") setMediaTab("audio");
                  if (messageArea === "pictures") setMediaTab("pictures");
                  if (messageArea === "text") setTextTab("content");
                }
                const issue = next === "text" ? textIssues[0] : undefined;
                if (issue) {
                  const item = editorTimelineItems(
                    playbackOverlay,
                    "text",
                  ).find(
                    (item) =>
                      item.id === issue.layer.id &&
                      item.occurrence === issue.occurrence,
                  );
                  if (item) selectTimelineItem(item);
                  else {
                    player.current?.pause();
                    setOccurrence(issue.occurrence);
                    setSelection(issue.layer.id);
                    setTimelineSelection(undefined);
                    setTextRange(null);
                  }
                  setTextTab(
                    issue.issues.content
                      ? "content"
                      : issue.issues.timing
                        ? "timing"
                        : "style",
                  );
                }
              }}
            />
            <EditorTour
              ready={
                actionsVisible &&
                isLocalClipEditable(clip) &&
                previewLoaded &&
                !previewUnavailable &&
                !playbackFailed &&
                !pending &&
                !dirty &&
                !stale &&
                !trackingMode &&
                !captionConfirm &&
                audioImport === null &&
                !titleLoading &&
                !generating &&
                !findingVisuals &&
                !error
              }
              actionTarget={actionTarget}
              onStart={() => {
                player.current?.pause();
                return () => {
                  setSetting(setting);
                  setMediaTab(mediaTab);
                };
              }}
              onNavigate={(step) => {
                revealInspector();
                if (step.section) setSetting(step.section);
                if (step.media) setMediaTab(step.media);
              }}
            />
          </div>
          <ControlPanel id={tabsId} value="home" active={setting}>
            {setting === "home" && (
              <EditorOverview
                overlay={playbackOverlay}
                workspaceId={workspaceId}
                player={player}
                disabled={pending || trackingMode}
                onSelect={(item) => {
                  if (pending || trackingMode || audioImport !== null) return;
                  setSetting(
                    item.kind === "text"
                      ? "text"
                      : item.kind === "caption"
                        ? "captions"
                        : item.kind === "look"
                          ? "filters"
                          : item.kind === "camera" || item.kind === "effect"
                            ? "focus"
                            : "pictures",
                  );
                  if (item.kind === "audio") setMediaTab("audio");
                  if (item.kind === "caption") setCaptionTab("text");
                  selectTimelineItem(item);
                  if (item.kind === "effect") {
                    setSelection(
                      item.targetId === "original"
                        ? "focus"
                        : (item.targetId ?? "focus"),
                    );
                    setCameraRequest({
                      key: crypto.randomUUID(),
                      id: item.id,
                      targetId: item.targetId ?? "original",
                      tab: item.effectTab ?? "zoom",
                    });
                    if (item.targetId === "original")
                      setTimelineSelection(
                        editorTimelineItems(playbackOverlay, "camera").find(
                          (position) =>
                            position.occurrence === item.occurrence &&
                            position.startFrame <= item.startFrame &&
                            item.startFrame < position.endFrame,
                        ),
                      );
                  }
                }}
              />
            )}
          </ControlPanel>
          <ControlPanel id={tabsId} value="hook" active={setting}>
            <EditorInspectorLayout
              label="Hook properties"
              title="Hook"
              collectionLabel="Suggestion"
              context={activeOccurrence === "hook" ? "Hook" : "Main clip"}
            >
              {setting === "hook" && (
                <>
                  <fieldset disabled={pending || !!error}>
                    <legend className="local-sr-only">Hook</legend>
                    <HookControls
                      disabled={pending || !!error}
                      hook={hookDraft ?? draft.hook}
                      suggestion={decodeOwnerHookSuggestion(
                        base.hookSuggestion,
                        base.overlay.frames,
                      )}
                      simulated={clip.mode === "synthetic-ai"}
                      generateTitle={generateHookTitle}
                      addAudio={addHookAudio}
                      titleUnavailable={titleUnavailable}
                      onGenerateTitle={toggleHookTitle}
                      onAddAudio={toggleHookAudio}
                      maxFrames={hookMaxFrames}
                      frames={base.overlay.frames}
                      player={player}
                      available={!playbackFailed && previewLoaded && !pending}
                      attempt={previewAttempt}
                      valid={!error && !hookDraft}
                      onChange={(next) => {
                        hookTitles.cancel();
                        setHookTitleState(null);
                        player.current?.pause();
                        setMessage("");
                        const complete = next
                          ? completeOwnerHookDraft(
                              next,
                              base.overlay.frames,
                              hookMaxFrames,
                            )
                          : undefined;
                        if (!next || complete) {
                          try {
                            changeHook(complete);
                            setHookDraft(undefined);
                          } catch {
                            setHookDraft(next);
                            setMessage(
                              "Couldn’t update the Hook. Check its range and layers.",
                            );
                          }
                        } else setHookDraft(next);
                      }}
                      onUseSuggestion={(hook) => {
                        player.current?.pause();
                        try {
                          changeHook(hook, { suggested: true });
                          setHookDraft(undefined);
                          setMessage("");
                        } catch {
                          setMessage(
                            "Remove an audio layer to make room for the hook’s riser.",
                          );
                        }
                      }}
                    />
                  </fieldset>
                  {masterDraft.hook &&
                    !hookDraft &&
                    (titleLoading || currentTitle) && (
                      <EditorInspector
                        title="Title suggestion"
                        disabled={pending}
                      >
                        {titleLoading ? (
                          <HookTitleProgress
                            id={`${tabsId}-hook-title-progress`}
                            onCancel={cancelHookTitle}
                          />
                        ) : (
                          <InlineFeedback
                            tone={
                              currentTitle?.phase === "canceled"
                                ? "status"
                                : "error"
                            }
                            message={
                              currentTitle?.phase === "failed"
                                ? "Couldn’t suggest a title. Retry when ready."
                                : currentTitle?.phase === "canceled"
                                  ? "Current title kept."
                                  : undefined
                            }
                          />
                        )}
                        {currentTitle?.result?.title && (
                          <p className="source-hint">
                            {clip.mode === "synthetic-ai"
                              ? "Simulated title"
                              : "AI title"}
                            : {currentTitle.result.title.text}
                          </p>
                        )}
                      </EditorInspector>
                    )}
                  {((error && errorSection === "hook") ||
                    messageFor("hook")) && (
                    <EditorInspector title="Hook status" disabled={pending}>
                      {sectionIssue("hook")}
                      <InlineFeedback message={messageFor("hook")} />
                    </EditorInspector>
                  )}
                </>
              )}
            </EditorInspectorLayout>
          </ControlPanel>
          <ControlPanel id={tabsId} value="text" active={setting}>
            <EditorInspectorLayout
              title="Text"
              collectionLabel="Text layers"
              context={activeOccurrence === "hook" ? "Hook" : "Main clip"}
              label="Text panes"
              collapsible
              revealKey={inspectorRequest}
              selectionKey={`${activeOccurrence}:${selection}`}
            >
              {setting === "text" && timeline("text", "Text layers")}
              {setting === "text" && (
                <EditorInspector title="Text properties" disabled={pending}>
                  <legend className="local-sr-only">Text</legend>
                  <TextInspector
                    id={`${tabsId}-text-controls`}
                    hidePicker
                    layers={draft.texts ?? []}
                    selected={selection}
                    onSelect={chooseText}
                    onAdd={addText}
                    onChange={(texts) => {
                      if (messageArea === "text") setMessage("");
                      update({ ...draft, texts });
                    }}
                    feedback={messageFor("text")}
                    frames={base.overlay.frames}
                    player={player}
                    available={!playbackFailed && previewLoaded && !pending}
                    attempt={previewAttempt}
                    tab={textTab}
                    onTab={setTextTab}
                  />
                  {sectionIssue("text")}
                </EditorInspector>
              )}
            </EditorInspectorLayout>
          </ControlPanel>
          <ControlPanel
            id={tabsId}
            value="focus"
            active={setting}
            className="focus-panel"
          >
            {setting === "focus" && (
              <>
                <fieldset
                  disabled={pending || trackingMode}
                  className="camera-target-toolbar"
                >
                  <div className="editor-workarea-heading">
                    <h2>Camera</h2>
                    <span className="editor-scope-badge">
                      {activeOccurrence === "hook" ? "Hook" : "Main clip"}
                    </span>
                  </div>
                  <div className="editor-fields">
                    <label>
                      Camera target
                      <select
                        className="select-control"
                        aria-label="Camera target"
                        value={selectedCue?.id ?? "original"}
                        onChange={(event) => {
                          setCameraRequest(undefined);
                          const cue = draft.visuals.find(
                            (cue) => cue.id === event.currentTarget.value,
                          );
                          if (cue) choosePicture(cue, true);
                          else {
                            setCameraInspection(null);
                            setSelection("focus");
                          }
                        }}
                      >
                        <option value="original">
                          Original video
                          {cameraErrorTarget === "original"
                            ? " · Check settings"
                            : ""}
                        </option>
                        {[...draft.visuals].reverse().map((cue) => (
                          <option key={cue.id} value={cue.id}>
                            {cue.video ? "Video" : "Picture"}{" "}
                            {draft.visuals.indexOf(cue) + 1}
                            {cameraErrorTarget === cue.id
                              ? " · Check settings"
                              : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <InlineFeedback
                    message={
                      cameraErrorTarget &&
                      cameraErrorTarget !== (selectedCue?.id ?? "original")
                        ? "Choose the marked Camera target to correct its settings."
                        : undefined
                    }
                  />
                </fieldset>
                {selectedCue ? (
                  <MediaCameraControls
                    navigationRequest={cameraRequest}
                    key={activeOccurrence + selectedCue.id}
                    cue={selectedCue}
                    previewCue={overlay.visuals.find(
                      (cue) => cue.id === selectedCue.id,
                    )}
                    acceptedEdit={original}
                    targetName={`${selectedCue.video ? "Video" : "Picture"} ${draft.visuals.indexOf(selectedCue) + 1}`}
                    asset={
                      selectedCue.video
                        ? clip.videoAssets?.find(
                            (asset) => asset.id === selectedCue.assetId,
                          )
                        : clip.assets.find(
                            (asset) => asset.id === selectedCue.assetId,
                          )
                    }
                    workspaceId={workspaceId}
                    frames={base.overlay.frames}
                    player={player}
                    available={previewLoaded && !playbackFailed}
                    attempt={previewAttempt}
                    disabled={pending}
                    invalid={!!error}
                    feedback={
                      visualMotionIssue
                        ? { message: visualMotionIssue, path: errorPath }
                        : undefined
                    }
                    onChange={setCue}
                    actionTarget={actionTarget}
                    onTrackingMode={setTrackingMode}
                    onTrackingBusy={setTrackingBusy}
                    onInspect={(endpoint) =>
                      setCameraInspection(
                        endpoint
                          ? {
                              cueId: selectedCue.id,
                              occurrence: activeOccurrence,
                              endpoint,
                              original,
                            }
                          : null,
                      )
                    }
                  />
                ) : (
                  <FocusPreviewControls
                    navigationRequest={cameraRequest}
                    feedback={
                      error &&
                      errorSection === "focus" &&
                      errorField !== "visuals" &&
                      errorOccurrence === activeOccurrence
                        ? {
                            tab:
                              errorField === "cameraEffects"
                                ? typeof errorPath[1] === "number" &&
                                  draft.cameraEffects?.[errorPath[1]]?.kind ===
                                    "pan"
                                  ? "pan"
                                  : "zoom"
                                : errorField === "cameraTracks"
                                  ? "motion"
                                  : errorPath.includes("people")
                                    ? "people"
                                    : "camera",
                            message: error,
                          }
                        : undefined
                    }
                    notice={messageFor("focus")}
                    navigationDisabled={trackingMode}
                    timeline={timeline("camera", "Camera timeline")}
                    positionRequest={
                      editorTimelineItems(playbackOverlay, "camera").find(
                        (item) =>
                          item.occurrence === activeOccurrence &&
                          item.key === timelineSelection?.key,
                      ) ??
                      editorTimelineItems(playbackOverlay, "camera").find(
                        (item) => item.occurrence === activeOccurrence,
                      )
                    }
                    onPositionSelect={(index) =>
                      setTimelineSelection({
                        kind: "camera",
                        occurrence: activeOccurrence,
                        id: String(index),
                        index,
                        key: `${activeOccurrence}:camera:${index}`,
                        title: "",
                        startFrame: 0,
                        endFrame: 0,
                      })
                    }
                    attempt={previewAttempt}
                    player={player}
                    available={!playbackFailed && previewLoaded}
                    focus={
                      draft.focus ??
                      base.overlay.focus ??
                      defaultOwnerFocus(
                        source ?? { width: 1080, height: 1920 },
                        base.overlay.frames,
                      )
                    }
                    cameraEffects={draft.cameraEffects ?? []}
                    cameraPreviewEffects={overlay.cameraEffects ?? []}
                    cameraTracks={draft.cameraTracks ?? []}
                    onCameraTracks={(cameraTracks) =>
                      update({ ...draft, cameraTracks })
                    }
                    onTrackingMode={setTrackingMode}
                    onTrackingBusy={setTrackingBusy}
                    actionTarget={actionTarget}
                    cameraAvailable={Boolean(draft.focus ?? base.overlay.focus)}
                    onCameraEffects={(cameraEffects) =>
                      update({ ...draft, cameraEffects })
                    }
                    automatic={base.overlay.focus}
                    sourceUrl={`${endpoint}/source`}
                    disabled={pending}
                    onChange={(focus) => {
                      const next = { ...draft };
                      if (focus) next.focus = focus;
                      else {
                        delete next.focus;
                        if (!base.overlay.focus && next.cameraEffects?.length) {
                          next.cameraEffects = [];
                          setMessage(
                            "Zooms were removed because camera framing was reset.",
                          );
                        }
                      }
                      update(next);
                    }}
                  />
                )}
              </>
            )}
          </ControlPanel>
          <ControlPanel id={tabsId} value="captions" active={setting}>
            <EditorInspectorLayout
              title="Captions"
              collectionLabel="Caption timeline"
              context={activeOccurrence === "hook" ? "Hook" : "Main clip"}
              label="Caption panes"
              collapsible
              revealKey={inspectorRequest}
              selectionKey={timelineSelection?.key}
            >
              {setting === "captions" &&
                timeline("caption", "Caption timeline")}
              <EditorInspector title="Caption properties" disabled={pending}>
                {activeOccurrence === "hook" &&
                !base.overlay.captions.length ? (
                  <div className="caption-empty">
                    <h4>No captions in this Hook</h4>
                    <Button
                      variant="secondary"
                      disabled={pending || !rootBase.overlay.captions.length}
                      onClick={() => {
                        const fresh = copyOwnerHookContent(
                          rootBase,
                          masterDraft,
                          clip.assets,
                          clip.audioAssets ?? [],
                          masterDraft.hook!,
                          undefined,
                          clip.videoAssets,
                        );
                        const detached = withIndependentOwnerHook(
                          rootBase,
                          masterDraft,
                          clip.assets,
                          clip.audioAssets ?? [],
                          masterDraft.hook,
                          clip.videoAssets,
                        );
                        update(
                          {
                            ...detached,
                            hookContent: {
                              ...detached.hookContent!,
                              captions: fresh.captions,
                              words: fresh.words,
                              edits: {
                                ...detached.hookContent!.edits,
                                captionText: [],
                                captionSpeakers: fresh.edits.captionSpeakers,
                                captions: fresh.edits.captions,
                              },
                            },
                          },
                          true,
                        );
                      }}
                    >
                      Copy main captions
                    </Button>
                  </div>
                ) : !base.overlay.captions.length ? (
                  <div className="caption-empty">
                    <h4>No captions yet</h4>
                    {generating ? (
                      <ProcessingState label="Generating captions" />
                    ) : captionConfirm ? (
                      <p>
                        {captionProvider === "local-speech"
                          ? "Generate captions on this computer? This clip’s audio stays local."
                          : "Send this clip’s audio to Gemini to generate captions? This uses Gemini credits, including in fake mode."}
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
                          <p>
                            {captionProvider === "local-speech"
                              ? "Local captions are unavailable. Check backend setup."
                              : "Gemini setup is required to generate captions."}
                          </p>
                        )}
                        {(clip.captionAttempts ?? 0) >=
                          OWNER_CAPTION_GENERATION_ATTEMPTS && (
                          <p>Caption generation limit reached for this clip.</p>
                        )}
                        {dirty && <p>Wait for your changes to save.</p>}
                      </>
                    )}
                    <InlineFeedback message={messageFor("captions")} />
                  </div>
                ) : (
                  <>
                    <ControlTabs
                      id={`${tabsId}-caption`}
                      label="Caption controls"
                      items={[
                        {
                          value: "style",
                          label: "Style",
                          issue:
                            captionIssueTab === "style"
                              ? captionIssue
                              : undefined,
                        },
                        {
                          value: "position",
                          label: "Position",
                          issue:
                            captionIssueTab === "position"
                              ? captionIssue
                              : undefined,
                        },
                        {
                          value: "text",
                          label: "Text",
                          issue:
                            captionIssueTab === "text"
                              ? captionIssue
                              : undefined,
                        },
                        {
                          value: "speakers",
                          label: "Speakers",
                          issue:
                            captionIssueTab === "speakers"
                              ? captionIssue
                              : undefined,
                        },
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
                        presetPicker={
                          <CaptionPresetPicker
                            value={caption}
                            onChange={(preset) =>
                              setCaption(ownerCaptionPreset(caption, preset))
                            }
                          />
                        }
                        feedback={
                          <InlineFeedback
                            message={
                              !draft.captionText?.some((word) =>
                                captionWordError(word.text),
                              ) && captionIssueTab === "style"
                                ? captionIssue
                                : undefined
                            }
                          />
                        }
                        value={caption}
                        onChange={(style) =>
                          setCaption({ ...caption, ...style })
                        }
                        onPreset={(preset) =>
                          setCaption(ownerCaptionPreset(caption, preset))
                        }
                      />
                      <div className="editor-fields">
                        {caption.material === "glass" && (
                          <label>
                            Glass opacity (
                            {Math.round(
                              (caption.glassOpacity ?? OWNER_GLASS_OPACITY) *
                                100,
                            )}
                            %)
                            <input
                              aria-label="Glass opacity"
                              type="range"
                              min="0"
                              max="100"
                              step="1"
                              value={
                                (caption.glassOpacity ?? OWNER_GLASS_OPACITY) *
                                100
                              }
                              onChange={(event) =>
                                setCaption({
                                  ...caption,
                                  glassOpacity:
                                    Number(event.currentTarget.value) / 100,
                                })
                              }
                            />
                          </label>
                        )}
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
                          <EditorColorControl
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
                        defaultCenter={OWNER_CAPTION_DEFAULT_CENTER_Y}
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
                      <InlineFeedback
                        message={
                          captionIssueTab === "position"
                            ? captionIssue
                            : undefined
                        }
                      />
                    </div>
                    <Button
                      variant="secondary"
                      type="button"
                      hidden={
                        captionTab === "text" || captionTab === "speakers"
                      }
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
                          selectedIndex={
                            timelineSelection?.kind === "caption"
                              ? timelineSelection.index
                              : undefined
                          }
                          startIndex={0}
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
                    <div
                      role="tabpanel"
                      id={`${tabsId}-caption-speakers-panel`}
                      aria-labelledby={`${tabsId}-caption-speakers`}
                      hidden={captionTab !== "speakers"}
                      tabIndex={0}
                    >
                      {captionTab === "speakers" && overlay.captionSpeakers && (
                        <CaptionSpeakers
                          value={overlay.captionSpeakers}
                          captions={overlay.captions}
                          style={caption}
                          onChange={(captionSpeakers) =>
                            update({ ...draft, captionSpeakers })
                          }
                        />
                      )}
                      <InlineFeedback
                        message={
                          captionIssueTab === "speakers"
                            ? captionIssue
                            : undefined
                        }
                      />
                    </div>
                  </>
                )}
              </EditorInspector>
            </EditorInspectorLayout>
          </ControlPanel>
          <ControlPanel id={tabsId} value="filters" active={setting}>
            <EditorInspectorLayout
              title="Filters"
              collectionLabel="Timed ranges"
              context={activeOccurrence === "hook" ? "Hook" : "Main clip"}
              label="Filter panes"
              collapsible
              revealKey={inspectorRequest}
              selectionKey={timelineSelection?.key}
            >
              {setting === "filters" && timeline("look", "Filter timeline")}
              {setting === "filters" && (
                <EditorInspector title="Filter properties" disabled={pending}>
                  <FilterInspector
                    sourceUrl={`${endpoint}/source`}
                    feedback={
                      errorSection === "filters" &&
                      errorOccurrence === activeOccurrence
                        ? (error ?? messageFor("filters"))
                        : messageFor("filters")
                    }
                    cue={selectedFilter}
                    frames={base.overlay.frames}
                    player={player}
                    available={
                      previewLoaded &&
                      !playbackFailed &&
                      !pending &&
                      !previewUnavailable
                    }
                    attempt={previewAttempt}
                    disabled={pending}
                    onChange={changeFilter}
                  />
                </EditorInspector>
              )}
            </EditorInspectorLayout>
          </ControlPanel>
          <ControlPanel id={tabsId} value="pictures" active={setting}>
            <EditorInspectorLayout
              title="Media"
              collectionLabel="Your media"
              context={activeOccurrence === "hook" ? "Hook" : "Main clip"}
              label="Media panes"
              collapsible
              revealKey={inspectorRequest}
              selectionKey={`${mediaTab}:${timelineSelection?.key ?? selection}`}
            >
              <ControlTabs
                id={`${tabsId}-media`}
                label="Media controls"
                items={[
                  { value: "pictures", label: "Pictures" },
                  { value: "videos", label: "Videos" },
                  { value: "audio", label: "Audio" },
                ]}
                value={mediaTab}
                onChange={(value) => {
                  setMediaTab(value);
                  if (value !== "audio") {
                    const first = draft.visuals.find(
                      (cue) => Boolean(cue.video) === (value === "videos"),
                    );
                    setSelection(first?.id ?? "");
                  }
                }}
                disabled={pending || audioImport !== null}
              />
              <div
                role="tabpanel"
                id={`${tabsId}-media-${mediaTab === "videos" ? "videos" : "pictures"}-panel`}
                aria-labelledby={`${tabsId}-media-${mediaTab === "videos" ? "videos" : "pictures"}`}
                hidden={mediaTab !== "pictures" && mediaTab !== "videos"}
              >
                {setting === "pictures" &&
                  (mediaTab === "pictures" || mediaTab === "videos") &&
                  timeline("picture", "Visual timeline")}
                <VisualLayers
                  cues={draft.visuals}
                  selected={selection}
                  disabled={pending || trackingMode || audioImport !== null}
                  workspaceId={workspaceId}
                  frameOffset={filterOffset}
                  onChange={(visuals) => update({ ...draft, visuals })}
                  onSelect={(cue) => {
                    setTimelineSelection(undefined);
                    choosePicture(cue);
                  }}
                />
                <div
                  className="picture-tools"
                  aria-label="AI visuals"
                  hidden={mediaTab === "videos"}
                >
                  <Button
                    variant="secondary"
                    onClick={() => void findVisuals()}
                    disabled={
                      pending ||
                      dirty ||
                      stale ||
                      !visualDiscovery ||
                      activeOccurrence === "hook" ||
                      draft.visuals.filter(
                        (cue) =>
                          clip.assets.find((asset) => asset.id === cue.assetId)
                            ?.origin === "owner-supplied",
                      ).length >= OWNER_PICTURE_LIMITS.cuesPerClip ||
                      (clip.visualAttempts ?? 0) >=
                        OWNER_BATCH_POLICY.visualDiscoveryAttempts ||
                      clip.assets.length >= OWNER_PICTURE_LIMITS.assetsPerClip
                    }
                    title={dirty ? "Wait for your changes to save" : undefined}
                  >
                    {findingVisuals ? (
                      <ActivityIndicator size={18} />
                    ) : (
                      <Sparkles size={18} aria-hidden="true" />
                    )}
                    {findingVisuals ? "Finding visuals…" : "Find visuals"}
                  </Button>
                  {findingVisuals && (
                    <Button
                      variant="quiet"
                      aria-label="Cancel visual search"
                      onClick={() => request.current?.abort()}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
                <fieldset disabled={pending}>
                  <legend className="local-sr-only">
                    {mediaTab === "videos" ? "Videos" : "Pictures"}
                  </legend>
                  <div className="picture-tools">
                    <Button
                      variant="secondary"
                      disabled={
                        pending ||
                        (mediaTab === "videos"
                          ? (clip.videoAssets?.length ?? 0) >=
                            OWNER_VIDEO_LIMITS.assets
                          : clip.assets.length >=
                            OWNER_PICTURE_LIMITS.assetsPerClip) ||
                        draft.visuals.length >= OWNER_PICTURE_LIMITS.cuesPerClip
                      }
                      onClick={() => pictureInput.current?.click()}
                    >
                      {pending && !findingVisuals ? (
                        <ActivityIndicator size={18} />
                      ) : (
                        <Upload size={18} aria-hidden="true" />
                      )}
                      {pending && !findingVisuals
                        ? "Uploading…"
                        : mediaTab === "videos"
                          ? "Upload video"
                          : "Upload image"}
                    </Button>
                    <Button
                      variant="quiet"
                      disabled={
                        !(mediaTab === "videos"
                          ? clip.videoAssets?.length
                          : clip.assets.length) ||
                        draft.visuals.length >= OWNER_PICTURE_LIMITS.cuesPerClip
                      }
                      onClick={() => {
                        const cue = newPicture(
                          (selectedCue &&
                          Boolean(selectedCue.video) === (mediaTab === "videos")
                            ? selectedCue.assetId
                            : undefined) ??
                            (mediaTab === "videos"
                              ? clip.videoAssets![0]!.id
                              : clip.assets[0]!.id),
                        );
                        if (mediaTab === "videos") {
                          const asset = clip.videoAssets!.find(
                            (asset) => asset.id === cue.assetId,
                          )!;
                          cue.video = {
                            offsetFrame: 0,
                            sourceEndFrame: asset.frames,
                            volume: 100,
                            muted: true,
                          };
                          cue.endFrame = Math.min(
                            cue.endFrame,
                            cue.startFrame + asset.frames,
                          );
                        }
                        update({ ...draft, visuals: [...draft.visuals, cue] });
                        choosePicture(cue);
                      }}
                    >
                      {mediaTab === "videos" ? "Add video" : "Add picture"}
                    </Button>
                  </div>
                  <input
                    ref={pictureInput}
                    className="local-file-input"
                    aria-label={
                      mediaTab === "videos" ? "Upload video" : "Upload picture"
                    }
                    type="file"
                    accept={
                      mediaTab === "videos"
                        ? "video/mp4,video/quicktime"
                        : "image/jpeg,image/png,image/webp"
                    }
                    disabled={
                      pending ||
                      (mediaTab === "videos"
                        ? (clip.videoAssets?.length ?? 0) >=
                          OWNER_VIDEO_LIMITS.assets
                        : clip.assets.length >=
                          OWNER_PICTURE_LIMITS.assetsPerClip) ||
                      draft.visuals.length >= OWNER_PICTURE_LIMITS.cuesPerClip
                    }
                    onChange={(event) => {
                      const file = event.currentTarget.files?.[0];
                      if (mediaTab === "videos") {
                        if (
                          file &&
                          file.size > 0 &&
                          file.size <= OWNER_VIDEO_LIMITS.inputBytes
                        )
                          void perform("video", file);
                        else {
                          ownMessage("pictures");
                          setMessage("Choose an MP4 or MOV under 64 MB.");
                        }
                      } else upload(file);
                      event.currentTarget.value = "";
                    }}
                  />
                  <p className="source-hint">
                    {mediaTab === "videos"
                      ? "MP4, MOV · Max 64 MB · 2 minutes"
                      : "JPEG, PNG, WebP · Max 4 MB"}
                  </p>
                  <InlineFeedback message={messageFor("pictures")} />
                  {(mediaTab === "pictures" || mediaTab === "videos") &&
                    selectedCue &&
                    Boolean(selectedCue.video) === (mediaTab === "videos") && (
                      <EditorInspector
                        title={
                          selectedCue.video
                            ? "Video properties"
                            : "Picture properties"
                        }
                        disabled={pending}
                      >
                        <ControlTabs
                          id={`${tabsId}-picture`}
                          label={
                            selectedCue.video
                              ? "Video controls"
                              : "Picture controls"
                          }
                          items={[
                            {
                              value: "image",
                              label: selectedCue.video ? "Video" : "Image",
                              issue:
                                pictureIssueTab === "image"
                                  ? pictureIssue
                                  : undefined,
                            },
                            {
                              value: "timing",
                              label: "Timing",
                              issue:
                                pictureIssueTab === "timing"
                                  ? pictureIssue
                                  : undefined,
                            },
                            {
                              value: "position",
                              label: "Position",
                              issue:
                                pictureIssueTab === "position"
                                  ? pictureIssue
                                  : undefined,
                            },
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
                          <VisualPresentation
                            validationMessage={
                              errorPath.includes("focal") ||
                              errorPath.includes("presentation")
                                ? pictureIssue
                                : undefined
                            }
                            cue={selectedCue}
                            onChange={setCue}
                            onBackground={(cue) =>
                              update({
                                ...draft,
                                visuals: [
                                  cue,
                                  ...draft.visuals.filter(
                                    (item) => item.id !== cue.id,
                                  ),
                                ],
                              })
                            }
                          />
                          {selectedCue.video &&
                            clip.videoAssets?.find(
                              (asset) => asset.id === selectedCue.assetId,
                            ) && (
                              <VideoSourceControls
                                active={
                                  setting === "pictures" &&
                                  mediaTab === "videos" &&
                                  pictureTab === "image" &&
                                  !pending
                                }
                                validationMessage={
                                  errorPath.includes("video")
                                    ? pictureIssue
                                    : undefined
                                }
                                key={selectedCue.id}
                                workspaceId={workspaceId}
                                cue={selectedCue}
                                asset={clip.videoAssets.find(
                                  (asset) => asset.id === selectedCue.assetId,
                                )!}
                                onChange={setCue}
                              />
                            )}
                          <div className="editor-fields">
                            <label>
                              {selectedCue.video ? "Video" : "Image"}
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
                                {(selectedCue.video
                                  ? (clip.videoAssets ?? [])
                                  : clip.assets
                                ).map((asset, index) => (
                                  <option key={asset.id} value={asset.id}>
                                    {selectedCue.video ? "Video" : "Image"}{" "}
                                    {index + 1}
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
                                draft.visuals.find(
                                  (cue) => cue.id !== selectedCue.id,
                                )?.id ?? "captions",
                              );
                            }}
                          >
                            {selectedCue.video
                              ? "Remove video"
                              : "Remove picture"}
                          </Button>
                          {pictureIssueTab === "image" &&
                            !errorPath.some((part) =>
                              ["video", "focal", "presentation"].includes(
                                String(part),
                              ),
                            ) && <InlineFeedback message={pictureIssue} />}
                        </div>
                        <div
                          role="tabpanel"
                          id={`${tabsId}-picture-timing-panel`}
                          aria-labelledby={`${tabsId}-picture-timing`}
                          hidden={pictureTab !== "timing"}
                          tabIndex={0}
                        >
                          <PictureTiming
                            label={selectedCue.video ? "Video" : "Picture"}
                            key={selectedCue.id}
                            validationMessage={
                              pictureIssueTab === "timing"
                                ? (pictureIssue ?? undefined)
                                : undefined
                            }
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
                          id={`${tabsId}-picture-position-panel`}
                          aria-labelledby={`${tabsId}-picture-position`}
                          hidden={pictureTab !== "position"}
                          tabIndex={0}
                        >
                          <PositionPresets
                            label={selectedCue.video ? "Video" : "Picture"}
                            kind={selectedCue.video ? "video" : "picture"}
                            box={selectedCue.box}
                            onChange={(box) => setCue({ ...selectedCue, box })}
                          />
                          <BoxFields
                            label={selectedCue.video ? "Video" : "Picture"}
                            box={selectedCue.box}
                            onChange={(box) => setCue({ ...selectedCue, box })}
                          />
                          {pictureIssueTab === "position" && (
                            <InlineFeedback message={pictureIssue} />
                          )}
                        </div>
                      </EditorInspector>
                    )}
                </fieldset>
              </div>
              <div
                role="tabpanel"
                id={`${tabsId}-media-audio-panel`}
                aria-labelledby={`${tabsId}-media-audio`}
                hidden={mediaTab !== "audio"}
              >
                {setting === "pictures" &&
                  mediaTab === "audio" &&
                  audioImport === null &&
                  timeline("audio", "Audio timeline")}
                {setting === "pictures" &&
                  mediaTab === "audio" &&
                  audioImport !== null && (
                    <EditorInspector title="Import audio">
                      <YoutubeAudioIntake
                        value={audioImport}
                        pending={pending}
                        onChange={setAudioImport}
                        message={message}
                        onDownload={() => void perform("youtube-audio")}
                        onBack={() => {
                          request.current?.abort();
                          setAudioUploading(false);
                          setAudioImport(null);
                          setMessage("");
                        }}
                      />
                    </EditorInspector>
                  )}
                {setting === "pictures" &&
                  mediaTab === "audio" &&
                  audioImport === null && (
                    <AudioInspector
                      uploadFeedback={messageFor("audio")}
                      validationFeedback={
                        errorSection === "pictures" &&
                        errorField === "audio" &&
                        errorOccurrence === activeOccurrence
                          ? (error ?? undefined)
                          : undefined
                      }
                      key={`${activeOccurrence}:${importedAudioCue ?? ""}:${audioPicture ?? ""}`}
                      hideCueList
                      linkedVisual={draft.visuals.find(
                        (cue) => cue.id === audioPicture,
                      )}
                      onBackToPicture={
                        audioPicture
                          ? () => {
                              revealInspector();
                              setMediaTab(
                                draft.visuals.find(
                                  (cue) => cue.id === audioPicture,
                                )?.video
                                  ? "videos"
                                  : "pictures",
                              );
                              setAudioPicture(undefined);
                            }
                          : undefined
                      }
                      audio={draft.audio}
                      visuals={overlay.visuals}
                      assets={clip.audioAssets ?? []}
                      frames={base.overlay.frames}
                      hook={draft.hook}
                      player={player}
                      available={!playbackFailed && previewLoaded}
                      attempt={previewAttempt}
                      pending={pending || !!hookDraft}
                      initialCueId={importedAudioCue}
                      onHookSound={
                        masterDraft.hook && !hookDraft && !audioPicture
                          ? (soundId) => {
                              player.current?.pause();
                              ownMessage("audio");
                              try {
                                const next = changeHook(masterDraft.hook, {
                                  soundId,
                                  audio: true,
                                });
                                ownMessage("audio");
                                const cue =
                                  next?.hookContent?.edits.audio?.cues.find(
                                    (cue) => cue.suggestedHook,
                                  );
                                if (cue) {
                                  setImportedAudioCue(cue.id);
                                  setTimelineSelection({
                                    key: `hook:audio:${cue.id}`,
                                    kind: "audio",
                                    occurrence: "hook",
                                    id: cue.id,
                                    index:
                                      next!.hookContent!.edits.audio!.cues.indexOf(
                                        cue,
                                      ),
                                    title: "",
                                    startFrame: 0,
                                    endFrame: 0,
                                  });
                                  setMessage("");
                                }
                              } catch {
                                ownMessage("audio");
                                setMessage(
                                  "Remove an audio layer to make room for the Hook’s riser.",
                                );
                              }
                            }
                          : undefined
                      }
                      onYoutube={
                        youtubeAudio
                          ? () => {
                              setMessage("");
                              setCaptionConfirm(false);
                              setImportedAudioCue(undefined);
                              player.current?.pause();
                              setAudioImport("");
                            }
                          : undefined
                      }
                      onChange={(audio) => {
                        const added = audio.cues.find(
                          (cue) =>
                            !draft.audio?.cues.some((old) => old.id === cue.id),
                        );
                        if (added) {
                          setImportedAudioCue(added.id);
                          setTimelineSelection({
                            key: `${activeOccurrence}:audio:${added.id}`,
                            kind: "audio",
                            occurrence: activeOccurrence,
                            id: added.id,
                            index: audio.cues.length - 1,
                            title: "",
                            startFrame: 0,
                            endFrame: 0,
                          });
                        }
                        update({ ...draft, audio });
                      }}
                      onUpload={async (file) => {
                        if (
                          file.size < 1 ||
                          file.size > OWNER_AUDIO_LIMITS.inputBytes ||
                          (clip.audioAssets?.length ?? 0) >=
                            OWNER_AUDIO_LIMITS.assets ||
                          (draft.audio?.cues.length ?? 0) >=
                            OWNER_AUDIO_LIMITS.cues
                        ) {
                          ownMessage("audio");
                          setMessage("Choose audio under 12 MB and 2 minutes.");
                          return null;
                        }
                        return (await perform("audio", file)) ?? null;
                      }}
                    />
                  )}
              </div>
            </EditorInspectorLayout>
          </ControlPanel>
          {actionsVisible &&
            audioImport === null &&
            !stale &&
            messageFor("action") && (
              <WorkflowActions
                target={actionTarget}
                label="Editor feedback"
                feedback
              >
                <InlineFeedback message={messageFor("action")} />
              </WorkflowActions>
            )}
          {actionsVisible && audioUploading && audioImport === null && (
            <WorkflowActions target={actionTarget} label="Audio upload actions">
              <Button
                variant="secondary"
                onClick={() => request.current?.abort()}
              >
                Cancel upload
              </Button>
            </WorkflowActions>
          )}
          {actionsVisible &&
            audioImport === null &&
            !audioUploading &&
            captionConfirm && (
              <WorkflowActions
                target={actionTarget}
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
                  busy={generating}
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
          {actionsVisible && titleLoading && setting !== "hook" && (
            <WorkflowActions
              target={actionTarget}
              feedback
              label="Hook title progress"
            >
              <HookTitleProgress
                id={`${tabsId}-hook-title-progress`}
                onCancel={cancelHookTitle}
              />
            </WorkflowActions>
          )}
          {actionsVisible &&
            setting === "hook" &&
            !hookDraft &&
            masterDraft.hook &&
            !pending &&
            !trackingMode &&
            !captionConfirm &&
            (titleCanRetry || titleNeedsAccept) && (
              <WorkflowActions target={actionTarget} label="Hook title actions">
                {titleCanRetry && (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      queueHookTitle(masterDraft, masterDraft.hook!, true)
                    }
                  >
                    Retry title
                  </Button>
                )}
                {titleNeedsAccept && offeredTitle && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const result = offeredTitle;
                      setForm((current) => ({
                        ...current,
                        draft: acceptHookTitle(current.draft, result, "", true),
                      }));
                    }}
                  >
                    Use AI title
                  </Button>
                )}
              </WorkflowActions>
            )}
        </div>
      </div>
    </section>
  );
  return (
    <EditorPresentationClock value={true}>
      <EditorHookClock value={masterDraft.hook}>
        <EditorOccurrence
          value={setting === "hook" ? undefined : activeOccurrence}
        >
          <TextSelectionScope
            session={{
              layer:
                draft.texts?.find((layer) => layer.id === selection) ?? null,
              selection:
                textRange?.layerId === selection &&
                textRange.occurrence === activeOccurrence &&
                textRange.text ===
                  draft.texts?.find((layer) => layer.id === selection)?.text &&
                setting === "text" &&
                !pending
                  ? textRange
                  : null,
              begin: (layer) => {
                if (pending || !previewLoaded || playbackFailed) return;
                chooseText(layer);
                setTextTab("style");
                setTextRange({
                  layerId: layer.id,
                  text: layer.text,
                  occurrence: activeOccurrence,
                  start: 0,
                  end: 0,
                  editing: true,
                });
              },
              select: (layer, start, end, editing) => {
                if (pending) return;
                diagnostics.action("selection");
                const bounded = boundedTextSelection(layer.text, start, end);
                setTextRange((prior) => {
                  const next = {
                    layerId: layer.id,
                    text: layer.text,
                    occurrence: activeOccurrence,
                    ...bounded,
                    editing:
                      editing ??
                      ((prior?.layerId === layer.id &&
                        prior.occurrence === activeOccurrence &&
                        prior.editing) ||
                        false),
                  };
                  return JSON.stringify(prior) === JSON.stringify(next)
                    ? prior
                    : next;
                });
              },
              whole: () => {
                setTextRange(null);
                player.current?.pause();
                document
                  .getElementById(`${tabsId}-text-controls-${textTab}`)
                  ?.focus();
              },
              change: (layer, start, end) => {
                if (pending) return;
                update({
                  ...draft,
                  texts: (draft.texts ?? []).map((item) =>
                    item.id === layer.id ? layer : item,
                  ),
                });
                if (start !== undefined)
                  setTextRange({
                    layerId: layer.id,
                    text: layer.text,
                    occurrence: activeOccurrence,
                    ...boundedTextSelection(layer.text, start, end ?? start),
                    editing: true,
                  });
              },
              report: (text) => {
                ownMessage("text");
                setMessage(text);
              },
            }}
          >
            {content}
          </TextSelectionScope>
        </EditorOccurrence>
      </EditorHookClock>
    </EditorPresentationClock>
  );
}
