import { it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, relative, isAbsolute } from "node:path";
import { OwnerSceneMattes } from "../../../packages/composition/local/scene-mattes.tsx";
import { ownerNativeTools } from "../../../scripts/native-tools.ts";
import { runOwnedProcess } from "../src/media/process-runner.ts";
import { ownerNativeFocusFilter } from "./focus-filter.ts";
import { defaultOwnerFocus } from "../../../packages/contracts/local/focus.ts";
import { ownerOutputProfile } from "./export-profile.ts";

it("composites the shared mattes with exact native edges, cadence and silent audio", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-mattes-proof-"));
  const rel = relative(tmpdir(), root);
  if (
    isAbsolute(rel) ||
    rel.startsWith("..") ||
    !rel.startsWith("clipbuilder-mattes-proof-")
  )
    throw Error("matte_cleanup_scope");
  try {
    const svg = renderToStaticMarkup(
      createElement(OwnerSceneMattes, { enabled: true }),
    );
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    const rgba = await sharp(png).raw().toBuffer();
    const alpha = (y: number) => rgba[(y * 1080 + 540) * 4 + 3];
    expect([
      alpha(0),
      alpha(419),
      alpha(420),
      alpha(1499),
      alpha(1500),
      alpha(1919),
    ]).toEqual([255, 255, 0, 0, 255, 255]);
    const art = join(root, "mattes.png"),
      output = join(root, "result.mp4"),
      still = join(root, "result.png");
    await writeFile(art, png);
    const tools = await ownerNativeTools(resolve(".")),
      signal = AbortSignal.timeout(60000);
    const run = (args: string[]) =>
      runOwnedProcess(
        tools.ffmpeg,
        ["-nostdin", "-v", "error", "-threads", "2", ...args],
        signal,
      );
    await run([
      "-f",
      "lavfi",
      "-i",
      "color=c=red:s=1080x1920:r=24:d=0.5",
      "-loop",
      "1",
      "-i",
      art,
      "-f",
      "lavfi",
      "-i",
      "anullsrc=r=48000:cl=stereo",
      "-filter_complex",
      "[0:v][1:v]overlay=shortest=1:format=auto[v]",
      "-map",
      "[v]",
      "-map",
      "2:a",
      "-t",
      "0.5",
      "-r",
      "24",
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-threads",
      "2",
      output,
    ]);
    const probe = JSON.parse(
      await runOwnedProcess(
        tools.ffprobe,
        [
          "-v",
          "error",
          "-count_frames",
          "-show_entries",
          "stream=codec_type,width,height,avg_frame_rate,nb_read_frames",
          "-of",
          "json",
          output,
        ],
        signal,
      ),
    );
    expect(probe.streams[0]).toMatchObject({
      width: 1080,
      height: 1920,
      avg_frame_rate: "24/1",
      nb_read_frames: "12",
    });
    expect(probe.streams[1].codec_type).toBe("audio");
    await run(["-i", output, "-frames:v", "1", still]);
    const frame = await sharp(still).removeAlpha().raw().toBuffer();
    const pixel = (y: number) => [
      ...frame.subarray((y * 1080 + 540) * 3, (y * 1080 + 540) * 3 + 3),
    ];
    expect(Math.max(...pixel(200), ...pixel(1700))).toBeLessThan(8);
    expect(pixel(960)[0]).toBeGreaterThan(240);
    // The same source bands move under fixed mattes at all three positions.
    for (const height of [1920, 180, 720]) {
      const profile = ownerOutputProfile({ width: 1080, height, fps: 24 }, 15);
      for (const [position, channel] of [
        [0, 0],
        [0.5, 1],
        [1, 2],
      ] as const) {
        const image = join(root, `reframe-${height}-${channel}.png`);
        const source = {
          width: 1080,
          height: 1920,
          fps: 24,
          fingerprint: "a".repeat(64),
          bytes: 1,
          durationMs: 625,
        };
        const focus = defaultOwnerFocus(source, 15);
        focus.shots[0]!.centerX = 0.5;
        focus.shots[0]!.centerY = position;
        await run([
          "-f",
          "lavfi",
          "-i",
          "color=c=black:s=1080x1920:r=24:d=0.1,drawbox=x=0:y=0:w=1080:h=640:color=red:t=fill,drawbox=x=0:y=640:w=1080:h=640:color=lime:t=fill,drawbox=x=0:y=1280:w=1080:h=640:color=blue:t=fill",
          "-i",
          art,
          "-filter_complex",
          `[0:v]${ownerNativeFocusFilter(focus, source, profile, "focus", { effects: [], occurrence: "body", squarePosition: 0.5 })}[framed];[1:v]scale=${profile.width}:${profile.height}[matte];[framed][matte]overlay=shortest=1:format=auto`,
          "-frames:v",
          "1",
          image,
        ]);
        const moved = await sharp(image).removeAlpha().raw().toBuffer();
        const at = (y: number) => [
          ...moved.subarray(
            (y * profile.width + Math.floor(profile.width / 2)) * 3,
            (y * profile.width + Math.floor(profile.width / 2)) * 3 + 3,
          ),
        ];
        expect(at(Math.floor(profile.height / 2))[channel]).toBeGreaterThan(
          240,
        );
        expect(
          Math.max(
            ...at(Math.floor(profile.height * 0.1)),
            ...at(Math.floor(profile.height * 0.9)),
          ),
        ).toBeLessThan(8);
      }
    }
    // A landscape source can reach all four square corners, including areas
    // that cannot fit inside the old tall portrait crop.
    const source = {
      width: 1920,
      height: 1080,
      fps: 24,
      fingerprint: "a".repeat(64),
      bytes: 1,
      durationMs: 625,
    };
    const profile = ownerOutputProfile({ ...source, height: 180 }, 15);
    for (const [x, y, expected] of [
      [0, 0, [255, 0, 0]],
      [1, 0, [0, 255, 0]],
      [0, 1, [0, 0, 255]],
      [1, 1, [255, 255, 0]],
    ] as const) {
      const focus = defaultOwnerFocus(source, 15);
      Object.assign(focus.shots[0]!, { centerX: x, centerY: y, zoom: 1.5 });
      const image = join(root, `square-corner-${x}-${y}.png`);
      await run([
        "-f",
        "lavfi",
        "-i",
        "color=c=red:s=1920x1080:r=24:d=0.1,drawbox=x=960:y=0:w=960:h=540:color=lime:t=fill,drawbox=x=0:y=540:w=960:h=540:color=blue:t=fill,drawbox=x=960:y=540:w=960:h=540:color=yellow:t=fill",
        "-vf",
        ownerNativeFocusFilter(focus, source, profile, "focus", {
          effects: [],
          occurrence: "body",
          squarePosition: 0.5,
        }),
        "-frames:v",
        "1",
        image,
      ]);
      const pixels = await sharp(image).removeAlpha().raw().toBuffer();
      const offset =
        (Math.floor(profile.height / 2) * profile.width +
          Math.floor(profile.width / 2)) *
        3;
      const center = [...pixels.subarray(offset, offset + 3)];
      expected.forEach((channel, i) =>
        expect(Math.abs(center[i]! - channel)).toBeLessThan(8),
      );
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}, 90000);
