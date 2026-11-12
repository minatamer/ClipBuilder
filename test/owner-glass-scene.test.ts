import { expect, it, vi } from "vitest";
import { mkdtemp, mkdir, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, relative, isAbsolute } from "node:path";
import { randomUUID, createHash } from "node:crypto";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { inspectOwnerSource } from "../apps/renderer/local/media.ts";
import { ownerOutputProfile } from "../apps/renderer/local/export-profile.ts";
import { OWNER_CAPTION_PRESETS } from "../packages/contracts/local/editor.ts";
import {
  preparedSceneLogicalFrame,
  preparedOverlaySceneSchema,
} from "../apps/renderer/local/prepared-overlay-scene.ts";
import { rasterizeOwnerOverlay } from "../apps/renderer/local/rasterize-overlay.ts";
import { renderOwnerClip } from "../apps/renderer/local/clip-render.ts";
import { needsRefractiveScene } from "../apps/renderer/local/refractive-scene.ts";

// Only browser capture is injected. The prepared scene, mux, audio, profile,
// frame validation, input ownership and scratch cleanup all run real FFmpeg.
vi.mock("../apps/renderer/local/rasterize-overlay.ts", () => ({
  rasterizeOwnerOverlay: vi.fn(),
}));
it.each([24, 60, 30000 / 1001])(
  "retains native %s cadence and independent Hook/body clocks through the scene-backed mux",
  async (fps) => {
    const root = await mkdtemp(join(tmpdir(), "clipbuilder-glass-scene-"));
    const scope = relative(tmpdir(), root);
    if (
      isAbsolute(scope) ||
      scope.startsWith("..") ||
      !scope.startsWith("clipbuilder-glass-scene-")
    )
      throw Error("cleanup_scope");
    const signal = AbortSignal.timeout(60000),
      tools = await ownerNativeTools(resolve("."));
    const run = (args: string[]) =>
      runOwnedProcess(
        tools.ffmpeg,
        ["-nostdin", "-v", "error", "-threads", "2", ...args],
        signal,
      );
    try {
      const workspaceId = randomUUID(),
        clipId = randomUUID(),
        directory = join(root, workspaceId);
      await mkdir(directory);
      const source = join(directory, "source.mp4");
      await run([
        "-f",
        "lavfi",
        "-i",
        `testsrc2=s=320x180:r=${fps}:d=2`,
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
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        source,
      ]);
      const original = createHash("sha256")
        .update(await readFile(source))
        .digest("hex");
      const metadata = await inspectOwnerSource(source, tools, signal),
        profile = ownerOutputProfile(metadata, 60),
        hook = ownerOutputProfile(metadata, 2);
      const calls: { frames: number; startFrame: number; fps: number }[] = [];
      vi.mocked(rasterizeOwnerOverlay).mockImplementation(async (options) => {
        if (!options.scene) throw Error("missing_prepared_scene");
        const scene = options.scene;
        calls.push(scene);
        expect(options.clock?.hook ? scene.startFrame : scene.frames).toBe(
          options.clock?.hook ? 0 : profile.frames,
        );
        // Extract the exact prepared native samples, without starting any browser.
        await run([
          "-i",
          scene.file,
          "-vf",
          `trim=start_frame=${scene.startFrame}:end_frame=${scene.startFrame + scene.frames},setpts=PTS-STARTPTS`,
          "-frames:v",
          String(scene.frames),
          "-q:v",
          "2",
          "-start_number",
          "0",
          join(options.frames, "%06d.jpg"),
        ]);
      });
      await renderOwnerClip(
        {
          root,
          tools,
          bundle: "unused-injected",
          chromium: "must-not-open",
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
            captionStyle: OWNER_CAPTION_PRESETS.glass,
            hook: { startFrame: 6, endFrame: 8 },
          },
        },
        signal,
      );
      expect(
        calls.map((c) => ({ frames: c.frames, startFrame: c.startFrame })),
      ).toEqual([
        { frames: profile.frames, startFrame: hook.frames },
        { frames: hook.frames, startFrame: 0 },
      ]);
      expect(calls.every((c) => Math.abs(c.fps - metadata.fps) < 0.0001)).toBe(
        true,
      );
      expect(preparedSceneLogicalFrame(1, calls[0]!)).toBeCloseTo(
        30 / metadata.fps,
        8,
      );
      const output = join(directory, `${clipId}.r0.mp4`);
      expect((await readFile(output)).length).toBeGreaterThan(1000);
      expect(
        (await readdir(directory)).some((name) => name.startsWith("overlay-")),
      ).toBe(false);
      expect(
        createHash("sha256")
          .update(await readFile(source))
          .digest("hex"),
      ).toBe(original);
    } finally {
      vi.mocked(rasterizeOwnerOverlay).mockReset();
      await rm(root, { recursive: true, force: true });
    }
  },
  60000,
);
it("bounds physical sampling and admits only the private fixed scene route", () => {
  const overlay = {
    version: 1 as const,
    frames: 30,
    captions: [],
    visuals: [],
  };
  for (const glassOpacity of [0, 1])
    expect(
      needsRefractiveScene({
        ...overlay,
        captionStyle: { ...OWNER_CAPTION_PRESETS.glass, glassOpacity },
      }),
    ).toBe(false);
  expect(
    needsRefractiveScene({
      ...overlay,
      captionStyle: OWNER_CAPTION_PRESETS.glass,
    }),
  ).toBe(true);
  expect(() =>
    preparedSceneLogicalFrame(0.5, { fps: 60, frames: 10 }),
  ).toThrow();
  expect(() =>
    preparedSceneLogicalFrame(10, { fps: 60, frames: 10 }),
  ).toThrow();
  expect(
    preparedOverlaySceneSchema.safeParse({
      src: "https://example.com/scene.mp4",
      fps: 30,
      frames: 30,
      startFrame: 0,
    }).success,
  ).toBe(false);
  expect(
    preparedOverlaySceneSchema.safeParse({
      src: "http://127.0.0.1:4200/scene.mp4",
      fps: 61,
      frames: 30,
      startFrame: 0,
    }).success,
  ).toBe(false);
});
