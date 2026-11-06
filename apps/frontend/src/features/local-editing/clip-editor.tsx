import { pictureLinkedAudio } from "./picture-audio.ts";
import { EditorTimeline, PictureTimelineAudio } from "./editor-timeline.tsx";
import {
  editorTimelineItems,
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
import {
  Captions,
  Images,
  LoaderCircle,
  Magnet,
  RotateCw,
  ScanFace,
  Sparkles,
  SlidersHorizontal,
  Type,
  Upload,
} from "lucide-react";
import { WorkflowActions } from "./workflow-actions.tsx";
import { ControlTabs } from "./control-tabs.tsx";
import { InlineFeedback } from "../../shared/ui/inline-feedback";
import { ZodError } from "zod";
import { textLayerErrors, captionWordError } from "./text-validation.ts";
import { FocusPreviewControls } from "./focus-preview-controls.tsx";
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
} from "./hook-edit.ts";
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
import { TextInspector } from "./text-inspector.tsx";
import {
  TextSelectionContext,
  TextSelectionScope,
  PreviewTextEditor,
  boundedTextSelection,
  type TextSelection,
} from "./text-selection.tsx";
import { BoxFields, TextPositionFields } from "./position-fields.tsx";
import { OWNER_SOCIAL_TEXT_PRESETS } from "../../../../../packages/contracts/local/text-style.ts";
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
  useContext,
  useEffectEvent,
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
  Img,
  Sequence,
  useCurrentFrame,
  useCurrentScale,
  useVideoConfig,
} from "remotion";
import {
  OwnerAutomaticOverlay,
  type OwnerOverlayImageProps,
} from "../../../../../packages/composition/local/automatic-overlay.tsx";

