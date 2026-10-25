import { expect, it } from "vitest";
import { createHash, randomUUID } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, relative, isAbsolute } from "node:path";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import {
  inspectOwnerSource,
  ownerPortrait,
} from "../apps/renderer/local/media.ts";
import { renderOwnerClip } from "../apps/renderer/local/clip-render.ts";
import { ownerOutputProfile } from "../apps/renderer/local/export-profile.ts";
import {
  defaultOwnerFocus,
  ownerFocusCrop,
} from "../packages/contracts/local/focus.ts";
import { prepareLocalOverlayFixture } from "./owner-controls-browser.ts";

async function clearQualityScratch(root: string) {
  const actual = await realpath(root),
    parent = await realpath(tmpdir()),
    rel = relative(parent, actual);
  if (
    !rel ||
    rel.startsWith("..") ||
    isAbsolute(rel) ||
    !rel.startsWith("clipbuilder-quality-proof-")
  )
    throw new Error("invalid_quality_cleanup");
  await rm(actual, { recursive: true, force: true });
}

it("exports original detail, native portrait size and 24/30/60/fractional cadence without a preview encode generation", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-quality-proof-"));
  const signal = AbortSignal.timeout(230_000);
  const tools = await ownerNativeTools(resolve("."));
  const run = (args: string[]) =>
    runOwnedProcess(
      tools.ffmpeg,
      ["-nostdin", "-v", "error", "-threads", "2", ...args],
      signal,
    );
  const hash = async (file: string) =>
    createHash("sha256")
      .update(await readFile(file))
      .digest("hex");
  const probe = async (file: string) =>
    JSON.parse(
      await runOwnedProcess(
        tools.ffprobe,
        [
          "-v",
          "error",
          "-select_streams",
          "v:0",
          "-count_frames",
          "-show_entries",
          "stream=width,height,avg_frame_rate,nb_read_frames",
          "-of",
          "json",
          file,
        ],
        signal,
      ),
    ).streams[0];
  try {
    const bundle = await prepareLocalOverlayFixture(root);
    const samples: unknown[] = [];
    for (const fixture of [
      {
        width: 3840,
        height: 2160,
        rate: "30",
        duration: 1,
        detail: true,
        offset: false,
      },
      {
        width: 2160,
        height: 3840,
        rate: "24",
        duration: 1,
        detail: false,
        offset: false,
      },
      {
        width: 1920,
        height: 1080,
        rate: "60",
        duration: 4,
        detail: false,
        offset: true,
      },
      {
        width: 720,
        height: 1280,
        rate: "30000/1001",
        duration: 1,
        detail: false,
        offset: false,
      },
    ]) {
      const workspaceId = randomUUID(),
        clipId = randomUUID(),
        directory = join(root, workspaceId);
      await mkdir(directory);
      const source = join(directory, "source.mp4");
      const pattern = fixture.detail
        ? `color=black:s=${fixture.width}x${fixture.height}:r=${fixture.rate}:d=${fixture.duration},drawgrid=width=4:height=${fixture.height}:thickness=2:color=white`
        : `color=red:s=${fixture.width}x${fixture.height}:r=${fixture.rate}:d=${fixture.duration},drawbox=x=0:y=0:w=iw:h=ih:color=blue:t=fill:enable='mod(n,2)'`;
      await run([
        "-f",
        "lavfi",
        "-i",
        pattern,
        "-f",
        "lavfi",
        "-i",
        "anullsrc=r=48000:cl=stereo",
        "-t",
        String(fixture.duration),
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "12",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        ...(fixture.offset ? ["-output_ts_offset", "2.5"] : []),
        source,
      ]);
      const metadata = await inspectOwnerSource(source, tools, signal),
        originalDigest = await hash(source);
      const focus = defaultOwnerFocus(metadata, 30),
        profile = ownerOutputProfile(metadata, 30);
      const startFrame = fixture.offset ? 89 : 0;
      const job = {
        operation: "clip" as const,
        workspaceId,
        clipId,
        jobId: randomUUID(),
        renderRevision: 0,
        cut: { startFrame, endFrame: startFrame + 30 },
        fingerprint: metadata.fingerprint,
        overlay: {
          version: 1 as const,
          frames: 30,
          captions: [],
          visuals: [],
          focus,
        },
      };
      const options = {
        root,
        tools,
        bundle,
        chromium: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        cache: new Map(),
      };
      await renderOwnerClip(options, job, signal);
      const output = join(directory, `${clipId}.r0.mp4`),
        actual = await probe(output);
      const [numerator, denominator] = actual.avg_frame_rate
        .split("/")
        .map(Number);
      expect(actual).toMatchObject({
        width: profile.width,
        height: profile.height,
      });
      expect(numerator / denominator).toBeCloseTo(metadata.fps, 4);
      expect(Number(actual.nb_read_frames)).toBe(profile.frames);
      expect(await hash(source)).toBe(originalDigest);
      let detail: { native: number; previous: number } | undefined;
      if (fixture.detail) {
        const raw = join(directory, `${clipId}.source.mp4`),
          cachedDigest = await hash(raw),
          previous = join(directory, "previous-quality.mp4"),
          crop = ownerFocusCrop(focus, focus.shots[0]!);
        await run([
          "-i",
          raw,
          "-vf",
          `crop=${crop.width}:${crop.height}:${crop.x}:${crop.y},scale=1080:1920`,
          "-an",
          "-c:v",
          "libx264",
          "-preset",
          "veryfast",
          "-crf",
          "22",
          "-pix_fmt",
          "yuv420p",
          previous,
        ]);
        const contrast = async (file: string, name: string) => {
          const pixels = join(directory, name);
          await run([
            "-i",
            file,
            "-vf",
            "crop=iw:2:0:floor(ih/4)*2,format=gray",
            "-frames:v",
            "1",
            "-f",
            "rawvideo",
            pixels,
          ]);
          const values = await readFile(pixels),
            mean = values.reduce((sum, n) => sum + n, 0) / values.length;
          return Math.sqrt(
            values.reduce((sum, n) => sum + (n - mean) ** 2, 0) / values.length,
          );
        };
        detail = {
          native: await contrast(output, "native.gray"),
          previous: await contrast(previous, "previous.gray"),
        };
        expect(detail.native).toBeGreaterThan(40);
        expect(detail.native).toBeGreaterThan(detail.previous * 2);
        await renderOwnerClip(
          options,
          { ...job, jobId: randomUUID(), renderRevision: 1 },
          signal,
        );
        expect(await hash(raw)).toBe(cachedDigest);
        expect(await hash(source)).toBe(originalDigest);
      }
      if (fixture.offset) {
        const pixels = join(directory, "cadence.rgb");
        await run([
          "-i",
          output,
          "-vf",
          "scale=2:2:flags=area,format=rgb24",
          "-frames:v",
          "2",
          "-f",
          "rawvideo",
          pixels,
        ]);
        const values = await readFile(pixels);
        expect(values.length).toBe(24);
        expect(values[0]! - values[2]!).toBeGreaterThan(150);
        expect(values[14]! - values[12]!).toBeGreaterThan(150);
      }
      if (fixture.height === 3840) {
        const plain = join(directory, "portrait-only.mp4");
        await ownerPortrait(
          source,
          plain,
          tools,
          signal,
          { startFrame: 0, endFrame: 30 },
          metadata.fingerprint,
        );
        expect(await probe(plain)).toMatchObject({
          width: 2160,
          height: 3840,
          avg_frame_rate: "24/1",
        });
      }
      samples.push({
        source: {
          width: fixture.width,
          height: fixture.height,
          fps: metadata.fps,
        },
        output: actual,
        detail,
        originalUnchanged: true,
      });
      await expect(
        renderOwnerClip(
          options,
          { ...job, renderRevision: 2 },
          AbortSignal.abort(),
        ),
      ).rejects.toThrow();
    }
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    await writeFile(
      resolve(".local-build/evidence/cl070-export-quality.json"),
      JSON.stringify({ synthetic: true, providerCalls: 0, samples }, null, 2),
    );
  } finally {
    await clearQualityScratch(root);
  }
}, 240_000);
