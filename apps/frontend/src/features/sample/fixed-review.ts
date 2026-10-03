import type { SelectedAssemblyResult } from "@clipbuilder/contracts";
import type { EditorialNote } from "./agentic-notes";
export function previewFrame(sourceMs: number, result: SelectedAssemblyResult) {
  if (!Number.isFinite(sourceMs)) throw new Error("invalid-playback-position");
  const duration = result.manifest.range.endMs - result.manifest.range.startMs;
  return Math.min(
    Math.ceil((duration * 30) / 1000) - 1,
    Math.max(
      0,
      Math.round(((sourceMs - result.manifest.range.startMs) * 30) / 1000),
    ),
  );
}
export function fixedReviewNotes(
  result: SelectedAssemblyResult,
): EditorialNote[] {
  const { manifest } = result,
    start = manifest.range.startMs;
  return [
    {
      title: "Selected moment",
      body: "One continuous range; no internal cuts.",
      timeMs: start,
      wordIds: [],
    },
    {
      title: "Audio",
      body: "Source speech continues beneath captions and contextual cards.",
      timeMs: start,
      wordIds: [],
    },
    {
      title: "Captions",
      body: `${manifest.captions.length} fixed caption groups use the selected transcript.`,
      timeMs: start,
      wordIds: [],
    },
    ...manifest.focus.map((focus) => ({
      title: "Framing",
      body:
        focus.mode === "wide"
          ? "The scene remains visible."
          : "Automatic speaker focus.",
      timeMs: start + focus.startMs,
      wordIds: [],
    })),
    ...manifest.cards.map((card, index) => ({
      title: "Contextual card",
      body: card.title,
      timeMs: start + card.startMs,
      wordIds: result.cardEvidence[index]!.titleWordIds,
      quote: card.lines.join(" · "),
    })),
  ];
}
