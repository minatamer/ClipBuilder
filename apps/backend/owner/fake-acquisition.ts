import { randomUUID } from "node:crypto";
import { buildOwnerYoutubeOffer } from "./youtube-formats.ts";
import type { OwnerAcquisitionPort } from "./acquisition-port.ts";

/** Only synthetic metadata; actual generated source bytes come from the native worker. */
export const fakeOwnerAcquisition: OwnerAcquisitionPort = {
  mode: "synthetic-source",
  async metadata(identity, signal) {
    signal.throwIfAborted();
    return buildOwnerYoutubeOffer({
      videoId: identity.videoId,
      revision: randomUUID(),
      mode: "synthetic-source",
      durationMs: 16_000,
      status: "vod",
      videos: [720, 1080, 2160].map((height) => ({
        formatId: `synthetic-${height}`,
        width: (height * 16) / 9,
        height,
        fps: 30,
        codec: "h264",
        protocol: "https",
        drm: false,
        dynamicRange: "sdr",
        quality: null,
        preference: null,
        bitrateKbps: null,
        bytes: null,
        bytesEstimated: false,
      })),
      audios: [
        {
          formatId: "synthetic-audio",
          codec: "aac",
          protocol: "https",
          drm: false,
          channels: 2,
          sampleRate: 48_000,
          language: "en",
          trackId: "original",
          role: "original",
          bitrateKbps: 160,
          bytes: null,
          bytesEstimated: false,
        },
      ],
    });
  },
  async download(_input, progress, signal) {
    signal.throwIfAborted();
    progress({ stage: "video", downloadedBytes: 0, totalBytes: null });
    progress({ stage: "audio", downloadedBytes: 0, totalBytes: null });
  },
};
