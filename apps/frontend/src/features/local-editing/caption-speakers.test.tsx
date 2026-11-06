import { expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CaptionSpeakers } from "./caption-speakers";
import { resolveCaptionSpeakers } from "../../../../../packages/contracts/local/caption-speakers.ts";
import { OWNER_CAPTION_PRESETS } from "../../../../../packages/contracts/local/editor.ts";
import { independentHookFixture } from "../../../../../test/owner-hook-fixture.ts";

it("distinguishes absent labels from a single label without pretending manual palette slots were detected", () => {
  const base = independentHookFixture().base!;
  const render = (words: typeof base.words) =>
    renderToStaticMarkup(
      createElement(CaptionSpeakers, {
        value: resolveCaptionSpeakers(base.overlay.captions, words),
        captions: base.overlay.captions,
        style: OWNER_CAPTION_PRESETS.clean,
        onChange: () => {},
      }),
    );
  expect(
    render(base.words.map((word) => ({ ...word, speakerId: null }))),
  ).toContain("No speaker labels available.");
  expect(render(base.words)).toContain("One speaker label available.");
  const multiple = render(
    base.words.map((word, index) => ({
      ...word,
      speakerId: `spk_${index % 2}`,
    })),
  );
  expect(multiple).not.toContain("No speaker labels available.");
  expect(multiple).not.toContain("One speaker label available.");
  expect(multiple).toContain('value="#74b9ff"');
  expect(multiple).toContain('value="#ffb86c"');
});
