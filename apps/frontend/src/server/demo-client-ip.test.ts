import { expect, it } from "vitest";
import { hostedDemoClientIp } from "./demo-client-ip";
it("uses the observed native Cloud Run client suffix and ignores supplied prefixes and alternate headers", () => {
  for (const [forwarded, expected] of [
    ["192.0.2.5", "192.0.2.5"],
    ["203.0.113.9, 192.0.2.5", "192.0.2.5"],
    ["anything, 203.0.113.9, 198.51.100.1, 192.0.2.5", "192.0.2.5"],
    ["203.0.113.9, 2001:db8::5", "2001:db8::5"],
  ] as const) {
    const headers = new Headers({
      "x-forwarded-for": forwarded,
      "x-clipbuilder-client-ip": "203.0.113.9",
      "x-real-ip": "203.0.113.9",
      "cf-connecting-ip": "203.0.113.9",
      forwarded: "for=203.0.113.9",
    });
    expect(hostedDemoClientIp(headers, true)).toBe(expected);
    expect(() => hostedDemoClientIp(headers, false)).toThrow();
  }
});
it("fails closed for absent, malformed, port-bearing and oversized trusted suffixes", () => {
  expect(() => hostedDemoClientIp(new Headers(), true)).toThrow();
  for (const value of [
    "spoofed, not-an-ip",
    "192.0.2.1:80",
    "",
    "192.0.2.5, ",
    "192.0.2.5, 198.51.100.1:80",
    "1".repeat(4097),
  ])
    expect(() =>
      hostedDemoClientIp(new Headers({ "x-forwarded-for": value }), true),
    ).toThrow();
});
