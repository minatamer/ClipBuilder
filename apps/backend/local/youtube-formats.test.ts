import { describe, expect, it } from "vitest";
import {
  OWNER_ACQUISITION_LIMITS,
  ownerAcquisitionProgressSchema,
  ownerSavedSourceVariantSchema,
  ownerYoutubeImportRequestSchema,
  ownerYoutubeOfferSchema,
  type OwnerYoutubeAudio,
  type OwnerYoutubeImportRequest,
  type OwnerYoutubeOffer,
  type OwnerYoutubeVideo,
} from "../../../packages/contracts/local/acquisition.ts";
import { OWNER_LIMITS } from "../../../packages/contracts/local/policy.ts";
import { ownerMediaJobSchema } from "../../../packages/contracts/local/index.ts";
import {
  buildOwnerYoutubeOffer,
  normalizeOwnerYoutubeMetadata,
  ownerYoutubeChoiceDescriptor,
  selectOwnerYoutubeFormat,
  type OwnerYoutubeMetadata,
} from "./youtube-formats.ts";

const revision = "10000000-0000-4000-8000-000000000001";
const otherRevision = "10000000-0000-4000-8000-000000000002";
const video = (
  formatId: string,
  height = 1080,
  patch: Partial<OwnerYoutubeVideo> = {},
): OwnerYoutubeVideo => ({
  formatId,
  width: Math.round((height * 16) / 9),
  height,
  fps: 30,
  codec: "avc1.640028",
  dynamicRange: "sdr",
  protocol: "https",
  drm: false,
  bytes: height * 1000,
  bytesEstimated: false,
  bitrateKbps: 4000,
  quality: 1,
  preference: 0,
  ...patch,
});
const audio = (
  formatId = "140",
  patch: Partial<OwnerYoutubeAudio> = {},
): OwnerYoutubeAudio => ({
  formatId,
  codec: "mp4a.40.2",
  channels: 2,
  sampleRate: 48_000,
  language: "en",
  trackId: "en-original",
  role: "original",
  protocol: "https",
  drm: false,
  bytes: 100_000,
  bytesEstimated: false,
  bitrateKbps: 128,
  ...patch,
});
const metadata = (
  patch: Partial<OwnerYoutubeMetadata> = {},
): OwnerYoutubeMetadata => ({
  videoId: "SYNTHETIC01",
  revision,
  mode: "synthetic-source",
  durationMs: 75_125,
  status: "vod",
  videos: [video("137")],
  audios: [audio()],
  ...patch,
});
const request = (
  offer: OwnerYoutubeOffer,
  choiceId = offer.bestChoiceId!,
  selection: OwnerYoutubeImportRequest["selection"] = { kind: "best" },
): OwnerYoutubeImportRequest => ({
  sourceId: offer.sourceId,
  revision: offer.revision,
  choiceId,
  selection,
});
const projection = () => ({
  meta: {
    id: "SYNTHETIC01",
    duration: 75.125,
    live_status: "not_live",
    availability: "public",
    age_limit: 0,
  },
  formats: [
    {
      format_id: "137",
      width: 1920,
      height: 1080,
      fps: 29.97,
      vcodec: "avc1.640028",
      acodec: "none",
      filesize_approx: 5_000_000,
      protocol: "https",
      dynamic_range: "SDR",
      has_drm: false,
      quality: 8,
      preference: 1,
      tbr: 5000,
    },
    {
      format_id: "140",
      vcodec: "none",
      acodec: "mp4a.40.2",
      filesize: 700_000,
      protocol: "https",
      has_drm: false,
      abr: 128,
      audio_channels: 2,
      asr: 48_000,
      language: "en",
      language_preference: 10,
      audio_track: {
        id: "en-original",
        is_original: true,
        audio_is_default: true,
      },
    },
  ],
});

