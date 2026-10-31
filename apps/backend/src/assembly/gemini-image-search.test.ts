import { expect, it, vi } from "vitest";
import sharp from "sharp";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import {
  geminiImageDiscovery,
  geminiSearchRequest,
} from "./gemini-image-search.js";
import { WebPictureSource } from "./web-pictures.js";
import {
  executionTraceSchema,
  type ExecutionTrace,
} from "../../../../packages/contracts/local/execution-diagnostics.ts";
import type { ContextualPictureRequest } from "@clipbuilder/contracts";

const request: ContextualPictureRequest = {
  kind: "object",
  brief: {
    scene: "A butterfly resting on a flower",
    searchQuery: "butterfly flower",
    requiredTerms: ["butterfly"],
    avoidTerms: [],
  },
};
const call = {
  type: "google_search_call",
  id: "synthetic-private-call-id",
  arguments: { queries: ["synthetic-private-query"] },
};
const result = { type: "google_search_result", call_id: call.id, result: [] };
const image = {
  url: "https://example.test/synthetic-private-image.png",
  kind: "image",
};
const model = (
  text = JSON.stringify({ candidates: [image] }),
  annotations: unknown[] = [],
) => ({ type: "model_output", content: [{ type: "text", text, annotations }] });
const completed = (steps: unknown[] = [call, result, model()]) => ({
  status: "completed",
  steps,
});
const signal = () => AbortSignal.timeout(1000);

/** Validate the real request before returning any synthetic execution evidence. */
const wire = z
  .object({
    model: z.literal("gemini-3.8-flash"),
    store: z.literal(false),
    background: z.literal(false),
    stream: z.literal(false),
    system_instruction: z.string().min(1),
    input: z.string().min(1),
    tools: z.tuple([z.object({ type: z.literal("google_search") }).strict()]),
    generation_config: z
      .object({ max_output_tokens: z.literal(4096) })
      .strict(),
  })
  .strict();
