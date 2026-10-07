import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  LEGACY_AUDIO_SCRATCH_FOLDER,
  WORKSPACE_FOLDER,
} from "./source.protocol";

let receive: typeof globalThis.onmessage;
beforeAll(async () => {
  vi.stubGlobal("onmessage", null);
  await import("./source.worker");
  receive = globalThis.onmessage;
  vi.unstubAllGlobals();
}, 20000);
afterEach(() => vi.unstubAllGlobals());
async function fixture() {
  const removeScratch = vi.fn(async () => {});
  const removeWorkspace = vi.fn(async () => {});
  const directory = { removeEntry: removeScratch };
  const root = {
    getDirectoryHandle: vi.fn(async () => directory),
    removeEntry: removeWorkspace,
  };
  const send = vi.fn();
  vi.stubGlobal("postMessage", send);
  vi.stubGlobal("window", globalThis);
  vi.stubGlobal("navigator", {
    storage: { getDirectory: vi.fn(async () => root) },
  });
  const run = async (action: string) => {
    if (!receive) throw new Error("Worker handler unavailable");
    await receive.call(
      window,
      new MessageEvent("message", { data: { jobId: "synthetic-job", action } }),
    );
  };
  return { run, send, root, removeScratch, removeWorkspace };
}
describe("current source worker cleanup", () => {
  it("initializes its own browser contracts without probing runtime code generation", async () => {
    vi.resetModules();
    const compile = vi.fn(function () {
      throw new Error("synthetic-worker-csp-eval-denied");
    });
    vi.stubGlobal("Function", compile);
    vi.stubGlobal("onmessage", null);
    await import("./source.worker");
    const { retainedSampleAnalysisResponseSchema } =
      await import("@clipbuilder/contracts");
    expect(
      retainedSampleAnalysisResponseSchema.parse({ generation: "1" }),
    ).toEqual({
      generation: "1",
    });
    expect(
      retainedSampleAnalysisResponseSchema.safeParse({ generation: "-1" })
        .success,
    ).toBe(false);
    expect(compile).not.toHaveBeenCalled();
  });
  it("removes legacy scratch on recovery and the owned workspace on deletion", async () => {
    const f = await fixture();
    await f.run("clear-audio");
    expect(f.removeScratch).toHaveBeenCalledExactlyOnceWith(
      LEGACY_AUDIO_SCRATCH_FOLDER,
      { recursive: true },
    );
    await f.run("delete");
    expect(f.removeWorkspace).toHaveBeenCalledExactlyOnceWith(
      WORKSPACE_FOLDER,
      { recursive: true },
    );
    expect(
      f.send.mock.calls.filter(([message]) => message.type === "stopped"),
    ).toHaveLength(2);
  });
  it("acknowledges missing scratch and rejects a retired command before storage work", async () => {
    const f = await fixture();
    f.removeScratch.mockRejectedValueOnce(
      new DOMException("Synthetic missing scratch", "NotFoundError"),
    );
    await f.run("clear-audio");
    expect(
      f.send.mock.calls.some(([message]) => message.type === "failed"),
    ).toBe(false);
    f.root.getDirectoryHandle.mockClear();
    await f.run("extract-audio");
    expect(f.root.getDirectoryHandle).not.toHaveBeenCalled();
    expect(f.send).toHaveBeenCalledWith({
      type: "failed",
      jobId: "synthetic-job",
      code: "unsupported",
    });
  });
});