describe("owner exact YouTube quality policy", () => {
  it("projects only bounded display identity without remote image URLs", () => {
    const input = projection();
    const normalized = normalizeOwnerYoutubeMetadata(
      {
        ...input,
        meta: { ...input.meta, title: "  Synthetic\nvideo <title>  " },
      },
      { videoId: "SYNTHETIC01", revision, mode: "provider-source" },
    );
    expect(buildOwnerYoutubeOffer(normalized).preview).toEqual({
      videoId: "SYNTHETIC01",
      title: "Synthetic video <title>",
    });
    expect(
      ownerYoutubeOfferSchema.safeParse({
        ...buildOwnerYoutubeOffer(normalized),
        preview: {
          videoId: "SYNTHETIC01",
          title: "Synthetic",
          url: "https://example.invalid",
        },
      }).success,
    ).toBe(false);
    expect(
      buildOwnerYoutubeOffer(
        normalizeOwnerYoutubeMetadata(
          { ...input, meta: { ...input.meta, title: "\n\u0001" } },
          { videoId: "SYNTHETIC01", revision, mode: "provider-source" },
        ),
      ).preview,
    ).toBeUndefined();
  });
  it("projects fractional metadata into a bounded source snapshot without content or URLs", () => {
    const input = projection();
    const normalized = normalizeOwnerYoutubeMetadata(input, {
      videoId: "SYNTHETIC01",
      revision,
      mode: "provider-source",
    });
    expect(normalized).toMatchObject({
      durationMs: 75_125,
      revision,
      mode: "provider-source",
      status: "vod",
    });
    expect(normalized.videos[0]).toEqual(
      video("137", 1080, {
        fps: 29.97,
        bytes: 5_000_000,
        bytesEstimated: true,
        quality: 8,
        preference: 1,
        bitrateKbps: 5000,
      }),
    );
    expect(normalized.audios[0]).toEqual(audio("140", { bytes: 700_000 }));
    const offer = buildOwnerYoutubeOffer(normalized);
    expect(offer.bestReason).toBeNull();
    expect(offer.choices[0]?.bytes).toBe(5_700_000);
    expect(offer.choices[0]?.bytesEstimated).toBe(true);
    expect(selectOwnerYoutubeFormat(offer, request(offer)).expected).toEqual({
      width: 1920,
      height: 1080,
      fps: 29.97,
      durationMs: 75_125,
      videoCodec: "h264",
      audioCodec: "aac",
      audioChannels: 2,
      audioSampleRate: 48_000,
    });
    expect(JSON.stringify(offer)).not.toMatch(
      /videoId|SYNTHETIC01|https:|title|display_name/u,
    );
    expect(input).toEqual(projection());
  });

  it("offers exact 720/1080/2160 choices without changing the selected stream", () => {
    const offer = buildOwnerYoutubeOffer(
      metadata({
        videos: [
          video("720", 720),
          video("1080", 1080),
          video("2160", 2160, { codec: "vp09.00.51.08", fps: 60 }),
        ],
      }),
    );
    expect(offer.choices.map((choice) => choice.tier)).toEqual([
      2160, 1080, 720,
    ]);
    for (const tier of [720, 1080, 2160]) {
      const choice = offer.choices.find((row) => row.tier === tier)!;
      const selected = selectOwnerYoutubeFormat(
        offer,
        request(offer, choice.id, { kind: "tier", tier }),
      );
      expect(selected.choice.video.formatId).toBe(String(tier));
      expect(selected.expected.height).toBe(tier);
    }
    expect(
      selectOwnerYoutubeFormat(offer, request(offer)).choice.video.formatId,
    ).toBe("2160");
    expect(() =>
      selectOwnerYoutubeFormat(
        offer,
        request(offer, offer.choices[0]!.id, { kind: "tier", tier: 1440 }),
      ),
    ).toThrow("owner_youtube_selection_stale");
  });

  it("keeps multilingual video/audio combinations beyond the raw-format limit selectable", () => {
    const input = metadata({
      videos: Array.from({ length: 38 }, (_, index) => video(`video-${index}`)),
      audios: Array.from({ length: 105 }, (_, index) =>
        audio(`audio-${index}`, {
          trackId: `track-${Math.floor(index / 3)}`,
          language: index < 3 ? "en" : `x-${Math.floor(index / 3)}`,
          role: index < 3 ? "original" : "other",
          bitrateKbps: [64, 128, 192][index % 3]!,
        }),
      ),
    });
    expect(input.videos.length + input.audios.length).toBeLessThan(
      OWNER_ACQUISITION_LIMITS.maxFormats,
    );
    const offer = buildOwnerYoutubeOffer(input);
    expect(offer.choices).toHaveLength(3990);
    expect(ownerYoutubeOfferSchema.parse(offer)).toEqual(offer);
    const exact = offer.choices.find(
      (choice) =>
        choice.video.formatId === "video-37" &&
        choice.audio?.formatId === "audio-104",
    )!;
    expect(
      selectOwnerYoutubeFormat(
        offer,
        request(offer, exact.id, { kind: "variant" }),
      ).choice,
    ).toEqual(exact);
    expect(
      offer.choices.find((choice) => choice.id === offer.bestChoiceId)?.audio
        ?.formatId,
    ).toBe("audio-2");
    expect(input.audios).toHaveLength(105);
  });

  it("bounds expanded choices separately without relaxing raw metadata limits", () => {
    const input = metadata({
      videos: Array.from({ length: 100 }, (_, index) =>
        video(`video-${index}`),
      ),
      audios: Array.from({ length: 100 }, (_, index) =>
        audio(`audio-${index}`),
      ),
    });
    expect(buildOwnerYoutubeOffer(input).choices).toHaveLength(
      OWNER_ACQUISITION_LIMITS.maxChoices,
    );
    input.videos.push(video("video-over-limit"));
    expect(() => buildOwnerYoutubeOffer(input)).toThrow(
      "owner_youtube_metadata_invalid",
    );
    expect(OWNER_ACQUISITION_LIMITS.maxFormats).toBe(1000);
  });

  it("labels portrait and cinematic dimensions by their actual shorter edge", () => {
    const offer = buildOwnerYoutubeOffer(
      metadata({
        videos: [
          video("portrait", 1920, { width: 1080 }),
          video("cinema", 1600, { width: 3840 }),
        ],
      }),
    );
    expect(
      offer.choices.map((choice) => [choice.video.formatId, choice.tier]),
    ).toEqual([
      ["cinema", 1600],
      ["portrait", 1080],
    ]);
    const portrait = offer.choices[1]!;
    expect(
      selectOwnerYoutubeFormat(
        offer,
        request(offer, portrait.id, { kind: "tier", tier: 1080 }),
      ).expected,
    ).toMatchObject({ width: 1080, height: 1920 });
  });

  it("ranks unsupported highest quality first and never substitutes a compatible lower tier", () => {
    const offer = buildOwnerYoutubeOffer(
      metadata({
        videos: [
          video("137"),
          video("401", 2160, { codec: "av01.0.12M.08", fps: 60 }),
        ],
      }),
    );
    expect(offer.choices[0]).toMatchObject({
      tier: 2160,
      supported: false,
      reason: "video-codec",
    });
    expect(offer.bestChoiceId).toBe(offer.choices[0]!.id);
    expect(offer.bestReason).toBe("video-codec");
    expect(() => selectOwnerYoutubeFormat(offer, request(offer))).toThrow(
      "owner_youtube_format_unsupported",
    );
    const lower = offer.choices[1]!;
    expect(() =>
      selectOwnerYoutubeFormat(offer, request(offer, lower.id)),
    ).toThrow("owner_youtube_selection_stale");
    expect(
      selectOwnerYoutubeFormat(
        offer,
        request(offer, lower.id, { kind: "variant" }),
      ).choice.video.formatId,
    ).toBe("137");
  });

  it("uses dimensions, FPS and HDR before compatibility, then stable format IDs", () => {
    const source = metadata({
      videos: [
        video("sdr60", 1080, { fps: 60 }),
        video("hdr60", 1080, { fps: 60, dynamicRange: "hdr" }),
        video("sdr30", 1080),
        video("wide", 1080, { width: 2560 }),
      ],
    });
    expect(
      buildOwnerYoutubeOffer(source).choices.map(
        (choice) => choice.video.formatId,
      ),
    ).toEqual(["wide", "hdr60", "sdr60", "sdr30"]);
    source.videos = [video("z"), video("a")];
    expect(
      buildOwnerYoutubeOffer(source).choices.map(
        (choice) => choice.video.formatId,
      ),
    ).toEqual(["a", "z"]);
  });

  it("requires explicit selection for unknown or competing original tracks", () => {
    for (const audios of [
      [audio("140", { role: "unknown", trackId: null })],
      [audio(), audio("141", { language: "es", trackId: "es-original" })],
      [audio("140", { trackId: null }), audio("141", { trackId: null })],
    ]) {
      const offer = buildOwnerYoutubeOffer(metadata({ audios }));
      expect(offer.bestChoiceId).toBeNull();
      expect(offer.bestReason).toBe("audio-ambiguous");
      const concrete = offer.choices[0]!;
      expect(() =>
        selectOwnerYoutubeFormat(offer, request(offer, concrete.id)),
      ).toThrow("owner_youtube_audio_selection_required");
      expect(
        selectOwnerYoutubeFormat(
          offer,
          request(offer, concrete.id, { kind: "variant" }),
        ).choice.audio,
      ).toEqual(audios[0]);
    }
  });

  it("deliberately chooses the original track and its highest bitrate, before compatibility", () => {
    const offer = buildOwnerYoutubeOffer(
      metadata({
        audios: [
          audio("141", { bitrateKbps: 256 }),
          audio("140"),
          audio("dub", {
            role: "default",
            language: "fr",
            trackId: "fr-dub",
            bitrateKbps: 1000,
          }),
        ],
      }),
    );
    const chosen = selectOwnerYoutubeFormat(offer, request(offer));
    expect(chosen.choice.audio?.formatId).toBe("141");
    const fallback = buildOwnerYoutubeOffer(
      metadata({ audios: [audio("140", { role: "default" })] }),
    );
    expect(fallback.bestChoiceId).toBe(fallback.choices[0]!.id);
  });

  it("handles a progressive muxed stream once without pairing another video's audio", () => {
    const offer = buildOwnerYoutubeOffer(
      metadata({
        videos: [video("18", 720)],
        audios: [audio("18", { bytes: 720_000 }), audio("140")],
      }),
    );
    expect(offer.choices).toHaveLength(1);
    expect(offer.choices[0]).toMatchObject({
      audio: { formatId: "18" },
      bytes: 720_000,
    });
    expect(
      selectOwnerYoutubeFormat(offer, request(offer)).choice.video.formatId,
    ).toBe("18");
  });

  it("keeps unknown sizes indeterminate and does not invent an estimated total", () => {
    const offer = buildOwnerYoutubeOffer(
      metadata({ videos: [video("137", 1080, { bytes: null })] }),
    );
    expect(offer.choices[0]?.bytes).toBeNull();
    expect(offer.choices[0]?.supported).toBe(true);
  });

  it("binds selections to source, revision, provenance and every frozen descriptor", () => {
    const initial = metadata();
    const offer = buildOwnerYoutubeOffer(initial);
    for (const changed of [
      metadata({ videoId: "DIFFERENT01" }),
      metadata({ revision: otherRevision }),
      metadata({ mode: "provider-source" }),
      metadata({ durationMs: 75_126 }),
      metadata({ videos: [video("137", 1080, { fps: 29.97 })] }),
      metadata({ audios: [audio("140", { sampleRate: 44_100 })] }),
    ])
      expect(() =>
        selectOwnerYoutubeFormat(
          buildOwnerYoutubeOffer(changed),
          request(offer),
        ),
      ).toThrow("owner_youtube_selection_stale");
    initial.videos[0]!.width = 1;
    expect(offer.choices[0]?.video.width).toBe(1920);
    expect(buildOwnerYoutubeOffer(metadata())).toEqual(offer);
  });

  it.each([
    [{ videos: [video("137", 1080, { drm: true })] }, "drm"],
    [{ videos: [video("137", 1080, { protocol: "unsupported" })] }, "protocol"],
    [{ videos: [video("137", 1080, { dynamicRange: "hdr" })] }, "hdr"],
    [
      { videos: [video("137", 1080, { dynamicRange: "unknown" })] },
      "dynamic-range-unknown",
    ],
    [{ videos: [video("137", 2160, { width: 4096 })] }, "resolution"],
    [{ videos: [video("137", 1080, { fps: 120 })] }, "frame-rate"],
    [{ videos: [video("137", 1080, { codec: "vp8" })] }, "video-codec"],
    [{ videos: [video("137", 1080, { codec: "hevc" })] }, "video-codec"],
    [{ audios: [audio("140", { codec: "vorbis" })] }, "audio-codec"],
    [{ audios: [audio("140", { channels: 6 })] }, "audio-layout"],
    [{ audios: [audio("140", { sampleRate: 96_000 })] }, "audio-layout"],
    [
      { videos: [video("137", 1080, { bytes: OWNER_LIMITS.sourceBytes })] },
      "bytes",
    ],
    [{ durationMs: OWNER_LIMITS.sourceMs + 1 }, "duration"],
    [{ status: "live" }, "source-unavailable"],
    [{ status: "upcoming" }, "source-unavailable"],
    [{ status: "post-live" }, "source-unavailable"],
    [{ audios: [] }, "audio-missing"],
  ] as const)(
    "shows unsupported descriptors without executing or lowering quality",
    (patch, expected) => {
      const offer = buildOwnerYoutubeOffer(
        metadata(patch as Partial<OwnerYoutubeMetadata>),
      );
      expect(offer.choices[0]).toMatchObject({
        supported: false,
        reason: expected,
      });
      expect(() =>
        selectOwnerYoutubeFormat(
          offer,
          request(offer, offer.choices[0]!.id, { kind: "variant" }),
        ),
      ).toThrow("owner_youtube_format_unsupported");
      if (expected !== "source-unavailable")
        expect(() =>
          ownerYoutubeChoiceDescriptor(offer, offer.choices[0]!),
        ).toThrow("owner_youtube_format_unsupported");
    },
  );

  it("exposes no reusable choice for missing formats", () => {
    expect(buildOwnerYoutubeOffer(metadata({ videos: [] }))).toMatchObject({
      choices: [],
      bestChoiceId: null,
      bestReason: "source-unavailable",
    });
  });

  it("rejects raw URL/content leakage, wrong identity, malformed fields and format injection", () => {
    const raw = projection();
    const invalid = [
      { ...raw, meta: { ...raw.meta, id: "DIFFERENT01" } },
      { ...raw, meta: { ...raw.meta, url: "https://127.0.0.1" } },
      { ...raw, formats: [{ ...raw.formats[0], url: "https://127.0.0.1" }] },
      { ...raw, formats: [{ ...raw.formats[0], format_id: "137+140/best" }] },
      { ...raw, formats: [{ ...raw.formats[0], fps: Infinity }] },
      { ...raw, formats: [{ ...raw.formats[0], width: 0 }] },
      { ...raw, formats: [raw.formats[0], raw.formats[0]] },
      {
        ...raw,
        formats: Array.from(
          { length: OWNER_ACQUISITION_LIMITS.maxFormats + 1 },
          () => raw.formats[0],
        ),
      },
    ];
    for (const value of invalid)
      expect(() =>
        normalizeOwnerYoutubeMetadata(value, {
          videoId: "SYNTHETIC01",
          revision,
          mode: "synthetic-source",
        }),
      ).toThrow("owner_youtube_metadata_invalid");
    expect(() =>
      buildOwnerYoutubeOffer(metadata({ videos: [video("137/140")] })),
    ).toThrow("owner_youtube_metadata_invalid");
  });

  it("classifies access, unknown DRM and track metadata conservatively", () => {
    const raw = projection();
    raw.meta.availability = "private";
    expect(
      buildOwnerYoutubeOffer(
        normalizeOwnerYoutubeMetadata(raw, {
          videoId: "SYNTHETIC01",
          revision,
          mode: "synthetic-source",
        }),
      ).bestReason,
    ).toBe("source-unavailable");
    const unknown = projection();
    delete (unknown.formats[0] as { has_drm?: boolean }).has_drm;
    expect(
      buildOwnerYoutubeOffer(
        normalizeOwnerYoutubeMetadata(unknown, {
          videoId: "SYNTHETIC01",
          revision,
          mode: "synthetic-source",
        }),
      ).bestReason,
    ).toBe("drm");
  });

  it("uses the pinned original/default role values without inventing an upstream track ID", () => {
    for (const [preference, role] of [
      [10, "original"],
      [5, "default"],
      [-10, "unknown"],
      [-1, "unknown"],
      [11, "unknown"],
    ] as const) {
      const raw = projection();
      const sound = {
        ...raw.formats[1],
        audio_track: undefined,
        language_preference: preference,
      };
      const normalized = normalizeOwnerYoutubeMetadata(
        { ...raw, formats: [raw.formats[0], sound] },
        { videoId: "SYNTHETIC01", revision, mode: "provider-source" },
      );
      expect(normalized.audios[0]).toMatchObject({
        role,
        trackId: null,
        language: "en",
      });
      const offer = buildOwnerYoutubeOffer(normalized);
      expect(offer.bestChoiceId !== null).toBe(
        role === "original" || role === "default",
      );
    }
    const raw = projection();
    const normalized = normalizeOwnerYoutubeMetadata(
      {
        ...raw,
        formats: [
          { ...raw.formats[0], protocol: "m3u8_native", has_drm: "maybe" },
          raw.formats[1],
        ],
      },
      { videoId: "SYNTHETIC01", revision, mode: "provider-source" },
    );
    expect(buildOwnerYoutubeOffer(normalized).choices[0]).toMatchObject({
      supported: false,
      reason: "drm",
    });
  });

  it("keeps DTOs strict, saved sources complete, and native descriptor initialization cycle-safe", () => {
    const offer = buildOwnerYoutubeOffer(metadata());
    expect(
      ownerYoutubeOfferSchema.safeParse({
        ...offer,
        url: "https://youtube.com",
      }).success,
    ).toBe(false);
    expect(
      ownerYoutubeImportRequestSchema.safeParse({
        ...request(offer),
        rightsAcknowledged: false,
      }).success,
    ).toBe(false);
    expect(
      ownerYoutubeImportRequestSchema.safeParse({
        ...request(offer),
        mode: "provider-source",
      }).success,
    ).toBe(false);
    const choice = offer.choices[0]!;
    const expected = ownerYoutubeChoiceDescriptor(offer, choice);
    expect(
      ownerMediaJobSchema.safeParse({
        operation: "synthesize-acquisition",
        workspaceId: revision,
        expected,
      }).success,
    ).toBe(true);
    const variant = {
      id: revision,
      sourceId: offer.sourceId,
      mode: offer.mode,
      acquiredAt: "2026-10-22T10:00:00.000Z",
      selection: { kind: "best" },
      video: choice.video,
      audio: choice.audio,
      actual: {
        fingerprint: "b".repeat(64),
        bytes: 1000,
        durationMs: 75_125,
        width: 1920,
        height: 1080,
        fps: 30,
      },
      offsetMs: 0,
      state: "ready",
    };
    expect(ownerSavedSourceVariantSchema.safeParse(variant).success).toBe(true);
    expect(
      ownerSavedSourceVariantSchema.safeParse({ ...variant, offsetMs: 1000 })
        .success,
    ).toBe(false);
    expect(
      ownerSavedSourceVariantSchema.safeParse({
        ...variant,
        mode: "synthetic-ai",
      }).success,
    ).toBe(false);
    expect(
      ownerAcquisitionProgressSchema.safeParse({
        id: revision,
        mode: "synthetic-source",
        stage: "video",
        downloadedBytes: 1,
        totalBytes: null,
        variantId: null,
        error: null,
      }).success,
    ).toBe(true);
    expect(
      ownerAcquisitionProgressSchema.safeParse({
        id: revision,
        mode: "provider-source",
        stage: "ready",
        downloadedBytes: 1,
        totalBytes: 1,
        variantId: null,
        error: null,
      }).success,
    ).toBe(false);
  });
});
