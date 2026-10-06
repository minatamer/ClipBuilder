import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  selectedAssemblyFixture,
  groundedFixture,
} from "../assembly/selected-assembly.test-fixtures";
import { clippingSessionReducer } from "../session/session.reducer";
import type { ClippingSessionState } from "../session/session.types";
import {
  fixedReviewNotes,
  previewFrame,
  reviewInterestNotes,
} from "./fixed-review";
import { CloudClipReview } from "./cloud-clip.review";
import { CloudResult } from "./cloud-result";
import { PortraitPlayer } from "./portrait-player";
import { finalRenderResultSchema } from "@clipbuilder/contracts";
const proof = groundedFixture(),
  analysis = proof.analysis;
function candidates(): ClippingSessionState {
  return {
    stage: "candidates",
    identity: {
      sessionId: "ses_" + "b".repeat(22),
      authority: "local",
      mode: "upload",
      expiresAt: new Date(7200000).toISOString(),
      remaining: { analysisRetries: 0, renderAttempts: 0 },
    },
    analysis: {
      analysisId: analysis.analysisId,
      revision: analysis.revision,
      bundle: analysis,
    },
    selectedId: analysis.candidates[0]!.id,
    diagnosticCode: null,
  };
}
describe("immutable cloud review", () => {
  it.each([false, true])(
    "summarizes forty tracking state changes and counts only actual camera cuts (view change: %s)",
    async (changeView) => {
      const result = await selectedAssemblyFixture();
      const duration =
        result.manifest.range.endMs - result.manifest.range.startMs;
      result.manifest.focus = Array.from({ length: 40 }, (_, index) => {
        const box = {
          x: changeView && index >= 20 ? 0.7 : 0.15,
          y: 0.1,
          width: 0.2,
          height: 0.4,
        };
        const clock = {
          startMs: Math.floor((index * duration) / 40),
          endMs: Math.floor(((index + 1) * duration) / 40),
        };
        return index % 2
          ? { ...clock, mode: "held", reason: "pause", box }
          : { ...clock, mode: "speaker", box, speaker: "spk_0", confidence: 1 };
      });
      const notes = fixedReviewNotes(result);
      const camera = notes.filter((note) => note.title === "Camera treatment");
      expect(camera).toHaveLength(1);
      expect(camera[0]!.body).toContain(
        changeView ? "1 immediate camera cut" : "one close portrait view",
      );
      expect(camera[0]!.body).toContain("Held the current crop");
      expect(camera[0]!.timeMs).toBe(
        result.manifest.range.startMs +
          (changeView ? Math.floor(duration / 2) : 0),
      );
      expect(notes).toHaveLength(5);
      expect(notes.some((note) => note.title === "Framing")).toBe(false);
    },
  );
  it.each(["commons", "generated", "legacy"])(
    "describes the retained %s picture with its actual source, scene and grounded phrase",
    async (origin) => {
      const result = await selectedAssemblyFixture();
      const words = result.words
        .filter((word) => word.startMs - result.manifest.range.startMs >= 2000)
        .slice(0, 2);
      const raster = {
        width: 1,
        height: 1,
        sha256: "a".repeat(64),
        dataUri: "data:image/jpeg;base64,/9j/2Q==",
      };
      const anchor = words[0]!;
      result.manifest.pictures = [
        {
          startMs: anchor.startMs - result.manifest.range.startMs,
          endMs: anchor.startMs - result.manifest.range.startMs + 3800,
          anchorWordId: anchor.id,
          subjectWordIds: words.map((word) => word.id),
          asset:
            origin === "generated"
              ? {
                  ...raster,
                  repository: "google-gemini",
                  model: "gemini-3.1-flash-image",
                  policy: "contextual-generated-v1",
                }
              : {
                  ...raster,
                  repository: "wikimedia-commons",
                  license: "CC0",
                  pageId: 1,
                  title: "Synthetic woodland photograph",
                },
        },
      ];
      if (origin !== "legacy")
        result.pictureNotes = [
          {
            anchorWordId: anchor.id,
            scene:
              "A woodland scene illustrates the synthetic discussion of nature.",
          },
        ];
      const visuals = fixedReviewNotes(result).filter((note) =>
        note.title.startsWith("Visual "),
      );
      expect(visuals).toHaveLength(1);
      expect(visuals[0]!.body).toContain(
        origin === "generated"
          ? "Generated illustration"
          : "Synthetic woodland photograph",
      );
      if (origin !== "legacy")
        expect(visuals[0]!.body).toContain(result.pictureNotes![0]!.scene);
      expect(visuals[0]!.body).toContain("3.8 seconds");
      expect(visuals[0]!.quote).toBe(
        words.map((word) => word.punctuatedText).join(" "),
      );
      expect(visuals[0]!.wordIds).toEqual(words.map((word) => word.id));
      expect(visuals[0]!.timeMs).toBe(anchor.startMs);
    },
  );
  it("explains a highlight's editorial role instead of repeating its quoted evidence and preserves meaningful model notes", () => {
    const candidate = structuredClone(analysis.candidates[0]!);
    const quote = analysis.transcript.words.find(
      (word) => word.id === candidate.evidence[0]!.wordIds[0],
    )!.punctuatedText;
    candidate.evidence[0]!.note = quote;
    candidate.evidence[1]!.note =
      "The synthetic conclusion resolves the earlier question.";
    const notes = reviewInterestNotes(analysis, candidate);
    expect(notes[0]!.body).toContain("reason to keep watching");
    expect(notes[0]!.body).not.toBe(quote);
    expect(notes[0]!.quote).toBe(quote);
    expect(notes[1]!.body).toBe(candidate.evidence[1]!.note);
  });
  it("keeps final transcript and ordinary audio controls available without starting work on render", async () => {
    const assembly = await selectedAssemblyFixture(),
      api = { session: vi.fn(), output: vi.fn() };
    const result = finalRenderResultSchema.parse({
      version: 1,
      binding: assembly.binding,
      manifestHash: assembly.manifestHash,
      output: {
        artifactId: "00000000-0000-4000-8000-000000000001",
        generation: "4",
        bytes: 1024,
        checksum: "c".repeat(64),
      },
      expiresAtMs: Date.now() + 60_000,
      receipt: "synthetic-output",
    });
    const html = renderToStaticMarkup(
      <CloudResult result={result} assembly={assembly} api={api} />,
    );
    expect(html).toContain('aria-label="Final clip transcript"');
    expect(html).toContain(assembly.words[0]!.punctuatedText);
    expect(html).toContain('aria-label="Adjust clip volume"');
    expect(html).toMatch(/<button[^>]+disabled=""[^>]*>.*?Download MP4/);
    expect(html).not.toContain("autoplay");
    expect(api.session).not.toHaveBeenCalled();
    expect(api.output).not.toHaveBeenCalled();
  });
  it("presents seek positions in readable time without announcing every playback tick", () => {
    const html = renderToStaticMarkup(
      <PortraitPlayer
        label="Synthetic clip"
        range={{ startMs: 10_000, endMs: 25_000 }}
        currentMs={15_000}
        playing={false}
        volume={0}
        setVolume={() => {}}
        seek={() => {}}
        toggle={() => {}}
      />,
    );
    expect(html).toContain('aria-valuetext="00:05 of 00:15"');
    expect(html).toContain('aria-live="off"');
    expect(html).toContain('aria-label="Adjust clip volume"');
    expect(html).toContain('aria-expanded="false"');
  });
  it("opens only the selected frozen revision and rejects late publication after Clear", async () => {
    const result = await selectedAssemblyFixture();
    const pending = clippingSessionReducer(candidates(), {
      type: "CLOUD_ASSEMBLY_STARTED",
      candidateId: result.candidateId,
    });
    expect(pending.stage).toBe("cloud-assembling");
    expect(
      clippingSessionReducer(pending, {
        type: "CLOUD_ASSEMBLY_COMPLETED",
        result,
      }).stage,
    ).toBe("cloud-review");
    expect(
      clippingSessionReducer(pending, {
        type: "CLOUD_ASSEMBLY_COMPLETED",
        result: { ...result, analysisRevision: "rev_" + "d".repeat(22) },
      }).diagnosticCode,
    ).toBe("invalid-manifest");
    const cleared = clippingSessionReducer(pending, { type: "CLEAR" });
    expect(
      clippingSessionReducer(cleared, {
        type: "CLOUD_ASSEMBLY_COMPLETED",
        result,
      }).stage,
    ).toBe("clearing");
  });
  it("clamps source seeks to the clip's frame clock and rejects nonfinite positions", async () => {
    const result = await selectedAssemblyFixture(),
      { range } = result.manifest;
    expect(previewFrame(range.startMs, result)).toBe(0);
    expect(previewFrame(range.startMs + 1000, result)).toBe(30);
    expect(previewFrame(-1000, result)).toBe(0);
    expect(previewFrame(range.endMs + 1000, result)).toBe(
      Math.ceil(((range.endMs - range.startMs) * 30) / 1000) - 1,
    );
    expect(() => previewFrame(NaN, result)).toThrow();
    expect(() => previewFrame(Infinity, result)).toThrow();
  });
  it("reports only validated edits, keeps the existing layout and starts no work during SSR", async () => {
    const result = await selectedAssemblyFixture(),
      api = { session: vi.fn(), preview: vi.fn() };
    const notes = fixedReviewNotes(result);
    expect(notes.map((n) => n.body).join(" ")).not.toMatch(
      /normaliz|trend|remov|generate/i,
    );
    const html = renderToStaticMarkup(
      <CloudClipReview result={result} analysis={analysis} api={api} />,
    );
    expect(html).toContain("Read-only clip preview");
    expect(html).toContain("Opening the prepared clip");
    expect(html).toContain("Agentic Notes");
    expect(html).toContain("Transcript");
    expect(html).not.toMatch(/Download MP4|Trim|caption style/);
    expect(api.session).not.toHaveBeenCalled();
    expect(api.preview).not.toHaveBeenCalled();
  });
});
