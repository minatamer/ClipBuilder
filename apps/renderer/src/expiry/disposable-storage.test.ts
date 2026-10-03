import { describe, expect, it } from "vitest";
import { assertDisposableMetadata } from "./gcs-media-store.js";
describe("temporary bucket policy gate", () => {
  it("rejects negative retention metadata instead of treating it as disposable", () => {
    expect(() =>
      assertDisposableMetadata({
        ...base(),
        softDeletePolicy: { retentionDurationSeconds: "-1" },
      }),
    ).toThrow();
  });
  const base = () => ({
    iamConfiguration: {
      uniformBucketLevelAccess: { enabled: true },
      publicAccessPrevention: "enforced",
    },
    softDeletePolicy: { retentionDurationSeconds: "0" },
    versioning: { enabled: false },
    defaultEventBasedHold: false,
  });
  it("accepts explicit disposable private metadata", () =>
    expect(() => assertDisposableMetadata(base())).not.toThrow());
  it.each(["softDelete", "versions", "retention", "hold", "public", "uniform"])(
    "rejects %s before intake/deletion can claim success",
    (kind) => {
      const value: Record<string, unknown> = base();
      if (kind === "softDelete")
        value.softDeletePolicy = { retentionDurationSeconds: "604800" };
      if (kind === "versions") value.versioning = { enabled: true };
      if (kind === "retention")
        value.retentionPolicy = { retentionPeriod: "60" };
      if (kind === "hold") value.defaultEventBasedHold = true;
      if (kind === "public")
        value.iamConfiguration = {
          uniformBucketLevelAccess: { enabled: true },
          publicAccessPrevention: "inherited",
        };
      if (kind === "uniform")
        value.iamConfiguration = {
          uniformBucketLevelAccess: { enabled: false },
          publicAccessPrevention: "enforced",
        };
      expect(() => assertDisposableMetadata(value)).toThrow();
    },
  );
});
