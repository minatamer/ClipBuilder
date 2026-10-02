import { randomBytes, randomUUID } from "node:crypto";
import type { BackendConfig } from "../config/env.schema.js";
import { ProcessingAdmission } from "./processing.admission.js";
import { ProcessingGrantCodec, readGrantKeys } from "./processing.grant.js";

export function composeAdmission(
  config: BackendConfig,
): ProcessingAdmission | null {
  if (!config.admission.grantsEnabled) return null;
  const keys = readGrantKeys(
    config.session.processingGrantKeysJson!,
    config.session.processingGrantActiveKeyId!,
  );
  const now = () => Date.now();
  const codec = new ProcessingGrantCodec(
    keys,
    config.session.processingGrantActiveKeyId!,
    randomUUID(),
    now,
    config.session.accessTtlSeconds * 1000,
  );
  return new ProcessingAdmission(
    codec,
    {
      ttlMs: config.session.accessTtlSeconds * 1000,
      maxRecords: config.admission.maxRecords,
      maxConcurrent: config.admission.maxConcurrentActions,
      maxDispatches: config.admission.maxProcessDispatches,
      rateWindowMs: config.admission.rateWindowSeconds * 1000,
      maxGrantsPerWindow: config.admission.rateGrant,
      allowedOrigins: config.session.csrfAllowedOrigins,
      paidEnabled: false,
      timeoutMs: config.gemini.timeoutMs,
    },
    { verify: async () => false },
    now,
    randomBytes(32),
  );
}
