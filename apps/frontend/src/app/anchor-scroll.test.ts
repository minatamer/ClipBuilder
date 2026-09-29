import { afterEach, describe, expect, it, vi } from "vitest";

import { scrollToAnchor } from "./anchor-scroll";

class AnchorTarget {
  getBoundingClientRect() {
    return { top: 640 };
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("scrollToAnchor", () => {
  it("animates to the target without adding its fragment to the URL", () => {
    const target = new AnchorTarget();
    const replaceState = vi.fn();
    const scrollTo = vi.fn();
    let animationFrame: FrameRequestCallback | undefined;

    vi.stubGlobal("HTMLElement", AnchorTarget);
    vi.stubGlobal("document", {
      documentElement: { style: { scrollBehavior: "smooth" } },
      querySelector: vi.fn(() => target),
    });
    vi.stubGlobal("window", {
      cancelAnimationFrame: vi.fn(),
      history: { replaceState },
      performance: { now: () => 0 },
      requestAnimationFrame: vi.fn((callback: FrameRequestCallback) => {
        animationFrame = callback;
        return 1;
      }),
      scrollTo,
      scrollY: 0,
    });

    expect(scrollToAnchor("#how-it-works")).toBe(true);
    expect(replaceState).not.toHaveBeenCalled();

    animationFrame?.(900);

    expect(scrollTo).toHaveBeenLastCalledWith(0, 640);
  });
});
