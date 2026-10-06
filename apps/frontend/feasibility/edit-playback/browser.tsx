import { createRoot } from "react-dom/client";
import { createRef } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { ClipComposition } from "@clipbuilder/composition";
import { Html5Video } from "remotion";
import { compositionManifestV3Schema } from "@clipbuilder/contracts";
import {
  Output,
  Mp4OutputFormat,
  BufferTarget,
  VideoSampleSource,
  AudioSampleSource,
  VideoSample,
  AudioSample,
} from "mediabunny";

const player = createRef<PlayerRef>();
const mode = new URLSearchParams(location.search).get("mode");
const manifest = compositionManifestV3Schema.parse({
  version: 3,
  source: {
    fingerprint: "a".repeat(64),
    width: 320,
    height: 180,
    durationMs: 15000,
  },
  range: { startMs: 0, endMs: 10000 },
  output: { width: 1080, height: 1920, fps: 30 },
  focus: [
    { mode: "wide", reason: "initial", startMs: 0, endMs: 1000 },
    {
      mode: "speaker",
      startMs: 1000,
      endMs: 4000,
      speaker: "spk_0",
      confidence: 0.95,
      box: { x: 0.2, y: 0.2, width: 0.2, height: 0.4 },
    },
    {
      mode: "held",
      reason: "uncertain",
      startMs: 4000,
      endMs: 6000,
      box: { x: 0.2, y: 0.2, width: 0.2, height: 0.4 },
    },
    {
      mode: "speaker",
      startMs: 6000,
      endMs: 10000,
      speaker: "spk_1",
      confidence: 0.95,
      fromBox: { x: 0.2, y: 0.2, width: 0.2, height: 0.4 },
      box: { x: 0.6, y: 0.2, width: 0.2, height: 0.4 },
      transitionStartMs: 6000,
      transitionMs: 1600,
    },
  ],
  captions: [
    {
      startMs: 0,
      endMs: 1800,
      text: "Clear spoken words",
      lines: ["Clear spoken words"],
      wordIds: ["w_000001", "w_000002", "w_000003"],
      wordCues: [
        { wordId: "w_000001", text: "Clear", startMs: 0, endMs: 500 },
        { wordId: "w_000002", text: "spoken", startMs: 700, endMs: 1200 },
        { wordId: "w_000003", text: "words", startMs: 1400, endMs: 1800 },
      ],
    },
  ],
  cards: [
    {
      origin: "transcript-fallback",
      startMs: 2000,
      endMs: 4000,
      kind: "statement",
      title: "Synthetic context",
      lines: ["One grounded visual"],
    },
  ],
});
const inputProps = { manifest, sourceUrl: "/source.mp4" };
const BeforeBufferFix = () => (
  <Html5Video
    src="/source.mp4"
    pauseWhenBuffering={false}
    style={{ width: "100%" }}
  />
);
const frames: number[] = [],
  media: number[] = [];
let waiting = 0,
  seeks = 0,
  ended = false,
  displayedTime = 0;
let videoNode: HTMLVideoElement | undefined, videoCallback: number | undefined;
const videoNodes = new Set<HTMLVideoElement>();
const root = createRoot(document.getElementById("root")!);
if (mode !== "generate")
  root.render(
    <Player
      ref={player}
      component={mode === "legacy" ? BeforeBufferFix : ClipComposition}
      inputProps={inputProps}
      durationInFrames={300}
      fps={30}
      compositionWidth={1080}
      compositionHeight={1920}
      controls={false}
      autoPlay={false}
      moveToBeginningWhenEnded={false}
      style={{ width: 320, height: 568 }}
    />,
  );
