import { afterEach, expect, it, vi } from "vitest";

afterEach(() => vi.unstubAllGlobals());

it("constructs and validates browser contracts without probing runtime code generation", async () => {
  vi.resetModules();
  const compile = vi.fn(function () {
    throw new Error("synthetic-csp-eval-denied");
  });
  const browser = Object.assign(new EventTarget(), {
    console: {
      debug: vi.fn(),
      info: vi.fn(),
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      trace: vi.fn(),
    },
  });
  vi.stubGlobal("window", browser);
  vi.stubGlobal("Function", compile);
  await import("./instrumentation-client");
  const { retainedSampleAnalysisResponseSchema } =
    await import("@clipbuilder/contracts");
  expect(
    retainedSampleAnalysisResponseSchema.parse({ generation: "1" }),
  ).toEqual({ generation: "1" });
  expect(
    retainedSampleAnalysisResponseSchema.safeParse({ generation: "-1" })
      .success,
  ).toBe(false);
  expect(compile).not.toHaveBeenCalled();
});
