import { it, expect, vi } from "vitest";
import sharp from "sharp";
import type { ContextualPictureRequest } from "@clipbuilder/contracts";
import {
  automaticPictureBriefFits,
  automaticPictureCandidateFits,
  automaticPictureRasterFits,
} from "./automatic-picture-admission.js";
import { WebPictureSource } from "./web-pictures.js";
import { GeminiPictureGenerator } from "./gemini-pictures.js";

const request: ContextualPictureRequest = {
  kind: "object",
  purpose: "b-roll",
  brief: {
    scene: "A frustrated adult clenching fists at a desk",
    searchQuery: "frustrated adult",
    requiredTerms: ["frustrated", "adult"],
    avoidTerms: [],
  },
};
const candidate = {
  url: "https://images.example.test/frustrated-person.jpg",
  kind: "image",
  depiction: "photograph",
  description: "A visibly angry adult clenching fists at a desk",
};
const raster = (flat = false) =>
  sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><defs><linearGradient id="g"><stop stop-color="black"/><stop offset="1" stop-color="white"/></linearGradient></defs><rect width="640" height="360" fill="${flat ? "white" : "url(#g)"}"/></svg>`,
    ),
  )
    .png()
    .toBuffer();

it("admits action/emotion descriptions and omits unsupported or diagram-like optional candidates", () => {
  expect(automaticPictureCandidateFits(request, candidate)).toBe(true);
  expect(
    automaticPictureCandidateFits(request, {
      ...candidate,
      description: "A calm adult looking at the sky",
    }),
  ).toBe(false);
  expect(
    automaticPictureCandidateFits(request, {
      ...candidate,
      depiction: "document",
    }),
  ).toBe(false);
  expect(automaticPictureCandidateFits(request, { url: candidate.url })).toBe(
    false,
  );
  expect(
    automaticPictureCandidateFits(request, {
      ...candidate,
      url: "https://images.example.test/trading_spreadsheet.jpg",
    }),
  ).toBe(false);
  expect(
    automaticPictureBriefFits({
      ...request,
      brief: { ...request.brief, scene: "A trading worksheet diagram" },
    }),
  ).toBe(false);
});

it("uses one search, skips documents/site cards and downloads only the matching image-specific photo", async () => {
  const discover = vi.fn(async () => ({
    candidates: [
      {
        ...candidate,
        url: "https://images.example.test/trades.jpg",
        depiction: "document",
      },
      { ...candidate, url: "https://example.test/anger", kind: "page" },
    ],
  }));
  const photo = await raster();
  const read = vi.fn(async (url: URL) =>
    url.pathname === "/anger"
      ? {
          url,
          bytes: Buffer.from(
            '<meta property="og:image" content="/logo.jpg"><img alt="Site logo" src="/logo2.jpg"><img alt="A frustrated adult clenching fists" src="https://images.example.test/photo.jpg">',
          ),
          contentType: "text/html",
        }
      : { url, bytes: photo, contentType: "image/png" },
  );
  const source = new WebPictureSource(discover, undefined, read);
  expect(
    (await source.find(request, AbortSignal.timeout(2000)))?.repository,
  ).toBe("web");
  expect(discover).toHaveBeenCalledTimes(1);
  expect(read.mock.calls.map(([url]) => url.pathname)).toEqual([
    "/anger",
    "/photo.jpg",
  ]);
});

it("omits blank rasters and unverified depictions without downloading or retrying providers", async () => {
  const blank = await raster(true),
    signal = AbortSignal.timeout(2000);
  expect(await automaticPictureRasterFits(blank, signal)).toBe(false);
  expect(await automaticPictureRasterFits(await raster(), signal)).toBe(true);
  const discover = vi.fn(async () => ({ candidates: [candidate] }));
  const read = vi.fn(async (url: URL) => ({
    url,
    bytes: blank,
    contentType: "image/png",
  }));
  const source = new WebPictureSource(discover, undefined, read);
  expect(await source.find(request, signal)).toBeNull();
  expect(discover).toHaveBeenCalledTimes(1);
  expect(read).toHaveBeenCalledTimes(1);
  const missingEvidence = new WebPictureSource(
    async () => ({ candidates: [{ url: candidate.url, kind: "image" }] }),
    undefined,
    read,
  );
  expect(await missingEvidence.find(request, signal)).toBeNull();
  expect(read).toHaveBeenCalledTimes(1);
});

it.each([false, true])(
  "keeps Gemini generation to one existing request and omits flat filler (%s)",
  async (flat) => {
    const image = await raster(flat);
    const read = vi.fn<typeof fetch>(
      async () =>
        new Response(
          JSON.stringify({
            candidates: [
              {
                finishReason: "STOP",
                content: {
                  parts: [
                    {
                      inlineData: {
                        mimeType: "image/png",
                        data: image.toString("base64"),
                      },
                    },
                  ],
                },
              },
            ],
          }),
          { headers: { "Content-Type": "application/json" } },
        ),
    );
    const source = new GeminiPictureGenerator("synthetic-key", read);
    const result = await source.find(request, AbortSignal.timeout(2000));
    expect(result?.repository ?? null).toBe(flat ? null : "google-gemini");
    expect(read).toHaveBeenCalledTimes(1);
    const body = JSON.parse(String(read.mock.calls[0]![1]!.body));
    expect(body.systemInstruction.parts[0].text).toContain(
      "expressions/body language",
    );
    expect(body.generationConfig.candidateCount).toBe(1);
  },
);
