import { expect, it } from "vitest";
import { mkdtemp, readFile, writeFile, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, relative, isAbsolute } from "node:path";
import { randomUUID, createHash } from "node:crypto";
import sharp from "../apps/backend/node_modules/sharp/dist/index.mjs";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { inspectOwnerSource } from "../apps/renderer/local/media.ts";
import { ownerOutputProfile } from "../apps/renderer/local/export-profile.ts";
import { createOwnerWorker } from "../apps/renderer/local/server.ts";
import { localWorkerPort } from "../apps/backend/local/worker-port.ts";
import { WorkspaceFiles } from "../apps/backend/local/workspace-files.ts";
import { defaultOwnerFocus } from "../packages/contracts/local/focus.ts";
import type { OwnerOverlay } from "../packages/contracts/local/clips.ts";
import { prepareLocalOverlayFixture } from "./owner-controls-browser.ts";
import { listenOwner } from "./owner-http.ts";

it.each([24, 30000 / 1001, 30, 60])(
  "exports half-open Hook/body filters and untouched graphics/audio through worker HTTP at %s fps",
  async (fps) => {
    const root = await mkdtemp(join(tmpdir(), "clipbuilder-timed-filters-"));
    const files = new WorkspaceFiles(root),
      tools = await ownerNativeTools(resolve(".")),
      signal = AbortSignal.timeout(90000);
    const worker = createOwnerWorker({
      root,
      token: "synthetic-filter-ranges",
      tools,
      chromium: "C:/Program Files/Google/Chrome/Application/chrome.exe",
      overlayBundle: await prepareLocalOverlayFixture(root),
    });
    try {
      const workspaceId = await files.create(),
        source = await files.file(workspaceId, "source.mp4"),
        clipId = randomUUID(),
        assetId = randomUUID();
      await runOwnedProcess(
        tools.ffmpeg,
        [
          "-nostdin",
          "-y",
          "-v",
          "error",
          "-f",
          "lavfi",
          "-i",
          `color=c=0x965028:s=180x320:r=${fps}:d=6`,
          "-f",
          "lavfi",
          "-i",
          "sine=frequency=440:sample_rate=48000:duration=6",
          "-t",
          "6",
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
          source,
        ],
        signal,
      );
      const metadata = await inspectOwnerSource(source, tools, signal);
      const picture = await sharp({
        create: { width: 100, height: 100, channels: 3, background: "#00ff00" },
      })
        .png()
        .toBuffer();
      await writeFile(await files.asset(workspaceId, assetId, "png"), picture);
      const content = {
        version: 1 as const,
        frames: 120,
        captions: [],
        focus: defaultOwnerFocus(metadata, 120),
        visuals: [
          {
            id: randomUUID(),
            assetId,
            digest: createHash("sha256").update(picture).digest("hex"),
            origin: "synthetic" as const,
            format: "png" as const,
            startFrame: 0,
            endFrame: 120,
            box: { x: 0.1, y: 0.65, width: 0.3, height: 0.2 },
            fit: "contain" as const,
          },
        ],
      };
      const overlay: OwnerOverlay = {
        ...content,
        hook: { startFrame: 31, endFrame: 92 },
        videoLook: { preset: "warm", strength: 100 },
        videoLooks: [
          { startFrame: 0, endFrame: 30, preset: "original", strength: 100 },
          { startFrame: 30, endFrame: 60, preset: "mono", strength: 100 },
          { startFrame: 60, endFrame: 90, preset: "original", strength: 100 },
        ],
        hookContent: {
          ...content,
          hook: { startFrame: 31, endFrame: 92 },
          videoLooks: [
            { startFrame: 31, endFrame: 61, preset: "mono", strength: 100 },
            { startFrame: 61, endFrame: 77, preset: "original", strength: 100 },
            { startFrame: 77, endFrame: 92, preset: "mono", strength: 100 },
          ],
        },
      };
      const rpc = localWorkerPort(
        await listenOwner(worker.server),
        "synthetic-filter-ranges",
      );
      const reply = await rpc(
        {
          operation: "clip",
          workspaceId,
          clipId,
          jobId: randomUUID(),
          renderRevision: 0,
          cut: { startFrame: 0, endFrame: 120 },
          fingerprint: metadata.fingerprint,
          overlay,
        },
        signal,
      );
      expect(reply.operation).toBe("clip");
      const output = await files.output(workspaceId, clipId, 0),
        body = ownerOutputProfile(metadata, 120),
        hook = ownerOutputProfile(metadata, 61);
      const hookStart = Math.floor((31 * fps) / 30),
        atHook = (logical: number) =>
          Math.ceil((logical * fps) / 30 - 1e-9) - hookStart,
        atBody = (logical: number) =>
          hook.frames + Math.ceil((logical * fps) / 30 - 1e-9);
      const cases: [number, "mono" | "original" | "warm"][] = [
        [0, "mono"],
        [atHook(61) - 1, "mono"],
        [atHook(61), "original"],
        [atHook(77) - 1, "original"],
        [atHook(77), "mono"],
        [hook.frames - 1, "mono"],
        [hook.frames, "original"],
        [atBody(30) - 1, "original"],
        [atBody(30), "mono"],
        [atBody(60) - 1, "mono"],
        [atBody(60), "original"],
        [atBody(90) - 1, "original"],
        [atBody(90), "warm"],
        [hook.frames + body.frames - 1, "warm"],
      ];
      const raw = join(root, "selected.rgb");
      await runOwnedProcess(
        tools.ffmpeg,
        [
          "-nostdin",
          "-y",
          "-v",
          "error",
          "-i",
          output,
          "-vf",
          `select='${cases.map(([n]) => `eq(n,${n})`).join("+")}'`,
          "-fps_mode",
          "passthrough",
          "-pix_fmt",
          "rgb24",
          "-f",
          "rawvideo",
          raw,
        ],
        signal,
      );
      const pixels = await readFile(raw),
        frameBytes = body.width * body.height * 3;
      expect(pixels.length).toBe(cases.length * frameBytes);
      let originalRed = 0;
      cases.forEach(([, look], index) => {
        const pixel = (x: number, y: number) => {
          const start =
            index * frameBytes +
            (Math.floor(y * body.height) * body.width +
              Math.floor(x * body.width)) *
              3;
          return [...pixels.subarray(start, start + 3)];
        };
        const rgb = pixel(0.5, 0.4),
          graphic = pixel(0.25, 0.75);
        expect(graphic[1]).toBeGreaterThan(180);
        expect(Math.max(graphic[0]!, graphic[2]!)).toBeLessThan(70);
        if (look === "mono")
          expect(Math.max(...rgb) - Math.min(...rgb)).toBeLessThan(12);
        else {
          expect(rgb[0]! - rgb[2]!).toBeGreaterThan(80);
          if (look === "original") originalRed = rgb[0]!;
          else expect(rgb[0]! - originalRed).toBeGreaterThan(4);
        }
      });
      const probe = JSON.parse(
        await runOwnedProcess(
          tools.ffprobe,
          [
            "-v",
            "error",
            "-show_entries",
            "stream=codec_type,duration,nb_frames",
            "-of",
            "json",
            output,
          ],
          signal,
        ),
      ).streams as {
        codec_type: string;
        duration: string;
        nb_frames: string;
      }[];
      expect(
        Number(probe.find((s) => s.codec_type === "video")!.nb_frames),
      ).toBe(hook.frames + body.frames);
      expect(
        Math.abs(
          Number(probe.find((s) => s.codec_type === "audio")!.duration) -
            (hook.frames + body.frames) / fps,
        ),
      ).toBeLessThan(0.08);
      const audio = join(root, "tone.pcm");
      await runOwnedProcess(
        tools.ffmpeg,
        [
          "-nostdin",
          "-y",
          "-v",
          "error",
          "-i",
          output,
          "-vn",
          "-ac",
          "1",
          "-ar",
          "8000",
          "-f",
          "s16le",
          audio,
        ],
        signal,
      );
      const pcm = await readFile(audio);
      let peak = 0;
      for (let n = 0; n < pcm.length; n += 2)
        peak = Math.max(peak, Math.abs(pcm.readInt16LE(n)));
      expect(peak).toBeGreaterThan(1000);
    } finally {
      await worker.close();
      await files.close();
      await clearFilterScratch(root);
    }
  },
  100000,
);

async function clearFilterScratch(root: string) {
  const rel = relative(await realpath(tmpdir()), await realpath(root));
  if (
    !rel ||
    isAbsolute(rel) ||
    rel.startsWith("..") ||
    !rel.startsWith("clipbuilder-timed-filters-")
  )
    throw Error("invalid_filter_cleanup");
  await rm(root, { recursive: true, force: true });
}
