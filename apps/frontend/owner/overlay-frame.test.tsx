import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { OwnerAutomaticOverlay } from "../../../packages/composition/owner/automatic-overlay.tsx";
import { ownerOverlayFrame } from "../../../packages/composition/owner/overlay-frame.ts";
import type { OwnerOverlay } from "../../../packages/contracts/owner/clips.ts";

it("reuses frames only when the shared React output is identical, preserving highlight onset and cue boundaries", () => {
  const overlay: OwnerOverlay = {
    version: 1,
    frames: 90,
    visuals: [
      {
        id: crypto.randomUUID(),
        assetId: crypto.randomUUID(),
        digest: "a".repeat(64),
        startFrame: 5,
        endFrame: 45,
        box: { x: 0.1, y: 0.5, width: 0.8, height: 0.2 },
        fit: "contain",
        origin: "synthetic",
      },
    ],
    captions: [
      {
        startMs: 0,
        endMs: 2100,
        text: "Synthetic words",
        wordIds: ["w_000001", "w_000002"],
        lines: ["Synthetic words"],
        wordCues: [
          { wordId: "w_000001", text: "Synthetic", startMs: 0, endMs: 800 },
          { wordId: "w_000002", text: "words", startMs: 1000, endMs: 2000 },
        ],
      },
    ],
  };
  const seen = new Map<string, string>();
  for (let frame = 0; frame < overlay.frames; frame++) {
    const html = renderToStaticMarkup(
        <OwnerAutomaticOverlay
          overlay={overlay}
          assets={{
            [overlay.visuals[0]!.assetId]: "data:image/jpeg;base64,synthetic",
          }}
          frame={frame}
        />,
      ),
      key = ownerOverlayFrame(overlay, frame).key;
    if (seen.has(key)) expect(html).toBe(seen.get(key));
    else seen.set(key, html);
  }
  expect(seen.size).toBeLessThan(20);
  expect(ownerOverlayFrame(overlay, 0).key).not.toBe(
    ownerOverlayFrame(overlay, 1).key,
  );
  expect(ownerOverlayFrame(overlay, 4).key).not.toBe(
    ownerOverlayFrame(overlay, 5).key,
  );
  expect(ownerOverlayFrame(overlay, 44).key).not.toBe(
    ownerOverlayFrame(overlay, 45).key,
  );
});
