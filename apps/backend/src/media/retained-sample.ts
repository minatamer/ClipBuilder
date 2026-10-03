import type { Writable } from "node:stream";
import { PUBLIC_LIMITS, mediaByteRange } from "@clipbuilder/contracts";
import { ApplicationError } from "../http/errorMapper.js";
import { streamArtifact } from "./artifact-stream.js";

export interface RetainedSampleReader {
  readonly bytes: number;
  read(range: string | undefined, signal: AbortSignal): Promise<Response>;
}

// This use case has a read-only port. Neither visitor cleanup nor expiry receives
// the master reference, and there is deliberately no deletion capability here.
export class RetainedSample {
  private active = 0;
  private windowStart = 0;
  private reads = 0;
  constructor(
    private readonly reader: RetainedSampleReader,
    private readonly now = Date.now,
  ) {
    if (
      !Number.isSafeInteger(reader.bytes) ||
      reader.bytes <= 0 ||
      reader.bytes > PUBLIC_LIMITS.maxSourceBytes
    )
      throw new ApplicationError({ code: "INVALID_REQUEST" });
  }
  async stream(input: {
    range: string | undefined;
    signal: AbortSignal;
    destination: Writable;
    headers(status: number, fields: Record<string, string>): void;
  }) {
    input.signal.throwIfAborted();
    try {
      mediaByteRange(input.range, this.reader.bytes);
    } catch {
      throw new ApplicationError({ code: "INVALID_REQUEST" });
    }
    const now = this.now();
    if (now - this.windowStart >= 60_000) {
      this.windowStart = now;
      this.reads = 0;
    }
    if (this.active >= 2) throw new ApplicationError({ code: "CAPACITY_FULL" });
    if (this.reads >= 60) throw new ApplicationError({ code: "RATE_LIMITED" });
    this.reads++;
    this.active++;
    try {
      await streamArtifact({
        ...input,
        bytes: this.reader.bytes,
        now,
        expiresAtMs: now + 60_000,
        fetch: (signal) => this.reader.read(input.range, signal),
      });
    } catch {
      throw new ApplicationError({ code: "STORAGE_FAILED" });
    } finally {
      this.active--;
    }
  }
}
