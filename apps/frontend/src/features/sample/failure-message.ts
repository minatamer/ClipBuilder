import { SAFE_ERROR_MESSAGES, type SafeError } from "@clipbuilder/contracts";

/** UI copy depends on a known code, never exception/provider/server text. */
export function failureMessage(failure: Pick<SafeError, "code">): string {
  switch (failure.code) {
    case "RIGHTS_ACK_REQUIRED":
    case "ACTIVE_SESSION_EXISTS":
    case "SESSION_EXPIRED":
    case "SOURCE_TOO_LARGE":
    case "UNSUPPORTED_MEDIA":
    case "MISSING_AUDIO":
    case "DURATION_OUT_OF_RANGE":
    case "NO_VALID_CANDIDATES":
    case "RATE_LIMITED":
    case "CAPACITY_FULL":
    case "REQUEST_TIMEOUT":
    case "OPERATION_TIMEOUT":
      return SAFE_ERROR_MESSAGES[failure.code];
    default:
      return "ClipBuilder could not complete this step. Please try again.";
  }
}
