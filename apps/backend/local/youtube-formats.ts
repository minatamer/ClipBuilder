import { createHash } from "node:crypto";
import { z } from "zod";
import {
  OWNER_ACQUISITION_LIMITS,
  ownerAcquisitionDescriptorSchema,
  ownerAcquisitionModeSchema,
  ownerYoutubeAudioSchema,
  ownerYoutubeImportRequestSchema,
  ownerYoutubeOfferSchema,
  ownerYoutubeVideoIdSchema,
  ownerYoutubeVideoSchema,
  type OwnerAcquisitionDescriptor,
  type OwnerAcquisitionMode,
  type OwnerYoutubeAudio,
  type OwnerYoutubeChoice,
  type OwnerYoutubeImportRequest,
  type OwnerYoutubeOffer,
  type OwnerYoutubeSupportReason,
  type OwnerYoutubeVideo,
} from "../../../packages/contracts/local/acquisition.ts";
import {
  OWNER_LIMITS,
  ownerIdSchema,
} from "../../../packages/contracts/local/policy.ts";
import { ownerYoutubeSourceId } from "./youtube-url.ts";

const ownerYoutubeMetadataSchema = z
  .object({
    videoId: ownerYoutubeVideoIdSchema,
    revision: ownerIdSchema,
    mode: ownerAcquisitionModeSchema,
    durationMs: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
    status: z.enum(["vod", "live", "upcoming", "post-live", "unavailable"]),
    videos: z
      .array(ownerYoutubeVideoSchema)
      .max(OWNER_ACQUISITION_LIMITS.maxFormats),
    audios: z
      .array(ownerYoutubeAudioSchema)
      .max(OWNER_ACQUISITION_LIMITS.maxFormats),
  })
  .strict()
  .refine(
    (value) =>
      value.videos.length + value.audios.length <=
        OWNER_ACQUISITION_LIMITS.maxFormats &&
      new Set(value.videos.map((format) => format.formatId)).size ===
        value.videos.length &&
      new Set(value.audios.map((format) => format.formatId)).size ===
        value.audios.length,
  );
export type OwnerYoutubeMetadata = z.infer<typeof ownerYoutubeMetadataSchema>;

const optionalNumber = z.number().finite().nullable().optional();
const optionalText = z.string().max(160).nullable().optional();
const rawAudioTrack = z
  .object({
    id: optionalText,
    display_name: optionalText,
    audio_is_default: z.boolean().optional(),
    is_default: z.boolean().optional(),
    is_original: z.boolean().optional(),
  })
  .strict()
  .nullable()
  .optional();
const projectionSchema = z
  .object({
    meta: z
      .object({
        id: ownerYoutubeVideoIdSchema,
        duration: optionalNumber,
        live_status: optionalText,
        availability: optionalText,
        age_limit: optionalNumber,
      })
      .strict(),
    formats: z
      .array(
        z
          .object({
            format_id: z.string().max(80),
            width: optionalNumber,
            height: optionalNumber,
            fps: optionalNumber,
            vcodec: optionalText,
            acodec: optionalText,
            filesize: optionalNumber,
            filesize_approx: optionalNumber,
            protocol: optionalText,
            dynamic_range: optionalText,
            language: optionalText,
            language_preference: optionalNumber,
            has_drm: z
              .union([z.boolean(), z.literal("maybe")])
              .nullable()
              .optional(),
            quality: optionalNumber,
            preference: optionalNumber,
            tbr: optionalNumber,
            abr: optionalNumber,
            audio_channels: optionalNumber,
            asr: optionalNumber,
            audio_track: rawAudioTrack,
          })
          .strict(),
      )
      .max(OWNER_ACQUISITION_LIMITS.maxFormats),
  })
  .strict();

