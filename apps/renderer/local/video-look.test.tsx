import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ownerVideoLookMatrix,
  ownerVideoLookSchema,
} from "../../../packages/contracts/local/video-look.ts";
import { OwnerVideoLookLayer } from "../../../packages/composition/local/video-look.tsx";
import {
  ownerVideoLookFilter,
  ownerTimedVideoLookFilter,
} from "./video-look.ts";

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

it("keeps native timed transforms exclusive, including Original overrides and legacy gaps", () => {
  const graph = ownerTimedVideoLookFilter(
    {
      videoLook: { preset: "warm", strength: 100 },
      videoLooks: [
        { preset: "original", strength: 100, startFrame: 30, endFrame: 60 },
      ],
    },
    { fps: 30, frames: 90, sourceStartFrame: 0, startFrame: 0, endFrame: 90 },
  );
  expect(graph.match(/colorchannelmixer/g)).toHaveLength(2);
  expect(graph).toContain("gte(n,0)*lt(n,30)");
  expect(graph).toContain("gte(n,60)*lt(n,90)");
  expect(graph).not.toContain("gte(n,30)");
  expect(
    ownerTimedVideoLookFilter(
      { videoLook: { preset: "warm", strength: 100 } },
      { fps: 24, frames: 72, sourceStartFrame: 0, startFrame: 0, endFrame: 90 },
    ),
  ).toBe(ownerVideoLookFilter({ preset: "warm", strength: 100 }));
});

it.each([24, 30000 / 1001, 30, 60])(
  "starts a Hook-wide filter on its first native frame at %s fps",
  (fps) => {
    const frames = Math.ceil((61 * fps) / 30),
      start = Math.floor((31 * fps) / 30 + 1e-9);
    const graph = ownerTimedVideoLookFilter(
      {
        videoLooks: [
          { preset: "mono", strength: 100, startFrame: 31, endFrame: 92 },
        ],
      },
      { fps, frames, sourceStartFrame: start, startFrame: 31, endFrame: 92 },
    );
    expect(graph).toContain(`gte(n,0)*lt(n,${frames})`);
  },
);
