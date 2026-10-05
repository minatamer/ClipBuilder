import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  analysisBundleSchema,
  sessionResponseSchema,
} from "@clipbuilder/contracts";

import {
  analysis,
  identity,
  media,
  noCandidateAnalysis,
} from "../session/session.test-fixtures";
import { clippingSessionReducer } from "../session/session.reducer";
import { initialClippingSessionState } from "../session/session.types";
import { CandidateReview } from "./candidate.review";
import { candidateRange, evidenceWords, timecode } from "./candidate.evidence";
import { createSampleApi } from "./sample.api";

function choices(count: number) {
  const first = analysis.candidates[0]!;
  const groups = Array.from({ length: count }, (_, index) =>
    analysis.transcript.words.map((word, ordinal) => ({
      ...word,
      id: `w_${(index * 3 + ordinal + 1).toString().padStart(6, "0")}`,
      startMs: word.startMs + index * 15_000,
      endMs: word.endMs + index * 15_000,
    })),
  );
  return analysisBundleSchema.parse({
    ...analysis,
    transcript: {
      ...analysis.transcript,
      words: groups.flat(),
      utterances: groups.map((words, index) => ({
        id: `utt_${(index + 1).toString().padStart(6, "0")}`,
        speakerId: "spk_0",
        startWordId: words[0]!.id,
        endWordId: words.at(-1)!.id,
      })),
    },
    candidates: groups.map((words, index) => ({
      ...first,
      id: `cand_${String(index + 1).repeat(22)}`,
      rank: index + 1,
      startWordId: words[0]!.id,
      endWordId: words.at(-1)!.id,
      evidence: [
        { ...first.evidence[0]!, wordIds: [words[0]!.id] },
        { ...first.evidence[1]!, wordIds: [words.at(-1)!.id] },
      ],
    })),
  });
}

const evidence = sessionResponseSchema.parse({
  ...identity,
  accessState: "active",
  provenStage: "candidates",
  media,
  activeOperation: null,
  analysisId: analysis.analysisId,
  analysisRevision: analysis.revision,
  assemblyId: null,
  assemblyRevision: null,
  manifestId: null,
  manifestHash: null,
  renderId: null,
  outputAvailable: false,
});

