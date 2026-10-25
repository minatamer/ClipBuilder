import { expect, it } from "vitest";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  realpath,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, relative, isAbsolute } from "node:path";
import { randomUUID } from "node:crypto";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { prepareLocalOverlayFixture } from "./owner-controls-browser.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { renderOwnerClip } from "../apps/renderer/local/clip-render.ts";
import { inspectOwnerSource } from "../apps/renderer/local/media.ts";
import {
  defaultOwnerFocus,
  ownerFocusSchema,
} from "../packages/contracts/local/focus.ts";
import {
  captureFocusBoundary,
  editFocusPosition,
  addFocusPosition,
} from "../apps/frontend/src/features/local-editing/focus-positions.ts";

async function clearScratch(root: string) {
  const actual = await realpath(root),
    parent = await realpath(tmpdir()),
    rel = relative(parent, actual);
  if (!rel || rel.startsWith("..") || isAbsolute(rel))
    throw new Error("invalid_proof_cleanup");
  await rm(actual, { recursive: true, force: true });
}
it("exports actual focus hard cuts and zoom without black padding, keeping cached cuts and original audio clocks", async () => {
  const root = await mkdtemp(join(tmpdir(), "clipbuilder-focus-native-")),
    workspaceId = randomUUID(),
    clipId = randomUUID();
  const directory = join(root, workspaceId);
  await mkdir(directory);
  const tools = await ownerNativeTools(resolve(".")),
    signal = AbortSignal.timeout(180_000),
    source = join(directory, "source.mp4");
  try {
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-f",
        "lavfi",
        "-i",
        "color=c=red:s=1280x720:r=30:d=2,drawbox=x=640:y=0:w=640:h=720:color=blue:t=fill,drawbox=x=720:y=0:w=80:h=720:color=yellow:t=fill",
        "-f",
        "lavfi",
        "-i",
        "anullsrc=r=48000:cl=stereo",
        "-t",
        "2",
        "-c:v",
        "libx264",
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
    const original = await readFile(source),
      metadata = await inspectOwnerSource(source, tools, signal);
    let focus = defaultOwnerFocus(metadata, 60);
    focus.shots = [
      { ...focus.shots[0]!, startFrame: 0, endFrame: 30, centerX: 0.25 },
      { ...focus.shots[0]!, startFrame: 30, endFrame: 45, centerX: 0.75 },
    ];
    focus.shots[1]!.endFrame = 60;
    focus.people = [
      {
        id: "person_1",
        observations: [
          {
            startFrame: 0,
            endFrame: 60,
            box: { x: 0.1, y: 0.1, width: 0.3, height: 0.7 },
          },
        ],
      },
    ];
    focus.people.push({
      id: "person_2",
      observations: [
        {
          startFrame: 0,
          endFrame: 60,
          box: { x: 0.65, y: 0.1, width: 0.2, height: 0.5 },
        },
      ],
    });
    for (const shot of focus.shots) shot.personId = "person_1";
    const added = addFocusPosition(focus, 1, "person_2", 45)!;
    expect(added.index).toBe(2);
    expect(added.focus.shots[2]!.personId).toBe("person_2");
    focus = added.focus;
    focus = captureFocusBoundary(focus, 1, "startFrame", 29)!;
    focus = captureFocusBoundary(focus, 1, "endFrame", 43)!;
    focus = editFocusPosition(focus, 2, { zoom: 2 });
    ownerFocusSchema.parse(focus);
    const options = {
      root,
      tools,
      chromium: "C:/Program Files/Google/Chrome/Application/chrome.exe",
      bundle: await prepareLocalOverlayFixture(root),
      cache: new Map(),
    };
    const job = {
      operation: "clip" as const,
      workspaceId,
      clipId,
      jobId: randomUUID(),
      renderRevision: 0,
      cut: { startFrame: 0, endFrame: 60 },
      fingerprint: metadata.fingerprint,
      overlay: {
        version: 1 as const,
        frames: 60,
        captions: [],
        visuals: [],
        focus,
      },
    };
    const result = await renderOwnerClip(options, job, signal);
    expect(result).toMatchObject({ frames: 60, durationMs: 2000 });
    const output = join(directory, `${clipId}.r0.mp4`),
      pixels = join(root, "samples.rgb");
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-i",
        output,
        "-vf",
        "select='eq(n,0)+eq(n,28)+eq(n,29)+eq(n,43)+eq(n,44)+eq(n,59)',format=rgb24,scale=8:8:flags=neighbor",
        "-fps_mode",
        "passthrough",
        "-f",
        "rawvideo",
        pixels,
      ],
      signal,
    );
    const samples = await readFile(pixels);
    expect(samples.length).toBe(6 * 8 * 8 * 3);
    const color = (sample: number, x: number, y: number) => [
      ...samples.subarray(
        sample * 192 + (y * 8 + x) * 3,
        sample * 192 + (y * 8 + x) * 3 + 3,
      ),
    ];
    for (const sample of [0, 1]) {
      const [r, g, b] = color(sample, 4, 4);
      expect(r).toBeGreaterThan(220);
      expect(g).toBeLessThan(30);
      expect(b).toBeLessThan(30);
    }
    for (const sample of [2, 3]) {
      const [r, g, b] = color(sample, 0, 4);
      expect(r).toBeGreaterThan(160);
      expect(g).toBeGreaterThan(160);
      expect(b).toBeLessThan(100);
    }
    for (const sample of [4, 5]) {
      const [r, g, b] = color(sample, 0, 4);
      expect(r).toBeLessThan(40);
      expect(g).toBeLessThan(40);
      expect(b).toBeGreaterThan(200);
    }
    for (let sample = 0; sample < 6; sample++)
      for (const y of [0, 7])
        for (const x of [0, 7])
          expect(Math.max(...color(sample, x, y))).toBeGreaterThan(180);
    const cached = await readFile(join(directory, `${clipId}.source.mp4`));
    await renderOwnerClip(
      options,
      {
        ...job,
        jobId: randomUUID(),
        renderRevision: 1,
        overlay: {
          ...job.overlay,
          focus: {
            ...focus,
            shots: [
              {
                ...focus.shots[0]!,
                endFrame: 60,
                centerX: 0.75,
                zoom: 1.5,
                reason: "manual",
              },
            ],
          },
        },
      },
      signal,
    );
    expect(await readFile(source)).toEqual(original);
    expect(await readFile(join(directory, `${clipId}.source.mp4`))).toEqual(
      cached,
    );
    expect(
      (await readdir(directory)).some(
        (name) => name.startsWith("overlay-") || name.endsWith(".partial.mp4"),
      ),
    ).toBe(false);
    await expect(
      renderOwnerClip(
        options,
        { ...job, renderRevision: 2 },
        AbortSignal.abort(),
      ),
    ).rejects.toThrow();
    expect(
      (await readdir(directory)).some((name) => name.endsWith(".partial.mp4")),
    ).toBe(false);
  } finally {
    await clearScratch(root);
  }
}, 190_000);
