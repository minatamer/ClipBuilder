// Only locally generated synthetic media is accepted by this spike.
import {
  Output,
  Mp4OutputFormat,
  WebMOutputFormat,
  StreamTarget,
  VideoSampleSource,
  AudioSampleSource,
  VideoSample,
  AudioSample,
  Input,
  BlobSource,
  MP4,
  WEBM,
  VideoSampleSink,
  AudioSampleSink,
  Conversion,
  Quality,
  EncodedPacketSink,
  EncodedVideoPacketSource,
  EncodedAudioPacketSource,
} from "/mediabunny.mjs";
import { withTruncatedSyncAccess } from "/sync-access.mjs";

const videoConfig = {
  codec: "avc1.420028",
  width: 1080,
  height: 1920,
  framerate: 30,
  bitrate: 4_000_000,
  latencyMode: "realtime",
  avc: { format: "avc" },
};
const audioConfig = {
  codec: "mp4a.40.2",
  sampleRate: 48_000,
  numberOfChannels: 1,
  bitrate: 128_000,
};
const folderName = "clipbuilder-cl005-feasibility";
let canceled = false;
let activeConversion;
let releaseLock;
function checkCanceled() {
  if (canceled) throw new Error("canceled");
}
function result(name, value) {
  postMessage({ type: "result", name, result: value });
}
function phase(value) {
  postMessage({ type: "phase", phase: value });
}
async function folder() {
  return (await navigator.storage.getDirectory()).getDirectoryHandle(
    folderName,
    { create: true },
  );
}

async function validate(name, range) {
  const file = await (await (await folder()).getFileHandle(name)).getFile();
  const input = new Input({
    source: new BlobSource(file, { maxCacheSize: 4 * 1024 * 1024 }),
    formats: [MP4],
  });
  try {
    const video = await input.getPrimaryVideoTrack();
    const audio = await input.getPrimaryAudioTrack();
    let videoSample;
    let audioSample;
    try {
      videoSample = await new VideoSampleSink(video).getSample(0.5);
      audioSample = await new AudioSampleSink(audio).getSample(0.5);
      if (!videoSample || !audioSample)
        throw new Error("decoded-samples-missing");
      result(range ? "sourceRangeProbe" : "reopened", {
        bytes: file.size,
        duration: await input.computeDuration(),
        videoCodec: video.codec,
        audioCodec: audio.codec,
        width: videoSample.displayWidth,
        height: videoSample.displayHeight,
        frameTime: videoSample.timestamp,
        audioTime: audioSample.timestamp,
        sampleTimestampDifferenceMs:
          Math.abs(videoSample.timestamp - audioSample.timestamp) * 1000,
      });
    } finally {
      videoSample?.close();
      audioSample?.close();
    }
    postMessage({ type: "file", file, range });
  } finally {
    input.dispose();
  }
}

async function diskTarget(name, maxBytes) {
  const handle = await (await folder()).getFileHandle(name, { create: true });
  const access = await handle.createSyncAccessHandle();
  try {
    access.truncate(0);
    const stats = { writes: 0, maxChunkBytes: 0, bytes: 0 };
    const target = new StreamTarget(
      new WritableStream({
        write({ data, position }) {
          checkCanceled();
          if (position + data.byteLength > maxBytes)
            throw new Error("output-byte-ceiling");
          stats.writes++;
          stats.maxChunkBytes = Math.max(stats.maxChunkBytes, data.byteLength);
          stats.bytes = Math.max(stats.bytes, position + data.byteLength);
          let offset = 0;
          while (offset < data.byteLength) {
            const written = access.write(data.subarray(offset), {
              at: position + offset,
            });
            if (written <= 0) throw new Error("write-no-progress");
            offset += written;
          }
        },
      }),
      { chunked: true, chunkSize: 1024 * 1024 },
    );
    return { handle, access, stats, target };
  } catch (error) {
    access.close();
    throw error;
  }
}

