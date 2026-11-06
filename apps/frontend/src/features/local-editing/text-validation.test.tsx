import { expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { textContentError, textLayerErrors } from "./text-validation.ts";
import { TextInspector } from "./text-inspector.tsx";
import { ControlTabs } from "./control-tabs.tsx";
import { syntheticTextLayer } from "../../../../../test/owner-text-fixture.ts";

it.each([
  ["", "Enter text."],
  ["  \n ", "Enter text."],
  ["x".repeat(501), "Max 500 characters."],
  [Array(11).fill("line").join("\n"), "Max 10 lines."],
  ["invalid\u0000text", "Use plain text."],
  ["  valid text\nwith a new line  ", undefined],
  ["صباح الخير 👋", undefined],
])(
  "gives concise content feedback without changing input (%j)",
  (input, expected) => {
    expect(textContentError(input!)).toBe(expected);
  },
);

it("routes timing and styling independently without replacing content or persisted spans", () => {
  const layer = syntheticTextLayer();
  const original = structuredClone(layer);
  expect(textLayerErrors(layer, 120)).toEqual({
    content: undefined,
    timing: undefined,
    style: undefined,
  });
  expect(
    textLayerErrors({ ...layer, endFrame: layer.startFrame }, 120).timing,
  ).toBe("Set a valid start and end.");
  expect(
    textLayerErrors(
      { ...layer, style: { ...layer.style, fontSize: 1000 } },
      120,
    ).style,
  ).toBe("Check text size and position.");
  expect(
    textLayerErrors(
      {
        ...layer,
        spans: [{ start: 0, end: 500, style: { color: "#FF3B30" } }],
      },
      120,
    ).style,
  ).toBe("Check word styling.");
  expect(layer).toEqual(original);
});

it("associates the brief error with its textarea and removes it when corrected", () => {
  const layer = syntheticTextLayer();
  function render(text: string) {
    return renderToStaticMarkup(
      createElement(TextInspector, {
        id: "synthetic-text",
        layers: [{ ...layer, text }],
        selected: layer.id,
        onSelect: () => {},
        onChange: () => {},
        onAdd: () => {},
        frames: 120,
        player: { current: null },
        available: true,
        attempt: 0,
        tab: "content",
        onTab: () => {},
      }),
    );
  }
  const invalid = render("");
  expect(invalid).toContain('aria-invalid="true"');
  expect(invalid).toContain('aria-describedby="synthetic-text-content-error"');
  expect(invalid).toContain('id="synthetic-text-content-error"');
  expect(invalid).toContain('role="alert">Enter text.</span>');
  expect(invalid).not.toContain("Use 1–500");
  const valid = render("Corrected title");
  expect(valid).not.toContain('aria-invalid="true"');
  expect(valid).toContain('id="synthetic-text-content-error"');
  expect(valid).not.toContain('role="alert"');
});

it("keeps a tab's accessible name and describes its compact issue indicator", () => {
  const html = renderToStaticMarkup(
    createElement(ControlTabs, {
      id: "synthetic-tabs",
      label: "Clip settings",
      items: [{ value: "text", label: "Text", issue: "Enter text." }],
      value: "text",
      onChange: () => {},
    }),
  );
  expect(html).toContain('aria-label="Text"');
  expect(html).toContain('aria-describedby="synthetic-tabs-text-issue"');
  expect(html).toContain('id="synthetic-tabs-text-issue">Enter text.</span>');
});

it("keeps the empty text-layer inspector usable without a feedback dereference", () => {
  const html = renderToStaticMarkup(
    createElement(TextInspector, {
      id: "empty-text",
      layers: [],
      selected: "",
      onSelect: () => {},
      onChange: () => {},
      onAdd: () => {},
      frames: 120,
      player: { current: null },
      available: true,
      attempt: 0,
      tab: "content",
      onTab: () => {},
    }),
  );
  expect(html).toContain("No text yet.");
  expect(html).not.toContain('role="alert"');
});
