import { describe, expect, it, vi } from "vitest";
import { LOCAL_WORKSPACE_LIMITS } from "@clipbuilder/contracts";
import { copyLocalSource } from "./opfs.copy";

function fixture(file: Blob) {
  const access = {
    truncate: vi.fn(),
    write: vi.fn((bytes: Uint8Array) => bytes.byteLength),
    flush: vi.fn(),
    close: vi.fn(),
  };
  const handle = {
    createSyncAccessHandle: vi.fn(async () => access),
    getFile: vi.fn(async () => file),
  };
  const directory = {
    getFileHandle: vi.fn(async () => handle),
    removeEntry: vi.fn(async () => {}),
  };
  return {
    access,
    handle,
    directory,
    folder: directory as unknown as FileSystemDirectoryHandle,
  };
}
describe("incremental OPFS copy setup and failure lifetime", () => {
  it.each(["open", "truncate", "write", "flush", "validation"])(
    "deletes partial bytes after %s failure and closes acquired handles",
    async (stage) => {
      const file = new Blob([new Uint8Array(8)]);
      const f = fixture(file);
      if (stage === "open")
        f.handle.createSyncAccessHandle.mockRejectedValue(
          new Error("synthetic"),
        );
      if (stage === "truncate")
        f.access.truncate.mockImplementation(() => {
          throw new Error("synthetic");
        });
      if (stage === "write")
        f.access.write.mockImplementation(() => {
          throw new Error("synthetic");
        });
      if (stage === "flush")
        f.access.flush.mockImplementation(() => {
          throw new Error("synthetic");
        });
      if (stage === "validation")
        f.handle.getFile.mockResolvedValue(new Blob());
      await expect(
        copyLocalSource(
          f.folder,
          "opaque",
          file,
          new AbortController().signal,
          () => {},
        ),
      ).rejects.toThrow();
      expect(f.directory.removeEntry).toHaveBeenCalledOnce();
      expect(f.access.close).toHaveBeenCalledTimes(stage === "open" ? 0 : 1);
    },
  );
  it("writes bounded chunks with offsets/backpressure and reports only committed bytes", async () => {
    const file = new Blob([
      new Uint8Array(LOCAL_WORKSPACE_LIMITS.ioChunkBytes + 10),
    ]);
    const f = fixture(file);
    const progress = vi.fn();
    await copyLocalSource(
      f.folder,
      "opaque",
      file,
      new AbortController().signal,
      progress,
    );
    expect(
      f.access.write.mock.calls.map(([bytes]) => bytes.byteLength),
    ).toEqual([LOCAL_WORKSPACE_LIMITS.ioChunkBytes, 10]);
    expect(progress.mock.calls).toEqual([
      [LOCAL_WORKSPACE_LIMITS.ioChunkBytes],
      [file.size],
    ]);
    expect(f.access.close).toHaveBeenCalledOnce();
    expect(f.directory.removeEntry).not.toHaveBeenCalled();
  });
  it("cancels mid-copy without publishing a completed artifact", async () => {
    const file = new Blob([
      new Uint8Array(LOCAL_WORKSPACE_LIMITS.ioChunkBytes + 10),
    ]);
    const f = fixture(file);
    const controller = new AbortController();
    await expect(
      copyLocalSource(f.folder, "opaque", file, controller.signal, () =>
        controller.abort(),
      ),
    ).rejects.toMatchObject({ code: "canceled" });
    expect(f.access.close).toHaveBeenCalledOnce();
    expect(f.directory.removeEntry).toHaveBeenCalledOnce();
  });
});