async function generate(durationSeconds = 1200) {
  phase(
    durationSeconds === 1200
      ? "Generating an actual 20-minute 720p H.264/AAC source near 500 MiB"
      : `Generating an actual ${durationSeconds}-second synthetic source`,
  );
  const storage = await navigator.storage.estimate();
  if (storage.quota - storage.usage < 1_300_000_000)
    throw new Error("insufficient-spike-storage");
  const disk = await diskTarget("source.mp4", 500 * 1024 * 1024);
  let output;
  try {
    output = new Output({
      format: new Mp4OutputFormat({ fastStart: "fragmented" }),
      target: disk.target,
    });
    const video = new VideoSampleSource({
      codec: "avc",
      bitrate: 3_300_000,
      bitrateMode: "constant",
      latencyMode: "quality",
      keyFrameInterval: 2,
      onEncoderConfig: (config) => result("sourceVideoEncoderConfig", config),
    });
    const audio = new AudioSampleSource({ codec: "aac", bitrate: 128_000 });
    output.addVideoTrack(video, { frameRate: 30 });
    output.addAudioTrack(audio);
    const canvas = new OffscreenCanvas(1280, 720);
    const context = canvas.getContext("2d");
    const noise = new OffscreenCanvas(1280, 720);
    const noiseContext = noise.getContext("2d");
    const pixels = noiseContext.createImageData(1280, 720);
    let seed = 77123;
    for (let i = 0; i < pixels.data.length; i += 4) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      pixels.data[i] = seed & 255;
      pixels.data[i + 1] = (seed >>> 8) & 255;
      pixels.data[i + 2] = (seed >>> 16) & 255;
      pixels.data[i + 3] = 255;
    }
    noiseContext.putImageData(pixels, 0, 0);
    const start = performance.now();
    await output.start();
    for (let index = 0; index < durationSeconds * 30; index++) {
      checkCanceled();
      const timestamp = index / 30;
      const dx = (index * 17) % 1280;
      context.drawImage(noise, dx, 0, 1280 - dx, 720, 0, 0, 1280 - dx, 720);
      if (dx) context.drawImage(noise, 0, 0, dx, 720, 1280 - dx, 0, dx, 720);
      const pulse = timestamp % 1 < 1 / 30;
      context.fillStyle = pulse ? "white" : "#154adc";
      context.fillRect(400, 100, 480, 420);
      context.fillStyle = pulse ? "black" : "white";
      context.font = "bold 30px sans-serif";
      context.fillText(`${timestamp.toFixed(2)}s`, 450, 250);
      const frame = new VideoSample(canvas, { timestamp, duration: 1 / 30 });
      try {
        await video.add(frame);
      } finally {
        frame.close();
      }
      const samples = new Float32Array(1600);
      for (let i = 0; i < samples.length; i++) {
        const time = (index * 1600 + i) / 48_000;
        samples[i] =
          (time % 1 < 0.02 ? 0.6 : 0.05) * Math.sin(2 * Math.PI * 440 * time);
      }
      const sample = new AudioSample({
        data: samples,
        format: "f32-planar",
        numberOfChannels: 1,
        sampleRate: 48_000,
        timestamp,
      });
      try {
        await audio.add(sample);
      } finally {
        sample.close();
      }
      if (index % 300 === 0)
        phase(
          `Generating source: ${((timestamp / durationSeconds) * 100).toFixed(1)}%, ${(disk.stats.bytes / 1024 / 1024).toFixed(1)} MiB`,
        );
    }
    await output.finalize();
    disk.access.flush();
    result("generation", {
      elapsedMs: performance.now() - start,
      ...disk.stats,
    });
  } catch (error) {
    await output?.cancel();
    throw error;
  } finally {
    disk.access.close();
  }
  const file = await disk.handle.getFile();
  const input = new Input({
    source: new BlobSource(file, { maxCacheSize: 4 * 1024 * 1024 }),
    formats: [MP4],
  });
  try {
    result("fullSource", {
      bytes: file.size,
      duration: await input.computeDuration(),
      near500MiB:
        file.size >= 450 * 1024 * 1024 && file.size <= 500 * 1024 * 1024,
    });
  } finally {
    input.dispose();
  }
}

