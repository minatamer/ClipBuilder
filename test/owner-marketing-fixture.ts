import { createServer } from "node:http";
import { randomUUID, createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, relative, isAbsolute } from "node:path";
import sharp from "../apps/backend/node_modules/sharp/dist/index.mjs";
import { marketingConversationMarkup } from "../apps/frontend/feasibility/marketing-conversation-art.ts";
import { startHookEditorFixture } from "./owner-hook-browser-fixture.ts";
import { listenOwner } from "./owner-http.ts";
import { ownerNativeTools } from "../scripts/native-tools.ts";
import { runOwnedProcess } from "../apps/renderer/src/media/process-runner.ts";
import { OWNER_CAPTION_PRESETS } from "../packages/contracts/local/editor.ts";

/** Authoring-only transport: actual frontend, original artwork, no normal session. */
export async function startMarketingFixtures() {
  const scratch = await mkdtemp(join(tmpdir(), "clipbuilder-marketing-"));
  const owned = relative(await realpath(tmpdir()), await realpath(scratch));
  if (
    isAbsolute(owned) ||
    owned.startsWith("..") ||
    !owned.startsWith("clipbuilder-marketing-")
  )
    throw Error("marketing_scratch_scope");
  let editor: Awaited<ReturnType<typeof startHookEditorFixture>> | undefined;
  let moments: typeof editor;
  try {
    const sourceSvg = marketingConversationMarkup();
    const sourceArtwork = await sharp(Buffer.from(sourceSvg)).png().toBuffer();
    const art = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640"><defs><linearGradient id="b" x2="1" y2="1"><stop stop-color="#173763"/><stop offset="1" stop-color="#09172e"/></linearGradient></defs><rect width="960" height="640" rx="36" fill="url(#b)"/><circle cx="810" cy="85" r="220" fill="#547ee5" opacity=".12"/><text x="64" y="95" font-family="Arial" font-size="22" fill="#a6c6f4" letter-spacing="5">THE CREATIVE PROCESS</text><text x="64" y="175" font-family="Arial" font-size="49" font-weight="700" fill="#f2f6ff">One clear idea.</text><path d="M111 460Q280 450 328 350T800 280" fill="none" stroke="#7ca9f5" stroke-width="11" stroke-linecap="round"/><g fill="#92bdff"><circle cx="111" cy="460" r="16"/><circle cx="330" cy="350" r="16"/><circle cx="550" cy="290" r="16"/><circle cx="800" cy="280" r="16"/></g><g font-family="Arial" font-size="24" fill="#c0d4f0"><text x="70" y="535">Discover</text><text x="285" y="435">Shape</text><text x="503" y="380">Refine</text><text x="748" y="365">Share</text></g></svg>`;
    const pictureArtwork = await sharp(Buffer.from(art)).png().toBuffer();
    const input = join(scratch, "broll.png"),
      output = join(scratch, "broll.mp4");
    await writeFile(input, pictureArtwork);
    const tools = await ownerNativeTools(resolve("."));
    await runOwnedProcess(
      tools.ffmpeg,
      [
        "-nostdin",
        "-v",
        "error",
        "-loop",
        "1",
        "-framerate",
        "30",
        "-i",
        input,
        "-t",
        "4",
        "-vf",
        "scale=1056:704,crop=960:640:x='48+24*sin(t)':y=32",
        "-an",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-threads",
        "2",
        "-pix_fmt",
        "yuv420p",
        output,
      ],
      AbortSignal.timeout(30000),
    );
    const videoSource = await readFile(output),
      videoId = randomUUID();
    editor = await startHookEditorFixture(undefined, {
      hostedWorkflow: true,
      workflowScreens: true,
      silentMedia: true,
      sourceArtwork,
      pictureArtwork,
      pictureSize: { width: 960, height: 640 },
      videoSource,
      configure(clip) {
        clip.displayName = "A clear idea";
        clip.outputs = [];
        clip.preview = { frames: 120, bytes: 1000 };
        delete clip.edit!.hook;
        delete clip.edit!.hookContent;
        const words = ["Great", "ideas", "deserve", "context."];
        clip.base!.words.forEach((word, i) => {
          word.text = words[i]!;
          word.punctuatedText = words[i]!;
        });
        clip.base!.overlay.captions.forEach((caption, i) => {
          caption.text = words[i]!;
          caption.lines = [words[i]!];
          caption.wordCues[0]!.text = words[i]!;
        });
        clip.edit!.captions = {
          ...structuredClone(OWNER_CAPTION_PRESETS.tiktok),
          fontSize: 82,
          box: { x: 0.075, y: 0.52, width: 0.85, height: 0.12 },
        };
        clip.edit!.texts = [
          {
            ...clip.edit!.texts![0]!,
            text: "Make your next cut count",
            style: {
              ...clip.edit!.texts![0]!.style,
              fontSize: 68,
              box: { x: 0.075, y: 0.08, width: 0.85, height: 0.12 },
            },
          },
        ];
        clip.edit!.audio = { originalVolume: 100, cues: [] };
        clip.edit!.visuals = [
          {
            ...clip.edit!.visuals[0]!,
            startFrame: 0,
            endFrame: 120,
            box: { x: 0.08, y: 0.69, width: 0.5, height: 0.19 },
            effect: {
              startFrame: 0,
              endFrame: 120,
              zoom: 1.18,
              fromX: 0.4,
              fromY: 0.5,
              toX: 0.6,
              toY: 0.5,
            },
          },
          {
            id: randomUUID(),
            assetId: videoId,
            startFrame: 0,
            endFrame: 120,
            box: { x: 0.45, y: 0.76, width: 0.47, height: 0.18 },
            fit: "cover",
            video: {
              offsetFrame: 0,
              sourceEndFrame: 120,
              muted: true,
              volume: 0,
            },
            effect: {
              startFrame: 0,
              endFrame: 120,
              zoom: 1.3,
              fromX: 0.3,
              fromY: 0.5,
              toX: 0.7,
              toY: 0.5,
            },
          },
        ];
        clip.videoAssets = [
          {
            id: videoId,
            digest: createHash("sha256").update(videoSource).digest("hex"),
            bytes: videoSource.length,
            width: 960,
            height: 640,
            frames: 120,
            hasAudio: false,
          },
        ];
      },
    });
    moments = await startHookEditorFixture(undefined, {
      hostedWorkflow: true,
      workflowScreens: true,
      momentsLayout: true,
      manyMomentCount: 3,
      durationFrames: 1800,
      silentMedia: true,
      sourceArtwork,
      pictureArtwork,
    });
    const currentEditor = editor,
      currentMoments = moments;
    let closing: Promise<void> | undefined;
    const close = () => {
      closing ??= (async () => {
        await currentMoments.close();
        await currentEditor.close();
        await rm(scratch, { recursive: true, force: true });
        control.closeAllConnections();
        await new Promise<void>((done) => control.close(() => done()));
      })();
      return closing;
    };
    const control = createServer((req, res) => {
      res.setHeader("Content-Type", "application/json");
      if (req.url === "/counts") {
        res.end(
          JSON.stringify({
            editor: currentEditor.counts(),
            moments: currentMoments.counts(),
            calls: currentEditor.clip.calls,
            analysis: currentMoments.momentCounts(),
          }),
        );
        return;
      }
      if (req.url === "/close") {
        res.end("{}");
        setTimeout(() => {
          void close();
        }, 50);
        return;
      }
      res.writeHead(404).end();
    });
    return {
      editor: editor.url,
      moments: moments.url,
      control: `http://localhost:${await listenOwner(control)}`,
      close,
    };
  } catch (error) {
    await moments?.close();
    await editor?.close();
    await rm(scratch, { recursive: true, force: true });
    throw error;
  }
}
