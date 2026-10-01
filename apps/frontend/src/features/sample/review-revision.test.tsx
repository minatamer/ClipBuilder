import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { compositionManifestSchema } from "@clipbuilder/contracts";
import { analysis, assembly, identity } from "../session/session.test-fixtures";
import { clippingSessionReducer } from "../session/session.reducer";
import { selectAvailableActions } from "../session/session.selectors";
import type { ClippingSessionState } from "../session/session.types";
import { AgenticNotes, assemblyNotes, candidateNotes } from "./agentic-notes";
import { ClipReview } from "./clip.review";
import { resultBundlesMatch } from "./result-preview";
import {
  processingActivityFraction,
  ProcessingStatus,
} from "./processing-status";
import { Progress } from "../../shared/ui/progress";
import { motionDurationMs } from "./use-moment-layout";
import { PortraitPlayer } from "./portrait-player";

const selected = analysis.candidates[0]!;
const summary = {
  analysisId: analysis.analysisId,
  analysisRevision: analysis.revision,
  assemblyId: assembly.assemblyId,
  assemblyRevision: assembly.revision,
  manifestId: assembly.manifestId,
  manifestHash: assembly.manifestHash,
  selectedCandidateId: selected.id,
  selectedStartWordId: selected.startWordId,
  selectedEndWordId: selected.endWordId,
};

