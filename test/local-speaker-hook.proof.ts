import { expect, it } from "vitest";
import { randomUUID, createHash } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import sharp from "../apps/backend/node_modules/sharp/dist/index.mjs";
import { tmpdir } from "node:os";
import { join, resolve, relative, isAbsolute } from "node:path";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { inspectOwnerSource } from "../apps/renderer/local/media.ts";
import { renderOwnerClip } from "../apps/renderer/local/clip-render.ts";
import { prepareLocalOverlayFixture } from "./owner-controls-browser.ts";
import { OWNER_CAPTION_PRESETS } from "../packages/contracts/local/editor.ts";
import { ownerOverlayFrame } from "../packages/composition/local/overlay-frame.ts";
import type { OwnerOverlay } from "../packages/contracts/local/clips.ts";
import { ownerPresentationFrames } from "../packages/contracts/local/hook.ts";
import { defaultOwnerFocus } from "../packages/contracts/local/focus.ts";
import { OWNER_SOCIAL_TEXT_PRESETS } from "../packages/contracts/local/text-style.ts";

async function clearScratch(root: string) {
  const actual = await realpath(root),
    rel = relative(await realpath(tmpdir()), actual);
  if (
    !rel ||
    rel.startsWith("..") ||
    isAbsolute(rel) ||
    !rel.startsWith("clipbuilder-speaker-hook-proof-")
  )
    throw new Error("invalid_proof_cleanup");
  await rm(actual, { recursive: true, force: true });
}

