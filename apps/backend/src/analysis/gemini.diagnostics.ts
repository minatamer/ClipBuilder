import { createHash } from "node:crypto";
import { z } from "zod";

const grpcStatuses = [
  "INVALID_ARGUMENT",
  "FAILED_PRECONDITION",
  "PERMISSION_DENIED",
  "UNAUTHENTICATED",
  "NOT_FOUND",
  "RESOURCE_EXHAUSTED",
  "CANCELLED",
  "DEADLINE_EXCEEDED",
  "INTERNAL",
  "UNAVAILABLE",
  "UNKNOWN",
  "OUT_OF_RANGE",
  "UNIMPLEMENTED",
  "ABORTED",
  "ALREADY_EXISTS",
  "DATA_LOSS",
] as const;
const reasonCodes = [
  "API_KEY_INVALID",
  "API_KEY_EXPIRED",
  "API_KEY_NOT_FOUND",
  "API_KEY_SERVICE_BLOCKED",
  "API_KEY_HTTP_REFERRER_BLOCKED",
  "API_KEY_IP_ADDRESS_BLOCKED",
  "API_KEY_ANDROID_APP_BLOCKED",
  "API_KEY_IOS_APP_BLOCKED",
  "BILLING_DISABLED",
  "SERVICE_DISABLED",
  "CONSUMER_INVALID",
  "RATE_LIMIT_EXCEEDED",
  "QUOTA_EXCEEDED",
  "ACCESS_TOKEN_SCOPE_INSUFFICIENT",
  "IAM_PERMISSION_DENIED",
] as const;
const categories = [
  "invalid_argument",
  "precondition_failed",
  "schema_complexity",
  "schema_invalid",
  "parameter_unsupported",
  "parameter_invalid",
  "media_invalid",
  "file_not_ready",
  "file_missing",
  "model_unsupported",
  "key_invalid",
  "key_blocked",
  "permission_denied",
  "billing_required",
  "quota_exhausted",
  "region_unsupported",
  "safety_blocked",
  "service_unavailable",
  "deadline_exceeded",
  "cancelled",
  "unknown",
] as const;
const parameters = [
  "model",
  "contents",
  "contents.fileData",
  "contents.fileData.fileUri",
  "contents.fileData.mimeType",
  "contents.videoMetadata",
  "contents.videoMetadata.fps",
  "systemInstruction",
  "tools",
  "toolConfig",
  "generationConfig",
  "generationConfig.responseJsonSchema",
  "generationConfig.responseSchema",
  "generationConfig.responseMimeType",
  "generationConfig.responseFormat",
  "generationConfig.maxOutputTokens",
  "generationConfig.candidateCount",
  "generationConfig.temperature",
  "generationConfig.topP",
  "generationConfig.topK",
  "generationConfig.thinkingConfig",
  "generationConfig.responseModalities",
  "safetySettings",
  "file",
  "file.name",
  "file.mimeType",
  "unrecognized",
] as const;
const schemaKeywords = [
  "$schema",
  "$ref",
  "$defs",
  "type",
  "format",
  "enum",
  "items",
  "prefixItems",
  "minItems",
  "maxItems",
  "minimum",
  "maximum",
  "anyOf",
  "oneOf",
  "allOf",
  "not",
  "properties",
  "additionalProperties",
  "required",
  "pattern",
  "minLength",
  "maxLength",
  "propertyOrdering",
] as const;
const detailTypes = [
  "BadRequest",
  "ErrorInfo",
  "QuotaFailure",
  "PreconditionFailure",
  "RetryInfo",
  "LocalizedMessage",
  "ResourceInfo",
  "Help",
] as const;
export const googleRejectionSchema = z
  .object({
    detailsState: z.enum([
      "classified",
      "generic",
      "malformed",
      "oversized",
      "absent",
    ]),
    status: z.enum(grpcStatuses).optional(),
    reasons: z.array(z.enum(reasonCodes)).max(4),
    categories: z.array(z.enum(categories)).min(1).max(4),
    parameters: z.array(z.enum(parameters)).max(4),
    schemaKeywords: z.array(z.enum(schemaKeywords)).max(8),
    detailTypes: z.array(z.enum(detailTypes)).max(8),
    classificationSources: z
      .array(z.enum(["status", "error_info", "field_violation", "message"]))
      .max(4),
    violationCount: z.number().int().min(0).max(1_000),
    unknownDetailCount: z.number().int().min(0).max(1_000),
    truncated: z.boolean(),
  })
  .strict();
