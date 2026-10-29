import { expect, it } from "vitest";
import sharp from "sharp";
import { renderCodexIllustration } from "./codex-visual.ts";
it("renders a fixed bounded illustration and treats model markup as plain labels", async () => {
  const bytes = await renderCodexIllustration({
    layout: "process",
    heading: '<script>alert("synthetic")</script>',
    items: [
      { label: "Local input", icon: "computer" },
      { label: "Anonymous speaker", icon: "person" },
      { label: "Finished clip", icon: "check" },
    ],
  });
  expect(await sharp(bytes).metadata()).toMatchObject({
    format: "png",
    width: 920,
    height: 520,
  });
  expect(bytes.length).toBeLessThan(96 * 1024);
  await expect(
    renderCodexIllustration({
      layout: "concept",
      heading: "Synthetic",
      items: [{ label: "Unsafe", icon: "https://example.invalid" }],
    }),
  ).rejects.toThrow();
});
