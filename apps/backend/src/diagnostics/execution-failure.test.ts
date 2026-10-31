import { expect, it } from "vitest";
import {
  classifyExecutionFailure,
  ExecutionError,
} from "./execution-failure.js";
import { executionFailureSchema } from "../../../../packages/contracts/local/execution-diagnostics.ts";

it.each([
  ["error: unknown feature flag: standalone_web_search", "cli_argument"],
  [
    "configuration error: unknown variant live for web_search",
    "cli_configuration",
  ],
  ["HTTP 401 authentication token expired", "authentication"],
  ["rate_limit_exceeded status code: 429", "rate_limit"],
  ["invalid_json_schema: additionalProperties required", "schema_rejected"],
  ["model_not_found", "model_unavailable"],
  ["context_length_exceeded", "context_limit"],
  ["getaddrinfo ENOTFOUND private.invalid", "dns"],
  ["Invalid IP address: undefined", "dns"],
  ["connect ECONNREFUSED private.invalid", "connection"],
  ["certificate CERT_HAS_EXPIRED", "tls"],
  ["request timed out ETIMEDOUT", "timeout"],
  ["status code: 503", "http"],
  ["image_address_blocked", "address_blocked"],
  ["image_redirect_failed", "redirect"],
  ["image_format_unsupported", "format"],
  ["image_search_incomplete", "search_incomplete"],
  ["image_search_metadata_missing", "search_metadata_missing"],
  ["image_search_tool_failed", "search_tool_failed"],
  ["unrecognized private failure", "unknown"],
])("classifies %s without serializing private text", (message, category) => {
  const result = classifyExecutionFailure(
    message +
      " synthetic-secret /private/media.mp4 https://private.invalid?token=secret",
  );
  // Exact app codes use an Error message, whereas transport text may include context.
  const actual = message.startsWith("image_")
    ? classifyExecutionFailure(Error(message))
    : result;
  expect(actual.category).toBe(category);
  expect(executionFailureSchema.safeParse(actual).success).toBe(true);
  expect(JSON.stringify(actual)).not.toMatch(
    /synthetic-secret|private\.invalid|media\.mp4/u,
  );
  expect(actual.fingerprint).toMatch(/^[a-f0-9]{64}$/u);
});
it("retains nested system facts, recognized identifiers and the original diagnostic across wrappers", () => {
  const network = Object.assign(Error("private host"), { code: "ECONNRESET" });
  expect(
    classifyExecutionFailure(Error("fetch failed", { cause: network })),
  ).toMatchObject({ category: "connection", systemCode: "ECONNRESET" });
  expect(
    classifyExecutionFailure(
      Object.assign(Error("Invalid IP address: undefined"), {
        code: "ERR_INVALID_IP_ADDRESS",
      }),
    ),
  ).toMatchObject({ category: "dns", systemCode: "ERR_INVALID_IP_ADDRESS" });
  const schema = classifyExecutionFailure(
    "HTTP 400 invalid_json_schema additionalProperties",
  );
  expect(schema).toMatchObject({
    category: "schema_rejected",
    httpStatus: 400,
    providerCode: "invalid_json_schema",
    schemaKeyword: "additionalProperties",
  });
  expect(
    classifyExecutionFailure(new ExecutionError("image_search_failed", schema)),
  ).toBe(schema);
  expect(
    classifyExecutionFailure("unknown feature standalone_web_search"),
  ).toMatchObject({
    category: "cli_argument",
    cliOption: "standalone_web_search",
  });
  expect(
    classifyExecutionFailure(
      "Code Mode is unavailable because code-mode host is disabled. Enable features.code_mode_host",
    ),
  ).toMatchObject({
    category: "cli_configuration",
    cliOption: "code_mode_host",
  });
});
