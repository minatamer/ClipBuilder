import {
  SAFE_ERROR_MESSAGES,
  safeErrorSchema,
  type ErrorCode,
  type SafeError,
} from "@clipbuilder/contracts";

const HTTP_STATUS_BY_ERROR_CODE: Readonly<Partial<Record<ErrorCode, number>>> =
  {
    INVALID_REQUEST: 400,
    REQUEST_TOO_LARGE: 413,
    UNSUPPORTED_CONTENT_TYPE: 415,
    REQUEST_TIMEOUT: 408,
    OPERATION_NOT_FOUND: 404,
    RESULT_NOT_FOUND: 404,
    SESSION_MISSING: 401,
    SESSION_EXPIRED: 410,
    FEATURE_DISABLED: 403,
    ABUSE_CHECK_FAILED: 403,
    ACTIVE_SESSION_EXISTS: 409,
    ACTION_IN_PROGRESS: 409,
    STALE_REVISION: 409,
    CAPACITY_FULL: 429,
    SESSION_INVALID: 401,
    PAID_DEMO_DISABLED: 403,
    RATE_LIMITED: 429,
    PROVIDER_BUDGET_EXHAUSTED: 429,
  };

export class ApplicationError extends Error {
  readonly code: ErrorCode;
  readonly retryable: boolean;
  readonly ruleId: string | undefined;

  constructor(options: {
    code: ErrorCode;
    retryable?: boolean;
    ruleId?: string;
  }) {
    super(options.code);
    this.name = "ApplicationError";
    this.code = options.code;
    this.retryable = options.retryable ?? false;
    this.ruleId = options.ruleId;
  }
}

export function mapError(
  error: unknown,
  requestId: string,
): { status: number; error: SafeError } {
  const parserFailure =
    typeof error === "object" && error !== null && "type" in error
      ? error.type === "entity.too.large"
        ? "REQUEST_TOO_LARGE"
        : error.type === "entity.parse.failed"
          ? "INVALID_REQUEST"
          : null
      : null;
  const applicationError =
    error instanceof ApplicationError
      ? error
      : new ApplicationError({ code: parserFailure ?? "INTERNAL_ERROR" });

  const safeError = safeErrorSchema.parse({
    code: applicationError.code,
    message: SAFE_ERROR_MESSAGES[applicationError.code],
    retryable: applicationError.retryable,
    requestId,
    ...(applicationError.ruleId === undefined
      ? {}
      : { ruleId: applicationError.ruleId }),
  });

  return {
    status: HTTP_STATUS_BY_ERROR_CODE[applicationError.code] ?? 500,
    error: safeError,
  };
}
