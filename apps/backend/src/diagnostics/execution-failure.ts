import { createHash } from "node:crypto";
import {
  executionFailureSchema,
  type ExecutionFailure,
} from "../../../../packages/contracts/local/execution-diagnostics.ts";

const fingerprint = (value: string) =>
  createHash("sha256").update(value).digest("hex");
/** Error text stays in memory; only code-owned identifiers/fingerprints escape. */
export function classifyExecutionFailure(
  value: unknown,
  fallback: ExecutionFailure["category"] = "unknown",
): ExecutionFailure {
  if (value instanceof ExecutionError) return value.diagnostic;
  let text =
    typeof value === "string"
      ? value
      : value instanceof Error
        ? value.message
        : "";
  const messages = [text];
  let nested = value instanceof Error ? value.cause : undefined;
  for (
    let depth = 0;
    depth < 4 && nested instanceof Error;
    depth++, nested = nested.cause
  ) {
    if (nested instanceof ExecutionError) return nested.diagnostic;
    messages.push(nested.message.slice(0, 65_536));
  }
  text = messages.join("\n");
  const detail: ExecutionFailure = {
    category: fallback,
    fingerprint: fingerprint(text),
    messageBytes: Math.min(16 * 1024 ** 2, Buffer.byteLength(text)),
  };
  const known: Record<string, ExecutionFailure["category"]> = {
    image_address_blocked: "address_blocked",
    image_redirect_failed: "redirect",
    image_download_limit: "download_limit",
    image_format_unsupported: "format",
    image_raster_limit: "raster_limit",
    image_search_not_attempted: "search_missing",
    image_search_incomplete: "search_incomplete",
    codex_login_required: "authentication",
    codex_subscription_required: "subscription",
    codex_limit: "rate_limit",
    canceled: "canceled",
  };
  const knownMessage = messages.find((message) =>
    Object.hasOwn(known, message),
  );
  if (knownMessage) detail.category = known[knownMessage]!;
  if (value instanceof Error && value.name === "TimeoutError")
    detail.category = "timeout";
  if (value instanceof Error && value.name === "AbortError")
    detail.category = "canceled";
  if (/Invalid URL|ERR_INVALID_URL/u.test(text))
    detail.category = "candidate_shape";
  let cause = value;
  for (
    let depth = 0;
    depth < 4 && cause instanceof Error;
    depth++, cause = cause.cause
  ) {
    const code = executionFailureSchema.shape.systemCode.safeParse(
      "code" in cause ? cause.code : undefined,
    );
    if (code.success && code.data) detail.systemCode ??= code.data;
    if (
      "status" in cause &&
      typeof cause.status === "number" &&
      cause.status >= 100 &&
      cause.status <= 599
    )
      detail.httpStatus ??= cause.status;
  }
  const system = executionFailureSchema.shape.systemCode
    .unwrap()
    .options.find((code) => text.includes(code));
  if (system) detail.systemCode ??= system;
  const provider = executionFailureSchema.shape.providerCode
    .unwrap()
    .options.find((code) => text.includes(code));
  if (provider) detail.providerCode = provider;
  const status =
    /(?:HTTP(?:\/\S+)?(?:\s+status)?|status(?: code)?)[:=\s]+([1-5]\d\d)\b/iu.exec(
      text,
    );
  if (status) detail.httpStatus ??= Number(status[1]);
  if (
    /invalid.json.schema|schema.*(?:invalid|unsupported)|additionalProperties|response_format|text.format/iu.test(
      text,
    )
  )
    detail.category = "schema_rejected";
  else if (
    /unexpected argument|unrecognized (?:option|argument)|unknown (?:option|flag|feature)|invalid value.*(?:--|variant)/iu.test(
      text,
    )
  )
    detail.category = "cli_argument";
  else if (
    /config(?:uration)?.*(?:invalid|error|unknown)|unknown variant|failed to (?:load|parse).*config|code.mode.*(?:host is disabled|host.*unavailable|fail closed)/iu.test(
      text,
    )
  )
    detail.category = "cli_configuration";
  else if (
    /usage.limit|rate.limit|quota|out.of.credits|429|billing_hard_limit|RESOURCE_EXHAUSTED/iu.test(
      text,
    )
  )
    detail.category = "rate_limit";
  else if (/context.length|maximum context|too many tokens/iu.test(text))
    detail.category = "context_limit";
  else if (
    /model.not.found|model.*(?:not supported|does not exist|unavailable)/iu.test(
      text,
    )
  )
    detail.category = "model_unavailable";
  else if (
    /not logged|unauthorized|invalid.api.key|authentication|401|refresh.token|access.token.*expired|API_KEY_INVALID|UNAUTHENTICATED|PERMISSION_DENIED/iu.test(
      text,
    )
  )
    detail.category = "authentication";
  else if (/subscription|ChatGPT.*(?:required|plan)/iu.test(text))
    detail.category = "subscription";
  else if (
    /ENOTFOUND|EAI_AGAIN|dns|name resolution|Invalid IP address/iu.test(text) ||
    ["ENOTFOUND", "EAI_AGAIN", "ERR_INVALID_IP_ADDRESS"].includes(
      detail.systemCode ?? "",
    )
  )
    detail.category = "dns";
  else if (
    /certificate|\btls\b|\bssl\b/iu.test(text) ||
    /CERT|SIGNATURE/.test(detail.systemCode ?? "")
  )
    detail.category = "tls";
  else if (
    /timed? ?out|timeout|ETIMEDOUT/iu.test(text) ||
    /TIMEOUT|ETIMEDOUT/u.test(detail.systemCode ?? "")
  )
    detail.category = "timeout";
  else if (
    /ECONN|ENETUNREACH|EHOSTUNREACH|connect(?:ion)?.*(?:failed|refused|reset)|error sending request|stream disconnected/iu.test(
      text,
    ) ||
    /ECONN|ENET|EHOST|UND_ERR_SOCKET|ERR_STREAM_PREMATURE_CLOSE/.test(
      detail.systemCode ?? "",
    )
  )
    detail.category = "connection";
  else if (detail.httpStatus) detail.category = "http";
  const keyword = executionFailureSchema.shape.schemaKeyword
    .unwrap()
    .options.find((key) => text.includes(key));
  if (keyword && detail.category === "schema_rejected")
    detail.schemaKeyword = keyword;
  const option = executionFailureSchema.shape.cliOption
    .unwrap()
    .options.toSorted((left, right) => right.length - left.length)
    .find((key) => text.includes(key));
  if (option) detail.cliOption = option;
  return detail;
}
export class ExecutionError extends Error {
  constructor(
    message: string,
    readonly diagnostic: ExecutionFailure,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}
