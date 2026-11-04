import { expect, it, vi } from "vitest";
import {
  parseSourceSceneCuts,
  detectSourceSceneCuts,
} from "./source-scene-cuts.ts";
import * as native from "../src/media/process-runner.ts";
import * as media from "./media.ts";

const sample = (frame: number, score: number, difference = score) =>
  `frame:${frame} pts:${frame} pts_time:${frame / 30}\nlavfi.scd.mafd=${difference}\nlavfi.scd.score=${score}\n`;
it("keeps exact cut frames, ignores malformed/outside evidence and suppresses a one-frame flash", () => {
  expect(
    parseSourceSceneCuts(
      sample(0, 100) +
        sample(47, 25) +
        sample(48, 0) +
        sample(70, 70) +
        sample(71, 0, 70) +
        sample(72, 0) +
        sample(113, 20) +
        sample(114, 0) +
        sample(200, 30) +
        "frame:bad pts_time:NaN\n",
      180,
    ),
  ).toEqual([47, 113]);
});
it("bounds dense candidates across the whole interval", () => {
  const text = Array.from({ length: 9000 }, (_, frame) =>
    sample(frame, frame % 4 === 1 ? 10 : 0),
  ).join("");
  const cuts = parseSourceSceneCuts(text, 9000);
  expect(cuts).toHaveLength(600);
  expect(cuts[0]).toBe(1);
  expect(cuts.at(-1)).toBe(8997);
});
it("seeks only a bounded preroll, keeps absolute source timestamps, bounds output and propagates cancellation", async () => {
  const inspect = vi.spyOn(media, "inspectOwnerMedia").mockResolvedValue({
    videoStart: 7,
    metadata: {
      fingerprint: "a".repeat(64),
      bytes: 10,
      durationMs: 3600000,
      width: 640,
      height: 360,
      fps: 30,
    },
  });
  const run = vi
    .spyOn(native, "runOwnedProcess")
    .mockResolvedValue(sample(17, 20) + sample(18, 0));
  try {
    expect(
      await detectSourceSceneCuts(
        "synthetic.mp4",
        { ffmpeg: "synthetic", ffprobe: "synthetic" },
        { startFrame: 60000, endFrame: 60180 },
        AbortSignal.timeout(2000),
      ),
    ).toEqual([17]);
    const [, args, , options] = run.mock.calls[0]!;
    expect(args[args.indexOf("-ss") + 1]).toBe("1999");
    expect(args[args.indexOf("-t") + 1]).toBe("8");
    expect(args[args.indexOf("-vf") + 1]).toContain("PTS-(7.000000)/TB");
    expect(args[args.indexOf("-vf") + 1]).toContain(
      "trim=start_pts=60000:end_pts=60180",
    );
    expect(args).toContain("-copyts");
    expect(options).toMatchObject({
      maxStdout: 2 * 1024 ** 2,
      timeoutMs: 180000,
    });
    run.mockRejectedValueOnce(new Error("synthetic_canceled"));
    await expect(
      detectSourceSceneCuts(
        "synthetic.mp4",
        { ffmpeg: "synthetic", ffprobe: "synthetic" },
        { startFrame: 0, endFrame: 180 },
        AbortSignal.timeout(2000),
      ),
    ).rejects.toThrow("synthetic_canceled");
  } finally {
    inspect.mockRestore();
    run.mockRestore();
  }
});