const timer = setInterval(() => {
  const current = player.current;
  const video = document.querySelector("video");
  if (!current || !video) return;
  if (videoNode !== video) {
    if (videoNode && videoCallback !== undefined)
      videoNode.cancelVideoFrameCallback(videoCallback);
    videoNode = video;
    videoNodes.add(video);
    const observe = (_now: number, metadata: VideoFrameCallbackMetadata) => {
      displayedTime = metadata.mediaTime;
      videoCallback = video.requestVideoFrameCallback(observe);
    };
    videoCallback = video.requestVideoFrameCallback(observe);
  }
  frames.push(current.getCurrentFrame());
  media.push(displayedTime);
}, 50);
document.addEventListener("waiting", () => waiting++, true);
document.addEventListener("seeking", () => seeks++, true);
const attach = setInterval(() => {
  if (!player.current) return;
  clearInterval(attach);
  player.current.addEventListener("ended", () => (ended = true));
}, 50);
Object.assign(window, {
  playbackProof: {
    generate: async () => {
      const target = new BufferTarget();
      const output = new Output({
        format: new Mp4OutputFormat({ fastStart: "in-memory" }),
        target,
      });
      const video = new VideoSampleSource({
        codec: "avc",
        bitrate: 2000000,
        bitrateMode: "constant",
        keyFrameInterval: 1,
      });
      const audio = new AudioSampleSource({ codec: "aac", bitrate: 128000 });
      output.addVideoTrack(video, { frameRate: 30 });
      output.addAudioTrack(audio);
      const canvas = new OffscreenCanvas(320, 180),
        context = canvas.getContext("2d")!;
      await output.start();
      try {
        for (let frame = 0; frame < 450; frame++) {
          const pixels = context.createImageData(320, 180);
          for (let y = 0; y < 180; y++)
            for (let x = 0; x < 320; x++) {
              const offset = (y * 320 + x) * 4;
              const value =
                y < 30
                  ? (frame >> Math.floor(x / 35)) & 1
                    ? 240
                    : 12
                  : (x * 37 + y * 83 + frame * 19) % 256;
              pixels.data.set([value, value, value, 255], offset);
            }
          context.putImageData(pixels, 0, 0);
          context.fillStyle = "#121212";
          context.fillRect(110, 80, 100, 40);
          context.fillStyle = "white";
          context.font = "bold 18px Arial";
          context.fillText(`${(frame / 30).toFixed(2)}s`, 125, 105);
          const sample = new VideoSample(canvas, {
            timestamp: frame / 30,
            duration: 1 / 30,
          });
          try {
            await video.add(sample);
          } finally {
            sample.close();
          }
          const data = new Float32Array(1600);
          for (let n = 0; n < data.length; n++) {
            const time = (frame * 1600 + n) / 48000;
            data[n] =
              Math.sin(2 * Math.PI * (300 + Math.floor(time) * 50) * time) *
              0.2;
          }
          const tone = new AudioSample({
            data,
            format: "f32-planar",
            numberOfChannels: 1,
            sampleRate: 48000,
            timestamp: frame / 30,
          });
          try {
            await audio.add(tone);
          } finally {
            tone.close();
          }
        }
        await output.finalize();
        if (!target.buffer || target.buffer.byteLength > 20 * 1024 * 1024)
          throw new Error("synthetic-size-invalid");
        const response = await fetch("/synthetic", {
          method: "POST",
          body: target.buffer,
        });
        if (!response.ok) throw new Error("synthetic-save-failed");
        return { bytes: target.buffer.byteLength, frames: 450 };
      } catch (error) {
        await output.cancel();
        throw error;
      }
    },
    play: () => player.current?.play(),
    stats: () => ({
      frames,
      media,
      waiting,
      seeks,
      ended,
      videoNodes: videoNodes.size,
    }),
    seek: (frame: number) => {
      player.current?.pause();
      player.current?.seekTo(frame);
    },
    layers: () => {
      const backgrounds = [
        ...document.querySelectorAll<HTMLSpanElement>("span"),
      ].filter((span) => span.style.backgroundColor === "rgb(118, 82, 216)");
      return {
        activeWords: backgrounds
          .filter((span) => Number(span.style.opacity) > 0)
          .map((span) => span.parentElement?.textContent?.trim()),
        captionFont:
          backgrounds[0]?.parentElement?.parentElement?.parentElement?.style
            .fontSize,
        captionBounds:
          backgrounds[0]?.parentElement?.parentElement?.parentElement
            ?.getBoundingClientRect()
            .toJSON(),
        visual:
          document.body.textContent?.includes("One grounded visual") ?? false,
      };
    },
    stop: () => {
      player.current?.pause();
      clearInterval(timer);
      clearInterval(attach);
      if (videoNode && videoCallback !== undefined)
        videoNode.cancelVideoFrameCallback(videoCallback);
      root.unmount();
    },
  },
});
