import {
  SAFE_ERROR_MESSAGES,
  type ErrorCode,
  type SafeError,
} from "@clipbuilder/contracts";

export type LocalMediaCode =
  | "unavailable"
  | "unsupported"
  | "limits"
  | "storage"
  | "busy"
  | "missing"
  | "canceled"
  | "expired"
  | "corrupt";

const messages: Record<LocalMediaCode, string> = {
  unavailable: "This browser cannot safely prepare this video locally.",
  unsupported: "This video has unsupported or unreadable tracks.",
  limits:
    "Choose one MP4 or WebM between 15 seconds and 20 minutes, up to 500 MiB.",
  storage:
    "Local storage is unavailable or full. Cleanup may need another attempt.",
  busy: "This workspace is open in another tab. Close that tab and retry.",
  missing:
    "The local video is no longer available. Choose it again to start fresh.",
  canceled: "Local preparation was canceled.",
  expired: "This temporary workspace has expired. Start fresh.",
  corrupt:
    "This workspace could not be recovered safely. Clear it and start fresh.",
};

export class LocalMediaError extends Error {
  constructor(readonly code: LocalMediaCode) {
    super(messages[code]);
  }
}

export function localMediaFailure(error: unknown): SafeError {
  const failure =
    error instanceof LocalMediaError ? error : new LocalMediaError("storage");
  const codes: Record<LocalMediaCode, ErrorCode> = {
    unavailable: "FEATURE_DISABLED",
    unsupported: "UNSUPPORTED_MEDIA",
    limits: "DURATION_OUT_OF_RANGE",
    storage: "STORAGE_FAILED",
    busy: "ACTIVE_SESSION_EXISTS",
    missing: "RESULT_NOT_FOUND",
    canceled: "CLIENT_ABORTED",
    expired: "SESSION_EXPIRED",
    corrupt: "SESSION_INVALID",
  };
  const code = codes[failure.code];
  return {
    code,
    message: SAFE_ERROR_MESSAGES[code],
    retryable: failure.code === "busy",
    requestId: `req_${crypto.randomUUID().replaceAll("-", "")}`,
  };
}
