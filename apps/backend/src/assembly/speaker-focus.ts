import {
  SELECTED_FOCUS_POLICY,
  ASSEMBLY_LIMITS,
  speakerPlanSchema,
  type CompositionManifestV2,
  type SelectedMediaRange,
  type TranscriptWord,
} from "@clipbuilder/contracts";
type Focus = CompositionManifestV2["focus"][number];
type Box = Extract<Focus, { mode: "speaker" }>["box"];
export type SpeakerPlanContext = {
  range: SelectedMediaRange;
  words: TranscriptWord[];
};
type SpeechSpan = {
  startMs: number;
  endMs: number;
  speakerId: TranscriptWord["speakerId"];
  ambiguous: boolean;
  turnSpeechMs: number;
};
function speechCoverage(context: SpeakerPlanContext): SpeechSpan[] {
  const duration = context.range.endMs - context.range.startMs;
  const events = context.words
    .flatMap((word) => {
      const startMs = Math.max(0, word.startMs - context.range.startMs),
        endMs = Math.min(duration, word.endMs - context.range.startMs);
      return startMs < endMs
        ? [
            { timeMs: startMs, speakerId: word.speakerId, delta: 1 },
            { timeMs: endMs, speakerId: word.speakerId, delta: -1 },
          ]
        : [];
    })
    .sort((a, b) => a.timeMs - b.timeMs);
  const active = new Map<TranscriptWord["speakerId"], number>(),
    spans: SpeechSpan[] = [];
  let cursor = 0;
  function append(endMs: number) {
    if (endMs <= cursor) return;
    const speakerId =
        active.size === 1 ? (active.keys().next().value ?? null) : null,
      ambiguous = active.size > 0 && speakerId === null,
      previous = spans.at(-1);
    if (previous?.speakerId === speakerId && previous.ambiguous === ambiguous)
      previous.endMs = endMs;
    else
      spans.push({
        startMs: cursor,
        endMs,
        speakerId,
        ambiguous,
        turnSpeechMs: 0,
      });
    cursor = endMs;
  }
  for (let index = 0; index < events.length;) {
    const timeMs = events[index]!.timeMs;
    append(timeMs);
    while (index < events.length && events[index]!.timeMs === timeMs) {
      const event = events[index++]!,
        count = (active.get(event.speakerId) ?? 0) + event.delta;
      if (count) active.set(event.speakerId, count);
      else active.delete(event.speakerId);
    }
  }
  append(duration);
  // A turn can span word pauses, but silence contributes no time to the hold.
  // Overlap/unknown speech or another speaker ends the unambiguous turn.
  let turn: SpeechSpan[] = [];
  function finishTurn() {
    const speechMs = turn.reduce(
      (total, span) => total + span.endMs - span.startMs,
      0,
    );
    for (const span of turn) span.turnSpeechMs = speechMs;
    turn = [];
  }
  for (const span of spans) {
    if (
      span.ambiguous ||
      (span.speakerId && turn.length && span.speakerId !== turn[0]!.speakerId)
    )
      finishTurn();
    if (span.speakerId) turn.push(span);
  }
  finishTurn();
  return spans;
}
function center(box: Box) {
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}
function approach(from: Box, to: Box, durationMs: number): Box {
  const a = center(from),
    b = center(to),
    distance = Math.hypot(a.x - b.x, a.y - b.y);
  const fraction = distance
    ? Math.min(
        1,
        (SELECTED_FOCUS_POLICY.maxCenterVelocityPerSecond * durationMs) /
          1000 /
          distance,
      )
    : 1;
  const width = from.width + (to.width - from.width) * fraction,
    height = from.height + (to.height - from.height) * fraction;
  return {
    x: Math.min(1 - width, from.x + (to.x - from.x) * fraction),
    y: Math.min(1 - height, from.y + (to.y - from.y) * fraction),
    width,
    height,
  };
}
export function compileSpeakerFocus(
  raw: unknown,
  context: SpeakerPlanContext,
): CompositionManifestV2["focus"] {
  const plan = speakerPlanSchema.parse(raw),
    duration = context.range.endMs - context.range.startMs;
  if (plan.durationMs !== duration) throw new Error("speaker_plan_rejected");
  const byId = new Map(context.words.map((word) => [word.id, word])),
    speech = speechCoverage(context);
  const result: Focus[] = [];
  for (const shot of plan.shots) {
    let cursor = shot.startMs,
      previous: Extract<Focus, { mode: "speaker" }> | null = null;
    for (const item of shot.observations) {
      if (item.startMs > cursor) {
        result.push({ startMs: cursor, endMs: item.startMs, mode: "wide" });
        previous = null;
      }
      const start = context.range.startMs + item.startMs,
        end = context.range.startMs + item.endMs;
      for (const id of item.evidenceWordIds) {
        const word = byId.get(id);
        if (
          !word ||
          word.startMs >= end ||
          word.endMs <= start ||
          (item.association === "matched" && word.speakerId !== item.speakerId)
        )
          throw new Error("speaker_evidence_rejected");
      }
      const associated =
        item.association === "matched" &&
        item.box &&
        item.speakerId &&
        item.confidence >= SELECTED_FOCUS_POLICY.minimumConfidence;
      for (const span of speech) {
        const startMs = Math.max(item.startMs, span.startMs),
          endMs = Math.min(item.endMs, span.endMs);
        if (startMs >= endMs) continue;
        if (
          associated &&
          item.box &&
          item.speakerId &&
          span.speakerId === item.speakerId &&
          span.turnSpeechMs >= SELECTED_FOCUS_POLICY.switchHoldMs
        ) {
          const focus: Extract<Focus, { mode: "speaker" }> = {
            startMs,
            endMs,
            mode: "speaker",
            speaker: item.speakerId,
            confidence: item.confidence,
            box: item.box,
          };
          if (previous) {
            focus.fromBox = previous.box;
            focus.box = approach(previous.box, item.box, endMs - startMs);
          }
          result.push(focus);
          previous = focus;
        } else {
          result.push({ startMs, endMs, mode: "wide" });
          previous = null;
        }
      }
      cursor = item.endMs;
    }
    if (cursor < shot.endMs)
      result.push({ startMs: cursor, endMs: shot.endMs, mode: "wide" });
  }
  // Bounded public geometry even when every provider observation has an uncovered gap.
  return result.length <= ASSEMBLY_LIMITS.maxFocusSegments
    ? result
    : plan.shots.map((shot) => ({
        startMs: shot.startMs,
        endMs: shot.endMs,
        mode: "wide" as const,
      }));
}
