// This synthetic-only harness is separate from the product's media owner.
const phase = document.querySelector("#phase");
const results = document.querySelector("#results");
const preview = document.querySelector("#preview");
const worker = new Worker("/worker.mjs", { type: "module" });
let currentUrl;
let running = false;
let retained;
try {
  const value = sessionStorage.getItem("cl005.spike.measurements");
  if (value && value.length < 32_000) retained = JSON.parse(value);
} catch {
  sessionStorage.removeItem("cl005.spike.measurements");
}
const report =
  retained && Array.isArray(retained.longTasks)
    ? retained
    : {
        userAgent: navigator.userAgent,
        isolated: crossOriginIsolated,
        library: "mediabunny@1.61.0",
        longTasks: [],
      };
let memoryPending = false;
let range;
let frameRequest;
async function sampleMemory() {
  if (
    memoryPending ||
    typeof performance.measureUserAgentSpecificMemory !== "function"
  )
    return;
  memoryPending = true;
  try {
    const measurement = await performance.measureUserAgentSpecificMemory();
    if (report.memoryBaselineBytes === undefined)
      report.memoryBaselineBytes = measurement.bytes;
    report.memoryMaxSampledBytes = Math.max(
      report.memoryMaxSampledBytes || 0,
      measurement.bytes,
    );
    report.memorySampleCount = (report.memorySampleCount || 0) + 1;
    render();
  } catch {
    report.memoryMeasurementUnavailable = true;
  } finally {
    memoryPending = false;
  }
}
const memoryTimer = setInterval(() => {
  if (running) void sampleMemory();
}, 1000);
document.addEventListener("visibilitychange", () => {
  report.visibilityChanges = [
    ...(report.visibilityChanges || []),
    document.visibilityState,
  ].slice(-16);
  render();
});
let lastHeartbeat = performance.now();
let maxHeartbeatGapMs = 0;
const heartbeat = setInterval(() => {
  const now = performance.now();
  if (document.visibilityState === "visible")
    maxHeartbeatGapMs = Math.max(maxHeartbeatGapMs, now - lastHeartbeat);
  else
    report.maxBackgroundTimerGapMs = Math.max(
      report.maxBackgroundTimerGapMs || 0,
      now - lastHeartbeat,
    );
  lastHeartbeat = now;
}, 50);
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries())
    report.longTasks.push(Math.round(entry.duration));
  report.longTasks = report.longTasks.slice(-256);
});
observer.observe({ type: "longtask", buffered: true });
function render() {
  const serialized = JSON.stringify(report, null, 2);
  results.textContent = serialized;
  if (report.cleanup?.deleted)
    sessionStorage.removeItem("cl005.spike.measurements");
  else if (serialized.length < 32_000)
    sessionStorage.setItem("cl005.spike.measurements", serialized);
}
function releasePreview() {
  if (frameRequest) preview.cancelVideoFrameCallback(frameRequest);
  frameRequest = undefined;
  preview.pause();
  preview.removeAttribute("src");
  preview.load();
  if (currentUrl) URL.revokeObjectURL(currentUrl);
  currentUrl = undefined;
  range = undefined;
}
worker.onmessage = async ({ data }) => {
  if (data.type === "phase") {
    phase.textContent = data.phase;
    return;
  }
  if (data.type === "result") {
    report[data.name] = data.result;
    render();
    return;
  }
  if (data.type === "file") {
    releasePreview();
    currentUrl = URL.createObjectURL(data.file);
    const download = document.querySelector("#download-source");
    download.href = currentUrl;
    download.hidden = false;
    preview.src = currentUrl;
    range = data.range;
    preview.onloadedmetadata = () => {
      report[range ? "sourceHtmlPlayback" : "htmlPlayback"] = {
        duration: preview.duration,
        width: preview.videoWidth,
        height: preview.videoHeight,
      };
      if (range) preview.currentTime = range.start;
      render();
    };
    return;
  }
  if (data.type === "done" || data.type === "failed") {
    running = false;
    phase.textContent =
      data.type === "done" ? "Finished" : "Unsupported or failed";
    if (data.type === "failed") report.failure = data.code;
    report.maxHeartbeatGapMs = maxHeartbeatGapMs;
    report.workerMemoryApi =
      typeof performance.measureUserAgentSpecificMemory === "function";
    render();
  }
};
for (const action of [
  "probe",
  "reopen",
  "clean",
  "generate",
  "short-source",
  "extract",
  "audio-candidate",
  "audio-reference",
  "audio-failure",
  "export",
  "range",
  "bound",
  "sync",
  "copy",
  "failure",
  "hold",
]) {
  document.querySelector(`#${action}`).onclick = () => {
    if (running) return;
    if (report.failure) {
      report.failures = [...(report.failures || []), report.failure].slice(-16);
      delete report.failure;
    }
    running = true;
    delete report.cleanup;
    if (action === "clean") {
      releasePreview();
      const download = document.querySelector("#download-source");
      download.removeAttribute("href");
      download.hidden = true;
    }
    phase.textContent = "Running";
    worker.postMessage({ action });
  };
}
document.querySelector("#memory").onclick = () => {
  void sampleMemory();
};
document.querySelector("#release").onclick = () =>
  worker.postMessage({ action: "release" });
document.querySelector("#play").onclick = () => {
  void preview.play().catch(() => {
    phase.textContent = "Playback unavailable";
  });
};
document.querySelector("#seek").onclick = () => {
  if (range) preview.currentTime = range.end - 0.1;
};
function stopAtRangeEnd() {
  if (range && preview.currentTime >= range.end) {
    preview.pause();
    preview.currentTime = range.end;
    report.rangeStopped = {
      currentTime: preview.currentTime,
      paused: preview.paused,
      end: range.end,
    };
    render();
  }
}
preview.addEventListener("playing", () => {
  report.playbackStarted = true;
  render();
});
preview.addEventListener("seeking", () => {
  if (range && preview.currentTime < range.start)
    preview.currentTime = range.start;
  if (range && preview.currentTime > range.end) preview.currentTime = range.end;
});
preview.addEventListener("timeupdate", stopAtRangeEnd);
preview.addEventListener("play", () => {
  const nextFrame = () => {
    stopAtRangeEnd();
    if (!preview.paused)
      frameRequest = preview.requestVideoFrameCallback(nextFrame);
  };
  if (frameRequest) preview.cancelVideoFrameCallback(frameRequest);
  frameRequest = preview.requestVideoFrameCallback(nextFrame);
});
document.querySelector("#cancel").onclick = () =>
  worker.postMessage({ action: "cancel" });
window.addEventListener("pagehide", () => {
  worker.terminate();
  observer.disconnect();
  clearInterval(heartbeat);
  clearInterval(memoryTimer);
  releasePreview();
});
render();
