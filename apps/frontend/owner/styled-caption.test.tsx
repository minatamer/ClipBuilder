import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { OwnerStyledCaption } from "../../../packages/composition/owner/styled-caption.tsx";
import { ownerOverlayFrame } from "../../../packages/composition/owner/overlay-frame.ts";
import type { OwnerOverlay } from "../../../packages/contracts/owner/clips.ts";
import {
  OWNER_CAPTION_PRESETS,
  type OwnerCaptionStyle,
} from "../../../packages/contracts/owner/editor.ts";

const caption: OwnerOverlay["captions"][number] = {
  startMs: 100,
  endMs: 2500,
  text: "Coral reefs shelter fish.",
  lines: ["Coral reefs", "shelter fish."],
  wordIds: ["w_000001", "w_000002", "w_000003", "w_000004"],
  wordCues: [
    { wordId: "w_000001", text: "Coral", startMs: 100, endMs: 700 },
    { wordId: "w_000002", text: "reefs", startMs: 700, endMs: 1200 },
    { wordId: "w_000003", text: "shelter", startMs: 1400, endMs: 1900 },
    { wordId: "w_000004", text: "fish.", startMs: 2000, endMs: 2400 },
  ],
};
const style: OwnerCaptionStyle = {
  ...OWNER_CAPTION_PRESETS.clean,
  color: "#ea4433",
  highlight: "#123456",
  align: "right",
  box: { x: 0.1, y: 0.2, width: 0.8, height: 0.2 },
};
const render = (ms: number, value = style) =>
  renderToStaticMarkup(
    <OwnerStyledCaption caption={caption} ms={ms} style={value} />,
  );
const wordMarkup = (html: string, wordId: string) => {
  const start = html.indexOf(`data-word-id="${wordId}"`),
    end = html.indexOf("data-word-id=", start + 1);
  expect(start).toBeGreaterThanOrEqual(0);
  return html.slice(start, end < 0 ? html.length : end);
};

it("keeps both supplied lines and all timed words in their original order", () => {
  const before = structuredClone(caption),
    html = render(300);
  const lines = [
    ...html.matchAll(/data-caption-line="\d"[^>]*>(.*?)<\/div>/gu),
  ].map((match) => match[1]!.replace(/<[^>]+>/gu, ""));
  expect(lines).toEqual(["Coral reefs", "shelter fish."]);
  expect(
    [...html.matchAll(/data-word-id="([^"]+)"/gu)].map((match) => match[1]),
  ).toEqual(caption.wordIds);
  expect(caption).toEqual(before);
  expect(render(99)).toBe("");
  expect(render(2500)).toBe("");
});

it("uses exact word boundaries and the fixed 80ms onset without extending highlights across gaps", () => {
  expect(wordMarkup(render(100), "w_000001")).toContain("opacity:0.55");
  expect(wordMarkup(render(100), "w_000001")).toContain("scale(0.92)");
  expect(wordMarkup(render(140), "w_000001")).toContain("opacity:0.775");
  expect(wordMarkup(render(180), "w_000001")).toContain("opacity:1");
  expect(wordMarkup(render(699), "w_000001")).toContain("opacity:1");
  expect(wordMarkup(render(700), "w_000001")).toContain("opacity:0;");
  expect(wordMarkup(render(700), "w_000002")).toContain("opacity:0.55");
  for (const id of caption.wordIds)
    expect(wordMarkup(render(1200), id)).toContain("opacity:0;");
});

it("maps the normalized safe-area box and supplied colors/alignment onto fixed portrait pixels", () => {
  const html = render(300);
  for (const expected of [
    "left:108px",
    "top:384px",
    "width:864px",
    "height:384px",
    "font-family:Arial",
    "font-size:64px",
    "text-align:right",
    "color:#ea4433",
    "background-color:#123456",
    "justify-content:flex-end",
    "overflow:hidden",
  ])
    expect(html).toContain(expected);
  const defaults = render(300, OWNER_CAPTION_PRESETS.clean);
  expect(defaults).toContain("top:1500px");
  expect(defaults).toContain("height:200px");
  expect(defaults).toContain("width:920px");
});

it.each([
  ["clean", 800],
  ["classic", 700],
  ["bold", 900],
] as const)("uses only the declared %s preset weight", (preset, weight) => {
  const html = render(300, OWNER_CAPTION_PRESETS[preset]);
  expect(html).toContain(`font-weight:${weight}`);
  expect(html).toContain("font-family:Arial");
});

it("fits an exceptionally wide word without rewriting it or introducing an extra line", () => {
  const word = "W".repeat(80),
    wide = {
      ...caption,
      text: word,
      lines: [word],
      wordIds: ["w_000001"],
      wordCues: [{ wordId: "w_000001", text: word, startMs: 100, endMs: 2400 }],
    },
    html = renderToStaticMarkup(
      <OwnerStyledCaption
        caption={wide}
        ms={300}
        style={{ ...style, box: { x: 0.1, y: 0.2, width: 0.6, height: 0.2 } }}
      />,
    ),
    fontSize = Number(/font-size:(\d+)px/u.exec(html)?.[1]);
  expect(fontSize).toBeGreaterThan(0);
  expect(fontSize).toBeLessThan(32);
  expect(fontSize * 80 * 1.1 + 16).toBeLessThanOrEqual(648);
  expect(html).toContain(word);
  expect(html.match(/data-caption-line=/gu)).toHaveLength(1);
  expect(html).toContain("white-space:nowrap");
});

it("rejects styles outside the bounded contract instead of forwarding CSS properties", () => {
  const arbitraryFont = { ...style, fontFamily: "external-font" };
  for (const invalid of [
    arbitraryFont,
    { ...style, color: "url(https://invalid.example/image)" },
    { ...style, fontSize: Number.NaN },
    { ...style, box: { ...style.box, x: 0.01 } },
  ])
    expect(() => render(300, invalid)).toThrow();
});

it("fits a multiword timed cue while preserving its shared word clock", () => {
  const text = Array.from({ length: 40 }, () => "i").join(" "),
    phrase = {
      ...caption,
      text,
      lines: [text],
      wordIds: ["w_000001"],
      wordCues: [{ wordId: "w_000001", text, startMs: 100, endMs: 2400 }],
    },
    html = renderToStaticMarkup(
      <OwnerStyledCaption
        caption={phrase}
        ms={300}
        style={{ ...style, box: { x: 0.1, y: 0.2, width: 0.6, height: 0.2 } }}
      />,
    ),
    fontSize = Number(/font-size:(\d+)px/u.exec(html)?.[1]),
    padding = Number(/padding:4px ([\d.]+)px/u.exec(html)?.[1]);
  expect(html.match(/data-word-id="w_000001"/gu)).toHaveLength(40);
  expect(fontSize * 79 * 0.4 + padding * 2 * 40).toBeLessThanOrEqual(648);
  expect(html.match(/opacity:1;/gu)).toHaveLength(40);
});

it("produces identical styled markup whenever the fixed overlay frame cache key repeats", () => {
  const overlay: OwnerOverlay = {
      version: 1,
      frames: 90,
      captions: [caption],
      visuals: [],
    },
    seen = new Map<string, string>();
  for (let frame = 0; frame < overlay.frames; frame++) {
    const state = ownerOverlayFrame(overlay, frame),
      html = state.caption ? render(state.ms) : "";
    if (seen.has(state.key)) expect(html).toBe(seen.get(state.key));
    else seen.set(state.key, html);
  }
  expect(seen.size).toBeLessThan(25);
});
