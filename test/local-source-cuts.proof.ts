import { expect, it } from "vitest";
import { mkdtemp, realpath, rm, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, relative, isAbsolute } from "node:path";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import {
  detectSourceSceneCuts,
  parseSourceSceneCuts,
} from "../apps/renderer/local/source-scene-cuts.ts";
import { inspectOwnerMedia } from "../apps/renderer/local/media.ts";
import { ownerCutVideoFilter } from "../apps/renderer/local/export-profile.ts";
import { alignAutomaticFocusCuts } from "../packages/contracts/local/focus-cut-alignment.ts";
import {
  defaultOwnerFocus,
  ownerFocusAt,
} from "../packages/contracts/local/focus.ts";

async function clearScratch(root: string) {
  const actual = await realpath(root),
    rel = relative(await realpath(tmpdir()), actual);
  if (
    !rel.startsWith("clipbuilder-source-cut-proof-") ||
    rel.includes("..") ||
    isAbsolute(rel)
  )
    throw Error("invalid_source_cut_cleanup");
  await rm(actual, { recursive: true, force: true });
}

it("measures generated off-grid cuts on the preview clock across cadence, VFR, container starts and clip offsets", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-source-cut-proof-"));
  try {
    const tools = await ownerNativeTools(resolve("."));
    const evidence = [];
    for (const scenario of [
      { fps: 30, offset: 0, vfr: false },
      { fps: 24, offset: 0, vfr: false },
      { fps: 60, offset: 0, vfr: false },
      { fps: 30, offset: 3, vfr: false },
      { fps: 30, offset: 0, vfr: true },
    ]) {
      const source = join(
        root,
        `${scenario.fps}-${scenario.offset}-${scenario.vfr}.mp4`,
      );
      const signal = AbortSignal.timeout(60000);
      const color = `drawbox=c=white:t=fill:enable='between(n,${Math.ceil((47 * scenario.fps) / 30)},${Math.ceil((113 * scenario.fps) / 30) - 1})',drawbox=c=red:t=fill:enable='gte(n,${Math.ceil((207 * scenario.fps) / 30)})'`;
      await runOwnedProcess(
        tools.ffmpeg,
        [
          "-nostdin",
          "-v",
          "error",
          "-f",
          "lavfi",
          "-i",
          `color=navy:s=320x180:r=${scenario.fps}:d=8`,
          "-f",
          "lavfi",
          "-i",
          "anullsrc=r=48000:cl=stereo:d=8",
          "-vf",
          `${color}${scenario.vfr ? ",select='not(eq(mod(n,5),1))'" : ""},setpts=PTS+${scenario.offset}/TB`,
          "-af",
          `asetpts=PTS+${scenario.offset}/TB`,
          "-fps_mode",
          "vfr",
          "-c:v",
          "libx264",
          "-threads",
          "2",
          "-pix_fmt",
          "yuv420p",
          "-g",
          "15",
          "-c:a",
          "aac",
          source,
        ],
        signal,
      );
      const cut = { startFrame: 45, endFrame: 225 };
      const start = performance.now();
      const actual = await detectSourceSceneCuts(source, tools, cut, signal);
      const { videoStart } = await inspectOwnerMedia(source, tools, signal);
      // Independent full-source decode through the existing preview's exact
      // clock transform proves the optimized seek has not changed the clock.
      const referenceText = await runOwnedProcess(
        tools.ffmpeg,
        [
          "-nostdin",
          "-v",
          "error",
          "-copyts",
          "-i",
          source,
          "-an",
          "-vf",
          `${ownerCutVideoFilter(videoStart, cut, { width: 1080, height: 1920, fps: 30, frames: 180 })},scale=160:90:flags=area,scdet=t=4,metadata=print:file=-`,
          "-filter_threads",
          "2",
          "-threads",
          "2",
          "-f",
          "null",
          "-",
        ],
        signal,
        { maxStdout: 2 * 1024 ** 2 },
      );
      const expected = parseSourceSceneCuts(referenceText, 180);
      expect(actual, JSON.stringify(scenario)).toEqual(expected);
      expect(actual).toHaveLength(3);
      expect(
        actual.every(
          (frame, index) => Math.abs(frame - [2, 68, 162][index]!) <= 2,
        ),
      ).toBe(true);
      if (scenario.fps === 30 && !scenario.vfr)
        expect(actual).toEqual([2, 68, 162]);
      const focus = defaultOwnerFocus({ width: 320, height: 180 }, 180);
      const delayed = actual[0]! + 14;
      focus.shots = [
        { ...focus.shots[0]!, endFrame: delayed },
        {
          ...focus.shots[0]!,
          startFrame: delayed,
          reason: "shot-reset",
          centerX: 0.75,
        },
      ];
      focus.decisions = [
        {
          startFrame: delayed,
          endFrame: 180,
          personId: null,
          speakerId: null,
          evidenceWordIds: [],
          confidence: 0,
          shotStart: true,
        },
      ];
      const fixed = alignAutomaticFocusCuts(focus, actual);
      expect(ownerFocusAt(fixed, actual[0]! - 1).centerX).toBe(0.25);
      expect(ownerFocusAt(fixed, actual[0]!).centerX).toBe(0.75);
      evidence.push({
        scenario,
        cuts: actual,
        detectorAndReferenceMs: Math.round(performance.now() - start),
        misframedFramesBefore: 14,
        misframedFramesAfter: 0,
      });
    }
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    await writeFile(
      resolve(".local-build/evidence/cl213-source-cuts.json"),
      JSON.stringify({ synthetic: true, providerCalls: 0, evidence }, null, 2),
    );
  } finally {
    await clearScratch(root);
  }
}, 120000);
