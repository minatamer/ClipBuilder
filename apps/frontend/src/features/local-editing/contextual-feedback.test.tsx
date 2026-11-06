import { expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { InlineFeedback } from "../../shared/ui/inline-feedback";
import { SessionControls } from "./session-controls";
import { CaptionTextEditor } from "./caption-text-editor";
import { TypographyFields } from "./typography-fields";
import { AudioInspector } from "./audio-inspector";
import { DemoLimitToast } from "./demo-limit-toast";
import { WorkflowActions } from "./workflow-actions";
import { captionWordError } from "./text-validation";
import { syntheticTextClip } from "../../../../../test/owner-text-fixture.ts";

it("reserves local feedback space without announcing empty messages, and safely announces supplied feedback", () => {
  const empty = renderToStaticMarkup(createElement(InlineFeedback, {}));
  expect(empty).toContain('aria-hidden="true"');
  expect(empty).toContain('data-reserve="true"');
  expect(empty).not.toContain('role="alert"');
  expect(
    renderToStaticMarkup(createElement(InlineFeedback, { reserve: false })),
  ).toBe("");
  const error = renderToStaticMarkup(
    createElement(InlineFeedback, {
      message: "<script>synthetic</script>",
      id: "field-error",
    }),
  );
  expect(error).toContain('id="field-error"');
  expect(error).toContain('role="alert"');
  expect(error).toContain("&lt;script&gt;synthetic&lt;/script&gt;");
  expect(error).not.toContain("<script>");
  expect(
    renderToStaticMarkup(
      createElement(InlineFeedback, { message: "Canceled.", tone: "status" }),
    ),
  ).toContain('role="status"');
});

it("keeps reset feedback in its action group and describes the reset button", () => {
  const html = renderToStaticMarkup(
    createElement(SessionControls, {
      recovery: true,
      disabled: false,
      onClear: () => {},
      message: "Couldn’t reset.",
    }),
  );
  expect(html).toContain("aria-describedby=");
  expect(html).toContain("Couldn’t reset.");
  expect(html.indexOf("Couldn’t reset.")).toBeGreaterThan(
    html.indexOf("Reset options"),
  );
});

it("keeps a failed direct reset anchored to recovery without offering an unauthorized discard", () => {
  const html = renderToStaticMarkup(
    createElement(SessionControls, {
      recovery: false,
      disabled: false,
      onClear: () => {},
      message: "Couldn’t reset.",
    }),
  );
  expect(html).toContain('class="session-feedback"');
  expect(html).toContain("Couldn’t reset.");
  expect(html).not.toContain('aria-label="Session recovery"');
  expect(html).not.toContain("Discard session");
  expect(html).toContain("aria-describedby=");
});

it("places action-only feedback in its anchored owner instead of a competing controls row", () => {
  const html = renderToStaticMarkup(
    <WorkflowActions feedback label="Editor feedback">
      <InlineFeedback message="Couldn’t apply." />
    </WorkflowActions>,
  );
  expect(html).toContain("workflow-action-feedback");
  expect(html).toContain('aria-label="Editor feedback"');
  expect(html).toContain("Couldn’t apply.");
});

it.each([
  ["", "Enter a word."],
  ["  ", "Enter a word."],
  ["x".repeat(81), "Max 80 characters."],
  ["bad\u0000word", "Use plain text."],
  ["مرحبا", undefined],
])("validates caption words without changing them (%j)", (value, expected) => {
  expect(captionWordError(value!)).toBe(expected);
});

it("associates caption-word validation with that word, preserving IDs and clocks", () => {
  const caption = syntheticTextClip().base!.overlay.captions[0]!;
  const original = structuredClone(caption),
    word = caption.wordCues[0]!;
  const props = {
    captions: [caption],
    edits: [{ wordId: word.wordId, text: "" }],
    player: { current: null },
    available: true,
    frames: 120,
    onChange: () => {},
  };
  const html = renderToStaticMarkup(createElement(CaptionTextEditor, props));
  expect(html).toContain('aria-invalid="true"');
  expect(html).toContain("aria-describedby=");
  expect(html).toContain("Enter a word.");
  const corrected = renderToStaticMarkup(
    createElement(CaptionTextEditor, {
      ...props,
      edits: [{ wordId: word.wordId, text: "Corrected" }],
    }),
  );
  expect(corrected).not.toContain("Enter a word.");
  expect(caption).toEqual(original);
});

it.each([
  { fontSize: NaN, message: "Use 24–120." },
  { fontSize: 121, message: "Use 24–120." },
  { outlineWidth: NaN, message: "Use 0–12." },
])(
  "places invalid typography feedback at its numeric control (%j)",
  ({ message, ...patch }) => {
    const value = {
      ...syntheticTextClip().base!.overlay.captionStyle!,
      ...patch,
    };
    const html = renderToStaticMarkup(
      createElement(TypographyFields, {
        value,
        onChange: () => {},
        onPreset: () => {},
      }),
    );
    expect(html).toContain(message);
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain("aria-describedby=");
    expect(html).not.toContain('value="NaN"');
    expect(html).toContain('aria-label="Font size"');
    expect(html).toContain('aria-label="Outline width"');
  },
);

it("keeps audio upload failures at the upload controls, apart from the sound library", () => {
  const html = renderToStaticMarkup(
    createElement(AudioInspector, {
      audio: undefined,
      assets: [],
      frames: 120,
      hook: undefined,
      player: { current: null },
      available: true,
      attempt: 0,
      pending: false,
      onChange: () => {},
      onUpload: async () => null,
      uploadFeedback: "Couldn’t add this audio.",
    }),
  );
  expect(html).toContain("Couldn’t add this audio.");
  expect(html.lastIndexOf("Couldn’t add this audio.")).toBeGreaterThan(
    html.indexOf("Upload audio"),
  );
  expect(html).toContain("aria-describedby=");
});

it("renders the demo bound notice within its owner's tree rather than needing document.body", () => {
  const html = renderToStaticMarkup(
    createElement(DemoLimitToast, { message: "Synthetic limit." }),
  );
  expect(html).toContain("Synthetic limit.");
  expect(html).toContain('role="status"');
  expect(html).toContain("Dismiss demo limit notice");
});