async function convert(action) {
  const source = await (
    await (await folder()).getFileHandle("source.mp4")
  ).getFile();
  const input = new Input({
    source: new BlobSource(source, { maxCacheSize: 4 * 1024 * 1024 }),
    formats: [MP4],
  });
  const extracting = action === "extract";
  const name = extracting ? "audio.webm" : "portrait.mp4";
  const ceiling = extracting ? 16 * 1024 * 1024 : 64 * 1024 * 1024;
  let disk;
  let output;
  let failed = true;
  try {
    disk = await diskTarget(name, ceiling);
    output = new Output({
      format: extracting
        ? new WebMOutputFormat()
        : new Mp4OutputFormat({ fastStart: false }),
      target: disk.target,
    });
    const start = performance.now();
    const conversion = await Conversion.init({
      input,
      output,
      tracks: "primary",
      copy: false,
      ...(extracting ? {} : { trim: { start: 600, end: 660 } }),
      video: extracting
        ? { discard: true }
        : {
            codec: "avc",
            quality: new Quality({ bitrate: 4_000_000 }),
            width: 1080,
            height: 1920,
            fit: "cover",
            frameRate: 30,
            forceTranscode: true,
            allowTransformationMetadata: false,
          },
      audio: {
        codec: extracting ? "opus" : "aac",
        quality: new Quality({ bitrate: extracting ? 64_000 : 128_000 }),
        sampleRate: extracting ? 16_000 : 48_000,
        numberOfChannels: 1,
        forceTranscode: true,
      },
    });
    activeConversion = conversion;
    if (
      !conversion.isValid ||
      conversion.discardedTracks.some(
        (track) =>
          !(
            extracting &&
            track.reason === "discarded_by_user" &&
            track.track.isVideoTrack()
          ),
      )
    )
      throw new Error("conversion-track-unavailable");
    conversion.onProgress = (progress) =>
      phase(
        `${extracting ? "Extracting complete audio" : "Encoding selected portrait range"}: ${(progress * 100).toFixed(1)}%`,
      );
    await conversion.execute();
    disk.access.flush();
    result(extracting ? "fullAudioExtraction" : "fullRangeExport", {
      elapsedMs: performance.now() - start,
      ...disk.stats,
    });
    failed = false;
  } catch (error) {
    failed = true;
    await activeConversion?.cancel();
    throw error;
  } finally {
    activeConversion = undefined;
    input.dispose();
    disk?.access.close();
    if (failed && disk) {
      await (await folder()).removeEntry(name);
      result("abortedConversion", {
        canceled,
        partialDeleted: true,
        sourceRetained: true,
        fileHandleClosed: true,
      });
    }
  }
  if (!extracting) await validate(name);
  else {
    const file = await disk.handle.getFile();
    const extracted = new Input({
      source: new BlobSource(file, { maxCacheSize: 1024 * 1024 }),
      formats: [WEBM],
    });
    try {
      const audio = await extracted.getPrimaryAudioTrack();
      let frames = 0;
      let decodedDuration = 0;
      for await (const sample of new AudioSampleSink(audio).samples()) {
        try {
          checkCanceled();
          frames += sample.numberOfFrames;
          decodedDuration += sample.duration;
        } finally {
          sample.close();
        }
      }
      result("audioReopened", {
        bytes: file.size,
        containerDuration: await extracted.computeDuration(),
        codec: audio.codec,
        frames,
        decodedDuration,
        within16MiB: file.size <= ceiling,
      });
    } finally {
      extracted.dispose();
    }
  }
}

