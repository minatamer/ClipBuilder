import { expect, it } from "vitest";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, relative, isAbsolute } from "node:path";
import sharp from "../apps/backend/node_modules/sharp/dist/index.mjs";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { glassMaterialFrame } from "../apps/frontend/feasibility/glass-material-frame.ts";
import { OWNER_CAPTION_PRESETS } from "../packages/contracts/local/editor.ts";
import { ownerOverlaySchema } from "../packages/contracts/local/clips.ts";

it("checks shared glass SVG alpha, silent word gaps and moving-footage compositing without any browser process", async () => {
  const directory = await mkdtemp(join(tmpdir(), "clipbuilder-glass-proof-"));
  const name = relative(tmpdir(), directory);
  if (
    isAbsolute(name) ||
    name.startsWith("..") ||
    !name.startsWith("clipbuilder-glass-proof-")
  )
    throw Error("glass_cleanup_scope");
  try {
    const tools = await ownerNativeTools(resolve(".")),
      signal = AbortSignal.timeout(60000);
    const run = (args: string[]) =>
      runOwnedProcess(
        tools.ffmpeg,
        ["-nostdin", "-y", "-v", "error", ...args],
        signal,
      );
    const overlay = ownerOverlaySchema.parse({
      version: 1,
      frames: 30,
      visuals: [],
      captionStyle: OWNER_CAPTION_PRESETS.glass,
      captions: [
        {
          startMs: 0,
          endMs: 1000,
          text: "Multiple possibilities",
          lines: ["Multiple possibilities"],
          wordIds: ["w_000001", "w_000002"],
          wordCues: [
            { wordId: "w_000001", text: "Multiple", startMs: 0, endMs: 400 },
            {
              wordId: "w_000002",
              text: "possibilities",
              startMs: 500,
              endMs: 1000,
            },
          ],
        },
      ],
    });
    const cache = new Map<string, Buffer>();
    for (let frame = 0; frame < 30; frame++) {
      const svg = glassMaterialFrame(overlay, frame);
      let png = cache.get(svg);
      if (!png) {
        png = await sharp(Buffer.from(svg)).ensureAlpha().png().toBuffer();
        cache.set(svg, png);
      }
      await writeFile(
        join(directory, `${String(frame).padStart(4, "0")}.png`),
        png,
      );
    }
    expect(cache.size).toBe(3);
    const alpha = await sharp(join(directory, "0005.png"))
      .ensureAlpha()
      .raw()
      .toBuffer();
    let transparent = 0,
      translucent = 0,
      edge = 0;
    for (let i = 3; i < alpha.length; i += 4) {
      if (alpha[i] === 0) transparent++;
      else if (alpha[i]! < 230) translucent++;
      else edge++;
    }
    expect(transparent).toBeGreaterThan(1080 * 1920 * 0.94);
    expect(translucent).toBeGreaterThan(5000);
    expect(edge).toBeGreaterThan(100);
    const gap = await sharp(join(directory, "0013.png"))
      .ensureAlpha()
      .raw()
      .toBuffer();
    expect(gap.every((v, i) => i % 4 !== 3 || v === 0)).toBe(true);
    const output = join(directory, "glass.mp4");
    await run([
      "-f",
      "lavfi",
      "-i",
      "testsrc2=s=1080x1920:r=30:d=1",
      "-framerate",
      "30",
      "-i",
      join(directory, "%04d.png"),
      "-filter_complex",
      "[0:v][1:v]overlay=shortest=1:format=auto",
      "-an",
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-pix_fmt",
      "yuv420p",
      "-threads",
      "2",
      output,
    ]);
    const evidence = resolve(".local-build/evidence");
    await mkdir(evidence, { recursive: true });
    await run([
      "-i",
      output,
      "-vf",
      "select=eq(n\\,5)",
      "-frames:v",
      "1",
      join(evidence, "cl275-glass-material.png"),
    ]);
    expect((await readFile(output)).length).toBeGreaterThan(1000);
    expect(
      (await readdir(directory)).filter((n) => n.endsWith(".png")),
    ).toHaveLength(30);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}, 90000);
