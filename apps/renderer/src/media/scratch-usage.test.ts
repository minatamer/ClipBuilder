import { Stats } from "node:fs";
import { lstat, readdir } from "node:fs/promises";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { measureScratchBytes } from "./scratch-usage.js";

vi.mock("node:fs/promises", () => ({ lstat: vi.fn(), readdir: vi.fn() }));

function entry(size: number, directory = false) {
  return Object.assign(new Stats(), {
    size,
    isDirectory: () => directory,
  });
}

describe("owned scratch accounting", () => {
  beforeEach(() => vi.resetAllMocks());

  it("counts files and Linux profile links/sockets without traversing link targets", async () => {
    vi.mocked(readdir)
      .mockResolvedValueOnce(["selected.mp4", "profile"])
      .mockResolvedValueOnce(["SingletonLock", "SingletonSocket", "Cache"])
      .mockResolvedValueOnce(["frame"]);
    vi.mocked(lstat)
      .mockResolvedValueOnce(entry(1000))
      .mockResolvedValueOnce(entry(0, true))
      .mockResolvedValueOnce(entry(24))
      .mockResolvedValueOnce(entry(0))
      .mockResolvedValueOnce(entry(0, true))
      .mockResolvedValueOnce(entry(2000));

    expect(await measureScratchBytes("scratch")).toBe(3024);
    expect(vi.mocked(readdir).mock.calls.map(([path]) => path)).toEqual([
      "scratch",
      join("scratch", "profile"),
      join("scratch", "profile", "Cache"),
    ]);
    expect(lstat).toHaveBeenCalledTimes(6);
  });

  it("tolerates files and directories disappearing during a scan", async () => {
    const missing = Object.assign(new Error("synthetic removed entry"), {
      code: "ENOENT",
    });
    vi.mocked(readdir)
      .mockResolvedValueOnce(["gone", "cache", "source"])
      .mockRejectedValueOnce(missing);
    vi.mocked(lstat)
      .mockRejectedValueOnce(missing)
      .mockResolvedValueOnce(entry(0, true))
      .mockResolvedValueOnce(entry(1024));
    expect(await measureScratchBytes("scratch")).toBe(1024);
  });

  it("keeps other filesystem errors fatal to the bounded operation", async () => {
    vi.mocked(readdir).mockResolvedValueOnce(["source"]);
    vi.mocked(lstat).mockRejectedValueOnce(
      Object.assign(new Error("synthetic access failure"), { code: "EACCES" }),
    );
    await expect(measureScratchBytes("scratch")).rejects.toMatchObject({
      code: "EACCES",
    });
  });
});
