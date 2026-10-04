import { randomBytes, randomUUID } from "node:crypto";
import type { BackendConfig } from "../config/env.schema.js";
import { ProcessingAdmission } from "./processing.admission.js";
import { ProcessingGrantCodec, readGrantKey } from "./processing.grant.js";
import { composeAbuseVerifier } from "./turnstile.verifier.js";
import { TEMPORARY_MEDIA_LIMITS } from "@clipbuilder/contracts";

export function composeAdmission(
  config: BackendConfig,
): ProcessingAdmission | null {
  if (!config.admission.grantsEnabled) return null;
  const keys = {
    [config.session.processingGrantActiveKeyId]: readGrantKey(
      config.session.processingGrantKey!,
    ),
  };
  const now = () => Date.now();
  const codec = new ProcessingGrantCodec(
    keys,
    config.session.processingGrantActiveKeyId,
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
      paidEnabled:
        config.paidDemoEnabled &&
        config.features.liveAnalysis &&
        config.renderer.spendApproved,
      timeoutMs: TEMPORARY_MEDIA_LIMITS.workDeadlineMs,
    },
    composeAbuseVerifier(config),
    now,
    randomBytes(32),
  );
}
