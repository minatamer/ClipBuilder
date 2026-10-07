import { beforeEach, describe, expect, it, vi } from "vitest";
import { extractLocalAudio } from "./audio.extraction";

const fault = vi.hoisted(() => ({
  inputDisposed: vi.fn(),
  cancel: vi.fn(async () => {
    throw new Error("An errored stream cannot close.");
  }),
}));

vi.mock("mediabunny", async (load) => {
  const actual = await load<typeof import("mediabunny")>();
  const audio = {
    isAudioTrack: () => true,
    isVideoTrack: () => false,
    canDecode: async () => true,
  };
  return {
    ...actual,
    Input: class {
      getTracks = async () => [
        audio,
        { isAudioTrack: () => false, isVideoTrack: () => true },
      ];
      getPrimaryAudioTrack = async () => audio;
      computeDuration = async () => 15;
      dispose = fault.inputDisposed;
    },
    Output: class {
      addAudioTrack() {}
      async start() {
        throw new DOMException("Synthetic quota denial.", "QuotaExceededError");
      }
      cancel = fault.cancel;
    },
  };
});

describe("audio failure cleanup", () => {
  beforeEach(() => vi.clearAllMocks());
  it("preserves safe quota failure when an errored output also rejects cancellation", async () => {
    const access = {
      truncate: vi.fn(),
      write: vi.fn(),
      flush: vi.fn(),
      close: vi.fn(),
    };
    const folder = {
      getFileHandle: vi.fn(async () => ({
        createSyncAccessHandle: async () => access,
      })),
      removeEntry: vi.fn(async () => {}),
    };
    await expect(
      extractLocalAudio(
        new Blob([new Uint8Array(8)]),
        15_000,
        "opus-webm",
        folder as unknown as FileSystemDirectoryHandle,
        new AbortController().signal,
        vi.fn(),
      ),
    ).rejects.toMatchObject({ code: "storage" });
    expect(fault.cancel).toHaveBeenCalledOnce();
    expect(fault.inputDisposed).toHaveBeenCalledOnce();
    expect(access.close).toHaveBeenCalledOnce();
    expect(folder.removeEntry).toHaveBeenCalledExactlyOnceWith("encoded");
  });
  it("attempts handle close and scratch deletion even if an input disposer throws", async () => {
    fault.inputDisposed.mockImplementationOnce(() => {
      throw new Error("Synthetic dispose failure.");
    });
    const access = {
      truncate: vi.fn(),
      write: vi.fn(),
      flush: vi.fn(),
      close: vi.fn(),
    };
    const folder = {
      getFileHandle: vi.fn(async () => ({
        createSyncAccessHandle: async () => access,
      })),
      removeEntry: vi.fn(async () => {}),
    };
    await expect(
      extractLocalAudio(
        new Blob([new Uint8Array(8)]),
        15_000,
        "opus-webm",
        folder as unknown as FileSystemDirectoryHandle,
        new AbortController().signal,
        vi.fn(),
      ),
    ).rejects.toMatchObject({ code: "storage" });
    expect(access.close).toHaveBeenCalledOnce();
    expect(folder.removeEntry).toHaveBeenCalledExactlyOnceWith("encoded");
  });
});
