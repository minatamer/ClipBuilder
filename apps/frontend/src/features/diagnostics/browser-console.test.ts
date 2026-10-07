import { describe, expect, it, vi } from "vitest";
import { BROWSER_CONSOLE_LEVELS } from "@clipbuilder/contracts";
import { installPrivateBrowserConsole } from "./browser-console";

describe("private framework/client console routing", () => {
  it("routes every supported level without printing raw arguments and restores ownership", () => {
    const target: Pick<Console, (typeof BROWSER_CONSOLE_LEVELS)[number]> = {
      debug: vi.fn(),
      info: vi.fn(),
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      trace: vi.fn(),
    };
    const originals = { ...target };
    const events = new EventTarget(),
      report = vi.fn();
    const dispose = installPrivateBrowserConsole(target, events, report);
    expect(installPrivateBrowserConsole(target, events, report)).toBe(dispose);
    const error = Object.assign(new TypeError("synthetic-secret-sentinel"), {
      digest: "12345",
    });
    for (const level of BROWSER_CONSOLE_LEVELS)
      target[level](error, { token: "synthetic-secret-sentinel" });
    expect(report).toHaveBeenCalledTimes(6);
    expect(report.mock.calls[4]?.[0]).toEqual({
      kind: "browser-console",
      source: "console",
      level: "error",
      argumentCount: 2,
      errorClass: "TypeError",
      digest: "12345",
    });
    expect(JSON.stringify(report.mock.calls)).not.toContain(
      "synthetic-secret-sentinel",
    );
    for (const original of Object.values(originals))
      expect(original).not.toHaveBeenCalled();
    dispose();
    for (const level of BROWSER_CONSOLE_LEVELS)
      expect(target[level]).toBe(originals[level]);
  });
  it("suppresses default uncaught reporting, isolates a failed sink and removes listeners", () => {
    const target: Pick<Console, (typeof BROWSER_CONSOLE_LEVELS)[number]> = {
      debug: vi.fn(),
      info: vi.fn(),
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      trace: vi.fn(),
    };
    const events = new EventTarget();
    const report = vi.fn(() => {
      throw new Error("synthetic failed sink");
    });
    const dispose = installPrivateBrowserConsole(target, events, report);
    const event = new Event("unhandledrejection", { cancelable: true });
    events.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(report).toHaveBeenCalledOnce();
    dispose();
    events.dispatchEvent(new Event("unhandledrejection"));
    expect(report).toHaveBeenCalledOnce();
  });
});
