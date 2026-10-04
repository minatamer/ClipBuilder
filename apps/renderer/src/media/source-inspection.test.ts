import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { inspectSource } from "./inspection.js";
import { runOwnedProcess } from "./process-runner.js";

vi.mock("./process-runner.js", () => ({ runOwnedProcess: vi.fn() }));

afterEach(() => vi.resetAllMocks());

describe("actual source container inspection", () => {
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
