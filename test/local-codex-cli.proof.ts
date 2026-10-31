import { expect, it, vi } from "vitest";
import { createServer } from "node:http";
import {
  mkdtemp,
  mkdir,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "../apps/backend/node_modules/sharp/dist/index.mjs";
import { z } from "../apps/backend/node_modules/zod/index.js";
import { localCodexFocusSchema } from "../packages/contracts/local/codex.ts";
import type { ExecutionTrace } from "../packages/contracts/local/execution-diagnostics.ts";
import { codexImageDiscovery } from "../apps/backend/local/codex-composition.ts";
import {
  WebPictureSource,
  WEB_PICTURE_INSTRUCTIONS,
} from "../apps/backend/src/assembly/web-pictures.ts";
import {
  createLocalCodexInference,
  findLocalCodex,
  runCodexProcess,
  type CodexProcess,
} from "../apps/backend/local/codex-exec.ts";

function closedObjects(value: unknown): boolean {
  if (Array.isArray(value)) return value.every(closedObjects);
  if (value !== null && typeof value === "object") {
    if (
      "type" in value &&
      value.type === "object" &&
      !("additionalProperties" in value && value.additionalProperties === false)
    )
      return false;
    return Object.values(value).every(closedObjects);
  }
  return true;
}

it.each([
  { simulateOld: true, search: false, missingStrict: null },
  { simulateOld: false, search: false, missingStrict: null },
  { simulateOld: false, search: true, missingStrict: "root" },
  { simulateOld: false, search: true, missingStrict: "candidate" },
  { simulateOld: false, search: true, missingStrict: null },
])(
  "installed CLI schema/search regression (%j)",
  async ({ simulateOld, search, missingStrict }) => {
    const rejected = simulateOld || missingStrict !== null;
    const executable = await findLocalCodex();
    if (!executable) throw new Error("local_cli_proof_prerequisite_missing");
    const root = await mkdtemp(join(tmpdir(), "clipbuilder-cli-proof-")),
      profile = join(root, "profile");
    await mkdir(profile);
    let requests = 0,
      rejections = 0;
    const seen: string[] = [];
    const server = createServer(async (request, response) => {
      seen.push(`${request.method} ${request.url}`);
      const chunks: Buffer[] = [];
      for await (const chunk of request) chunks.push(Buffer.from(chunk));
      const input = JSON.parse(Buffer.concat(chunks).toString());
      expect(request.url).toBe("/responses");
      expect(request.headers.authorization).toBeUndefined();
      // Simulate the real provider's schema rejection, not just a mock result.
      const schema = JSON.stringify(input.text?.format?.schema);
      const unicode = /\\\\[pP]\{/u.test(schema ?? "");
      if (!schema || unicode || !closedObjects(input.text.format.schema)) {
        rejections++;
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(
          JSON.stringify({
            error: {
              type: "invalid_request_error",
              code: "invalid_json_schema",
              message: unicode
                ? "Synthetic unsupported Unicode regex"
                : "Synthetic schema rejection: additionalProperties must be false on every object",
            },
          }),
        );
        return;
      }
      const parts = input.input.flatMap(
        (item: { content?: { type: string }[] }) => item.content ?? [],
      );
      expect(
        parts.filter((part: { type: string }) => part.type === "input_image"),
      ).toHaveLength(search ? 0 : 2);
      if (search) {
        const text = parts
          .filter((part: { type: string }) => part.type === "input_text")
          .map((part: { text?: string }) => part.text ?? "")
          .join("\n");
        expect(text).toContain(WEB_PICTURE_INSTRUCTIONS);
        expect(text).toContain("Use functions.exec to call tools.web__run now");
        expect(text).toContain("Do not answer from memory");
        expect(text).toContain("synthetic reef");
        expect(input.text.format.schema.required).toEqual(["candidates"]);
        expect(
          input.text.format.schema.properties.candidates.items.required,
        ).toEqual(["url", "kind"]);
        expect(input.text.format.schema.properties.candidates.maxItems).toBe(
          12,
        );
        expect(
          input.text.format.schema.properties.candidates.items.properties.url
            .maxLength,
        ).toBe(4096);
      }
      // The loopback test deliberately disables OpenAI authentication, so its
      // advertised tool catalog cannot prove owner ChatGPT search availability.
      requests++;
      const web = {
        id: "ws_synthetic",
        type: "web_search_call",
        status: "completed",
        action: { type: "search", query: "synthetic" },
      };
      const text = search
          ? '{"candidates":[{"url":"https://images.example.test/synthetic.png","kind":"image"}]}'
          : '{"people":[],"decisions":[],"hookSuggestion":null,"pictures":[],"texts":[]}',
        item = {
          id: "msg_synthetic",
          type: "message",
          role: "assistant",
          status: "completed",
          content: [{ type: "output_text", text, annotations: [] }],
        };
      response.writeHead(200, { "Content-Type": "text/event-stream" });
      for (const event of [
        {
          type: "response.created",
          response: {
            id: "resp_synthetic",
            object: "response",
            status: "in_progress",
            output: [],
          },
        },
        {
          type: "response.output_item.added",
          output_index: 0,
          item: { ...item, status: "in_progress", content: [] },
        },
        {
          type: "response.content_part.added",
          item_id: item.id,
          output_index: 0,
          content_index: 0,
          part: { type: "output_text", text: "", annotations: [] },
        },
        {
          type: "response.output_text.delta",
          item_id: item.id,
          output_index: 0,
          content_index: 0,
          delta: text,
        },
        {
          type: "response.output_text.done",
          item_id: item.id,
          output_index: 0,
          content_index: 0,
          text,
        },
        { type: "response.output_item.done", output_index: 0, item },
        {
          type: "response.completed",
          response: {
            id: "resp_synthetic",
            object: "response",
            status: "completed",
            output: search ? [web, item] : [item],
            usage: { input_tokens: 1, output_tokens: 1, total_tokens: 2 },
          },
        },
      ]) {
        response.write(`data: ${JSON.stringify(event)}\n\n`);
        if (search && event.type === "response.created") {
          response.write(
            `data: ${JSON.stringify({ type: "response.output_item.added", output_index: 1, item: { ...web, status: "in_progress" } })}\n\n`,
          );
          for (const type of [
            "response.web_search_call.in_progress",
            "response.web_search_call.searching",
            "response.web_search_call.completed",
          ])
            response.write(
              `data: ${JSON.stringify({ type, output_index: 1, item_id: web.id })}\n\n`,
            );
          response.write(
            `data: ${JSON.stringify({ type: "response.output_item.done", output_index: 1, item: web })}\n\n`,
          );
        }
      }
      response.end();
    });
    await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("synthetic_listener_missing");
    const process = vi.fn<CodexProcess>(async (call, signal) => {
      if (call.statusOnly) return "Logged in using ChatGPT";
      const args = [...call.args];
      args.splice(
        1,
        0,
        "-c",
        `model_providers.clipbuilder_subscription.base_url="http://127.0.0.1:${address.port}"`,
      );
      const index = args.indexOf(
        "model_providers.clipbuilder_subscription.requires_openai_auth=true",
      );
      if (index < 0) throw new Error("synthetic_auth_override_missing");
      args[index] =
        "model_providers.clipbuilder_subscription.requires_openai_auth=false";
      if (simulateOld)
        await writeFile(
          call.args[call.args.indexOf("--output-schema") + 1]!,
          JSON.stringify(
            z.toJSONSchema(localCodexFocusSchema, {
              io: "input",
              unrepresentable: "any",
            }),
          ),
        );
      if (missingStrict) {
        const path = call.args[call.args.indexOf("--output-schema") + 1]!;
        const schema = JSON.parse(await readFile(path, "utf8"));
        if (missingStrict === "root") delete schema.additionalProperties;
        else delete schema.properties.candidates.items.additionalProperties;
        await writeFile(path, JSON.stringify(schema));
      }
      return runCodexProcess(
        {
          ...call,
          args,
          env: {
            ...call.env,
            CODEX_HOME: profile,
            USERPROFILE: profile,
            HOME: profile,
          },
        },
        signal,
      );
    });
    try {
      const image = await sharp({
        create: { width: 16, height: 16, channels: 3, background: "white" },
      })
        .jpeg()
        .toBuffer();
      const traces: ExecutionTrace[] = [];
      const infer = createLocalCodexInference({
        root,
        executable,
        process,
        observe: (detail) => traces.push(detail),
      });
      const readPicture = vi.fn(async (url: URL) => {
        expect(url.href).toBe("https://images.example.test/synthetic.png");
        return { bytes: image, contentType: "image/jpeg", url };
      });
      const discovery = new WebPictureSource(
        codexImageDiscovery(infer),
        undefined,
        readPicture,
      );
      const result = search
        ? discovery.find(
            {
              kind: "object",
              brief: {
                scene: "Synthetic reef",
                searchQuery: "synthetic reef",
                requiredTerms: ["reef"],
                avoidTerms: [],
              },
            },
            AbortSignal.timeout(30000),
          )
        : infer(
            {
              prompt: "Return the synthetic value only.",
              images: [image.toString("base64"), image.toString("base64")],
              schema: z.toJSONSchema(localCodexFocusSchema, {
                io: "input",
                unrepresentable: "any",
              }),
            },
            AbortSignal.timeout(30000),
          );
      if (rejected)
        await expect(result).rejects.toThrow(
          search ? "image_search_failed" : "codex_process_failed",
        );
      else if (search)
        await expect(result).resolves.toMatchObject({
          repository: "web",
          width: 16,
          height: 16,
        });
      else
        await expect(result).resolves.toEqual({
          people: [],
          decisions: [],
          hookSuggestion: null,
          pictures: [],
          texts: [],
        });
      expect(process).toHaveBeenCalledTimes(2);
      expect(requests).toBe(rejected ? 0 : 1);
      expect(rejections).toBe(rejected ? 1 : 0);
      expect(readPicture).toHaveBeenCalledTimes(search && !rejected ? 1 : 0);
      if (rejected)
        expect(traces).toContainEqual(
          expect.objectContaining({
            phase: "process",
            outcome: "failed",
            exitCode: expect.any(Number),
            error: expect.objectContaining({
              category: "schema_rejected",
              providerCode: "invalid_json_schema",
              ...(missingStrict
                ? { schemaKeyword: "additionalProperties" }
                : {}),
            }),
          }),
        );
      else
        expect(traces).toContainEqual(
          expect.objectContaining({
            phase: "events",
            outcome: "succeeded",
            events: expect.objectContaining({
              completed: true,
              searchesCompleted: search ? 1 : 0,
            }),
          }),
        );
      expect(await readdir(root)).toEqual(["profile"]);
    } finally {
      await new Promise<void>((done, fail) =>
        server.close((error) => (error ? fail(error) : done())),
      );
      await rm(root, { recursive: true, force: true });
      if (search)
        expect(
          { requests, rejections, seen },
          "fake CLI search requests",
        ).toEqual({
          requests: rejected ? 0 : 1,
          rejections: rejected ? 1 : 0,
          seen: ["POST /responses"],
        });
    }
  },
  45000,
);