it("renders speaker turns and manual colors into a real native MP4 using current shared composition", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-speaker-hook-proof-"));
  const signal = AbortSignal.timeout(90_000),
    tools = await ownerNativeTools(resolve("."));
  const run = (args: string[]) =>
    runOwnedProcess(
      tools.ffmpeg,
      ["-nostdin", "-y", "-v", "error", ...args],
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
      "color=black:s=240x320:r=30:d=2",
      "-f",
      "lavfi",
      "-i",
      "sine=frequency=440:sample_rate=48000:duration=2",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      source,
    ]);
    const metadata = await inspectOwnerSource(source, tools, signal);
    const overlay: OwnerOverlay = {
      version: 1,
      frames: 60,
      visuals: [],
      captionStyle: {
        ...OWNER_CAPTION_PRESETS.clean,
        fontSize: 100,
        box: { x: 0.05, y: 0.3, width: 0.9, height: 0.3 },
      },
      captions: [
        {
          startMs: 0,
          endMs: 2000,
          text: "RED BLUE",
          lines: ["RED BLUE"],
          wordIds: ["w_000001", "w_000002"],
          wordCues: [
            { wordId: "w_000001", text: "RED", startMs: 0, endMs: 1000 },
            { wordId: "w_000002", text: "BLUE", startMs: 1000, endMs: 2000 },
          ],
        },
      ],
      captionSpeakers: {
        enabled: true,
        assignments: [
          { wordId: "w_000001", speakerId: "spk_0" },
          { wordId: "w_000002", speakerId: "spk_1" },
        ],
        colors: [
          {
            speakerId: "spk_0",
            color: "#ff0000",
            backgroundColor: "#ff0000",
            highlight: "#ff0000",
          },
          {
            speakerId: "spk_1",
            color: "#0000ff",
            backgroundColor: "#0000ff",
            highlight: "#0000ff",
          },
        ],
      },
    };
    expect(ownerOverlayFrame(overlay, 10).key).not.toBe(
      ownerOverlayFrame(overlay, 40).key,
    );
    const bundle = await prepareLocalOverlayFixture(root);
    const result = await renderOwnerClip(
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
        overlay,
      },
      signal,
    );
    expect(result.frames).toBe(60);
    for (const [time, channel] of [
      [0.5, 0],
      [1.5, 2],
    ] as const) {
      const raw = join(directory, `color-${channel}.rgb`);
      await run([
        "-ss",
        String(time),
        "-i",
        join(directory, `${clipId}.r0.mp4`),
        "-frames:v",
        "1",
        "-pix_fmt",
        "rgb24",
        "-f",
        "rawvideo",
        raw,
      ]);
      const pixels = await readFile(raw);
      let colored = 0;
      for (let i = 0; i < pixels.length; i += 3)
        if (
          pixels[i + channel]! > 100 &&
          pixels[i + channel]! > pixels[i + (channel === 0 ? 2 : 0)]! * 2
        )
          colored++;
      expect(colored).toBeGreaterThan(20);
    }
    overlay.hook = { startFrame: 30, endFrame: 60 };
    const assetId = randomUUID(),
      picture = await sharp({
        create: { width: 16, height: 16, channels: 4, background: "#00ff00" },
      })
        .png()
        .toBuffer();
    await writeFile(join(directory, `${assetId}.png`), picture);
    overlay.visuals = [
      {
        id: randomUUID(),
        assetId,
        digest: createHash("sha256").update(picture).digest("hex"),
        origin: "owner-supplied",
        format: "png",
        fit: "contain",
        startFrame: 30,
        endFrame: 60,
        box: { x: 0.1, y: 0.1, width: 0.3, height: 0.2 },
        entrance: "fade",
        exit: "fade",
        animationFrames: 5,
      },
    ];
    overlay.texts = [
      {
        id: randomUUID(),
        text: "TAG",
        startFrame: 30,
        endFrame: 60,
        style: {
          ...OWNER_SOCIAL_TEXT_PRESETS.tiktok,
          color: "#ffff00",
          box: { x: 0.1, y: 0.7, width: 0.8, height: 0.2 },
        },
      },
    ];
    const hooked = await renderOwnerClip(
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
        renderRevision: 1,
        cut: { startFrame: 0, endFrame: 60 },
        fingerprint: metadata.fingerprint,
        overlay,
      },
      signal,
    );
    expect(hooked.frames).toBe(90);
    for (const [time, channel] of [
      [0.5, 2],
      [1.5, 0],
      [2.5, 2],
    ] as const) {
      const raw = join(directory, `hook-${time}.rgb`);
      await run([
        "-ss",
        String(time),
        "-i",
        join(directory, `${clipId}.r1.mp4`),
        "-frames:v",
        "1",
        "-pix_fmt",
        "rgb24",
        "-f",
        "rawvideo",
        raw,
      ]);
      const pixels = await readFile(raw);
      let colored = 0,
        green = 0,
        yellow = 0;
      for (let i = 0; i < pixels.length; i += 3) {
        if (
          pixels[i + channel]! > 100 &&
          pixels[i + channel]! > pixels[i + (channel === 0 ? 2 : 0)]! * 2
        )
          colored++;
        if (pixels[i + 1]! > 120 && pixels[i]! < 70 && pixels[i + 2]! < 70)
          green++;
        if (pixels[i]! > 120 && pixels[i + 1]! > 120 && pixels[i + 2]! < 70)
          yellow++;
      }
      expect(colored).toBeGreaterThan(20);
      if (time === 1.5) {
        expect(green).toBe(0);
        expect(yellow).toBe(0);
      } else {
        expect(green).toBeGreaterThan(20);
        expect(yellow).toBeGreaterThan(20);
      }
    }
  } finally {
    await clearScratch(root);
  }
}, 100_000);