export type GoogleRejection = z.infer<typeof googleRejectionSchema>;
export const googleOperationSchema = z.enum([
  "files_upload_start",
  "files_upload_finalize",
  "files_get",
  "files_delete",
  "files_list",
  "generate_content",
  "transcribe_interaction",
  "unrecognized",
]);
export type GoogleOperation = z.infer<typeof googleOperationSchema>;
const maxErrorCharacters = 65_536;
function object(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? Object.fromEntries(Object.entries(value))
    : null;
}
function enumValue<T extends string>(
  values: readonly T[],
  value: unknown,
): T | undefined {
  return values.find((entry) => entry === value);
}
function emptyRejection(
  detailsState: GoogleRejection["detailsState"],
): GoogleRejection {
  return {
    detailsState,
    reasons: [],
    categories: ["unknown"],
    parameters: [],
    schemaKeywords: [],
    detailTypes: [],
    classificationSources: [],
    violationCount: 0,
    unknownDetailCount: 0,
    truncated: detailsState === "oversized",
  };
}
// Every output string is a code-owned enum. Never redact-and-print provider text.
export function describeGoogleRejection(text: string): GoogleRejection {
  if (text.length > maxErrorCharacters) return emptyRejection("oversized");
  let envelope: Record<string, unknown> | null;
  try {
    envelope = object(JSON.parse(text));
  } catch {
    return emptyRejection("malformed");
  }
  const error = object(envelope?.error);
  if (!error) return emptyRejection("malformed");
  const result = emptyRejection("generic");
  const foundCategories = new Set<GoogleRejection["categories"][number]>();
  const sources = new Set<GoogleRejection["classificationSources"][number]>();
  const foundParameters = new Set<GoogleRejection["parameters"][number]>();
  const fieldParameters = new Set<GoogleRejection["parameters"][number]>();
  const foundKeywords = new Set<GoogleRejection["schemaKeywords"][number]>();
  const status = enumValue(grpcStatuses, error.status);
  if (status) {
    result.status = status;
    sources.add("status");
  }
  const statusCategory: Partial<
    Record<(typeof grpcStatuses)[number], (typeof categories)[number]>
  > = {
    INVALID_ARGUMENT: "invalid_argument",
    FAILED_PRECONDITION: "precondition_failed",
    PERMISSION_DENIED: "permission_denied",
    UNAUTHENTICATED: "permission_denied",
    RESOURCE_EXHAUSTED: "quota_exhausted",
    INTERNAL: "service_unavailable",
    UNAVAILABLE: "service_unavailable",
    DEADLINE_EXCEEDED: "deadline_exceeded",
    CANCELLED: "cancelled",
  };
  if (status && statusCategory[status])
    foundCategories.add(statusCategory[status]);
  function inspectMessage(value: unknown) {
    if (typeof value !== "string") return;
    const message = value.slice(0, 8_192);
    if (value.length > message.length) result.truncated = true;
    if (
      /^(?:request contains an invalid argument|invalid argument)\.?$/i.test(
        message.trim(),
      )
    )
      return;
    const rules: readonly [RegExp, (typeof categories)[number]][] = [
      [
        /schema.{0,100}(?:too complex|too many states|exceeds.{0,40}(?:complexity|limit)|too large)|too many states.{0,100}schema|maximum allowed complexity/i,
        "schema_complexity",
      ],
      [
        /(?:invalid|malformed|unsupported).{0,80}schema|schema.{0,80}(?:invalid|malformed|unsupported)|(?:schema|json).{0,60}(?:must|should) be/i,
        "schema_invalid",
      ],
      [
        /unknown (?:name|field)|unrecognized (?:name|field)|unsupported (?:parameter|field)|cannot find field/i,
        "parameter_unsupported",
      ],
      [
        /(?:invalid|out of range|unsupported).{0,60}(?:parameter|argument)|(?:parameter|argument).{0,60}(?:invalid|out of range|not supported)/i,
        "parameter_invalid",
      ],
      [
        /(?:video|audio|media|mime).{0,80}(?:invalid|unsupported|decode|not supported)|(?:invalid|unsupported).{0,60}(?:video|audio|media|mime)/i,
        "media_invalid",
      ],
      [
        /file.{0,100}(?:not.*active|not ready|still processing|processing state)/i,
        "file_not_ready",
      ],
      [/file.{0,80}(?:not found|does not exist|expired)/i, "file_missing"],
      [
        /model.{0,100}(?:not found|does not exist|not supported|unsupported)/i,
        "model_unsupported",
      ],
      [
        /api key.{0,80}(?:not valid|invalid|expired)|invalid api key/i,
        "key_invalid",
      ],
      [/api key.{0,80}(?:blocked|leaked|restricted)/i, "key_blocked"],
      [
        /billing.{0,80}(?:enable|disabled|required)|prepay.{0,80}(?:depleted|balance)|insufficient.{0,40}credits/i,
        "billing_required",
      ],
      [/quota|rate limit|resource exhausted/i, "quota_exhausted"],
      [
        /(?:country|region).{0,100}(?:not supported|not available|unsupported)|free tier is not available/i,
        "region_unsupported",
      ],
      [/blocked.{0,60}safety|safety.{0,60}blocked/i, "safety_blocked"],
    ];
    for (const [pattern, category] of rules)
      if (pattern.test(message)) {
        foundCategories.add(category);
        sources.add("message");
      }
    const normalized = message.replace(/_/g, "").toLowerCase();
    for (const parameter of parameters) {
      if (
        parameter === "unrecognized" ||
        parameter === "file" ||
        parameter === "contents"
      )
        continue;
      const leaf = parameter.split(".").at(-1)!;
      if (
        leaf.length > 3 &&
        new RegExp("\\b" + leaf.toLowerCase() + "\\b").test(normalized)
      ) {
        foundParameters.add(parameter);
        sources.add("message");
      }
    }
    if (/schema|generation_config|generationConfig/i.test(message)) {
      for (const keyword of schemaKeywords) {
        const escaped = keyword.replace(/\$/g, "\\$");
        if (
          new RegExp("[\"'`.]" + escaped + "(?:[\"'`:]|\\b)", "i").test(message)
        )
          foundKeywords.add(keyword);
      }
    }
  }
  function inspectField(value: unknown) {
    if (typeof value !== "string" || value.length > 512) {
      fieldParameters.add("unrecognized");
      return;
    }
    const normalized = value.replace(/_/g, "").toLowerCase();
    const match = [...parameters]
      .filter((parameter) => parameter !== "unrecognized")
      .sort((a, b) => b.length - a.length)
      .find((parameter) => {
        const tokens = parameter.toLowerCase().split(".");
        return tokens.every((token) =>
          new RegExp("(?:^|[^a-z0-9])" + token + "(?:$|[^a-z0-9])").test(
            normalized,
          ),
        );
      });
    fieldParameters.add(match ?? "unrecognized");
    if (/responseschema|responsejsonschema|responseformat/.test(normalized)) {
      for (const keyword of schemaKeywords)
        if (
          new RegExp(
            "(?:^|[^a-zA-Z0-9_])" +
              keyword.replace(/\$/g, "\\$") +
              "(?:$|[^a-zA-Z0-9_])",
            "i",
          ).test(value)
        )
          foundKeywords.add(keyword);
    }
  }
  inspectMessage(error.message);
  const details = Array.isArray(error.details) ? error.details : [];
  if (details.length > 32) result.truncated = true;
  for (const value of details.slice(0, 32)) {
    const detail = object(value);
    const type = detailTypes.find(
      (entry) =>
        detail?.["@type"] === "type.googleapis.com/google.rpc." + entry,
    );
    if (!type) {
      result.unknownDetailCount++;
      continue;
    }
    if (!result.detailTypes.includes(type)) result.detailTypes.push(type);
    if (type === "ErrorInfo") {
      const reason = enumValue(reasonCodes, detail?.reason);
      if (reason) {
        if (!result.reasons.includes(reason)) result.reasons.push(reason);
        sources.add("error_info");
        foundCategories.add(
          reason.startsWith("API_KEY_")
            ? reason.endsWith("BLOCKED")
              ? "key_blocked"
              : "key_invalid"
            : reason === "BILLING_DISABLED"
              ? "billing_required"
              : reason === "QUOTA_EXCEEDED" || reason === "RATE_LIMIT_EXCEEDED"
                ? "quota_exhausted"
                : "permission_denied",
        );
      }
    }
    if (type === "BadRequest" && Array.isArray(detail?.fieldViolations)) {
      result.violationCount = Math.min(
        1_000,
        result.violationCount + detail.fieldViolations.length,
      );
      if (detail.fieldViolations.length > 16) result.truncated = true;
      for (const item of detail.fieldViolations.slice(0, 16)) {
        const violation = object(item);
        inspectField(violation?.field);
        inspectMessage(violation?.description);
        sources.add("field_violation");
      }
    }
    if (type === "LocalizedMessage") inspectMessage(detail?.message);
    // Metadata, URLs, resources, quota subjects and precondition subjects are never retained.
  }
  result.categories = foundCategories.size
    ? [...foundCategories].slice(0, 4)
    : ["unknown"];
  const orderedParameters = new Set([...fieldParameters, ...foundParameters]);
  result.parameters = [...orderedParameters].slice(0, 4);
  result.schemaKeywords = [...foundKeywords].slice(0, 8);
  result.classificationSources = [...sources];
  if (
    foundCategories.size > 4 ||
    orderedParameters.size > 4 ||
    foundKeywords.size > 8 ||
    result.reasons.length > 4
  )
    result.truncated = true;
  result.reasons = result.reasons.slice(0, 4);
  result.detailsState =
    sources.has("message") ||
    sources.has("field_violation") ||
    sources.has("error_info")
      ? "classified"
      : "generic";
  return googleRejectionSchema.parse(result);
}
export function describeGoogleSdkError(
  error: Error,
): GoogleRejection | undefined {
  if (error.name !== "ApiError") return undefined;
  return typeof error.message === "string" && error.message.length
    ? describeGoogleRejection(error.message)
    : emptyRejection("absent");
}
export function describeGoogleRejectionBody(
  body?: Uint8Array,
): GoogleRejection {
  if (!body?.byteLength) return emptyRejection("absent");
  if (body.byteLength > maxErrorCharacters) return emptyRejection("oversized");
  return describeGoogleRejection(new TextDecoder().decode(body));
}
export function googleOperation(
  url: unknown,
  method: string | undefined,
): GoogleOperation {
  try {
    const parsed = new URL(String(url));
    if (parsed.origin !== "https://generativelanguage.googleapis.com")
      return "unrecognized";
    if (parsed.pathname === "/upload/v1beta/files" && method === "POST")
      return parsed.searchParams.has("upload_id")
        ? "files_upload_finalize"
        : "files_upload_start";
    if (
      /^\/v1beta\/models\/[^/]+:generateContent$/.test(parsed.pathname) &&
      method === "POST"
    )
      return "generate_content";
    if (parsed.pathname === "/v1beta/interactions" && method === "POST")
      return "transcribe_interaction";
    if (parsed.pathname === "/v1beta/files" && (method ?? "GET") === "GET")
      return "files_list";
    if (/^\/v1beta\/files\/[^/]+$/.test(parsed.pathname))
      return method === "DELETE"
        ? "files_delete"
        : (method ?? "GET") === "GET"
          ? "files_get"
          : "unrecognized";
  } catch {
    /* A diagnostic cannot reject a request. */
  }
  return "unrecognized";
}
export const GEMINI_TEXT_ISOLATION_CASES = [
  "text_control",
  "text_analysis_schema",
] as const;
// Preserve saved v2 records from the concluded investigation without keeping
// obsolete component probes executable through the CLI.
const historicalIsolationPurposes = [
  "text_schema_no_tuple_items",
  "text_schema_words_only",
  "text_schema_candidates_only",
  "text_schema_no_evidence_word_ids_cap",
  "text_schema_candidates_no_evidence",
  "text_schema_candidates_evidence_only",
  "text_schema_no_evidence_cap",
] as const;
export type GeminiTextIsolationCase =
  (typeof GEMINI_TEXT_ISOLATION_CASES)[number];

