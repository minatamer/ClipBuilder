import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  type CompositionManifestV3,
  ANALYSIS_AUDIO_PROFILE,
  type InspectedSource,
  type SelectedMediaRange,
  selectedMediaRangeSchema,
} from "@clipbuilder/contracts";
import { inspectSource, validateOutput, probeMedia } from "./inspection.js";
import { runOwnedProcess } from "./process-runner.js";
import { MediaFailure } from "./media.failure.js";
export interface MediaPipeline {
  inspect(path: string, signal: AbortSignal): Promise<InspectedSource>;
  audio(path: string, output: string, signal: AbortSignal): Promise<void>;
  proxy(
    path: string,
    output: string,
    signal: AbortSignal,
    range: SelectedMediaRange,
  ): Promise<void>;
  render(
    path: string,
    output: string,
    manifest: CompositionManifestV3,
    directory: string,
    signal: AbortSignal,
  ): Promise<void>;
}
export type MediaTools = {
  ffmpeg: string;
  ffprobe: string;
  chromium: string;
  bundle: string;
};
export class NodeMediaPipeline implements MediaPipeline {
  constructor(private readonly tools: MediaTools) {}
  inspect(path: string, signal: AbortSignal) {
    return inspectSource(path, this.tools.ffprobe, signal);
  }
  async audio(path: string, output: string, signal: AbortSignal) {
    const input = await probeMedia(path, this.tools.ffprobe, signal);
    const video = input.streams.find((stream) => stream.codec_type === "video");
    if (!video) throw new MediaFailure("invalid");
    const duration = input.format.duration;
    // Keep the original PTS until the audio filter anchors it to video zero.
    // first_pts fills leading silence or removes pre-video samples; apad retains
    // a video tail with no speech. Audio-only encoding avoids source-video work.
    await runOwnedProcess(
      this.tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-protocol_whitelist",
        "file,pipe",
        "-copyts",
        "-i",
        path,
        "-map",
        "0:a:0",
        "-vn",
        "-af",
        `asetpts=PTS-${video.start_time ?? 0}/TB,aresample=async=1:first_pts=0,apad`,
        "-t",
        String(duration),
        "-c:a",
        ANALYSIS_AUDIO_PROFILE.codec,
        "-ac",
        String(ANALYSIS_AUDIO_PROFILE.channels),
        "-ar",
        String(ANALYSIS_AUDIO_PROFILE.sampleRate),
        "-b:a",
        "64k",
        "-map_metadata",
        "-1",
        "-movflags",
        "+faststart",
        "-threads",
        "2",
        "-f",
        "mp4",
        output,
      ],
      signal,
    );
    const extracted = await probeMedia(
      output,
      this.tools.ffprobe,
      signal,
      "audio",
    );
    const audio = extracted.streams[0]!;
    if (
      audio.codec_type !== "audio" ||
      audio.codec_name !== ANALYSIS_AUDIO_PROFILE.codec ||
      audio.channels !== ANALYSIS_AUDIO_PROFILE.channels ||
      audio.sample_rate !== ANALYSIS_AUDIO_PROFILE.sampleRate ||
      Math.abs(audio.start_time ?? 0) > 0.01 ||
      Math.abs(duration - extracted.format.duration) > 0.1
    )
      throw new MediaFailure("invalid");
  }
  async proxy(
    path: string,
    output: string,
    signal: AbortSignal,
    range: SelectedMediaRange,
  ) {
    const input = await probeMedia(path, this.tools.ffprobe, signal);
    const selected = selectedMediaRangeSchema.parse(range);
    if (selected.endMs > Math.round(input.format.duration * 1000))
      throw new MediaFailure("invalid");
    const duration = (selected.endMs - selected.startMs) / 1000;
    await runOwnedProcess(
      this.tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-protocol_whitelist",
        "file,pipe",
        "-ss",
        String(selected.startMs / 1000),
        "-i",
        path,
        "-t",
        String(duration),
        "-map",
        "0:v:0",
        "-map",
        "0:a:0",
        "-vf",
        "scale=w=640:h=640:force_original_aspect_ratio=decrease:force_divisible_by=2",
        "-r",
        "20",
        "-af",
        "aresample=async=1:first_pts=0",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-pix_fmt",
        "yuv420p",
        "-b:v",
        "512k",
        "-maxrate",
        "512k",
        "-bufsize",
        "1024k",
        "-c:a",
        "aac",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-b:a",
        "64k",
        "-map_metadata",
        "-1",
        "-movflags",
        "+faststart",
        "-threads",
        "2",
        output,
      ],
      signal,
    );
    const proxy = await probeMedia(output, this.tools.ffprobe, signal);
    if (Math.abs(duration - proxy.format.duration) > 0.1)
      throw new MediaFailure("invalid");
  }
  async render(
    path: string,
    output: string,
    manifest: CompositionManifestV3,
    directory: string,
    signal: AbortSignal,
  ) {
    const selected = join(directory, "selected.mp4"),
      duration = (manifest.range.endMs - manifest.range.startMs) / 1000;
    await runOwnedProcess(
      this.tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-protocol_whitelist",
        "file,pipe",
        "-ss",
        String(manifest.range.startMs / 1000),
        "-i",
        path,
        "-t",
        String(duration),
        "-map",
        "0:v:0",
        "-map",
        "0:a:0",
        "-r",
        "30",
        "-af",
        "aresample=async=1:first_pts=0",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "18",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-map_metadata",
        "-1",
        "-movflags",
        "+faststart",
        "-threads",
        "2",
        selected,
      ],
      signal,
    );
    const jobPath = join(directory, "render.json");
    await writeFile(
      jobPath,
      JSON.stringify({
        manifest,
        source: selected,
        output,
        chromium: this.tools.chromium,
        bundle: this.tools.bundle,
      }),
      { flag: "wx", mode: 0o600 },
    );
    const worker = fileURLToPath(
      new URL("../composition/render-worker.js", import.meta.url),
    );
    await runOwnedProcess(process.execPath, [worker, jobPath], signal, {
      cwd: directory,
      env: {
        PATH: process.env.PATH,
        SystemRoot: process.env.SystemRoot,
        TEMP: directory,
        TMP: directory,
        TMPDIR: directory,
        NODE_ENV: process.env.NODE_ENV === "test" ? "test" : "production",
        // This isolated worker only renders local media; AI/cloud access is off.
        FAKE_MODE: "true",
        PROVIDER_MODE: "fake",
        PAID_DEMO_ENABLED: "false",
        LIVE_ANALYSIS_ENABLED: "false",
        LIVE_ASSEMBLY_ENABLED: "false",
        LIVE_RENDER_ENABLED: "false",
        LIVE_IMAGE_GENERATION_ENABLED: "false",
        CLOUD_RENDER_ENVIRONMENT: "disabled",
        CLOUD_SPEND_APPROVED: "false",
        RENDERER_ENABLED: "false",
      },
      maxStdout: 16_384,
    });
    await validateOutput(
      output,
      this.tools.ffprobe,
      this.tools.ffmpeg,
      duration * 1000,
      signal,
    );
  }
}
