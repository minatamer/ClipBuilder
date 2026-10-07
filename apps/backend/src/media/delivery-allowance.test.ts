import { describe, expect, it } from "vitest";
import { MediaDeliveryAllowance } from "./delivery-allowance.js";

describe("session media delivery allowance", () => {
  const signal = new AbortController().signal;
  it("permits seeking, refresh and eight maximum-size downloads but bounds repeated egress", () => {
    const allowance = new MediaDeliveryAllowance(() => 1000);
    const session = "synthetic-session";
    for (let i = 0; i < 16; i++) {
      allowance.reserveMetadata(session, 7201000, signal);
      allowance.reserveContent(session, 24 * 1024 * 1024, signal);
    }
    for (let i = 0; i < 8; i++) {
      allowance.reserveMetadata(session, 7201000, signal);
      allowance.reserveContent(session, 200 * 1024 * 1024, signal);
    }
    expect(() =>
      allowance.reserveContent(session, 200 * 1024 * 1024, signal),
    ).toThrow("RATE_LIMITED");
    // Reopening another artifact/alias never replenishes the session allowance.
    allowance.reserveMetadata(session, 7201000, signal);
    expect(() =>
      allowance.reserveContent(session, 200 * 1024 * 1024, signal),
    ).toThrow("RATE_LIMITED");
  });
  it("bounds small range requests and metadata independently before remote I/O", () => {
    const allowance = new MediaDeliveryAllowance(() => 1000);
    for (let i = 0; i < 64; i++)
      allowance.reserveMetadata("session", 7201000, signal);
    expect(() => allowance.reserveMetadata("session", 7201000, signal)).toThrow(
      "RATE_LIMITED",
    );
    for (let i = 0; i < 1024; i++)
      allowance.reserveContent("session", 1, signal);
    expect(() => allowance.reserveContent("session", 1, signal)).toThrow(
      "RATE_LIMITED",
    );
    allowance.reserveMetadata("another-session", 7201000, signal);
    allowance.reserveContent("another-session", 10, signal);
  });
  it("rejects aborted/expired reads and bounds retained records without refunding failed attempts", () => {
    let now = 1000;
    const allowance = new MediaDeliveryAllowance(() => now);
    for (let i = 0; i < 64; i++)
      allowance.reserveMetadata(`session-${i}`, 2000, signal);
    expect(() => allowance.reserveMetadata("overflow", 2000, signal)).toThrow(
      "CAPACITY_FULL",
    );
    const controller = new AbortController();
    controller.abort();
    expect(() =>
      allowance.reserveContent("session-0", 1, controller.signal),
    ).toThrow();
    now = 2000;
    expect(() => allowance.reserveContent("session-0", 1, signal)).toThrow(
      "SESSION_INVALID",
    );
    allowance.reserveMetadata("new-session", 3000, signal);
    allowance.reserveContent("new-session", 1, signal);
    expect(() =>
      allowance.reserveMetadata("new-session", 4000, signal),
    ).toThrow("SESSION_INVALID");
  });
});