describe("video-first review revision", () => {
  it("closes preview through the reducer without losing analysis or leaving Build enabled", () => {
    const state: ClippingSessionState = {
      stage: "candidates",
      identity,
      analysis: {
        analysisId: analysis.analysisId,
        revision: analysis.revision,
        bundle: analysis,
      },
      selectedId: selected.id,
      diagnosticCode: null,
    };
    const closed = clippingSessionReducer(state, {
      type: "CANDIDATE_PREVIEW_CLOSED",
    });
    expect(closed).toMatchObject({
      stage: "candidates",
      selectedId: null,
      analysis: state.analysis,
      diagnosticCode: null,
    });
    expect(selectAvailableActions(closed)).not.toContain("build-selection");
    const next = clippingSessionReducer(closed, {
      type: "CANDIDATE_SELECTED",
      candidateId: selected.id,
    });
    expect(selectAvailableActions(next)).toContain("build-selection");
    expect("identity" in next ? next.identity : null).toBe(identity);
  });
  it("grounds candidate notes in exact evidence and renders timestamp actions without predictions", () => {
    const notes = candidateNotes(analysis, selected);
    expect(notes.map((note) => note.wordIds)).toEqual(
      selected.evidence.map((item) => item.wordIds),
    );
    expect(notes.map((note) => note.body)).toEqual(
      selected.evidence.map((item) => item.note),
    );
    expect(notes[0]!.timeMs).toBe(
      analysis.transcript.words.find(
        (word) => word.id === notes[0]!.wordIds[0],
      )!.startMs,
    );
    const markup = renderToStaticMarkup(
      <AgenticNotes notes={notes} rangeStartMs={0} onSeek={() => {}} busy />,
    );
    expect(markup).toContain("Jump to 00:00");
    expect(markup.match(/disabled=""/g)).toHaveLength(notes.length);
    expect(markup).not.toMatch(/trending|predicted views|virality score/);
  });
  it("keeps fallback motion durations correct for normalized CSS seconds or milliseconds", () => {
    expect(motionDurationMs(".64s")).toBe(640);
    expect(motionDurationMs("640ms")).toBe(640);
    expect(motionDurationMs("180ms")).toBe(180);
    expect(motionDurationMs("0ms")).toBe(640);
    expect(motionDurationMs("invalid")).toBe(640);
  });
  it("does not invent visuals or internal cuts and resolves manifest visual times", () => {
    const empty = assemblyNotes(analysis, selected, assembly);
    expect(empty).toHaveLength(4);
    expect(empty[0]!.body).toContain("No internal speech cuts");
    const manifest = compositionManifestSchema.parse({
      ...assembly.compositionManifest,
      visuals: {
        ...assembly.compositionManifest.visuals,
        cues: [
          {
            id: `vcue_${"q".repeat(22)}`,
            assetId: `ast_${"q".repeat(22)}`,
            kind: "quote-card",
            startWordId: selected.startWordId,
            endWordId: selected.endWordId,
            layout: "lower-card",
            motion: "none",
            transition: "short-dissolve",
            rationale: "Keeps the spoken takeaway visible.",
          },
        ],
      },
    });
    const notes = assemblyNotes(analysis, selected, {
      ...assembly,
      compositionManifest: manifest,
    });
    expect(notes).toHaveLength(5);
    expect(notes[4]).toMatchObject({
      title: "Contextual quote",
      timeMs: 0,
      wordIds: analysis.transcript.words.map((word) => word.id),
    });
    expect(notes[4]!.body).toContain("Keeps the spoken takeaway visible.");
    expect(notes[4]!.body).toContain("00:00-00:13");
  });
  it("keeps final review video controls inline with edit notes and transcript, without repeated demo prose", () => {
    const markup = renderToStaticMarkup(
      <ClipReview analysis={analysis} assembly={assembly} />,
    );
    expect(markup).toContain("Clip agentic notes");
    expect(markup).toContain("Clip transcript");
    expect(markup).toContain("Play clip preview");
    expect(markup).toContain('min="0" max="13000"');
    expect(markup).toContain("Video placeholder");
    expect(markup).not.toMatch(
      /simulated playback|Synthetic transcript|Transcript preview|contenteditable/,
    );
  });
  it("renders delivery preview and a disabled download plus four inert Soon destinations", () => {
    const markup = renderToStaticMarkup(
      <ClipReview
        analysis={analysis}
        assembly={assembly}
        presentation="export"
      />,
    );
    expect(markup).toContain('aria-label="Clip delivery" tabindex="0"');
    expect(markup).toContain("Download MP4");
    expect(markup.match(/disabled=""/g)).toHaveLength(5);
    for (const name of ["Facebook", "Instagram", "TikTok", "X"])
      expect(markup).toContain(`${name} sharing unavailable, coming soon`);
    expect(markup.match(/>Soon</g)).toHaveLength(4);
    expect(markup).not.toMatch(
      /href=|The export screen is ready|Clip transcript/,
    );
  });
  it("keeps paused overlay controls named, source-bounded and keyboard reachable", () => {
    const markup = renderToStaticMarkup(
      <PortraitPlayer
        label="Owned conversation"
        range={{ startMs: 60_000, endMs: 118_000 }}
        currentMs={83_000}
        playing={false}
        toggle={() => {}}
        seek={() => {}}
        onClose={() => {}}
      />,
    );
    const controlsId = markup.match(/aria-controls="([^"]+)"/)?.[1];
    expect(controlsId).toBeTruthy();
    expect(markup).toContain(`id="${controlsId}"`);
    expect(markup).toContain('data-controls-visible="true"');
    expect(markup).toContain("Show playback controls");
    expect(markup).toContain("Back to moments");
    expect(markup).toContain("Play clip preview");
    expect(markup).toContain('min="60000" max="118000"');
    expect(markup).toContain('value="83000"');
    expect(markup).not.toMatch(/inert=|tabindex="-1"/);
  });
  it("disables reveal, close, playback and seek consistently while busy", () => {
    const markup = renderToStaticMarkup(
      <PortraitPlayer
        label="Owned conversation"
        range={{ startMs: 0, endMs: 13_000 }}
        currentMs={0}
        playing
        busy
        toggle={() => {}}
        seek={() => {}}
        onClose={() => {}}
      />,
    );
    expect(markup.match(/disabled=""/g)).toHaveLength(4);
    expect(markup).toContain('data-controls-visible="true"');
    expect(markup).toContain("Pause clip preview");
  });
  it("accepts matching immutable result references", () => {
    expect(resultBundlesMatch(summary, analysis, assembly)).toBe(true);
  });
  it.each(Object.keys(summary) as (keyof typeof summary)[])(
    "rejects a mismatched result %s",
    (key) => {
      expect(
        resultBundlesMatch(
          { ...summary, [key]: "foreign-reference" },
          analysis,
          assembly,
        ),
      ).toBe(false);
    },
  );
  it("keeps real activity bounded, slows its increments and never claims a cosmetic percentage", () => {
    const fractions = [0, 10_000, 20_000, 30_000, 600_000].map(
      processingActivityFraction,
    );
    expect(fractions[0]).toBe(0);
    expect(fractions[4]).toBeLessThan(0.92);
    expect(fractions[2]! - fractions[1]!).toBeLessThan(
      fractions[1]! - fractions[0]!,
    );
    expect(fractions[3]! - fractions[2]!).toBeLessThan(
      fractions[2]! - fractions[1]!,
    );
    expect(processingActivityFraction(NaN)).toBe(0);
    const markup = renderToStaticMarkup(
      <Progress label="Building your clip" activityFraction={0.6} />,
    );
    expect(markup).toContain("scaleX(0.6)");
    expect(markup).not.toContain("aria-valuenow");
    expect(markup).not.toContain("%");
    expect(markup).toContain('data-activity="true"');
    const real = renderToStaticMarkup(
      <ProcessingStatus
        mode="real"
        label="Building your clip"
        fraction={0.75}
      />,
    );
    expect(real).not.toContain("aria-valuenow");
    expect(real).toContain("Elapsed");
    const fake = renderToStaticMarkup(
      <ProcessingStatus mode="fake" label="Adding captions" fraction={0.75} />,
    );
    expect(fake).toContain('aria-valuenow="75"');
    expect(fake).toContain("75%");
  });
});
