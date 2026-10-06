import type {
  AnalysisBundleV1,
  ClipCandidateV1,
  SelectedAssemblyResult,
} from "@clipbuilder/contracts";
import { focusLayout } from "@clipbuilder/composition";
import { candidateNotes, type EditorialNote } from "./agentic-notes";
import { timecode } from "./candidate.evidence";
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
  const duration = (manifest.range.endMs - start) / 1000;
  const views = manifest.focus.map((focus) =>
    focusLayout(
      manifest.source,
      focus,
      manifest.output.width,
      manifest.output.height,
    ),
  );
  const cuts = manifest.focus.filter(
    (_focus, index) =>
      index > 0 &&
      JSON.stringify(views[index]) !== JSON.stringify(views[index - 1]),
  );
  const heldView = manifest.focus.some(
    (focus, index) =>
      focus.mode === "held" &&
      index > 0 &&
      JSON.stringify(views[index]) === JSON.stringify(views[index - 1]),
  );
  const hasFaceView = manifest.focus.some((focus) => focus.mode !== "wide");
  return [
    {
      title: "Conversation edit",
      body: `Kept ${timecode(start)}–${timecode(manifest.range.endMs)} of the source as a ${duration.toFixed(1).replace(/\.0$/, "")}-second clip. The dialogue stays continuous, preserving the exchange and its ending.`,
      timeMs: start,
      wordIds: [],
    },
    {
      title: "Caption treatment",
      body: manifest.captions.length
        ? "Large captions follow the dialogue, with a background highlight that moves to each spoken word."
        : "This edit has no displayable caption groups; the source speech is preserved.",
      timeMs: start,
      wordIds: [],
    },
    {
      title: "Camera treatment",
      body: [
        cuts.length
          ? `Made ${cuts.length} immediate camera ${cuts.length === 1 ? "cut" : "cuts"} between views, without panning across the scene or cutting the dialogue.`
          : hasFaceView
            ? "Kept one close portrait view throughout this edit."
            : "Kept the full scene; this edit has no accepted close face view.",
        ...(heldView
          ? [
              "Held the current crop through uncertain moments instead of adding another camera move.",
            ]
          : []),
      ].join(" "),
      timeMs: start + (cuts[0]?.startMs ?? 0),
      wordIds: [],
    },
    {
      title: "Audio treatment",
      body: "Kept the original conversation audio running beneath captions and visuals, so the added imagery does not interrupt the speech.",
      timeMs: start,
      wordIds: [],
    },
    ...manifest.cards.map((card, index) => ({
      title: "Contextual card",
      body: card.title,
      timeMs: start + card.startMs,
      wordIds: result.cardEvidence[index]!.titleWordIds,
      quote: card.lines.join(" · "),
    })),
    ...(manifest.pictures ?? []).map((picture, index) => {
      const brief = result.pictureNotes?.[index]?.scene;
      const scene = brief
        ? `${brief}${/[.!?]$/.test(brief) ? "" : "."}`
        : undefined;
      const quote = result.words
        .filter((word) => picture.subjectWordIds.includes(word.id))
        .map((word) => word.punctuatedText)
        .join(" ");
      const description =
        picture.asset.repository === "wikimedia-commons"
          ? `Fetched image: ${picture.asset.title}. ${scene ? `Chosen to illustrate: ${scene}` : "Paired with the quoted thought below."}`
          : `Generated illustration${scene ? `: ${scene}` : " paired with the quoted thought below."}`;
      return {
        title: `Visual ${index + 1}`,
        body: `${description} Shown for ${((picture.endMs - picture.startMs) / 1000).toFixed(1).replace(/\.0$/, "")} seconds as an overlay behind the captions while the conversation continues.`,
        timeMs: start + picture.startMs,
        wordIds: picture.subjectWordIds,
        quote,
      };
    }),
  ];
}

export function reviewInterestNotes(
  analysis: AnalysisBundleV1,
  candidate: ClipCandidateV1,
): EditorialNote[] {
  const roles = {
    "immediate-hook":
      "This opening beat gives the viewer a reason to keep watching.",
    "clear-payoff":
      "This is the payoff the preceding conversation builds toward.",
    "self-contained":
      "This thought gives the clip enough context to stand on its own.",
    specific: "This concrete detail makes the conversation more memorable.",
    "human-energy":
      "This beat adds energy and a personal perspective to the exchange.",
    "appropriate-length":
      "This passage fits the short clip without losing its meaning.",
    "visual-feasibility":
      "This thought offers a clear opportunity for supporting imagery.",
    "clean-boundaries":
      "This beat helps the clip begin or end on a complete thought.",
  };
  const normalized = (text: string) =>
    text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  return candidateNotes(analysis, candidate).map((note, index) => ({
    ...note,
    body:
      normalized(note.body) === normalized(note.quote ?? "")
        ? roles[candidate.evidence[index]!.signal]
        : note.body,
  }));
}
