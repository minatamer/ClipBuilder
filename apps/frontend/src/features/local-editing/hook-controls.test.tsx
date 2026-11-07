import { expect, it } from "vitest";
import { createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { PlayerRef } from "@remotion/player";
import { HookControls } from "./hook-controls.tsx";
it("shows an empty End and disables preview/use while the Hook is incomplete", () => {
  const html = renderToStaticMarkup(
    <HookControls
      hook={{ startFrame: 990, endFrame: null }}
      suggestion={{ startFrame: 300, endFrame: 450 }}
      frames={1230}
      player={createRef<PlayerRef>()}
      available
      attempt={0}
      valid={false}
      generateTitle={false}
      addAudio={false}
      titleUnavailable={undefined}
      onGenerateTitle={() => {}}
      onAddAudio={() => {}}
      onChange={() => {}}
      onUseSuggestion={() => {}}
    />,
  );
  expect(html).toMatch(/aria-label="Hook end seconds"[^>]*value=""/);
  expect(html).toContain('value="33"');
  expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Use suggestion<\/button>/);
  expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Preview hook<\/button>/);
  expect(html).toContain("Choose an end to preview or apply the Hook.");
});
