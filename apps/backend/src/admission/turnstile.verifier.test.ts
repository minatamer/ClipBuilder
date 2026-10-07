import { describe, expect, it, vi } from "vitest";
import { loadConfig } from "../config/loadConfig.js";
import { composeAbuseVerifier } from "./turnstile.verifier.js";
describe("bounded processing abuse verification", () => {
  it("checks hostname, action and session binding with one call, rejecting malformed responses without retry", async () => {
    const base = loadConfig({ FAKE_MODE: "true", PAID_DEMO_ENABLED: "false" }),
      config = {
        ...base,
        turnstile: {
          ...base.turnstile,
          secretKey: "synthetic-key",
          expectedHostname: "localhost",
        },
      };
    const value = {
      success: true,
      hostname: "localhost",
      action: "candidate-analysis",
      cdata: "ses_" + "a".repeat(22),
    };
    const transport = vi.fn(async () => Response.json(value)),
      verifier = composeAbuseVerifier(config, transport);
    const input = {
      token: "synthetic-token",
      action: "candidate-analysis" as const,
      sessionId: value.cdata,
      signal: new AbortController().signal,
    };
    expect(await verifier.verify(input)).toBe(true);
    for (const response of [
      { ...value, hostname: "other" },
      { ...value, action: "transcription" },
      { ...value, cdata: "wrong" },
      { success: false },
    ]) {
      transport.mockResolvedValueOnce(Response.json(response));
      expect(await verifier.verify(input)).toBe(false);
    }
    expect(transport).toHaveBeenCalledTimes(5);
    transport.mockRejectedValueOnce(new Error("synthetic-private"));
    expect(await verifier.verify(input)).toBe(false);
    expect(transport).toHaveBeenCalledTimes(6);
    const bootstrap = {
      ...input,
      action: "session-start" as const,
      sessionId: "00000000-0000-4000-8000-000000000001",
    };
    transport.mockResolvedValueOnce(
      Response.json({
        ...value,
        action: "session-start",
        cdata: bootstrap.sessionId,
      }),
    );
    expect(await verifier.verify(bootstrap)).toBe(true);
    transport.mockResolvedValueOnce(Response.json(value));
    expect(await verifier.verify(bootstrap)).toBe(false);
    expect(transport).toHaveBeenCalledTimes(8);
  });
});
