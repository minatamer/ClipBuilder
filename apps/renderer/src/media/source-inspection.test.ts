import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { inspectSource } from "./inspection.js";
import { runOwnedProcess } from "./process-runner.js";
import { NodeMediaPipeline } from "./node-pipeline.js";

vi.mock("./process-runner.js", () => ({ runOwnedProcess: vi.fn() }));

afterEach(() => vi.resetAllMocks());

describe("actual source container inspection", () => {
  it("preserves raw duration and video offset when inspecting then extracting audio", async () => {
    const directory = await mkdtemp(
      join(tmpdir(), "clipbuilder-probe-ownership-"),
    );
    const path = join(directory, "synthetic.mp4"),
      output = join(directory, "synthetic-audio.m4a");
    const signal = new AbortController().signal;
    await writeFile(path, new Uint8Array(8));
    const source = {
      streams: [
        {
          codec_type: "video",
          codec_name: "h264",
          width: 1280,
          height: 720,
          avg_frame_rate: "30/1",
          start_time: 0.033333,
        },
        {
          codec_type: "audio",
          codec_name: "aac",
          channels: 2,
          sample_rate: 48000,
          start_time: 0.2,
        },
      ],
      format: {
        format_name: "mov,mp4,m4a,3gp,3g2,mj2",
        duration: 15.0004,
        tags: { major_brand: "isom" },
      },
    };
    vi.mocked(runOwnedProcess).mockImplementation(async (executable, args) => {
      if (executable === "synthetic-ffmpeg") return "";
      return JSON.stringify(
        args.at(-1) === path
          ? source
          : {
              streams: [
                {
                  codec_type: "audio",
                  codec_name: "aac",
                  channels: 1,
                  sample_rate: 16000,
                  start_time: 0,
                },
              ],
              format: {
                duration: 15.0004,
                format_name: "mov,mp4,m4a,3gp,3g2,mj2",
              },
            },
      );
    });
    try {
      const pipeline = new NodeMediaPipeline({
        ffmpeg: "synthetic-ffmpeg",
        ffprobe: "synthetic-ffprobe",
        chromium: "unused",
        bundle: "unused",
      });
      await pipeline.inspect(path, signal);
      await pipeline.audio(path, output, signal);
      const calls = vi.mocked(runOwnedProcess).mock.calls;
      expect(
        calls.filter(([executable]) => executable === "synthetic-ffprobe"),
      ).toHaveLength(3);
      expect(
        calls.filter(
          ([executable, args]) =>
            executable === "synthetic-ffprobe" && args.at(-1) === path,
        ),
      ).toHaveLength(2);
      const extraction = calls.find(
        ([executable]) => executable === "synthetic-ffmpeg",
      )?.[1];
      expect(extraction).toContain("15.0004");
      expect(extraction).toContain(
        "asetpts=PTS-0.033333/TB,aresample=async=1:first_pts=0,apad",
      );
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
  it.each([
    ["mov,mp4,m4a,3gp,3g2,mj2", "isom", true],
    ["matroska,webm", "", false],
    ["mov,mp4,m4a,3gp,3g2,mj2", "qt  ", false],
  ] as const)(
    "validates detected %s / %s independently of the file extension",
    async (format, majorBrand, accepted) => {
      const directory = await mkdtemp(
        join(tmpdir(), "clipbuilder-source-inspection-"),
      );
      const path = join(directory, "synthetic.mp4");
      const signal = new AbortController().signal;
      await writeFile(path, new Uint8Array(8));
      vi.mocked(runOwnedProcess).mockResolvedValue(
        JSON.stringify({
          streams: [
            {
              codec_type: "video",
              codec_name: "h264",
              width: 1280,
              height: 720,
              avg_frame_rate: "30/1",
              start_time: 0,
            },
            {
              codec_type: "audio",
              codec_name: "aac",
              channels: 2,
              sample_rate: 48000,
              start_time: 0,
            },
          ],
          format: {
            format_name: format,
            duration: 15,
            tags: { major_brand: majorBrand },
          },
        }),
      );
      try {
        if (accepted) {
          expect(
            await inspectSource(path, "synthetic-ffprobe", signal),
          ).toMatchObject({
            profile: { container: "mp4" },
            bytes: 8,
            durationMs: 15_000,
          });
        } else {
          await expect(
            inspectSource(path, "synthetic-ffprobe", signal),
          ).rejects.toMatchObject({ code: "invalid" });
        }
        expect(runOwnedProcess).toHaveBeenCalledExactlyOnceWith(
          "synthetic-ffprobe",
          [
            "-v",
            "error",
            "-protocol_whitelist",
            "file,pipe",
            "-format_whitelist",
            "mov,mp4",
            "-codec_whitelist",
            "h264,libopenh264,vp8,libvpx,vp9,libvpx-vp9,aac,libfdk_aac,opus,libopus,vorbis,libvorbis",
            "-max_streams",
            "2",
            "-show_streams",
            "-show_format",
            "-of",
            "json",
            path,
          ],
          signal,
        );
      } finally {
        await rm(directory, { recursive: true, force: true });
      }
    },
  );
});
