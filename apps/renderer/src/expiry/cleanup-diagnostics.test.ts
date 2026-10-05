import { describe, expect, it } from "vitest";
import {
  CleanupDiagnostics,
  type CleanupDiagnostic,
} from "./cleanup-diagnostics.js";

describe("content-free cleanup diagnostics", () => {
  it("correlates stages while excluding raw exceptions and capabilities", async () => {
    const records: CleanupDiagnostic[] = [];
    const trace = new CleanupDiagnostics((record) =>
      records.push(record),
    ).trace("admission");
    const error = Object.assign(
      new Error(
        "synthetic private filename and https://secret.invalid/?token=synthetic",
      ),
      {
        response: { status: 503, data: "synthetic credential" },
      },
    );
    await expect(
      trace.step("intent_list", async () => {
        throw error;
      }),
    ).rejects.toBe(error);
    const serialized = JSON.stringify(records);
    expect(serialized).not.toMatch(
      /secret\.invalid|credential|filename|token=/,
    );
    expect(records[1]).toMatchObject({
      outcome: "failed",
      httpStatus: 503,
      errorKind: "Error",
      message: "Bounded cleanup journal inventory: failed",
    });
    expect(records[0].diagnosticId).toBe(records[1].diagnosticId);
  });
  it("cannot change processing when logging throws", async () => {
    const trace = new CleanupDiagnostics(() => {
      throw new Error("synthetic failed logger");
    }).trace("cleanup");
    expect(await trace.step("intent_delete", async () => 7)).toBe(7);
    const error = new Error("synthetic deletion failure");
    await expect(
      trace.step("intent_delete", async () => {
        throw error;
      }),
    ).rejects.toBe(error);
  });
  it("drops unknown facts and arbitrary error names rather than logging them", async () => {
    const records: CleanupDiagnostic[] = [];
    const trace = new CleanupDiagnostics((record) =>
      records.push(record),
    ).trace("sweep");
    const facts = { sessions: 1, token: "synthetic private value" };
    trace.record("intake_check", "blocked", facts);
    const error = Object.assign(new Error("synthetic private value"), {
      name: "synthetic private name",
      code: "synthetic private code",
    });
    await expect(
      trace.step("disposable_policy", async () => {
        throw error;
      }),
    ).rejects.toBe(error);
    expect(JSON.stringify(records)).not.toContain("synthetic private");
    expect(records[0].sessions).toBeUndefined();
    expect(records[2].errorKind).toBeUndefined();
  });
});
