import { describe, expect, it, vi } from "vitest";
import { PreviewPlaybackTrace } from "./preview-playback.diagnostics";
const summary = { captions: 4, cards: 1, matched: 3, held: 2, wide: 1 };
describe("bounded content-free preview trace", () => {
  it("distinguishes automatic backwards movement from intentional seeks", () => {
    let time = 100;
    const sink = vi.fn();
    const trace = new PreviewPlaybackTrace(
      "12345678-1234-4234-8234-123456789abc",
      summary,
      sink,
      () => time,
    );
    trace.sample(60, 2000, 30);
    trace.seeking();
    trace.sample(61, 1500, 30);
    trace.userSeek();
    trace.seeking();
    trace.sample(10, 300, 30);
    time += 1600;
    trace.sample(11, 366, 30);
    trace.event("buffering");
    trace.event("resumed");
    trace.visualShown(0);
    trace.visualShown(0);
    trace.visualShown(1);
    trace.close();
    expect(sink.mock.calls.at(-1)?.[0]).toMatchObject({
      automaticSeeks: 1,
      userSeeks: 1,
      backwardsMediaJumps: 1,
      bufferingEvents: 1,
      maxDriftMs: 550,
      shownVisuals: 1,
    });
    const count = sink.mock.calls.length;
    trace.event("buffering");
    trace.close();
    trace.sample(2, 0, 30);
    expect(sink).toHaveBeenCalledTimes(count);
    expect(JSON.stringify(sink.mock.calls)).not.toMatch(
      /sourceUrl|currentTime|transcript|mediaMs/,
    );
  });
  it("reserves final evidence, bounds output and isolates failing sinks", () => {
    const sink = vi.fn();
    const trace = new PreviewPlaybackTrace(
      "12345678-1234-4234-8234-123456789abc",
      summary,
      sink,
      () => 100,
    );
    for (let n = 0; n < 100; n++) trace.event("buffering");
    trace.close();
    expect(sink).toHaveBeenCalledTimes(25);
    expect(sink.mock.calls.at(-1)?.[0]).toMatchObject({
      event: "closed",
      bufferingEvents: 100,
    });
    expect(() => {
      const failed = new PreviewPlaybackTrace(
        "12345678-1234-4234-8234-123456789abc",
        summary,
        () => {
          throw new Error();
        },
      );
      failed.close();
    }).not.toThrow();
    expect(
      () => new PreviewPlaybackTrace("private-value", summary, sink),
    ).toThrow();
  });
});