/** Project only bounded metadata; no URL, title or raw provider object escapes. */
export function normalizeOwnerYoutubeMetadata(
  input: unknown,
  context: { videoId: string; revision: string; mode: OwnerAcquisitionMode },
): OwnerYoutubeMetadata {
  try {
    const projection = projectionSchema.parse(input);
    const identity = ownerYoutubeVideoIdSchema.parse(context.videoId);
    if (projection.meta.id !== identity) throw new Error();
    const meta = projection.meta;
    const status: OwnerYoutubeMetadata["status"] =
      meta.availability && !["public", "unlisted"].includes(meta.availability)
        ? "unavailable"
        : (meta.age_limit ?? 0) > 0
          ? "unavailable"
          : meta.live_status === "is_live"
            ? "live"
            : meta.live_status === "is_upcoming"
              ? "upcoming"
              : ["post_live", "was_live"].includes(meta.live_status ?? "")
                ? "post-live"
                : meta.live_status === "not_live"
                  ? "vod"
                  : "unavailable";
    const videos: OwnerYoutubeVideo[] = [],
      audios: OwnerYoutubeAudio[] = [];
    for (const format of projection.formats) {
      const knownBytes = format.filesize ?? format.filesize_approx ?? null;
      const common = {
        formatId: format.format_id,
        protocol:
          format.protocol === "https"
            ? ("https" as const)
            : ("unsupported" as const),
        drm: format.has_drm !== false,
        bytes: knownBytes,
        bytesEstimated:
          format.filesize == null && format.filesize_approx != null,
      };
      if (format.vcodec && format.vcodec !== "none") {
        videos.push(
          ownerYoutubeVideoSchema.parse({
            ...common,
            codec: format.vcodec,
            width: format.width,
            height: format.height,
            fps: format.fps,
            dynamicRange:
              format.dynamic_range === "SDR"
                ? "sdr"
                : format.dynamic_range
                  ? "hdr"
                  : "unknown",
            quality: format.quality ?? null,
            preference: format.preference ?? null,
            bitrateKbps: format.tbr ?? null,
          }),
        );
      }
      if (format.acodec && format.acodec !== "none") {
        const track = format.audio_track;
        audios.push(
          ownerYoutubeAudioSchema.parse({
            ...common,
            codec: format.acodec,
            channels: format.audio_channels ?? null,
            sampleRate: format.asr ?? null,
            language: format.language ?? null,
            trackId: track?.id ?? null,
            // Pinned extractor: ORIGINAL_LANG_VALUE=10, DEFAULT_LANG_VALUE=5.
            // https://github.com/yt-dlp/yt-dlp/blob/2026.10.21/yt_dlp/extractor/youtube/_video.py#L3080-L3137
            role:
              track?.is_original === true || format.language_preference === 10
                ? "original"
                : track?.audio_is_default === true ||
                    track?.is_default === true ||
                    format.language_preference === 5
                  ? "default"
                  : track?.audio_is_default === false ||
                      track?.is_default === false
                    ? "other"
                    : "unknown",
            bitrateKbps: format.abr ?? null,
          }),
        );
      }
    }
    return ownerYoutubeMetadataSchema.parse({
      ...context,
      videoId: identity,
      durationMs: meta.duration == null ? 0 : Math.round(meta.duration * 1000),
      status,
      videos,
      audios,
    });
  } catch {
    throw new Error("owner_youtube_metadata_invalid");
  }
}

