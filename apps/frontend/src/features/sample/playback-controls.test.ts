import { afterEach, describe, expect, it, vi } from "vitest";
import { PlaybackControls } from "./playback-controls";
afterEach(() => vi.useRealTimers());
describe("all workflow playback controls", () => {
  it("keeps mouse controls visible throughout hover and hides on leave even paused", () => {
    vi.useFakeTimers();
    const notify = vi.fn(),
      controls = new PlaybackControls(notify);
    controls.update({ mouse: true, playing: true });
    expect(notify).toHaveBeenLastCalledWith(false);
    controls.enter("mouse");
    vi.advanceTimersByTime(10_000);
    expect(notify).toHaveBeenLastCalledWith(true);
    controls.leave("mouse");
    expect(notify).toHaveBeenLastCalledWith(false);
    controls.update({ playing: false });
    expect(notify).toHaveBeenLastCalledWith(false);
    controls.dispose();
    expect(vi.getTimerCount()).toBe(0);
  });
  it.each(["touch", "pen"])(
    "reveals on %s and idles after playback interaction",
    (pointer) => {
      vi.useFakeTimers();
      const notify = vi.fn(),
        controls = new PlaybackControls(notify);
      controls.update({ playing: true });
      controls.enter(pointer);
      vi.advanceTimersByTime(2199);
      expect(notify).toHaveBeenLastCalledWith(true);
      vi.advanceTimersByTime(1);
      expect(notify).toHaveBeenLastCalledWith(false);
      controls.interact();
      expect(notify).toHaveBeenLastCalledWith(true);
      controls.update({ playing: false });
      vi.advanceTimersByTime(3000);
      expect(notify).toHaveBeenLastCalledWith(true);
      controls.dispose();
    },
  );
  it("pins focused/dragged/open-volume/busy controls and removes idle work on disposal", () => {
    vi.useFakeTimers();
    const notify = vi.fn(),
      controls = new PlaybackControls(notify);
    controls.update({ playing: true, mouse: true, locked: true });
    controls.leave("mouse");
    expect(notify).toHaveBeenLastCalledWith(true);
    controls.update({ locked: false });
    expect(notify).toHaveBeenLastCalledWith(false);
    controls.update({ busy: true });
    expect(notify).toHaveBeenLastCalledWith(true);
    controls.update({ busy: false, mouse: false });
    controls.interact();
    expect(vi.getTimerCount()).toBe(1);
    controls.dispose();
    const calls = notify.mock.calls.length;
    vi.advanceTimersByTime(3000);
    controls.interact();
    expect(notify).toHaveBeenCalledTimes(calls);
    expect(vi.getTimerCount()).toBe(0);
  });
});
