import { expect, it } from "vitest";
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  realpath,
  rm,
  readdir,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, relative, isAbsolute } from "node:path";
import { randomUUID, createHash } from "node:crypto";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { renderOwnerClip } from "../apps/renderer/local/clip-render.ts";
import { inspectOwnerSource } from "../apps/renderer/local/media.ts";
import {
  ownerOriginalCameraCrop,
  ownerOutputProfile,
} from "../apps/renderer/local/export-profile.ts";
import {
  ownerCameraCropAt,
  type OwnerCameraEffect,
} from "../packages/contracts/local/camera-motion.ts";
import { defaultOwnerFocus } from "../packages/contracts/local/focus.ts";
import { prepareLocalOverlayFixture } from "./owner-controls-browser.ts";
it("renders smooth manual Hook/body crops and the advancing baseline at 24/25/29.97/30/60fps from original pixels", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-camera-motion-")),
    tools = await ownerNativeTools(resolve(".")),
    signal = AbortSignal.timeout(350_000);
  const run = (args: string[]) =>
    runOwnedProcess(
      tools.ffmpeg,
      ["-nostdin", "-v", "error", "-threads", "2", ...args],
      signal,
    );
  try {
    const bundle = await prepareLocalOverlayFixture(root),
      evidence: unknown[] = [];
    for (const rate of ["24", "25", "30000/1001", "30", "60"]) {
      const workspaceId = randomUUID(),
        clipId = randomUUID(),
        directory = join(root, workspaceId);
      await mkdir(directory);
      const source = join(directory, "source.mp4");
      // Static spatial pattern makes crop errors observable independently of source cadence.
      await run([
        "-f",
        "lavfi",
        "-i",
        `nullsrc=s=480x270:r=${rate}:d=2,geq=lum='20+180*X/W':cb='20+200*Y/H':cr='128+55*sin(X/8)'`,
        "-f",
        "lavfi",
        "-i",
        "anullsrc=r=48000:cl=stereo",
        "-t",
        "2",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "10",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        source,
      ]);
      const metadata = await inspectOwnerSource(source, tools, signal),
        original = createHash("sha256")
          .update(await readFile(source))
          .digest("hex");
      const focus = defaultOwnerFocus(metadata, 60);
      focus.shots = [
        { ...focus.shots[0]!, endFrame: 30, centerX: 0.25 },
        { ...focus.shots[0]!, startFrame: 30, endFrame: 60, centerX: 0.75 },
      ];
      const effect: OwnerCameraEffect = {
          id: randomUUID(),
          occurrence: "body",
          startFrame: 3,
          zoomFrames: 12,
          holdFrames: 9,
          returnFrames: 12,
          target: { centerX: 0.48, centerY: 0.4, zoom: 2.4 },
        },
        effects = [
          effect,
          { ...effect, id: randomUUID(), occurrence: "hook" as const },
        ],
        hook = { startFrame: 15, endFrame: 60 };
      const body = ownerOutputProfile(metadata, 60),
        prefix = ownerOutputProfile(metadata, 45).frames;
      await renderOwnerClip(
        {
          root,
          tools,
          bundle,
          chromium: "C:/Program Files/Google/Chrome/Application/chrome.exe",
          cache: new Map(),
        },
        {
          operation: "clip",
          workspaceId,
          clipId,
          jobId: randomUUID(),
          renderRevision: 0,
          cut: { startFrame: 0, endFrame: 60 },
          fingerprint: metadata.fingerprint,
          overlay: {
            version: 1,
            frames: 60,
            captions: [],
            visuals: [],
            focus,
            hook,
            cameraEffects: effects,
          },
        },
        signal,
      );
      const output = join(directory, `${clipId}.r0.mp4`),
        probe = JSON.parse(
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
              output,
            ],
            signal,
          ),
        ).streams[0];
      expect(Number(probe.nb_read_frames)).toBe(body.frames + prefix);
      expect(probe.width).toBe(body.width);
      expect(probe.height).toBe(body.height);
      const [num, den] = probe.avg_frame_rate.split("/").map(Number);
      expect(num / den).toBeCloseTo(metadata.fps, 4);
      const comparisons: unknown[] = [];
      for (const occurrence of ["hook", "body"] as const)
        for (const logical of [0, 9, 15, 27, 36, 42]) {
          const index = Math.round((logical * metadata.fps) / 30),
            phase = (index * 30) / metadata.fps;
          const sourceFrame =
            (occurrence === "hook" ? hook.startFrame : 0) + phase;
          const crop = ownerOriginalCameraCrop(
            focus,
            ownerCameraCropAt(focus, effects, sourceFrame, occurrence, phase),
          );
          for (const n of Object.values(crop)) expect(n % 2).toBe(0);
          const actual = join(directory, `actual-${occurrence}-${index}.rgb`),
            expected = join(directory, `expected-${occurrence}-${index}.rgb`);
          await run([
            "-i",
            output,
            "-vf",
            `select=eq(n\\,${(occurrence === "body" ? prefix : 0) + index}),format=rgb24`,
            "-frames:v",
            "1",
            "-f",
            "rawvideo",
            actual,
          ]);
          await run([
            "-i",
            source,
            "-vf",
            `crop=${crop.width}:${crop.height}:${crop.x}:${crop.y},setsar=1,scale=${body.width}:${body.height},format=rgb24`,
            "-frames:v",
            "1",
            "-f",
            "rawvideo",
            expected,
          ]);
          const a = await readFile(actual),
            b = await readFile(expected);
          expect(a.length).toBe(body.width * body.height * 3);
          expect(a.length).toBe(b.length);
          const mean =
            a.reduce((sum, v, i) => sum + Math.abs(v - b[i]!), 0) / a.length;
          expect(
            mean,
            JSON.stringify({ rate, occurrence, logical, phase, crop }),
          ).toBeLessThan(4.5);
          comparisons.push({ occurrence, phase, mean });
        }
      expect(
        createHash("sha256")
          .update(await readFile(source))
          .digest("hex"),
      ).toBe(original);
      expect(
        (await readdir(directory)).some(
          (name) =>
            name.startsWith("overlay-") || name.endsWith(".partial.mp4"),
        ),
      ).toBe(false);
      evidence.push({
        rate,
        profile: probe,
        comparisons,
        sourceUnchanged: true,
      });
    }
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    await writeFile(
      resolve(".local-build/evidence/cl192-native.json"),
      JSON.stringify({ synthetic: true, providerCalls: 0, evidence }, null, 2),
    );
  } finally {
    await clearMotionScratch(root);
  }
}, 360_000);
async function clearMotionScratch(root: string) {
  const actual = await realpath(root),
    rel = relative(await realpath(tmpdir()), actual);
  if (
    !rel ||
    rel.startsWith("..") ||
    isAbsolute(rel) ||
    !rel.startsWith("clipbuilder-camera-motion-")
  )
    throw new Error("invalid_proof_cleanup");
  await rm(actual, { recursive: true, force: true });
}