async function boundDuration() {
  phase(
    "Remuxing encoded packets with bounded presentation timing, without changing the selected range",
  );
  const file = await (
    await (await folder()).getFileHandle("portrait.mp4")
  ).getFile();
  const input = new Input({
    source: new BlobSource(file, { maxCacheSize: 4 * 1024 * 1024 }),
    formats: [MP4],
  });
  let disk;
  let output;
  try {
    disk = await diskTarget("bounded-portrait.mp4", 64 * 1024 * 1024);
    output = new Output({
      format: new Mp4OutputFormat({ fastStart: false }),
      target: disk.target,
    });
    const start = performance.now();
    const videoTrack = await input.getPrimaryVideoTrack();
    const audioTrack = await input.getPrimaryAudioTrack();
    const videoConfig = await videoTrack.getDecoderConfig();
    const audioConfig = await audioTrack.getDecoderConfig();
    const video = new EncodedVideoPacketSource("avc");
    const audio = new EncodedAudioPacketSource("aac");
    output.addVideoTrack(video, { frameRate: 30 });
    output.addAudioTrack(audio);
    await output.start();
    const videoIterator = new EncodedPacketSink(videoTrack).packets();
    const audioIterator = new EncodedPacketSink(audioTrack).packets();
    let nextVideo = await videoIterator.next();
    let nextAudio = await audioIterator.next();
    try {
      while (!nextVideo.done || !nextAudio.done) {
        checkCanceled();
        const isVideo =
          nextAudio.done ||
          (!nextVideo.done &&
            nextVideo.value.timestamp <= nextAudio.value.timestamp);
        const next = isVideo ? nextVideo : nextAudio;
        const packet = next.value;
        if (packet.timestamp < 60) {
          const duration = Math.min(packet.duration, 60 - packet.timestamp);
          await (isVideo ? video : audio).add(packet.clone({ duration }), {
            decoderConfig: isVideo ? videoConfig : audioConfig,
          });
        }
        if (isVideo) nextVideo = await videoIterator.next();
        else nextAudio = await audioIterator.next();
      }
    } finally {
      await videoIterator.return();
      await audioIterator.return();
    }
    await output.finalize();
    disk.access.flush();
    result("boundedPresentationMux", {
      elapsedMs: performance.now() - start,
      ...disk.stats,
    });
  } catch (error) {
    await output?.cancel();
    throw error;
  } finally {
    input.dispose();
    disk?.access.close();
  }
  await validate("bounded-portrait.mp4");
}

async function sync() {
  phase("Comparing decoded flash/tone onsets at 1, 30 and 59 seconds");
  const file = await (
    await (await folder()).getFileHandle("bounded-portrait.mp4")
  ).getFile();
  const input = new Input({
    source: new BlobSource(file, { maxCacheSize: 4 * 1024 * 1024 }),
    formats: [MP4],
  });
  try {
    const video = new VideoSampleSink(await input.getPrimaryVideoTrack());
    const audio = new AudioSampleSink(await input.getPrimaryAudioTrack());
    const canvas = new OffscreenCanvas(1080, 1920);
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const observations = [];
    for (const time of [1, 30, 59]) {
      let flashAt;
      let toneAt;
      for await (const sample of video.samples(time - 0.06, time + 0.08)) {
        try {
          sample.draw(context, 0, 0);
          const pixel = context.getImageData(540, 800, 1, 1).data;
          if (
            pixel[0] > 220 &&
            pixel[1] > 220 &&
            pixel[2] > 220 &&
            flashAt === undefined
          )
            flashAt = sample.timestamp;
        } finally {
          sample.close();
        }
      }
      for await (const sample of audio.samples(time - 0.06, time + 0.08)) {
        try {
          const values = new Float32Array(sample.numberOfFrames);
          sample.copyTo(values, { planeIndex: 0, format: "f32-planar" });
          for (let i = 0; i < values.length; i++) {
            if (Math.abs(values[i]) > 0.3 && toneAt === undefined)
              toneAt = sample.timestamp + i / sample.sampleRate;
          }
        } finally {
          sample.close();
        }
      }
      if (flashAt === undefined || toneAt === undefined)
        throw new Error("sync-marker-missing");
      observations.push({
        expectedSecond: time,
        flashAt,
        toneAt,
        differenceMs: Math.abs(flashAt - toneAt) * 1000,
      });
    }
    result("flashToneSync", observations);
  } finally {
    input.dispose();
  }
}

