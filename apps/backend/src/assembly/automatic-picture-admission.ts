import {
  CONTEXTUAL_PICTURE_POLICY,
  type ContextualPictureRequest,
} from "@clipbuilder/contracts";
import { pictureRelevance } from "./picture-relevance.js";
import sharp from "sharp";

// Optional B-roll only. Manual uploads and saved media never pass this gate.
// Metadata is a bounded editorial signal, not proof of a raster's aesthetics.
const unsuitable =
  /\b(?:spreadsheets?|worksheets?|infographics?|flowcharts?|diagrams?|dashboards?|screenshots?|templates?|logotypes?|logos?|icons?|charts?|graphs?|text[- ]cards?|title[- ]cards?|quote[- ]cards?|powerpoint|clipart|excel)\b/iu;
export function automaticPictureDescriptionFits(description: string) {
  return !unsuitable.test(
    description.normalize("NFKC").replace(/[-_/.]/gu, " "),
  );
}
export function automaticPictureBriefFits(request: ContextualPictureRequest) {
  return (
    request.purpose !== "b-roll" ||
    automaticPictureDescriptionFits(
      `${request.brief.scene} ${request.brief.searchQuery} ${request.brief.requiredTerms.join(" ")}`,
    )
  );
}
export function automaticPictureCandidateFits(
  request: ContextualPictureRequest,
  candidate: {
    url: string;
    depiction?: string | undefined;
    description?: string | undefined;
  },
) {
  if (request.purpose !== "b-roll") return true;
  return (
    automaticPictureBriefFits(request) &&
    ["photograph", "cinematic-illustration"].includes(
      candidate.depiction ?? "",
    ) &&
    !!candidate.description?.trim() &&
    automaticPictureDescriptionFits(
      `${candidate.url} ${candidate.description}`,
    ) &&
    pictureRelevance(request, {
      title: candidate.description,
      description: "",
      categories: "",
      width: 1,
      height: 1,
    }) > 0
  );
}

/** Cheap flat/blank filler check, not a semantic or aesthetic image classifier. */
export async function automaticPictureRasterFits(
  bytes: Buffer,
  signal: AbortSignal,
) {
  signal.throwIfAborted();
  const pixels = await sharp(bytes, {
    limitInputPixels: CONTEXTUAL_PICTURE_POLICY.maxInputPixels,
  })
    .resize(128, 128, { fit: "fill" })
    .greyscale()
    .raw()
    .toBuffer();
  signal.throwIfAborted();
  const histogram = new Uint32Array(256);
  for (const pixel of pixels) histogram[pixel]!++;
  let entropy = 0;
  for (const count of histogram)
    if (count) {
      const probability = count / pixels.length;
      entropy -= probability * Math.log2(probability);
    }
  return entropy >= 1.8;
}