describe("CL-004 sample browser boundary", () => {
  it("uses local source frames without exposing transcript before selection", () => {
    const bundle = choices(3);
    const gallery = renderToStaticMarkup(
      <CandidateReview
        analysis={bundle}
        selectedId={null}
        onSelect={() => {}}
        onClose={() => {}}
        busy={false}
        sourceUrl="blob:synthetic-local"
      />,
    );
    expect(gallery.match(/<canvas/g)).toHaveLength(3);
    expect(gallery).not.toContain("<video");
    expect(gallery).not.toContain('aria-label="Selected moment transcript"');
    expect(gallery).not.toContain("Transcript</button>");
    const preview = renderToStaticMarkup(
      <CandidateReview
        analysis={bundle}
        selectedId={bundle.candidates[1]!.id}
        onSelect={() => {}}
        onClose={() => {}}
        busy={false}
        sourceUrl="blob:synthetic-local"
      />,
    );
    expect(preview.match(/<video/g)).toHaveLength(1);
    expect(preview.match(/<canvas/g)).toHaveLength(2);
    expect(preview).toContain('aria-label="Selected moment transcript"');
    expect(preview).toContain('value="15000"');
  });
  it.each([1, 2, 3, 4])(
    "supports %i validated choices with one selected portrait and correct paused restored range",
    (count) => {
      const bundle = choices(count);
      const selected = bundle.candidates.at(-1)!;
      const markup = renderToStaticMarkup(
        <CandidateReview
          analysis={bundle}
          selectedId={selected.id}
          onSelect={() => {}}
          onClose={() => {}}
          busy={false}
        />,
      );
      expect(markup.match(/data-moment-surface=/g)).toHaveLength(count);
      expect(markup.match(/aria-label="Selected moment \d"/g)).toHaveLength(1);
      expect(markup.match(/aria-label="Play moment \d:/g) ?? []).toHaveLength(
        count - 1,
      );
      expect(markup).toContain(`aria-label="Play moment ${count} preview"`);
      expect(markup).not.toContain("Pause moment");
      expect(markup).toContain('aria-label="Selected moment transcript"');
      expect(markup).toContain(`value="${(count - 1) * 15_000}"`);
    },
  );
  it("normalizes transport/JSON failures without raw content and ignores pre-aborted requests", async () => {
    const transport = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error("synthetic-secret-sentinel"));
    const api = createSampleApi(transport);
    await expect(
      api.analysis(analysis.analysisId, new AbortController().signal),
    ).rejects.toMatchObject({ failure: { code: "INTERNAL_ERROR" } });
    await expect(api.clear(new AbortController().signal)).rejects.not.toThrow(
      "synthetic-secret-sentinel",
    );
    transport.mockResolvedValue(new Response("synthetic-payload-sentinel"));
    await expect(
      api.analysis(analysis.analysisId, new AbortController().signal),
    ).rejects.toMatchObject({ failure: { code: "INTERNAL_ERROR" } });
    transport.mockClear();
    const controller = new AbortController();
    controller.abort();
    await expect(
      api.analysis(analysis.analysisId, controller.signal),
    ).rejects.toMatchObject({ failure: { code: "INTERNAL_ERROR" } });
    await expect(
      api.analysis("../../private", new AbortController().signal),
    ).rejects.toMatchObject({ failure: { code: "INTERNAL_ERROR" } });
    expect(transport).not.toHaveBeenCalled();
  });
  it("validates start/evidence/result and keeps selection provider-free", async () => {
    const transport = vi.fn<typeof fetch>();
    transport
      .mockResolvedValueOnce(
        Response.json(
          {
            sessionId: identity.sessionId,
            mode: "sample",
            expiresAt: identity.expiresAt,
            stage: "candidates",
            sampleAnalysisId: analysis.analysisId,
          },
          { status: 201 },
        ),
      )
      .mockResolvedValueOnce(Response.json(evidence))
      .mockResolvedValueOnce(Response.json(analysis));
    const api = createSampleApi(transport);
    const started = await api.start(new AbortController().signal);
    let state = clippingSessionReducer(initialClippingSessionState, {
      type: "RESTORE_EMPTY",
      availability: { sample: true, upload: false },
    });
    state = clippingSessionReducer(state, {
      type: "SAMPLE_SELECTED",
      ...started,
    });
    state = clippingSessionReducer(state, {
      type: "CANDIDATE_SELECTED",
      candidateId: analysis.candidates[0]!.id,
    });
    expect(state).toMatchObject({
      stage: "candidates",
      selectedId: analysis.candidates[0]!.id,
    });
    expect(transport).toHaveBeenCalledTimes(3);
    expect(
      transport.mock.calls.every(([url]) =>
        String(url).startsWith("/api/sample/"),
      ),
    ).toBe(true);
    expect(transport.mock.calls[0]?.[1]).toMatchObject({
      credentials: "same-origin",
      cache: "no-store",
    });
  });

  it("rejects a foreign session response and unvalidated results safely", async () => {
    const transport = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        Response.json({ ...evidence, sessionId: `ses_${"x".repeat(22)}` }),
      );
    await expect(
      createSampleApi(transport).evidence(
        identity.sessionId,
        new AbortController().signal,
      ),
    ).rejects.toMatchObject({ failure: { code: "INTERNAL_ERROR" } });
    transport.mockResolvedValue(Response.json({ raw: "synthetic-sentinel" }));
    await expect(
      createSampleApi(transport).analysis(
        analysis.analysisId,
        new AbortController().signal,
      ),
    ).rejects.toMatchObject({ failure: { code: "INTERNAL_ERROR" } });
  });

  it("derives immutable ranges and exact referenced evidence times", () => {
    expect(candidateRange(analysis, analysis.candidates[0]!)).toEqual({
      startMs: 0,
      endMs: 13_000,
      durationMs: 13_000,
    });
    expect(evidenceWords(analysis, ["w_000030"])[0]?.endMs).toBe(13_000);
    expect(timecode(65_000)).toBe("01:05");
    expect(() => evidenceWords(analysis, ["w_999999"])).toThrow(
      "Evidence references are unavailable.",
    );
  });

  it.each([1, 2, 3, 4])(
    "renders %i source-shaped placeholders without mounting transcript or playback effects",
    (count) => {
      const markup = renderToStaticMarkup(
        <CandidateReview
          analysis={choices(count)}
          selectedId={null}
          onSelect={() => {}}
          onClose={() => {}}
          busy={false}
        />,
      );
      expect(markup).toContain('data-moment-layout="gallery"');
      expect(markup.match(/data-moment-surface=/g)).toHaveLength(count);
      expect(markup.match(/aria-label="Play moment \d:/g)).toHaveLength(count);
      expect(markup).toContain("Landscape");
      expect(markup).toContain("1920 x 1080");
      expect(markup).not.toContain("Candidate transcript");
      expect(markup).not.toContain("Why this moment");
      expect(markup).not.toContain('type="range"');
      expect(markup).not.toContain("Proceed");
      expect(markup).not.toContain("<video");
    },
  );
  it("reveals selected source evidence, bounded playback and no editing surface", () => {
    const markup = renderToStaticMarkup(
      <CandidateReview
        analysis={analysis}
        selectedId={analysis.candidates[0]!.id}
        onSelect={() => {}}
        onClose={() => {}}
        busy={false}
      />,
    );
    expect(markup).toContain('data-moment-layout="preview"');
    expect(markup).toContain('aria-label="Other moments"');
    expect(markup).toContain("Agentic Notes");
    expect(markup).toContain("Moment playback position");
    expect(markup).toContain("Candidate transcript");
    expect(markup).toContain('min="0" max="13000"');
    expect(markup).toContain("Back to moments");
    expect(markup).not.toContain("simulated playback");
    expect(markup).not.toContain("manual trim");
    expect(markup).not.toContain("virality score");
    expect(markup).not.toContain("contenteditable");
  });
  it("renders no fake candidate for zero output and disables preview interaction while a build is pending", () => {
    expect(
      renderToStaticMarkup(
        <CandidateReview
          analysis={noCandidateAnalysis}
          selectedId={null}
          onSelect={() => {}}
          onClose={() => {}}
          busy={false}
        />,
      ),
    ).toBe("");
    const markup = renderToStaticMarkup(
      <CandidateReview
        analysis={choices(3)}
        selectedId={choices(3).candidates[0]!.id}
        onSelect={() => {}}
        onClose={() => {}}
        busy
      />,
    );
    expect(markup.match(/disabled=""/g)?.length).toBeGreaterThanOrEqual(4);
    expect(markup.match(/aria-label="Selected moment \d"/g)).toHaveLength(1);
  });
});