function fixture(payload: unknown) {
  const traces: ExecutionTrace[] = [];
  const read = vi.fn<typeof fetch>(async (url, init) => {
    expect(url).toBe(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
    );
    expect(init).toMatchObject({
      method: "POST",
      redirect: "error",
      credentials: "omit",
    });
    wire.parse(JSON.parse(String(init?.body)));
    return Response.json(payload);
  });
  return {
    read,
    traces,
    discover: geminiImageDiscovery(
      "synthetic-private-key",
      "gemini-3.8-flash",
      read,
      (trace) => traces.push(executionTraceSchema.parse(trace)),
    ),
  };
}
it("uses the actual stateless Search protocol, not the old generateContent tool request", async () => {
  const f = fixture(completed());
  expect(await f.discover(request, signal())).toEqual({ candidates: [image] });
  expect(f.read).toHaveBeenCalledTimes(1);
  expect(
    wire.safeParse({
      tools: [{ google_search: {} }],
      generationConfig: { maxOutputTokens: 4096 },
    }).success,
  ).toBe(false);
  expect(f.traces).toContainEqual(
    expect.objectContaining({
      search: {
        api: "gemini-interactions",
        state: "completed",
        evidence: "call_result",
        status: "completed",
        responseShape: "interactions",
        stepsPresent: true,
        usagePresent: false,
        calls: 1,
        results: 1,
        matchedResults: 1,
        failedResults: 0,
        queries: 1,
        queriesPresent: true,
        citations: 0,
        outputParts: 1,
        unknownSteps: 0,
        candidateSource: "json",
      },
    }),
  );
  expect(JSON.stringify(f.traces)).not.toMatch(
    /synthetic-private|example\.test|butterfly/u,
  );
  expect(geminiSearchRequest("gemini-3.8-flash", request)).not.toHaveProperty(
    "generation_config.tool_choice",
  );
});
it("keeps real call/result evidence when optional query metadata is absent", async () => {
  const f = fixture(completed([{ ...call, arguments: {} }, result, model()]));
  expect(await f.discover(request, signal())).toEqual({ candidates: [image] });
  expect(f.traces.find((trace) => trace.search)?.search).toMatchObject({
    state: "completed",
    evidence: "call_result",
    queriesPresent: false,
    queries: 0,
  });
});
it("matches the installed Google SDK serialization for the actual Search request", async () => {
  const serialized: unknown[] = [];
  const read = vi.fn<typeof fetch>(async (input, init) => {
    const outgoing = new Request(input, init);
    expect(outgoing.url).toBe(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
    );
    expect(outgoing.headers.get("x-goog-api-key")).toBe("synthetic-key");
    serialized.push(wire.parse(await outgoing.json()));
    return Response.json({
      id: "synthetic-interaction",
      ...completed(),
      model: "gemini-3.8-flash",
    });
  });
  const sdk = new GoogleGenAI({
    apiKey: "synthetic-key",
    httpOptions: { apiVersion: "v1beta", fetch: read },
  });
  await sdk.interactions.create(
    geminiSearchRequest("gemini-3.8-flash", request),
  );
  expect(read).toHaveBeenCalledTimes(1);
  expect(serialized).toEqual([
    geminiSearchRequest("gemini-3.8-flash", request),
  ]);
});
it("records reported execution with missing step metadata without dropping usable returned URLs", async () => {
  const f = fixture({
    ...completed([model()]),
    usage: { grounding_tool_count: [{ type: "google_search", count: 2 }] },
  });
  expect(await f.discover(request, signal())).toEqual({ candidates: [image] });
  expect(f.traces.find((trace) => trace.search)?.search).toMatchObject({
    state: "metadata_missing",
    evidence: "reported_usage",
    calls: 0,
    results: 0,
    reportedSearches: 2,
  });
});
it.each([
  [
    completed([model()]),
    "skipped",
    "image_search_not_attempted",
    "search_missing",
  ],
  [
    { status: "completed" },
    "metadata_missing",
    "image_search_metadata_missing",
    "search_metadata_missing",
  ],
  [
    completed([]),
    "metadata_missing",
    "image_search_metadata_missing",
    "search_metadata_missing",
  ],
  [
    {
      candidates: [{ groundingMetadata: { webSearchQueries: ["synthetic"] } }],
    },
    "metadata_missing",
    "image_search_metadata_missing",
    "search_metadata_missing",
  ],
  [
    completed([{ type: "unknown_search_protocol" }, model()]),
    "metadata_missing",
    "image_search_metadata_missing",
    "search_metadata_missing",
  ],
  [
    completed([call, model()]),
    "incomplete",
    "image_search_incomplete",
    "search_incomplete",
  ],
  [
    completed([result, model()]),
    "incomplete",
    "image_search_incomplete",
    "search_incomplete",
  ],
  [
    completed([call, { ...result, call_id: "other-call" }, model()]),
    "incomplete",
    "image_search_incomplete",
    "search_incomplete",
  ],
  [
    completed([call, { ...result, is_error: true }, model()]),
    "tool_failed",
    "image_search_tool_failed",
    "search_tool_failed",
  ],
] as const)(
  "distinguishes %s as %s with zero candidate downloads",
  async (payload, state, error, category) => {
    const f = fixture(payload),
      read = vi.fn();
    const facts: unknown[] = [];
    const source = new WebPictureSource(
      f.discover,
      (value) => facts.push(value),
      read,
    );
    await expect(source.find(request, signal())).rejects.toMatchObject({
      message: "image_search_failed",
      diagnostic: { category },
    });
    expect(f.traces.find((trace) => trace.search)?.search.state).toBe(state);
    expect(f.traces).toContainEqual(
      expect.objectContaining({ error: expect.objectContaining({ category }) }),
    );
    expect(f.read).toHaveBeenCalledTimes(1);
    expect(read).not.toHaveBeenCalled();
    expect(facts).toContainEqual(
      expect.objectContaining({
        outcome: "failed",
        candidates: 0,
        downloads: 0,
      }),
    );
    await expect(f.discover(request, signal())).rejects.toThrow(error);
    expect(f.read).toHaveBeenCalledTimes(2);
  },
);
it("uses grounded citations when JSON is malformed and merges them after usable JSON", async () => {
  const citations = [
    { type: "url_citation", url: "https://example.test/grounded-page" },
  ];
  const f = fixture(completed([call, result, model("not JSON", citations)]));
  expect(await f.discover(request, signal())).toEqual({
    candidates: [{ url: citations[0]!.url, kind: "page" }],
  });
  expect(f.traces.find((trace) => trace.search)?.search).toMatchObject({
    candidateSource: "citations",
    citations: 1,
  });
  const both = fixture(
    completed([
      call,
      result,
      model(JSON.stringify({ candidates: [{}, image, image] }), citations),
    ]),
  );
  expect(await both.discover(request, signal())).toEqual({
    candidates: [image, { url: citations[0]!.url, kind: "page" }],
  });
});
it("treats a verified empty search as no candidates rather than a missing search", async () => {
  const f = fixture(completed([call, result, model('{"candidates":[]}')]));
  expect(await f.discover(request, signal())).toEqual({ candidates: [] });
  expect(f.traces.find((trace) => trace.search)?.search.state).toBe(
    "completed",
  );
});
it("retrieves and decodes a small synthetic raster only after actual completed search evidence", async () => {
  const f = fixture(completed());
  const bytes = await sharp({
    create: { width: 24, height: 12, channels: 3, background: "#12ab78" },
  })
    .png()
    .toBuffer();
  const read = vi.fn(async (url: URL) => ({
    bytes,
    contentType: "image/png",
    url,
  }));
  const source = new WebPictureSource(f.discover, () => {}, read);
  expect(await source.find(request, signal())).toMatchObject({
    repository: "web",
    width: 24,
    height: 12,
  });
  expect(f.read).toHaveBeenCalledTimes(1);
  expect(read).toHaveBeenCalledTimes(1);
  expect(f.read.mock.invocationCallOrder[0]).toBeLessThan(
    read.mock.invocationCallOrder[0]!,
  );
});
it.each([
  [new Response("synthetic-private-error", { status: 403 }), "http"],
  [new Response("not JSON"), "output_json"],
  [Response.json({ steps: "malformed" }), "output_shape"],
  [new Response("x".repeat(512 * 1024 + 1)), "download_limit"],
])(
  "retains originating HTTP/decoder/size evidence (%s)",
  async (response, category) => {
    const traces: ExecutionTrace[] = [];
    const read = vi.fn<typeof fetch>(async () => response);
    await expect(
      geminiImageDiscovery("synthetic-key", "gemini-3.8-flash", read, (trace) =>
        traces.push(trace),
      )(request, signal()),
    ).rejects.toThrow();
    expect(read).toHaveBeenCalledTimes(1);
    expect(traces).toContainEqual(
      expect.objectContaining({
        outcome: "failed",
        error: expect.objectContaining({ category }),
      }),
    );
    expect(JSON.stringify(traces)).not.toContain("synthetic-private-error");
  },
);
it("cancels before dispatch and survives a broken diagnostic sink", async () => {
  const f = fixture(completed());
  await expect(f.discover(request, AbortSignal.abort())).rejects.toThrow();
  expect(f.read).not.toHaveBeenCalled();
  expect(
    await geminiImageDiscovery(
      "synthetic-key",
      "gemini-3.8-flash",
      f.read,
      () => {
        throw Error("synthetic-private");
      },
    )(request, signal()),
  ).toEqual({ candidates: [image] });
});