it("prefixes original video/audio with native cadence, camera/filter edits and intact body, including a one-frame fractional-rate hook", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-speaker-hook-proof-")),
    signal = AbortSignal.timeout(150_000),
    tools = await ownerNativeTools(resolve("."));
  const run = (args: string[]) =>
    runOwnedProcess(
      tools.ffmpeg,
      ["-nostdin", "-y", "-v", "error", ...args],
      signal,
    );
  try {
    const bundle = await prepareLocalOverlayFixture(root);
    for (const sample of [
      { rate: "30", start: 30, end: 60 },
      { rate: "30000/1001", start: 31, end: 32 },
      { rate: "24", start: 15, end: 31 },
      { rate: "12", start: 31, end: 32 },
    ]) {
      const workspaceId = randomUUID(),
        clipId = randomUUID(),
        directory = join(root, workspaceId);
      await mkdir(directory);
      const source = join(directory, "source.mp4");
      await run([
        "-f",
        "lavfi",
        "-i",
        `color=red:s=240x320:r=${sample.rate}:d=2,drawbox=x=0:y=0:w=iw:h=ih:color=blue:t=fill:enable='gte(t,1)'`,
        "-f",
        "lavfi",
        "-i",
        "aevalsrc=if(lt(t\\,1)\\,sin(2*PI*440*t)\\,sin(2*PI*880*t)):s=48000:d=2",
        "-t",
        "2",
        "-c:v",
        "libx264",
        "-crf",
        "12",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        source,
      ]);
      const metadata = await inspectOwnerSource(source, tools, signal),
        focus = defaultOwnerFocus(metadata, 60);
      focus.shots = [
        { ...focus.shots[0]!, endFrame: 30 },
        {
          ...focus.shots[0]!,
          startFrame: 30,
          endFrame: 60,
          centerX: 0.6,
          zoom: 1.2,
        },
      ];
      const overlay: OwnerOverlay = {
        version: 1,
        frames: 60,
        hook: { startFrame: sample.start, endFrame: sample.end },
        captions: [],
        visuals: [],
        focus,
        videoLook: { preset: "warm", strength: 10 },
      };
      const result = await renderOwnerClip(
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
          overlay,
        },
        signal,
      );
      expect(result.frames).toBe(ownerPresentationFrames(overlay));
      const output = join(directory, `${clipId}.r0.mp4`),
        hookSeconds = (sample.end - sample.start) / 30;
      const probe = JSON.parse(
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
      expect(probe.height).toBe(320);
      expect(Number(probe.nb_read_frames)).toBe(
        Math.round((overlay.frames * metadata.fps) / 30) +
          Math.max(
            1,
            Math.round(((sample.end - sample.start) * metadata.fps) / 30),
          ),
      );
      const audio = join(directory, "audio.pcm");
      await run([
        "-i",
        output,
        "-vn",
        "-ac",
        "1",
        "-ar",
        "48000",
        "-f",
        "s16le",
        audio,
      ]);
      const pcm = await readFile(audio);
      for (const [time, blue, freq] of [
        [
          hookSeconds < 0.1 ? 0 : hookSeconds / 2,
          sample.start >= 30,
          sample.start >= 30 ? 880 : 440,
        ],
        [hookSeconds + 0.5, false, 440],
        [hookSeconds + 1.5, true, 880],
      ] as const) {
        const raw = join(directory, `frame-${time}.rgb`);
        await run([
          "-ss",
          String(time),
          "-i",
          output,
          "-frames:v",
          "1",
          "-pix_fmt",
          "rgb24",
          "-f",
          "rawvideo",
          raw,
        ]);
        const pixels = await readFile(raw);
        let red = 0,
          blueSum = 0;
        for (let i = 0; i < pixels.length; i += 3) {
          red += pixels[i]!;
          blueSum += pixels[i + 2]!;
        }
        expect(
          blue ? blueSum : red,
          JSON.stringify({ rate: sample.rate, time, blue, red, blueSum }),
        ).toBeGreaterThan((blue ? red : blueSum) * 2);
        if (hookSeconds < 0.1 && time < hookSeconds) continue;
        const start = Math.round((time - 0.05) * 48000),
          end = start + 4800;
        let crossings = 0;
        for (let i = start + 1; i < end; i++)
          if (pcm.readInt16LE((i - 1) * 2) < 0 && pcm.readInt16LE(i * 2) >= 0)
            crossings++;
        expect(Math.abs(crossings * 10 - freq)).toBeLessThan(35);
      }
    }
  } finally {
    await clearScratch(root);
  }
}, 160_000);
