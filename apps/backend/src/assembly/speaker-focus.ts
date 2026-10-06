import {
  SELECTED_FOCUS_POLICY,
  FIXED_COMPOSITION_POLICY,
  speakerPlanSchema,
  type CompositionManifestV3,
  type SelectedMediaRange,
  type TranscriptWord,
} from "@clipbuilder/contracts";
type Focus = CompositionManifestV3["focus"][number];
type Crop = Exclude<Focus, { mode: "wide" }>;
export type SpeakerPlanContext = {
  range: SelectedMediaRange;
  words: TranscriptWord[];
  source?: { width: number; height: number };
};
type SpeechSpan = {
  startMs: number;
  endMs: number;
  speakerId: TranscriptWord["speakerId"];
  ambiguous: boolean;
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
    else spans.push({ startMs: cursor, endMs, speakerId, ambiguous });
    cursor = endMs;
  }
  for (let index = 0; index < events.length;) {
    append(events[index]!.timeMs);
    const timeMs = events[index]!.timeMs;
    while (index < events.length && events[index]!.timeMs === timeMs) {
      const event = events[index++]!,
        count = (active.get(event.speakerId) ?? 0) + event.delta;
      if (count) active.set(event.speakerId, count);
      else active.delete(event.speakerId);
    }
  }
  append(duration);
  return spans;
}
export function provisionalOpeningFocus(context: SpeakerPlanContext): Crop {
  const landscape =
    !context.source || context.source.width > context.source.height;
  return {
    startMs: 0,
    endMs: context.range.endMs - context.range.startMs,
    mode: "held",
    reason: "opening-default",
    box: { x: landscape ? 0.13 : 0.38, y: 0.25, width: 0.24, height: 0.35 },
  };
}
export function compileSpeakerFocus(
  raw: unknown,
  context: SpeakerPlanContext,
  critique?: (reason: "speaker_evidence_rejected") => void,
): CompositionManifestV3["focus"] {
  const plan = speakerPlanSchema.parse(raw),
    duration = context.range.endMs - context.range.startMs;
  if (plan.durationMs !== duration) throw new Error("speaker_plan_rejected");
  const byId = new Map(context.words.map((word) => [word.id, word])),
    speech = speechCoverage(context);
  let rejectedEvidence = false;
  for (const shot of plan.shots)
    for (const item of shot.observations) {
      item.evidenceWordIds = item.evidenceWordIds.filter((id) => {
        const word = byId.get(id);
        if (
          !word ||
          word.startMs >= context.range.startMs + item.endMs ||
          word.endMs <= context.range.startMs + item.startMs ||
          (item.association === "matched" && word.speakerId !== item.speakerId)
        ) {
          rejectedEvidence = true;
          return false;
        }
        return true;
      });
    }
  if (rejectedEvidence) critique?.("speaker_evidence_rejected");
  const result: Focus[] = [];
  function append(focus: Focus) {
    const previous = result.at(-1);
    if (
      previous &&
      previous.endMs === focus.startMs &&
      JSON.stringify({ ...previous, startMs: 0, endMs: 0 }) ===
        JSON.stringify({ ...focus, startMs: 0, endMs: 0 })
    )
      previous.endMs = focus.endMs;
    else result.push(focus);
    if (result.length > FIXED_COMPOSITION_POLICY.maxFocusSegments)
      throw new Error("focus_track_too_complex");
  }
  for (const shot of plan.shots) {
    // A crop never survives a real shot boundary or confirmed absence/offscreen.
    const first = shot.observations.find(
      (item) => item.startMs === shot.startMs,
    );
    const opening =
      shot.openingFace &&
      shot.openingFace.confidence >= SELECTED_FOCUS_POLICY.minimumConfidence
        ? shot.openingFace.box
        : first?.box &&
            first.visiblePeople > 0 &&
            first.confidence >= SELECTED_FOCUS_POLICY.minimumConfidence
          ? first.box
          : null;
    let crop: Crop | null = {
        ...provisionalOpeningFocus(context),
        startMs: shot.startMs,
        endMs: shot.endMs,
        ...(opening ? { box: opening, reason: "visible-face" as const } : {}),
      },
      currentSpeaker: string | null = null,
      candidate: string | null = null,
      voicedMs = 0,
      candidateEnd = shot.startMs;
    let wideReason: Extract<Focus, { mode: "wide" }>["reason"] = shot.startMs
      ? "shot-reset"
      : "initial";
    const boundaries = [
      ...new Set([
        shot.startMs,
        shot.endMs,
        ...shot.observations.flatMap((o) => [o.startMs, o.endMs]),
        ...speech
          .flatMap((s) => [s.startMs, s.endMs])
          .filter((t) => t > shot.startMs && t < shot.endMs),
      ]),
    ].sort((a, b) => a - b);
    function hold(
      startMs: number,
      endMs: number,
      reason: Extract<Focus, { mode: "held" }>["reason"],
    ) {
      if (crop) {
        append({
          startMs,
          endMs,
          mode: "held",
          reason:
            currentSpeaker === null && crop.mode === "held"
              ? crop.reason
              : reason,
          box: crop.box,
        });
        return;
      }
      append({ startMs, endMs, mode: "wide", reason: wideReason });
    }
    for (let index = 0; index < boundaries.length - 1; index++) {
      let startMs = boundaries[index]!;
      const endMs = boundaries[index + 1]!,
        item = shot.observations.find(
          (o) => o.startMs <= startMs && o.endMs > startMs,
        ),
        span = speech.find((s) => s.startMs <= startMs && s.endMs > startMs);
      if (
        (item?.association === "absent" || item?.association === "offscreen") &&
        item.visiblePeople === 0 &&
        item.confidence >= SELECTED_FOCUS_POLICY.minimumConfidence
      ) {
        crop = null;
        currentSpeaker = null;
        candidate = null;
        voicedMs = 0;
        wideReason = item.association;
        append({ startMs, endMs, mode: "wide", reason: wideReason });
        continue;
      }
      const matched =
        item?.association === "matched" &&
        item.box &&
        item.speakerId &&
        item.evidenceWordIds.length > 0 &&
        item.confidence >= SELECTED_FOCUS_POLICY.minimumConfidence &&
        span?.speakerId === item.speakerId;
      if (!matched || !item?.box || !item.speakerId) {
        if (
          span?.ambiguous ||
          (span?.speakerId && span.speakerId !== candidate) ||
          startMs - candidateEnd > SELECTED_FOCUS_POLICY.maximumEvidenceGapMs
        ) {
          candidate = null;
          voicedMs = 0;
        }
        hold(
          startMs,
          endMs,
          !item
            ? "observation-gap"
            : item.association === "matched" &&
                item.confidence >= SELECTED_FOCUS_POLICY.minimumConfidence &&
                !span?.speakerId &&
                !span?.ambiguous
              ? "pause"
              : "uncertain",
        );
        continue;
      }
      if (!crop || currentSpeaker !== item.speakerId) {
        if (
          candidate !== item.speakerId ||
          startMs - candidateEnd > SELECTED_FOCUS_POLICY.maximumEvidenceGapMs
        ) {
          candidate = item.speakerId;
          voicedMs = 0;
        }
        const waiting = Math.min(
          endMs - startMs,
          SELECTED_FOCUS_POLICY.switchHoldMs - voicedMs,
        );
        if (waiting > 0) hold(startMs, startMs + waiting, "switch-pending");
        voicedMs += waiting;
        candidateEnd = endMs;
        startMs += waiting;
        if (voicedMs < SELECTED_FOCUS_POLICY.switchHoldMs) continue;
      }
      crop = {
        startMs,
        endMs,
        mode: "speaker",
        speaker: item.speakerId,
        confidence: item.confidence,
        box: item.box,
      };
      currentSpeaker = item.speakerId;
      candidate = null;
      voicedMs = 0;
      if (startMs < endMs) append(crop);
    }
  }
  return result;
}
