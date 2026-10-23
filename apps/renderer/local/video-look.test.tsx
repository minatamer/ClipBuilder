import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ownerVideoLookMatrix,
  ownerVideoLookSchema,
} from "../../../packages/contracts/local/video-look.ts";
import { OwnerVideoLookLayer } from "../../../packages/composition/local/video-look.tsx";
import { ownerVideoLookFilter } from "./video-look.ts";

it("preserves original/zero-strength media and uses a common sRGB luma for monochrome", () => {
  const identity = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  expect(ownerVideoLookMatrix()).toEqual(identity);
  expect(ownerVideoLookMatrix({ preset: "warm", strength: 0 })).toEqual(
    identity,
  );
  expect(ownerVideoLookFilter({ preset: "original", strength: 100 })).toBe(
    "null",
  );
  const mono = ownerVideoLookMatrix({ preset: "mono", strength: 100 });
  for (const rgb of [
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255],
  ]) {
    const output = [0, 3, 6].map((offset) =>
      rgb.reduce((sum, value, index) => sum + value * mono[offset + index]!, 0),
    );
    expect(output[0]).toBeCloseTo(output[1]!);
    expect(output[1]).toBeCloseTo(output[2]!);
  }
  expect(ownerVideoLookMatrix({ preset: "warm", strength: 50 })).toEqual([
    1.03, 0, 0, 0, 1.005, 0, 0, 0, 0.97,
  ]);
});

it("filters source children inside an sRGB SVG layer without changing sibling captions", () => {
  const html = renderToStaticMarkup(
    <>
      <OwnerVideoLookLayer look={{ preset: "mono", strength: 100 }}>
        <div>source</div>
      </OwnerVideoLookLayer>
      <span>caption</span>
    </>,
  );
  expect(html).toContain('color-interpolation-filters="sRGB"');
  expect(html).toContain('values="0.2126 0.7152 0.0722 0 0');
  expect(html).toContain("</div><span>caption</span>");
  expect(
    renderToStaticMarkup(
      <OwnerVideoLookLayer>
        <span>source</span>
      </OwnerVideoLookLayer>,
    ),
  ).toBe("<span>source</span>");
  for (const value of [
    { preset: "url(example)", strength: 10 },
    { preset: "warm", strength: 101 },
    { preset: "warm", strength: -1 },
    { preset: "warm", strength: 50.5 },
    { preset: "mono", strength: 100, css: "anything" },
  ])
    expect(ownerVideoLookSchema.safeParse(value).success).toBe(false);
});
