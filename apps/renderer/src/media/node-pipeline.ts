import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  type CompositionManifestV2,
  type InspectedSource,
} from "@clipbuilder/contracts";
import { inspectSource, validateOutput, probeMedia } from "./inspection.js";
import { runOwnedProcess } from "./process-runner.js";
import { MediaFailure } from "./media.failure.js";
export interface MediaPipeline {
  inspect(path: string, signal: AbortSignal): Promise<InspectedSource>;
  proxy(path: string, output: string, signal: AbortSignal): Promise<void>;
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
  async proxy(path: string, output: string, signal: AbortSignal) {
    const input = await probeMedia(path, this.tools.ffprobe, signal);
    await runOwnedProcess(
      this.tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-protocol_whitelist",
        "file,pipe",
        "-i",
        path,
        "-t",
        String(input.format.duration),
        "-map",
        "0:v:0",
        "-map",
        "0:a:0",
        "-vf",
        "scale=w=640:h=640:force_original_aspect_ratio=decrease:force_divisible_by=2",
        "-r",
        "10",
        "-af",
        "aresample=async=1:first_pts=0",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-pix_fmt",
        "yuv420p",
        "-b:v",
        "112k",
        "-maxrate",
        "112k",
        "-bufsize",
        "224k",
        "-c:a",
        "aac",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-b:a",
        "32k",
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
    if (Math.abs(input.format.duration - proxy.format.duration) > 0.1)
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
    await validateOutput(output, this.tools.ffprobe, duration * 1000, signal);
  }
}