function videoCodec(value: string): "h264" | "vp9" | null {
  if (/^(?:h264|avc1(?:\.[A-Za-z0-9]+)?)$/u.test(value)) return "h264";
  if (/^(?:vp9(?:\.0)?|vp09(?:\.[A-Za-z0-9]+)+)$/u.test(value)) return "vp9";
  return null;
}
function audioCodec(value: string): "aac" | "opus" | null {
  if (/^(?:aac|mp4a\.40\.[25])$/u.test(value)) return "aac";
  return value === "opus" ? "opus" : null;
}
function codecPreference(codec: string): number {
  // Tie-break only: never rank a compatible stream ahead of higher resolution.
  if (/^(?:av01|av1)/u.test(codec)) return 5;
  if (/^(?:vp09|vp9)/u.test(codec)) return 4;
  if (/^(?:hev1|hvc1|hevc)/u.test(codec)) return 3;
  if (videoCodec(codec) === "h264") return 2;
  return /^(?:vp8|vp08)/u.test(codec) ? 1 : 0;
}
function compareVideo(a: OwnerYoutubeVideo, b: OwnerYoutubeVideo): number {
  const range = { hdr: 2, sdr: 1, unknown: 0 };
  const ranks = [
    Math.min(a.width, a.height) - Math.min(b.width, b.height),
    a.width * a.height - b.width * b.height,
    a.fps - b.fps,
    range[a.dynamicRange] - range[b.dynamicRange],
    (a.quality ?? -10_001) - (b.quality ?? -10_001),
    (a.preference ?? -10_001) - (b.preference ?? -10_001),
    codecPreference(a.codec) - codecPreference(b.codec),
    (a.bitrateKbps ?? -1) - (b.bitrateKbps ?? -1),
  ];
  for (const rank of ranks) if (rank !== 0) return -rank;
  return a.formatId < b.formatId ? -1 : a.formatId > b.formatId ? 1 : 0;
}
function audioIdentity(audio: OwnerYoutubeAudio): string {
  return JSON.stringify([audio.trackId, audio.language, audio.role]);
}
function preferredAudio(audios: OwnerYoutubeAudio[]): string | null {
  const preferred = audios.some((audio) => audio.role === "original")
    ? audios.filter((audio) => audio.role === "original")
    : audios.filter((audio) => audio.role === "default");
  if (
    !preferred.length ||
    (preferred.length > 1 &&
      preferred.some((audio) => audio.trackId === null)) ||
    new Set(preferred.map(audioIdentity)).size !== 1
  )
    return null;
  return [...preferred].sort((a, b) => {
    const bitrate = (b.bitrateKbps ?? -1) - (a.bitrateKbps ?? -1);
    if (bitrate) return bitrate;
    return a.formatId < b.formatId ? -1 : a.formatId > b.formatId ? 1 : 0;
  })[0]!.formatId;
}
function reason(
  metadata: Pick<OwnerYoutubeMetadata, "status" | "durationMs">,
  video: OwnerYoutubeVideo,
  audio: OwnerYoutubeAudio | null,
): OwnerYoutubeSupportReason | null {
  if (metadata.status !== "vod") return "source-unavailable";
  if (metadata.durationMs < 1000 || metadata.durationMs > OWNER_LIMITS.sourceMs)
    return "duration";
  if (video.drm || audio?.drm) return "drm";
  if (video.protocol !== "https" || (audio && audio.protocol !== "https"))
    return "protocol";
  if (video.dynamicRange === "hdr") return "hdr";
  if (video.dynamicRange !== "sdr") return "dynamic-range-unknown";
  if (
    Math.max(video.width, video.height) > 3840 ||
    video.width * video.height > 3840 * 2160
  )
    return "resolution";
  if (video.fps < 12 || video.fps > 60) return "frame-rate";
  if (!videoCodec(video.codec)) return "video-codec";
  if (!audio) return "audio-missing";
  if (!audioCodec(audio.codec)) return "audio-codec";
  if (
    ![1, 2].includes(audio.channels ?? 0) ||
    (audio.sampleRate ?? 0) < 8000 ||
    (audio.sampleRate ?? Infinity) > 48_000
  )
    return "audio-layout";
  const total =
    video.bytes === null || audio.bytes === null
      ? null
      : video.bytes + (video.formatId === audio.formatId ? 0 : audio.bytes);
  if (total !== null && total > OWNER_LIMITS.sourceBytes) return "bytes";
  return null;
}

