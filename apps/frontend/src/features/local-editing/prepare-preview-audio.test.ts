import { afterEach, expect, it, vi } from "vitest";
import { preparePreviewAudio } from "./prepare-preview-audio";

class PreparedAudio extends EventTarget {
  src = "";
  preload = "";
  loads = 0;
  removeAttribute(name: string) {
    if (name === "src") this.src = "";
  }
  load() {
    this.loads++;
  }
}
function surface() {
  const created: PreparedAudio[] = [];
  vi.stubGlobal("window", globalThis);
  vi.stubGlobal(
    "Audio",
    class extends PreparedAudio {
      constructor() {
        super();
        created.push(this);
      }
    },
  );
  return created;
}
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it("waits for playable audio and releases the preparation element without playing it", async () => {
  const created = surface(),
    controller = new AbortController();
  const pending = preparePreviewAudio("blob:synthetic", controller.signal);
  expect(created[0]).toMatchObject({
    src: "blob:synthetic",
    preload: "auto",
    loads: 1,
  });
  created[0]!.dispatchEvent(new Event("canplay"));
  await expect(pending).resolves.toBeUndefined();
  expect(created[0]).toMatchObject({ src: "", loads: 2 });
  controller.abort();
  created[0]!.dispatchEvent(new Event("error"));
  expect(created[0]!.loads).toBe(2);
});

it("releases pending media when the editor cancels preparation", async () => {
  const created = surface(),
    controller = new AbortController();
  const pending = preparePreviewAudio("blob:synthetic", controller.signal);
  const rejected = expect(pending).rejects.toThrow("preview_audio_unavailable");
  controller.abort();
  await rejected;
  expect(created[0]).toMatchObject({ src: "", loads: 2 });
});

it("reports failed media without leaking its URL", async () => {
  const created = surface();
  const pending = preparePreviewAudio(
    "blob:synthetic",
    new AbortController().signal,
  );
  const rejected = expect(pending).rejects.toThrow(
    /^preview_audio_unavailable$/u,
  );
  created[0]!.dispatchEvent(new Event("error"));
  await rejected;
  expect(created[0]!.src).toBe("");
});

it("bounds preparation time and clears its media on timeout", async () => {
  vi.useFakeTimers();
  const created = surface();
  const pending = preparePreviewAudio(
    "blob:synthetic",
    new AbortController().signal,
  );
  const rejected = expect(pending).rejects.toThrow("preview_audio_unavailable");
  await vi.advanceTimersByTimeAsync(15000);
  await rejected;
  expect(created[0]!.src).toBe("");
  expect(vi.getTimerCount()).toBe(0);
});
