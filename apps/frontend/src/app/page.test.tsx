import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import HomePage from "./page";
import robots from "./robots";

describe("foundation application shell", () => {
  it("renders one clear product heading and an honest disabled-live state", () => {
    const markup = renderToStaticMarkup(<HomePage />);

    expect(markup.match(/<h1>/g)).toHaveLength(1);
    expect(markup).toContain(
      "Turn long conversations into finished vertical clips.",
    );
    expect(markup).toContain("No live provider or paid operation is enabled.");
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
