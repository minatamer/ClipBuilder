import { describe, expect, it } from "vitest";
import { assertOutputProbe } from "./inspection.js";
const fixture = () => ({
  streams: [
    {
      codec_type: "video",
      codec_name: "h264",
      width: 1080,
      height: 1920,
      avg_frame_rate: "30/1",
      pix_fmt: "yuv420p",
      sample_aspect_ratio: "1:1",
      duration: 10,
      start_time: 0,
    },
    {
      codec_type: "audio",
      codec_name: "aac",
      channels: 2,
      sample_rate: 48000,
      duration: 10,
      start_time: 0,
    },
  ],
  format: {
    format_name: "mov,mp4,m4a,3gp,3g2,mj2",
    duration: 10,
    start_time: 0,
  },
});
describe("final MP4 profile rejection", () => {
  it("accepts the fixed portrait profile", () =>
    expect(() => assertOutputProbe(fixture(), 1024, 10000)).not.toThrow());
  it.each([
    "codec",
    "pixels",
    "fps",
    "aspect",
    "audio",
    "offset",
    "duration",
    "container",
    "bytes",
    "missing",
  ])("rejects %s instead of publishing", (kind) => {
    const p = fixture();
    let bytes = 1024;
    if (kind === "codec") p.streams[0]!.codec_name = "vp9";
    if (kind === "pixels") p.streams[0]!.pix_fmt = "yuv444p";
    if (kind === "fps") p.streams[0]!.avg_frame_rate = "24/1";
    if (kind === "aspect") p.streams[0]!.sample_aspect_ratio = "4:3";
    if (kind === "audio") p.streams[1]!.sample_rate = 44100;
    if (kind === "offset") p.streams[1]!.start_time = 1;
    if (kind === "duration") p.streams[1]!.duration = 9;
    if (kind === "container") p.format.format_name = "matroska,webm";
    if (kind === "bytes") bytes = 200 * 1024 * 1024 + 1;
    if (kind === "missing") p.streams.pop();
    expect(() => assertOutputProbe(p, bytes, 10000)).toThrow();
  });
});
