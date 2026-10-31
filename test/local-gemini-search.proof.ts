import { createServer } from "node:http";
import { expect, it, vi } from "vitest";
import sharp from "../apps/backend/node_modules/sharp/dist/index.mjs";
import { z } from "../apps/backend/node_modules/zod/index.js";
import { listenOwner, ownerRequest } from "./owner-http.js";
import { geminiImageDiscovery } from "../apps/backend/src/assembly/gemini-image-search.ts";
import { WebPictureSource } from "../apps/backend/src/assembly/web-pictures.ts";
import type { ContextualPictureRequest } from "../packages/contracts/src/index.ts";
import {
  executionTraceSchema,
  type ExecutionTrace,
} from "../packages/contracts/local/execution-diagnostics.ts";

// This endpoint executes a synthetic search only AFTER validating production wire.
// It proves protocol/retrieval plumbing, not authenticated Google execution.
const wire = z
  .object({
    model: z.literal("gemini-3.8-flash"),
    store: z.literal(false),
    background: z.literal(false),
    stream: z.literal(false),
    tools: z.tuple([z.object({ type: z.literal("google_search") }).strict()]),
    input: z.string().min(1),
    system_instruction: z.string().min(1),
    generation_config: z
      .object({ max_output_tokens: z.literal(4096) })
      .strict(),
  })
  .strict();
const brief = (subject: string): ContextualPictureRequest => ({
  kind: "object",
  brief: {
    scene: `A ${subject}`,
    searchQuery: subject,
    requiredTerms: [subject],
    avoidTerms: [],
  },
});

it.each(["butterfly", "telescope"])(
  "production Search request retrieves a synthetic %s image over the protocol boundary",
  async (subject) => {
    let providerRequests = 0,
      searchExecutions = 0,
      imageRequests = 0,
      rejections = 0;
    const bytes = await sharp({
      create: { width: 24, height: 12, channels: 3, background: "#148acf" },
    })
      .png()
      .toBuffer();
    const server = createServer(async (req, res) => {
      if (req.url === "/synthetic.png") {
        imageRequests++;
        res.setHeader("content-type", "image/png");
        res.end(bytes);
        return;
      }
      providerRequests++;
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(Buffer.from(chunk));
      const input = wire.safeParse(
        JSON.parse(Buffer.concat(chunks).toString("utf8")),
      );
      if (
        req.method !== "POST" ||
        req.url !== "/v1beta/interactions" ||
        req.headers["x-goog-api-key"] !== "synthetic-key" ||
        !input.success
      ) {
        rejections++;
        res.writeHead(400).end("{}");
        return;
      }
      searchExecutions++;
      const steps = [
        {
          type: "google_search_call",
          id: "synthetic-call",
          arguments: { queries: [subject] },
        },
        { type: "google_search_result", call_id: "synthetic-call", result: [] },
        {
          type: "model_output",
          content: [
            {
              type: "text",
              text: JSON.stringify({
                candidates: [
                  { url: "https://example.test/synthetic.png", kind: "image" },
                ],
              }),
            },
          ],
        },
      ];
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ status: "completed", steps }));
    });
    const port = await listenOwner(server);
    const traces: ExecutionTrace[] = [];
    try {
      // The old protocol is rejected before the fake tool can run.
      expect(
        (
          await ownerRequest(
            port,
            "/v1beta/models/gemini-3.8-flash:generateContent",
            {
              method: "POST",
              headers: { "x-goog-api-key": "synthetic-key" },
              body: JSON.stringify({
                tools: [{ google_search: {} }],
                contents: [],
              }),
            },
          )
        ).status,
      ).toBe(400);
      expect(searchExecutions).toBe(0);
      const read: typeof fetch = async (url, init) => {
        expect(String(url)).toBe(
          "https://generativelanguage.googleapis.com/v1beta/interactions",
        );
        const response = await ownerRequest(port, "/v1beta/interactions", {
          method: "POST",
          headers: Object.fromEntries(new Headers(init?.headers)),
          body: String(init?.body),
          ...(init?.signal ? { signal: init.signal } : {}),
        });
        return new Response(response.body, {
          status: response.status,
          headers: { "content-type": "application/json" },
        });
      };
      const discover = geminiImageDiscovery(
        "synthetic-key",
        "gemini-3.8-flash",
        read,
        (trace) => traces.push(executionTraceSchema.parse(trace)),
      );
      const publicRead = vi.fn(async (url: URL) => {
        expect(url.href).toBe("https://example.test/synthetic.png");
        const response = await ownerRequest(port, "/synthetic.png");
        return { bytes: response.body, contentType: "image/png", url };
      });
      const source = new WebPictureSource(discover, () => {}, publicRead);
      expect(
        await source.find(brief(subject), AbortSignal.timeout(5000)),
      ).toMatchObject({ repository: "web", width: 24, height: 12 });
      expect({
        providerRequests,
        searchExecutions,
        imageRequests,
        rejections,
      }).toEqual({
        providerRequests: 2,
        searchExecutions: 1,
        imageRequests: 1,
        rejections: 1,
      });
      expect(publicRead).toHaveBeenCalledTimes(1);
      expect(traces).toContainEqual(
        expect.objectContaining({
          search: expect.objectContaining({
            state: "completed",
            evidence: "call_result",
            calls: 1,
            matchedResults: 1,
          }),
        }),
      );
      expect(JSON.stringify(traces)).not.toMatch(
        /example\.test|synthetic-key|synthetic-call|butterfly|telescope/u,
      );
    } finally {
      server.closeAllConnections();
      await new Promise<void>((done, fail) =>
        server.close((error) => (error ? fail(error) : done())),
      );
    }
  },
);

