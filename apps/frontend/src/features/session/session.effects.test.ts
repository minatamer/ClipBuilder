import { afterEach, describe, expect, it, vi } from "vitest";
import { SessionEffectRegistry } from "./session.effects";

afterEach(() => vi.restoreAllMocks());

describe("session effect cleanup", () => {
  it("attempts every stopper and URL after a cleanup failure", () => {
    const failures = vi.fn();
    const registry = new SessionEffectRegistry(failures);
    const later = vi.fn();
    const revoke = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation((url) => {
        if (url === "blob:first") throw new Error("synthetic failure");
      });
    registry.registerStopper(() => {
      throw new Error("synthetic failure");
    });
    registry.registerStopper(later);
    registry.registerObjectUrl("blob:first");
    registry.registerObjectUrl("blob:second");

    expect(() => registry.clear()).not.toThrow();
    expect(later).toHaveBeenCalledOnce();
    expect(revoke.mock.calls).toEqual([["blob:first"], ["blob:second"]]);
    expect(registry.ownedEffectCount).toBe(0);
    expect(failures.mock.calls).toEqual([["stopper"], ["object-url"]]);
    registry.clear();
    expect(later).toHaveBeenCalledOnce();
  });

  it("drains ownership before recursive clear or unregister callbacks", () => {
    const registry = new SessionEffectRegistry();
    const later = vi.fn();
    let unregister = () => {};
    registry.registerStopper(() => {
      registry.clear();
      unregister();
    });
    unregister = registry.registerStopper(later);
    registry.clear();
    expect(later).toHaveBeenCalledOnce();
    expect(registry.ownedEffectCount).toBe(0);
  });
});
