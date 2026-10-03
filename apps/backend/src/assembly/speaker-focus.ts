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
  const byId = new Map(context.words.map((word) => [word.id, word]));
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
      const audible = context.words.filter(
        (word) => word.startMs < end && word.endMs > start,
      );
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
      const matched =
        item.association === "matched" &&
        item.box &&
        item.speakerId &&
        item.confidence >= SELECTED_FOCUS_POLICY.minimumConfidence &&
        audible.length > 0 &&
        audible.every((word) => word.speakerId === item.speakerId) &&
        (previous?.speaker === item.speakerId ||
          item.endMs - item.startMs >= SELECTED_FOCUS_POLICY.switchHoldMs);
      if (matched && item.box && item.speakerId) {
        const focus: Extract<Focus, { mode: "speaker" }> = {
          startMs: item.startMs,
          endMs: item.endMs,
          mode: "speaker",
          speaker: item.speakerId,
          confidence: item.confidence,
          box: item.box,
        };
        if (previous) {
          focus.fromBox = previous.box;
          focus.box = approach(
            previous.box,
            item.box,
            item.endMs - item.startMs,
          );
        }
        result.push(focus);
        previous = focus;
      } else {
        result.push({ startMs: item.startMs, endMs: item.endMs, mode: "wide" });
        previous = null;
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
