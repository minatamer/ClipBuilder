import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { lstat, mkdir, mkdtemp, readdir, rm, symlink } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { prepareOwnerStorage, resolveOwnerStorage } from "./owner-storage.ts";

let directory: string;
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "clipbuilder-owner-folder-test-"));
});
afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

it("resolves redirected Downloads by default and Desktop only when selected, without creating library folders", async () => {
  const downloads = join(directory, "redirected-downloads"),
    desktop = join(directory, "redirected-desktop");
  await mkdir(downloads);
  await mkdir(desktop);
  const lookup = vi.fn(async (name) =>
    name === "Desktop" ? desktop : downloads,
  );
  expect(await resolveOwnerStorage("downloads", lookup)).toBe(
    join(downloads, "ClipBuilder"),
  );
  expect(await resolveOwnerStorage("desktop", lookup)).toBe(
    join(desktop, "ClipBuilder"),
  );
  expect(lookup.mock.calls.map((call) => call[0])).toEqual([
    "{374DE290-123F-4565-9164-39C4925E467B}",
    "Desktop",
  ]);
  expect(await readdir(downloads)).toEqual([]);
  expect(await readdir(desktop)).toEqual([]);
  expect(await prepareOwnerStorage(join(downloads, "ClipBuilder"))).toBe(false);
  expect(await prepareOwnerStorage(join(downloads, "ClipBuilder"), true)).toBe(
    true,
  );
  expect((await lstat(join(downloads, "ClipBuilder"))).isDirectory()).toBe(
    true,
  );
});

it("refuses a Git-contained or linked destination before creating storage and has no location fallback", async () => {
  const checkout = join(directory, "checkout"),
    elsewhere = join(directory, "elsewhere"),
    linked = join(directory, "linked");
  await mkdir(join(checkout, ".git"), { recursive: true });
  await mkdir(elsewhere);
  await symlink(elsewhere, linked, "junction");
  await expect(
    resolveOwnerStorage("downloads", async () => checkout),
  ).rejects.toThrow("owner_storage_in_repository");
  await expect(
    prepareOwnerStorage(join(checkout, "ClipBuilder"), true),
  ).rejects.toThrow("owner_storage_in_repository");
  await expect(
    resolveOwnerStorage("desktop", async () => linked),
  ).rejects.toThrow("invalid_path");
  await expect(
    resolveOwnerStorage("desktop", async () => "relative-folder"),
  ).rejects.toThrow("owner_storage_unavailable");
  await expect(
    resolveOwnerStorage("desktop", async () => {
      throw new Error("synthetic_lookup_failure");
    }),
  ).rejects.toThrow("synthetic_lookup_failure");
  expect(await readdir(checkout)).toEqual([".git"]);
  expect(await readdir(elsewhere)).toEqual([]);
});
