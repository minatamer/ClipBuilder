import { describe, expect, it, vi } from "vitest";
import { withTruncatedSyncAccess } from "./sync-access.mjs";

describe("owned sync access lifetime", () => {
  it("closes on truncation failure before running any setup", async () => {
    const access = {
      truncate: vi.fn(() => {
        throw new Error("quota-denied");
      }),
      close: vi.fn(),
    };
    const run = vi.fn();
    await expect(
      withTruncatedSyncAccess(
        { createSyncAccessHandle: async () => access },
        run,
      ),
    ).rejects.toThrow("quota-denied");
    expect(run).not.toHaveBeenCalled();
    expect(access.close).toHaveBeenCalledExactlyOnceWith();
  });

  it("closes when constructor/setup code inside the scope fails", async () => {
    const access = { truncate: vi.fn(), close: vi.fn() };
    await expect(
      withTruncatedSyncAccess(
        { createSyncAccessHandle: async () => access },
        () => {
          throw new Error("setup-failed");
        },
      ),
    ).rejects.toThrow("setup-failed");
    expect(access.truncate).toHaveBeenCalledExactlyOnceWith(0);
    expect(access.close).toHaveBeenCalledExactlyOnceWith();
  });

  it("closes after asynchronous work fails or succeeds", async () => {
    const access = { truncate: vi.fn(), close: vi.fn() };
    const handle = { createSyncAccessHandle: async () => access };
    await expect(
      withTruncatedSyncAccess(handle, async () => {
        throw new Error("encode-failed");
      }),
    ).rejects.toThrow("encode-failed");
    expect(access.close).toHaveBeenCalledTimes(1);
    await expect(withTruncatedSyncAccess(handle, async () => 7)).resolves.toBe(
      7,
    );
    expect(access.close).toHaveBeenCalledTimes(2);
  });
});
