import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ErrorPage from "./error";
import GlobalError from "./global-error";
describe("generic view failures", () => {
  it("keeps exception text, digest and console instructions out of both fallback views", () => {
    const error = Object.assign(new Error("synthetic-private-sentinel"), {
      digest: "123456789",
    });
    for (const html of [
      renderToStaticMarkup(<ErrorPage error={error} reset={() => {}} />),
      renderToStaticMarkup(<GlobalError error={error} />),
    ]) {
      expect(html).toContain("ClipBuilder could not load this view");
      expect(html).not.toContain("synthetic-private-sentinel");
      expect(html).not.toContain(error.digest);
      expect(html).not.toContain("console");
    }
  });
});
