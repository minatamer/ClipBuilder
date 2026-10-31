import { z } from "zod";
import {
  executionTraceSchema,
  type ExecutionTrace,
} from "../../../../packages/contracts/local/execution-diagnostics.ts";
import {
  decodeSearchJson,
  webPictureCandidatesSchema,
  WEB_PICTURE_POLICY,
} from "./web-pictures.js";

const record = (value: unknown): Record<string, unknown> | undefined =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const id = (value: unknown) =>
  typeof value === "string" && value.length <= 256 ? value : undefined;
const count = (value: unknown) =>
  typeof value === "number" &&
  Number.isSafeInteger(value) &&
  value >= 0 &&
  value <= 1_000_000_000
    ? value
    : undefined;
const envelopeSchema = z.object({
  status: z.string().optional(),
  steps: z.array(z.unknown()).max(4096).optional(),
  usage: z
    .object({ grounding_tool_count: z.array(z.unknown()).max(64).optional() })
    .optional(),
});
type SearchTrace = NonNullable<ExecutionTrace["search"]>;

/** Read tool execution, not model prose or optional legacy query summaries. */
export function decodeGeminiSearch(value: unknown) {
  const envelope = envelopeSchema.parse(value),
    raw = record(value);
  const steps = envelope.steps ?? [];
  const calls = new Set<string>(),
    successful = new Set<string>();
  let callCount = 0,
    resultCount = 0,
    failedResults = 0,
    queries = 0,
    queriesPresent = false,
    unknownSteps = 0;
  const texts: string[] = [],
    citations: unknown[] = [];
  for (const item of steps) {
    const step = record(item);
    if (step?.type === "google_search_call") {
      callCount++;
      const callId = id(step.id);
      if (callId) calls.add(callId);
      const args = record(step.arguments);
      if (Array.isArray(args?.queries)) {
        queriesPresent = true;
        queries += args.queries.length;
      }
    } else if (step?.type === "google_search_result") {
      resultCount++;
      if (step.is_error === true) failedResults++;
      else if (step.is_error === undefined || step.is_error === false) {
        const callId = id(step.call_id);
        if (callId && Array.isArray(step.result)) successful.add(callId);
      }
    } else if (step?.type === "model_output") {
      for (const item of list(step.content)) {
        const part = record(item);
        if (part?.type === "text" && typeof part.text === "string")
          texts.push(part.text);
        for (const item of list(part?.annotations)) {
          const citation = record(item);
          if (
            citation?.type === "url_citation" &&
            typeof citation.url === "string"
          )
            citations.push({ url: citation.url, kind: "page" });
        }
      }
    } else if (step?.type !== "thought") unknownSteps++;
  }
  const matchedResults = [...successful].filter((callId) =>
    calls.has(callId),
  ).length;
  const usage = list(envelope.usage?.grounding_tool_count)
    .map(record)
    .filter((item) => item?.type === "google_search");
  const reported = usage.flatMap((item) => {
    const value = count(item?.count);
    return value === undefined ? [] : [value];
  });
  const reportedSearches = reported.length
    ? Math.min(
        1_000_000_000,
        reported.reduce((sum, value) => sum + value, 0),
      )
    : undefined;
  const parsedStatus = executionTraceSchema.shape.search
    .unwrap()
    .shape.status.safeParse(envelope.status);
  const status: SearchTrace["status"] = parsedStatus.success
    ? parsedStatus.data
    : "unknown";
  const evidence: SearchTrace["evidence"] = matchedResults
    ? "call_result"
    : reportedSearches
      ? "reported_usage"
      : "none";
  const state: SearchTrace["state"] = matchedResults
    ? "completed"
    : failedResults
      ? "tool_failed"
      : reportedSearches
        ? "metadata_missing"
        : callCount || resultCount
          ? "incomplete"
          : texts.length && status === "completed" && !unknownSteps
            ? "skipped"
            : "metadata_missing";
  const json = z
    .object({ candidates: z.array(z.unknown()) })
    .safeParse(decodeSearchJson(texts.join("")));
  const jsonCandidates = json.success
    ? json.data.candidates.slice(0, WEB_PICTURE_POLICY.candidates)
    : [];
  const parsedCandidates = (values: unknown[]) =>
    values.flatMap((value) => {
      const parsed = webPictureCandidatesSchema.shape.candidates.element
        .strip()
        .safeParse(value);
      return parsed.success ? [parsed.data] : [];
    });
  const fromJson = parsedCandidates(jsonCandidates),
    fromCitations = parsedCandidates(citations);
  const candidates = [
    ...new Map(
      [...fromJson, ...fromCitations].map((candidate) => [
        candidate.url,
        candidate,
      ]),
    ).values(),
  ].slice(0, WEB_PICTURE_POLICY.candidates);
  const diagnostic: SearchTrace = {
    api: "gemini-interactions",
    state,
    evidence,
    status,
    responseShape: envelope.steps
      ? "interactions"
      : Array.isArray(raw?.candidates)
        ? "legacy"
        : "unknown",
    stepsPresent: envelope.steps !== undefined,
    usagePresent: envelope.usage !== undefined,
    calls: callCount,
    results: resultCount,
    matchedResults,
    failedResults,
    queries,
    queriesPresent,
    ...(reportedSearches === undefined ? {} : { reportedSearches }),
    citations: citations.length,
    outputParts: texts.length,
    unknownSteps,
    candidateSource: fromJson.length
      ? "json"
      : fromCitations.length
        ? "citations"
        : "none",
  };
  return {
    diagnostic,
    candidates,
    verified: state !== "tool_failed" && evidence !== "none",
  };
}
