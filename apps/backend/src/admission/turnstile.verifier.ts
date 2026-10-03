import { z } from "zod";
import type { BackendConfig } from "../config/env.schema.js";
import type { AbuseVerifier } from "./processing.admission.js";

export function composeAbuseVerifier(
  config: BackendConfig,
  transport: typeof fetch = fetch,
): AbuseVerifier {
  if (!config.turnstile.secretKey || !config.turnstile.expectedHostname)
    return { verify: async () => false };
  const responseSchema = z.object({
    success: z.boolean(),
    hostname: z.string().optional(),
    action: z.string().optional(),
    cdata: z.string().optional(),
  });
  return {
    async verify(input) {
      const signal = AbortSignal.any([
        input.signal,
        AbortSignal.timeout(config.turnstile.timeoutMs),
      ]);
      let response: Response | undefined;
      try {
        response = await transport(
          "https://challenges.cloudflare.com/turnstile/v0/siteverify",
          {
            method: "POST",
            redirect: "error",
            signal,
            body: new URLSearchParams({
              secret: config.turnstile.secretKey!,
              response: input.token,
            }),
          },
        );
        if (!response.ok || !response.body) return false;
        const reader = response.body.getReader();
        let size = 0;
        const chunks: Uint8Array[] = [];
        try {
          for (;;) {
            const chunk = await reader.read();
            if (chunk.done) break;
            size += chunk.value.byteLength;
            if (size > 8192) return false;
            chunks.push(chunk.value);
          }
        } finally {
          await reader.cancel();
          reader.releaseLock();
        }
        const result = responseSchema.parse(
          JSON.parse(Buffer.concat(chunks).toString("utf8")),
        );
        return (
          result.success &&
          result.hostname === config.turnstile.expectedHostname &&
          result.action === input.action &&
          result.cdata === input.sessionId
        );
      } catch {
        return false;
      } finally {
        if (response?.body && !response.body.locked)
          await response.body.cancel().catch(() => undefined);
      }
    },
  };
}
