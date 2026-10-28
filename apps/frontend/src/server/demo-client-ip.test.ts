import { expect, it } from "vitest";
import { hostedDemoClientIp } from "./demo-client-ip";
it("uses only the verified Google LB suffix and ignores spoofed prefixes/client headers", () => {
  const headers = new Headers({
    "x-forwarded-for": "anything, 203.0.113.9, 192.0.2.5, 198.51.100.1",
    "x-clipbuilder-client-ip": "203.0.113.9",
  });
  expect(hostedDemoClientIp(headers, true)).toBe("192.0.2.5");
  expect(() => hostedDemoClientIp(headers, false)).toThrow();
  for (const value of [
    "192.0.2.1",
    "spoofed, not-an-ip",
    "192.0.2.1:80, 198.51.100.1",
    "",
  ])
    expect(() =>
      hostedDemoClientIp(new Headers({ "x-forwarded-for": value }), true),
    ).toThrow();
});