async function copy(fail = false) {
  phase(
    fail
      ? "Injecting a quota failure after committed writes"
      : "Streaming, reopening and deleting a full source copy",
  );
  const directory = await folder();
  const source = await (await directory.getFileHandle("source.mp4")).getFile();
  const name = fail ? "failed-copy.mp4" : "copy.mp4";
  const handle = await directory.getFileHandle(name, { create: true });
  const access = await handle.createSyncAccessHandle();
  const reader = source.stream().getReader();
  const start = performance.now();
  let committed = 0;
  let maxReadBytes = 0;
  let injected = false;
  try {
    try {
      access.truncate(0);
      while (true) {
        checkCanceled();
        const chunk = await reader.read();
        if (chunk.done) break;
        maxReadBytes = Math.max(maxReadBytes, chunk.value.byteLength);
        if (fail && committed >= 4 * 1024 * 1024) {
          injected = true;
          throw new DOMException(
            "Synthetic mid-write quota failure",
            "QuotaExceededError",
          );
        }
        let offset = 0;
        while (offset < chunk.value.byteLength) {
          const written = access.write(chunk.value.subarray(offset), {
            at: committed + offset,
          });
          if (written <= 0) throw new Error("write-no-progress");
          offset += written;
        }
        committed += chunk.value.byteLength;
      }
      access.flush();
    } catch (error) {
      if (!injected) throw error;
    } finally {
      try {
        await reader.cancel();
      } finally {
        reader.releaseLock();
        access.close();
      }
    }
    if (!fail) {
      const copied = await handle.getFile();
      const input = new Input({
        source: new BlobSource(copied, { maxCacheSize: 4 * 1024 * 1024 }),
        formats: [MP4],
      });
      try {
        result("fullCopy", {
          bytes: copied.size,
          duration: await input.computeDuration(),
          elapsedMs: performance.now() - start,
          maxReadBytes,
        });
      } finally {
        input.dispose();
      }
    }
  } finally {
    await directory.removeEntry(name);
  }
  if (fail)
    result("injectedWriteFailure", {
      injected,
      committedBeforeFailure: committed,
      readerClosed: true,
      fileHandleClosed: true,
      partialDeleted: true,
    });
}

async function probe() {
  phase("Checking exact native worker codecs and OPFS");
  const support = {
    secure: isSecureContext,
    videoEncoder:
      typeof VideoEncoder !== "undefined" &&
      (await VideoEncoder.isConfigSupported(videoConfig)).supported,
    audioEncoder:
      typeof AudioEncoder !== "undefined" &&
      (await AudioEncoder.isConfigSupported(audioConfig)).supported,
    videoDecoder: typeof VideoDecoder !== "undefined",
    audioDecoder: typeof AudioDecoder !== "undefined",
    storage: typeof navigator.storage?.getDirectory === "function",
    webLocks: typeof navigator.locks?.request === "function",
  };
  result("configurations", { videoConfig, audioConfig });
  result("support", support);
  if (!Object.values(support).every(Boolean))
    throw new Error("native-codec-or-storage-unavailable");
  const quota = await navigator.storage.estimate();
  result("quota", { quota: quota.quota, usage: quota.usage });
  phase("Encoding a two-second 1080x1920 H.264/AAC sample incrementally");
  const handle = await (
    await folder()
  ).getFileHandle("small.mp4", { create: true });
  await withTruncatedSyncAccess(handle, async (access) => {
    let writes = 0;
    let maxChunkBytes = 0;
    const target = new StreamTarget(
      new WritableStream({
        write({ data, position }) {
          writes++;
          maxChunkBytes = Math.max(maxChunkBytes, data.byteLength);
          let offset = 0;
          while (offset < data.byteLength) {
            const written = access.write(data.subarray(offset), {
              at: position + offset,
            });
            if (written <= 0) throw new Error("write-no-progress");
            offset += written;
          }
        },
      }),
      { chunked: true, chunkSize: 1024 * 1024 },
    );
    const output = new Output({
      format: new Mp4OutputFormat({ fastStart: "fragmented" }),
      target,
    });
    const video = new VideoSampleSource({
      codec: "avc",
      bitrate: 4_000_000,
      latencyMode: "realtime",
    });
    const audio = new AudioSampleSource({ codec: "aac", bitrate: 128_000 });
    output.addVideoTrack(video, { frameRate: 30 });
    output.addAudioTrack(audio);
    const canvas = new OffscreenCanvas(1080, 1920);
    const context = canvas.getContext("2d");
    const start = performance.now();
    try {
      await output.start();
      for (let index = 0; index < 60; index++) {
        checkCanceled();
        const timestamp = index / 30;
        context.fillStyle = index < 30 ? "#1649d9" : "#2fb896";
        context.fillRect(0, 0, 1080, 1920);
        context.fillStyle = "white";
        context.font = "bold 64px sans-serif";
        context.fillText(`Synthetic ${timestamp.toFixed(2)}s`, 80, 150);
        context.fillRect(80 + index * 12, 900, 40, 300);
        const frame = new VideoSample(canvas, { timestamp, duration: 1 / 30 });
        try {
          await video.add(frame);
        } finally {
          frame.close();
        }
        const samples = new Float32Array(1600);
        for (let sample = 0; sample < samples.length; sample++)
          samples[sample] =
            0.1 *
            Math.sin((2 * Math.PI * 440 * (index * 1600 + sample)) / 48_000);
        const audioSample = new AudioSample({
          data: samples,
          format: "f32-planar",
          numberOfChannels: 1,
          sampleRate: 48_000,
          timestamp,
        });
        try {
          await audio.add(audioSample);
        } finally {
          audioSample.close();
        }
      }
      await output.finalize();
      access.flush();
      result("smallEncode", {
        elapsedMs: performance.now() - start,
        writes,
        maxChunkBytes,
      });
    } catch (error) {
      await output.cancel();
      throw error;
    }
  });
  await validate("small.mp4");
}

