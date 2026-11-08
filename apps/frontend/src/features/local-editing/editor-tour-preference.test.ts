import { expect, it, vi } from "vitest";

it("remembers completion across refreshes without repeating the automatic tour", async () => {
  vi.resetModules();
  const first = await import("./editor-tour-preference");
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, value);
    }),
  };
  expect(first.editorTourSeen(storage)).toBe(false);
  first.rememberEditorTour(storage);
  first.rememberEditorTour(storage);
  expect(storage.setItem).toHaveBeenCalledTimes(1);
  expect([...values]).toEqual([[first.EDITOR_TOUR_SEEN_KEY, "seen"]]);
  vi.resetModules();
  const reloaded = await import("./editor-tour-preference");
  expect(reloaded.editorTourSeen(storage)).toBe(true);
  expect([...values]).toEqual([[first.EDITOR_TOUR_SEEN_KEY, "seen"]]);
});

it("does not repeat between clips when storage is blocked", async () => {
  vi.resetModules();
  const tour = await import("./editor-tour-preference");
  const blocked = {
    getItem: () => {
      throw Error("blocked");
    },
    setItem: () => {
      throw Error("blocked");
    },
  };
  expect(tour.editorTourSeen(blocked)).toBe(false);
  expect(() => tour.rememberEditorTour(blocked)).not.toThrow();
  expect(tour.editorTourSeen(blocked)).toBe(true);
  expect(tour.editorTourSeen(null)).toBe(true);
  tour.resetEditorTour(null);
  expect(tour.editorTourSeen(null)).toBe(false);
  tour.rememberEditorTour(blocked);
  expect(tour.editorTourSeen(blocked)).toBe(true);
});

it("re-arms only the tour preference across a fresh session and reload", async () => {
  vi.resetModules();
  const tour = await import("./editor-tour-preference");
  const values = new Map([
    [tour.EDITOR_TOUR_SEEN_KEY, "seen"],
    ["other-preference", "keep"],
  ]);
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  };
  expect(tour.editorTourSeen(storage)).toBe(true);
  tour.rememberEditorTour(storage);
  tour.resetEditorTour(storage);
  expect(tour.editorTourSeen(storage)).toBe(false);
  expect([...values]).toEqual([["other-preference", "keep"]]);
  vi.resetModules();
  const reloaded = await import("./editor-tour-preference");
  expect(reloaded.editorTourSeen(storage)).toBe(false);
  reloaded.rememberEditorTour(storage);
  expect(reloaded.editorTourSeen(storage)).toBe(true);
});

it("re-arms the current page even when stored seen state cannot be removed", async () => {
  vi.resetModules();
  const tour = await import("./editor-tour-preference");
  const storage = {
    getItem: () => "seen",
    removeItem: () => {
      throw Error("blocked");
    },
  };
  expect(tour.editorTourSeen(storage)).toBe(true);
  tour.rememberEditorTour(null);
  expect(tour.editorTourSeen(storage)).toBe(true);
  expect(() => tour.resetEditorTour(storage)).not.toThrow();
  expect(tour.editorTourSeen(storage)).toBe(false);
});
