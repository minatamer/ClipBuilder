import type {
  AnalysisBundleV1,
  AssemblyBundleV1,
  ClipCandidateV1,
} from "@clipbuilder/contracts";
import {
  candidateRange,
  evidenceWords,
  signalLabels,
  timecode,
} from "./candidate.evidence";
import styles from "./sample.module.css";

export type EditorialNote = {
  title: string;
  body: string;
  timeMs: number;
  wordIds: readonly string[];
  quote?: string;
};

export function candidateNotes(
  analysis: AnalysisBundleV1,
  candidate: ClipCandidateV1,
): EditorialNote[] {
  return candidate.evidence.map((item) => {
    const words = evidenceWords(analysis, item.wordIds);
    return {
      title: signalLabels[item.signal],
      body: item.note,
      timeMs: words[0]!.startMs,
      wordIds: item.wordIds,
      quote: words.map((word) => word.punctuatedText).join(" "),
    };
  });
}

export function assemblyNotes(
  analysis: AnalysisBundleV1,
  candidate: ClipCandidateV1,
  assembly: AssemblyBundleV1,
): EditorialNote[] {
  const range = candidateRange(analysis, candidate);
  const manifest = assembly.compositionManifest;
  const notes: EditorialNote[] = [
    {
      title: "Conversation cut",
      body: `Keep ${timecode(range.startMs)}-${timecode(range.endMs)} of the source as one ${Math.round(range.durationMs / 1000)}-second conversation. No internal speech cuts; the context and payoff stay together.`,
      timeMs: range.startMs,
      wordIds: [candidate.startWordId],
    },
    {
      title: "Fixed captions",
      body: "Clean-emphasis captions follow the transcript, keeping spoken words readable without changing what was said.",
      timeMs: range.startMs,
      wordIds: [candidate.startWordId],
    },
    {
      title: "Speaker framing",
      body: `Active-speaker framing uses editorial smoothing across ${assembly.speakerFocus.focus.length} focus ${assembly.speakerFocus.focus.length === 1 ? "segment" : "segments"} in the vertical composition.`,
      timeMs: range.startMs,
      wordIds: [candidate.startWordId],
    },
    {
      title: "Audio treatment",
      body: "Speech-safe normalization keeps the conversation's audio level consistent.",
      timeMs: range.startMs,
      wordIds: [candidate.startWordId],
    },
  ];
  for (const cue of manifest.visuals.cues) {
    const words = evidenceWords(analysis, [cue.startWordId, cue.endWordId]);
    const cueWords = analysis.transcript.words.filter(
      (word) =>
        word.startMs >= words[0]!.startMs && word.endMs <= words.at(-1)!.endMs,
    );
    const asset = assembly.assets.find((item) => item.id === cue.assetId);
    const quote = assembly.visualPlan.requests.find(
      (item) => item.id === asset?.requestId,
    )?.exactText;
    const layouts = {
      "full-frame": "full frame",
      "picture-in-picture": "picture in picture",
      "lower-card": "lower card",
    };
    const motions = { none: "static", "slow-push-in": "slow push in" };
    const transitions = { cut: "cut", "short-dissolve": "short dissolve" };
    notes.push({
      title:
        cue.kind === "quote-card"
          ? "Contextual quote"
          : cue.kind === "equation-card"
            ? "Equation visual"
            : "Contextual visual",
      body: `${cue.rationale} ${timecode(words[0]!.startMs - range.startMs)}-${timecode(words.at(-1)!.endMs - range.startMs)}; ${layouts[cue.layout]}, ${motions[cue.motion]}, ${transitions[cue.transition]} transition.`,
      timeMs: words[0]!.startMs,
      wordIds: cueWords.map((word) => word.id),
      ...(quote ? { quote } : {}),
    });
  }
  return notes;
}

export function AgenticNotes({
  notes,
  rangeStartMs,
  onSeek,
  busy = false,
}: {
  notes: readonly EditorialNote[];
  rangeStartMs: number;
  onSeek: (timeMs: number, wordIds: readonly string[]) => void;
  busy?: boolean;
}) {
  return (
    <ul className={styles.agenticNotes}>
      {notes.map((note, index) => (
        <li key={`${note.title}-${index}`}>
          <div className={styles.noteHeading}>
            <strong>{note.title}</strong>
            <button
              type="button"
              disabled={busy}
              onClick={() => onSeek(note.timeMs, note.wordIds)}
              aria-label={`Jump to ${timecode(note.timeMs - rangeStartMs)}: ${note.title}`}
              title={`Source ${timecode(note.timeMs)}`}
            >
              {timecode(note.timeMs - rangeStartMs)}
            </button>
          </div>
          <p>{note.body}</p>
          {note.quote && (
            <blockquote className={styles.noteQuote}>{note.quote}</blockquote>
          )}
        </li>
      ))}
    </ul>
  );
}
