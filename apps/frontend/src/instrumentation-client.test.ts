import { afterEach, expect, it, vi } from "vitest";

afterEach(() => vi.unstubAllGlobals());

it("constructs and validates browser contracts without probing runtime code generation", async () => {
  vi.resetModules();
  const compile = vi.fn(() => {
    throw new Error("synthetic-csp-eval-denied");
  });
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
