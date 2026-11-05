import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TextPositionFields } from "./position-fields.tsx";
import {
  OWNER_CAPTION_DEFAULT_CENTER_Y,
  OWNER_CAPTION_PRESETS,
} from "../../../../../packages/contracts/local/editor.ts";

it("selects Default positioning for new captions while retaining other positions and manual controls", () => {
  const html = renderToStaticMarkup(
    <TextPositionFields
      label="Caption"
      defaultCenter={OWNER_CAPTION_DEFAULT_CENTER_Y}
      style={OWNER_CAPTION_PRESETS.tiktok}
      onChange={() => {}}
    />,
  );
  expect(html).toMatch(
    /aria-pressed="true"[^>]*>Default positioning<\/button>/,
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
  expect(render()).toMatch(/aria-pressed="true"[^>]*>Lower half<\/button>/);
  expect(render(OWNER_CAPTION_DEFAULT_CENTER_Y)).toMatch(
    /aria-pressed="false"[^>]*>Default positioning<\/button>/,
  );
});
