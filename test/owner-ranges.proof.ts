import { expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import {
  inspectOwnerSource,
  ownerPortrait,
} from "../apps/renderer/local/media.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { ownerCut } from "../packages/contracts/local/selection.ts";

it("renders exact 30/60-second cuts and source-clock VFR/offset/silent/fractional boundaries offline", async () => {
  const tools = await ownerNativeTools(resolve("."));
  const directory = await mkdtemp(
    join(tmpdir(), "clipbuilder-owner-range-proof-"),
  );
  const signal = AbortSignal.timeout(150_000);
  const run = (args: string[]) =>
    runOwnedProcess(tools.ffmpeg, ["-nostdin", "-v", "error", ...args], signal);
  let stage = "long synthetic source";
  try {
    const source = join(directory, "synthetic-long.mp4");
    await run([
      "-f",
      "lavfi",
      "-i",
      "color=c=blue:size=160x90:rate=30:duration=61",
      "-f",
      "lavfi",
      "-i",
      "anullsrc=r=48000:cl=stereo",
      "-t",
      "61",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-threads",
      "2",
      source,
    ]);
    const metadata = await inspectOwnerSource(source, tools, signal);
    for (const seconds of [30, 60]) {
      stage = `${seconds}-second export`;
      const cut = ownerCut(
        { startMs: 1000, endMs: 1000 + seconds * 1000 },
        metadata.durationMs,
      );
      const result = await ownerPortrait(
        source,
        join(directory, `exact-${seconds}.mp4`),
        tools,
        signal,
        cut,
        metadata.fingerprint,
      );
      expect(result).toMatchObject({
        frames: seconds * 30,
        durationMs: seconds * 1000,
      });
    }
    const offset = join(directory, "synthetic-vfr-offset.mp4");
    stage = "VFR offset synthetic source";
    await run([
      "-f",
      "lavfi",
      "-i",
      "color=c=black:size=320x180:rate=30:duration=6,drawbox=color=white:t=fill:enable='gte(t,2)',select='if(lt(t,2),not(mod(n,2)),1)'",
      "-itsoffset",
      "2.5",
      "-f",
      "lavfi",
      "-i",
      "sine=frequency=440:sample_rate=48000:duration=3.5",
      "-fps_mode",
      "vfr",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-output_ts_offset",
      "5",
      "-threads",
      "2",
      offset,
    ]);
    const nonzero = await inspectOwnerSource(offset, tools, signal);
    // Stream duration overstates this VFR fixture by two output frames. The
    // admitted source clock uses actual packet presentation ends instead.
    expect(nonzero.durationMs).toBe(6000);
    expect(nonzero.fps).toBeLessThan(30);
    const fractional = join(directory, "fractional.mp4");
    stage = "fractional VFR export";
    const result = await ownerPortrait(
      offset,
      fractional,
      tools,
      signal,
      ownerCut({ startMs: 1001, endMs: 2999 }, nonzero.durationMs),
      nonzero.fingerprint,
    );
    expect(result).toMatchObject({ frames: 60, durationMs: 2000 });
    stage = "pixel boundary probe";
    const pixels = await run([
      "-i",
      fractional,
      "-vf",
      "select='eq(n,0)+eq(n,59)',crop=16:16:(iw-16)/2:(ih-16)/2,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-",
      "-an",
      "-f",
      "null",
      "-",
    ]);
    const luma = [...pixels.matchAll(/lavfi\.signalstats\.YAVG=([\d.]+)/g)].map(
      (match) => Number(match[1]),
    );
    expect(luma).toHaveLength(2);
    expect(luma[0]).toBeLessThan(25);
    expect(luma[1]).toBeGreaterThan(225);
    const silent = join(directory, "silent.mp4");
    stage = "silent region export";
    await ownerPortrait(
      offset,
      silent,
      tools,
      signal,
      ownerCut({ startMs: 0, endMs: 1000 }, nonzero.durationMs),
      nonzero.fingerprint,
    );
    stage = "silent audio probe";
    const audio = await run([
      "-i",
      silent,
      "-vn",
      "-af",
      "astats=metadata=1:reset=0,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-",
      "-f",
      "null",
      "-",
    ]);
    const levels = [
      ...audio.matchAll(/lavfi\.astats\.Overall\.RMS_level=([^\r\n]+)/g),
    ].map((match) => match[1]);
    expect(levels.length).toBeGreaterThan(0);
    expect(levels.every((level) => level === "-inf")).toBe(true);
    stage = "source endpoint export";
    const end = await ownerPortrait(
      offset,
      join(directory, "source-end.mp4"),
      tools,
      signal,
      ownerCut(
        { startMs: nonzero.durationMs - 1000, endMs: nonzero.durationMs },
        nonzero.durationMs,
      ),
      nonzero.fingerprint,
    );
    expect(end).toMatchObject({ frames: 30, durationMs: 1000 });
    await expect(
      ownerPortrait(
        offset,
        join(directory, "stale.mp4"),
        tools,
        signal,
        { startFrame: 0, endFrame: 30 },
        "f".repeat(64),
      ),
    ).rejects.toThrow("stale_or_invalid_cut");
  } catch (error) {
    throw new Error(`Synthetic proof failed at: ${stage}`, { cause: error });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}, 160_000);
