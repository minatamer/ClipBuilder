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
import {
  ownerCameraFollowKey,
  type OwnerCameraTrack,
} from "../packages/contracts/local/camera-follow.ts";
import { prepareLocalOverlayFixture } from "./owner-controls-browser.ts";
it("renders manual Zoom and tracked Hook/body camera paths at 24/25/29.97/30/60fps from original pixels", async () => {
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
      const tracks: OwnerCameraTrack[] = (["hook", "body"] as const).map(
        (occurrence) => {
          const duration = occurrence === "hook" ? 9 : 24;
          return {
            id: randomUUID(),
            occurrence,
            ...(occurrence === "body" ? { followWindow: 30 } : {}),
            personId: null,
            startFrame: 36,
            endFrame: 36 + duration,
            sourceStartFrame:
              36 + (occurrence === "hook" ? hook.startFrame : 0),
            focusKey: ownerCameraFollowKey(focus, null),
            seed: { x: 0.4, y: 0.2, width: 0.1, height: 0.2 },
            outcome: "complete",
            points: Array.from(
              { length: Math.ceil((duration - 1) / 2) + 1 },
              (_, i) => {
                const frame = Math.min(i * 2, duration - 1);
                return {
                  frame,
                  x: 0.45 + (frame / (duration - 1)) * 0.2,
                  y: 0.3,
                };
              },
            ),
          };
        },
      );
      const bodyTrack = tracks.find((track) => track.occurrence === "body")!;
      const split = 12;
      const firstBody: OwnerCameraTrack = {
        ...bodyTrack,
        endFrame: bodyTrack.startFrame + split,
        points: [0, 2, 4, 6, 8, 10, 11].map((frame) => ({
          frame,
          x: 0.45 + (frame / 23) * 0.2,
          y: 0.3,
        })),
      };
      const center = firstBody.points.at(-1)!;
      const secondBody: OwnerCameraTrack = {
        ...bodyTrack,
        id: randomUUID(),
        continues: firstBody.id,
        startFrame: 48,
        sourceStartFrame: 48,
        seed: { ...bodyTrack.seed, x: center.x - 0.05 },
        points: firstBody.points.map((point) => ({
          frame: point.frame,
          x: center.x + (point.frame / 23) * 0.2,
          y: 0.3,
        })),
      };
      tracks.splice(tracks.indexOf(bodyTrack), 1, firstBody, secondBody);
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
            cameraTracks: tracks,
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
        for (const logical of occurrence === "hook"
          ? [0, 9, 15, 27, 36, 39, 42, 44]
          : [0, 9, 15, 27, 36, 39, 42, 51, 57, 59]) {
          const index = Math.round((logical * metadata.fps) / 30),
            phase = (index * 30) / metadata.fps;
          const sourceFrame =
            (occurrence === "hook" ? hook.startFrame : 0) + phase;
          const crop = ownerOriginalCameraCrop(
            focus,
            ownerCameraCropAt(
              focus,
              effects,
              sourceFrame,
              occurrence,
              phase,
              tracks,
            ),
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
    await writeFile(
      resolve(".local-build/evidence/cl203-native.json"),
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
