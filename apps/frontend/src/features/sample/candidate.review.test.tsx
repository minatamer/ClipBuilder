import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { AnalysisBundleV1 } from "@clipbuilder/contracts";
import { analysis, assembly } from "../session/session.test-fixtures";
import { CandidateReview } from "./candidate.review";
import { ClipReview } from "./clip.review";

const render = (
  bundle: AnalysisBundleV1,
  selected = false,
  sourceUrl?: string,
) =>
  renderToStaticMarkup(
    <CandidateReview
      analysis={bundle}
      selectedId={selected ? bundle.candidates[0]!.id : null}
      onSelect={() => {}}
      onClose={() => {}}
      busy={false}
      {...(sourceUrl ? { sourceUrl } : {})}
    />,
  );

describe("candidate source dimensions and edited-output separation", () => {
  it.each([
    [1920, 1080, 0, "landscape", 1920 / 1080],
    [1080, 1920, 0, "portrait", 1080 / 1920],
    [1080, 1080, 0, "square", 1],
    [1920, 1080, 90, "portrait", 1080 / 1920],
    [1080, 1920, 270, "landscape", 1920 / 1080],
  ] as const)(
    "respects %sx%s rotated %s degrees in gallery and playback",
    (width, height, rotationDegrees, orientation, ratio) => {
      const bundle = {
        ...analysis,
        media: {
          ...analysis.media,
          width,
          height,
          rotationDegrees,
          orientation,
        },
      };
      expect(render(bundle)).toContain(`--moment-aspect:${ratio}`);
      const preview = render(bundle, true);
      expect(preview).toContain(`data-source-shape="${orientation}"`);
      expect(preview).toContain(`aspect-ratio:${ratio}`);
      expect(preview).toContain(
        orientation === "landscape" ? "Show Video" : "Moment details",
      );
      expect(preview).toContain("Back to moments");
    },
  );
  it("uses memory-only thumbnail canvases without parallel video loads", () => {
    const markup = render(analysis, false, "blob:synthetic");
    expect(markup).toContain("<canvas");
    expect(markup).toContain('data-thumbnail-state="loading"');
    expect(markup).toContain("Loading preview frame");
    expect(markup).not.toContain("autoplay");
    expect(markup).not.toContain("<video");
  });
  it("mounts one selected player with ordered video, notes and transcript slides", () => {
    const markup = render(analysis, true, "blob:synthetic");
    expect(markup).toContain("Selected moment 1 review");
    expect(markup).toContain('data-review-slide="0"');
    expect(markup.indexOf('data-review-slide="0"')).toBeLessThan(
      markup.indexOf('data-review-slide="1"'),
    );
    expect(markup.indexOf('data-review-slide="1"')).toBeLessThan(
      markup.indexOf('data-review-slide="2"'),
    );
    expect(
      markup.match(/aria-label="Moment playback position"/gu),
    ).toHaveLength(1);
    expect(markup).toContain("Scrollable moment transcript");
  });
  it("keeps the edited review and placeholder vertical for a landscape source", () => {
    const markup = renderToStaticMarkup(
      <ClipReview analysis={analysis} assembly={assembly} />,
    );
    expect(markup).toContain("9:16");
    expect(markup).toContain("1080 x 1920");
    expect(markup).not.toContain("Selected moment 1 review");
  });
});