it.each([
  ["skipped", "search_missing"],
  ["metadata_missing", "search_metadata_missing"],
  ["incomplete", "search_incomplete"],
  ["tool_failed", "search_tool_failed"],
] as const)(
  "keeps %s distinct across the HTTP boundary",
  async (mode, category) => {
    let requests = 0;
    const server = createServer(async (req, res) => {
      requests++;
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(Buffer.from(chunk));
      wire.parse(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      const output = {
        type: "model_output",
        content: [{ type: "text", text: '{"candidates":[]}' }],
      };
      const call = {
        type: "google_search_call",
        id: "synthetic-call",
        arguments: {},
      };
      const result = {
        type: "google_search_result",
        call_id: call.id,
        is_error: true,
        result: [],
      };
      const steps =
        mode === "incomplete"
          ? [call, output]
          : mode === "tool_failed"
            ? [call, result, output]
            : [output];
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify(
          mode === "metadata_missing"
            ? { status: "completed" }
            : { status: "completed", steps },
        ),
      );
    });
    const port = await listenOwner(server),
      images = vi.fn(),
      traces: ExecutionTrace[] = [];
    try {
      const read: typeof fetch = async (_url, init) => {
        const response = await ownerRequest(port, "/v1beta/interactions", {
          method: "POST",
          body: String(init?.body),
          ...(init?.signal ? { signal: init.signal } : {}),
        });
        return new Response(response.body, { status: response.status });
      };
      const source = new WebPictureSource(
        geminiImageDiscovery(
          "synthetic-key",
          "gemini-3.8-flash",
          read,
          (trace) => traces.push(trace),
        ),
        () => {},
        images,
      );
      await expect(
        source.find(brief("butterfly"), AbortSignal.timeout(5000)),
      ).rejects.toMatchObject({ diagnostic: { category } });
      expect(requests).toBe(1);
      expect(images).not.toHaveBeenCalled();
      expect(traces).toContainEqual(
        expect.objectContaining({
          search: expect.objectContaining({ state: mode }),
        }),
      );
    } finally {
      server.closeAllConnections();
      await new Promise<void>((done, fail) =>
        server.close((error) => (error ? fail(error) : done())),
      );
    }
  },
);

it("aborts an in-flight protocol request without retry or image download", async () => {
  let providerRequests = 0;
  let received!: () => void;
  const arrived = new Promise<void>((done) => {
    received = done;
  });
  const server = createServer(() => {
    providerRequests++;
    received();
  });
  const port = await listenOwner(server),
    controller = new AbortController();
  const traces: ExecutionTrace[] = [];
  const read: typeof fetch = async (_url, init) => {
    const response = await ownerRequest(port, "/v1beta/interactions", {
      method: "POST",
      body: String(init?.body),
      ...(init?.signal ? { signal: init.signal } : {}),
    });
    return new Response(response.body, { status: response.status });
  };
  const images = vi.fn();
  try {
    const source = new WebPictureSource(
      geminiImageDiscovery("synthetic-key", "gemini-3.8-flash", read, (trace) =>
        traces.push(trace),
      ),
      () => {},
      images,
    );
    const pending = expect(
      source.find(brief("butterfly"), controller.signal),
    ).rejects.toThrow();
    await arrived;
    controller.abort();
    await pending;
    expect(providerRequests).toBe(1);
    expect(images).not.toHaveBeenCalled();
    expect(traces).toContainEqual(
      expect.objectContaining({ outcome: "canceled" }),
    );
  } finally {
    server.closeAllConnections();
    await new Promise<void>((done, fail) =>
      server.close((error) => (error ? fail(error) : done())),
    );
  }
});
