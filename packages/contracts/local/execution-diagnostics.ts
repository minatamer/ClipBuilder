import { z } from "zod";

export const executionFailureSchema = z
  .object({
    category: z.enum([
      "cli_argument",
      "cli_configuration",
      "authentication",
      "subscription",
      "rate_limit",
      "schema_rejected",
      "model_unavailable",
      "context_limit",
      "dns",
      "connection",
      "tls",
      "http",
      "timeout",
      "canceled",
      "spawn",
      "stdin",
      "stdout_limit",
      "stderr_limit",
      "process_exit",
      "event_json",
      "event_shape",
      "event_type",
      "item_type",
      "turn_failed",
      "error_event",
      "turn_missing",
      "search_missing",
      "search_incomplete",
      "output_missing",
      "output_shape",
      "output_limit",
      "output_json",
      "input_limit",
      "filesystem",
      "candidate_shape",
      "address_blocked",
      "redirect",
      "download_limit",
      "decode",
      "format",
      "raster_limit",
      "unknown",
    ]),
    fingerprint: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
    messageBytes: z
      .number()
      .int()
      .nonnegative()
      .max(16 * 1024 ** 2)
      .optional(),
    systemCode: z
      .enum([
        "ENOENT",
        "EACCES",
        "EPERM",
        "EPIPE",
        "ENOSPC",
        "EMFILE",
        "ENOTFOUND",
        "EAI_AGAIN",
        "ECONNREFUSED",
        "ECONNRESET",
        "ETIMEDOUT",
        "EHOSTUNREACH",
        "ENETUNREACH",
        "CERT_HAS_EXPIRED",
        "DEPTH_ZERO_SELF_SIGNED_CERT",
        "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
        "ERR_INVALID_URL",
        "ERR_INVALID_IP_ADDRESS",
        "ERR_STREAM_PREMATURE_CLOSE",
        "ERR_TLS_CERT_ALTNAME_INVALID",
        "UND_ERR_HEADERS_TIMEOUT",
        "UND_ERR_CONNECT_TIMEOUT",
        "UND_ERR_SOCKET",
        "EISDIR",
        "ENOTDIR",
        "EROFS",
      ])
      .optional(),
    httpStatus: z.number().int().min(100).max(599).optional(),
    providerCode: z
      .enum([
        "invalid_json_schema",
        "invalid_request_error",
        "invalid_api_key",
        "insufficient_quota",
        "rate_limit_exceeded",
        "model_not_found",
        "context_length_exceeded",
        "server_error",
        "permission_denied",
        "unsupported_parameter",
        "invalid_value",
        "billing_hard_limit_reached",
        "API_KEY_INVALID",
        "RESOURCE_EXHAUSTED",
        "UNAUTHENTICATED",
        "PERMISSION_DENIED",
        "INVALID_ARGUMENT",
        "NOT_FOUND",
        "INTERNAL",
        "UNAVAILABLE",
      ])
      .optional(),
    schemaKeyword: z
      .enum([
        "additionalProperties",
        "required",
        "format",
        "pattern",
        "minItems",
        "maxItems",
        "oneOf",
        "anyOf",
        "type",
        "properties",
      ])
      .optional(),
    cliOption: z
      .enum([
        "standalone_web_search",
        "unbounded_connection_retries",
        "supports_standalone_web_search",
        "web_search",
        "model_provider",
        "model_providers",
        "wire_api",
        "output-schema",
        "ignore-user-config",
        "ephemeral",
        "sandbox",
        "shell_tool",
        "unified_exec",
        "apps",
        "hooks",
        "multi_agent",
        "multi_agent_v2",
        "browser_use",
        "view_image",
        "code_mode",
        "code_mode_host",
        "skill_search",
        "skill_mcp_dependency_install",
        "memories",
        "goals",
      ])
      .optional(),
    eventType: z
      .enum(["error", "turn.failed", "item.error", "other"])
      .optional(),
    identifierFingerprint: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
  })
  .strict();
export type ExecutionFailure = z.infer<typeof executionFailureSchema>;
const count = z.number().int().nonnegative().max(1_000_000_000);
export const executionTraceSchema = z
  .object({
    boundary: z.enum(["codex", "search", "picture", "visual"]),
    phase: z.enum([
      "input",
      "preflight",
      "process",
      "events",
      "output",
      "cleanup",
      "discovery",
      "candidates",
      "dns",
      "http",
      "body",
      "decode",
      "storage",
      "fallback",
      "complete",
    ]),
    outcome: z.enum([
      "started",
      "succeeded",
      "failed",
      "canceled",
      "miss",
      "omitted",
      "warning",
    ]),
    callId: z.uuid().optional(),
    elapsedMs: count,
    timeoutMs: count.optional(),
    deadlineSource: z
      .enum(["caller", "inference", "search", "retrieval", "request"])
      .optional(),
    searchEnabled: z.boolean().optional(),
    cliVersion: z
      .string()
      .regex(/^\d+\.\d+\.\d+$/)
      .optional(),
    cliCheck: z.enum(["version", "login"]).optional(),
    authKind: z.enum(["chatgpt", "api-key", "missing"]).optional(),
    exitCode: z
      .number()
      .int()
      .min(-2147483648)
      .max(2147483647)
      .nullable()
      .optional(),
    signal: z
      .enum(["SIGINT", "SIGTERM", "SIGKILL", "SIGABRT", "SIGSEGV", "other"])
      .optional(),
    stdoutBytes: count.optional(),
    stderrBytes: count.optional(),
    stderrLimitBytes: count.optional(),
    inputBytes: count.optional(),
    outputBytes: count.optional(),
    declaredBytes: count.optional(),
    limitBytes: count.optional(),
    events: z
      .object({
        total: count,
        searchesStarted: count,
        searchesCompleted: count,
        warnings: count,
        completed: z.boolean(),
      })
      .strict()
      .optional(),
    error: executionFailureSchema.optional(),
    candidate: z.number().int().min(1).max(12).optional(),
    kind: z.enum(["page", "image"]).optional(),
    received: count.optional(),
    retained: count.optional(),
    dropped: count.optional(),
    downloads: count.optional(),
    skipReason: z
      .enum(["duplicate", "page_limit", "download_limit", "deadline"])
      .optional(),
    width: count.optional(),
    height: count.optional(),
    origin: z.enum(["generated", "retrieved"]).optional(),
    httpStatus: z.number().int().min(100).max(599).optional(),
    contentKind: z.enum(["html", "image", "other"]).optional(),
    hops: z
      .array(
        z
          .object({
            hop: z.number().int().min(0).max(3),
            phase: z.enum(["dns", "http", "body"]),
            elapsedMs: count,
            addresses: count.optional(),
            family: z.union([z.literal(4), z.literal(6)]).optional(),
            httpStatus: z.number().int().min(100).max(599).optional(),
            bytes: count.optional(),
          })
          .strict(),
      )
      .max(12)
      .optional(),
    droppedRecords: count.optional(),
  })
  .strict();
export type ExecutionTrace = z.infer<typeof executionTraceSchema>;
