import {
  ownerFocusCrop,
  ownerSourceContent,
  ownerPersonCamera,
  OWNER_FOCUS_LIMITS,
  splitOwnerFocus,
  type OwnerFocus,
  type OwnerFocusShot,
} from "../../../../../packages/contracts/local/focus.ts";
import { OWNER_FPS } from "../../../../../packages/contracts/local/policy.ts";

export type FocusPosition = {
  key: string;
  personId: string | null;
  number: number;
  index: number;
  sourceStart: number;
  sourceEnd: number;
};
export const focusPersonName = (id: string | null) =>
  id ? `Person ${id.slice(-1)}` : "Custom position";
export const focusPositionName = (position: FocusPosition) =>
  position.personId
    ? `${focusPersonName(position.personId)} · Position ${position.number}`
    : `Custom position ${position.number}`;

export function focusTimestamp(frame: number) {
  if (!Number.isFinite(frame)) return "—";
  const milliseconds = Math.round((frame * 1000) / OWNER_FPS);
  return `${Math.floor(milliseconds / 60000)}:${String(Math.floor(milliseconds / 1000) % 60).padStart(2, "0")}.${String(milliseconds % 1000).padStart(3, "0")}`;
}

/** Invalid numeric drafts stay editable; preview geometry remains bounded. */
export function previewFocusShot(shot: OwnerFocusShot): OwnerFocusShot {
  const point = (value: number) =>
    Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0.5;
  return {
    ...shot,
    centerX: point(shot.centerX),
    centerY: point(shot.centerY),
    zoom: Number.isFinite(shot.zoom) ? Math.max(1, Math.min(3, shot.zoom)) : 1,
  };
}

/** Each timestamped row owns an independent position, even with identical crops. */
export function focusPositions(focus: OwnerFocus): FocusPosition[] {
  const starts = [
    ...new Set([
      0,
      ...focus.decisions.filter((d) => d.shotStart).map((d) => d.startFrame),
    ]),
  ].sort((a, b) => a - b);
  const result: FocusPosition[] = [];
  const counts = new Map<string | null, number>();
  for (const [index, shot] of focus.shots.entries()) {
    const scope = starts.findLastIndex((start) => start <= shot.startFrame);
    const scopeEnd = starts[scope + 1] ?? focus.frames;
    const number = (counts.get(shot.personId) ?? 0) + 1;
    counts.set(shot.personId, number);
    result.push({
      key: `change:${index}`,
      personId: shot.personId,
      number,
      index,
      sourceStart: starts[scope] ?? 0,
      sourceEnd: scopeEnd,
    });
  }
  return result;
}

/** Insert below the selected row without gaps or overlap, after person confirmation. */
export function addFocusPosition(
  focus: OwnerFocus,
  index: number,
  personId: string | null,
  displayedFrame: number | null,
): { focus: OwnerFocus; index: number } | null {
  const shot = focus.shots[index];
  const person = focus.people.find((p) => p.id === personId);
  if (
    !shot ||
    (personId !== null && !person) ||
    focus.shots.length >= OWNER_FOCUS_LIMITS.shots ||
    !Number.isInteger(shot.startFrame) ||
    !Number.isInteger(shot.endFrame) ||
    shot.endFrame - shot.startFrame < 2
  )
    return null;
  const at =
    displayedFrame !== null &&
    Number.isInteger(displayedFrame) &&
    displayedFrame > shot.startFrame &&
    displayedFrame < shot.endFrame
      ? displayedFrame
      : shot.startFrame + Math.floor((shot.endFrame - shot.startFrame) / 2);
  let camera = {
    centerX: shot.centerX,
    centerY: shot.centerY,
    zoom: shot.zoom,
  };
  if (person && personId !== shot.personId) {
    const positions = focusPositions(focus),
      scope = focus.decisions.reduce(
        (start, decision) =>
          decision.shotStart && decision.startFrame <= at
            ? Math.max(start, decision.startFrame)
            : start,
        0,
      );
    const candidates = positions.filter(
      (p) => p.personId === personId && p.sourceStart === scope,
    );
    const saved = candidates.findLast((p) => p.index <= index) ?? candidates[0];
    const preset = saved
      ? focus.shots[saved.index]!
      : ownerPersonCamera(person, at);
    camera = {
      centerX: preset.centerX,
      centerY: preset.centerY,
      zoom: preset.zoom,
    };
  }
  const next = splitOwnerFocus(focus, at);
  return {
    focus: {
      ...next,
      shots: next.shots.map((s, i) =>
        i === index + 1 ? { ...s, ...camera, personId, reason: "manual" } : s,
      ),
    },
    index: index + 1,
  };
}

type PositionEdit = Partial<
  Pick<OwnerFocusShot, "centerX" | "centerY" | "zoom">
>;
export function editFocusPosition(
  focus: OwnerFocus,
  selected: number,
  edit: PositionEdit,
): OwnerFocus {
  return {
    ...focus,
    shots: focus.shots.map((shot, index) =>
      index === selected ? { ...shot, ...edit, reason: "manual" } : shot,
    ),
  };
}

export function moveFocusPosition(
  focus: OwnerFocus,
  index: number,
  centerX: number,
  centerY: number,
): OwnerFocus {
  const shot = previewFocusShot(focus.shots[index]!);
  const content = ownerSourceContent(focus.source);
  const crop = ownerFocusCrop(focus, shot);
  const clamp = (value: number, half: number) =>
    Math.max(half, Math.min(1 - half, value));
  return editFocusPosition(focus, index, {
    centerX: clamp(centerX, crop.width / content.width / 2),
    centerY: clamp(centerY, crop.height / content.height / 2),
    zoom: shot.zoom,
  });
}

export function editFocusBoundary(
  focus: OwnerFocus,
  index: number,
  key: "startFrame" | "endFrame",
  frame: number,
): OwnerFocus {
  const shots = focus.shots.map((s) => ({ ...s }));
  shots[index]![key] = frame;
  shots[index]!.reason = "manual";
  if (key === "startFrame" && index > 0) shots[index - 1]!.endFrame = frame;
  if (key === "endFrame" && index < shots.length - 1)
    shots[index + 1]!.startFrame = frame;
  return { ...focus, shots };
}

/** End includes the paused frame, while stored render intervals are half-open. */
export function captureFocusBoundary(
  focus: OwnerFocus,
  index: number,
  key: "startFrame" | "endFrame",
  displayedFrame: number,
): OwnerFocus | null {
  if (
    !Number.isInteger(displayedFrame) ||
    displayedFrame < 0 ||
    displayedFrame >= focus.frames
  )
    return null;
  const shot = focus.shots[index];
  if (
    !shot ||
    (key === "startFrame" ? index === 0 : index === focus.shots.length - 1)
  )
    return null;
  const boundary = displayedFrame + (key === "endFrame" ? 1 : 0);
  const low =
    key === "startFrame" ? focus.shots[index - 1]!.startFrame : shot.startFrame;
  const high =
    key === "startFrame" ? shot.endFrame : focus.shots[index + 1]!.endFrame;
  if (
    !Number.isFinite(low) ||
    !Number.isFinite(high) ||
    boundary <= low ||
    boundary >= high
  )
    return null;
  return editFocusBoundary(focus, index, key, boundary);
}
