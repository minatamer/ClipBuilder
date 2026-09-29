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
  const applicationError =
    error instanceof ApplicationError
      ? error
      : new ApplicationError({ code: "INTERNAL_ERROR" });

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
