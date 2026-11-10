import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TextPositionFields } from "./position-fields.tsx";
import {
  OWNER_CAPTION_DEFAULT_CENTER_Y,
  OWNER_CAPTION_PRESETS,
} from "../../../../../packages/contracts/local/editor.ts";

const presetButton = (markup: string, label: string) =>
  markup
    .split("</button>")
    .find((part) => part.includes(`aria-label="${label}"`));

it("selects Default positioning for new captions while retaining other positions and manual controls", () => {
  const html = renderToStaticMarkup(
    <TextPositionFields
      label="Caption"
      defaultCenter={OWNER_CAPTION_DEFAULT_CENTER_Y}
      style={OWNER_CAPTION_PRESETS.tiktok}
      onChange={() => {}}
    />,
  );
  expect(presetButton(html, "Default positioning")).toContain(
    'aria-pressed="true"',
  );
  for (const label of [
    "Upper half",
    "Center",
    "Lower half",
    "Position and size",
  ])
    expect(html).toContain(label);
});

it("keeps the authored-text positions unchanged and does not relabel saved lower captions as Default", () => {
  const render = (defaultCenter?: number) =>
    renderToStaticMarkup(
      <TextPositionFields
        label="Text"
        defaultCenter={defaultCenter}
        style={{
          ...OWNER_CAPTION_PRESETS.tiktok,
          box: { ...OWNER_CAPTION_PRESETS.tiktok.box, y: 0.75 - 100 / 1920 },
        }}
        onChange={() => {}}
      />,
    );
  expect(render()).not.toContain("Default positioning");
  expect(presetButton(render(), "Lower half")).toContain('aria-pressed="true"');
  expect(
    presetButton(render(OWNER_CAPTION_DEFAULT_CENTER_Y), "Default positioning"),
  ).toContain('aria-pressed="false"');
});

it("keeps an incomplete manual width editable without emitting invalid canvas coordinates", () => {
  const markup = renderToStaticMarkup(
    <TextPositionFields
      label="Caption"
      style={{
        ...OWNER_CAPTION_PRESETS.tiktok,
        box: { ...OWNER_CAPTION_PRESETS.tiktok.box, width: NaN },
      }}
      onChange={() => {}}
    />,
  );
  expect(markup).not.toContain("NaN");
  expect(markup).not.toContain('aria-pressed="true"');
  expect(markup).toContain("Caption width (0–1)");
  expect(markup).toContain('value=""');
});
