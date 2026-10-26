import { expect, it } from "vitest";
import { clipStageLabel } from "./clip-stage.ts";
import { captionForOwnerEdit } from "./editor-state.ts";
import { OWNER_CAPTION_PRESETS } from "../../../../../packages/contracts/local/editor.ts";
import { automaticOwnerEdit } from "../../../../../packages/contracts/local/edit-overlay.ts";
import { syntheticTextClip } from "../../../../../test/owner-text-fixture.ts";

it("uses actual preparation phases only while preparing and preserves legacy/default caption identity", () => {
  expect(clipStageLabel({ state: "preparing" })).toBe("Preparing clip");
  expect(
    clipStageLabel({ state: "preparing", preparationStage: "planning" }),
  ).toBe("Planning edits");
  expect(
    clipStageLabel({ state: "preparing", preparationStage: "pictures" }),
  ).toBe("Adding pictures");
  expect(
    clipStageLabel({ state: "review-ready", preparationStage: "pictures" }),
  ).toBe("Ready to edit");
  const clip = syntheticTextClip(),
    doc = automaticOwnerEdit(clip.base!, clip.id, clip.baseHash!);
  expect(captionForOwnerEdit(doc)).toEqual(OWNER_CAPTION_PRESETS.clean);
  expect(captionForOwnerEdit(doc, OWNER_CAPTION_PRESETS.tiktok)).toEqual(
    OWNER_CAPTION_PRESETS.tiktok,
  );
  expect(
    captionForOwnerEdit(
      { ...doc, captions: OWNER_CAPTION_PRESETS.classic },
      OWNER_CAPTION_PRESETS.tiktok,
    ),
  ).toEqual(OWNER_CAPTION_PRESETS.classic);
});
