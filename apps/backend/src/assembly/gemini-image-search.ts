import { randomUUID } from "node:crypto";
import type { GoogleGenAI } from "@google/genai";
import { boundedPictureBody } from "./picture-raster.js";
import { PictureHttpFailure } from "./public-picture-request.js";
import {
  classifyExecutionFailure,
  ExecutionError,
} from "../diagnostics/execution-failure.js";
import type { ExecutionTrace } from "../../../../packages/contracts/local/execution-diagnostics.ts";
import {
  WEB_PICTURE_INSTRUCTIONS,
  searchBrief,
  type PictureDiscovery,
} from "./web-pictures.js";
import { decodeGeminiSearch } from "./gemini-search-response.js";

const SEARCH_POLICY = {
  maxOutputTokens: 4096,
  responseLimitBytes: 512 * 1024,
} as const;

export function geminiSearchRequest(
  model: string,
  request: Parameters<PictureDiscovery>[0],
) {
  return {
    model,
    store: false,
    background: false,
    stream: false,
    system_instruction: WEB_PICTURE_INSTRUCTIONS,
    input: `Use Google Search to retrieve existing images for this generic brief. Complete the search before returning candidate JSON.\n${searchBrief(request)}`,
    tools: [{ type: "google_search" }],
    generation_config: { max_output_tokens: SEARCH_POLICY.maxOutputTokens },
  } satisfies Parameters<GoogleGenAI["interactions"]["create"]>[0];
}

/** Observable built-in Search; no media, history, automatic retry or extra model. */
export function geminiImageDiscovery(
  apiKey: string,
  model: string,
  read: typeof fetch = fetch,
  observe: (detail: ExecutionTrace) => void = () => {},
): PictureDiscovery {
  return async (request, signal) => {
    const callId = randomUUID(),
      started = performance.now();
    let phase: ExecutionTrace["phase"] = "input";
    let response: Response | undefined;
    const trace = (
      detail: Partial<ExecutionTrace> & Pick<ExecutionTrace, "outcome">,
    ) => {
      try {
        observe({
          boundary: "search",
          phase,
          callId,
          elapsedMs: Math.round(performance.now() - started),
          ...detail,
        });
      } catch {
        /* Nonfatal diagnostic sink. */
      }
    };
    trace({
      outcome: "started",
      searchEnabled: true,
      searchRequest: {
        api: "gemini-interactions",
        tool: "google_search",
        toolChoice: "auto",
        store: false,
        background: false,
        stream: false,
        modelPolicy: "configured",
        maxOutputTokens: SEARCH_POLICY.maxOutputTokens,
        responseLimitBytes: SEARCH_POLICY.responseLimitBytes,
      },
    });
    try {
      signal.throwIfAborted();
      phase = "http";
      response = await read(
        "https://generativelanguage.googleapis.com/v1beta/interactions",
        {
          method: "POST",
          signal,
          redirect: "error",
          credentials: "omit",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify(geminiSearchRequest(model, request)),
        },
      );
      phase = "body";
      let text: string;
      try {
        text = (
          await boundedPictureBody(response, SEARCH_POLICY.responseLimitBytes)
        ).toString("utf8");
      } catch (error) {
        if (!response.ok)
          throw new PictureHttpFailure(
            response.status,
            classifyExecutionFailure(error),
          );
        throw new ExecutionError("image_search_failed", {
          ...classifyExecutionFailure(error),
          httpStatus: response.status,
        });
      }
      if (!response.ok)
        throw new PictureHttpFailure(
          response.status,
          classifyExecutionFailure(text, "http"),
        );
      signal.throwIfAborted();
      phase = "events";
      let decoded: unknown;
      try {
        decoded = JSON.parse(text);
      } catch (error) {
        throw new ExecutionError(
          "image_search_failed",
          classifyExecutionFailure(error, "output_json"),
        );
      }
      let search: ReturnType<typeof decodeGeminiSearch>;
      try {
        search = decodeGeminiSearch(decoded);
      } catch (error) {
        throw new ExecutionError(
          "image_search_failed",
          classifyExecutionFailure(error, "output_shape"),
        );
      }
      trace({
        outcome: search.verified ? "succeeded" : "warning",
        httpStatus: response.status,
        search: search.diagnostic,
        events: {
          total: search.diagnostic.calls + search.diagnostic.results,
          searchesStarted: search.diagnostic.calls,
          searchesCompleted: search.diagnostic.matchedResults,
          warnings: search.diagnostic.state === "completed" ? 0 : 1,
          completed: search.verified,
        },
      });
      if (!search.verified) {
        const failure = {
          skipped: "image_search_not_attempted",
          incomplete: "image_search_incomplete",
          tool_failed: "image_search_tool_failed",
          metadata_missing: "image_search_metadata_missing",
          completed: "image_search_metadata_missing",
        }[search.diagnostic.state];
        throw new Error(failure);
      }
      return { candidates: search.candidates };
    } catch (error) {
      trace({
        outcome: signal.aborted ? "canceled" : "failed",
        error: classifyExecutionFailure(error),
        ...(response ? { httpStatus: response.status } : {}),
      });
      throw error;
    } finally {
      if (response?.body && !response.body.locked)
        await response.body.cancel().catch(() => undefined);
    }
  };
}