/** Rank every offered video before applying the deliberately narrow decoder policy. */
export function buildOwnerYoutubeOffer(
  input: OwnerYoutubeMetadata,
): OwnerYoutubeOffer {
  try {
    const metadata = ownerYoutubeMetadataSchema.parse(input);
    const sourceId = ownerYoutubeSourceId(metadata.videoId);
    const videos = [...metadata.videos].sort(compareVideo);
    const videoIds = new Set(videos.map((video) => video.formatId));
    const separateAudios = metadata.audios.filter(
      (audio) => !videoIds.has(audio.formatId),
    );
    const choices: OwnerYoutubeChoice[] = [];
    for (const video of videos) {
      const muxed = metadata.audios.find(
        (audio) => audio.formatId === video.formatId,
      );
      const audios: (OwnerYoutubeAudio | null)[] = muxed
        ? [muxed]
        : separateAudios.length
          ? separateAudios
          : [null];
      const preferred = preferredAudio(
        audios.filter((audio) => audio !== null),
      );
      if (choices.length + audios.length > OWNER_ACQUISITION_LIMITS.maxFormats)
        throw new Error();
      for (const audio of audios) {
        const rejection = reason(metadata, video, audio);
        const combined = audio?.formatId === video.formatId;
        const size =
          video.bytes === null || !audio || audio.bytes === null
            ? null
            : video.bytes + (combined ? 0 : audio.bytes);
        const id = createHash("sha256")
          .update(
            JSON.stringify([
              sourceId,
              metadata.revision,
              metadata.mode,
              metadata.durationMs,
              metadata.status,
              video,
              audio,
            ]),
          )
          .digest("hex");
        choices.push({
          id,
          video,
          audio,
          tier: Math.min(video.width, video.height),
          preferredAudio: audio !== null && audio.formatId === preferred,
          supported: rejection === null,
          reason: rejection,
          bytes: size,
          bytesEstimated:
            video.bytesEstimated || (audio?.bytesEstimated ?? false),
        });
      }
    }
    const top = videos[0];
    const best = choices.find(
      (choice) =>
        choice.video.formatId === top?.formatId && choice.preferredAudio,
    );
    return ownerYoutubeOfferSchema.parse({
      sourceId,
      revision: metadata.revision,
      mode: metadata.mode,
      durationMs: metadata.durationMs,
      choices,
      bestChoiceId: best?.id ?? null,
      bestReason: best
        ? best.reason
        : top
          ? metadata.audios.length
            ? "audio-ambiguous"
            : "audio-missing"
          : "source-unavailable",
    });
  } catch {
    throw new Error("owner_youtube_metadata_invalid");
  }
}

export function selectOwnerYoutubeFormat(
  input: OwnerYoutubeOffer,
  selection: OwnerYoutubeImportRequest,
): { choice: OwnerYoutubeChoice; expected: OwnerAcquisitionDescriptor } {
  const offer = ownerYoutubeOfferSchema.parse(input);
  const request = ownerYoutubeImportRequestSchema.parse(selection);
  if (
    request.sourceId !== offer.sourceId ||
    request.revision !== offer.revision
  )
    throw new Error("owner_youtube_selection_stale");
  const choice = offer.choices.find((row) => row.id === request.choiceId);
  if (!choice) throw new Error("owner_youtube_selection_stale");
  if (request.selection.kind === "best" && offer.bestChoiceId === null)
    throw new Error("owner_youtube_audio_selection_required");
  if (
    (request.selection.kind === "best" && choice.id !== offer.bestChoiceId) ||
    (request.selection.kind === "tier" &&
      choice.tier !== request.selection.tier)
  )
    throw new Error("owner_youtube_selection_stale");
  if (!choice.supported || !choice.audio)
    throw new Error("owner_youtube_format_unsupported");
  return { choice, expected: ownerYoutubeChoiceDescriptor(offer, choice) };
}

/** Reuse frozen descriptors without online metadata or another acquisition. */
export function ownerYoutubeChoiceDescriptor(
  offer: Pick<OwnerYoutubeOffer, "durationMs">,
  choice: Pick<OwnerYoutubeChoice, "video" | "audio">,
): OwnerAcquisitionDescriptor {
  if (
    reason(
      { status: "vod", durationMs: offer.durationMs },
      choice.video,
      choice.audio,
    ) !== null
  )
    throw new Error("owner_youtube_format_unsupported");
  return ownerAcquisitionDescriptorSchema.parse({
    width: choice.video.width,
    height: choice.video.height,
    fps: choice.video.fps,
    durationMs: offer.durationMs,
    videoCodec: videoCodec(choice.video.codec),
    audioCodec: choice.audio ? audioCodec(choice.audio.codec) : null,
    audioChannels: choice.audio?.channels,
    audioSampleRate: choice.audio?.sampleRate,
  });
}
