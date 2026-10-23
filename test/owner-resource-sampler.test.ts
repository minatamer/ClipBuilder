import { expect, it } from "vitest";
import { resourceDescendants } from "./owner-resource-sampler.ts";

it("excludes unrelated older process trees whose former parent PID is reused by a test child", () => {
  const row = (pid: number, parent: number, hour: string) => ({
    pid,
    parent,
    created: `2026-01-01T${hour}:00:00.000Z`,
    name: "synthetic.exe",
    rss: 1,
    threads: 1,
  });
  const rows = [
    row(1, 0, "10"),
    row(2, 1, "11"),
    row(3, 2, "12"),
    row(4, 2, "07"),
    row(5, 4, "08"),
  ];
  expect(resourceDescendants(rows, 1).map((item) => item.pid)).toEqual([
    1, 2, 3,
  ]);
  expect(resourceDescendants(rows, 9)).toEqual([]);
});

it("keeps real descendants created in the same clock millisecond", () => {
  const rows = [1, 2, 3].map((pid) => ({
    pid,
    parent: pid - 1,
    created: "2026-01-01T10:00:00.000Z",
    name: "synthetic.exe",
    rss: 1,
    threads: 1,
  }));
  expect(resourceDescendants(rows, 1).map((item) => item.pid)).toEqual([
    1, 2, 3,
  ]);
});
