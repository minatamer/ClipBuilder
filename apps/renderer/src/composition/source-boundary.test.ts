import { describe, expect, it } from "vitest";
import { resolve, join } from "node:path";
import { assertSelectedSource } from "./source-boundary.js";

describe("normalized source compositor boundary", () => {
  it("accepts only the selected copy and output in the owned job directory", () => {
    const directory = resolve("synthetic-job"),
      job = join(directory, "render.json"),
      output = join(directory, "output.mp4");
    expect(() =>
      assertSelectedSource(job, join(directory, "selected.mp4"), output),
    ).not.toThrow();
    for (const source of [
      join(directory, "source"),
      join(directory, "input.mp4"),
      resolve("other-job", "selected.mp4"),
    ])
      expect(() => assertSelectedSource(job, source, output)).toThrow(
        "invalid",
      );
    expect(() =>
      assertSelectedSource(
        job,
        join(directory, "selected.mp4"),
        resolve("other-job", "output.mp4"),
      ),
    ).toThrow("invalid");
  });
});