export const generationRequestDiagnosticSchema = z
  .object({
    purpose: z.enum([
      "source_analysis",
      "candidate_selection",
      "selected_plan",
      ...GEMINI_TEXT_ISOLATION_CASES,
      ...historicalIsolationPurposes,
    ]),
    schemaPolicy: z
      .enum([
        "canonical",
        "json_only",
        "analysis_local_evidence_cap",
        "candidate_local_evidence_cap",
        "analysis_local_array_caps",
        "tuple_items_isolation",
        "schema_section_isolation",
        "evidence_word_ids_cap_isolation",
        "candidate_field_isolation",
        "evidence_array_constraint_isolation",
      ])
      .optional(),
    schemaLocation: z.enum(["transport", "prompt"]).optional(),
    model: z.literal("gemini-3.8-flash"),
    apiVersion: z.literal("v1beta"),
    responseMimeType: z.literal("application/json"),
    candidateCount: z.literal(1),
    maxOutputTokens: z.number().int().min(1).max(65_536),
    timeoutMs: z.number().int().min(1).max(360_000),
    sdkAttempts: z.literal(1),
    toolsCount: z.literal(0),
    schema: z
      .object({
        sha256: z.string().regex(/^[a-f0-9]{64}$/),
        bytes: z.number().int().min(0).max(1_000_000),
        nodes: z.number().int().min(0).max(10_000),
        depth: z.number().int().min(0).max(100),
        tuples: z.number().int().min(0).max(10_000),
        booleanItems: z.number().int().min(0).max(10_000),
        maxArrayItems: z.number().int().min(0).max(1_000_000),
        refs: z.number().int().min(0).max(10_000),
        keywords: z.array(z.enum(schemaKeywords)).max(schemaKeywords.length),
      })
      .strict()
      .optional(),
  })
  .strict();
