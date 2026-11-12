/** Trusted process composition only; never a request-controlled timeout. */
export const OWNER_EXPORT_DEADLINE = {
  localMs: 20 * 60_000,
  hostedMs: 15 * 60_000,
  transportGraceMs: 60_000,
} as const;

export function ownerExportDeadlineMs(local = false) {
  return local ? OWNER_EXPORT_DEADLINE.localMs : OWNER_EXPORT_DEADLINE.hostedMs;
}
