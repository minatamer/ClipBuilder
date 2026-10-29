import { ownerWordsSchema } from "../../../packages/contracts/local/selection.ts";
import type { OwnerWord } from "../../../packages/contracts/local/selection.ts";

/** Numeric anonymous diarization only. Never retain native prose or voice features. */
export function assignLocalSpeakers(
  words: OwnerWord[],
  output: string,
  durationMs: number,
): OwnerWord[] {
  if (Buffer.byteLength(output) > 1024 ** 2)
    throw new Error("codex_input_invalid");
  const turns: { start: number; end: number; speaker: string }[] = [];
  for (const line of output.split(/\r?\n/u)) {
    const match =
      /^\s*(\d+(?:\.\d+)?)\s+--\s+(\d+(?:\.\d+)?)\s+speaker_(\d{1,3})\s*$/u.exec(
        line,
      );
    if (!match) continue;
    const start = Math.max(0, Math.round(Number(match[1]) * 1000)),
      end = Math.min(durationMs, Math.round(Number(match[2]) * 1000));
    if (end > start) turns.push({ start, end, speaker: match[3]! });
    if (turns.length > 20000) throw new Error("codex_input_invalid");
  }
  turns.sort((a, b) => a.start - b.start || a.end - b.end);
  const labels = new Map<string, string>();
  for (const turn of turns)
    if (!labels.has(turn.speaker))
      labels.set(turn.speaker, `spk_${labels.size}`);
  const events = turns
    .flatMap((turn) => [
      { time: turn.start, speaker: turn.speaker, delta: 1 },
      { time: turn.end, speaker: turn.speaker, delta: -1 },
    ])
    .sort((a, b) => a.time - b.time);
  const spans: { start: number; end: number; speaker: string | null }[] = [],
    active = new Map<string, number>();
  let prior = 0;
  for (let index = 0; index < events.length;) {
    const time = events[index]!.time;
    if (time > prior)
      spans.push({
        start: prior,
        end: time,
        speaker:
          active.size === 1 ? labels.get(active.keys().next().value!)! : null,
      });
    while (index < events.length && events[index]!.time === time) {
      const event = events[index++]!,
        count = (active.get(event.speaker) ?? 0) + event.delta;
      if (count > 0) active.set(event.speaker, count);
      else active.delete(event.speaker);
    }
    prior = time;
  }
  return ownerWordsSchema.parse(
    words.map((word) => {
      let low = 0,
        high = spans.length;
      while (low < high) {
        const middle = Math.floor((low + high) / 2);
        if (spans[middle]!.end <= word.startMs) low = middle + 1;
        else high = middle;
      }
      const scores = new Map<string, number>();
      for (
        let index = low;
        index < spans.length && spans[index]!.start < word.endMs;
        index++
      ) {
        const span = spans[index]!,
          overlap = Math.max(
            0,
            Math.min(word.endMs, span.end) - Math.max(word.startMs, span.start),
          );
        if (span.speaker)
          scores.set(span.speaker, (scores.get(span.speaker) ?? 0) + overlap);
      }
      const best = [...scores].sort((a, b) => b[1] - a[1]),
        duration = word.endMs - word.startMs;
      const speakerId =
        best[0] &&
        best[0][1] >= duration * 0.6 &&
        (best[1]?.[1] ?? 0) <= duration * 0.2
          ? best[0][0]
          : null;
      return { ...word, speakerId };
    }),
  );
}