export function describeGenerationRequest(input: {
  purpose:
    | "source_analysis"
    | "candidate_selection"
    | "selected_plan"
    | GeminiTextIsolationCase;
  schemaPolicy?:
    | "canonical"
    | "json_only"
    | "analysis_local_evidence_cap"
    | "candidate_local_evidence_cap";
  model: string;
  maxOutputTokens: number;
  timeoutMs: number;
  schema: unknown;
  schemaLocation?: "transport" | "prompt";
}) {
  const context = {
    purpose: input.purpose,
    schemaPolicy: input.schemaPolicy ?? "canonical",
    schemaLocation:
      input.schema === undefined
        ? undefined
        : (input.schemaLocation ?? "transport"),
    model: input.model,
    maxOutputTokens: input.maxOutputTokens,
    timeoutMs: input.timeoutMs,
    apiVersion: "v1beta",
    responseMimeType: "application/json",
    candidateCount: 1,
    sdkAttempts: 1,
    toolsCount: 0,
  };
  if (input.schema === undefined)
    return generationRequestDiagnosticSchema.parse(context);
  const serialized = JSON.stringify(input.schema);
  const summary = {
    sha256: createHash("sha256").update(serialized).digest("hex"),
    bytes: Buffer.byteLength(serialized),
    nodes: 0,
    depth: 0,
    tuples: 0,
    booleanItems: 0,
    maxArrayItems: 0,
    refs: 0,
    keywords: [] as (typeof schemaKeywords)[number][],
  };
  function visit(value: unknown, depth: number) {
    const schema = object(value);
    if (!schema || depth > 100 || summary.nodes >= 10_000) return;
    summary.nodes++;
    summary.depth = Math.max(summary.depth, depth);
    for (const key of schemaKeywords)
      if (key in schema && !summary.keywords.includes(key))
        summary.keywords.push(key);
    if (Array.isArray(schema.prefixItems)) summary.tuples++;
    if (typeof schema.items === "boolean") summary.booleanItems++;
    if (
      typeof schema.maxItems === "number" &&
      Number.isInteger(schema.maxItems)
    )
      summary.maxArrayItems = Math.max(summary.maxArrayItems, schema.maxItems);
    if (typeof schema.$ref === "string") summary.refs++;
    for (const child of Object.values(object(schema.properties) ?? {}))
      visit(child, depth + 1);
    if (typeof schema.items === "object") visit(schema.items, depth + 1);
    for (const key of ["prefixItems", "anyOf", "oneOf", "allOf"])
      if (Array.isArray(schema[key]))
        for (const child of schema[key]) visit(child, depth + 1);
    for (const child of Object.values(object(schema.$defs) ?? {}))
      visit(child, depth + 1);
  }
  visit(input.schema, 0);
  return generationRequestDiagnosticSchema.parse({
    ...context,
    schema: summary,
  });
}
