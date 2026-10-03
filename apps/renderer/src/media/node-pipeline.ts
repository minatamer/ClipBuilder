import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  type CompositionManifestV2,
  type InspectedSource,
  type SelectedMediaRange,
  selectedMediaRangeSchema,
} from "@clipbuilder/contracts";
import { inspectSource, validateOutput, probeMedia } from "./inspection.js";
import { runOwnedProcess } from "./process-runner.js";
import { MediaFailure } from "./media.failure.js";
export interface MediaPipeline {
  inspect(path: string, signal: AbortSignal): Promise<InspectedSource>;
  proxy(
    path: string,
    output: string,
    signal: AbortSignal,
    range?: SelectedMediaRange,
  ): Promise<void>;
  render(
    path: string,
    output: string,
    manifest: CompositionManifestV2,
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
  async proxy(
    path: string,
    output: string,
    signal: AbortSignal,
    range?: SelectedMediaRange,
  ) {
    const input = await probeMedia(path, this.tools.ffprobe, signal);
    const selected = range ? selectedMediaRangeSchema.parse(range) : undefined;
    if (selected && selected.endMs > Math.round(input.format.duration * 1000))
      throw new MediaFailure("invalid");
    const duration = selected
      ? (selected.endMs - selected.startMs) / 1000
      : input.format.duration;
    await runOwnedProcess(
      this.tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-protocol_whitelist",
        "file,pipe",
        ...(selected ? ["-ss", String(selected.startMs / 1000)] : []),
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
        selected ? "20" : "10",
        "-af",
        "aresample=async=1:first_pts=0",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-pix_fmt",
        "yuv420p",
        "-b:v",
        selected ? "512k" : "112k",
        "-maxrate",
        selected ? "512k" : "112k",
        "-bufsize",
        selected ? "1024k" : "224k",
        "-c:a",
        "aac",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-b:a",
        selected ? "64k" : "32k",
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
    manifest: CompositionManifestV2,
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
        NODE_ENV: "production",
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
