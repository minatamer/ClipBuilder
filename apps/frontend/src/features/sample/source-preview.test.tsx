import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SourcePreview } from "./source-preview";

describe("full-source preview checkpoint", () => {
  it("labels fake playback and never reads or embeds a real video", () => {
    const markup = renderToStaticMarkup(<SourcePreview durationMs={180_000} />);
    expect(markup).toContain("Simulated source preview");
    expect(markup).not.toContain("<video");
    expect(markup).toContain('aria-label="Play source video"');
    expect(markup).toContain('aria-label="Source playback position"');
    expect(markup).toContain('max="180000"');
    expect(markup).not.toContain("1080 x 1920");
  });
  it("uses native full-source playback with metadata preload and an unclipped source aspect", () => {
    const markup = renderToStaticMarkup(
      <SourcePreview sourceUrl="blob:synthetic" durationMs={180_000} />,
    );
    expect(markup).toContain("<video");
    expect(markup).toContain('preload="metadata"');
    expect(markup).not.toContain("autoplay");
    expect(markup).toContain('min="0"');
    expect(markup).toContain('max="180000"');
    expect(markup).toContain('aria-label="Mute source audio"');
  });
});