export const bufferedOverlayImage = (props: OwnerOverlayImageProps) => (
  <Img {...props} pauseWhenLoading maxRetries={0} />
);
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
  ownerEditDocumentSchema,
  ownerEditRequestSchema,
  type OwnerCaptionStyle,
  type OwnerEditDocument,
} from "../../../../../packages/contracts/local/editor.ts";
import {
  OWNER_PICTURE_LIMITS,
  OWNER_VISUAL_ANIMATIONS,
  OWNER_VISUAL_DEFAULT_MOTION,
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

const SETTINGS = [
  "captions",
  "text",
  "filters",
  "pictures",
  "focus",
  "hook",
] as const;
type EditorSetting = (typeof SETTINGS)[number];
const SETTING_ICONS = {
  captions: Captions,
  text: Type,
  filters: SlidersHorizontal,
  pictures: Images,
  focus: ScanFace,
  hook: Magnet,
} as const;
const SETTING_LABELS = {
  captions: "Captions",
  text: "Text",
  filters: "Filters",
  pictures: "Media",
  focus: "Focus",
  hook: "Hook",
} as const;

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
}: {
  id: string;
  label: string;
  box: OwnerEditorBox;
  selected: boolean;
  caption: OwnerTextGeometry | null;
  onEdit?: (() => void) | undefined;
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
} & LayerControls) {
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
        overlay={paintedOverlay}
        assets={assets}
        frame={presentationFrame}
        renderImage={bufferedOverlayImage}
        onImageError={onPlaybackError}
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

/** Hook choices may request a title; only Apply writes the editor revision. */
export function ClipEditor({
  clip,
  workspaceId,
  source,
  onAccepted,
  onDirty,
  footerTarget,
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
}: {
  clip: OwnerClip;
  workspaceId: string;
  source?: { width: number; height: number };
  onAccepted: (list: OwnerClipList) => void;
  onDirty: (clipId: string, dirty: boolean) => void;
  footerTarget?: HTMLElement | null | undefined;
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
}) {
  const [form, setForm] = useState(() => {
    const original = initialOwnerEdit(clip);
    return { original, draft: structuredClone(original) };
  });
  const [occurrence, setOccurrence] = useState<OwnerEditOccurrence>(
    clip.edit?.hook ? "hook" : "body",
  );
  const [hookDraft, setHookDraft] = useState<OwnerHookDraft | undefined>(
    undefined,
  );
  const [hookTitleState, setHookTitleState] = useState<HookTitleState | null>(
    null,
  );
  const [hookTitles] = useState(() => new HookTitleRequests(setHookTitleState));
  useEffect(
    () => () => hookTitles.cancel(),
    [hookTitles, clip.revision, workspaceId],
  );
  const [selection, setSelection] = useState("captions");
  const [timelineSelection, setTimelineSelection] = useState<
    EditorTimelineItem | undefined
  >();
  const [audioPicture, setAudioPicture] = useState<string | undefined>();
  const [setting, setSetting] = useState<EditorSetting>("captions");
  const [mediaTab, setMediaTab] = useState("pictures");
  const [captionTab, setCaptionTab] = useState("style");
  const [textTab, setTextTab] = useState("content");
  const [textRange, setTextRange] = useState<TextSelection | null>(null);
  const [pictureTab, setPictureTab] = useState("image");
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
  const [captionConfirm, setCaptionConfirm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [findingVisuals, setFindingVisuals] = useState(false);
  const captionWasConfirming = useRef(false);
  const player = useRef<PlayerRef | null>(null);
  const alive = useRef(true);
  const [playbackFailed, setPlaybackFailed] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  useEffect(() => {
    if (previewLoaded) onPreviewReady?.();
  }, [previewLoaded, onPreviewReady]);
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
  const changed =
    hookDraft !== undefined || !sameOwnerEdit(form.original, form.draft);
  const revisionChanged = form.original.revision !== clip.revision;
  const original =
    revisionChanged && !changed ? initialOwnerEdit(clip) : form.original;
  const masterDraft = revisionChanged && !changed ? original : form.draft;
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
      if (typeof field === "string") errorSection = owners[field] ?? setting;
    }
    error =
      draft.videoLooks &&
      (!ownerVideoLooksSchema.safeParse(draft.videoLooks).success ||
        !ownerVideoLooksFit(draft.videoLooks, {
          startFrame:
            activeOccurrence === "hook" ? masterDraft.hook!.startFrame : 0,
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
                (layer) => !ownerLayerTextSchema.safeParse(layer.text).success,
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
                      (!ownerCameraEffectsSchema.safeParse(draft.cameraEffects)
                        .success ||
                        !ownerCameraEffectsFit(draft.cameraEffects, {
                          frames: base.overlay.frames,
                          hook: draft.hook,
                          cameraTracks: draft.cameraTracks,
                        }))
                    ? "Keep zooms apart and leave room for their automatic return."
                    : draft.cameraTracks &&
                        (!ownerCameraTracksSchema.safeParse(draft.cameraTracks)
                          .success ||
                          !ownerCameraTracksFit(
                            draft.cameraTracks,
                            draft.focus ?? base.overlay.focus,
                            { frames: base.overlay.frames, hook: draft.hook },
                          ))
                      ? "Keep motion within this camera and occurrence; leave it separate from Zoom."
                      : draft.focus &&
                          !ownerFocusSchema.safeParse(draft.focus).success
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
      playbackOverlay = compileOwnerOverlay(
        rootBase,
        original,
        clip.assets,
        clip.audioAssets,
      );
    } catch {
      previewUnavailable = true;
    }
  }
  const overlay = ownerOccurrenceOverlay(playbackOverlay, activeOccurrence);
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
  const reportPending = useEffectEvent((value: boolean) => onPending?.(value));
  const reportBusy = useEffectEvent((value: boolean) => onBusy?.(value));
  const reportDirty = useEffectEvent((value: boolean) =>
    onDirty(clip.id, value),
  );
  const editorDirty =
    dirty ||
    trackingMode ||
    captionConfirm ||
    generating ||
    (audioUploading && audioImport === null);
  useEffect(() => {
    reportPending(pending || titleLoading);
  }, [pending, titleLoading]);
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
    if (!dirty && !trackingMode) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, trackingMode]);

  function update(next: OwnerEditDocument, global = false) {
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
  function changeHook(hook: OwnerEditDocument["hook"], suggested = false) {
    hookTitles.cancel();
    setHookTitleState(null);
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
    let next: OwnerEditDocument;
    try {
      next = withIndependentOwnerHook(
        rootBase,
        validPrior,
        clip.assets,
        clip.audioAssets ?? [],
        hook,
      );
    } catch {
      setMessage(
        "Complete invalid edits or combine filter ranges before changing the Hook.",
      );
      return;
    }
    if (!hook) next = changeManualOwnerHook(next, undefined);
    else if (suggested && next.hookContent) {
      const scoped = { ...next, ...next.hookContent.edits };
      const accepted = acceptSuggestedOwnerHook(
        scoped,
        hook,
        crypto.randomUUID(),
      );
      next = {
        ...next,
        hookContent: {
          ...next.hookContent,
          edits: ownerContentEdits(accepted),
        },
      };
    }
    update(next, true);
    if (hook && JSON.stringify(hook) !== JSON.stringify(masterDraft.hook))
      queueHookTitle(next, hook);
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
      if (cue) setCue({ ...cue, box });
    }
  }
  function selectLayer(id: string) {
    if (id !== selection) setTextRange(null);
    setTimelineSelection(undefined);
    setMediaTab("pictures");
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
    setCaptionConfirm(false);
    if (value !== setting) setTextRange(null);
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
    setTextRange(null);
    if (pending || trackingMode || audioImport !== null) return;
    player.current?.pause();
    setOccurrence(item.occurrence);
    setTimelineSelection(item);
    setCaptionConfirm(false);
    setAudioPicture(undefined);
    if (item.kind === "picture" || item.kind === "text") setSelection(item.id);
    if (item.kind === "caption") setSelection("captions");
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
    const items = editorTimelineItems(playbackOverlay, kind);
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
            ? (item) => (
                <span
                  className="picture-thumb"
                  aria-hidden="true"
                  style={{
                    backgroundImage: `url(/api/local/workspace/${workspaceId}/assets/${ownerOccurrenceOverlay(playbackOverlay, item.occurrence).visuals[item.index]!.assetId})`,
                  }}
                />
              )
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
        box: { x: 0.1, y: 0.1, width: 0.8, height: 0.2 },
      },
    };
    update({ ...draft, texts: [...(draft.texts ?? []), layer] });
    setTextTab("content");
    chooseText(layer);
  }
  function newPicture(assetId: string): OwnerVisualEdit {
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
      box: { x: 0.1, y: 0.1, width: 0.8, height: 0.3 },
      fit: "contain",
      ...OWNER_VISUAL_DEFAULT_MOTION,
    };
  }
  function choosePicture(cue: OwnerVisualEdit) {
    setSelection(cue.id);
    player.current?.pause();
    player.current?.seekTo(
      ownerOccurrencePresentationFrame(
        overlay.hook,
        cue.startFrame +
          Math.min(
            cue.animationFrames ?? 9,
            Math.floor((cue.endFrame - cue.startFrame - 1) / 2),
          ),
        activeOccurrence,
      ),
    );
  }
  async function perform(
    kind: "edit" | "picture" | "reload" | "audio" | "youtube-audio",
    file?: File,
  ) {
    if (request.current || (kind === "edit" && hookDraft)) return;
    if (kind === "edit" && titleLoading) return;
    if (kind === "reload") {
      hookTitles.cancel();
      setHookTitleState(null);
    }
    ownMessage(
      kind === "picture"
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
          : kind === "edit"
            ? ownerEditRequestSchema.parse({
                operationId: crypto.randomUUID(),
                expectedRevision: original.revision,
                baseHash: original.baseHash,
                operations: ownerEditOperations(original, masterDraft, clip),
              })
            : null;
      const response = await fetch(
        kind === "reload"
          ? `/api/local/workspace/${workspaceId}/clips`
          : `${endpoint}/${kind}`,
        {
          method: kind === "reload" ? "GET" : "POST",
          signal: controller.signal,
          ...(kind === "edit" || kind === "youtube-audio"
            ? {
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
              }
            : kind === "picture" || kind === "audio"
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
      } else if (kind !== "picture") {
        setHookDraft(undefined);
        setTimelineSelection(undefined);
        setAudioPicture(undefined);
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
          ["enterFrames", "exitFrames", "entrance", "exit"].includes(
            String(part),
          ),
        )
      ? "motion"
      : errorPath.includes("assetId")
        ? "image"
        : "timing";
  const captionIssue =
    errorSection === "captions" && errorOccurrence === activeOccurrence
      ? (error ?? undefined)
      : undefined;
  const pictureIssue =
    errorSection === "pictures" &&
    errorField === "visuals" &&
    errorOccurrence === activeOccurrence &&
    (typeof errorPath[1] !== "number" ||
      draft.visuals[errorPath[1]]?.id === selectedCue?.id)
      ? (error ?? undefined)
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
    <section className="clip-editor" aria-label="Clip editor">
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
              controls
              clickToPlay={false}
              doubleClickToFullscreen={false}
              spaceKeyToPlayOrPause={false}
              style={{ width: "100%" }}
            />
          )}
        </div>
        <div className="editor-panels" hidden={!previewLoaded}>
          <ControlTabs
            id={tabsId}
            className="editor-tabs"
            label="Clip settings"
            items={SETTINGS.map((value) => ({
              value,
              label: SETTING_LABELS[value],
              icon: SETTING_ICONS[value],
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
                if (next === "pictures" && errorField === "visuals") {
                  setPictureTab(pictureIssueTab);
                  if (typeof errorPath[1] === "number") {
                    const edits =
                      errorOccurrence === "hook"
                        ? masterDraft.hookContent?.edits
                        : masterDraft;
                    const cue = edits?.visuals[errorPath[1]];
                    if (cue) setSelection(cue.id);
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
                const item = editorTimelineItems(playbackOverlay, "text").find(
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
          <div
            id={`${tabsId}-hook-panel`}
            role="tabpanel"
            aria-labelledby={`${tabsId}-hook`}
            hidden={setting !== "hook"}
            tabIndex={0}
          >
            {setting === "hook" && (
              <fieldset disabled={pending || !!error}>
                <legend className="local-sr-only">Hook</legend>
                <HookControls
                  hook={hookDraft ?? draft.hook}
                  suggestion={decodeOwnerHookSuggestion(
                    base.hookSuggestion,
                    base.overlay.frames,
                  )}
                  simulated={clip.mode === "synthetic-ai"}
                  suggestedAudio={
                    draft.audio?.cues.some((cue) => cue.suggestedHook) ?? false
                  }
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
                      ? completeOwnerHookDraft(next, base.overlay.frames)
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
                      changeHook(hook, true);
                      setHookDraft(undefined);
                      setMessage("");
                    } catch {
                      setMessage(
                        "Remove an audio layer to make room for the hook’s riser.",
                      );
                    }
                  }}
                />
                {masterDraft.hook && !hookDraft && (
                  <>
                    <InlineFeedback
                      tone={
                        titleLoading || !hookTitleSuggestions
                          ? "status"
                          : "error"
                      }
                      message={
                        currentTitle?.phase === "failed"
                          ? "Couldn’t suggest a title. Retry when ready."
                          : titleLoading
                            ? "Writing a title…"
                            : !hookTitleSuggestions
                              ? "AI titles unavailable."
                              : currentTitle?.phase !== "ready" &&
                                  (clip.hookTitleAttempts ?? 0) >=
                                    OWNER_HOOK_TITLE_LIMIT
                                ? "Title limit reached for this clip."
                                : undefined
                      }
                    />
                    {currentTitle?.result?.title && (
                      <p className="source-hint">
                        {clip.mode === "synthetic-ai"
                          ? "Simulated title"
                          : "AI title"}
                        : {currentTitle.result.title.text}
                      </p>
                    )}
                  </>
                )}
                {sectionIssue("hook")}
                <InlineFeedback message={messageFor("hook")} />
              </fieldset>
            )}
          </div>
          <div
            id={`${tabsId}-text-panel`}
            role="tabpanel"
            aria-labelledby={`${tabsId}-text`}
            hidden={setting !== "text"}
            tabIndex={0}
          >
            {setting === "text" && timeline("text", "Text layers")}
            {setting === "text" && (
              <fieldset disabled={pending}>
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
              </fieldset>
            )}
          </div>
          <div
            id={`${tabsId}-focus-panel`}
            className="focus-panel"
            role="tabpanel"
            aria-labelledby={`${tabsId}-focus`}
            hidden={setting !== "focus"}
            tabIndex={0}
          >
            {setting === "focus" && (
              <FocusPreviewControls
                feedback={
                  error &&
                  errorSection === "focus" &&
                  errorOccurrence === activeOccurrence
                    ? {
                        tab:
                          errorField === "cameraEffects"
                            ? "zoom"
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
                cameraTracks={draft.cameraTracks ?? []}
                onCameraTracks={(cameraTracks) =>
                  update({ ...draft, cameraTracks })
                }
                onTrackingMode={setTrackingMode}
                onTrackingBusy={setTrackingBusy}
                footerTarget={footerTarget}
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
          </div>
          <div
            id={`${tabsId}-captions-panel`}
            role="tabpanel"
            aria-labelledby={`${tabsId}-captions`}
            hidden={setting !== "captions"}
            tabIndex={0}
          >
            {setting === "captions" && timeline("caption", "Caption timeline")}
            {activeOccurrence === "hook" && !base.overlay.captions.length ? (
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
                    );
                    const detached = withIndependentOwnerHook(
                      rootBase,
                      masterDraft,
                      clip.assets,
                      clip.audioAssets ?? [],
                      masterDraft.hook,
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
                    {dirty && <p>Apply or discard your changes first.</p>}
                  </>
                )}
                <InlineFeedback message={messageFor("captions")} />
              </div>
            ) : (
              <>
                <fieldset disabled={pending}>
                  <legend className="local-sr-only">Captions</legend>
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
                          captionIssueTab === "text" ? captionIssue : undefined,
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
                    hidden={captionTab === "text" || captionTab === "speakers"}
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
                        startIndex={
                          timelineSelection?.kind === "caption" &&
                          timelineSelection.occurrence === activeOccurrence
                            ? timelineSelection.index
                            : 0
                        }
                        captions={
                          timelineSelection?.kind === "caption" &&
                          timelineSelection.occurrence === activeOccurrence &&
                          base.overlay.captions[timelineSelection.index]
                            ? [base.overlay.captions[timelineSelection.index]!]
                            : base.overlay.captions
                        }
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
            {setting === "filters" && timeline("look", "Filter timeline")}
            {setting === "filters" && (
              <FilterInspector
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
            )}
          </div>
          <div
            id={`${tabsId}-pictures-panel`}
            role="tabpanel"
            aria-labelledby={`${tabsId}-pictures`}
            hidden={setting !== "pictures"}
            tabIndex={0}
          >
            <ControlTabs
              id={`${tabsId}-media`}
              label="Media controls"
              items={[
                { value: "pictures", label: "Pictures" },
                { value: "audio", label: "Audio" },
              ]}
              value={mediaTab}
              onChange={setMediaTab}
              disabled={pending || audioImport !== null}
            />
            <div
              role="tabpanel"
              id={`${tabsId}-media-pictures-panel`}
              aria-labelledby={`${tabsId}-media-pictures`}
              hidden={mediaTab !== "pictures"}
            >
              {setting === "pictures" &&
                mediaTab === "pictures" &&
                timeline("picture", "Picture timeline")}
              <div className="picture-tools" aria-label="AI visuals">
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
                  title={
                    dirty ? "Apply or discard your edits first" : undefined
                  }
                >
                  {findingVisuals ? (
                    <LoaderCircle
                      size={18}
                      className="acquisition-spinner"
                      aria-hidden="true"
                    />
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
                <legend className="local-sr-only">Pictures</legend>
                <div className="picture-tools">
                  <Button
                    variant="secondary"
                    disabled={
                      pending ||
                      clip.assets.length >=
                        OWNER_PICTURE_LIMITS.assetsPerClip ||
                      draft.visuals.length >= OWNER_PICTURE_LIMITS.cuesPerClip
                    }
                    onClick={() => pictureInput.current?.click()}
                  >
                    {pending && !findingVisuals ? (
                      <LoaderCircle
                        size={18}
                        className="acquisition-spinner"
                        aria-hidden="true"
                      />
                    ) : (
                      <Upload size={18} aria-hidden="true" />
                    )}
                    {pending && !findingVisuals ? "Uploading…" : "Upload image"}
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
                <InlineFeedback message={messageFor("pictures")} />
                {selectedCue && (
                  <>
                    <ControlTabs
                      id={`${tabsId}-picture`}
                      label="Picture controls"
                      items={[
                        {
                          value: "image",
                          label: "Image",
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
                          value: "motion",
                          label: "Motion",
                          issue:
                            pictureIssueTab === "motion"
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
                            draft.visuals.find(
                              (cue) => cue.id !== selectedCue.id,
                            )?.id ?? "captions",
                          );
                        }}
                      >
                        Remove picture
                      </Button>
                      {pictureIssueTab === "image" && (
                        <InlineFeedback message={pictureIssue} />
                      )}
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
                                  [key]: event.currentTarget
                                    .value as NonNullable<
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
                      {pictureIssueTab === "motion" && (
                        <InlineFeedback message={pictureIssue} />
                      )}
                      <Button
                        variant="secondary"
                        disabled={!!error || playbackFailed}
                        onClick={() => {
                          player.current?.seekTo(
                            ownerOccurrencePresentationFrame(
                              overlay.hook,
                              selectedCue.startFrame,
                              activeOccurrence,
                            ),
                          );
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
                      {pictureIssueTab === "position" && (
                        <InlineFeedback message={pictureIssue} />
                      )}
                    </div>
                  </>
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
                            setAudioPicture(undefined);
                            setMediaTab("pictures");
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
                    pending={pending}
                    initialCueId={importedAudioCue}
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
          </div>
          {actionsVisible &&
            audioImport === null &&
            (stale || messageFor("action")) && (
              <WorkflowActions
                target={footerTarget}
                label="Editor feedback"
                feedback
              >
                <InlineFeedback
                  message={
                    stale
                      ? "Clip changed. Reload to continue."
                      : messageFor("action")
                  }
                />
              </WorkflowActions>
            )}
          {actionsVisible && audioUploading && audioImport === null && (
            <WorkflowActions target={footerTarget} label="Audio upload actions">
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
            !trackingMode &&
            !captionConfirm &&
            (!audioUploading || audioImport !== null) &&
            (dirty || stale || previewUnavailable) && (
              <WorkflowActions target={footerTarget} label="Edit actions">
                <Button
                  variant="primary"
                  type="button"
                  disabled={
                    !dirty ||
                    !!error ||
                    !!hookDraft ||
                    stale ||
                    pending ||
                    titleLoading
                  }
                  onClick={() => void perform("edit")}
                >
                  {pending && audioImport === null ? (
                    <>
                      <LoaderCircle
                        size={18}
                        className="acquisition-spinner"
                        aria-hidden="true"
                      />
                      Working…
                    </>
                  ) : (
                    <span>
                      Apply<span className="local-action-detail"> changes</span>
                    </span>
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
                  {(previewUnavailable && !dirty) || stale ? (
                    "Reload clip"
                  ) : (
                    <span>
                      Discard
                      <span className="local-action-detail"> changes</span>
                    </span>
                  )}
                </Button>
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
              <WorkflowActions target={footerTarget} label="Hook title actions">
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
