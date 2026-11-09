import {
  useEffect,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import {
  EditorHookClock,
  EditorOccurrence,
  EditorPresentationClock,
  editorClockOffset,
} from "./editor-clock.ts";
import { Clock3 } from "lucide-react";
import { Button } from "../../shared/ui/button";
import { InlineFeedback } from "../../shared/ui/inline-feedback";
import { ControlTabs } from "./control-tabs.tsx";
import { FocusPreviewTarget } from "./focus-preview-slot";
import { useInspectorPlayback } from "./use-inspector-playback.ts";
import {
  OWNER_FOCUS_LIMITS,
  ownerFocusAt,
  ownerFocusCrop,
  ownerSourceContent,
  ownerPersonCamera,
  removeOwnerFocusShot,
  type OwnerFocus,
  type OwnerFocusShot,
} from "../../../../../packages/contracts/local/focus.ts";
import { OWNER_FPS } from "../../../../../packages/contracts/local/policy.ts";
import {
  captureFocusBoundary,
  addFocusPosition,
  editFocusBoundary,
  editFocusPosition,
  focusPersonName,
  focusPositionName,
  focusPositions,
  focusTimestamp,
  moveFocusPosition,
  previewFocusShot,
  type FocusPosition,
} from "./focus-positions.ts";

const seconds = (frames: number) =>
  Number.isFinite(frames) ? Number((frames / OWNER_FPS).toFixed(3)) : "";

/** Camera selection is independent of the playback clock and provider observations. */
export function FocusEditor({
  focus,
  automatic,
  sourceUrl,
  frame,
  playing,
  onChange,
  onSeek,
  onCaptureFrame,
  captureReady,
  disabled,
  motion,
  pan,
  tracking,
  timeline,
  positionRequest,
  navigationDisabled = false,
  onPositionSelect,
  feedback,
  notice,
}: {
  focus: OwnerFocus;
  automatic: OwnerFocus | undefined;
  sourceUrl: string;
  frame: number;
  playing: boolean;
  onChange: (focus: OwnerFocus | undefined) => void;
  onSeek: (frame: number) => void;
  onCaptureFrame: () => Promise<number | null>;
  captureReady: boolean;
  disabled: boolean;
  motion?: ReactNode;
  pan?: ReactNode;
  tracking?: ReactNode;
  timeline?: ReactNode;
  positionRequest?:
    { index: number; key: string; startFrame: number } | undefined;
  navigationDisabled?: boolean;
  onPositionSelect?: ((index: number) => void) | undefined;
  feedback?:
    | { tab: "camera" | "people" | "zoom" | "pan" | "motion"; message: string }
    | undefined;
  notice?: string | undefined;
}) {
  const tabsId = useId();
  const [previewTarget, setPreviewTarget] = useState<HTMLDivElement | null>(
    null,
  );
  const hook = useContext(EditorHookClock);
  const occurrence = useContext(EditorOccurrence);
  const unifiedClock = useContext(EditorPresentationClock);
  const displayOffset = unifiedClock ? editorClockOffset(hook, occurrence) : 0;
  const firstFrame =
    unifiedClock && occurrence === "hook" && hook ? hook.startFrame : 0;
  const lastFrame =
    unifiedClock && occurrence === "hook" && hook
      ? hook.endFrame
      : focus.frames;
  const cameraTabsId = useId();
  const [tab, setTab] = useState("camera");
  const [cameraTab, setCameraTab] = useState("timing");
  const [selected, setSelected] = useState(positionRequest?.index ?? 0);
  const [personId, setPersonId] = useState<string | null>(
    focus.shots[positionRequest?.index ?? 0]?.personId ??
      focus.shots[0]!.personId,
  );
  const [message, setMessage] = useState("");
  const [adding, setAdding] = useState<{
    signature: string;
    index: number;
    personId: string | null;
    frame: number | null;
  } | null>(null);
  const newPerson = useRef<HTMLSelectElement>(null);
  const addTools = useRef<HTMLDivElement>(null);
  const focusAdded = useRef(false);
  const remembered = useRef(new Map<string, string>());
  const index = Math.min(selected, focus.shots.length - 1),
    shot = focus.shots[index]!;
  const signature = useMemo(() => JSON.stringify(focus), [focus]);
  const insertion =
    adding?.signature === signature && adding.index === index ? adding : null;
  const isAdding = insertion !== null;
  const positions = focusPositions(focus);
  const position = positions[index]!;
  const requestedPerson = focus.people.find((p) => p.id === personId);
  const candidateOnly =
    requestedPerson &&
    !positions.some((p) => p.personId === requestedPerson.id);
  const timelineTab = tab === "zoom" || tab === "motion";
  const timelineShot = ownerFocusAt(focus, frame);
  const activePersonId = timelineTab
    ? timelineShot.personId
    : candidateOnly
      ? requestedPerson.id
      : shot.personId;
  const person = focus.people.find((p) => p.id === activePersonId);
  const unused = !timelineTab && Boolean(candidateOnly);
  const sourceFrame = timelineTab
    ? frame
    : !playing && frame >= position.sourceStart && frame < position.sourceEnd
      ? frame
      : Math.max(0, Number.isFinite(shot.startFrame) ? shot.startFrame : 0);
  const shownShot = previewFocusShot(
    unused && person
      ? { ...shot, ...ownerPersonCamera(person, sourceFrame) }
      : timelineTab
        ? timelineShot
        : shot,
  );
  const content = ownerSourceContent(focus.source),
    crop = ownerFocusCrop(focus, shownShot);
  const center = {
    x: (crop.x + crop.width / 2 - content.x) / content.width,
    y: (crop.y + crop.height / 2 - content.y) / content.height,
  };
  const canAdd =
    Number.isInteger(shot.startFrame) &&
    Number.isInteger(shot.endFrame) &&
    shot.endFrame - shot.startFrame >= 2 &&
    focus.shots.length < OWNER_FOCUS_LIMITS.shots;
  const media = useRef<HTMLVideoElement>(null),
    source = useRef<HTMLDivElement>(null);
  const gesture = useRef<{
    pointer: number;
    index: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  useInspectorPlayback(media, sourceUrl, sourceFrame, timelineTab && playing);
  useEffect(() => {
    if (isAdding) newPerson.current?.focus();
    else if (focusAdded.current) {
      addTools.current
        ?.closest(".focus-editor")
        ?.querySelector<HTMLButtonElement>('.focus-shot[aria-pressed="true"]')
        ?.focus();
      focusAdded.current = false;
    }
  }, [isAdding, selected]);

  const requestKey = positionRequest
    ? `${positionRequest.key}:${positionRequest.index}`
    : "";
  const [lastPositionRequest, setLastPositionRequest] = useState(requestKey);
  if (lastPositionRequest !== requestKey) {
    setLastPositionRequest(requestKey);
    if (positionRequest) {
      setSelected(positionRequest.index);
      setPersonId(focus.shots[positionRequest.index]?.personId ?? null);
    }
    setAdding(null);
    setMessage("");
  }

  function selectCamera(index: number) {
    setSelected(index);
    onPositionSelect?.(index);
  }
  function selectChange(next: number, seek = true) {
    setAdding(null);
    const nextShot = focus.shots[next]!;
    selectCamera(next);
    setPersonId(nextShot.personId);
    setMessage("");
    if (seek) onSeek(nextShot.startFrame);
  }
  function selectPosition(next: FocusPosition) {
    if (next.personId) remembered.current.set(next.personId, next.key);
    const nextIndex = next.index;
    selectChange(nextIndex, false);
    const nextShot = focus.shots[nextIndex]!;
    onSeek(
      frame >= nextShot.startFrame && frame < nextShot.endFrame
        ? frame
        : nextShot.startFrame,
    );
  }
  function selectPerson(id: string) {
    setAdding(null);
    const choices = positions.filter((p) => p.personId === id);
    const next =
      choices.find(
        (p) =>
          focus.shots[p.index]!.startFrame <= frame &&
          focus.shots[p.index]!.endFrame > frame,
      ) ??
      choices.find((p) => p.key === remembered.current.get(id)) ??
      choices[0];
    if (next) selectPosition(next);
    else {
      setPersonId(id);
      setMessage("");
    }
  }
  function assignPerson(id: string) {
    const target = focus.people.find((p) => p.id === id);
    const available = positions.filter(
      (p) => p.personId === id && p.sourceStart === position.sourceStart,
    );
    const preset =
      available.find((p) => p.key === remembered.current.get(id)) ??
      available[0];
    const value = preset
      ? focus.shots[preset.index]!
      : target
        ? ownerPersonCamera(target, shot.startFrame)
        : { personId: null };
    onChange({
      ...focus,
      shots: focus.shots.map((s, i) =>
        i === index
          ? {
              ...s,
              ...("centerX" in value
                ? {
                    centerX: value.centerX,
                    centerY: value.centerY,
                    zoom: value.zoom,
                  }
                : {}),
              personId: target?.id ?? null,
              reason: "manual",
            }
          : s,
      ),
    });
    setPersonId(target?.id ?? null);
    remembered.current.clear();
    setMessage("");
    onSeek(shot.startFrame);
  }
  function begin(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0 || disabled || unused || timelineTab) return;
    const rect = source.current!.getBoundingClientRect();
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus();
    onSeek(sourceFrame);
    gesture.current = {
      pointer: event.pointerId,
      index,
      offsetX: (event.clientX - rect.left) / rect.width - center.x,
      offsetY: (event.clientY - rect.top) / rect.height - center.y,
    };
  }
  function move(event: PointerEvent<HTMLButtonElement>) {
    const active = gesture.current;
    if (!active || active.pointer !== event.pointerId || disabled) return;
    const rect = source.current!.getBoundingClientRect();
    onChange(
      moveFocusPosition(
        focus,
        active.index,
        (event.clientX - rect.left) / rect.width - active.offsetX,
        (event.clientY - rect.top) / rect.height - active.offsetY,
      ),
    );
  }
  function updatePosition(
    change: Partial<Pick<OwnerFocusShot, "centerX" | "centerY" | "zoom">>,
  ) {
    if (!unused) onChange(editFocusPosition(focus, index, change));
  }
  function boundary(key: "startFrame" | "endFrame", text: string) {
    onChange(
      editFocusBoundary(
        focus,
        index,
        key,
        text === ""
          ? NaN
          : Math.round(Number(text) * OWNER_FPS) - displayOffset,
      ),
    );
    setMessage("");
  }
  async function capture(key: "startFrame" | "endFrame") {
    const at = await onCaptureFrame();
    const next =
      at === null ? null : captureFocusBoundary(focus, index, key, at);
    if (!next) {
      setMessage(
        at === null
          ? "Wait for the preview to finish seeking."
          : "Choose a time within the neighboring camera changes.",
      );
      return;
    }
    onChange(next);
    setMessage("");
  }
  function addPerson() {
    const id = Array.from(
      { length: OWNER_FOCUS_LIMITS.people },
      (_, i) => `person_${i + 1}`,
    ).find((id) => !focus.people.some((p) => p.id === id));
    if (!id) return;
    onChange({
      ...focus,
      people: [
        ...focus.people,
        {
          id,
          observations: [
            {
              startFrame: shot.startFrame,
              endFrame: shot.endFrame,
              box: {
                x: Math.max(0, Math.min(0.8, center.x - 0.1)),
                y: Math.max(0, Math.min(0.6, center.y - 0.2)),
                width: 0.2,
                height: 0.4,
              },
            },
          ],
        },
      ],
      shots: focus.shots.map((s, i) =>
        i === index ? { ...s, personId: id, reason: "manual" } : s,
      ),
    });
    setPersonId(id);
    setTab("people");
  }
  function removePerson(id: string) {
    onChange({
      ...focus,
      people: focus.people.filter((p) => p.id !== id),
      shots: focus.shots.map((s) =>
        s.personId === id ? { ...s, personId: null, reason: "manual" } : s,
      ),
    });
    if (personId === id) setPersonId(null);
    setMessage("");
    remembered.current.clear();
  }

  const visibleError = [
    tab === "camera" ? message : undefined,
    feedback?.tab === tab ? feedback.message : undefined,
  ]
    .filter(Boolean)
    .join(" ");
  const visibleFeedback = [visibleError, notice].filter(Boolean).join(" ");

  return (
    <FocusPreviewTarget.Provider value={previewTarget}>
      <fieldset className="focus-editor" disabled={disabled}>
        <legend className="local-sr-only">Person focus</legend>
        <div
          className="focus-left-column"
          role="region"
          aria-label="Focus preview and positions"
          tabIndex={0}
        >
          <div className="focus-preview-column">
            <div
              className="numbered-focus-preview"
              role="group"
              aria-label="Numbered speaker preview"
            >
              <div
                className="focus-source"
                ref={source}
                style={{
                  aspectRatio: `${content.width}/${content.height}`,
                  maxWidth: (content.width / content.height) * 240,
                  width: `min(100%, calc(var(--focus-preview-height, 240px) * ${content.width / content.height}))`,
                }}
              >
                <video
                  ref={media}
                  src={sourceUrl}
                  muted
                  playsInline
                  preload="auto"
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    width: `${(1080 / content.width) * 100}%`,
                    height: `${(1920 / content.height) * 100}%`,
                    maxWidth: "none",
                    left: `${(-content.x / content.width) * 100}%`,
                    top: `${(-content.y / content.height) * 100}%`,
                  }}
                />
                <div
                  className="focus-crop"
                  aria-hidden="true"
                  style={{
                    left: `${((crop.x - content.x) / content.width) * 100}%`,
                    top: `${((crop.y - content.y) / content.height) * 100}%`,
                    width: `${(crop.width / content.width) * 100}%`,
                    height: `${(crop.height / content.height) * 100}%`,
                  }}
                />
                {focus.people
                  .filter((p) => p.id !== activePersonId)
                  .flatMap((p) => {
                    const available = positions.filter(
                      (pos) =>
                        pos.personId === p.id &&
                        sourceFrame >= pos.sourceStart &&
                        sourceFrame < pos.sourceEnd,
                    );
                    const saved =
                      available.find(
                        (pos) =>
                          focus.shots[pos.index]!.startFrame <= sourceFrame &&
                          focus.shots[pos.index]!.endFrame > sourceFrame,
                      ) ?? available[0];
                    const observation = p.observations.find(
                      (o) =>
                        o.startFrame <= sourceFrame && o.endFrame > sourceFrame,
                    );
                    if (!saved && !observation) return [];
                    const other = ownerFocusCrop(
                      focus,
                      saved
                        ? previewFocusShot(focus.shots[saved.index]!)
                        : {
                            ...shownShot,
                            ...ownerPersonCamera(p, sourceFrame),
                          },
                    );
                    return [
                      <button
                        key={p.id}
                        type="button"
                        className="focus-person-handle"
                        aria-label={`Select ${focusPersonName(p.id)}`}
                        disabled={
                          timelineTab &&
                          !positions.some((pos) => pos.personId === p.id)
                        }
                        onClick={() => selectPerson(p.id)}
                        style={{
                          left: `${((other.x + other.width / 2 - content.x) / content.width) * 100}%`,
                          top: `${((other.y + other.height / 2 - content.y) / content.height) * 100}%`,
                        }}
                      >
                        <span>{p.id.slice(-1)}</span>
                      </button>,
                    ];
                  })}
                <button
                  type="button"
                  className="focus-person-handle"
                  aria-label={
                    person
                      ? timelineTab
                        ? `Selected ${focusPersonName(person.id)}`
                        : `Move ${focusPersonName(person.id)} position`
                      : "Move custom position"
                  }
                  aria-pressed="true"
                  onClick={() => {
                    if (timelineTab && person) selectPerson(person.id);
                  }}
                  disabled={unused}
                  style={{
                    left: `${center.x * 100}%`,
                    top: `${center.y * 100}%`,
                  }}
                  onPointerDown={begin}
                  onPointerMove={move}
                  onPointerUp={() => {
                    gesture.current = null;
                  }}
                  onPointerCancel={() => {
                    gesture.current = null;
                  }}
                  onLostPointerCapture={() => {
                    gesture.current = null;
                  }}
                  onKeyDown={(event) => {
                    if (timelineTab) return;
                    const dx =
                        event.key === "ArrowRight"
                          ? 0.01
                          : event.key === "ArrowLeft"
                            ? -0.01
                            : 0,
                      dy =
                        event.key === "ArrowDown"
                          ? 0.01
                          : event.key === "ArrowUp"
                            ? -0.01
                            : 0;
                    if (!dx && !dy) return;
                    event.preventDefault();
                    onSeek(sourceFrame);
                    onChange(
                      moveFocusPosition(
                        focus,
                        index,
                        center.x + dx,
                        center.y + dy,
                      ),
                    );
                  }}
                >
                  <span>{person?.id.slice(-1) ?? "↔"}</span>
                </button>
              </div>
              <div className="focus-context">
                <strong>
                  {unused && person
                    ? focusPersonName(person.id)
                    : focusPositionName(
                        timelineTab
                          ? positions[focus.shots.indexOf(timelineShot)]!
                          : position,
                      )}
                </strong>
                <span>{unused ? "Not used" : "This position"}</span>
              </div>
            </div>
            <div className="focus-preview-slot" ref={setPreviewTarget} />
          </div>
          <div
            className="focus-collection"
            role="region"
            aria-label="Focus camera positions"
            tabIndex={0}
          >
            {timeline}
          </div>
        </div>
        <div
          className="focus-inspector"
          role="region"
          aria-label="Focus settings"
          tabIndex={0}
        >
          <ControlTabs
            id={tabsId}
            label="Focus controls"
            disabled={navigationDisabled}
            items={[
              {
                value: "camera",
                label: "Camera",
                issue:
                  feedback?.tab === "camera"
                    ? feedback.message
                    : message || undefined,
              },
              {
                value: "people",
                label: "People",
                issue:
                  feedback?.tab === "people" ? feedback.message : undefined,
              },
              ...(motion
                ? [
                    {
                      value: "zoom",
                      label: "Zoom",
                      issue:
                        feedback?.tab === "zoom" ? feedback.message : undefined,
                    },
                  ]
                : []),
              ...(pan
                ? [
                    {
                      value: "pan",
                      label: "Pan",
                      issue:
                        feedback?.tab === "pan" ? feedback.message : undefined,
                    },
                  ]
                : []),
              ...(tracking
                ? [
                    {
                      value: "motion",
                      label: "Face tracking",
                      issue:
                        feedback?.tab === "motion"
                          ? feedback.message
                          : undefined,
                    },
                  ]
                : []),
            ]}
            value={tab}
            onChange={(next) => {
              setAdding(null);
              setTab(next);
              if (next === "camera") setPersonId(shot.personId);
            }}
          />
          <div
            role="tabpanel"
            id={`${tabsId}-pan-panel`}
            aria-labelledby={`${tabsId}-pan`}
            hidden={tab !== "pan"}
            tabIndex={0}
          >
            {tab === "pan" && pan}
          </div>
          <div
            role="tabpanel"
            id={`${tabsId}-motion-panel`}
            aria-labelledby={`${tabsId}-motion`}
            hidden={tab !== "motion"}
            tabIndex={0}
          >
            {tab === "motion" && tracking}
          </div>
          <div
            role="tabpanel"
            id={`${tabsId}-zoom-panel`}
            aria-labelledby={`${tabsId}-zoom`}
            hidden={tab !== "zoom"}
            tabIndex={0}
          >
            {tab === "zoom" && motion}
          </div>
          <div
            role="tabpanel"
            id={`${tabsId}-people-panel`}
            aria-labelledby={`${tabsId}-people`}
            hidden={tab !== "people"}
            tabIndex={0}
          >
            <div className="focus-heading">
              <strong>People</strong>
              <Button
                variant="quiet"
                onClick={addPerson}
                disabled={
                  focus.people.length >= OWNER_FOCUS_LIMITS.people ||
                  focus.people.reduce(
                    (sum, p) => sum + p.observations.length,
                    0,
                  ) >= OWNER_FOCUS_LIMITS.observations
                }
              >
                Add person
              </Button>
            </div>
            {!focus.people.length && (
              <p className="focus-empty">
                No people detected. Add a person or position the frame.
              </p>
            )}
            <div className="focus-people" aria-label="People positions">
              {focus.people.map((p) => (
                <div className="focus-person-row" key={p.id}>
                  <button
                    type="button"
                    className="focus-person-select"
                    aria-pressed={activePersonId === p.id}
                    onClick={() => selectPerson(p.id)}
                  >
                    {focusPersonName(p.id)}
                  </button>
                  <Button
                    variant="quiet"
                    className="focus-person-remove"
                    aria-label={`Remove ${focusPersonName(p.id)}`}
                    onClick={() => removePerson(p.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            {person &&
              positions.filter((p) => p.personId === person.id).length > 1 && (
                <label>
                  Position
                  <select
                    className="select-control"
                    aria-label="Person position"
                    value={position.key}
                    onChange={(e) => {
                      const next = positions.find(
                        (p) => p.key === e.currentTarget.value,
                      );
                      if (next) selectPosition(next);
                    }}
                  >
                    {positions
                      .filter((p) => p.personId === person.id)
                      .map((p) => (
                        <option value={p.key} key={p.key}>
                          Position {p.number}
                        </option>
                      ))}
                  </select>
                </label>
              )}
            {unused && person && (
              <Button
                variant="secondary"
                onClick={() => assignPerson(person.id)}
              >
                Use here
              </Button>
            )}
          </div>
          <div
            role="tabpanel"
            id={`${tabsId}-camera-panel`}
            aria-labelledby={`${tabsId}-camera`}
            hidden={tab !== "camera"}
            tabIndex={0}
          >
            {!timeline && (
              <div className="focus-heading">
                <strong>Camera positions</strong>
              </div>
            )}
            {!timeline && (
              <div
                className="focus-shot-list"
                role="group"
                aria-label="Camera timeline"
              >
                {focus.shots.map((s, i) => (
                  <button
                    type="button"
                    className="focus-shot"
                    key={i}
                    aria-pressed={i === index}
                    data-playing={ownerFocusAt(focus, frame) === s || undefined}
                    onClick={() => selectChange(i)}
                  >
                    <span>{focusPositionName(positions[i]!)}</span>
                    <span>
                      {focusTimestamp(s.startFrame)}–
                      {focusTimestamp(s.endFrame)}
                    </span>
                    <span
                      className="focus-shot-bar"
                      aria-hidden="true"
                      style={{
                        left: `${(s.startFrame / focus.frames) * 100}%`,
                        width: `${((s.endFrame - s.startFrame) / focus.frames) * 100}%`,
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
            <div className="picture-tools" ref={addTools}>
              <Button
                variant="secondary"
                disabled={!canAdd}
                aria-expanded={isAdding}
                title={
                  focus.shots.length >= OWNER_FOCUS_LIMITS.shots
                    ? "Maximum positions reached."
                    : !canAdd
                      ? "Make this position longer before adding another."
                      : "Insert below the selected position"
                }
                onClick={async () => {
                  const frame = await onCaptureFrame();
                  setAdding({
                    signature,
                    index,
                    personId: shot.personId,
                    frame,
                  });
                  setMessage("");
                }}
              >
                Add position
              </Button>
              <Button
                variant="quiet"
                disabled={isAdding || focus.shots.length < 2}
                onClick={() => {
                  const next = removeOwnerFocusShot(focus, index);
                  onChange(next);
                  const at = Math.max(0, index - 1);
                  selectCamera(at);
                  setPersonId(next.shots[at]!.personId);
                  remembered.current.clear();
                  setMessage("");
                  onSeek(next.shots[at]!.startFrame);
                }}
              >
                Remove position
              </Button>
            </div>
            {insertion && (
              <div
                className="focus-add-position"
                role="group"
                aria-label="Add camera position"
              >
                <label>
                  Person
                  <select
                    className="select-control"
                    ref={newPerson}
                    aria-label="New position person"
                    value={insertion.personId ?? "custom"}
                    onChange={(event) =>
                      setAdding({
                        ...insertion,
                        personId:
                          event.currentTarget.value === "custom"
                            ? null
                            : event.currentTarget.value,
                      })
                    }
                  >
                    <option value="custom">Custom position</option>
                    {focus.people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {focusPersonName(p.id)}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="picture-tools">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const added = addFocusPosition(
                        focus,
                        insertion.index,
                        insertion.personId,
                        insertion.frame,
                      );
                      if (!added) return;
                      focusAdded.current = true;
                      setAdding(null);
                      onChange(added.focus);
                      selectCamera(added.index);
                      setPersonId(insertion.personId);
                      setCameraTab("timing");
                      remembered.current.clear();
                      onSeek(added.focus.shots[added.index]!.startFrame);
                    }}
                  >
                    Add
                  </Button>
                  <Button
                    variant="quiet"
                    onClick={() => {
                      setAdding(null);
                      addTools.current
                        ?.querySelector<HTMLButtonElement>("button")
                        ?.focus();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            <div hidden={isAdding}>
              <label>
                Focus on
                <select
                  className="select-control"
                  value={shot.personId ?? "custom"}
                  onChange={(e) => assignPerson(e.currentTarget.value)}
                >
                  <option value="custom">Custom position</option>
                  {focus.people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {focusPersonName(p.id)}
                    </option>
                  ))}
                </select>
              </label>
              {shot.personId &&
                positions.filter((p) => p.personId === shot.personId).length >
                  1 && (
                  <label>
                    Position
                    <select
                      className="select-control"
                      aria-label="Camera position"
                      value={position.key}
                      onChange={(e) => {
                        const p = positions.find(
                          (p) => p.key === e.currentTarget.value,
                        );
                        if (p) selectPosition(p);
                      }}
                    >
                      {positions
                        .filter((p) => p.personId === shot.personId)
                        .map((p) => (
                          <option value={p.key} key={p.key}>
                            Position {p.number}
                          </option>
                        ))}
                    </select>
                  </label>
                )}
              <ControlTabs
                id={cameraTabsId}
                label="Camera controls"
                items={[
                  { value: "timing", label: "Timing" },
                  { value: "advanced", label: "Advanced" },
                ]}
                value={cameraTab}
                onChange={setCameraTab}
              />
              <div
                role="tabpanel"
                id={`${cameraTabsId}-timing-panel`}
                aria-labelledby={`${cameraTabsId}-timing`}
                hidden={cameraTab !== "timing"}
                tabIndex={0}
                className="focus-boundaries"
              >
                {(["startFrame", "endFrame"] as const).map((key) => {
                  const start = key === "startFrame",
                    locked = start
                      ? shot.startFrame <= firstFrame
                      : shot.endFrame >= lastFrame;
                  return (
                    <div className="range-time" key={key}>
                      <label>
                        {start ? "Start (s)" : "End (s)"}
                        <input
                          aria-label={
                            start
                              ? "Camera start seconds"
                              : "Camera end seconds"
                          }
                          type="number"
                          min={(firstFrame + displayOffset) / OWNER_FPS}
                          max={(lastFrame + displayOffset) / OWNER_FPS}
                          step="0.033333"
                          disabled={locked}
                          value={seconds(
                            Math.max(
                              firstFrame,
                              Math.min(lastFrame, shot[key]),
                            ) + displayOffset,
                          )}
                          onChange={(e) => boundary(key, e.currentTarget.value)}
                        />
                      </label>
                      <Button
                        variant="quiet"
                        icon={Clock3}
                        disabled={locked || !captureReady}
                        aria-label={
                          start ? "Capture camera start" : "Capture camera end"
                        }
                        title={
                          start
                            ? "Use current preview frame"
                            : "End after current frame"
                        }
                        onClick={() => capture(key)}
                      >
                        Capture
                      </Button>
                    </div>
                  );
                })}
              </div>
              <div
                role="tabpanel"
                id={`${cameraTabsId}-advanced-panel`}
                aria-labelledby={`${cameraTabsId}-advanced`}
                hidden={cameraTab !== "advanced"}
                tabIndex={0}
              >
                <div className="editor-fields focus-fields">
                  <label>
                    Zoom
                    <input
                      aria-label="Camera zoom"
                      type="number"
                      min="1"
                      max="3"
                      step="0.05"
                      disabled={unused}
                      value={Number.isFinite(shot.zoom) ? shot.zoom : ""}
                      onChange={(e) =>
                        updatePosition({
                          zoom:
                            e.currentTarget.value === ""
                              ? NaN
                              : Number(e.currentTarget.value),
                        })
                      }
                    />
                  </label>
                  {(["centerX", "centerY"] as const).map((key) => (
                    <label key={key}>
                      {key === "centerX" ? "Horizontal (%)" : "Vertical (%)"}
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        disabled={unused}
                        value={
                          Number.isFinite(shot[key])
                            ? Number((shot[key] * 100).toFixed(1))
                            : ""
                        }
                        onChange={(e) =>
                          updatePosition({
                            [key]:
                              e.currentTarget.value === ""
                                ? NaN
                                : Number(e.currentTarget.value) / 100,
                          })
                        }
                      />
                    </label>
                  ))}
                  <label>
                    Time (s)
                    <input
                      aria-label="Focus playhead seconds"
                      type="number"
                      min={(firstFrame + displayOffset) / OWNER_FPS}
                      max={(lastFrame - 1 + displayOffset) / OWNER_FPS}
                      step="0.033333"
                      value={seconds(frame + displayOffset)}
                      onChange={(e) => {
                        const next = Number(e.currentTarget.value);
                        if (
                          e.currentTarget.value !== "" &&
                          Number.isFinite(next)
                        )
                          onSeek(
                            Math.max(
                              firstFrame,
                              Math.min(
                                lastFrame - 1,
                                Math.round(next * OWNER_FPS) - displayOffset,
                              ),
                            ),
                          );
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
          {tab !== "motion" && (
            <Button
              className="focus-reset"
              variant="quiet"
              onClick={() => {
                setAdding(null);
                selectCamera(0);
                setPersonId(automatic?.shots[0]?.personId ?? null);
                setMessage("");
                remembered.current.clear();
                onChange(automatic ? structuredClone(automatic) : undefined);
                onSeek(0);
              }}
            >
              Reset focus
            </Button>
          )}
          <InlineFeedback
            message={visibleFeedback}
            tone={visibleError ? "error" : "status"}
          />
        </div>
      </fieldset>
    </FocusPreviewTarget.Provider>
  );
}
