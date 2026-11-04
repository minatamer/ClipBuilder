import { expect, it } from "vitest";
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  rm,
  realpath,
  readdir,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative, isAbsolute, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "../apps/backend/node_modules/sharp/dist/index.mjs";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { inspectOwnerSource } from "../apps/renderer/local/media.ts";
import {
  prepareOwnerClipPreview,
  type OwnerCutCache,
} from "../apps/renderer/local/clip-preview.ts";
import { followPreparedCamera } from "../apps/renderer/local/automatic-camera-follow.ts";
import {
  defaultOwnerFocus,
  ownerFocusCrop,
  ownerSourceContent,
} from "../packages/contracts/local/focus.ts";
import { ownerCameraFollowCrop } from "../packages/contracts/local/camera-follow.ts";
import {
  ownerMediaJobSchema,
  ownerMediaResultSchema,
} from "../packages/contracts/local/index.ts";

it("automatically follows only escaping selected speakers from prepared native pixels, with cache/cancel and bounded cleanup", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-auto-follow-"));
  const metrics: Record<string, unknown> = {};
  try {
    const tools = await ownerNativeTools(resolve("."));
    const texture = join(root, "head.png"),
      pixels = Buffer.alloc(72 * 96 * 3);
    let random = 1234567;
    for (let i = 0; i < pixels.length; i++) {
      random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
      pixels[i] = 50 + ((random >>> 24) % 180);
    }
    await sharp(pixels, { raw: { width: 72, height: 96, channels: 3 } })
      .png()
      .toFile(texture);
    for (const kind of [
      "moving",
      "jitter",
      "layout",
      "lost",
      "cut",
      "long",
    ] as const) {
      const workspaceId = randomUUID(),
        clipId = randomUUID(),
        directory = join(root, workspaceId);
      await mkdir(directory);
      const source = join(directory, "source.mp4");
      const duration = kind === "long" ? 72 : 3,
        frames = duration * 30;
      const x =
        kind === "long"
          ? "70+80*clip((t-65)/0.3,0,1)"
          : kind === "layout"
            ? "170-24*gte(t,1)"
            : kind === "jitter"
              ? "70+1.5*sin(20*t)"
              : "70+30*t";
      const started = performance.now();
      await runOwnedProcess(
        tools.ffmpeg,
        [
          "-nostdin",
          "-v",
          "error",
          "-f",
          "lavfi",
          "-i",
          `color=c=0x202020:s=480x270:r=30:d=${duration}`,
          "-loop",
          "1",
          "-framerate",
          "30",
          "-i",
          texture,
          "-f",
          "lavfi",
          "-i",
          "anullsrc=r=48000:cl=stereo",
          "-filter_complex",
          `[1:v]split[a][b];[0:v][a]overlay=x='${x}':y=70:shortest=1[first];[first][b]overlay=x=350:y=70:shortest=1${kind === "lost" ? ",drawbox=x=0:y=0:w=iw:h=ih:color=0x202020:t=fill:enable='gte(t,1.5)'" : ""}[v]`,
          "-map",
          "[v]",
          "-map",
          "2:a",
          "-c:a",
          "aac",
          "-t",
          String(duration),
          "-c:v",
          "libx264",
          "-preset",
          "ultrafast",
          "-pix_fmt",
          "yuv420p",
          "-threads",
          "2",
          source,
        ],
        AbortSignal.timeout(60000),
      );
      const metadata = await inspectOwnerSource(
        source,
        tools,
        AbortSignal.timeout(10000),
      );
      const focus = defaultOwnerFocus({ width: 480, height: 270 }, frames);
      const left = kind === "layout" ? 170 : 70;
      focus.people = [
        {
          id: "person_1",
          observations: [
            {
              startFrame: 0,
              endFrame: frames,
              box: {
                x: left / 480,
                y: 70 / 270,
                width: 72 / 480,
                height: 96 / 270,
              },
            },
          ],
        },
        {
          id: "person_2",
          observations: [
            {
              startFrame: 0,
              endFrame: frames,
              box: {
                x: 350 / 480,
                y: 70 / 270,
                width: 72 / 480,
                height: 96 / 270,
              },
            },
          ],
        },
      ];
      focus.shots = [
        {
          ...focus.shots[0]!,
          personId: "person_1",
          centerX: (left + 36) / 480,
          zoom: kind === "layout" ? 2 : 1,
        },
      ];
      if (kind === "cut")
        focus.shots = [
          { ...focus.shots[0]!, endFrame: 45, zoom: 2 },
          {
            ...focus.shots[0]!,
            startFrame: 45,
            personId: "person_2",
            centerX: 386 / 480,
          },
        ];
      const job = ownerMediaJobSchema.parse({
        operation: "clip-preview",
        workspaceId,
        clipId,
        jobId: randomUUID(),
        fingerprint: metadata.fingerprint,
        cut: { startFrame: 0, endFrame: frames },
        followFocus: focus,
      });
      if (job.operation !== "clip-preview") throw Error("invalid_proof_job");
      const cache: OwnerCutCache = new Map();
      const prepare = performance.now();
      const result = ownerMediaResultSchema.parse(
        await prepareOwnerClipPreview(
          { root, tools, cache },
          job,
          AbortSignal.timeout(60000),
        ),
      );
      if (result.operation !== "clip-preview")
        throw Error("invalid_proof_result");
      const elapsed = performance.now() - prepare,
        tracks = result.cameraTracks ?? [];
      if (kind === "jitter" || kind === "lost") expect(tracks).toEqual([]);
      else {
        expect(tracks, kind).toHaveLength(kind === "long" ? 3 : 1);
        expect(tracks[0]!.personId).toBe("person_1");
        expect(tracks[0]!.followWindow).toBe(30);
        expect(tracks.at(-1)!.endFrame).toBe(kind === "cut" ? 45 : frames);
        if (kind === "layout")
          expect(tracks[0]!.points.at(-1)!.x).toBeLessThan(0.39);
        else expect(tracks.at(-1)!.points.at(-1)!.x).toBeGreaterThan(0.3);
        if (kind === "cut")
          expect(ownerCameraFollowCrop(focus, tracks, 45, "body", 45)).toEqual(
            ownerFocusCrop(focus, focus.shots[1]!),
          );
        if (kind === "moving") {
          const content = ownerSourceContent(focus.source),
            last = ownerCameraFollowCrop(focus, tracks, 89, "body", 89);
          expect(
            (last.x + last.width - content.x) / content.width,
          ).toBeGreaterThan((70 + 30 * (89 / 30) + 72) / 480 - 0.015);
        }
      }
      const cachedAt = performance.now();
      const reused = await prepareOwnerClipPreview(
        { root, tools, cache },
        { ...job, jobId: randomUUID() },
        AbortSignal.timeout(10000),
      );
      expect(reused).toEqual(result);
      expect(
        (await readdir(directory)).some((name) =>
          name.startsWith("camera-follow-"),
        ),
      ).toBe(false);
      metrics[kind] = {
        preparationMs: Math.round(elapsed),
        cacheMs: Math.round(performance.now() - cachedAt),
        totalMs: Math.round(performance.now() - started),
        tracks: tracks.length,
        samples: tracks.reduce((n, t) => n + t.points.length, 0),
      };
      if (kind === "moving") {
        const controller = new AbortController(),
          timer = setTimeout(() => controller.abort(), 5);
        try {
          await expect(
            followPreparedCamera(
              join(directory, `${clipId}.source.mp4`),
              focus,
              tools,
              controller.signal,
            ),
          ).rejects.toThrow();
        } finally {
          clearTimeout(timer);
        }
        expect(
          (await readdir(directory)).some((name) =>
            name.startsWith("camera-follow-"),
          ),
        ).toBe(false);
      }
    }
    await mkdir(resolve(".local-build/evidence"), { recursive: true });
    await writeFile(
      resolve(".local-build/evidence/cl216-native-follow.json"),
      JSON.stringify(metrics, null, 2),
    );
    expect(
      await readFile(
        resolve(".local-build/evidence/cl216-native-follow.json"),
        "utf8",
      ),
    ).toContain("moving");
  } finally {
    await clearAutomaticFollowScratch(root);
  }
}, 120000);

async function clearAutomaticFollowScratch(root: string) {
  const actual = await realpath(root),
    rel = relative(await realpath(tmpdir()), actual);
  if (
    !rel ||
    isAbsolute(rel) ||
    rel.startsWith("..") ||
    !rel.startsWith("clipbuilder-auto-follow-")
  )
    throw Error("invalid_proof_cleanup");
  await rm(actual, { recursive: true, force: true });
}
