import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import HomePage from "./page";
import robots from "./robots";

describe("visual approval prototype", () => {
  it("renders one clear product promise and keeps prototype limits explicit", () => {
    const markup = renderToStaticMarkup(<HomePage />);

    expect(markup.match(/<h1\b/g)).toHaveLength(1);
    expect(markup).toContain("Find the moment. Keep the final word.");
    expect(markup).toContain("Visual prototype · sample only");
    expect(markup).toContain("No upload or processing runs on this page.");
    expect(markup).toContain("Privacy &amp; limits");
    expect(markup).not.toContain("<button");
  });

  it("uses honest in-page review actions instead of unfinished workflow links", () => {
    const markup = renderToStaticMarkup(<HomePage />);

    expect(markup).toContain('href="#product-proof"');
    expect(markup).toContain('href="#privacy"');
    expect(markup).toContain(
      "Static visual example · controls arrive with editor behavior.",
    );
  });

  it("keeps the scroll narrative semantic and fully present in server markup", () => {
    const markup = renderToStaticMarkup(<HomePage />);

    expect(markup).toContain("Automation, with receipts.");
    expect(markup.match(/data-process-step="true"/g)).toHaveLength(3);
    expect(markup.match(/aria-current="step"/g)).toHaveLength(1);
    expect(markup).toContain("Transcript + timing");
    expect(markup).toContain("Ground the moment");
    expect(markup).toContain("Keep control");
  });

  it("keeps the unfinished application out of search indexes", () => {
    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    });
  });
});
