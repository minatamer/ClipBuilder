import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  describeGenerationRequest,
  describeGoogleRejection,
  describeGoogleRejectionBody,
  describeGoogleSdkError,
  googleOperation,
  googleRejectionSchema,
} from "./gemini.diagnostics.js";
import { candidateSelectionSchema } from "../../test/candidate-schema.fixture.js";

const privateText =
  "synthetic-private-key private-account@example.invalid https://private.invalid/files/secret private-transcript";
function rejection(
  message: string,
  details: unknown[] = [],
  status = "INVALID_ARGUMENT",
) {
  return JSON.stringify({ error: { code: 400, status, message, details } });
}
describe("safe Gemini rejection diagnostics", () => {
  it("distinguishes an absent HTTP body from malformed and oversized bodies", () => {
    expect(describeGoogleRejectionBody()).toMatchObject({
      detailsState: "absent",
    });
    expect(describeGoogleRejectionBody(new Uint8Array())).toMatchObject({
      detailsState: "absent",
    });
    expect(describeGoogleRejectionBody(new Uint8Array(65_537))).toMatchObject({
      detailsState: "oversized",
      truncated: true,
    });
    expect(
      describeGoogleRejectionBody(
        new TextEncoder().encode("<html>private</html>"),
      ),
    ).toMatchObject({ detailsState: "malformed" });
  });
  it("retains structured status, safe schema parameter and keyword without descriptions or metadata", () => {
    const result = describeGoogleRejection(
      rejection(
        "Invalid response schema: items must be an object. " + privateText,
        [
          {
            "@type": "type.googleapis.com/google.rpc.BadRequest",
            fieldViolations: [
              {
                field:
                  "generation_config.response_json_schema.properties[0].value.items",
                description: "Unsupported schema items: " + privateText,
              },
              {
                field: "contents[0].parts[0].file_data.file_uri",
                description: privateText,
              },
              {
                field: "private_account.private_capability",
                description: privateText,
              },
            ],
          },
          {
            "@type": "type.googleapis.com/google.rpc.ErrorInfo",
            reason: "PRIVATE_ACCOUNT_REASON",
            domain: privateText,
            metadata: { key: privateText },
          },
          {
            "@type": "type.googleapis.com/private.secret",
            subject: privateText,
          },
        ],
      ),
    );
    expect(result).toMatchObject({
      detailsState: "classified",
      status: "INVALID_ARGUMENT",
      violationCount: 3,
      unknownDetailCount: 1,
      reasons: [],
    });
    expect(result.categories).toContain("schema_invalid");
    expect(result.parameters).toEqual(
      expect.arrayContaining([
        "generationConfig.responseJsonSchema",
        "contents.fileData.fileUri",
        "unrecognized",
      ]),
    );
    expect(result.schemaKeywords).toContain("items");
    expect(result.classificationSources).toEqual(
      expect.arrayContaining(["status", "message", "field_violation"]),
    );
    expect(JSON.stringify(result)).not.toMatch(
      /synthetic-private|private-account|private\.invalid|private-transcript|PRIVATE_ACCOUNT_REASON|private_capability/,
    );
    expect(googleRejectionSchema.safeParse(result).success).toBe(true);
  });
  it.each([
    [
      "Requested schema exceeds maximum allowed complexity.",
      "schema_complexity",
    ],
    ["Too many states for the schema.", "schema_complexity"],
    [
      "Invalid JSON payload received. Unknown name prefixItems at generation_config.response_json_schema.",
      "parameter_unsupported",
    ],
    ["Invalid parameter maxOutputTokens is out of range.", "parameter_invalid"],
    ["Unsupported video MIME type.", "media_invalid"],
    ["File is not in an ACTIVE state.", "file_not_ready"],
    ["File was not found.", "file_missing"],
    ["Model is not supported for this API version.", "model_unsupported"],
    ["API key not valid.", "key_invalid"],
    ["Your API key was reported as leaked.", "key_blocked"],
    ["Billing must be enabled for this request.", "billing_required"],
    ["Quota exceeded.", "quota_exhausted"],
    ["Free tier is not available in your country.", "region_unsupported"],
    ["Response blocked by safety checks.", "safety_blocked"],
  ])("classifies %s using fixed labels", (message, category) => {
    expect(describeGoogleRejection(rejection(message)).categories).toContain(
      category,
    );
  });
  it("keeps known machine-readable reasons and ignores resource/metadata values", () => {
    const result = describeGoogleRejection(
      rejection("Request rejected.", [
        {
          "@type": "type.googleapis.com/google.rpc.ErrorInfo",
          reason: "API_KEY_INVALID",
          metadata: { apiKey: privateText },
        },
        {
          "@type": "type.googleapis.com/google.rpc.LocalizedMessage",
          locale: privateText,
          message: "API key not valid. " + privateText,
        },
        {
          "@type": "type.googleapis.com/google.rpc.ResourceInfo",
          resourceName: privateText,
          owner: privateText,
        },
        {
          "@type": "type.googleapis.com/google.rpc.QuotaFailure",
          violations: [{ subject: privateText, description: privateText }],
        },
      ]),
    );
    expect(result.reasons).toEqual(["API_KEY_INVALID"]);
    expect(result.categories).toContain("key_invalid");
    expect(result.detailTypes).toEqual([
      "ErrorInfo",
      "LocalizedMessage",
      "ResourceInfo",
      "QuotaFailure",
    ]);
    expect(JSON.stringify(result)).not.toContain(privateText);
  });
  it.each([
    "FAILED_PRECONDITION",
    "PERMISSION_DENIED",
    "RESOURCE_EXHAUSTED",
    "UNAVAILABLE",
    "DEADLINE_EXCEEDED",
    "CANCELLED",
  ])("keeps %s separate from HTTP status", (status) => {
    expect(
      describeGoogleRejection(rejection("Request rejected.", [], status))
        .status,
    ).toBe(status);
  });
  it("does not invent a specific cause for generic or unfamiliar errors", () => {
    expect(
      describeGoogleRejection(
        rejection("Request contains an invalid argument."),
      ),
    ).toMatchObject({
      detailsState: "generic",
      categories: ["invalid_argument"],
      parameters: [],
    });
    expect(
      describeGoogleRejection(rejection(privateText, [], privateText)),
    ).toMatchObject({ detailsState: "generic", categories: ["unknown"] });
    expect(describeGoogleRejection("<html>" + privateText)).toMatchObject({
      detailsState: "malformed",
      categories: ["unknown"],
    });
    expect(
      describeGoogleRejection(rejection("x".repeat(65_537))),
    ).toMatchObject({ detailsState: "oversized", truncated: true });
    expect(describeGoogleSdkError(new Error(privateText))).toBeUndefined();
    expect(
      describeGoogleSdkError(
        Object.assign(new Error(""), { name: "ApiError" }),
      ),
    ).toMatchObject({ detailsState: "absent" });
  });
  it("counts violations across multiple structured detail groups", () => {
    const result = describeGoogleRejection(
      rejection("Request contains an invalid argument.", [
        {
          "@type": "type.googleapis.com/google.rpc.BadRequest",
          fieldViolations: [
            {
              field: "generation_config.response_json_schema",
              description: privateText,
            },
          ],
        },
        {
          "@type": "type.googleapis.com/google.rpc.BadRequest",
          fieldViolations: [
            {
              field: "contents[0].parts[0].file_data.mime_type",
              description: privateText,
            },
            { field: privateText, description: privateText },
          ],
        },
      ]),
    );
    expect(result.violationCount).toBe(3);
    expect(result.parameters).toEqual([
      "generationConfig.responseJsonSchema",
      "contents.fileData.mimeType",
      "unrecognized",
    ]);
    expect(JSON.stringify(result)).not.toContain(privateText);
  });
  it("bounds detail scanning, field lengths, message matching and output arrays", () => {
    const result = describeGoogleRejection(
      rejection("x".repeat(8_300), [
        {
          "@type": "type.googleapis.com/google.rpc.BadRequest",
          fieldViolations: Array.from({ length: 20 }, () => ({
            field: "x".repeat(513),
            description: privateText,
          })),
        },
        ...Array.from({ length: 35 }, () => ({ "@type": privateText })),
      ]),
    );
    expect(result).toMatchObject({
      truncated: true,
      violationCount: 20,
      unknownDetailCount: 31,
      parameters: ["unrecognized"],
    });
    expect(googleRejectionSchema.safeParse(result).success).toBe(true);
    expect(
      googleRejectionSchema.safeParse({ ...result, message: privateText })
        .success,
    ).toBe(false);
    expect(
      googleRejectionSchema.safeParse({ ...result, parameters: [privateText] })
        .success,
    ).toBe(false);
  });
});
describe("content-free generation request context", () => {
  it("summarizes the real code-owned schema without serializing schema text", () => {
    const schema = z.toJSONSchema(candidateSelectionSchema, { io: "input" });
    const result = describeGenerationRequest({
      purpose: "candidate_selection",
      model: "gemini-3.8-flash",
      maxOutputTokens: 65_536,
      timeoutMs: 180_000,
      schema,
    });
    expect(result).toMatchObject({
      purpose: "candidate_selection",
      model: "gemini-3.8-flash",
      apiVersion: "v1beta",
      schemaPolicy: "canonical",
      candidateCount: 1,
      sdkAttempts: 1,
      toolsCount: 0,
      schema: { tuples: 0, booleanItems: 0, maxArrayItems: 40, refs: 0 },
    });
    expect(result.schema?.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(result.schema?.bytes).toBeGreaterThan(0);
    expect(result.schema?.keywords).toContain("items");
    expect(JSON.stringify(result)).not.toMatch(
      /One audible|Full-source|properties.*words/,
    );
    expect(
      describeGenerationRequest({
        purpose: "selected_plan",
        model: "gemini-3.8-flash",
        maxOutputTokens: 1024,
        timeoutMs: 1000,
        schema: { type: "object", description: privateText },
      }).schema,
    ).not.toHaveProperty("description");
  });
  it.each([
    [
      "https://generativelanguage.googleapis.com/upload/v1beta/files",
      "POST",
      "files_upload_start",
    ],
    [
      "https://generativelanguage.googleapis.com/upload/v1beta/files?upload_id=private",
      "POST",
      "files_upload_finalize",
    ],
    [
      "https://generativelanguage.googleapis.com/v1beta/files/private",
      undefined,
      "files_get",
    ],
    [
      "https://generativelanguage.googleapis.com/v1beta/files/private",
      "DELETE",
      "files_delete",
    ],
    [
      "https://generativelanguage.googleapis.com/v1beta/files?pageToken=private",
      "GET",
      "files_list",
    ],
    [
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      "POST",
      "generate_content",
    ],
    ["https://private.invalid/secret", "POST", "unrecognized"],
  ])(
    "maps transport routing to a fixed operation without retaining a URL",
    (url, method, operation) => {
      expect(googleOperation(url, method)).toBe(operation);
    },
  );
});
