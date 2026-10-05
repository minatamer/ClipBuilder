import { describe, expect, it } from "vitest";
import { SAFE_ERROR_MESSAGES, type SafeError } from "@clipbuilder/contracts";
import { SampleApiFailure } from "../sample/sample.api";
import { LocalMediaError, localMediaFailure } from "./media.errors";

describe("local and canonical remote media failures", () => {
  it.each([
    "ANALYSIS_PROVIDER_FAILED",
    "MODEL_OUTPUT_REJECTED",
    "STORAGE_FAILED",
    "SESSION_EXPIRED",
  ] as const)(
    "preserves remote %s evidence instead of reporting storage",
    (code) => {
      const failure: SafeError = {
        code,
        message: SAFE_ERROR_MESSAGES[code],
        requestId: `req_${"a".repeat(32)}`,
        retryable: false,
      };
      expect(localMediaFailure(new SampleApiFailure(failure))).toEqual(failure);
    },
  );
  it("keeps real local storage mapping", () => {
    expect(localMediaFailure(new LocalMediaError("storage"))).toMatchObject({
      code: "STORAGE_FAILED",
      message: SAFE_ERROR_MESSAGES.STORAGE_FAILED,
      retryable: false,
    });
  });
  it("does not forward arbitrary remote messages or unknown exception text", () => {
    const invalid = {
      code: "ANALYSIS_PROVIDER_FAILED",
      message: "synthetic-private",
      requestId: `req_${"a".repeat(32)}`,
      retryable: false,
    } as SafeError;
    for (const error of [
      new SampleApiFailure(invalid),
      new Error("synthetic-private"),
    ]) {
      expect(JSON.stringify(localMediaFailure(error))).not.toContain(
        "synthetic-private",
      );
    }
  });
});
