import { ApplicationError } from "../http/errorMapper.js";

export const MEDIA_DELIVERY_LIMITS = {
  sessionBytes: 2 * 1024 * 1024 * 1024,
  contentRequests: 1024,
  metadataRequests: 64,
  retainedSessions: 64,
} as const;

type DeliveryRecord = {
  expiresAtMs: number;
  bytes: number;
  contentRequests: number;
  metadataRequests: number;
};

// One bounded ledger shared by preview, result restore, playback and download.
// Failed/uncertain attempts stay consumed; reopening never replenishes allowance.
export class MediaDeliveryAllowance {
  private readonly records = new Map<string, DeliveryRecord>();
  constructor(private readonly now = Date.now) {}

  private sweep() {
    for (const [session, record] of this.records)
      if (record.expiresAtMs <= this.now()) this.records.delete(session);
  }
  reserveMetadata(session: string, expiresAtMs: number, signal: AbortSignal) {
    signal.throwIfAborted();
    this.sweep();
    if (expiresAtMs <= this.now())
      throw new ApplicationError({ code: "SESSION_INVALID" });
    let record = this.records.get(session);
    if (!record) {
      if (this.records.size >= MEDIA_DELIVERY_LIMITS.retainedSessions)
        throw new ApplicationError({ code: "CAPACITY_FULL" });
      record = {
        expiresAtMs,
        bytes: 0,
        contentRequests: 0,
        metadataRequests: 0,
      };
      this.records.set(session, record);
    }
    if (record.expiresAtMs !== expiresAtMs)
      throw new ApplicationError({ code: "SESSION_INVALID" });
    if (record.metadataRequests >= MEDIA_DELIVERY_LIMITS.metadataRequests)
      throw new ApplicationError({ code: "RATE_LIMITED" });
    record.metadataRequests++;
  }
  reserveContent(session: string, bytes: number, signal: AbortSignal) {
    signal.throwIfAborted();
    this.sweep();
    const record = this.records.get(session);
    if (!record || !Number.isSafeInteger(bytes) || bytes <= 0)
      throw new ApplicationError({ code: "SESSION_INVALID" });
    if (
      record.contentRequests >= MEDIA_DELIVERY_LIMITS.contentRequests ||
      bytes > MEDIA_DELIVERY_LIMITS.sessionBytes - record.bytes
    )
      throw new ApplicationError({ code: "RATE_LIMITED" });
    // Claim synchronously before the first remote await, including parallel reads.
    record.contentRequests++;
    record.bytes += bytes;
  }
}