onmessage = async ({ data }) => {
  if (data.action === "release") {
    releaseLock?.();
    return;
  }
  if (data.action === "cancel") {
    canceled = true;
    await activeConversion?.cancel();
    return;
  }
  canceled = false;
  try {
    if (data.action === "probe")
      await navigator.locks.request("clipbuilder-cl005-feasibility", probe);
    else if (data.action === "reopen") await validate("small.mp4");
    else if (data.action === "range")
      await validate("source.mp4", { start: 600, end: 660 });
    else if (data.action === "hold")
      await navigator.locks.request(
        "clipbuilder-cl005-feasibility",
        async () => {
          phase("Exclusive workspace mutation lock held");
          await new Promise((resolve) => {
            releaseLock = resolve;
          });
          releaseLock = undefined;
        },
      );
    else if (data.action === "bound")
      await navigator.locks.request(
        "clipbuilder-cl005-feasibility",
        boundDuration,
      );
    else if (data.action === "sync") await sync();
    else if (data.action === "copy" || data.action === "failure") {
      const start = performance.now();
      phase("Waiting for exclusive workspace mutation lock");
      await navigator.locks.request(
        "clipbuilder-cl005-feasibility",
        async () => {
          result("mutationLockWaitMs", performance.now() - start);
          await copy(data.action === "failure");
        },
      );
    } else if (data.action === "short-source") {
      await navigator.locks.request("clipbuilder.cl005.workspace", async () => {
        await generate(20);
        await validate("source.mp4");
      });
    } else if (data.action === "generate")
      await navigator.locks.request("clipbuilder-cl005-feasibility", generate);
    else if (data.action === "extract" || data.action === "export")
      await navigator.locks.request("clipbuilder-cl005-feasibility", () =>
        convert(data.action),
      );
    else if (data.action === "clean") {
      await navigator.locks.request(
        "clipbuilder-cl005-feasibility",
        async () => {
          const root = await navigator.storage.getDirectory();
          await root.removeEntry(folderName, { recursive: true });
          let deleted = false;
          try {
            await root.getDirectoryHandle(folderName);
          } catch (error) {
            if (error.name === "NotFoundError") deleted = true;
            else throw error;
          }
          result("cleanup", { deleted });
        },
      );
    }
    postMessage({ type: "done" });
  } catch (error) {
    postMessage({
      type: "failed",
      code: error instanceof Error ? error.message : "spike-failed",
    });
  }
};
