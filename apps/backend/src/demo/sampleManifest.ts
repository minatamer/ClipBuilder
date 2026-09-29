import { SAMPLE_FIXTURE_REVISIONS } from "./sampleAnalysis.js";

export const SAMPLE_MANIFEST = Object.freeze({
  version: "sample-v1",
  availability: "fixture-data-only",
  provenance: "purpose-recorded-sample-pending-owner-approval",
  rightsStatus: "pending",
  privateRightsEvidenceReference: null,
  media: {
    objectGeneration: null,
    sha256: null,
    durationMs: 60_000,
    container: "mp4",
    videoCodec: "h264",
    bytes: null,
  },
  poster: { status: "pending", sha256: null },
  fixtures: SAMPLE_FIXTURE_REVISIONS,
  visualAssets: [
    { key: "earth-moon-comparison-v1", rightsStatus: "pending" },
    { key: "equation-card-v1", rightsStatus: "pending" },
  ],
} as const);
